;;; hy.el --- Promethean support for Hy Lisp -*- lexical-binding: t -*-

(use-package hy-mode
  :mode ("\\.hy\\'" . hy-mode)
  :init
  (add-hook 'hy-mode-hook #'promethean/setup-lispy-env)
  :config
  (defun promethean/run-hy-buffer ()
    "Evaluate the current buffer using the Hy interpreter."
    (interactive)
    (save-buffer)
    (shell-command (format "hy %s" (shell-quote-argument (buffer-file-name)))))

  (define-key hy-mode-map (kbd "C-c C-c") #'promethean/run-hy-buffer)
  (define-key hy-mode-map (kbd "C-c C-x C-c") #'promethean/codex-complete-buffer))
(provide 'promethean-hy)
