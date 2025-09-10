---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Emacs initialization error fix"
conversation_id: 68ab6949-da00-832e-8c5a-5195bd620984
create_time: 08/24/2025 at 2:34 PM
update_time: 08/24/2025 at 2:45 PM
---

# Title: Emacs initialization error fix

Created: 08/24/2025 at 2:34 PM
Last Updated: 08/24/2025 at 2:45 PM
Chat URL: https://chat.openai.com/c/68ab6949-da00-832e-8c5a-5195bd620984


>[!nexus_user] **User** - 08/24/2025 at 2:34 PM
> ⛔ Warning (initialization): An error occurred while loading ‘/home/err/.emacs.d/init.el’:
> 
> Symbol's function definition is void: generic-combinators
> 
> To ensure normal operation, you should investigate and remove the
> cause of the error in your initialization file. Start Emacs with
> the ‘--debug-init’ option to view a complete error backtrace.
> 
> I just upgraded to 30.2 cause copilot only works correctly on 30.1+
<!-- UID: 853ba4b5-5f23-4ae0-900d-f583355ae7c0 -->




>[!nexus_agent] **Assistant** - 08/24/2025 at 2:34 PM
> That error means something in your init is calling a function named `generic-combinators`, but no library has defined it yet (or its `.elc` refers to a symbol that no longer exists after your 30.2 upgrade).
> 
> Here’s the fastest way to pinpoint and fix it:
> 
> ### 1) Find exactly where it’s coming from
> In a terminal, grep your config and packages for the symbol:
> ```bash
> rg -n --hidden --no-ignore -S "generic-combinators" ~/.emacs.d ~/.config/emacs ~/.emacs
> ```
> > If nothing shows in your repo, it’s probably in a byte‑compiled ELPA/straight build file.
> 
> Also start Emacs with a backtrace:
> ```bash
> emacs --debug-init
> ```
> Look at the topmost non-core frame: it will point to the file and line that called `generic-combinators`.
> 
> ### 2) Nuke stale bytecode (common after an Emacs upgrade)
> Byte‑compiled files can hold stale symbol refs. Safest is to delete them and rebuild:
> 
> **ELPA/MELPA (package.el)**
> ```bash
> find ~/.emacs.d/elpa -type f -name "*.elc" -delete
> ```
> 
> **straight.el (if you use it)**
> ```bash
> rm -rf ~/.emacs.d/straight/build
> rm -rf ~/.emacs.d/straight/build-cache.el
> ```
> 
> **Your own config**
> ```bash
> find ~/.emacs.d -type f -name "*.elc" -delete
> ```
> 
> Restart Emacs so packages recompile on demand.
> 
> ### 3) Ensure the defining package is installed/loaded
> If your grep/backtrace points into your config, make sure you `require` the right library *before* you use it. If it points into a package, reinstall it:
> 
> **package.el**
> ```elisp
> M-x package-refresh-contents
> M-x package-reinstall RET <that-package>
> ```
> 
> **straight.el**
> ```elisp
> M-x straight-pull-package RET <that-package>
> M-x straight-rebuild-package RET <that-package>
> ```
> 
> ### 4) Quick sanity check inside Emacs
> After you fix/reinstall, verify the symbol exists:
> ```elisp
> (fboundp 'generic-combinators)
> ```
> If this returns `t`, you’re good.
> 
> ---
> 
> #### If you don’t find the symbol at all
> Sometimes the *caller* name is misspelled (e.g., meant to call `something-combinators` from a parser/PEG lib). In that case:
> 
> 1) The backtrace will still show the file/line—open it and see the offending form.
> 2) Comment it out or correct the name.
> 3) Re-evaluate the buffer / restart.
> 
> ---
> 
> If you paste the first 20–30 lines of the `--debug-init` backtrace (especially the top frames that reference your files or `elpa/`/`straight/` paths), I’ll zero in on the exact package/line and give you a one‑liner fix.
<!-- UID: 2cbcd013-c8fc-4d9d-86f8-099e9c4a50ac -->

