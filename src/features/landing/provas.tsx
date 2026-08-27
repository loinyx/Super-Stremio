/**
 * Miniaturas do resultado.
 *
 * Não são capturas de tela do aplicativo: são desenhos da interface, feitos em
 * HTML, do que a pessoa vai ver depois de instalar. Print de verdade
 * envelhece a cada versão do Stremio e some quando alguém troca de tema.
 */
import { CaretDown, Check } from "@phosphor-icons/react"

/** A barra de filtros da tela inicial, com os cortes que o setup instala. */
export function ProvaCatalogos() {
  const filtros = ["Filmes", "Em alta", "Gênero"]
  const opcoes = ["Netflix Top 10", "Top 250", "Anos 90", "Coreanos", "Cinema brasileiro"]
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {filtros.map((f, i) => (
          <span
            key={f}
            className={
              "flex items-center gap-2 rounded-full px-4 py-2 text-sm " +
              (i === 1 ? "bg-primary/15 text-primary ring-1 ring-primary/30" : "bg-muted text-muted-foreground")
            }
          >
            {f}
            <CaretDown weight="bold" className="size-3 opacity-60" />
          </span>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {opcoes.map((o) => (
          <span key={o} className="rounded-md bg-card px-3 py-1.5 text-xs text-muted-foreground ring-1 ring-border">
            {o}
          </span>
        ))}
      </div>
    </div>
  )
}

/** O seletor de legenda, já em português e já sincronizado. */
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

/** Uma lista de streams como ela chega depois de ordenada. */
export function ProvaStreams() {
  const linhas = [
    { q: "4K", t: "Dublado", d: ["HDR", "Atmos", "18.6 GB"], pronto: true },
    { q: "4K", t: "Legendado", d: ["DV", "5.1", "17.6 GB"], pronto: true },
    { q: "1080p", t: "Dublado", d: ["WEB-DL", "4.2 GB"], pronto: true },
  ]
  return (
    <div className="space-y-1.5">
      {linhas.map((l, i) => (
        <div key={i} className="flex items-center gap-3 rounded-lg bg-card px-3 py-2.5 ring-1 ring-border">
          <span className="rounded bg-primary/15 px-2 py-0.5 font-mono text-[11px] font-semibold text-primary">
            {l.q}
          </span>
          <span className="text-sm">{l.t}</span>
          <span className="ml-auto flex items-center gap-2 text-[11px] text-muted-foreground">
            {l.d.join(" · ")}
            {l.pronto && <Check weight="bold" className="size-3.5 text-success" />}
          </span>
        </div>
      ))}
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
