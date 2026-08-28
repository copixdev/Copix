import { Link } from 'react-router-dom';
import { GITHUB, RELEASES } from '../lib/platform';

const ICON = `${import.meta.env.BASE_URL}icon.png`;

export function SiteNav() {
	return (
		<header className="nav">
			<div className="nav-inner">
				<Link className="nav-brand" to="/" aria-label="Copix home">
					<img src={ICON} alt="" width={28} height={28} />
					<span>Copix</span>
					<em className="nav-ver">v4.3.0</em>
				</Link>
				<nav className="nav-links" aria-label="Primary">
					<a href="#product">Product</a>
					<a href="#tools">Tools</a>
					<a href="#install">Install</a>
					<a href="#cli">CLI</a>
				</nav>
				<div className="nav-actions">
					<a className="btn ghost" href={GITHUB} target="_blank" rel="noreferrer">
						GitHub
					</a>
					<a className="btn primary" href={RELEASES} target="_blank" rel="noreferrer">
						Releases
					</a>
				</div>
			</div>
		</header>
	);
}
