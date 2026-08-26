// @ts-check
/**
 * Liga a página aos módulos. Este arquivo só faz DOM: toda regra mora em
 * catalog, validation, stremio, keys e wizard, que são testáveis sem navegador.
 */

import { ADDONS, addonsQueExigem, montarUrl, linkInstalar } from "./catalog.js"
import { validar, descritor } from "./validation.js"
import { aferirMdblist, aferirTorbox } from "./keys.js"
import { entrar, lerColecao, gravarColecao, mesclar, backupJson, ErroStremio } from "./stremio.js"
import { carregar, guardar, limpar, registrar, conferirPacote } from "./wizard.js"

/** Glifos, desenhados como traço para herdar a cor e o peso do texto ao redor. */
const ICONES = {
  sair: '<path d="M6 2.5H3.2A1.2 1.2 0 0 0 2 3.7v9.1A1.2 1.2 0 0 0 3.2 14h9.1a1.2 1.2 0 0 0 1.2-1.2V10"/><path d="M9.5 2.5H14v4.5"/><path d="M7 9 14 2.5"/>',
  seta: '<path d="M3 8h10"/><path d="M9 4l4 4-4 4"/>',
  check: '<path d="M3 8.5 6.2 11.5 13 4.8"/>',
  alerta: '<circle cx="8" cy="8" r="6"/><path d="M8 5v3.5"/><path d="M8 11h.01"/>',
  copiar: '<path d="M5.5 5.5V3.2A1.2 1.2 0 0 1 6.7 2h6.1A1.2 1.2 0 0 1 14 3.2v6.1a1.2 1.2 0 0 1-1.2 1.2h-2.3"/><rect x="2" y="5.5" width="8.5" height="8.5" rx="1.2"/>',
  baixar: '<path d="M8 2.5v8"/><path d="M4.8 7.5 8 10.7l3.2-3.2"/><path d="M2.5 13h11"/>',
  ajuda: '<circle cx="8" cy="8" r="6.2"/><path d="M6.3 6.2a1.75 1.75 0 1 1 2.3 1.66c-.4.14-.6.5-.6.92v.3"/><path d="M8 12h.01"/>',
}

const PASSOS = ["Início", "MDBList", "TorBox", "Catálogos", "AIOStreams", "Legendas", "Revisão", "Instalar", "Pronto"]

/** Copy de cada fatia do AIOMetadata, indexada pelo id do catálogo. */
const FATIAS = {
  "aio-metadata:em-alta": {
    resumo:
      "O que está subindo agora, mais uma prateleira para cada serviço, para você ver " +
      "o que entrou sem abrir seis aplicativos.",
    prateleiras: ["Em alta", "Populares", "Top 250", "Netflix Top 10", "Globoplay", "HBO Max", "No ar hoje"],
  },
  "aio-metadata:generos": {
    resumo:
      "Uma prateleira por gênero e uma por década, dos anos 60 aos 2020. " +
      "É por onde você navega quando não sabe o que quer.",
    prateleiras: ["Ação", "Terror", "Doramas", "Coreanos", "Anos 80", "Anos 2020"],
  },
  "aio-metadata:pijama": {
    resumo:
      "Filme de domingo à noite. Tem um corte só de até 90 minutos e outro só de " +
      "4K nativo com Dolby Atmos, para quando a TV boa está livre.",
    prateleiras: ["90 minutos", "Comovente", "Comédia romântica", "4K nativo", "Dolby Atmos"],
  },
  "aio-metadata:anime": {
    resumo:
      "Vem do MyAnimeList, então tem corte que catálogo comum não tem: " +
      "por estúdio, por temporada, e o que estreia na próxima.",
    prateleiras: ["Top da semana", "Estreias", "Por estúdio", "Próxima temporada"],
  },
  "aio-metadata:curadoria": {
    resumo:
      "A prateleira que não é algoritmo. Festival, cinema brasileiro, " +
      "e uma fileira de comfort shows para quando nada serve.",
    prateleiras: ["Indicados ao Oscar", "Cannes", "Cinema brasileiro", "Terror japonês", "Comfort shows"],
  },
}

let estado = carregar()
let telaAtual = 0

/* ------------------------------------------------------------------ util */

const $ = (sel, raiz = document) => raiz.querySelector(sel)
const $$ = (sel, raiz = document) => [...raiz.querySelectorAll(sel)]

const svg = (nome) =>
  `<svg class="ico" viewBox="0 0 16 16" aria-hidden="true">${ICONES[nome] ?? ""}</svg>`

