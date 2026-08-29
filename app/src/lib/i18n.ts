export type Locale = 'en' | 'ko';

export const LOCALES: { id: Locale; label: string }[] = [
	{ id: 'en', label: 'EN' },
	{ id: 'ko', label: '한국어' },
];

type Dict = Record<string, string>;

/** English UI copy. Product tokens Copix / Desktop / CLI / ~/Copix stay literal. */
const en: Dict = {
	'nav.demo': 'Demo',
	'nav.install': 'Install',
	'nav.github': 'GitHub',
	'nav.getDesktop': 'Get Desktop',
	'nav.cli': 'CLI',
	'nav.lang': 'Language',

	'hero.kicker': 'Desktop · CLI · local Ollama',
	'hero.title': 'A local coding agent. Pixel-precise.',
	'hero.subBefore':
		'Copix runs on your machine with Ollama. Desktop and CLI share one session under',
	'hero.subAfter': '— no accounts, MIT.',
	'hero.getDesktop': 'Get Desktop',
	'hero.installCli': 'Install CLI',
	'hero.watch': 'Watch demo',
	'hero.meta': 'Desktop v{version} · Apple Silicon + Windows · No login',
	'hero.demoLabel': 'Copix Desktop Sync demo',

	'chapter.sync.kicker': 'Sync',
	'chapter.sync.title': 'One session under ~/Copix',
	'chapter.sync.blurb':
		'Desktop is the hero — agents, plan, and a live preview. CLI stays on the same ~/Copix session as a quiet sync cue.',
	'chapter.sync.note': 'Live Sync demo is above — this chapter is a still of the same Desktop chrome.',
	'chapter.tools.kicker': 'Tools',
	'chapter.tools.title': 'Tools land as real diffs',
	'chapter.tools.blurb':
		'edit_file and terminal run once; the editor shows syntax-highlighted green/red diffs under ~/Copix.',
	'chapter.models.kicker': 'Models',
	'chapter.models.title': 'Flip the model, same plan',
	'chapter.models.blurb':
		'Flip the Ollama tag and watch a short plan → code beat in the same compact Desktop window.',
	'chapter.toolsLabel': 'Agent tools',

	'watch.title': 'Watch demo',
	'watch.blurb': 'A recorded pass through Copix Desktop. The stages above are the live mocks.',

	'install.title': 'Install',
	'install.blurb': 'Desktop for macOS (M series) and Windows. CLI is the secondary path.',
	'install.method': 'Install method',
	'install.tabDesktop': 'Desktop',
	'install.tabCli': 'CLI',
	'install.for': 'Copix for',
	'install.running': 'running',
	'install.version': 'version',
	'install.os': 'Operating system',
	'install.arch': 'Architecture',
	'install.desktopVersion': 'Desktop version',
	'install.mac': 'macOS',
	'install.win': 'Windows',
	'install.allReleases': 'All releases',
	'install.preferCli': 'Prefer the CLI?',
	'install.cliHint':
		'Standalone CLI. Needs Node.js 18+, git, and Ollama. The installer puts copix on your PATH permanently.',
	'install.macLinux': 'macOS / Linux',
	'install.windowsPs': 'Windows (PowerShell)',
	'install.copy': 'Copy',
	'install.copied': 'Copied',
	'install.after': 'After install',
	'install.cliDocsBefore': 'Full reference in',
	'install.cliDocsLink': 'cli/README.md',
	'install.cliDocsAfter': '.',

	'footer.github': 'GitHub',
	'footer.releases': 'Releases',
	'footer.cliDocs': 'CLI docs',
	'footer.changelog': 'Changelog',
	'footer.copy': '© {year} Bae Juhan / copixdev · MIT · free to use · no accounts',

	'doc.title': 'Copix — A local coding agent. Pixel-precise.',
};

/**
 * Korean UI copy. Do not translate product tokens:
 * Copix, Desktop, CLI, ~/Copix (and similar brand/session strings).
 */
