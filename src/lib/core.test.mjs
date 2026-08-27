import { test } from "node:test"
import assert from "node:assert/strict"

import { ADDONS, DEBRIDS, montarUrl, montarTorrentio, base64url, addonsQueExigem, linkInstalar } from "./catalog.js"
import { mesclar, backupJson, entrar, lerColecao, ErroStremio } from "./stremio.js"
import { conferirFormato, validar, descritor } from "./validation.js"
import { injetarChaves, nomeDoArquivo, avisoDoDownload } from "./inject.js"
import { registrar, marcarAbertura, abriuConfigurador, jaUsadoPor } from "./wizard.js"

const acharAddon = (id) => ADDONS.find((a) => a.id === id)

/** Resposta de fetch falsa, para não depender de rede nos testes. */
const resposta = (corpo, { status = 200 } = {}) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => corpo,
})

/* ---------------------------------------------------------------- catálogo */

test("o pacote tem onze addons e nenhum id repetido", () => {
  assert.equal(ADDONS.length, 11)
  assert.equal(new Set(ADDONS.map((a) => a.id)).size, 11)
})

test("nenhuma URL do catálogo carrega credencial", () => {
  const texto = JSON.stringify(ADDONS)
  assert.ok(!/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i.test(texto))
  assert.ok(!/\b[0-9a-f]{25,}\b/i.test(texto))
})

test("a chave de debrid entra na URL do Torrentio já escapada", () => {
  const url = montarTorrentio({ torbox: "abc/def+ghi" })
  assert.ok(url.includes("torbox=abc%2Fdef%2Bghi"))
  assert.ok(url.endsWith("/manifest.json"))
})

test("o Torrentio aceita um serviço, o outro, ou os dois", () => {
  const so_tb = montarTorrentio({ torbox: "chave-do-torbox-aqui" })
  const so_rd = montarTorrentio({ realdebrid: "chave-do-realdebrid" })
  const ambos = montarTorrentio({ torbox: "chave-do-torbox-aqui", realdebrid: "chave-do-realdebrid" })

  assert.ok(so_tb.includes("torbox=") && !so_tb.includes("realdebrid="))
  assert.ok(so_rd.includes("realdebrid=") && !so_rd.includes("torbox="))
  assert.ok(ambos.includes("torbox=") && ambos.includes("realdebrid="))
})

test("sem nenhum debrid o Torrentio falha em vez de gerar URL inútil", () => {
  assert.throws(() => montarTorrentio({}), /pelo menos um serviço de debrid/)
  assert.throws(() => montarTorrentio({ torbox: "   " }), /pelo menos um serviço de debrid/)
})

test("os filtros do setup sobrevivem seja qual for o debrid", () => {
  for (const chaves of [{ torbox: "x".repeat(20) }, { realdebrid: "y".repeat(20) }]) {
    const url = montarTorrentio(chaves)
    assert.ok(url.includes("language=portuguese"), "idioma")
    assert.ok(url.includes("qualityfilter=scr,cam"), "descarta gravação de cinema")
    assert.ok(url.includes("micoleaodublado"), "trackers brasileiros")
  }
})

test("são dois serviços de debrid, com id único", () => {
  assert.equal(DEBRIDS.length, 2)
  assert.deepEqual(DEBRIDS.map((d) => d.id).sort(), ["realdebrid", "torbox"])
  for (const d of DEBRIDS) {
    assert.ok(d.planos.startsWith("https://"), d.id)
    assert.ok(d.chave.startsWith("https://"), d.id)
  }
})

test("o UUID entra na URL do AIOMetadata", () => {
  const url = montarUrl(acharAddon("aio-metadata:pijama"), "33333333-cccc-4ccc-8ccc-333333333333")
  assert.equal(url, "https://aiometadata.elfhosted.com/stremio/33333333-cccc-4ccc-8ccc-333333333333/manifest.json")
})

