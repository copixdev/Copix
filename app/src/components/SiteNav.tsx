import { Link } from 'react-router-dom';
import { GITHUB } from '../lib/platform';

const ICON = `${import.meta.env.BASE_URL}icon.png`;

export function SiteNav() {
	return (
		<header className="nav">
			<Link className="nav-brand" to="/" aria-label="Copix home">
				<img src={ICON} alt="" width={28} height={28} />
				<span>Copix</span>
			</Link>
			<nav className="nav-links" aria-label="Primary">
				<a href="#demo">Demo</a>
				<a href="#install">Install</a>
				<a href={GITHUB} target="_blank" rel="noreferrer">
					GitHub
				</a>
			</nav>
			<div className="nav-actions">
				<a className="btn primary" href="#install">
					Get Desktop
				</a>
				<a className="btn ghost" href="#install-cli">
					CLI
				</a>
			</div>
		</header>
	);
}
