import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { App } from "./App"
import { aplicarTema, temaSalvo } from "./lib/tema"
import "./index.css"

// Antes de pintar: sem isto a página aparece no escuro e pisca para o claro.
aplicarTema(temaSalvo())

const raiz = document.getElementById("raiz")
if (!raiz) throw new Error("elemento #raiz não existe no HTML")

createRoot(raiz).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
