import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Props = {
  id: string
  rotulo: string
  valor: string
  aoMudar: (v: string) => void
  aoConferir: () => void
  conferindo?: boolean
  ok?: boolean
  exemplo: string
  mensagem: string
}

/** O campo de colar e conferir, igual em todo passo que pede um valor. */
export function Campo({ id, rotulo, valor, aoMudar, aoConferir, conferindo, ok, exemplo, mensagem }: Props) {
  return (
    <div>
      <label htmlFor={id} className="sr-only">
        {rotulo}
      </label>
      <div className="flex flex-col gap-2.5 sm:flex-row">
        <input
          id={id}
          type="text"
          value={valor}
          onChange={(e) => aoMudar(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && aoConferir()}
          placeholder={`${exemplo}…`}
          autoComplete="off"
          spellCheck={false}
          className={cn(
            "h-11 min-w-0 flex-1 rounded-xl bg-background px-4 font-mono text-sm ring-1 ring-inset",
            "placeholder:font-sans placeholder:text-muted-foreground/70",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            ok ? "ring-success" : "ring-border",
          )}
        />
        <Button variant="secondary" onClick={aoConferir} className="h-11">
          {conferindo ? "Conferindo…" : "Conferir"}
        </Button>
      </div>
      <p aria-live="polite" className={cn("mt-3 text-sm", ok ? "text-success" : "text-muted-foreground")}>
        {mensagem}
      </p>
    </div>
  )
}
