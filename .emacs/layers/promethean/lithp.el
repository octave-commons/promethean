;;; sibilant.el --- Promethean support for Sibilant DSL -*- lexical-binding: t -*-

(use-package lithp-mode
  :mode ("\\.lithp\\'" "\\.lith\\'" "\\.prompt\\.lithp\\'")
  :init
  (add-hook 'sibilant-mode-hook #'promethean/setup-lispy-env)
  :config
  ;; Add prompt expansions, REPL bridge, etc. later
  (define-key sibilant-mode-map (kbd "C-c C-x C-c") #'promethean/codex-complete-buffer))
(provide 'promethean-lithp)
