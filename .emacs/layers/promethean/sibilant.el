(require 'promethean-lisp-mode)
(def-list sibilant-font-lock-defaults



          ;;base
          (function-def-words  "macro" "def" )

          ;;added
          (function-def-words "function" "fn" "method" "mth" "gmth")

          ;;base
          (anonymous-expressions  "lambda" "#"  )

          ;; added
          (anonymous-expressions "=>" "let" "let*")

          ;; Sibilant comes with these
          (variable-assignment "var" "get" "set" "assign")

          ;; I added these ones

          (variable-assignment "let" "|>" "#->"
                               "of"
                               "mth" "gmth"
                               "getter" "gett" "setter" "sett"
                               "alias" "module" "exports" "methods"  "from"
                               "type" "specify" "const" "where" "default")

          ;; (generic-combinators "generic" )

          ;; base keywords
          (keywords

           ;;comparsion
           "if" "unless" "when" "ternary"

           "this" "console" "pipe"  "#>"
           "return"

           ;; module system
           "require" "include" "import-namespace" "namespace"
           ;; error handling
           "try" "throw"
           ;; comparison operators
           "="  ">" "<" ">=" "<=" "instanceof"
           ;; Numeric operators
           "+" "-" "*" "/"
           ;; logical operators
           "and" "not" "or")
          ;; These are keywords because I added them to the language
          (keywords "literal"
                    "catch" ">>" "is" "then"
                    "on" "once"
                    ;; object operators
                    "create" "extend"

                    "print" "maybe" ".then" ".catch" )

          (non-expression-keywords "true" "false" "this")

          ;; any expression that does not match a rule will have
          ;; its first element highlighted

          (rule ("(" (zero-or-more (or "\n" whitespace))
                 (group (one-or-more (or "-" word "_" ".")))
                 (zero-or-more (or "\n" whitespace)))

                '(1 font-lock-variable-name-face))
          )

;;;###autoload
(define-derived-mode promethean-sibilant-mode promethean-lisp-mode "SibilantJS"
  "Major mode for editing Sibilant code."
  (setq font-lock-defaults '(sibilant-font-lock-defaults))
  (setq-local comment-start ";"))

(add-hook 'promethean-sibilant-mode-hook #'promethean/setup-lispy-env)

(add-to-list 'auto-mode-alist '("\\.lith\\'" . promethean-sibilant-mode))
(add-to-list 'auto-mode-alist '("\\.sibilant\\'" . promethean-sibilant-mode))
(add-to-list 'auto-mode-alist '("\\.prompt\\.sibilant\\'" . promethean-sibilant-mode))


(provide 'promethean-sibilant-mode)
