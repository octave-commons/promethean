(ns ecosystem-dsl.core
  "Core DSL for generating enhanced PM2 ecosystem configurations from simple EDN files."
  (:require [clojure.java.io :as io]
            [clojure.string :as str]
            [clojure.walk :as walk]
            [clojure.data.json :as json]
            [clojure.pprint :as pprint]
            [clojure.tools.logging :as log])
  (:import [java.io File]
           [java.nio.file Files Paths StandardWatchEventKinds WatchService]
           [java.nio.file.attribute FileAttribute]
           [java.util.concurrent TimeUnit]))

;; ============================================================================
;; CONFIGURATION CONSTANTS
;; ============================================================================

(def ^:private config-constants
  {:cacheable-operations ["build" "test" "test:unit" "test:integration" "test:e2e"
                          "lint" "typecheck" "coverage"]
   :workspace-layout {:apps-dir "services" :libs-dir "packages"}
   :watch {:debounce-delay 2000 :batch-delay 5000 :max-concurrent-ops 3}
   :logging {:dir "logs"
             :date-format "YYYY-MM-DD HH:mm:ss Z"
             :max-files 10
             :max-size "10M"}
   :performance {:max-memory-restart "1G"
                 :kill-timeout 15000
                 :restart-delay 5000
                 :max-restarts 10
                 :min-uptime 10000}})

;; ============================================================================
;; HELPER FUNCTIONS
;; ============================================================================

(defn- create-log-paths
  "Generate log file paths for a given process name."
  [name]
  {:out-file (str "logs/" name "-out.log")
   :error-file (str "logs/" name "-err.log")
   :log-file (str "logs/" name "-combined.log")
   :pid-file (str "logs/" name ".pid")})

