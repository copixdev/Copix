import {
	FormEvent,
	PointerEvent as ReactPointerEvent,
	useCallback,
	useEffect,
	useRef,
	useState,
	type Dispatch,
	type SetStateAction,
} from 'react';
import {
	APP_FILE,
	MODELS,
	PRD_FILE,
	SCENES,
	SESSION_HISTORY,
	SYNC_PLAN,
	SYNC_QUESTION,
	TOOLS_PLAN,
	MODELS_PLAN,
	VIEW_FILE_AFTER,
	VIEW_FILE_BEFORE,
	followUpReply,
	replyForChoice,
	type ChatItem,
	type EditorFile,
	type PlanStep,
	type SceneId,
} from '../lib/demo-session';
import { tokenizeLine, tokenizeMarkdown } from '../lib/syntax';

type Phase = 'playing' | 'awaiting' | 'done';
type WinId = 'desktop' | 'cli';

const ICON = `${import.meta.env.BASE_URL}icon.png`;
const WALLPAPER = `${import.meta.env.BASE_URL}wallpaper.jpg`;

function delay(ms: number, signal: AbortSignal) {
	return new Promise<void>((resolve, reject) => {
		if (signal.aborted) {
			reject(new DOMException('aborted', 'AbortError'));
			return;
		}
		if (ms <= 0) {
			resolve();
			return;
		}
		const id = window.setTimeout(() => resolve(), ms);
		const onAbort = () => {
			window.clearTimeout(id);
			reject(new DOMException('aborted', 'AbortError'));
		};
		signal.addEventListener('abort', onAbort, { once: true });
	});
}

function uid() {
	return `m-${Math.random().toString(36).slice(2, 9)}`;
}