test("addon sem exigência devolve a URL fixa e ignora o valor", () => {
  assert.equal(montarUrl(acharAddon("com.linvo.cinemeta"), "lixo"), "https://v3-cinemeta.strem.io/manifest.json")
})

test("montar sem o valor exigido falha em vez de gerar URL quebrada", () => {
  assert.throws(() => montarUrl(acharAddon("aio-metadata:anime"), "  "), /precisa de um valor/)
})

test("a config do opensubtitles vira base64url sem padding", () => {
  const cru = base64url({ langs: ["portuguese-br"] })
  assert.ok(!cru.includes("="))
  assert.ok(!cru.includes("+") && !cru.includes("/"))
  assert.deepEqual(JSON.parse(Buffer.from(cru, "base64url").toString()), { langs: ["portuguese-br"] })
})

test("são cinco fatias de AIOMetadata, cada uma com o seu template", () => {
  const fatias = addonsQueExigem("uuid-aiometadata")
  assert.equal(fatias.length, 5)
  assert.equal(new Set(fatias.map((f) => f.template)).size, 5)
})

/* ------------------------------------------------------------------ merge */

const local = {
  manifest: { id: "org.stremio.local", name: "Local Files" },
  transportUrl: "http://127.0.0.1:11470/local-addon/manifest.json",
  flags: { official: true, protected: true },
}
const cinemetaAtual = {
  manifest: { id: "com.linvo.cinemeta", name: "Cinemeta", version: "3.0.12" },
  transportUrl: "https://v3-cinemeta.strem.io/manifest.json",
  flags: { official: true, protected: true },
}
const youtube = {
  manifest: { id: "com.linvo.stremiochannels", name: "YouTube" },
  transportUrl: "https://v3-channels.strem.io/manifest.json",
  flags: { official: true, protected: false },
}
const novo = (id) => ({ manifest: { id, name: id }, transportUrl: `https://x/${id}.json`, flags: {} })

test("o addon de arquivos locais sobrevive ao merge", () => {
  const saida = mesclar([local, youtube], [novo("a"), novo("b")])
  assert.ok(saida.some((a) => a.manifest.id === "org.stremio.local"))
})

test("addon não protegido que a pessoa tinha é substituído pelo pacote", () => {
  const saida = mesclar([local, youtube], [novo("a")])
  assert.ok(!saida.some((a) => a.manifest.id === "com.linvo.stremiochannels"))
})

test("o pacote mantém a ordem, e os protegidos entram no fim", () => {
  const saida = mesclar([local], [novo("a"), novo("b"), novo("c")])
  assert.deepEqual(saida.map((a) => a.manifest.id), ["a", "b", "c", "org.stremio.local"])
})

test("quando o id colide e o atual é protegido, o atual vence", () => {
  const nossoCinemeta = {
    manifest: { id: "com.linvo.cinemeta", name: "Cinemeta", version: "9.9.9" },
    transportUrl: "https://outro-endereco/manifest.json",
    flags: {},
  }
  const saida = mesclar([cinemetaAtual], [nossoCinemeta])
  assert.equal(saida.length, 1)
  assert.equal(saida[0].transportUrl, "https://v3-cinemeta.strem.io/manifest.json")
  assert.equal(saida[0].flags.protected, true)
})

test("id repetido dentro do pacote entra uma vez só quando a URL também repete", () => {
  const saida = mesclar([], [novo("a"), novo("a"), novo("b")])
  assert.deepEqual(saida.map((a) => a.manifest.id), ["a", "b"])
})

test("as cinco fatias do AIOMetadata sobrevivem, mesmo compartilhando manifest.id", () => {
  // O AIOMetadata devolve `id: "aio-metadata"` para toda configuração. Quem
  // separa uma da outra é a transportUrl. Deduplicar por id deixava só a
  // primeira, e a pessoa terminava com uma prateleira em vez de cinco.
  const fatias = ["em-alta", "generos", "pijama", "anime", "curadoria"].map((slug) => ({
    manifest: { id: "aio-metadata", name: slug },
    transportUrl: `https://aiometadata.elfhosted.com/stremio/uuid-${slug}/manifest.json`,
    flags: {},
  }))

  const saida = mesclar([local], fatias)
  assert.equal(saida.filter((a) => a.manifest.id === "aio-metadata").length, 5)
  assert.equal(new Set(saida.map((a) => a.transportUrl)).size, 6)
})

