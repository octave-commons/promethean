;; Prefer asking on active region, else whole buffer.
(setq gptel-prompt-prefix-function #'gptel-region-or-buffer)

;; Keep transcripts near the code you’re working on (adjust to taste).
(setq gptel-use-echo-area nil)  ;; use dedicated chat buffer
