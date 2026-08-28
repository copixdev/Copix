export const GITHUB = 'https://github.com/copixdev/Copix';
export const SITE = 'https://copixdev.github.io/Copix/';
export const RELEASES = `${GITHUB}/releases`;
export const DESKTOP_VERSION = '4.3.0';
export const LATEST_RELEASE = `${GITHUB}/releases/tag/v${DESKTOP_VERSION}`;
export const MAC_DMG = `${GITHUB}/releases/download/v${DESKTOP_VERSION}/Copix-${DESKTOP_VERSION}-macOS-arm64.dmg`;
export const WIN_EXE = `${GITHUB}/releases/download/v${DESKTOP_VERSION}/Copix-${DESKTOP_VERSION}-Windows-x64.exe`;
export const CLI_SH =
	'curl -fsSL https://raw.githubusercontent.com/copixdev/Copix/refs/heads/main/cli/install.sh | bash';
export const CLI_PS =
	'irm https://raw.githubusercontent.com/copixdev/Copix/refs/heads/main/cli/install.ps1 | iex';

export type InstallOs = 'mac' | 'win';

export function desktopDownload(os: InstallOs) {
	if (os === 'mac') {
		return {
			osLabel: 'macOS',
			archLabel: 'M series',
			url: MAC_DMG,
			button: `Download Copix for macOS`,
			hint: 'Apple Silicon (M series) · arm64 DMG',
		};
	}
	return {
		osLabel: 'Windows',
		archLabel: 'x64',
		url: WIN_EXE,
		button: `Download Copix for Windows`,
		hint: 'Windows x64 · EXE installer',
	};
}
