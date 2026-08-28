export type DetectedOs = 'mac' | 'windows' | 'linux' | 'mobile' | 'other';

export type PlatformInfo = {
	os: DetectedOs;
	osLabel: string;
	lang: string;
	isKo: boolean;
	desktopLabel: string;
	desktopUrl: string;
	desktopHint: string;
	cliLabel: string;
	cliCommand: string;
	cliHint: string;
	cliAltLabel: string;
	cliAltCommand: string;
};

const GITHUB = 'https://github.com/copixdev/Copix';
const SITE = 'https://copixdev.github.io/Copix/';
const RELEASES = `${GITHUB}/releases`;
const LATEST_RELEASE = `${GITHUB}/releases/tag/v4.3.0`;
const MAC_DMG = `${GITHUB}/releases/download/v4.3.0/Copix-4.3.0-macOS-arm64.dmg`;
const WIN_EXE = `${GITHUB}/releases/download/v4.3.0/Copix-4.3.0-Windows-x64.exe`;
const CLI_SH =
	'curl -fsSL https://raw.githubusercontent.com/copixdev/Copix/refs/heads/main/cli/install.sh | bash';
const CLI_PS =
	'irm https://raw.githubusercontent.com/copixdev/Copix/refs/heads/main/cli/install.ps1 | iex';

export function detectPlatform(
	ua = typeof navigator !== 'undefined' ? navigator.userAgent : '',
	lang = typeof navigator !== 'undefined' ? navigator.language : 'en',
	platform =
		typeof navigator !== 'undefined'
			? (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData
					?.platform ||
				navigator.platform ||
				''
			: '',
	maxTouchPoints = typeof navigator !== 'undefined' ? navigator.maxTouchPoints || 0 : 0,
): PlatformInfo {
	const lower = ua.toLowerCase();
	const plat = String(platform).toLowerCase();

	// iPhone/iPod always; iPad classic UA; iPadOS 13+ often reports as Macintosh + touch.
	const isIOS =
		/iphone|ipod/.test(lower) ||
		/ipad/.test(lower) ||
		(/macintosh/.test(lower) && maxTouchPoints > 1);
	const isAndroid = /android/.test(lower);

	let os: DetectedOs = 'other';
	if (isIOS || isAndroid) os = 'mobile';
	else if (/mac os|macintosh/.test(lower) || plat.includes('mac')) os = 'mac';
	else if (/windows|win64|win32/.test(lower) || plat.includes('win')) os = 'windows';
	else if ((/linux|x11/.test(lower) || plat.includes('linux')) && !isAndroid) os = 'linux';

	const isKo = lang.toLowerCase().startsWith('ko');
	const isArmMac = os === 'mac' && (/arm|aarch64/.test(lower) || /apple/.test(plat));

	const osLabel =
		os === 'mac'
			? isArmMac
				? 'macOS (Apple Silicon)'
				: 'macOS'
			: os === 'windows'
				? 'Windows'
				: os === 'linux'
					? 'Linux'
					: os === 'mobile'
						? isIOS
							? isKo
								? 'iPhone / iPad'
								: 'iPhone / iPad'
							: isKo
								? '모바일'
								: 'mobile'
						: isKo
							? '내 기기'
							: 'your device';

	const desktopLabel =
		os === 'mac'
			? isKo
				? 'macOS용 Desktop 다운로드 (.DMG)'
				: 'Download Desktop for macOS (.DMG)'
			: os === 'windows'
				? isKo
					? 'Windows용 Desktop 다운로드 (.EXE)'
					: 'Download Desktop for Windows (.EXE)'
				: isKo
					? '릴리스에서 Desktop 받기'
					: 'Get Desktop from releases';

	const desktopUrl = os === 'mac' ? MAC_DMG : os === 'windows' ? WIN_EXE : RELEASES;

	const desktopHint = isKo
		? os === 'mac'
			? '감지됨: macOS — DMG → Applications. “손상됨”이면: xattr -cr /Applications/Copix.app && open /Applications/Copix.app'
			: os === 'windows'
				? '감지됨: Windows — EXE 설치 파일을 실행하세요.'
				: os === 'mobile'
					? '모바일에서는 Desktop 설치 파일을 받지 않습니다. macOS/Windows 컴퓨터에서 Releases를 열거나 CLI를 설치하세요.'
					: '릴리스 페이지에서 맞는 Desktop 빌드를 고르세요.'
		: os === 'mac'
			? 'Detected macOS — open the DMG and drag into Applications. If “damaged”: xattr -cr /Applications/Copix.app && open /Applications/Copix.app'
			: os === 'windows'
				? 'Detected Windows — run the EXE installer from the release.'
				: os === 'mobile'
					? 'Mobile detected — Desktop installers are for macOS and Windows. Open Releases on a computer, or use the CLI tab for install commands.'
					: 'Pick the matching Desktop build on the releases page.';

	const isWindows = os === 'windows';
	const cliLabel = isWindows
		? isKo
			? 'Windows용 CLI 설치 (PowerShell)'
			: 'Install CLI on Windows (PowerShell)'
		: isKo
			? 'macOS / Linux용 CLI 설치'
			: 'Install CLI on macOS / Linux';
	const cliCommand = isWindows ? CLI_PS : CLI_SH;
	const cliAltLabel = isWindows
		? isKo
			? 'macOS / Linux'
			: 'macOS / Linux'
		: isKo
			? 'Windows (PowerShell)'
			: 'Windows (PowerShell)';
	const cliAltCommand = isWindows ? CLI_SH : CLI_PS;

	const cliHint = isKo
		? os === 'mobile'
			? 'CLI는 macOS, Linux, Windows 컴퓨터용입니다. 아래 명령을 데스크톱 터미널에서 실행하세요.'
			: '계정 없음. Node.js 18+, git, Ollama만 있으면 됩니다. 설치 스크립트가 PATH에 영구 등록합니다.'
		: os === 'mobile'
			? 'CLI is for macOS, Linux, and Windows computers. Run the commands below in a desktop terminal.'
			: 'No account. Needs Node.js 18+, git, and Ollama. The installer puts copix on your PATH permanently.';

	return {
		os,
		osLabel,
		lang,
		isKo,
		desktopLabel,
		desktopUrl,
		desktopHint,
		cliLabel,
		cliCommand,
		cliHint,
		cliAltLabel,
		cliAltCommand,
	};
}

export { GITHUB, SITE, RELEASES, LATEST_RELEASE, CLI_SH, CLI_PS, MAC_DMG, WIN_EXE };
