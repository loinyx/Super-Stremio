import { useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { ArrowSquareOut, CheckCircle, DownloadSimple, WarningCircle } from "@phosphor-icons/react"
import { Passo } from "../passo"
import { useFluxo } from "../estado"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { addonsQueExigem } from "@/lib/catalog.js"
import { injetarChaves, nomeDoArquivo } from "@/lib/inject.js"
import { validar } from "@/lib/validation.js"

/** O que cada fileira traz, em exemplos que a pessoa reconhece na tela inicial. */
const AMOSTRA: Record<string, string[]> = {
  "aio-metadata:em-alta": ["Netflix Top 10", "Em alta", "Top 250", "No ar hoje"],
  "aio-metadata:generos": ["Ação", "Terror", "Doramas", "Anos 90"],
  "aio-metadata:pijama": ["Até 90 minutos", "4K com Atmos", "Comédia romântica"],
  "aio-metadata:anime": ["Top da semana", "Por estúdio", "Próxima temporada"],
  "aio-metadata:curadoria": ["Oscar", "Cannes", "Cinema brasileiro"],
}

const LISTAS = addonsQueExigem("uuid-aiometadata")

/**
 * As cinco listas.
 *
 * É a mesma tarefa cinco vezes, e esconder isso não ajuda ninguém: o texto
 * assume a repetição e o desenho a torna suportável. Uma carta aberta por vez,
 * as outras viradas para baixo mostrando só o que vão virar na tela inicial, e
 * a contagem no topo dizendo quanto falta.
 */
export function PassoListas({ aoAvancar, aoVoltar }: { aoAvancar: () => void; aoVoltar: () => void }) {
  const { estado, anotar, cumprir } = useFluxo()
  const prontas = LISTAS.filter((l) => estado[l.id]?.validado).length
  const primeiraAberta = LISTAS.findIndex((l) => !estado[l.id]?.validado)
  const [aberta, setAberta] = useState(primeiraAberta === -1 ? 0 : primeiraAberta)

  return (
    <Passo
      titulo="As cinco fileiras da sua tela inicial"
      lede="É a mesma tarefa cinco vezes, uma por fileira: baixar um arquivo, importar no site do complemento e trazer o código de volta. Cada fileira precisa de uma aba nova. Uns oito minutos ao todo."
      aoAvancar={aoAvancar}
      aoVoltar={aoVoltar}
      travado={prontas === LISTAS.length ? undefined : `Faltam ${LISTAS.length - prontas} de ${LISTAS.length}.`}
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="flex flex-1 items-center gap-1.5" role="presentation">
          {LISTAS.map((l) => (
            <span
              key={l.id}
              className={cn(
                "h-1.5 flex-1 rounded-full",
                estado[l.id]?.validado ? "bg-success" : "bg-secondary",
              )}
            />
          ))}
        </div>
        <span className="font-mono text-xs tabular-nums text-muted-foreground">
          {prontas} de {LISTAS.length} prontas
        </span>
      </div>

      <ol className="flex flex-col gap-2.5">
        {LISTAS.map((lista, i) => (
          <Fileira
            key={lista.id}
            lista={lista}
            aberta={i === aberta}
            aoAbrir={() => setAberta(i)}
            chaveMdblist={estado["chave:mdblist"]?.valor}
            salvo={estado[lista.id]}
            aoAnotar={anotar}
            aoCumprir={cumprir}
            aoConcluir={() => {
              const proxima = LISTAS.findIndex((l, n) => n > i && !estado[l.id]?.validado)
              if (proxima !== -1) setAberta(proxima)
            }}
          />
        ))}
      </ol>
    </Passo>
  )
}

type Lista = (typeof LISTAS)[number]

/** O número da etapa. Aqui a sequência é estrita e executada em outro site, e é
 *  por isso que ela é numerada: a ordem carrega informação. */
function Numero({ n }: { n: number }) {
  return (
    <span
      aria-hidden="true"
      className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-secondary text-xs font-semibold text-muted-foreground"
    >
      {n}
    </span>
  )
}

/** Palavra que aparece com essas letras exatas na tela do outro site. */
function Termo({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[13px] font-medium text-foreground">
      {children}
    </span>
  )
}

type FileiraProps = {
  lista: Lista
  aberta: boolean
  aoAbrir: () => void
  chaveMdblist?: string
  salvo?: { valor: string; validado: boolean; abriu?: boolean; baixou?: boolean; mensagem?: string }
  aoAnotar: (chave: string, valor: string, r: { ok: boolean; mensagem?: string; url?: string }) => void
  aoCumprir: (chave: string, passo: "abriu" | "ajustou" | "baixou") => void
  aoConcluir: () => void
}

function Fileira({ lista, aberta, aoAbrir, chaveMdblist, salvo, aoAnotar, aoCumprir, aoConcluir }: FileiraProps) {
  const [valor, setValor] = useState(salvo?.valor ?? "")
  const [conferindo, setConferindo] = useState(false)
  const [msg, setMsg] = useState(salvo?.mensagem)
  const pronta = Boolean(salvo?.validado)

  const baixar = async () => {
    if (!lista.template) return
    const r = await fetch(`templates/${lista.template}`)
    const { arquivo, aplicadas } = injetarChaves(await r.json(), lista, { mdblist: chaveMdblist })
    const url = URL.createObjectURL(new Blob([JSON.stringify(arquivo, null, 2)], { type: "application/json" }))
    const a = document.createElement("a")
    a.href = url
    a.download = nomeDoArquivo(lista.template, aplicadas)
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    aoCumprir(lista.id, "baixou")
  }

  const conferir = async () => {
    setConferindo(true)
    const r = await validar(lista, valor.trim())
    setConferindo(false)
    setMsg(r.mensagem)
    aoAnotar(lista.id, valor.trim(), { ok: r.ok, mensagem: r.mensagem, url: r.url })
    if (r.ok) aoConcluir()
  }

  return (
    <li
      className={cn(
        "overflow-hidden rounded-2xl ring-1 transition-colors",
        aberta ? "bg-card ring-primary/35" : "bg-card/60 ring-border",
      )}
    >
      <button
        type="button"
        onClick={aoAbrir}
        aria-expanded={aberta}
        className="flex w-full items-center gap-4 p-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span aria-hidden="true" className="shrink-0">
          {pronta ? (
            <CheckCircle weight="fill" className="size-6 text-success" />
          ) : (
            <span className="block size-6 rounded-full ring-2 ring-inset ring-border" />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <strong className={cn("block text-base font-bold", pronta && "text-muted-foreground")}>
            {lista.nome}
          </strong>
          <span className="mt-1 block truncate text-sm text-muted-foreground">
            {AMOSTRA[lista.id]?.join(" · ")}
          </span>
        </span>
        {!aberta && (
          <span className="shrink-0 text-sm font-medium text-muted-foreground">
            {pronta ? "Trocar" : "Fazer"}
          </span>
        )}
      </button>

      <AnimatePresence initial={false}>
        {aberta && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.2, 0, 0, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-border p-6">
              <ol className="flex flex-col gap-4">
                <li className="grid grid-cols-[24px_1fr] gap-x-3 gap-y-2">
                  <Numero n={1} />
                  <div>
                    <p className="text-sm font-semibold">Baixe o arquivo desta fileira</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Ele já sai com a sua chave dentro. Você não vai digitar nada lá.
                    </p>
                    <Button variant="secondary" onClick={baixar} className="mt-3 h-10">
                      <DownloadSimple weight="bold" aria-hidden="true" />
                      Baixar o arquivo
                    </Button>
                  </div>
                </li>

                <li className="grid grid-cols-[24px_1fr] gap-x-3 gap-y-2">
                  <Numero n={2} />
                  <div>
                    <p className="text-sm font-semibold">Abra o configurador numa aba nova</p>
                    <p className="mt-1 flex items-start gap-2 text-sm text-muted-foreground">
                      <WarningCircle weight="fill" aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-accent" />
                      <span>
                        <span className="text-foreground">Uma aba por fileira, sem exceção.</span>{" "}
                        Reaproveitar a aba anterior salva por cima dela, e sobra uma fileira em vez
                        de cinco.
                      </span>
                    </p>
                    <Button asChild variant="secondary" className="mt-3 h-10">
                      <a
                        href={lista.configurador}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => aoCumprir(lista.id, "abriu")}
                      >
                        Abrir o configurador
                        <ArrowSquareOut weight="bold" aria-hidden="true" />
                      </a>
                    </Button>
                  </div>
                </li>

                <li className="grid grid-cols-[24px_1fr] gap-x-3 gap-y-2">
                  <Numero n={3} />
                  <div>
                    <p className="text-sm font-semibold">Lá dentro, nesta ordem</p>
                    <ol className="mt-2 flex flex-col gap-1.5 text-sm text-muted-foreground">
                      <li>Abra a aba <Termo>Configuration</Termo></li>
                      <li>Desça até <Termo>Import &amp; Export</Termo></li>
                      <li>Clique em <Termo>Import Configuration</Termo> e escolha o arquivo baixado</li>
                      <li>Clique em <Termo>Save Configuration</Termo></li>
                      <li>Crie uma senha e anote, porque não tem como recuperar</li>
                      <li>Copie o código que aparecer na tela</li>
                    </ol>
                  </div>
                </li>

                <li className="grid grid-cols-[24px_1fr] gap-x-3 gap-y-2">
                  <Numero n={4} />
                  <div>
                    <label htmlFor={`uuid-${lista.id}`} className="text-sm font-semibold">
                      Cole o código aqui
                    </label>
                    <div className="mt-3 flex flex-col gap-2.5 sm:flex-row">
                      <input
                        id={`uuid-${lista.id}`}
                        type="text"
                        value={valor}
                        onChange={(e) => setValor(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && conferir()}
                        placeholder="cole o código desta fileira…"
                        autoComplete="off"
                        spellCheck={false}
                        className={cn(
                          "h-11 flex-1 rounded-xl bg-background px-4 font-mono text-sm ring-1 ring-inset",
                          "placeholder:font-sans placeholder:text-muted-foreground/70",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          pronta ? "ring-success" : "ring-border",
                        )}
                      />
                      <Button variant="secondary" onClick={conferir} className="h-11">
                        {conferindo ? "Conferindo…" : "Conferir"}
                      </Button>
                    </div>
                    <p
                      aria-live="polite"
                      className={cn("mt-3 text-sm", pronta ? "text-success" : "text-muted-foreground")}
                    >
                      {msg ?? "Cada fileira tem o seu código, e nenhum se repete."}
                    </p>
                  </div>
                </li>
              </ol>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  )
}
