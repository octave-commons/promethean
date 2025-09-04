---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Fixing Copilot and Flycheck"
conversation_id: 68ab395f-1994-832d-a5b8-bc12de4653e6
create_time: 08/24/2025 at 11:10 AM
update_time: 08/24/2025 at 2:53 PM
---

# Title: Fixing Copilot and Flycheck

Created: 08/24/2025 at 11:10 AM
Last Updated: 08/24/2025 at 2:53 PM
Chat URL: https://chat.openai.com/c/68ab395f-1994-832d-a5b8-bc12de4653e6


>[!nexus_user] **User** - 08/24/2025 at 11:10 AM
> Yeap... I'm editing hy in a layer I made myself.. and copilot is complaining:
> ⛔ Warning (copilot): copilot--infer-indentation-offset found no mode-specific indentation offset.
> ⛔ Warning (flycheck): Syntax checker lsp reported too many errors (685) and is disabled.
> Use ‘M-x customize-variable RET flycheck-checker-error-threshold’ to
> change the threshold or ‘SPC u SPC e d’ to re-enable the checker.
> ⛔ Warning (copilot): copilot--infer-indentation-offset found no mode-specific indentation offset.
<!-- UID: 756afd3e-3735-4bc7-b0c8-222e1e74d6d3 -->




>[!nexus_agent] **Assistant** - 08/24/2025 at 11:10 AM
> Got it — you’re bumping into two different issues at once here: 
> 
> ### 1. `copilot--infer-indentation-offset found no mode-specific indentation offset`
> That warning happens because Copilot.el tries to guess the right indentation rules from the major mode, but Hy doesn’t have a built-in `indent-tabs-mode` / `lisp-indent-offset` entry. Since you built your own Hy layer, it doesn’t know what to use. 
> 
> **Fix:** explicitly tell Emacs how to indent Hy. In your Hy major mode hook (or your layer’s `packages.el`), set something like:
> 
> ```elisp
> (defun my-hy-mode-setup ()
>  ;; Tell copilot.el what to use for indentation
>  (setq-local tab-width 2)
>  (setq-local indent-tabs-mode nil)
>  ;; For Lisp-y indentation
>  (setq-local lisp-indent-offset 2))
> 
> (add-hook 'hy-mode-hook #'my-hy-mode-setup)
> ```
> 
> This will give Copilot a mode-specific indentation offset so it stops complaining. 
> If your Hy mode inherits from `python-mode`, you could also alias the offset from `python-indent-offset`:
> 
> ```elisp
> (put 'hy-mode 'copilot-indentation-offset 'python-indent-offset)
> ```
> 
> ---
> 
> ### 2. `flycheck: Syntax checker lsp reported too many errors (685)`
> That’s Flycheck saying “the LSP backend dumped an overwhelming number of diagnostics, so I gave up.” 
> This usually happens with modes that don’t have a proper LSP backend (or when the backend misinterprets the file). With Hy, `lsp-mode` often treats it as Python and fails hard.
> 
> **Options:**
> - **Raise the threshold:** 
>  ```elisp
>  (setq flycheck-checker-error-threshold 2000)
>  ```
> - **Disable LSP for Hy files:** 
>  ```elisp
>  (add-hook 'hy-mode-hook (lambda () (setq-local lsp-diagnostics-provider :none)))
>  ```
> - **Fallback to basic syntax checking** instead of LSP:
>  ```elisp
>  (with-eval-after-load 'flycheck
>  (flycheck-define-checker hy
>  "Hy syntax checker."
>  :command ("hy" "-c" source-original)
>  :error-patterns
>  ((error line-start (file-name) ":" line ":" (message) line-end))
>  :modes hy-mode)
>  (add-to-list 'flycheck-checkers 'hy))
>  ```
> 
> ---
> 
> ✅ In short:
> - Teach Copilot what indentation Hy uses → silence the first warning. 
> - Either disable LSP diagnostics for Hy or give Flycheck a lightweight checker → stop the flood of errors. 
> 
> Do you want me to help you wire **Hy mode → Copilot indentation offset** so it just “inherits” from `python-indent-offset` instead of setting it manually? That would keep it consistent with the rest of your Python tooling.
<!-- UID: d0004560-918a-4ffb-8262-6d6e2b966076 -->

