# Data Collection Interfaces Specification

## 🎯 Overview

This document defines the core interfaces for data collection across the Promethean Framework, providing standardized protocols for collecting data from kanban boards, file indexes, and environment variables.

## 🔧 Core Collector Protocol

```clojure
(defprotocol DataCollector
  "Protocol for collecting data from various sources"
  (collect [this config] "Collect data with given configuration")
  (validate [this data] "Validate collected data")
  (available? [this] "Check if data source is available")
  (get-metadata [this] "Get collector metadata and capabilities"))
```

## 📊 Specific Collector Interfaces

### 1. Environment Variable Collector

```clojure
(defprotocol EnvironmentCollector
  "Protocol for collecting environment variable data"
  (get-agent-config [this] "Get agent-specific configuration")
  (get-runtime-context [this] "Get runtime context and capabilities")
  (get-debug-settings [this] "Get debug level and settings")
  (validate-env-var [this var-name] "Validate specific environment variable"))

(defrecord EnvDataCollector []
  DataCollector
  (collect [_ config]
    (let [agent-vars (select-keys (System/getenv)
                                  ["AGENT_NAME" "ENVIRONMENT" "DEBUG_LEVEL"])
          custom-vars (get config :custom-vars [])]
      (merge agent-vars
             (select-keys (System/getenv) custom-vars))))

  (validate [_ data]
    (every? some? (vals data)))

  (available? [_]
    (some? (System/getenv)))

  (get-metadata [_]
    {:type :environment
     :version "1.0.0"
     :capabilities [:agent-config :runtime-context :debug-settings]}))
```

### 2. Kanban Board Collector

```clojure
(defprotocol KanbanCollector
  "Protocol for collecting kanban board data"
  (get-board-state [this] "Get current board state")
  (get-active-tasks [this] "Get active tasks and assignments")
  (get-wip-status [this] "Get WIP limits and current utilization")
  (get-agent-tasks [this agent-id] "Get tasks assigned to specific agent"))

(defrecord KanbanDataCollector [kanban-client]
  DataCollector
  (collect [_ config]
    (let [board-state (get-board-state kanban-client)
          active-tasks (get-active-tasks kanban-client)
          wip-status (get-wip-status kanban-client)]
      {:board-state board-state
       :active-tasks active-tasks
       :wip-status wip-status
       :collected-at (Instant/now)}))

  (validate [_ data]
    (and (contains? data :board-state)
         (contains? data :active-tasks)
         (contains? data :wip-status)))

  (available? [_]
    (some? kanban-client))

  (get-metadata [_]
    {:type :kanban
     :version "1.0.0"
     :capabilities [:board-state :task-management :wip-tracking]}))
```

### 3. File Index Collector

```clojure
(defprotocol FileIndexCollector
  "Protocol for collecting file system and project data"
  (get-project-structure [this] "Get project structure analysis")
  (get-available-tools [this] "Get available tools and capabilities")
  (get-package-dependencies [this] "Get package dependencies and API surfaces")
  (search-files [this pattern] "Search files matching pattern"))

(defrecord FileIndexDataCollector [index-client]
  DataCollector
  (collect [_ config]
    (let [project-structure (get-project-structure index-client)
          available-tools (get-available-tools index-client)
          dependencies (get-package-dependencies index-client)]
      {:project-structure project-structure
       :available-tools available-tools
       :dependencies dependencies
       :indexed-at (Instant/now)}))

  (validate [_ data]
    (and (contains? data :project-structure)
         (contains? data :available-tools)
         (contains? data :dependencies)))

  (available? [_]
    (some? index-client))

  (get-metadata [_]
    {:type :file-index
     :version "1.0.0"
     :capabilities [:project-analysis :tool-discovery :dependency-tracking]}))
```

## 🏗️ Collector Factory

```clojure
(defprotocol CollectorFactory
  "Factory for creating data collectors"
  (create-collector [this type config] "Create collector of specified type")
  (get-available-types [this] "Get list of available collector types"))

(defrecord DataCollectorFactory []
  CollectorFactory
  (create-collector [_ type config]
    (case type
      :environment (->EnvDataCollector)
      :kanban (->KanbanDataCollector (:kanban-client config))
      :file-index (->FileIndexDataCollector (:index-client config))
      (throw (ex-info "Unknown collector type" {:type type}))))

  (get-available-types [_]
    [:environment :kanban :file-index]))
```

## 🔄 Composite Collector

```clojure
(defrecord CompositeDataCollector [collectors]
  DataCollector
  (collect [_ config]
    (reduce-kv
      (fn [result collector-name collector]
        (try
          (let [data (collect collector config)]
            (assoc result collector-name {:status :success :data data}))
          (catch Exception e
            (assoc result collector-name {:status :error :error (.getMessage e)}))))
      {}
      collectors))

  (validate [_ data]
    (every? #(= (:status %) :success) (vals data)))

  (available? [_]
    (reduce-kv
      (fn [available collector-name collector]
        (assoc available collector-name (available? collector)))
      {}
      collectors))

  (get-metadata [_]
    (reduce-kv
      (fn [metadata collector-name collector]
        (assoc metadata collector-name (get-metadata collector)))
      {}
      collectors)))
```

## 📋 Configuration Schema

```clojure
(def CollectorConfig
  {:collectors {:environment {:enabled? boolean
                            :custom-vars [string?]}
               :kanban {:enabled? boolean
                       :board-id string?}
               :file-index {:enabled? boolean
                           :include-patterns [string?]
                           :exclude-patterns [string?]}}
   :error-handling {:retry-attempts integer?
                   :timeout-ms integer?
                   :fallback-strategy keyword?}
   :validation {:strict? boolean
                :required-fields [string?]}})
```

## 🔗 Usage Examples

```clojure
;; Create factory
(def factory (->DataCollectorFactory))

;; Create individual collectors
(def env-collector (create-collector factory :environment {}))
(def kanban-collector (create-collector factory :kanban {:kanban-client kanban-client}))
(def file-collector (create-collector factory :file-index {:index-client index-client}))

;; Create composite collector
(def composite (->CompositeDataCollector
                {:environment env-collector
                 :kanban kanban-collector
                 :file-index file-collector}))

;; Collect data
(def data (collect composite {}))

;; Check availability
(def availability (available? composite))

;; Validate collected data
(def valid? (validate composite data))
```

## 📊 Interface Contracts

### Data Collection Contract

- **Input**: Configuration map with collector-specific settings
- **Output**: Map with collected data and metadata
- **Error Handling**: Graceful degradation with error reporting
- **Timeout**: Configurable timeout per collector
- **Retry**: Configurable retry attempts for transient failures

### Validation Contract

- **Schema Validation**: All data must conform to defined schemas
- **Type Checking**: Strong type validation for all fields
- **Required Fields**: All required fields must be present
- **Data Consistency**: Cross-field consistency checks

### Availability Contract

- **Health Check**: Quick availability check without heavy operations
- **Dependency Check**: Verify required dependencies are available
- **Permission Check**: Verify collector has required permissions
- **Resource Check**: Verify sufficient resources are available

---

**Version**: 1.0.0  
**Last Updated**: 2025-10-18  
**Compatibility**: Promethean Framework v2.0+
