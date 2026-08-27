// @ts-check
/**
 * Coloca as chaves de quem instala dentro do arquivo, na hora do download.
 *
 * O template que mora no repositório não tem credencial nenhuma e continua
 * assim. O que acontece aqui é outra coisa: no navegador da pessoa, no momento
 * em que ela clica para baixar, a chave que ela mesma digitou entra no arquivo.
 * Assim ela importa a configuração já pronta, em vez de importar e depois ter
 * que achar o campo certo dentro de um configurador cheio de opções.
 *
 * O arquivo resultante passa a conter uma credencial. Quem chama esta função é
 * responsável por avisar isso na tela.
 */

/**
 * @typedef {object} Chaves
 * @property {string} [mdblist]
 * @property {string} [torbox]
 * @property {string} [realdebrid]
 */

/** Nome de exibição de cada serviço, para o aviso do download. */
/** @type {Record<string, string>} */
const NOMES = { torbox: "TorBox", realdebrid: "Real-Debrid" }

/**
 * Devolve uma cópia do template com as chaves aplicadas.
 *
 * Não modifica a entrada, e ignora em silêncio a chave que não veio: baixar a
 * configuração sem ter preenchido tudo continua valendo, só dá mais trabalho
 * depois.
 *
 * @param {any} template conteúdo do arquivo em /templates, cuja forma é
 *   decidida pelo servidor de cada addon e não por nós
 * @param {import("./catalog.js").Addon} addon
 * @param {Record<string, string | undefined>} chaves
 * @returns {{arquivo: any, aplicadas: string[]}}
 */
export function injetarChaves(template, addon, chaves = {}) {
  const arquivo = structuredClone(template)
  const aplicadas = []

  if (addon.exige === "uuid-aiometadata") {
    const mdblist = (chaves.mdblist ?? "").trim()
    if (mdblist) {
      arquivo.config = arquivo.config ?? {}
      arquivo.config.apiKeys = { ...(arquivo.config.apiKeys ?? {}), mdblist }
      // O AIOMetadata usa esta marca para saber se o arquivo traz chave.
      arquivo.metadata = { ...(arquivo.metadata ?? {}), apiKeysExcluded: false }
      aplicadas.push("MDBList")
    }
  }

  if (addon.id === "com.aiostreams.viren070") {
    for (const servico of arquivo.services ?? []) {
      const chave = (chaves[servico.id] ?? "").trim()

      if (chave) {
        servico.credentials = { apiKey: chave }
        servico.enabled = true
        aplicadas.push(NOMES[servico.id] ?? servico.id)
      } else if (servico.enabled) {
        // Serviço ligado sem credencial faz o AIOStreams tentar usar e falhar
        // em silêncio, então quem não foi preenchido sai desligado.
        servico.enabled = false
      }
    }
  }

  return { arquivo, aplicadas }
}

/**
 * Nome do arquivo baixado. Quando leva chave, o nome diz, para a pessoa pensar
 * duas vezes antes de mandar para alguém.
 *
 * @param {string} base nome do template, ex. "catalogos-em-alta.json"
 * @param {string[]} aplicadas
 * @returns {string}
 */
export function nomeDoArquivo(base, aplicadas) {
  if (aplicadas.length === 0) return base
  return base.replace(/\.json$/, "-com-minha-chave.json")
}

/**
 * O que dizer na tela depois de baixar.
 *
 * @param {string[]} aplicadas
 * @returns {{tom: "ok" | "idle", texto: string}}
 */
export function avisoDoDownload(aplicadas) {
  if (aplicadas.length === 0) {
    return {
      tom: "idle",
      texto: "Baixado. Importe no configurador e preencha as chaves por lá.",
    }
  }
  return {
    tom: "ok",
    texto:
      `Baixado com a sua chave ${aplicadas.join(" e ")} já dentro. ` +
      `É só importar. Não mande esse arquivo para ninguém: ele contém a sua credencial.`,
  }
}
