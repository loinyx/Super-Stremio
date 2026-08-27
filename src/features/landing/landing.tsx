import { ArrowDown, ArrowRight } from "@phosphor-icons/react"
import { PosterArc } from "@/components/poster-arc"
import { BlurFade } from "@/components/ui/blur-fade"
import { BorderBeam } from "@/components/ui/border-beam"
import { Button } from "@/components/ui/button"
import { MagicCard } from "@/components/ui/magic-card"
import { ProvaAddons, ProvaCatalogos, ProvaFicha, ProvaLegendas, ProvaStreams } from "./provas"

/** O que o site entrega, na ordem em que a pessoa sente cada coisa. */
const PILARES = [
  {
    id: "catalogos",
    titulo: "Você abre e já sabe o que ver",
    texto:
      "Domingo à noite, sem ideia do que assistir. Você desce a tela e escolhe: o que entrou " +
      "na Netflix essa semana, os melhores dos anos 90, coreanos, cinema brasileiro.",
    prova: <ProvaCatalogos />,
  },
  {
    id: "legendas",
    titulo: "A legenda já está lá, em português",
    texto:
      "Nada de procurar legenda nem ficar ajustando o atraso até a fala bater com o texto. " +
      "Ela vem pronta e no tempo certo.",
    prova: <ProvaLegendas />,
  },
  {
    id: "debrid",
    titulo: "A lista de opções chega pronta",
    texto:
      "Cada linha vem escrita para gente ler: qualidade em destaque, se é dublado e o " +
      "tamanho. As melhores ficam em cima, e você escolhe uma em vez de garimpar entre " +
      "sessenta.",
    prova: <ProvaStreams />,
  },
  {
    id: "ficha",
    titulo: "Tudo em português, com a arte certa",
    texto:
      "Nome, sinopse e elenco traduzidos, e a arte do título no lugar do nome escrito em " +
      "letra sem graça. Vale para série também.",
    prova: <ProvaFicha />,
  },
  {
    id: "addons",
    titulo: "Você não precisa configurar nada",
    texto:
      "São onze complementos, instalados e ajustados de uma vez. Você não precisa saber o " +
      "que cada um faz.",
    prova: <ProvaAddons />,
  },
]

export function Landing({ aoComecar }: { aoComecar: () => void }) {
  const paraOnboarding = () =>
    document.getElementById("o-que-tem")?.scrollIntoView({ behavior: "smooth", block: "start" })

  return (
    <div className="relative">
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-x-0 top-0 h-[400px] [perspective:1200px]
                     [mask-image:linear-gradient(to_right,transparent,#000_18%,#000_82%,transparent)]"
        >
          <div className="h-full [mask-image:linear-gradient(to_bottom,#000_45%,transparent)]">
            <PosterArc className="translate-y-[190px]" largura={128} />
          </div>
        </div>

        <div className="relative mx-auto flex max-w-3xl flex-col items-center px-6 pb-24 pt-[300px] text-center">
          <BlurFade delay={0.15} inView>
            <p className="font-mono text-xs tracking-[0.2em] text-primary">super stremio</p>
          </BlurFade>
          <BlurFade delay={0.25} inView>
            <h1 className="mt-5 text-balance text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
              O Stremio organizado de uma vez por todas
            </h1>
          </BlurFade>
          <BlurFade delay={0.38} inView>
            <p className="mx-auto mt-7 max-w-[34rem] text-pretty text-lg leading-[1.6] text-muted-foreground">
              Tudo organizado, legenda em português e o play funcionando
              de primeira.
            </p>
          </BlurFade>
          <BlurFade delay={0.5} inView>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Button size="lg" onClick={aoComecar} className="group h-12 px-7 text-base">
                Começar agora
                <ArrowRight weight="bold" className="ml-1 transition-transform group-hover:translate-x-0.5" />
              </Button>
              <Button size="lg" variant="ghost" onClick={paraOnboarding} className="group h-12 px-6 text-base">
                Saber mais
                <ArrowDown weight="bold" className="ml-1 transition-transform group-hover:translate-y-0.5" />
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">Leva uns quinze minutos, e é de graça</p>
          </BlurFade>
        </div>
      </section>

      <section id="o-que-tem" className="mx-auto max-w-5xl scroll-mt-16 px-6 pb-28">
        <BlurFade delay={0.05} inView>
          <p className="font-mono text-xs tracking-[0.2em] text-primary">depois de instalar</p>
          <h2 className="mt-4 max-w-xl text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            O que muda no dia a dia
          </h2>
        </BlurFade>

        <div className="mt-12 flex flex-col gap-5">
          {PILARES.map((p, i) => (
            <BlurFade key={p.id} delay={0.08} inView>
              <MagicCard
                className="rounded-2xl"
                gradientFrom="var(--primary)"
                gradientTo="var(--accent)"
                gradientOpacity={0.12}
              >
                <article className="grid items-center gap-8 p-8 md:grid-cols-2 md:gap-12 md:p-10">
                  <div className={i % 2 === 1 ? "md:order-2" : undefined}>
                    <p className="font-mono text-xs text-primary">0{i + 1}</p>
                    <h3 className="mt-3 text-balance text-2xl font-bold tracking-tight">{p.titulo}</h3>
                    <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">{p.texto}</p>
                  </div>
                  <div className={i % 2 === 1 ? "md:order-1" : undefined}>
                    <div className="rounded-xl bg-secondary/40 p-5 ring-1 ring-border">{p.prova}</div>
                  </div>
                </article>
              </MagicCard>
            </BlurFade>
          ))}
        </div>

        <BlurFade delay={0.1} inView>
          <div className="relative mt-8 overflow-hidden rounded-2xl bg-card p-10 text-center ring-1 ring-border">
            <BorderBeam size={220} duration={10} />
            <h2 className="text-balance text-2xl font-bold tracking-tight sm:text-3xl">
              Fica tudo na sua conta
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-pretty leading-relaxed text-muted-foreground">
              Configuração de addon não é um arquivo que se passa adiante: ela mora na conta
              de quem criou. O site monta a sua do zero, com as suas chaves, em quinze minutos.
            </p>
            <Button size="lg" onClick={aoComecar} className="group mt-8 h-12 px-7 text-base">
              Começar
              <ArrowRight weight="bold" className="ml-1 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </div>
        </BlurFade>
      </section>
    </div>
  )
}
