import { CheckCircle, Circle, Sparkle } from "@phosphor-icons/react"
import { Passo } from "../passo"
import { useFluxo } from "../estado"
import { ADDONS } from "@/lib/catalog.js"
import { conferirPacote } from "@/lib/wizard.js"
import { cn } from "@/lib/utils"

const PAPEL: Record<string, string> = {
  catalogo: "Catálogos",
  streams: "Opções de vídeo",
  legendas: "Legendas",
}

/**
 * O que foi conferido.
 *
 * Cada endereço aqui já respondeu quando foi perguntado a ele. Isto não é um
 * resumo do que a pessoa digitou, é o resultado de ter testado.
 */
export function PassoRevisao({ aoAvancar, aoVoltar }: { aoAvancar: () => void; aoVoltar: () => void }) {
  const { estado } = useFluxo()
  const { pronto, faltam } = conferirPacote(estado, ADDONS)

  const grupos = ["catalogo", "streams", "legendas"].map((papel) => ({
    papel,
    itens: ADDONS.filter((a) => a.papel === papel),
  }))

  return (
    <Passo
      titulo="Tudo conferido"
      lede="Cada endereço foi testado perguntando ao próprio complemento se ele responde. Nada aqui é só o que você digitou."
      aoAvancar={aoAvancar}
      aoVoltar={aoVoltar}
      rotuloAvancar="Ir para a instalação"
      travado={pronto ? undefined : `Ainda falta: ${faltam.join(", ")}.`}
    >
      <div className="flex flex-col gap-3">
        {grupos.map((g) => (
          <section key={g.papel} className="rounded-2xl bg-card p-6 ring-1 ring-border">
            <h2 className="text-sm font-semibold text-muted-foreground">{PAPEL[g.papel]}</h2>
            <ul className="mt-4 flex flex-col gap-3">
              {g.itens.map((a) => {
                const salvo = estado[a.id]
                const automatico = a.exige === "nada" || a.exige === "debrid"
                const ok = automatico ? true : Boolean(salvo?.validado)
                return (
                  <li key={a.id} className="flex items-center gap-3">
                    {ok ? (
                      <CheckCircle weight="fill" aria-hidden="true" className="size-5 shrink-0 text-success" />
                    ) : (
                      <Circle weight="bold" aria-hidden="true" className="size-5 shrink-0 text-muted-foreground/50" />
                    )}
                    <span className={cn("flex-1 text-sm font-medium", !ok && "text-muted-foreground")}>
                      {a.nome}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {automatico ? (
                        <span className="inline-flex items-center gap-1">
                          <Sparkle weight="fill" aria-hidden="true" className="size-3" />
                          montado para você
                        </span>
                      ) : ok ? (
                        `${a.catalogos ?? ""}${a.catalogos ? " catálogos" : "respondeu"}`
                      ) : (
                        "falta conferir"
                      )}
                    </span>
                  </li>
                )
              })}
            </ul>
          </section>
        ))}
      </div>
    </Passo>
  )
}