const ko: Dict = {
	'nav.demo': '데모',
	'nav.install': '설치',
	'nav.github': 'GitHub',
	'nav.getDesktop': 'Get Desktop',
	'nav.cli': 'CLI',
	'nav.lang': '언어',

	'hero.kicker': 'Desktop · CLI · local Ollama',
	'hero.title': '로컬 코딩 에이전트. 픽셀 단위로 정확합니다.',
	'hero.subBefore':
		'Copix는 Ollama와 함께 내 기기에서 실행됩니다. Desktop과 CLI가',
	'hero.subAfter': '아래 하나의 세션을 공유합니다 — 계정 없음, MIT.',
	'hero.getDesktop': 'Get Desktop',
	'hero.installCli': 'Install CLI',
	'hero.watch': '데모 보기',
	'hero.meta': 'Desktop v{version} · Apple Silicon + Windows · 로그인 불필요',
	'hero.demoLabel': 'Copix Desktop Sync 데모',

	'chapter.sync.kicker': 'Sync',
	'chapter.sync.title': '~/Copix 아래 하나의 세션',
	'chapter.sync.blurb':
		'Desktop이 주인공입니다 — 에이전트, 플랜, 라이브 프리뷰. CLI는 같은 ~/Copix 세션에 조용한 동기화 큐로 남습니다.',
	'chapter.sync.note': '라이브 Sync 데모는 위에 있습니다 — 이 챕터는 같은 Desktop 크롬의 정지 컷입니다.',
	'chapter.tools.kicker': 'Tools',
	'chapter.tools.title': '도구가 실제 diff로 도착합니다',
	'chapter.tools.blurb':
		'edit_file과 terminal이 한 번 실행되면, 에디터에 ~/Copix 아래 구문 강조된 초록/빨강 diff가 보입니다.',
	'chapter.models.kicker': 'Models',
	'chapter.models.title': '모델만 바꾸고, 같은 플랜',
	'chapter.models.blurb':
		'Ollama 태그를 바꾸면 같은 컴팩트 Desktop 창에서 짧은 플랜 → 코드 비트가 이어집니다.',
	'chapter.toolsLabel': '에이전트 도구',

	'watch.title': '데모 보기',
	'watch.blurb': 'Copix Desktop을 통과하는 녹화본입니다. 위 스테이지는 라이브 목입니다.',

	'install.title': '설치',
	'install.blurb': 'macOS(M series)와 Windows용 Desktop. CLI는 보조 경로입니다.',
	'install.method': '설치 방식',
	'install.tabDesktop': 'Desktop',
	'install.tabCli': 'CLI',
	'install.for': 'Copix for',
	'install.running': 'running',
	'install.version': 'version',
	'install.os': '운영체제',
	'install.arch': '아키텍처',
	'install.desktopVersion': 'Desktop version',
	'install.mac': 'macOS',
	'install.win': 'Windows',
	'install.allReleases': '모든 릴리스',
	'install.preferCli': 'CLI를 선호하시나요?',
	'install.cliHint':
		'독립형 CLI. Node.js 18+, git, Ollama가 필요합니다. 설치 프로그램이 PATH에 copix를 영구 등록합니다.',
	'install.macLinux': 'macOS / Linux',
	'install.windowsPs': 'Windows (PowerShell)',
	'install.copy': '복사',
	'install.copied': '복사됨',
	'install.after': '설치 후',
	'install.cliDocsBefore': '전체 참고는',
	'install.cliDocsLink': 'cli/README.md',
	'install.cliDocsAfter': '.',

	'footer.github': 'GitHub',
	'footer.releases': '릴리스',
	'footer.cliDocs': 'CLI docs',
	'footer.changelog': '변경 로그',
	'footer.copy': '© {year} Bae Juhan / copixdev · MIT · 무료 · 계정 없음',

	'doc.title': 'Copix — 로컬 코딩 에이전트. 픽셀 단위로 정확합니다.',
};

const TABLES: Record<Locale, Dict> = { en, ko };

/** Detect from navigator.languages / navigator.language only; English fallback. */
export function detectLocale(): Locale {
	if (typeof navigator === 'undefined') return 'en';
	const list =
		Array.isArray(navigator.languages) && navigator.languages.length > 0
			? navigator.languages
			: [navigator.language || 'en'];
	for (const raw of list) {
		const base = String(raw || '')
			.toLowerCase()
			.split('-')[0];
		if (base === 'ko') return 'ko';
		if (base === 'en') return 'en';
	}
	return 'en';
}

export function t(locale: Locale, key: string, vars?: Record<string, string | number>): string {
	const raw = TABLES[locale]?.[key] ?? TABLES.en[key] ?? key;
	if (!vars) return raw;
	return raw.replace(/\{(\w+)\}/g, (_, name: string) =>
		vars[name] === undefined || vars[name] === null ? `{${name}}` : String(vars[name]),
	);
}
