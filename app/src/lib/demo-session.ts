export type SceneId = 'sync' | 'tools' | 'models';

export type ChatItem =
	| { id: string; kind: 'user'; text: string }
	| { id: string; kind: 'agent'; text: string; streaming?: boolean }
	| { id: string; kind: 'status'; text: string; done?: boolean }
	| { id: string; kind: 'file'; name: string; delta: string }
	| { id: string; kind: 'question'; prompt: string; options: string[]; selected: number | null }
	| { id: string; kind: 'term'; command: string; output: string }
	| { id: string; kind: 'cta'; href: string };

export type DiffMark = 'add' | 'del' | null;

export type CodeLine = {
	text: string;
	diff: DiffMark;
};

export type EditorFile = {
	name: string;
	path: string;
	language: 'ts' | 'tsx' | 'md';
	lines: CodeLine[];
};

export type PlanStep = { text: string; status: 'todo' | 'current' | 'done' };

export type HistoryItem = { title: string; when: string; done: boolean };

export const MODELS = ['qwen2.5:3b', 'qwen2.5-coder:7b', 'llama3.1:8b'] as const;

export const SCENES: { id: SceneId; label: string; blurb: string }[] = [
	{
		id: 'sync',
		label: 'Sync',
		blurb: 'Desktop is the hero — agents, plan, and a live preview. CLI stays on the same ~/Copix session as a quiet sync cue.',
	},
	{
		id: 'tools',
		label: 'Tools',
		blurb: 'edit_file and terminal run once; the editor shows syntax-highlighted green/red diffs under ~/Copix.',
	},
	{
		id: 'models',
		label: 'Models',
		blurb: 'Flip the Ollama tag and watch a short plan → code beat in the same compact Desktop window.',
	},
];

export const SESSION_HISTORY: HistoryItem[] = [
	{ title: 'Landing page creation', when: '2h', done: true },
	{ title: 'Mission Control Plan', when: 'Now', done: false },
	{ title: 'PyTorch MNIST Experiment', when: '1d', done: true },
	{ title: 'Bioinformatics Tools', when: '3d', done: true },
];

export const PRD_FILE: EditorFile = {
	name: 'feature-prd.md',
	path: '~/Copix/plans/feature-prd.md',
	language: 'md',
	lines: [
		{ text: '# Mission Control Interface', diff: null },
		{ text: '', diff: null },
		{ text: 'Overview of open Desktop windows in a grid.', diff: null },
		{ text: 'Reuse expose-style layout from AppManager.', diff: null },
		{ text: '', diff: null },
		{ text: '## Open questions', diff: null },
		{ text: '- Trigger: gesture, keyboard, or both?', diff: null },
		{ text: '- MenuBar entry under Window', diff: null },
	],
};

const VIEW_BEFORE: CodeLine[] = [
	{ text: "import { useEffect } from 'react'", diff: null },
	{ text: '', diff: null },
	{ text: 'export function MissionControlView() {', diff: null },
	{ text: '  return null', diff: null },
	{ text: '}', diff: null },
];

const VIEW_AFTER: CodeLine[] = [
	{ text: "import { useCallback, useEffect } from 'react'", diff: 'add' },
	{ text: "import { useEffect } from 'react'", diff: 'del' },
	{ text: '', diff: null },
	{ text: 'interface ExposeTriggers {', diff: 'add' },
	{ text: '  menu: boolean', diff: 'add' },
	{ text: "  shortcut: 'F3' | '⌘F3'", diff: 'add' },
	{ text: '}', diff: 'add' },
	{ text: '', diff: null },
	{ text: 'export function MissionControlView() {', diff: null },
	{ text: '  const onKey = useCallback((event: KeyboardEvent) => {', diff: 'add' },
	{ text: "    if (event.key === 'F3') openExpose()", diff: 'add' },
	{ text: '  }, [])', diff: 'add' },
	{ text: '', diff: null },
	{ text: '  useEffect(() => {', diff: 'add' },
	{ text: "    window.addEventListener('keydown', onKey)", diff: 'add' },
	{ text: '    return () => window.removeEventListener(\'keydown\', onKey)', diff: 'add' },
	{ text: '  }, [onKey])', diff: 'add' },
	{ text: '', diff: null },
	{ text: '  return (', diff: 'add' },
	{ text: '    <ExposeGrid', diff: 'add' },
	{ text: '      windows={windows}', diff: 'add' },
	{ text: "      triggers={['menu', 'F3']}", diff: 'add' },
	{ text: '    />', diff: 'add' },
	{ text: '  )', diff: 'add' },
	{ text: '  return null', diff: 'del' },
	{ text: '}', diff: null },
];

const APP_MANAGER: CodeLine[] = [
	{ text: "import { registerShortcut } from './hotkeys'", diff: null },
	{ text: "import { MissionControlView } from './MissionControlView'", diff: 'add' },
	{ text: '', diff: null },
	{ text: 'export function AppManager() {', diff: null },
	{ text: "  registerShortcut('F3', openMissionControl)", diff: 'add' },
	{ text: "  menuBar.add('Window › Mission Control')", diff: 'add' },
	{ text: '  return <MissionControlView />', diff: 'add' },
	{ text: '}', diff: null },
];

export const VIEW_FILE_BEFORE: EditorFile = {
	name: 'MissionControlView.tsx',
	path: '~/Copix/src/MissionControlView.tsx',
	language: 'tsx',
	lines: VIEW_BEFORE,
};

export const VIEW_FILE_AFTER: EditorFile = {
	name: 'MissionControlView.tsx',
	path: '~/Copix/src/MissionControlView.tsx',
	language: 'tsx',
	lines: VIEW_AFTER,
};

export const APP_FILE: EditorFile = {
	name: 'AppManager.tsx',
	path: '~/Copix/src/AppManager.tsx',
	language: 'tsx',
	lines: APP_MANAGER,
};

export const SYNC_QUESTION = {
	prompt: 'How should Mission Control be triggered?',
	options: [
		'Gesture (swipe up with 3 fingers)',
		'Keyboard shortcut (F3 or ⌘F3)',
		'Both keyboard and menu button',
	],
	defaultChoice: 2,
};

export const SYNC_PLAN: PlanStep[] = [
	{ text: 'Draft Mission Control PRD', status: 'done' },
	{ text: 'Choose trigger (gesture / key / both)', status: 'current' },
	{ text: 'Wire MenuBar + F3 in AppManager', status: 'todo' },
];

export const TOOLS_PLAN: PlanStep[] = [
	{ text: 'Add expose modes to useAppStore.ts', status: 'todo' },
	{ text: 'Create MissionControlView.tsx', status: 'current' },
	{ text: 'Update AppManager.tsx for triggers', status: 'todo' },
];

export const MODELS_PLAN: PlanStep[] = [
	{ text: 'Read current view stub', status: 'current' },
	{ text: 'Plan F3 + MenuBar triggers', status: 'todo' },
	{ text: 'Write MissionControlView.tsx', status: 'todo' },
];

export function replyForChoice(choice: string) {
	return `Got it — trigger via ${choice}. Wiring MenuBar + F3 and keeping the grid overview in MissionControlView. Preview and CLI are already on this ~/Copix session.`;
}
