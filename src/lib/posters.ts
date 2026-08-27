/**
 * Pôsteres do herói.
 *
 * As imagens vêm do metahub, que é o servidor de imagens do próprio Stremio:
 * é público, não pede chave e é a mesma fonte que o aplicativo usa para
 * desenhar a tela inicial. Guardar o id do IMDb, e não a URL inteira, deixa
 * trocar de tamanho sem reescrever a lista.
 */

/** Filmes escolhidos por serem reconhecíveis de longe, que é o que um pôster
 *  precisa fazer quando aparece com 150 pixels de largura e girando. */
export const POSTERES = [
  { id: "tt0111161", titulo: "Um Sonho de Liberdade" },
  { id: "tt0468569", titulo: "Batman: O Cavaleiro das Trevas" },
  { id: "tt0317248", titulo: "Cidade de Deus" },
  { id: "tt1375666", titulo: "A Origem" },
  { id: "tt6751668", titulo: "Parasita" },
  { id: "tt0110912", titulo: "Pulp Fiction" },
  { id: "tt0245429", titulo: "A Viagem de Chihiro" },
  { id: "tt0816692", titulo: "Interestelar" },
  { id: "tt0861739", titulo: "Tropa de Elite" },
  { id: "tt0133093", titulo: "Matrix" },
  { id: "tt15398776", titulo: "Oppenheimer" },
  { id: "tt2582802", titulo: "Whiplash" },
  { id: "tt0120737", titulo: "O Senhor dos Anéis" },
  { id: "tt0114369", titulo: "Seven" },
  { id: "tt1160419", titulo: "Duna" },
  { id: "tt0140888", titulo: "Central do Brasil" },
] as const

/** @param tamanho small tem 200px de largura, medium tem 400. */
export const urlDoPoster = (id: string, tamanho: "small" | "medium" = "medium") =>
  `https://images.metahub.space/poster/${tamanho}/${id}/img`
