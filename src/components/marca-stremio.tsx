/**
 * A marca do Stremio.
 *
 * Caminho único do Simple Icons, embutido: pinta com `currentColor`, então
 * serve no tema claro e no escuro sem precisar de duas imagens, e não depende
 * de nenhum servidor de terceiro continuar no ar.
 */
export function MarcaStremio({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path fill="currentColor" d="M12 0a1.2 1.2 0 0 0-.85.354L.353 11.15c-.47.47-.47 1.227 0 1.697l10.797 10.8a1.2 1.2 0 0 0 1.7 0l10.797-10.8c.47-.47.47-1.226 0-1.696L12.85.354A1.2 1.2 0 0 0 12 0m-1.674 7.586h.002a.2.2 0 0 1 .129.04l5.729 4.214a.2.2 0 0 1 0 .323l-5.73 4.213a.2.2 0 0 1-.317-.16v-8.43a.2.2 0 0 1 .187-.2"/>
    </svg>
  )
}
