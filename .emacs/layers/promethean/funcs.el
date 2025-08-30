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
;;; promethean-lsp-ignore.el --- derive lsp ignore regexps from .gitignore -*- lexical-binding: t; -*-


(defun promethean--project-root ()
  "Find project root by .git, falling back to vc-root-dir."
  (or (locate-dominating-file default-directory ".git")
      (vc-root-dir)
      (user-error "Can't find project root (.git) from %s" default-directory)))

(defun promethean--gitglob-to-dir-regex (glob)
  "Convert a Git ignore GLOB (directory-ish) to an LSP directory regexp string.

- Returns nil if GLOB looks like a file pattern (no trailing slash and contains a dot with no wildcard).
- Translates * -> \".*\", ? -> \".\"
- Anchors like LSP defaults: start with \"/\" and end with \"\\\\'\"."
  (let* ((g (string-trim glob)))
    ;; Skip obvious files (heuristic): no trailing slash AND contains a dot without wildcards.
    (when (or (string-suffix-p "/" g)
              (not (and (string-match-p "\\." g)
                        (not (string-match-p "[*?]" g)))))
      ;; Drop trailing slash (we always target dirs)
      (setq g (string-remove-suffix "/" g))
      ;; Remove leading "./"
      (setq g (string-remove-prefix "./" g))
      ;; Treat "**/foo" same as "foo"
      (setq g (replace-regexp-in-string "\\`\\*\\*/" "" g))
      ;; Escape regex metachars except * and ?
      (let ((escaped (replace-regexp-in-string
                      "\\([.^$+(){}\\[\\]|]\\)" "\\\\\\1" g)))
        ;; Convert globs
        (setq escaped (replace-regexp-in-string "\\*" ".*" escaped))
        (setq escaped (replace-regexp-in-string "\\?" "." escaped))
        ;; If it contains a slash, keep only the last path segment (LSP list matches dir names)
        (let* ((seg (car (last (split-string escaped "/" t)))))
          (when (and seg (not (string-empty-p seg)))
            (concat "/" seg "\\'")))))))

(defun promethean-lsp-gitignore-dir-regexes (&optional root)
  "Return a list of LSP-style directory regexes derived from ROOT/.gitignore.
Only directory patterns are converted."
  (let* ((proj (file-name-as-directory (or root (promethean--project-root))))
         (gi (expand-file-name ".gitignore" proj)))
    (unless (file-readable-p gi)
      (user-error "No readable .gitignore at %s" gi))
    (with-temp-buffer
      (insert-file-contents gi)
      (let (out)
        (dolist (line (split-string (buffer-string) "\n"))
          (setq line (string-trim line))
          (cond
           ((or (string-empty-p line)
                (string-prefix-p "#" line)) nil)            ; comment/blank
           ((string-prefix-p "!" line) nil)                 ; negations not supported here
           (t
            (let ((rx (promethean--gitglob-to-dir-regex line)))
              (when rx (push rx out))))))
        (nreverse (delete-dups out))))))

;;;###autoload
(defun promethean-lsp-append-gitignore-to-ignored-dirs (&optional root)
  "Append .gitignore-derived directory regexes to `lsp-file-watch-ignored-directories'.
Does NOT overwrite lsp defaults."
  (interactive)
  (let* ((extra (promethean-lsp-gitignore-dir-regexes root))
         (current (if (local-variable-p 'lsp-file-watch-ignored-directories)
                      lsp-file-watch-ignored-directories
                    (default-value 'lsp-file-watch-ignored-directories)))
         (merged (cl-remove-duplicates (append current extra) :test #'string=)))
    ;; Make it buffer-local so you can vary per project/buffer; use setq-default if you want global.
    (setq-local lsp-file-watch-ignored-directories merged)
    (message "lsp-file-watch-ignored-directories: +%d (total %d)"
             (length extra) (length merged))
    merged))
