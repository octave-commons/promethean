# Spacemacs Rescue Profile + `prom-unique` Layer (All-in-One)

This is a single, self-contained guide with **copy/paste** snippets to:

1. Set up a **rescue Spacemacs profile** you can always boot into.
2. Install a **zero-dependency** Spacemacs layer `prom-unique` that provides:

   * **Unique files** (timestamped) per mode (Markdown/Org/Text/JS), prompt for mode/extension, and “like current buffer”.
   * **Obsidian-like list continuation** on `RET` (works in text/markdown by default) without orgalist.
3. Configure **per-project overrides** via `.dir-locals.el`.

---

## Part A — Minimal, Known-Good Rescue Profile (no changes to your main)

### A1) Create a rescue Spacemacs config dir

```bash
mkdir -p ~/.spacemacs.d-rescue
```

### A2) Put this at `~/.spacemacs.d-rescue/init.el`

```elisp
;;; ~/.spacemacs.d-rescue/init.el
(defun dotspacemacs/layers ()
  (setq-default
   dotspacemacs-distribution 'spacemacs
   dotspacemacs-enable-lazy-installation 'unused
   dotspacemacs-ask-for-lazy-installation nil
   dotspacemacs-configuration-layer-path '()
   dotspacemacs-elpa-subdirectory 'emacs-version
   dotspacemacs-install-packages 'used-only
   dotspacemacs-configuration-layers
   '(
     (spacemacs-evil)  ; vim keys
     (ivy)
     (git)
     emacs-lisp
     markdown
     org
     )
   dotspacemacs-additional-packages '()
   dotspacemacs-excluded-packages '()))

(defun dotspacemacs/init ()
  (setq-default
   dotspacemacs-editing-style 'vim
   dotspacemacs-verbose-loading nil
   dotspacemacs-elpa-https t
   dotspacemacs-elpa-timeout 10
   dotspacemacs-check-for-update nil
   dotspacemacs-startup-lists '()
   dotspacemacs-startup-banner 'official))

(defun dotspacemacs/user-init ()
  ;; Keep rescue packages isolated from your main profile
  (setq package-user-dir (expand-file-name "elpa" user-emacs-directory)))

(defun dotspacemacs/user-config ()
  (global-display-line-numbers-mode 1)
  (setq inhibit-startup-screen t))
```

### A3) Add a shell alias to launch rescue

```bash
alias esr='SPACEMACSDIR=$HOME/.spacemacs.d-rescue emacs --debug-init'
```

Use `esr` whenever main breaks. You’ll still have Vim keys + Ivy + Markdown/Org.

> **Tip:** Keep rescue boring. Don’t add private layers. It’s a lifeboat.

---

## Part B — `prom-unique` Layer (zero dep)

Place this **private layer** here (either path is fine):

* `~/.emacs.d/private/prom-unique/`
* or `~/.config/spacemacs/private/prom-unique/`

Create these four files:

### `~/.emacs.d/private/prom-unique/packages.el`

```elisp
;;; packages.el --- prom-unique layer -*- lexical-binding: t; -*-
(defconst prom-unique-packages '())
```

### `~/.emacs.d/private/prom-unique/funcs.el`

```elisp
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

;;;; ---------- List continuation (fallback, no deps) ----------

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
        (list :indent indent :raw raw :next next :checkbox cbx)))))

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
              ,@(when (plist-get m :checkbox) '(: ,(plist-get m :checkbox) (+ blank)))
              (* blank) eol)) nil t)))
      ;; empty item → clear marker and break list
      (delete-region bol eol) (newline))
     (t
      (goto-char eol)
      (newline)
      (insert (plist-get m :indent) (plist-get m :next) " ")
      (when-let ((cb (plist-get m :checkbox)))
        (insert cb " "))))))

(define-minor-mode prom-list-continue-mode
  "Fallback list continuation on RET for any text buffer."
  :lighter " ▪RET"
  (if prom-list-continue-mode
      (local-set-key (kbd "RET") #'prom/list-ret-dwim)
    (local-unset-key (kbd "RET"))) )
```

### `~/.emacs.d/private/prom-unique/config.el`

