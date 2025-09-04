;;; keybindings.el --- llm layer keybindings -*- lexical-binding: t; -*-

;; Global LLM prefix
(spacemacs/declare-prefix "al" "LLM")  ;; SPC a l ...

;; GPTel entrypoints
(spacemacs/set-leader-keys
  "alg" #'gptel                 ;; open chat buffer
  "alq" #'gptel-quick)          ;; quick popup (optional)

;; Ellama flows (optional)
(when (fboundp 'ellama)
  (spacemacs/set-leader-keys "ale" #'ellama)) ;; open ellama session if available

;; MCP under LLM prefix
(spacemacs/declare-prefix "alm" "MCP")
(spacemacs/set-leader-keys
  "almc" #'mcp-connect                   ;; connect to a server
  "almd" #'mcp-disconnect
  "alml" #'mcp-list-tools                ;; discover tools/resources
  "almm" #'gptel-mcp-dispatch)           ;; MCP menu inside gptel

;; Per-major-mode bindings (prog/text/org/markdown)
(dolist (mode '(prog-mode text-mode org-mode markdown-mode))
  (spacemacs/declare-prefix-for-mode mode "ml" "LLM")
  (spacemacs/set-leader-keys-for-major-mode mode
    "lc" #'llm/gptel-send-region-or-buffer
    "le" #'gptel-explain
    "lr" #'gptel-rewrite
    "lq" #'gptel-quick))

