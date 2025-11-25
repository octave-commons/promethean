(ns test-rules)

(defn direct-allow?
  "Simple rule used for direct function call tests"
  [from to]
  (and (= from "incoming") (= to "ready")))

(defn inline-allow?
  "Example rule that checks task metadata"
  [task board]
  (and (= (:title task) "Test Task")
       (seq (:columns board))))
