import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react"
import { carregar, guardar, limpar, registrar, marcarPasso } from "@/lib/wizard.js"
import { ADDONS, DEBRIDS, montarUrl } from "@/lib/catalog.js"

/** @see src/lib/wizard.js, que é quem sabe ler e gravar. */
type Estado = Record<string, {
  valor: string
  validado: boolean
  url?: string
  mensagem?: string
  manifest?: object
  ativo?: boolean
  abriu?: boolean
  ajustou?: boolean
  baixou?: boolean
}>

type Contexto = {
  estado: Estado
  /** Guarda o que a pessoa colou, junto do veredito da verificação. */
  anotar: (
    chave: string,
    valor: string,
    r: { ok: boolean; mensagem?: string; url?: string; manifest?: object },
  ) => void
  /** Marca um passo do cartão como cumprido, sem mexer no valor. */
  cumprir: (chave: string, passo: "abriu" | "ajustou" | "baixou") => void
  /** Liga ou desliga um serviço, como os debrids. */
  alternar: (chave: string, ativo: boolean) => void
  recomecar: () => void
}

const Ctx = createContext<Contexto | null>(null)

/**
 * Os addons que ninguém preenche à mão.
 *
 * O Torrentio não tem campo: o endereço dele sai das chaves de debrid que a
 * pessoa já colou. Se ele não for gravado aqui, a revisão diz que falta um
 * complemento que na tela aparece como pronto, e as duas leituras discordam.
 */
function sincronizarDerivados(estado: Estado): Estado {
  // Chave preenchida conta, com ou sem o serviço marcado como ativo. O cartão
  // do TorBox aparece escolhido por padrão sem nada ser gravado, então exigir
  // `ativo` aqui apagava o Torrentio de quem só colou a chave e seguiu.
  const chaves = Object.fromEntries(
    DEBRIDS.map((d) => {
      const c = estado[`chave:${d.id}`]
      const usavel = c?.ativo !== false && (c?.valor ?? "").trim()
      return [d.id, usavel ? c.valor.trim() : ""]
    }).filter(([, v]) => v),
  )

  const proximo = { ...estado }
  for (const addon of ADDONS.filter((a) => a.exige === "debrid")) {
    if (Object.keys(chaves).length === 0) {
      delete proximo[addon.id]
      continue
    }
    try {
      const url = montarUrl(addon, "", chaves)
      proximo[addon.id] = { valor: "", validado: true, url, mensagem: "Montado com a sua chave." }
    } catch {
      delete proximo[addon.id]
    }
  }
  return proximo
}

export function ProvedorDoFluxo({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<Estado>(() => sincronizarDerivados(carregar()))

  // Toda escrita passa por aqui: grava no disco e no React na mesma linha, para
  // os dois nunca discordarem depois de um recarregamento.
  const salvar = useCallback((proximo: Estado) => {
    const pronto = sincronizarDerivados(proximo)
    guardar(pronto)
    setEstado(pronto)
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
