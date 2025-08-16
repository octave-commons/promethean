;;; packages.el --- prom-unique layer -*- lexical-binding: t; -*-


(defvar prom-unique--layer-dir
  (file-name-directory (or load-file-name buffer-file-name)))

(add-to-list 'load-path prom-unique--layer-dir)
(defconst prom-unique-packages '())

(defun prom-unique/init ()
  (load (expand-file-name "config.el" prom-unique--layer-dir))
  (load (expand-file-name "funcs.el" prom-unique--layer-dir))
  (load (expand-file-name "keybinds.el" prom-unique--layer-dir)))

(provide 'prom-unique)
