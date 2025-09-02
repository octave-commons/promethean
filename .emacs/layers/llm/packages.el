;;; packages.el --- llm layer packages file for Spacemacs.
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
    ;; LLM clients
    gptel          ;; chat, prompts, buffer ops
    ellama         ;; alternative client UX
    ;; MCP client(s)
    (mcp :location (recipe :fetcher github :repo "lizqwerscott/mcp.el"))
    ;; optional: gptel extras
    (gptel-quick :location (recipe :fetcher github :repo "karthink/gptel-quick"))
    (gptel-mcp :location (recipe :fetcher github :repo "lizqwerscott/gptel-mcp.el"))
    ))

(defun llm/init-gptel ()
  (use-package gptel
    :defer t
    :init
    ;; Default: talk to local Ollama. Change URL/model as you like.
    (setq gptel-default-mode 'org-mode
          gptel-model "qwen2.5-coder:7b"   ;; example
          gptel-backend
          (gptel-make-ollama "ollama"
            :host "http://localhost:11434"
            :models '( "qwen2.5-coder:7b" "qwen2.5:7b" "llama3.2:3b" )))
    :config
    ;; Handy rewrite/completion settings can be added later.
    ))

(defun llm/init-ellama ()
  (use-package ellama
    :defer t
    :init
    ;; Ellama can also target Ollama/OpenAI; configure backends here if needed.
    ;; Keep it installed so you can compare UX quickly.
    ))

(defun llm/init-mcp ()
  (use-package mcp
    :defer t
    :config (require 'mcp-hub)
    ;; Minimal example: connect to a local MCP server when needed.
    ;; See repo README for server discovery and autoconnect options.
    ;; (mcp-connect "localhost" 3333) ;; example only
    ))

(defun llm/init-gptel-quick ()
  (use-package gptel-quick
    :after gptel
    :commands (gptel-quick)))
