;;; funcs.el --- err-core layer funcs -*- lexical-binding: t; -*-

(require 'cl-lib)
(require 'subr-x)

(defun err-core/apply-transparency (frame)
  "Apply transparency to FRAME if it's a GUI frame."
  (when (display-graphic-p frame)
    (if (>= emacs-major-version 29)
        (set-frame-parameter frame 'alpha-background err-core/frame-opacity)
      (set-frame-parameter frame 'alpha (cons err-core/frame-opacity err-core/frame-opacity)))))

(defun err-core/copilot-lisp-indent-fallback ()
  (or (and (boundp 'lisp-body-indent) (numberp lisp-body-indent) lisp-body-indent)
      (and (boundp 'lisp-indent-offset) (numberp lisp-indent-offset) lisp-indent-offset)
      (and (boundp 'standard-indent) (numberp standard-indent) standard-indent)
      (and (boundp 'tab-width) (numberp tab-width) tab-width)
      2))
;;;###autoload
(defun err-core/next-conflicted-file ()
  "Visit the next conflicted file in the repo (no smerge state needed)."
  (interactive)
  (let* ((default-directory (or (ignore-errors (magit-toplevel)) default-directory))
         (files (split-string
                 (shell-command-to-string "git diff --name-only --diff-filter=U --relative")
                 "\n" t))
         (buf (buffer-file-name))
         (idx (cl-position buf files :test #'string=)))
    (cond
     ((null files) (message "No conflicted files."))
     ((null idx)   (find-file (car files)))
     ((= idx (1- (length files))) (message "At last conflicted file."))
     (t (find-file (nth (1+ idx) files))))))

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
;;;###autoload
(defun promethean-lsp-load-gitignore-ignores (&optional project-root)
  "Merge .gitignore dirs into `lsp-file-watch-ignored-directories` for this project root."
  (let* ((root (or project-root (lsp-workspace-root) default-directory))
         (extra (promethean-lsp-gitignore-dir-regexes root))
         (base (default-value 'lsp-file-watch-ignored-directories))
         (merged (cl-remove-duplicates (append base extra) :test #'string=)))
    (setq-local lsp-file-watch-ignored-directories merged)
    (message "Added %d .gitignore paths to lsp ignore (total: %d)"
             (length extra) (length merged))))

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
                (string-prefix-p "#" line)) nil) ; comment/blank
           ((string-prefix-p "!" line) nil) ; negations not supported here
           (t
            (let ((rx (promethean--gitglob-to-dir-regex line)))
              (when rx (push rx out))))))
        (nreverse (delete-dups out))))))

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
