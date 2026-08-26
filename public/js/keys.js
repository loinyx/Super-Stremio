// @ts-check
/**
 * As duas chaves que não pertencem a um addon.
 *
 * A do MDBList o visitante cola dentro do AIOMetadata, e a do TorBox dentro do
 * AIOStreams, além de ir na URL do Torrentio. O site guarda as duas só para ter
 * um botão de copiar na hora certa.
 *
 * Os dois serviços se comportam de forma diferente e a tela precisa refletir
 * isso com honestidade: o MDBList permite consulta a partir do navegador, o
 * TorBox não. Onde não dá para verificar, o site diz que não deu.
 */

/** @typedef {{ok: boolean, verificado: boolean, mensagem: string}} Aferição */

/**
 * Confere a chave do MDBList contra a API deles.
 *
 * @param {string} chave
 * @param {typeof fetch} [buscar]
 * @returns {Promise<Aferição>}
 */
export async function aferirMdblist(chave, buscar = fetch) {
  const limpa = chave.trim()
  if (!limpa) {
    return { ok: false, verificado: false, mensagem: "Cole a chave antes de verificar." }
  }

  let resposta
  try {
    resposta = await buscar(`https://api.mdblist.com/user?apikey=${encodeURIComponent(limpa)}`)
  } catch {
    return {
      ok: false,
      verificado: false,
      mensagem: "Não deu para falar com o MDBList. Verifique a conexão e tente de novo.",
    }
  }

  if (resposta.status === 401 || resposta.status === 403) {
    return {
      ok: false,
      verificado: true,
      mensagem: "O MDBList recusou essa chave. Copie de novo em mdblist.com, na aba Preferences.",
    }
  }
  if (!resposta.ok) {
    return {
      ok: false,
      verificado: false,
      mensagem: `O MDBList respondeu ${resposta.status}. Tente de novo em instantes.`,
    }
  }

  return { ok: true, verificado: true, mensagem: "Chave aceita pelo MDBList." }
}

/**
 * Confere o que dá para conferir na chave do TorBox, que é só o formato.
 *
 * A API do TorBox não manda cabeçalho de CORS, então o navegador não consegue
 * consultá-la. Em vez de mostrar um check verde que não significa nada, esta
 * função devolve `verificado: false` e a tela avisa que a conferência de
 * verdade só acontece quando o primeiro filme abrir.
 *
 * @param {string} chave
 * @returns {Aferição}
 */
export function aferirTorbox(chave) {
  const limpa = chave.trim()
  if (!limpa) {
    return { ok: false, verificado: false, mensagem: "Cole a chave antes de continuar." }
  }
  if (limpa.length < 16) {
    return {
      ok: false,
      verificado: true,
      mensagem: "Essa chave é curta demais. Copie o valor inteiro da seção API do TorBox.",
    }
  }
  if (/\s/.test(limpa)) {
    return {
      ok: false,
      verificado: true,
      mensagem: "A chave veio com espaço no meio. Copie de novo, sem selecionar o texto ao redor.",
    }
  }

  return {
    ok: true,
    verificado: false,
    mensagem:
      "Formato certo. O TorBox não deixa este site consultar a chave dele, " +
      "então a prova real é o primeiro filme abrir.",
  }
}
