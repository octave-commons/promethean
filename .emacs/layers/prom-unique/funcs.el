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

;;;; ---------- List continuation (fallback) ----------

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
               (opt (group "[" (any " xX-") "]") (+ blank))) ; 5:checkbox
           ))
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
      (list :indent indent :raw raw :next next :checkbox cbx))))

(defun prom/list-ret-dwim ()
  "Obsidian-like RET: continue list or exit on empty item."
  (interactive)
  (let* ((m (prom-list--current-marker))
         (bol (line-beginning-position))
         (eol (line-end-position)))
    (cond
     ((null m) (newline))
     ((save-excursion
        (goto-char bol)
        (re-search-forward
         (rx-to-string
          `(: bol ,(plist-get m :indent) ,(plist-get m :raw)
              (+ blank)
              ,(when (plist-get m :checkbox) '(: ,(plist-get m :checkbox) (+ blank)))
              (* blank) eol)) nil t)))
     ;; empty item → clear marker and break list
     (delete-region bol eol) (newline))
    (t
     (goto-char eol)
     (newline)
     (insert (plist-get m :indent) (plist-get m :next) " ")
     (when-let ((cb (plist-get m :checkbox)))
       (insert cb " ")))))

(define-minor-mode prom-list-continue-mode
  "Fallback list continuation on RET for any text buffer."
  :lighter " ▪RET"
  (if prom-list-continue-mode
      (local-set-key (kbd "RET") #'prom/list-ret-dwim)
    (local-unset-key (kbd "RET"))))

;;;; ---------- Orgalist DWIM (when available) ----------

(defun prom/orgalist-ret-dwim ()
  "RET that continues list or exits on empty when `orgalist-mode' is active."
  (interactive)
  (let ((bol (line-beginning-position))
        (eol (line-end-position)))
    (save-excursion
      (goto-char bol)
      (cond
       ((looking-at
         (rx bol (* blank)
             (or (any "-+*")
                 (seq (+ digit) (any ".)"))
                 (seq alpha (any ".)")))
             (+ blank) (opt "[" (any " xX-") "]" (+ blank))
             (* blank) eol))
        (delete-region bol eol) (newline))
       ((bound-and-true-p orgalist-mode)
        (goto-char eol) (call-interactively 'orgalist-insert-item))
       (t (newline))))))
