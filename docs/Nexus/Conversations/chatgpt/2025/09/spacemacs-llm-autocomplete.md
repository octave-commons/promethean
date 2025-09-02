---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Spacemacs LLM autocomplete"
conversation_id: 68b603e0-1b30-8320-8eb6-dd0890e823e1
create_time: 09/01/2025 at 3:36 PM
update_time: 09/01/2025 at 3:42 PM
---

# Title: Spacemacs LLM autocomplete

Created: 09/01/2025 at 3:36 PM
Last Updated: 09/01/2025 at 3:42 PM
Chat URL: https://chat.openai.com/c/68b603e0-1b30-8320-8eb6-dd0890e823e1


>[!nexus_user] **User** - 09/01/2025 at 3:36 PM
> spacemacs LLM autocomplete
<!-- UID: 5f5078bd-7a6d-4420-8b00-50ca9540a807 -->




>[!nexus_agent] **Assistant** - 09/01/2025 at 3:37 PM
> Got it — you want LLM-style autocomplete in **Spacemacs**. Here’s the blunt path: use the **official Spacemacs GitHub Copilot layer** (fastest + maintained), or pick an alternative (Codeium, TabNine, or local models). I’ll show the minimal working configs, the trade-offs, and the gotchas.
> 
> # TL;DR picks
> - **Fastest to working** → **`github-copilot` layer**. Add one line to your layers, install the server, log in. Includes chat + commit message gen. citeturn2view0 
> - **Free-ish alternative** → **Codeium** via `codeium.el` + your existing completion frontend (Company/Corfu). Needs a proprietary Codeium language server binary. citeturn1view0 
> - **Old standby** → **TabNine** via `company-tabnine`. Works with Company; quality depends on plan; local binary install step. citeturn4view0 
> - **Local LLMs** (privacy-first) → community packages (e.g., `emacs-copilot` local runner, “Wingman”). More fiddly, less polished UI. cite
> 
> ---
> 
> # Option A — Spacemacs GitHub Copilot layer (recommended)
> **Why:** Official Spacemacs layer, integrates `copilot.el` + `copilot-chat.el`. Keybindings & install flows are documented. citeturn2view0
> 
> 1) Add layer to `~/.spacemacs`:
> ```elisp
> ;; in dotspacemacs/layers
> dotspacemacs-configuration-layers
> '(
>  auto-completion
>  github-copilot
> )
> ```
> 2) Install the language server (Node 22+ required):
> ```bash
> npm install -g @github/copilot-language-server
> ```
> _or_ inside Emacs: `SPC SPC copilot-install-server` citeturn2view0turn3view0
> 
> 3) Log in:
> - `SPC SPC copilot-login` (first run) 
> - Verify with `SPC SPC copilot-diagnose` (status should **not** be `NotAuthorized`). citeturn3view0
> 
> 4) Use it:
> - Suggestions appear as “ghost text”. 
> - Accept: `C-M-RET`; accept by word: `C-M-S-RET`. 
> - Cycle: `C-M-<tab>` / `C-M-<iso-lefttab>`. 
> - Chat transient: `SPC $ c`. citeturn2view0
> 
> **Notes**
> - As of Aug 14, 2025 the layer ships chat + optional commit-message generation (toggle `github-copilot-enable-commit-messages`). citeturn2view0
> - Under the hood it’s `copilot.el` (Emacs 27+) which uses the official Copilot language server. citeturn3view0
> 
> **Conflicts / polish**
> - If Company popups overlap the Copilot overlay, use a childframe frontend (e.g., `company-box`) or different accept key. `copilot.el` documents overlay conflicts and mitigation. citeturn3view0
> 
> ---
> 
> # Option B — Codeium (`codeium.el`) + Company/Corfu
> **Why:** Free tier, decent quality. Integrates via `completion-at-point-functions`; you keep your existing completion UI. **But** it pulls a **proprietary** Codeium language-server binary; you can see/download command via `M-x codeium-diagnose`. citeturn1view0
> 
> **Minimal Spacemacs setup**
> ```elisp
> ;; Load Codeium
> dotspacemacs-additional-packages '(codeium)
> 
> ;; in dotspacemacs/user-config
> (with-eval-after-load 'codeium
>  ;; use CAPF globally
>  (add-to-list 'completion-at-point-functions #'codeium-completion-at-point))
> ```
> Then inside Emacs:
> - `M-x codeium-install` (fetches their server) 
> - Add API key to `~/.authinfo.gpg` if you want silent auth (see README). citeturn1view0
> 
> **Tip:** Codeium recommends pairing CAPF with Company/Corfu/Cape; they show example configs and doc how to limit context sent upstream. citeturn1view0
> 
> ---
> 
> # Option C — TabNine via `company-tabnine`
> **Why:** Mature, simple with Company, local binary installer. Not strictly LLM (mix of cloud/local), quality varies. citeturn4view0
> 
> **Minimal Spacemacs setup**
> ```elisp
> dotspacemacs-additional-packages '(company-tabnine)
> 
> ;; in user-config
> (with-eval-after-load 'company
>  (add-to-list 'company-backends #'company-tabnine)
>  ;; optional: snappy UX
>  (setq company-idle-delay 0
>  company-show-numbers t))
> ```
> Then `M-x company-tabnine-install-binary`. Beware Spacemacs can override `company-backends`; keep this in `user-config`. citeturn4view0
> 
> ---
> 
> # Local-first (no cloud)
> If you want **zero code to third-party servers**, go local:
> - **`emacs-copilot` (jart)** runs a local LLM as a subprocess and streams completions. You pick & run the model locally (VRAM/CPU permitting). Expect more manual plumbing than Copilot/Codeium. cite
> - **“Wingman”** (community) targets Copilot-style completion backed by `llama.cpp`; setup includes running a local server, choosing a model. Hobbyist quality; expect to tinker. cite
> 
> ---
> 
> ## Spacemacs completion plumbing (must-know)
> - Spacemacs “auto-completion” layer uses **Company** by default. LLM tools either:
>  - Provide their **own overlay** (Copilot), or 
>  - Hook into **Company/CAPF** (Codeium, TabNine). 
>  Understand this split to avoid double popups. cite
> 
> ---
> 
> ## Privacy & licensing reality check
> - **Copilot** sends buffer context to GitHub’s servers; it’s the cleanest integration, but you accept the data flow. Node 22+ required. (Copilot added a free tier in early 2025.) citeturn3view0
> - **Codeium**: open-source Emacs client; **proprietary server** downloaded on first use; configurable to limit text sent. citeturn1view0
> - **TabNine**: company backend fetches/install binary; quality features gated by plan; can disable heavy local “deep” mode if it hammers CPU. citeturn4view0
> - **Local LLMs**: best for confidentiality; you trade off setup time + model quality/latency. cite
> 
> ---
> 
> ## My practical recommendation
> 1) If you just want it **working today**: enable **`github-copilot`** layer, install server, login. It’s maintained and documented, includes chat/commit gen, and the keybindings are already wired. citeturn2view0 
> 2) If you **won’t** send code off-box: try **`emacs-copilot`** (local) and be ready to tune models and resources. cite 
> 3) If you want **free** with minimal fuss and can live with a proprietary helper: **Codeium**. Wire via CAPF to keep your Company/Corfu flow. citeturn1view0
> 
> ---
> 
> ## Quick verify checklist (any option)
> - Completion shows up in a `prog-mode` buffer. 
> - Accept key works (for Copilot, test `C-M-RET` or your binding). citeturn2view0 
> - No overlay fight: if you see double UI, either use childframe (e.g., `company-box`) or change accept keys as `copilot.el` suggests. citeturn3view0
> 
> ---
> 
> ### Want me to drop a ready-to-paste Spacemacs snippet for your stack (TS/FP, company/corfu, minimal mutation) and a small set of ergonomic keymaps? Say which path (Copilot / Codeium / TabNine / Local) and I’ll hand you the config.
> 
> #hashtags
> #spacemacs #emacs #autocomplete #LLM #copilot #codeium #tabnine #localLLM #privacy #devtools
<!-- UID: 76161765-33f8-4a8b-a09f-3021da9ce29e -->

