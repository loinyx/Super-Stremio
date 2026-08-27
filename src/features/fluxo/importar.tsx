import { useRef, useState } from "react"
import { UploadSimple } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { guardar } from "@/lib/wizard.js"

/**
 * Traz de volta um arquivo baixado antes.
 *
 * Confere a forma antes de gravar: um JSON qualquer sobrescreveria tudo com
 * lixo, e a pessoa perderia o que já tinha feito sem entender por quê.
 */
export function Importar({ aoImportar, rotulo = "Tenho um arquivo salvo" }: {
  aoImportar: () => void
  rotulo?: string
}) {
  const entrada = useRef<HTMLInputElement>(null)
  const [erro, setErro] = useState("")

  const ler = async (arquivo: File) => {
    setErro("")
    try {
      const dados = JSON.parse(await arquivo.text())
      const valido =
        dados && typeof dados === "object" && !Array.isArray(dados) &&
        Object.values(dados).every((v) => v && typeof v === "object" && "valor" in (v as object))
      if (!valido) {
        setErro("Esse arquivo não é uma configuração do Super Stremio.")
        return
      }
      guardar(dados)
      aoImportar()
    } catch {
      setErro("Não deu para ler esse arquivo. Ele precisa ser o .json que você baixou aqui.")
    }
  }

  return (
    <div>
      <input
        ref={entrada}
        type="file"
        accept="application/json,.json"
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) ler(f)
          e.target.value = ""
        }}
      />
      <Button variant="ghost" onClick={() => entrada.current?.click()} className="h-10 text-muted-foreground">
        <UploadSimple weight="bold" aria-hidden="true" />
        {rotulo}
      </Button>
      {erro && (
        <p aria-live="polite" className="mt-2 text-sm text-destructive">
          {erro}
        </p>
      )}
    </div>
  )
}
