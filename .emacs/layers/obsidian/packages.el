;;; packages.el --- obsidian layer packages file for Spacemacs -*- lexical-binding: t; -*-
;;
;; Copyright (c) 2012-2025 Sylvain Benner & Contributors
;;
;; Author: err <err@err-Stealth-16-AI-Studio-A1VGG>
;; URL: https://github.com/syl20bnr/spacemacs
;;
;; This file is not part of GNU Emacs.
;;
;; This program is free software; you can redistribute it and/or modify
;; it under the terms of the GNU General Public License as published by
;; the Free Software Foundation, either version 3 of the License, or
;; (at your option) any later version.
;;
;; This program is distributed in the hope that it will be useful,
;; but WITHOUT ANY WARRANTY; without even the implied warranty of
;; MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
;; GNU General Public License for more details.
;;
;; You should have received a copy of the GNU General Public License
;; along with this program.  If not, see <http://www.gnu.org/licenses/>.

;;; Commentary:

;; See the Spacemacs documentation and FAQs for instructions on how to implement
;; a new layer:
;;
;;   SPC h SPC layers RET
;;
;;
;; Briefly, each package to be installed or configured by this layer should be
;; added to `obsidian-packages'. Then, for each package PACKAGE:
;;
;; - If PACKAGE is not referenced by any other Spacemacs layer, define a
;;   function `obsidian/init-PACKAGE' to load and initialize the package.

;; - Otherwise, PACKAGE is already referenced by another Spacemacs layer, so
;;   define the functions `obsidian/pre-init-PACKAGE' and/or
;;   `obsidian/post-init-PACKAGE' to customize the package as it is loaded.

;;; Code:

(defconst obsidian-packages '(obsidian))

(defun obsidian/init-obsidian ()
  (use-package obsidian
    :commands (obsidian-mode)
    :init
    (progn
      (setq obsidian-directory "~/vaults/main"
            obsidian-daily-notes-directory "daily"
            obsidian-inbox-directory "inbox"
            obsidian-page-title-format t)
      (add-hook 'markdown-mode-hook #'obsidian-mode)
      (add-hook 'obsidian-mode-hook #'obsidian-backlinks-mode))
    :config
    (progn
      (spacemacs/declare-prefix-for-mode 'markdown-mode "mo" "obsidian")
      (spacemacs/set-leader-keys-for-major-mode 'markdown-mode
        "oi" #'obsidian-insert-wikilink
        "of" #'obsidian-follow-link-at-point
        "ob" #'obsidian-backlink-jump
        "on" #'obsidian-daily-note
        "ot" #'obsidian-tag-insert
        "os" #'obsidian-search))))

;;; packages.el ends here
