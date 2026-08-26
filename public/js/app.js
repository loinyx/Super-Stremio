// @ts-check
/**
 * Liga a página aos módulos. Este arquivo só faz DOM: toda regra mora em
 * catalog, validation, stremio, keys e wizard, que são testáveis sem navegador.
 */

import { ADDONS, DEBRIDS, addonsQueExigem, montarUrl, linkInstalar } from "./catalog.js"
import { validar, descritor } from "./validation.js"
import { aferirMdblist, aferirDebrid } from "./keys.js"
import { entrar, lerColecao, gravarColecao, mesclar, backupJson, ErroStremio } from "./stremio.js"
import {
  carregar, guardar, limpar, registrar, conferirPacote,
  marcarAbertura, abriuConfigurador, jaUsadoPor,
} from "./wizard.js"
import { injetarChaves, nomeDoArquivo, avisoDoDownload } from "./inject.js"
import { icone } from "./icons.js"


/**
 * Onde a pessoa assiste.
 *
 * A diferença que importa não é em que aparelho cada um roda. É o que cada um
 * faz com os addons: o Stremio mostra o que eles devolvem, e o Nuvio monta uma
 * camada de navegação própria por cima dos mesmos addons.
 */
const APPS = [
  {
    id: "stremio",
    nome: "Stremio",
    selo: "o original",
    nota: "Os addons montam a tela. O que você vê é o que eles devolvem, em prateleiras simples.",
    baixar: "https://www.stremio.com/downloads",
  },
  {
    id: "nuvio",
    nome: "Nuvio",
    selo: "para TV",
    nota: "Os mesmos addons, com uma camada de curadoria por cima: coleções em pastas, com capa e logo, para escolher no controle.",
    baixar: "https://github.com/NuvioMedia/NuvioWeb/releases",
  },
  {
    id: "ambos",
    nome: "Os dois",
    selo: "",
    nota: "Instala a mesma lista nos dois, e leva as coleções do Nuvio junto.",
    baixar: "",
    larga: true,
  },
]

/** Logo do Nuvio, do arquivo de marca do projeto deles. */
const LOGO_NUVIO = "data:image/png;base64,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"
/** @returns {string} o app escolhido, com o Stremio como padrão */
const appEscolhido = () => estado["app"]?.valor || "stremio"
const usaNuvio = () => ["nuvio", "ambos"].includes(appEscolhido())
const usaStremio = () => ["stremio", "ambos"].includes(appEscolhido())

/** Os passos do painel lateral: rótulo curto e um ícone que diga do que se trata. */
const PASSOS = [
  { nome: "Início",     icone: "sparkle" },
  { nome: "Aplicativo", icone: "television" },
  { nome: "MDBList",    icone: "key" },
  { nome: "Debrid",     icone: "lightning" },
  { nome: "Catálogos",  icone: "squares-four" },
  { nome: "Streams",    icone: "play-circle" },
  { nome: "Legendas",   icone: "closed-captioning" },
  { nome: "Revisão",    icone: "list-checks" },
  { nome: "Instalar",   icone: "download-simple" },
  { nome: "Pronto",     icone: "check-circle" },
]

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

/** As chaves de debrid preenchidas, no formato que catalog e inject esperam. */
function debridsPreenchidos() {
  const saida = {}
  for (const d of DEBRIDS) {
    const guardado = estado[`chave:${d.id}`]
    if (!guardado?.ativo) continue
    const chave = (guardado.valor ?? "").trim()
    if (chave) saida[d.id] = chave
  }
  return saida
}

/** @returns {boolean} true quando pelo menos um debrid foi preenchido */
const temAlgumDebrid = () => Object.keys(debridsPreenchidos()).length > 0

/* ------------------------------------------------------------------ util */

const $ = (sel, raiz = document) => raiz.querySelector(sel)
const $$ = (sel, raiz = document) => [...raiz.querySelectorAll(sel)]

const svg = (nome, classe) => icone(nome, classe ?? "ic")

