(ns promethean.agent-generator.data-collection
  "Data collection interfaces and implementations for agent generation.
   
   This namespace provides the core data collection layer that integrates
   with existing Promethean Framework systems including kanban boards,
   file indexes, and environment variables."
  
  (:require [promethean.agent-generator.core :as core]
            [promethean.agent-generator.validation :as validation]
            [clojure.string :as str]
            [clojure.java.io :as io]
            [clojure.java.shell :as shell]
            [clojure.walk :as walk]))

;; ============================================================================
;; Core Protocols
;; ============================================================================

(defprotocol DataCollector
  "Protocol for collecting data from various sources"
  (collect [this config] "Collect data with given configuration")
  (validate [this data] "Validate collected data")
  (available? [this] "Check if data source is available")
  (get-metadata [this] "Get collector metadata"))

(defprotocol ErrorHandling
  "Protocol for error handling and fallback strategies"
  (handle-error [this error context] "Handle collection errors")
  (get-fallback [this config] "Get fallback data when collection fails")
  (retry? [this error] "Determine if error is retryable"))

(defprotocol DataValidator
  "Protocol for data validation"
  (validate-schema [this data schema] "Validate data against schema")
  (sanitize [this data] "Sanitize and normalize data")
  (get-validation-errors [this data] "Get detailed validation errors"))

;; ============================================================================
;; Base Collector Implementation
;; ============================================================================

(defrecord BaseCollector [name source-type metadata error-handler validator do-collect-fn check-availability-fn get-fallback-fn]
  DataCollector
  (collect [this config]
    (try
      (let [raw-data (do-collect-fn this config)
            validated-data (if validator
                             (validation/validate-data raw-data validator)
                             raw-data)]
        {:success true
         :data validated-data
         :source name
         :timestamp (System/currentTimeMillis)
         :metadata metadata})
      (catch Exception e
        (handle-error this e {:config config :collector name}))))
  
  (validate [this data]
    (if validator
      (validation/validate-data data validator)
      {:valid true :errors []})))
  
  (available? [this]
    (try
      (check-availability-fn this)
      (catch Exception _
        false)))
  
  (get-metadata [this]
    (assoc metadata
           :available? (available? this)
           :collector name
           :source-type source-type))

  ErrorHandling
  (handle-error [this error context]
    (let [fallback-data (get-fallback-fn this (:config context))
          error-info {:error (.getMessage error)
                      :type (class error)
                      :context context
                      :timestamp (System/currentTimeMillis)
                      :retryable? (retry? this error)}]
      {:success false
       :error error-info
       :fallback fallback-data
       :source name
       :timestamp (System/currentTimeMillis)}))
  
  (get-fallback [this config]
    (get-fallback-fn this config))
  
  (retry? [this error]
    (and (instance? java.io.IOException error)
         (not (instance? java.io.FileNotFoundException error)))))

;; ============================================================================
;; Environment Variables Collector
;; ============================================================================

