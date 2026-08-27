// @ts-check
/**
 * Estado do wizard.
 *
 * Guarda o que a pessoa já preencheu e o que já foi validado, e persiste no
 * navegador para dar para fechar a aba e voltar depois. Uma coisa nunca entra
 * aqui: a senha do Stremio. Ela existe só na variável local do handler que faz
 * o login, e some quando aquele handler termina.
 */

const CHAVE = "super-stremio:v1"

/**
 * @typedef {object} Preenchido
 * @property {string} valor      o que a pessoa colou
 * @property {boolean} validado
 * @property {string} [url]      URL montada, quando validado
 * @property {string} [mensagem]
 * @property {boolean} [ativo]    serviço de debrid ligado
 * @property {boolean} [abriu]    abriu o configurador ou criou a conta
 * @property {boolean} [ajustou]  fez o ajuste externo daquele passo
 * @property {boolean} [baixou]   baixou o arquivo daquele passo
 * @property {object} [manifest]  manifesto que o addon devolveu na verificação
 */

/** @typedef {Record<string, Preenchido>} Estado */

/**
 * Lê o estado guardado. Nunca levanta: navegador em aba privada, storage cheio
 * ou JSON corrompido caem todos no estado vazio, que é sempre utilizável.
 *
 * @returns {Estado}
 */
export function carregar() {
  try {
    const cru = localStorage.getItem(CHAVE)
    if (!cru) return {}
    const dados = JSON.parse(cru)
    return dados && typeof dados === "object" ? dados : {}
  } catch {
    return {}
  }
}

/**
 * Guarda o estado. Falha em silêncio porque não poder persistir é um
 * inconveniente, não um motivo para interromper a instalação.
 *
 * @param {Estado} estado
 */
export function guardar(estado) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(estado))
  } catch {
    /* aba privada ou storage cheio: seguir sem persistir */
  }
}

/** Apaga tudo que foi guardado. @returns {Estado} */
export function limpar() {
  try {
    localStorage.removeItem(CHAVE)
  } catch {
    /* idem */
  }
  return {}
}

/**
 * Diz se o pacote inteiro está pronto para instalar.
 *
 * @param {Estado} estado
 * @param {import("./catalog.js").Addon[]} addons
 * @returns {{pronto: boolean, faltam: string[]}}
 */
export function conferirPacote(estado, addons) {
  const faltam = addons
    .filter((a) => a.exige !== "nada" && !estado[a.id]?.validado)
    .map((a) => a.nome)
  return { pronto: faltam.length === 0, faltam }
}

/**
 * Guarda o resultado de uma validação.
 *
 * @param {Estado} estado
 * @param {string} id
 * @param {string} valor
 * @param {import("./validation.js").Resultado} resultado
 * @returns {Estado} novo estado, o de entrada não é modificado
 */
export function registrar(estado, id, valor, resultado) {
  return {
    ...estado,
    [id]: {
      // preserva o que já foi feito nesta fatia, como o download e a abertura
      ...estado[id],
      valor,
      validado: resultado.ok,
      url: resultado.url,
      mensagem: resultado.mensagem,
      // O manifesto vem junto porque a instalação precisa dele inteiro: o
      // Stremio guarda o que a gente manda, e um manifesto mínimo instala um
      // addon que não devolve nada.
      manifest: resultado.manifest ?? estado[id]?.manifest,
    },
  }
}

/**
 * Marca que a pessoa abriu o configurador de um addon.
 *
 * Serve para o site saber quando ela está prestes a colar um valor sem ter ido
 * criar a configuração. É o erro mais comum das cinco fatias do AIOMetadata:
 * abrir o configurador uma vez só e repetir o mesmo UUID nos cinco campos.
 *
 * @param {Estado} estado
 * @param {string} id
 * @returns {Estado}
 */
export function marcarAbertura(estado, id) {
  return marcarPasso(estado, id, "abriu")
}

/**
 * Marca um passo qualquer do cartão como feito, pelo nome que ele carrega.
 *
 * @param {Estado} estado
 * @param {string} id
 * @param {"abriu" | "ajustou" | "baixou"} passo
 * @returns {Estado}
 */
export function marcarPasso(estado, id, passo) {
  const anterior = estado[id] ?? { valor: "", validado: false }
  return { ...estado, [id]: { ...anterior, [passo]: true } }
}

/** @param {Estado} estado @param {string} id @returns {boolean} */
export const abriuConfigurador = (estado, id) => Boolean(estado[id]?.abriu)

/**
 * Diz qual outro addon já está usando o mesmo valor.
 *
 * Duas fatias com o mesmo UUID não são um aviso cosmético: como o AIOMetadata
 * devolve o mesmo `manifest.id` em todas, o Stremio trata as duas como o mesmo
 * addon e a pessoa termina com uma fileira em vez de duas.
 *
 * @param {Estado} estado
 * @param {import("./catalog.js").Addon[]} addons
 * @param {string} id addon que está sendo preenchido agora
 * @param {string} valor
 * @returns {string | null} nome do outro addon, ou null
 */
export function jaUsadoPor(estado, addons, id, valor) {
  const limpo = (valor ?? "").trim().toLowerCase()
  if (!limpo) return null

  const outro = addons.find(
    (a) => a.id !== id && (estado[a.id]?.valor ?? "").trim().toLowerCase() === limpo,
  )
  return outro ? outro.nome : null
}