/** Troca os marcadores `data-ico` por SVG de verdade. */
function pintarIcones(raiz = document) {
  for (const alvo of $$("[data-ico]", raiz)) {
    alvo.outerHTML = svg(alvo.getAttribute("data-ico"), alvo.getAttribute("data-cls") ?? "ic")
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
  // Nada de `icone` como nome local: sombreia o import e, pior, um nome solto
  // aqui dentro cai no elemento de mesmo id, que o navegador expõe como global.
  const marca =
    tom === "ok" ? svg("circle-check")
    : tom === "bad" ? svg("warning-circle")
    : tom === "wait" ? svg("circle-notch")
    : ""
  alvo.innerHTML = `${marca}<span>${escapar(texto)}</span>`
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

function montarTrilho() {
  $("#marca").innerHTML = `${svg("sparkle", "ic-m")}<b>Super Stremio</b>`
  $("#trilho").innerHTML = PASSOS.map(
    (p, i) => `
    <li data-e="todo">
      <button data-go="${i}" title="${escapar(p.nome)}">
        <span class="pino">${svg(p.icone, "ic-p")}</span>
        <span class="rot">${escapar(p.nome)}</span>
      </button>
    </li>`,
  ).join("")
}

function irPara(n) {
  telaAtual = n
  for (const tela of $$(".screen")) {
    tela.setAttribute("data-on", tela.dataset.screen === String(n) ? "1" : "0")
  }
  const { pronto } = conferirPacote(estado, ADDONS)
  $$("#trilho li").forEach((li, i) => {
    const feito = i < n || (i === PASSOS.length - 1 && pronto)
    li.setAttribute("data-e", i === n ? "agora" : feito ? "feito" : "todo")
    const pino = $(".pino", li)
    pino.innerHTML = feito && i !== n ? svg("circle-check", "ic-p") : svg(PASSOS[i].icone, "ic-p")
  })
  if (n === 3) pintarResumoDebrid()
  if (n === 4) sincronizarCopiaveis()
  if (n === 5) sincronizarCopiaveis()
  if (n === 7) montarRevisao()
  if (n === 8) montarLinksDiretos()
  window.scrollTo({ top: 0, behavior: "instant" })
}

/* ------------------------------------------------------- fatias e campos */

function montarEscolhaApp() {
  const atual = appEscolhido()
  const marca = (a) =>
    a.id === "stremio" ? svg("stremio", "ic-l")
    : a.id === "nuvio" ? `<img src="${LOGO_NUVIO}" alt="">`
    : svg("squares-four", "ic-l")

  $("#escolha-app").innerHTML = APPS.map(
    (a) => `
    <label${a.larga ? " data-larga" : ""}>
      <input type="radio" name="app" value="${a.id}"${a.id === atual ? " checked" : ""}>
      <span class="logo">${marca(a)}</span>
      <div class="duo-tx">
        <strong>${escapar(a.nome)}${a.selo ? ` <span class="selo">${escapar(a.selo)}</span>` : ""}</strong>
        <p>${escapar(a.nota)}</p>
      </div>
      ${a.baixar ? `<a class="bt bt-s bt-sm" href="${a.baixar}" target="_blank" rel="noopener">Baixar ${svg("arrow-square-out")}</a>` : ""}
    </label>`,
  ).join("")

  $("#escolha-app").addEventListener("change", (e) => {
    estado = { ...estado, app: { valor: e.target.value, validado: true } }
    guardar(estado)
    pintarPorApp()
  })
}

/** Os três pré-requisitos da tela de entrada. */
function montarPreRequisitos() {
  const itens = [
    { i: "key", n: "MDBList", s: "grátis", t: "De onde vêm 86 das 150 prateleiras." },
    { i: "lightning", n: "Um debrid", s: "assinatura", t: "TorBox ou Real-Debrid. É o que faz o filme abrir na hora." },
    { i: "closed-captioning", n: "Community Subtitles", s: "grátis", t: "Onde a legenda de episódio novo sai primeiro." },
  ]
  $("#pre-requisitos").innerHTML = itens.map(
    (x) => `
    <div class="cartao">
      <div class="cab-cartao">
        ${svg(x.i, "ic-g")}<h3>${escapar(x.n)}</h3>
        <span class="selo"${x.s === "grátis" ? ' data-tone="free"' : ' data-tone="paid"'}>${escapar(x.s)}</span>
      </div>
      <p class="nota m-0">${escapar(x.t)}</p>
    </div>`,
  ).join("")
}

/** Como chamar o aplicativo no meio de uma frase. */
function nomeDoApp() {
  const escolha = appEscolhido()
  if (escolha === "nuvio") return "Nuvio"
  if (escolha === "ambos") return "Stremio e no Nuvio"
  return "Stremio"
}

/** Mostra e esconde o que só faz sentido para cada aplicativo. */
function pintarPorApp() {
  for (const el of $$("[data-so-stremio]")) el.hidden = !usaStremio()
  for (const el of $$("[data-so-nuvio]")) el.hidden = !usaNuvio()

  // Onde só o nome muda, o marcador evita duplicar a frase inteira por app.
  const nome = nomeDoApp()
  for (const el of $$("[data-app-nome]")) el.textContent = nome

  const lede = $("#lede-instalar")
  if (lede) {
    lede.textContent = usaStremio()
      ? "Entrar na conta é o caminho curto. Os outros dois não pedem senha nenhuma."
      : "O Nuvio não tem conta central, então a instalação é por link ou por arquivo."
  }

  for (const el of $$("#escolha-app input")) el.checked = el.value === appEscolhido()
}

function montarDebrids() {
  $("#debrids").innerHTML = DEBRIDS.map((d) => `
    <div class="cartao" data-campo="chave:${d.id}" data-ativo="0">
      <div class="cab-cartao">
        ${svg("lightning", "ic-g")}<h3>${escapar(d.nome)}</h3>
        <span class="selo"${d.recomendado ? ' data-tone="rec"' : ""}>${d.recomendado ? "recomendado" : "alternativa"}</span>
        <label class="liga" title="Usar ${escapar(d.nome)}">
          <input type="checkbox" data-ligar><span aria-hidden="true"></span>
        </label>
      </div>
      <div class="corpo"><div>
        <div class="linha">
          <a class="bt bt-s bt-sm" href="${d.planos}" target="_blank" rel="noopener">
            Ver planos ${svg("arrow-square-out")}
          </a>
          <a class="bt bt-s bt-sm" href="${d.chave}" target="_blank" rel="noopener">
            Pegar a chave ${svg("arrow-square-out")}
          </a>
        </div>
        <div class="campo mt-3">
          <div class="par">
            <input type="text" autocomplete="off" spellcheck="false" placeholder="cole a chave do ${escapar(d.nome)}">
            <button class="bt bt-s" data-verificar>Verificar</button>
          </div>
          <p class="msg" data-tone="idle" data-saida>${escapar(d.ondeAchar)}</p>
        </div>
      </div></div>
    </div>`,
  ).join("")

  for (const caixa of $$("#debrids [data-campo]")) {
    $("[data-ligar]", caixa).addEventListener("change", (e) => {
      const chave = caixa.dataset.campo
      estado = { ...estado, [chave]: { valor: "", validado: false, ...estado[chave], ativo: e.target.checked } }
      guardar(estado)
      pintarDebrid(caixa)
      atualizarTorrentio()
      pintarResumoDebrid()
      sincronizarCopiaveis()
    })
  }
}

/** Reflete no cartão se aquele serviço está ligado. */
function pintarDebrid(caixa) {
  const ativo = Boolean(estado[caixa.dataset.campo]?.ativo)
  caixa.setAttribute("data-ativo", ativo ? "1" : "0")
  $("[data-ligar]", caixa).checked = ativo
  $("input[type=text]", caixa).disabled = !ativo
  $("[data-verificar]", caixa).disabled = !ativo
}

/** Libera o passo seguinte só quando existe pelo menos um debrid utilizável. */
function pintarResumoDebrid() {
  const preenchidos = debridsPreenchidos()
  const nomes = DEBRIDS.filter((d) => preenchidos[d.id]).map((d) => d.nome)
  const ligados = DEBRIDS.filter((d) => estado[`chave:${d.id}`]?.ativo)
  const seguir = $('.screen[data-screen="3"] [data-go="4"]')
  const saida = $("#saida-debrid")

  if (nomes.length > 0) {
    dizer(saida, "ok", `O Torrentio e o AIOStreams vão usar ${nomes.join(" e ")}.`)
    seguir.disabled = false
    seguir.title = ""
    return
  }

  seguir.disabled = true
  seguir.title = "Sem debrid, metade dos addons instala e não devolve nada."
  dizer(
    saida,
    "idle",
    ligados.length === 0
      ? "Ligue o serviço que você assina para seguir."
      : `Falta colar a chave do ${ligados.map((d) => d.nome).join(" e ")}.`,
  )
}

function montarFatias() {
  const alvo = $("#fatias")
  alvo.innerHTML = addonsQueExigem("uuid-aiometadata")
    .map((addon, i) => {
      const copy = FATIAS[addon.id] ?? { resumo: "", prateleiras: [] }
      const chips = copy.prateleiras.map((p) => `<span>${escapar(p)}</span>`).join("")
      return `
      <div class="cartao" data-addon="${addon.id}">
        <div class="cab-cartao">
          <span class="ord">${i + 1}</span>
          <h3>${escapar(addon.nome)}</h3>
          <span class="selo">${addon.catalogos} catálogos</span>
        </div>
        <p class="nota">${escapar(copy.resumo)}</p>
        <div class="prateleiras">${chips}</div>

        <ol class="guia">
          <li data-passo="baixar">
            <b>1</b>
            <div class="guia-tx">
              <strong>Baixe o catálogo</strong>
              <small>Já sai com a sua chave do MDBList dentro.</small>
            </div>
            <button class="bt bt-s bt-sm" data-baixar>${svg("download-simple")} Baixar</button>
          </li>
          <li data-passo="abrir">
            <b>2</b>
            <div class="guia-tx">
              <strong>Abra o configurador numa aba nova</strong>
              <small>Importe o arquivo, crie uma senha e salve. Uma aba só para esta fileira.</small>
            </div>
            <a class="bt bt-s bt-sm" data-configurador target="_blank" rel="noopener">
              Abrir ${svg("arrow-square-out")}
            </a>
          </li>
          <li data-passo="valor" data-larga>
            <b>3</b>
            <div class="guia-tx">
              <strong>Cole o identificador desta fileira</strong>
              <div class="par">
                <input type="text" autocomplete="off" spellcheck="false" placeholder="cole o UUID desta configuração">
                <button class="bt bt-s" data-verificar>Verificar</button>
              </div>
              <p class="msg" data-saida data-tone="idle">Cada fileira tem o seu, e nenhum se repete</p>
            </div>
          </li>
        </ol>
      </div>`
    })
    .join("")
}


/**
 * Pinta o progresso dos passos de um cartão guiado.
 *
 * O número sai da posição na lista, não de um mapa fixo: assim um cartão com
 * dois passos numera 1 e 2 sem ninguém precisar lembrar de ajustar aqui.
 *
 * @param {Element} caixa
 */
function pintarGuia(caixa) {
  const salvo = estado[caixa.dataset.addon] ?? {}
  const feito = { baixar: salvo.baixou, abrir: salvo.abriu, ajustar: salvo.ajustou, valor: salvo.validado }

  $$("[data-passo]", caixa).forEach((li, i) => {
    const ok = Boolean(feito[li.dataset.passo])
    li.setAttribute("data-feito", ok ? "1" : "0")
    li.querySelector("b").innerHTML = ok ? svg("circle-check") : String(i + 1)
  })
}

/** Liga os botões de configurador e download aos dados do catálogo. */
function ligarAddons() {
  for (const caixa of $$("[data-addon]")) {
    const addon = ADDONS.find((a) => a.id === caixa.dataset.addon)
    if (!addon) continue

    const link = $("[data-configurador]", caixa)
    if (link && addon.configurador) {
      link.href = addon.configurador
      link.addEventListener("click", () => {
        estado = marcarAbertura(estado, addon.id)
        guardar(estado)
        pintarGuia(caixa)
      })
    }

    // Passos extras marcam o próprio progresso pelo nome que carregam.
    for (const marcador of $$("[data-marca]", caixa)) {
      marcador.addEventListener("click", () => {
        const chave = marcador.getAttribute("data-marca")
        estado = { ...estado, [addon.id]: { valor: "", validado: false, ...estado[addon.id], [chave]: true } }
        guardar(estado)
        pintarGuia(caixa)
      })
    }

    const botao = $("[data-baixar]", caixa)
    if (botao && addon.template) {
      botao.addEventListener("click", async () => {
        const saida = $("[data-saida]", caixa)
        try {
          const r = await fetch(`templates/${addon.template}`)
          if (!r.ok) throw new Error(String(r.status))

          // As chaves entram aqui, no navegador de quem instala. O arquivo que
          // mora no repositório continua sem credencial nenhuma.
          const { arquivo, aplicadas } = injetarChaves(await r.json(), addon, {
            mdblist: estado["chave:mdblist"]?.valor,
            ...debridsPreenchidos(),
          })

          baixar(nomeDoArquivo(addon.template, aplicadas), JSON.stringify(arquivo, null, 2))
          estado = { ...estado, [addon.id]: { valor: "", validado: false, ...estado[addon.id], baixou: true } }
          guardar(estado)
          pintarGuia(caixa)

          const aviso = avisoDoDownload(aplicadas)
          dizer(saida, aviso.tom, aviso.texto)
        } catch {
          dizer(saida, "bad", "Não deu para baixar o arquivo. Recarregue a página e tente de novo.")
        }
      })
    }

    // Avisa quem tenta colar sem ter ido criar a configuração daquela fatia.
    const campo = $("input[type=text]", caixa)
    if (campo && addon.exige === "uuid-aiometadata") {
      const avisarSePulou = () => {
        if (abriuConfigurador(estado, addon.id)) return
        dizer(
          $("[data-saida]", caixa),
          "bad",
          `Você ainda não abriu o configurador desta fileira. Cada uma das cinco precisa ` +
            `de uma configuração própria, criada na aba dela. Se você repetir aqui o UUID ` +
            `de outra fileira, o Stremio junta as duas e mostra uma linha só. Use o passo 2 ` +
            `aqui em cima.`,
        )
      }
      campo.addEventListener("paste", avisarSePulou)
      campo.addEventListener("focus", avisarSePulou)
    }

    pintarGuia(caixa)
  }
}

/** Restaura o que estava guardado nos campos. */
function reidratar() {
  const restaurar = (caixa, chave) => {
    const salvo = estado[chave]
    const campo = $("input[type=text]", caixa)
    if (!campo || !salvo) return

    // Campo vazio nunca é erro. O estado existe assim que a pessoa clica em
    // qualquer botão do cartão, e pintar de vermelho um campo em que ela ainda
    // não digitou nada faz parecer que ela errou algo.
    const valor = salvo.valor ?? ""
    campo.value = valor
    if (!valor) return

    campo.setAttribute("data-state", salvo.validado ? "ok" : "bad")
    const padrao = salvo.validado ? "Verificado." : "Precisa ser verificado de novo."
    dizer($("[data-saida]", caixa), salvo.validado ? "ok" : "bad", salvo.mensagem || padrao)
  }

  for (const caixa of $$("[data-addon]")) restaurar(caixa, caixa.dataset.addon)
  for (const caixa of $$("[data-campo]")) restaurar(caixa, caixa.dataset.campo)
}

function sincronizarCopiaveis() {
  for (const caixa of $$("[data-copiavel]")) {
    const salvo = estado[caixa.dataset.copiavel]
    const valor = salvo?.valor ?? ""
    // Nasce escondida no HTML e nada a mostrava, então a caixa de copiar a
    // chave nunca aparecia. Sem valor ela não tem o que dizer mesmo.
    caixa.hidden = !valor
    if (!valor) continue
    $("[data-valor]", caixa).textContent = mascarar(valor)
    $("[data-copiar]", caixa).disabled = false
  }

  // As chaves de debrid: uma linha por serviço preenchido, nenhuma se não houver.
  const alvo = $("#copiar-debrids")
  if (!alvo) return

  const preenchidos = DEBRIDS.filter((d) => (estado[`chave:${d.id}`]?.valor ?? "").trim())
  alvo.innerHTML = preenchidos
    .map(
      (d) => `
      <div class="caixa" data-copiavel="chave:${d.id}">
        <div class="linha">
          <span class="nota">Sua chave do ${escapar(d.nome)}, caso precise colar à mão:</span>
          <code data-valor></code>
          <button class="bt bt-s bt-sm push" data-copiar>${svg("copy")} Copiar</button>
        </div>
      </div>`,
    )
    .join("")

  for (const caixa of $$("[data-copiavel]", alvo)) {
    const valor = estado[caixa.dataset.copiavel]?.valor ?? ""
    $("[data-valor]", caixa).textContent = mascarar(valor)
  }
}

const mascarar = (v) => (v.length <= 12 ? v : `${v.slice(0, 8)}${"•".repeat(Math.min(12, v.length - 8))}`)

/* -------------------------------------------------------------- verificação */

async function verificarAddon(caixa) {
  const addon = ADDONS.find((a) => a.id === caixa.dataset.addon)
  const campo = $("input[type=text]", caixa)
  const saida = $("[data-saida]", caixa)
  const botao = $("[data-verificar]", caixa)

  // Repetir o UUID entre fileiras é o erro que termina com uma linha no Stremio
  // em vez de cinco. Vale barrar antes de gastar uma ida à rede.
  const conflito = jaUsadoPor(estado, ADDONS, addon.id, campo.value)
  if (conflito) {
    campo.setAttribute("data-state", "bad")
    dizer(
      saida,
      "bad",
      `Esse UUID já está na fileira "${conflito}". Cada fileira precisa da configuração ` +
        `dela: como as cinco compartilham o mesmo identificador interno, repetir o UUID faz ` +
        `o Stremio juntar as duas numa linha só. Abra o configurador de novo e crie uma ` +
        `configuração nova para esta.`,
    )
    return
  }

  botao.disabled = true
  dizer(saida, "wait", "Perguntando ao addon...")

  const resultado = await validar(addon, campo.value, { debrids: debridsPreenchidos() })
  botao.disabled = false

  campo.setAttribute("data-state", resultado.ok ? "ok" : "bad")
  dizer(saida, resultado.ok ? "ok" : "bad", resultado.mensagem ?? "")

  estado = registrar(estado, addon.id, campo.value.trim(), resultado)
  guardar(estado)
  pintarGuia(caixa)
}

async function verificarChave(caixa) {
  const qual = caixa.dataset.campo
  const campo = $("input[type=text]", caixa)
  const saida = $("[data-saida]", caixa)
  const botao = $("[data-verificar]", caixa)
  const valor = campo.value.trim()

  const debrid = DEBRIDS.find((d) => `chave:${d.id}` === qual)

  botao.disabled = true
  if (qual === "chave:mdblist") dizer(saida, "wait", "Perguntando ao MDBList...")

  const afericao = debrid ? aferirDebrid(valor, debrid.nome) : await aferirMdblist(valor)
  botao.disabled = false

  // Formato certo mas impossível de conferir daqui conta como preenchido, e a
  // mensagem diz por que não existe check verde.
  const tom = afericao.ok ? (afericao.verificado ? "ok" : "idle") : "bad"
  campo.setAttribute("data-state", afericao.ok ? "ok" : "bad")
  dizer(saida, tom, afericao.mensagem)

  estado = registrar(estado, qual, valor, { ok: afericao.ok, mensagem: afericao.mensagem })
  guardar(estado)

  // Qualquer debrid preenchido remonta a URL do Torrentio, que aceita mais de um.
  if (debrid) {
    atualizarTorrentio()
    pintarResumoDebrid()
  }

  sincronizarCopiaveis()
}

/** Remonta a URL do Torrentio com todos os debrids preenchidos. */
function atualizarTorrentio() {
  const torrentio = ADDONS.find((a) => a.exige === "debrid")
  const debrids = debridsPreenchidos()

  if (Object.keys(debrids).length === 0) {
    estado = registrar(estado, torrentio.id, "", { ok: false, mensagem: "Falta um serviço de debrid." })
  } else {
    const nomes = DEBRIDS.filter((d) => debrids[d.id]).map((d) => d.nome).join(" e ")
    estado = registrar(estado, torrentio.id, Object.keys(debrids).join(","), {
      ok: true,
      url: montarUrl(torrentio, "", debrids),
      mensagem: `Montado com ${nomes}.`,
    })
  }
  guardar(estado)
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
    } else if (addon.exige === "debrid") {
      selo = salvo?.validado ? "montado para você" : "falta o debrid"
      tom = salvo?.validado ? "auto" : "bad"
    } else {
      selo = salvo?.validado ? "verificado" : "falta verificar"
      tom = salvo?.validado ? "ok" : "bad"
    }

    const detalhe = addon.catalogos
      ? `${PAPEL[addon.papel]}, ${addon.catalogos} prateleiras`
      : PAPEL[addon.papel]

    return `<div class="lista-l">
      <div><strong>${escapar(addon.nome)}</strong><small>${escapar(detalhe)}</small></div>
      <span class="selo" data-tone="${tom}">${escapar(selo)}</span>
    </div>`
  }).join("")

  // Escopo na própria tela: `[data-go="7"]` solto pegaria o tick do topo, que é
  // navegação e nunca deve travar.
  const { pronto, faltam } = conferirPacote(estado, ADDONS)
  const seguir = $('.screen[data-screen="7"] [data-go="8"]')
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
      const resultado = await validar(addon, salvo?.valor ?? "", { debrids: debridsPreenchidos() })
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
    irPara(9)
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
      ? `<a class="bt bt-s bt-sm" href="${escapar(linkInstalar(url))}">Instalar ${svg("arrow-right")}</a>`
      : `<span class="selo" data-tone="bad">falta verificar</span>`

    return `<div class="lista-l">
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
      const resultado = await validar(addon, estado[addon.id]?.valor ?? "", { debrids: debridsPreenchidos() })
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
    if (!salvo?.valor || addon.exige === "debrid") continue
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

  montarTrilho()
  montarPreRequisitos()
  montarEscolhaApp()
  montarDebrids()
  montarFatias()
  pintarIcones()
  ligarAddons()
  reidratar()
  for (const caixa of $$("#debrids [data-campo]")) pintarDebrid(caixa)
  sincronizarCopiaveis()
  pintarResumoDebrid()
  pintarPorApp()

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
        copiar.innerHTML = `${svg("circle-check")} Copiada`
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
  $("#baixar-colecoes-nuvio").addEventListener("click", async () => {
    const saida = $("#saida-colecoes")
    try {
      dizer(saida, "wait", "Baixando...")
      const r = await fetch("templates/nuvio-colecoes.json")
      if (!r.ok) throw new Error(String(r.status))
      const texto = await r.text()
      baixar("nuvio-colecoes.json", texto)
      const quantas = JSON.parse(texto).length
      dizer(saida, "ok", `Baixado, com ${quantas} coleções. Importe em Coleções, dentro do Nuvio.`)
    } catch {
      dizer(saida, "bad", "Não deu para baixar o arquivo. Recarregue a página e tente de novo.")
    }
  })
  $("#baixar-uuids").addEventListener("click", baixarUuids)
  $("#recomecar").addEventListener("click", () => {
    estado = limpar()
    location.reload()
  })

  irPara(0)
}

iniciar()
