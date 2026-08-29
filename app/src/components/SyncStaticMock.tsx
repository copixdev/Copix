/**
 * Static still of the Sync Desktop chrome for the Sync chapter beat.
 * Must NOT mount InteractiveDemo / IntersectionObserver / a second live session —
 * the hero owns the one live Sync InteractiveDemo.
 */
import { MODELS, SESSION_HISTORY, SYNC_PLAN, SYNC_QUESTION } from '../lib/demo-session';

const WALLPAPER = `${import.meta.env.BASE_URL}wallpaper.jpg`;

export function SyncStaticMock() {
	const model = MODELS[0];
	return (
		<div className="mac-stage scene-sync static-mock" aria-label="Copix Desktop Sync still (non-live)">
			<div
				className="mac-stage-ambient"
				style={{ backgroundImage: `url(${WALLPAPER})` }}
				aria-hidden
			/>
			<div className="mac-win desk-win focused">
				<div className="mac-titlebar">
					<div className="mac-lights" aria-hidden>
						<span />
						<span />
						<span />
					</div>
					<div className="mac-title">Copix Desktop</div>
					<div className="mac-title-meta">
						{model} · Plan
					</div>
				</div>
				<div className="desk-body with-preview">
					<aside className="desk-rail">
						<div className="desk-rail-label">Agents</div>
						<ul>
							{SESSION_HISTORY.map((h) => (
								<li key={h.title} className={!h.done ? 'active' : ''}>
									<span className={`desk-check ${h.done ? 'done' : ''}`} />
									<div>
										<strong>{h.title}</strong>
										<em>{h.when}</em>
									</div>
								</li>
							))}
						</ul>
					</aside>

					<section className="desk-chat">
						<div className="desk-thread">
							<div className="desk-bubble user">
								<span className="desk-tag">You</span>
								<p>Plan a Mission Control interface for macOS Desktop</p>
							</div>
							<div className="desk-status done">
								<span className="desk-dot" />
								Thinking
							</div>
							<div className="desk-status done">
								<span className="desk-dot" />
								Reading AppManager.tsx
							</div>
							<div className="desk-file" aria-hidden>
								<span className="desk-file-icon" />
								feature-prd.md <em>+68</em>
							</div>
							<div className="desk-bubble agent">
								<span className="desk-tag">Copix</span>
								<p>
									Drafted a Mission Control plan: grid overview of open windows, MenuBar entry, and
									keyboard trigger. One choice left before I build.
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
						</div>
						<form className="desk-input" onSubmit={(e) => e.preventDefault()}>
							<input disabled placeholder="Message Copix…" aria-label="Message Copix Desktop (static)" />
							<button type="submit" disabled>
								Send
							</button>
						</form>
						<div className="desk-composer-meta">
							<label>
								<span className="sr-only">Ollama model</span>
								<select disabled value={model}>
									<option value={model}>{model}</option>
								</select>
							</label>
							<span>Plan</span>
							<button type="button" disabled>
								Replay
							</button>
						</div>
					</section>

					<div className="desk-side">
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
								<span className="preview-pill">Building</span>
							</div>
							<div className="preview-page draft">
								<header className="preview-mc-bar">
									<strong>Mission Control</strong>
									<em>F3 · Window menu</em>
								</header>
								<div className="preview-mc-grid">
									{[
										{ title: 'App shell', meta: 'stub' },
										{ title: 'Window A', meta: 'draft' },
										{ title: 'Window B', meta: 'draft' },
										{ title: 'Overlay', meta: 'todo' },
									].map((card) => (
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
								<p className="preview-mc-foot">Drafting expose grid… answer the question to continue</p>
							</div>
						</aside>
						<div className="desk-plan">
							<div className="desk-plan-head">{SYNC_PLAN.length} Tasks</div>
							<ul>
								{SYNC_PLAN.map((step) => (
									<li key={step.text} className={step.status}>
										<span />
										{step.text}
									</li>
								))}
							</ul>
						</div>
					</div>
				</div>

				{/* Inside .desk-win so overflow:hidden keeps the cue in chrome bounds (#21). */}
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
						<p className="cli-cue-meta">{model} · live</p>
						<p className="cli-cue-line">
							<span className="cli-you">you</span> Plan a Mission Control interface…
						</p>
						<p className="cli-cue-line dim">waiting on Desktop choice…</p>
					</div>
				</div>
			</div>
		</div>
	);
}
