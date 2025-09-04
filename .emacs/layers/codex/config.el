;;; config.el --- codex layer
(defvar codex-cli-executable "codex"
  "Path to the Codex CLI binary.")

(defvar codex-context-max-bytes (* 512 1024)
  "Cap the bytes of buffer/region sent to Codex (def: 512KB).")

(defvar codex-include-lsp-context t)
(defvar codex-include-flycheck-errors t)
(defvar codex-include-git-summary t)
(defvar codex-noninteractive t
  "If non-nil, use non-interactive/CI-style invocation suitable for scripting.")
