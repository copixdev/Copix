import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { PixelMark } from '../components/PixelMark';
import { SiteNav } from '../components/SiteNav';
import { useLocale } from '../lib/LocaleContext';
import { CLI_PS, CLI_SH, DESKTOP_VERSION, GITHUB, RELEASES } from '../lib/platform';
import { scrollToHash } from '../lib/scroll';
import catalog from 'virtual:copix-releases';

const FACTS = ['machine', 'session', 'account', 'mit'] as const;

const CHAPTERS = [
	{ id: 'demo-sync', key: 'sync' },
	{ id: 'demo-tools', key: 'tools' },
	{ id: 'demo-models', key: 'models' },
] as const;

const AFTER_INSTALL = `ollama pull qwen2.5:3b
copix doctor
copix`;

export default function Landing() {
	const { t } = useLocale();
	const [copied, setCopied] = useState<'sh' | 'ps' | null>(null);
	const location = useLocation();
	const demoSrc = `${import.meta.env.BASE_URL}demo.mp4`;

	useEffect(() => {
		document.title = t('doc.title');
	}, [t]);

	useEffect(() => {
		function applyHash(hash: string) {
			if (!hash) return;
			const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
			const target = hash === '#cli' ? '#install-cli' : hash;
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
				<section className="hero wrap">
					<p className="kicker">{t('hero.kicker')}</p>
					<h1 className="hero-title">{t('hero.title')}</h1>
					<p className="hero-sub">
						{t('hero.subBefore')} <code>~/Copix</code> {t('hero.subAfter')}
					</p>
					<div className="hero-cta">
						<a className="btn primary" href="#install">
							{t('hero.getDesktop')}
						</a>
						<a className="text-link" href="#install-cli">
							{t('hero.installCli')}
						</a>
					</div>
					<p className="hero-meta">{t('hero.meta', { version: DESKTOP_VERSION })}</p>
					<img
						className="hero-shot"
						src={`${import.meta.env.BASE_URL}desktop.png`}
						alt="Copix Desktop"
						width={2938}
						height={1642}
					/>
				</section>

				<section className="facts wrap" aria-label="Copix">
					{FACTS.map((id) => (
						<article className="fact" key={id}>
							<h2>{t(`facts.${id}.title`)}</h2>
							<p>{t(`facts.${id}.body`)}</p>
						</article>
					))}
				</section>

				<section className="chapters wrap">
					{CHAPTERS.map((chapter) => (
						<article key={chapter.id} id={chapter.id}>
							<PixelMark />
							<p className="kicker">{t(`chapter.${chapter.key}.kicker`)}</p>
							<h2 id={`${chapter.key}-title`}>{t(`chapter.${chapter.key}.title`)}</h2>
							<p>{t(`chapter.${chapter.key}.blurb`)}</p>
						</article>
					))}
				</section>

				<section className="watch wrap" id="watch">
					<div className="watch-copy">
						<h2>{t('watch.title')}</h2>
						<p>{t('watch.blurb')}</p>
					</div>
					<figure className="watch-video">
						<video controls playsInline preload="metadata" poster={`${import.meta.env.BASE_URL}icon.png`}>
							<source src={demoSrc} type="video/mp4" />
						</video>
					</figure>
				</section>

				<section className="install wrap" id="install">
					<p className="kicker">{t('install.title')}</p>
					<h2 className="install-lead">{t('install.blurb')}</h2>
					<div className="latest-downloads">
						{catalog.latestMac ? (
							<a className="btn latest" href={catalog.latestMac.url} target="_blank" rel="noreferrer">
								<span>{t('install.mac')}</span>
								<span className="latest-ver">{catalog.latestMac.version}</span>
							</a>
						) : null}
						{catalog.latestWin ? (
							<a className="btn latest" href={catalog.latestWin.url} target="_blank" rel="noreferrer">
								<span>{t('install.win')}</span>
								<span className="latest-ver">{catalog.latestWin.version}</span>
							</a>
						) : null}
					</div>
					{catalog.older.length > 0 ? (
						<div className="older">
							<h3>{t('install.older')}</h3>
							<table className="older-table">
								<thead>
									<tr>
										<th scope="col">{t('install.version')}</th>
										<th scope="col">{t('install.mac')}</th>
										<th scope="col">{t('install.win')}</th>
									</tr>
								</thead>
								<tbody>
									{catalog.older.map((row) => (
										<tr key={row.version}>
											<th scope="row">{row.version}</th>
											<td>
												{row.mac ? (
													<a className="text-link" href={row.mac.url} target="_blank" rel="noreferrer">
														{t('install.download')}
													</a>
												) : null}
											</td>
											<td>
												{row.win ? (
													<a className="text-link" href={row.win.url} target="_blank" rel="noreferrer">
														{t('install.download')}
													</a>
												) : null}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					) : null}
					<div className="cli-block" id="install-cli">
						<p className="kicker">{t('install.tabCli')}</p>
						<p className="install-arch">Copix CLI</p>
						<p className="install-hint">{t('install.cliHint')}</p>
						<p className="install-os">{t('install.macLinux')}</p>
						<p className="command">{CLI_SH}</p>
						<button type="button" className="text-link as-button" onClick={() => void copyText(CLI_SH, 'sh')}>
							{copied === 'sh' ? t('install.copied') : t('install.copy')}
						</button>
						<p className="install-os">{t('install.windowsPs')}</p>
						<p className="command">{CLI_PS}</p>
						<button type="button" className="text-link as-button" onClick={() => void copyText(CLI_PS, 'ps')}>
							{copied === 'ps' ? t('install.copied') : t('install.copy')}
						</button>
						<h3 className="after-title">{t('install.after')}</h3>
						<p className="command">{AFTER_INSTALL}</p>
						<p className="install-hint">
							{t('install.cliDocsBefore')}{' '}
							<a className="text-link" href={`${GITHUB}/tree/main/cli`} target="_blank" rel="noreferrer">
								{t('install.cliDocsLink')}
							</a>
							{t('install.cliDocsAfter')}
						</p>
					</div>
					<p className="install-more">
						<a className="text-link" href={RELEASES} target="_blank" rel="noreferrer">
							{t('install.allReleases')}
						</a>
					</p>
				</section>
			</main>

			<footer className="footer">
				<div className="wrap footer-inner">
					<div className="footer-brand">Copix</div>
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
				</div>
			</footer>
		</div>
	);
}
