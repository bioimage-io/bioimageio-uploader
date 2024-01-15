import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
    plugins: [
        svelte({ hot: !process.env.VITEST }),
    ],
    test: {
        globals: true,
        environment: 'happy-dom',    
        testTimeout: 60_000,
        hookTimeout: 60_000,
    },
})
