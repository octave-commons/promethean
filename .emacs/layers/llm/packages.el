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
     ellama
     (mcp :location (recipe :fetcher github :repo "lizqwerscott/mcp.el"))
     ;; gptel-mcp requires Emacs 30+; we load it conditionally.
     (gptel-mcp :location (recipe :fetcher github :repo "lizqwerscott/gptel-mcp.el"))
     ;; optional helper for quick lookups
     (gptel-quick :location (recipe :fetcher github :repo "karthink/gptel-quick"))
     (llm-tools :location local)


     ))

(defun llm/pre-init-gptel ()
  (with-eval-after-load 'gptel
    (define-key gptel-mode-map (kbd "C-c m") #'gptel-mcp-dispatch)

    ;; (setq gptel-model 'qwen3:8b gptel-default-mode 'org-mode)
    )
  )

(defun llm/init-llm-tools ()
  (require 'llm-tools)
  (llm-tools-setup))
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
(defun llm/post-init-ellama ()

  (with-eval-after-load 'ellama

    ;; setup key bindings
    ;; (setopt ellama-keymap-prefix "C-c e")

    ;; could be llm-openai for example
    (require 'llm-ollama)
    (setopt ellama-provider
      (make-llm-ollama
        ;; this model should be pulled to use it
        ;; value should be the same as you print in terminal during pull
        :chat-model "qwen3:8b"
        :embedding-model "nomic-embed-text"
        :default-chat-non-standard-params '(("num_ctx" . 32000))
        )
      )
    (setopt ellama-summarization-provider
      (make-llm-ollama
        :chat-model "qwen3-codex"
        :embedding-model "nomic-embed-text"
        :default-chat-non-standard-params '(("num_ctx" . 128000))
        )
      )
    (setopt ellama-coding-provider
      (make-llm-ollama
        :chat-model "gps-oss:20b"
        :embedding-model "nomic-embed-text"
        ;; :default-chat-non-standard-params '(("num_ctx" . 32768))
        )
      )
    ;; Predefined llm providers for interactive switching.
    ;; You shouldn't add ollama providers here - it can be selected interactively
    ;; without it. It is just example.

    ;; Naming new sessions with llm
    (setopt ellama-naming-provider
      (make-llm-ollama
        :chat-model "qwen3-codex"
        :embedding-model "nomic-embed-text"
        ;; :default-chat-non-standard-params '(("stop" . ("\n")))
        )
      )
    (setopt ellama-naming-scheme 'ellama-generate-name-by-llm)
    ;; Translation llm provider
    (setopt ellama-translation-provider
      (make-llm-ollama
        :chat-model "qwen3:8b"
        :embedding-model "nomic-embed-text"
        ;;:default-chat-non-standard-params '(("num_ctx" . 32768))
        )
      )
    (setopt ellama-extraction-provider (make-llm-ollama
                                         :chat-model "qwen3:8b"
                                         :embedding-model "nomic-embed-text"
                                         ;; :default-chat-non-standard-params
                                         ;; '(("num_ctx" . 32768))
                                         )
      )
    ;; customize display buffer behaviour
    ;; see ~(info "(elisp) Buffer Display Action Functions")~
    (setopt ellama-chat-display-action-function #'display-buffer-full-frame)
    (setopt ellama-instant-display-action-function #'display-buffer-at-bottom)
    ;; :config
    ;; show ellama context in header line in all buffers
    (ellama-context-header-line-global-mode +1)
    ;; show ellama session id in header line in all buffers
    (ellama-session-header-line-global-mode +1)
    ;; handle scrolling events
    (advice-add 'pixel-scroll-precision :before #'ellama-disable-scroll)
    (advice-add 'end-of-buffer :after #'ellama-enable-scroll)
    )

  )
