;;; funcs.el --- promethean helpers -*- lexical-binding: t; -*-

;; ─────────────────────────────────────────────────────────────────────────────
;; Visual regex inspectors (temporary overlay flash)
;; What this provides:
;;   Commands that highlight all matches of a given regex in the current buffer
;;   for ~1 second, so you can visually verify the pattern’s behavior.
;;   These DO NOT modify the buffer; overlays auto-clean.
;; ─────────────────────────────────────────────────────────────────────────────

(defface promethean-regex-test-face
  '((t :underline t :background "#333344"))
  "Face used to highlight regex test matches temporarily.")

(defun promethean--highlight-matches (re)
  "Highlight all matches of RE in the current buffer for ~1s."
  (save-excursion
    (let ((ovs nil))
      (goto-char (point-min))
      (while (re-search-forward re nil t)
        (let ((ov (make-overlay (match-beginning 0) (match-end 0))))
          (overlay-put ov 'face 'promethean-regex-test-face)
          (push ov ovs)))
      (run-with-timer 1.0 nil (lambda (xs) (mapc #'delete-overlay xs)) ovs)
      (message "Promethean: highlighted %d matches for %S" (length ovs) re))))

;; What these do (English):
;;   - Highlight all keyword tokens that match our keyword regex; should NOT
;;     match longer symbols like 'definitely'.
(defun promethean-regex-test-keywords ()
  "Flash matches for keyword regex."
  (interactive)
  (promethean--highlight-matches promethean--re-keywords))

;; What these do (English):
;;   - Highlight all builtin/operator tokens; should NOT match '++' etc.
(defun promethean-regex-test-builtins ()
  "Flash matches for builtin regex."
  (interactive)
  (promethean--highlight-matches promethean--re-builtins))

;; What these do (English):
;;   - Highlight constants :true, :false, :nil as standalone symbols only.
(defun promethean-regex-test-const ()
  "Flash matches for constants regex."
  (interactive)
  (promethean--highlight-matches promethean--re-const))

;; What these do (English):
;;   - Highlight integer/decimal numbers (optional leading '-') as full symbols.
;;     Should not match malformed numbers like '3.14.15'.
(defun promethean-regex-test-number ()
  "Flash matches for number regex."
  (interactive)
  (promethean--highlight-matches promethean--re-number))

;; What these do (English):
//   - Highlight definition heads like `(defun NAME ...)` or `(def NAME ...)`
//     Captures keyword (group 1) and NAME (group 2).
(defun promethean-regex-test-def-name ()
  "Flash matches for definition-head regex."
  (interactive)
  (promethean--highlight-matches promethean--re-def-name))

;; ─────────────────────────────────────────────────────────────────────────────
;; ERT tests (run with: M-x ert RET promethean-regex-tests RET)
;; What these cover:
;;   - Sanity checks that each regex matches intended examples and rejects
;;     near-misses, so debugging is faster and intent is always explicit.
;; ─────────────────────────────────────────────────────────────────────────────

(require 'ert)

(ert-deftest promethean-regex-tests ()
  "Sanity checks for Promethean regexes (keywords, builtins, const, number, def-head)."

  ;; Keywords: should match full symbol 'def' but not 'definitely'.
  (should (string-match-p promethean--re-keywords " (def x)"))
  (should-not (string-match-p promethean--re-keywords " (definitely x)"))

  ;; Builtins: should match '+' as a symbol, not '++'.
  (should (string-match-p promethean--re-builtins " (+ x 1)"))
  (should-not (string-match-p promethean--re-builtins " (++ x)"))

  ;; Constants: :true / :false / :nil only.
  (should (string-match-p promethean--re-const ":true"))
  (should-not (string-match-p promethean--re-const "truely"))
  (should-not (string-match-p promethean--re-const ":nilpotent"))

  ;; Numbers: integer or decimal, optional leading '-', bounded by symbol edges.
  (should (string-match-p promethean--re-number "-42"))
  (should (string-match-p promethean--re-number "3.1415"))
  (should (string-match-p promethean--re-number "0"))
  (should-not (string-match-p promethean--re-number "3.14.15"))
  (should-not (string-match-p promethean--re-number "-"))

  ;; Definition heads: (defun|def NAME ...)
  (let* ((s "(defun greet-user name)")
         (m (string-match promethean--re-def-name s)))
    (should m)
    (should (equal (match-string 1 s) "defun"))
    (should (equal (match-string 2 s) "greet-user"))))
