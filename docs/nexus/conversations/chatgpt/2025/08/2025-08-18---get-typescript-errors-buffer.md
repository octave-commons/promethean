---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Get TypeScript errors buffer"
conversation_id: 68a344d8-1708-8328-9153-8df999c0ca6e
create_time: 08/18/2025 at 10:20 AM
update_time: 08/18/2025 at 10:27 AM
---

# Title: Get TypeScript errors buffer

Created: 08/18/2025 at 10:20 AM
Last Updated: 08/18/2025 at 10:27 AM
Chat URL: https://chat.openai.com/c/68a344d8-1708-8328-9153-8df999c0ca6e


>[!nexus_user] **User** - 08/18/2025 at 10:20 AM
> How do i get a buffer containing all the typescript errors in a file in spacemacs?
<!-- UID: aeb51515-a1d8-400e-bf76-fe6ceb147cff -->




>[!nexus_agent] **Assistant** - 08/18/2025 at 10:20 AM
> Quickest way:
> 
> - **Per-file list (Flycheck):** `M-x flycheck-list-errors` 
>  (Spacemacs also binds this under the errors prefix: **`SPC e l`**. Default Flycheck keys: **`C-c ! l`**.) 
>  This opens `*Flycheck errors*` with all TypeScript diagnostics for the current buffer; `RET` jumps to the location, `n`/`p` move between entries.
> 
> Useful alternatives (depending on your backend):
> 
> - **Project-wide (LSP):** `M-x lsp-treemacs-errors-list` — sidebar of all diagnostics; you can focus it to the current file and jump around.
> - **If you’re on Eglot/Flymake instead of lsp-mode/Flycheck:** `M-x flymake-show-buffer-diagnostics` (or `…-project-diagnostics`).
> 
> Tips:
> - Make sure you have the `syntax-checking` layer enabled so Flycheck is on.
> - If you only want *errors* (not warnings), in the errors buffer run: `M-x customize-variable RET flycheck-error-list-minimum-level` → set to `error`.
<!-- UID: 0d219b48-26ed-44b1-bb8b-22a97168ba12 -->

---