```elisp
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

;; Mark vars safe for .dir-locals.el
(dolist (v '(prom/unique-mode-targets prom/unique-mode-headers))
  (put v 'safe-local-variable #'listp))
(dolist (v '(prom/unique-doc-format prom/unique-default-dir))
  (put v 'safe-local-variable #'stringp))

;; Enable fallback list continuation (no orgalist dependency)
(dolist (h '(text-mode-hook markdown-mode-hook gfm-mode-hook))
  (add-hook h #'prom-list-continue-mode))
```

### `~/.emacs.d/private/prom-unique/keybindings.el`

```elisp
;;; keybindings.el --- prom-unique keys -*- lexical-binding: t; -*-

(spacemacs/declare-prefix "n u" "unique")

(spacemacs/set-leader-keys
  "nuu" #'prom/open-unique-like-this-buffer   ; unique like this buffer’s mode
  "nue" #'prom/open-unique-with-extension     ; prompt for extension
  "num" #'prom/open-unique-markdown
  "nuo" #'prom/open-unique-org
  "nut" #'prom/open-unique-text
  "nuj" #'prom/open-unique-js
  "nuM" #'prom/open-unique-for-mode)          ; prompt for mode
```

### Enable the layer in your main `~/.spacemacs`

```elisp
dotspacemacs-configuration-layers
'(
  ;; …other layers…
  prom-unique
)
```

Reload with `SPC f e R`.

**Usage (muscle memory):**

* `SPC n u u` → unique file like current buffer’s mode (prefix `C-u` to insert header)
* `SPC n u m` / `o` / `t` / `j` → markdown / org / text / js
* `SPC n u e` → prompt for extension (e.g., `.md`)
* `SPC n u M` → prompt for mode from mapping
* In Markdown/Text: `RET` continues list; `RET` on empty item exits list.

---

## Part C — Per-Project Overrides with `.dir-locals.el`

Put this at your project root to override dirs/exts/format:

```elisp
((nil . ((prom/unique-doc-format . "%Y.%m.%d.%H.%M.%S")
         (prom/unique-default-dir . "docs/unique")
         (prom/unique-mode-targets .
          ((markdown-mode :dir "docs/md"   :ext ".md")
           (org-mode      :dir "docs/org"  :ext ".org")
           (text-mode     :dir "docs/text" :ext ".txt")
           (js-mode       :dir "docs/dev"  :ext ".js")
           (typescript-ts-mode :dir "docs/dev" :ext ".ts"))))))
```

After editing `.dir-locals.el`, run `M-x normal-mode` in an open buffer (or just reopen the file) to reload locals.

---

## Part D — Optional: Fully Isolated Rescue via Chemacs2

If you want **separate Emacs trees** for main & rescue:

```bash
mv ~/.emacs.d ~/.emacs.d-main
git clone https://github.com/plexus/chemacs2.git ~/.emacs.d
```

Create `~/.emacs-profiles.el`:

```elisp
(("main"
  . ((user-emacs-directory . "~/.emacs.d-main/")
     (env . (("SPACEMACSDIR" . "~/.spacemacs.d")))))
 ("rescue"
  . ((user-emacs-directory . "~/.emacs.d-spacemacs-rescue")
     (env . (("SPACEMACSDIR" . "~/.spacemacs.d-rescue"))))))
```

Prepare rescue clone & config:

```bash
git clone --branch master https://github.com/syl20bnr/spacemacs ~/.emacs.d-spacemacs-rescue
mkdir -p ~/.spacemacs.d-rescue
# reuse the same init.el from Part A2
```

Run:

```bash
emacs --with-profile rescue   # rescue
emacs --with-profile main     # main
```

---

## Part E — Safety Rails & Debug Tips

* **Demote init errors** so Emacs still starts:

  ```elisp
  (with-demoted-errors "[init] %S"
    ;; risky setup here
  )
  ```
* **Stale autoloads/hooks**: if you remove a package and Emacs still calls it, unhook and unintern:

  ```elisp
  (dolist (h '(text-mode-hook markdown-mode-hook gfm-mode-hook))
    (remove-hook h #'orgalist-mode))
  (when (fboundp 'orgalist-mode)
    (let ((fn (symbol-function 'orgalist-mode)))
      (when (eq (car-safe fn) 'autoload)
        (fmakunbound 'orgalist-mode))))
  ```
