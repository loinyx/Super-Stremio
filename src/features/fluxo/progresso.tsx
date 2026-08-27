import { motion } from "motion/react"
import { cn } from "@/lib/utils"

/**
 * O progresso do fluxo.
 *
 * Traços em vez de números: a ordem aqui é parcialmente arbitrária, então
 * enumerar passo sugere uma sequência rígida que não existe. O traço atual se
 * alonga, e é essa diferença de largura que diz onde a pessoa está.
 */
export function Progresso({ atual, total }: { atual: number; total: number }) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-1.5" role="presentation">
        {Array.from({ length: total }, (_, i) => (
          <motion.span
            key={i}
            animate={{ width: i === atual ? 26 : 7 }}
            transition={{ type: "spring", stiffness: 420, damping: 34 }}
            className={cn(
              "block h-[6px] rounded-full",
              i < atual && "bg-success/70",
              i === atual && "bg-primary",
              i > atual && "bg-secondary",
            )}
          />
        ))}
      </div>
      <span className="font-mono text-xs tabular-nums text-muted-foreground">
        {atual + 1} de {total}
      </span>
    </div>
  )
}
