;;; config.el --- err-core layer config -*- lexical-binding: t; -*-

;; --- UI ---
(setq display-line-numbers-type 'relative)
(global-display-line-numbers-mode t)

;; Apply transparency now, future frames, and defaults
(err/apply-transparency (selected-frame))
(add-hook 'after-make-frame-functions #'err/apply-transparency)
(if (>= emacs-major-version 29)
    (add-to-list 'default-frame-alist `(alpha-background . ,err/frame-opacity))
  (add-to-list 'default-frame-alist `(alpha . (,err/frame-opacity . ,err/frame-opacity))))

;; Input method
(setq default-input-method "TeX")  ;; toggle with C-\

;; --- Editing / check / completion ---
;; Do NOT re-declare packages; just configure their globals.
;; (Let Spacemacs layers pull them in; we only toggle behavior.)
(with-eval-after-load 'flycheck
  (global-flycheck-mode 1))
(add-hook 'after-init-hook #'global-flycheck-mode)

(with-eval-after-load 'company
  (global-company-mode 1))


;; Also align inferior python shell
(setq python-shell-interpreter "/home/err/.venvs/main/bin/python")

;; --- Markdown fenced code mapping ---
(add-to-list 'auto-mode-alist '("\\.bb\\'" . clojure-mode))


;; If you used quicklisp-slime-helper, this sets SLIME's path cleanly:
;; If you need to pin your Lisp explicitly (otherwise SBCL via Roswell is fine):
;; (setq inferior-lisp-program "ros -Q run")
