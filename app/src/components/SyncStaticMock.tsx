/**
 * Static still of the Sync chapter.
 * Must NOT mount InteractiveDemo or a second live session —
 * the hero lens owns the one live Sync InteractiveDemo.
 */
import { MODELS, SESSION_HISTORY, SYNC_PLAN, SYNC_QUESTION } from '../lib/demo-session';

const PREVIEW = [
	{ title: 'App shell', meta: 'stub' },
	{ title: 'Window A', meta: 'draft' },
	{ title: 'Window B', meta: 'draft' },
	{ title: 'Overlay', meta: 'todo' },
];

export function SyncStaticMock() {
	const model = MODELS[0];
	return (
		<div className="still" aria-label="Copix Desktop Sync still (non-live)">
			<div className="still-main">
				<aside className="still-agents">
					<div className="still-label">Agents</div>
					<ul>
						{SESSION_HISTORY.map((h) => (
							<li key={h.title} className={!h.done ? 'active' : ''}>
								<span className={`plan-dot ${h.done ? 'done' : 'current'}`} />
								<div>
									<strong>{h.title}</strong>
									<em>{h.when}</em>
								</div>
							</li>
						))}
					</ul>
				</aside>

				<div className="still-chat">
					<div className="desk-bubble user">
						<span className="desk-tag">You</span>
						<p>Plan a Mission Control interface for macOS Desktop</p>
					</div>
					<div className="desk-status done">
						<span className="desk-dot" />
						Thinking
					</div>
					<div className="desk-file">
						<span className="desk-file-icon" />
						feature-prd.md <em>+68</em>
					</div>
					<div className="desk-bubble agent">
						<span className="desk-tag">Copix</span>
						<p>
							Drafted a Mission Control plan: grid overview of open windows, MenuBar entry, and keyboard
							trigger. One choice left before I build.
						</p>
					</div>
					<div className="desk-question">
						<div className="desk-question-kicker">Question</div>
						<p>{SYNC_QUESTION.prompt}</p>
						<ol>
							{SYNC_QUESTION.options.map((opt, oi) => (
								<li key={opt}>
									<button type="button" className={oi === SYNC_QUESTION.defaultChoice ? 'selected' : ''} disabled>
										<span>{oi + 1}</span>
										{opt}
									</button>
								</li>
							))}
						</ol>
						<div className="desk-question-actions">
							<button type="button" className="desk-skip" disabled>
								Skip
							</button>
							<button type="button" className="desk-continue" disabled>
								Continue
							</button>
						</div>
					</div>
					<p className="still-model">
						{model} · Plan
					</p>
				</div>
			</div>

			<div className="still-preview" aria-label="Browser preview">
				{PREVIEW.map((card) => (
					<article key={card.title} className="preview-card">
						<strong>{card.title}</strong>
						<em>{card.meta}</em>
					</article>
				))}
			</div>

			<ol className="still-plan">
				{SYNC_PLAN.map((step) => (
					<li key={step.text} className={step.status}>
						<span className={`plan-dot ${step.status}`} />
						{step.text}
					</li>
				))}
			</ol>
		</div>
	);
}
