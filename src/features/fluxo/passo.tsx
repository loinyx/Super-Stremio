import type { ReactNode } from "react"
import { ArrowLeft, ArrowRight } from "@phosphor-icons/react"
import { motion } from "motion/react"
import { Button } from "@/components/ui/button"

type Props = {
  /** Pergunta da tela. É o que a pessoa está resolvendo agora. */
  titulo: string
  lede?: string
  children: ReactNode
  aoAvancar?: () => void
  aoVoltar?: () => void
  /** Quando existe, diz o que falta e trava o avanço. */
  travado?: string
  rotuloAvancar?: string
}

/**
 * A moldura de um passo.
 *
 * Uma tarefa por tela, centralizada, sem menu em volta. O que orienta é o traço
 * de progresso lá em cima, e não uma lista de passos competindo com a tarefa.
 */
export function Passo({ titulo, lede, children, aoAvancar, aoVoltar, travado, rotuloAvancar = "Continuar" }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
      transition={{ duration: 0.36, ease: [0.2, 0, 0, 1] }}
      className="mx-auto w-full max-w-2xl"
    >
      <div className="text-center">
        <h1 className="text-balance text-3xl font-extrabold leading-[1.1] tracking-tight sm:text-4xl">
          {titulo}
        </h1>
        {lede && (
          <p className="mx-auto mt-5 max-w-[38rem] text-pretty text-lg leading-relaxed text-muted-foreground">
            {lede}
          </p>
        )}
      </div>

      <div className="mt-10 text-left">{children}</div>

      <div className="mt-10 flex flex-col items-center gap-4">
        {aoAvancar && (
          <Button
            size="lg"
            onClick={aoAvancar}
            disabled={Boolean(travado)}
            aria-describedby={travado ? "passo-travado" : undefined}
            className="group h-12 px-8"
          >
            {rotuloAvancar}
            <ArrowRight
              weight="bold"
              aria-hidden="true"
              className="ml-1 transition-transform group-hover:translate-x-0.5"
            />
          </Button>
        )}
        {travado && (
          <p id="passo-travado" aria-live="polite" className="text-sm text-muted-foreground">
            {travado}
          </p>
        )}
        {aoVoltar && (
          <Button size="lg" variant="ghost" onClick={aoVoltar} className="h-11 text-muted-foreground">
            <ArrowLeft weight="bold" aria-hidden="true" className="mr-1" />
            Voltar
          </Button>
        )}
      </div>
    </motion.div>
  )
}
