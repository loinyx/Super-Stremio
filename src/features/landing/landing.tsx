import { ArrowDown, ArrowRight } from "@phosphor-icons/react"
import { PosterArc } from "@/components/poster-arc"
import { BlurFade } from "@/components/ui/blur-fade"
import { BorderBeam } from "@/components/ui/border-beam"
import { Button } from "@/components/ui/button"
import { MagicCard } from "@/components/ui/magic-card"
import { ProvaAddons, ProvaCatalogos, ProvaLegendas, ProvaStreams } from "./provas"

/** O que o site entrega, na ordem em que a pessoa sente cada coisa. */
const PILARES = [
  {
    id: "catalogos",
    titulo: "Você abre e já sabe onde procurar",
    texto:
      "Domingo à noite, sem ideia do que ver. Em vez de digitar um nome na busca, você desce " +
      "a tela: o que entrou na Netflix essa semana, os melhores de 2019, coreanos, terror " +
      "japonês, cinema brasileiro. São 150 recortes desses, e eles se refazem sozinhos, " +
      "porque saem do IMDb.",
    prova: <ProvaCatalogos />,
  },
  {
    id: "legendas",
    titulo: "A legenda já está certa quando o filme começa",
    texto:
      "Você não vai abrir três opções para testar qual está no tempo. O idioma já vem em " +
      "português, a sincronia se corrige sozinha, e quando não existe legenda em PT-BR uma " +
      "das fontes traduz na hora. Episódio que estreou ontem costuma ter legenda aqui antes " +
      "de qualquer outro lugar.",
    prova: <ProvaLegendas />,
  },
  {
    id: "debrid",
    titulo: "Uma lista de streams, não sessenta",
    texto:
      "Apertar play devia dar uma escolha, não sessenta linhas com o mesmo filme repetido, " +
      "sem ordem, misturando 4K com gravação feita dentro do cinema. O que o seu debrid " +
      "encontra chega junto e ordenado: dublado primeiro, 4K antes de 1080p, e cam nem " +
      "aparece.",
    prova: <ProvaStreams />,
  },
  {
    id: "addons",
    titulo: "Os onze addons já vêm conversando entre si",
    texto:
      "Instalar addon é a parte fácil. Difícil é fazer onze funcionarem juntos sem repetir " +
      "resultado nem brigar por prioridade, e essa parte já está decidida: o que cada um " +
      "busca, em que ordem aparece, e o que é descartado antes de chegar em você.",
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
              Catálogo separado por serviço, gênero e década, legenda em português
              já escolhida, e o seu debrid devolvendo uma lista em vez de sessenta linhas.
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
              Roda na sua conta, não na minha
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-pretty leading-relaxed text-muted-foreground">
              Cada configuração fica guardada no servidor do serviço que a criou, presa a uma
              conta. Não dá para te emprestar as minhas, então o site monta as suas: você
              cola as suas chaves e ele devolve tudo pronto para importar.
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
