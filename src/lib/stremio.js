// @ts-check
/**
 * Cliente da API do Stremio e a regra de merge da coleção.
 *
 * O `api.strem.io` responde com `Access-Control-Allow-Origin: *`, então tudo
 * aqui roda direto do navegador de quem visita. Não existe servidor no meio, e
 * é por isso que a senha nunca passa por lugar nenhum além do próprio Stremio.
 */

const BASE = "https://api.strem.io/api"

/**
 * @typedef {object} Manifesto
 * @property {string} [id]
 * @property {string} [name]
 * @property {unknown[]} [catalogs]
 *
 * @typedef {object} Descritor
 * @property {Manifesto} manifest
 * @property {string} transportUrl
 * @property {{official?: boolean, protected?: boolean}} [flags]
 */

/** Erro vindo da própria API do Stremio, com o código que ela devolve. */
export class ErroStremio extends Error {
  /** @param {string} mensagem @param {number} [codigo] */
  constructor(mensagem, codigo) {
    super(mensagem)
    this.name = "ErroStremio"
    this.codigo = codigo
  }
}

/**
 * Chama um método da API e devolve `result`, ou levanta `ErroStremio`.
 *
 * @param {string} metodo
 * @param {object} corpo
 * @param {typeof fetch} [buscar] injetável para teste
 * @returns {Promise<any>}
 */
async function chamar(metodo, corpo, buscar = fetch) {
  let resposta
  try {
    resposta = await buscar(`${BASE}/${metodo}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(corpo),
    })
  } catch {
    throw new ErroStremio("Não deu para falar com o Stremio. Verifique a conexão.")
  }

  if (!resposta.ok) {
    throw new ErroStremio(`O Stremio respondeu ${resposta.status}. Tente de novo em instantes.`)
  }

  const dados = await resposta.json()
  if (dados.error) throw new ErroStremio(traduzir(dados.error), dados.error.code)
  return dados.result
}

/**
 * Transforma o erro da API em algo que a pessoa entenda e possa agir.
 * @param {{code?: number, message?: string, wrongEmail?: boolean}} erro
 * @returns {string}
 */
function traduzir(erro) {
  if (erro.wrongEmail) return "Esse e-mail não tem conta no Stremio."
  if (erro.code === 1) return "Sua sessão expirou. Entre de novo."
  if (erro.code === 2) return "E-mail ou senha não conferem."
  if (erro.code === 3) return "Senha incorreta."
  return erro.message || "O Stremio recusou a operação e não disse por quê."
}

/**
 * Entra na conta e devolve a chave de sessão.
 *
 * @param {string} email
 * @param {string} senha
 * @param {typeof fetch} [buscar]
 * @returns {Promise<string>} authKey
 */
export async function entrar(email, senha, buscar) {
  const r = await chamar("login", { type: "Login", email, password: senha }, buscar)
  if (!r?.authKey) throw new ErroStremio("O Stremio aceitou o login mas não devolveu a sessão.")
  return r.authKey
}

/**
 * Lê a coleção de addons da conta.
 *
 * @param {string} authKey
 * @param {typeof fetch} [buscar]
 * @returns {Promise<Descritor[]>}
 */
export async function lerColecao(authKey, buscar) {
  const r = await chamar("addonCollectionGet", { type: "AddonCollectionGet", authKey, update: true }, buscar)
  return r?.addons ?? []
}

/**
 * Grava a coleção na conta.
 *
 * @param {string} authKey
 * @param {Descritor[]} addons
 * @param {typeof fetch} [buscar]
 * @returns {Promise<void>}
 */
export async function gravarColecao(authKey, addons, buscar) {
  await chamar("addonCollectionSet", { type: "AddonCollectionSet", authKey, addons }, buscar)
}

/**
 * Junta o pacote com o que a pessoa já tem.
 *
 * A chave de identidade é a `transportUrl`, não o `manifest.id`. Isso não é
 * detalhe: o AIOMetadata devolve o mesmo `manifest.id` para toda configuração,
 * e é a URL que diz qual delas é qual. Deduplicar por id colapsa as cinco
 * prateleiras numa só e a pessoa termina a instalação com uma linha na tela
 * inicial em vez de cinco.
 *
 * Duas garantias, cada uma por um motivo concreto:
 *
 * 1. Todo addon protegido que a pessoa já tinha continua na coleção. A coleção
 *    padrão do Stremio traz o addon de arquivos locais, em `127.0.0.1:11470`,
 *    e o pacote não inclui ele. Gravar por cima tiraria a reprodução de vídeo
 *    do próprio computador.
 * 2. Quando o pacote traz um addon cujo id já existe protegido na conta, o que
 *    está na conta vence. Não vale reescrever um addon que o Stremio protege.
 *
 * @param {Descritor[]} atual coleção que já está na conta
 * @param {Descritor[]} pacote addons deste site, na ordem desejada
 * @returns {Descritor[]}
 */
export function mesclar(atual, pacote) {
  const protegidos = atual.filter((a) => a.flags?.protected)
  /** @type {Map<string, Descritor>} */
  const protegidoPorId = new Map()
  for (const a of protegidos) {
    if (a.manifest?.id) protegidoPorId.set(a.manifest.id, a)
  }

  const resultado = []
  const urlsVistas = new Set()

  for (const addon of pacote) {
    const id = addon.manifest?.id
    const escolhido = (id && protegidoPorId.get(id)) || addon
    const url = escolhido.transportUrl
    if (!url || urlsVistas.has(url)) continue
    urlsVistas.add(url)
    resultado.push(escolhido)
  }

  for (const addon of protegidos) {
    const url = addon.transportUrl
    if (url && !urlsVistas.has(url)) {
      urlsVistas.add(url)
      resultado.push(addon)
    }
  }

  return resultado
}

/**
 * Serializa a coleção atual para a pessoa guardar antes de instalar.
 * O formato é o mesmo que o stremio-addon-manager exporta, então serve para
 * restaurar por lá também.
 *
 * @param {Descritor[]} addons
 * @returns {string}
 */
export const backupJson = (addons) => JSON.stringify({ addons }, null, 2)
