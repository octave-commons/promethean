;;; config.el --- err-core layer config -*- lexical-binding: t; -*-

;; --- UI ---

(defvar err-core/frame-opacity 75 "0=transparent, 100=opaque.")
(setq display-line-numbers-type 'relative)
(global-display-line-numbers-mode t)

;; Apply transparency now, future frames, and defaults
(err-core/apply-transparency (selected-frame))
(if (>= emacs-major-version 29)
    (add-to-list 'default-frame-alist `(alpha-background . ,err-core/frame-opacity))
  (add-to-list 'default-frame-alist `(alpha . (,err-core/frame-opacity . ,err-core/frame-opacity))))


(setq python-shell-interpreter "/home/err/.venvs/main/bin/python")

(setq read-process-output-max (* 1024 1024)) ;; 1 MiB

(setq gc-cons-threshold 100000000) ;; 100MB
