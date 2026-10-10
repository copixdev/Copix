/** Desktop assets from the GitHub releases API. Versions are display numbers, not copy. */

export type DesktopAsset = {
	version: string;
	url: string;
	name: string;
};

export type OlderRow = {
	version: string;
	mac: DesktopAsset | null;
	win: DesktopAsset | null;
};

export type ReleaseCatalog = {
	latestMac: DesktopAsset | null;
	latestWin: DesktopAsset | null;
	older: OlderRow[];
};

export type ReleaseAssetInput = {
	name?: string;
	browser_download_url?: string;
};

export type ReleaseInput = {
	tag_name?: string;
	draft?: boolean;
	assets?: ReleaseAssetInput[];
};

const VERSION = /(\d+)\.(\d+)\.(\d+)/;
const RELEASE_HOST = 'https://github.com/copixdev/copix/releases/download/';

function versionOf(tag: string): string | null {
	const match = tag.match(VERSION);
	if (!match) return null;
	return `${match[1]}.${match[2]}.${match[3]}`;
}

function compareVersions(a: string, b: string): number {
	const pa = a.split('.').map(Number);
	const pb = b.split('.').map(Number);
	for (let i = 0; i < 3; i += 1) {
		if (pa[i] !== pb[i]) return pa[i] - pb[i];
	}
	return 0;
}

function assetOf(assets: ReleaseAssetInput[], extension: '.dmg' | '.exe', version: string): DesktopAsset | null {
	const found = assets.find((asset) => {
		const name = asset.name || '';
		const url = asset.browser_download_url || '';
		return name.toLowerCase().endsWith(extension) && url.startsWith(RELEASE_HOST);
	});
	if (!found?.browser_download_url || !found.name) return null;
	return { version, url: found.browser_download_url, name: found.name };
}

/**
 * Highest macOS .dmg and Windows .exe become the latest buttons.
 * Every other Desktop asset stays on a version row, even when that release shipped one system.
 */
export function catalogFromReleases(releases: ReleaseInput[]): ReleaseCatalog {
	const merged: OlderRow[] = [];

	for (const release of releases) {
		if (release.draft) continue;
		const version = versionOf(release.tag_name || '');
		if (!version) continue;
		const assets = release.assets || [];
		const mac = assetOf(assets, '.dmg', version);
		const win = assetOf(assets, '.exe', version);
		if (!mac && !win) continue;

		const existing = merged.find((row) => row.version === version);
		if (!existing) {
			merged.push({ version, mac, win });
			continue;
		}
		if (!existing.mac && mac) existing.mac = mac;
		if (!existing.win && win) existing.win = win;
	}

	merged.sort((a, b) => compareVersions(b.version, a.version));

	const latestMac = merged.find((row) => row.mac)?.mac ?? null;
	const latestWin = merged.find((row) => row.win)?.win ?? null;

	const older: OlderRow[] = [];
	for (const row of merged) {
		const mac = row.mac && row.mac.url !== latestMac?.url ? row.mac : null;
		const win = row.win && row.win.url !== latestWin?.url ? row.win : null;
		if (!mac && !win) continue;
		older.push({ version: row.version, mac, win });
	}

	return { latestMac, latestWin, older };
}
