;;; packages.el --- err-core layer packages file for Spacemacs -*- lexical-binding: t; -*-
;;
;; Copyright (c) 2012-2025 Sylvain Benner & Contributors
;;
;; Author: err <err@err-Stealth-16-AI-Studio-A1VGG>
;; URL: https://github.com/syl20bnr/spacemacs
;;
;; This file is not part of GNU Emacs.
;;
;; This program is free software; you can redistribute it and/or modify
;; it under the terms of the GNU General Public License as published by
;; the Free Software Foundation, either version 3 of the License, or
;; (at your option) any later version.
;;
;; This program is distributed in the hope that it will be useful,
;; but WITHOUT ANY WARRANTY; without even the implied warranty of
;; MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
;; GNU General Public License for more details.
;;
;; You should have received a copy of the GNU General Public License
;; along with this program.  If not, see <http://www.gnu.org/licenses/>.

;;; Commentary:

;; See the Spacemacs documentation and FAQs for instructions on how to implement
;; a new layer:
;;
;;   SPC h SPC layers RET
;;
;;
;; Briefly, each package to be installed or configured by this layer should be
;; added to `err-core-packages'. Then, for each package PACKAGE:
;;
;; - If PACKAGE is not referenced by any other Spacemacs layer, define a
;;   function `err-core/init-PACKAGE' to load and initialize the package.

;; - Otherwise, PACKAGE is already referenced by another Spacemacs layer, so
;;   define the functions `err-core/pre-init-PACKAGE' and/or
;;   `err-core/post-init-PACKAGE' to customize the package as it is loaded.

;;; Code:

;;; packages.el --- err-core layer packages  -*- lexical-binding: t; -*-
(defconst err-core-packages
  '(lsp-sonarlint
    lsp-mode
    markdown-mode
    org
    flycheck
    treesit-auto
    company
    copilot
    ))

