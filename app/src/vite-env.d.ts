/// <reference types="vite/client" />

declare module 'virtual:copix-releases' {
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

	const catalog: ReleaseCatalog;
	export default catalog;
}