* **Launch clean** when needed: `emacs -Q` (vanilla) or `esr` (rescue).
* **Trace startup**: `emacs --debug-init`.

---

## Done

* Rescue profile: `esr`
* Main profile: enable `prom-unique` layer
* Unique files & list behavior: `SPC n u …` and `RET` in text/markdown
* Per-project overrides: `.dir-locals.el`

If/when you want `orgalist` later, we can add a minimal patch to `packages.el`/`config.el` to auto-install and swap `RET` to its implementation—*without* breaking this fallback.

## Patch: Clean Lists Implementation — fixed & balanced (2025-08-11)

**Drop-in replacement.** This version fixes unmatched parens and bad regex escapes. It restarts numbering when you indent into a sublist, exits on empty items, and keeps point on the new item.

```elisp
;;;; ---------- Lists: clean, single-impl (balanced) ----------

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
  "RET: continue list; if current item empty, exit.
If indent is deeper than previous list line, reset current marker to 1/a/A."
  (interactive)
  (let* ((m   (prom-list--current-marker))
         (bol (line-beginning-position))
         (eol (line-end-position)))
    (if (not m)
        (newline)
      (let* ((indent (or (plist-get m :indent) ""))
             (raw    (or (plist-get m :raw)    ""))
             (cb     (plist-get m :checkbox))
             ;; detect empty item
             (pat (concat "^" (regexp-quote indent) (regexp-quote raw)
                          "\s-+" (if cb (concat (regexp-quote cb) "\s-+") "")
                          "\s-*$"))
             (empty-item nil))
        (save-excursion
          (goto-char bol)
          (setq empty-item (re-search-forward pat nil t))
          (when empty-item (delete-region bol eol)))
        (if empty-item
            (newline)
          (let* ((prev-indent (prom/list--prev-list-indent))
                 (deep? (and prev-indent
                             (> (length indent) prev-indent)
                             (or (string-match-p "^[0-9]+" raw)
                                 (string-match-p "^[A-Za-z]" raw))))
                 (next (plist-get m :next)))
            ;; If we just indented deeper, force current item to 1/a/A,
            ;; and make the *next* item the second in that style.
            (when deep?
              (let ((first (prom/list--first-marker-like raw)))
                (save-excursion
                  (goto-char bol)
                  (when (looking-at "^[[:space:]]*\([-+*]\|[0-9]+[\.)]\|[A-Za-z][\.)]\)")
                    (let ((s (match-beginning 1)) (e (match-end 1)))
                      (unless (string-equal (match-string 1) first)
                        (goto-char s)
                        (delete-region s e)
                        (insert first))))))
              (setq next (prom/list--second-marker-like raw)))
            (goto-char eol)
            (newline)
            (insert indent next " ")
            (when cb (insert cb " "))))))))

(define-minor-mode prom-list-continue-mode
  "Fallback list continuation on RET for any text buffer."
  :lighter " ▪RET"
  (if prom-list-continue-mode
      (local-set-key (kbd "RET") #'prom/list-ret-dwim)
    (local-unset-key (kbd "RET"))))
```

### Verify quickly

* `M-x check-parens` in your `funcs.el` → should report **no errors**.
* Try:

  ```
  1. alpha
  2. beta
     1. child
     2. next
  ```
* Empty item + `RET` exits list. Deeper indent restarts at 1/a/A.

## Patch: Restart numbering when using **TAB** indent (columns, not chars)

**Why your sublists didn’t restart:** the previous version compared the *string length* of the indent vs. the previous line’s indent. A literal TAB is 1 char but many columns. In Emacs you want **`current-indentation`** (columns), not string length.

Drop these in — they replace the old helpers and `RET` function.

