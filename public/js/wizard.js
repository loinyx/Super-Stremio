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
      valor,
      validado: resultado.ok,
      url: resultado.url,
      mensagem: resultado.mensagem,
    },
  }
}
