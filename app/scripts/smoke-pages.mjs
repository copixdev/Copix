#!/usr/bin/env node
/**
 * Pages smoke: build with GitHub Pages base and assert the dist is deployable.
 * Run: npm run smoke
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(appRoot, 'dist');

function fail(msg) {
	console.error(`FAIL  ${msg}`);
	process.exit(1);
}

function pass(msg) {
	console.log(`PASS  ${msg}`);
}

console.log('Building with GITHUB_PAGES=true …');
const build = spawnSync('npm', ['run', 'build'], {
	cwd: appRoot,
	env: { ...process.env, GITHUB_PAGES: 'true' },
	stdio: 'inherit',
	shell: process.platform === 'win32',
});
if (build.status !== 0) fail('GITHUB_PAGES=true npm run build exited non-zero');

if (!existsSync(join(dist, 'index.html'))) fail('dist/index.html missing');
if (!existsSync(join(dist, 'icon.png'))) fail('dist/icon.png missing');
if (!existsSync(join(dist, 'desktop.png'))) fail('dist/desktop.png missing');

const html = readFileSync(join(dist, 'index.html'), 'utf8');
if (!html.includes('/Copix/assets/')) fail('index.html missing /Copix/ asset base');
if (!html.includes('href="/Copix/')) fail('index.html missing /Copix/ favicon or asset href');
pass('dist/index.html uses /Copix/ base');

const assetDir = join(dist, 'assets');
const assets = existsSync(assetDir) ? readdirSync(assetDir) : [];
const jsName = assets.find((f) => f.endsWith('.js'));
const cssName = assets.find((f) => f.endsWith('.css'));
if (!jsName) fail('no JS bundle in dist/assets');
if (!cssName) fail('no CSS bundle in dist/assets');

const js = readFileSync(join(assetDir, jsName), 'utf8');
const css = readFileSync(join(assetDir, cssName), 'utf8');

for (const needle of [
	'https://github.com/copixdev/Copix/releases/download/v4.3.0/Copix-4.3.0-macOS-arm64.dmg',
	'https://github.com/copixdev/Copix/releases/download/v4.3.0/Copix-4.3.0-Windows-x64.exe',
	'https://github.com/copixdev/Copix/releases/download/v4.2.0_macOS/Copix-4.2.0-macOS-arm64.dmg',
	'https://github.com/copixdev/Copix/releases/download/v4.1.0/Copix-4.1.0-Windows-x64.exe',
	'https://github.com/copixdev/Copix/releases/download/v4.0.0/Copix-Setup-4.0.0-x64.exe',
	'Desktop for macOS and Windows.',
	'Download for macOS',
	'Download for Windows',
	'Copix Desktop',
	'Copix CLI',
	'cli/install.sh',
	'cli/install.ps1',
	'demo-tools',
	'demo-models',
	'On your machine',
	'Ollama locally. Nothing to sign up for.',
	'Older builds',
]) {
	if (!js.includes(needle)) fail(`built JS missing "${needle}"`);
}
pass('built JS includes release assets, CLI, chapters, and facts');

for (const bad of [
	'xattr -cr',
	'Gatekeeper',
	'damaged and can’t',
	'Detected Linux',
	'Detected Windows',
	'EJH-BAE',
]) {
	if (js.includes(bad)) fail(`built JS still contains "${bad}"`);
}
pass('built JS has no quarantine / OS-detect copy');

if (css.includes('.lens') || css.includes('.code-line.add') || css.includes('.mac-stage') || css.includes('.mac-lights')) {
	fail('built CSS still includes lens, diff, or mac window chrome');
}
if (js.includes('wallpaper.jpg') || js.includes('InteractiveDemo') || js.includes('SyncStaticMock')) {
	fail('built JS still includes wallpaper or a product replay');
}
if (!css.includes('.pixel-mark')) fail('built CSS missing the graph-paper pixel mark');
pass('built assets are the graph-paper sheet, without replay chrome');

console.log('\nAll Pages smoke checks passed.');
