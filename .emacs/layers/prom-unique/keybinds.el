;;; keybindings.el --- prom-unique keys -*- lexical-binding: t; -*-

(spacemacs/declare-prefix "n u" "unique")

(spacemacs/set-leader-keys
  "nuu" #'prom/open-unique-like-this-buffer   ; “unique like this buffer”
  "nue" #'prom/open-unique-with-extension     ; prompt for extension
  "num" #'prom/open-unique-markdown
  "nuo" #'prom/open-unique-org
  "nut" #'prom/open-unique-text
  "nuj" #'prom/open-unique-js
  "nuM" #'prom/open-unique-for-mode)          ; prompt for mode
