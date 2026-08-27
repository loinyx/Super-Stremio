import { useState } from "react"
import { AnimatePresence } from "motion/react"
import { Button } from "@/components/ui/button"
import { Glow } from "@/features/landing/glow"
import { Progresso } from "./progresso"
import { TrocaTema } from "@/components/troca-tema"
import { ProvedorDoFluxo } from "./estado"
import { PassoAplicativo } from "./passos/aplicativo"
import { PassoMdblist } from "./passos/mdblist"
import { PassoDebrid } from "./passos/debrid"
import { PassoListas } from "./passos/listas"
import { PassoFontes } from "./passos/fontes"
import { PassoLegendas } from "./passos/legendas"
import { PassoRevisao } from "./passos/revisao"
import { PassoInstalar } from "./passos/instalar"
import { PassoPronto } from "./passos/pronto"

const TOTAL = 8

/**
 * O fluxo.
 *
 * Uma tarefa por tela. O que orienta é o traço lá em cima, e sair salva sozinho,
 * porque o estado mora no navegador desde o primeiro clique.
 */
function Palco({ aoSair }: { aoSair: () => void }) {
  const [passo, setPasso] = useState(0)

  const avancar = () => setPasso((n) => Math.min(n + 1, TOTAL))
  const voltar = () => setPasso((n) => Math.max(n - 1, 0))

  return (
    <div className="relative min-h-dvh">
      <Glow atenuado />

      <header className="relative mx-auto flex max-w-4xl items-center justify-between gap-6 px-6 py-6">
        {passo < TOTAL && <Progresso atual={passo} total={TOTAL} />}
        <div className="flex items-center gap-1">
          <TrocaTema />
          <Button variant="ghost" size="sm" onClick={aoSair} className="text-muted-foreground">
            Salvar e sair
          </Button>
        </div>
      </header>

      <main className="relative mx-auto max-w-4xl px-6 pb-32 pt-10">
        <AnimatePresence mode="wait">
          {passo === 0 && <PassoAplicativo key="app" aoAvancar={avancar} />}
          {passo === 1 && <PassoMdblist key="mdb" aoAvancar={avancar} aoVoltar={voltar} />}
          {passo === 2 && <PassoDebrid key="deb" aoAvancar={avancar} aoVoltar={voltar} />}
          {passo === 3 && <PassoListas key="lst" aoAvancar={avancar} aoVoltar={voltar} />}
          {passo === 4 && <PassoFontes key="fon" aoAvancar={avancar} aoVoltar={voltar} />}
          {passo === 5 && <PassoLegendas key="leg" aoAvancar={avancar} aoVoltar={voltar} />}
          {passo === 6 && <PassoRevisao key="rev" aoAvancar={avancar} aoVoltar={voltar} />}
          {passo === 7 && (
            <PassoInstalar key="ins" aoVoltar={voltar} aoConcluir={() => setPasso(8)} />
          )}
          {passo === 8 && <PassoPronto key="pro" aoSair={aoSair} />}
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
