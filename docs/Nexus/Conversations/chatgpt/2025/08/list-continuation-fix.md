---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "List continuation fix"
conversation_id: 68a4b7db-f358-8332-bab5-17f70c199741
create_time: 08/19/2025 at 12:43 PM
update_time: 08/19/2025 at 6:49 PM
---

# Title: List continuation fix

Created: 08/19/2025 at 12:43 PM
Last Updated: 08/19/2025 at 6:49 PM
Chat URL: https://chat.openai.com/c/68a4b7db-f358-8332-bab5-17f70c199741


>[!nexus_user] **User** - 08/19/2025 at 12:43 PM
> I started working on a spacemacs layer which would mimic obsidians list making behavior when you press enter, but this code completely overrides the enter key, so you can't use it like in the middle of a line to bring like half of one line to another line, in or out of a list.
> 
> ```elisp
> ;; ---------- List continuation (fallback) ----------
> (defun prom/list--empty-item-p ()
>  "Return non-nil if current line is a list item with no content (only marker, optional checkbox, spaces)."
>  (save-excursion
>  (beginning-of-line)
>  (looking-at
>  "^[[:space:]]*\\([-+*]\\|[0-9]+[\\.)]\\|[A-Za-z][\\.)]\\)[[:space:]]+\\(\\[[ xX-]\\][[:space:]]+\\)?[[:space:]]*$")))
> 
> (defun prom-list--current-marker ()
>  "Return plist describing current line's list marker or nil.
> Keys: :indent :raw :next :checkbox."
>  (save-excursion
>  (beginning-of-line)
>  (when (looking-at
>  (rx bol
>  (group (* blank)) ; 1: indent
>  (group
>  (or (any "-+*")
>  (seq (group (+ digit)) (any ".)")) ; 3:num
>  (seq (group alpha) (any ".)")))) ; 4:alpha
>  (+ blank)
>  (opt (group "[" (any " xX-") "]") (+ blank))))
>  (let* ((indent (match-string 1))
>  (raw (match-string 2))
>  (num (match-string 3))
>  (alp (match-string 4))
>  (cbx (match-string 5))
>  (next
>  (cond
>  (num (format "%d%c" (1+ (string-to-number num))
>  (aref raw (1- (length raw)))))
>  (alp (format "%c%c" (1+ (string-to-char alp))
>  (aref raw (1- (length raw)))))
>  (t raw))))
>  (list :indent indent :raw raw :next next :checkbox cbx)))))
> 
> (defun prom/list--prev-list-indent ()
>  "Indent columns of the previous non-blank list line, or nil."
>  (save-excursion
>  (forward-line -1)
>  (while (and (not (bobp)) (looking-at-p "^[[:space:]]*$"))
>  (forward-line -1))
>  (when (looking-at
>  "^[[:space:]]*\([-+*]\|[0-9]+[\.)]\|[A-Za-z][\.)]\)[[:space:]]+")
>  (- (match-beginning 0) (line-beginning-position)))))
> 
> (defun prom/list--first-marker-like (raw)
>  "Given RAW like \"3.\", \"a)\" or \"-\", return the first in that style."
>  (let ((term (aref raw (1- (length raw)))))
>  (cond
>  ((string-match-p "^[0-9]+" raw) (format "1%c" term))
>  ((string-match-p "^[A-Z]" raw) (format "A%c" term))
>  ((string-match-p "^[a-z]" raw) (format "a%c" term))
>  (t raw))))
> 
> (defun prom/list--second-marker-like (raw)
>  "Given RAW like \"3.\", \"a)\" or \"-\", return the second in that style."
>  (let ((term (aref raw (1- (length raw)))))
>  (cond
>  ((string-match-p "^[0-9]+" raw) (format "2%c" term))
>  ((string-match-p "^[A-Z]" raw) (format "B%c" term))
>  ((string-match-p "^[a-z]" raw) (format "b%c" term))
>  (t raw))))
> 
> (defun prom/list-ret-dwim ()
>  "RET: continue list; if current item empty, exit.
> If indent is deeper than previous list line, reset current marker to 1/a/A."
>  (interactive)
>  (let* ((m (prom-list--current-marker))
>  (bol (line-beginning-position))
>  (eol (line-end-position)))
>  (cond
>  ;; Not a list line → plain newline
>  ((null m) (newline))
>  ;; Empty list item → delete the marker line, then newline (exit list)
>  ((prom/list--empty-item-p)
>  (delete-region bol eol)
>  (newline))
>  ;; Otherwise continue the list (maybe with restart at 1/a/A when deeper)
>  (t
>  (let* ((indent (or (plist-get m :indent) ""))
>  (raw (or (plist-get m :raw) ""))
>  (cb (plist-get m :checkbox))
>  (prev-indent (prom/list--prev-list-indent))
>  (deep? (and prev-indent
>  (> (length indent) prev-indent)
>  (or (string-match-p "^[0-9]+" raw)
>  (string-match-p "^[A-Za-z]" raw))))
>  (next (plist-get m :next)))
>  ;; If we just indented deeper, force current item to 1/a/A
>  (when deep?
>  (let ((first (prom/list--first-marker-like raw)))
>  (save-excursion
>  (goto-char bol)
>  (when (looking-at "^[[:space:]]*\\([-+*]\\|[0-9]+[\\.)]\\|[A-Za-z][\\.)]\\)")
>  (let ((s (match-beginning 1)) (e (match-end 1)))
>  (unless (string-equal (match-string 1) first)
>  (goto-char s)
>  (delete-region s e)
>  (insert first)))))))
>  (when deep?
>  (setq next (prom/list--second-marker-like raw)))
>  (goto-char eol)
>  (newline)
>  (insert indent next " ")
>  (when cb (insert cb " ")))))))
> 
> (define-minor-mode prom-list-continue-mode
>  "Fallback list continuation on RET for any text buffer."
>  :lighter " ▪RET"
>  (if prom-list-continue-mode
>  (local-set-key (kbd "RET") #'prom/list-ret-dwim)
>  (local-unset-key (kbd "RET"))))
> ```
<!-- UID: 464c0f37-e9be-441f-aee6-eb357cbc52af -->




