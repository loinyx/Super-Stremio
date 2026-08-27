import { useState } from "react"
import { ArrowSquareOut, CheckCircle, WarningCircle } from "@phosphor-icons/react"
import { Passo } from "../passo"
import { Etapa, Termo } from "../etapa"
import { Campo } from "../campo"
import { useFluxo } from "../estado"
import { Button } from "@/components/ui/button"
import { ADDONS } from "@/lib/catalog.js"
import { validar } from "@/lib/validation.js"

const COMUNIDADE = ADDONS.find((a) => a.id === "com.community.stremio-subtitles")!
const CONTA = "https://stremio-community-subtitles.top/account"

/**
 * As duas fontes de legenda.
 *
 * Uma entra sozinha e a outra pede conta. O ajuste de idioma e de provedores
 * acontece na conta, fora daqui, e pular isso é o jeito silencioso de o
 * complemento instalar e não devolver quase nada.
 */
export function PassoLegendas({ aoAvancar, aoVoltar }: { aoAvancar: () => void; aoVoltar: () => void }) {
  const { estado, anotar, cumprir } = useFluxo()
  const salvo = estado[COMUNIDADE.id]
  const [valor, setValor] = useState(salvo?.valor ?? "")
  const [conferindo, setConferindo] = useState(false)
  const [msg, setMsg] = useState(salvo?.mensagem)
  const pronta = Boolean(salvo?.validado)

  const conferir = async () => {
    setConferindo(true)
    const r = await validar(COMUNIDADE, valor.trim())
    setConferindo(false)
    setMsg(r.mensagem)
    anotar(COMUNIDADE.id, valor.trim(), { ok: r.ok, mensagem: r.mensagem, url: r.url , manifest: r.manifest })
  }

  return (
    <Passo
      titulo="A legenda em português"
      lede="São duas fontes de propósito. Uma cobre o buraco da outra, e juntas é raro faltar legenda."
      aoAvancar={aoAvancar}
      aoVoltar={aoVoltar}
      travado={pronta ? undefined : "Falta conferir o endereço para seguir."}
    >
      <div className="flex flex-col gap-3">
        <section className="flex items-start gap-4 rounded-2xl bg-card p-6 ring-1 ring-border">
          <CheckCircle weight="fill" aria-hidden="true" className="mt-0.5 size-6 shrink-0 text-success" />
          <div>
            <h2 className="text-base font-bold">A primeira já vem pronta</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Ela pega legenda em português sem pedir conta, traduz sozinha quando não existe
              nenhuma em português, e ajusta o atraso até a fala bater com o texto. Não tem nada
              para fazer aqui.
            </p>
          </div>
        </section>

        <section className="rounded-2xl bg-card p-6 ring-1 ring-border sm:p-7">
          <h2 className="text-base font-bold">A segunda é o acervo da comunidade</h2>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
            É onde a legenda de episódio novo costuma aparecer primeiro. Precisa de uma conta
            grátis, e de dois ajustes dentro dela.
          </p>

          <ol className="mt-6 flex flex-col gap-5">
            <Etapa n={1} titulo="Crie a conta">
              <p className="text-sm text-muted-foreground">Grátis, pede só um e-mail.</p>
              <Button asChild variant="secondary" className="mt-3 h-10">
                <a
                  href={COMUNIDADE.configurador}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => cumprir(COMUNIDADE.id, "abriu")}
                >
                  Criar a conta
                  <ArrowSquareOut weight="bold" aria-hidden="true" />
                </a>
              </Button>
            </Etapa>

            <Etapa n={2} titulo="Ajuste a conta, e isso não dá para fazer daqui">
              <p className="flex items-start gap-2 text-sm text-muted-foreground">
                <WarningCircle weight="fill" aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-accent" />
                <span>
                  <span className="text-foreground">Sem estes dois ajustes</span> o complemento
                  instala e devolve quase nada, ou devolve em inglês.
                </span>
              </p>
              <ol className="mt-3 flex flex-col gap-1.5 text-sm text-muted-foreground">
                <li>
                  Em <Termo>Language Preferences</Termo>, escolha português e salve. Ele nasce
                  procurando em inglês.
                </li>
                <li>
                  Em <Termo>Subtitle Providers</Termo>, clique em <Termo>Connect</Termo> e conecte
                  os três: <span className="text-foreground">OpenSubtitles.com</span>,{" "}
                  <span className="text-foreground">SubDL</span> e{" "}
                  <span className="text-foreground">SubSource</span>. Vale conectar todos, porque o
                  acervo sozinho é pequeno e são eles que enchem a lista. O primeiro pede usuário e
                  senha da conta de lá, e os outros dois pedem uma chave que aparece no painel
                  depois do cadastro.
                </li>
              </ol>
              <Button asChild variant="secondary" className="mt-3 h-10">
                <a
                  href={CONTA}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => cumprir(COMUNIDADE.id, "ajustou")}
                >
                  Abrir as configurações da conta
                  <ArrowSquareOut weight="bold" aria-hidden="true" />
                </a>
              </Button>
            </Etapa>

            <Etapa n={3} titulo="Cole o endereço do complemento">
              <Campo
                id="community-subtitles"
                rotulo="Endereço do complemento de legendas"
                valor={valor}
                aoMudar={setValor}
                aoConferir={conferir}
                conferindo={conferindo}
                ok={pronta}
                exemplo="https://stremio-community-subtitles.top/…/manifest.json"
                mensagem={msg ?? "Fica na página da conta, em Instalação do Addon."}
              />
            </Etapa>
          </ol>
        </section>
      </div>
    </Passo>
  )
}
