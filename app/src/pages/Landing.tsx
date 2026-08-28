import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { InteractiveDemo } from '../components/InteractiveDemo';
import { SiteNav } from '../components/SiteNav';
import { detectPlatform, GITHUB, LATEST_RELEASE, RELEASES } from '../lib/platform';
import { scrollToHash } from '../lib/scroll';

const tools = [
	{
		name: 'create_project',
		tip: 'Scaffold a new project tree from a single prompt.',
	},
	{ name: 'read_file / edit_file', tip: 'Open, patch, and write real files in your workspace.' },
	{ name: 'terminal', tip: 'Run builds, tests, and shell commands where you already work.' },
	{ name: 'grep / list_dir', tip: 'Search the tree before changing anything.' },
	{ name: 'web_search / web_fetch', tip: 'Pull public docs and pages when context is missing.' },
	{ name: 'spawn_subagent', tip: 'Fan out parallel work without leaving the session.' },
];

const models = ['qwen2.5:3b', 'qwen2.5-coder:7b', 'mistral:7b', 'qwen3.5:4b'];

const slash = [
	{ cmd: '/model', tip: 'Pin an Ollama tag or use auto routing' },
	{ cmd: '/pull', tip: 'Download a model into Ollama' },
	{ cmd: '/cwd', tip: 'Set the workspace (saved in settings)' },
	{ cmd: '/doctor', tip: 'Check Node, Ollama, models, and paths' },
	{ cmd: '/history', tip: 'Sessions shared with Desktop' },
];