test("a mesma URL duas vezes continua entrando uma vez só", () => {
  const url = "https://aiometadata.elfhosted.com/stremio/mesmo-uuid/manifest.json"
  const dobrado = [
    { manifest: { id: "aio-metadata", name: "x" }, transportUrl: url, flags: {} },
    { manifest: { id: "aio-metadata", name: "y" }, transportUrl: url, flags: {} },
  ]
  assert.equal(mesclar([], dobrado).length, 1)
})

test("addon sem transportUrl é descartado em vez de virar entrada quebrada", () => {
  const saida = mesclar([], [{ manifest: { id: "a" }, flags: {} }, novo("b")])
  assert.deepEqual(saida.map((a) => a.manifest.id), ["b"])
})

test("coleção vazia dos dois lados não quebra", () => {
  assert.deepEqual(mesclar([], []), [])
})

test("o backup sai no formato que o stremio-addon-manager lê", () => {
  assert.deepEqual(JSON.parse(backupJson([local])), { addons: [local] })
})

/* ------------------------------------------------------------- validação */

test("UUID cortado explica o que está errado e mostra o tamanho", () => {
  const msg = conferirFormato(acharAddon("aio-metadata:generos"), "22222222-bbbb")
  assert.match(msg, /cortado/)
  assert.match(msg, /13/)
})

test("URL de página de configuração é recusada com instrução", () => {
  const msg = conferirFormato(acharAddon("com.aiostreams.viren070"), "https://aiostreams.elfhosted.com/stremio/configure")
  assert.match(msg, /manifest\.json/)
})

test("URL sem https é recusada", () => {
  assert.match(conferirFormato(acharAddon("com.aiostreams.viren070"), "http://x/manifest.json"), /https/)
})

test("UUID bem formado passa no formato", () => {
  assert.equal(conferirFormato(acharAddon("aio-metadata:anime"), "44444444-dddd-4ddd-8ddd-444444444444"), null)
})

test("validar confere a contagem de catálogos e diz quando bate", async () => {
  const addon = acharAddon("aio-metadata:curadoria")
  const buscar = async () => resposta({ id: "aio-metadata", name: "Curadoria", catalogs: Array(18).fill({}) })
  const r = await validar(addon, "55555555-eeee-4eee-8eee-555555555555", { buscar })

  assert.equal(r.ok, true)
  assert.match(r.mensagem, /18 catálogos/)
})

test("validar avisa quando a contagem diverge, sem reprovar", async () => {
  const addon = acharAddon("aio-metadata:curadoria")
  const buscar = async () => resposta({ id: "aio-metadata", catalogs: Array(4).fill({}) })
  const r = await validar(addon, "55555555-eeee-4eee-8eee-555555555555", { buscar })

  assert.equal(r.ok, true)
  assert.match(r.mensagem, /esperado eram 18/)
})

test("addon de catálogo que responde vazio é reprovado", async () => {
  const addon = acharAddon("aio-metadata:em-alta")
  const buscar = async () => resposta({ id: "aio-metadata", catalogs: [] })
  const r = await validar(addon, "11111111-aaaa-4aaa-8aaa-111111111111", { buscar })

  assert.equal(r.ok, false)
  assert.match(r.mensagem, /salvou a configuração/)
})

test("404 vira mensagem sobre o valor colado, não erro genérico", async () => {
  const buscar = async () => resposta({}, { status: 404 })
  const r = await validar(acharAddon("aio-metadata:anime"), "44444444-dddd-4ddd-8ddd-444444444444", { buscar })

  assert.equal(r.ok, false)
  assert.match(r.mensagem, /não existe/)
})