(defn environment-do-collect [this config]
  (let [target-vars (or (:variables config) 
                        ["AGENT_NAME" "ENVIRONMENT" "DEBUG_LEVEL" "NODE_ENV"])
        env-data (reduce-kv 
                  (fn [acc k v]
                    (if (some #(str/starts-with? (str k) %) target-vars)
                      (assoc acc (str/lower-case (str k)) v)
                      acc))
                  {}
                  (System/getenv))]
    (assoc env-data 
           :collection-method "environment-variables"
           :timestamp (System/currentTimeMillis))))

(defn environment-check-availability [this]
  (not (empty? (System/getenv))))

(defn environment-get-fallback [this config]
  {:agent-name "default-agent"
   :environment "development"
   :debug-level "info"
   :node-env "development"
   :collection-method "fallback"})

(defrecord EnvironmentCollector []
  BaseCollector
  (name [this] "environment")
  (source-type [this] "environment-variables")
  (metadata [this] {:description "Collects environment variables for agent configuration"
                    :variables ["AGENT_NAME" "ENVIRONMENT" "DEBUG_LEVEL" "NODE_ENV"]
                    :supports-custom true}))

(defn create-environment-collector
  "Create a new environment variables collector"
  []
  (->BaseCollector 
    "environment"
    "environment-variables"
    {:description "Collects environment variables for agent configuration"
     :variables ["AGENT_NAME" "ENVIRONMENT" "DEBUG_LEVEL" "NODE_ENV"]
     :supports-custom true}
    nil
    nil
    environment-do-collect
    environment-check-availability
    environment-get-fallback))

;; ============================================================================
;; Kanban Board Collector
;; ============================================================================

(defn kanban-do-collect [this config]
  (let [kanban-cmd (or (:kanban-command config) "pnpm kanban")
        board-data (try
                     (let [result (clojure.java.shell/sh "bash" "-c" 
                                                         (str kanban-cmd " list --json"))]
                       (if (zero? (:exit result))
                         (clojure.edn/read-string (:out result))
                         {}))
                     (catch Exception _ {}))]
    (assoc board-data
           :collection-method "kanban-cli"
           :timestamp (System/currentTimeMillis)
           :command kanban-cmd)))

(defn kanban-check-availability [this]
  (try
    (let [result (clojure.java.shell/sh "which" "pnpm")]
      (zero? (:exit result)))
    (catch Exception _
      false)))

(defn kanban-get-fallback [this config]
  {:tasks []
   :columns ["incoming" "ready" "in_progress" "done"]
   :wip-limits {"incoming" 100 "ready" 75 "in_progress" 50 "done" 100}
   :collection-method "fallback"
   :timestamp (System/currentTimeMillis)})

(defrecord KanbanCollector []
  BaseCollector
  (name [this] "kanban")
  (source-type [this] "kanban-board")
  (metadata [this] {:description "Collects kanban board state and task information"
                    :integration "@promethean/kanban"
                    :data-points ["tasks" "columns" "wip-limits" "workflow"]}))

(defn create-kanban-collector
  "Create a new kanban board collector"
  []
  (->BaseCollector 
    "kanban"
    "kanban-board"
    {:description "Collects kanban board state and task information"
     :integration "@promethean/kanban"
     :data-points ["tasks" "columns" "wip-limits" "workflow"]}
    nil
    nil
    kanban-do-collect
    kanban-check-availability
    kanban-get-fallback))

;; ============================================================================
;; File Index Collector
;; ============================================================================

(defn file-index-do-collect [this config]
  (let [base-path (or (:base-path config) ".")
        scan-dirs (or (:scan-dirs config) ["packages" "scripts" "tools" "configs"])
        project-structure (analyze-project-structure base-path scan-dirs)]
    (assoc project-structure
           :collection-method "file-system-scan"
           :timestamp (System/currentTimeMillis)
           :base-path base-path)))

(defn file-index-check-availability [this]
  (.exists (io/file ".")))

(defn file-index-get-fallback [this config]
  {:packages []
   :tools []
   :configs {}
   :collection-method "fallback"
   :timestamp (System/currentTimeMillis)})

(defrecord FileIndexCollector []
  BaseCollector
  (name [this] "file-index")
  (source-type [this] "file-system")
  (metadata [this] {:description "Analyzes project structure and available tools"
                    :scan-dirs ["packages" "scripts" "tools" "configs"]
                    :file-types [".clj" ".cljs" ".js" ".ts" ".json" ".md"]}))

(defn analyze-project-structure
  "Analyze project structure to identify available tools and capabilities"
  [base-path scan-dirs]
  (reduce (fn [acc dir]
            (let [full-path (io/file base-path dir)]
              (if (.exists full-path)
                (update acc :packages conj 
                        (analyze-directory full-path))
                acc)))
          {:packages [] :tools [] :configs {}}
          scan-dirs))

(defn analyze-directory
  "Analyze a directory for package information and tools"
  [dir]
  {:path (.getPath dir)
   :name (.getName dir)
   :type "directory"
   :children (when (.isDirectory dir)
               (map #(.getName %)
                    (filter #(.isFile %)
                            (.listFiles dir))))})

(defn create-file-index-collector
  "Create a new file index collector"
  []
  (->BaseCollector 
    "file-index"
    "file-system"
    {:description "Analyzes project structure and available tools"
     :scan-dirs ["packages" "scripts" "tools" "configs"]
     :file-types [".clj" ".cljs" ".js" ".ts" ".json" ".md"]}
    nil
    nil
    file-index-do-collect
    file-index-check-availability
    file-index-get-fallback))

;; ============================================================================
;; Collection Manager
;; ============================================================================

(defrecord CollectionManager [collectors config]
  DataCollector
  (collect [this collection-config]
    (let [enabled-collectors (or (:collectors collection-config) 
                                (keys collectors))
          results (reduce-kv 
                   (fn [acc collector-name collector]
                     (if (some #{collector-name} enabled-collectors)
                       (let [result (collect collector collection-config)]
                         (assoc acc collector-name result))
                       acc))
                   {}
                   collectors)]
      {:success true
       :data results
       :timestamp (System/currentTimeMillis)
       :collectors enabled-collectors}))
  
  (validate [this data]
    (reduce-kv 
     (fn [acc collector-name result]
       (let [collector (get collectors collector-name)]
         (if collector
           (assoc acc collector-name (validate collector result))
           (assoc acc collector-name {:valid false :errors ["Collector not found"]}))))
     {}
     data))
  
  (available? [this]
    (reduce-kv 
     (fn [acc collector-name collector]
       (assoc acc collector-name (available? collector)))
     {}
     collectors))
  
  (get-metadata [this]
    (reduce-kv 
     (fn [acc collector-name collector]
       (assoc acc collector-name (get-metadata collector)))
     {}
     collectors)))

(defn create-collection-manager
  "Create a collection manager with default collectors"
  [config]
  (let [default-collectors {:environment (create-environment-collector)
                           :kanban (create-kanban-collector)
                           :file-index (create-file-index-collector)}
        custom-collectors (or (:collectors config) {})]
    (->CollectionManager (merge default-collectors custom-collectors) config)))

;; ============================================================================
;; Utility Functions
;; ============================================================================

(defn collect-all-data
  "Collect data from all available sources"
  [config]
  (let [manager (create-collection-manager config)]
    (collect manager config)))

(defn validate-collection-result
  "Validate a collection result"
  [result schema]
  (validation/validate-data schema result))

(defn get-available-collectors
  "Get list of available collectors"
  [manager]
  (->> (available? manager)
       (filter (fn [[_ available?]] available?))
       (map first)))

(defn collect-with-fallbacks
  "Collect data with automatic fallback handling"
  [config]
  (let [manager (create-collection-manager config)
        result (collect manager config)]
    (if (:success result)
      result
      ;; Try fallback collection for failed collectors
      (let [failed-collectors (->> (:data result)
                                   (filter (fn [[_ collector-result]] 
                                             (not (:success collector-result))))
                                   (map first))
            fallback-results (reduce 
                              (fn [acc collector-name]
                                (let [collector (get (:collectors manager) collector-name)
                                      fallback (when collector (get-fallback collector config))]
                                  (if fallback
                                    (assoc acc collector-name 
                                           {:success true 
                                            :data fallback
                                            :source "fallback"
                                            :timestamp (System/currentTimeMillis)})
                                    acc)))
                              {}
                              failed-collectors)]
        (-> result
            (assoc-in [:data] (merge (:data result) fallback-results))
            (assoc :success true)
            (assoc :fallbacks-used failed-collectors))))))

;; ============================================================================
;; Public API
;; ============================================================================

(def default-config
  "Default configuration for data collection"
  {:collectors [:environment :kanban :file-index]
   :timeout 30000
   :retry-attempts 3
   :validation true})

(defn collect-agent-context
  "Collect complete agent context from all available sources"
  [config]
  (collect-with-fallbacks (merge default-config config)))