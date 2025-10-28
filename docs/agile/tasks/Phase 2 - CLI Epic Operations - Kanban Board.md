---
uuid: '07bc6e1c-phase2-001'
title: 'Phase 2: CLI Epic Operations - Kanban Board'
slug: 'phase-2-cli-epic-operations-kanban-board'
status: 'breakdown'
priority: 'P1'
labels: ['epic', 'cli', 'operations', 'kanban']
created_at: '2025-10-28T00:00:00Z'
estimates:
  complexity: '3'
  scale: 'medium'
  time_to_completion: '2 sessions'
storyPoints: 3
---

# Phase 2: CLI Epic Operations - Kanban Board

## 🎯 Objective

Implement CLI commands and operations for managing epics and subtasks in the kanban board system. This includes epic creation, subtask linking, status management, and relationship operations.

## 📋 Scope

### Core CLI Operations

1. **Epic Creation**
   - Create new epic tasks
   - Convert existing tasks to epics
   - Epic initialization and setup

2. **Subtask Management**
   - Link tasks to epics as subtasks
   - Unlink subtasks from epics
   - Bulk subtask operations

3. **Epic Status Operations**
   - Update epic status manually
   - Force epic transitions
   - Epic blocking/unblocking

4. **Relationship Queries**
   - List epic subtasks
   - Find epic parent of subtask
   - Show epic hierarchy and status

## 🔧 Implementation Details

### CLI Command Structure

```clojure
(ns promethean.kanban.cli.epic-commands)

;; Epic command group
(def epic-commands
  {"create" create-epic-command
   "convert" convert-to-epic-command
   "link" link-subtask-command
   "unlink" unlink-subtask-command
   "status" epic-status-command
   "list" list-epic-command
   "show" show-epic-command
   "force-transition" force-epic-transition-command})

;; Command definitions
(defn create-epic-command
  "Create a new epic task"
  [args]
  {:command :create-epic
   :args args
   :options {:title {:required true :description "Epic title"}
             :description {:description "Epic description"}
             :priority {:default "P1" :description "Epic priority"}
             :labels {:description "Epic labels (comma-separated)"}
             :interactive {:type :boolean :default false :description "Interactive mode"}}})

(defn convert-to-epic-command
  "Convert existing task to epic"
  [args]
  {:command :convert-to-epic
   :args args
   :options {:task-id {:required true :description "Task UUID to convert"}
             :interactive {:type :boolean :default false :description "Interactive mode"}}})

(defn link-subtask-command
  "Link subtask to epic"
  [args]
  {:command :link-subtask
   :args args
   :options {:epic-id {:required true :description "Epic UUID"}
             :subtask-id {:required true :description "Subtask UUID"}
             :interactive {:type :boolean :default false :description "Interactive mode"}}})

(defn unlink-subtask-command
  "Unlink subtask from epic"
  [args]
  {:command :unlink-subtask
   :args args
   :options {:epic-id {:required true :description "Epic UUID"}
             :subtask-id {:required true :description "Subtask UUID"}
             :interactive {:type :boolean :default false :description "Interactive mode"}}})
```

### Epic Creation Logic

