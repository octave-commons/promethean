---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Auto import in Spacemacs"
conversation_id: 68a34a31-fee0-832d-a984-7e2d1edce860
create_time: 08/18/2025 at 10:43 AM
update_time: 08/18/2025 at 10:46 AM
---

# Title: Auto import in Spacemacs

Created: 08/18/2025 at 10:43 AM
Last Updated: 08/18/2025 at 10:46 AM
Chat URL: https://chat.openai.com/c/68a34a31-fee0-832d-a984-7e2d1edce860


>[!nexus_user] **User** - 08/18/2025 at 10:43 AM
> How do I automaticly import a module under my cursor in spacemacs, like you can in vs code?
<!-- UID: 144e3ed1-1dc9-4187-b369-be1e4197d7e7 -->




>[!nexus_agent] **Assistant** - 08/18/2025 at 10:43 AM
> Yep — you can do “auto-import at point” in Spacemacs with LSP just like VS Code.
> 
> ### Quick, no-config way (works in JS/TS, Python, etc.)
> 1. Put your cursor on the unresolved symbol.
> 2. Run: `M-x lsp-execute-code-action` 
>  Pick **“Add import …”** (or **“Quick fix…” → “Add import …”**).
> 3. To clean up all imports later: `M-x lsp-organize-imports`.
> 
> > Tip: If you’re using TypeScript/JavaScript with `tsserver` (ts-ls), there’s also a bulk action that adds **all** missing imports: 
> > `M-x lsp-execute-code-action-by-kind` → `source.addMissingImports.ts`
> 
> ### Nice keybindings (drop this in `dotspacemacs/user-config`)
> ```elisp
> (with-eval-after-load 'lsp-mode
>  ;; Add all missing imports in the current file (TS/TSX/JS)
>  (defun my/ts-add-missing-imports () (interactive)
>  (lsp-execute-code-action-by-kind "source.addMissingImports.ts"))
> 
>  (dolist (mm '(typescript-ts-mode tsx-ts-mode js-ts-mode))
>  (spacemacs/set-leader-keys-for-major-mode mm
>  "ii" #'lsp-execute-code-action ;; at-point quick fix / add import
>  "im" #'my/ts-add-missing-imports ;; add ALL missing imports
>  "io" #'lsp-organize-imports))) ;; sort & remove unused
> ```
> 
> ### Sanity checks
> - Make sure LSP is running in that buffer (`M-x lsp-describe-session`) and that you’re on **ts-ls** (TypeScript) rather than the old `javascript-typescript-langserver`.
> - For tree-sitter modes, your major mode will be `typescript-ts-mode`, `tsx-ts-mode`, or `js-ts-mode` (the bindings above cover those).
> 
> If you prefer a one-key “VS Code style” feel, bind `lsp-execute-code-action` to something muscle-memory-friendly (e.g., `M-RET`) in your personal keymap.
<!-- UID: 45751c3f-78f0-42b5-983e-86e72429de39 -->

---


