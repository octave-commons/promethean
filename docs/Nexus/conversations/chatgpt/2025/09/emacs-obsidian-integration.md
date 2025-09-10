---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Emacs Obsidian integration"
conversation_id: 68b6eb25-b2c4-8333-8761-d7277b49e9d9
create_time: 09/02/2025 at 8:03 AM
update_time: 09/02/2025 at 10:33 AM
---

# Title: Emacs Obsidian integration

Created: 09/02/2025 at 8:03 AM
Last Updated: 09/02/2025 at 10:33 AM
Chat URL: https://chat.openai.com/c/68b6eb25-b2c4-8333-8761-d7277b49e9d9


>[!nexus_user] **User** - 09/02/2025 at 8:03 AM
> emacs obsidian
<!-- UID: 311e57b7-6d06-40b4-80fd-270d3b7f2b4e -->




>[!nexus_agent] **Assistant** - 09/02/2025 at 8:03 AM
> ​If you're looking to integrate Obsidian with Emacs, the `obsidian.el` package is a powerful tool that bridges the two environments seamlessly.
> 
> ---
> 
> ### 🔧 What is `obsidian.el`?
> 
> [`obsidian.el`](https://github.com/licht1stein/obsidian.el) is an Emacs package designed to provide a native interface for managing Obsidian vaults directly within Emacs. It allows you to leverage Emacs' editing capabilities while maintaining compatibility with Obsidian's markdown-based notes.
> 
> ---
> 
> ### ✨ Key Features
> 
> - **Note Management**: Create, edit, and organize notes within your Obsidian vault.
> - **Link Handling**: Insert and follow wiki-style (`[[Note Title]]`) between notes.
> - **Tag Support**: Autocomplete tags and search for notes by tags.
> - **Back Panel**: View and navigate back to see how notes are interconnected.
> - **Search Functionality**: Search across your vault for specific content.
> - **Daily Notes**: Quickly create and access daily notes.
> - **Templates**: Utilize templates for consistent note formatting.
> - **Vault Switching**: Easily switch between multiple Obsidian vaults.
> 
> ---
> 
> ### ⚙️ Installation
> 
> You can install `obsidian.el` from MELPA:
> 
> ```emacs-lisp
> (use-package obsidian
>  :ensure t
>  :custom
>  (obsidian-directory "~/path/to/your/vault/")
>  :config
>  (obsidian-mode))
> ```
> 
> Replace `"~/path/to/your/vault/"` with the path to your Obsidian vault.
> 
> ---
> 
> ### 🧠 Workflow Integration
> 
> By integrating `obsidian.el` into your Emacs setup, you can:
> 
> - Maintain a consistent editing environment across your notes.
> - Leverage Emacs' powerful text editing features for note-taking.
> - Keep your notes synchronized with Obsidian for mobile access.
> 
> This setup is particularly beneficial if you prefer Emacs for writing and editing but want to utilize Obsidian's mobile app or graph view for visualization.
> 
> ---
> 
> For more details and advanced configuration options, refer to the [official GitHub repository](https://github.com/licht1stein/obsidian.el).
> 
> ---
<!-- UID: 42eab2ed-63f2-4fef-8f3f-d8587e935d33 -->

---




>[!nexus_user] **User** - 09/02/2025 at 8:06 AM
> obsidian spacemacs layer
<!-- UID: 70986ff0-7719-4598-822e-00a1cd628f87 -->




>[!nexus_agent] **Assistant** - 09/02/2025 at 8:06 AM
> Short answer: there isn’t an official Spacemacs “obsidian” layer. The practical way is to install `obsidian.el` and wire a tiny private layer (or use `dotspacemacs-additional-packages`). `obsidian.el` is the Emacs side of the bridge; Spacemacs just provides ergonomics and keys. cite
> 
> ---
> 
> # Minimal setup (fastest)
> 
> Add the package and a few keys in your `~/.spacemacs`:
> 
> ```elisp
> (defun dotspacemacs/layers ()
>  (setq-default
>  dotspacemacs-additional-packages '(obsidian))) ;; from MELPA
> ```
> 
> ```elisp
> (defun dotspacemacs/user-config ()
>  ;; Point this at your vault
>  (setq obsidian-directory "~/vaults/main")
> 
>  ;; Optional: daily notes directory & ID style
>  (setq obsidian-daily-notes-directory "daily"
>  obsidian-inbox-directory "inbox"
>  obsidian-page-title-format t)
> 
>  ;; Mode on by default in Markdown buffers (your vault is Markdown)
>  (add-hook 'markdown-mode-hook #'obsidian-mode)
> 
>  ;; Back panel (toggle per-file back)
>  (add-hook 'obsidian-mode-hook #'obsidian-back)
> 
>  ;; Leader key bindings for Obsidian actions
>  (spacemacs/declare-prefix-for-mode 'markdown-mode "mo" "obsidian")
>  (spacemacs/set-leader-keys-for-major-mode 'markdown-mode
>  "oi" #'obsidian-insert-wikilink
>  "of" #'obsidian-follow-
>  "ob" #'obsidian-back
>  "on" #'obsidian-daily-note
>  "ot" #'obsidian-tag-insert
>  "os" #'obsidian-search)
> )
> ```
> 
> - `obsidian.el` provides , tags, back, daily notes, etc.; Spacemacs just maps the keys. cite 
> - Spacemacs recommends this “add a package + keybindings” approach if there’s no official layer. cite
> 
> ---
> 
> # Private layer (cleaner, reusable)
> 
> If you prefer a proper layer:
> 
> ```
> ~/.emacs.d/private/obsidian/packages.el
> ```
> 
> ```elisp
> (defconst obsidian-packages '(obsidian))
> 
> (defun obsidian/init-obsidian ()
>  (use-package obsidian
>  :commands (obsidian-mode)
>  :init
>  (progn
>  (setq obsidian-directory "~/vaults/main"
>  obsidian-daily-notes-directory "daily"
>  obsidian-inbox-directory "inbox"
>  obsidian-page-title-format t)
>  (add-hook 'markdown-mode-hook #'obsidian-mode)
>  (add-hook 'obsidian-mode-hook #'obsidian-back))
>  :config
>  (progn
>  (spacemacs/declare-prefix-for-mode 'markdown-mode "mo" "obsidian")
>  (spacemacs/set-leader-keys-for-major-mode 'markdown-mode
>  "oi" #'obsidian-insert-wikilink
>  "of" #'obsidian-follow-
>  "ob" #'obsidian-back
>  "on" #'obsidian-daily-note
>  "ot" #'obsidian-tag-insert
>  "os" #'obsidian-search))))
> ```
> 
> Then add `obsidian` to `dotspacemacs-configuration-layers`. Spacemacs’ layer docs show the expected structure if you want to extend this later. cite
> 
> ---
> 
> ## Optional niceties
> 
> - **Back panel**: already enabled via `obsidian-back`. It mirrors Obsidian’s back view. cite 
> - **Use Denote + Obsidian together** if you split work between Org/MD; Denote handles Markdown well and can play nicely with Obsidian mobile. cite 
> - **In Obsidian itself**, the “Emacs text editor” plugin gives Emacs-ish keybindings. Not Emacs, but helpful when you’re away from Spacemacs. cite 
> - If you really want a full “layer feel” in Obsidian, “Spacekeys” imitates Spacemacs’ leader-key flows inside Obsidian. cite
> 
> ---
> 
> ## Reality check
> 
> - No official Spacemacs layer exists today; you’re not missing it—this DIY is the standard path. cite 
> - `obsidian.el` is actively used and installable from MELPA; the README covers features & commands. Wire only what you need into leader keys. cite
> 
> ---
> 
> #hashtags
> #spacemacs #emacs #obsidian #markdown #pkm #keybindings #back #daily-notes
<!-- UID: 09373a00-d1e0-41f0-8f39-3b827b288673 -->

---




>[!nexus_user] **User** - 09/02/2025 at 8:11 AM
> gptel ellama mcp spacemacs layer
<!-- UID: 04f351e9-2f1b-41a4-b67e-d450a8b0f8e1 -->




>[!nexus_agent] **Assistant** - 09/02/2025 at 8:11 AM
> Got it: you want a **Spacemacs layer** that wires up **gptel**, **ellama**, and **MCP** so you can use local/remote LLMs + MCP tools with sane keybinds. There’s no official layer for this, but it’s straightforward to roll your own private layer. Here’s a clean, practical blueprint.
> 
> ---
> 
> # Why these pieces (quick reality check)
> 
> - **gptel** — the most mature, well-documented Emacs LLM client; multiple backends, lots of extensions (quick lookup, autocomplete). Solid default. cite 
> - **ellama** — another Emacs LLM client with handy minor modes and session UX niceties; complements gptel if you like its flows. cite 
> - **MCP (Model Context Protocol)** — lets editors/agents use external “tools/resources” in a standard way; two active Emacs efforts (`lizqwerscott/mcp.el` client, and `laurynas-biveinis/mcp.el` + `mcp-server-lib.el`). Expect churn but it’s usable today. cite
> 
> Spacemacs gives you the layer structure and leader keys; we just load packages and bind keys. cite
> 
> ---
> 
> # Create the private layer
> 
> Spacemacs can scaffold a private layer for you:
> 
> ```
> SPC SPC configuration-layer/create-layer RET
> ```
> 
> Name it e.g. `llm`. Then add `llm` to `dotspacemacs-configuration-layers` in `~/.spacemacs`. cite
> 
> You’ll have a directory like: 
> `~/.emacs.d/private/llm/{packages.el,config.el,funcs.el,keybindings.el}` (only `packages.el` is strictly required). cite
> 
> ---
> 
> # `packages.el` (single-file, minimal + robust)
> 
> ```elisp
> (defconst llm-packages
>  '(
>  ;; LLM clients
>  gptel ;; chat, prompts, buffer ops
>  ellama ;; alternative client UX
>  ;; MCP client(s)
>  (mcp :location (recipe :fetcher github :repo "lizqwerscott/mcp.el"))
>  ;; optional: gptel extras
>  (gptel-quick :location (recipe :fetcher github :repo "karthink/gptel-quick"))
>  ))
> 
> (defun llm/init-gptel ()
>  (use-package gptel
>  :defer t
>  :init
>  ;; Default: talk to local Ollama. Change URL/model as you like.
>  (setq gptel-default-mode 'org-mode
>  gptel-model "qwen2.5-coder:7b" ;; example
>  gptel-backend
>  (gptel-make-ollama "ollama"
>  :host "http://localhost:11434"
>  :models '( "qwen2.5-coder:7b" "qwen2.5:7b" "llama3.2:3b" )))
>  :config
>  ;; Handy rewrite/completion settings can be added later.
>  ))
> 
> (defun llm/init-ellama ()
>  (use-package ellama
>  :defer t
>  :init
>  ;; Ellama can also target Ollama/OpenAI; configure backends here if needed.
>  ;; Keep it installed so you can compare UX quickly.
>  ))
> 
> (defun llm/init-mcp ()
>  (use-package mcp
>  :defer t
>  :init
>  ;; Minimal example: connect to a local MCP server when needed.
>  ;; See repo README for server discovery and autoconnect options.
>  ;; (mcp-connect "localhost" 3333) ;; example only
>  ))
> 
> (defun llm/init-gptel-quick ()
>  (use-package gptel-quick
>  :after gptel
>  :commands (gptel-quick)))
> ```
> 
> **Why this shape?** Spacemacs layers are just organized `use-package` stanzas and keybinds. We keep config conservative so you can swap models/backends fast and avoid surprises. cite
> 
> - gptel: upstream package w/ multi-backend support and good ecosystem. cite 
> - ellama: different UI/flows you might prefer for certain tasks. cite 
> - mcp: Emacs client to reach MCP servers (and later, your own tools via server-lib). cite
> 
> ---
> 
> # `keybindings.el` (leader keys that don’t fight muscle memory)
> 
> ```elisp
> ;; Global LLM prefix
> (spacemacs/declare-prefix "al" "LLM") ;; SPC a l ...
> 
> ;; GPTel common flows
> (spacemacs/set-leader-keys
>  "alg" 'gptel ;; open chat buffer
>  "alq" 'gptel-quick ;; popup summarize/define at point
>  )
> 
> ;; Major-mode keys (e.g., in prog/text)
> (dolist (mode '(prog-mode text-mode org-mode markdown-mode))
>  (spacemacs/declare-prefix-for-mode mode "ml" "LLM")
>  (spacemacs/set-leader-keys-for-major-mode mode
>  "lc" 'gptel-send ;; send region/buffer
>  "le" 'gptel-explain ;; explain code/region
>  "lr" 'gptel-rewrite ;; rewrite selection
>  "lq" 'gptel-quick)) ;; quick popup
> 
> ;; Ellama flows (optional)
> (spacemacs/set-leader-keys
>  "ale" 'ellama) ;; open ellama session
> 
> ;; MCP
> (spacemacs/declare-prefix "alm" "MCP")
> (spacemacs/set-leader-keys
>  "almc" 'mcp-connect ;; connect to a server
>  "almd" 'mcp-disconnect
>  "alml" 'mcp-list-tools) ;; discover tools/resources
> ```
> 
> - Leader-key advice is straight from Spacemacs docs & community best practice. cite
> 
> ---
> 
> # Optional: `config.el` (defaults you’ll likely want)
> 
> ```elisp
> ;; Prefer asking on active region, else whole buffer.
> (setq gptel-prompt-prefix-function #'gptel-region-or-buffer)
> 
> ;; Keep transcripts near the code you’re working on (adjust to taste).
> (setq gptel-use-echo-area nil) ;; use dedicated chat buffer
> ```
> 
> ---
> 
> # MCP: where this is headed (and what’s real right now)
> 
> - **Client(s):** `lizqwerscott/mcp.el` is a working Emacs MCP client. There’s also an independent Emacs MCP implementation and an Emacs MCP server library by laurynas-biveinis (handy if you want to expose *your own* Emacs commands as MCP tools later). cite 
> - **Integration with gptel:** there’s active discussion about bridging MCP tools into gptel. Treat this space as evolving; the layer above keeps MCP separate so you can swap/upgrade without churn. cite 
> - **Bottom line:** usable today, not “done.” Good enough for experiments and local tools. cite
> 
> ---
> 
> # Install notes & gotchas
> 
> 1. **Enable the layer:** add `llm` to `dotspacemacs-configuration-layers`, then `SPC f e R` to reload. cite 
> 2. **Packages:** gptel and ellama are on MELPA/ELPA; MCP client may need `:location` recipe until/if it’s on MELPA. cite 
> 3. **Local models:** gptel works well with **Ollama**. Set `:host` and `:models` to the ones you actually run. (Your stack is local-first; stick with that.) cite 
> 4. **Keybinds:** if you want a fully separate top-level (not `SPC a l`), declare another prefix; Spacemacs is flexible here. cite 
> 5. **Extensions you may like:** `gptel-quick` (popup explains/summarizes at point), `gptel-autocomplete` (ghost-text code completion). Evaluate them critically; keep only what speeds you up. cite 
> 6. **Alternatives:** The GNU ELPA **llm** package is a generic abstraction some authors rally around; if you standardize on it, swap gptel/ellama calls for llm clients. Trade-offs exist (API surface, UX maturity). cite
> 
> ---
> 
> # TL;DR opinionated defaults
> 
> - Use **gptel + Ollama** for daily work (fast, dependable). Layer provides consistent leader keys. cite 
> - Keep **ellama** installed; if you like its session/minor-mode UX, bind it under `SPC a l e`. cite 
> - Experiment with **MCP** now, but isolate it; expect APIs to shift. When stable, we can auto-expose MCP tools inside gptel flows. cite
> 
> ---
> 
> If you want, I’ll refine this into a tiny repo (ready to drop into `~/.emacs.d/private/llm/`) with comments and a couple of opinionated presets for your local models.
> 
> #hashtags
> #spacemacs #emacs #gptel #ellama #mcp #ollama #localfirst #keybindings #layerdesign #llm-in-emacs
<!-- UID: 86525cf8-2bf1-47df-9a25-cdb141ff5e3b -->

---




>[!nexus_user] **User** - 09/02/2025 at 10:06 AM
> https://github.com/lizqwerscott/gptel-mcp.el
<!-- UID: 744065d7-a457-48de-92e2-da806d62b00f -->




>[!nexus_agent] **Assistant** - 09/02/2025 at 10:06 AM
> Nice—this is the missing glue. **`gptel-mcp.el`** wires **gptel** to **mcp.el**, giving you an MCP menu inside gptel (discover/start servers, run tools, etc.). It’s early but usable. Requires **Emacs 30+**. citeturn0view0
> 
> # What to do (Spacemacs)
> 
> ## 0) Baseline
> - Be on **Spacemacs `develop`** so the **`llm-client`** layer exists. Enable GPTel: 
>  In `~/.spacemacs` → `dotspacemacs-configuration-layers` add:
>  ```elisp
>  (llm-client :variables llm-client-enable-gptel t)
>  ```
>  (Yes, there’s an official layer now; it’s on develop.) cite
> 
> ## 1) Install `mcp.el` (the MCP client)
> Add this to your private layer `packages.el`:
> ```elisp
> (defconst llm-packages
>  '((mcp :location (recipe :fetcher github :repo "lizqwerscott/mcp.el"))))
> 
> (defun llm/init-mcp ()
>  (use-package mcp
>  :defer t
>  :config (require 'mcp-hub)))
> ```
> Why: `gptel-mcp.el` sits on top of this. It also gives you `mcp-hub` to manage servers. citeturn4view0
> 
> ## 2) Install `gptel-mcp.el` (the bridge)
> Either minimal `use-package`:
> ```elisp
> (use-package gptel-mcp
>  :vc (:url "https://github.com/lizqwerscott/gptel-mcp.el")
>  :after (gptel mcp)
>  :bind (:map gptel-mode-map
>  ("C-c m" . gptel-mcp-dispatch)))
> ```
> …or via private-layer recipe:
> ```elisp
> (add-to-list 'load-path "~/.emacs.d/private/llm/vendor/gptel-mcp.el")
> (require 'gptel-mcp)
> ```
> The README shows the `:vc` form and the **`gptel-mcp-dispatch`** entrypoint; it also states **Emacs 30+**. Bind `C-c m` in `gptel-mode-map` or add a leader key (below). citeturn0view0
> 
> ## 3) Minimal MCP servers (local-first, no SaaS)
> Put this in your layer `config.el` or `user-config`:
> ```elisp
> (setq mcp-hub-servers
>  '(("filesystem" . (:command "npx"
>  :args ("-y" "@modelcontextprotocol/server-filesystem"
>  "~/devel/promethean")))))
> (add-hook 'after-init-hook #'mcp-hub-start-all-server)
> ```
> This uses the official filesystem MCP server via `npx`. Start/stop from `M-x mcp-hub`. citeturn4view0
> 
> ## 4) GPTel → Ollama defaults (your style)
> ```elisp
> (with-eval-after-load 'gptel
>  (setq gptel-backend
>  (gptel-make-ollama "ollama"
>  :host "http://localhost:11434"
>  :models '("qwen2.5-coder:7b" "llama3.2:3b"))))
> ```
> GPTel has first-class Ollama support and a Spacemacs install path via the `llm-client` layer. citeturn3view0
> 
> ## 5) Spacemacs leader keys (don’t fight muscle memory)
> ```elisp
> (spacemacs/declare-prefix "al" "LLM")
> (spacemacs/set-leader-keys
>  "alg" #'gptel ;; open gptel chat
>  "alm" #'gptel-mcp-dispatch) ;; MCP menu inside gptel
> 
> ;; Also available inside gptel buffers via C-c m
> ```
> Spacemacs conventions for leader prefixes apply; the `llm-client` doc shows the layer’s existence and intent. cite
> 
> ---
> 
> ## How you’ll use it
> 1) `SPC a l g` → open a gptel chat (model = your Ollama default). 
> 2) `C-c m` (or `SPC a l m`) → **`gptel-mcp-dispatch`**: list/connect servers, browse tools, run tool calls from within gptel. citeturn0view0
> 
> ---
> 
> ## Gotchas (so you don’t waste time)
> - **Emacs 30+ is required** for `gptel-mcp.el` (and its `:vc` example). If you’re on 29, either upgrade or fetch the file manually and `(require 'gptel-mcp)`. citeturn0view0
> - If Spacemacs says “unknown layer `llm-client`”, you’re not on **develop**. Switch to develop; then enable the layer as shown. cite
> - MCP servers are just processes. Start via `mcp-hub` or autostart hook. Filesystem server needs Node/npm (`npx`). citeturn4view0
> - GPTel already **supports MCP integration** on its side; this repo just gives you a unified dispatch UI and simpler server/tool management from gptel buffers. citeturn3view0
> 
> If you want, I’ll package this as a drop-in `~/.emacs.d/private/llm/` skeleton (packages.el, config.el, keybindings.el, vendor/), tuned to your Ollama models and local MCP servers.
> 
> #hashtags
> #spacemacs #emacs #gptel #mcp #ollama #localfirst #layer #keybindings #promethean
<!-- UID: 106dc4e7-9b9e-4e5e-8f2d-b5ebc8b03843 -->

