(ns promethean.agent-generator.generator.core-simple
  "Simplified core generation orchestration for SCI compatibility"
  (:require [promethean.agent-generator.collectors.protocol :as collectors]
            [promethean.agent-generator.collectors.kanban :as kanban-collector]
            [promethean.agent-generator.collectors.file-index-simple :as file-index-collector]
            [promethean.agent-generator.collectors.environment :as environment-collector]
            [promethean.agent-generator.templates.engine-simple :as templates]
            [promethean.agent-generator.config.core :as config]
            [promethean.agent-generator.platform.features :as features]
            [promethean.agent-generator.platform.detection :as detection]
            [clojure.string :as str]))

;; ===== ALL HELPER FUNCTIONS MUST BE DEFINED FIRST FOR SCI =====
;; No try/catch allowed in SCI - simplified versions only

(defn initialize-collectors [config]
  "Initialize all available data collectors"
  (let [kanban-collector (kanban-collector/create-kanban-collector config)
        file-index-collector (file-index-collector/create-file-index-collector config)
        environment-collector (environment-collector/create-environment-collector config)]
    [kanban-collector file-index-collector environment-collector]))

(defn collect-all-data [collectors config]
  "Collect data from all available collectors"
  (reduce 
    (fn [acc collector]
      (if (collectors/available? collector)
        (let [result (collectors/collect! collector config)]
          (if (:success result)
            (assoc acc (collectors/collector-name collector) (:data result))
            acc)) ; Skip failed collections silently
        acc)) ; Skip unavailable collectors silently
    {}
    collectors))

(defn load-templates [config]
  "Load and validate templates - simplified version without exception handling"
  (let [template-dirs (:template-dirs config ["templates"])]
    {} ; Return empty hash for now - will implement without file system operations
    ))

(defn generate-all-outputs [templates context config]
  "Generate all output files from templates"
  (reduce 
    (fn [acc [template-name template-info]]
      (let [template-data (:content template-info)
            context-with-template (assoc context 
                                       :template-name template-name
                                       :template-path (:path template-info))
            render-result (templates/render-template template-data 
                                                (merge (:data context) 
                                                       {:config (:config config)
                                                        :context context-with-template}))]
        (if (:success render-result)
          (assoc acc template-name 
                 {:template template-name
                  :content (:result render-result)
                  :metadata (:metadata render-result)})
          acc))) ; Skip failed templates silently
    {}
    templates))

(defn write-outputs [results config]
  "Write generated outputs to files - simplified version"
  (let [output-dir (:output-dir config "generated")]
    {} ; Return empty hash for now - will implement without file system operations
    ))

(defn build-context-summary [collected-data]
  "Build summary of collected data"
  {:data-sources (keys collected-data)
   :total-data-points (reduce + (map count (vals collected-data)))
   :has-kanban (contains? collected-data :kanban)
   :has-file-index (contains? collected-data :file-index)
   :has-environment (contains? collected-data :environment)
   :collection-count (count collected-data)})

(defn validate-generation-results [results config]
  "Validate generation results"
  (let [expected-outputs (:expected-outputs config 1)
        actual-outputs (count results)]
    {:valid (>= actual-outputs expected-outputs)
     :expected expected-outputs
     :actual actual-outputs
     :templates (keys results)}))

;; Main generation function (uses all helper functions above)
(defn build-generation-context [config]
  "Build generation context from collected data"
  (let [collectors (initialize-collectors config)
        collected-data (collect-all-data collectors config)]
    {:config config
     :collectors collectors
     :data collected-data
     :timestamp (java.time.Instant/now)
     :platform (detection/current-platform)
     :summary (build-context-summary collected-data)}))

;; Main generation function (uses all helper functions above)
(defn generate-instructions [config-overrides]
  "Main generation pipeline - simplified"
  (let [config (config/build-config config-overrides)
        validation (config/validate-config config)]
    (if (:valid validation)
      (let [context (build-generation-context config)
            templates (load-templates config)
            results (generate-all-outputs templates context config)
            written (write-outputs results config)]
        {:success true
         :results results
         :written written
         :context context
         :config config
         :validation (validate-generation-results results config)})
      {:success false
       :errors (:errors validation)
       :config config})))

(defn generate-and-write [config-overrides]
  "Generate and write outputs in one step"
  (let [result (generate-instructions config-overrides)]
    (if (:success result)
      (do
        (println (str "Generation successful! Generated " (count (:results result)) " outputs"))
        result)
      (do
        (println (str "Generation failed: " (:errors result)))
        result))))

(defn create-generation-report [result]
  "Create a detailed report of generation results"
  {:timestamp (java.time.Instant/now)
   :success (:success result)
   :outputs-generated (count (:results result))
   :outputs-written (count (filter :success (vals (:written result))))
   :data-sources (get-in result [:context :summary :data-sources])
   :platform (get-in result [:context :platform])
   :errors (or (:errors result) [])
   :validation (get-in result [:validation])})