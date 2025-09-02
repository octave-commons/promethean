;; Global LLM prefix
(spacemacs/declare-prefix "al" "LLM")  ;; SPC a l ...

;; Major-mode keys (e.g., in prog/text)
(dolist (mode '(prog-mode text-mode org-mode markdown-mode))
  (spacemacs/declare-prefix-for-mode mode "ml" "LLM")
  (spacemacs/set-leader-keys-for-major-mode mode
    "lc" 'gptel-send                    ;; send region/buffer
    "le" 'gptel-explain                 ;; explain code/region
    "lr" 'gptel-rewrite                 ;; rewrite selection
    "lq" 'gptel-quick))                 ;; quick popup

;; Ellama flows (optional)
(spacemacs/set-leader-keys
  "ale" 'ellama)                        ;; open ellama session

;; MCP
(spacemacs/declare-prefix "alm" "MCP")
(spacemacs/set-leader-keys
  "almc" 'mcp-connect                   ;; connect to a server
  "almd" 'mcp-disconnect
  "alml" 'mcp-list-tools)               ;; discover tools/resources
(spacemacs/set-leader-keys
  "alm" #'gptel-mcp-dispatch) ;; MCP menu inside gptel

;; Also available inside gptel buffers via C-c m
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
