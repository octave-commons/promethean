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

;; --- Org / Babel / Python ---
(with-eval-after-load 'org
  (setq org-src-fontify-natively t
        org-src-tab-acts-natively t
        org-edit-src-content-indentation 0
        org-confirm-babel-evaluate nil
        org-startup-with-inline-images t
        org-babel-python-command "/home/err/.venvs/main/bin/python")
  (org-babel-do-load-languages
   'org-babel-load-languages '((python . t)))
  (add-hook 'org-babel-after-execute-hook #'org-display-inline-images))

;; Also align inferior python shell
(setq python-shell-interpreter "/home/err/.venvs/main/bin/python")

;; --- Markdown fenced code mapping ---
(with-eval-after-load 'markdown-mode
  (setq markdown-fontify-code-blocks-natively t)
  (add-to-list 'markdown-code-lang-modes '("clj"  . clojure-mode))
  (add-to-list 'markdown-code-lang-modes '("cljs" . clojure-mode))
  (let* ((ts-mode (cond
                   ((fboundp 'typescript-ts-mode) 'typescript-ts-mode)
                   ((fboundp 'typescript-mode)    'typescript-mode)
                   (t 'js-mode)))
         (tsx-mode (cond
                    ((fboundp 'tsx-ts-mode)        'tsx-ts-mode)
                    ((fboundp 'typescript-ts-mode) 'typescript-ts-mode)
                    ((fboundp 'typescript-mode)    'typescript-mode)
                    (t ts-mode))))
    (dolist (pair `(("ts"  . ,ts-mode)
                    ("tsx" . ,tsx-mode)
                    ("bb"  . clojure-mode)
                    ("babashka" . clojure-mode)
                    ("clj" . clojure-mode)
                    ("edn" . clojure-mode)))
      (add-to-list 'markdown-code-lang-modes pair))))
(add-to-list 'auto-mode-alist '("\\.bb\\'" . clojure-mode))

;; --- LSP tuning + TS server logging ---
(with-eval-after-load 'lsp-mode
  (setq lsp-idle-delay 0.3
        lsp-file-watch-threshold 5000
        lsp-completion-enable-additional-text-edit nil))

(with-eval-after-load 'lsp-mode
  (setq lsp-typescript-tsserver-log 'verbose
        lsp-typescript-tsserver-trace 'verbose
        lsp-typescript-initialization-options
        `(:tsserver
          (:logDirectory ,(expand-file-name ".lsp-tsserver-logs" user-emacs-directory)
                         :logVerbosity "verbose"))))

;; --- Copilot indentation guardrails for Lisps ---
(with-eval-after-load 'copilot
  (advice-add 'copilot--infer-indentation-offset :around
              (lambda (orig &rest args)
                (condition-case _
                    (apply orig args)
                  (warning (err/copilot-lisp-indent-fallback))
                  (error   (err/copilot-lisp-indent-fallback)))))
  (dolist (m '(emacs-lisp-mode lisp-mode lisp-interaction-mode scheme-mode clojure-mode hy-mode))
    (add-hook (intern (format "%s-hook" m))
              (lambda ()
                (setq-local lisp-body-indent (or (and (numberp lisp-body-indent) lisp-body-indent) 2))
                (setq-local standard-indent   (or (and (numberp standard-indent) standard-indent) 2))
                (setq-local tab-width         (or (and (numberp tab-width) tab-width) 2))
                (setq-local indent-tabs-mode nil)))))
