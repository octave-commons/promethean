;;; funcs.el --- Shared helpers for Promethean Layer

(defun promethean/setup-lispy-env ()
  (smartparens-strict-mode 1)
  (rainbow-delimiters-mode 1)
  (electric-pair-mode -1)
  (company-mode 1))

(defun promethean/codex-complete-buffer ()
  "Run codex-cli on the current buffer and insert completion."
  (interactive)
  (let* ((tmpfile (make-temp-file "codex-input-" nil ".txt"))
         (outputfile (make-temp-file "codex-output-" nil ".txt"))
         (code (buffer-substring-no-properties (point-min) (point-max))))
    (with-temp-file tmpfile (insert code))
    (shell-command (format "codex complete --output %s %s" outputfile tmpfile))
    (when (file-exists-p outputfile)
      (insert-file-contents outputfile)
      (delete-file outputfile))
    (delete-file tmpfile)))
