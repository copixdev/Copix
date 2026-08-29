import { Link } from 'react-router-dom';
import { LOCALES } from '../lib/i18n';
import { useLocale } from '../lib/LocaleContext';
import { GITHUB } from '../lib/platform';

const ICON = `${import.meta.env.BASE_URL}icon.png`;

export function SiteNav() {
	const { locale, setLocale, t } = useLocale();

	return (
		<div className="nav-shell">
			<header className="nav">
				<Link className="nav-brand" to="/" aria-label="Copix home">
					<img src={ICON} alt="" width={26} height={26} />
					<span>Copix</span>
				</Link>
				<nav className="nav-links" aria-label="Primary">
					<a href="#demo">{t('nav.demo')}</a>
					<a href="#install">{t('nav.install')}</a>
					<a href={GITHUB} target="_blank" rel="noreferrer">
						{t('nav.github')}
					</a>
				</nav>
				<div className="nav-actions">
					<label className="nav-lang">
						<span className="sr-only">{t('nav.lang')}</span>
						<select
							value={locale}
							onChange={(e) => setLocale(e.target.value as typeof locale)}
							aria-label={t('nav.lang')}
						>
							{LOCALES.map((item) => (
								<option key={item.id} value={item.id}>
									{item.label}
								</option>
							))}
						</select>
					</label>
					<a className="btn primary" href="#install">
						{t('nav.getDesktop')}
					</a>
					<a className="btn ghost" href="#install-cli">
						{t('nav.cli')}
					</a>
				</div>
			</header>
		</div>
	);
}
