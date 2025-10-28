---
uuid: '07bc6e1c-phase1-001'
title: 'Phase 1: Epic Data Model Design - Kanban Board'
slug: 'phase-1-epic-data-model-design-kanban-board'
status: 'breakdown'
priority: 'P1'
labels: ['epic', 'data-model', 'kanban', 'design']
created_at: '2025-10-28T00:00:00Z'
estimates:
  complexity: '3'
  scale: 'medium'
  time_to_completion: '2 sessions'
storyPoints: 3
---

# Phase 1: Epic Data Model Design - Kanban Board

## 🎯 Objective

Design and implement the data model extensions needed to support epic-subtask relationships in the kanban board system. This includes schema extensions, relationship definitions, and data validation logic.

## 📋 Scope

### Core Data Model Components

1. **Epic Task Type**
   - Define epic as special task type
   - Epic-specific metadata fields
   - Epic status and state management

2. **Subtask Relationships**
   - Parent-child relationship definitions
   - Bidirectional linking between epics and subtasks
   - Relationship validation and constraints

3. **Schema Extensions**
   - Extend existing task schema
   - Add epic-specific fields
   - Maintain backward compatibility

4. **Data Validation**
   - Epic-subtask relationship validation
   - Circular dependency prevention
   - Data integrity constraints

## 🔧 Implementation Details

### Epic Task Schema Extension

```clojure
;; Extended task schema for epic support
(def epic-task-schema
  "Schema definition for epic tasks"
  {:type :object
   :properties {:uuid {:type :string :required true}
               :title {:type :string :required true}
               :description {:type :string}
               :status {:type :string :enum task-statuses}
               :priority {:type :string :enum priorities}
               :labels {:type :array :items {:type :string}}
               :created_at {:type :string :format "date-time"}
               :updated_at {:type :string :format "date-time"}
               :estimates {:type :object}
               :storyPoints {:type :number}
               ;; Epic-specific fields
               :task_type {:type :string :enum [:normal :epic] :default :normal}
               :epic_subtasks {:type :array :items {:type :string}}
               :epic_parent {:type :string}
               :epic_status {:type :string :enum [:not-started :in-progress :blocked :completed]}
               :epic_progress {:type :number :minimum 0 :maximum 100}
               :epic_blocking_reason {:type :string}}
   :required [:uuid :title :status :priority :task_type]})

(def normal-task-schema
  "Schema for normal tasks with epic relationship support"
  (assoc epic-task-schema :properties
         (merge (:properties epic-task-schema)
                {:epic_parent {:type :string :description "UUID of parent epic"}}))
```

### Epic Data Structures

```clojure
(ns promethean.kanban.epic.model)

(defrecord EpicTask [uuid title description status priority labels 
                   created_at updated_at estimates storyPoints
                   epic_subtasks epic_status epic_progress epic_blocking_reason])

(defrecord EpicRelationship [parent-uuid child-uuid relationship-type created_at])

(defrecord EpicStatus [total-subtasks completed-subtasks 
                     blocked-subtasks in-progress-subtasks
                     overall-progress blocking-reasons])

;; Epic type definitions
(def task-types #{:normal :epic})

(def epic-statuses #{:not-started :in-progress :blocked :completed})

(def relationship-types #{:parent-child :child-parent})
```

### Relationship Management

```clojure
(defn create-epic-relationship
  "Create a parent-child relationship between epic and subtask"
  [epic-uuid subtask-uuid]
  {:parent-uuid epic-uuid
   :child-uuid subtask-uuid
   :relationship-type :parent-child
   :created_at (Instant/now)})

(defn validate-epic-relationship
  "Validate epic-subtask relationship for data integrity"
  [epic-uuid subtask-uuid existing-relationships]
  (let [epic-task (get-task epic-uuid)
        subtask-task (get-task subtask-uuid)]
    (and
     ;; Epic must exist and be epic type
     (and epic-task (= (:task_type epic-task) :epic))
     ;; Subtask must exist and be normal type
     (and subtask-task (= (:task_type subtask-task) :normal))
     ;; No circular dependencies
     (not (creates-circular-dependency? epic-uuid subtask-uuid existing-relationships))
     ;; Subtask not already linked to another epic
     (not (already-has-epic-parent? subtask-uuid existing-relationships)))))

(defn creates-circular-dependency?
  "Check if adding relationship would create circular dependency"
  [epic-uuid subtask-uuid existing-relationships]
  (let [subtask-parents (get-parent-relationships subtask-uuid existing-relationships)]
    (some #(= (:parent-uuid %) subtask-uuid) subtask-parents)))

(defn already-has-epic-parent?
  "Check if subtask already has an epic parent"
  [subtask-uuid existing-relationships]
  (some #(= (:child-uuid %) subtask-uuid) existing-relationships))
```