```clojure
(defn create-epic!
  "Create a new epic task"
  [title & {:keys [description priority labels interactive]
             :or {priority "P1" labels [] interactive false}}]
  (let [epic-data {:uuid (generate-uuid)
                    :title title
                    :description description
                    :status "breakdown"
                    :priority priority
                    :labels (conj labels "epic")
                    :task_type :epic
                    :epic_subtasks []
                    :epic_status :not-started
                    :epic_progress 0
                    :epic_blocking_reason nil
                    :created_at (Instant/now)
                    :updated_at (Instant/now)
                    :estimates {:complexity 8 :scale "large" :time_to_completion "4 sessions"}
                    :storyPoints 8}]
    
    (if interactive
      (create-epic-interactive! epic-data)
      (do
        (validate-epic-data epic-data)
        (save-epic! epic-data)
        (println "✅ Epic created:" (:uuid epic-data))
        (println "📋 Title:" title)
        (println "🎯 Priority:" priority)
        epic-data))))

(defn create-epic-interactive!
  "Create epic with interactive prompts"
  [epic-data]
  (let [title (or (:title epic-data) (prompt "Epic title: "))
        description (or (:description epic-data) (prompt "Epic description (optional): "))
        priority (or (:priority epic-data) (prompt "Priority (P0-P3): " "P1"))
        labels (or (:labels epic-data) (prompt "Labels (comma-separated): " ""))]
    (create-epic! title 
                  :description description
                  :priority priority
                  :labels (if (empty? labels) [] (str/split labels #",\s*"))
                  :interactive false)))

(defn convert-to-epic!
  "Convert existing task to epic"
  [task-id & {:keys [interactive]}]
  (let [task (get-task task-id)]
    (if (nil? task)
      (println "❌ Task not found:" task-id)
      (let [updated-task (-> task
                           (assoc :task_type :epic)
                           (assoc :epic_subtasks [])
                           (assoc :epic_status :not-started)
                           (assoc :epic_progress 0)
                           (assoc :epic_blocking_reason nil)
                           (update :labels conj "epic")
                           (assoc :updated_at (Instant/now)))]
        (if interactive
          (confirm-conversion! task updated-task)
          (do
            (save-epic! updated-task)
            (println "✅ Task converted to epic:" task-id)
            (println "📋 Title:" (:title task))
            updated-task))))))

(defn confirm-conversion!
  "Confirm task conversion to epic"
  [original-task updated-task]
  (println "📋 Converting task to epic:")
  (println "   Title:" (:title original-task))
  (println "   Current status:" (:status original-task))
  (println "   New type: EPIC")
  (when (confirm "Continue with conversion? [y/N]")
    (save-epic! updated-task)
    (println "✅ Task converted to epic:" (:uuid original-task))
    updated-task))
```

### Subtask Management Operations

```clojure
(defn link-subtask-to-epic!
  "Link a subtask to an epic"
  [epic-id subtask-id & {:keys [interactive]}]
  (let [epic (get-epic epic-id)
        subtask (get-task subtask-id)]
    (cond
      (nil? epic)
      (println "❌ Epic not found:" epic-id)
      
      (nil? subtask)
      (println "❌ Subtask not found:" subtask-id)
      
      (not= (:task_type epic) :epic)
      (println "❌ Task is not an epic:" epic-id)
      
      (= (:task_type subtask) :epic)
      (println "❌ Cannot link epic as subtask:" subtask-id)
      
      (:epic_parent subtask)
      (println "❌ Subtask already has epic parent:" (:epic_parent subtask-id))
      
      :else
      (if interactive
        (confirm-linking! epic subtask)
        (do
          (perform-linking! epic subtask)
          (println "✅ Linked subtask" subtask-id "to epic" epic-id)
          {:epic-id epic-id :subtask-id subtask-id :action :linked})))))

(defn unlink-subtask-from-epic!
  "Unlink a subtask from an epic"
  [epic-id subtask-id & {:keys [interactive]}]
  (let [epic (get-epic epic-id)
        subtask (get-task subtask-id)]
    (cond
      (nil? epic)
      (println "❌ Epic not found:" epic-id)
      
      (nil? subtask)
      (println "❌ Subtask not found:" subtask-id)
      
      (not= (:epic_parent subtask) epic-id)
      (println "❌ Subtask not linked to this epic:" subtask-id)
      
      :else
      (if interactive
        (confirm-unlinking! epic subtask)
        (do
          (perform-unlinking! epic subtask)
          (println "✅ Unlinked subtask" subtask-id "from epic" epic-id)
          {:epic-id epic-id :subtask-id subtask-id :action :unlinked})))))

(defn perform-linking!
  "Perform the actual linking operation"
  [epic subtask]
  ;; Update epic subtasks list
  (let [updated-epic (update epic :epic_subtasks conj (:uuid subtask))]
    (save-epic! updated-epic))
  
  ;; Update subtask parent reference
  (let [updated-subtask (assoc subtask :epic_parent (:uuid epic))]
    (save-task! updated-subtask))
  
  ;; Update epic status
  (update-epic-status! (:uuid epic)))

(defn perform-unlinking!
  "Perform the actual unlinking operation"
  [epic subtask]
  ;; Update epic subtasks list
  (let [updated-epic (update epic :epic_subtasks 
                           #(remove (fn [id] (= id (:uuid subtask))) %))]
    (save-epic! updated-epic))
  
  ;; Update subtask parent reference
  (let [updated-subtask (dissoc subtask :epic_parent)]
    (save-task! updated-subtask))
  
  ;; Update epic status
  (update-epic-status! (:uuid epic)))
```

