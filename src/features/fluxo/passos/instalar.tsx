import { useState } from "react"
import { ArrowRight, DownloadSimple, ShieldCheck, WarningCircle } from "@phosphor-icons/react"
import { Passo } from "../passo"
import { useFluxo } from "../estado"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ADDONS, linkInstalar, montarUrl } from "@/lib/catalog.js"
import { entrar, lerColecao, gravarColecao, mesclar, backupJson, ErroStremio } from "@/lib/stremio.js"
import { descritor, validar } from "@/lib/validation.js"

type Fase = { tipo: "parado" } | { tipo: "indo"; passo: string } | { tipo: "feito" } | { tipo: "erro"; texto: string }

/**
 * A instalação.
 *
 * Três caminhos, e o primeiro é o único que consegue arrumar a ordem e tirar o
 * que sobrou, porque só ele fala com a conta. Os outros dois não pedem senha
 * nenhuma, e existem para quem não quer entregar a dela.
 */
export function PassoInstalar({ aoVoltar, aoConcluir }: { aoVoltar: () => void; aoConcluir: () => void }) {
  const { estado } = useFluxo()
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [backup, setBackup] = useState(true)
  const [fase, setFase] = useState<Fase>({ tipo: "parado" })

  const debrids = Object.fromEntries(
    ["torbox", "realdebrid"]
      .map((id) => [id, estado[`chave:${id}`]?.ativo ? estado[`chave:${id}`]?.valor : ""])
      .filter(([, v]) => v),
  )

  /**
   * Monta a coleção na ordem do catálogo.
   *
   * O manifesto de verdade é obrigatório: o Stremio guarda o que recebe, e um
   * manifesto inventado instala um addon que aparece na lista e não devolve
   * nada. Quem já foi verificado tem o seu guardado; os automáticos, que nunca
   * passaram por um campo, são perguntados aqui.
   */
  const montarPacote = async () => {
    const pacote = []
    for (const a of ADDONS) {
      const salvo = estado[a.id]
      const url = a.exige === "nada" || a.exige === "debrid" ? montarUrl(a, "", debrids) : salvo?.url
      if (!url) continue

      if (salvo?.manifest) {
        pacote.push(descritor({ ok: true, url, manifest: salvo.manifest }, a))
        continue
      }
      const r = await validar(a, salvo?.valor ?? "", { debrids })
      if (r.ok) pacote.push(descritor(r, a))
    }
    return pacote
  }

  const instalar = async () => {
    if (!email || !senha) {
      setFase({ tipo: "erro", texto: "Preencha o e-mail e a senha da sua conta Stremio." })
      return
    }
    try {
      setFase({ tipo: "indo", passo: "Conferindo os complementos…" })
      const pacote = await montarPacote()

      setFase({ tipo: "indo", passo: "Entrando na conta…" })
      const chave = await entrar(email, senha)

      setFase({ tipo: "indo", passo: "Lendo a sua lista atual…" })
      const atual = await lerColecao(chave)

      if (backup) {
        const url = URL.createObjectURL(new Blob([backupJson(atual)], { type: "application/json" }))
        const a = document.createElement("a")
        a.href = url
        a.download = "meus-addons-antes-da-troca.json"
        a.click()
        setTimeout(() => URL.revokeObjectURL(url), 1000)
      }

      setFase({ tipo: "indo", passo: "Gravando a lista nova…" })
      await gravarColecao(chave, mesclar(atual, pacote))
      setFase({ tipo: "feito" })
      aoConcluir()
    } catch (e) {
      const texto =
        e instanceof ErroStremio
          ? e.message
          : "Não deu para falar com o Stremio agora. Confira a sua conexão e tente de novo."
      setFase({ tipo: "erro", texto })
    }
  }

  return (
    <Passo titulo="Instalar" aoVoltar={aoVoltar}>
      <div className="flex flex-col gap-3">
        <section className="rounded-2xl bg-card p-6 ring-1 ring-border sm:p-7">
          <div className="flex items-center gap-3">
            <ShieldCheck weight="fill" aria-hidden="true" className="size-5 text-primary" />
            <h2 className="flex-1 text-base font-bold">Entrando na sua conta Stremio</h2>
            <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
              mais rápido
            </span>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            É o único caminho que consegue arrumar a ordem e tirar o que sobrou. A senha vai do seu
            navegador direto para o Stremio, e não passa por lugar nenhum no meio.
          </p>

          <p className="mt-4 flex items-start gap-2.5 text-sm leading-relaxed">
            <WarningCircle weight="fill" aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-accent" />
            <span>
              <span className="font-semibold text-foreground">Isto troca a sua lista inteira.</span>{" "}
              Os complementos daqui fazem o que os seus faziam, e manter os dois duplica resultado.
              O Cinemeta e o de vídeos do seu computador ficam, porque o Stremio protege esses dois.
            </span>
          </p>

          <div className="mt-6 flex flex-col gap-3">
            <div>
              <label htmlFor="s-mail" className="text-sm font-medium">
                E-mail
              </label>
              <input
                id="s-mail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                spellCheck={false}
                placeholder="o mesmo da sua conta Stremio…"
                className="mt-2 h-11 w-full rounded-xl bg-background px-4 text-sm ring-1 ring-inset ring-border placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div>
              <label htmlFor="s-pass" className="text-sm font-medium">
                Senha
              </label>
              <input
                id="s-pass"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                autoComplete="current-password"
                placeholder="a senha do Stremio…"
                className="mt-2 h-11 w-full rounded-xl bg-background px-4 text-sm ring-1 ring-inset ring-border placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>

          <label className="mt-5 flex cursor-pointer items-center gap-3 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={backup}
              onChange={(e) => setBackup(e.target.checked)}
              className="size-[18px] accent-[var(--primary)]"
            />
            Baixar uma cópia dos meus complementos atuais antes de trocar
          </label>

          <Button size="lg" onClick={instalar} disabled={fase.tipo === "indo"} className="mt-6 h-12 px-7">
            {fase.tipo === "indo" ? fase.passo : "Instalar na minha conta"}
            {fase.tipo !== "indo" && <ArrowRight weight="bold" aria-hidden="true" className="ml-1" />}
          </Button>

          <p
            aria-live="polite"
            className={cn(
              "mt-3 text-sm",
              fase.tipo === "erro" ? "text-destructive" : "text-muted-foreground",
            )}
          >
            {fase.tipo === "erro" ? fase.texto : fase.tipo === "feito" ? "Pronto." : ""}
          </p>
        </section>

        <section className="rounded-2xl bg-card p-6 ring-1 ring-border sm:p-7">
          <h2 className="text-base font-bold">Sem entrar em conta nenhuma</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Um clique por complemento. O aplicativo abre e pergunta se você quer instalar. Não
            arruma a ordem nem tira o que sobrou, mas não pede senha.
          </p>
          <ul className="mt-5 flex flex-col gap-2">
            {ADDONS.map((a) => {
              const url = a.exige === "nada" || a.exige === "debrid" ? montarUrl(a, "", debrids) : estado[a.id]?.url
              return (
                <li
                  key={a.id}
                  className="flex items-center gap-3 rounded-xl bg-background/60 px-4 py-2.5 ring-1 ring-border"
                >
                  <span className="flex-1 text-sm font-medium">{a.nome}</span>
                  {url ? (
                    <Button asChild variant="secondary" className="h-10">
                      <a href={linkInstalar(url)}>Instalar</a>
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground">falta conferir</span>
                  )}
                </li>
              )
            })}
          </ul>
        </section>

        <section className="rounded-2xl bg-card p-6 ring-1 ring-border sm:p-7">
          <h2 className="text-base font-bold">Guardar o que você montou</h2>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
            Baixa um arquivo com tudo que você preencheu aqui, incluindo as chaves e os
            identificadores. Serve para reinstalar depois sem refazer nada.
          </p>
          <p className="mt-3 flex items-start gap-2.5 text-sm leading-relaxed">
            <WarningCircle weight="fill" aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-accent" />
            <span className="text-muted-foreground">
              O arquivo carrega as suas chaves em texto. Guarde como você guardaria uma senha, e
              não mande para ninguém.
            </span>
          </p>
          <Button
            variant="secondary"
            className="mt-4 h-11"
            onClick={() => {
              const url = URL.createObjectURL(
                new Blob([JSON.stringify(estado, null, 2)], { type: "application/json" }),
              )
              const a = document.createElement("a")
              a.href = url
              a.download = "super-stremio-com-minhas-chaves.json"
              a.click()
              setTimeout(() => URL.revokeObjectURL(url), 1000)
            }}
          >
            <DownloadSimple weight="bold" aria-hidden="true" />
            Baixar a minha configuração
          </Button>
        </section>
      </div>
    </Passo>
  )
}
