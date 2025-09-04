(defun run-hy-buffer ()
  "Evaluate the current Hy buffer using the system hy interpreter."
  (interactive)
  (save-buffer)
  (shell-command (format "hy %s" (shell-quote-argument (buffer-file-name)))))

(dolist (hook '(python-mode-hook typescript-mode-hook js-mode-hook js2-mode-hook promethean-hy-mode-hook))
  (add-hook hook #'promethean/add-codex-completion))

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
