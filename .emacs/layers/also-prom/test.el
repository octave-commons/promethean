(require 'ert)

(ert-deftest promethean-regex-tests ()
  ;; Keywords
  (should (string-match-p promethean--re-keywords " (def foo)"))
  (should-not (string-match-p promethean--re-keywords " (definitely)"))
  ;; Builtins
  (should (string-match-p promethean--re-builtins " (+ x 1)"))
  (should-not (string-match-p promethean--re-builtins " (++ x)"))
  ;; Constants
  (should (string-match-p promethean--re-const ":true"))
  (should-not (string-match-p promethean--re-const "truely"))
  ;; Numbers
  (should (string-match-p promethean--re-number "-42"))
  (should (string-match-p promethean--re-number "3.1415"))
  (should-not (string-match-p promethean--re-number "3.14.15"))
  ;; Def head: captures
  (let* ((s "(defun greet-user name)")
         (m (string-match promethean--re-def-name s)))
    (should m)
    (should (equal (match-string 1 s) "defun"))
    (should (equal (match-string 2 s) "greet-user"))))
