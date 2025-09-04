---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Spacemacs Markdown aliases"
conversation_id: 68b5dbe1-9c1c-8329-b228-0afa4cf78da9
create_time: 09/01/2025 at 12:46 PM
update_time: 09/01/2025 at 2:06 PM
---

# Title: Spacemacs Markdown aliases

Created: 09/01/2025 at 12:46 PM
Last Updated: 09/01/2025 at 2:06 PM
Chat URL: https://chat.openai.com/c/68b5dbe1-9c1c-8329-b228-0afa4cf78da9


>[!nexus_user] **User** - 09/01/2025 at 12:46 PM
> spacemacs markdown code block aliases. spacemacs does not recognize .ts as typescript or .bb as clojure babashka
<!-- UID: 1a7dfd19-165b-447c-8ebd-66d67c3e7df4 -->




>[!nexus_agent] **Assistant** - 09/01/2025 at 12:46 PM
> ## Spacemacs: make Markdown code fences recognize `ts` and `bb`
> 
> Short version: Emacs’ `markdown-mode` only fontifies fenced blocks it knows how to map (via `markdown-code-lang-modes`). Add aliases for `ts` → TypeScript and `bb`/`babashka` → Clojure, and (optionally) ensure files with those extensions open in the right major modes.
> 
> Also: don’t put a dot in the fence label. Use ```` ```ts ````, not ```` ```.ts ````. If you’ve been using a leading dot, that’s why it didn’t work.
> 
> ### 1) Add Markdown fence aliases
> 
> Put this in your `dotspacemacs/user-config` (then `SPC f e R` to reload):
> 
> ```elisp
> ;; Native fontification for fenced blocks
> (with-eval-after-load 'markdown-mode
>  (setq markdown-fontify-code-blocks-natively t)
>  (let* ((ts-mode (cond
>  ((fboundp 'typescript-ts-mode) 'typescript-ts-mode)
>  ((fboundp 'typescript-mode) 'typescript-mode)
>  (t 'js-mode))) ;; worst-case fallback
>  (tsx-mode (cond
>  ((fboundp 'tsx-ts-mode) 'tsx-ts-mode)
>  ((fboundp 'typescript-ts-mode) 'typescript-ts-mode)
>  ((fboundp 'typescript-mode) 'typescript-mode)
>  (t ts-mode))))
>  (dolist (pair `(("ts" . ,ts-mode)
>  ("tsx" . ,tsx-mode)
>  ("bb" . clojure-mode) ;; babashka is clojure
>  ("babashka" . clojure-mode)
>  ("clj" . clojure-mode) ;; convenience
>  ("edn" . clojure-mode)))
>  (add-to-list 'markdown-code-lang-modes pair))))
> ```
> 
> Examples that should now highlight:
> 
> ````markdown
> ```ts
> export const add = (a: number, b: number) => a + b
> ```
> 
> ```bb
> #!/usr/bin/env bb
> (println "hello from babashka")
> ```
> ````
> 
> ### 2) (Optional) Make file extensions open in the right major modes
> 
> If Spacemacs isn’t already doing it, add:
> 
> ```elisp
> ;; File extension → major mode
> (add-to-list 'auto-mode-alist '("\\.bb\\'" . clojure-mode))
> ;; Prefer tree-sitter when available
> (add-to-list 'auto-mode-alist
>  (cons "\\.ts\\'"
>  (cond
>  ((fboundp 'typescript-ts-mode) 'typescript-ts-mode)
>  ((fboundp 'typescript-mode) 'typescript-mode)
>  (t 'js-mode))))
> (add-to-list 'auto-mode-alist
>  (cons "\\.tsx\\'"
>  (cond
>  ((fboundp 'tsx-ts-mode) 'tsx-ts-mode)
>  ((fboundp 'typescript-ts-mode) 'typescript-ts-mode)
>  (t 'js-mode))))
> ```
> 
> ### 3) If it still doesn’t light up
> - Verify the fence label has **no leading dot** and matches the alias exactly (`ts`, `bb`, etc.).
> - Make sure the relevant modes exist (`M-x describe-function typescript-ts-mode`). If not, install `typescript-mode` or enable tree-sitter modes.
> - `markdown-fontify-code-blocks-natively` must be `t` (the snippet above sets it).
> 
> That’s it—pragmatic and minimal, no fluff. If you want me to add more aliases (e.g., `yml` → `yaml-mode`, `sh` → `shell-script-mode`), say the word.
> 
> #spacemacs #emacs #markdown #syntaxhighlighting #typescript #babashka #clojure #dotspacemacs #elisp
<!-- UID: 0296459f-a2a2-435d-9078-318f8e0a9fa2 -->

---


