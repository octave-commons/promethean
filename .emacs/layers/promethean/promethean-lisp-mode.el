;;; promethean-lisp-mode.el --- Base mode for Promethean DSLs -*- lexical-binding: t -*-


(require 'lisp-mode)

;;; promethean-lisp-mode.el --- Base font-lock and macros for Promethean DSLs -*- lexical-binding: t -*-

;;; Commentary:
;; Shared macros and font-lock rules for Hy, Sibilant, Lithp, Prompt, etc.

;;; Code:
(require 'rx)

;; --- Syntax components ----------------------------------------------------
(defvar promethean-valid-word
  '(one-or-more (or "-" word "_" "." "*")))

(defvar promethean-word-boundary
  '(one-or-more (or "\n" whitespace)))

(defvar promethean-arg-expression
  `(group
    "(" (zero-or-more
         (or "{" "}" "[" "]" "" "," ":" "." ,promethean-valid-word "\n" whitespace)) ")"))

;; --- Rule Macro -----------------------------------------------------------
(defmacro promethean-rule (regex &rest faces)
  `(list (rx ,@regex) ,@faces))

;; --- Macro Shortcuts ------------------------------------------------------
(defmacro function-def-words (&rest names)
  `(promethean-rule
    ("(" (group (and (or ,@names) (zero-or-more ,promethean-valid-word)))
     ,promethean-word-boundary
     (group (one-or-more (or "-" word "_" ".")))
     ,promethean-word-boundary)
    '(1 font-lock-keyword-face)
    '(2 font-lock-function-name-face)))

(defmacro anonymous-expressions (&rest names)
  `(promethean-rule
    ("(" (group (and (or ,@names) (zero-or-more ,promethean-valid-word))))
    '(1 font-lock-keyword-face)))

(defmacro variable-assignment (&rest names)
  `(promethean-rule
    ("(" (group (or ,@names)) ,promethean-word-boundary (group ,promethean-valid-word))
    '(1 font-lock-keyword-face)
    '(2 font-lock-variable-name-face)))

(defmacro keywords (&rest names)
  `(promethean-rule
    ("(" (group (or ,@names)))
    '(1 font-lock-keyword-face)))

(defmacro non-expression-keywords (&rest names)
  `(promethean-rule
    (bow (group (or ,@names)))
    '(1 font-lock-keyword-face)))

;; --- List Declaration DSL -------------------------------------------------
(defmacro def-list (name &rest rules)
  `(defvar ,name (list ,@rules)))

;; --- Shared Core Font Lock Defaults ---------------------------------------
(def-list promethean-core-font-lock-defaults
          (function-def-words "def" "defn" "defmacro" "lambda" "fn")
          (keywords "if" "when" "unless" "cond" "case"
                    "return" "require" "try" "throw"
                    "and" "or" "not" "=" ">" "<" ">=" "<=" "+" "-" "*" "/"
                    "import")
          (non-expression-keywords "true" "false" "null" "None" "True" "False")
          (variable-assignment "let" "setv" "assign"))


(define-derived-mode promethean-lisp-mode lisp-mode "Promethean Lisp"
  "Base mode for Promethean dialects like Hy, Sibilant, Lithp, etc."
  (setq-local font-lock-defaults '(promethean-core-font-lock-defaults))
  (setq-local comment-start ";")
  (setq-local comment-end ""))

(provide 'promethean-lisp-mode)

;;; promethean-lisp-mode.el ends here
