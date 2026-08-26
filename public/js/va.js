// Fila do Vercel Web Analytics. Precisa existir antes de o script deles carregar.
// Está num arquivo, e não embutido no HTML, para a CSP poder recusar script inline.
window.va =
  window.va ||
  function () {
    ;(window.vaq = window.vaq || []).push(arguments)
  }
