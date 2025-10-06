;;; packages.el --- err-commonlisp layer packages file for Spacemacs -*- lexical-binding: t; -*-
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
;; added to `err-commonlisp-packages'. Then, for each package PACKAGE:
;;
;; - If PACKAGE is not referenced by any other Spacemacs layer, define a
;;   function `err-commonlisp/init-PACKAGE' to load and initialize the package.

;; - Otherwise, PACKAGE is already referenced by another Spacemacs layer, so
;;   define the functions `err-commonlisp/pre-init-PACKAGE' and/or
;;   `err-commonlisp/post-init-PACKAGE' to customize the package as it is loaded.

;;; Code:

(defconst err-commonlisp-packages
  '(lsp-mode flycheck lisp-mode)
  "The list of Lisp packages required by the err-commonlisp layer.

Each entry is either:

1. A symbol, which is interpreted as a package to be installed, or

2. A list of the form (PACKAGE KEYS...), where PACKAGE is the
    name of the package to be installed or loaded, and KEYS are
    any number of keyword-value-pairs.

    The following keys are accepted:

    - :excluded (t or nil): Prevent the package from being loaded
      if value is non-nil

    - :location: Specify a custom installation location.
      The following values are legal:

      - The symbol `elpa' (default) means PACKAGE will be
        installed using the Emacs package manager.

      - The symbol `local' directs Spacemacs to load the file at
        `./local/PACKAGE/PACKAGE.el'

      - A list beginning with the symbol `recipe' is a melpa
        recipe.  See: https://github.com/milkypostman/melpa#recipe-format")

(defcustom err-commonlisp-cl-lsp-executable
  (or (executable-find "cl-lsp")
      (expand-file-name "~/.roswell/bin/cl-lsp"))
  "Path to the cl-lsp executable used for Common Lisp LSP support."
  :type 'file
  :group 'err-commonlisp)

(defun err-commonlisp/post-init-lsp-mode ()
  (with-eval-after-load 'lsp-mode
    (setq lsp-language-id-configuration
          (assq-delete-all 'lisp-mode lsp-language-id-configuration))
    (push '(lisp-mode . "commonlisp") lsp-language-id-configuration)
    (lsp-register-client
     (make-lsp-client
      :new-connection
      (lsp-stdio-connection (lambda () (list (expand-file-name err-commonlisp-cl-lsp-executable))))
      :activation-fn (lsp-activate-on "commonlisp")
      :server-id 'cl-lsp
      :major-modes '(lisp-mode)))))
(defun err-commonlisp/post-init-lisp-mode ()

  (with-eval-after-load 'lisp-mode
    (add-hook 'lisp-mode-hook #'lsp-deferred)
    (add-hook 'lisp-mode-hook #'flycheck-mode)
    ;; Verify this toggle exists for lisp-mode; otherwise use the generic one.
    (when (fboundp 'spacemacs/toggle-evil-safe-lisp-structural-editing-on-register-hook-lisp-mode)
      (spacemacs/toggle-evil-safe-lisp-structural-editing-on-register-hook-lisp-mode))
    (let ((slime-helper (expand-file-name "~/quicklisp/slime-helper.el")))
      (when (file-exists-p slime-helper)
        (load slime-helper)))
    )

  )
(defun err-core/post-init-flycheck ()
  (with-eval-after-load 'flycheck
    (flycheck-define-checker common-lisp-sblint
      "Common Lisp linting via sblint (SBCL)."
      :command ("sblint" source-inplace)
      :error-patterns
      ((error line-start (file-name) ":" line ":" column ": " (message) line-end))
      :modes (common-lisp-mode))
    (add-to-list 'flycheck-checkers 'common-lisp-sblint)))

;;; packages.el ends here
