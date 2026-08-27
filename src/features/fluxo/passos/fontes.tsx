import { useState } from "react"
import { ArrowSquareOut, DownloadSimple, WarningCircle } from "@phosphor-icons/react"
import { Passo } from "../passo"
import { Etapa, Termo } from "../etapa"
import { useFluxo } from "../estado"
import { Button } from "@/components/ui/button"
import { Campo } from "../campo"
import { ADDONS } from "@/lib/catalog.js"
import { injetarChaves, nomeDoArquivo } from "@/lib/inject.js"
import { validar } from "@/lib/validation.js"

const AIO = ADDONS.find((a) => a.id === "com.aiostreams.viren070")!

/**
 * O organizador das fontes.
 *
 * Dois avisos aqui não são detalhe: ficar no modo Simple, e não encostar em
 * Required Languages. Os dois zeram a lista de opções em silêncio, e sem eles
 * a pessoa instala tudo e conclui que o setup não funciona.
 */
export function PassoFontes({ aoAvancar, aoVoltar }: { aoAvancar: () => void; aoVoltar: () => void }) {
  const { estado, anotar, cumprir } = useFluxo()
  const salvo = estado[AIO.id]
  const [valor, setValor] = useState(salvo?.valor ?? "")
  const [conferindo, setConferindo] = useState(false)
  const [msg, setMsg] = useState(salvo?.mensagem)
  const pronta = Boolean(salvo?.validado)

  const debrids = Object.fromEntries(
    ["torbox", "realdebrid"]
      .map((id) => [id, estado[`chave:${id}`]?.ativo ? estado[`chave:${id}`]?.valor : ""])
      .filter(([, v]) => v),
  )

  const baixar = async () => {
    if (!AIO.template) return
    const r = await fetch(`templates/${AIO.template}`)
    const { arquivo, aplicadas } = injetarChaves(await r.json(), AIO, debrids)
    const url = URL.createObjectURL(new Blob([JSON.stringify(arquivo, null, 2)], { type: "application/json" }))
    const a = document.createElement("a")
    a.href = url
    a.download = nomeDoArquivo(AIO.template, aplicadas)
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    cumprir(AIO.id, "baixou")
  }

  const conferir = async () => {
    setConferindo(true)
    const r = await validar(AIO, valor.trim())
    setConferindo(false)
    setMsg(r.mensagem)
    anotar(AIO.id, valor.trim(), { ok: r.ok, mensagem: r.mensagem, url: r.url })
  }

  return (
    <Passo
      titulo="Quem organiza as opções de vídeo"
      lede="Este complemento pergunta a quinze buscadores de uma vez e devolve uma lista só, já ordenada. É ele que faz a lista chegar pronta em vez de sessenta linhas repetidas."
      aoAvancar={aoAvancar}
      aoVoltar={aoVoltar}
      travado={pronta ? undefined : "Falta conferir o endereço para seguir."}
    >
      <div className="rounded-2xl bg-card p-6 ring-1 ring-border sm:p-7">
        <ol className="flex flex-col gap-5">
          <Etapa n={1} titulo="Baixe a configuração">
            <p className="text-sm text-muted-foreground">
              Ela já sai com as suas chaves de vídeo dentro, e com os serviços que você não usa
              desligados.
            </p>
            <Button variant="secondary" onClick={baixar} className="mt-3 h-10">
              <DownloadSimple weight="bold" aria-hidden="true" />
              Baixar a configuração
            </Button>
          </Etapa>

          <Etapa n={2} titulo="Abra o configurador">
            <p className="flex items-start gap-2 text-sm text-muted-foreground">
              <WarningCircle weight="fill" aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-accent" />
              <span>
                <span className="text-foreground">Fique no modo <Termo>Simple</Termo>.</span> O
                arquivo já traz todos os ajustes decididos, e o modo avançado abre filtros que,
                mexidos sem querer, zeram a sua lista de opções.
              </span>
            </p>
            <Button asChild variant="secondary" className="mt-3 h-10">
              <a
                href={AIO.configurador}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => cumprir(AIO.id, "abriu")}
              >
                Abrir o configurador
                <ArrowSquareOut weight="bold" aria-hidden="true" />
              </a>
            </Button>
          </Etapa>

          <Etapa n={3} titulo="Lá dentro, nesta ordem">
            <ol className="flex flex-col gap-1.5 text-sm text-muted-foreground">
              <li>Vá em <Termo>Save &amp; Install</Termo></li>
              <li>Desça até <Termo>BACKUPS</Termo> e clique em <Termo>Import</Termo></li>
              <li>Escolha o arquivo que você baixou</li>
              <li>Clique em <Termo>CREATE CONFIGURATION</Termo> e depois em <Termo>Create</Termo></li>
              <li>Crie uma senha e anote, porque não tem como recuperar</li>
              <li>
                Copie o endereço de instalação que aparecer. Ele termina em
                <span className="mt-1 block font-mono text-[12px]">/manifest.json</span>
              </li>
            </ol>
          </Etapa>

          <Etapa n={4} titulo="Cole o endereço aqui">
            <Campo
              id="aiostreams"
              rotulo="Endereço do complemento"
              valor={valor}
              aoMudar={setValor}
              aoConferir={conferir}
              conferindo={conferindo}
              ok={pronta}
              exemplo="https://aiostreams.elfhosted.com/…/manifest.json"
              mensagem={msg ?? "Precisa terminar em /manifest.json."}
            />
          </Etapa>
        </ol>
      </div>
    </Passo>
  )
}
