;;; config.el --- prom-unique config -*- lexical-binding: t; -*-

(defgroup prom/unique nil "Unique files + list helpers." :group 'convenience)

(defcustom prom/unique-doc-format "%Y.%m.%d.%H.%M.%S"
  "Timestamp format for unique filenames."
  :type 'string)

(defcustom prom/unique-default-dir "docs/unique"
  "Fallback directory if a mode has no mapping."
  :type 'string)

(defcustom prom/unique-mode-targets
  '((markdown-mode :dir "docs/notes" :ext ".md")
    (gfm-mode      :dir "docs/notes" :ext ".md")
    (org-mode      :dir "docs/org"   :ext ".org")
    (text-mode     :dir "docs/text"  :ext ".txt")
    (js-mode       :dir "docs/dev"   :ext ".js")
    (js-ts-mode    :dir "docs/dev"   :ext ".js")
    (typescript-mode     :dir "docs/dev" :ext ".ts")
    (typescript-ts-mode  :dir "docs/dev" :ext ".ts"))
  "MODE → plist mapping with :dir and :ext."
  :type '(alist :key-type symbol :value-type (plist :key-type symbol :value-type sexp)))

(defcustom prom/unique-mode-headers
  '((markdown-mode . prom//insert-header-md)
    (org-mode      . prom//insert-header-org)
    (js-mode       . prom//insert-header-js)
    (js-ts-mode    . prom//insert-header-js))
  "MODE → function(name) to insert header."
  :type '(alist :key-type symbol :value-type function))

(defcustom prom/unique-use-orgalist t
  "If non-nil, enable orgalist in text/markdown modes and use DWIM RET.
If orgalist is unavailable, we fall back to `prom-list-continue-mode`."
  :type 'boolean)

;; Mark vars safe for .dir-locals.el
(dolist (v '(prom/unique-mode-targets prom/unique-mode-headers))
  (put v 'safe-local-variable #'listp))

(dolist (v '(prom/unique-doc-format prom/unique-default-dir))
  (put v 'safe-local-variable #'stringp))

;; Enable list behavior
(let* ((hooks '(text-mode-hook markdown-mode-hook gfm-mode-hook))
       (orgalist-ok (and prom/unique-use-orgalist (require 'orgalist nil t))))
  (if orgalist-ok
      (progn
        (dolist (h hooks) (add-hook h #'orgalist-mode))
        (with-eval-after-load 'orgalist
          (define-key orgalist-mode-map (kbd "RET")   #'prom/orgalist-ret-dwim)
          (define-key orgalist-mode-map (kbd "M-RET") #'orgalist-insert-item))))
  ;; fallback
  (dolist (h hooks) (add-hook h #'prom-list-continue-mode)))
