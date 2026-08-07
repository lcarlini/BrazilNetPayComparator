import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Relative base so /docs/ (branch Pages) and Actions root deploy both work.
  base: './',
  build: {
    outDir: 'docs',
    emptyOutDir: true,
  },
})
