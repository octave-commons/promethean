;;; packages.el --- err-core layer packages file for Spacemacs.
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
    company
    prettier-js
    copilot
    typescript-mode
    web-mode
    common-lisp
    ))
(defun err-core/post-init-web-mode ()

  (add-hook 'web-mode-hook 'prettier-js-mode)

  (eval-after-load 'web-mode
    '(add-hook 'web-mode-hook #'add-node-modules-path))

  )
(defun err-core/post-init-copilot ()
  (advice-add 'copilot--infer-indentation-offset :around
              (lambda (orig &rest args)
                (condition-case _
                    (apply orig args)
                  (warning (err/copilot-lisp-indent-fallback))
                  (error   (err/copilot-lisp-indent-fallback)))))
  (dolist (m '(emacs-lisp-mode lisp-mode lisp-interaction-mode scheme-mode clojure-mode hy-mode))
    (add-hook (intern (format "%s-hook" m))
              (lambda ()
                (setq-local lisp-body-indent (or (and (numberp lisp-body-indent) lisp-body-indent) 2))
                (setq-local standard-indent   (or (and (numberp standard-indent) standard-indent) 2))
                (setq-local tab-width         (or (and (numberp tab-width) tab-width) 2))
                (setq-local indent-tabs-mode nil))))
  )
(defun err-core/post-init-lsp-sonarlint ()
  (use-package lsp-sonarlint
    :after lsp-mode
    :custom
    (lsp-sonarlint-auto-download t)
    (lsp-sonarlint-enabled-analyzers '("javascript" "typescript" "python" "java" "cfamily"))))
(defun err-core/post-init-typescript-mode ()
  (add-hook 'typescript-mode-hook #'prettier-js-mode)
  (add-hook 'typescript-mode-hook #'add-node-modules-path)
  )
(defun err-core/post-init-lsp-mode ()

  (setq lsp-idle-delay 0.3
        lsp-file-watch-threshold 5000
        lsp-completion-enable-additional-text-edit nil
        lsp-typescript-tsserver-log 'verbose
        lsp-typescript-tsserver-trace 'verbose
        lsp-typescript-initialization-options
        `(:tsserver
          (:logDirectory ,(expand-file-name ".lsp-tsserver-logs" user-emacs-directory)
                         :logVerbosity "verbose")))

  (add-to-list 'lsp-disabled-clients 'semgrep-ls)
  (add-to-list 'lsp-language-id-configuration '(common-lisp-mode . "commonlisp"))
  (lsp-register-client
   (make-lsp-client :new-connection (lsp-stdio-connection (lambda () (list (expand-file-name "~/.roswell/bin/cl-lsp"))))
                    :activation-fn (lsp-activate-on "commonlisp")
                    :server-id 'cl-lsp)))

(defun err-core/post-init-common-lisp ()

  (add-hook 'common-lisp-mode-hook #'lsp) ;; or use (add-hook 'common-lisp-mode-hook #'lsp-deferred)
  (add-hook 'common-lisp-mode-hook #'flycheck-mode)
  (spacemacs/toggle-evil-safe-lisp-structural-editing-on-register-hook-common-lisp-mode)
  (let ((slime-helper (expand-file-name "~/quicklisp/slime-helper.el")))
    (when (file-exists-p slime-helper)
      (load slime-helper))))
(defun err-core/post-init-markdown-mode ()
  (setq markdown-fontify-code-blocks-natively t)
  (add-to-list 'markdown-code-lang-modes '("clj"  . clojure-mode))
  (add-to-list 'markdown-code-lang-modes '("cljs" . clojure-mode))
  (let* ((ts-mode (cond
                   ((fboundp 'typescript-ts-mode) 'typescript-ts-mode)
                   ((fboundp 'typescript-mode)    'typescript-mode)
                   (t 'js-mode)))
         (tsx-mode (cond
                    ((fboundp 'tsx-ts-mode)        'tsx-ts-mode)
                    ((fboundp 'typescript-ts-mode) 'typescript-ts-mode)
                    ((fboundp 'typescript-mode)    'typescript-mode)
                    (t ts-mode))))
    (dolist (pair `(("ts"  . ts-mode)
                    ("tsx" . tsx-mode)
                    ("bb"  . clojure-mode)
                    ("babashka" . clojure-mode)
                    ("clj" . clojure-mode)
                    ("edn" . clojure-mode)))
      (add-to-list 'markdown-code-lang-modes pair))))
(defun err-core/post-init-org ()
  (setq org-src-fontify-natively t
        org-src-tab-acts-natively t
        org-edit-src-content-indentation 0
        org-confirm-babel-evaluate nil
        org-startup-with-inline-images t
        org-babel-python-command "/home/err/.venvs/main/bin/python")
  (org-babel-do-load-languages 'org-babel-load-languages '((python . t)))
  (add-hook 'org-babel-after-execute-hook #'org-display-inline-images))

(defun err-core/post-init-flycheck ()
  (flycheck-define-checker common-lisp-sblint
    "Common Lisp linting via sblint (SBCL)."
    :command ("sblint" source-inplace)
    :error-patterns
    ((error line-start (file-name) ":" line ":" column ": " (message) line-end))
    :modes (common-lisp-mode)

    (add-to-list 'flycheck-checkers 'common-lisp-sblint)))

(defun err-core/post-init-company ())
(defun err-core/post-init-prettier-js ())
