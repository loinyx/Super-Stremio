import { useState } from "react"
import { Landing } from "@/features/landing/landing"
import { Fluxo } from "@/features/fluxo/fluxo"

export function App() {
  const [noFluxo, setNoFluxo] = useState(false)

  return (
    <main className="min-h-dvh">
      {noFluxo ? (
        <Fluxo aoSair={() => setNoFluxo(false)} />
      ) : (
        <Landing aoComecar={() => setNoFluxo(true)} />
      )}
    </main>
  )
}