(defun err-core/post-init-copilot ()

  (with-eval-after-load 'copilot


    (advice-add 'copilot--infer-indentation-offset :around
                (lambda (orig &rest args)
                  (condition-case _
                      (apply orig args)
                    (warning (err-core/copilot-lisp-indent-fallback))
                    (error   (err-core/copilot-lisp-indent-fallback)))))
    (dolist (m '(emacs-lisp-mode lisp-mode lisp-interaction-mode scheme-mode clojure-mode hy-mode))
      (add-hook (intern (format "%s-hook" m))
                (lambda ()
                  (setq-local lisp-body-indent (or (and (numberp lisp-body-indent) lisp-body-indent) 2))
                  (setq-local standard-indent   (or (and (numberp standard-indent) standard-indent) 2))
                  (setq-local tab-width         (or (and (numberp tab-width) tab-width) 2)) (setq-local indent-tabs-mode nil)))))
  )
(defun err-core/post-init-lsp-sonarlint ()
  (with-eval-after-load 'lsp-sonarlint
    (setq lsp-sonarlint-auto-download t)
    (setq lsp-sonarlint-enabled-analyzers '("js" "ts" "yaml" "json" "javascript" "typescript"))))


(defun err-core/post-init-lsp-mode ()
  (with-eval-after-load 'lsp-mode
    ;; Fewer edits during typing; helps on massive projects
    ;; (setq lsp-diagnostic-package :none)

    (setq lsp-log-io nil
          lsp-idle-delay 0.5
          ;; lsp-keep-workspace-alive nil
          ;; lsp-completion-provider :capf
          )
    ;; (setq lsp-completion-enable-additional-text-edit nil)

    ;; Optional: crank up logging if you’re debugging startup issues
    (setq lsp-semgrep-trace-server 'messages)
    ;; Emulate “eslint.run: onSave” (VS Code defaults to onType; that’s slow)

    ;; 1) Don’t die on slow refactors while debugging
    (setq lsp-response-timeout 30)

    ;; 2) Reduce contention: disable extra analyzers for now
    ;; (setq lsp-disabled-clients
    ;;       (append lsp-disabled-clients '(semgrep-ls sonarlint-ls)))


    ;; 3) Tame file watchers
    (setq lsp-file-watch-threshold 1500)
    (setq lsp-file-watch-ignored
          (append lsp-file-watch-ignored
                  '("[/\\\\]\\.git$" "[/\\\\]node_modules$" "[/\\\\]dist$" "[/\\\\]build$" "[/\\\\]\\.next$" "[/\\\\]\\.turbo$")))

    (add-hook 'lsp-before-initialize-hook #'promethean-lsp-load-gitignore-ignores))
  (with-eval-after-load 'lsp-mode
    (add-to-list 'lsp-language-id-configuration '(typescript-ts-mode . "typescript"))
    (add-to-list 'lsp-language-id-configuration '(tsx-ts-mode         . "typescriptreact"))
    (add-to-list 'lsp-language-id-configuration '(js-ts-mode          . "javascript"))

    (setq lsp-clients-typescript-server "typescript-language-server")
    (setq lsp-diagnostics-provider :flycheck)
    (add-hook 'lsp-mode-hook 'flycheck-mode)
    ;; Ensure ESLint is enabled for TS/TSX/JS and that monorepo roots are found
    (setq lsp-eslint-enable t
          lsp-eslint-validate '("javascript" "javascriptreact" "typescript" "typescriptreact")
          lsp-eslint-working-directories [ "auto" ]     ;; good default for monorepos
          lsp-eslint-auto-fix-on-save t
          lsp-eslint-format nil)                        ;; avoid formatter fights; change if you want ESLint formatting

    ;; Semgrep LSP knobs (defaults shown)
    (setq lsp-semgrep-languages '("typescript" "typescriptreact" "javascript")
          lsp-semgrep-server-command '("semgrep" "lsp" )
          lsp-semgrep-trace-server 'messages)  ;; set to 'verbose if you want more noise

    ;; Make sure SonarLint starts for tree-sitter modes:
    (setq lsp-sonarlint-modes-enabled '(typescript-ts-mode tsx-ts-mode js-ts-mode))

    ;; Enable TS + JS analyzers (confirm names with M-x lsp-sonarlint-available-analyzers):
    (setq lsp-sonarlint-enabled-analyzers '("javascript" "typescript" "json" "ts" "js"))

    ;; Let it fetch the official VSCode SonarLint bundle (analyzers + backend):
    (setq lsp-sonarlint-auto-download t)

    ;; Turn on logs until it works:
    (setq lsp-sonarlint-verbose-logs t
          lsp-sonarlint-show-analyzer-logs t)

    ;; Start LSP when opening TS/TSX/JS. No use-package here:
    ;; (add-hook 'typescript-ts-mode-hook #'lsp)
    ;; (add-hook 'tsx-ts-mode-hook         #'lsp)
    ;; (add-hook 'js-ts-mode-hook          #'lsp)

    (add-hook 'typescript-ts-mode-hook  'lsp-deferred)
    (add-hook 'tsx-ts-mode-hook         'lsp-deferred)
    (add-hook 'js-ts-mode-hook     'lsp-deferred)
    (add-hook 'json-ts-mode-hook   'lsp-deferred)
    (add-hook 'css-ts-mode-hook    'lsp-deferred)

    ;; Optional: if Emacs GUI loses your PATH, make sure Node is visible.
    ;; (require 'exec-path-from-shell)
    ;; (exec-path-from-shell-initialize)


    ;; ESLint LSP settings (keep it lean; expand once it’s working)
    (setq lsp-eslint-auto-fix-on-save t
          lsp-eslint-format nil                 ;; let Prettier/ts-ls handle format if desired
          lsp-eslint-working-directories '["auto"]  ;; good default for monorepos
          lsp-eslint-quiet nil)
    )
  )



(defun err-core/post-init-markdown-mode ()
  (with-eval-after-load 'markdown-mode

    (setq markdown-fontify-code-blocks-natively t)

    (dolist (pair `(("ts'"  . typescript-ts-mode)
                    ("bb'"  . clojure-ts-mode)
                    ("babashka'" . clojure-ts-mode)
                    ("clj'" . clojure-ts-mode)
                    ("cljs'" . clojure-ts-mode)
                    ("edn'" . clojure-ts-mode)
                    ("el" . elisp-mode)))
      (add-to-list 'markdown-code-lang-modes pair))))

(defun err-core/post-init-org ()
  (with-eval-after-load 'org
    (org-babel-do-load-languages 'org-babel-load-languages '((python . t)))
    (setq org-src-fontify-natively t
          org-src-tab-acts-natively t
          org-edit-src-content-indentation 0
          ;; Confirm for unknown languages; skip prompt for ELisp/Python only
          org-confirm-babel-evaluate (lambda (lang _)
                                       (not (member lang '("emacs-lisp" "python"))))
          org-startup-with-inline-images t
          org-babel-python-command (or (and (file-executable-p "/home/err/.venvs/main/bin/python")
                                            "/home/err/.venvs/main/bin/python")
                                       (executable-find "python3")
                                       "python3"))
    (org-babel-do-load-languages 'org-babel-load-languages '((python . t)))
    (add-hook 'org-babel-after-execute-hook #'org-display-inline-images)))

(defun err-core/post-init-company ()
  (with-eval-after-load 'company
    (global-company-mode 1)))
(defun err-core/post-init-flycheck ()

  (with-eval-after-load 'flycheck
    (add-hook 'after-init-hook #'global-flycheck-mode)
    (global-flycheck-mode 1)))

(defun err-core/init-treesit-auto ()
  ;; Auto-install grammars on demand & use -ts modes when available.
  (use-package treesit-auto
    :ensure t
    :custom
    (treesit-auto-install 'prompt)     ;; or 't to auto-install silently
    :config
    (treesit-auto-add-to-auto-mode-alist 'all)
    (global-treesit-auto-mode))

  ;; Prefer native TS modes over legacy ones.
  (setq major-mode-remap-alist
        '((js-mode . js-ts-mode)
          (typescript-mode . typescript-ts-mode)
          (tsx-ts-mode . tsx-ts-mode)  ;; if you have it
          (json-mode . json-ts-mode)
          (css-mode . css-ts-mode)
          (c-mode . c-ts-mode)
          (c++-mode . c++-ts-mode)
          (python-mode . python-ts-mode)
          (yaml-mode . yaml-ts-mode))))

;;; packages.el ends here
