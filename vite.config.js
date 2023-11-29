import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import { isoImport } from 'vite-plugin-iso-import';

export default defineConfig({
	plugins: [sveltekit(), isoImport()],

	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	},

    optimizeDeps: {
        exclude: ['tinro']
    },

	css: {
		preprocessorOptions: {
			scss: {
				additionalData: '@use "src/variables.scss" as *;'
			}
		}
	}
});