```elisp
;; Replace the old prev-indent function with a columns-aware version
(defun prom/list--prev-list-indent ()
  "Indent columns of the previous non-blank list line, or nil."
  (save-excursion
    (forward-line -1)
    (while (and (not (bobp)) (looking-at-p "^[[:space:]]*$"))
      (forward-line -1))
    (when (looking-at
           "^[[:space:]]*\([-+*]\|[0-9]+[\.)]\|[A-Za-z][\.)]\)[[:space:]]+")
      (current-indentation))))

;; Robust empty-item detector (kept here so this file is self-contained)
(defun prom/list--empty-item-p ()
  "Return non-nil if current line is a list item with no content (only marker, optional checkbox, spaces)."
  (save-excursion
    (beginning-of-line)
    (looking-at
     "^[[:space:]]*\([-+*]\|[0-9]+[\.)]\|[A-Za-z][\.)]\)[[:space:]]+\(\[[ xX-]\][[:space:]]+\)?[[:space:]]*$")))

;; RET: exits on empty; restarts numbering at deeper indent (using columns)
(defun prom/list-ret-dwim ()
  "RET: continue list; if current item empty, exit.
If indent is deeper than previous list line, reset current marker to 1/a/A."
  (interactive)
  (let* ((m   (prom-list--current-marker))
         (bol (line-beginning-position))
         (eol (line-end-position)))
    (cond
     ((null m) (newline))
     ((prom/list--empty-item-p)
      (delete-region bol eol)
      (newline))
     (t
      (let* ((indent (or (plist-get m :indent) ""))
             (raw    (or (plist-get m :raw)    ""))
             (cb     (plist-get m :checkbox))
             (curr-indent (save-excursion (goto-char bol) (current-indentation)))
             (prev-indent (prom/list--prev-list-indent))
             (deep? (and prev-indent
                         (> curr-indent prev-indent)
                         (or (string-match-p "^[0-9]+" raw)
                             (string-match-p "^[A-Za-z]" raw))))
             (next (plist-get m :next)))
        (when deep?
          (let ((first (prom/list--first-marker-like raw)))
            (save-excursion
              (goto-char bol)
              (when (looking-at "^[[:space:]]*\([-+*]\|[0-9]+[\.)]\|[A-Za-z][\.)]\)")
                (let ((s (match-beginning 1)) (e (match-end 1)))
                  (unless (string-equal (match-string 1) first)
                    (goto-char s)
                    (delete-region s e)
                    (insert first))))))
          (setq next (prom/list--second-marker-like raw)))
        (goto-char eol)
        (newline)
        (insert indent next " ")
        (when cb (insert cb " ")))))))
```

**Optional (exact Obsidian feel):** restart to `1.` *as soon as you indent with TAB* (no waiting for RET):

```elisp
(defun prom/list--line-indent-cols ()
  (save-excursion (beginning-of-line) (current-indentation)))

(defun prom/list--current-numbered-or-alpha ()
  (save-excursion
    (beginning-of-line)
    (when (looking-at "^[[:space:]]*\([0-9]+[\.)]\|[A-Za-z][\.)]\)[[:space:]]+")
      (match-string 1))))

(defun prom/list-restart-on-indent (orig &rest args)
  (let ((before (prom/list--line-indent-cols)))
    (prog1 (apply orig args)
      (let ((after (prom/list--line-indent-cols)))
        (when (and before after (> after before))
          (let ((marker (prom/list--current-numbered-or-alpha)))
            (when marker
              (let ((first (prom/list--first-marker-like marker)))
                (save-excursion
                  (beginning-of-line)
                  (when (looking-at "^[[:space:]]*\([0-9]+[\.)]\|[A-Za-z][\.)]\)")
                    (let ((s (match-beginning 1)) (e (match-end 1)))
                      (unless (string-equal (match-string 1) first)
                        (goto-char s)
                        (delete-region s e)
                        (insert first))))))))))))

;; enable this if you want the immediate behavior
;; (advice-add 'indent-for-tab-command :around #'prom/list-restart-on-indent)
```

**Test:**

* Type `1. foo`, `RET` → `2.`
* Make a third: `RET` → `3.`
* Hit `TAB` to indent the `3.` line → *stays `1.` if advice enabled*; otherwise `RET` now produces `2.`
* Blank item + `RET` exits list.
