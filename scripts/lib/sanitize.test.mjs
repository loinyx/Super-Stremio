import { test } from "node:test"
import assert from "node:assert/strict"

import {
  limparAioMetadata,
  limparAioStreams,
  servicosLigados,
  SEGREDOS_AIOMETADATA,
  SEGREDOS_AIOSTREAMS,
  PERMITIDOS,
  RUIDO_NUVIO,
} from "./sanitize.mjs"
import { coletarSegredos, procurarVazamentos } from "./secret-scan.mjs"

const exportAioMetadata = () => ({
  version: "2.15.0",
  config: {
    addonName: "Em Alta",
    language: "pt-BR",
    sessionId: "sessao-de-alguem",
    configHash: "2451f40281a51376",
    lastModified: 1787716020662,
    configVersion: 1787716020663,
    apiKeys: {
      gemini: "AIzaSy_EXEMPLO_CHAVE_FALSA_DE_TESTE_000",
      mdblist: "9rvEXEMPLOchavemdblistFAKE",
      maxCatalogs: 200,
      hasBuiltInTmdb: true,
    },
    catalogs: [{ id: "mdblist.87667", name: "🔥 Em Alta", source: "mdblist" }],
  },
  metadata: { apiKeysExcluded: false, totalCatalogs: 1 },
})

const exportAioStreams = () => ({
  uuid: "66666666-ffff-4fff-8fff-666666666666",
  tmdbApiKey: "0123456789abcdef0123456789abcdef",
  tmdbAccessToken: "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhYmMifQ.assinatura-aqui",
  rpdbApiKey: "t0-free-rpdb",
  openposterdbApiKey: "t0-free-rpdb",
  preferredLanguages: ["Portuguese (Brazil)"],
  services: [
    { id: "torbox", enabled: true, credentials: { apiKey: "77777777-9999-4999-8999-777777777777" } },
    { id: "realdebrid", enabled: false, credentials: {} },
  ],
})

test("AIOMetadata perde o bloco de chaves inteiro", () => {
  const limpo = limparAioMetadata(exportAioMetadata())
  assert.equal(limpo.config.apiKeys, undefined)
  assert.equal(limpo.metadata.apiKeysExcluded, true)
})

test("AIOMetadata mantém o que dá valor ao template", () => {
  const limpo = limparAioMetadata(exportAioMetadata())
  assert.equal(limpo.config.addonName, "Em Alta")
  assert.equal(limpo.config.language, "pt-BR")
  assert.equal(limpo.config.catalogs.length, 1)
  assert.equal(limpo.config.catalogs[0].id, "mdblist.87667")
})

test("AIOMetadata descarta campos presos à conta de origem", () => {
  const limpo = limparAioMetadata(exportAioMetadata())
  for (const campo of ["sessionId", "configHash", "lastModified", "configVersion"]) {
    assert.equal(limpo.config[campo], undefined, `${campo} deveria sumir`)
  }
})

test("AIOStreams perde uuid, credenciais e chaves de TMDB", () => {
  const limpo = limparAioStreams(exportAioStreams())
  assert.equal(limpo.uuid, undefined)
  assert.equal(limpo.tmdbApiKey, undefined)
  assert.equal(limpo.tmdbAccessToken, undefined)
  assert.deepEqual(limpo.services[0].credentials, {})
})

test("AIOStreams mantém quais serviços estavam ligados", () => {
  const limpo = limparAioStreams(exportAioStreams())
  assert.equal(limpo.services[0].enabled, true)
  assert.equal(limpo.services[1].enabled, false)
  assert.deepEqual(limpo.preferredLanguages, ["Portuguese (Brazil)"])
  assert.deepEqual(servicosLigados(exportAioStreams()), ["torbox"])
})

test("a origem não é modificada", () => {
  const origem = exportAioMetadata()
  limparAioMetadata(origem)
  assert.equal(origem.config.apiKeys.mdblist, "9rvEXEMPLOchavemdblistFAKE")
})

test("a varredura acusa quando um segredo da origem sobrevive", () => {
  const origem = exportAioMetadata()
  const segredos = coletarSegredos(origem, SEGREDOS_AIOMETADATA)
  const vazamentos = procurarVazamentos(JSON.stringify(origem), { segredos, permitidos: PERMITIDOS })

  assert.ok(vazamentos.length > 0, "deveria acusar a origem crua")
  assert.ok(vazamentos.some((v) => v.valor.startsWith("AIzaSy")))
})

