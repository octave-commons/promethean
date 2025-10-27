;;; packages.el --- opencode-agent-shell layer -*- lexical-binding: t; -*-
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

(defconst opencode-agent-shell-packages
  '(
     shell-maker
     (acp :location (recipe :fetcher github
                      :repo "xenodium/acp.el"
                      ))      ;; we use :vc in init below
     (agent-shell :location (recipe
                              :fetcher github
                              :repo "xenodium/agent-shell"
                              ))))

(defun opencode-agent-shell/init-shell-maker ()
  (use-package shell-maker
    :ensure t
    :defer t))

(defun opencode-agent-shell/init-acp ()
  ;; Install from source with :vc (per upstream README).
  (use-package acp
    :defer t))

(defun opencode-agent-shell/init-agent-shell ()
  ;; Install from source with :vc (per upstream README).
  (use-package agent-shell
    :commands (agent-shell opencode-agent-shell/start)
    :init
    ;; Leader key: SPC a a  => start OpenCode (ACP)
    (with-eval-after-load 'spacemacs-defaults
      (spacemacs/set-leader-keys "aa" #'opencode-agent-shell/start))
    :config
    ;; --- Provider: OpenCode (ACP) -----------------------------------------
    ;;
    ;; Prefer `opencode acp` (built-in ACP server). Fallback to legacy
    ;; `opencode-acp` adapter if found in PATH.
    ;;

    ;; Minimal env passthrough. Inherit PATH, etc.
    (defvar opencode-agent-shell-environment
      (when (fboundp 'agent-shell-make-environment-variables)
        (agent-shell-make-environment-variables :inherit-env t))
      "Environment variables for the spawned OpenCode agent.")

    ;; Register an entry in `agent-shell-agent-configs` so M-x agent-shell
    ;; shows “OpenCode (ACP)” — and make it the default/first option.
    ;;
    ;; NOTE: `agent-shell-agent-configs` is an alist used by agent-shell.
    ;; Upstream reserves the right to tweak keys; if that happens, inspect
    ;; M-x `describe-variable` on `agent-shell-agent-configs` and adjust.
    (with-eval-after-load 'agent-shell
      )

    ))
