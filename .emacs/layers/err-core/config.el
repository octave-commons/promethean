;;; config.el --- err-core layer config -*- lexical-binding: t; -*-

;; --- UI ---
(setq display-line-numbers-type 'relative)
(global-display-line-numbers-mode t)

;; Apply transparency now, future frames, and defaults
(err/apply-transparency (selected-frame))
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


;; If you used quicklisp-slime-helper, this sets SLIME's path cleanly:
;; If you need to pin your Lisp explicitly (otherwise SBCL via Roswell is fine):
;; (setq inferior-lisp-program "ros -Q run")

;; (add-to-list 'lsp-disabled-clients 'semgrep-ls)

(setq org-src-fontify-natively t
      org-src-tab-acts-natively t
      org-edit-src-content-indentation 0
      ;; Confirm for unknown languages; skip prompt for ELisp/Python only
      org-confirm-babel-evaluate (lambda (lang _)
                                   (not (member lang '("emacs-lisp" "python"))))
      org-startup-with-inline-images t
      org-babel-python-command (or (and (file-executable-p "/home/err/.venvs/main/bin/python")
                                        "/home/err/.venvs/main/bin/python")
                                   (executable-find "python3")
                                   "python3"))
(setq markdown-fontify-code-blocks-natively t)

;; Ensure Python is enabled for Babel
(with-eval-after-load 'org
  (org-babel-do-load-languages 'org-babel-load-languages '((python . t))))
(setq lsp-idle-delay 0.3
      lsp-file-watch-threshold 5000
      lsp-completion-enable-additional-text-edit nil
      ;; lsp-typescript-tsserver-log 'verbose
      ;; lsp-typescript-tsserver-trace 'verbose
      ;; lsp-typescript-initialization-options
      ;; `(:tsserver
      ;;   (:logDirectory ,(expand-file-name ".lsp-tsserver-logs" user-emacs-directory)
      ;;                  :logVerbosity "verbose"))
      )

;; (spacemacs/enable-transparency)
;; (setq display-line-numbers-type 'relative)
;; (global-display-line-numbers-mode t)
;; ;; ...
;; ;; tide def func:
;; ;; flycheck
;; (global-flycheck-mode)
;; (add-hook 'after-init-hook #'global-flycheck-mode)

;; ;; company-mode
;; (global-company-mode)
;; (setq org-src-fontify-natively t   ;; colorize code in org buffers
;;       org-src-tab-acts-natively t  ;; TAB behaves like in the language mode
;;       org-edit-src-content-indentation 0)
;; (with-eval-after-load 'org
;;   (org-babel-do-load-languages
;;    'org-babel-load-languages
;;    '((python . t))))     ;; add others as you like
;; (setq org-confirm-babel-evaluate nil) ;; optional: stop asking every time
;; (setq org-startup-with-inline-images t)
;; ;; or after you run a block: M-x org-display-inline-images
;; (setq org-startup-with-inline-images t)
;; (add-hook 'org-babel-after-execute-hook 'org-display-inline-images)
;; (setq org-babel-python-command "python3 -i"
;;       org-babel-default-header-args:python '((:session . "py") (:results . "output")))
;; (setq org-babel-python-command "/home/err/.pyenv/shims/python")


;; ;; Make Org use the Python you expect (sessions & non-sessions)
;; (setq org-babel-python-command "/home/err/.venvs/main/bin/python"
;;       python-shell-interpreter "/home/err/.venvs/main/bin/python")

;; ;; Enable Python in Babel and show images inline after execution
;; (with-eval-after-load 'org
;;   (org-babel-do-load-languages 'org-babel-load-languages '((python . t))))
;; (setq org-startup-with-inline-images t)
;; (add-hook 'org-babel-after-execute-hook #'org-display-inline-images)


;; ;; Set your desired opacity once
;; (defvar my/frame-opacity 75) ;; 100 = opaque, 0 = fully transparent

;; (defun my/apply-transparency (frame)
;;   "Apply transparency to FRAME if it's a GUI frame."
;;   (when (display-graphic-p frame)
;;     (if (>= emacs-major-version 29)
;;         ;; Emacs 29+: alpha-background
;;         (set-frame-parameter frame 'alpha-background my/frame-opacity)
;;       ;; Emacs 28 and earlier: alpha (active . inactive)
;;       (set-frame-parameter frame 'alpha (cons my/frame-opacity my/frame-opacity)))))

;; ;; Apply to the current frame at startup
;; (my/apply-transparency (selected-frame))
;; (setq default-input-method "TeX")
;; ;; toggle with C-\


;; ;; Apply to all future frames (including emacsclient frames)
;; (add-hook 'after-make-frame-functions #'my/apply-transparency)

;; ;; Also set defaults so frames created before init finishes get it
;; (if (>= emacs-major-version 29)
;;     (add-to-list 'default-frame-alist `(alpha-background . ,my/frame-opacity))
;;   (add-to-list 'default-frame-alist `(alpha . (,my/frame-opacity . ,my/frame-opacity))))
;; (with-eval-after-load 'copilot
;;   (defun my/copilot-lisp-indent-fallback ()
;;     (or (and (boundp 'lisp-body-indent) (numberp lisp-body-indent) lisp-body-indent)
;;         (and (boundp 'lisp-indent-offset) (numberp lisp-indent-offset) lisp-indent-offset)
;;         (and (boundp 'standard-indent) (numberp standard-indent) standard-indent)
;;         (and (boundp 'tab-width) (numberp tab-width) tab-width)
;;         2)) ;; last‑ditch default

;;   (advice-add 'copilot--infer-indentation-offset :around
;;               (lambda (orig &rest args)
;;                 (condition-case _
;;                     (apply orig args)
;;                   (warning (my/copilot-lisp-indent-fallback))
;;                   (error   (my/copilot-lisp-indent-fallback)))))

;;   ;; still set sensible locals for Lispy modes
;;   (dolist (m '(emacs-lisp-mode lisp-mode lisp-interaction-mode scheme-mode clojure-mode hy-mode))
;;     (add-hook (intern (format "%s-hook" m))
;;               (lambda ()
;;                 (setq-local lisp-body-indent (or (and (numberp lisp-body-indent) lisp-body-indent) 2))
;;                 (setq-local standard-indent (or (and (numberp standard-indent) standard-indent) 2))
;;                 (setq-local tab-width (or (and (numberp tab-width) tab-width) 2))
;;                 (setq-local indent-tabs-mode nil)))))

;; (with-eval-after-load 'markdown-mode
;;   ;; Map fence tags to modes
;;   (add-to-list 'markdown-code-lang-modes '("clj"  . clojure-mode))
;;   (add-to-list 'markdown-code-lang-modes '("cljs" . clojure-mode)) ;; optional
;;   ;; add more aliases as needed:
;;   ;; (add-to-list 'markdown-code-lang-modes '("rkt" . scheme-mode))
;;   )
;; ;; Native fontification for fenced blocks
;; (with-eval-after-load 'markdown-mode
;;   (setq markdown-fontify-code-blocks-natively t)
;;   (let* ((ts-mode (cond
;;                    ((fboundp 'typescript-ts-mode) 'typescript-ts-mode)
;;                    ((fboundp 'typescript-mode) 'typescript-mode)
;;                    (t 'js-mode)))           ;; worst-case fallback
;;          (tsx-mode (cond
;;                     ((fboundp 'tsx-ts-mode) 'tsx-ts-mode)
;;                     ((fboundp 'typescript-ts-mode) 'typescript-ts-mode)
;;                     ((fboundp 'typescript-mode) 'typescript-mode)
;;                     (t ts-mode))))
;;     (dolist (pair `(("ts"        . ,ts-mode)
;;                     ("tsx"       . ,tsx-mode)
;;                     ("bb"        . clojure-mode)   ;; babashka is clojure
;;                     ("babashka"  . clojure-mode)
;;                     ("clj"       . clojure-mode)   ;; convenience
;;                     ("edn"       . clojure-mode)))
;;       (add-to-list 'markdown-code-lang-modes pair))))
;; (add-to-list 'auto-mode-alist '("\\.bb\\'" . clojure-mode))

;; (setq lsp-idle-delay 0.3
;;       lsp-file-watch-threshold 5000
;;       lsp-completion-enable-additional-text-edit nil)

;; ;; SonarLint client
;; (use-package lsp-sonarlint
;;   :after lsp-mode
;;   :custom
;;   (lsp-sonarlint-auto-download t)     ;; download VSCode SonarLint bundle
;;   (lsp-sonarlint-enabled-analyzers '("javascript" "typescript" "python" "java" "cfamily")))
;; (setq lsp-typescript-tsserver-log 'verbose)
;; (setq lsp-typescript-tsserver-trace 'verbose)  ;; optional but useful
;; (setq lsp-typescript-initialization-options
;;       `(:tsserver
;;         (:logDirectory ,(expand-file-name ".lsp-tsserver-logs" user-emacs-directory)
;;                        :logVerbosity "verbose")))