### Epic Status Calculation

```clojure
(defn calculate-epic-status
  "Calculate epic status based on subtask statuses"
  [epic-uuid subtasks]
  (let [subtask-counts (group-by :status subtasks)
        total-count (count subtasks)
        completed-count (count (get subtask-counts "done"))
        in-progress-count (count (get subtask-counts "in_progress"))
        blocked-count (count (get subtask-counts "blocked"))
        progress-percent (if (pos? total-count)
                          (* (/ completed-count total-count) 100)
                          0)]
    
    (cond
      (= completed-count total-count) :completed
      (pos? blocked-count) :blocked
      (pos? in-progress-count) :in-progress
      (pos? completed-count) :in-progress
      :else :not-started)))

(defn calculate-epic-progress
  "Calculate epic progress percentage"
  [epic-uuid subtasks]
  (let [total-count (count subtasks)
        completed-count (count (filter #(= (:status %) "done") subtasks))]
    (if (pos? total-count)
      (* (/ completed-count total-count) 100)
      0)))

(defn get-epic-blocking-reasons
  "Get blocking reasons for epic"
  [epic-uuid subtasks]
  (let [blocked-subtasks (filter #(= (:status %) "blocked") subtasks)]
    (mapcat :blocking-reasons blocked-subtasks)))
```

### Data Migration and Compatibility

```clojure
(defn migrate-task-to-epic-schema
  "Migrate existing task to new epic schema"
  [task]
  (let [default-epic-fields {:task_type :normal
                             :epic_subtasks []
                             :epic_parent nil
                             :epic_status :not-started
                             :epic_progress 0
                             :epic_blocking_reason nil}]
    (merge task default-epic-fields)))

(defn validate-epic-data-integrity
  "Validate epic data integrity across all tasks"
  [tasks]
  (let [epic-tasks (filter #(= (:task_type %) :epic) tasks)
        normal-tasks (filter #(= (:task_type %) :normal) tasks)]
    (concat
     ;; Validate epic subtask references
     (mapcat #(validate-epic-subtask-references % normal-tasks) epic-tasks)
     ;; Validate subtask parent references
     (mapcat #(validate-subtask-parent-reference % epic-tasks) normal-tasks))))

(defn validate-epic-subtask-references
  "Validate that epic subtask references are valid"
  [epic-task all-normal-tasks]
  (let [subtask-uuids (:epic_subtasks epic-task)
        valid-subtask-uuids (map :uuid all-normal-tasks)
        invalid-references (remove #(contains? (set valid-subtask-uuids) %) subtask-uuids)]
    (map #(str "Invalid subtask reference: " % " in epic " (:uuid epic-task)) invalid-references)))

(defn validate-subtask-parent-reference
  "Validate that subtask parent reference is valid"
  [subtask-task all-epic-tasks]
  (when-let [parent-uuid (:epic_parent subtask-task)]
    (let [valid-epic-uuids (map :uuid all-epic-tasks)]
      (when (not (contains? (set valid-epic-uuids) parent-uuid))
        [(str "Invalid epic parent reference: " parent-uuid " in subtask " (:uuid subtask-task))]))))
```

## ✅ Acceptance Criteria

1. **Schema Extensions**
   - Epic task type properly defined
   - Subtask relationship fields added
   - Backward compatibility maintained

2. **Data Validation**
   - Epic-subtask relationships validated
   - Circular dependencies prevented
   - Data integrity constraints enforced