>[!nexus_agent] **Assistant** - 08/19/2025 at 12:43 PM
> You're correct: the current approach **completely overrides** the `RET` key unconditionally, which **removes default behavior like splitting a line at point** — a critical behavior for general editing, especially in the middle of lines.
> 
> ---
> 
> ### ✅ Goal
> 
> You want **Obsidian-like list continuation** *only when RET is pressed at end of a list line*, but **preserve default RET otherwise** (e.g. to split a line normally).
> 
> ---
> 
> ### ✅ Solution: Conditional fallback on point position
> 
> Instead of fully overriding `RET`, **wrap the list behavior in a conditional** that checks:
> - Is point at EOL?
> - Is current line a list item?
> 
> Only in that case should we "continue" the list. Otherwise: **delegate to the original `RET`** (`newline` or `newline-and-indent` depending on mode).
> 
> Here's a **corrected and safer version**:
> 
> ```elisp
> (defun prom/list-ret-dwim ()
>  "Insert newline with list continuation if at end of a list item.
> Otherwise, fallback to default `RET` behavior."
>  (interactive)
>  (let* ((eol (line-end-position))
>  (bol (line-beginning-position))
>  (at-eol (eq (point) eol))
>  (m (prom-list--current-marker)))
>  (cond
>  ;; If not on a list line or not at end of line → fallback
>  ((or (null m) (not at-eol))
>  (call-interactively (default-value 'newline-and-indent)))
>  ;; Empty item → exit list
>  ((prom/list--empty-item-p)
>  (delete-region bol eol)
>  (newline))
>  ;; List continuation
>  (t
>  (let* ((indent (or (plist-get m :indent) ""))
>  (raw (or (plist-get m :raw) ""))
>  (cb (plist-get m :checkbox))
>  (prev-indent (prom/list--prev-list-indent))
>  (deep? (and prev-indent
>  (> (length indent) prev-indent)
>  (or (string-match-p "^[0-9]+" raw)
>  (string-match-p "^[A-Za-z]" raw))))
>  (next (plist-get m :next)))
>  ;; If deeper indent, reset marker to 1/a/A
>  (when deep?
>  (let ((first (prom/list--first-marker-like raw)))
>  (save-excursion
>  (goto-char bol)
>  (when (looking-at "^[[:space:]]*\\([-+*]\\|[0-9]+[\\.)]\\|[A-Za-z][\\.)]\\)")
>  (let ((s (match-beginning 1)) (e (match-end 1)))
>  (unless (string-equal (match-string 1) first)
>  (goto-char s)
>  (delete-region s e)
>  (insert first)))))))
>  (when deep?
>  (setq next (prom/list--second-marker-like raw)))
>  (newline)
>  (insert indent next " ")
>  (when cb (insert cb " ")))))))
> ```
> 
> ---
> 
> ### ✅ Keybinding safety in Spacemacs
> 
> Replace your `local-set-key` override with a **key remapping via minor mode map**:
> 
> ```elisp
> (defvar prom-list-continue-mode-map
>  (let ((map (make-sparse-keymap)))
>  (define-key map (kbd "RET") #'prom/list-ret-dwim)
>  map)
>  "Keymap for `prom-list-continue-mode`.")
> 
> (define-minor-mode prom-list-continue-mode
>  "Minor mode for Obsidian-like list continuation on RET."
>  :lighter " ▪RET"
>  :keymap prom-list-continue-mode-map)
> ```
> 
> This avoids side effects like nuking RET globally in a buffer.
> 
> ---
> 
> ### ✅ Integration in Spacemacs
> 
> You can activate this mode via `dotspacemacs/user-config`:
> 
> ```elisp
> (add-hook 'text-mode-hook #'prom-list-continue-mode)
> ```
> 
> And reload via `SPC f e R`.
> 
> ---
> 
> Would you like an Org-mode–aware variant next? (Org uses its own RET behavior with `org-return`, which would require advice or remapping.)
<!-- UID: 885083ce-7f58-4558-86e2-8fb6f3c19fee -->

