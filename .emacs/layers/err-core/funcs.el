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
