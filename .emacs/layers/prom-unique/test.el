(defun prom/list--first-marker-like (raw)
  (let ((term (aref raw (1- (length raw)))))
    (cond
     ((string-match-p "^[0-9]+" raw) (format "1%c" term))
     ((string-match-p "^[A-Z]"   raw) (format "A%c" term))
     ((string-match-p "^[a-z]"   raw) (format "a%c" term))
     (t raw)))

  (defun prom/list--second-marker-like (raw)
    (let ((term (aref raw (1- (length raw)))))
      (cond
       ((string-match-p "^[0-9]+" raw) (format "2%c" term))
       ((string-match-p "^[A-Z]"   raw) (format "B%c" term))
       ((string-match-p "^[a-z]"   raw) (format "b%c" term))
       (t raw)))

    (defun prom/list--prev-list-indent ()
      "Indent cols of the previous non-blank list line, or nil."
      (save-excursion
        (forward-line -1)
        (while (and (not (bobp)) (looking-at-p "^[[:space:]]*$"))
          (forward-line -1))
        (when (looking-at "^[[:space:]]*\\([-+*]\\|[0-9]+[\\.)]\\|[A-Za-z][\\.)]\\)[[:space:]]+")
          (- (match-beginning 0) (line-beginning-position))))

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
                   (pat (concat "^" (regexp-quote indent) (regexp-quote raw)
                                "\\s-+" (if cb (concat (regexp-quote cb) "\\s-+") "")
                                "\\s-*$"))
                   (empty-item nil))
              ;; Empty item? Clear marker & exit list.
              (save-excursion
                (goto-char bol)
                (setq empty-item (re-search-forward pat nil t))
                (when empty-item (delete-region bol eol)))
              (if empty-item
                  (newline)
                ;; Maybe restart current marker if we are deeper than previous list line
                (let* ((prev-indent (prom/list--prev-list-indent))
                       (deep? (and prev-indent
                                   (> (length indent) prev-indent)
                                   (or (string-match-p "^[0-9]+" raw)
                                       (string-match-p "^[A-Za-z]" raw))))
                       (next (plist-get m :next)))
                  (when deep?
                    (let ((first (prom/list--first-marker-like raw)))
                      (save-excursion
                        (goto-char bol)
                        (when (looking-at "^[[:space:]]*\\([-+*]\\|[0-9]+[\\.)]\\|[A-Za-z][\\.)]\\)")
                          (let ((s (match-beginning 1)) (e (match-end 1)))
                            (unless (string-equal (match-string 1) first)
                              (goto-char s)
                              (delete-region s e)
                              (insert first))))))
                    (setq next (prom/list--second-marker-like raw)))
                  ;; Insert the next item and move point onto it
                  (goto-char eol)
                  (newline)
                  (insert indent next " ")
                  (when cb (insert cb " "))))))))