/** Troca os marcadores `data-ico` por SVG de verdade. */
function pintarIcones(raiz = document) {
  for (const alvo of $$("[data-ico]", raiz)) {
    alvo.outerHTML = svg(alvo.getAttribute("data-ico"))
  }
}

/**
 * @param {Element | null} alvo
 * @param {"ok" | "bad" | "idle" | "wait"} tom
 * @param {string} texto
 */
function dizer(alvo, tom, texto) {
  if (!alvo) return
  alvo.setAttribute("data-tone", tom)
  const icone = tom === "ok" ? svg("check") : tom === "bad" ? svg("alerta") : ""
  alvo.innerHTML = `${icone}<span>${escapar(texto)}</span>`
}

const escapar = (t) =>
  String(t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c])

function baixar(nome, conteudo, tipo = "application/json") {
  const url = URL.createObjectURL(new Blob([conteudo], { type: tipo }))
  const a = document.createElement("a")
  a.href = url
  a.download = nome
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/* ---------------------------------------------------------------- navegação */

function montarTicks() {
  const ticks = $("#ticks")
  ticks.innerHTML = PASSOS.map(
    (nome, i) => `<button data-go="${i}" title="${nome}" aria-label="${nome}"><i></i></button>`,
  ).join("")
}

function irPara(n) {
  telaAtual = n
  for (const tela of $$(".screen")) {
    tela.setAttribute("data-on", tela.dataset.screen === String(n) ? "1" : "0")
  }
  const { pronto } = conferirPacote(estado, ADDONS)
  $$("#ticks button").forEach((b, i) => {
    const feito = i < n || (i === PASSOS.length - 1 && pronto)
    b.setAttribute("data-state", i === n ? "now" : feito ? "done" : "todo")
  })
  if (n === 3) sincronizarCopiaveis()
  if (n === 4) sincronizarCopiaveis()
  if (n === 6) montarRevisao()
  if (n === 7) montarLinksDiretos()
  window.scrollTo({ top: 0, behavior: "instant" })
}

/* ------------------------------------------------------- fatias e campos */

function montarFatias() {
  const alvo = $("#fatias")
  alvo.innerHTML = addonsQueExigem("uuid-aiometadata")
    .map((addon) => {
      const copy = FATIAS[addon.id] ?? { resumo: "", prateleiras: [] }
      const chips = copy.prateleiras.map((p) => `<span>${escapar(p)}</span>`).join("")
      return `
      <div class="card slice" data-addon="${addon.id}">
        <div class="slice-head">
          <h3>${escapar(addon.nome)}</h3>
          <span class="tag">${addon.catalogos} catálogos</span>
        </div>
        <p class="slice-p">${escapar(copy.resumo)}</p>
        <div class="shelves">${chips}</div>
        <div class="slice-act">
          <a class="btn btn-out btn-sm" data-configurador target="_blank" rel="noopener">
            Abrir configurador ${svg("sair")}
          </a>
          <button class="btn btn-out btn-sm" data-baixar>${svg("baixar")} Baixar o catálogo</button>
        </div>
        <div class="field">
          <div class="pair">
            <input type="text" autocomplete="off" spellcheck="false" placeholder="cole o UUID que apareceu">
            <button class="btn btn-out" data-verificar>Verificar</button>
          </div>
          <p class="msg" data-tone="idle" data-saida>Esperando o UUID</p>
        </div>
      </div>`
    })
    .join("")
}

/** Liga os botões de configurador e download aos dados do catálogo. */
function ligarAddons() {
  for (const caixa of $$("[data-addon]")) {
    const addon = ADDONS.find((a) => a.id === caixa.dataset.addon)
    if (!addon) continue

    const link = $("[data-configurador]", caixa)
    if (link && addon.configurador) link.href = addon.configurador

    const botao = $("[data-baixar]", caixa)
    if (botao && addon.template) {
      botao.addEventListener("click", async () => {
        try {
          const r = await fetch(`templates/${addon.template}`)
          if (!r.ok) throw new Error(String(r.status))
          baixar(addon.template, await r.text())
        } catch {
          dizer($("[data-saida]", caixa), "bad", "Não deu para baixar o arquivo. Recarregue a página e tente de novo.")
        }
      })
    }
  }
}

/** Restaura o que estava guardado nos campos. */
function reidratar() {
  for (const caixa of $$("[data-addon]")) {
    const id = caixa.dataset.addon
    const salvo = estado[id]
    const campo = $("input", caixa)
    if (!campo || !salvo) continue
    campo.value = salvo.valor
    campo.setAttribute("data-state", salvo.validado ? "ok" : "bad")
    dizer($("[data-saida]", caixa), salvo.validado ? "ok" : "bad", salvo.mensagem ?? "")
  }

  for (const caixa of $$("[data-campo]")) {
    const salvo = estado[caixa.dataset.campo]
    const campo = $("input", caixa)
    if (!campo || !salvo) continue
    campo.value = salvo.valor
    campo.setAttribute("data-state", salvo.validado ? "ok" : "bad")
    dizer($("[data-saida]", caixa), salvo.validado ? "ok" : "bad", salvo.mensagem ?? "")
  }
}

function sincronizarCopiaveis() {
  for (const caixa of $$("[data-copiavel]")) {
    const salvo = estado[caixa.dataset.copiavel]
    const valor = salvo?.valor ?? ""
    const mostra = $("[data-valor]", caixa)
    mostra.textContent = valor ? mascarar(valor) : "ainda não preenchida"
    $("[data-copiar]", caixa).disabled = !valor
  }
}

const mascarar = (v) => (v.length <= 12 ? v : `${v.slice(0, 8)}${"•".repeat(Math.min(12, v.length - 8))}`)

/* -------------------------------------------------------------- verificação */

async function verificarAddon(caixa) {
  const addon = ADDONS.find((a) => a.id === caixa.dataset.addon)
  const campo = $("input", caixa)
  const saida = $("[data-saida]", caixa)
  const botao = $("[data-verificar]", caixa)

  botao.disabled = true
  dizer(saida, "wait", "Perguntando ao addon...")

  const resultado = await validar(addon, campo.value)
  botao.disabled = false

  campo.setAttribute("data-state", resultado.ok ? "ok" : "bad")
  dizer(saida, resultado.ok ? "ok" : "bad", resultado.mensagem ?? "")

  estado = registrar(estado, addon.id, campo.value.trim(), resultado)
  guardar(estado)
}

async function verificarChave(caixa) {
  const qual = caixa.dataset.campo
  const campo = $("input", caixa)
  const saida = $("[data-saida]", caixa)
  const botao = $("[data-verificar]", caixa)
  const valor = campo.value.trim()

  botao.disabled = true
  if (qual === "chave:mdblist") dizer(saida, "wait", "Perguntando ao MDBList...")

  const afericao = qual === "chave:mdblist" ? await aferirMdblist(valor) : aferirTorbox(valor)
  botao.disabled = false

  // Formato certo mas impossível de conferir daqui conta como preenchido, e a
  // mensagem diz por que não existe check verde.
  const tom = afericao.ok ? (afericao.verificado ? "ok" : "idle") : "bad"
  campo.setAttribute("data-state", afericao.ok ? "ok" : "bad")
  dizer(saida, tom, afericao.mensagem)

  estado = registrar(estado, qual, valor, { ok: afericao.ok, mensagem: afericao.mensagem })
  guardar(estado)

  // A chave do TorBox também é o que monta a URL do Torrentio.
  if (qual === "chave:torbox" && afericao.ok) {
    const torrentio = ADDONS.find((a) => a.exige === "chave-torbox")
    estado = registrar(estado, torrentio.id, valor, {
      ok: true,
      url: montarUrl(torrentio, valor),
      mensagem: "Montado com a sua chave.",
    })
    guardar(estado)
  }

  sincronizarCopiaveis()
}

/* ----------------------------------------------------------------- revisão */

const PAPEL = { catalogo: "catálogo", streams: "streams", legendas: "legendas" }

function montarRevisao() {
  $("#revisao").innerHTML = ADDONS.map((addon) => {
    const salvo = estado[addon.id]
    let selo, tom
    if (addon.exige === "nada") {
      selo = addon.protegido ? "mantido" : "nada a configurar"
      tom = "auto"
    } else if (addon.exige === "chave-torbox") {
      selo = salvo?.validado ? "montado para você" : "falta a chave"
      tom = salvo?.validado ? "auto" : "bad"
    } else {
      selo = salvo?.validado ? "verificado" : "falta verificar"
      tom = salvo?.validado ? "" : "bad"
    }

    const detalhe = addon.catalogos
      ? `${PAPEL[addon.papel]}, ${addon.catalogos} prateleiras`
      : PAPEL[addon.papel]

    return `<div class="list-row">
      <div><strong>${escapar(addon.nome)}</strong><small>${escapar(detalhe)}</small></div>
      <span class="pill"${tom ? ` data-tone="${tom}"` : ""}>${escapar(selo)}</span>
    </div>`
  }).join("")

  // Escopo na própria tela: `[data-go="7"]` solto pegaria o tick do topo, que é
  // navegação e nunca deve travar.
  const { pronto, faltam } = conferirPacote(estado, ADDONS)
  const seguir = $('.screen[data-screen="6"] [data-go="7"]')
  seguir.disabled = !pronto
  seguir.title = pronto ? "" : `Ainda falta: ${faltam.join(", ")}`
}

/* ---------------------------------------------------------------- instalar */

async function instalar() {
  const botao = $("#instalar")
  const saida = $("#saida-instalar")
  const email = $("#s-mail").value.trim()
  const senha = $("#s-pass").value

  if (!email || !senha) {
    dizer(saida, "bad", "Preencha o e-mail e a senha da sua conta Stremio.")
    return
  }

  const { pronto, faltam } = conferirPacote(estado, ADDONS)
  if (!pronto) {
    dizer(saida, "bad", `Ainda falta verificar: ${faltam.join(", ")}.`)
    return
  }

  botao.disabled = true
  try {
    dizer(saida, "wait", "Entrando na sua conta...")
    const authKey = await entrar(email, senha)
    $("#s-pass").value = ""

    dizer(saida, "wait", "Lendo os addons que você já tem...")
    const atual = await lerColecao(authKey)

    if ($("#s-backup").checked) {
      baixar(`stremio-backup-antes-do-super-stremio.json`, backupJson(atual))
    }

    dizer(saida, "wait", "Montando a lista...")
    const pacote = []
    for (const addon of ADDONS) {
      const salvo = estado[addon.id]
      const resultado = await validar(addon, salvo?.valor ?? "")
      if (!resultado.ok) {
        throw new ErroStremio(`${addon.nome} parou de responder: ${resultado.mensagem}`)
      }
      pacote.push(descritor(resultado, addon))
    }

    const final = mesclar(atual, pacote)

    dizer(saida, "wait", `Gravando ${final.length} addons...`)
    await gravarColecao(authKey, final)

    // Reler e conferir de verdade. A API pode aceitar a chamada e não gravar, e
    // dizer "instalado" nesse caso é pior do que dizer que falhou.
    // Confere por transportUrl, não por manifest.id. As cinco configurações do
    // AIOMetadata compartilham o mesmo id, e conferir por id daria tudo certo
    // mesmo com quatro delas faltando.
    dizer(saida, "wait", "Conferindo o que ficou gravado...")
    const conferencia = await lerColecao(authKey)
    const gravados = new Set(conferencia.map((a) => a.transportUrl))
    const sumiram = final.filter((a) => !gravados.has(a.transportUrl))

    if (sumiram.length > 0) {
      const nomes = sumiram.map((a) => a.manifest?.name ?? a.transportUrl).join(", ")
      throw new Error(
        `O Stremio aceitou a gravação mas ${sumiram.length} addons não apareceram na conta ` +
          `(${nomes}). Use o botão de baixar a lista aqui embaixo e importe manualmente.`,
      )
    }

    $("#resumo-final").textContent =
      `Os ${conferencia.length} addons já estão na sua conta e sincronizaram. ` +
      `Se o Stremio estava aberto, feche e abra de novo para as prateleiras aparecerem.`
    irPara(8)
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    const codigo = e instanceof ErroStremio && e.codigo ? ` (código ${e.codigo})` : ""
    dizer(saida, "bad", `${msg}${codigo}`)
  } finally {
    botao.disabled = false
  }
}

/* ------------------------------------------------ instalar sem dar a senha */

/**
 * Monta a lista de botões `stremio://`, um por addon já resolvido.
 * Só aparece o que tem URL, então quem pulou um passo não vê botão morto.
 */
function montarLinksDiretos() {
  const linhas = ADDONS.map((addon) => {
    const url = addon.exige === "nada" ? addon.url : estado[addon.id]?.url
    const detalhe = addon.catalogos ? `${PAPEL[addon.papel]}, ${addon.catalogos} prateleiras` : PAPEL[addon.papel]

    const acao = url
      ? `<a class="btn btn-out btn-sm" href="${escapar(linkInstalar(url))}">Instalar ${svg("seta")}</a>`
      : `<span class="pill" data-tone="bad">falta verificar</span>`

    return `<div class="list-row">
      <div><strong>${escapar(addon.nome)}</strong><small>${escapar(detalhe)}</small></div>
      ${acao}
    </div>`
  })
  $("#links-diretos").innerHTML = linhas.join("")
}

/**
 * Baixa a coleção pronta, sem exigir login.
 *
 * Usa a coleção anônima do Stremio como base, que é de onde vêm os addons
 * protegidos. Sem isso o arquivo instalaria os onze e tiraria a reprodução de
 * vídeo local de quem importasse.
 */
async function baixarColecao() {
  const botao = $("#baixar-colecao")
  const saida = $("#saida-colecao")

  botao.disabled = true
  try {
    dizer(saida, "wait", "Montando a lista...")

    // Baixa o que estiver pronto. Travar o arquivo até tudo estar verificado só
    // serve para deixar alguém sem saída quando um addon está fora do ar.
    const pacote = []
    const fora = []
    for (const addon of ADDONS) {
      const resultado = await validar(addon, estado[addon.id]?.valor ?? "")
      if (resultado.ok) pacote.push(descritor(resultado, addon))
      else fora.push(addon.nome)
    }

    if (pacote.length === 0) {
      dizer(saida, "bad", "Nenhum addon respondeu. Verifique a sua conexão e tente de novo.")
      return
    }

    // A coleção padrão vem sem authKey e é de onde saem os protegidos.
    let base = []
    try {
      base = await lerColecao("")
    } catch {
      /* sem rede para o Stremio: segue só com o pacote */
    }

    const final = mesclar(base, pacote)
    baixar("super-stremio-addons.json", backupJson(final))

    const quantos = `Baixado, com ${final.length} addons.`
    if (fora.length === 0) dizer(saida, "ok", `${quantos} Importe no gerenciador que você usa.`)
    else dizer(saida, "idle", `${quantos} Ficaram de fora, porque não foram verificados: ${fora.join(", ")}.`)
  } catch (e) {
    dizer(saida, "bad", e instanceof Error ? e.message : String(e))
  } finally {
    botao.disabled = false
  }
}

function baixarUuids() {
  const linhas = ["As suas configurações do Super Stremio", ""]
  for (const addon of ADDONS) {
    const salvo = estado[addon.id]
    if (!salvo?.valor || addon.exige === "chave-torbox") continue
    linhas.push(`${addon.nome}`)
    linhas.push(`  ${salvo.valor}`)
    if (addon.configurador) linhas.push(`  ${addon.configurador}`)
    linhas.push(`  senha: ____________________`)
    linhas.push("")
  }
  linhas.push("As senhas que você criou em cada serviço são a única forma de editar")
  linhas.push("essas configurações depois. Não existe recuperação de senha nesses serviços.")
  baixar("minhas-configuracoes-stremio.txt", linhas.join("\n"), "text/plain")
}

/* -------------------------------------------------------------------- boot */

function iniciar() {
  // O navegador restaura a posição de rolagem sozinho ao voltar para a página,
  // e isso atropela o scroll para o topo que cada passo faz.
  if ("scrollRestoration" in history) history.scrollRestoration = "manual"

  montarTicks()
  montarFatias()
  pintarIcones()
  ligarAddons()
  reidratar()
  sincronizarCopiaveis()

  document.addEventListener("click", (e) => {
    const alvo = e.target instanceof Element ? e.target : null
    if (!alvo) return

    const ir = alvo.closest("[data-go]")
    if (ir && ir.tagName !== "A" && !ir.disabled) {
      irPara(Number(ir.getAttribute("data-go")))
      return
    }

    const verificar = alvo.closest("[data-verificar]")
    if (verificar) {
      const caixa = verificar.closest("[data-addon], [data-campo]")
      if (caixa?.hasAttribute("data-addon")) verificarAddon(caixa)
      else if (caixa) verificarChave(caixa)
      return
    }

    const copiar = alvo.closest("[data-copiar]")
    if (copiar) {
      const caixa = copiar.closest("[data-copiavel]")
      const valor = estado[caixa.dataset.copiavel]?.valor
      if (valor) {
        navigator.clipboard?.writeText(valor)
        const antes = copiar.innerHTML
        copiar.innerHTML = `${svg("check")} Copiada`
        setTimeout(() => (copiar.innerHTML = antes), 1600)
      }
    }
  })

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return
    const campo = e.target
    if (!(campo instanceof HTMLInputElement)) return
    const caixa = campo.closest("[data-addon], [data-campo]")
    if (!caixa) return
    e.preventDefault()
    $("[data-verificar]", caixa)?.click()
  })

  $("#instalar").addEventListener("click", instalar)
  $("#baixar-colecao").addEventListener("click", baixarColecao)
  $("#baixar-uuids").addEventListener("click", baixarUuids)
  $("#recomecar").addEventListener("click", () => {
    estado = limpar()
    location.reload()
  })

  irPara(0)
}

iniciar()
