;;; keybindings.el --- prom-unique keys -*- lexical-binding: t; -*-


;;;###autoload
(spacemacs/declare-prefix "n u" "unique")

;;;###autoload
(spacemacs/set-leader-keys
  "nuu" 'prom/open-unique-like-this-buffer   ; “unique like this buffer”
  "nuE" 'prom/open-unique-with-extension     ; prompt for extension
  "num" 'prom/open-unique-markdown
  "nuo" 'prom/open-unique-org
  "nut" 'prom/open-unique-text
  "nuj" 'prom/open-unique-js
  ;; "nub" 'prom/open-unique-bash
  ;; "nue" 'prom/open-unique-elisp
  ;; "nup" 'prom/open-unique-python
  ;; "nur" 'prom/open-unique-rust
  ;; "nuc" 'prom/open-unique-clj
  ;; "nuh" 'prom/open-unique-html
  ;; "nuC" 'prom/open-unique-css
  "nuM" 'prom/open-unique-for-mode ; prompt for mode
  "nlr" 'prom/list-renumber-block
  )

;;;###autoload
(spacemacs/declare-prefix "n l" "lists")
