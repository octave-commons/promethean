;;; funcs.el --- codex‑cli functions -*- lexical-binding: t; -*-
;;; Commentary:
;; Functions to interact with Codex CLI.

;; (require 'project)
;; (require 'cl-lib)

;; (defun codex‑cli--project-root ()
;;   "Return the root directory of the current project, or nil."
;;   (or (project-root (project-current))
;;       (locate-dominating-file default-directory ".git")
;;       default-directory))

;; (defun codex‑cli--build-command (mode prompt)
;;   "Construct codex CLI command as a string for MODE and PROMPT.
;; MODE is one of \"suggest\", \"auto-edit\", or \"full-auto\"."
;;   (format "codex --approval-mode %s %s"
;;           mode
;;           (shell-quote-argument prompt)))

;; (defun codex‑cli‑send-buffer (mode)
;;   "Send the current buffer contents to Codex CLI with MODE.
;; MODE is e.g. \"suggest\", \"auto-edit\", or \"full-auto\"."
;;   (let* ((root (codex‑cli--project-root))
;;          (prompt (read-string "Prompt for Codex: "))
;;          (cmd (codex‑cli--build-command mode prompt))
;;          (buff (current-buffer))
;;          (file (buffer-file-name buff)))
;;     (unless file
;;       (error "Buffer is not visiting a file"))
;;     (let ((default-directory root))
;;       (async-shell-command
;;        (concat cmd " <" (shell-quote-argument file))
;;        "*Codex CLI Output*" "*Codex CLI Error*"))))

;; (defun codex‑cli‑suggest-current ()
;;   "Run Codex CLI in suggest mode on current file."
;;   (interactive)
;;   (codex‑cli‑send-buffer "suggest"))

;; (defun codex‑cli‑auto‑edit-current ()
;;   "Run Codex CLI in auto-edit mode on current file."
;;   (interactive)
;;   (codex‑cli‑send-buffer "auto-edit"))

;; (defun codex‑cli-full‑auto‑current ()
;;   "Run Codex CLI in full-auto mode on current file."
;;   (interactive)
;;   (codex‑cli‑send-buffer "full-auto"))
;;; funcs.el ends here
;;; funcs.el --- codex layer
(require 'json)
(require 'subr-x)
;; Needed for cl-labels and seq-filter
(require 'cl-lib)
(require 'seq)

(defun codex--project-root ()
  (or (and (fboundp 'projectile-project-root) (projectile-project-root))
      (and (fboundp 'project-current) (when-let ((pr (project-current))) (car (project-roots pr))))
      default-directory))

(defun codex--git-branch ()
  (string-trim (or (ignore-errors (shell-command-to-string "git rev-parse --abbrev-ref HEAD")) "")))

(defun codex--git-diff-summary ()
  (let* ((cmd "git --no-pager diff --stat -- .")
         (out (ignore-errors (shell-command-to-string cmd))))
    (if (and out (> (length out) 0)) out "")))

(defun codex--flycheck-errors ()
  (when (and codex-include-flycheck-errors (bound-and-true-p flycheck-current-errors))
    (mapconcat
     (lambda (e)
       (format "%s:%d:%d: %s"
               (or (flycheck-error-filename e) (buffer-file-name))
               (flycheck-error-line e)
               (or (flycheck-error-column e) 0)
               (flycheck-error-message e)))
     flycheck-current-errors
     "\n")))

(defun codex--lsp-symbols ()
  (when (and codex-include-lsp-context
             (boundp 'lsp-mode) lsp-mode
             (fboundp 'lsp-request)
             buffer-file-name)
    (condition-case _
        (let* ((doc (lsp-request "textDocument/documentSymbol"
                                 `(:textDocument (:uri ,(concat "file://" buffer-file-name)))))
               (names (cl-labels ((grab (x) (or (alist-get 'name x)
                                                (alist-get :name x))))
                        (mapconcat #'identity (delq nil (mapcar #'grab doc)) ", "))))
          (if (and names (> (length names) 0))
              (format "LSP symbols: %s" names)
            ""))
      (error ""))))
(defun codex--buffer-chunk ()
  (let* ((sel (if (use-region-p)
                  (buffer-substring-no-properties (region-beginning) (region-end))
                (buffer-substring-no-properties (point-min) (point-max)))))
    (if (<= (string-bytes sel) codex-context-max-bytes)
        sel
      (let* ((limit codex-context-max-bytes)
             (i (min (length sel) limit)))
        ;; Decrease index until byte size fits limit
        (while (and (> i 0)
                    (> (string-bytes (substring sel 0 i)) limit))
          (setq i (1- i)))
        (substring sel 0 i)))))

(defun codex--build-prompt (kind user-prompt)
  "Build a markdown-ish prompt Codex understands well."
  (let* ((root (codex--project-root))
         (rel (when (buffer-file-name)
                (file-relative-name (buffer-file-name) root)))
         (cursor (format "Cursor: line %d, column %d"
                         (line-number-at-pos (point)) (current-column)))
         (branch (codex--git-branch))
         (diff (if codex-include-git-summary (codex--git-diff-summary) ""))
         (lsp (codex--lsp-symbols))
         (errs (codex--flycheck-errors))
         (body (codex--buffer-chunk)))
    (string-join
     (seq-filter #'identity
                 (list
                  (format "### Task: %s" kind)
                  (when user-prompt (format "#### Instruction\n%s" user-prompt))
                  "#### Editor State"
                  (format "- Project: %s" (abbreviate-file-name root))
                  (format "- File: %s" (or rel (buffer-name)))
                  (format "- Mode: %s" (symbol-name major-mode))
                  (format "- %s" cursor)
                  (when (and branch (> (length branch) 0)) (format "- Git branch: %s" branch))
                  (when (and diff (> (length diff) 0)) (concat "#### Git diff summary\n```\n" diff "\n```"))
                  (when (and lsp (> (length lsp) 0)) (concat "#### LSP\n" lsp))
                  (when (and errs (> (length errs) 0)) (concat "#### Diagnostics\n```\n" errs "\n```"))
                  "#### Current Buffer/Region\n```text"
                  body
                  "```"
                  "#### Rules"
                  "- Make minimal, targeted edits."
                  "- Explain changes if non-trivial."
                  "- Use project conventions; do not reformat unrelated code."
                  ))
     "\n\n")))

(defun codex--call (prompt &optional root)
  "Invoke codex; display output in a dedicated buffer.
If Codex proposes edits, it will typically write to files directly (with approval flow)."
  (let* ((default-directory (or root (codex--project-root)))
         (buf (get-buffer-create "*Codex*"))
         (cmd (executable-find codex-cli-executable)))
    (unless cmd
      (user-error "Cannot find codex executable; set `codex-cli-executable`"))
    (with-current-buffer buf (erase-buffer))
    (let* ((proc (start-process "codex" buf cmd)))
      ;; Feed prompt on STDIN; Codex supports “running with a prompt as input”.
      ;; (Docs show non-interactive/CI scripting and prompt-from-stdin.)  :contentReference[oaicite:4]{index=4}
      (process-send-string proc (concat prompt "\n"))
      (process-send-eof proc)
      (display-buffer buf))))

(defun codex-ask (prompt)
  "Ask Codex about the current region/buffer with a freeform prompt."
  (interactive "sCodex ask: ")
  (codex--call (codex--build-prompt "Explain/answer" prompt)))

(defun codex-fix-file ()
  "Ask Codex to fix issues in the current file."
  (interactive)
  (codex--call (codex--build-prompt "Fix the file" "Fix any issues, keep behavior, minimal diffs.")))

(defun codex-review-buffer ()
  "Ask Codex to review the current buffer."
  (interactive)
  (codex--call (codex--build-prompt "Code review" "Identify issues, suggest diffs, prioritize safety.")))

(defun codex-run-task (prompt)
  "Delegate a task to Codex with full project context."
  (interactive "sCodex task: ")
  (codex--call (codex--build-prompt "Implement task" prompt)))
