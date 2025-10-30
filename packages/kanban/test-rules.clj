(ns test-rules
  "Test rules for ClojureScript interop")

(defn test-eval [from to task board]
  ;; Simple test function that returns true if task has a title
  (and (:title task)
       (= from "todo")
       (= to "in-progress")))

(defn ^:export test-eval [from to task-js board-js]
  (test-eval from to task-js board-js))

;; Also export with a different name for testing
(defn ^:export test-eval-js [from to task-js board-js]
  (test-eval from to task-js board-js))