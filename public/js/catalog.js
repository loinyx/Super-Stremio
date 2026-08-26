// @ts-check
/**
 * Os onze addons, e o que cada um exige de quem instala.
 *
 * Esta é a fonte única da verdade do pacote. Mudar o setup no futuro é editar
 * este arquivo, não mexer em tela. Nenhum valor aqui é segredo: onde ia uma
 * credencial, vai um marcador entre chaves que o wizard substitui.
 */

/**
 * @typedef {"nada" | "debrid" | "uuid-aiometadata" | "url-completa"} Exigencia
 * @typedef {"catalogo" | "streams" | "legendas"} Papel
 *
 * @typedef {object} Addon
 * @property {string} id           id do manifesto, usado para deduplicar na coleção
 * @property {string} nome         como aparece no Stremio
 * @property {Papel} papel
 * @property {Exigencia} exige
 * @property {string} [url]        URL final, quando não depende de nada
 * @property {string} [molde]      URL com marcador, quando depende de um valor
 * @property {string} [template]   arquivo em /templates para o visitante importar
 * @property {string} [configurador] onde o visitante cria a config dele
 * @property {number} [catalogos]  quantos catálogos o manifesto deve devolver
 * @property {boolean} [protegido] o Stremio não deixa remover
 */

/** Config do opensubtitles PRO, que viaja em base64 na própria URL. */
const OPENSUBTITLES = {
  langs: ["portuguese-br", "english"],
  source: "all",
  aiTranslated: true,
  autoAdjustment: true,
}

/**
 * Codifica um objeto em base64url, que é como o opensubtitles PRO lê a config.
 * @param {object} config
 * @returns {string}
 */
