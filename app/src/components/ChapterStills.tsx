/**
 * Static Tools and Models panels. Not live sessions.
 */
import { useState } from 'react';
import { MODELS, MODELS_PLAN, VIEW_FILE_AFTER } from '../lib/demo-session';
import { tokenizeLine } from '../lib/syntax';

export function ToolsStill() {
	const file = VIEW_FILE_AFTER;
	let displayNum = 0;
	return (
		<div className="still-code" aria-label={`${file.name} diff`}>
			<div className="still-code-bar">
				<span>{file.path}</span>
				<span className="desk-lang">{file.language}</span>
			</div>
			<div className="code-pane">
				{file.lines.map((line, idx) => {
					if (line.diff !== 'del') displayNum += 1;
					const tokens = tokenizeLine(line.text);
					const gutter = line.diff === 'add' ? '+' : line.diff === 'del' ? '−' : '';
					return (
						<div key={`${file.name}-${idx}`} className={`code-line ${line.diff ?? ''}`}>
							<span className="code-num">{line.diff === 'del' ? '' : displayNum}</span>
							<span className="code-mark">{gutter}</span>
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
			<p className="still-term">
				<code>npx tsc --noEmit</code>
				<span>Found 0 errors</span>
			</p>
		</div>
	);
}

export function ModelsStill() {
	const [model, setModel] = useState<string>(MODELS[0]);
	return (
		<div className="model-switch">
			<div className="model-pills" role="group" aria-label="Ollama model">
				{MODELS.map((item) => (
					<button
						key={item}
						type="button"
						className={item === model ? 'active' : ''}
						aria-pressed={item === model}
						onClick={() => setModel(item)}
					>
						{item}
					</button>
				))}
			</div>
			<p className="model-line">
				Plan with <code>{model}</code> — keep the stub, add ExposeTriggers, bind F3, render ExposeGrid.
			</p>
			<ol className="still-plan">
				{MODELS_PLAN.map((step) => (
					<li key={step.text} className={step.status}>
						<span className={`plan-dot ${step.status}`} />
						{step.text}
					</li>
				))}
			</ol>
		</div>
	);
}
