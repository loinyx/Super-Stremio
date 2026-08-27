import type { ReactNode } from "react"

/**
 * Uma etapa numerada dentro de um passo.
 *
 * Numerar aqui carrega informação: são ações em ordem estrita, executadas em
 * outro site, e trocar a ordem quebra o resultado. É diferente de numerar
 * seções de uma página, que seria decoração.
 */
export function Etapa({ n, titulo, children }: { n: number; titulo: string; children: ReactNode }) {
  return (
    <li className="grid grid-cols-[24px_1fr] gap-x-3 gap-y-2">
      <span
        aria-hidden="true"
        className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-secondary text-xs font-semibold text-muted-foreground"
      >
        {n}
      </span>
      <div>
        <p className="text-sm font-semibold">{titulo}</p>
        <div className="mt-1.5">{children}</div>
      </div>
    </li>
  )
}

/** Palavra que aparece com essas letras exatas na tela do outro site. */
export function Termo({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[13px] font-medium text-foreground">
      {children}
    </span>
  )
}
