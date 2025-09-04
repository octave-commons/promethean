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

  (with-eval-after-load 'copilot

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
                  (setq-local tab-width         (or (and (numberp tab-width) tab-width) 2)) (setq-local indent-tabs-mode nil)))))
  )
(defun err-core/post-init-lsp-sonarlint ()
  (with-eval-after-load 'lsp-sonarlint
    ;; (lsp-sonarlint-auto-download t)
    ;; (lsp-sonarlint-enabled-analyzers '("javascript" "typescript" "python" "java" "cfamily"))
    ))

(defun err-core/post-init-typescript-mode ()
  (with-eval-after-load 'typescript-mode
    (add-hook 'typescript-mode-hook #'prettier-js-mode)
    (add-hook 'typescript-mode-hook #'add-node-modules-path)))
(defun err-core/post-init-lsp-mode ()

  (with-eval-after-load 'lsp-mode
    (lsp-register-client
     (make-lsp-client :new-connection (lsp-stdio-connection (lambda () (list (expand-file-name "~/.roswell/bin/cl-lsp"))))
                      :activation-fn (lsp-activate-on "commonlisp")
                      :server-id 'cl-lsp))))

(defun err-core/post-init-common-lisp ()

  (with-eval-after-load 'lsp-mode
    (add-to-list 'lsp-language-id-configuration '(lisp-mode . "commonlisp")))

  (with-eval-after-load 'lisp-mode
    (add-hook 'lisp-mode-hook #'lsp-deferred)
    (add-hook 'lisp-mode-hook #'flycheck-mode)
    ;; Verify this toggle exists for lisp-mode; otherwise use the generic one.
    (when (fboundp
           'spacemacs/toggle-evil-safe-lisp-structural-editing-on-register-hook-lisp-mode)
      (spacemacs/toggle-evil-safe-lisp-structural-editing-on-register-hook-lisp-mode)))

  (let ((slime-helper (expand-file-name "~/quicklisp/slime-helper.el")))
    (when (file-exists-p slime-helper)
      (load slime-helper))))

;;   (with-eval-after-load 'markdown-mode
;;     (add-to-list 'auto-mode-alist '("\\.bb" . clojure-mode))

;;     (add-to-list 'auto-mode-alist '("\\.clj"  . clojure-mode))
;;     (add-to-list 'auto-mode-alist '("\\.cljs" . clojure-mode))
;;     (dolist (pair `(("\\.ts"  . typescript-mode)
;;                     ("\\.bb"  . clojure-mode)
;;                     ("\\.babashka" . clojure-mode)
;;                     ("\\.clj" . clojure-mode)
;;                     ("\\.edn" . clojure-mode)))
;;       (add-to-list 'auto-mode-alist pair))))
(defun err-core/post-init-org ()

  (with-eval-after-load 'org
    (org-babel-do-load-languages 'org-babel-load-languages '((python . t)))
    (add-hook 'org-babel-after-execute-hook #'org-display-inline-images)))

(defun err-core/post-init-flycheck ()
  (with-eval-after-load 'flycheck
    (flycheck-define-checker common-lisp-sblint
      "Common Lisp linting via sblint (SBCL)."
      :command ("sblint" source-inplace)
      :error-patterns
      ((error line-start (file-name) ":" line ":" column ": " (message) line-end))
      :modes (common-lisp-mode))
    (add-to-list 'flycheck-checkers 'common-lisp-sblint))
  )

(defun err-core/post-init-company ())
(defun err-core/post-init-prettier-js ())
