import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { InteractiveDemo } from '../components/InteractiveDemo';
import { SiteNav } from '../components/SiteNav';
import { SyncStaticMock } from '../components/SyncStaticMock';
import { useLocale } from '../lib/LocaleContext';
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

type InstallTab = 'desktop' | 'cli';

export default function Landing() {
	const { t } = useLocale();
	const [tab, setTab] = useState<InstallTab>('desktop');
	const [os, setOs] = useState<InstallOs>('mac');
	const [copied, setCopied] = useState<'sh' | 'ps' | null>(null);
	const location = useLocation();
	const demoSrc = `${import.meta.env.BASE_URL}demo.mp4`;
	const pack = desktopDownload(os);

	useEffect(() => {
		document.title = t('doc.title');
	}, [t]);

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
					<p className="hero-kicker">{t('hero.kicker')}</p>
					<h1 className="hero-title">{t('hero.title')}</h1>
					<p className="hero-sub">
						{t('hero.subBefore')} <code>~/Copix</code> {t('hero.subAfter')}
					</p>
					<div className="hero-cta">
						<a className="btn primary lg" href="#install">
							{t('hero.getDesktop')}
						</a>
						<a className="btn ghost lg" href="#install-cli">
							{t('hero.installCli')}
						</a>
						<a className="btn ghost lg" href="#watch">
							{t('hero.watch')}
						</a>
					</div>
					<p className="hero-meta">{t('hero.meta', { version: DESKTOP_VERSION })}</p>
				</section>

				{/* ONE live Sync InteractiveDemo — owned by the hero. */}
				<section className="hero-demo" id="demo" aria-label={t('hero.demoLabel')}>
					<div className="hero-demo-stage">
						<InteractiveDemo sceneId="sync" />
					</div>
				</section>

				{/* Sync chapter: static still only — no second live session / IntersectionObserver. */}
				<section className="demo-chapter scene-sync" id="demo-sync" aria-labelledby="sync-title">
					<div className="demo-split">
						<div className="section-head">
							<p className="chapter-kicker">{t('chapter.sync.kicker')}</p>
							<h2 id="sync-title">{t('chapter.sync.title')}</h2>
							<p>{t('chapter.sync.blurb')}</p>
							<p className="chapter-note">{t('chapter.sync.note')}</p>
							<ul className="tool-list" aria-label={t('chapter.toolsLabel')}>
								{tools.map((name) => (
									<li key={name}>
										<code>{name}</code>
									</li>
								))}
							</ul>
						</div>
						<div className="stage-section">
							<SyncStaticMock />
						</div>
					</div>
				</section>

				<section className="demo-chapter scene-tools" id="demo-tools" aria-labelledby="tools-title">
					<div className="demo-split">
						<div className="section-head">
							<p className="chapter-kicker">{t('chapter.tools.kicker')}</p>
							<h2 id="tools-title">{t('chapter.tools.title')}</h2>
							<p>{t('chapter.tools.blurb')}</p>
						</div>
						<div className="stage-section">
							<InteractiveDemo sceneId="tools" />
						</div>
					</div>
				</section>

				<section className="demo-chapter scene-models" id="demo-models" aria-labelledby="models-title">
					<div className="demo-split">
						<div className="section-head">
							<p className="chapter-kicker">{t('chapter.models.kicker')}</p>
							<h2 id="models-title">{t('chapter.models.title')}</h2>
							<p>{t('chapter.models.blurb')}</p>
						</div>
						<div className="stage-section">
							<InteractiveDemo sceneId="models" />
						</div>
					</div>
				</section>

				<section className="watch-section" id="watch">
					<div className="section-head">
						<h2>{t('watch.title')}</h2>
						<p>{t('watch.blurb')}</p>
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
						<h2>{t('install.title')}</h2>
						<p>{t('install.blurb')}</p>
					</div>

					<div className="install-tabs" role="tablist" aria-label={t('install.method')}>
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
							{t('install.tabDesktop')}
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
							{t('install.tabCli')}
						</button>
					</div>

					{tab === 'desktop' ? (
						<div className="install-panel picker-panel" role="tabpanel">
							<p className="picker-row">
								<span className="picker-label">{t('install.for')}</span>
								<label className="picker-field">
									<span className="sr-only">{t('install.os')}</span>
									<select value={os} onChange={(e) => setOs(e.target.value as InstallOs)}>
										<option value="mac">{t('install.mac')}</option>
										<option value="win">{t('install.win')}</option>
									</select>
								</label>
							</p>
							<p className="picker-row">
								<span className="picker-label">{t('install.running')}</span>
								<label className="picker-field">
									<span className="sr-only">{t('install.arch')}</span>
									<select value={pack.archLabel} onChange={() => undefined}>
										<option value={pack.archLabel}>{pack.archLabel}</option>
									</select>
								</label>
								<span className="picker-label">{t('install.version')}</span>
								<label className="picker-field">
									<span className="sr-only">{t('install.desktopVersion')}</span>
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
									{t('install.allReleases')}
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
									{t('install.preferCli')}
								</button>
							</p>
						</div>
					) : (
						<div className="install-panel" role="tabpanel">
							<p className="install-hint">{t('install.cliHint')}</p>
							<p className="install-os">
								<strong>{t('install.macLinux')}</strong>
							</p>
							<pre className="install">
								<code>{CLI_SH}</code>
							</pre>
							<div className="install-actions">
								<button type="button" className="btn primary" onClick={() => void copyText(CLI_SH, 'sh')}>
									{copied === 'sh' ? t('install.copied') : t('install.copy')}
								</button>
							</div>

							<p className="install-os" style={{ marginTop: 20 }}>
								<strong>{t('install.windowsPs')}</strong>
							</p>
							<pre className="install">
								<code>{CLI_PS}</code>
							</pre>
							<div className="install-actions">
								<button type="button" className="btn ghost" onClick={() => void copyText(CLI_PS, 'ps')}>
									{copied === 'ps' ? t('install.copied') : t('install.copy')}
								</button>
							</div>

							<h3 className="after-title">{t('install.after')}</h3>
							<pre className="install">
								<code>{`ollama pull qwen2.5:3b
copix doctor
copix`}</code>
							</pre>
							<p className="install-hint">
								{t('install.cliDocsBefore')}{' '}
								<a className="text-link" href={`${GITHUB}/tree/main/cli`} target="_blank" rel="noreferrer">
									{t('install.cliDocsLink')}
								</a>
								{t('install.cliDocsAfter')}
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
						{t('footer.github')}
					</a>
					<a href={RELEASES} target="_blank" rel="noreferrer">
						{t('footer.releases')}
					</a>
					<a href={`${GITHUB}/tree/main/cli`} target="_blank" rel="noreferrer">
						{t('footer.cliDocs')}
					</a>
					<a href={RELEASES} target="_blank" rel="noreferrer">
						{t('footer.changelog')}
					</a>
				</div>
				<p className="footer-copy">{t('footer.copy', { year: new Date().getFullYear() })}</p>
			</footer>
		</div>
	);
}
