import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { isoImport } from 'vite-plugin-iso-import';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte(), isoImport()],
})
