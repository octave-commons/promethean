;;; packages.el --- llm layer packages  -*- lexical-binding: t; -*-
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
;; added to `llm-packages'. Then, for each package PACKAGE:
;;
;; - If PACKAGE is not referenced by any other Spacemacs layer, define a
;;   function `llm/init-PACKAGE' to load and initialize the package.

;; - Otherwise, PACKAGE is already referenced by another Spacemacs layer, so
;;   define the functions `llm/pre-init-PACKAGE' and/or
;;   `llm/post-init-PACKAGE' to customize the package as it is loaded.

;;; Code:


(defconst llm-packages
  '(
     gptel
     (mcp :location (recipe :fetcher github :repo "lizqwerscott/mcp.el"))
     ;; gptel-mcp requires Emacs 30+; we load it conditionally.
     (gptel-mcp :location (recipe :fetcher github :repo "lizqwerscott/gptel-mcp.el"))
     ;; optional helper for quick lookups
     (gptel-quick :location (recipe :fetcher github :repo "karthink/gptel-quick"))
     ))

(defun llm/pre-init-gptel ()
  (with-eval-after-load 'gptel
    (define-key gptel-mode-map (kbd "C-c m") #'gptel-mcp-dispatch)

    ;; (setq gptel-model 'qwen3:8b gptel-default-mode 'org-mode)
    )
  )

(defun llm/init-mcp ()
  (use-package mcp
    :defer t
    :init
    ;; Optional: autostart servers once after init (see config.el for list)
    (defun llm/mcp-autostart ()
      (when (fboundp 'mcp-hub-start-all-server)
        (mcp-hub-start-all-server)))
    (add-hook 'after-init-hook #'llm/mcp-autostart)))

(defun llm/init-gptel-mcp ()
  ;; Only load bridge on Emacs 30+, otherwise skip cleanly.
  (when (>= emacs-major-version 30)

    (use-package gptel-mcp
      ;; Local-first defaults: Ollama on localhost

      :after (gptel mcp)
      :commands (gptel-mcp-dispatch)
      :init
      ;; nothing required
      :config
      ;; Also bind a convenience key in gptel buffers
      )))

(defun llm/init-gptel-quick ()
  (use-package gptel-quick
    :after gptel
    :commands (gptel-quick)))

;;; packages.el ends here
