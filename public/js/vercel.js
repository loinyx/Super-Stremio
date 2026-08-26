// Filas da Vercel. Precisam existir antes de os scripts deles carregarem.
//
// São dois produtos distintos, e cada um tem a sua fila: Web Analytics conta
// visita, Speed Insights mede Core Web Vitals e alimenta o Real Experience
// Score. Instalar um não instala o outro.
//
// Está num arquivo, e não embutido no HTML, para a CSP poder recusar script
// inline.

window.va =
  window.va ||
  function () {
    ;(window.vaq = window.vaq || []).push(arguments)
  }

window.si =
  window.si ||
  function () {
    ;(window.siq = window.siq || []).push(arguments)
  }
