import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react"
import { carregar, guardar, limpar, registrar, marcarPasso } from "@/lib/wizard.js"

/** @see src/lib/wizard.js, que é quem sabe ler e gravar. */
type Estado = Record<string, {
  valor: string
  validado: boolean
  url?: string
  mensagem?: string
  ativo?: boolean
  abriu?: boolean
  ajustou?: boolean
  baixou?: boolean
}>

type Contexto = {
  estado: Estado
  /** Guarda o que a pessoa colou, junto do veredito da verificação. */
  anotar: (chave: string, valor: string, r: { ok: boolean; mensagem?: string; url?: string }) => void
  /** Marca um passo do cartão como cumprido, sem mexer no valor. */
  cumprir: (chave: string, passo: "abriu" | "ajustou" | "baixou") => void
  /** Liga ou desliga um serviço, como os debrids. */
  alternar: (chave: string, ativo: boolean) => void
  recomecar: () => void
}

const Ctx = createContext<Contexto | null>(null)

export function ProvedorDoFluxo({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<Estado>(() => carregar())

  // Toda escrita passa por aqui: grava no disco e no React na mesma linha, para
  // os dois nunca discordarem depois de um recarregamento.
  const salvar = useCallback((proximo: Estado) => {
    guardar(proximo)
    setEstado(proximo)
  }, [])

  const valor = useMemo<Contexto>(
    () => ({
      estado,
      anotar: (chave, v, r) => salvar(registrar(estado, chave, v, r)),
      cumprir: (chave, passo) => salvar(marcarPasso(estado, chave, passo)),
      alternar: (chave, ativo) => {
        const anterior = estado[chave] ?? { valor: "", validado: false }
        salvar({ ...estado, [chave]: { ...anterior, ativo } })
      },
      recomecar: () => {
        limpar()
        setEstado({})
      },
    }),
    [estado, salvar],
  )

  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>
}

export function useFluxo() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error("useFluxo precisa estar dentro de ProvedorDoFluxo")
  return ctx
}
