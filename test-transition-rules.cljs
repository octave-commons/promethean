(require '["docs/agile/rules/kanban-transitions.clj" :as kt])

;; Test basic transition validation
(println "Testing basic transition validation...")

;; Test valid transition
(def valid-result (kt/evaluate-transition "todo" "in_progress" {:uuid "test-123" :title "Test Task" :priority "P2" :labels ["tool:cli" "env:dev"]} {:columns [{:name "todo" :tasks ["test-123"] :limit 20} {:name "in_progress" :tasks [] :limit 5}]}))
(println "Valid transition todo->in_progress:" valid-result)

;; Test invalid transition  
(def invalid-result (kt/evaluate-transition "done" "todo" {:uuid "test-456" :title "Test Task 2" :priority "P2"} {:columns [{:name "done" :tasks ["test-456"] :limit 20} {:name "todo" :tasks [] :limit 20}]}))
(println "Invalid transition done->todo:" invalid-result)

;; Test valid transitions list
(def transitions (kt/valid-transitions-from "todo" {:columns []}))
(println "Valid transitions from todo:" transitions)

(println "Clojure transition rules test completed!")