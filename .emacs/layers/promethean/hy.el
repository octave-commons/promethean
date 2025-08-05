;;; hy.el --- Promethean support for Hy Lisp -*- lexical-binding: t -*-

(require 'promethean-lisp-mode)


(define-derived-mode promethean-hy-mode promethean-lisp-mode "Hy"
  "Major mode for editing Hy code."
  (setq-local font-lock-defaults '((promethean-core-font-lock-defaults))))

(add-to-list 'auto-mode-alist '("\\.hy\\'" . promethean-hy-mode))

(provide 'promethean-hy-mode)
