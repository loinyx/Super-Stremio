import { useState } from "react"
import { AnimatePresence } from "motion/react"
import { Button } from "@/components/ui/button"
import { Glow } from "@/features/landing/glow"
import { Progresso } from "./progresso"
import { ProvedorDoFluxo } from "./estado"
import { PassoAplicativo } from "./passos/aplicativo"
import { PassoMdblist } from "./passos/mdblist"
import { PassoDebrid } from "./passos/debrid"
import { PassoListas } from "./passos/listas"

const TOTAL = 8

/**
 * O fluxo.
 *
 * Uma tarefa por tela. O que orienta é o traço lá em cima, e sair salva sozinho,
 * porque o estado mora no navegador desde o primeiro clique.
 */
function Palco({ aoSair }: { aoSair: () => void }) {
  const [passo, setPasso] = useState(0)

  const avancar = () => setPasso((n) => Math.min(n + 1, TOTAL - 1))
  const voltar = () => setPasso((n) => Math.max(n - 1, 0))

  return (
    <div className="relative min-h-dvh">
      <Glow atenuado />

      <header className="relative mx-auto flex max-w-4xl items-center justify-between gap-6 px-6 py-6">
        <Progresso atual={passo} total={TOTAL} />
        <Button variant="ghost" size="sm" onClick={aoSair} className="text-muted-foreground">
          Salvar e sair
        </Button>
      </header>

      <main className="relative mx-auto max-w-4xl px-6 pb-32 pt-10">
        <AnimatePresence mode="wait">
          {passo === 0 && <PassoAplicativo key="app" aoAvancar={avancar} />}
          {passo === 1 && <PassoMdblist key="mdb" aoAvancar={avancar} aoVoltar={voltar} />}
          {passo === 2 && <PassoDebrid key="deb" aoAvancar={avancar} aoVoltar={voltar} />}
          {passo === 3 && <PassoListas key="lst" aoAvancar={avancar} aoVoltar={voltar} />}
          {passo > 3 && (
            <div key="wip" className="mx-auto max-w-2xl text-center">
              <h1 className="text-3xl font-extrabold tracking-tight">Os próximos passos vêm a seguir</h1>
              <p className="mt-4 text-muted-foreground">
                As cinco listas, as fontes, as legendas, a revisão e a instalação ainda estão sendo
                construídos nesta direção.
              </p>
              <Button variant="secondary" onClick={voltar} className="mt-8">
                Voltar
              </Button>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}

export function Fluxo({ aoSair }: { aoSair: () => void }) {
  return (
    <ProvedorDoFluxo>
      <Palco aoSair={aoSair} />
    </ProvedorDoFluxo>
  )
}
