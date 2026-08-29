import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LocaleProvider } from './lib/LocaleContext';
import Landing from './pages/Landing';

export default function App() {
	const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || undefined;
	return (
		<BrowserRouter basename={basename}>
			<ErrorBoundary>
				<LocaleProvider>
					<Routes>
						<Route path="/" element={<Landing />} />
						<Route path="*" element={<Navigate to="/" replace />} />
					</Routes>
				</LocaleProvider>
			</ErrorBoundary>
		</BrowserRouter>
	);
}
