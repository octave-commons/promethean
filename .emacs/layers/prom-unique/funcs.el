;;; funcs.el --- prom-unique functions -*- lexical-binding: t; -*-

(require 'project nil t)
(eval-when-compile (require 'subr-x))

;;;; ---------- Unique files core ----------

(defun prom//project-root ()
  (or (when (fboundp 'project-current)
        (when-let ((p (project-current nil)))
          (ignore-errors (project-root p))))
      (locate-dominating-file default-directory ".git")
      default-directory))

(defun prom//expand (path)
  (let ((root (prom//project-root)))
    (if (file-name-absolute-p path) path (expand-file-name path root))))

(defun prom//normalize-mode (mode)
  (pcase mode
    ('gfm-mode 'markdown-mode)
    ('js-ts-mode 'js-mode)
    (_ mode)))

(defun prom//target (mode)
  (let* ((mode (prom//normalize-mode mode))
         (pl   (alist-get mode prom/unique-mode-targets)))
    (list :dir (prom//expand (or (plist-get pl :dir) prom/unique-default-dir))
          :ext (or (plist-get pl :ext) ".txt"))))

(defun prom//timestamp ()
  (format-time-string prom/unique-doc-format (current-time)))

(defun prom//unique-path (dir ext)
  (make-directory dir t)
  (let* ((ts   (prom//timestamp))
         (base (expand-file-name ts dir))
         (path (concat base ext))
         (n 1))
    (while (file-exists-p path)
      (setq path (format "%s-%d%s" base n ext)
            n (1+ n)))
    path))

(defun prom//insert-header-md (name)  (insert "# " name "\n\n"))
(defun prom//insert-header-org (name) (insert "#+TITLE: " name "\n\n"))
(defun prom//insert-header-js  (name) (insert "/* " name " */\n\n"))

;;;###autoload
(defun prom/open-unique-for-mode (mode &optional ask-header ext)
  "Create & visit a timestamped file for MODE.
With prefix arg ASK-HEADER, insert a mode-appropriate header.
EXT overrides the default extension for MODE (e.g., \".md\")."
  (interactive
   (list (intern (completing-read
                  "Mode: "
                  (mapcar #'car prom/unique-mode-targets)
                  nil t nil nil (symbol-name major-mode)))
         current-prefix-arg))
  (let* ((target (prom//target mode))
         (dir    (plist-get target :dir))
         (ext    (or ext (plist-get target :ext)))
         (path   (prom//unique-path dir ext)))
    (find-file path)
    (unless (eq major-mode mode) (funcall mode))
    (when ask-header
      (when-let ((hdr (alist-get (prom//normalize-mode mode) prom/unique-mode-headers)))
        (funcall hdr (file-name-base path))))
    (save-buffer)
    (message "New %s: %s" mode path)
    path))

;;;###autoload
(defun prom/open-unique-like-this-buffer (&optional ask-header)
  "Create a unique file using `major-mode' of current buffer.
With prefix arg ASK-HEADER, insert a header."
  (interactive "P")
  (prom/open-unique-for-mode major-mode ask-header))

;;;###autoload
(defun prom/open-unique-with-extension (ext &optional ask-header)
  "Prompt for EXT (e.g., .md) and create a unique file in this buffer's MODE."
  (interactive
   (list (read-string "Extension (with dot): "
                      (or (and buffer-file-name
                               (let ((e (file-name-extension buffer-file-name)))
                                 (and e (concat "." e))))
                          (plist-get (prom//target major-mode) :ext)))
         current-prefix-arg))
  (let ((ext (if (string-prefix-p "." ext) ext (concat "." ext))))
    (prom/open-unique-for-mode major-mode ask-header ext)))

;;;###autoload
(defun prom/open-unique-markdown (&optional ask-header)
  (interactive "P") (prom/open-unique-for-mode 'markdown-mode ask-header))
;;;###autoload
(defun prom/open-unique-org (&optional ask-header)
  (interactive "P") (prom/open-unique-for-mode 'org-mode ask-header))
;;;###autoload
(defun prom/open-unique-text (&optional ask-header)
  (interactive "P") (prom/open-unique-for-mode 'text-mode ask-header))
;;;###autoload
(defun prom/open-unique-js (&optional ask-header)
  (interactive "P")
  (prom/open-unique-for-mode (if (fboundp 'js-ts-mode) 'js-ts-mode 'js-mode) ask-header))

;;;###autoload
(defun prom/open-unique-bash (&optional ask-header)
  (interactive "P")
  (prom/open-unique-for-mode 'bash-ts-mode ask-header))

;;;###autoload
(defun prom/open-unique-elisp (&optional ask-header)
  (interactive "P")
  (prom/open-unique-for-mode 'elisp-mode ask-header))

;;;###autoload
(defun prom/open-unique-python (&optional ask-header)
  (interactive "P")
  (prom/open-unique-for-mode 'python-mode ask-header))

;;;###autoload
(defun prom/open-unique-rust (&optional ask-header)
  (interactive "P")
  (prom/open-unique-for-mode 'rust-mode ask-header))

;;;###autoload
(defun prom/open-unique-clj (&optional ask-header)
  (interactive "P")
  (prom/open-unique-for-mode 'clojure-mode ask-header))

;;;###autoload
(defun prom/open-unique-html (&optional ask-header)
  (interactive "P")
  (prom/open-unique-for-mode 'html-mode ask-header))

;;;###autoload
(defun prom/open-unique-css (&optional ask-header)
  (interactive "P")
  (prom/open-unique-for-mode 'css-mode ask-header))

;; ---------- List continuation (fallback) ----------
(defun prom/list--empty-item-p ()
  "Return non-nil if current line is a list item with no content (only marker, optional checkbox, spaces)."
  (save-excursion
    (beginning-of-line)
    (looking-at
     "^[[:space:]]*\\([-+*]\\|[0-9]+[\\.)]\\|[A-Za-z][\\.)]\\)[[:space:]]+\\(\\[[ xX-]\\][[:space:]]+\\)?[[:space:]]*$")))

(defun prom-list--current-marker ()
  "Return plist describing current line's list marker or nil.
Keys: :indent :raw :next :checkbox."
  (save-excursion
    (beginning-of-line)
    (when (looking-at
           (rx bol
               (group (* blank))                         ; 1: indent
               (group
                (or (any "-+*")
                    (seq (group (+ digit)) (any ".)"))   ; 3:num
                    (seq (group alpha)      (any ".)")))) ; 4:alpha
               (+ blank)
               (opt (group "[" (any " xX-") "]") (+ blank))))
      (let* ((indent (match-string 1))
             (raw    (match-string 2))
             (num    (match-string 3))
             (alp    (match-string 4))
             (cbx    (match-string 5))
             (next
              (cond
               (num (format "%d%c" (1+ (string-to-number num))
                            (aref raw (1- (length raw)))))
               (alp (format "%c%c" (1+ (string-to-char alp))
                            (aref raw (1- (length raw)))))
               (t raw))))
        (list :indent indent :raw raw :next next :checkbox cbx)))))

(defun prom/list--prev-list-indent ()
  "Indent columns of the previous non-blank list line, or nil."
  (save-excursion
    (forward-line -1)
    (while (and (not (bobp)) (looking-at-p "^[[:space:]]*$"))
      (forward-line -1))
    (when (looking-at
           "^[[:space:]]*\([-+*]\|[0-9]+[\.)]\|[A-Za-z][\.)]\)[[:space:]]+")
      (- (match-beginning 0) (line-beginning-position)))))

(defun prom/list--first-marker-like (raw)
  "Given RAW like \"3.\", \"a)\" or \"-\", return the first in that style."
  (let ((term (aref raw (1- (length raw)))))
    (cond
     ((string-match-p "^[0-9]+" raw) (format "1%c" term))
     ((string-match-p "^[A-Z]" raw)  (format "A%c" term))
     ((string-match-p "^[a-z]" raw)  (format "a%c" term))
     (t raw))))

(defun prom/list--second-marker-like (raw)
  "Given RAW like \"3.\", \"a)\" or \"-\", return the second in that style."
  (let ((term (aref raw (1- (length raw)))))
    (cond
     ((string-match-p "^[0-9]+" raw) (format "2%c" term))
     ((string-match-p "^[A-Z]" raw)  (format "B%c" term))
     ((string-match-p "^[a-z]" raw)  (format "b%c" term))
     (t raw))))

(defun prom/list-ret-dwim ()
  "Insert newline with list continuation if at end of a list item.
Otherwise, fallback to default `RET` behavior."
  (interactive)
  (let* ((eol (line-end-position))
         (bol (line-beginning-position))
         (at-eol (eq (point) eol))
         (m (prom-list--current-marker)))
    (cond
     ;; If not on a list line or not at end of line → fallback
     ((or (null m) (not at-eol))
      (call-interactively #'newline-and-indent))
     ;; Empty item → exit list
     ((prom/list--empty-item-p)
      (delete-region bol eol)
      (newline))
     ;; List continuation
     (t
      (let* ((indent (or (plist-get m :indent) ""))
             (raw    (or (plist-get m :raw)    ""))
             (cb     (plist-get m :checkbox))
             (prev-indent (prom/list--prev-list-indent))
             (deep? (and prev-indent
                         (> (length indent) prev-indent)
                         (or (string-match-p "^[0-9]+" raw)
                             (string-match-p "^[A-Za-z]" raw))))
             (next (plist-get m :next)))
        ;; If deeper indent, reset marker to 1/a/A
        (when deep?
          (let ((first (prom/list--first-marker-like raw)))
            (save-excursion
              (goto-char bol)
              (when (looking-at "^[[:space:]]*\\([-+*]\\|[0-9]+[\\.)]\\|[A-Za-z][\\.)]\\)")
                (let ((s (match-beginning 1)) (e (match-end 1)))
                  (unless (string-equal (match-string 1) first)
                    (goto-char s)
                    (delete-region s e)
                    (insert first)))))))
        (when deep?
          (setq next (prom/list--second-marker-like raw)))
        (newline)
        (insert indent next " ")
        (when cb (insert cb " ")))))))



(defvar prom-list-continue-mode-map
  (let ((map (make-sparse-keymap)))
    (define-key map (kbd "RET") #'prom/list-ret-dwim)
    map)
  "Keymap for `prom-list-continue-mode`.")

(define-minor-mode prom-list-continue-mode
  "Minor mode for Obsidian-like list continuation on RET."
  :lighter " ▪RET"
  :keymap prom-list-continue-mode-map)
