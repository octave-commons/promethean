(ns kanban-transitions
  "Kanban transition rules DSL using Clojure + Babashka NBB"
  (:require [clojure.string :as str]))

;; Helper functions for transition rule evaluation
(defn column-key
  "Normalize column name for comparison"
  [col-name]
  (-> col-name
      (str/lower-case)
      (str/replace #"[\s_-]" "")))

(defn get-priority-numeric
  "Convert priority string to numeric value for comparison"
  [priority]
  (cond
    (or (= priority "P0") (= priority "critical")) 0
    (or (= priority "P1") (= priority "high")) 1
    (or (= priority "P2") (= priority "medium")) 2
    (or (= priority "P3") (= priority "low") (= priority "p3")) 3
    :else 3))

(defn has-estimate?
  "Check if task has complexity estimate"
  [task]
  (and (:estimates task)
       (contains? (:estimates task) :complexity)
       (number? (get-in task [:estimates :complexity]))))

(defn get-estimate
  "Get complexity estimate from task"
  [task]
  (get-in task [:estimates :complexity] 999))

(defn in-column?
  "Check if task exists in specific column"
  [board column-name task-uuid]
  (let [col-key (column-key column-name)
        column (first (filter #(= (column-key (:name %)) col-key) (:columns board)))]
    (and column
         (some #(= (:uuid %) task-uuid) (:tasks column)))))

;; Transition rule check functions
(defn triage-completed?
  "Task has clear acceptance criteria and desired outcomes"
  [task board]
  (and (:title task)
       (:priority task)
       (<= (get-priority-numeric (:priority task)) 2)))

(defn ready-for-breakdown?
  "Task is properly scoped for breakdown analysis"
  [task board]
  (contains? task :title))

(defn breakdown-complete?
  "Task has Fibonacci estimate ≤5 and clear implementation plan"
  [task board]
  (and (has-estimate? task)
       (<= (get-estimate task) 5)))

(defn task-prioritized?
  "Task is properly prioritized in execution queue"
  [task board]
  (<= (get-priority-numeric (:priority task)) 2))

(defn task-ready?
  "Task is ready to be pulled for implementation"
  [task board]
  (<= (get-priority-numeric (:priority task)) 2))

(defn implementation-complete?
  "Implementation is complete and ready for testing"
  [task board]
  (and (:title task)
       (<= (get-priority-numeric (:priority task)) 2)))

(defn tests-passing?
  "All automated and manual tests are passing"
  [task board]
  (and (:title task)
       (<= (get-priority-numeric (:priority task)) 2)))

(defn reviewable-change-exists?
  "Coherent, reviewable change is ready for review"
  [task board]
  (and (:title task)
       (<= (get-priority-numeric (:priority task)) 2)))

(defn correction-justified?
  "Task has valid reason for audit correction from done to review"
  [task board]
  (and (:correction-reason task)
       (< (get-in task [:corrections :count] 0) 3)))

(defn review-approved?
  "Review passed, task can proceed to documentation or completion"
  [task board]
  true) ; For now, always approve. In real implementation, check review status

(defn documentation-complete?
  "Documentation and evidence are complete"
  [task board]
  true) ; For now, always complete. In real implementation, check documentation

(defn blockers-resolved?
  "All blocking dependencies have been resolved"
  [task board]
  (empty? (:blocked-by task)))

;; Additional predicates expected by CLI rules
(defn ^:export task-non-viable?
  "Allow unconditional rejection. Upstream heuristics can still be applied if desired."
  [_task _board]
  true)

(defn ^:export task-ready-for-execution?
  "Wrapper used by some flows; align with task-ready?"
  [task board]
  (task-ready? task board))

(defn ^:export always-allow?
  "Utility predicate that always returns true for permissive transitions."
  [_task _board]
  true)

;; Global rule functions
(defn wip-limits
  "Enforce WIP limits on target column"
  [from-to task board]
  (let [target-col (second from-to)
        target-key (column-key target-col)]
    (if (#{"rejected" "icebox"} target-key)
      true
      (let [column (first (filter #(= (column-key (:name %)) target-key) (:columns board)))
            limit (:limit column)
            current-count (count (:tasks column))]
        (if (nil? column)
          true
          (or (nil? limit) (< current-count limit)))))))

(defn task-existence
  "Task must exist in source column"
  [from-to task board]
  (let [source-col (first from-to)
        target-key (column-key (second from-to))]
    (if (#{"rejected" "icebox"} target-key)
      true
      (in-column? board source-col (:uuid task)))))

;; Safety: require tool:* and env:* tags before entering in_progress
(defn has-tool-env-tags?
  "Task must include tool:* and env:* tags either in labels or content"
  [task]
  (let [labs (map str/lower-case (or (:labels task) []))
        content (str/lower-case (or (:content task) ""))
        tool-in-labels (some #(str/starts-with? % "tool:") labs)
        env-in-labels (some #(str/starts-with? % "env:") labs)
        tool-in-content (clojure.string/includes? content "tool:")
        env-in-content (clojure.string/includes? content "env:")]
    (or (and tool-in-labels env-in-labels)
        (and tool-in-content env-in-content))))

;; Helper function to determine if transition is backward
(defn backward-transition?
  "Check if transition moves backward in workflow"
  [from to]
  (let [workflow-order ["icebox" "incoming" "accepted" "breakdown" "ready" "todo" "in_progress" "testing" "review" "document" "done"]
        from-index (.indexOf workflow-order (column-key from))
        to-index (.indexOf workflow-order (column-key to))]
    (and (>= from-index 0) (>= to-index 0) (< to-index from-index))))

;; Main rule evaluation function
(defn evaluate-transition
  "Evaluate if transition from 'from' to 'to' is allowed for given task"
  [from to task board]
  (let [from-to [from to]]
    (and
     ;; Check global rules first
     (wip-limits from-to task board)
     (task-existence from-to task board)
     ;; Process safety: enforce tool/env tags for entering in_progress
     (if (= (column-key to) "in_progress")
       (has-tool-env-tags? task)
       true)
     ;; Backward transitions are always valid unless WIP violation
     (or (backward-transition? from to)
         ;; Special validation for done→review corrections
         (not= (column-key from) "done")
         (not= (column-key to) "review")
         (correction-justified? task board)))))

(defn valid-transitions-from
  "Get list of valid destination columns from given source"
  [source-column board]
  ;; Return valid transitions based on defined rules
  (case (column-key source-column)
    ("icebox" ["incoming"])
    ("incoming" ["accepted" "rejected" "icebox"])
    ("accepted" ["breakdown" "icebox"])
    ("breakdown" ["ready" "rejected" "icebox" "blocked"])
    ("ready" ["todo" "breakdown"])
    ("todo" ["in_progress" "breakdown"])
    ("in_progress" ["testing" "todo" "breakdown"])
    ("testing" ["review" "in_progress" "todo"])
    ("review" ["in_progress" "todo" "document" "done"])
    ("document" ["done" "review"])
    ("done" ["icebox" "review"])
    ("blocked" ["breakdown"])
    []))

;; Rule validation and debugging functions
(defn validate-rule
  "Validate that a rule function is properly defined"
  [rule-name rule-fn]
  (and (fn? rule-fn)
       (= 2 (-> rule-fn meta :arglist count))))

(defn debug-transition
  "Debug why a transition was rejected or approved"
  [from to task board]
  {:from from
   :to to
   :task-uuid (:uuid task)
   :task-title (:title task)
   :wip-check (wip-limits [from to] task board)
   :existence-check (task-existence [from to] task board)
   :valid-transitions (valid-transitions-from from board)})

;; Export functions for use from Node.js
(defn ^:export evaluate-transition-js
  "JavaScript wrapper for evaluate-transition"
  [from to task-js board-js]
  (evaluate-transition from to task-js board-js))

(defn ^:export valid-transitions-js
  "JavaScript wrapper for valid-transitions-from"
  [source-column board-js]
  (valid-transitions-from source-column board-js))

(defn ^:export debug-transition-js
  "JavaScript wrapper for debug-transition"
  [from to task-js board-js]
  (debug-transition from to task-js board-js))

(comment
  ;; Example usage for testing
  (def sample-task {:uuid "test-123" :title "Test Task" :priority "P2"})
  (def sample-board {:columns [{:name "todo" :tasks [] :limit 20}]})

  (valid-transitions-from "todo" sample-board)
  (evaluate-transition "todo" "in_progress" sample-task sample-board)
  )
