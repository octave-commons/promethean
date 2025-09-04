---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Switch interrupt binding back"
conversation_id: 68a6421c-ba94-8332-830a-3be54206b1a6
create_time: 08/20/2025 at 4:47 PM
update_time: 08/20/2025 at 4:52 PM
---

# Title: Switch interrupt binding back

Created: 08/20/2025 at 4:47 PM
Last Updated: 08/20/2025 at 4:52 PM
Chat URL: https://chat.openai.com/c/68a6421c-ba94-8332-830a-3be54206b1a6


>[!nexus_user] **User** - 08/20/2025 at 4:47 PM
> They switched thhe interupt binding on codex and it is not great. It's escape now, which means for me to leave insert mode in spacemacs I have to be careful to not double press it... cause I will do that some times I guess just to double make sure. Sometimes you have to to break out of something. I kinda want to switch it back to ctrl c
<!-- UID: 55f03b22-e601-4f01-af1b-ccfbbfde8f65 -->




>[!nexus_agent] **Assistant** - 08/20/2025 at 4:47 PM
> Yeah, that change is pretty annoying — Codex flipping `Ctrl-C` to `Esc` is hostile if you’re a Vim/Evil-mode person. In Spacemacs muscle memory, you *want* `Esc` to be idempotent — hammer it to make sure you’re out of insert — not some weird “hard stop the agent” binding.
> 
> A couple of approaches you can take:
> 
> ### 1. Override the Codex CLI keybinding
> Codex is just running inside a terminal; it’s picking up readline/TTY signals. The “interrupt” is mapped to `SIGINT` by default. If they remapped it to `Esc`, you can often undo it by explicitly binding:
> 
> ```bash
> stty intr ^C
> ```
> 
> Run that before starting Codex (or add it to your shell rc). That will reset the interrupt signal to `Ctrl-C` instead of `Esc`.
> 
> ### 2. Wrap Codex in `rlwrap` or a PTY shim
> If their binary hard-binds `Esc` to SIGINT, you can interpose something like `rlwrap` or `node-pty` (since you’re already playing with that) and translate inputs:
> - Map `Ctrl-C` → `SIGINT`
> - Pass `Esc` through untouched
> 
> That way Codex gets your expected behavior.
> 
> ### 3. Train yourself out of double-Esc (least fun)
> You could try to tolerate it, but it’s going to keep biting you. In practice, Evil users lean on `Esc` like a panic button, so it’s a dumb design choice on their part.
> 
> ---
> 
> If you want to keep Spacemacs muscle memory intact, option **1** (`stty intr ^C`) is the simplest fix. You can even alias Codex so it always runs with that:
> 
> ```bash
> alias codex='stty intr ^C && codex'
> ```
> 
> Want me to sketch a little PTY wrapper in Node that forces Codex back onto `Ctrl-C` cleanly so you don’t have to mess with your shell state?
<!-- UID: 66cd06fa-4bbf-4461-b07d-c7eccbcf1616 -->

---




>[!nexus_user] **User** - 08/20/2025 at 4:48 PM
> yea... that is what happened...
<!-- UID: 210e4cae-5aa9-40d7-8d03-916deca428c7 -->




>[!nexus_user] **User** - 08/20/2025 at 4:49 PM
> never mind! It's the quit seqence when the agent is waiting is ctrl c, but when you actually ask for it to do something, the quick key is esc
<!-- UID: b9f37a71-b34c-43bf-b7df-08da6d49d291 -->




>[!nexus_agent] **Assistant** - 08/20/2025 at 4:49 PM
> Ahhh, okay — so they’ve got **two different quit semantics** depending on state: 
> 
> - **Idle / prompt waiting** → `Ctrl-C` sends SIGINT to bail. 
> - **While agent is *running a job*** → `Esc` is the “cancel task” hotkey. 
> 
> That explains the weird muscle-memory clash: you’re in Spacemacs hitting `Esc` twice to be sure you’re back in normal mode, but in Codex that second `Esc` is a hard cancel. 😬
> 
> This is basically a UX footgun:
> 
> - `Esc` should be *idempotent*, not a destructive key. 
> - Using **different quit keys for different states** makes it harder to build reliable muscle memory. 
> 
> ### What you can do
> 1. **Check if Codex exposes config for keybinds.** Some CLIs let you remap the “cancel” sequence (e.g. via `~/.codexrc` or env vars). If that exists, bind both idle and running cancel to `Ctrl-C` only. 
> 
> 2. **PTY wrapper / key translator.** You could run Codex under a wrapper that swallows raw `Esc` keypresses while in insert mode, and only sends them through if followed by `[`, `O`, etc (normal ANSI escape sequences). That way “plain Esc” never reaches Codex unless you *really* mean it. 
> 
> 3. **Train yourself to `Ctrl-C` out, never `Esc`.** Painful, but at least consistent. 
> 
> ---
> 
> Would you like me to draft you a **Node `node-pty` shim** that sits between your terminal and Codex and remaps “single `Esc`” back to “noop,” so you don’t accidentally nuke jobs while double-tapping out of insert? That might give you back Vim/Evil-safe behavior without hacking Codex itself.
<!-- UID: eab5041e-d9ae-4364-af6a-eabe48e6b68b -->

