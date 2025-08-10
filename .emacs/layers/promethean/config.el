(defun run-hy-buffer ()
  "Evaluate the current Hy buffer using the system hy interpreter."
  (interactive)
  (save-buffer)
  (shell-command (format "hy %s" (shell-quote-argument (buffer-file-name)))))

(dolist (hook '(python-mode-hook typescript-mode-hook js-mode-hook js2-mode-hook promethean-hy-mode-hook))
  (add-hook hook #'promethean/add-codex-completion))
