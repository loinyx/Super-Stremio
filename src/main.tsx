import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { App } from "./App"
import "./index.css"

const raiz = document.getElementById("raiz")
if (!raiz) throw new Error("elemento #raiz não existe no HTML")

createRoot(raiz).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