export default function Landing() {
	const platform = useMemo(() => detectPlatform(), []);
	const [copied, setCopied] = useState<'cli' | 'alt' | 'desktop' | 'xattr' | null>(null);
	const location = useLocation();

	useEffect(() => {
		document.title = 'Copix — Pixel-precise agent for your programming';
	}, []);

	useEffect(() => {
		if (location.hash) {
			const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
			window.setTimeout(() => scrollToHash(location.hash, reduced ? 'auto' : 'smooth'), 40);
		}
	}, [location.hash]);

	const t = platform.isKo
		? {
				kicker: '로컬 · Desktop · CLI · Ollama',
				title: '픽셀 단위로 정확한\n프로그래밍 에이전트.',
				trust:
					'계정 없음. Copix는 당신 머신의 Ollama에서 돌아갑니다. 파일을 만들고, 터미널을 돌리고, 웹을 찾고, 서브에이전트를 띄웁니다.',
				ctaDesktop: platform.desktopLabel,
				ctaCli: 'CLI 설치',
				productTitle: '로컬에서 끝내는 코딩 에이전트',
				productBody:
					'기본 모델은 qwen2.5:3b. Studio Desktop과 독립형 CLI가 같은 도구 표면을 공유하고, 세션은 ~/Copix에 맞춰집니다.',
				pillars: [
					{
						title: '로컬 우선',
						body: '모델은 당신 머신에. 클라우드 계정이나 Copix 웹 앱이 없습니다.',
					},
					{
						title: '실제 도구',
						body: '파일, 터미널, 웹 검색/페치, 서브에이전트 — 시뮬레이션이 아니라 실제 작업.',
					},
					{
						title: '두 가지 설치',
						body: 'Desktop은 릴리스 설치 파일, CLI는 한 줄 설치 스크립트.',
					},
				],
				toolsTitle: '에이전트가 쓰는 도구',
				toolsBody: '프롬프트 한 줄이 파일 시스템과 셸까지 닿습니다.',
				installTitle: 'Desktop 설치',
				cliTitle: 'CLI 설치',
				cliBody: '독립형 터미널 에이전트. Node.js 18+, git, Ollama만 있으면 됩니다.',
				modelsTitle: '작업마다 맞는 Ollama 모델',
				modelsBody: 'Ollama 우선. 태그를 쓰면 쓰고, 없으면 안전한 기본값으로 떨어집니다.',
				closingTitle: '지금 Copix를 써보세요.',
				copy: '복사',
				copied: '복사됨',
				noAccount: '로그인·계정·웹 앱 없음 — Desktop과 CLI만.',
			}
		: {
				kicker: 'Local · Desktop · CLI · Ollama',
				title: 'Pixel-precise agent\nfor your programming.',
				trust:
					'No accounts. Copix is a local coding agent on Ollama — create and edit files, run a terminal, search the web, and spawn subagents on your machine.',
				ctaDesktop: platform.desktopLabel,
				ctaCli: 'Install CLI',
				productTitle: 'A coding agent that stays on your machine',
				productBody:
					'Default model: qwen2.5:3b. Desktop and the standalone CLI share the same tool surface. Sessions line up through ~/Copix.',
				pillars: [
					{
						title: 'Local-first',
						body: 'Models stay on your machine. No cloud account. No Copix web app.',
					},
					{
						title: 'Real tools',
						body: 'Files, terminal, web search/fetch, subagents — work that lands in the repo.',
					},
					{
						title: 'Two installs',
						body: 'Desktop from GitHub Releases. CLI from a one-liner for macOS, Linux, and Windows.',
					},
				],
				toolsTitle: 'Tools the agent actually uses',
				toolsBody: 'One prompt reaches your filesystem and shell — not a chat sandbox.',
				installTitle: 'Install Desktop',
				cliTitle: 'Install CLI',
				cliBody: 'Standalone terminal agent. Needs Node.js 18+, git, and Ollama — nothing else.',
				modelsTitle: 'Pick an Ollama model per task',
				modelsBody: 'Ollama-first defaults. Stretch tags when you pull them.',
				closingTitle: 'Try Copix now.',
				copy: 'Copy',
				copied: 'Copied',
				noAccount: 'No login, no accounts, no web app — Desktop and CLI only.',
			};

	async function copyText(text: string, key: 'cli' | 'alt' | 'desktop' | 'xattr') {
		try {
			await navigator.clipboard.writeText(text);
			setCopied(key);
			window.setTimeout(() => setCopied(null), 1600);
		} catch {
			/* ignore */
		}
	}

	return (
		<div className="page">
			<div className="grid-bg" aria-hidden />
			<SiteNav />
			<main id="top">
				<section className="hero">
					<div className="hero-copy">
						<p className="hero-kicker">
							<span className="dot" aria-hidden />
							{t.kicker}
						</p>
						<h1 className="hero-title">
							{t.title.split('\n').map((line) => (
								<span key={line}>
									{line}
									<br />
								</span>
							))}
						</h1>
						<p className="hero-trust">{t.trust}</p>
						<div className="hero-cta">
							<a className="btn primary lg" href={platform.desktopUrl} target="_blank" rel="noreferrer">
								{t.ctaDesktop}
							</a>
							<a className="btn ghost lg" href="#cli">
								{t.ctaCli}
							</a>
						</div>
						<p className="hero-meta">
							{platform.isKo
								? `${platform.osLabel} · ${t.noAccount}`
								: `Detected ${platform.osLabel} · ${t.noAccount}`}
						</p>
						<ul className="hero-facts">
							<li>
								<code>MIT</code>
								<span>{platform.isKo ? '오픈소스' : 'Open source'}</span>
							</li>
							<li>
								<code>v4.3.0</code>
								<span>{platform.isKo ? '최신 릴리스' : 'Latest release'}</span>
							</li>
							<li>
								<code>qwen2.5:3b</code>
								<span>{platform.isKo ? '기본 모델' : 'Default model'}</span>
							</li>
						</ul>
					</div>
					<div className="hero-stage" id="demo">
						<InteractiveDemo />
					</div>
				</section>

				<section className="strip" aria-label="Stack">
					<span>Ollama</span>
					<span>macOS</span>
					<span>Windows</span>
					<span>Linux CLI</span>
					<span>MIT</span>
				</section>

				<section className="section" id="product">
					<div className="section-head">
						<p className="eyebrow">01 — Product</p>
						<h2>{t.productTitle}</h2>
						<p>{t.productBody}</p>
					</div>
					<div className="pillar-grid">
						{t.pillars.map((p, i) => (
							<article key={p.title} className="pillar">
								<span className="pillar-idx">0{i + 1}</span>
								<h3>{p.title}</h3>
								<p>{p.body}</p>
							</article>
						))}
					</div>
				</section>

				<section className="section tools-section" id="tools">
					<div className="section-head">
						<p className="eyebrow">02 — Tools</p>
						<h2>{t.toolsTitle}</h2>
						<p>{t.toolsBody}</p>
					</div>
					<ul className="tool-grid">
						{tools.map((tool) => (
							<li key={tool.name} className="tool-card">
								<code>{tool.name}</code>
								<span>{tool.tip}</span>
							</li>
						))}
					</ul>
				</section>

				<section className="section band" id="install">
					<div>
						<p className="eyebrow">03 — Desktop</p>
						<h2>{t.installTitle}</h2>
						<p>
							{platform.isKo
								? 'GitHub Releases의 설치 파일로 Studio Desktop을 받으세요.'
								: 'Grab Studio Desktop from GitHub Releases — prebuilt for macOS and Windows.'}
						</p>
						<p className="install-os">
							{platform.isKo ? '감지된 OS' : 'Detected OS'}: <strong>{platform.osLabel}</strong>
						</p>
						<p className="install-hint">{platform.desktopHint}</p>
						<div className="install-actions">
							<a className="btn primary" href={platform.desktopUrl} target="_blank" rel="noreferrer">
								{platform.desktopLabel}
							</a>
							<a className="btn ghost" href={LATEST_RELEASE} target="_blank" rel="noreferrer">
								v4.3.0
							</a>
							<a className="btn ghost" href={RELEASES} target="_blank" rel="noreferrer">
								{platform.isKo ? '모든 릴리스' : 'All releases'}
							</a>
							<button
								type="button"
								className="btn ghost"
								onClick={() => void copyText(platform.desktopUrl, 'desktop')}
							>
								{copied === 'desktop' ? t.copied : t.copy}
							</button>
						</div>
					</div>
					<div className="gatekeeper">
						<h3>
							{platform.isKo
								? 'macOS: “손상되어서 열 수 없습니다”'
								: 'macOS: “damaged and can’t be opened”'}
						</h3>
						<p className="install-hint">
							{platform.isKo
								? '파일이 깨진 것이 아닙니다. Chrome 다운로드 후 Gatekeeper 격리입니다. Applications로 옮긴 뒤 터미널에서:'
								: 'The DMG is fine. Chrome quarantine blocks unsigned apps. After dragging to Applications, run:'}
						</p>
						<pre className="install">
							<code>{`xattr -cr /Applications/Copix.app
open /Applications/Copix.app`}</code>
						</pre>
						<div className="install-actions">
							<button
								type="button"
								className="btn ghost"
								onClick={() =>
									void copyText(
										'xattr -cr /Applications/Copix.app && open /Applications/Copix.app',
										'xattr',
									)
								}
							>
								{copied === 'xattr' ? t.copied : platform.isKo ? '명령 복사' : 'Copy command'}
							</button>
						</div>
					</div>
				</section>

				<section className="section band cli-band" id="cli">
					<div>
						<p className="eyebrow">04 — CLI</p>
						<h2>{t.cliTitle}</h2>
						<p>{t.cliBody}</p>
						<p className="install-hint">{platform.cliHint}</p>
						<p className="install-os">
							<strong>{platform.cliLabel}</strong>
						</p>
						<pre className="install">
							<code>{platform.cliCommand}</code>
						</pre>
						<div className="install-actions">
							<button
								type="button"
								className="btn primary"
								onClick={() => void copyText(platform.cliCommand, 'cli')}
							>
								{copied === 'cli' ? t.copied : t.copy}
							</button>
						</div>
						<p className="install-os" style={{ marginTop: 22 }}>
							<strong>{platform.cliAltLabel}</strong>
						</p>
						<pre className="install">
							<code>{platform.cliAltCommand}</code>
						</pre>
						<div className="install-actions">
							<button
								type="button"
								className="btn ghost"
								onClick={() => void copyText(platform.cliAltCommand, 'alt')}
							>
								{copied === 'alt' ? t.copied : t.copy}
							</button>
						</div>
					</div>
					<div>
						<h3>{platform.isKo ? '설치 후' : 'After install'}</h3>
						<pre className="install">
							<code>{`ollama pull qwen2.5:3b
copix doctor
copix
copix "summarize this repo"`}</code>
						</pre>
						<ul className="cli-slash">
							{slash.map((row) => (
								<li key={row.cmd}>
									<code>{row.cmd}</code>
									<span>{row.tip}</span>
								</li>
							))}
						</ul>
						<p className="install-hint">
							{platform.isKo
								? '자세한 내용은 GitHub의 cli/README.md를 보세요.'
								: 'Full reference in cli/README.md on GitHub.'}{' '}
							<a className="text-link" href={`${GITHUB}/tree/main/cli`} target="_blank" rel="noreferrer">
								{platform.isKo ? 'CLI 문서 →' : 'CLI docs →'}
							</a>
						</p>
					</div>
				</section>

				<section className="section" id="models">
					<div className="section-head">
						<p className="eyebrow">05 — Models</p>
						<h2>{t.modelsTitle}</h2>
						<p>{t.modelsBody}</p>
					</div>
					<div className="model-row">
						{models.map((m, i) => (
							<span key={m} className={`model-chip ${i === 0 ? 'active' : ''}`}>
								{m}
							</span>
						))}
					</div>
					<div className="compare">
						<div>
							<h3>{platform.isKo ? '기본 Ollama' : 'Default Ollama'}</h3>
							<p>
								{platform.isKo
									? '채팅은 되지만 파일·터미널·프로젝트 도구가 없습니다.'
									: 'Chat works — file, terminal, and project tools do not.'}
							</p>
						</div>
						<div className="compare-vs" aria-hidden>
							→
						</div>
						<div>
							<h3>Copix</h3>
							<p>
								{platform.isKo
									? '같은 로컬 모델에 파일·터미널·웹·서브에이전트 도구를 얹습니다.'
									: 'Same local models, plus file, terminal, web, and subagent tools.'}
							</p>
						</div>
					</div>
				</section>

				<section className="closing">
					<div className="closing-card">
						<p className="eyebrow">Ready</p>
						<h2>{t.closingTitle}</h2>
						<p>{t.noAccount}</p>
						<div className="hero-cta">
							<a className="btn primary lg" href={platform.desktopUrl} target="_blank" rel="noreferrer">
								{t.ctaDesktop}
							</a>
							<a className="btn ghost lg" href="#cli">
								{t.ctaCli}
							</a>
							<a className="btn ghost lg" href={GITHUB} target="_blank" rel="noreferrer">
								GitHub
							</a>
						</div>
					</div>
				</section>
			</main>

			<footer className="footer">
				<div className="footer-brand">
					<img src={`${import.meta.env.BASE_URL}icon.png`} alt="" width={22} height={22} />
					<span>Copix</span>
				</div>
				<div className="footer-links">
					<a href="#product">Product</a>
					<a href="#install">Desktop</a>
					<a href="#cli">CLI</a>
					<a href={LATEST_RELEASE} target="_blank" rel="noreferrer">
						v4.3.0
					</a>
					<a href={GITHUB} target="_blank" rel="noreferrer">
						GitHub
					</a>
				</div>
				<p className="footer-copy">
					© {new Date().getFullYear()} Bae Juhan / copixdev · MIT ·{' '}
					<a href="https://copixdev.github.io/Copix/">copixdev.github.io/Copix</a>
				</p>
			</footer>
		</div>
	);
}
