(ns ecosystem-dsl.enhancers
  "Enhancement implementations for the ecosystem DSL.
   
   This namespace contains the actual enhancement functions that transform
   basic app configurations into sophisticated PM2 configurations with
   advanced features like logging, monitoring, performance optimization, etc."
  (:require [clojure.string :as str]
            [clojure.java.io :as io]
            [clojure.walk :as walk]))

;; ============================================================================
;; ENHANCEMENT REGISTRY
;; ============================================================================

(def ^:dynamic *enhancement-registry* (atom {}))

;; ============================================================================
;; FILE DISCOVERY AND READING
;; ============================================================================

(defn discover-edn-files
  "Discover all EDN files in the given directories."
  [dirs]
  (let [all-files (for [dir dirs
                        :when (.exists (io/file dir))
                        file (file-seq (io/file dir))
                        :when (and (.isFile file)
                                   (str/ends-with (.getName file) ".edn"))]
                    (.getPath file))]
    (sort all-files)))

(defn read-edn-config
  "Read and parse an EDN configuration file."
  [file-path]
  (try
    (let [content (slurp file-path)
          config (read-string content)]
      (assoc config :source-file file-path))
    (catch Exception e
      (throw (ex-info "Failed to read EDN config"
                      {:file file-path
                       :error (.getMessage e)})))))

;; ============================================================================
;; LOGGING ENHANCEMENT
;; ============================================================================

(defn logging-enhancement
  "Add comprehensive logging configuration to an app."
  [app]
  (let [app-name (:name app)
        log-dir "logs"
        timestamp-format "YYYY-MM-DD HH:mm:ss Z"]

    (merge app
           {:merge_logs true
            :log_date_format timestamp-format
            :time true
            :out_file (str log-dir "/" app-name "-out.log")
            :error_file (str log-dir "/" app-name "-error.log")
            :log_file (str log-dir "/" app-name "-combined.log")
            :pid_file (str log-dir "/" app-name ".pid")
            :logging {:structured true
                      :level :info
                      :rotation {:max-files 10
                                 :max-size "10M"}
                      :format :json}})))

;; ============================================================================
;; PERFORMANCE ENHANCEMENT
;; ============================================================================

(defn performance-enhancement
  "Add performance optimization settings to an app."
  [app]
  (let [script-type (cond
                      (str/includes? (:script app) "node") :node
                      (str/includes? (:script app) "pnpm") :pnpm
                      (str/includes? (:script app) "npm") :npm
                      :else :default)]

    (merge app
           {:max_memory_restart "1G"
            :kill_timeout 15000
            :restart_delay 5000
            :max_restarts 10
            :min_uptime 10000
            :autorestart true
            :instances 1
            :performance {:type script-type
                          :optimization :balanced
                          :memory-limit "1G"
                          :cpu-threshold 80
                          :graceful-shutdown true}})))

;; ============================================================================
;; MONITORING ENHANCEMENT
;; ============================================================================

(defn monitoring-enhancement
  "Add monitoring and health check configuration to an app."
  [app]
  (let [app-name (:name app)]
    (merge app
           {:monitoring {:enabled true
                         :health-check {:enabled true
                                        :endpoint "/health"
                                        :interval 30000
                                        :timeout 5000
                                        :retries 3}
                         :metrics {:enabled true
                                   :endpoint "/metrics"
                                   :interval 60000
                                   :format :prometheus}
                         :alerts {:enabled true
                                  :channels [:email :slack]
                                  :thresholds {:cpu 80
                                               :memory 85
                                               :restart-rate 5}}}
            :env (merge (:env app {})
                        {:METRICS_ENABLED "true"
                         :HEALTH_CHECK_ENABLED "true"
                         :MONITORING_INTERVAL "30000"})})))

;; ============================================================================
;; NX INTEGRATION ENHANCEMENT
;; ============================================================================

