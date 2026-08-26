/**
 * Transformações puras que tiram os dados pessoais dos exports.
 *
 * Nenhuma função aqui lê ou escreve arquivo. Isso é de propósito: dá para testar
 * cada uma com um objeto na mão, e o CLI em `scripts/sanitize.mjs` é o único
 * lugar que toca o disco.
 */

/** Caminhos que guardam credencial num export do AIOMetadata. */
export const SEGREDOS_AIOMETADATA = ["config.apiKeys.*"]

/** Caminhos que guardam credencial num export do AIOStreams. */
export const SEGREDOS_AIOSTREAMS = [
  "services.*.credentials.*",
  "rpdbApiKey",
  "openposterdbApiKey",
  "tmdbApiKey",
  "tmdbAccessToken",
  "uuid",
]

/**
 * Valores que batem num padrão de credencial mas não são segredo do dono.
 * `simkl` e `trakt` são os client ids públicos da instância do ElfHosted, e
 * `t0-free-rpdb` é o token gratuito e público do RatingPosterDB.
 */
export const PERMITIDOS = new Set(["t0-free-rpdb"])

/** Campos por configuração que não fazem sentido viajar para outra conta. */
const EFEMEROS_AIOMETADATA = ["sessionId", "configHash", "lastModified", "configVersion"]

/**
 * Limpa um export do AIOMetadata.
 *
 * Remove o bloco `apiKeys` inteiro em vez de escolher campo a campo. É mais
 * bruto e é a escolha certa: se uma versão futura do addon guardar uma chave
 * nova ali dentro, ela já sai limpa sem ninguém precisar lembrar de atualizar
 * esta lista. O que se perde são só metadados da instância, que o AIOMetadata
 * repõe sozinho no momento do import.
 *
 * @param {object} origem export cru, com as chaves do dono
 * @returns {object} cópia sem credencial
 */
export function limparAioMetadata(origem) {
  const saida = estruturaClonada(origem)

  delete saida.config?.apiKeys
  for (const campo of EFEMEROS_AIOMETADATA) delete saida.config?.[campo]

  saida.metadata = { ...saida.metadata, apiKeysExcluded: true }
  return saida
}

/**
 * Limpa um export do AIOStreams.
 *
 * Aqui a remoção é cirúrgica porque a configuração é quase toda preferência de
 * filtro e ordenação, que é justamente o que se quer compartilhar. Some o
 * `uuid`, que identifica a conta do dono, e as credenciais de cada serviço de
 * debrid. O `enabled` de cada serviço é preservado para o visitante ver quais
 * precisa preencher.
 *
 * @param {object} origem export cru
 * @returns {object} cópia sem credencial e sem identificador de conta
 */
export function limparAioStreams(origem) {
  const saida = estruturaClonada(origem)

  delete saida.uuid
  delete saida.tmdbApiKey
  delete saida.tmdbAccessToken
  delete saida.rpdbApiKey
  delete saida.openposterdbApiKey

  for (const servico of saida.services ?? []) servico.credentials = {}

  return saida
}

/**
 * Lista os serviços de debrid que o visitante vai precisar preencher.
 *
 * @param {object} origem export cru do AIOStreams
 * @returns {string[]} ids dos serviços ligados
 */
export function servicosLigados(origem) {
  return (origem.services ?? []).filter((s) => s.enabled).map((s) => s.id)
}

function estruturaClonada(valor) {
  return JSON.parse(JSON.stringify(valor))
}

/**
 * Trechos do arquivo de coleções do Nuvio que casam com padrão de credencial
 * sem serem uma.
 *
 * Os hexadecimais longos ali são pedaço de caminho de GIF do Tumblr e de imagem
 * do GitHub, e os UUIDs são identificadores de pasta que o próprio aplicativo
 * gera. Apagar esses contextos antes da busca é diferente de liberar o arquivo:
 * uma chave escrita em qualquer outro campo continua sendo encontrada.
 */
export const RUIDO_NUVIO = [
  /"https?:\/\/[^"]+"/g,
  /"id"\s*:\s*"[^"]*"/g,
]
