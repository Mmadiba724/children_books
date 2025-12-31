/// <reference types="node" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // Use dynamic base: '/' for dev, '/children_books/' for production (GitHub Pages)
  base: mode === 'production' ? '/children_books/' : '/',
  // Vite's dev server already provides SPA fallback by default
  // For production (GitHub Pages), add a 404.html that redirects to index.html
}));