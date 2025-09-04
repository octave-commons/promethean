;;; keybindings.el --- codex layer
(spacemacs/declare-prefix "ax" "codex")
(spacemacs/set-leader-keys
  "axa" #'codex-ask
  "axf" #'codex-fix-file
  "axr" #'codex-review-buffer
  "axt" #'codex-run-task)
