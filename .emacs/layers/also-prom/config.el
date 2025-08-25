;;; config.el --- promethean layer config -*- lexical-binding: t; -*-
;;; Commentary:
;; Layer-level variables and defaults.

;;; Code:

(defvar promethean-lsp-enable t
  "Whether to enable lsp-mode in promethean buffers.")

(when (boundp 'lsp-language-id-configuration)
  ;; Identify buffers as "promethean" for lsp-mode.
  (add-to-list 'lsp-language-id-configuration '(promethean-mode . "promethean")))

;;; config.el ends here
