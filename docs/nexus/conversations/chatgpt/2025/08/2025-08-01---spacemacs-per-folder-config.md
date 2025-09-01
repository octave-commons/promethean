---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Spacemacs per-folder config"
conversation_id: 688cfb11-c4bc-8320-892f-e6bee156b151
create_time: 08/01/2025 at 12:36 PM
update_time: 08/01/2025 at 12:38 PM
---

# Title: Spacemacs per-folder config

Created: 08/01/2025 at 12:36 PM
Last Updated: 08/01/2025 at 12:38 PM
Chat URL: https://chat.openai.com/c/688cfb11-c4bc-8320-892f-e6bee156b151


>[!nexus_agent] **Assistant** - 08/01/2025 at 12:36 PM
> No, **Spacemacs does not, by default, support reading a per-folder config file** like `.dir-locals.el` automatically unless that file is explicitly present and Emacs is configured to trust it.
> 
> However, **Emacs itself _does_ support per-directory configuration** through a built-in mechanism called `dir-locals`, and Spacemacs inherits this capability.
> 
> ---
> 
> ### ✅ Supported by Emacs (and thus Spacemacs):
> 
> - **`.dir-locals.el`** 
>  You can place a `.dir-locals.el` file in any project root or subdirectory, and Emacs will use it to apply directory-specific settings such as:
> 
> ```elisp
> ((python-mode
>  (python-indent-offset . 4)
>  (fill-column . 80)))
> ```
> 
> This can be useful for setting:
> - indentation rules,
> - flycheck/flymake options,
> - project-specific variables.
> 
> ---
> 
> ### 🛡️ Security Warning
> 
> Starting with recent Emacs versions, **you'll be prompted to trust each `.dir-locals.el` file** you add (via `safe-local-variable-values`), or you can whitelist them explicitly. Spacemacs will ask when you first open a file in that folder.
> 
> ---
> 
> ### 📦 Project Management with Spacemacs
> 
> If you're using Spacemacs with the `projectile` or `lsp` layers:
> - `projectile` can auto-detect projects and cache settings,
> - You can also add project-specific configuration in something like a `~/.spacemacs.d/projects.el` and load that manually or via a hook.
> 
> But again, **this is not automatic per-folder config**—you’d need to write custom logic or hooks for that.
> 
> ---
> 
> ### 🛠️ If You Want More
> 
> If you want something like `~/.vscode/settings.json` per project:
> - Look into the [`project.el`](https://www.gnu.org/software/emacs/manual/html_node/emacs/Projects.html) integration in newer Emacs,
> - Or try a package like [`per-directory-local-vars`](https://github.com/codesuki/per-directory-local-vars.el),
> - Or write a function that loads a `.emacs-dir-config.el` when `projectile-project-root` changes.
> 
> ---
> 
> ### Example: Load `.emacs-dir-config.el` per project
> ```elisp
> (defun my/load-local-config ()
>  (let ((config (expand-file-name ".emacs-dir-config.el" (projectile-project-root))))
>  (when (file-exists-p config)
>  (load-file config))))
> 
> (add-hook 'projectile-after-switch-project-hook #'my/load-local-config)
> ```
> 
> This makes your per-folder setup a lot closer to what tools like VS Code or Doom Emacs support with `config.el`.
> 
> ---
> 
> ### TL;DR
> 
> - ✅ `.dir-locals.el` = standard way to do this in Emacs/Spacemacs
> - 🚫 No full-blown `.spacemacs`-per-folder mechanism by default
> - 🛠️ You can hack it via hooks or project-specific files if needed
> 
> Let me know if you want help writing a loader or template for this.
<!-- UID: f40f0210-15e7-4254-b77a-4c11e07a8542 -->

---




>[!nexus_user] **User** - 08/01/2025 at 12:36 PM
> Does spacemacs by default have a way to read some config file per folder?
<!-- UID: 24712494-8529-4b23-9faa-941f524f7e5f -->




>[!nexus_agent] **Assistant** - 08/01/2025 at 12:38 PM
> Not quite. `.dir-locals.el` **is a very specific structured Elisp file**, **not** arbitrary code.
> 
> It defines an **association list (alist)** that maps major modes (like `python-mode`, `emacs-lisp-mode`, `nil` for all modes, etc.) to a list of **variable bindings**. These bindings must be **safe local variables** — not arbitrary code execution.
> 
> ---
> 
> ### ❗ Why It’s Limited:
> This restriction is a **security feature**. Emacs will not evaluate arbitrary Elisp from `.dir-locals.el` because it would allow code execution just by opening a file in a directory — a major attack vector.
> 
> ---
> 
> ### ✅ Example of Valid `.dir-locals.el`:
> 
> ```elisp
> ((nil . ((fill-column . 100)
>  (indent-tabs-mode . nil)))
>  (python-mode . ((python-indent-offset . 4)))
>  (emacs-lisp-mode . ((eval . (put 'my-custom-defun 'function-documentation "My docstring.")))))
> ```
> 
> - `nil` applies to **all modes**.
> - You can use the special `eval` keyword, but only for **safe forms**, and **you will be prompted** to trust it if it’s not marked safe.
> 
> ---
> 
> ### ⚠️ What You **Can’t** Do:
> 
> You **can’t** put something like:
> 
> ```elisp
> (load "some-other-file.el") ;; ❌ Not allowed
> (run-hooks ...) ;; ❌ Not allowed
> (message "hi!") ;; ❌ Not allowed (without `eval`)
> ```
> 
> Even using `(eval ...)` doesn't give you free rein — Emacs will **warn you and ask for approval**, and some forms may be outright blocked unless you whitelist them in your config.
> 
> ---
> 
> ### 🛠️ If You *Do* Want Arbitrary Code Per Folder
> 
> Then **`.dir-locals.el` is not the right tool**. Instead:
> 
> - Use a custom hook triggered on project switch:
>  ```elisp
>  (defun my/load-project-config ()
>  (let ((config (expand-file-name ".project.el" (projectile-project-root))))
>  (when (file-exists-p config)
>  (load-file config))))
> 
>  (add-hook 'projectile-after-switch-project-hook #'my/load-project-config)
>  ```
> 
> - That `.project.el` file can contain **anything you want**, including `load-path` modifications, defuns, macros, etc.
> 
> ---
> 
> ### 🔒 Summary
> 
> | Feature | `.dir-locals.el` | Custom loader via `load-file` |
> |-------------------|--------------------------------------|------------------------------------|
> | Code execution | ❌ Not arbitrary (limited `eval`) | ✅ Arbitrary |
> | Safe by default | ✅ Yes (asks for trust) | ❌ You must secure it yourself |
> | Project-specific | ✅ Yes | ✅ Yes |
> | Good for settings | ✅ Yes | ✅ But may be overkill |
> 
> ---
> 
> Let me know if you want a `.project.el` pattern scaffolded out, or want to mix both `.dir-locals.el` and a loader. You could even chain them.
<!-- UID: ce3df3d9-05bf-452e-9ff4-42366e46aac7 -->

---




>[!nexus_user] **User** - 08/01/2025 at 12:38 PM
> ok so .dir-locals.el can just be arbitrary elisp?
<!-- UID: c0adb972-d286-48de-a8a0-bc2019f66ab4 -->


