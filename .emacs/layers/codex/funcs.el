;;; funcs.el --- codex‑cli functions -*- lexical-binding: t; -*-
;;; Commentary:
;; Functions to interact with Codex CLI.

(require 'project)
(require 'cl-lib)

(defun codex‑cli--project-root ()
  "Return the root directory of the current project, or nil."
  (or (project-root (project-current))
      (locate-dominating-file default-directory ".git")
      default-directory))

(defun codex‑cli--build-command (mode prompt)
  "Construct codex CLI command as a string for MODE and PROMPT.
MODE is one of \"suggest\", \"auto-edit\", or \"full-auto\"."
  (format "codex --approval-mode %s %s"
          mode
          (shell-quote-argument prompt)))

(defun codex‑cli‑send-buffer (mode)
  "Send the current buffer contents to Codex CLI with MODE.
MODE is e.g. \"suggest\", \"auto-edit\", or \"full-auto\"."
  (let* ((root (codex‑cli--project-root))
         (prompt (read-string "Prompt for Codex: "))
         (cmd (codex‑cli--build-command mode prompt))
         (buff (current-buffer))
         (file (buffer-file-name buff)))
    (unless file
      (error "Buffer is not visiting a file"))
    (let ((default-directory root))
      (async-shell-command
       (concat cmd " <" (shell-quote-argument file))
       "*Codex CLI Output*" "*Codex CLI Error*"))))

(defun codex‑cli‑suggest-current ()
  "Run Codex CLI in suggest mode on current file."
  (interactive)
  (codex‑cli‑send-buffer "suggest"))

(defun codex‑cli‑auto‑edit-current ()
  "Run Codex CLI in auto-edit mode on current file."
  (interactive)
  (codex‑cli‑send-buffer "auto-edit"))

(defun codex‑cli‑full‑auto‑current ()
  "Run Codex CLI in full-auto mode on current file."
  (interactive)
  (codex‑cli‑send-buffer "full-auto"))
;;; funcs.el ends here
