import {
	FormEvent,
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

function WindowChrome({ title, meta }: { title: string; meta?: string }) {
	return (
		<div className="mac-titlebar">
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

function PreviewPane({ phase }: { phase: Phase }) {
	const built = phase === 'done';
	return (
		<aside className="desk-preview" aria-label="Browser preview">
			<div className="preview-chrome">
				<div className="preview-nav" aria-hidden>
					<span />
					<span />
					<span />
				</div>
				<div className="preview-url">
					<span className="preview-lock" aria-hidden />
					<span className="preview-url-text">localhost:5173/mission-control</span>
				</div>
				<span className="preview-pill">{built ? 'Live' : 'Building'}</span>
			</div>
			<div className={`preview-page ${built ? 'built' : 'draft'}`}>
				<header className="preview-mc-bar">
					<strong>Mission Control</strong>
					<em>F3 · Window menu</em>
				</header>
				<div className="preview-mc-grid">
					{(built
						? [
								{ title: 'Copix Desktop', meta: 'Plan · active' },
								{ title: 'feature-prd.md', meta: 'Markdown' },
								{ title: 'Terminal', meta: '~/Copix' },
								{ title: 'Preview', meta: 'localhost:5173' },
							]
						: [
								{ title: 'App shell', meta: 'stub' },
								{ title: 'Window A', meta: 'draft' },
								{ title: 'Window B', meta: 'draft' },
								{ title: 'Overlay', meta: 'todo' },
							]
					).map((card) => (
						<article key={card.title} className="preview-mc-card">
							<div className="preview-mc-card-top">
								<span />
								<span />
								<span />
							</div>
							<strong>{card.title}</strong>
							<em>{card.meta}</em>
						</article>
					))}
				</div>
				{built ? (
					<p className="preview-mc-foot">Grid overview · MenuBar + F3 wired</p>
				) : (
					<p className="preview-mc-foot">Drafting expose grid… answer the question to continue</p>
				)}
			</div>
		</aside>
	);
}

function PlanStrip({ plan }: { plan: PlanStep[] }) {
	return (
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
	);
}

function CliCue({
	model,
	phase,
	items,
}: {
	model: string;
	phase: Phase;
	items: ChatItem[];
}) {
	const lastUser = [...items].reverse().find((i) => i.kind === 'user');
	const lastStatus = [...items].reverse().find((i) => i.kind === 'status');
	const line =
		phase === 'awaiting'
			? 'waiting on Desktop choice…'
			: lastStatus
				? `${lastStatus.done ? '✓' : '●'} ${lastStatus.text}`
				: phase === 'done'
					? '✓ Desktop + CLI on ~/Copix'
					: 'session syncing…';
	const prompt = lastUser?.text
		? lastUser.text.length > 36
			? `${lastUser.text.slice(0, 34)}…`
			: lastUser.text
		: 'copix';

	return (
		<div className="cli-cue" aria-label="Copix CLI sync cue">
			<div className="cli-cue-bar">
				<span className="cli-cue-lights" aria-hidden>
					<span />
					<span />
					<span />
				</span>
				<strong>Copix CLI</strong>
				<em>~/Copix</em>
			</div>
			<div className="cli-cue-body">
				<p>
					<span className="cli-host">copix</span> <span className="cli-path">~/Copix</span>{' '}
					<span className="cli-pct">%</span> copix
				</p>
				<p className="cli-cue-meta">
					{model} · {phase === 'done' ? 'synced' : 'live'}
				</p>
				<p className="cli-cue-line">
					<span className="cli-you">you</span> {prompt}
				</p>
				<p className="cli-cue-line dim">{line}</p>
			</div>
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
	const [reveal, setReveal] = useState(99);

	const stageRef = useRef<HTMLDivElement>(null);
	const deskThread = useRef<HTMLDivElement>(null);
	const abortRef = useRef<AbortController | null>(null);
	const phaseRef = useRef<Phase>('playing');
	const modelRef = useRef(model);
	const followUpLock = useRef(false);
	const followUpQueue = useRef<string[]>([]);

	phaseRef.current = phase;
	modelRef.current = model;
	const currentFile = files.find((f) => f.name === activeFile) ?? files[0];
	const scene = SCENES.find((s) => s.id === sceneId)!;
	const showPreview = sceneId === 'sync';

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
		const el = deskThread.current;
		if (!el) return;
		const question = el.querySelector('.desk-question') as HTMLElement | null;
		if (question && phase === 'awaiting') {
			question.scrollIntoView({ block: 'nearest', behavior: reducedMotion() ? 'auto' : 'smooth' });
			return;
		}
		el.scrollTo({ top: el.scrollHeight, behavior: reducedMotion() ? 'auto' : 'smooth' });
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
			setPhase('playing');
			phaseRef.current = 'playing';
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
					'Wired F3 + Window › Mission Control. Typecheck is clean. Desktop and CLI share the same diff under ~/Copix.',
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
				`${modelRef.current} finished the view. Flip the tag anytime — Desktop stays on this ~/Copix session.`,
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

	function onModelChange(next: string) {
		setModel(next);
		modelRef.current = next;
		if (sceneId === 'models') setRunId((n) => n + 1);
	}

	function openFile(name: string) {
		const found = files.find((f) => f.name === name);
		if (found) {
			setActiveFile(found.name);
			setReveal(found.lines.length);
		}
	}

	return (
		<div
			className={`mac-stage scene-${sceneId}`}
			id={stageId}
			ref={stageRef}
			aria-label={`Copix ${scene.label} demo`}
		>
			<div
				className="mac-stage-ambient"
				style={{ backgroundImage: `url(${WALLPAPER})` }}
				aria-hidden
			/>

			<div className="mac-win desk-win focused">
				<WindowChrome title="Copix Desktop" meta={`${model} · Plan`} />
				<div className={`desk-body ${showPreview ? 'with-preview' : 'with-editor'}`}>
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

					{showPreview ? (
						<div className="desk-side">
							<PreviewPane phase={phase} />
							<PlanStrip plan={plan} />
						</div>
					) : (
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
							<PlanStrip plan={plan} />
						</aside>
					)}
				</div>
			</div>

			<CliCue model={model} phase={phase} items={items} />
		</div>
	);
}
