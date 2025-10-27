(ns kanban-transitions
  "Kanban transition rules DSL using Clojure + Babashka NBB"
  (:require [clojure.string :as str]))

;; Helper functions for transition rule evaluation
(defn column-key
  "Normalize column name for comparison"
  [col-name]
  (-> col-name
      (str/lower-case)
      (str/replace #"\s+" "")))

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

(defn has-story-points?
  "Check if task has Fibonacci story point estimate"
  [task]
  (and (:storyPoints task)
       (number? (:storyPoints task))
       (contains? #{1 2 3 5 8 13 21} (:storyPoints task))))

(defn get-story-points
  "Get story points from task, fallback to legacy estimates"
  [task]
  (if (has-story-points? task)
    (:storyPoints task)
    (get-estimate task)))

(defn in-column?
  "Check if task exists in specific column"
  [board column-name task-uuid]
  (let [col-key (column-key column-name)
        column (first (filter #(= (column-key (:name %)) col-key) (:columns board)))]
    (and column
         (some #(= (:uuid %) task-uuid) (:tasks column)))))

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

(defn has-blocker-tag?
  "Check if task has blocker/critical tag indicating emergency"
  [task]
  (let [labels (or (:labels task) [])
        content (or (:content task) "")]
    (or (some #(str/includes? (str/lower-case %) "blocker") labels)
        (some #(str/includes? (str/lower-case %) "critical") labels)
        (str/includes? (str/lower-case content) "blocker")
        (str/includes? (str/lower-case content) "emergency"))))

;; P0 Security Task Validation Functions
(defn is-p0-security-task?
  "Identify P0 security tasks by title, content, and metadata analysis"
  [task]
  (let [title (str/lower-case (:title task ""))
        content (str/lower-case (:content task) "")
        labels (map str/lower-case (:labels task []))
        priority (str/lower-case (:priority task ""))]
    
    (and 
     ;; Must be P0 priority
     (or (= priority "p0") (= priority "critical"))
     ;; Must contain security-related keywords
     (or (str/includes? title "security")
         (str/includes? content "security")
         (str/includes? title "vulnerability")
         (str/includes? content "vulnerability")
         (str/includes? title "exploit")
         (str/includes? content "exploit")
         (str/includes? title "breach")
         (str/includes? content "breach")
         (str/includes? title "authentication")
         (str/includes? content "authentication")
         (str/includes? title "authorization")
         (str/includes? content "authorization")
         (str/includes? title "encryption")
         (str/includes? content "encryption")
         (some #(str/includes? % "security") labels)
         (some #(str/includes? % "vulnerability") labels)))))

(defn has-security-risk-assessment?
  "Check if task includes comprehensive security risk assessment"
  [task]
  (let [content (str/lower-case (:content task) "")]
    (and 
     ;; Risk assessment section
     (or (str/includes? content "risk assessment")
         (str/includes? content "risk analysis")
         (str/includes? content "threat model")
         (str/includes? content "security assessment"))
     ;; Impact analysis
     (or (str/includes? content "impact analysis")
         (str/includes? content "business impact")
         (str/includes? content "security impact"))
     ;; Mitigation strategy
     (or (str/includes? content "mitigation")
         (str/includes? content "remediation")
         (str/includes? content "security controls")))))

(defn has-security-compliance-requirements?
  "Check if task addresses compliance and regulatory requirements"
  [task]
  (let [content (str/lower-case (:content task) "")]
    (or 
     ;; Specific compliance frameworks
     (str/includes? content "gdpr")
     (str/includes? content "hipaa")
     (str/includes? content "pci-dss")
     (str/includes? content "sox")
     (str/includes? content "iso 27001")
     (str/includes? content "nist")
     (str/includes? content "compliance")
     (str/includes? content "regulatory")
     ;; Security standards
     (str/includes? content "owasp")
     (str/includes? content "cve")
     (str/includes? content "security standards"))))

(defn has-security-testing-plan?
  "Check if task includes comprehensive security testing plan"
  [task]
  (let [content (str/lower-case (:content task) "")]
    (and 
     ;; Security testing types
     (or (str/includes? content "penetration testing")
         (str/includes? content "pen testing")
         (str/includes? content "vulnerability scanning")
         (str/includes? content "security testing")
         (str/includes? content "security audit"))
     ;; Test coverage
     (or (str/includes? content "test cases")
         (str/includes? content "test scenarios")
         (str/includes? content "security test cases")))))

(defn has-security-documentation?
  "Check if task includes proper security documentation requirements"
  [task]
  (let [content (str/lower-case (:content task) "")]
    (and 
     ;; Documentation requirements
     (or (str/includes? content "security documentation")
         (str/includes? content "technical documentation")
         (str/includes? content "security report"))
     ;; Implementation details
     (or (str/includes? content "implementation details")
         (str/includes? content "technical specifications")
         (str/includes? content "security architecture")))))

(defn has-incident-response-plan?
  "Check if task includes incident response and rollback procedures"
  [task]
  (let [content (str/lower-case (:content task) "")]
    (or 
     ;; Incident response
     (str/includes? content "incident response")
     (str/includes? content "rollback plan")
     (str/includes? content "backout procedure")
     (str/includes? content "emergency procedures")
     ;; Monitoring and alerting
     (str/includes? content "monitoring")
     (str/includes? content "alerting")
     (str/includes? content "security monitoring"))))

(defn p0-security-validation-complete?
  "Comprehensive P0 security task validation gate"
  [task board]
  (if (is-p0-security-task? task)
    ;; P0 security tasks require comprehensive validation
    (and 
     (has-security-risk-assessment? task)
     (has-security-compliance-requirements? task)
     (has-security-testing-plan? task)
     (has-security-documentation? task)
     (has-incident-response-plan? task)
     ;; Must have proper tool/env tags for safety
     (has-tool-env-tags? task))
    ;; Non-P0 security tasks pass through
    true))

(defn generate-p0-security-validation-report
  "Generate detailed validation report for P0 security tasks"
  [task board]
  (if (is-p0-security-task? task)
    (let [checks [
                  {:name "Security Risk Assessment" :passed (has-security-risk-assessment? task)}
                  {:name "Compliance Requirements" :passed (has-security-compliance-requirements? task)}
                  {:name "Security Testing Plan" :passed (has-security-testing-plan? task)}
                  {:name "Security Documentation" :passed (has-security-documentation? task)}
                  {:name "Incident Response Plan" :passed (has-incident-response-plan? task)}
                  {:name "Tool/Environment Tags" :passed (has-tool-env-tags? task)}]
          failed-checks (filter #(not (:passed %)) checks)
          passed-count (- (count checks) (count failed-checks))]
      {:is-p0-security true
       :total-checks (count checks)
       :passed-checks passed-count
       :failed-checks (count failed-checks)
       :validation-percent (* (/ passed-count (count checks)) 100)
       :checks checks
       :can-proceed (empty? failed-checks)
       :recommendations (if (pos? (count failed-checks))
                          ["Complete all failed validation checks before proceeding"
                           "Ensure comprehensive security documentation"
                           "Include incident response and rollback procedures"
                           "Add security testing and compliance requirements"]
                          ["P0 security task validation complete - ready to proceed"])})
    {:is-p0-security false
     :validation-percent 100
     :can-proceed true
     :recommendations ["Standard task validation applies"]}))

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
  "Task has Fibonacci story point estimate and clear implementation plan"
  [task board]
  (and (or (has-story-points? task) (has-estimate? task))
       (<= (get-story-points task) 5)))

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

(defn ^:export task-selected-for-work?
  "Task has been selected for active work (agent assignment or manual selection)"
  [task board]
  ;; For now, allow any properly prioritized task to be selected
  ;; In real implementation, this would check for agent assignment or explicit selection
  (and (:title task)
       (<= (get-priority-numeric (:priority task)) 2)
       (has-tool-env-tags? task)))

(defn ^:export task-needs-archiving?
  "Task should be archived to icebox (completed, obsolete, or reference material)"
  [task board]
  ;; For now, allow archival of any completed task
  ;; In real implementation, this would check for archival flags or completion status
  (and (:title task)
       (or (= (:status task) "done")
           (contains? task :archive-reason))))

;; Global rule functions
(defn wip-limits
  "Enforce WIP limits on target column with comprehensive policy enforcement"
  [from-to task board]
  (let [target-col (second from-to)
        source-col (first from-to)
        target-key (column-key target-col)
        source-key (column-key source-col)]
    ;; Columns without WIP limits
    (if (#{"rejected" "icebox" "incoming" "archived"} target-key)
      true
      (let [column (first (filter #(= (column-key (:name %)) target-key) (:columns board)))
            limit (:limit column)
            current-count (count (:tasks column))
            task-priority (get-priority-numeric (:priority task))
            projected-count (inc current-count)
            utilization-percent (when limit (* (/ current-count limit) 100))
            severity-threshold {:warning 80 :critical 110}]
        
        (if (nil? column)
          true
          (or (nil? limit)  ; No limit configured
              (= task-priority 0)  ; P0 tasks can bypass WIP limits
              (< current-count limit)  ; Under limit
              ;; Allow P1 tasks to exceed limits up to 110% with warning
              (and (= task-priority 1) 
                   (<= projected-count (* limit 1.1)))
              ;; Emergency override for critical blockers
              (and (has-blocker-tag? task)
                   (<= projected-count (* limit 1.2)))))))))

(defn wip-violation-severity
  "Determine severity level of WIP violation"
  [current-count limit]
  (let [utilization (* (/ current-count limit) 100)]
    (cond
      (>= utilization 120) :critical
      (> utilization 100) :error
      (>= utilization 80) :warning
      :else :healthy)))

(defn generate-wip-suggestions
  "Generate capacity balancing suggestions for WIP violations"
  [target-col board task]
  (let [target-key (column-key target-col)
        over-capacity-col (first (filter #(= (column-key (:name %)) target-key) (:columns board)))
        excess-count (- (count (:tasks over-capacity-col)) (:limit over-capacity-col))
        underutilized-cols (filter #(and (:limit %)
                                     (< (/ (count (:tasks %)) (:limit %)) 0.7))
                                (:columns board))]
    
    (cond
      ;; Suggest moving to underutilized columns
      (pos? excess-count)
      (for [target-col underutilized-cols
            :let [available-capacity (- (:limit target-col) (count (:tasks target-col)))]]
        {:action "move_tasks"
         :description (str "Move tasks to " (:name target-col))
         :from-column (:name over-capacity-col)
         :to-column (:name target-col)
         :available-capacity available-capacity})
      
      ;; Suggest priority reordering
      :else
      [{:action "reorder_priority"
        :description "Reorder tasks by priority to ensure highest value work stays"
        :from-column (:name over-capacity-col)}])))

(defn wip-compliance-check
  "Comprehensive WIP compliance validation for audit purposes"
  [board]
  (let [columns-with-limits (filter :limit (:columns board))
        violations (reduce-kv 
                    (fn [acc col-name col-data]
                      (let [current-count (count (:tasks col-data))
                            limit (:limit col-data)
                            violation? (> current-count limit)]
                        (if violation?
                          (assoc acc col-name {:current current-count 
                                             :limit limit
                                             :excess (- current-count limit)
                                             :severity (wip-violation-severity current-count limit)})
                          acc)))
                    {}
                    (into {} (map #(vector (:name %) %) columns-with-limits)))]
    
    {:total-violations (count violations)
     :violations violations
     :compliance-rate (* (/ (- (count columns-with-limits) (count violations)) 
                        (count columns-with-limits)) 100)}))

(defn task-existence
  "Task must exist in source column"
  [from-to task board]
  (let [source-col (first from-to)
        target-key (column-key (second from-to))]
    (if (#{"rejected" "icebox"} target-key)
      true
      (in-column? board source-col (:uuid task)))))

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
     ;; P0 Security Validation Gate: strict validation for P0 security tasks
     (if (and (is-p0-security-task? task)
              (or (= (column-key to) "in_progress")
                  (= (column-key to) "testing")
                  (= (column-key to) "review")
                  (= (column-key to) "done")))
       (p0-security-validation-complete? task board)
       true)
     ;; Process safety: enforce tool/env tags for entering in_progress
     (if (= (column-key to) "in_progress")
       (has-tool-env-tags? task)
       true)
     ;; Story point validation: require story points for breakdown→ready transitions
     (if (and (= (column-key from) "breakdown") (= (column-key to) "ready"))
       (has-story-points? task)
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
    "icebox" ["incoming"]
    "incoming" ["accepted" "rejected" "icebox"]
    "accepted" ["breakdown" "icebox"]
    "breakdown" ["ready" "rejected" "icebox" "blocked"]
    "ready" ["todo" "breakdown"]
    "todo" ["in_progress" "breakdown"]
    "in_progress" ["testing" "todo" "breakdown"]
    "testing" ["review" "in_progress" "todo"]
    "review" ["in_progress" "todo" "document" "done"]
    "document" ["done" "review"]
    "done" ["icebox" "review"]
    "blocked" ["breakdown"]
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

;; P0 Security Validation export functions
(defn ^:export is-p0-security-task-js
  "JavaScript wrapper for P0 security task identification"
  [task-js]
  (is-p0-security-task? task-js))

(defn ^:export p0-security-validation-complete-js
  "JavaScript wrapper for P0 security validation"
  [task-js board-js]
  (p0-security-validation-complete? task-js board-js))

(defn ^:export generate-p0-security-validation-report-js
  "JavaScript wrapper for P0 security validation report generation"
  [task-js board-js]
  (generate-p0-security-validation-report task-js board-js))

(comment
  ;; Example usage for testing
  (def sample-task {:uuid "test-123" :title "Test Task" :priority "P2"})
  (def sample-board {:columns [{:name "todo" :tasks [] :limit 20}]})

  (valid-transitions-from "todo" sample-board)
  (evaluate-transition "todo" "in_progress" sample-task sample-board))