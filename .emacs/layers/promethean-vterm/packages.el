;;; packages.el --- promethean-vterm layer packages file for Spacemacs -*- lexical-binding: t; -*-
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
;; added to `promethean-vterm-packages'. Then, for each package PACKAGE:
;;
;; - If PACKAGE is not referenced by any other Spacemacs layer, define a
;;   function `promethean-vterm/init-PACKAGE' to load and initialize the package.

;; - Otherwise, PACKAGE is already referenced by another Spacemacs layer, so
;;   define the functions `promethean-vterm/pre-init-PACKAGE' and/or
;;   `promethean-vterm/post-init-PACKAGE' to customize the package as it is loaded.

;;; Code:

(defconst promethean-vterm-packages '(vterm))

(defun promethean-vterm/init-vterm ()
  (use-package vterm
    :commands (vterm vterm-other-window)
    :init
    ;; Use vterm’s prompt tracking; lets us jump to prompts and keeps Emacs
    ;; in sync without injecting `cd`.
    (setq vterm-use-vterm-prompt-detection-method t)

    ;; Global leader: quick launchers
    (spacemacs/declare-prefix "ot" "term")
    (spacemacs/set-leader-keys
      "ott" #'vterm
      "otT" #'vterm-other-window)

    :config
    ;; --- No-copy-mode workflow: scroll freely, jump to prompt on demand ---
    (defun promethean/vterm-jump-to-prompt ()
      "Jump to end of current/next prompt (no copy-mode)."
      (interactive)
      (vterm-next-prompt 1))

    (defun promethean/vterm-jump-to-prev-prompt ()
      "Jump to end of previous prompt (no copy-mode)."
      (interactive)
      (vterm-previous-prompt 1))

    ;; Keep window scrolling from yanking point around.
    (setq scroll-preserve-screen-position t)

    ;; Optional: flow control pause/resume (helps during output storms)
    (defun promethean/vterm-flow-pause () (interactive) (vterm-send-key "s" nil nil t))
    (defun promethean/vterm-flow-resume () (interactive) (vterm-send-key "q" nil nil t))

    ;; Major-mode leader keys: SPC m …
    (spacemacs/declare-prefix-for-mode 'vterm-mode "mj" "jump")
    (spacemacs/declare-prefix-for-mode 'vterm-mode "ms" "scroll/flow")

    (spacemacs/set-leader-keys-for-major-mode 'vterm-mode
      "]"  #'promethean/vterm-jump-to-prompt
      "["  #'promethean/vterm-jump-to-prev-prompt
      "sp" #'promethean/vterm-flow-pause
      "sq" #'promethean/vterm-flow-resume)

    ;; Nice-to-have: fix C-a to go to BOL of the current prompt line
    (defun promethean/vterm-bol ()
      (interactive)
      (vterm-previous-prompt 0)
      (beginning-of-line))
    (define-key vterm-mode-map (kbd "C-a") #'promethean/vterm-bol)))

;;; packages.el ends here