### Epic Status Operations

```clojure
(defn update-epic-status!
  "Update epic status based on subtasks"
  [epic-id]
  (let [epic (get-epic epic-id)
        subtask-uuids (:epic_subtasks epic)
        subtasks (map get-task subtask-uuids)
        new-status (calculate-epic-status epic-id subtasks)
        new-progress (calculate-epic-progress epic-id subtasks)
        blocking-reasons (get-epic-blocking-reasons epic-id subtasks)]
    
    (let [updated-epic (-> epic
                           (assoc :epic_status new-status)
                           (assoc :epic_progress new-progress)
                           (assoc :epic_blocking_reason (when (= new-status :blocked)
                                                        (first blocking-reasons)))
                           (assoc :updated_at (Instant/now)))]
      (save-epic! updated-epic)
      updated-epic)))

(defn force-epic-transition!
  "Force epic transition (admin operation)"
  [epic-id new-status & {:keys [reason interactive]}]
  (let [epic (get-epic epic-id)]
    (if (nil? epic)
      (println "❌ Epic not found:" epic-id)
      (if (not= (:task_type epic) :epic)
        (println "❌ Task is not an epic:" epic-id)
        (if interactive
          (confirm-force-transition! epic new-status reason)
          (do
            (perform-force-transition! epic new-status reason)
            (println "✅ Epic" epic-id "forced to status:" new-status)
            {:epic-id epic-id :old-status (:epic_status epic) :new-status new-status}))))))

(defn confirm-force-transition!
  "Confirm force epic transition"
  [epic new-status reason]
  (println "⚠️  Force epic transition:")
  (println "   Epic:" (:title epic) "(" (:uuid epic) ")")
  (println "   Current status:" (:epic_status epic))
  (println "   New status:" new-status)
  (when reason
    (println "   Reason:" reason))
  (when (confirm "Force this transition? [y/N]")
    (perform-force-transition! epic new-status reason)))
```

### Query and Display Operations

```clojure
(defn list-epics
  "List all epics with their status"
  [& {:keys [status format]
     :or {format :table}}]
  (let [epics (get-all-epics)
        filtered-epics (if status
                         (filter #(= (:epic_status %) status) epics)
                         epics)]
    (case format
      :table (display-epics-table filtered-epics)
      :json (json/generate-string filtered-epics)
      :simple (display-epics-simple filtered-epics))))

(defn show-epic-details
  "Show detailed epic information"
  [epic-id & {:keys [include-subtasks format]
               :or {include-subtasks true format :detailed}}]
  (let [epic (get-epic epic-id)]
    (if (nil? epic)
      (println "❌ Epic not found:" epic-id)
      (let [subtasks (when include-subtasks
                       (map get-task (:epic_subtasks epic)))]
        (case format
          :detailed (display-epic-detailed epic subtasks)
          :summary (display-epic-summary epic)
          :json (json/generate-string {:epic epic :subtasks subtasks}))))))

(defn display-epics-table
  "Display epics in table format"
  [epics]
  (println "\n📋 Epics:")
  (println (format "%-36s %-20s %-10s %-8s %s"
                   "UUID" "Title" "Status" "Progress" "Priority"))
  (println (str (apply str (repeat 80 "-")))
  (doseq [epic epics]
    (println (format "%-36s %-20s %-10s %-8s %s"
                     (:uuid epic)
                     (subs (:title epic) 0 20)
                     (:epic_status epic)
                     (str (:epic_progress epic) "%")
                     (:priority epic)))))

(defn display-epic-detailed
  "Display epic with full details"
  [epic subtasks]
  (println "\n🎯 Epic Details:")
  (println "   UUID:" (:uuid epic))
  (println "   Title:" (:title epic))
  (println "   Description:" (or (:description epic) "No description"))
  (println "   Status:" (:epic_status epic))
  (println "   Progress:" (:epic_progress epic) "%")
  (println "   Priority:" (:priority epic))
  (println "   Created:" (:created_at epic))
  (println "   Updated:" (:updated_at epic))
  (when (:epic_blocking_reason epic)
    (println "   Blocking Reason:" (:epic_blocking_reason epic)))
  
  (when (seq subtasks)
    (println "\n📝 Subtasks:")
    (println (format "%-36s %-20s %-10s %s"
                     "UUID" "Title" "Status" "Priority"))
    (println (str (apply str (repeat 80 "-")))
    (doseq [subtask subtasks]
      (println (format "%-36s %-20s %-10s %s"
                       (:uuid subtask)
                       (subs (:title subtask) 0 20)
                       (:status subtask)
                       (:priority subtask))))))
```

