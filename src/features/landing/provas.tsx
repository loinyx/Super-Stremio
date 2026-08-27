/**
 * Miniaturas do resultado.
 *
 * Não são capturas de tela do aplicativo: são desenhos da interface, feitos em
 * HTML, do que a pessoa vai ver depois de instalar. Print de verdade
 * envelhece a cada versão do Stremio e some quando alguém troca de tema.
 */
import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { CaretDown, Star } from "@phosphor-icons/react"

/**
 * A barra de filtros da tela inicial, trocando de corte sozinha.
 *
 * O ciclo existe para mostrar a variedade sem precisar de três imagens ou de
 * uma legenda dizendo "e muito mais". Os emojis são os mesmos que o addon
 * coloca, não enfeite nosso.
 */
const CORTES = [
  {
    filtro: "🔥 Em alta",
    itens: ["👀 Mais vistos", "🍅 Nota da crítica", "🏆 Top 250", "🆕 Novos no streaming"],
  },
  {
    filtro: "🎭 Gênero",
    itens: ["💥 Ação", "🌸 Anime", "😂 Comédia", "🇰🇷 Coreanos", "🎓 Documentários"],
  },
  {
    filtro: "📺 Serviço",
    itens: ["Netflix", "Prime Video", "Disney+", "HBO Max", "Globoplay"],
  },
  {
    filtro: "📅 Década",
    itens: ["Anos 80", "Anos 90", "Anos 2000", "Anos 2010", "Anos 2020"],
  },
]

