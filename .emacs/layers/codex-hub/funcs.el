(require 'subr-x)
(require 'json)

(defun codex-hub--project-root ()
  (or (and (fboundp 'projectile-project-root) (projectile-project-root))
      (and (fboundp 'project-current) (car (project-roots (project-current))))
      default-directory))

(defun codex-hub--git-branch ()
  (string-trim (or (ignore-errors (shell-command-to-string "git rev-parse --abbrev-ref HEAD")) "")))

(defun codex-hub--git-stat ()
  (string-trim (or (ignore-errors (shell-command-to-string "git --no-pager diff --stat -- .")) "")))

(defun codex-hub--git-hunks (file n)
  (let* ((cmd (format "git --no-pager diff -U%d -- %s" n (shell-quote-argument file))))
    (or (ignore-errors (shell-command-to-string cmd)) "")))

(defun codex-hub--lsp-symbols ()
  (when (and (boundp 'lsp-mode) lsp-mode (fboundp 'lsp-request) buffer-file-name)
    (condition-case _
        (let* ((resp (lsp-request "textDocument/documentSymbol"
                                  `(:textDocument (:uri ,(concat "file://" buffer-file-name)))))
               (names (mapcar (lambda (x) (or (alist-get 'name x) (alist-get :name x))) resp)))
          (string-join (delq nil names) ", "))
      (error ""))))

(defun codex-hub--flycheck ()
  (when (bound-and-true-p flycheck-current-errors)
    (mapconcat (lambda (e)
                 (format "%s:%d:%d: %s"
                         (or (flycheck-error-filename e) (buffer-file-name))
                         (flycheck-error-line e)
                         (or (flycheck-error-column e) 0)
                         (flycheck-error-message e)))
               flycheck-current-errors "\n")))

(defun codex-hub--region-or-buffer ()
  (if (use-region-p)
      (buffer-substring-no-properties (region-beginning) (region-end))
    (buffer-substring-no-properties (point-min) (point-max))))

;; cheap size estimate (≈ tokens/4)
(defun codex-hub--approx-tokens (s) (/ (max 1 (string-bytes s)) 4))

(defun codex-hub--strip-noise (txt)
  "Naive noise stripping; extend per mode."
  (let ((case-fold-search nil))
    (setq txt (replace-regexp-in-string "^\\s-*//.*$" "" txt))  ;; js/ts comments
    (setq txt (replace-regexp-in-string "/\\*\\(.\\|\n\\)*?\\*/" "" txt)) ;; block
    (replace-regexp-in-string "^[ \t]+$" "" txt)))

(defun codex-hub--summarize (txt)
  "Summarize using ellama or gptel when enabled; otherwise return input."
  (cond
   ((and codex-hub-use-ellama (fboundp 'ellama-summarize-region))
    ;; Ellama provides commands; for programmatic use, some users bind helpers.
    ;; Fallback: keep text if no API is exposed.
    txt)
   ((and codex-hub-use-gptel (fboundp 'gptel-request))
    txt)
   (t txt)))

(defun codex-hub--compact-context (txt file)
  (let* ((base (codex-hub--strip-noise txt))
         (est (codex-hub--approx-tokens base)))
    (when (> est codex-hub-token-budget)
      (setq base (codex-hub--summarize base)))
    (when (> (codex-hub--approx-tokens base) codex-hub-token-budget)
      (setq base (substring base 0 (min (length base) (* 4 codex-hub-token-budget)))))
    (let* ((hunks (when (and file (file-exists-p file))
                    (codex-hub--git-hunks file codex-hub-diff-context-lines))))
      (list :text base :hunks hunks))))

(defun codex-hub--build-prompt (role user-prompt)
  (let* ((root (codex-hub--project-root))
         (file buffer-file-name)
         (rel (when (and file (file-exists-p file))
                (file-relative-name file root)))
         (symbols (codex-hub--lsp-symbols))
         (diags (codex-hub--flycheck))
         (branch (codex-hub--git-branch))
         (stat (codex-hub--git-stat))
         (ctx (codex-hub--compact-context (codex-hub--region-or-buffer) file)))
    (string-join
     (delq nil
           (list
            (format "### Task: %s" role)
            (when user-prompt (concat "#### Instruction\n" user-prompt))
            "#### Editor State"
            (format "- Project: %s" (abbreviate-file-name root))
            (format "- File: %s" (or rel (buffer-name)))
            (format "- Mode: %s | Cursor: line %d col %d"
                    major-mode (line-number-at-pos) (current-column))
            (when (and branch (> (length branch) 0)) (format "- Git branch: %s" branch))
            (when (and stat (> (length stat) 0)) (format "#### Git stat\n```\n%s\n```" stat))
            (when (plist-get ctx :hunks) (format "#### Git hunks\n```\n%s\n```" (plist-get ctx :hunks)))
            (when (and symbols (> (length symbols) 0)) (format "#### Symbols\n%s" symbols))
            (when (and diags (> (length diags) 0)) (format "#### Diagnostics\n```\n%s\n```" diags))
            "#### Context\n```text"
            (plist-get ctx :text)
            "```"
            "#### Rules\n- Minimal, targeted edits.\n- Preserve style; no broad reformat.\n- Explain non-trivial changes."))
     "\n\n")))

(defun codex-hub--run-codex (prompt)
  (let* ((default-directory (codex-hub--project-root))
         (exe (executable-find codex-hub-codex-exe))
         (buf (get-buffer-create "*Codex*")))
    (unless exe (user-error "codex executable not found"))
    (with-current-buffer buf (erase-buffer))
    (let ((proc (start-process "codex" buf exe)))
      (process-send-string proc (concat prompt "\n"))
      (process-send-eof proc)
      (display-buffer buf))))

(defun codex-hub-task (prompt)
  (interactive "sCodex task: ")
  (codex-hub--run-codex (codex-hub--build-prompt "Implement task" prompt)))

(defun codex-hub-fix-buffer ()
  (interactive)
  (codex-hub--run-codex (codex-hub--build-prompt "Fix issues" "Fix problems; minimal diffs; keep behavior.")))

(defun codex-hub-review ()
  (interactive)
  (codex-hub--run-codex (codex-hub--build-prompt "Code review" "Audit risks; list concrete, local patches.")))
