;;; keybindings.el --- promethean layer keybindings -*- lexical-binding: t; -*-
;;; Commentary:
;; Evil leader bindings for Promethean buffers.

;;; Code:

(spacemacs/set-leader-keys-for-major-mode 'promethean-mode
  "="  'promethean-format-buffer
  "rr" 'promethean-open-repl
  ;; lsp-mode common actions
  "ld" 'lsp-find-definition
  "lD" 'lsp-find-declaration
  "lr" 'lsp-find-references
  "lh" 'lsp-describe-thing-at-point
  "la" 'lsp-execute-code-action
  "lf" 'lsp-format-buffer
  "ls" 'lsp-workspace-folders-switch
  "lR" 'lsp-restart-workspace)



;; What these bindings mean (English):
;;   Under the Promethean major mode leader (SPC m), 't' is for testing tools:
;;     - tk: flash keyword matches
;;     - tb: flash builtin matches
;;     - tc: flash constant matches
;;     - tn: flash number matches
;;     - td: flash def-head matches
;;   Run ERT suite via M-x ert RET promethean-regex-tests RET (or bind separately).

(spacemacs/set-leader-keys-for-major-mode 'promethean-mode
  "tk" #'promethean-regex-test-keywords
  "tb" #'promethean-regex-test-builtins
  "tc" #'promethean-regex-test-const
  "tn" #'promethean-regex-test-number
  "td" #'promethean-regex-test-def-name)
;;; keybindings.el ends here
