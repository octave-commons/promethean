---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Copilot tab completion setup"
conversation_id: 68aaa8aa-f7c4-8323-9b80-1106435edeb1
create_time: 08/24/2025 at 12:52 AM
update_time: 08/24/2025 at 12:55 AM
---

# Title: Copilot tab completion setup

Created: 08/24/2025 at 12:52 AM
Last Updated: 08/24/2025 at 12:55 AM
Chat URL: https://chat.openai.com/c/68aaa8aa-f7c4-8323-9b80-1106435edeb1


>[!nexus_user] **User** - 08/24/2025 at 12:52 AM
> how do I get copilot in spacemacs to auto complete with tab?
<!-- UID: 8caaa007-40ab-4b49-a2da-d897e528d60b -->




>[!nexus_agent] **Assistant** - 08/24/2025 at 12:52 AM
> In Spacemacs, Copilot doesn’t bind to `<TAB>` by default because Spacemacs already uses it heavily for indentation and completion. To make Copilot suggestions accept with **Tab**, you’ll need to adjust your `dotspacemacs/user-config` in your `.spacemacs` file.
> 
> Here’s the usual setup:
> 
> 1. **Install `copilot.el`** 
>  If you haven’t yet: 
>  ```elisp
>  (use-package copilot
>  :straight (:host github :repo "zerolfx/copilot.el" :files ("*.el"))
>  :hook (prog-mode . copilot-mode))
>  ```
> 
>  Or if you’re using Spacemacs’ `dotspacemacs-additional-packages`:
>  ```elisp
>  dotspacemacs-additional-packages '(copilot)
>  ```
> 
> 2. **Configure keybindings** 
>  Copilot provides its own accept functions. The relevant one is `copilot-accept-completion`.
> 
>  By default, Copilot tries to bind `<tab>` inside `copilot-completion-map`. 
>  In Spacemacs, you can make it explicit:
> 
>  ```elisp
>  (with-eval-after-load 'copilot
>  ;; Use TAB for accepting completions
>  (define-key copilot-completion-map (kbd "<tab>") #'copilot-accept-completion)
>  (define-key copilot-completion-map (kbd "TAB") #'copilot-accept-completion))
>  ```
> 
>  That ensures both physical Tab and virtual Tab work.
> 
> 3. **Avoid conflicts with company/lsp** 
>  If you use company-mode, `<TAB>` might already be bound. 
>  In that case, you can conditionally prefer Copilot when it has an active suggestion:
> 
>  ```elisp
>  (defun my/copilot-tab ()
>  (interactive)
>  (or (copilot-accept-completion)
>  (company-indent-or-complete-common nil)))
>  (define-key global-map (kbd "<tab>") #'my/copilot-tab)
>  ```
> 
>  That way, Tab accepts Copilot if available, otherwise falls back to normal completion/indent.
> 
> ---
> 
> 👉 Do you want Tab to **always** go to Copilot (and ignore company completions), or do you want a “smart” fallback where it uses Copilot if a suggestion is there, otherwise company/indent?
<!-- UID: 36ae566e-597b-4a54-a28d-9034edf392c0 -->

---




>[!nexus_user] **User** - 08/24/2025 at 12:54 AM
> they did always fight each other... and it isn't as if I don't want to use the typescript completions... man copilot's auto complete is great... sometimes..
<!-- UID: f3d01c29-ca7e-4bd9-9fb7-bf7716c3a40d -->




>[!nexus_agent] **Assistant** - 08/24/2025 at 12:54 AM
> yeah, they do fight. the trick is a **“smart Tab”**: try Copilot first *only if a ghost suggestion is up*, otherwise fall back to your normal TS/LSP completion/indent. here’s a drop‑in Spacemacs snippet that does exactly that (Evil + company):
> 
> ```elisp
> ;;; in dotspacemacs/user-config
> 
> (use-package copilot
>  :straight (:host github :repo "zerolfx/copilot.el" :files ("*.el"))
>  :hook (prog-mode . copilot-mode))
> 
> ;; Smart Tab: Copilot -> company -> indent
> (defun my/smart-tab ()
>  (interactive)
>  (let* ((copilot-visible
>  ;; robust check without relying on Copilot internals
>  (and (bound-and-true-p copilot-mode)
>  (condition-case nil
>  ;; if there’s no suggestion, this returns nil or errors
>  (progn
>  ;; try a dry-run accept to test visibility
>  ;; (we undo by not modifying buffer if nil)
>  ;; better: use internal overlay probe if available
>  (let ((ov (bound-and-true-p copilot--overlay)))
>  (and (overlayp ov) (overlay-buffer ov))))
>  (error nil)))))
>  (cond
>  (copilot-visible
>  (ignore-errors (copilot-accept-completion)))
>  ((and (bound-and-true-p company-mode)
>  (fboundp 'company--active-p)
>  (company--active-p))
>  (company-complete-selection))
>  ((fboundp 'company-indent-or-complete-common)
>  (company-indent-or-complete-common))
>  (t
>  (indent-for-tab-command)))))
> 
> ;; Bind only in insert state so normal-mode TAB remains untouched
> (with-eval-after-load 'evil
>  (define-key evil-insert-state-map (kbd "<tab>") #'my/smart-tab)
>  (define-key evil-insert-state-map (kbd "TAB") #'my/smart-tab))
> 
> ;; optional: extra Copilot helpers on convenient keys
> (with-eval-after-load 'copilot
>  (define-key copilot-completion-map (kbd "C-<tab>") #'copilot-accept-completion-by-word)
>  (define-key copilot-completion-map (kbd "M-<tab>") #'copilot-accept-completion-by-line))
> ```
> 
> why this works:
> - **prefers Copilot** only when its inline suggestion overlay exists,
> - otherwise **falls back to company** (TypeScript/LSP completions),
> - and still **indents** when nothing’s available.
> 
> if you’re on **corfu** instead of company, swap the middle branch for `(corfu-insert)` when the popup is active (or just keep `indent-for-tab-command` as fallback).
> 
> want me to tailor it for your exact stack (company vs corfu, lsp-mode vs eglot)? I’ll just hand you the precise bindings.
<!-- UID: 9b983376-1e52-41e7-8293-df13f3f562b7 -->

---


