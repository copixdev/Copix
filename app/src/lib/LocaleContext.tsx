import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { detectLocale, t, type Locale } from './i18n';

type LocaleContextValue = {
	locale: Locale;
	setLocale: (locale: Locale) => void;
	t: (key: string, vars?: Record<string, string | number>) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
	const [locale, setLocale] = useState<Locale>(() => detectLocale());
	const value = useMemo<LocaleContextValue>(
		() => ({
			locale,
			setLocale,
			t: (key, vars) => t(locale, key, vars),
		}),
		[locale],
	);
	return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
	const ctx = useContext(LocaleContext);
	if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
	return ctx;
}
