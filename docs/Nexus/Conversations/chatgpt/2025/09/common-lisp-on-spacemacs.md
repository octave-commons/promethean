---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Common Lisp on Spacemacs"
conversation_id: 68b6fe2b-2ed0-8322-994f-f2ad2742ff3a
create_time: 09/02/2025 at 9:24 AM
update_time: 09/02/2025 at 9:31 AM
---

# Title: Common Lisp on Spacemacs

Created: 09/02/2025 at 9:24 AM
Last Updated: 09/02/2025 at 9:31 AM
Chat URL: https://chat.openai.com/c/68b6fe2b-2ed0-8322-994f-f2ad2742ff3a


>[!nexus_user] **User** - 09/02/2025 at 9:24 AM
> get me started with common lisp on spacemacs. I want the whole shebang, lsp, linting, etc everything I'd get with any other language and the SLIME repl
<!-- UID: ae78fd3b-87e4-44e5-b22c-d928d08497ba -->




>[!nexus_agent] **Assistant** - 09/02/2025 at 9:25 AM
> Alright Err — here’s a no-BS, end-to-end setup for **Common Lisp on Spacemacs** with **SLIME REPL**, **LSP**, and **linting**. I’ll give you the shortest path first, then config you can paste. #practical #emacs #commonlisp
> 
> ---
> 
> # 0) What you’re getting
> 
> - Spacemacs **Common Lisp layer** (SLIME REPL, eval, navigation, keybindings). citeturn2view0 
> - **LSP** via `cl-lsp` (go-to-def, hover, completion, formatting) using lsp-mode. cite 
> - **Linting** via `sblint` (SBCL-based linter) wired into Flycheck. cite 
> - **Quicklisp** + `quicklisp-slime-helper` for a clean SLIME path. cite 
> - **Roswell** as the manager for CL installs & tooling (makes `cl-lsp`/`sblint` painless). cite
> 
> ---
> 
> # 1) Install the base tooling
> 
> ```bash
> # Roswell (Common Lisp env/impl manager)
> # macOS: brew install roswell
> # Linux: follow distro instructions then:
> ros setup # initializes ~/.roswell
> 
> # Common Lisp implementation (SBCL) via Roswell
> ros install sbcl
> ros use sbcl # ensure Roswell picks SBCL
> 
> # Quicklisp inside SBCL (first run triggers Quicklisp bootstrap)
> ros run
> # in the SBCL prompt:
> # (load "quicklisp.lisp") ; if downloaded, or follow quicklisp.org bootstrap
> # (quicklisp-quickstart:install)
> # (ql:add-to-init-file)
> # (ql:quickload "quicklisp-slime-helper")
> # (quit)
> ```
> 
> Why Roswell? It standardizes where tools land and makes installing `cl-lsp`/`sblint` one-liners. cite 
> Quicklisp notes & updates are here if you need them. cite
> 
> ---
> 
> # 2) Spacemacs layers
> 
> Edit `~/.spacemacs` and add layers:
> 
> ```elisp
> dotspacemacs-configuration-layers
> '(
>  (lsp) ; Spacemacs LSP layer
>  (syntax-checking) ; Flycheck
>  (common-lisp) ; SLIME, CL goodies
>  ;; optional:
>  ;; (parinfer) ; if you like paren-driven editing
> )
> ```
> 
> The `common-lisp` layer wires SLIME, REPL, eval, navigation; defaults to SBCL unless you set another `inferior-lisp-program`. citeturn2view0 
> LSP layer gives you `lsp-mode` integration. cite
> 
> ---
> 
> # 3) Point Emacs at SLIME (Quicklisp helper)
> 
> Add this to `dotspacemacs/user-config`:
> 
> ```elisp
> (defun dotspacemacs/user-config ()
>  ;; If you used quicklisp-slime-helper, this sets SLIME's path cleanly:
>  (let ((slime-helper (expand-file-name "~/quicklisp/slime-helper.el")))
>  (when (file-exists-p slime-helper)
>  (load slime-helper)))
>  ;; If you need to pin your Lisp explicitly (otherwise SBCL via Roswell is fine):
>  ;; (setq inferior-lisp-program "ros -Q run")
> )
> ```
> 
> `quicklisp-slime-helper` creates `~/quicklisp/slime-helper.el` and handles load-paths for SLIME. cite 
> Layer docs confirm SLIME/REPL keybindings (`SPC m '`, etc.). citeturn2view0
> 
> ---
> 
> # 4) LSP for Common Lisp (cl-lsp)
> 
> Install the server (Roswell makes it easy):
> 
> ```bash
> ros install cxxxr/cl-lsp
> # verify:
> ~/.roswell/bin/cl-lsp --help
> ```
> 
> Then tell Spacemacs/lsp-mode to start it for `common-lisp-mode`:
> 
> ```elisp
> (with-eval-after-load 'lsp-mode
>  (add-to-list 'lsp-language-id-configuration '(common-lisp-mode . "commonlisp"))
>  (lsp-register-client
>  (make-lsp-client
>  :new-connection (lsp-stdio-connection (lambda () (list (expand-file-name "~/.roswell/bin/cl-lsp"))))
>  :activation-fn (lsp-activate-on "commonlisp")
>  :server-id 'cl-lsp)))
> 
> (add-hook 'common-lisp-mode-hook #'lsp) ;; or use (add-hook 'common-lisp-mode-hook #'lsp-deferred)
> ```
> 
> `cl-lsp` supports definition, references, hover, completion, signature help, and formatting (status listed in the repo). cite 
> General `lsp-mode` install/use guidance is here. cite
> 
> ---
> 
> # 5) Linting (Flycheck + sblint)
> 
> Install the linter:
> 
> ```bash
> ros install cxxxr/sblint
> ~/.roswell/bin/sblint -h
> ```
> 
> Wire it into Flycheck:
> 
> ```elisp
> (with-eval-after-load 'flycheck
>  (flycheck-define-checker common-lisp-sblint
>  "Common Lisp linting via sblint (SBCL)."
>  :command ("sblint" source-inplace)
>  :error-patterns
>  ((error line-start (file-name) ":" line ":" column ": " (message) line-end))
>  :modes (common-lisp-mode))
>  (add-to-list 'flycheck-checkers 'common-lisp-sblint))
> (add-hook 'common-lisp-mode-hook #'flycheck-mode)
> ```
> 
> SBLint exists and is SBCL-based; Flycheck maintainers have discussed using it for CL. cite
> 
> > Reality check: CL linting isn’t as standardized as, say, Rust/Go linters. SBLint catches a useful subset; compilers (SBCL) also emit style warnings — but you now get inline diagnostics like other languages. cite
> 
> ---
> 
> # 6) Quality-of-life
> 
> - **Structured editing**: enable `evil-cleverparens` for safe s-exp edits (balanced parens). 
>  Add in `user-config` if you want it on by default:
>  ```elisp
>  (spacemacs/toggle-evil-safe-lisp-structural-editing-on-register-hook-common-lisp-mode)
>  ```
>  citeturn2view0
> 
> - **REPL**: `SPC m '` starts/visits SLIME; `SPC m e e` eval last sexp; plenty more in layer cheatsheet. citeturn2view0
> 
> - **Cookbook**: good overview of editor options & current LSP state if you’re curious. cite
> 
> ---
> 
> # 7) Minimal project layout (works with both SLIME & LSP)
> 
> ```
> my-app/
> ├── my-app.asd
> └── src/
>  └── core.lisp
> ```
> 
> `my-app.asd`:
> 
> ```lisp
> (asdf:defsystem "my-app"
>  :version "0.1.0"
>  :serial t
>  :components ((:file "src/core")))
> ```
> 
> Start SLIME (`SPC m '`) → `(ql:quickload :my-app)` → `(in-package :my-app)` while editing `src/core.lisp`. LSP will index sources; SLIME handles interactive compile/load cycles.
> 
> ---
> 
> # 8) Troubleshooting (quick hits)
> 
> - **Two SLIMEs on your system?** Remove distro SLIME; use the layer + Quicklisp helper to avoid path hell. citeturn2view0 
> - **SBCL too old on your distro?** Install via Roswell to get current. cite 
> - **LSP doesn’t start?** Confirm `~/.roswell/bin` is on PATH, and the `lsp-register-client` path matches your filesystem. `M-x lsp-describe-session` helps. cite 
> - **No SLIME?** Ensure `~/quicklisp/slime-helper.el` exists, and you `load` it. cite
> 
> ---
> 
> # 9) Why not SLY?
> 
> SLY is a SLIME fork with extras; Spacemacs’s `common-lisp` layer ships with **SLIME** by default and has solid docs/keymaps around it. You can swap later if you prefer, but starting with the happy path keeps friction low. citeturn2view0
> 
> ---
> 
> If you want, I can drop a ready-to-paste `~/.spacemacs` diff or turn the Flycheck/LSP snippets into a small Spacemacs private layer so you can keep your init tidy. #nextsteps
<!-- UID: 7683869a-3f22-4bab-b688-d6dedfbafdf9 -->

---


