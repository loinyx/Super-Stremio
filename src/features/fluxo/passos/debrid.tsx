import { useEffect, useState } from "react"
import { CheckCircle } from "@phosphor-icons/react"
import { Passo } from "../passo"
import { IrEVoltar, type Aferido } from "../ir-e-voltar"
import { useFluxo } from "../estado"
import { DEBRIDS } from "@/lib/catalog.js"
import { aferirDebrid } from "@/lib/keys.js"
import { cn } from "@/lib/utils"

/**
 * O serviço que entrega o vídeo.
 *
 * A tela abre pelo problema, e não pelo nome do produto: quem nunca ouviu a
 * palavra debrid não tem como decidir entre dois serviços que ainda não sabe
 * para que servem. Preço não aparece aqui, porque muda com promoção e plano, e
 * um número errado no site é pior que número nenhum.
 */
export function PassoDebrid({ aoAvancar, aoVoltar }: { aoAvancar: () => void; aoVoltar: () => void }) {
  const { estado, anotar, cumprir, alternar } = useFluxo()
  const escolhido = DEBRIDS.find((d) => estado[`chave:${d.id}`]?.ativo) ?? DEBRIDS[0]
  const chave = `chave:${escolhido.id}`
  const salvo = estado[chave]

  const [valor, setValor] = useState(salvo?.valor ?? "")
  const [aferido, setAferido] = useState<Aferido>(
    salvo?.validado ? { estado: "ok", mensagem: salvo.mensagem } : { estado: "vazio" },
  )

  // O cartão nasce mostrando o recomendado como escolhido. Grava isso, senão a
  // tela diz uma coisa e o estado guarda outra.
  useEffect(() => {
    if (!DEBRIDS.some((d) => estado[`chave:${d.id}`]?.ativo)) alternar(`chave:${DEBRIDS[0].id}`, true)
    // Só na entrada do passo: depois disso quem manda é o clique da pessoa.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const conferir = () => {
    const r = aferirDebrid(valor.trim(), escolhido.nome)
    setAferido({ estado: r.ok ? "ok" : "erro", mensagem: r.mensagem })
    anotar(chave, valor.trim(), { ok: r.ok, mensagem: r.mensagem })
  }

  const escolher = (id: string) => {
    for (const d of DEBRIDS) alternar(`chave:${d.id}`, d.id === id)
    setValor(estado[`chave:${id}`]?.valor ?? "")
    setAferido(estado[`chave:${id}`]?.validado ? { estado: "ok" } : { estado: "vazio" })
  }

  return (
    <Passo
      titulo="Como o filme chega até você"
      lede="Num complemento comum, apertar play começa a baixar o arquivo na sua casa e você espera. Um serviço de vídeo já tem o arquivo pronto num servidor e entrega direto, como a Netflix faz. É a única parte paga."
      aoAvancar={aoAvancar}
      aoVoltar={aoVoltar}
      travado={aferido.estado === "ok" ? undefined : "Falta conferir a chave para seguir."}
    >
      <div className="mb-3 grid gap-3 sm:grid-cols-2">
        {DEBRIDS.map((d) => {
          const ativo = d.id === escolhido.id
          return (
            <button
              key={d.id}
              type="button"
              aria-pressed={ativo}
              onClick={() => escolher(d.id)}
              className={cn(
                "rounded-2xl p-6 text-left ring-1",
                "transition-[background-color,box-shadow,transform] duration-150 active:scale-[0.99]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                ativo ? "bg-primary/[0.18] ring-primary/60" : "bg-card ring-border hover:ring-primary/30",
              )}
            >
              <div className="flex items-center gap-3">
                <strong className="flex-1 text-base font-bold">{d.nome}</strong>
                {d.recomendado && (
                  <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                    recomendado
                  </span>
                )}
                {ativo && <CheckCircle weight="fill" aria-hidden="true" className="size-5 text-primary" />}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {d.id === "torbox"
                  ? "Costuma achar mais coisa dublada e nacional, e é o que a lista de fontes usa melhor aqui."
                  : "O mais antigo e conhecido do meio. Funciona igual de bem neste setup."}
              </p>
            </button>
          )
        })}
      </div>

      <IrEVoltar
        la={{
          titulo: `Pegue a chave no ${escolhido.nome}`,
          texto: escolhido.ondeAchar,
          botao: `Abrir o ${escolhido.nome}`,
          href: escolhido.chave,
        }}
        jaTenho="Já tenho conta"
        ca={{
          titulo: "Cole a chave aqui",
          texto: "Ela entra sozinha na lista de fontes e no Torrentio, sem você precisar colar de novo.",
          rotulo: `Chave do ${escolhido.nome}`,
          exemplo: "cole a chave",
        }}
        valor={valor}
        aoMudar={(v) => {
          setValor(v)
          if (aferido.estado !== "vazio") setAferido({ estado: "vazio" })
        }}
        aoConferir={conferir}
        aferido={aferido}
        saiu={Boolean(salvo?.abriu)}
        aoSair={() => cumprir(chave, "abriu")}
        aoJaTer={() => cumprir(chave, "abriu")}
      />
    </Passo>
  )
}
