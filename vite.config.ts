import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	ssr: {
		// LayerChart imports Dagre's ESM build; bundle it so Vercel SSR does not load it as CommonJS.
		noExternal: ['@dagrejs/dagre']
	}
});
