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

;;; packages.el --- opencode-agent-shell layer

(defconst opencode-agent-shell-packages
  '(
     ;; agent-shell deps
     (shell-maker :location (recipe (:fetcher github :repo "xenodium/shell-maker")))
     (acp          :location (recipe (:fetcher github :repo "xenodium/acp.el")))
     (agent-shell  :location (recipe (:fetcher github :repo "xenodium/agent-shell")))
     ))

(defun opencode-agent-shell/init-shell-maker ()
  (use-package shell-maker :defer t))

(defun opencode-agent-shell/init-acp ()
  ;; Emacs ≥30 supports :vc/:url directly, but Spacemacs’ recipe works well too.
  (use-package acp :defer t))

(defun opencode-agent-shell/init-agent-shell ()
  (use-package agent-shell
    :commands (agent-shell opencode/agent-shell)
    :init
    (require 'acp) ;; required before we construct the client
    ;; --- user-tweakables (Customize group defined below) ---
    (defgroup opencode-agent-shell nil
      "Run agent-shell with OpenCode ACP by default."
      :group 'tools)

    (defcustom opencode-agent-shell-command "opencode-acp"
      "Executable for the OpenCode ACP adapter (in $PATH)."
      :type 'string :group 'opencode-agent-shell)

    (defcustom opencode-agent-shell-env
      ;; Inherit PATH, HOME, etc., but let users extend/override via Customize.
      (when (fboundp 'agent-shell-make-environment-variables)
        (agent-shell-make-environment-variables :inherit-env t))
      "Environment variables passed to the OpenCode agent process."
      :type '(repeat string) :group 'opencode-agent-shell)

    (defun opencode-agent-shell--make-client ()
      "Return an ACP client for OpenCode."
      (acp-make-client
        :command opencode-agent-shell-command
        :environment-variables opencode-agent-shell-env))

    (defun opencode/agent-shell (&optional force-new)
      "Start/reuse an agent-shell session backed by OpenCode (C-u to force new)."
      (interactive "P")
      (let ((client (opencode-agent-shell--make-client)))
        ;; agent-shell provides a unified entry; when available, prefer it.
        (cond
          ;; Newer agent-shell (preferred) – accepts a plist for startup args.
          ((fboundp 'agent-shell-start)
            (agent-shell-start
              :client client
              :display-name "OpenCode"
              :force-new (when force-new t)))
          ;; Fallback: just call the generic command; user can pick manually.
          (t
            (call-interactively 'agent-shell)))))

    ;; Make OpenCode the default choice in the unified picker.
    ;; agent-shell exposes `agent-shell-agent-configs`; we feed it a minimal
    ;; entry so `M-x agent-shell` goes straight to OpenCode unless prefixed.
    (with-eval-after-load 'agent-shell
      (when (boundp 'agent-shell-agent-configs)
        (setq agent-shell-agent-configs
          (list (list :name "OpenCode"
                  :start-fn #'opencode/agent-shell
                  :reusable t)))))

    :config
    ;; Leader: SPC a o a  → OpenCode agent-shell
    (when (fboundp 'spacemacs/set-leader-keys)
      (spacemacs/set-leader-keys
        "aoa" #'opencode/agent-shell))))