export function base64url(config) {
  const bytes = new TextEncoder().encode(JSON.stringify(config))
  let binario = ""
  for (const b of bytes) binario += String.fromCharCode(b)
  return btoa(binario).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

const TORRENTIO_FILTROS = [
  "providers=yts,eztv,rarbg,1337x,thepiratebay,kickasstorrents,torrentgalaxy," +
    "magnetdl,horriblesubs,nyaasi,tokyotosho,anidex,nekobt,comando,bludv,micoleaodublado,ext",
  "language=portuguese",
  "qualityfilter=scr,cam",
  "debridoptions=nocatalog",
]

/**
 * Serviços de debrid aceitos. Quem instala pode usar um, o outro, ou os dois.
 *
 * @typedef {object} Debrid
 * @property {string} id
 * @property {string} nome
 * @property {string} parametro  como o Torrentio chama esse serviço na URL
 * @property {string} planos     onde assinar
 * @property {string} chave      onde pegar a chave depois de assinar
 * @property {string} ondeAchar  instrução curta de onde a chave fica
 * @property {boolean} [recomendado] qual sugerir para quem ainda não tem nenhum
 */

/** @type {Debrid[]} */
export const DEBRIDS = [
  {
    id: "torbox",
    nome: "TorBox",
    parametro: "torbox",
    planos: "https://torbox.app/",
    chave: "https://torbox.app/settings",
    ondeAchar: "Settings, seção API.",
    recomendado: true,
  },
  {
    id: "realdebrid",
    nome: "Real-Debrid",
    parametro: "realdebrid",
    planos: "https://real-debrid.com/",
    chave: "https://real-debrid.com/apitoken",
    ondeAchar: "A página do token mostra a chave direto.",
  },
]

/**
 * Monta a URL do Torrentio com os serviços que a pessoa tem.
 *
 * O Torrentio aceita mais de um debrid na mesma URL e se renomeia conforme o
 * que recebe: com os dois, ele se chama "Torrentio RD/TB".
 *
 * @param {Record<string, string>} debrids ex.: { torbox: "...", realdebrid: "..." }
 * @returns {string}
 * @throws {Error} quando nenhum serviço foi preenchido
 */
export function montarTorrentio(debrids = {}) {
  const partes = [...TORRENTIO_FILTROS]

  for (const d of DEBRIDS) {
    const chave = (debrids[d.id] ?? "").trim()
    if (chave) partes.push(`${d.parametro}=${encodeURIComponent(chave)}`)
  }

  if (partes.length === TORRENTIO_FILTROS.length) {
    throw new Error("O Torrentio precisa de pelo menos um serviço de debrid")
  }
  return `https://torrentio.strem.fun/${partes.join("%7C")}/manifest.json`
}

// O fragmento #general pula a tela de boas-vindas do AIOMetadata e cai direto
// na configuração. Sem ele a pessoa precisa achar um botão Skip discreto.
const CONFIGURADOR_METADATA = "https://aiometadata.elfhosted.com/configure/#general"

/** @type {Addon[]} */
export const ADDONS = [
  {
    id: "aio-metadata:em-alta",
    nome: "Em Alta",
    papel: "catalogo",
    exige: "uuid-aiometadata",
    molde: "https://aiometadata.elfhosted.com/stremio/{UUID}/manifest.json",
    template: "catalogos-em-alta.json",
    configurador: CONFIGURADOR_METADATA,
    catalogos: 48,
  },
  {
    id: "aio-metadata:generos",
    nome: "Gêneros",
    papel: "catalogo",
    exige: "uuid-aiometadata",
    molde: "https://aiometadata.elfhosted.com/stremio/{UUID}/manifest.json",
    template: "catalogos-generos.json",
    configurador: CONFIGURADOR_METADATA,
    catalogos: 45,
  },
  {
    id: "aio-metadata:pijama",
    nome: "Pijama",
    papel: "catalogo",
    exige: "uuid-aiometadata",
    molde: "https://aiometadata.elfhosted.com/stremio/{UUID}/manifest.json",
    template: "catalogos-pijama.json",
    configurador: CONFIGURADOR_METADATA,
    catalogos: 19,
  },
  {
    id: "aio-metadata:anime",
    nome: "Anime",
    papel: "catalogo",
    exige: "uuid-aiometadata",
    molde: "https://aiometadata.elfhosted.com/stremio/{UUID}/manifest.json",
    template: "catalogos-anime.json",
    configurador: CONFIGURADOR_METADATA,
    catalogos: 20,
  },
  {
    id: "aio-metadata:curadoria",
    nome: "Curadoria",
    papel: "catalogo",
    exige: "uuid-aiometadata",
    molde: "https://aiometadata.elfhosted.com/stremio/{UUID}/manifest.json",
    template: "catalogos-curadoria.json",
    configurador: CONFIGURADOR_METADATA,
    catalogos: 18,
  },
  {
    id: "com.aiostreams.viren070",
    nome: "AIOStreams",
    papel: "streams",
    exige: "url-completa",
    template: "aiostreams.json",
    configurador: "https://aiostreams.elfhosted.com/stremio/configure",
  },
  {
    id: "com.stremio.torrentio.addon",
    nome: "Torrentio",
    papel: "streams",
    exige: "debrid",
  },
  {
    id: "com.stremio.brazuca.addon",
    nome: "Brazuca Torrents",
    papel: "streams",
    exige: "nada",
    url: "https://94c8cb9f702d-brazuca-torrents.baby-beamup.club/manifest.json",
  },
  {
    id: "community.opensubtitlesv3.pro",
    nome: "opensubtitles PRO",
    papel: "legendas",
    exige: "nada",
    url: `https://opensubtitlesv3-pro.dexter21767.com/${base64url(OPENSUBTITLES)}/manifest.json`,
  },
  {
    id: "com.community.stremio-subtitles",
    nome: "Stremio Community Subtitles",
    papel: "legendas",
    exige: "url-completa",
    configurador: "https://stremio-community-subtitles.top/",
  },
  {
    id: "com.linvo.cinemeta",
    nome: "Cinemeta",
    papel: "catalogo",
    exige: "nada",
    url: "https://v3-cinemeta.strem.io/manifest.json",
    protegido: true,
  },
]

/**
 * Monta a URL final de um addon a partir do que o visitante preencheu.
 *
 * @param {Addon} addon
 * @param {string} [valor] uuid ou URL, conforme `addon.exige`
 * @param {Record<string,string>} [debrids] chaves de debrid, para o Torrentio
 * @returns {string}
 * @throws {Error} quando falta o valor que aquele addon exige
 */
export function montarUrl(addon, valor, debrids = {}) {
  if (addon.exige === "nada") {
    if (!addon.url) throw new Error(`${addon.nome} não tem URL fixa`)
    return addon.url
  }

  if (addon.exige === "debrid") return montarTorrentio(debrids)

  const limpo = (valor ?? "").trim()
  if (!limpo) throw new Error(`${addon.nome} precisa de um valor`)

  if (addon.exige === "url-completa") return limpo
  if (!addon.molde) throw new Error(`${addon.nome} não tem molde de URL`)

  return addon.molde.replace("{UUID}", encodeURIComponent(limpo))
}

/** @param {Exigencia} exigencia @returns {Addon[]} */
export const addonsQueExigem = (exigencia) => ADDONS.filter((a) => a.exige === exigencia)

/**
 * Converte a URL do manifesto no link que o próprio Stremio abre.
 *
 * É a saída para quem não quer digitar senha em site nenhum: clicar em
 * `stremio://` faz o aplicativo instalado assumir e perguntar se instala.
 * Nenhuma credencial entra na conversa.
 *
 * @param {string} url URL https do manifesto
 * @returns {string}
 */
export function linkInstalar(url) {
  return url.replace(/^https?:\/\//, "stremio://")
}
