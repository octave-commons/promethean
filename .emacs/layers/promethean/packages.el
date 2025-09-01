;;; packages.el --- Promethean Layer for Lisp-like DSLs -*- lexical-binding: t -*-

(defconst promethean-packages
  '(
    smartparens
    rainbow-delimiters
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

(defun promethean-setup ()
  ;; Tell copilot.el what to use for indentation
  (setq-local tab-width 2)
  (setq-local indent-tabs-mode nil)
  ;; For Lisp-y indentation
  (setq-local lisp-indent-offset 2)

  (setq flycheck-checker-error-threshold 2000)

  (add-hook 'hy-mode-hook #'my-hy-mode-setup)
  (add-hook 'hy-mode-hook (lambda () (setq-local lsp-diagnostics-provider :none)))

  (setq flycheck-checker-error-threshold 2000)
  (add-hook 'sibilant-mode-hook (lambda () (setq-local lsp-diagnostics-provider :none)))

  (with-eval-after-load 'flycheck
    (flycheck-define-checker hy
      "Hy syntax checker."
      :command ("hy" "-c" source-original)
      :error-patterns
      ((error line-start (file-name) ":" line ":" (message) line-end))
      :modes hy-mode)
    (add-to-list 'flycheck-checkers 'hy))
  )
