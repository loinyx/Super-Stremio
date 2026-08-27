/**
 * A luz atrás do herói.
 *
 * Degradê radial, e não círculo com `filter: blur()`. Os dois parecem iguais na
 * tela, mas o desfoque precisa ser rasterizado, e rasterizar 165px de raio em
 * quatro elementos de 868px pesa muito, principalmente no Safari. Degradê é
 * pintado direto.
 *
 * A deriva anima só translação. Escalar uma camada obriga o navegador a
 * redesenhá-la, e era isso que travava a página inteira ao clicar.
 */
const MANCHAS = [
  {
    cor: "oklch(0.46 0.27 296 / 0.4)",
    classe: "left-1/2 top-[-340px] size-[860px] -translate-x-1/2 animate-deriva-a",
  },
  {
    cor: "oklch(0.44 0.23 260 / 0.36)",
    classe: "left-[2%] top-[-200px] size-[620px] animate-deriva-b",
  },
  {
    cor: "oklch(0.47 0.25 350 / 0.3)",
    classe: "right-[0%] top-[-150px] size-[580px] animate-deriva-c",
  },
  {
    cor: "oklch(0.42 0.2 268 / 0.24)",
    classe: "left-[24%] top-[120px] size-[520px] animate-deriva-d",
  },
]

/** @param atenuado no fluxo a luz é pano de fundo de uma tarefa, e não o herói. */
export function Glow({ atenuado = false }: { atenuado?: boolean } = {}) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-x-0 top-0 h-[900px] overflow-hidden ${atenuado ? "opacity-45" : ""}
                 [mask-image:radial-gradient(72%_62%_at_50%_18%,#000,transparent)]
                 [mask-repeat:no-repeat] [mask-size:100%_100%]`}
    >
      {MANCHAS.map((m, i) => (
        <div key={i} className={`glow-blob absolute will-change-transform ${m.classe}`}>
          {/* Atraso negativo começa o ciclo no meio, então as quatro nunca
              escurecem juntas e o conjunto não pulsa em compasso. */}
          <div
            style={{
              background: `radial-gradient(circle at center, ${m.cor} 0%, transparent 68%)`,
              animationDelay: `${-i * 17}s`,
            }}
            className="animate-respiro size-full"
          />
        </div>
      ))}
    </div>
  )
}
