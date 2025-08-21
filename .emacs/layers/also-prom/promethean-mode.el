;;; promethean-mode.el --- Major mode for Promethean Lisp -*- lexical-binding: t; -*-
;;; Commentary:
;; Minimal major mode with clear, English-documented regexes for font-lock and basics.

;;; Code:

(require 'rx)

(defgroup promethean nil
  "Promethean Lisp mode."
  :group 'languages)

(defconst promethean--keywords
  '("def" "defun" "lambda" "let" "let*" "if" "cond" "case" "match" "fn"
    "import" "export" "module" "macro" "quote" "quasiquote" "unquote" "splice")
  "Reserved special forms and keywords.")

(defconst promethean--builtins
  '("+" "-" "*" "/" "=" "not" "and" "or" "car" "cdr" "cons" "list" "map" "reduce")
  "Core built-ins/operators.")

;; ─────────────────────────────────────────────────────────────────────────────
;; Regexes with English explanations
;; ─────────────────────────────────────────────────────────────────────────────

;; What this means:
;;   Match any of the known keywords as a complete symbol, not as a prefix of a
;;   longer symbol. Example match:  `(def foo)`. Non-match: `(definitely x)`.
(defconst promethean--re-keywords
  (regexp-opt promethean--keywords 'symbols)
  "Regex for keywords as full symbols (via `regexp-opt`).")

;; What this means:
;;   Match any of the known built-in names/operators as full symbols.
;;   Example match: `(+ x 1)`. Non-match: `(++ x)`.
(defconst promethean--re-builtins
  (regexp-opt promethean--builtins 'symbols)
  "Regex for builtins as full symbols (via `regexp-opt`).")

;; What this means:
;;   Match Promethean boolean/constant symbols exactly: :true, :false, or :nil.
;;   Examples: `:true`, `:nil`. Non-match: `truely`, `:nilpotent`.
(defconst promethean--re-const
  (rx symbol-start (or ":true" ":false" ":nil") symbol-end)
  "Regex for constants: :true, :false, :nil.")

;; What this means:
;;   Match integer or simple decimal numbers as standalone symbols.
;;   Optional leading '-'. Requires digits, optional '.' and more digits.
;;   Examples: `-42`, `3.14`, `0`. Non-matches: `3.14.15`, `-`.
(defconst promethean--re-number
  (rx symbol-start
      (? "-")
      (+ digit)
      (? "." (* digit))
      symbol-end)
  "Regex for integers/decimals with optional leading '-'.")

;; What this means:
;;   Match a definition head: an opening paren, the word 'defun' or 'def',
;;   spaces, then the function/var NAME (captured), followed by optional spaces.
;;   We capture:
;;     group 1 -> the defining keyword ('defun'|'def')
///    group 2 -> the defined name (letters, digits, and - _ ! ? / :)
;;   Examples: `(defun greet-user name)`, `(def my-var 10)`.
;;   Non-match: `(define x)` (different keyword), `(defun)` (no name).
(defconst promethean--re-def-name
  (rx "("
      (group (or "defun" "def"))
      (+ space)
      (group (+ (or word "-" "_" "!" "?" "/" ":")))
      (* space))
  "Regex for (defun|def NAME ...) with captures for keyword and name.")

;; ─────────────────────────────────────────────────────────────────────────────
;; Font-lock
;; ─────────────────────────────────────────────────────────────────────────────

(defconst promethean-font-lock
  `(
    (,promethean--re-keywords . font-lock-keyword-face)
    (,promethean--re-builtins . font-lock-builtin-face)
    (,promethean--re-const    . font-lock-constant-face)
    (,promethean--re-number   . font-lock-number-face)
    ;; Capture 1: keyword, Capture 2: function/var name
    (,promethean--re-def-name
     (1 font-lock-keyword-face)
     (2 font-lock-function-name-face))
    )
  "Font-lock rules for `promethean-mode' using documented regexes.")

;; ─────────────────────────────────────────────────────────────────────────────
;; Syntax table
;; ─────────────────────────────────────────────────────────────────────────────

(defvar promethean-mode-syntax-table
  (let ((st (make-syntax-table)))
    ;; Lisp parentheses
    (modify-syntax-entry ?\( "()" st)
    (modify-syntax-entry ?\) ")(" st)
    ;; Strings
    (modify-syntax-entry ?\" "\"" st)
    ;; Line comments with ';'
    (modify-syntax-entry ?\; "<" st)
    (modify-syntax-entry ?\n ">" st)
    ;; Allow common symbol constituents
    (modify-syntax-entry ?- "w" st)
    (modify-syntax-entry ?_ "w" st)
    (modify-syntax-entry ?: "w" st)
    (modify-syntax-entry ?/ "w" st)
    (modify-syntax-entry ?! "w" st)
    (modify-syntax-entry ?? "w" st)
    st)
  "Syntax table for `promethean-mode'.")

;; ─────────────────────────────────────────────────────────────────────────────
;; Indentation (naive placeholder)
;; ─────────────────────────────────────────────────────────────────────────────

(defun promethean--indent-line ()
  "Naive indentation: indent by paren depth. Replace with a smarter algorithm."
  (let* ((pos (- (point) (line-beginning-position))))
    (save-excursion
      (back-to-indentation)
      (let* ((ppss (syntax-ppss))
             (depth (nth 0 ppss)))
        (indent-line-to (max 0 (* 2 depth)))))
    (when (> pos 0) (goto-char (+ (line-beginning-position) pos)))))

;; ─────────────────────────────────────────────────────────────────────────────
;; Imenu
;; ─────────────────────────────────────────────────────────────────────────────

;; What this means:
;;   For imenu, capture NAME in forms like: (defun NAME ...) or (def NAME ...).
;;   Group 1 is the symbol name to index.
(defvar promethean-imenu-generic-expression
  `((nil ,(rx "(" (or "defun" "def") (+ space) (group (+ (or word "-" "_" "!" "?" "/" ":")))) 1))
  "Imenu definitions for `promethean-mode' (captures definition names).")

;; ─────────────────────────────────────────────────────────────────────────────
;; Mode definition
;; ─────────────────────────────────────────────────────────────────────────────

;;;###autoload
(define-derived-mode promethean-mode prog-mode "Promethean"
  "Major mode for editing Promethean Lisp."
  :syntax-table promethean-mode-syntax-table
  (setq-local font-lock-defaults '(promethean-font-lock))
  (setq-local comment-start ";")
  (setq-local comment-end "")
  (setq-local indent-line-function #'promethean--indent-line)
  (setq-local imenu-generic-expression promethean-imenu-generic-expression)
  ;; lsp-mode language id (paired with layer config)
  (setq-local lsp-language-id "promethean"))

(provide 'promethean-mode)
;;; promethean-mode.el ends here
