;;; packages.el --- ai-agent layer packages file for Spacemacs.
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
;; added to `ai-agent-packages'. Then, for each package PACKAGE:
;;
;; - If PACKAGE is not referenced by any other Spacemacs layer, define a
;;   function `ai-agent/init-PACKAGE' to load and initialize the package.

;; - Otherwise, PACKAGE is already referenced by another Spacemacs layer, so
;;   define the functions `ai-agent/pre-init-PACKAGE' and/or
;;   `ai-agent/post-init-PACKAGE' to customize the package as it is loaded.

;;; Code:

(defconst ai-agent-packages
  '(
     shell-maker
     (acp :location (recipe :fetcher github :repo "xenodium/acp.el"))
     (agent-shell :location (recipe :fetcher github :repo "xenodium/agent-shell"))
     ))

(defun ai-agent/init-shell-maker () (use-package shell-maker))
(defun ai-agent/init-acp () (use-package acp :after shell-maker))
(defun ai-agent/init-agent-shell ()
  (use-package agent-shell
    :after acp
    :commands (agent-shell-start)
    :init
    (spacemacs/declare-prefix "aa" "AI Agent")
    (spacemacs/set-leader-keys "aao" #'agent-shell-start))
  ;; (setq agent-shell-backends
  ;;   (append agent-shell-backends
  ;;     (list
  ;;       (list :id 'opencode
  ;;         :name "OpenCode"
  ;;         :command '("opencode acp" ) ; or the adapter path
  ;;         :cwd default-directory
  ;;         :environment
  ;;         (agent-shell-make-environment-variables
  ;;           :inherit-env t
  ;;           :load-env '( ".env" "~/.env"))))))

  ;; ;; Optional: set OpenCode as default when starting agent-shell
  ;; (setq agent-shell-default-backend 'opencode)
  )
;; Example: custom OpenCode backend using an ACP stdio adapter
