(ns promethean.agent-generator.config
  "Configuration layer for the agent generator.
   
   This namespace handles configuration management, environment detection,
   and settings validation for the agent generator system.")

(def default-config
  "Default configuration settings for the agent generator."
  {:output-dir "generated-agents"
   :template-dir "resources/templates"
   :validation-enabled true
   :log-level :info})

(defn load-config
  "Load configuration from various sources (env vars, config files, defaults)."
  [opts]
  (merge default-config opts))

(defn validate-config
  "Validate configuration settings."
  [config]
  (when-not (:output-dir config)
    (throw (ex-info "Missing output directory in configuration" {})))
  config)