(defun run-hy-buffer ()
  "Evaluate the current Hy buffer using the system hy interpreter."
  (interactive)
  (save-buffer)
  (shell-command (format "hy %s" (shell-quote-argument (buffer-file-name)))))
