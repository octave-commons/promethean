---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Configure tabs for JS/TS"
conversation_id: 688f0402-2da8-8326-8da9-a9c4cb5a9e7b
create_time: 08/03/2025 at 1:38 AM
update_time: 08/03/2025 at 1:41 AM
---

# Title: Configure tabs for JS/TS

Created: 08/03/2025 at 1:38 AM
Last Updated: 08/03/2025 at 1:41 AM
Chat URL: https://chat.openai.com/c/688f0402-2da8-8326-8da9-a9c4cb5a9e7b


>[!nexus_user] **User** - 08/03/2025 at 1:38 AM
> How do I configure my spacemacs to use tabs instead of spaces for js/ts?
<!-- UID: a14cf32a-b6be-44fc-96da-71b579542054 -->




>[!nexus_agent] **Assistant** - 08/03/2025 at 1:38 AM
> To configure Spacemacs to use **tabs instead of spaces** for JavaScript and TypeScript files, you need to set the appropriate indentation variables in a way that applies to those specific modes.
> 
> Here's how to do it:
> 
> ---
> 
> ### ✅ **Option 1: Add settings to `.spacemacs` in `dotspacemacs/user-config`**
> Open your `.spacemacs` file and find the `dotspacemacs/user-config` function, then add the following:
> 
> ```elisp
> (defun dotspacemacs/user-config ()
>  ;; Use tabs instead of spaces for JS/TS
>  (setq-default indent-tabs-mode t)
>  (add-hook 'typescript-mode-hook (lambda ()
>  (setq indent-tabs-mode t)
>  (setq tab-width 2)
>  (setq typescript-indent-level 2)))
>  (add-hook 'js-mode-hook (lambda ()
>  (setq indent-tabs-mode t)
>  (setq tab-width 2)
>  (setq js-indent-level 2)))
>  (add-hook 'rjsx-mode-hook (lambda ()
>  (setq indent-tabs-mode t)
>  (setq tab-width 2)
>  (setq js-indent-level 2)))
> )
> ```
> 
> ---
> 
> ### ✅ **Option 2: Use `.dir-locals.el` for per-project settings**
> If you want this behavior only in a specific project, create a `.dir-locals.el` file in the project root:
> 
> ```elisp
> ((typescript-mode . ((indent-tabs-mode . t)
>  (tab-width . 2)
>  (typescript-indent-level . 2)))
>  (js-mode . ((indent-tabs-mode . t)
>  (tab-width . 2)
>  (js-indent-level . 2)))
>  (rjsx-mode . ((indent-tabs-mode . t)
>  (tab-width . 2)
>  (js-indent-level . 2))))
> ```
> 
> This ensures the setting applies only to that directory.
> 
> ---
> 
> ### Optional: Enable `editorconfig` (if you’re using `.editorconfig`)
> If you have `.editorconfig` files, Spacemacs supports the `editorconfig` layer. Add this to your layers in `.spacemacs`:
> 
> ```elisp
> dotspacemacs-configuration-layers
> '(
>  editorconfig
>  ;; ... your other layers
> )
> ```
> 
> And make sure your `.editorconfig` has:
> 
> ```ini
> [*.js]
> indent_style = tab
> indent_size = 2
> 
> [*.ts]
> indent_style = tab
> indent_size = 2
> ```
> 
> ---
> 
> Would you like a toggle command to quickly switch between tabs and spaces from within Emacs?
<!-- UID: 8898731d-439a-4be2-a492-19c75ae9b18e -->

---




>[!nexus_user] **User** - 08/03/2025 at 1:40 AM
> make sure the .dir.locals.el follows this prettier.json file:
> {
> 	"$schema": "https://json.schemastore.org/prettierrc.json",
> 	"printWidth": 120,
> 	"useTabs": true,
> 	"singleQuote": true,
> 	"quoteProps": "as-needed",
> 	"trailingComma": "all",
> 	"endOfLine": "lf"
> }
<!-- UID: 5f53eacc-dc14-42b3-bdd2-f52e3739db7d -->




>[!nexus_agent] **Assistant** - 08/03/2025 at 1:40 AM
> Based on your `prettier.json`, here’s a `.dir-locals.el` that aligns with the formatting preferences you've specified — especially `"useTabs": true`, which is the most impactful for indentation:
> 
> ```elisp
> ((typescript-mode . ((indent-tabs-mode . t)
>  (tab-width . 2)
>  (typescript-indent-level . 2)
>  (fill-column . 120))) ;; aligns with printWidth
> 
>  (js-mode . ((indent-tabs-mode . t)
>  (tab-width . 2)
>  (js-indent-level . 2)
>  (fill-column . 120)))
> 
>  (rjsx-mode . ((indent-tabs-mode . t)
>  (tab-width . 2)
>  (js-indent-level . 2)
>  (fill-column . 120)))
> 
>  ;; Optional, for JSON files like prettier.json itself
>  (json-mode . ((indent-tabs-mode . nil) ;; JSON usually uses spaces
>  (tab-width . 2)
>  (js-indent-level . 2)))
> )
> ```
> 
> ### Key points:
> - `indent-tabs-mode . t` → Tabs instead of spaces
> - `tab-width . 2` → Each tab equals 2 spaces visually
> - `fill-column . 120` → Matches `"printWidth": 120` (useful for soft wrapping or formatting guides)
> - JSON typically ignores tabs in real-world tooling, so it's kept as spaces for safety.
> 
> Would you like me to auto-generate or lint your `.dir-locals.el` based on Prettier config automatically in the future?
<!-- UID: d678bbc0-3245-40b6-a93e-968717e27421 -->

---


