import { useState } from "react"
import { Passo } from "../passo"
import { IrEVoltar, type Aferido } from "../ir-e-voltar"
import { useFluxo } from "../estado"
import { aferirMdblist } from "@/lib/keys.js"

const CHAVE = "chave:mdblist"

export function PassoMdblist({ aoAvancar, aoVoltar }: { aoAvancar: () => void; aoVoltar: () => void }) {
  const { estado, anotar, cumprir } = useFluxo()
  const salvo = estado[CHAVE]
  const [valor, setValor] = useState(salvo?.valor ?? "")
  const [aferido, setAferido] = useState<Aferido>(
    salvo?.validado ? { estado: "ok", mensagem: salvo.mensagem } : { estado: "vazio" },
  )

  const conferir = async () => {
    setAferido({ estado: "conferindo" })
    const r = await aferirMdblist(valor.trim())
    setAferido({ estado: r.ok ? "ok" : "erro", mensagem: r.mensagem })
    anotar(CHAVE, valor.trim(), { ok: r.ok, mensagem: r.mensagem })
  }

  return (
    <Passo
      titulo="De onde vêm as listas"
      lede="Os catálogos por serviço, gênero e década saem de um site chamado MDBList. Ele é grátis, e a chave dele é o que enche 86 dos 150 catálogos."
      aoAvancar={aoAvancar}
      aoVoltar={aoVoltar}
      travado={aferido.estado === "ok" ? undefined : "Falta conferir a chave para seguir."}
    >
      <IrEVoltar
        la={{
          titulo: "Pegue a sua chave no MDBList",
          texto:
            "A conta é grátis e pede só um e-mail. Depois de entrar, a chave fica na página de preferências, embaixo de API Key.",
          botao: "Abrir o MDBList",
          href: "https://mdblist.com/preferences/",
        }}
        jaTenho="Já tenho conta"
        ca={{
          titulo: "Cole a chave aqui",
          texto: "Ela entra sozinha nos cinco arquivos de catálogo que você vai baixar depois.",
          rotulo: "Chave do MDBList",
          exemplo: "cole a chave",
        }}
        valor={valor}
        aoMudar={(v) => {
          setValor(v)
          if (aferido.estado !== "vazio") setAferido({ estado: "vazio" })
        }}
        aoConferir={conferir}
        aferido={aferido}
        saiu={Boolean(salvo?.abriu)}
        aoSair={() => cumprir(CHAVE, "abriu")}
        aoJaTer={() => cumprir(CHAVE, "abriu")}
      />
    </Passo>
  )
}
