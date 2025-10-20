(ns ecosystem-dsl.core
  "Core DSL for generating enhanced PM2 ecosystem configurations from simple EDN files.
   
   This namespace provides the main entry points and macro system for transforming
   simple EDN configurations into sophisticated PM2 ecosystem files with advanced
   features like Nx integration, monitoring, performance optimization, and more."
  (:require [clojure.java.io :as io]
            [clojure.string :as str]
            [clojure.walk :as walk]
            [clojure.data.json :as json]
            [clojure.pprint :as pprint]
            [ecosystem-dsl.macros :as macros]
            [ecosystem-dsl.enhancers :as enhancers]
            [ecosystem-dsl.file-watcher :as watcher]
            [ecosystem-dsl.js-generator :as js-gen]))

;; ============================================================================
;; CORE DSL MACROS
;; ============================================================================

(defmacro defecosystem
  "Define a complete ecosystem configuration with automatic enhancements.
   
   Usage:
   ```clojure
   (defecosystem my-ecosystem
     {:description \"My production ecosystem\"
      :environment :production
      :enhancements [:logging :monitoring :nx-integration :performance]}
     [{:name \"app1\" :script \"node\" :args [\"app.js\"]}
      {:name \"app2\" :script \"pnpm\" :args [\"start\"]}])
   ```"
  [name config apps]
  `(macros/defecosystem-impl '~name ~config ~apps))

(defmacro enhance-app
  "Apply specific enhancements to an app configuration.
   
   Usage:
   ```clojure
   (enhance-app app-config
     :logging {:level :debug :structured true}
     :performance {:memory-limit \"2G\" :restart-policy :aggressive}
     :monitoring {:health-check true :metrics true})
   ```"
  [app & enhancements]
  `(macros/enhance-app-impl ~app ~@enhancements))

(defmacro def-enhancement
  "Define a reusable enhancement pattern.
   
   Usage:
   ```clojure
   (def-enhancement :web-server
     {:script \"node\"
      :env {:NODE_ENV \"production\"}
      :performance {:max-memory \"1G\" :kill-timeout 15000}
      :logging {:access-log true :error-log true}})
   ```"
  [name config]
  `(macros/def-enhancement-impl '~name ~config))

;; ============================================================================
;; MAIN API FUNCTIONS
;; ============================================================================

(defn generate-ecosystem!
  "Generate enhanced PM2 ecosystem configuration from EDN files.
   
   Options:
   - :input-dirs - Directories containing EDN files (default: [\"system\"])
   - :output-file - Output file path (default: \"ecosystem.config.mjs\")
   - :enhancements - List of enhancements to apply (default: all available)
   - :environment - Target environment (:development, :production, :staging)
   - :watch? - Enable file watching (default: false)"
  [{:keys [input-dirs output-file enhancements environment watch?]
    :or {input-dirs ["system"]
         output-file "ecosystem.config.mjs"
         enhancements [:all]
         environment :production
         watch? false}}]

  (println "🚀 Generating enhanced PM2 ecosystem configuration...")
  (println "📁 Input directories:" (str/join ", " input-dirs))
  (println "📄 Output file:" output-file)
  (println "🌍 Environment:" environment)
  (println "⚡ Enhancements:" (str/join ", " enhancements))

  (let [edn-files (enhancers/discover-edn-files input-dirs)
        base-configs (mapv enhancers/read-edn-config edn-files)
        enhanced-configs (enhancers/apply-enhancements base-configs enhancements environment)
        js-content (js-gen/generate-ecosystem-js enhanced-configs environment)]

    (spit output-file js-content)
    (println "✅ Generated ecosystem configuration with" (count enhanced-configs) "apps")

    (when watch?
      (watcher/start-file-watcher! input-dirs output-file enhancements environment))

    enhanced-configs))

(defn regenerate-ecosystem!
  "Regenerate ecosystem configuration with current settings."
  []
  (generate-ecosystem! watcher/*last-generation-opts*))

(defn add-enhancement!
  "Register a new enhancement pattern."
  [name enhancement-fn]
  (alter-var-root #'enhancers/*enhancement-registry*
                  assoc name enhancement-fn)
  (println "✅ Registered enhancement:" name))

(defn list-enhancements
  "List all available enhancements."
  []
  (keys @enhancers/*enhancement-registry*))

(defn validate-config
  "Validate an ecosystem configuration before generation."
  [config]
  (enhancers/validate-ecosystem-config config))

;; ============================================================================
;; CONVENIENCE FUNCTIONS
;; ============================================================================

(defn quick-generate!
  "Quick generation with sensible defaults."
  [& [opts]]
  (generate-ecosystem! (merge {:enhancements [:logging :performance :monitoring]
                               :environment :production}
                              opts)))

(defn dev-generate!
  "Generate configuration optimized for development."
  []
  (generate-ecosystem! {:enhancements [:logging :dev-servers :hot-reload]
                        :environment :development
                        :output-file "ecosystem.config.dev.mjs"}))

(defn prod-generate!
  "Generate configuration optimized for production."
  []
  (generate-ecosystem! {:enhancements [:all]
                        :environment :production
                        :output-file "ecosystem.config.mjs"}))

;; ============================================================================
;; INITIALIZATION
;; ============================================================================

(defn init-dsl!
  "Initialize the DSL with default enhancements and configurations."
  []
  (println "🔧 Initializing Ecosystem DSL...")

  ;; Register default enhancements
  (add-enhancement! :logging enhancers/logging-enhancement)
  (add-enhancement! :performance enhancers/performance-enhancement)
  (add-enhancement! :monitoring enhancers/monitoring-enhancement)
  (add-enhancement! :nx-integration enhancers/nx-integration-enhancement)
  (add-enhancement! :dev-servers enhancers/dev-servers-enhancement)
  (add-enhancement! :hot-reload enhancers/hot-reload-enhancement)
  (add-enhancement! :security enhancers/security-enhancement)
  (add-enhancement! :scaling enhancers/scaling-enhancement)

  (println "✅ DSL initialized with" (count (list-enhancements)) "enhancements"))

;; Auto-initialize when namespace is loaded
(init-dsl!)