3. **Status Calculation**
   - Epic status calculated from subtasks
   - Progress percentage accurate
   - Blocking reasons properly aggregated

4. **Migration Support**
   - Existing tasks migrated to new schema
   - Data integrity validated
   - No data loss during migration

## 🧪 Testing Requirements

### Schema Validation Tests

```clojure
(deftest test-epic-schema-validation
  (testing "Epic task validation"
    (let [epic-task {:uuid "test-epic"
                     :title "Test Epic"
                     :status "breakdown"
                     :priority "P1"
                     :task_type :epic
                     :epic_subtasks ["subtask-1" "subtask-2"]
                     :epic_status :not-started
                     :epic_progress 0}]
      (is (validate-schema epic-task epic-task-schema))))
  
  (testing "Normal task with epic parent validation"
    (let [normal-task {:uuid "test-subtask"
                       :title "Test Subtask"
                       :status "todo"
                       :priority "P2"
                       :task_type :normal
                       :epic_parent "test-epic"}]
      (is (validate-schema normal-task normal-task-schema)))))

(deftest test-relationship-validation
  (testing "Valid epic-subtask relationship"
    (let [relationship (create-epic-relationship "epic-1" "subtask-1")
          existing-relationships []]
      (is (validate-epic-relationship "epic-1" "subtask-1" existing-relationships))))
  
  (testing "Circular dependency detection"
    (let [existing-relationships [{:parent-uuid "subtask-1" :child-uuid "epic-1"}]]
      (is (not (validate-epic-relationship "epic-1" "subtask-1" existing-relationships)))))
  
  (testing "Duplicate epic parent prevention"
    (let [existing-relationships [{:parent-uuid "epic-1" :child-uuid "subtask-1"}]]
      (is (not (validate-epic-relationship "epic-2" "subtask-1" existing-relationships))))))
```

### Status Calculation Tests

```clojure
(deftest test-epic-status-calculation
  (let [subtasks [{:uuid "s1" :status "done"}
                 {:uuid "s2" :status "in_progress"}
                 {:uuid "s3" :status "todo"}]]
    
    (testing "Mixed status epic"
      (is (= :in-progress (calculate-epic-status "epic-1" subtasks))))
    
    (testing "Epic progress calculation"
      (is (= 33.33 (calculate-epic-progress "epic-1" subtasks))))))
```

## 📁 File Structure

```
src/promethean/kanban/epic/
├── model/
│   ├── epic_schema.clj              # Epic task schema definitions
│   ├── epic_records.clj             # Epic data structures
│   ├── relationships.clj            # Epic-subtask relationship management
│   └── validation.clj              # Data validation logic
├── status/
│   ├── calculation.clj              # Epic status calculation
│   ├── progress.clj                # Progress percentage calculation
│   └── blocking.clj                # Blocking reason aggregation
└── migration/
    ├── schema_migration.clj          # Data migration utilities
    ├── compatibility.clj            # Backward compatibility
    └── integrity_validation.clj     # Data integrity checks
```

## 🔗 Dependencies

- Existing kanban task schema
- Clojure data validation libraries
- JSON schema validation
- Database migration utilities

## 🚀 Deliverables

1. **Epic Schema Extensions** - Complete data model definitions
2. **Relationship Management** - Epic-subtask relationship logic
3. **Status Calculation** - Epic status and progress calculation
4. **Data Validation** - Integrity and validation logic
5. **Migration Tools** - Schema migration utilities

## ⏱️ Timeline

**Estimated Time**: 2 sessions (8-12 hours)
**Dependencies**: None (foundation component)
**Blockers**: None

## 🎯 Success Metrics

- ✅ Complete epic data model implementation
- ✅ Robust data validation and integrity checks
- ✅ Accurate status and progress calculation
- ✅ Seamless migration from existing schema
- ✅ Comprehensive test coverage (>95%)

---

## 📝 Notes

This data model design is foundational for all epic functionality. It must be carefully designed to ensure data integrity while maintaining performance with large numbers of epic-subtask relationships. The schema should be extensible for future epic features while maintaining backward compatibility.