import { CheckCircle } from "@phosphor-icons/react"
import { motion } from "motion/react"
import { PASSOS } from "./dados"
import { cn } from "@/lib/utils"

type Props = {
  atual: number
  concluidos: Set<number>
  aoEscolher: (n: number) => void
}

/**
 * O trilho de passos.
 *
 * Só deixa voltar, nunca pular adiante: passo que não foi feito ainda não tem
 * o que mostrar, e liberar o clique só entrega uma tela vazia. O passo atual
 * ganha uma faixa que desliza entre os itens, em vez de aparecer e sumir.
 */
export function Trilho({ atual, concluidos, aoEscolher }: Props) {
  return (
    <nav aria-label="Passos" className="w-full">
      <ol className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
        {PASSOS.map((p, i) => {
          const feito = concluidos.has(i)
          const agora = i === atual
          const acessivel = feito || i <= atual
          const Icone = p.icone

          return (
            <li key={p.id} className="relative shrink-0">
              {agora && (
                <motion.div
                  layoutId="trilho-ativo"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  className="absolute inset-0 rounded-xl bg-secondary"
                />
              )}
              <button
                type="button"
                disabled={!acessivel}
                onClick={() => acessivel && aoEscolher(i)}
                aria-current={agora ? "step" : undefined}
                className={cn(
                  "relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
                  agora && "text-foreground",
                  !agora && acessivel && "text-muted-foreground hover:text-foreground",
                  !acessivel && "cursor-default text-muted-foreground/40",
                )}
              >
                <span
                  className={cn(
                    "grid size-7 shrink-0 place-items-center rounded-full transition-colors",
                    agora && "bg-primary text-primary-foreground",
                    !agora && !feito && "bg-secondary text-muted-foreground",
                  )}
                >
                  {feito && !agora ? (
                    <CheckCircle weight="fill" className="size-6 text-success" />
                  ) : (
                    <Icone weight="fill" className="size-4" />
                  )}
                </span>
                <span className={cn("whitespace-nowrap font-medium", agora && "font-semibold")}>
                  {p.nome}
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
