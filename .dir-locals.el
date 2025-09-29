(;; (typescript-ts-mode . ((typescript-indent-level . 2)
 ;;                     (fill-column . 120)
 ;;                     ;; (lsp-typescript-tsdk
 ;;                     ;;  (list (expand-file-name "node_modules/typescript-5-4/lib"
 ;;                     ;;                          (project-root (project-current t)))))
 ;;                     )) ;; aligns with printWidth

 ;; (js-mode . ((js-indent-level . 2)
 ;;             (fill-column . 120)))

 ;; (rjsx-mode . ((js-indent-level . 1)
 ;;               (fill-column . 120)))

 ;; ;; Optional, for JSON files like prettier.json itself
 ;; (json-mode . ((indent-tabs-mode . nil) ;; JSON usually uses spaces
 ;;               (tab-width . 2)
 ;;               (js-indent-level . 2)))
 (nil . ((prom/unique-doc-format . "%Y.%m.%d.%H.%M.%S")
         (prom/unique-default-dir . "docs/unique")
         (prom/unique-mode-targets .
                                   ((markdown-mode :dir "docs/inbox" :ext ".md")
                                    (org-mode :dir "docs/inbox" :ext ".org")
                                    (text-mode :dir "docs/text" :ext ".txt")
                                    (js-mode :dir "pseudo/inbox" :ext ".js")
                                    (typescript-ts-mode :dir "pseudo/inbox" :ext ".ts")))

         (lsp-enable-file-watchers . t)      ;; keep watchers on, but…
         (lsp-file-watch-threshold . 1500)   ;; avoid nag; tune if needed
         (eval . (promethean-lsp-append-gitignore-to-ignored-dirs)))))
