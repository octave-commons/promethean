;;; keybindings.el --- prom-unique keys -*- lexical-binding: t; -*-


;;;###autoload
(spacemacs/declare-prefix "n u" "unique")

;;;###autoload
(spacemacs/set-leader-keys
  "nuu" 'prom/open-unique-like-this-buffer   ; “unique like this buffer”
  "nue" 'prom/open-unique-with-extension     ; prompt for extension
  "num" 'prom/open-unique-markdown
  "nuo" 'prom/open-unique-org
  "nut" 'prom/open-unique-text
  "nuj" 'prom/open-unique-js
  "nuM" 'prom/open-unique-for-mode ; prompt for mode
  "nlr" 'prom/list-renumber-block
  )

;;;###autoload
(spacemacs/declare-prefix "n l" "lists")
