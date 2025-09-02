;; Global LLM prefix
(spacemacs/declare-prefix "al" "LLM")  ;; SPC a l ...

;; GPTel common flows
(spacemacs/set-leader-keys
  "alg" 'gptel            ;; open chat buffer
  "alq" 'gptel-quick      ;; popup summarize/define at point
  )

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