test("resposta que não é manifesto é recusada", async () => {
  const buscar = async () => resposta({ qualquer: "coisa" })
  const r = await validar(acharAddon("com.aiostreams.viren070"), "https://x/manifest.json", { buscar })

  assert.equal(r.ok, false)
  assert.match(r.mensagem, /sem identificação/)
})

test("o descritor do Cinemeta sai marcado como protegido", async () => {
  const addon = acharAddon("com.linvo.cinemeta")
  const buscar = async () => resposta({ id: "com.linvo.cinemeta", name: "Cinemeta" })
  const d = descritor(await validar(addon, "", { buscar }), addon)

  assert.equal(d.flags.protected, true)
  assert.equal(d.transportUrl, "https://v3-cinemeta.strem.io/manifest.json")
})

test("descritor de addon não validado falha em vez de gerar lixo", () => {
  assert.throws(() => descritor({ ok: false }, acharAddon("aio-metadata:anime")), /ainda não foi validado/)
})

/* ------------------------------------------------- cliente do Stremio */

test("e-mail sem conta vira mensagem que a pessoa entende", async () => {
  const buscar = async () => resposta({ error: { code: 2, message: "User not found", wrongEmail: true } })
  await assert.rejects(() => entrar("nao@existe.invalid", "x", buscar), (e) => {
    assert.ok(e instanceof ErroStremio)
    assert.match(e.message, /não tem conta no Stremio/)
    return true
  })
})

test("sessão expirada é reconhecida pelo código 1", async () => {
  const buscar = async () => resposta({ error: { code: 1, message: "Session does not exist" } })
  await assert.rejects(() => lerColecao("chave-velha", buscar), /sessão expirou/)
})

test("queda de rede não vaza stack trace para a tela", async () => {
  const buscar = async () => {
    throw new TypeError("Failed to fetch")
  }
  await assert.rejects(() => lerColecao("k", buscar), /Verifique a conexão/)
})

test("login bem sucedido devolve a chave de sessão", async () => {
  const buscar = async () => resposta({ result: { authKey: "chave-123", user: {} } })
  assert.equal(await entrar("a@b.com", "senha", buscar), "chave-123")
})

/* ----------------------------------------------- instalar sem dar a senha */

test("o link de instalar troca https por stremio e preserva o resto", () => {
  const url = "https://aiometadata.elfhosted.com/stremio/abc/manifest.json"
  assert.equal(linkInstalar(url), "stremio://aiometadata.elfhosted.com/stremio/abc/manifest.json")
})

test("o link direto funciona para todo addon que não exige nada", () => {
  for (const addon of ADDONS.filter((a) => a.exige === "nada")) {
    assert.ok(linkInstalar(addon.url).startsWith("stremio://"), addon.nome)
  }
})

test("o link direto do Torrentio carrega as chaves de quem instala", () => {
  const torrentio = ADDONS.find((a) => a.exige === "debrid")
  const link = linkInstalar(montarUrl(torrentio, "", { realdebrid: "minha-chave-rd" }))
  assert.ok(link.startsWith("stremio://torrentio.strem.fun/"))
  assert.ok(link.includes("realdebrid=minha-chave-rd"))
})

/* ------------------------------------------ injecao das chaves no download */

const CHAVES = { mdblist: "chave-mdblist-de-quem-instala", torbox: "chave-torbox-de-quem-instala" }
const SO_RD = { realdebrid: "chave-realdebrid-de-quem-instala" }

const templateMetadata = () => ({
  version: "2.15.0",
  config: { addonName: "Em Alta", catalogs: [{ id: "mdblist.87667" }] },
  metadata: { apiKeysExcluded: true },
})
const templateStreams = () => ({
  preferredLanguages: ["Portuguese (Brazil)"],
  services: [
    { id: "torbox", enabled: true, credentials: {} },
    { id: "realdebrid", enabled: false, credentials: {} },
    { id: "premiumize", enabled: false, credentials: {} },
  ],
})

