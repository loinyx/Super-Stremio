import type { ReactNode } from "react"
import { ArrowLeft, ArrowRight, Question } from "@phosphor-icons/react"
import { motion } from "motion/react"
import { Button } from "@/components/ui/button"
import { TOTAL } from "./dados"

type Props = {
  indice: number
  titulo: string
  lede?: string
  children: ReactNode
  /** Texto do painel lateral de aprofundamento, quando o passo tiver um. */
  saibaMais?: { rotulo: string; conteudo: ReactNode }
  aoAbrirAjuda?: () => void
  aoAvancar?: () => void
  aoVoltar?: () => void
  avancarBloqueado?: string
  rotuloAvancar?: string
}

/**
 * A moldura de um passo.
 *
 * Todo passo tem a mesma anatomia: onde você está, o que é isso em uma linha, o
 * que fazer, e onde ler mais. Quando cada tela inventava a própria, a pessoa
 * gastava atenção reaprendendo o layout em vez de fazer a tarefa.
 */
export function Passo({
  indice, titulo, lede, children, saibaMais, aoAbrirAjuda,
  aoAvancar, aoVoltar, avancarBloqueado, rotuloAvancar = "Continuar",
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -8, filter: "blur(6px)" }}
      transition={{ duration: 0.34, ease: [0.2, 0, 0, 1] }}
      className="mx-auto w-full max-w-2xl"
    >
      <p className="font-mono text-xs tracking-[0.18em] text-primary">
        passo {indice + 1} de {TOTAL}
      </p>
      <h1 className="mt-4 text-balance text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
        {titulo}
      </h1>
      {lede && (
        <p className="mt-4 max-w-xl text-pretty leading-relaxed text-muted-foreground">{lede}</p>
      )}

      <div className="mt-10 flex flex-col gap-4">{children}</div>

      {saibaMais && (
        <button
          type="button"
          onClick={aoAbrirAjuda}
          className="group mt-6 flex w-full items-center gap-3 rounded-xl bg-accent/10 px-4 py-3.5
                     text-left text-sm font-medium text-accent ring-1 ring-accent/25
                     transition-colors hover:bg-accent/15"
        >
          <Question weight="fill" className="size-4 shrink-0" />
          <span className="flex-1">{saibaMais.rotulo}</span>
          <ArrowRight
            weight="bold"
            className="size-4 opacity-70 transition-transform group-hover:translate-x-0.5"
          />
        </button>
      )}

      <div className="mt-12 flex flex-wrap items-center gap-3">
        {aoAvancar && (
          <Button
            size="lg"
            onClick={aoAvancar}
            disabled={Boolean(avancarBloqueado)}
            title={avancarBloqueado}
            className="group h-12 px-7"
          >
            {rotuloAvancar}
            <ArrowRight weight="bold" className="ml-1 transition-transform group-hover:translate-x-0.5" />
          </Button>
        )}
        {aoVoltar && (
          <Button size="lg" variant="ghost" onClick={aoVoltar} className="h-12 text-muted-foreground">
            <ArrowLeft weight="bold" className="mr-1" />
            Voltar
          </Button>
        )}
      </div>
      {avancarBloqueado && (
        <p className="mt-4 text-sm text-muted-foreground">{avancarBloqueado}</p>
      )}
    </motion.div>
  )
}