(defn- kebab->camel
  "Convert kebab-case to camelCase for JavaScript compatibility."
  [s]
  (when s
    (->> (str/split s #"-")
         (map str/capitalize)
         (str/join "")
         (str/lower-case (first))
         (subs 1))))

(defn- clj->js-obj
  "Convert Clojure data structure to JavaScript object format."
  [data]
  (walk/postwalk
   (fn [x]
     (cond
       (keyword? x) (name x)
       (map? x) (into {} (for [[k v] x] [(kebab->camel (name k)) (clj->js-obj v)]))
       :else x))
   data))

(defn- get-port-for-project
  "Assign consistent ports to different projects."
  [project]
  (let [port-map {"health-dashboard-frontend" 3000
                  "llm-chat-frontend" 3001
                  "markdown-graph-frontend" 3002
                  "portfolio-frontend" 3003
                  "smart-chat-frontend" 3004
                  "smartgpt-dashboard-frontend" 3005
                  "dualstore-http" 3010
                  "frontend-service" 3011
                  "openai-server" 3012}]
    (get port-map project 3000)))

;; ============================================================================
;; DSL MACROS
;; ============================================================================

(defmacro defenhancement
  "Define an enhancement that can be applied to process configurations."
  [name params & body]
  `(defn ~(symbol (str "enhance-" name)) ~params
     (println ~(str "Applying " name " enhancement"))
     ~@body))

(defmacro with-enhancements
  "Apply multiple enhancements to a configuration."
  [config & enhancements]
  `(reduce (fn [cfg# enhancer#] (enhancer# cfg#)) ~config [~@enhancements]))

;; ============================================================================
;; ENHANCEMENT FUNCTIONS
;; ============================================================================

(defenhancement logging
  "Add comprehensive logging configuration."
  [config]
  (let [name (:name config)
        log-paths (create-log-paths name)]
    (merge config
           log-paths
           {:log-date-format (:date-format (:logging config-constants))
            :time true
            :merge-logs true})))

(defenhancement performance
  "Add performance optimization settings."
  [config]
  (merge config (:performance config-constants)))

(defenhancement monitoring
  "Add monitoring and health check capabilities."
  [config]
  (merge config
         {:env (merge (:env config {})
                      {:PM2_PROCESS_NAME (:name config)
                       :PROJECT_ROOT (System/getProperty "user.dir")})}))

(defenhancement error-handling
  "Add robust error handling and restart policies."
  [config]
  (merge config
         {:autorestart true
          :max-restarts (:max-restarts (:performance config-constants))
          :min-uptime (:min-uptime (:performance config-constants))
          :kill-timeout (:kill-timeout (:performance config-constants))
          :restart-delay (:restart-delay (:performance config-constants))}))

(defenhancement development
  "Add development-specific enhancements."
  [config]
  (if (= "development" (get-in config [:env :NODE_ENV]))
    (merge config
           {:watch true
            :ignore-watch ["node_modules/**/*" "dist/**/*" "build/**/*" "coverage/**/*" "logs/**/*"]
            :env (merge (:env config {})
                        {:LOG_LEVEL "debug"
                         :NODE_ENV "development"})})
    config))

(defenhancement production
  "Add production-specific enhancements."
  [config]
  (if (= "production" (get-in config [:env :NODE_ENV]))
    (merge config
           {:watch false
            :env (merge (:env config {})
                        {:NODE_ENV "production"
                         :LOG_LEVEL "info"})})
    config))

;; ============================================================================
;; CONFIGURATION BUILDERS
;; ============================================================================

(defn create-base-config
  "Create base configuration for a process with standard defaults."
  [name options]
  (let [base {:name name
              :script "node"
              :interpreter "/usr/bin/env"
              :instances 1
              :cwd (System/getProperty "user.dir")}]
    (merge base options)))

(defn create-nx-watcher-config
  "Create configuration for the Nx-aware file watcher."
  []
  (-> (create-base-config "nx-watcher"
                          {:description "Intelligent file watcher that triggers Nx operations on affected projects"
                           :script "scripts/nx-watcher.mjs"
                           :args ["--watch-dirs" "packages/*/src" "services/*/src" "shared/*/src"
                                  "--operations" (str/join "," (:cacheable-operations config-constants))
                                  "--debounce" (:debounce-delay (:watch config-constants))
                                  "--batch-delay" (:batch-delay (:watch config-constants))
                                  "--max-concurrent" (:max-concurrent-ops (:watch config-constants))
                                  "--workspace-layout" (json/write-str (:workspace-layout config-constants))]
                           :watch ["packages/*/src/**/*" "services/*/src/**/*" "shared/*/src/**/*" "tools/**/*" "scripts/**/*"]
                           :ignore-watch ["node_modules/**/*" "dist/**/*" "build/**/*" "coverage/**/*" "logs/**/*" ".git/**/*" "**/*.log" "**/*.tmp" ".nx/cache/**/*"]
                           :max-memory-restart "512M"
                           :env {:NX_VERBOSE_LOGGING (or (System/getenv "NX_VERBOSE_LOGGING") "false")
                                 :NX_DAEMON (or (System/getenv "NX_DAEMON") "true")
                                 :NX_PERF_LOGGING (or (System/getenv "NX_PERF_LOGGING") "false")}})
      (with-enhancements logging performance monitoring error-handling)))

(defn create-dev-server-config
  "Create development server configuration for a project."
  [project-name project-type]
  (let [config (case project-type
                 :frontend (create-base-config (str "dev-" project-name)
                                               {:description (str "Development server for " project-name)
                                                :script "pnpm"
                                                :args ["--filter" (str "@promethean/" project-name) "dev"]
                                                :watch [(str "packages/frontends/" project-name "/**/*")]
                                                :env {:PORT (get-port-for-project project-name)}})
                 :service (create-base-config (str "dev-" project-name)
                                              {:description (str "Development server for " project-name)
                                               :script "node"
                                               :args ["-r" "esbuild-register" (str "packages/" project-name "/dist/index.js")]
                                               :watch [(str "packages/" project-name "/src/**/*")]
                                               :env {:PORT (get-port-for-project project-name)}})
                 (create-base-config (str "dev-" project-name) {}))]
    (-> config
        (with-enhancements logging performance monitoring development)
        (assoc-in [:env :NODE_ENV] "development"))))

(defn create-background-task-config
  "Create configuration for background tasks."
  [name script & [args]]
  (-> (create-base-config name
                          {:script script
                           :args (or args [])
                           :watch true})
      (with-enhancements logging performance monitoring error-handling production)))

;; ============================================================================
;; FILE DISCOVERY AND PROCESSING
;; ============================================================================

(defn find-ecosystem-files
  "Recursively find all ecosystem.edn files in the system directory."
  [root-dir]
  (let [root (io/file root-dir)]
    (->> (file-seq root)
         (filter #(.isFile %))
         (filter #(= "ecosystem.edn" (.getName %)))
         (map #(.getAbsolutePath %)))))

(defn read-ecosystem-edn
  "Read and parse an ecosystem.edn file."
  [file-path]
  (try
    (let [content (slurp file-path)
          data (read-string content)]
      (println (str "Successfully loaded " file-path))
      data)
    (catch Exception e
      (println (str "Failed to read " file-path) ":" (.getMessage e))
      {})))

(defn process-edn-config
  "Process a single EDN configuration and apply enhancements."
  [edn-data file-path]
  (println (str "Processing configuration from " file-path))
  (->> (:apps edn-data)
       (map (fn [app-config]
              (let [enhanced (-> app-config
                                 (with-enhancements logging performance monitoring error-handling)
                                 (development)
                                 (production))]
                (println (str "Enhanced configuration for app: " (:name enhanced)))
                enhanced)))))

;; ============================================================================
;; JAVASCRIPT GENERATION
;; ============================================================================

(defn generate-js-header
  "Generate the JavaScript header for the ecosystem file."
  []
  (str "/**\n"
       " * Enhanced PM2 Ecosystem Configuration for Promethean Monorepo\n"
       " * Generated by Clojure DSL from EDN files\n"
       " * Generated at: " (java.util.Date.) "\n"
       " *\n"
       " * Features:\n"
       " * - Monitors file changes across all packages and services\n"
       " * - Automatically runs tests/builds on affected projects using Nx\n"
       " * - Comprehensive logging and error handling\n"
       " * - Performance optimization with debouncing and caching\n"
       " * - Support for all cacheable operations defined in nx.json\n"
       " */\n\n"
       "import dotenv from 'dotenv';\n"
       "import { fileURLToPath } from 'node:url';\n"
       "import { dirname, join } from 'node:path';\n\n"
       "// Load environment variables\n"
       "try {\n"
       "  dotenv.config();\n"
       "} catch (error) {\n"
       "  if (error?.code !== 'ERR_MODULE_NOT_FOUND') {\n"
       "    throw error;\n"
       "  }\n"
       "}\n\n"
       "const __filename = fileURLToPath(import.meta.url);\n"
       "const __dirname = dirname(__filename);\n"
       "const PROJECT_ROOT = __dirname;\n\n"))

(defn generate-js-config
  "Generate JavaScript configuration object from Clojure data."
  [config-data]
  (let [js-obj (clj->js-obj config-data)]
    (json/write-str js-obj :indent true)))

(defn generate-js-footer
  "Generate the JavaScript footer with exports and logging."
  [app-count]
  (str "\n// Export complete ecosystem configuration\n"
       "export const apps = generatedApps;\n\n"
       "// PM2 deployment configuration\n"
       "export const deploy = {\n"
       "  production: {\n"
       "    user: 'deploy',\n"
       "    host: ['promethean.example.com'],\n"
       "    ref: 'origin/main',\n"
       "    repo: 'git@github.com:promethean/promethean.git',\n"
       "    path: '/var/www/promethean',\n"
       "    'post-deploy': 'pnpm install && pnpm build:all && pm2 reload ecosystem.config.enhanced.mjs --env production'\n"
       "  }\n"
       "};\n\n"
       "console.log(`🚀 Enhanced PM2 ecosystem configuration loaded`);\n"
       "console.log(`📊 Total processes configured: " app-count "`);\n"
       "console.log(`📁 Logs directory: ${join(PROJECT_ROOT, 'logs')}`);\n\n"
       "export default {\n"
       "  apps,\n"
       "  deploy\n"
       "};\n"))

(defn generate-ecosystem-js
  "Generate complete JavaScript ecosystem configuration."
  [all-apps]
  (let [header (generate-js-header)
        core-apps [(create-nx-watcher-config)]
        processed-apps (apply concat all-apps)
        all-configs (concat core-apps processed-apps)
        js-config (str "const generatedApps = " (generate-js-config {:apps all-configs}) ";\n")
        footer (generate-js-footer (count all-configs))]
    (str header js-config footer)))

;; ============================================================================
;; FILE WATCHING
;; ============================================================================

(defn start-file-watcher
  "Start a file watcher to automatically regenerate configurations."
  [system-dir output-file callback]
  (let [watch-service (FileSystems/newWatchService)
        path (Paths/get system-dir (into-array String []))
        _ (.register path watch-service
                     (into-array StandardWatchEventKinds
                                 [StandardWatchEventKinds/ENTRY_CREATE
                                  StandardWatchEventKinds/ENTRY_MODIFY
                                  StandardWatchEventKinds/ENTRY_DELETE]))
        stop-flag (atom false)]

    (future
      (while (not @stop-flag)
        (let [watch-key (.poll watch-service 1 TimeUnit/SECONDS)]
          (when watch-key
            (doseq [event (.pollEvents watch-key)]
              (let [file-name (.context event)]
                (when (and (.endsWith (str file-name) "ecosystem.edn")
                           (not (.startsWith (str file-name) ".")))
                  (log/info (str "Detected change in " file-name ", regenerating..."))
                  (callback)))))
          (.reset watch-key))))

    (fn [] (reset! stop-flag true))))

;; ============================================================================
;; MAIN GENERATION FUNCTION
;; ============================================================================

(defn generate-ecosystem!
  "Main function to generate enhanced PM2 ecosystem configuration."
  [{:keys [system-dir output-file watch?]
    :or {system-dir "system"
         output-file "ecosystem.config.enhanced.mjs"
         watch? false}}]
  (log/info (str "Starting ecosystem generation from " system-dir))

  (let [edn-files (find-ecosystem-files system-dir)
        _ (log/info (str "Found " (count edn-files) " EDN files"))
        all-apps (->> edn-files
                      (map read-ecosystem-edn)
                      (map process-edn-config))
        js-content (generate-ecosystem-js all-apps)]

    ;; Write the generated configuration
    (spit output-file js-content)
    (log/info (str "Generated enhanced ecosystem configuration: " output-file))

    ;; Start file watcher if requested
    (when watch?
      (log/info "Starting file watcher for automatic regeneration...")
      (start-file-watcher system-dir output-file
                          #(generate-ecosystem! {:system-dir system-dir
                                                 :output-file output-file
                                                 :watch? false})))

    {:files-processed (count edn-files)
     :apps-generated (count (apply concat all-apps))
     :output-file output-file}))

;; ============================================================================
;; UTILITY FUNCTIONS
;; ============================================================================

(defn validate-edn-structure
  "Validate that EDN files have the expected structure."
  [edn-data file-path]
  (when-not (map? edn-data)
    (throw (ex-info (str "Invalid EDN structure in " file-path) {:file file-path})))

  (when-let [apps (:apps edn-data)]
    (when-not (vector? apps)
      (throw (ex-info (str ":apps must be a vector in " file-path) {:file file-path})))))

(defn cleanup-old-configs
  "Clean up old generated configuration files."
  [output-dir]
  (let [output-path (io/file output-dir)]
    (when (.exists output-path)
      (->> (.listFiles output-path)
           (filter #(.startsWith (.getName %) "ecosystem.config"))
           (filter #(.endsWith (.getName %) ".mjs"))
           (run! #(.delete %))))))

(defn get-generation-stats
  "Get statistics about the generation process."
  [system-dir]
  (let [edn-files (find-ecosystem-files system-dir)]
    {:edn-files-count (count edn-files)
     :edn-files (map #(.getName (io/file %)) edn-files)
     :system-dir system-dir
     :timestamp (java.util.Date.)}))