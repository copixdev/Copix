import { Link } from 'react-router-dom';
import { LOCALES } from '../lib/i18n';
import { useLocale } from '../lib/LocaleContext';
import { GITHUB } from '../lib/platform';

const LOGO = `${import.meta.env.BASE_URL}logo.png`;

export function SiteNav() {
	const { locale, setLocale, t } = useLocale();

	return (
		<div className="nav-shell">
			<header className="nav wrap">
				<div className="nav-start">
					<Link className="nav-brand" to="/" aria-label="Copix home">
						<img className="nav-logo" src={LOGO} alt="" width={28} height={28} />
						<span>Copix</span>
					</Link>
					<nav className="nav-links" aria-label="Primary">
						<a href="#watch">{t('nav.demo')}</a>
						<a href="#install">{t('nav.install')}</a>
						<a href={GITHUB} target="_blank" rel="noreferrer">
							{t('nav.github')}
						</a>
					</nav>
				</div>
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
				</div>
			</header>
		</div>
	);
}
