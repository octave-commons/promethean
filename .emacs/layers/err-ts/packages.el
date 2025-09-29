;;; packages.el --- err-ts layer packages file for Spacemacs.
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
;; added to `err-ts-packages'. Then, for each package PACKAGE:
;;
;; - If PACKAGE is not referenced by any other Spacemacs layer, define a
;;   function `err-ts/init-PACKAGE' to load and initialize the package.

;; - Otherwise, PACKAGE is already referenced by another Spacemacs layer, so
;;   define the functions `err-ts/pre-init-PACKAGE' and/or
;;   `err-ts/post-init-PACKAGE' to customize the package as it is loaded.

;;; Code:

(defconst err-ts-packages
  '(lsp-mode typescript-mode flycheck lsp-sonarlint  )
  "The list of Lisp packages required by the err-ts layer.

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
(defun err-ts/post-init-typescript-mode ()
  (with-eval-after-load 'typescript-mode
    (add-hook 'typescript-ts-mode-hook #'prettier-js-mode)
    (add-hook 'typescript-ts-mode-hook #'add-node-modules-path)

    (add-hook 'typescript-mode-hook #'prettier-js-mode)
    (add-hook 'typescript-mode-hook #'add-node-modules-path)

    )
  (with-eval-after-load 'typescript-ts-mode
    (add-hook 'typescript-ts-mode-hook #'prettier-js-mode)
    (add-hook 'typescript-ts-mode-hook #'add-node-modules-path)

    (add-hook 'typescript-mode-hook #'prettier-js-mode)
    (add-hook 'typescript-mode-hook #'add-node-modules-path)

    )
  )
(defun err-ts/post-init-lsp-mode ()
  ;; Optional: reduce trace noise when debugging

  (with-eval-after-load 'lsp-mode
    ;; (setq lsp-eslint-trace-server "off")
    ;; (setq lsp-typescript-tsserver-log 'verbose)
    ;; (setq lsp-typescript-tsserver-trace 'verbose)  ;; optional but useful
    ;; (setq lsp-eslint-run "onSave")
    ;; Always update imports when a TS/TSX file is moved/renamed via LSP
    (setq lsp-typescript-update-imports-on-file-move-enabled 'always)
    ;; other reasonable TS opts...
    (setq lsp-typescript-validate-enable t)

    (setq lsp-typescript-initialization-options
          `(:tsserver
            (:logDirectory ,(expand-file-name ".lsp-tsserver-logs" user-emacs-directory)
                           :logVerbosity "verbose")))))

(defun err-ts/post-init-web-mode ()

  (add-hook 'web-mode-hook 'prettier-js-mode)

  (eval-after-load 'web-mode
    '(add-hook 'web-mode-hook #'add-node-modules-path)))

(defun err-ts/post-init-prettier-js ())
;; (defun err-ts/post-init-flycheck ()

;;   (with-eval-after-load 'flycheck
;;     (flycheck-add-mode 'typescript-tslint 'typescript-ts-mode)
;;     (flycheck-add-mode 'javascript-eslint 'typescript-ts-mode)))
