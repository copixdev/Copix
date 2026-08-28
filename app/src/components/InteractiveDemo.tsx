import { useEffect, useRef, useState } from 'react';

type Line =
	| { kind: 'prompt'; text: string }
	| { kind: 'out'; text: string }
	| { kind: 'dim'; text: string }
	| { kind: 'ok'; text: string }
	| { kind: 'tool'; name: string; detail: string };

const script: Line[] = [
	{ kind: 'prompt', text: 'copix "add a /health route and a smoke test"' },
	{ kind: 'dim', text: 'model  qwen2.5:3b  ·  provider  ollama  ·  cwd  ~/projects/api' },
	{ kind: 'tool', name: 'list_dir', detail: 'src/' },
	{ kind: 'tool', name: 'read_file', detail: 'src/server.ts' },
	{ kind: 'tool', name: 'edit_file', detail: 'src/routes/health.ts  +18' },
	{ kind: 'tool', name: 'write_file', detail: 'tests/health.test.ts  +24' },
	{ kind: 'tool', name: 'terminal', detail: 'npm test -- health' },
	{ kind: 'ok', text: '3 passed · health route live on :8787/health' },
	{
		kind: 'out',
		text: 'Created the route, wired it in server.ts, and left a focused smoke test.',
	},
	{ kind: 'prompt', text: '' },
];

function delay(ms: number, signal: AbortSignal) {
	return new Promise<void>((resolve, reject) => {
		if (signal.aborted) {
			reject(new DOMException('aborted', 'AbortError'));
			return;
		}
		const id = window.setTimeout(() => resolve(), ms);
		signal.addEventListener(
			'abort',
			() => {
				window.clearTimeout(id);
				reject(new DOMException('aborted', 'AbortError'));
			},
			{ once: true },
		);
	});
}

/** Illustrative CLI session — original CSS/graphics, not a product screenshot. */
export function InteractiveDemo() {
	const [visible, setVisible] = useState(0);
	const [typed, setTyped] = useState('');
	const [runId, setRunId] = useState(0);
	const scroller = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const ac = new AbortController();
		const { signal } = ac;
		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		async function play() {
			setVisible(0);
			setTyped('');
			if (reduced) {
				setVisible(script.length);
				const last = script.find((l) => l.kind === 'prompt');
				setTyped(last?.kind === 'prompt' ? last.text : '');
				return;
			}
			for (let i = 0; i < script.length; i++) {
				if (signal.aborted) return;
				const line = script[i];
				if (line.kind === 'prompt' && line.text) {
					setVisible(i);
					setTyped('');
					for (let c = 1; c <= line.text.length; c++) {
						if (signal.aborted) return;
						setTyped(line.text.slice(0, c));
						await delay(18, signal);
					}
					await delay(280, signal);
				} else {
					setVisible(i + 1);
					await delay(line.kind === 'tool' ? 320 : 220, signal);
				}
			}
			setVisible(script.length);
		}

		play().catch((err) => {
			if (err instanceof DOMException && err.name === 'AbortError') return;
			console.error(err);
		});

		return () => ac.abort();
	}, [runId]);

	useEffect(() => {
		const el = scroller.current;
		if (!el) return;
		el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
	}, [visible, typed]);

	return (
		<div className="term" aria-label="Illustrated Copix CLI session">
			<div className="term-chrome">
				<span aria-hidden />
				<span aria-hidden />
				<span aria-hidden />
				<code className="term-title">copix · local · qwen2.5:3b</code>
				<button type="button" className="term-replay" onClick={() => setRunId((n) => n + 1)}>
					Replay
				</button>
			</div>
			<div className="term-body" ref={scroller}>
				{script.slice(0, visible).map((line, idx) => (
					<TermLine key={idx} line={line} />
				))}
				{visible < script.length && script[visible]?.kind === 'prompt' ? (
					<div className="term-line prompt">
						<span className="term-ps">$</span>
						<span>
							{typed}
							<span className="term-caret" aria-hidden />
						</span>
					</div>
				) : null}
				{visible >= script.length ? (
					<div className="term-line prompt">
						<span className="term-ps">$</span>
						<span className="term-caret" aria-hidden />
					</div>
				) : null}
			</div>
			<p className="term-caption">Illustrated session — runs on your machine with Ollama.</p>
		</div>
	);
}

function TermLine({ line }: { line: Line }) {
	if (line.kind === 'prompt') {
		if (!line.text) return null;
		return (
			<div className="term-line prompt">
				<span className="term-ps">$</span>
				<span>{line.text}</span>
			</div>
		);
	}
	if (line.kind === 'tool') {
		return (
			<div className="term-line tool">
				<span className="term-tool">{line.name}</span>
				<span>{line.detail}</span>
			</div>
		);
	}
	return <div className={`term-line ${line.kind}`}>{line.text}</div>;
}