test("a varredura passa na saída limpa dos dois formatos", () => {
  for (const [origem, limpar, caminhos] of [
    [exportAioMetadata(), limparAioMetadata, SEGREDOS_AIOMETADATA],
    [exportAioStreams(), limparAioStreams, SEGREDOS_AIOSTREAMS],
  ]) {
    const segredos = coletarSegredos(origem, caminhos)
    const texto = JSON.stringify(limpar(origem))
    const vazamentos = procurarVazamentos(texto, { segredos, permitidos: PERMITIDOS })
    assert.deepEqual(vazamentos, [])
  }
})

test("a varredura pega credencial em campo que o sanitizador não conhece", () => {
  // Simula uma versão futura do addon guardando chave num lugar novo.
  const futuro = limparAioStreams(exportAioStreams())
  futuro.campoQueAindaNaoExiste = "sk-or-v1-" + "a".repeat(64)

  const vazamentos = procurarVazamentos(JSON.stringify(futuro), { permitidos: PERMITIDOS })
  // Mais de um padrão pode casar com a mesma chave, e tudo bem: a varredura
  // erra para o lado de acusar demais. O que importa é não deixar passar.
  assert.ok(vazamentos.length >= 1)
  assert.ok(vazamentos.some((v) => v.tipo === "chave do OpenRouter"))
})

test("o token público do RatingPosterDB não vira falso positivo", () => {
  const vazamentos = procurarVazamentos('{"rpdb":"t0-free-rpdb"}', { permitidos: PERMITIDOS })
  assert.deepEqual(vazamentos, [])
})

/* -------------------------------------------- ruído por contexto no Nuvio */

// Construída pelo formato, não escrita à mão: o padrão do Google exige
// exatamente 35 caracteres depois de "AIza", e chave falsa curta demais faz o
// teste passar por não casar, escondendo o que ele deveria provar.
const CHAVE_FALSA = "AIza" + "Sy_CHAVE_FALSA_DE_TESTE".padEnd(35, "0")

const colecaoNuvio = () =>
  JSON.stringify([
    {
      id: "a7576199-c7bd-4f2e-9c31-3f9d0e1c55ab",
      title: "Descobrir",
      folders: [
        {
          id: "1f10af82-da2e-446d-8cac-0658bf587667",
          title: "Mubi",
          focusGifUrl: "https://64.media.tumblr.com/0871e87c17045759735ef64c26703c71b585bfb0.gifv",
          sources: [{ provider: "tmdb", genre: "All", addonId: null }],
        },
      ],
    },
  ])

test("hexadecimal de caminho de imagem não vira falso positivo", () => {
  const vazamentos = procurarVazamentos(colecaoNuvio(), { permitidos: PERMITIDOS, ruido: RUIDO_NUVIO })
  assert.deepEqual(vazamentos, [])
})

test("sem a regra de ruído, o mesmo arquivo acusaria", () => {
  const vazamentos = procurarVazamentos(colecaoNuvio(), { permitidos: PERMITIDOS })
  assert.ok(vazamentos.length > 0, "a varredura crua tem que reclamar")
})

test("a regra de ruído não abre buraco: chave em outro campo ainda é pega", () => {
  // Monta o objeto e serializa, em vez de mexer no texto: replace sobre JSON
  // depende de espaçamento que o stringify não produz, e o teste passaria por
  // não ter encontrado nada para trocar.
  const com = JSON.parse(colecaoNuvio())
  com[0].apiKey = CHAVE_FALSA

  const vazamentos = procurarVazamentos(JSON.stringify(com), { permitidos: PERMITIDOS, ruido: RUIDO_NUVIO })
  assert.ok(
    vazamentos.some((v) => v.tipo === "chave do Google"),
    "a chave está fora dos contextos de ruído e tinha que aparecer",
  )
})

test("chave escondida dentro de uma URL também é pega, porque o valor é vigiado", () => {
  const com = JSON.parse(colecaoNuvio())
  com[0].folders[0].focusGifUrl += `?k=${CHAVE_FALSA}`

  const segredos = new Set([CHAVE_FALSA])
  const vazamentos = procurarVazamentos(JSON.stringify(com), {
    segredos,
    permitidos: PERMITIDOS,
    ruido: RUIDO_NUVIO,
  })
  assert.ok(vazamentos.some((v) => v.tipo === "segredo da origem"))
})
