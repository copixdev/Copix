import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { SiteNav } from '../components/SiteNav';
import { detectPlatform, GITHUB, RELEASES } from '../lib/platform';
import { scrollToHash } from '../lib/scroll';

const tools = [
	'create_project',
	'edit_file',
	'terminal',
	'web_search',
	'web_fetch',
] as const;

type InstallTab = 'desktop' | 'cli';

export default function Landing() {
	const platform = useMemo(() => detectPlatform(), []);
	const [tab, setTab] = useState<InstallTab>(
		platform.os === 'mac' || platform.os === 'windows' ? 'desktop' : 'cli',
	);
	const [copied, setCopied] = useState<'cli' | 'alt' | 'xattr' | null>(null);
	const location = useLocation();
	const demoSrc = `${import.meta.env.BASE_URL}demo.mp4`;

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
			// Scroll to the install section for both Desktop and CLI hashes.
			const target =
				hash === '#cli' || hash === '#install-cli' || hash === '#install' ? '#install' : hash;
			window.setTimeout(() => scrollToHash(target, reduced ? 'auto' : 'smooth'), 40);
		}
		applyHash(location.hash);
		const onHash = () => applyHash(window.location.hash);
		window.addEventListener('hashchange', onHash);
		return () => window.removeEventListener('hashchange', onHash);
	}, [location.hash]);

	async function copyText(text: string, key: 'cli' | 'alt' | 'xattr') {
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
				{/* 1–2. Hero + demo */}
				<section className="hero" id="demo">
					<p className="hero-kicker">Desktop · CLI · local Ollama</p>
					<h1 className="hero-title">A local coding agent. Pixel-precise.</h1>
					<p className="hero-sub">
						Copix runs on your machine with Ollama. Desktop installers and a standalone CLI — no
						accounts, MIT, sessions sync through <code>~/Copix</code>.
					</p>
					<div className="hero-cta">
						<a className="btn primary lg" href="#install">
							Get Desktop
						</a>
						<a className="btn ghost lg" href="#install-cli">
							Install CLI
						</a>
					</div>
					<p className="hero-meta">
						Detected {platform.osLabel} · Latest Desktop v4.3.0 · No login
					</p>

					<figure className="hero-video">
						<video
							controls
							muted
							playsInline
							autoPlay
							loop
							preload="metadata"
							poster={`${import.meta.env.BASE_URL}icon.png`}
						>
							<source src={demoSrc} type="video/mp4" />
						</video>
						<figcaption>Real product demo · demo.mp4</figcaption>
					</figure>
				</section>

				{/* 3. Product */}
				<section className="product" id="product">
					<div className="section-head">
						<h2>Desktop and CLI share one agent</h2>
						<p>
							Same tools, same sessions under <code>~/Copix</code>. Hand work to the agent; you stay on
							decisions.
						</p>
					</div>

					<ul className="tool-list" aria-label="Agent tools">
						{tools.map((name) => (
							<li key={name}>
								<code>{name}</code>
							</li>
						))}
					</ul>
				</section>

				{/* 4. Install */}
				<section className="install-section" id="install">
					{/* Distinct hash target so #install-cli opens the CLI tab without flipping to Desktop. */}
					<span id="install-cli" hidden />
					<div className="section-head">
						<h2>Install</h2>
						<p>Pick Desktop or CLI. OS detection picks a sensible default; both stay local.</p>
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
						<div className="install-panel" role="tabpanel">
							<p className="install-os">
								Detected OS: <strong>{platform.osLabel}</strong>
							</p>
							<p className="install-hint">{platform.desktopHint}</p>
							<div className="install-actions">
								<a className="btn primary" href={platform.desktopUrl} target="_blank" rel="noreferrer">
									{platform.desktopLabel}
								</a>
								<a className="btn ghost" href={RELEASES} target="_blank" rel="noreferrer">
									All releases
								</a>
							</div>

							<div className="gatekeeper">
								<h3>macOS: “damaged and can’t be opened”</h3>
								<p className="install-hint">
									Gatekeeper quarantine (not a bad download). After dragging to Applications:
								</p>
								<pre className="install">
									<code>{`xattr -cr /Applications/Copix.app
open /Applications/Copix.app`}</code>
								</pre>
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
									{copied === 'xattr' ? 'Copied' : 'Copy command'}
								</button>
							</div>
						</div>
					) : (
						<div className="install-panel" role="tabpanel">
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
									{copied === 'cli' ? 'Copied' : 'Copy'}
								</button>
							</div>

							<p className="install-os" style={{ marginTop: 20 }}>
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
									{copied === 'alt' ? 'Copied' : 'Copy'}
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

			{/* 5. Footer */}
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
