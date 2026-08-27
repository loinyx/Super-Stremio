import { useEffect, useId, useRef, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { ArrowSquareOut, CheckCircle, WarningCircle } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type Aferido = { estado: "vazio" | "conferindo" | "ok" | "erro"; mensagem?: string }

type Props = {
  /** O que a pessoa vai fazer no site do outro serviço. */
  la: { titulo: string; texto: string; botao: string; href: string }
  /** Rótulo do caminho de quem já resolveu isso antes. Quando existe, ele é a
   *  ação principal: mandar alguém criar conta que já tem é fazer perder tempo,
   *  e destacar o botão que gasta dinheiro é empurrar compra. */
  jaTenho?: string
  /** O que ela traz de volta. */
  ca: { titulo: string; texto: string; exemplo: string; rotulo: string }
  valor: string
  aoMudar: (v: string) => void
  aoConferir: () => void
  aferido: Aferido
  /** Fica true assim que a pessoa abre o site de fora, e não volta atrás. */
  saiu: boolean
  aoSair: () => void
  /** Revela o campo sem a pessoa sair da página. */
  aoJaTer?: () => void
}

/**
 * O par que dá forma ao fluxo inteiro: vá lá, e volte.
 *
 * A metade de baixo não aparece antes de a pessoa sair. Enquanto ela não foi
 * buscar o valor, um campo pedindo esse valor só ocupa espaço e sugere que
 * existe algo a digitar. Quando a aba volta ao foco, a metade entra animada e
 * já focada, dizendo o que ela foi buscar.
 */
export function IrEVoltar({ la, jaTenho, ca, valor, aoMudar, aoConferir, aferido, saiu, aoSair, aoJaTer }: Props) {
  const [voltou, setVoltou] = useState(false)
  const campo = useRef<HTMLInputElement>(null)
  const id = useId()

  useEffect(() => {
    if (!saiu || voltou) return
    const conferir = () => {
      if (document.visibilityState === "visible") setVoltou(true)
    }
    document.addEventListener("visibilitychange", conferir)
    window.addEventListener("focus", conferir)
    return () => {
      document.removeEventListener("visibilitychange", conferir)
      window.removeEventListener("focus", conferir)
    }
  }, [saiu, voltou])

  // Foco só no desktop: no celular, focar abre o teclado por cima da tela e
  // esconde justamente a explicação do que colar.
  useEffect(() => {
    if (!voltou) return
    if (window.matchMedia("(pointer: coarse)").matches) return
    campo.current?.focus()
  }, [voltou])

  const mostrarCampo = saiu || valor.length > 0
  const erro = aferido.estado === "erro"

  return (
    <div className="flex flex-col gap-3">
      <section className="rounded-2xl bg-card p-7 ring-1 ring-border sm:p-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          lá no site deles
        </p>
        <h2 className="mt-4 text-xl font-bold tracking-tight">{la.titulo}</h2>
        <p className="mt-3 max-w-lg leading-relaxed text-muted-foreground">{la.texto}</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          {jaTenho && (
            <Button size="lg" onClick={aoJaTer} className="h-12 px-6">
              {jaTenho}
            </Button>
          )}
          <Button asChild size="lg" variant={jaTenho ? "secondary" : "default"} className="h-12 px-6">
            <a href={la.href} target="_blank" rel="noopener noreferrer" onClick={aoSair}>
              {la.botao}
              <ArrowSquareOut weight="bold" aria-hidden="true" className="ml-1" />
            </a>
          </Button>
        </div>
      </section>

      <AnimatePresence initial={false}>
        {mostrarCampo && (
          <motion.section
            key="ca"
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.4, ease: [0.2, 0, 0, 1] }}
            className="overflow-hidden"
          >
            <div
              className={cn(
                "rounded-2xl bg-card p-7 ring-1 transition-colors sm:p-8",
                voltou && aferido.estado === "vazio" ? "ring-success/40" : "ring-border",
              )}
            >
              <p
                className={cn(
                  "font-mono text-[11px] uppercase tracking-[0.16em]",
                  voltou && aferido.estado === "vazio" ? "text-success" : "text-muted-foreground",
                )}
              >
                {voltou && aferido.estado === "vazio" ? "bem-vindo de volta" : "e volta pra cá"}
              </p>
              <h2 className="mt-4 text-xl font-bold tracking-tight">{ca.titulo}</h2>
              <p className="mt-3 max-w-lg leading-relaxed text-muted-foreground">{ca.texto}</p>

              <label htmlFor={id} className="mt-6 block text-sm font-medium">
                {ca.rotulo}
              </label>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                <input
                  id={id}
                  ref={campo}
                  type="text"
                  value={valor}
                  onChange={(e) => aoMudar(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && aoConferir()}
                  placeholder={`${ca.exemplo}…`}
                  autoComplete="off"
                  spellCheck={false}
                  aria-invalid={erro || undefined}
                  aria-describedby={`${id}-msg`}
                  className={cn(
                    "h-12 flex-1 rounded-xl bg-background px-4 font-mono text-sm text-foreground",
                    "ring-1 ring-inset transition-shadow placeholder:font-sans placeholder:text-muted-foreground/70",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    erro ? "ring-destructive" : "ring-border",
                    aferido.estado === "ok" && "ring-success",
                  )}
                />
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={aoConferir}
                  className="h-12 px-6"
                >
                  {aferido.estado === "conferindo" ? "Conferindo…" : "Conferir"}
                </Button>
              </div>

              <p
                id={`${id}-msg`}
                aria-live="polite"
                className={cn(
                  "mt-3 flex items-start gap-2 text-sm",
                  aferido.estado === "ok" && "text-success",
                  erro && "text-destructive",
                  (aferido.estado === "vazio" || aferido.estado === "conferindo") && "text-muted-foreground",
                )}
              >
                {aferido.estado === "ok" && <CheckCircle weight="fill" aria-hidden="true" className="mt-0.5 size-4 shrink-0" />}
                {erro && <WarningCircle weight="fill" aria-hidden="true" className="mt-0.5 size-4 shrink-0" />}
                {aferido.mensagem ?? "Cole e a gente confere antes de seguir."}
              </p>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  )
}