(defn nx-integration-enhancement
  "Add Nx integration for intelligent project detection and operations."
  [app]
  (let [app-name (:name app)]
    (merge app
           {:nx {:enabled true
                 :cacheable-operations ["build" "test" "test:unit" "test:integration"
                                        "test:e2e" "lint" "typecheck" "coverage"]
                 :workspace-layout {:apps-dir "services"
                                    :libs-dir "packages"}
                 :watch-dirs ["packages/*/src" "services/*/src" "shared/*/src"]
                 :ignore-watch ["node_modules/**/*" "dist/**/*" "build/**/*"
                                "coverage/**/*" "logs/**/*" ".git/**/*"
                                "**/*.log" "**/*.tmp" ".nx/cache/**/*"]
                 :debounce-delay 2000
                 :batch-delay 5000
                 :max-concurrent-ops 3}
            :env (merge (:env app {})
                        {:NX_VERBOSE_LOGGING "false"
                         :NX_DAEMON "true"
                         :NX_PERF_LOGGING "false"
                         :PROJECT_ROOT (System/getProperty "user.dir")})})))

;; ============================================================================
;; DEVELOPMENT SERVERS ENHANCEMENT
;; ============================================================================

(defn dev-servers-enhancement
  "Add development server configurations for different project types."
  [app]
  (let [app-name (:name app)
        project-type (cond
                       (str/includes? app-name "frontend") :frontend
                       (str/includes? app-name "service") :service
                       (str/includes? app-name "api") :api
                       :else :default)]

    (merge app
           {:dev {:enabled true
                  :type project-type
                  :hot-reload true
                  :source-maps true
                  :debug true}
            :env (merge (:env app {})
                        {:NODE_ENV "development"
                         :LOG_LEVEL "debug"
                         :PORT (get-port-for-project app-name)})})))

(defn get-port-for-project
  "Assign a port to a project based on its name."
  [project-name]
  (let [port-map {"health-dashboard-frontend" 3000
                  "llm-chat-frontend" 3001
                  "markdown-graph-frontend" 3002
                  "portfolio-frontend" 3003
                  "smart-chat-frontend" 3004
                  "smartgpt-dashboard-frontend" 3005
                  "dualstore-http" 3010
                  "frontend-service" 3011
                  "openai-server" 3012}]
    (get port-map project-name 3000)))

;; ============================================================================
;; HOT RELOAD ENHANCEMENT
;; ============================================================================

(defn hot-reload-enhancement
  "Add hot reload configuration for development."
  [app]
  (let [app-name (:name app)]
    (merge app
           {:watch (get-watch-patterns app)
            :ignore_watch ["node_modules/**/*" "dist/**/*" "build/**/*"
                           "coverage/**/*" "logs/**/*" ".git/**/*"]
            :hot-reload {:enabled true
                         :patterns ["**/*.js" "**/*.ts" "**/*.jsx" "**/*.tsx"
                                    "**/*.clj" "**/*.cljs" "**/*.edn"]
                         :delay 1000
                         :extensions [".js" ".ts" ".jsx" ".tsx" ".clj" ".cljs" ".edn"]}})))

(defn get-watch-patterns
  "Get appropriate watch patterns for an app."
  [app]
  (let [app-name (:name app)
        script (:script app)]
    (cond
      (str/includes? script "pnpm")
      ["./packages/*/dist" "./services/*/dist"]

      (str/includes? app-name "frontend")
      [(str "packages/frontends/" app-name "/**/*")]

      (str/includes? app-name "service")
      [(str "packages/" app-name "/src/**/*")]

      :else
      ["src/**/*" "lib/**/*"])))

;; ============================================================================
;; SECURITY ENHANCEMENT
;; ============================================================================

(defn security-enhancement
  "Add security-related configuration to an app."
  [app]
  (merge app
         {:security {:enabled true
                     :ssl {:enabled false
                           :cert-file nil
                           :key-file nil}
                     :authentication {:enabled false
                                      :type :basic
                                      :providers [:local :oauth]}
                     :authorization {:enabled false
                                     :rbac false
                                     :policies []}
                     :rate-limiting {:enabled false
                                     :requests-per-minute 100
                                     :burst-size 20}
                     :headers {:x-frame-options "DENY"
                               :x-content-type-options "nosniff"
                               :x-xss-protection "1; mode=block"
                               :strict-transport-security "max-age=31536000"}}
          :env (merge (:env app {})
                      {:SECURITY_ENABLED "true"
                       :AUTH_ENABLED "false"
                       :RATE_LIMIT_ENABLED "false"})}))