---




>[!nexus_user] **User** - 09/02/2025 at 10:30 AM
> show me what you got give me a layer
<!-- UID: 9d31004b-8b9c-4abf-a455-dc9b0f2e7bd9 -->




>[!nexus_agent] **Assistant** - 09/02/2025 at 10:30 AM
> Alright, here’s a **drop-in Spacemacs private layer** that gives you **GPTel + MCP + gptel-mcp** with sane leader keys and **Ollama** defaults (local-first, no SaaS). It doesn’t depend on any official layer; it’s self-contained.
> 
> You’ll get:
> - `SPC a l g` → open a GPTel chat buffer 
> - `SPC a l m` → launch the **MCP** menu **inside GPTel** (servers & tools via `gptel-mcp`) 
> - Per-mode bindings (prog/text/org/markdown) for send/explain/rewrite/quick
> 
> > Reality check: 
> > - **GPTel** is the mature Emacs LLM client (multi-backend, MELPA/ELPA). cite 
> > - **mcp.el** is the Emacs **MCP client**. cite 
> > - **gptel-mcp.el** bridges GPTel ↔ MCP; **requires Emacs 30+**. cite 
> > - If you later want Spacemacs’ official **llm-client** layer, it exists on **develop**; this layer doesn’t require it. cite
> 
> ---
> 
> # 1) Create the layer
> 
> Create folder: `~/.emacs.d/private/llm/` with these three files.
> 
> ### `packages.el`
> ```elisp
> ;;; packages.el --- llm layer packages -*- lexical-binding: t; -*-
> 
> (defconst llm-packages
>  '(
>  gptel
>  (mcp :location (recipe :fetcher github :repo "lizqwerscott/mcp.el"))
>  ;; gptel-mcp requires Emacs 30+; we load it conditionally.
>  (gptel-mcp :location (recipe :fetcher github :repo "lizqwerscott/gptel-mcp.el"))
>  ;; optional helper for quick lookups
>  (gptel-quick :location (recipe :fetcher github :repo "karthink/gptel-quick"))
>  ))
> 
> (defun llm/init-gptel ()
>  (use-package gptel
>  :defer t
>  :init
>  ;; Local-first defaults: Ollama on localhost
>  (setq gptel-default-mode 'org-mode)
>  (setq gptel-backend
>  (gptel-make-ollama "ollama"
>  :host "http://localhost:11434"
>  :models '("qwen2.5-coder:7b" "llama3.2:3b" "qwen2.5:7b")))
>  :config
>  ;; Helper: send region if active, else whole buffer
>  (defun llm/gptel-send-region-or-buffer ()
>  "Send active region to GPTel, else the whole buffer."
>  (interactive)
>  (if (use-region-p)
>  (gptel-send (region-beginning) (region-end))
>  (gptel-send (point-min) (point-max))))))
> 
> (defun llm/init-mcp ()
>  (use-package mcp
>  :defer t
>  :init
>  ;; Optional: autostart servers once after init (see config.el for list)
>  (defun llm/mcp-autostart ()
>  (when (fboundp 'mcp-hub-start-all-server)
>  (mcp-hub-start-all-server)))
>  (add-hook 'after-init-hook #'llm/mcp-autostart)))
> 
> (defun llm/init-gptel-mcp ()
>  ;; Only load bridge on Emacs 30+, otherwise skip cleanly.
>  (when (>= emacs-major-version 30)
>  (use-package gptel-mcp
>  :after (gptel mcp)
>  :commands (gptel-mcp-dispatch)
>  :init
>  ;; nothing required
>  :config
>  ;; Also bind a convenience key in gptel buffers
>  (with-eval-after-load 'gptel
>  (define-key gptel-mode-map (kbd "C-c m") #'gptel-mcp-dispatch)))))
> 
> (defun llm/init-gptel-quick ()
>  (use-package gptel-quick
>  :after gptel
>  :commands (gptel-quick)))
> ```
> 
> ### `config.el`
> ```elisp
> ;;; config.el --- llm layer config -*- lexical-binding: t; -*-
> 
> ;; Minimal, local-first MCP servers. Adjust to your paths.
> ;; Example: Filesystem server rooted at your repo/workspace.
> (with-eval-after-load 'mcp
>  (setq mcp-hub-servers
>  '(("filesystem" . (:command "npx"
>  :args ("-y" "@modelcontextprotocol/server-filesystem"
>  "~/devel/promethean")))))
>  ;; Do not block startup if node/npm missing; user can start later.
>  (unless (fboundp 'mcp-hub-start-all-server)
>  (message "[llm] mcp-hub not loaded yet; servers will start when available.")))
> ```
> 
> ### `keybindings.el`
> ```elisp
> ;;; keybindings.el --- llm layer keybindings -*- lexical-binding: t; -*-
> 
> ;; Global LLM prefix
> (spacemacs/declare-prefix "al" "LLM")
> 
> ;; GPTel entrypoints
> (spacemacs/set-leader-keys
>  "alg" #'gptel ;; open chat buffer
>  "alq" #'gptel-quick ;; quick popup (optional)
>  "alm" #'gptel-mcp-dispatch) ;; MCP menu inside GPTel (Emacs 30+)
> 
> ;; Per-major-mode bindings (prog/text/org/markdown)
> (dolist (mode '(prog-mode text-mode org-mode markdown-mode))
>  (spacemacs/declare-prefix-for-mode mode "ml" "LLM")
>  (spacemacs/set-leader-keys-for-major-mode mode
>  "lc" #'llm/gptel-send-region-or-buffer
>  "le" #'gptel-explain
>  "lr" #'gptel-rewrite
>  "lq" #'gptel-quick))
> ```
> 
> ---
> 
> # 2) Enable it
> 
> Add `llm` to `dotspacemacs-configuration-layers` in `~/.spacemacs`, then `SPC f e R` to reload.
> 
> ```elisp
> dotspacemacs-configuration-layers
> '(
>  ;; ...your other layers...
>  llm
> )
> ```
> 
> That’s it. Open a chat with **`SPC a l g`**, then hit **`SPC a l m`** (or `C-c m` in a GPTel buffer) to pop the **MCP** menu and start/attach to servers & tools.
> 
> ---
> 
> # 3) Notes that matter (no fluff)
> 
> - **GPTel** supports lots of backends; Ollama works great for local models. Flip `:models` to what you actually have. cite 
> - **MCP in GPTel** is officially acknowledged (NonGNU ELPA page documents `gptel-mcp-connect/disconnect`). The bridge here (`gptel-mcp.el`) gives you an integrated **dispatch/menu UX**—requires **Emacs 30+**. cite 
> - If you *do* switch to the **Spacemacs llm-client** layer later, it’s on **develop**; people on master will see “unknown layer.” Use mine until you move branches. cite
> 
> Want me to swap in your exact models + add a second local MCP server (e.g., a bespoke tools server) and wire a couple of one-key prompts? Say the word.
> 
> #hashtags
> #spacemacs #emacs #gptel #mcp #gptel-mcp #ollama #localfirst #keybindings #layer #emacs30
<!-- UID: 425ddd00-e81e-4786-ac82-b8dadea9bba5 -->

---


