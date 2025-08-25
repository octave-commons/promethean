;;; packages.el --- promethean layer packages -*- lexical-binding: t; -*-
;;; Commentary:
;; Spacemacs layer for Promethean Lisp (custom dialect). Provides a major mode
;; and lsp-mode integration. Local package `promethean-mode` lives under local/.

;;; Code:

(defconst promethean-packages
  '(
    (promethean-mode :location local)
    lsp-mode
    flycheck)
  "List of packages required by the promethean layer.")

(defun promethean/init-promethean-mode ()
  (use-package promethean-mode
    :mode ("\\.prm\\'" . promethean-mode)
    :commands (promethean-mode)
    :init
    (add-to-list 'auto-mode-alist '("\\.promethean\\'" . promethean-mode))
    :config
    ;; Start LSP automatically when available
    (add-hook 'promethean-mode-hook #'lsp-deferred)))

(defun promethean/post-init-lsp-mode ()
  (with-eval-after-load 'lsp-mode
    ;; Register a client for Promethean; replace command with your server.
    (lsp-register-client
     (make-lsp-client
      :new-connection (lsp-stdio-connection
                       (lambda ()
                         ;; Example: Node-based server
                         ;; Return a list like '("promethean-lsp" "--stdio")
                         (list "promethean-lsp" "--stdio")))
      :activation-fn (lsp-activate-on "promethean")
      :server-id 'promethean-lsp
      :priority 1
      :add-on? t))))

(defun promethean/post-init-flycheck ()
  ;; Optional: wire a custom checker later.
  ;; See flycheck-define-checker in README or funcs.el stubs.
  nil)

;;; packages.el ends here
