(ns ecosystem-dsl.script
  "Main script entry point for the ecosystem DSL."
  (:require [ecosystem-dsl.core :as dsl]
            [clojure.tools.cli :as cli]
            [clojure.pprint :as pprint])
  (:gen-class))

(def cli-options
  [["-d" "--dir DIRECTORY" "System directory containing EDN files"
    :default "system"
    :validate [#(.exists (java.io.File. %)) "Directory must exist"]]

   ["-o" "--output FILE" "Output ecosystem file"
    :default "ecosystem.config.enhanced.mjs"]

   ["-w" "--watch" "Enable file watching for auto-regeneration"
    :default false
    :flag true]

   ["-v" "--validate-only" "Only validate EDN files, don't generate"
    :default false
    :flag true]

   ["-s" "--stats" "Show generation statistics"
    :default false
    :flag true]

   ["-c" "--cleanup" "Clean up old generated files"
    :default false
    :flag true]

   ["-h" "--help" "Show this help message"]])

(defn usage [options-summary]
  (->> ["Ecosystem DSL - Generate enhanced PM2 configurations from EDN files"
        ""
        "Usage: clojure -M -m ecosystem-dsl.script [options]"
        ""
        "Options:"
        options-summary
        ""
        "Examples:"
        "  clojure -M -m ecosystem-dsl.script                    # Generate with defaults"
        "  clojure -M -m ecosystem-dsl.script --watch          # Generate and watch for changes"
        "  clojure -M -m ecosystem-dsl.script --validate-only   # Validate EDN files only"
        "  clojure -M -m ecosystem-dsl.script --stats           # Show generation statistics"
        ""
        "Environment Variables:"
        "  NODE_ENV           Target environment (development/production)"
        "  NX_VERBOSE_LOGGING Enable verbose Nx logging"
        "  NX_DAEMON          Enable Nx daemon mode"]
       (clojure.string/join \newline)))

(defn validate-edn-files [system-dir]
  (println "🔍 Validating EDN files...")
  (let [files (dsl/find-ecosystem-files system-dir)]
    (when (empty? files)
      (println "❌ No ecosystem.edn files found in" system-dir)
      (System/exit 1))
    (doseq [file files]
      (try
        (let [data (dsl/read-ecosystem-edn file)]
          (dsl/validate-edn-structure data file)
          (println "✅" (.getName (java.io.File. file))))
        (catch Exception e
          (println "❌ Error in" (.getName (java.io.File. file)) ":" (.getMessage e))
          (System/exit 1))))
    (println "✅ All EDN files are valid")))

(defn show-stats [system-dir]
  (let [stats (dsl/get-generation-stats system-dir)]
    (println "\n📊 Generation Statistics:")
    (println "   System Directory:" (:system-dir stats))
    (println "   EDN Files Found:" (:edn-files-count stats))
    (println "   Files:" (clojure.string/join ", " (:edn-files stats)))
    (println "   Timestamp:" (:timestamp stats))))

(defn cleanup-old-files [output-file]
  (let [output-dir (.getParent (java.io.File. output-file))]
    (when output-dir
      (println "🧹 Cleaning up old configuration files...")
      (dsl/cleanup-old-configs output-dir)
      (println "✅ Cleanup complete"))))

(defn -main
  [& args]
  (let [{:keys [options errors summary]} (cli/parse-opts args cli-options)]

    (cond
      (:help options)
      (do (println (usage summary)) (System/exit 0))

      errors
      (do (println "Error parsing arguments:")
          (doseq [error errors] (println "  " error))
          (println (usage summary))
          (System/exit 1))

      :else
      (let [{:keys [dir output watch validate-only stats cleanup]} options]

        (when cleanup
          (cleanup-old-files output))

        (when validate-only
          (validate-edn-files dir)
          (when stats
            (show-stats dir))
          (System/exit 0))

        (println "🚀 Starting ecosystem generation...")
        (println "📁 Input directory:" dir)
        (println "📄 Output file:" output)
        (println "🌍 Environment:" (or (System/getenv "NODE_ENV") "production"))

        (try
          (let [result (dsl/generate-ecosystem! {:system-dir dir
                                                 :output-file output
                                                 :watch? watch})]

            (println "✅ Generation complete!")
            (println "📁 Files processed:" (:files-processed result))
            (println "🚀 Apps generated:" (:apps-generated result))
            (println "📄 Output file:" (:output-file result))

            (when stats
              (show-stats dir))

            (when watch
              (println "👀 Watching for file changes... Press Ctrl+C to stop")
              ;; Keep the process alive for watching
              (while true
                (Thread/sleep 1000))))

          (catch Exception e
            (println "❌ Generation failed:" (.getMessage e))
            (when-let [cause (.getCause e)]
              (println "   Caused by:" (.getMessage cause)))
            (System/exit 1)))))))