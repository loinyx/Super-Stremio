/**
 * A luz atrás do herói.
 *
 * São quatro manchas borradas que derivam devagar, em vez de um gradiente fixo.
 * Cada uma anima só `transform`: o borrão é rasterizado uma vez e depois apenas
 * se move, então a página não repinta. Animar o gradiente de fundo repintaria a
 * tela inteira a cada quadro, que foi o que já derrubou esta página antes.
 *
 * As cores aqui não são as da paleta. Elas são escuras e de croma alto, e não
 * claras: sobre um fundo quase preto, mancha clara lava o fundo e vira leitosa,
 * enquanto mancha escura e saturada acrescenta cor sem tirar a profundidade. Os
 * matizes abrem para os dois lados do roxo, no azul e no rosa, para o olho ver
 * mais de uma cor.
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
    classe: "left-[24%] top-[120px] size-[520px] animate-deriva-b",
  },
]

export function Glow() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 h-[900px] overflow-hidden
                 [mask-image:radial-gradient(72%_62%_at_50%_18%,#000,transparent)]
                 [mask-repeat:no-repeat] [mask-size:100%_100%]"
    >
      {MANCHAS.map((m, i) => (
        <div
          key={i}
          style={{ background: m.cor }}
          className={`glow-blob absolute rounded-full blur-[165px] will-change-transform ${m.classe}`}
        />
      ))}
    </div>
  )
}