const acharServico = (arq, id) => arq.services.find((s) => s.id === id)

test("a chave do MDBList entra no arquivo do AIOMetadata", () => {
  const { arquivo, aplicadas } = injetarChaves(templateMetadata(), acharAddon("aio-metadata:em-alta"), CHAVES)
  assert.equal(arquivo.config.apiKeys.mdblist, CHAVES.mdblist)
  assert.equal(arquivo.metadata.apiKeysExcluded, false)
  assert.deepEqual(aplicadas, ["MDBList"])
})

test("a chave do TorBox entra no arquivo do AIOStreams", () => {
  const { arquivo, aplicadas } = injetarChaves(templateStreams(), acharAddon("com.aiostreams.viren070"), CHAVES)
  assert.equal(acharServico(arquivo, "torbox").credentials.apiKey, CHAVES.torbox)
  assert.equal(acharServico(arquivo, "torbox").enabled, true)
  assert.deepEqual(aplicadas, ["TorBox"])
})

test("quem usa só Real-Debrid recebe ele ligado e o TorBox desligado", () => {
  const { arquivo, aplicadas } = injetarChaves(templateStreams(), acharAddon("com.aiostreams.viren070"), SO_RD)

  assert.equal(acharServico(arquivo, "realdebrid").credentials.apiKey, SO_RD.realdebrid)
  assert.equal(acharServico(arquivo, "realdebrid").enabled, true)
  assert.deepEqual(aplicadas, ["Real-Debrid"])

  // O template vem com o TorBox ligado. Serviço ligado sem credencial faz o
  // AIOStreams tentar usar e falhar em silêncio, então ele tem que sair desligado.
  assert.equal(acharServico(arquivo, "torbox").enabled, false)
  assert.deepEqual(acharServico(arquivo, "torbox").credentials, {})
})

test("quem tem os dois recebe os dois ligados", () => {
  const { arquivo, aplicadas } = injetarChaves(
    templateStreams(),
    acharAddon("com.aiostreams.viren070"),
    { ...CHAVES, ...SO_RD },
  )
  assert.equal(acharServico(arquivo, "torbox").enabled, true)
  assert.equal(acharServico(arquivo, "realdebrid").enabled, true)
  assert.deepEqual(aplicadas.sort(), ["Real-Debrid", "TorBox"])
})

test("serviço que ninguém preencheu continua desligado e sem credencial", () => {
  const { arquivo } = injetarChaves(templateStreams(), acharAddon("com.aiostreams.viren070"), SO_RD)
  assert.equal(acharServico(arquivo, "premiumize").enabled, false)
  assert.deepEqual(acharServico(arquivo, "premiumize").credentials, {})
})

test("cada formato recebe só a chave que lhe cabe", () => {
  const meta = injetarChaves(templateMetadata(), acharAddon("aio-metadata:anime"), CHAVES).arquivo
  assert.equal(meta.config.apiKeys.torbox, undefined)

  const streams = injetarChaves(templateStreams(), acharAddon("com.aiostreams.viren070"), CHAVES).arquivo
  assert.equal(streams.config, undefined)
})

test("sem chave preenchida o download continua valendo, só sem injeção", () => {
  const { arquivo, aplicadas } = injetarChaves(templateMetadata(), acharAddon("aio-metadata:pijama"), {})
  assert.deepEqual(aplicadas, [])
  assert.equal(arquivo.config.apiKeys, undefined)
  assert.equal(arquivo.metadata.apiKeysExcluded, true)
})

test("chave só com espaço é tratada como ausente", () => {
  const { aplicadas } = injetarChaves(templateMetadata(), acharAddon("aio-metadata:anime"), { mdblist: "   " })
  assert.deepEqual(aplicadas, [])
})