---




>[!nexus_user] **User** - 08/24/2025 at 2:36 PM
> Debugger entered--Lisp error: (void-function generic-combinators)
>  (generic-combinators "generic")
>  (list (list "(\\(\\(?:def\\|macro\\)\\(?:[*._[:word:]-]+\\)*\\)[\n[:space:]]+\\([._[:word:]-]+\\)[\n[:space:]]+" '(1 font-lock-keyword-face) '(2 font-lock-function-name-face)) (list "(\\(\\(?:f\\(?:\\(?:unctio\\)?n\\)\\|gmth\\|m\\(?:ethod\\|th\\)\\)\\(?:[*._[:word:]-]+\\)*\\)[\n[:space:]]+\\([._[:word:]-]+\\)[\n[:space:]]+" '(1 font-lock-keyword-face) '(2 font-lock-function-name-face)) (list "(\\(\\(?:#\\|lambda\\)\\(?:[*._[:word:]-]+\\)*\\)" '(1 font-lock-keyword-face)) (list "(\\(\\(?:=>\\|let\\*?\\)\\(?:[*._[:word:]-]+\\)*\\)" '(1 font-lock-keyword-face)) (list "(\\(\\(?:assign\\|get\\|set\\|var\\)\\)[\n[:space:]]+\\([*._[:word:]-]+\\)" '(1 font-lock-keyword-face) '(2 font-lock-variable-name-face)) (list "(\\(\\(?:#->\\|alias\\|const\\|default\\|exports\\|from\\|g\\(?:ett\\(?:er\\)?\\|mth\\)\\|let\\|m\\(?:ethods\\|odule\\|th\\)\\|of\\|s\\(?:ett\\(?:er\\)?\\|pecify\\)\\|type\\|where\\||>\\)\\)[\n[:space:]]+\\([*._[:word:]-]+\\)" '(1 font-lock-keyword-face) '(2 font-lock-variable-name-face)) (generic-combinators "generic") (list "(\\(\\(?:#>\\|<=\\|>=\\|and\\|console\\|i\\(?:f\\|mport-namespace\\|n\\(?:clude\\|stanceof\\)\\)\\|n\\(?:amespace\\|ot\\)\\|or\\|pipe\\|re\\(?:quire\\|turn\\)\\|t\\(?:ernary\\|h\\(?:is\\|row\\)\\|ry\\)\\|unless\\|when\\|[*+/<=>-]\\)\\)" '(1 font-lock-keyword-face)) (list "(\\(\\(?:\\.\\(?:catch\\|then\\)\\|>>\\|c\\(?:atch\\|reate\\)\\|extend\\|is\\|literal\\|maybe\\|on\\(?:ce\\)?\\|print\\|then\\)\\)" '(1 font-lock-keyword-face)) (list "\\<\\(\\(?:false\\|t\\(?:his\\|rue\\)\\)\\)" '(1 font-lock-keyword-face)) (rule ("(" (zero-or-more (or "\n" whitespace)) (group (one-or-more (or "-" word "_" "."))) (zero-or-more (or "\n" whitespace))) '(1 font-lock-variable-name-face)))
>  (defvar sibilant-font-lock-defaults (list (list "(\\(\\(?:def\\|macro\\)\\(?:[*._[:word:]-]+\\)*\\)[\n[:space:]]+\\([._[:word:]-]+\\)[\n[:space:]]+" '(1 font-lock-keyword-face) '(2 font-lock-function-name-face)) (list "(\\(\\(?:f\\(?:\\(?:unctio\\)?n\\)\\|gmth\\|m\\(?:ethod\\|th\\)\\)\\(?:[*._[:word:]-]+\\)*\\)[\n[:space:]]+\\([._[:word:]-]+\\)[\n[:space:]]+" '(1 font-lock-keyword-face) '(2 font-lock-function-name-face)) (list "(\\(\\(?:#\\|lambda\\)\\(?:[*._[:word:]-]+\\)*\\)" '(1 font-lock-keyword-face)) (list "(\\(\\(?:=>\\|let\\*?\\)\\(?:[*._[:word:]-]+\\)*\\)" '(1 font-lock-keyword-face)) (list "(\\(\\(?:assign\\|get\\|set\\|var\\)\\)[\n[:space:]]+\\([*._[:word:]-]+\\)" '(1 font-lock-keyword-face) '(2 font-lock-variable-name-face)) (list "(\\(\\(?:#->\\|alias\\|const\\|default\\|exports\\|from\\|g\\(?:ett\\(?:er\\)?\\|mth\\)\\|let\\|m\\(?:ethods\\|odule\\|th\\)\\|of\\|s\\(?:ett\\(?:er\\)?\\|pecify\\)\\|type\\|where\\||>\\)\\)[\n[:space:]]+\\([*._[:word:]-]+\\)" '(1 font-lock-keyword-face) '(2 font-lock-variable-name-face)) (generic-combinators "generic") (list "(\\(\\(?:#>\\|<=\\|>=\\|and\\|console\\|i\\(?:f\\|mport-namespace\\|n\\(?:clude\\|stanceof\\)\\)\\|n\\(?:amespace\\|ot\\)\\|or\\|pipe\\|re\\(?:quire\\|turn\\)\\|t\\(?:ernary\\|h\\(?:is\\|row\\)\\|ry\\)\\|unless\\|when\\|[*+/<=>-]\\)\\)" '(1 font-lock-keyword-face)) (list "(\\(\\(?:\\.\\(?:catch\\|then\\)\\|>>\\|c\\(?:atch\\|reate\\)\\|extend\\|is\\|literal\\|maybe\\|on\\(?:ce\\)?\\|print\\|then\\)\\)" '(1 font-lock-keyword-face)) (list "\\<\\(\\(?:false\\|t\\(?:his\\|rue\\)\\)\\)" '(1 font-lock-keyword-face)) (rule ("(" (zero-or-more (or "\n" whitespace)) (group (one-or-more (or "-" word "_" "."))) (zero-or-more (or "\n" whitespace))) '(1 font-lock-variable-name-face))))
>  load-with-code-conversion("/home/err/devel/promethean/.emacs/layers/promethean/sibilant.el" "/home/err/devel/promethean/.emacs/layers/promethean/sibilant.el" nil nil)
>  load("/home/err/devel/promethean/.emacs/layers/promethean/sibilant.el")
>  promethean/init-promethean-sibilant-mode()
>  funcall(promethean/init-promethean-sibilant-mode)
>  (let* ((pkg-name (eieio-oref pkg 'name)) (owner (car (eieio-oref pkg 'owners)))) (spacemacs-buffer/message (format "%S -> init (%S)..." pkg-name owner)) (funcall (intern (format "%S/init-%S" owner pkg-name))))
>  configuration-layer//configure-package(#<cfgl-package cfgl-package-10a475189025>)
>  mapc(configuration-layer//configure-package (#<cfgl-package cfgl-package-10a475ebb350> #<cfgl-package cfgl-package-10a475e2ad65> #<cfgl-package cfgl-package-10a475e2ad7e> #<cfgl-package cfgl-package-10a475eba70a> #<cfgl-package cfgl-package-10a475ebc1cc> #<cfgl-package cfgl-package-10a475e2921b> #<cfgl-package cfgl-package-10a475e29b90> #<cfgl-package cfgl-package-10a475ebb37d> #<cfgl-package cfgl-package-10a475e8e550> #<cfgl-package cfgl-package-10a475e2ad53> #<cfgl-package cfgl-package-10a4751891d4> #<cfgl-package cfgl-package-10a475ebc051> #<cfgl-package cfgl-package-10a475e829f5> #<cfgl-package cfgl-package-10a475ebb366> #<cfgl-package cfgl-package-10a475e85934> #<cfgl-package cfgl-package-10a475ebb3bb> #<cfgl-package cfgl-package-10a475e2ad24> #<cfgl-package cfgl-package-10a475ebc422> #<cfgl-package cfgl-package-10a475eb9d2e> #<cfgl-package cfgl-package-10a475e8234b> #<cfgl-package cfgl-package-10a475ebce9c> #<cfgl-package cfgl-package-10a475e861f9> #<cfgl-package cfgl-package-10a475ebae12> #<cfgl-package cfgl-package-10a475eb8674> #<cfgl-package cfgl-package-10a475e2ad09> #<cfgl-package cfgl-package-10a475ebba5c> #<cfgl-package cfgl-package-10a475e8602a> #<cfgl-package cfgl-package-10a475e86007> #<cfgl-package cfgl-package-10a475eb8219> #<cfgl-package cfgl-package-10a475ebba21> #<cfgl-package cfgl-package-10a475eb9d03> #<cfgl-package cfgl-package-10a475e29e24> #<cfgl-package cfgl-package-10a475e8e57d> #<cfgl-package cfgl-package-10a475ebd0b1> #<cfgl-package cfgl-package-10a475ebd082> #<cfgl-package cfgl-package-10a475ebab17> #<cfgl-package cfgl-package-10a475ebfdb1> #<cfgl-package cfgl-package-10a475e29bbd> #<cfgl-package cfgl-package-10a475e2bc3f> #<cfgl-package cfgl-package-10a475e85919> #<cfgl-package cfgl-package-10a475e8597a> #<cfgl-package cfgl-package-10a475ebba12> #<cfgl-package cfgl-package-10a475ebc45f> #<cfgl-package cfgl-package-10a475ebb60f> #<cfgl-package cfgl-package-10a475e2a76f> #<cfgl-package cfgl-package-10a475e29ba6> #<cfgl-package cfgl-package-10a475ebb628> #<cfgl-package cfgl-package-10a475e2ab0a> #<cfgl-package cfgl-package-10a475ebc478> #<cfgl-package cfgl-package-10a475e2bc18> ...))
>  (let (packages-to-configure) (let ((tail packages)) (while tail (let ((pkg-name (car tail))) (let ((pkg (configuration-layer/get-package pkg-name))) (cond ((eieio-oref pkg ...) (spacemacs-buffer/message ...)) ((and ... ...) (spacemacs-buffer/message ...)) ((null ...) (spacemacs-buffer/message ...)) ((not ...) (spacemacs-buffer/message ...)) ((not ...) (spacemacs-buffer/message ...)) (t (let ... ...) (if ... nil ...) (cond ... ...)))) (setq tail (cdr tail))))) (setq packages-to-configure (reverse packages-to-configure)) (mapc 'configuration-layer//configure-package packages-to-configure) (mapc 'configuration-layer//post-configure-package packages-to-configure))
>  configuration-layer//configure-packages-2((abbrev ace-link ace-window add-node-modules-path aggressive-indent all-the-icons ansi-colors archive-mode auto-compile auto-highlight-symbol auto-yasnippet avy avy-jump-helm-line bookmark browse-at-remote buffer-menu centered-cursor-mode clean-aindent-mode code-cells code-review column-enforce-mode comint company company-web compile conf-mode copilot copilot-chat css-mode cus-edit cython-mode dash debug default-helm-config default-ivy-config default-org-config define-word desktop devdocs diff-hl diff-mode dired dired-quick-sort dired-x disable-mouse display-fill-column-indicator display-line-numbers doc-view drag-stuff dumb-jump ...))
>  (let (bootstrap-packages pre-packages other-packages) (let ((tail packages)) (while tail (let ((pkg-name (car tail))) (let* ((pkg (configuration-layer/get-package pkg-name)) (step (eieio-oref pkg ...))) (cond ((eq step ...) (setq bootstrap-packages ...)) ((eq step ...) (setq pre-packages ...)) (t (setq other-packages ...)))) (setq tail (cdr tail))))) (setq bootstrap-packages (nreverse bootstrap-packages)) (setq pre-packages (nreverse pre-packages)) (setq other-packages (nreverse other-packages)) (spacemacs-buffer/message "+ Configuring bootstrap packages...") (configuration-layer//configure-packages-2 bootstrap-packages) (spacemacs-buffer/message "+ Configuring pre packages...") (configuration-layer//configure-packages-2 pre-packages) (spacemacs-buffer/message "+ Configuring packages...") (configuration-layer//configure-packages-2 other-packages))
>  configuration-layer//configure-packages((abbrev ace-link ace-window add-node-modules-path aggressive-indent all-the-icons ansi-colors archive-mode async auto-compile auto-highlight-symbol auto-yasnippet avy avy-jump-helm-line bind-key bind-map bookmark browse-at-remote buffer-menu centered-cursor-mode clean-aindent-mode code-cells code-review column-enforce-mode comint company company-web compile conf-mode copilot copilot-chat css-mode cus-edit cython-mode dash debug default-helm-config default-ivy-config default-org-config define-word desktop devdocs diff-hl diff-mode diminish dired dired-quick-sort dired-x disable-mouse display-fill-column-indicator ...))
>  configuration-layer//load()
>  configuration-layer/load()
>  (let ((load-prefer-newer t) (file-name-handler-alist '(("\\.gz\\'" . jka-compr-handler)))) (require 'core-spacemacs) (configuration-layer/load-lock-file) (spacemacs/init) (configuration-layer/stable-elpa-init) (configuration-layer/load) (spacemacs-buffer/display-startup-note) (spacemacs/setup-startup-hook) (if (and dotspacemacs-enable-server (not noninteractive)) (progn (require 'server) (if dotspacemacs-server-socket-dir (progn (setq server-socket-dir dotspacemacs-server-socket-dir))) (if (or (daemonp) (server-running-p)) nil (message "Starting a server...") (server-start)))))
>  load-with-code-conversion("/home/err/.emacs.d/init.el" "/home/err/.emacs.d/init.el" t t)
>  load("/home/err/.emacs.d/init" noerror nomessage)
>  #f(compiled-function () #<bytecode 0xc8db2bb740a8d91>)()
>  #f(compiled-function () #<bytecode -0x4307d7bb01d2857>)()
>  handler-bind-1(#f(compiled-function () #<bytecode -0x4307d7bb01d2857>) (error) startup--debug)
>  startup--load-user-init-file(#f(compiled-function () #<bytecode -0x155cf94077b0b3af>) #f(compiled-function () #<bytecode 0x731968ef8c7b19b>) t)
>  command-line()
>  normal-top-level()
<!-- UID: dd4cecbe-eb21-4b43-80e5-2c7fbc440530 -->




>[!nexus_agent] **Assistant** - 08/24/2025 at 2:36 PM
> Nice—this backtrace nails it. The crash happens while loading your custom layer file:
> 
> `/home/err/devel/promethean/.emacs/layers/promethean/sibilant.el`
> 
> Specifically, the `defvar sibilant-font-lock-defaults` evaluates `(generic-combinators "generic")` (twice), but `generic-combinators` isn’t defined yet. Everything else in that list (like `rule`, `group`, `zero-or-more`, `whitespace`) likely comes from the same helper file you used to have loaded earlier.
> 
> You’ve got two clean paths:
> 
> ### Fast unblock (shim it so Emacs boots)
> Add this **right above** the `defvar sibilant-font-lock-defaults` in `sibilant.el`:
> 
> ```elisp
> ;; Temporary shim so startup doesn't explode if the combinators aren't loaded yet.
> (unless (fboundp 'generic-combinators)
>  (defun generic-combinators (&optional _family)
>  "Fallback shim; return no extra font-lock rules when the real impl isn't loaded."
>  nil))
> ```
> 
> Or even more surgical: wrap the call sites:
> 
> ```elisp
> (when (fboundp 'generic-combinators)
>  (generic-combinators "generic"))
> ```
> 
> Do that for both occurrences. Emacs will start; you just won’t get those extra font-lock rules until the real library is loaded.
> 
> ---
> 
> ### Proper fix (load the real combinator helpers first)
> Wherever you define `generic-combinators` (and probably `rule`, `group`, etc.), make sure it’s required **before** evaluating the `defvar`. At the top of `sibilant.el`, add:
> 
> ```elisp
> ;; Adjust this to the actual file that defines generic-combinators/rule/group/etc.
> ;; Example:
> ;; (require 'promethean-fontlock-combinators)
> ;; or
> ;; (load (expand-file-name "fontlock-combinators.el"
> ;; (file-name-directory load-file-name)) t t)
> 
> (declare-function generic-combinators "promethean-fontlock-combinators")
> ```
> 
> Then ensure your layer’s `packages.el`/`init` orders things so that combinators file loads first (e.g., put the `require` in your `init-...` function that runs before building the font-lock defaults).
> 
> ---
> 
> ### One more stability tip after upgrading Emacs
> Stale bytecode can keep references to old symbols:
> 
> ```bash
> find ~/.emacs.d -type f -name "*.elc" -delete
> rm -rf ~/.emacs.d/straight/build ~/.emacs.d/straight/build-cache.el # if using straight.el
> find ~/.emacs.d/elpa -type f -name "*.elc" -delete # if using package.el
> ```
> 
> Then restart with `emacs --debug-init` once to confirm it’s clean.
> 
> ---
> 
> If you paste the header of the file that defines `rule`/`group`/`zero-or-more` (or tell me what you named it), I’ll give you the exact `require` line + init ordering so you can drop the shim.
<!-- UID: 73819bee-eecb-4106-b0a0-2a0b24ca728f -->

---




>[!nexus_user] **User** - 08/24/2025 at 2:39 PM
> Glad you can read those nightmares jesus
<!-- UID: b58eafbe-6421-4327-b506-16eb1e517ac3 -->




>[!nexus_agent] **Assistant** - 08/24/2025 at 2:39 PM
> Heh — Emacs backtraces are like Lovecraftian scrolls: once you get past the noise (`configuration-layer//configure-package … eieio-oref … spacemacs-buffer/message …`), the important part is always just a single `(void-function …)` or `(wrong-type-argument …)` hiding in the middle. 
> 
> In your case it boiled down to: 
> ```elisp
> (generic-combinators "generic")
> ```
> inside `sibilant.el` being evaluated before `generic-combinators` was ever defined. Everything else in the backtrace is just Spacemacs scaffolding that loaded it.
> 
> So the fix is either:
> 
> - shim it (so your init won’t explode, but you lose those rules), or 
> - load the file that defines `generic-combinators` before `sibilant.el` builds its `font-lock-defaults`.
> 
> That’s it. The rest is noise. 
> 
> Want me to sketch a clean `promethean-fontlock-combinators.el` with `generic-combinators`, `rule`, `group`, etc. defined, so you can `require` it from `sibilant.el` instead of patch-shimming?
<!-- UID: 6a5a6f21-7533-40e3-b184-eaefa2da3c98 -->

---




>[!nexus_user] **User** - 08/24/2025 at 2:44 PM
> yea I was just lookin over my old sibilant package for stuff that might be missing cause it wasn't quite looking right
<!-- UID: a1ebdf7c-e33d-4a14-839d-2ade4bbf4957 -->




>[!nexus_agent] **Assistant** - 08/24/2025 at 2:44 PM
> Gotcha. Let’s give you a tiny, clean helper you can drop in so `generic-combinators` (and the rx‑style helpers your rules use) are defined before `sibilant.el` runs.
> 
> ### 1) New file: `promethean-fontlock-combinators.el`
> Put this anywhere on your `load-path` (e.g., alongside `sibilant.el` in your layer), then `require` it.
> 
> ```elisp
> ;;; promethean-fontlock-combinators.el --- rx helpers for font-lock -*- lexical-binding: t; -*-
> ;; Minimal combinator layer used by sibilant.el
> ;; Provides: generic-combinators, rule, zero-or-more, one-or-more, optional
> ;; Depends: rx, cl-lib
> 
> (require 'rx)
> (require 'cl-lib)
> 
> ;; Turn an rx S-expression into a plain regexp string
> (defun pfc--rx-to-str (form)
>  "Return a regexp string from rx FORM, without outer non-capturing parens."
>  (rx-to-string form 'no-group))
> 
> ;; Public helper used by your font-lock lists:
> (cl-defun rule (rx-form &rest props)
>  "Build a font-lock rule from RX-FORM (an rx S-exp) and PROPS (face specs)."
>  (apply #'list (pfc--rx-to-str rx-form) props))
> 
> ;; Tiny DSL helpers that expand to rx nodes
> (defmacro zero-or-more (&rest body) `(* ,@body))
> (defmacro one-or-more (&rest body) `(+ ,@body))
> (defmacro optional (&rest body) `(? ,@body))
> ;; Note: `group`, `or`, `word`, `whitespace`, etc. are already rx keywords.
> 
> ;;;###autoload
> (defun generic-combinators (&optional family)
>  "Return a list of extra font-lock rules for FAMILY (string).
> Currently supports \"generic\"; returns a conservative set that
> won’t fight other rules."
>  (pcase family
>  ((or "generic" nil)
>  (list
>  ;; Numbers
>  (rule (seq (or bol (not (any ?\. ?\w)))
>  (one-or-more (or digit (seq ?_ digit)))
>  (optional ?. (one-or-more digit)))
>  '(0 font-lock-constant-face))
>  ;; TODO/FIXME style tags
>  (rule (seq symbol-start (group (or "TODO" "FIXME" "NOTE")) symbol-end)
>  '(1 font-lock-warning-face))
>  ;; Quoted symbols/keywords like :thing or 'foo
>  (rule (seq (or ?' ?:)
>  (group (one-or-more (or word ?- ?_ ?.))))
>  '(1 font-lock-constant-face))))
>  (_ nil)))
> 
> (provide 'promethean-fontlock-combinators)
> ;;; promethean-fontlock-combinators.el ends here
> ```
> 
> ### 2) Wire it up in `sibilant.el`
> At the top of your Sibilant layer file, before `defvar sibilant-font-lock-defaults`, load the helpers:
> 
> ```elisp
> (require 'promethean-fontlock-combinators) ;; defines generic-combinators/rule/etc.
> ```
> 
> …and **remove any shims** you added earlier like `(unless (fboundp 'generic-combinators) ...)`.
> 
> ### 3) Nuke stale bytecode (post‑upgrade safety)
> ```bash
> find ~/.emacs.d -type f -name "*.elc" -delete
> rm -rf ~/.emacs.d/straight/build ~/.emacs.d/straight/build-cache.el # if using straight.el
> find ~/.emacs.d/elpa -type f -name "*.elc" -delete # if using package.el
> ```
> 
> Restart Emacs (or `M-x eval-buffer` in both files) and the backtrace should be gone, with your Sibilant faces intact. If you want me to tailor `generic-combinators` to highlight more Sibilant‑specific forms (operators, pipelines, etc.), paste a couple representative snippets and I’ll extend those rules.
<!-- UID: 6b906ba0-c3bd-433e-8f99-12c79f5d4cb5 -->

---


