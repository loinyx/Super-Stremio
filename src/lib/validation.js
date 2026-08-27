// @ts-check
/**
 * Valida o que o visitante colou, batendo no manifesto do addon de verdade.
 *
 * Sem isto o fluxo termina com onze addons instalados e nenhum funcionando, e a
 * pessoa não tem como saber se errou um caractere ou se o site mentiu. Por isso
 * cada mensagem daqui diz o que aconteceu e o que fazer, nunca "algo deu errado".
 */

import { montarUrl } from "./catalog.js"

/**
 * @typedef {object} Resultado
 * @property {boolean} ok
 * @property {string} [mensagem]  o que dizer para a pessoa
 * @property {string} [url]       URL final montada
 * @property {object} [manifest]  manifesto que o addon devolveu
 */

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Confere o formato antes de gastar uma ida à rede.
 *
 * @param {import("./catalog.js").Addon} addon
 * @param {string} valor
 * @returns {string | null} mensagem de erro, ou null quando o formato serve
 */
export function conferirFormato(addon, valor) {
  const limpo = valor.trim()
  if (!limpo) return "Cole o valor antes de verificar."

  if (addon.exige === "uuid-aiometadata") {
    if (UUID.test(limpo)) return null
    const grupos = limpo.split("-").length
    if (grupos < 5) {
      return `Esse UUID está cortado. Ele tem 36 caracteres em cinco grupos, e você colou ${limpo.length}.`
    }
    return "Esse valor não parece um UUID. Copie o identificador que apareceu depois de salvar."
  }

  if (addon.exige === "url-completa") {
    let url
    try {
      url = new URL(limpo)
    } catch {
      return "Isso não é um endereço válido. Cole a URL inteira, começando com https."
    }
    if (url.protocol !== "https:") return "O endereço precisa começar com https."
    if (!url.pathname.endsWith("/manifest.json")) {
      return "Cole o endereço que termina em /manifest.json, não o da página de configuração."
    }
    return null
  }

  return null
}

/**
 * Bate no manifesto e confere se o addon responde e é o esperado.
 *
 * @param {import("./catalog.js").Addon} addon
 * @param {string} [valor]
 * @param {object} [opcoes]
 * @param {typeof fetch} [opcoes.buscar] injetável para teste
 * @param {number} [opcoes.limiteMs]
 * @param {Record<string,string>} [opcoes.debrids] chaves de debrid, para o Torrentio
 * @returns {Promise<Resultado>}
 */
export async function validar(addon, valor = "", { buscar = fetch, limiteMs = 12000, debrids = {} } = {}) {
  if (addon.exige !== "nada" && addon.exige !== "debrid") {
    const problema = conferirFormato(addon, valor)
    if (problema) return { ok: false, mensagem: problema }
  }

  let url
  try {
    url = montarUrl(addon, valor, debrids)
  } catch (e) {
    return { ok: false, mensagem: e instanceof Error ? e.message : String(e) }
  }

  const corte = AbortSignal.timeout ? AbortSignal.timeout(limiteMs) : undefined

  let resposta
  try {
    resposta = await buscar(url, { signal: corte })
  } catch (e) {
    const abortou = e instanceof Error && (e.name === "TimeoutError" || e.name === "AbortError")
    return {
      ok: false,
      mensagem: abortou
        ? "O addon não respondeu a tempo. Pode ser instabilidade do servidor dele, tente de novo."
        : "Não deu para alcançar esse endereço. Confira o valor colado e a sua conexão.",
    }
  }

  if (resposta.status === 404) {
    return { ok: false, mensagem: "Esse endereço não existe. Confira se copiou o valor certo." }
  }
  if (!resposta.ok) {
    return { ok: false, mensagem: `O addon respondeu ${resposta.status}. Tente de novo em instantes.` }
  }

  let manifest
  try {
    manifest = await resposta.json()
  } catch {
    return { ok: false, mensagem: "O endereço respondeu, mas não com um manifesto de addon." }
  }

  if (!manifest?.id) {
    return { ok: false, mensagem: "O manifesto veio sem identificação. Esse endereço não é de um addon." }
  }

  const quantos = manifest.catalogs?.length ?? 0
  if (addon.catalogos && quantos === 0) {
    return {
      ok: false,
      mensagem: "Esse addon respondeu sem catálogo nenhum. Confira se você salvou a configuração antes de copiar o UUID.",
    }
  }

  return { ok: true, url, manifest, mensagem: resumir(addon, manifest, quantos) }
}

/**
 * @param {import("./catalog.js").Addon} addon
 * @param {import("./stremio.js").Manifesto} manifest
 * @param {number} quantos
 * @returns {string}
 */
function resumir(addon, manifest, quantos) {
  if (!addon.catalogos) return `Respondeu como ${manifest.name || addon.nome}.`

  if (quantos === addon.catalogos) return `Respondeu com ${quantos} catálogos. Bate com o esperado.`
  return (
    `Respondeu com ${quantos} catálogos, e o esperado eram ${addon.catalogos}. ` +
    `Funciona assim mesmo, mas confira se o import terminou.`
  )
}

/**
 * Monta o descritor que vai para a coleção do Stremio.
 *
 * @param {Resultado} resultado resultado de `validar`, já com ok true
 * @param {import("./catalog.js").Addon} addon
 * @returns {import("./stremio.js").Descritor}
 */
export function descritor(resultado, addon) {
  if (!resultado.ok || !resultado.manifest || !resultado.url) {
    throw new Error(`${addon.nome} ainda não foi validado`)
  }
  return {
    manifest: resultado.manifest,
    transportUrl: resultado.url,
    flags: addon.protegido ? { official: true, protected: true } : { official: false, protected: false },
  }
}
