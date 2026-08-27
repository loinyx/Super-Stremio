import { useEffect, useRef } from "react"
import { POSTERES, urlDoPoster } from "@/lib/posters"
import { cn } from "@/lib/utils"

type Props = {
  className?: string
  /** Largura de um pôster em pixels. A altura sai da proporção 2:3, e o raio
   *  do anel sai da largura, para os pôsteres nunca se atravessarem. */
  largura?: number
  /** Segundos para uma volta completa. */
  volta?: number
}

/**
 * Anel de pôsteres girando devagar, em perspectiva de verdade.
 *
 * Cada pôster ocupa uma posição fixa de um cilindro e o anel inteiro gira. A
 * volta é calculada num único `requestAnimationFrame` que escreve direto no
 * estilo, sem passar pelo React: são dezesseis elementos por quadro, e
 * re-renderizar isso sessenta vezes por segundo derrubaria a página.
 *
 * É decoração. Fica fora da árvore de acessibilidade e não recebe clique.
 */
export function PosterArc({ className, largura = 132, volta = 90 }: Props) {
  const anel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const cartas = Array.from(anel.current?.children ?? []) as HTMLElement[]
    if (cartas.length === 0) return

    const n = cartas.length
    const passo = 360 / n
    // Meia largura dividida pela tangente do meio passo é o raio em que os
    // pôsteres ficam encostados. Um pouco mais afasta e deixa respirar.
    const raio = (largura / 2) / Math.tan(Math.PI / n) * 1.08

    // Guarda o que já foi escrito. Reescrever a mesma string de filtro sessenta
    // vezes por segundo obriga o navegador a rasterizar o desfoque de novo, e é
    // isso que fazia a página piscar enquanto rolava.
    const ultimo = cartas.map(() => ({ opacidade: "", filtro: "", z: "" }))

    const posicionar = (giro: number) => {
      for (let i = 0; i < n; i++) {
        let a = (i * passo + giro) % 360
        if (a > 180) a -= 360
        if (a < -180) a += 360

        const distancia = Math.abs(a) / 90
        const carta = cartas[i]

        // Transform é composto na GPU e pode mudar todo quadro sem custo.
        carta.style.transform = `rotateY(${a}deg) translateZ(${raio}px)`

        // Opacidade, desfoque e empilhamento só mudam quando mudam de verdade,
        // arredondados para o olho não notar o degrau.
        const opacidade = distancia >= 1 ? "0" : ((1 - distancia ** 2) * 0.92).toFixed(2)
        const filtro =
          `brightness(${(1 - distancia * 0.5).toFixed(2)}) blur(${(Math.round(distancia ** 3 * 8) / 2).toFixed(1)}px)`
        const z = String(Math.round(100 - Math.abs(a)))

        const antes = ultimo[i]
        if (antes.opacidade !== opacidade) carta.style.opacity = (antes.opacidade = opacidade)
        if (antes.filtro !== filtro) carta.style.filter = (antes.filtro = filtro)
        if (antes.z !== z) carta.style.zIndex = (antes.z = z)
      }
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      posicionar(0)
      return
    }

    let quadro = 0
    let inicio = 0
    let decorrido = 0
    const girar = (t: number) => {
      if (!inicio) inicio = t
      decorrido = t - inicio
      posicionar(-((decorrido / (volta * 1000)) * 360))
      quadro = requestAnimationFrame(girar)
    }

    // Fora da tela o anel não anima. Sem isto ele segue repintando dezesseis
    // imagens desfocadas enquanto a pessoa lê o resto da página.
    const olho = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting && !quadro) {
          inicio = 0
          quadro = requestAnimationFrame((t) => {
            inicio = t - decorrido
            girar(t)
          })
        } else if (!entrada.isIntersecting && quadro) {
          cancelAnimationFrame(quadro)
          quadro = 0
        }
      },
      { rootMargin: "120px" },
    )
    if (anel.current?.parentElement) olho.observe(anel.current.parentElement)

    return () => {
      olho.disconnect()
      if (quadro) cancelAnimationFrame(quadro)
    }
  }, [largura, volta])

  return (
    <div aria-hidden className={cn("pointer-events-none select-none", className)}>
      <div
        ref={anel}
        className="relative mx-auto size-0 [transform-style:preserve-3d] [transform:rotateX(7deg)]"
      >
        {POSTERES.map((filme) => (
          <div
            key={filme.id}
            className="poster-carta absolute left-1/2 top-1/2 overflow-hidden rounded-xl bg-muted shadow-[0_24px_60px_-12px_rgba(0,0,0,.7)] ring-1 ring-white/10 [will-change:transform,opacity,filter]"
            style={{
              width: largura,
              height: Math.round(largura * 1.5),
              marginLeft: -largura / 2,
              marginTop: -Math.round(largura * 1.5) / 2,
            }}
          >
            <img
              src={urlDoPoster(filme.id)}
              alt=""
              loading="lazy"
              decoding="async"
              draggable={false}
              className="size-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
