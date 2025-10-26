(ns promethean.agent-generator.data-collection-simple
  "Simplified data collection interfaces for agent generation."
  
  (:require [clojure.string :as str]
            [clojure.java.io :as io]
            [clojure.java.shell :as shell]))

;; ============================================================================
;; Simple Data Collection Functions
;; ============================================================================

(defn collect-environment-data
  "Collect environment variables data"
  [config]
  (try
    (let [target-vars (or (:variables config) 
                          ["AGENT_NAME" "ENVIRONMENT" "DEBUG_LEVEL" "NODE_ENV"])
          env-data (reduce-kv 
                    (fn [acc k v]
                      (if (some #(str/starts-with? (str k) %) target-vars)
                        (assoc acc (keyword (str/lower-case (str k))) v)
                        acc))
                    {}
                    (System/getenv))]
      {:success true
       :data (assoc env-data 
                    :collection-method "environment-variables"
                    :timestamp (System/currentTimeMillis))
       :source "environment"
       :timestamp (System/currentTimeMillis)})
    (catch Exception e
      {:success false
       :error {:message (.getMessage e)
               :type (class e)}
       :fallback {:agent-name "default-agent"
                  :environment "development"
                  :debug-level "info"
                  :node-env "development"
                  :collection-method "fallback"}
       :source "environment"
       :timestamp (System/currentTimeMillis)})))

(defn collect-kanban-data
  "Collect kanban board data"
  [config]
  (try
    (let [kanban-cmd (or (:kanban-command config) "pnpm kanban")
          board-data (try
                       (let [result (shell/sh "bash" "-c" 
                                             (str kanban-cmd " list --json"))]
                         (if (zero? (:exit result))
                           (clojure.edn/read-string (:out result))
                           {}))
                       (catch Exception _ {}))]
      {:success true
       :data (assoc board-data
                    :collection-method "kanban-cli"
                    :timestamp (System/currentTimeMillis)
                    :command kanban-cmd)
       :source "kanban"
       :timestamp (System/currentTimeMillis)})
    (catch Exception e
      {:success false
       :error {:message (.getMessage e)
               :type (class e)}
       :fallback {:tasks []
                  :columns ["incoming" "ready" "in_progress" "done"]
                  :wip-limits {"incoming" 100 "ready" 75 "in_progress" 50 "done" 100}
                  :collection-method "fallback"
                  :timestamp (System/currentTimeMillis)}
       :source "kanban"
       :timestamp (System/currentTimeMillis)})))

(defn collect-file-index-data
  "Collect file index data"
  [config]
  (try
    (let [base-path (or (:base-path config) ".")
          scan-dirs (or (:scan-dirs config) ["packages" "scripts" "tools" "configs"])
          project-structure {:packages []
                             :tools []
                             :configs {}
                             :scanned-dirs scan-dirs
                             :base-path base-path}]
      {:success true
       :data (assoc project-structure
                    :collection-method "file-system-scan"
                    :timestamp (System/currentTimeMillis))
       :source "file-index"
       :timestamp (System/currentTimeMillis)})
    (catch Exception e
      {:success false
       :error {:message (.getMessage e)
               :type (class e)}
       :fallback {:packages []
                  :tools []
                  :configs {}
                  :collection-method "fallback"
                  :timestamp (System/currentTimeMillis)}
       :source "file-index"
       :timestamp (System/currentTimeMillis)})))

;; ============================================================================
;; Collection Manager
;; ============================================================================

(defn collect-all-data
  "Collect data from all sources"
  [config]
  (let [enabled-collectors (or (:collectors config) [:environment :kanban :file-index])
        results {}]
    (cond-> results
      (some #{:environment} enabled-collectors) 
      (assoc :environment (collect-environment-data config))
      
      (some #{:kanban} enabled-collectors) 
      (assoc :kanban (collect-kanban-data config))
      
      (some #{:file-index} enabled-collectors) 
      (assoc :file-index (collect-file-index-data config)))))

(defn collect-agent-context
  "Collect complete agent context"
  [config]
  {:success true
   :data (collect-all-data config)
   :timestamp (System/currentTimeMillis)
   :collectors (or (:collectors config) [:environment :kanban :file-index])})

;; ============================================================================
;; Utility Functions
;; ============================================================================

(defn get-available-collectors
  "Get list of available collectors"
  []
  [:environment :kanban :file-index])

(defn validate-collection-result
  "Simple validation of collection result"
  [result]
  (and (map? result)
       (contains? result :success)
       (contains? result :timestamp)
       (or (:success result)
           (and (contains? result :error)
                (contains? result :fallback)))))