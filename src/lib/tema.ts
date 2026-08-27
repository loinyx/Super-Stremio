import { useEffect, useState } from "react"

export type Tema = "claro" | "escuro" | "sistema"

const CHAVE = "super-stremio:tema"

/** Lê a preferência salva, caindo em "sistema" quando não há nada guardado. */
export function temaSalvo(): Tema {
  try {
    const t = localStorage.getItem(CHAVE)
    return t === "claro" || t === "escuro" ? t : "sistema"
  } catch {
    return "sistema"
  }
}

/** Escreve a classe `dark` na raiz, que é o que o Tailwind observa. */
export function aplicarTema(tema: Tema) {
  const escuro =
    tema === "escuro" ||
    (tema === "sistema" && window.matchMedia("(prefers-color-scheme: dark)").matches)
  document.documentElement.classList.toggle("dark", escuro)
  document.documentElement.style.colorScheme = escuro ? "dark" : "light"
}

/**
 * Tema da aplicação inteira.
 *
 * Existe uma fonte de verdade só, e é esta. O Magic UI vem com `next-themes`
 * embutido, mas duas bibliotecas decidindo a mesma coisa é como um bug entra:
 * uma troca a classe, a outra não fica sabendo.
 */
export function useTema() {
  const [tema, setTema] = useState<Tema>(() => temaSalvo())

  useEffect(() => {
    aplicarTema(tema)
    try {
      if (tema === "sistema") localStorage.removeItem(CHAVE)
      else localStorage.setItem(CHAVE, tema)
    } catch {
      // Aba privada ou storage cheio. O tema vale para esta sessão e pronto.
    }
  }, [tema])

  // Seguir o sistema quer dizer seguir de verdade, inclusive quando ele muda
  // com a página aberta.
  useEffect(() => {
    if (tema !== "sistema") return
    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    const ouvir = () => aplicarTema("sistema")
    mq.addEventListener("change", ouvir)
    return () => mq.removeEventListener("change", ouvir)
  }, [tema])

  return { tema, setTema }
}

/** true quando a raiz está no escuro, observando a classe em vez de adivinhar. */
export function useEstaEscuro() {
  const [escuro, setEscuro] = useState(() => document.documentElement.classList.contains("dark"))

  useEffect(() => {
    const observador = new MutationObserver(() =>
      setEscuro(document.documentElement.classList.contains("dark")),
    )
    observador.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
    return () => observador.disconnect()
  }, [])

  return escuro
}