test("o template original nunca é modificado", () => {
  const original = templateStreams()
  injetarChaves(original, acharAddon("com.aiostreams.viren070"), { ...CHAVES, ...SO_RD })
  assert.deepEqual(original.services[0].credentials, {})
  assert.equal(original.services[1].enabled, false)
})

test("o nome do arquivo avisa quando ele carrega credencial", () => {
  assert.equal(nomeDoArquivo("catalogos-em-alta.json", []), "catalogos-em-alta.json")
  assert.equal(nomeDoArquivo("catalogos-em-alta.json", ["MDBList"]), "catalogos-em-alta-com-minha-chave.json")
})

test("o aviso do download alerta para não compartilhar o arquivo com chave", () => {
  assert.match(avisoDoDownload(["MDBList"]).texto, /não mande esse arquivo para ninguém/i)
  assert.equal(avisoDoDownload([]).tom, "idle")
})

/* --------------------------------------- guia das fatias e UUID repetido */

test("UUID repetido entre fileiras é detectado pelo nome da outra", () => {
  const estado = { "aio-metadata:em-alta": { valor: "11111111-aaaa-4aaa-8aaa-111111111111" } }
  assert.equal(
    jaUsadoPor(estado, ADDONS, "aio-metadata:generos", "11111111-aaaa-4aaa-8aaa-111111111111"),
    "Em Alta",
  )
})

test("o mesmo UUID no próprio campo não conta como repetição", () => {
  const estado = { "aio-metadata:anime": { valor: "abc-123" } }
  assert.equal(jaUsadoPor(estado, ADDONS, "aio-metadata:anime", "abc-123"), null)
})

test("a comparação ignora espaço em volta e caixa", () => {
  const estado = { "aio-metadata:pijama": { valor: "AAAA-BBBB" } }
  assert.equal(jaUsadoPor(estado, ADDONS, "aio-metadata:anime", "  aaaa-bbbb  "), "Pijama")
})

test("campo vazio nunca acusa repetição", () => {
  const estado = { "aio-metadata:pijama": { valor: "" }, "aio-metadata:anime": { valor: "" } }
  assert.equal(jaUsadoPor(estado, ADDONS, "aio-metadata:anime", "   "), null)
})

test("abrir o configurador fica registrado por fileira", () => {
  let estado = {}
  assert.equal(abriuConfigurador(estado, "aio-metadata:anime"), false)
  estado = marcarAbertura(estado, "aio-metadata:anime")
  assert.equal(abriuConfigurador(estado, "aio-metadata:anime"), true)
  assert.equal(abriuConfigurador(estado, "aio-metadata:pijama"), false, "não vaza para as outras")
})

test("marcar abertura preserva o que já estava preenchido", () => {
  const antes = { "aio-metadata:anime": { valor: "algo", validado: true, url: "https://x" } }
  const depois = marcarAbertura(antes, "aio-metadata:anime")
  assert.equal(depois["aio-metadata:anime"].valor, "algo")
  assert.equal(depois["aio-metadata:anime"].validado, true)
  assert.equal(depois["aio-metadata:anime"].abriu, true)
})

test("validar de novo não apaga o progresso da guia", () => {
  const antes = { "aio-metadata:anime": { abriu: true, baixou: true } }
  const depois = registrar(antes, "aio-metadata:anime", "novo", { ok: true, url: "https://x" })
  assert.equal(depois["aio-metadata:anime"].abriu, true)
  assert.equal(depois["aio-metadata:anime"].baixou, true)
  assert.equal(depois["aio-metadata:anime"].valor, "novo")
})

test("o configurador do AIOMetadata aponta para a âncora que pula as boas-vindas", () => {
  const fatias = addonsQueExigem("uuid-aiometadata")
  assert.equal(fatias.length, 5)
  for (const f of fatias) {
    assert.ok(f.configurador.endsWith("/configure/#general"), `${f.nome}: ${f.configurador}`)
  }
})
