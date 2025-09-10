---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Change ts server LSP"
conversation_id: 688d2bed-7eb4-832a-afc7-4be9ebcc7cec
create_time: 08/01/2025 at 4:04 PM
update_time: 08/16/2025 at 12:02 PM
---

# Title: Change ts server LSP

Created: 08/01/2025 at 4:04 PM
Last Updated: 08/16/2025 at 12:02 PM
Chat URL: https://chat.openai.com/c/688d2bed-7eb4-832a-afc7-4be9ebcc7cec


>[!nexus_agent] **Assistant** - 08/01/2025 at 4:04 PM
> In `lsp-mode` for Emacs, if you installed the wrong TypeScript language server (e.g. `typescript-language-server`) or it's pointing to a version you don't want, you can override it.
> 
> Here’s how to fix it:
> 
> ---
> 
> ## 🛠️ Step-by-step Fix
> 
> ### 1. **Update the path or executable manually**
> 
> If you want to set a custom executable, you can override the default like this:
> 
> ```elisp
> (setq lsp-clients-typescript-server "path/to/your/tsserver")
> ```
> 
> or if you're using `typescript-language-server` (the wrapper):
> 
> ```elisp
> (setq lsp-clients-typescript-server-args '("--tsserver-path" "/correct/path/to/tsserver"))
> ```
> 
> > If you're using `volar` or another variant, there may be other specific vars you need to tweak.
> 
> You can run this in your `dotspacemacs/user-config` section in `.spacemacs` or in your `init.el`.
> 
> ---
> 
> ### 2. **Find which one is being used**
> 
> You can confirm what path is being used right now by:
> 
> ```elisp
> M-: (executable-find "tsserver")
> ```
> 
> or checking this in `M-x lsp-describe-session` and inspecting the active workspace.
> 
> ---
> 
> ### 3. **Switching Node versions (optional)**
> 
> If you're using multiple Node.js versions via `nvm`, `fnm`, etc., ensure your Emacs environment (especially `eshell`, `vterm`, or `M-x`) picks up the right version.
> 
> Run this to see what `tsserver` it's picking up:
> 
> ```elisp
> M-x shell-command RET which tsserver RET
> ```
> 
> If it's wrong, set the correct `PATH` in `.spacemacs.env`, `.dir-locals.el`, or your shell init (`.bashrc`, `.zshrc`, etc.) and restart Emacs.
> 
> ---
> 
> ### 4. **Restart LSP**
> 
> After updating config:
> 
> ```elisp
> M-x lsp-workspace-restart
> ```
> 
> or just kill and reopen the buffer.
> 
> ---
> 
> ## 🧠 Tips
> 
> - If you're using `eglot`, the variable names will be different.
> - You can also uninstall the wrong one globally via `npm uninstall -g typescript-language-server` if you want to ensure Emacs doesn't pick it up by mistake.
> 
> ---
> 
> Let me know which server you *meant* to use (e.g., volar, tsserver, deno), and I can give you the exact config override.
<!-- UID: 5df177e2-273a-4337-98a9-a3113efd049f -->

---




>[!nexus_user] **User** - 08/01/2025 at 4:04 PM
> I installed the wrong ts server for lsp mode, how do I change it?
<!-- UID: 7e137bcd-bd23-4bc2-abf3-20f20710eec8 -->




>[!nexus_agent] **Assistant** - 08/01/2025 at 4:06 PM
> Yup — that warning is telling you the truth: `javascript-typescript-langserver` (often abbreviated `jsts-ls`) is dead. It hasn’t been maintained for years and is officially deprecated.
> 
> You almost certainly want to be using one of these instead:
> 
> ---
> 
> ## ✅ Recommended TypeScript Language Servers
> 
> | Server | Best For | Emacs LSP client symbol |
> |---------------|------------------------------------------|--------------------------|
> | `ts-ls` | Standard `tsserver` via `typescript-language-server` | `ts-ls` |
> | `deno-ls` | Projects using Deno (instead of Node) | `deno-ls` |
> | `vue-ts-ls` | Vue projects (via Volar) | `vue-ts-ls` |
> 
> For typical Node/React/TS work, you want `ts-ls`.
> 
> ---
> 
> ## 🛠 How to switch from `jsts-ls` to `ts-ls`
> 
> ### 1. **Uninstall the bad one**
> 
> ```bash
> npm uninstall -g javascript-typescript-langserver
> ```
> 
> ### 2. **Install the correct one**
> 
> ```bash
> npm install -g typescript typescript-language-server
> ```
> 
> ### 3. **Tell Emacs to use `ts-ls`**
> 
> In your `.spacemacs` or `init.el`, add:
> 
> ```elisp
> (setq lsp-disabled-clients '(jsts-ls)) ;; ensure it's off
> 
> (add-hook 'typescript-mode-hook #'lsp-deferred)
> (add-hook 'tsx-mode-hook #'lsp-deferred) ;; for TSX support if you have it
> 
> (setq lsp-clients-typescript-server "ts-ls") ;; explicitly choose ts-ls
> ```
> 
> If `ts-ls` doesn’t start by default, you can manually register it:
> 
> ```elisp
> (with-eval-after-load 'lsp-mode
>  (lsp-register-client
>  (make-lsp-client
>  :new-connection (lsp-stdio-connection '("typescript-language-server" "--stdio"))
>  :activation-fn (lsp-activate-on "typescript" "tsx" "javascript" "jsx")
>  :priority -1
>  :server-id 'ts-ls)))
> ```
> 
> ---
> 
> ## ⚠️ Bonus: if you're using Deno
> 
> For Deno projects (with `deno.json` or `import` maps), install `deno` and:
> 
> ```elisp
> (setq lsp-disabled-clients '(ts-ls))
> (setq lsp-enabled-clients '(deno-ls))
> ```
> 
> Make sure `deno` is in your PATH.
> 
> ---
> 
> ## ✅ Summary
> 
> - 🔥 Uninstall `javascript-typescript-langserver`
> - ✅ Install `typescript-language-server`
> - 🔁 Restart Emacs or your LSP session
> - ⚙️ Explicitly set the correct server (`ts-ls`) if needed
> 
> Let me know your project structure (Node? Vue? Deno?) and I’ll give you a tailored config snippet.
<!-- UID: 7bf762e3-6eaf-4dc7-87e2-1d8a4e3d903d -->

---




>[!nexus_user] **User** - 08/01/2025 at 4:06 PM
> ■ Warning (emacs): The javascript-typescript-langserver (jsts-ls) is unmaintained; it is recommended to use ts-ls or deno-ls instead.
<!-- UID: d50fd2f7-2041-4c52-a74c-69ed965a744d -->


