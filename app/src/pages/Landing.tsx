import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { InteractiveDemo } from '../components/InteractiveDemo';
import { SiteNav } from '../components/SiteNav';
import { SCENES } from '../lib/demo-session';
import {
	CLI_PS,
	CLI_SH,
	DESKTOP_VERSION,
	GITHUB,
	RELEASES,
	desktopDownload,
	type InstallOs,
} from '../lib/platform';
import { scrollToHash } from '../lib/scroll';

const tools = ['create_project', 'edit_file', 'terminal', 'web_search', 'web_fetch'] as const;

const CHAPTER_IDS: Record<(typeof SCENES)[number]['id'], string> = {
	sync: 'demo',
	tools: 'demo-tools',
	models: 'demo-models',
};

type InstallTab = 'desktop' | 'cli';

export default function Landing() {
	const [tab, setTab] = useState<InstallTab>('desktop');
	const [os, setOs] = useState<InstallOs>('mac');
	const [copied, setCopied] = useState<'sh' | 'ps' | null>(null);
	const location = useLocation();
	const demoSrc = `${import.meta.env.BASE_URL}demo.mp4`;
	const pack = desktopDownload(os);

	useEffect(() => {
		document.title = 'Copix — A local coding agent. Pixel-precise.';
	}, []);

	useEffect(() => {
		function applyHash(hash: string) {
			if (!hash) return;
			if (hash === '#install-cli' || hash === '#cli') {
				setTab('cli');
			} else if (hash === '#install') {
				setTab('desktop');
			}
			const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
			const target =
				hash === '#cli' || hash === '#install-cli' || hash === '#install' ? '#install' : hash;
			window.setTimeout(() => scrollToHash(target, reduced ? 'auto' : 'smooth'), 40);
		}
		applyHash(location.hash);
		const onHash = () => applyHash(window.location.hash);
		window.addEventListener('hashchange', onHash);
		return () => window.removeEventListener('hashchange', onHash);
	}, [location.hash]);

	async function copyText(text: string, key: 'sh' | 'ps') {
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
			<SiteNav />
			<main>
				<section className="hero">
					<p className="hero-kicker">Desktop · CLI · local Ollama</p>
					<h1 className="hero-title">A local coding agent. Pixel-precise.</h1>
					<p className="hero-sub">
						Copix runs on your machine with Ollama. Desktop and CLI share one session under{' '}
						<code>~/Copix</code> — no accounts, MIT.
					</p>
					<div className="hero-cta">
						<a className="btn primary lg" href="#install">
							Get Desktop
						</a>
						<a className="btn ghost lg" href="#install-cli">
							Install CLI
						</a>
						<a className="btn ghost lg" href="#watch">
							Watch demo
						</a>
					</div>
					<p className="hero-meta">Desktop v{DESKTOP_VERSION} · Apple Silicon + Windows · No login</p>
				</section>

				{SCENES.map((chapter) => (
					<section
						key={chapter.id}
						className="demo-chapter"
						id={CHAPTER_IDS[chapter.id]}
						aria-labelledby={`${chapter.id}-title`}
					>
						<div className="section-head">
							<p className="chapter-kicker">{chapter.label}</p>
							<h2 id={`${chapter.id}-title`}>
								{chapter.id === 'sync'
									? 'One session, two windows'
									: chapter.id === 'tools'
										? 'Tools land as real diffs'
										: 'Flip the model, same plan'}
							</h2>
							<p>{chapter.blurb}</p>
						</div>
						<div className="stage-section">
							<InteractiveDemo sceneId={chapter.id} />
						</div>
						{chapter.id === 'sync' ? (
							<ul className="tool-list" aria-label="Agent tools">
								{tools.map((name) => (
									<li key={name}>
										<code>{name}</code>
									</li>
								))}
							</ul>
						) : null}
					</section>
				))}

				<section className="watch-section" id="watch">
					<div className="section-head">
						<h2>Watch demo</h2>
						<p>A recorded pass through Copix Desktop. The stages above are the live mocks.</p>
					</div>
					<figure className="watch-video">
						<video controls playsInline preload="metadata" poster={`${import.meta.env.BASE_URL}icon.png`}>
							<source src={demoSrc} type="video/mp4" />
						</video>
					</figure>
				</section>

				<section className="install-section" id="install">
					<span id="install-cli" hidden />
					<div className="section-head">
						<h2>Install</h2>
						<p>Desktop for macOS (M series) and Windows. CLI is the secondary path.</p>
					</div>

					<div className="install-tabs" role="tablist" aria-label="Install method">
						<button
							type="button"
							role="tab"
							aria-selected={tab === 'desktop'}
							className={tab === 'desktop' ? 'active' : ''}
							onClick={() => {
								setTab('desktop');
								window.history.replaceState(null, '', '#install');
							}}
						>
							Desktop
						</button>
						<button
							type="button"
							role="tab"
							aria-selected={tab === 'cli'}
							className={tab === 'cli' ? 'active' : ''}
							onClick={() => {
								setTab('cli');
								window.history.replaceState(null, '', '#install-cli');
							}}
						>
							CLI
						</button>
					</div>

					{tab === 'desktop' ? (
						<div className="install-panel picker-panel" role="tabpanel">
							<p className="picker-row">
								<span className="picker-label">Copix for</span>
								<label className="picker-field">
									<span className="sr-only">Operating system</span>
									<select value={os} onChange={(e) => setOs(e.target.value as InstallOs)}>
										<option value="mac">macOS</option>
										<option value="win">Windows</option>
									</select>
								</label>
							</p>
							<p className="picker-row">
								<span className="picker-label">running</span>
								<label className="picker-field">
									<span className="sr-only">Architecture</span>
									<select value={pack.archLabel} onChange={() => undefined}>
										<option value={pack.archLabel}>{pack.archLabel}</option>
									</select>
								</label>
								<span className="picker-label">version</span>
								<label className="picker-field">
									<span className="sr-only">Desktop version</span>
									<select value={DESKTOP_VERSION} onChange={() => undefined}>
										<option value={DESKTOP_VERSION}>{DESKTOP_VERSION}</option>
									</select>
								</label>
							</p>
							<p className="install-hint">{pack.hint}</p>
							<a className="btn primary lg picker-dl" href={pack.url} target="_blank" rel="noreferrer">
								{pack.button}
								<span className="ver-badge">{DESKTOP_VERSION}</span>
							</a>
							<p className="picker-more">
								<a className="text-link" href={RELEASES} target="_blank" rel="noreferrer">
									All releases
								</a>
								{' · '}
								<button
									type="button"
									className="text-link as-button"
									onClick={() => {
										setTab('cli');
										window.history.replaceState(null, '', '#install-cli');
									}}
								>
									Prefer the CLI?
								</button>
							</p>
						</div>
					) : (
						<div className="install-panel" role="tabpanel">
							<p className="install-hint">
								Standalone CLI. Needs Node.js 18+, git, and Ollama. The installer puts{' '}
								<code>copix</code> on your PATH permanently.
							</p>
							<p className="install-os">
								<strong>macOS / Linux</strong>
							</p>
							<pre className="install">
								<code>{CLI_SH}</code>
							</pre>
							<div className="install-actions">
								<button type="button" className="btn primary" onClick={() => void copyText(CLI_SH, 'sh')}>
									{copied === 'sh' ? 'Copied' : 'Copy'}
								</button>
							</div>

							<p className="install-os" style={{ marginTop: 20 }}>
								<strong>Windows (PowerShell)</strong>
							</p>
							<pre className="install">
								<code>{CLI_PS}</code>
							</pre>
							<div className="install-actions">
								<button type="button" className="btn ghost" onClick={() => void copyText(CLI_PS, 'ps')}>
									{copied === 'ps' ? 'Copied' : 'Copy'}
								</button>
							</div>

							<h3 className="after-title">After install</h3>
							<pre className="install">
								<code>{`ollama pull qwen2.5:3b
copix doctor
copix`}</code>
							</pre>
							<p className="install-hint">
								Full reference in{' '}
								<a className="text-link" href={`${GITHUB}/tree/main/cli`} target="_blank" rel="noreferrer">
									cli/README.md
								</a>
								.
							</p>
						</div>
					)}
				</section>
			</main>

			<footer className="footer">
				<div className="footer-brand">
					<img src={`${import.meta.env.BASE_URL}icon.png`} alt="" width={22} height={22} />
					<span>Copix</span>
				</div>
				<div className="footer-links">
					<a href={GITHUB} target="_blank" rel="noreferrer">
						GitHub
					</a>
					<a href={RELEASES} target="_blank" rel="noreferrer">
						Releases
					</a>
					<a href={`${GITHUB}/tree/main/cli`} target="_blank" rel="noreferrer">
						CLI docs
					</a>
					<a href={RELEASES} target="_blank" rel="noreferrer">
						Changelog
					</a>
				</div>
				<p className="footer-copy">
					© {new Date().getFullYear()} Bae Juhan / copixdev · MIT · free to use · no accounts
				</p>
			</footer>
		</div>
	);
}
