/**
 * The one live Sync session. It renders inside the hero lens.
 * Typed follow-ups do not continue the agent — they show the #install nudge.
 */
import { FormEvent, useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import {
	MODELS,
	SCENES,
	SYNC_PLAN,
	SYNC_QUESTION,
	replyForChoice,
	type ChatItem,
	type PlanStep,
} from '../lib/demo-session';
import { useLocale } from '../lib/LocaleContext';

type Phase = 'playing' | 'awaiting' | 'done';

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

function PreviewLine({ phase }: { phase: Phase }) {
	const built = phase === 'done';
	return (
		<div className="lens-preview-line">
			<span className="preview-mark" aria-hidden />
			<span className="lens-preview-url">localhost:5173/mission-control</span>
			<em>{built ? 'Live' : 'Building'}</em>
		</div>
	);
}

function PlanRow({ plan }: { plan: PlanStep[] }) {
	const current = plan.find((step) => step.status === 'current') ?? plan[plan.length - 1];
	return (
		<div className="lens-plan" aria-label={`${plan.length} Tasks`}>
			<span className="lens-plan-dots" aria-hidden>
				{plan.map((step) => (
					<span key={step.text} className={`plan-dot ${step.status}`} />
				))}
			</span>
			<em>{current?.text}</em>
		</div>
	);
}

type DemoProps = {
	/** The hero mounts this once, for Sync only. */
	sceneId: 'sync';
};

export function InteractiveDemo({ sceneId }: DemoProps) {
	const { t } = useLocale();
	const [runId, setRunId] = useState(0);
	const [armed, setArmed] = useState(false);
	const [items, setItems] = useState<ChatItem[]>([]);
	const [plan, setPlan] = useState<PlanStep[]>(SYNC_PLAN);
	const [model, setModel] = useState<string>(MODELS[0]);
	const [phase, setPhase] = useState<Phase>('playing');
	const [desktopInput, setDesktopInput] = useState('');

	const stageRef = useRef<HTMLDivElement>(null);
	const deskThread = useRef<HTMLDivElement>(null);
	const abortRef = useRef<AbortController | null>(null);
	const phaseRef = useRef<Phase>('playing');

	phaseRef.current = phase;
	const scene = SCENES.find((s) => s.id === sceneId)!;

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
		function snap() {
			const thread = deskThread.current;
			if (!thread) return;
			const question = thread.querySelector('.desk-question') as HTMLElement | null;
			if (question && phaseRef.current === 'awaiting') {
				const action = question.querySelector('.desk-question-actions') as HTMLElement | null;
				const target = action ?? question;
				const delta = target.getBoundingClientRect().bottom - thread.getBoundingClientRect().bottom;
				thread.scrollTop += delta + 8;
				return;
			}
			thread.scrollTop = thread.scrollHeight;
		}
		snap();
		const node = deskThread.current;
		if (!node) return;
		const ro = new ResizeObserver(snap);
		ro.observe(node);
		return () => ro.disconnect();
	}, [items, phase]);

	useEffect(() => {
		if (!armed) return;
		const ac = new AbortController();
		abortRef.current = ac;
		const { signal } = ac;

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
			setPlan(SYNC_PLAN);
			setItems((prev) => [
				...prev,
				{ id: uid(), kind: 'user', text: 'Plan a Mission Control interface for macOS Desktop' },
			]);
			await delay(280, signal);
			await markStatus('Thinking');
			await markStatus('Reading AppManager.tsx');
			setItems((prev) => [...prev, { id: uid(), kind: 'file', name: 'feature-prd.md', delta: '+68' }]);
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
		}

		play().catch((err) => {
			if (err instanceof DOMException && err.name === 'AbortError') return;
			console.error(err);
		});

		return () => ac.abort();
	}, [armed, runId]);

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
			setPlan(SYNC_PLAN.map((step) => ({ ...step, status: 'done' })));
			setPhase('done');
			phaseRef.current = 'done';
		} catch {
			/* aborted */
		}
	}

	/** User composer input: do not continue the fake agent — point to Install. */
	function sendFollowUp(text: string) {
		const trimmed = text.trim();
		if (!trimmed) return;
		setDesktopInput('');
		setItems((prev) => [
			...prev,
			{ id: uid(), kind: 'user', text: trimmed },
			{ id: uid(), kind: 'cta', href: '#install' },
		]);
	}

	function onDesktopSubmit(e: FormEvent) {
		e.preventDefault();
		sendFollowUp(desktopInput);
	}

	return (
		<div className="lens-stage" ref={stageRef} aria-label={`Copix ${scene.label} demo`}>
			<div className="lens-safe">
				<div className="lens-top">
					<span className="pill">Copix Desktop</span>
					<span className="pill quiet">{model}</span>
				</div>

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
								<div key={item.id} className="desk-file">
									<span className="desk-file-icon" />
									{item.name} <em>{item.delta}</em>
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
						if (item.kind === 'cta') {
							return (
								<div key={item.id} className="desk-bubble agent desk-cta">
									<span className="desk-tag">Copix</span>
									<p>
										{t('demo.ctaBefore')}
										<a className="desk-cta-link" href={item.href}>
											{t('demo.ctaLink')}
										</a>
										{t('demo.ctaAfter')}
									</p>
								</div>
							);
						}
						if (item.kind === 'term') return null;
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

				<PreviewLine phase={phase} />
				<PlanRow plan={plan} />

				<form className="lens-composer" onSubmit={onDesktopSubmit}>
					<input
						value={desktopInput}
						onChange={(e) => setDesktopInput(e.target.value)}
						placeholder="Message Copix…"
						aria-label="Message Copix Desktop"
					/>
					<button type="submit">Send</button>
				</form>
				<div className="lens-meta">
					<label>
						<span className="sr-only">Ollama model</span>
						<select value={model} onChange={(e) => setModel(e.target.value)}>
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
			</div>
		</div>
	);
}
