/**
 * Varredura de segredos.
 *
 * Duas camadas, de propósito. A primeira sabe exatamente quais strings eram
 * secretas nos arquivos de origem e falha se qualquer uma reaparecer. A segunda
 * não sabe de nada e só procura coisas com cara de credencial, para pegar campo
 * novo que apareça numa versão futura do addon e que a primeira camada
 * desconheça.
 */

/** Formatos conhecidos de credencial. */
export const PADROES = [
  { nome: "chave do Google", re: /AIza[0-9A-Za-z_-]{35}/g },
  { nome: "chave do OpenRouter", re: /sk-or-v1-[0-9a-f]{64}/g },
  { nome: "chave estilo sk-", re: /\bsk-[A-Za-z0-9_-]{20,}/g },
  { nome: "token JWT", re: /eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}/g },
  { nome: "UUID", re: /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi },
  { nome: "hexadecimal longo", re: /\b[0-9a-f]{32,}\b/gi },
]

/**
 * Coleta os valores secretos de um objeto, seguindo uma lista de caminhos.
 * Cada caminho aceita `*` como curinga de índice de array.
 *
 * @param {unknown} raiz objeto de origem
 * @param {string[]} caminhos ex.: ["config.apiKeys.*", "services.*.credentials.*"]
 * @returns {Set<string>} valores encontrados, só strings com 8 caracteres ou mais
 */
export function coletarSegredos(raiz, caminhos) {
  const achados = new Set()

  const desce = (no, partes) => {
    if (no == null) return
    if (partes.length === 0) {
      if (typeof no === "string" && no.length >= 8) achados.add(no)
      return
    }
    const [cabeca, ...resto] = partes
    if (cabeca === "*") {
      const filhos = Array.isArray(no) ? no : Object.values(no)
      for (const filho of filhos) desce(filho, resto)
      return
    }
    if (typeof no === "object") desce(no[cabeca], resto)
  }

  for (const caminho of caminhos) desce(raiz, caminho.split("."))
  return achados
}

/**
 * Procura vazamentos num texto.
 *
 * @param {string} texto conteúdo já serializado do arquivo de saída
 * @param {object} opcoes
 * @param {Set<string>} [opcoes.segredos] valores que vieram da origem e não podem reaparecer
 * @param {Set<string>} [opcoes.permitidos] valores que passam mesmo batendo num padrão
 * @returns {{tipo: string, valor: string}[]} lista vazia quando está limpo
 */
export function procurarVazamentos(texto, { segredos = new Set(), permitidos = new Set() } = {}) {
  const vazamentos = []

  for (const segredo of segredos) {
    if (permitidos.has(segredo)) continue
    if (texto.includes(segredo)) {
      vazamentos.push({ tipo: "segredo da origem", valor: segredo })
    }
  }

  for (const { nome, re } of PADROES) {
    for (const achado of texto.matchAll(re)) {
      const valor = achado[0]
      if (permitidos.has(valor)) continue
      if (vazamentos.some((v) => v.valor === valor)) continue
      vazamentos.push({ tipo: nome, valor })
    }
  }

  return vazamentos
}
