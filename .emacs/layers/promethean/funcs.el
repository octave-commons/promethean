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

(defun promethean/codex-complete-at-point ()
  "Use codex CLI to generate completion at point for the current buffer.
The language passed to codex is inferred from the major mode."
  (interactive)
  (let* ((tmpfile (make-temp-file "codex-input-" nil ".txt"))
         (outputfile (make-temp-file "codex-output-" nil ".txt"))
         (lang (cond
                ((derived-mode-p 'python-mode) "python")
                ((derived-mode-p 'typescript-mode) "typescript")
                ((derived-mode-p 'js-mode 'js2-mode) "javascript")
                ((derived-mode-p 'promethean-hy-mode) "hy")
                (t "text")))
         (code (buffer-substring-no-properties (point-min) (point))))
    (with-temp-file tmpfile (insert code))
    (shell-command
     (format "codex complete --language %s --output %s %s"
             lang
             (shell-quote-argument outputfile)
             (shell-quote-argument tmpfile)))
    (when (file-exists-p outputfile)
      (insert-file-contents outputfile)
      (delete-file outputfile))
    (delete-file tmpfile)))

(defun promethean/add-codex-completion ()
  "Bind `promethean/codex-complete-at-point' to a convenient key."
  (local-set-key (kbd "C-c TAB") #'promethean/codex-complete-at-point))
