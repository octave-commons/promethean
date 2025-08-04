;;; packages.el --- Promethean Layer for Lisp-like DSLs -*- lexical-binding: t -*-

(defconst promethean-packages
  '(smartparens
    rainbow-delimiters
    hy-mode
    sibilant-mode))

(defun promethean/init-smartparens () nil)
(defun promethean/init-rainbow-delimiters () nil)

(defun promethean/init-hy-mode ()
  (require 'promethean-hy (expand-file-name "hy.el" (file-name-directory load-file-name)))
)

(defun promethean/init-sibilant-mode ()
  (require 'promethean-sibilant (expand-file-name "sibilant.el" (file-name-directory load-file-name))))

(defun promethean/init-lithp-mode ()
  (require 'promethean-lithp(expand-file-name "lithp.el" (file-name-directory load-file-name))))