## ✅ Acceptance Criteria

1. **Epic Creation**
   - Create new epics with proper metadata
   - Convert existing tasks to epics
   - Interactive and batch modes supported

2. **Subtask Management**
   - Link/unlink subtasks to/from epics
   - Validate relationships and prevent conflicts
   - Bulk operations supported

3. **Status Operations**
   - Automatic epic status calculation
   - Manual status updates with confirmation
   - Force transition capabilities

4. **Query and Display**
   - List epics with filtering options
   - Show detailed epic information
   - Multiple output formats (table, JSON, simple)

## 🧪 Testing Requirements

### CLI Command Tests

```clojure
(deftest test-epic-creation
  (testing "Create new epic"
    (let [epic (create-epic! "Test Epic" :description "Test description")]
      (is (= "Test Epic" (:title epic)))
      (is (= :epic (:task_type epic)))
      (is (= :not-started (:epic_status epic)))
      (is (= 0 (:epic_progress epic)))))
  
  (testing "Convert task to epic"
    (let [task {:uuid "task-1" :title "Task 1" :task_type :normal}
          epic (convert-to-epic! "task-1")]
      (is (= :epic (:task_type epic)))
      (is (contains? (:labels epic) "epic")))))

(deftest test-subtask-management
  (let [epic (create-epic! "Test Epic")
        subtask {:uuid "subtask-1" :title "Subtask 1" :task_type :normal}]
    
    (testing "Link subtask to epic"
      (let [result (link-subtask-to-epic! (:uuid epic) (:uuid subtask))]
        (is (= (:uuid epic) (:epic-id result)))
        (is (= (:uuid subtask) (:subtask-id result)))))
    
    (testing "Unlink subtask from epic"
      (let [result (unlink-subtask-from-epic! (:uuid epic) (:uuid subtask))]
        (is (= (:uuid epic) (:epic-id result)))
        (is (= (:uuid subtask) (:subtask-id result)))))))
```

## 📁 File Structure

```
src/promethean/kanban/cli/
├── epic/
│   ├── commands.clj                 # Epic CLI command definitions
│   ├── creation.clj                 # Epic creation logic
│   ├── conversion.clj               # Task to epic conversion
│   ├── linking.clj                  # Subtask linking/unlinking
│   ├── status.clj                   # Epic status operations
│   ├── queries.clj                  # Epic query operations
│   ├── display.clj                  # Epic display formatting
│   └── interactive.clj              # Interactive mode helpers
└── integration/
    ├── command_router.clj            # CLI routing for epic commands
    ├── validation.clj                # Command validation
    └── error_handling.clj           # Error handling for epic operations
```

## 🔗 Dependencies

- Epic data model (Phase 1)
- Existing kanban CLI infrastructure
- Task management system
- JSON generation utilities

## 🚀 Deliverables

1. **Epic CLI Commands** - Complete command set for epic management
2. **Interactive Mode** - User-friendly interactive operations
3. **Validation Logic** - Command validation and error handling
4. **Display Functions** - Multiple output formats for epic data
5. **Integration Tests** - CLI command testing suite

## ⏱️ Timeline

**Estimated Time**: 2 sessions (8-12 hours)
**Dependencies**: Phase 1 (Epic Data Model Design)
**Blockers**: None

## 🎯 Success Metrics

- ✅ Complete epic CLI functionality
- ✅ Intuitive interactive mode
- ✅ Robust validation and error handling
- ✅ Multiple output formats
- ✅ Comprehensive test coverage (>95%)

---

## 📝 Notes

The CLI operations should be designed with user experience in mind, providing both interactive and batch modes for different use cases. Error messages should be clear and actionable, and operations should provide confirmation for destructive actions. The CLI should integrate seamlessly with existing kanban commands while providing epic-specific functionality.