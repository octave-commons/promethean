;;; packages.el --- Promethean Layer for Lisp-like DSLs -*- lexical-binding: t -*-

(defconst promethean-packages
  '(
    company
    promethean-hy-mode
    promethean-sibilant-mode
    promethean-lisp-mode
    ))
(defvar promethean--layer-dir
  (file-name-directory (or load-file-name buffer-file-name)))

(add-to-list 'load-path promethean--layer-dir)

(defun promethean/init-promethean-lisp-mode ()
  (load (expand-file-name "promethean-lisp-mode.el" promethean--layer-dir)))
(defun promethean/init-promethean-hy-mode ()
  (load (expand-file-name "hy.el" promethean--layer-dir)))
(defun promethean/init-promethean-sibilant-mode ()
  (load (expand-file-name "sibilant.el" promethean--layer-dir)))

;;; packages.el ends here
