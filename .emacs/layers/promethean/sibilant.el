(require 'promethean-lisp-mode)
(def-list sibilant-font-lock-keywords
          (function-def-words "def-" "define")

          (keywords "if" "when" "unless" "cond" "case"

                    "return" "require" "try" "throw"
                    "and" "or" "not" "=" ">" "<" ">=" "<=" "+" "-" "*" "/")

          )

;;;###autoload
(define-derived-mode promethean-sibilant-mode promethean-lisp-mode "SibilantJS"
  "Major mode for editing Sibilant code."
  (setq font-lock-defaults '(sibilant-font-lock-keywords))
  (setq-local comment-start ";"))

(add-hook 'promethean-sibilant-mode-hook #'promethean/setup-lispy-env)

(add-to-list 'auto-mode-alist '("\\.sibilant\\'" . promethean-sibilant-mode))
(add-to-list 'auto-mode-alist '("\\.prompt\\.sibilant\\'" . promethean-sibilant-mode))


(provide 'promethean-sibilant-mode)
