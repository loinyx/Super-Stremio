import { PosterArc } from "@/components/poster-arc"
import { BlurFade } from "@/components/ui/blur-fade"

export function App() {
  return (
    <main className="relative min-h-dvh overflow-hidden">
      {/* A faixa de pôsteres é decoração e fica atrás de tudo. A máscara come
          as pontas para o anel não terminar num corte reto. */}
      <div
        className="absolute inset-x-0 top-0 h-[400px] [perspective:1200px]
                   [mask-image:linear-gradient(to_right,transparent,#000_18%,#000_82%,transparent)]"
      >
        <div className="[mask-image:linear-gradient(to_bottom,#000_45%,transparent)] h-full">
          <PosterArc className="translate-y-[190px]" largura={128} />
        </div>
      </div>

      <div className="relative mx-auto flex max-w-3xl flex-col items-center px-6 pt-[300px] text-center">
        <BlurFade delay={0.15} inView>
          <p className="font-mono text-xs tracking-[0.2em] text-primary">super stremio</p>
        </BlurFade>
        <BlurFade delay={0.25} inView>
          <h1 className="mt-5 text-balance text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
            Um Stremio que abre em português
          </h1>
        </BlurFade>
        <BlurFade delay={0.38} inView>
          <p className="mx-auto mt-6 max-w-xl text-balance text-lg leading-relaxed text-muted-foreground">
            Onze addons, cento e cinquenta catálogos e legenda que aparece. Você
            monta tudo com as suas contas, em quinze minutos.
          </p>
        </BlurFade>
      </div>
    </main>
  )
}
