export type TokKind =
	| 'plain'
	| 'kw'
	| 'type'
	| 'str'
	| 'num'
	| 'comment'
	| 'fn'
	| 'punc'
	| 'jsx';

export type Token = { kind: TokKind; text: string };

const KEYWORDS = new Set([
	'import',
	'export',
	'from',
	'as',
	'const',
	'let',
	'var',
	'function',
	'return',
	'if',
	'else',
	'class',
	'extends',
	'implements',
	'interface',
	'type',
	'new',
	'async',
	'await',
	'void',
	'typeof',
	'keyof',
	'in',
	'of',
	'for',
	'while',
	'switch',
	'case',
	'break',
	'continue',
	'default',
	'try',
	'catch',
	'throw',
	'finally',
	'this',
	'super',
	'true',
	'false',
	'null',
	'undefined',
	'enum',
	'readonly',
	'public',
	'private',
	'protected',
	'static',
	'get',
	'set',
	'yield',
	'delete',
	'instanceof',
	'with',
]);

function push(out: Token[], kind: TokKind, text: string) {
	if (!text) return;
	const last = out[out.length - 1];
	if (last && last.kind === kind) last.text += text;
	else out.push({ kind, text });
}

/** Lightweight TS/TSX highlighter for the marketing editor pane. */
export function tokenizeLine(line: string): Token[] {
	const out: Token[] = [];
	const n = line.length;
	let i = 0;

	while (i < n) {
		const c = line[i];

		if (c === ' ' || c === '\t') {
			let j = i + 1;
			while (j < n && (line[j] === ' ' || line[j] === '\t')) j += 1;
			push(out, 'plain', line.slice(i, j));
			i = j;
			continue;
		}

		if (c === '/' && line[i + 1] === '/') {
			push(out, 'comment', line.slice(i));
			break;
		}

		if (c === "'" || c === '"' || c === '`') {
			let j = i + 1;
			while (j < n) {
				if (line[j] === '\\') {
					j += 2;
					continue;
				}
				if (line[j] === c) {
					j += 1;
					break;
				}
				j += 1;
			}
			push(out, 'str', line.slice(i, j));
			i = j;
			continue;
		}

		if (c >= '0' && c <= '9') {
			let j = i + 1;
			while (j < n && /[\d_.]/.test(line[j])) j += 1;
			push(out, 'num', line.slice(i, j));
			i = j;
			continue;
		}

		if (/[A-Za-z_$]/.test(c)) {
			let j = i + 1;
			while (j < n && /[\w$]/.test(line[j])) j += 1;
			const word = line.slice(i, j);
			let k = j;
			while (k < n && (line[k] === ' ' || line[k] === '\t')) k += 1;
			if (KEYWORDS.has(word)) push(out, 'kw', word);
			else if (k < n && line[k] === '(') push(out, 'fn', word);
			else if (/^[A-Z]/.test(word)) push(out, 'type', word);
			else push(out, 'plain', word);
			i = j;
			continue;
		}

		if (c === '<' && /[A-Za-z/]/.test(line[i + 1] || '')) {
			push(out, 'punc', '<');
			i += 1;
			if (line[i] === '/') {
				push(out, 'punc', '/');
				i += 1;
			}
			let j = i;
			while (j < n && /[\w.]/.test(line[j])) j += 1;
			if (j > i) {
				push(out, 'jsx', line.slice(i, j));
				i = j;
			}
			continue;
		}

		push(out, 'punc', c);
		i += 1;
	}

	return out;
}

export function tokenizeMarkdown(line: string): Token[] {
	if (/^\s*#+\s/.test(line)) {
		const hash = line.match(/^\s*#+/)?.[0] ?? '';
		return [
			{ kind: 'kw', text: hash },
			{ kind: 'type', text: line.slice(hash.length) },
		];
	}
	if (/^\s*[-*]\s/.test(line)) {
		const m = line.match(/^(\s*[-*]\s)(.*)$/);
		if (m) return [{ kind: 'punc', text: m[1] }, { kind: 'plain', text: m[2] }];
	}
	const out: Token[] = [];
	const re = /(`[^`]+`)/g;
	let last = 0;
	let match: RegExpExecArray | null;
	while ((match = re.exec(line))) {
		if (match.index > last) out.push({ kind: 'plain', text: line.slice(last, match.index) });
		out.push({ kind: 'str', text: match[1] });
		last = match.index + match[1].length;
	}
	if (last < line.length) out.push({ kind: 'plain', text: line.slice(last) });
	return out.length ? out : [{ kind: 'plain', text: line }];
}
