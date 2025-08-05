;;; hy.el --- Promethean support for Hy Lisp -*- lexical-binding: t -*-

(require 'promethean-lisp-mode)
(require 'lsp-mode)
(require 'company)

(define-derived-mode promethean-hy-mode promethean-lisp-mode "Hy"
  "Major mode for editing Hy code."
  (setq-local font-lock-defaults '((promethean-core-font-lock-defaults))))

(add-hook 'promethean-hy-mode-hook #'promethean/setup-lispy-env)

(add-to-list 'auto-mode-alist '("\\.hy\\'" . promethean-hy-mode))

(with-eval-after-load 'lsp-mode
  (add-to-list 'lsp-language-id-configuration '(promethean-hy-mode . "hy"))
  (lsp-register-client
   (make-lsp-client
    :new-connection (lsp-stdio-connection '("hyls"))
    :major-modes '(promethean-hy-mode)
    :server-id 'hyls)))

(add-hook 'promethean-hy-mode-hook #'lsp-deferred)
(add-hook 'promethean-hy-mode-hook #'company-mode)

(provide 'promethean-hy-mode)
