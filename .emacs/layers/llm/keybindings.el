;;; keybindings.el --- llm layer keybindings  -*- lexical-binding: t; -*-

;; Global LLM prefix
(spacemacs/declare-prefix "al" "LLM")

;; GPTel entrypoints
(spacemacs/set-leader-keys
  "alg" #'gptel                 ;; open chat buffer
  "alq" #'gptel-quick           ;; quick popup (optional)
  "alm" #'gptel-mcp-dispatch)   ;; MCP menu inside GPTel (Emacs 30+)

;; Per-major-mode bindings (prog/text/org/markdown)
(dolist (mode '(prog-mode text-mode org-mode markdown-mode))
  (spacemacs/declare-prefix-for-mode mode "ml" "LLM")
  (spacemacs/set-leader-keys-for-major-mode mode
    "lc" #'llm/gptel-send-region-or-buffer
    "le" #'gptel-explain
    "lr" #'gptel-rewrite
    "lq" #'gptel-quick))
