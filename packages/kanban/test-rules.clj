(ns test-rules
  "Test rules for ClojureScript interop")

(defn test-eval [from to task board]
  ;; Simple test function that returns true if task has a title
  (and (:title task)
       (= from "todo")
       (= to "in-progress")))

(defn test-eval-js [from to task-js board-js]
  (test-eval from to task-js board-js))

;; Export functions by returning a JS object
#js {:test-eval test-eval
     :test-eval-js test-eval-js}
