;;; packages.el --- prom-unique layer -*- lexical-binding: t; -*-

(defconst prom-unique-packages '())

(defun prom-unique/init-orgalist ()
  (use-package orgalist :defer t))
