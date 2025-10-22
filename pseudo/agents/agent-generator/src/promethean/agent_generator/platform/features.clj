(ns promethean.agent-generator.platform.features
  "Feature registry and management for cross-platform capabilities"
  (:require [promethean.agent-generator.platform.detection :as detection]))

(def ^:dynamic *feature-registry* (atom {}))

(defn register-feature! [feature-name feature-def]
  "Register a feature with its definition"
  (swap! *feature-registry* assoc feature-name feature-def))

(defn get-feature [feature-name]
  "Get feature definition"
  (get @*feature-registry* feature-name))

(defn list-features []
  "List all registered features"
  (keys @*feature-registry*))

(defn available-features []
  "List features available on current platform"
  (let [platform-capabilities (detection/platform-capabilities (detection/current-platform))]
    (filter #(get platform-capabilities %) (keys platform-capabilities))))

(defn feature-implemented? [feature-name]
  "Check if feature has implementation on current platform"
  (and (detection/feature-available? feature-name)
       (contains? @*feature-registry* feature-name)))

(defn require-features! [required-features]
  "Validate that all required features are available"
  (let [missing (remove #(detection/feature-available? %) required-features)]
    (when (seq missing)
      (throw (ex-info "Missing required features" 
                      {:missing missing 
                       :available (available-features)
                       :platform (detection/current-platform)})))))

;; Core feature definitions - matching detection capabilities
(register-feature! :fs
  {:description "File system operations"
   :platforms #{:babashka :node-babashka :jvm}
   :dependencies []
   :implementation 'promethean.agent-generator.platform.adapters.file-system})

(register-feature! :http
  {:description "HTTP client functionality"
   :platforms #{:babashka :node-babashka :jvm :clojurescript}
   :dependencies []
   :implementation 'promethean.agent-generator.platform.adapters.http-client})

(register-feature! :json
  {:description "JSON parsing and generation"
   :platforms #{:babashka :node-babashka :jvm :clojurescript}
   :dependencies []
   :implementation 'promethean.agent-generator.platform.adapters.json})

(register-feature! :yaml
  {:description "YAML parsing and generation"
   :platforms #{:babashka :node-babashka :jvm :clojurescript}
   :dependencies []
   :implementation 'promethean.agent-generator.platform.adapters.yaml})

(register-feature! :process-execution
  {:description "External process execution"
   :platforms #{:babashka :jvm}
   :dependencies []
   :implementation 'promethean.agent-generator.platform.adapters.process})

(register-feature! :template-engine
  {:description "Template processing engine"
   :platforms #{:babashka :node-babashka :jvm :clojurescript}
   :dependencies [:json :fs]
   :implementation 'promethean.agent-generator.platform.adapters.template-engine})

(register-feature! :kanban-integration
  {:description "Kanban system integration"
   :platforms #{:babashka :node-babashka :jvm :clojurescript}
   :dependencies [:http :json]
   :implementation 'promethean.agent-generator.platform.adapters.kanban})

(register-feature! :file-indexing
  {:description "File indexing and analysis"
   :platforms #{:babashka :node-babashka :jvm}
   :dependencies [:fs :json]
   :implementation 'promethean.agent-generator.platform.adapters.file-indexing})

(defn initialize-features! []
  "Initialize all available features for current platform"
  (doseq [feature-name (available-features)]
    (when-let [feature-def (get-feature feature-name)]
      (try
        (when-let [impl-ns (:implementation feature-def)]
          (require impl-ns))
        (catch Exception e
          (println (str "Warning: Failed to initialize feature " feature-name ": " (.getMessage e))))))))

(defn feature-status []
  "Get status of all features on current platform"
  (let [platform (detection/current-platform)]
    (reduce-kv 
      (fn [acc feature-name feature-def]
        (let [available? (detection/feature-available? feature-name)
              implemented? (feature-implemented? feature-name)
              supported? (contains? (:platforms feature-def) platform)]
          (assoc acc feature-name 
                 {:available? available?
                  :implemented? implemented?
                  :supported? supported?
                  :platforms (:platforms feature-def)
                  :dependencies (:dependencies feature-def)})))
      {}
      @*feature-registry*)))

(defmacro with-features [features & body]
  "Execute body with required features available"
  `(do
     (require-features! ~features)
     ~@body))

(defn get-feature-implementation [feature-name]
  "Get implementation namespace for feature on current platform"
  (when-let [feature-def (get-feature feature-name)]
    (when (detection/feature-available? feature-name)
      (:implementation feature-def))))

(defn use-feature! [feature-name]
  "Load and return feature implementation"
  (when-let [impl-ns (get-feature-implementation feature-name)]
    (require impl-ns)
    (let [ns (find-ns impl-ns)]
      (when ns
        (case feature-name
          :fs (ns-resolve ns 'file-system)
          :http (ns-resolve ns 'http-client)
          :json (ns-resolve ns 'json-parse)
          :yaml (ns-resolve ns 'yaml-parse)
          :template-engine (ns-resolve ns 'main)
          :kanban-integration (ns-resolve ns 'main)
          :file-indexing (ns-resolve ns 'main)
          :process-execution (ns-resolve ns 'main)
          (ns-resolve ns 'main))))))