---




>[!nexus_user] **User** - 08/20/2025 at 4:51 PM
> yea.... I'm sitting here kinda thinking about how I actually want to interface with this any way... like an emacs layer... I need an abstract interface for what an "agent" is any way. And codex may be a good way to figure that out before I really finish getting the local ML stuff all ready the way I want.
<!-- UID: 6aa34a4e-64ec-4d68-a927-bf10cf2bc86a -->




>[!nexus_agent] **Assistant** - 08/20/2025 at 4:51 PM
> Got it. If Codex is your “reference agent” while you finish the local stack, treat this as the moment to define an **Agent Interface** and build a thin Emacs layer that speaks it—then plug Codex (CLI) in as one adapter. Design first, code second.
> 
> # Agent Interface (pragmatic spec)
> States (finite + explicit):
> - `idle` → waiting for prompt
> - `running` → executing task (with stream)
> - `paused` (optional)
> - `stopped` / `errored`
> 
> Commands (uniform across backends):
> - `agent.start(opts)` → (cwd, env, tty=true/false, model?)
> - `agent.send(input)` → user text / control msg
> - `agent.cancel()` → cancel current job
> - `agent.stop()` → kill subprocess / close
> - `agent.status()` → {state, pid, meta}
> - Streams: `stdout`, `stderr`, `events` (state transitions)
> 
> Events (JSONL, one per line):
> ```json
> {"type":"state","state":"running"}
> {"type":"stdout","data":"..."}
> {"type":"stderr","data":"..."}
> {"type":"done","exitCode":0}
> {"type":"error","message":"..."}
> ```
> 
> Adapters (same shape):
> - **CLI-PTY** (Codex): spawn + JSONL framing on a side pipe if possible; else just raw stream + synthetic events.
> - **REST/WebSocket** (later).
> - **Local ML** (your cephalon path).
> 
> # Keybinding policy (fix the Esc mess)
> - **Always** use `C-c` for “cancel” (SIGINT). Never Esc.
> - Treat **Esc** as idempotent *mode exit only*. If an adapter requires Esc to cancel, **translate it** in the adapter, not UI.
> - When `state=running`, swallow raw Esc and only pass ANSI escape sequences (e.g., `\x1b[`).
> 
> # Minimal pieces to ship
> ## 1) Node PTY wrapper (adapter: codex)
> Put this in your repo (TypeScript shown; keep it tiny). It normalizes keys so `C-c` cancels, `Esc` never kills a job.
> 
> ```ts
> // services/ts/agent-adapters/codex-pty.ts
> import pty from 'node-pty';
> import process from 'process';
> 
> const cmd = process.env.CODEX_BIN ?? 'codex';
> const args = process.argv.slice(2);
> 
> // track running vs idle by simple heuristics
> let state: 'idle'|'running' = 'idle';
> 
> const p = pty.spawn(cmd, args, {
>  name: 'xterm-256color',
>  cols: process.stdout.columns || 120,
>  rows: process.stdout.rows || 30,
>  cwd: process.cwd(),
>  env: process.env,
> });
> 
> function setState(s:'idle'|'running'){ if(state!==s){ state=s; process.stdout.write(`\n{"type":"state","state":"${s}"}\n`);}}
> 
> // naive detection: when codex echoes a “Run:”/starts tool, mark running; when it prints prompt-ish line, mark idle
> p.onData((d) => {
>  process.stdout.write(d);
>  if (/\b(Run:|Executing|Starting)\b/.test(d)) setState('running');
>  if (/\bReady|^> _|\(codex\)\s*$/.test(d)) setState('idle');
> });
> 
> p.onExit(({exitCode, signal}) => {
>  process.stdout.write(`\n{"type":"done","exitCode":${exitCode},"signal":${JSON.stringify(signal)}}\n`);
>  process.exit(exitCode ?? 0);
> });
> 
> // Input translation: swallow lone ESC when running; map C-c to SIGINT
> process.stdin.setRawMode?.(true);
> process.stdin.resume();
> process.stdin.on('data', (buf: Buffer) => {
>  const s = buf.toString('binary');
> 
>  // Ctrl-C
>  if (s === '\x03') { p.kill('SIGINT'); return; }
> 
>  // Lone ESC while running (NOT an ANSI sequence)? swallow.
>  if (state === 'running') {
>  if (s === '\x1b') return;
>  // If ESC+[ ... let it through (likely cursor keys / Alt combos)
>  // We do a minimal lookahead: if starts with ESC [ or ESC O, pass
>  }
> 
>  p.write(buf);
> });
> ```
> 
> Run it as your Codex entrypoint:
> ```bash
> $ node dist/services/ts/agent-adapters/codex-pty.js exec --full-auto
> ```
> 
> ## 2) Emacs minimal layer (vterm + keymap)
> You don’t need a full major mode yet—just a thin wrapper that launches the adapter and pins sane keys.
> 
> ```elisp
> ;;; promethean-agent.el
> (require 'vterm)
> 
> (defgroup promethean-agent nil
>  "Agent runner with sane cancel/keys."
>  :group 'tools)
> 
> (defcustom promethean-agent-command
>  "node /home/err/devel/promethean/dist/services/ts/agent-adapters/codex-pty.js exec --full-auto"
>  "Command to start the agent under PTY adapter."
>  :type 'string)
> 
> (defun promethean-agent--buffer () (get-buffer-create "*prom-agent*"))
> 
> (defun promethean-agent-open ()
>  "Open or focus the agent vterm."
>  (interactive)
>  (let ((buf (promethean-agent--buffer)))
>  (unless (buffer-live-p (get-buffer buf))
>  (with-current-buffer (get-buffer-create buf)
>  (vterm-mode)
>  (vterm-send-string promethean-agent-command)
>  (vterm-send-return)))
>  (pop-to-buffer buf)))
> 
> ;; Evil/Spacemacs-safe keys inside the vterm buffer:
> (with-eval-after-load 'vterm
>  (defun promethean-agent--vterm-keys ()
>  (evil-define-key 'insert vterm-mode-map
>  (kbd "<escape>") #'evil-normal-state) ; never send raw ESC
>  (define-key vterm-mode-map (kbd "C-c") #'promethean-agent-cancel))
>  (add-hook 'vterm-mode-hook #'promethean-agent--vterm-keys))
> 
> (defun promethean-agent-cancel ()
>  "Send SIGINT to the agent (C-c)."
>  (interactive)
>  (when (derived-mode-p 'vterm-mode)
>  (vterm-send-key "c" nil t))) ; ctrl=true → C-c
> 
> (provide 'promethean-agent)
> ```
> 
> Bind it in Spacemacs:
> ```elisp
> (spacemacs/set-leader-keys "oa" #'promethean-agent-open) ; open agent
> (spacemacs/set-leader-keys "oac" #'promethean-agent-cancel); cancel job
> ```
> 
> **Behavior now:**
> - `Esc` exits insert mode (idempotent), **never** cancels the job.
> - `C-c` always sends SIGINT to cancel, regardless of Codex’s internal hotkey.
> - Adapter hides Codex’s “Esc to cancel while running” footgun by swallowing lone ESCs in `running` state.
> 
> # Why this is the right cut
> - You’ve pinned **policy at the UI** (Emacs) and **mechanics at the adapter** (Node PTY). 
> - The **Agent Interface** is stable; you can swap in your local ML agent later without touching the editor layer. 
> - No shell-global hacks (`stty`) required; no retraining your hands.
> 
> If you want, I’ll expand this into a tiny NPM package (`@promethean/agent-pty`) and an Emacs layer skeleton folder you can drop into `~/.emacs.d/private/`. But this cut should be enough to get your fingers safe today.
> 
> #tags #promethean #agent-interface #emacs #spacemacs #vim #codex #ux #systems-design
<!-- UID: a655c124-e031-413d-bb22-d35a7c7ccb44 -->

---


