---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Prettier configuration fix"
conversation_id: 689f64d5-f278-8320-825e-f1b61a9d108e
create_time: 08/15/2025 at 11:48 AM
update_time: 08/15/2025 at 11:52 AM
---

# Title: Prettier configuration fix

Created: 08/15/2025 at 11:48 AM
Last Updated: 08/15/2025 at 11:52 AM
Chat URL: https://chat.openai.com/c/689f64d5-f278-8320-825e-f1b61a9d108e


>[!nexus_user] **User** - 08/15/2025 at 11:48 AM
> my pre commit hook is applying different indentation rules to my ts/js than my emacs is.
<!-- UID: aa324513-15dd-429b-b639-0a44f4419d89 -->




>[!nexus_agent] **Assistant** - 08/15/2025 at 11:48 AM
> Yep—classic “two formatters, two opinions.” Let’s make one source-of-truth (Prettier) and force everything else to obey it.
> 
> ## Quick fix path
> 
> 1) **Pick Prettier as the formatter**
> - Create `prettier.config.cjs` at repo root:
> ```js
> /** @type {import("prettier").Config} */
> module.exports = {
>  tabWidth: 2, // or your number
>  useTabs: false, // true if you want tabs
>  semi: true,
>  singleQuote: true,
>  trailingComma: "all",
>  printWidth: 100,
> };
> ```
> 
> 2) **Disable ESLint’s stylistic rules**
> - In your ESLint config, extend Prettier last:
> ```js
> extends: [
>  "eslint:recommended",
>  "plugin:@typescript-eslint/recommended",
>  "plugin:import/recommended",
>  // ...
>  "prettier" // keeps ESLint from fighting Prettier
> ]
> ```
> - If you have `indent` or related style rules enabled (or `@typescript-eslint/indent`), turn them off.
> 
> 3) **Make the pre-commit hook run Prettier (and ESLint only for --fixable non-style)**
> - **Husky + lint-staged** example:
> ```json
> {
>  "lint-staged": {
>  "**/*.{js,jsx,ts,tsx,json,md,css,html}": [
>  "prettier --write"
>  ],
>  "**/*.{js,jsx,ts,tsx}": [
>  "eslint --fix"
>  ]
>  }
> }
> ```
> - **pre-commit (Python)** example in `.pre-commit-config.yaml`:
> ```yaml
> repos:
>  - repo: https://github.com/pre-commit/mirrors-prettier
>  rev: v3.3.3
>  hooks:
>  - id: prettier
>  - repo: https://github.com/pre-commit/mirrors-eslint
>  rev: v9.9.0
>  hooks:
>  - id: eslint
>  args: [--fix]
> ```
> Pin versions to avoid drift.
> 
> 4) **Ensure Emacs uses the project’s local Prettier**
> Pick one of these:
> 
> - **apheleia** (rock-solid, fast):
> ```elisp
> (use-package apheleia
>  :ensure t
>  :config
>  ;; Use project local prettier via npx
>  (setf (alist-get 'prettier apheleia-formatters)
>  '("npx" "prettier" "--stdin-filepath" filepath))
>  (add-to-list 'apheleia-mode-alist '(typescript-ts-mode . prettier))
>  (add-to-list 'apheleia-mode-alist '(tsx-ts-mode . prettier))
>  (add-to-list 'apheleia-mode-alist '(js-mode . prettier))
>  (apheleia-global-mode +1))
> ```
> 
> - **prettier-js**:
> ```elisp
> (use-package prettier-js
>  :ensure t
>  :hook ((js-mode typescript-ts-mode tsx-ts-mode) . prettier-js-mode)
>  :config
>  (setq prettier-js-command "npx"
>  prettier-js-args '("prettier" "--stdin-filepath" buffer-file-name)))
> ```
> 
> Also make sure Emacs can see local binaries:
> ```elisp
> (use-package add-node-modules-path
>  :ensure t
>  :hook ((js-mode tsx-ts-mode typescript-ts-mode) . add-node-modules-path))
> ```
> 
> 5) **(Optional) .editorconfig to keep modes from “helpfully” reindenting**
> ```ini
> root = true
> 
> [*]
> indent_style = space
> indent_size = 2
> end_of_line = lf
> charset = utf-8
> trim_trailing_whitespace = true
> insert_final_newline = true
> ```
> Enable `editorconfig-mode` in Emacs so major modes align with Prettier’s tabWidth/useTabs.
> 
> 6) **Tame Emacs’ built-in indentation (if you’re still seeing fights)**
> ```elisp
> (setq-default indent-tabs-mode nil
>  js-indent-level 2)
> (with-eval-after-load 'typescript-ts-mode
>  (setq typescript-ts-mode-indent-offset 2))
> ```
> (If you use tabs, flip accordingly.)
> 
> ## Sanity checks (run these once)
> 
> - What formats on commit?
>  - `git config core.hooksPath` (Husky?) 
>  - `.pre-commit-config.yaml` present? (Python pre-commit?)
> 
> - Does Prettier see your config?
>  - `npx prettier --log-level debug --check path/to/file.ts`
> 
> - Which Prettier does Emacs call?
>  - In Emacs: `M-: (executable-find "prettier")` 
>  If it’s not your project’s, the `npx` wrapper above fixes it.
> 
> - Is ESLint actually deferring to Prettier?
>  - `npx eslint --print-config path/to/file.ts | jq .rules.indent` 
>  Should be `off` (or absent).
> 
> Once these are aligned, Emacs and the pre-commit hook will produce identical formatting. If you want, paste your `.pre-commit-config.yaml` (or Husky hook), `prettier.config.*`, and ESLint config and I’ll spot any edge cases.
<!-- UID: 0401326c-13f5-4a73-855d-d01222b0787a -->

---


