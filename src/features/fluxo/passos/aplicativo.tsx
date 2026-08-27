import { CheckCircle } from "@phosphor-icons/react"
import { Passo } from "../passo"
import { useFluxo } from "../estado"
import { cn } from "@/lib/utils"

const LOGO_NUVIO = "https://raw.githubusercontent.com/NuvioMedia/NuvioWeb/main/public/icon.png"

const APPS = [
  {
    id: "stremio",
    nome: "Stremio",
    nota: "Roda no computador, no celular e na TV. É o mais usado, e é onde tudo isto foi montado.",
  },
  {
    id: "nuvio",
    nome: "Nuvio",
    nota: "Feito para assistir na TV, com controle remoto. Os mesmos complementos, com uma camada de organização por cima.",
  },
  { id: "ambos", nome: "Os dois", nota: "Instala a mesma lista nos dois aparelhos." },
]

export function PassoAplicativo({ aoAvancar }: { aoAvancar: () => void }) {
  const { estado, anotar } = useFluxo()
  const escolhido = estado.app?.valor || "stremio"

  return (
    <Passo
      titulo="Onde você assiste?"
      lede="Os complementos são os mesmos nos dois. O que muda é o que cada aplicativo faz com eles."
      aoAvancar={aoAvancar}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {APPS.map((a) => {
          const ativo = a.id === escolhido
          return (
            <button
              key={a.id}
              type="button"
              aria-pressed={ativo}
              onClick={() => anotar("app", a.id, { ok: true })}
              className={cn(
                "rounded-2xl p-6 text-left ring-1 transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                a.id === "ambos" && "sm:col-span-2",
                ativo ? "bg-primary/10 ring-primary/45" : "bg-card ring-border hover:ring-primary/30",
              )}
            >
              <div className="flex items-center gap-3">
                {a.id === "nuvio" ? (
                  <img
                    src={LOGO_NUVIO}
                    alt=""
                    width={28}
                    height={28}
                    loading="lazy"
                    className="size-7 rounded-md"
                  />
                ) : (
                  <span
                    aria-hidden="true"
                    className="grid size-7 place-items-center rounded-md bg-secondary text-xs font-bold"
                  >
                    {a.id === "ambos" ? "+" : "S"}
                  </span>
                )}
                <strong className="flex-1 text-base font-bold">{a.nome}</strong>
                {ativo && <CheckCircle weight="fill" aria-hidden="true" className="size-5 text-primary" />}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{a.nota}</p>
            </button>
          )
        })}
      </div>
    </Passo>
  )
}