---




>[!nexus_user] **User** - 09/01/2025 at 3:40 PM
> I have github copilot already, but I want to use ollama. I've got the llm-layer already with gptel and ellama set up. If we can't make those work with their own bindings, I can write something myself.
<!-- UID: 1311f925-1b49-4be5-ae71-62c6872bb449 -->




>[!nexus_agent] **Assistant** - 09/01/2025 at 3:41 PM
> Perfect. You’ve already got Copilot, and you’ve got the **LLM layer with `gptel` + `ellama`**. Here’s the straight path to make **Ollama** your daily driver inside Spacemacs—chat, rewrites, and (yes) practical inline “completion-like” flows—without giving up your Copilot muscle memory.
> 
> # What works (and what doesn’t)
> - **`gptel`**: solid chat, rewrite-in-place, tools, MCP; **first-class Ollama** backend via `gptel-make-ollama`. It’s *not* a ghost-text autocomplete engine—use it for *send/transform/insert* flows. citeturn2view0turn4view0 
> - **`ellama`**: dead-simple defaults; **Ollama is the default provider** and it actually has an `ellama-complete` command that behaves like an inline completion (accepts into your buffer). Good enough to replace “quick Copilot taps” when you want local-only. citeturn1view0 
> - **Spacemacs**: if you used a community **llm client layer** that exposes `gptel`, keep it; otherwise you can wire `use-package` by hand. gptel’s README even mentions a `llm-client` layer example. citeturn4view0
> 
> ---
> 
> # Minimal configs (keep them side-by-side with Copilot)
> 
> ## 1) `gptel` → Ollama backend
> ```elisp
> ;; in dotspacemacs/user-config
> (use-package gptel
>  :ensure t
>  :commands (gptel gptel-send gptel-rewrite)
>  :config
>  ;; Define an Ollama backend and make it default
>  (setq gptel-backend
>  (gptel-make-ollama "Ollama"
>  :host "localhost" :port 11434 :stream t
>  :models '("qwen2.5-coder:7b" "llama3.1:8b" "deepseek-r1:8b")))
> 
>  ;; Handy presets for fast task switching
>  (gptel-make-preset 'code-refactor
>  :backend "Ollama" :model 'qwen2.5-coder:7b
>  :system "Refactor and explain TypeScript in a functional style.")
> 
>  (gptel-make-preset 'patch
>  :backend "Ollama" :model 'llama3.1:8b
>  :system "Propose minimal diffs; avoid mutation; preserve semantics."))
> 
> ;; Spacemacs leader keys
> (spacemacs/set-leader-keys
>  "aol" 'gptel ;; open chat
>  "aoL" 'gptel-send ;; send region/buffer
>  "aor" 'gptel-rewrite) ;; rewrite-in-place
> ```
> `gptel-make-ollama` + `:stream t` gives you streaming responses; presets let you flip “modes” quickly. citeturn2view0turn4view0
> 
> **Per-project defaults** (nice for repo-specific models):
> ```elisp
> ;; .dir-locals.el at project root
> ((nil . ((eval . (setq-local gptel-backend
>  (gptel-make-ollama "Ollama"
>  :host "localhost" :port 11434 :stream t
>  :models '("qwen2.5-coder:7b"))))
>  (eval . (setq-local gptel-model 'qwen2.5-coder:7b)))))
> ```
> gptel supports local models including Ollama; the ELPA page documents the `gptel-make-ollama` path explicitly. citeturn2view0
> 
> ## 2) `ellama` → use its inline completion
> ```elisp
> (use-package ellama
>  :ensure t
>  :bind (("C-c e" . ellama) ;; main transient
>  ("C-c C-e" . ellama-complete)) ;; inline completion into buffer
>  :init
>  (setopt ellama-auto-scroll t)
>  :config
>  ;; Ollama is default; this is optional explicitness:
>  (require 'llm-ollama)
>  (setopt ellama-provider
>  (make-llm-ollama :host "http://localhost:11434"
>  :model "qwen2.5-coder:7b"))
>  (ellama-context-header-line-global-mode +1)
>  (ellama-session-header-line-global-mode +1))
> ```
> Ellama ships with a full transient and loads of buffer/region commands (ask/summarize/translate/code-review) plus `ellama-complete` for a Copilot-ish accept flow—backed by Ollama. citeturn1view0
> 
> ---
> 
> # UX: make it feel like Copilot (but local)
> - Map **“quick completion”** to something you can spam:
>  - `C-c C-e` → `ellama-complete` (accepts into point).
>  - Keep Copilot on `C-M-RET` (or your current key) so your hands know which engine they’re invoking.
> - Use **`gptel-rewrite`** for structural edits (refactors, docstrings, tests). It diffs/merges cleanly instead of spraying text. citeturn2view0
> - For **context**, both packages support adding region/files/dirs; Ellama even has a context manager UI. Keep contexts tight for small Ollama models. citeturn1view0
> 
> ---
> 
> # Performance + model picks (Ollama)
> - Coders: `qwen2.5-coder:7b`, `deepseek-coder` variants. General chat: `llama3.1:8b`. Reasoners: small **R1** variants if your box can handle the latency. (Normal Ollama usage: `ollama pull …`, `ollama list`, `ollama show …`.) cite 
> - Stream on; keep temps low for completions. Don’t overload context—small local models truncate fast. Ollama’s quickstart shows GGUF import and custom Modelfiles if you want pinned quantizations. cite
> 
> ---
> 
> # Reality check (why two tools?)
> - **Autocomplete vs. Chat/Transform**: Copilot = ghost-text; `gptel`/`ellama` = request/transform. Community consensus matches that split—use Ellama’s `…complete` when you want the “just finish this” feel; gptel when you want structured edits and tools/MCP. cite
> 
> ---
> 
> # Troubleshooting quickies
> - **Nothing returns** → confirm `curl http://localhost:11434/api/tags` works; fix model name; verify `:port 11434`. cite 
> - **Weird stalls** → disable huge context; try a smaller quant (Q4_0) or a lighter model. cite 
> - **Keybind clashes** → Spacemacs layers sometimes override; put your bindings in `user-config` (after packages load). Auto-completion layer can fight overlays—Ellama inserts text, so it’s safer than ghost overlays. cite
> 
> ---
> 
> If you want, I’ll tailor the exact Spacemacs leader map to your TS/FP workflow (gptel presets for **refactor → tests → docstring**, Ellama for **quick in-buffer completes**), and wire a per-repo `.dir-locals.el` that pins **`qwen2.5-coder:7b`** for code and **`llama3.1:8b`** for prose.
> 
> #hashtags
> #emacs #spacemacs #ollama #gptel #ellama #localLLM #autocomplete #typescript #functional #devtools
<!-- UID: 81e45c1b-5ca8-40c6-971c-2fb04eb7f413 -->

---