---




>[!nexus_user] **User** - 08/19/2025 at 6:48 PM
> call-interactively: Symbol’s value as variable is void: newline-and-indent
<!-- UID: febc1268-e78f-4b7d-a85e-28f7631f8c4b -->




>[!nexus_agent] **Assistant** - 08/19/2025 at 6:48 PM
> You're getting:
> 
> > `call-interactively: Symbol’s value as variable is void: newline-and-indent`
> 
> because `(default-value 'newline-and-indent)` is incorrect: **`newline-and-indent` is a function**, not a variable. The `default-value` call is unnecessary and incorrect here.
> 
> ---
> 
> ### ✅ Fix: Use `call-interactively` directly on the command
> 
> ```elisp
> (call-interactively #'newline-and-indent)
> ```
> 
> If your major mode uses just `newline`, or if you want to be adaptive to the current context (e.g. `org-mode` uses `org-return`), we can make it smarter.
> 
> ---
> 
> ### ✅ Optional: Use the current binding for RET
> 
> To properly fallback to what RET normally does **in this context**, use:
> 
> ```elisp
> (let ((ret-cmd (key-binding (kbd "RET"))))
>  (if ret-cmd
>  (call-interactively ret-cmd)
>  (newline))) ;; fallback if unbound
> ```
> 
> ---
> 
> ### 🔄 Final safe `RET` fallback in `prom/list-ret-dwim`
> 
> Replace the fallback clause:
> 
> ```elisp
> ((or (null m) (not at-eol))
>  (let ((ret-cmd (key-binding (kbd "RET"))))
>  (if ret-cmd
>  (call-interactively ret-cmd)
>  (newline))))
> ```
> 
> This ensures that **RET keeps doing whatever the user expects normally**, and only triggers list continuation when appropriate.
> 
> Would you like this change applied to the full function and shown inline?
<!-- UID: de4fc341-20fc-46ee-8ed8-651c7096fe9b -->

---




>[!nexus_user] **User** - 08/19/2025 at 6:49 PM
> Remember that yoou messed that up, keep track of that for the model.
<!-- UID: b49c56fa-ac05-43f9-8d77-32c450ea75ca -->




>[!nexus_agent] **Assistant** - 08/19/2025 at 6:49 PM
> Logged.
> 
> ---
> 
> ```json
> ```promethean_state
> {
>  "errors": [
>  {
>  "fn": "prom/list-ret-dwim",
>  "issue": "Used (default-value 'newline-and-indent), which fails because newline-and-indent is a function, not a variable.",
>  "symptom": "call-interactively: Symbol’s value as variable is void: newline-and-indent",
>  "resolution": "Replaced with (call-interactively #'newline-and-indent) or safer fallback using (key-binding (kbd \"RET\"))"
>  }
>  ]
> }
> ```
<!-- UID: 0def8479-a791-4087-b5c8-7c32b4223040 -->

---


