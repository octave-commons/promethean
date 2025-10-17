(ns promethean.agent-generator.generator.core
  "Core generation orchestration for agent instruction generator"
  (:require [promethean.agent-generator.collectors.protocol :as collectors]
            [promethean.agent-generator.collectors.kanban :as kanban-collector]
            [promethean.agent-generator.collectors.file-index :as file-index-collector]
            [promethean.agent-generator.collectors.environment :as environment-collector]
            [promethean.agent-generator.templates.engine :as templates]
            [promethean.agent-generator.config.core :as config]
            [promethean.agent-generator.platform.features :as features]
            [promethean.agent-generator.platform.detection :as detection]
            [clojure.string :as str]))

(defn generate-instructions [config-overrides]
  "Main generation pipeline"
  (let [config (config/build-config config-overrides)
        validation (config/validate-config config)]
    (if (:valid validation)
      (try
        (let [context (build-generation-context config)
              templates (load-templates config)
              results (generate-all-outputs templates context config)]
          {:success true
           :results results
           :context context
           :config config})
        (catch Exception e
          {:success false
           :error (.getMessage e)
           :config config}))
      {:success false
       :errors (:errors validation)
       :config config})))

(defn build-generation-context [config]
  "Build comprehensive generation context"
  (let [collectors (initialize-collectors config)
        collected-data (collect-all-data collectors config)]
    (merge
      {:platform (detection/current-platform)
       :timestamp (java.time.Instant/now)
       :generation-id (random-uuid)
       :config config}
      collected-data)))

(defn initialize-collectors [config]
  "Initialize data collectors"
  [(kanban-collector/create-kanban-collector config)
   (file-index-collector/create-file-index-collector config)
   (environment-collector/create-environment-collector config)])

(defn collect-all-data [collectors config]
  "Collect data from all available sources"
  (let [sorted-collectors (collectors/sort-collectors-by-priority collectors)]
    (reduce
      (fn [acc collector]
        (if (collectors/collector-available? collector)
          (let [result (collectors/safe-collect collector config)]
            (if (:success result)
              (merge acc (:data result))
              (do
                (println (str "Warning: " (str/join ", " (:errors result))))
                acc)))
          acc))
      {}
      sorted-collectors)))

(defn load-templates [config]
  "Load all template files"
  (let [template-config (:templates config)]
    (reduce-kv
      (fn [acc output-name template-file]
        (let [template-path (config/get-template-path config output-name)]
          (if template-path
            (let [file-impl (features/use-feature! :file-system)
                  template-content (file-impl template-path)]
              (if template-content
                (assoc acc output-name template-content)
                (do
                  (println (str "Warning: Template file not found: " template-path))
                  acc)))
            (do
              (println (str "Warning: No template path for " output-name))
              acc))))
      {}
      template-config)))

(defn generate-all-outputs [templates context config]
  "Generate all output files from templates"
  (let [template-engine (templates/create-template-engine)]
    (reduce-kv
      (fn [acc output-name template-content]
        (let [validation (templates/validate-template template-content)]
          (if (:valid validation)
            (let [rendered (templates/process-template template-content context)
                  output-path (config/get-output-path config output-name)]
              (assoc acc output-name 
                     {:content rendered
                      :path output-path
                      :template validation}))
            (do
              (println (str "Template validation failed for " output-name ": " 
                           (str/join ", " (:errors validation))))
              acc))))
      {}
      templates)))

(defn write-outputs [results config]
  "Write generated outputs to files"
  (let [file-impl (features/use-feature! :file-system)
        write-results (atom [])]
    (doseq [[output-name result] results]
      (let [output-path (:path result)
            content (:content result)]
        (try
          (file-impl output-path content)
          (swap! write-results conj {:output-name output-name 
                                     :path output-path 
                                     :success true})
          (println (str "Generated: " output-path))
          (catch Exception e
            (swap! write-results conj {:output-name output-name 
                                       :path output-path 
                                       :success false 
                                       :error (.getMessage e)})
            (println (str "Error writing " output-path ": " (.getMessage e)))))))
    @write-results))

(defn generate-and-write [config-overrides]
  "Generate instructions and write to files"
  (let [result (generate-instructions config-overrides)]
    (if (:success result)
      (let [write-results (write-outputs (:results result) (:config result))]
        (assoc result 
               :write-results write-results
               :overall-success (every? :success write-results)))
      result)))

(defn build-context-summary [context]
  "Build summary of generation context for debugging"
  {:platform (:platform context)
   :generation-id (:generation-id context)
   :timestamp (:timestamp context)
   :data-sources (keys context)
   :kanban-data (when (:kanban context)
                   {:tasks-count (get-in context [:kanban :statistics :total-tasks])
                    :active-tasks (count (get-in context [:kanban :active-tasks]))})
   :project-data (when (:project context)
                   {:packages-count (count (get-in context [:project :packages]))
                    :tools-count (count (get-in context [:project :tools]))})
   :environment-data (when (:environment context)
                       {:variables-count (count (:environment context))})})

(defn validate-generation-results [results config]
  "Validate generation results"
  (let [validation-errors (atom [])]
    ;; Check that expected outputs were generated
    (doseq [expected-output [:agents-md :claude-md :crush-md]]
      (when-not (contains? results expected-output)
        (swap! validation-errors conj 
               (str "Missing expected output: " expected-output))))
    
    ;; Validate output content
    (doseq [[output-name result] results]
      (when (str/blank? (:content result))
        (swap! validation-errors conj 
               (str "Empty content for output: " output-name))))
    
    {:valid (empty? @validation-errors) :errors @validation-errors}))

(defn create-generation-report [result]
  "Create comprehensive generation report"
  (let [config (:config result)
        context (:context result)
        results (:results result)
        write-results (:write-results result)]
    {:generation-id (:generation-id context)
     :platform (:platform context)
     :timestamp (:timestamp context)
     :success (:success result)
     :overall-success (:overall-success result)
     :config-summary (config/config-summary config)
     :context-summary (build-context-summary context)
     :outputs-generated (count results)
     :outputs-written (count write-results)
     :outputs-successful (count (filter :success write-results))
     :validation (when results (validate-generation-results results config))
     :errors (concat (:errors result) 
                     (mapcat :error (remove :success write-results)))}))

(defn generate-with-report [config-overrides]
  "Generate instructions and create comprehensive report"
  (let [result (generate-and-write config-overrides)
        report (create-generation-report result)]
    (assoc result :report report)))

;; Convenience functions for specific generation tasks
(defn generate-agents-md [config-overrides]
  "Generate only AGENTS.md"
  (let [config (assoc (config/build-config config-overrides) 
                      :templates {:agents-md (:agents-md (:templates default-config))})
        result (generate-instructions config)]
    (if (:success result)
      (let [write-results (write-outputs (:results result) config)]
        (assoc result :write-results write-results))
      result)))

(defn generate-claude-md [config-overrides]
  "Generate only CLAUDE.md"
  (let [config (assoc (config/build-config config-overrides) 
                      :templates {:claude-md (:claude-md (:templates default-config))})
        result (generate-instructions config)]
    (if (:success result)
      (let [write-results (write-outputs (:results result) config)]
        (assoc result :write-results write-results))
      result)))

(defn generate-crush-md [config-overrides]
  "Generate only CRUSH.md"
  (let [config (assoc (config/build-config config-overrides) 
                      :templates {:crush-md (:crush-md (:templates default-config))})
        result (generate-instructions config)]
    (if (:success result)
      (let [write-results (write-outputs (:results result) config)]
        (assoc result :write-results write-results))
      result)))