function reducedMotion() {
	return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

async function typeAgent(
	setItems: Dispatch<SetStateAction<ChatItem[]>>,
	full: string,
	signal: AbortSignal,
) {
	const id = uid();
	setItems((prev) => [...prev, { id, kind: 'agent', text: '', streaming: true }]);
	if (reducedMotion()) {
		setItems((prev) => prev.map((row) => (row.id === id ? { ...row, text: full, streaming: false } : row)));
		return;
	}
	const step = Math.max(1, Math.ceil(full.length / 42));
	for (let i = 0; i <= full.length; i += step) {
		const slice = full.slice(0, Math.min(full.length, i));
		setItems((prev) =>
			prev.map((row) =>
				row.id === id ? { ...row, text: slice, streaming: i < full.length } : row,
			),
		);
		await delay(18, signal);
	}
	setItems((prev) => prev.map((row) => (row.id === id ? { ...row, text: full, streaming: false } : row)));
}

function WindowChrome({
	title,
	meta,
	onPointerDown,
	onPointerMove,
	onPointerUp,
	onFocus,
}: {
	title: string;
	meta?: string;
	onPointerDown: (e: ReactPointerEvent<HTMLDivElement>) => void;
	onPointerMove: (e: ReactPointerEvent<HTMLDivElement>) => void;
	onPointerUp: () => void;
	onFocus: () => void;
}) {
	return (
		<div
			className="mac-titlebar"
			onPointerDown={onPointerDown}
			onPointerMove={onPointerMove}
			onPointerUp={onPointerUp}
			onPointerCancel={onPointerUp}
			onMouseDown={onFocus}
		>
			<div className="mac-lights" aria-hidden>
				<span />
				<span />
				<span />
			</div>
			<div className="mac-title">{title}</div>
			{meta ? <div className="mac-title-meta">{meta}</div> : <div className="mac-title-meta" />}
		</div>
	);
}

function CodePane({ file, reveal }: { file: EditorFile; reveal: number }) {
	const tokenize = file.language === 'md' ? tokenizeMarkdown : tokenizeLine;
	let displayNum = 0;
	return (
		<div className="code-pane" role="table" aria-label={`${file.name} editor`}>
			{file.lines.map((line, idx) => {
				if (idx >= reveal) return null;
				if (line.diff !== 'del') displayNum += 1;
				const tokens = tokenize(line.text);
				const gutter = line.diff === 'add' ? '+' : line.diff === 'del' ? '−' : String(displayNum);
				return (
					<div
						key={`${file.name}-${idx}`}
						className={`code-line ${line.diff ?? ''} ${line.diff === 'add' ? 'reveal-add' : ''}`}
					>
						<span className="code-num">{line.diff === 'del' ? '' : displayNum}</span>
						<span className="code-mark">{gutter === String(displayNum) ? '' : gutter}</span>
						<span className="code-src">
							{tokens.map((tok, ti) => (
								<span key={ti} className={`tok tok-${tok.kind}`}>
									{tok.text}
								</span>
							))}
							{line.text === '' ? ' ' : null}
						</span>
					</div>
				);
			})}
		</div>
	);
}

type DemoProps = {
	sceneId: SceneId;
	/** Optional DOM id for the stage (first chapter uses `demo`). */
	stageId?: string;
};

export function InteractiveDemo({ sceneId, stageId }: DemoProps) {
	const [runId, setRunId] = useState(0);
	const [armed, setArmed] = useState(false);
	const [items, setItems] = useState<ChatItem[]>([]);
	const [files, setFiles] = useState<EditorFile[]>([PRD_FILE]);
	const [activeFile, setActiveFile] = useState(PRD_FILE.name);
	const [plan, setPlan] = useState<PlanStep[]>(SYNC_PLAN);
	const [model, setModel] = useState<string>(MODELS[0]);
	const [phase, setPhase] = useState<Phase>('playing');
	const [desktopInput, setDesktopInput] = useState('');
	const [cliInput, setCliInput] = useState('');
	const [reveal, setReveal] = useState(99);
	const [focus, setFocus] = useState<WinId>('desktop');
	const [deskOffset, setDeskOffset] = useState({ x: 0, y: 0 });
	const [cliOffset, setCliOffset] = useState({ x: 0, y: 0 });
	const [now, setNow] = useState('Fri  2:14 PM');

	const stageRef = useRef<HTMLDivElement>(null);
	const deskThread = useRef<HTMLDivElement>(null);
	const cliThread = useRef<HTMLDivElement>(null);
	const abortRef = useRef<AbortController | null>(null);
	const phaseRef = useRef<Phase>('playing');
	const modelRef = useRef(model);
	const dragRef = useRef<{ win: WinId; dx: number; dy: number } | null>(null);
	const followUpLock = useRef(false);
	const followUpQueue = useRef<string[]>([]);

	phaseRef.current = phase;
	modelRef.current = model;
	const currentFile = files.find((f) => f.name === activeFile) ?? files[0];
	const scene = SCENES.find((s) => s.id === sceneId)!;

	useEffect(() => {
		const tick = () => {
			const d = new Date();
			const wk = d.toLocaleDateString('en-US', { weekday: 'short' });
			const tm = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
			setNow(`${wk}  ${tm}`);
		};
		tick();
		const id = window.setInterval(tick, 30_000);
		return () => window.clearInterval(id);
	}, []);

	useEffect(() => {
		const el = stageRef.current;
		if (!el) return;
		const io = new IntersectionObserver(
			([entry]) => {
				if (entry?.isIntersecting) setArmed(true);
			},
			{ threshold: 0.28, rootMargin: '0px 0px -8% 0px' },
		);
		io.observe(el);
		return () => io.disconnect();
	}, []);

	useEffect(() => {
		for (const el of [deskThread.current, cliThread.current]) {
			if (!el) continue;
			el.scrollTo({ top: el.scrollHeight, behavior: reducedMotion() ? 'auto' : 'smooth' });
		}
	}, [items, phase]);

	const animateReveal = useCallback(async (file: EditorFile, signal: AbortSignal) => {
		if (reducedMotion()) {
			setReveal(file.lines.length);
			return;
		}
		const firstAdd = file.lines.findIndex((l) => l.diff === 'add');
		const start = firstAdd === -1 ? file.lines.length : Math.max(1, firstAdd);
		setReveal(start);
		for (let i = start; i <= file.lines.length; i += 1) {
			await delay(48, signal);
			setReveal(i);
		}
	}, []);

	useEffect(() => {
		if (!armed) return;
		const ac = new AbortController();
		abortRef.current = ac;
		const { signal } = ac;
		followUpLock.current = false;
		followUpQueue.current = [];

		async function markStatus(text: string) {
			const id = uid();
			setItems((prev) => [...prev, { id, kind: 'status', text, done: false }]);
			await delay(reducedMotion() ? 0 : 420, signal);
			setItems((prev) => prev.map((row) => (row.id === id ? { ...row, done: true } : row)));
		}

		async function play() {
			setItems([]);
			setDesktopInput('');
			setCliInput('');
			setPhase('playing');
			phaseRef.current = 'playing';
			setFocus('desktop');
			if (sceneId === 'sync') {
				setFiles([PRD_FILE, VIEW_FILE_BEFORE]);
				setActiveFile(PRD_FILE.name);
				setPlan(SYNC_PLAN);
				setReveal(PRD_FILE.lines.length);
				setItems((prev) => [
					...prev,
					{ id: uid(), kind: 'user', text: 'Plan a Mission Control interface for macOS Desktop' },
				]);
				await delay(280, signal);
				await markStatus('Thinking');
				await markStatus('Reading AppManager.tsx');
				setItems((prev) => [
					...prev,
					{ id: uid(), kind: 'file', name: 'feature-prd.md', delta: '+68' },
				]);
				await typeAgent(
					setItems,
					'Drafted a Mission Control plan: grid overview of open windows, MenuBar entry, and keyboard trigger. One choice left before I build.',
					signal,
				);
				setItems((prev) => [
					...prev,
					{
						id: uid(),
						kind: 'question',
						prompt: SYNC_QUESTION.prompt,
						options: SYNC_QUESTION.options,
						selected: null,
					},
				]);
				setPhase('awaiting');
				phaseRef.current = 'awaiting';
				return;
			}

			if (sceneId === 'tools') {
				setFiles([VIEW_FILE_BEFORE, APP_FILE]);
				setActiveFile(VIEW_FILE_BEFORE.name);
				setPlan(TOOLS_PLAN);
				setReveal(VIEW_FILE_BEFORE.lines.length);
				setItems((prev) => [
					...prev,
					{ id: uid(), kind: 'user', text: 'Add Mission Control — F3 and a Window menu item' },
				]);
				await delay(240, signal);
				await markStatus('Thinking');
				await markStatus('edit_file · MissionControlView.tsx');
				setItems((prev) => [
					...prev,
					{ id: uid(), kind: 'file', name: 'MissionControlView.tsx', delta: '+18' },
				]);
				setFiles([VIEW_FILE_AFTER, APP_FILE]);
				setActiveFile(VIEW_FILE_AFTER.name);
				await animateReveal(VIEW_FILE_AFTER, signal);
			setPlan(
				TOOLS_PLAN.map((step, i) => ({
					...step,
					status: i < 2 ? 'done' : 'current',
				})),
			);
				await markStatus('terminal · npx tsc --noEmit');
				setItems((prev) => [
					...prev,
					{ id: uid(), kind: 'term', command: 'npx tsc --noEmit', output: 'Found 0 errors' },
				]);
				setItems((prev) => [
					...prev,
					{ id: uid(), kind: 'file', name: 'AppManager.tsx', delta: '+12' },
				]);
				setActiveFile(APP_FILE.name);
				setReveal(APP_FILE.lines.length);
				setPlan(TOOLS_PLAN.map((step) => ({ ...step, status: 'done' })));
				await typeAgent(
					setItems,
					'Wired F3 + Window › Mission Control. Typecheck is clean. Desktop and CLI are looking at the same diff under ~/Copix.',
					signal,
				);
				setPhase('done');
				return;
			}

			setFiles([VIEW_FILE_BEFORE]);
			setActiveFile(VIEW_FILE_BEFORE.name);
			setPlan(MODELS_PLAN);
			setReveal(VIEW_FILE_BEFORE.lines.length);
			setItems((prev) => [
				...prev,
				{ id: uid(), kind: 'user', text: `Using ${modelRef.current}, plan then write MissionControlView` },
			]);
			await markStatus(`model · ${modelRef.current}`);
			await markStatus('Writing plan');
			setPlan(
				MODELS_PLAN.map((step, i) => ({
					...step,
					status: i === 0 ? 'done' : i === 1 ? 'current' : 'todo',
				})),
			);
			await typeAgent(
				setItems,
				`Plan with ${modelRef.current}: keep the stub, add ExposeTriggers, bind F3, render ExposeGrid. Writing the file next.`,
				signal,
			);
			setPlan(MODELS_PLAN.map((step, i) => ({ ...step, status: i < 2 ? 'done' : 'current' })));
			await markStatus('edit_file · MissionControlView.tsx');
			setItems((prev) => [...prev, { id: uid(), kind: 'file', name: 'MissionControlView.tsx', delta: '+18' }]);
			setFiles([VIEW_FILE_AFTER]);
			setActiveFile(VIEW_FILE_AFTER.name);
			await animateReveal(VIEW_FILE_AFTER, signal);
			setPlan(MODELS_PLAN.map((step) => ({ ...step, status: 'done' })));
			await typeAgent(
				setItems,
				`${modelRef.current} finished the view. Flip the tag anytime — both windows stay on this ~/Copix session.`,
				signal,
			);
			setPhase('done');
		}

		play().catch((err) => {
			if (err instanceof DOMException && err.name === 'AbortError') return;
			console.error(err);
		});

		return () => ac.abort();
	}, [armed, runId, sceneId, animateReveal]);

	async function completeQuestion(index: number) {
		const signal = abortRef.current?.signal;
		if (!signal || signal.aborted) return;
		if (phaseRef.current !== 'awaiting') return;
		const choice = SYNC_QUESTION.options[index] ?? SYNC_QUESTION.options[SYNC_QUESTION.defaultChoice];
		setItems((prev) =>
			prev.map((row) => (row.kind === 'question' ? { ...row, selected: index } : row)),
		);
		setPhase('playing');
		phaseRef.current = 'playing';
		const id = uid();
		setItems((prev) => [...prev, { id, kind: 'status', text: 'Updating plan from your choice', done: false }]);
		try {
			await delay(reducedMotion() ? 0 : 360, signal);
			setItems((prev) => prev.map((row) => (row.id === id ? { ...row, done: true } : row)));
			await typeAgent(setItems, replyForChoice(choice), signal);
			setItems((prev) => [
				...prev,
				{ id: uid(), kind: 'file', name: 'MissionControlView.tsx', delta: '+18' },
			]);
			setFiles([PRD_FILE, VIEW_FILE_AFTER]);
			setActiveFile(VIEW_FILE_AFTER.name);
			await animateReveal(VIEW_FILE_AFTER, signal);
			setPlan(SYNC_PLAN.map((step) => ({ ...step, status: 'done' })));
			setPhase('done');
			phaseRef.current = 'done';
		} catch {
			/* aborted */
		}
	}

	async function sendFollowUp(text: string) {
		const trimmed = text.trim();
		if (!trimmed) return;
		setDesktopInput('');
		setCliInput('');
		if (followUpLock.current) {
			followUpQueue.current.push(trimmed);
			return;
		}
		const signal = abortRef.current?.signal;
		if (!signal || signal.aborted) return;
		followUpLock.current = true;
		setItems((prev) => [...prev, { id: uid(), kind: 'user', text: trimmed }]);
		setPhase('playing');
		phaseRef.current = 'playing';
		try {
			const st = uid();
			setItems((prev) => [...prev, { id: st, kind: 'status', text: 'Thinking', done: false }]);
			await delay(reducedMotion() ? 0 : 380, signal);
			setItems((prev) => prev.map((row) => (row.id === st ? { ...row, done: true } : row)));
			await typeAgent(setItems, followUpReply(trimmed, modelRef.current), signal);
			setPhase('done');
			phaseRef.current = 'done';
		} catch {
			/* aborted */
		} finally {
			followUpLock.current = false;
			const next = followUpQueue.current.shift();
			if (next) void sendFollowUp(next);
		}
	}

	function onDesktopSubmit(e: FormEvent) {
		e.preventDefault();
		void sendFollowUp(desktopInput);
	}

	function onCliSubmit(e: FormEvent) {
		e.preventDefault();
		const raw = cliInput.trim();
		if (phase === 'awaiting' && /^[123]$/.test(raw)) {
			setCliInput('');
			void completeQuestion(Number(raw) - 1);
			return;
		}
		void sendFollowUp(cliInput);
	}

	function onModelChange(next: string) {
		setModel(next);
		modelRef.current = next;
		if (sceneId === 'models') setRunId((n) => n + 1);
	}

	function beginDrag(win: WinId, e: ReactPointerEvent<HTMLDivElement>) {
		if (window.matchMedia('(max-width: 900px)').matches) return;
		if ((e.target as HTMLElement).closest('select, button, input, a')) return;
		e.preventDefault();
		setFocus(win);
		const offset = win === 'desktop' ? deskOffset : cliOffset;
		dragRef.current = { win, dx: e.clientX - offset.x, dy: e.clientY - offset.y };
		e.currentTarget.setPointerCapture(e.pointerId);
	}

	function onDragMove(e: ReactPointerEvent<HTMLDivElement>) {
		const drag = dragRef.current;
		if (!drag) return;
		const next = { x: e.clientX - drag.dx, y: e.clientY - drag.dy };
		if (drag.win === 'desktop') setDeskOffset(next);
		else setCliOffset(next);
	}

	function endDrag() {
		dragRef.current = null;
	}

	function openFile(name: string) {
		const found = files.find((f) => f.name === name);
		if (found) {
			setActiveFile(found.name);
			setReveal(found.lines.length);
			setFocus('desktop');
		}
	}

	return (
		<div
			className="mac-stage"
			id={stageId}
			ref={stageRef}
			style={{ backgroundImage: `url(${WALLPAPER})` }}
			aria-label={`Copix ${scene.label} demo`}
		>
			<div className="mac-menubar">
				<div className="mac-menubar-left">
					<span className="mac-apple" aria-hidden>
						●
					</span>
					<strong>Copix</strong>
					<span>File</span>
					<span>Edit</span>
					<span>View</span>
					<span>Window</span>
				</div>
				<div className="mac-menubar-right">
					<span className="mac-pill">~/Copix</span>
					<span className="mac-pill">{scene.label}</span>
					<span>{now}</span>
				</div>
			</div>

			<div
				className={`mac-win desk-win ${focus === 'desktop' ? 'focused' : ''}`}
				style={{ transform: `translate(${deskOffset.x}px, ${deskOffset.y}px)` }}
				onPointerDown={() => setFocus('desktop')}
			>
				<WindowChrome
					title="Copix Desktop"
					meta={`${model} · Plan`}
					onPointerDown={(e) => beginDrag('desktop', e)}
					onPointerMove={onDragMove}
					onPointerUp={endDrag}
					onFocus={() => setFocus('desktop')}
				/>
				<div className="desk-body">
					<aside className="desk-rail">
						<div className="desk-rail-label">Agents</div>
						<ul>
							{SESSION_HISTORY.map((h) => (
								<li key={h.title} className={!h.done ? 'active' : ''}>
									<span className={`desk-check ${h.done || phase === 'done' ? 'done' : ''}`} />
									<div>
										<strong>{h.title}</strong>
										<em>{h.when}</em>
									</div>
								</li>
							))}
						</ul>
					</aside>

					<section className="desk-chat">
						<div className="desk-thread" ref={deskThread}>
							{items.map((item) => {
								if (item.kind === 'status') {
									return (
										<div key={item.id} className={`desk-status ${item.done ? 'done' : 'live'}`}>
											<span className="desk-dot" />
											{item.text}
											{!item.done ? <span className="demo-ellipsis" /> : null}
										</div>
									);
								}
								if (item.kind === 'file') {
									return (
										<button
											key={item.id}
											type="button"
											className="desk-file"
											onClick={() => openFile(item.name)}
										>
											<span className="desk-file-icon" />
											{item.name} <em>{item.delta}</em>
										</button>
									);
								}
								if (item.kind === 'term') {
									return (
										<div key={item.id} className="desk-term-card">
											<code>$ {item.command}</code>
											<span>{item.output}</span>
										</div>
									);
								}
								if (item.kind === 'question') {
									return (
										<div key={item.id} className="desk-question">
											<div className="desk-question-kicker">Question</div>
											<p>{item.prompt}</p>
											<ol>
												{item.options.map((opt, oi) => (
													<li key={opt}>
														<button
															type="button"
															className={item.selected === oi ? 'selected' : ''}
															disabled={phase !== 'awaiting'}
															onClick={() => {
																setItems((prev) =>
																	prev.map((row) =>
																		row.kind === 'question' ? { ...row, selected: oi } : row,
																	),
																);
															}}
														>
															<span>{oi + 1}</span>
															{opt}
														</button>
													</li>
												))}
											</ol>
											{phase === 'awaiting' ? (
												<div className="desk-question-actions">
													<button
														type="button"
														className="desk-skip"
														onClick={() => void completeQuestion(SYNC_QUESTION.defaultChoice)}
													>
														Skip
													</button>
													<button
														type="button"
														className="desk-continue"
														onClick={() => {
															const q = items.find(
																(row): row is Extract<ChatItem, { kind: 'question' }> =>
																	row.kind === 'question',
															);
															void completeQuestion(q?.selected ?? SYNC_QUESTION.defaultChoice);
														}}
													>
														Continue
													</button>
												</div>
											) : null}
										</div>
									);
								}
								return (
									<div key={item.id} className={`desk-bubble ${item.kind}`}>
										<span className="desk-tag">{item.kind === 'user' ? 'You' : 'Copix'}</span>
										<p>
											{item.text}
											{item.kind === 'agent' && item.streaming ? <span className="demo-caret" /> : null}
										</p>
									</div>
								);
							})}
						</div>
						<form className="desk-input" onSubmit={onDesktopSubmit}>
							<input
								value={desktopInput}
								onChange={(e) => setDesktopInput(e.target.value)}
								placeholder="Message Copix…"
								aria-label="Message Copix Desktop"
							/>
							<button type="submit">Send</button>
						</form>
						<div className="desk-composer-meta">
							<label>
								<span className="sr-only">Ollama model</span>
								<select value={model} onChange={(e) => onModelChange(e.target.value)}>
									{MODELS.map((m) => (
										<option key={m} value={m}>
											{m}
										</option>
									))}
								</select>
							</label>
							<span>Plan</span>
							<button type="button" onClick={() => setRunId((n) => n + 1)}>
								Replay
							</button>
						</div>
					</section>

					<aside className="desk-editor">
						<div className="desk-tabs">
							{files.map((f) => (
								<button
									key={f.name}
									type="button"
									className={currentFile.name === f.name ? 'active' : ''}
									onClick={() => openFile(f.name)}
								>
									{f.name}
								</button>
							))}
						</div>
						<div className="desk-editor-bar">
							<span>{currentFile.path}</span>
							<span className="desk-lang">{currentFile.language}</span>
						</div>
						<CodePane file={currentFile} reveal={reveal} />
						<div className="desk-plan">
							<div className="desk-plan-head">{plan.length} Tasks</div>
							<ul>
								{plan.map((step) => (
									<li key={step.text} className={step.status}>
										<span />
										{step.text}
									</li>
								))}
							</ul>
						</div>
					</aside>
				</div>
			</div>

			<div
				className={`mac-win cli-win ${focus === 'cli' ? 'focused' : ''}`}
				style={{ transform: `translate(${cliOffset.x}px, ${cliOffset.y}px)` }}
				onPointerDown={() => setFocus('cli')}
			>
				<WindowChrome
					title="Copix CLI"
					meta="zsh · ~/Copix"
					onPointerDown={(e) => beginDrag('cli', e)}
					onPointerMove={onDragMove}
					onPointerUp={endDrag}
					onFocus={() => setFocus('cli')}
				/>
				<div className="cli-body">
					<div className="cli-thread" ref={cliThread} aria-label="Copix CLI session">
						<p className="cli-login">Last login: {now} on ttys002</p>
						<p className="cli-line">
							<span className="cli-host">copix@desktop</span> <span className="cli-path">~/Copix</span>{' '}
							<span className="cli-pct">%</span> copix
						</p>
						<p className="cli-meta">
							session Mission Control Plan · {model} · Plan
						</p>
						{items.map((item) => {
							if (item.kind === 'user') {
								return (
									<p key={item.id} className="cli-line">
										<span className="cli-you">you</span> {item.text}
									</p>
								);
							}
							if (item.kind === 'status') {
								return (
									<p key={item.id} className={`cli-line cli-status ${item.done ? 'done' : ''}`}>
										<span className="cli-bullet">{item.done ? '✓' : '●'}</span> {item.text}
									</p>
								);
							}
							if (item.kind === 'file') {
								return (
									<button
										key={item.id}
										type="button"
										className="cli-file"
										onClick={() => openFile(item.name)}
									>
										<span className="cli-bullet">✎</span> edit_file {item.name}{' '}
										<span className="cli-delta">{item.delta}</span>
									</button>
								);
							}
							if (item.kind === 'term') {
								return (
									<div key={item.id} className="cli-cmd">
										<p>
											<span className="cli-bullet">$</span> {item.command}
										</p>
										<p className="cli-out">{item.output}</p>
									</div>
								);
							}
							if (item.kind === 'question') {
								return (
									<div key={item.id} className="cli-q">
										<p>
											<span className="cli-you">?</span> {item.prompt}
										</p>
										{item.options.map((opt, oi) => (
											<p key={opt} className={item.selected === oi ? 'picked' : ''}>
												{'  '}
												{oi + 1}. {opt}
											</p>
										))}
										{phase === 'awaiting' ? (
											<p className="cli-hint">reply 1–3 or type a follow-up</p>
										) : null}
									</div>
								);
							}
							return (
								<p key={item.id} className="cli-agent">
									<span className="cli-bot">copix</span> {item.text}
									{item.streaming ? <span className="cli-block-caret" /> : null}
								</p>
							);
						})}
					</div>
					<form className="cli-input" onSubmit={onCliSubmit}>
						<span className="cli-prompt">copix ›</span>
						<input
							value={cliInput}
							onChange={(e) => setCliInput(e.target.value)}
							aria-label="Copix CLI prompt"
							spellCheck={false}
						/>
					</form>
				</div>
			</div>

			<nav className="mac-dock" aria-label="Desktop dock">
				<button type="button" className={focus === 'desktop' ? 'on' : ''} onClick={() => setFocus('desktop')}>
					<img src={ICON} alt="" width={36} height={36} />
					<span>Desktop</span>
				</button>
				<button type="button" className={focus === 'cli' ? 'on' : ''} onClick={() => setFocus('cli')}>
					<span className="dock-term" aria-hidden>
						❯_
					</span>
					<span>CLI</span>
				</button>
			</nav>
		</div>
	);
}
