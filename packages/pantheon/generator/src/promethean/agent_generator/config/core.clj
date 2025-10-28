(ns promethean.agent-generator.config.core
  "Configuration management for agent generator"
  (:require [clojure.string :as str]
            [promethean.agent-generator.platform.detection :as detection]
            [promethean.agent-generator.platform.features :as features]))

(def default-config
  "Default configuration settings"
  {:template-dirs ["resources/templates" "templates"]
   :output-dir "."
   :agent-name "promethean-agent"
   :agent-type "general"
   :environment-variables ["AGENT_NAME" "ENVIRONMENT" "DEBUG_LEVEL" "OLLAMA_URL" "GITHUB_TOKEN"]
   :kanban {:board-file "docs/agile/boards/generated.md"
            :api-endpoint nil
            :include-statistics true
            :include-active-tasks true}
   :file-index {:root-dir "."
                 :include-patterns ["**/*.clj" "**/*.ts" "**/*.md" "**/*.json"]
                 :exclude-patterns ["node_modules/**" "target/**" ".git/**"]
                 :analyze-packages true
                 :detect-tools true}
   :templates {:agents-md "agents.md.template"
               :claude-md "claude.md.template"
               :crush-md "crush.md.template"}
   :generation {:include-timestamp true
                :include-platform-info true
                :include-generation-id true
                :validate-outputs true}
   :logging {:level :info
             :console true
             :file nil}
   :performance {:cache-templates true
                 :cache-collected-data true
                 :parallel-collection true}})

(defn load-config [config-file]
  "Load configuration from file"
  (try
    (let [content (slurp config-file)
          parsed (if (str/ends-with? config-file ".json")
                   (when-let [parse-fn (features/use-feature! :json)]
                     ((parse-fn content) :parse))
                   (when-let [parse-fn (features/use-feature! :yaml)]
                     ((parse-fn content) :parse)))]
      (if (map? parsed)
        parsed
        {}))
    (catch Exception e
      (println (str "Warning: Failed to load config from " config-file ": " (.getMessage e)))
      {})))

(defn merge-config [base-config override-config]
  "Merge configuration with overrides"
  (if (and override-config (map? override-config))
    (try
      (merge-with merge base-config override-config)
      (catch Exception e
        ;; If merge fails due to type conflicts, fall back to simple merge
        (merge base-config override-config)))
    base-config))

(defn validate-config [config]
  "Validate configuration"
  (let [errors (atom [])]
    
    ;; Validate required fields
    (when-not (:template-dirs config)
      (swap! errors conj "template-dirs is required"))
    
    (when-not (:output-dir config)
      (swap! errors conj "output-dir is required"))
    
    ;; Validate platform compatibility
    (let [platform (detection/current-platform)
          required-features [:fs :json :template-engine]]
      (when-let [validation (detection/validate-platform-compatibility required-features)]
        (when-not (:compatible validation)
          (swap! errors conj (str "Platform " platform " not compatible: " 
                                 (str/join ", " (:missing-features validation)))))))
    
    (if (seq @errors)
      {:valid false :errors @errors}
      {:valid true})))

(defn resolve-config-paths [config]
  "Resolve relative paths in configuration to absolute paths"
  (let [base-dir (System/getProperty "user.dir")
        template-dirs (:template-dirs config)]
    (cond
      (and template-dirs (coll? template-dirs))
      (assoc config :template-dirs
             (map (fn [path] 
                     (if (str/starts-with? path "/")
                       path
                       (str base-dir "/" path))) template-dirs))
      
      (and template-dirs (string? template-dirs))
      (assoc config :template-dirs
             [(if (str/starts-with? template-dirs "/")
                template-dirs
                (str base-dir "/" template-dirs))])
      
      :else
      config)))

(defn get-template-path [config template-name]
  "Get full path for template file"
  (let [template-file (get-in config [:templates template-name])]
    (when template-file
      (first 
        (for [template-dir (:template-dirs config)
              :let [full-path (str template-dir "/" template-file)]
              :when (features/use-feature! :file-system)
              :when ((features/use-feature! :file-system) full-path)]
          full-path)))))

(defn get-output-path [config output-name]
  "Get full path for output file"
  (let [output-dir (:output-dir config)
        output-file (case output-name
                     :agents-md "AGENTS.md"
                     :claude-md "CLAUDE.md"
                     :crush-md "CRUSH.md"
                     output-name)]
    (str output-dir "/" output-file)))

(defn environment-config []
  "Get configuration from environment variables"
  (let [env-prefix "AGENT_GENERATOR_"
        env-vars (into {} (System/getenv))]
    (reduce-kv 
      (fn [config k v]
        (if (str/starts-with? k env-prefix)
          (let [config-key (keyword (str/lower-case (str/replace (subs k (count env-prefix)) "_" "-")))
                ;; Handle special cases where env vars should be parsed as collections
                processed-value (case config-key
                                :template-dirs (str/split v #",")
                                :include-patterns (str/split v #",")
                                :exclude-patterns (str/split v #",")
                                :environment-variables (str/split v #",")
                                v)]
            (assoc config config-key processed-value))
          config))
      {}
      env-vars)))

(defn build-config [overrides]
  "Build complete configuration from defaults, files, environment, and overrides"
  (let [env-config (environment-config)
        config-file (or (:config-file overrides) 
                        (:config-file env-config) 
                        "agent-generator.config.edn")
        file-config (when ((features/use-feature! :fs) config-file)
                      (load-config config-file))
        ;; Handle template-dir -> template-dirs conversion
        normalized-overrides (if (:template-dir overrides)
                              (-> overrides
                                  (assoc :template-dirs [(:template-dir overrides)])
                                  (dissoc :template-dir))
                              overrides)]
    (-> default-config
        (merge-config file-config)
        (merge-config env-config)
        (merge-config normalized-overrides)
        (resolve-config-paths))))

(defn config-summary [config]
  "Generate configuration summary for logging"
  {:platform (detection/current-platform)
   :template-dirs (:template-dirs config)
   :output-dir (:output-dir config)
   :agent-name (:agent-name config)
   :agent-type (:agent-type config)
   :kanban-enabled (boolean (get-in config [:kanban :board-file]))
   :file-index-enabled (boolean (get-in config [:file-index :root-dir]))
   :validation-enabled (get-in config [:generation :validate-outputs])})

(defn cache-config [config]
  "Cache configuration for performance"
  (when (get-in config [:performance :cache-templates])
    ;; Implementation would cache resolved template paths, etc.
    (println "Caching configuration for performance...")))

(defn optimize-config-for-platform [config]
  "Optimize configuration for current platform"
  (let [platform (detection/current-platform)]
    (case platform
      :babashka (assoc-in config [:performance :parallel-collection] false)
      :jvm (assoc-in config [:performance :parallel-collection] true)
      :node-babashka (assoc-in config [:performance :parallel-collection] true)
      :clojurescript (assoc-in config [:performance :parallel-collection] false)
      config)))