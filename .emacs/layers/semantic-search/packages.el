;;; packages.el --- semantic-search layer  -*- lexical-binding: t; -*-
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
;; added to `semantic-search-packages'. Then, for each package PACKAGE:
;;
;; - If PACKAGE is not referenced by any other Spacemacs layer, define a
;;   function `semantic-search/init-PACKAGE' to load and initialize the package.

;; - Otherwise, PACKAGE is already referenced by another Spacemacs layer, so
;;   define the functions `semantic-search/pre-init-PACKAGE' and/or
;;   `semantic-search/post-init-PACKAGE' to customize the package as it is loaded.

;;; Code:


(defconst semantic-search-packages
  '(
    ;; REAL semantic (embeddings) search
    (sem :location (recipe :fetcher github :repo "lepisma/sem.el"))
    ;; UI + fast grep
    consult
    (consult-omni :location (recipe :fetcher github :repo "armindarvish/consult-omni"))
    ;; nice to have in helpers
    f
    s

    ;; Optional: wiring for DIY RAG in Emacs
    ;; Enable later if you want to embed + persist vectors yourself.
    ;; llm  vecdb
    ))

(defun semantic-search/init-sem ()
  (use-package sem
    :commands (sem-index sem-search)
    :init
    (spacemacs/declare-prefix "os" "semantic-search")
    (spacemacs/set-leader-keys
      "osi" #'semantic-search-index-project
      "oss" #'semantic-search-query
      "osS" #'semantic-search-query-at-point)
    :config
    ;; --- helpers: project-aware index/search ---
    (defun semantic-search--project-root ()
      (or (when (fboundp 'project-current)
            (when-let* ((p (project-current nil)))
              (car (project-roots p))))
          default-directory))

    (defun semantic-search-index-project (&optional dir)
      "Index DIR (or current project)."
      (interactive)
      (let* ((root (or dir (semantic-search--project-root))))
        (unless root (user-error "No project root; give a dir"))
        (message "[sem] indexing %s ..." root)
        (call-interactively #'sem-index))) ; sem prompts for directory; use root if you want to force

    (defun semantic-search-query (query)
      "Semantic search using sem.el (prompt for QUERY)."
      (interactive "sQuery: ")
      (sem-search query))

    (defun semantic-search-query-at-point ()
      "Semantic search using symbol/region at point."
      (interactive)
      (let* ((q (if (use-region-p)
                    (buffer-substring-no-properties (region-beginning) (region-end))
                  (thing-at-point 'symbol t))))
        (unless (and q (string-match-p "[^ \t\n]" q))
          (user-error "No symbol/region to query"))
        (sem-search q)))))

(defun semantic-search/init-consult ()
  (use-package consult
    :commands (consult-ripgrep consult-line)
    :init
    (spacemacs/declare-prefix "og" "grep/search")
    (spacemacs/set-leader-keys
      "ogr" #'semantic-search-ripgrep-project
      "ogl" #'consult-line)
    :config
    (defun semantic-search-ripgrep-project (&optional dir)
      "Fast fallback lexical search in project (rg)."
      (interactive)
      (let* ((root (or dir
                       (when (fboundp 'project-current)
                         (when-let* ((p (project-current nil)))
                           (car (project-roots p)))))
                   ))
        (consult-ripgrep root))))

  ;; consult-ripgrep lives in consult, keep separate def for readability
  )

(defun semantic-search/init-consult-omni ()
  (use-package consult-omni
    :commands (consult-omni)
    :init
    (spacemacs/declare-prefix "oo" "omni")
    (spacemacs/set-leader-keys
      "ooo" #'consult-omni)
    :config
    ;; Out-of-the-box omni sources are enough; you can add engines/AI later.
    ))

(defun semantic-search/init-f ()
  (use-package f :defer t))

(defun semantic-search/init-s ()
  (use-package s :defer t))

;; ---- Optional: enable when you want DIY embeddings storage ----
;; (defun semantic-search/init-llm ()
;;   (use-package llm :defer t))   ;; GNU ELPA; provider-agnostic

;; (defun semantic-search/init-vecdb ()
;;   (use-package vecdb :defer t)) ;; GNU ELPA; vector DB interface

;;; packages.el ends here
