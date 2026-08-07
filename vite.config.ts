import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Committed index.html loads the production bundle (for GitHub Pages on main).
 * During vite serve/build, swap those tags for the real /src/main.tsx entry
 * before Vite tries to resolve the asset URLs.
 */
function useViteEntryForDevAndBuild(): Plugin {
  const pagesBlock =
    /<!--pages-assets-->[\s\S]*?<!--\/pages-assets-->/

  return {
    name: 'use-vite-entry-for-dev-and-build',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        return html.replace(
          pagesBlock,
          '<script type="module" src="/src/main.tsx"></script>',
        )
      },
    },
  }
}

export default defineConfig({
  plugins: [react(), useViteEntryForDevAndBuild()],
  base: '/BrazilNetPayComparator/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    cssCodeSplit: false,
    codeSplitting: false,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/app.js',
        assetFileNames: 'assets/app.css',
      },
    },
  },
})
