(ns ecosystem-dsl.core
  "Core DSL for generating enhanced PM2 ecosystem configurations from simple EDN files."
  (:require [clojure.java.io :as io]
            [clojure.string :as str]
            [clojure.walk :as walk]
            [clojure.data.json :as json]
            [clojure.pprint :as pprint]
            [clojure.tools.logging :as log]
            [clojure.java.shell :as sh])
  (:import [java.io File]
           [java.nio.file FileSystems Files Paths StandardWatchEventKinds WatchService]
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

(defn- create-log-paths [name]
  {:out-file (str "logs/" name "-out.log")
   :error-file (str "logs/" name "-err.log")
   :log-file (str "logs/" name "-combined.log")
   :pid-file (str "logs/" name ".pid")})

(defn- kebab->camel [s]
  (when s
    (let [parts (str/split s #"-")]
      (if (<= (count parts) 1)
        s
        (str (str/lower-case (first parts))
             (->> (rest parts) (map str/capitalize) (str/join "")))))))

(defn- clj->js-obj [data]
  (walk/postwalk
   (fn [x]
     (cond
       (keyword? x) (name x)
       (map? x) (into {} (for [[k v] x] [(kebab->camel (name k)) (clj->js-obj v)]))
       :else x))
   data))

(defn- get-port-for-project [project]
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

(defn- ensure-dist-path [^String edn-path]
  (let [dir (.getParentFile (io/file edn-path))
        dist (io/file dir "dist")]
    (.mkdirs dist)
    (.getAbsolutePath dist)))

(defn- per-daemon-output-path [^String edn-path]
  (str (ensure-dist-path edn-path) File/separator "ecosystem.config.mjs"))

(defn- relative-to-root [^String path]
  (let [root (io/file (System/getProperty "user.dir"))]
    (.replace (str path) (str (.getAbsolutePath root) File/separator) "")))

(defn- reload-daemon! [config-path]
  (try
    (let [{:keys [exit out err]} (sh/sh "pm2" "reload" config-path)]
      (println "pm2 reload" config-path "exit" exit)
      (when (seq err) (println err))
      (when (seq out) (println out)))
    (catch Exception e
      (println "pm2 reload failed, attempting start:" (.getMessage e))
      (try
        (let [{:keys [exit out err]} (sh/sh "pm2" "start" config-path)]
          (println "pm2 start" config-path "exit" exit)
          (when (seq err) (println err))
          (when (seq out) (println out)))
        (catch Exception e2
          (println "Unable to start PM2 config" config-path ":" (.getMessage e2)))))))

;; ============================================================================
;; ENHANCEMENT FUNCTIONS
;; ============================================================================

(defn with-enhancements [config & enhancements]
  (reduce (fn [cfg enhancer] (enhancer cfg)) config enhancements))

(defn enhance-logging [config]
  (let [name (:name config)
        log-paths (create-log-paths name)]
    (merge config
           log-paths
           {:log-date-format (:date-format (:logging config-constants))
            :time true
            :merge-logs true})))

(defn enhance-performance [config]
  (merge config (:performance config-constants)))

(defn enhance-monitoring [config]
  (merge config {:env (merge (:env config {})
                             {:PM2_PROCESS_NAME (:name config)
                              :PROJECT_ROOT (System/getProperty "user.dir")})}))

(defn enhance-error-handling [config]
  (merge config
         {:autorestart true
          :max-restarts (:max-restarts (:performance config-constants))
          :min-uptime (:min-uptime (:performance config-constants))
          :kill-timeout (:kill-timeout (:performance config-constants))
          :restart-delay (:restart-delay (:performance config-constants))}))

(defn enhance-development [config]
  (if (= "development" (get-in config [:env :NODE_ENV]))
    (merge config
           {:watch true
            :ignore-watch ["node_modules/**/*" "dist/**/*" "build/**/*" "coverage/**/*" "logs/**/*"]
            :env (merge (:env config {})
                        {:LOG_LEVEL "debug"
                         :NODE_ENV "development"})})
    config))

(defn enhance-production [config]
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

(defn create-base-config [name options]
  (let [base {:name name
              :script "node"
              :interpreter "/usr/bin/env"
              :instances 1
              :cwd (System/getProperty "user.dir")}]
    (merge base options)))

(defn create-nx-watcher-config []
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
      (with-enhancements enhance-logging enhance-performance enhance-monitoring enhance-error-handling)))

(defn create-dev-server-config [project-name project-type]
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
        (with-enhancements enhance-logging enhance-performance enhance-monitoring enhance-development)
        (assoc-in [:env :NODE_ENV] "development"))))

(defn create-background-task-config [name script & [args]]
  (-> (create-base-config name {:script script :args (or args []) :watch true})
      (with-enhancements enhance-logging enhance-performance enhance-monitoring enhance-error-handling enhance-production)))

;; ============================================================================
;; FILE DISCOVERY AND PROCESSING
;; ============================================================================

(defn find-ecosystem-files [root-dir]
  (let [root (io/file root-dir)]
    (->> (file-seq root)
         (filter #(.isFile %))
         (filter #(= "ecosystem.edn" (.getName %)))
         (map #(.getAbsolutePath %)))))

(defn read-ecosystem-edn [file-path]
  (try
    (let [content (slurp file-path)
          data (read-string content)]
      (println (str "Successfully loaded " file-path))
      data)
    (catch Exception e
      (println (str "Skipping non-EDN file " file-path) ":" (.getMessage e))
      nil)))

(defn process-edn-config [edn-data file-path]
  (println (str "Processing configuration from " file-path))
  (->> (:apps edn-data)
       (map (fn [app-config]
              (let [enhanced (-> app-config
                                 (with-enhancements enhance-logging enhance-performance enhance-monitoring enhance-error-handling)
                                 (enhance-development)
                                 (enhance-production))]
                (println (str "Enhanced configuration for app: " (:name enhanced)))
                enhanced)))))

;; ============================================================================
;; JAVASCRIPT GENERATION
;; ============================================================================

(defn generate-js-header [{:keys [source kind include-nx-watcher?] :or {include-nx-watcher? true}}]
  (str "/**\n"
       " * Enhanced PM2 Ecosystem Configuration for Promethean Monorepo\n"
       " * Generated by Clojure DSL from EDN files\n"
       " * Generated at: " (java.util.Date.) "\n"
       (when source (str " * Source: " source "\n"))
       (when kind (str " * Mode: " kind "\n"))
       " *\n"
       " * Features:\n"
       (when include-nx-watcher? " * - Monitors file changes across all packages and services\n")
       (when include-nx-watcher? " * - Automatically runs tests/builds on affected projects using Nx\n")
       " * - Comprehensive logging and error handling\n"
       " * - Performance optimization with debouncing and caching\n"
       " * - Support for all cacheable operations defined in nx.json\n"
       " */\n\n"
       "import { fileURLToPath } from 'node:url';\n"
       "import { dirname, join } from 'node:path';\n\n"
       "const __filename = fileURLToPath(import.meta.url);\n"
       "const __dirname = dirname(__filename);\n"
       "const PROJECT_ROOT = __dirname;\n\n"))

(defn generate-js-config [config-data]
  (let [js-obj (clj->js-obj config-data)]
    (json/write-str js-obj :indent true)))

(defn generate-js-footer [app-count]
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
       "console.log(`Enhanced PM2 ecosystem configuration loaded`);\n"
       "console.log(`Total processes configured: " app-count "`);\n"
       "console.log(`Logs directory: ${join(PROJECT_ROOT, 'logs')}`);\n\n"
       "export default {\n"
       "  apps,\n"
       "  deploy\n"
       "};\n"))

(defn generate-ecosystem-js
  ([all-apps] (generate-ecosystem-js all-apps {}))
  ([all-apps {:keys [include-nx-watcher? header-meta] :or {include-nx-watcher? true header-meta {}}}]
   (let [header (generate-js-header (assoc header-meta :include-nx-watcher? include-nx-watcher?))
         core-apps (if include-nx-watcher? [(create-nx-watcher-config)] [])
         processed-apps (apply concat all-apps)
         all-configs (concat core-apps processed-apps)
         js-config (str "const generatedApps = " (generate-js-config {:apps all-configs}) ";\n")
         footer (generate-js-footer (count all-configs))]
     (str header js-config footer))))

;; ============================================================================
;; FILE WATCHING
;; ============================================================================

(defn start-file-watcher [system-dir callback]
  (let [watch-service (.newWatchService (FileSystems/getDefault))
        register-path (fn [^File f]
                        (when (.isDirectory f)
                          (.register (.toPath f) watch-service
                                     (into-array StandardWatchEventKinds
                                                 [StandardWatchEventKinds/ENTRY_CREATE
                                                  StandardWatchEventKinds/ENTRY_MODIFY
                                                  StandardWatchEventKinds/ENTRY_DELETE]))))]
    (doseq [dir (->> (file-seq (io/file system-dir)) (filter #(.isDirectory %)))]
      (register-path dir))
    (println "Recursive watcher registered for" system-dir)
    (future
      (while true
        (when-let [watch-key (.poll watch-service 1 TimeUnit/SECONDS)]
          (doseq [event (.pollEvents watch-key)]
            (let [file-name (.context event)]
              (when (and file-name (.endsWith (str file-name) "ecosystem.edn"))
                (println (str "Detected change in " file-name ", regenerating..."))
                (callback))))
          (.reset watch-key))))))

;; ============================================================================
;; MAIN GENERATION FUNCTION
;; ============================================================================

(defn write-config! [output-path js]
  (spit output-path js)
  (println (str "Generated ecosystem configuration: " output-path))
  output-path)

(defn generate-ecosystem!
  "Generate per-daemon configs and optional aggregate config."
  [{:keys [system-dir output-file watch? skip-aggregate? pm2-reload?]
    :or {system-dir "system"
         output-file "ecosystem.config.enhanced.mjs"
         watch? false
         skip-aggregate? false
         pm2-reload? true}}]
  (println (str "Starting ecosystem generation from " system-dir))
  (let [edn-files (find-ecosystem-files system-dir)
        _ (println (str "Found " (count edn-files) " EDN files"))
        valid-files (->> edn-files
                         (map (fn [file-path] [file-path (read-ecosystem-edn file-path)]))
                         (filter (fn [[_ data]] (some? data))))
        per-daemon-results (->> valid-files
                                (map (fn [[file-path edn-data]]
                                       (let [apps (process-edn-config edn-data file-path)
                                             js (generate-ecosystem-js [apps]
                                                                       {:include-nx-watcher? false
                                                                        :header-meta {:source (relative-to-root file-path)
                                                                                      :kind "per-daemon"}})
                                             output (per-daemon-output-path file-path)]
                                         (write-config! output js)
                                         (when pm2-reload?
                                           (reload-daemon! output))
                                         {:source file-path
                                          :output output
                                          :apps apps
                                          :apps-count (count apps)}))))
        aggregate-js (when-not skip-aggregate?
                       (generate-ecosystem-js (map :apps per-daemon-results)
                                              {:include-nx-watcher? true
                                               :header-meta {:kind "aggregate"}}))
        aggregate-output (when (and aggregate-js (not skip-aggregate?))
                           (write-config! output-file aggregate-js))]

    (when watch?
      (println "Starting file watcher for automatic regeneration...")
      (start-file-watcher system-dir
                          #(generate-ecosystem! {:system-dir system-dir
                                                 :output-file output-file
                                                 :watch? false
                                                 :skip-aggregate? skip-aggregate?
                                                 :pm2-reload? pm2-reload?})))

    {:files-processed (count edn-files)
     :apps-generated (reduce + 0 (map :apps-count per-daemon-results))
     :per-daemon per-daemon-results
     :output-file aggregate-output}))

;; ============================================================================
;; UTILITY FUNCTIONS
;; ============================================================================

(defn validate-edn-structure [edn-data file-path]
  (when-not (map? edn-data)
    (throw (ex-info (str "Invalid EDN structure in " file-path) {:file file-path})))
  (when-let [apps (:apps edn-data)]
    (when-not (vector? apps)
      (throw (ex-info (str ":apps must be a vector in " file-path) {:file file-path})))))

(defn cleanup-old-configs [output-dir]
  (let [output-path (io/file output-dir)]
    (when (.exists output-path)
      (->> (.listFiles output-path)
           (filter #(.startsWith (.getName %) "ecosystem.config"))
           (filter #(.endsWith (.getName %) ".mjs"))
           (run! #(.delete %))))))

(defn get-generation-stats [system-dir]
  (let [edn-files (find-ecosystem-files system-dir)]
    {:edn-files-count (count edn-files)
     :edn-files (map #(.getName (io/file %)) edn-files)
     :system-dir system-dir
     :timestamp (java.util.Date.)}))

(defn -main [& _]
  (generate-ecosystem! {}))
