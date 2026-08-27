import { Moon, Sun } from "@phosphor-icons/react"
import { useTema } from "@/lib/tema"
import { Button } from "@/components/ui/button"

/** Alterna claro e escuro, seguindo o sistema até alguém escolher. */
export function TrocaTema() {
  const { tema, setTema } = useTema()
  const escuro =
    tema === "escuro" ||
    (tema === "sistema" && window.matchMedia("(prefers-color-scheme: dark)").matches)

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={escuro ? "Usar o tema claro" : "Usar o tema escuro"}
      onClick={() => setTema(escuro ? "claro" : "escuro")}
      className="text-muted-foreground"
    >
      {escuro ? (
        <Sun weight="fill" aria-hidden="true" className="size-5" />
      ) : (
        <Moon weight="fill" aria-hidden="true" className="size-5" />
      )}
    </Button>
  )
}
