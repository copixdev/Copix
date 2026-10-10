<p align="center">
<img width="128" height="128" alt="Copix" src="assets/logo.png" />
</p>

<h1 align="center">Copix</h1>

<p align="center">A local coding agent on Ollama. Your files stay on your machine.</p>

<p align="center">
	<a href="#download"><strong>Download</strong></a>
	&nbsp;·&nbsp;
	<a href="#what-it-does"><strong>What it does</strong></a>
	&nbsp;·&nbsp;
	<a href="#quick-start"><strong>Quick start</strong></a>
	&nbsp;·&nbsp;
	<a href="#cli-commands"><strong>Commands</strong></a>
</p>

## Download

**Copix Desktop v4.3.0.** Install [Ollama](https://ollama.com) first. The default model is `qwen2.5:3b`.

| Platform | Installer |
| --- | --- |
| macOS (Apple Silicon) | [`Copix-4.3.0-macOS-arm64.dmg`](https://github.com/copixdev/copix/releases/download/v4.3.0/Copix-4.3.0-macOS-arm64.dmg) |
| Windows (x64) | [`Copix-4.3.0-Windows-x64.exe`](https://github.com/copixdev/copix/releases/download/v4.3.0/Copix-4.3.0-Windows-x64.exe) |

Checksums: [`release/SHA256SUMS.txt`](release/SHA256SUMS.txt). Older builds are in [`release/`](release/). Release page: [v4.3.0](https://github.com/copixdev/copix/releases/tag/v4.3.0).

If macOS says Copix is damaged, that is Gatekeeper quarantine. The fix is in [`release/README.md`](release/README.md).

**CLI** for macOS, Linux, and Windows. Needs [Node.js 18+](https://nodejs.org) and git.

macOS / Linux:

```bash
curl -fsSL https://raw.githubusercontent.com/copixdev/copix/refs/heads/main/cli/install.sh | bash
```

Windows (PowerShell):

```powershell
irm https://raw.githubusercontent.com/copixdev/copix/refs/heads/main/cli/install.ps1 | iex
```

## What it does

- You describe the work. Copix reads the project and edits the files.
- It can run the shell command that belongs to that task.
- It can search and open public pages when the task needs docs.
- Copix Desktop and the CLI share the same tools and the same session history.

## Desktop

<p align="center">
<img width="820" alt="Copix Desktop" src="https://github.com/user-attachments/assets/477b3b09-d5a5-4812-8f18-bdc795a25ff6" />
</p>

<p align="center"><a href="https://github.com/copixdev/copix/blob/main/demo.mov"><strong>Watch the demo</strong></a></p>

## Quick start

```bash
ollama pull qwen2.5:3b
copix doctor
copix
```

`copix doctor` checks Node, Ollama, installed models, and where settings live.

One shot, in a chosen folder:

```bash
copix -p ~/your-project "add a README section for local setup"
```

## CLI commands

| Command | Action |
| --- | --- |
| `/model` | Open the model picker. `/model qwen2.5:3b` pins a tag. `/model auto` restores task routing. |
| `/help` | Usage, tools, the install command, and the settings path |
| `/keys` | Keyboard shortcuts for the prompt and the model picker |
| `/plain` | Screen-reader plain text. `/plain on` or `/plain off`. `NO_COLOR` starts this way. |

Every slash command is listed in [cli/README.md](cli/README.md).

## Build from source

```bash
git clone https://github.com/copixdev/copix.git
cd copix/cli
npm install
npm start
```

Requires [Node.js 18+](https://nodejs.org) and git. `npm test` runs the CLI tests. Copix Desktop is the installers above. This repository contains the CLI.

## License

[MIT](LICENSE.txt). Copyright (c) 2026 EJH-BAE.

[Website](https://copixdev.github.io/copix/) · [Releases](https://github.com/copixdev/copix/releases) · [CLI reference](cli/README.md)