export function ProvaCatalogos() {
  const [i, setI] = useState(0)

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const t = setInterval(() => setI((n) => (n + 1) % CORTES.length), 3200)
    return () => clearInterval(t)
  }, [])

  const corte = CORTES[i]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <span className="flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm text-muted-foreground">
          Filmes <CaretDown weight="bold" className="size-3 opacity-60" />
        </span>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={corte.filtro}
            initial={{ opacity: 0, y: 6, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -6, filter: "blur(4px)" }}
            transition={{ duration: 0.32, ease: [0.2, 0, 0, 1] }}
            className="flex items-center gap-2 rounded-full bg-primary/15 px-4 py-2 text-sm text-primary ring-1 ring-primary/30"
          >
            {corte.filtro}
            <CaretDown weight="bold" className="size-3 opacity-60" />
          </motion.span>
        </AnimatePresence>
      </div>

      <div className="flex min-h-[68px] flex-wrap content-start gap-2">
        <AnimatePresence mode="popLayout" initial={false}>
          {corte.itens.map((item, n) => (
            <motion.span
              key={corte.filtro + item}
              initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
              transition={{ duration: 0.3, delay: n * 0.05, ease: [0.2, 0, 0, 1] }}
              className="rounded-md bg-card px-3 py-1.5 text-xs text-muted-foreground ring-1 ring-border"
            >
              {item}
            </motion.span>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

/**
 * A ficha como ela chega: logo do título em alta resolução, gêneros e sinopse
 * em português. O logo vem do metahub em PNG transparente, então ele assenta
 * em qualquer fundo, claro ou escuro.
 */
const FICHAS = [
  {
    id: "tt15398776",
    ano: "2023",
    nota: "8,3",
    generos: ["Drama", "História"],
    sinopse:
      "O físico que liderou a corrida para construir a bomba atômica, e o que veio depois " +
      "de ele conseguir.",
  },
  {
    id: "tt2582802",
    ano: "2014",
    nota: "8,5",
    generos: ["Drama", "Música"],
    sinopse:
      "Um baterista quer ser o melhor de todos. O professor que promete levá-lo lá não tem " +
      "limite nenhum.",
  },
]

export function ProvaFicha() {
  const [i, setI] = useState(0)

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const t = setInterval(() => setI((n) => (n + 1) % FICHAS.length), 5200)
    return () => clearInterval(t)
  }, [])

  const f = FICHAS[i]

  return (
    <div className="relative min-h-[210px] overflow-hidden rounded-xl">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={f.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.2, 0, 0, 1] }}
          className="absolute inset-0"
        >
          <img
            src={`https://images.metahub.space/background/medium/${f.id}/img`}
            alt=""
            loading="lazy"
            decoding="async"
            className="size-full object-cover"
          />
          {/* Sem este véu a sinopse fica ilegível sobre qualquer cena clara. */}
          <div className="absolute inset-0 bg-gradient-to-r from-card via-card/92 to-card/55" />
        </motion.div>
      </AnimatePresence>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={f.id + "-texto"}
          initial={{ opacity: 0, filter: "blur(6px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, filter: "blur(6px)" }}
          transition={{ duration: 0.4, ease: [0.2, 0, 0, 1] }}
          className="relative space-y-3 p-5"
        >
          <img
            src={`https://images.metahub.space/logo/medium/${f.id}/img`}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-12 w-auto max-w-[62%] object-contain object-left drop-shadow-lg"
          />
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1 text-foreground">
              <Star weight="fill" className="size-3 text-primary" />
              {f.nota}
            </span>
            <span>{f.ano}</span>
            {f.generos.map((g) => (
              <span key={g} className="rounded-md bg-background/60 px-2 py-0.5 ring-1 ring-border">
                {g}
              </span>
            ))}
          </div>
          <p className="max-w-[92%] text-sm leading-relaxed text-muted-foreground">{f.sinopse}</p>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

/** O seletor de legenda, já em português e já no tempo certo. */
export function ProvaLegendas() {
  const idiomas = ["Desligada", "English", "Português (Brasil)"]
  return (
    <div className="space-y-1.5">
      {idiomas.map((i) => {
        const ativo = i === "Português (Brasil)"
        return (
          <div
            key={i}
            className={
              "flex items-center justify-between rounded-lg px-3 py-2 text-sm " +
              (ativo ? "bg-card text-foreground ring-1 ring-border" : "text-muted-foreground")
            }
          >
            <span>{i}</span>
            {ativo && (
              <span className="flex items-center gap-2 text-xs text-success">
                sincronizada <span className="size-1.5 rounded-full bg-success" />
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}

/**
 * Uma opção de vídeo como ela chega na lista.
 *
 * O formato é o que o addon monta sozinho: qualidade em destaque na esquerda, e
 * do lado o título, o som e o tamanho. O contraste é com o que aparece sem
 * isso, que é nome de arquivo cru.
 */
const FONTES = [
  {
    marca: "🔥",
    qualidade: "4K UHD",
    titulo: "Homem-Aranha: Sem Volta Para Casa",
    linhas: ["🔊 Dublado 5.1", "📦 18.6 GB", "📊 22 Mbps"],
  },
  {
    marca: "🚀",
    qualidade: "FHD",
    titulo: "Homem-Aranha: Sem Volta Para Casa",
    linhas: ["🔊 Dublado 5.1", "📦 4.2 GB", "📊 8 Mbps"],
  },
]

export function ProvaStreams() {
  return (
    <div className="space-y-2">
      {FONTES.map((f, i) => (
        <div key={i} className="flex gap-4 rounded-xl bg-card p-3.5 ring-1 ring-border">
          <div className="flex w-16 shrink-0 flex-col items-center justify-center gap-1">
            <span className="text-lg leading-none">{f.marca}</span>
            <span className="font-mono text-[11px] font-semibold text-primary">{f.qualidade}</span>
          </div>
          <div className="min-w-0 space-y-1.5">
            <p className="truncate text-sm font-medium">{f.titulo}</p>
            <p className="text-[11px] text-muted-foreground">{f.linhas.join("   ")}</p>
          </div>
        </div>
      ))}
      <p className="pt-1 text-[11px] text-muted-foreground">
        Sem isso, essa mesma linha apareceria como
        <span className="ml-1 font-mono">Spider.Man.NWH.2021.2160p.WEB-DL.DDP5.1.x265</span>
      </p>
    </div>
  )
}

/** Os addons, agrupados pelo papel que cada um cumpre. */
export function ProvaAddons() {
  const grupos = [
    { papel: "Catálogos", itens: ["Em Alta", "Gêneros", "Pijama", "Anime", "Curadoria"] },
    { papel: "Streams", itens: ["AIOStreams", "Torrentio", "Brazuca"] },
    { papel: "Legendas", itens: ["opensubtitles PRO", "Community Subtitles"] },
  ]
  return (
    <div className="space-y-3">
      {grupos.map((g) => (
        <div key={g.papel} className="flex flex-wrap items-center gap-2">
          <span className="w-20 shrink-0 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            {g.papel}
          </span>
          {g.itens.map((i) => (
            <span key={i} className="rounded-md bg-card px-2.5 py-1 text-xs ring-1 ring-border">
              {i}
            </span>
          ))}
        </div>
      ))}
    </div>
  )
}
