;;; funcs.el --- err-core layer funcs -*- lexical-binding: t; -*-

(defvar err/frame-opacity 75
  "0=transparent, 100=opaque.")

(defun err/apply-transparency (frame)
  "Apply transparency to FRAME if it's a GUI frame."
  (when (display-graphic-p frame)
    (if (>= emacs-major-version 29)
        (set-frame-parameter frame 'alpha-background err/frame-opacity)
      (set-frame-parameter frame 'alpha (cons err/frame-opacity err/frame-opacity)))))

(defun err/copilot-lisp-indent-fallback ()
  (or (and (boundp 'lisp-body-indent) (numberp lisp-body-indent) lisp-body-indent)
      (and (boundp 'lisp-indent-offset) (numberp lisp-indent-offset) lisp-indent-offset)
      (and (boundp 'standard-indent) (numberp standard-indent) standard-indent)
      (and (boundp 'tab-width) (numberp tab-width) tab-width)
      2))
;;;###autoload
(defun err/next-conflicted-file ()
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

(spacemacs/set-leader-keys "omn" #'err/next-conflicted-file)