;; ============================================================================
;; SCALING ENHANCEMENT
;; ============================================================================

(defn scaling-enhancement
  "Add scaling configuration to an app."
  [app]
  (let [app-name (:name app)]
    (merge app
           {:scaling {:enabled true
                      :strategy :manual
                      :min-instances 1
                      :max-instances 10
                      :target-cpu 70
                      :target-memory 80
                      :scale-up-cooldown 300000
                      :scale-down-cooldown 600000
                      :metrics [:cpu :memory :response-time]}
            :instances (get-instance-count app)
            :exec_mode (get-execution-mode app)})))

(defn get-instance-count
  "Determine appropriate instance count for an app."
  [app]
  (let [app-name (:name app)
        env (get-in app [:env :NODE_ENV] "production")]
    (case env
      "development" 1
      "staging" 2
      "production" (cond
                     (str/includes? app-name "frontend") 2
                     (str/includes? app-name "api") 3
                     (str/includes? app-name "service") 2
                     :else 1)
      1)))

(defn get-execution-mode
  "Determine execution mode for an app."
  [app]
  (let [instances (get-instance-count app)]
    (if (> instances 1) "cluster" "fork")))

;; ============================================================================
;; ENHANCEMENT APPLICATION
;; ============================================================================

(defn apply-enhancements
  "Apply a list of enhancements to app configurations."
  [base-configs enhancements environment]
  (let [enhancement-fns (get-enhancement-functions enhancements environment)]
    (mapv #(apply-enhancements-to-app % enhancement-fns) base-configs)))

(defn get-enhancement-functions
  "Get the actual enhancement functions based on enhancement names."
  [enhancements environment]
  (let [all-enhancements (if (= enhancements [:all])
                           (keys @*enhancement-registry*)
                           enhancements)]
    (mapv #(get @*enhancement-registry* %) all-enhancements)))

(defn apply-enhancements-to-app
  "Apply all enhancement functions to a single app."
  [app enhancement-fns]
  (reduce (fn [acc-app enhancement-fn]
            (try
              (enhancement-fn acc-app)
              (catch Exception e
                (println (str "⚠️  Failed to apply enhancement to app "
                              (:name acc-app) ": " (.getMessage e)))
                acc-app)))
          app
          enhancement-fns))

;; ============================================================================
;; VALIDATION
;; ============================================================================

(defn validate-ecosystem-config
  "Validate an ecosystem configuration."
  [config]
  (let [errors (atom [])]

    ;; Check if it's a map
    (when-not (map? config)
      (swap! errors conj "Configuration must be a map"))

    ;; Check for apps
    (when-not (:apps config)
      (swap! errors conj "Missing :apps in configuration"))

    ;; Validate each app
    (when-let [apps (:apps config)]
      (doseq [app apps]
        (when-not (:name app)
          (swap! errors conj (str "App missing :name: " app)))
        (when-not (:script app)
          (swap! errors conj (str "App missing :script: " app)))))

    {:valid? (empty? @errors)
     :errors @errors}))

;; ============================================================================
;; UTILITY FUNCTIONS
;; ============================================================================

(defn merge-deep
  "Deep merge maps."
  [& maps]
  (let [f (fn [old new]
            (if (and (map? old) (map? new))
              (merge-deep old new)
              new))]
    (if (every? map? maps)
      (apply merge-with f maps)
      (last maps))))

(defn normalize-app-config
  "Normalize an app configuration to ensure consistent structure."
  [app]
  (-> app
      (update :name str)
      (update :script str)
      (update :args #(or % []))
      (update :env #(or % {}))
      (update :instances #(or % 1))
      (update :autorestart #(or % true))
      (update :watch #(or % false))))

(defn filter-by-environment
  "Filter apps based on environment requirements."
  [apps environment]
  (filterv (fn [app]
             (let [envs (get-in app [:environments :allowed])]
               (or (nil? envs)
                   (contains? (set envs) environment))))
           apps))