---




>[!nexus_user] **User** - 08/24/2025 at 2:51 PM
> Copilot hates lisp, it gives the same indentation errors for elisp too
<!-- UID: 464ceff8-de84-4533-bb38-d72417438ae2 -->




>[!nexus_agent] **Assistant** - 08/24/2025 at 2:51 PM
> yeah, Copilot.el kind of bounces off anything “Lispy.” you can fix it globally so it stops nagging in Emacs Lisp, Hy, Scheme, Clojure, etc.
> 
> ### Quick fix (set sane Lispy indents per mode)
> Drop this into your private layer or `.spacemacs`:
> 
> ```elisp
> (defun my-lispish-indent-setup ()
>  ;; common, harmless defaults Copilot can read
>  (setq-local lisp-body-indent (or (and (numberp lisp-body-indent) lisp-body-indent) 2))
>  (setq-local standard-indent (or (and (numberp standard-indent) standard-indent) 2))
>  (setq-local tab-width (or (and (numberp tab-width) tab-width) 2))
>  (setq-local indent-tabs-mode nil))
> 
> (dolist (m '(emacs-lisp-mode lisp-mode lisp-interaction-mode scheme-mode clojure-mode hy-mode))
>  (add-hook (intern (format "%s-hook" m)) #'my-lispish-indent-setup))
> ```
> 
> That gives Copilot a mode‑local “indentation offset” to chew on, which usually silences the warning.
> 
> ---
> 
> ### Robust fix (teach Copilot a fallback so it never warns)
> If you’d rather stop the warning at the source, wrap Copilot’s inference with a Lisp‑friendly fallback:
> 
> ```elisp
> (with-eval-after-load 'copilot
>  (defun my/copilot-lisp-indent-fallback ()
>  (or (and (boundp 'lisp-body-indent) (numberp lisp-body-indent) lisp-body-indent)
>  (and (boundp 'lisp-indent-offset) (numberp lisp-indent-offset) lisp-indent-offset)
>  (and (boundp 'standard-indent) (numberp standard-indent) standard-indent)
>  (and (boundp 'tab-width) (numberp tab-width) tab-width)
>  2)) ;; last‑ditch default
> 
>  (advice-add 'copilot--infer-indentation-offset :around
>  (lambda (orig &rest args)
>  (condition-case _
>  (apply orig args)
>  (warning (my/copilot-lisp-indent-fallback))
>  (error (my/copilot-lisp-indent-fallback)))))
> 
>  ;; still set sensible locals for Lispy modes
>  (dolist (m '(emacs-lisp-mode lisp-mode lisp-interaction-mode scheme-mode clojure-mode hy-mode))
>  (add-hook (intern (format "%s-hook" m))
>  (lambda ()
>  (setq-local lisp-body-indent (or (and (numberp lisp-body-indent) lisp-body-indent) 2))
>  (setq-local standard-indent (or (and (numberp standard-indent) standard-indent) 2))
>  (setq-local tab-width (or (and (numberp tab-width) tab-width) 2))
>  (setq-local indent-tabs-mode nil)))))
> ```
> 
> This keeps you future‑proof: if Copilot can’t find a mode‑specific offset, it quietly falls back to `lisp-body-indent/standard-indent/tab-width` (in that order) instead of yelling.
> 
> ---
> 
> If you want, we can also scope this so **Hy** inherits from Python when present (use `python-indent-offset`) but otherwise uses the Lisp fallback.
<!-- UID: ff5a646e-2253-4dd0-9c48-874a4f7e24fd -->

---


