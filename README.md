<p align="center">
<img width="128" height="128" alt="Copix" src="assets/logo.png" />
</p>

<h1 align="center">Copix</h1>

<p align="center">
	<strong>Pixel-precise agent for your programming.</strong><br/>
	A local coding agent for people who want the model to change the project, not hand back a snippet to paste.
</p>

<p align="center">
	<a href="https://github.com/copixdev/Copix/releases/latest"><strong>Download Desktop</strong></a>
	&nbsp;·&nbsp;
	<a href="#try-it"><strong>Try the CLI</strong></a>
	&nbsp;·&nbsp;
	<a href="https://github.com/copixdev/Copix/blob/main/demo.mov"><strong>Watch the demo</strong></a>
</p>

<p align="center">
	<img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License: MIT">
	<img src="https://img.shields.io/badge/macOS-Apple%20Silicon-blue.svg" alt="macOS Apple Silicon">
	<img src="https://img.shields.io/badge/Windows-x64-blue.svg" alt="Windows x64">
</p>

Copix runs on your machine, with a local [Ollama](https://ollama.com) model. There is no account. You describe the work. Copix reads the workspace, writes the files, and can run the commands that belong to that task.

It is for programmers on **macOS** and **Windows** who already use Ollama (or are willing to install it) and want a Desktop app and a terminal for the same agent.

<p align="center">
<img width="1469" height="821" alt="Copix Desktop" src="https://github.com/user-attachments/assets/477b3b09-d5a5-4812-8f18-bdc795a25ff6" />
</p>

## Try it

Install [Ollama](https://ollama.com) first. Copix’s default model is `qwen2.5:3b`.

### Desktop

Current release: **v4.3.0**.

| Platform | Installer |
| --- | --- |
| macOS (Apple Silicon) | [`Copix-4.3.0-macOS-arm64.dmg`](https://github.com/copixdev/Copix/releases/download/v4.3.0/Copix-4.3.0-macOS-arm64.dmg) |
| Windows (x64) | [`Copix-4.3.0-Windows-x64.exe`](https://github.com/copixdev/Copix/releases/download/v4.3.0/Copix-4.3.0-Windows-x64.exe) |

Checksums: [`release/SHA256SUMS.txt`](release/SHA256SUMS.txt). Older builds are listed in [`release/`](release/). The v4.3.0 release page is [v4.3.0](https://github.com/copixdev/Copix/releases/tag/v4.3.0).

If macOS says Copix is damaged, that is Gatekeeper quarantine after a browser download. The fix is in [`release/README.md`](release/README.md).

### CLI

The CLI is the same agent in the terminal (macOS, Linux, and Windows). It needs [Node.js 18+](https://nodejs.org) and `git`.

macOS / Linux:

```bash
curl -fsSL https://raw.githubusercontent.com/copixdev/Copix/refs/heads/main/cli/install.sh | bash
ollama pull qwen2.5:3b
copix doctor
copix
```

Windows (PowerShell):

```powershell
irm https://raw.githubusercontent.com/copixdev/Copix/refs/heads/main/cli/install.ps1 | iex
ollama pull qwen2.5:3b
copix doctor
copix
```

From a clone, without the installer:

```bash
git clone https://github.com/copixdev/Copix.git
cd Copix/cli
npm install
npm start
```

One shot, in a chosen folder:

```bash
copix -p ~/your-project "add a README section for local setup"
```

`copix doctor` checks Node, Ollama, installed models, and where settings live. Full command list: [cli/README.md](cli/README.md).

## What it actually does

Copix sends your prompt to a local Ollama model, along with tools. The model asks for a tool; Copix runs it on disk and returns the result. When the task is done, Copix replies with what changed.

| Tool | What it does |
| --- | --- |
| `create_project` | Start a new folder under your home directory (or a path you named) |
| `write_file`, `edit_file`, `append_file`, `delete_file` | Change files itself — it does not ask you to paste them in |
| `read_file`, `list_dir`, `grep` | Look before editing |
| `terminal` | Run a command in the workspace (PowerShell on Windows, zsh on macOS, bash on Linux) |
| `web_search`, `web_fetch` | Read public docs and pages |
| `multitask`, `spawn_subagent` | Parallel reads, or a child agent for a large split job |

The model provider in settings is Ollama. With automatic selection, Copix prefers an installed tag that fits the task. Besides `qwen2.5:3b`, it will use `qwen2.5-coder:7b`, `mistral:7b`, and `qwen3.5:4b` when those are already pulled. `/model <tag>` pins one; `/model auto` turns routing back on.

<p align="center">
<img width="1248" height="90" alt="Copix CLI prompt" src="assets/cli.png" />
</p>

<p align="center"><a href="https://github.com/copixdev/Copix/blob/main/demo.mov"><strong>Watch the demo</strong></a></p>

## Desktop and CLI stay in sync

Both apps store conversations in the same sessions file. A chat you start in the CLI shows up in Desktop history.

| | macOS | Linux | Windows |
| --- | --- | --- | --- |
| Settings | `~/Copix/settings.json` | `~/Copix/settings.json` | `%USERPROFILE%\Copix\settings.json` |
| Sessions | `~/Copix/sessions.json` | `~/Copix/sessions.json` | `%USERPROFILE%\Copix\sessions.json` |
| Default workspace | `/Users/{username}` | `/home/{username}` | `C:\Users\{username}` |

`{username}` is your account name. Leave `workspace.homeDirectory` empty and Copix uses the real home directory from the OS.

```json
{
  "model": {
    "provider": "ollama",
    "modelId": "qwen2.5:3b"
  },
  "workspace": {
    "homeDirectory": "/Users/{username}"
  }
}
```

On Windows, set `homeDirectory` to `C:\\Users\\{username}`.

## License

Copix is open source under the [MIT License](LICENSE.txt). Copyright (c) 2026 EJH-BAE.

## Links

- [Website](https://copixdev.github.io/Copix/)
- [Ollama](https://ollama.com)
- [Releases](https://github.com/copixdev/Copix/releases)
