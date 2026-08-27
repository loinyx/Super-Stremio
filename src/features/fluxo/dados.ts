import {
  CheckCircle, ClosedCaptioning, DownloadSimple, Key, Lightning,
  ListChecks, MonitorPlay, PlayCircle, SquaresFour,
} from "@phosphor-icons/react"

/**
 * Os passos, na ordem.
 *
 * O título e a linha de apoio moram aqui, e não dentro de cada tela, porque o
 * trilho lateral precisa dos mesmos nomes. Duas listas divergem no primeiro dia
 * em que alguém renomeia um passo.
 */
export const PASSOS = [
  {
    id: "aplicativo",
    nome: "Aplicativo",
    icone: MonitorPlay,
    titulo: "Onde você assiste",
    lede: "Os complementos são os mesmos nos dois. Muda o que cada aplicativo faz com eles.",
  },
  {
    id: "mdblist",
    nome: "Catálogos",
    icone: Key,
    titulo: "A chave que enche os catálogos",
    lede: "Grátis e leva dois minutos. É de onde vêm 86 dos 150 catálogos.",
  },
  {
    id: "debrid",
    nome: "Vídeo",
    icone: Lightning,
    titulo: "De onde vem o vídeo",
    lede: "A única parte paga. Ligue o serviço que você assina, ou os dois.",
  },
  {
    id: "fatias",
    nome: "As cinco listas",
    icone: SquaresFour,
    titulo: "As cinco listas de catálogo",
    lede: "O passo mais longo, uns oito minutos. Cada lista vira uma fileira na tela inicial.",
  },
  {
    id: "streams",
    nome: "Fontes",
    icone: PlayCircle,
    titulo: "Quem organiza as fontes",
    lede: "Consulta quinze buscadores de uma vez e devolve uma lista só, ordenada.",
  },
  {
    id: "legendas",
    nome: "Legendas",
    icone: ClosedCaptioning,
    titulo: "As duas fontes de legenda",
    lede: "São duas de propósito. Uma cobre o buraco da outra.",
  },
  {
    id: "revisao",
    nome: "Revisão",
    icone: ListChecks,
    titulo: "Tudo conferido",
    lede: "Cada endereço foi testado perguntando ao próprio complemento se ele responde.",
  },
  {
    id: "instalar",
    nome: "Instalar",
    icone: DownloadSimple,
    titulo: "Como instalar",
    lede: "",
  },
  {
    id: "pronto",
    nome: "Pronto",
    icone: CheckCircle,
    titulo: "Pronto",
    lede: "Feche e abra o aplicativo para os catálogos aparecerem.",
  },
] as const

export type Passo = (typeof PASSOS)[number]
/** Os oito passos numerados, sem contar a tela final. */
export const TOTAL = PASSOS.length - 1
