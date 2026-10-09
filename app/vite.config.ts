import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { catalogFromReleases, type ReleaseInput } from './src/lib/release-catalog';

const RELEASES_API = 'https://api.github.com/repos/copixdev/copix/releases?per_page=100';

async function fetchReleases(): Promise<ReleaseInput[]> {
	const all: ReleaseInput[] = [];
	let url: string | null = RELEASES_API;
	while (url) {
		const response = await fetch(url, {
			headers: {
				Accept: 'application/vnd.github+json',
				'User-Agent': 'copix-site',
			},
		});
		if (!response.ok) {
			throw new Error(`GitHub releases request failed (${response.status})`);
		}
		const page = (await response.json()) as ReleaseInput[];
		all.push(...page);
		const link = response.headers.get('link') || '';
		const next = link.split(',').find((part) => part.includes('rel="next"'));
		const match = next?.match(/<([^>]+)>/);
		url = match?.[1] || null;
	}
	return all;
}

function copixReleases(): Plugin {
	const virtualId = 'virtual:copix-releases';
	const resolvedId = '\0virtual:copix-releases';
	let source: string | null = null;

	return {
		name: 'copix-releases',
		resolveId(id) {
			if (id === virtualId) return resolvedId;
			return null;
		},
		async load(id) {
			if (id !== resolvedId) return null;
			if (!source) {
				const catalog = catalogFromReleases(await fetchReleases());
				if (!catalog.latestMac || !catalog.latestWin) {
					throw new Error('copixdev/copix releases did not include a latest macOS .dmg and Windows .exe');
				}
				source = `export default ${JSON.stringify(catalog)};`;
			}
			return source;
		},
	};
}

export default defineConfig({
	plugins: [react(), copixReleases()],
	base: process.env.GITHUB_PAGES === 'true' ? '/copix/' : '/',
	server: {
		host: true,
		port: 5173,
		strictPort: false,
	},
	preview: {
		port: 4173,
	},
});
