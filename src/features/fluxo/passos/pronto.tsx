import { CheckCircle } from "@phosphor-icons/react"
import { motion } from "motion/react"
import { Button } from "@/components/ui/button"
import { useFluxo } from "../estado"

/** A tela final. Diz a única coisa que ainda falta fazer, que é fora daqui. */
export function PassoPronto({ aoSair }: { aoSair: () => void }) {
  const { recomecar } = useFluxo()
  return (
    <motion.div
      initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.4, ease: [0.2, 0, 0, 1] }}
      className="mx-auto max-w-xl text-center"
    >
      <CheckCircle weight="fill" aria-hidden="true" className="mx-auto size-14 text-success" />
      <h1 className="mt-6 text-balance text-3xl font-extrabold tracking-tight sm:text-4xl">
        Está tudo instalado
      </h1>
      <p className="mx-auto mt-5 max-w-md text-pretty leading-relaxed text-muted-foreground">
        Feche e abra o aplicativo. Os catálogos aparecem na tela inicial, e a primeira abertura
        demora um pouco mais enquanto ele busca as capas.
      </p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <Button size="lg" onClick={aoSair} className="h-12 px-7">
          Voltar ao início
        </Button>
        <Button
          size="lg"
          variant="ghost"
          className="h-12 text-muted-foreground"
          onClick={() => {
            recomecar()
            aoSair()
          }}
        >
          Começar do zero
        </Button>
      </div>
    </motion.div>
  )
}
