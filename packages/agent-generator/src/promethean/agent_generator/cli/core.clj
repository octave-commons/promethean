(ns promethean.agent-generator.cli.core
  "Command-line interface for agent generator"
  (:require [clojure.tools.cli :as cli]
            [promethean.agent-generator.generator.core :as generator]
            [promethean.agent-generator.config.core :as config]
            [promethean.agent-generator.platform.detection :as detection]
            [promethean.agent-generator.platform.features :as features]
            [promethean.agent-generator.templates.engine :as templates])
  (:gen-class))

(def cli-options
  "Command-line options specification"
  [["-t" "--template-dir DIR" "Template directory"
    :default "resources/templates"]
   ["-o" "--output-dir DIR" "Output directory"
    :default "."]
   ["-c" "--config FILE" "Configuration file"]
   ["-a" "--agent NAME" "Specific agent to generate"
    :parse-fn keyword]
   ["-p" "--platform PLATFORM" "Target platform"
    :parse-fn keyword]
   ["-f" "--force" "Force overwrite existing files"]
   ["-v" "--verbose" "Verbose output"]
   ["-h" "--help" "Show help"]
   ["--version" "Show version"]])

(defn usage [options-summary]
  "Generate usage string"
  (->> ["Agent Instruction Generator - Cross-platform Clojure tool"
        ""
        "Usage: agent-generator [options] command"
        ""
        "Commands:"
        "  generate       Generate agent instruction files"
        "  validate       Validate templates and configuration"
        "  list-templates List available templates"
        "  version        Show version information"
        ""
        "Options:"
        options-summary]
       (str/join \newline)))

(defn error-msg [errors]
  "Generate error message string"
  (str "The following errors occurred while parsing your command:\n\n"
       (str/join \newline errors)))

(defn validate-args [args]
  "Validate command line arguments"
  (let [parsed (cli/parse-opts args cli-options)]
    (cond
      (:errors parsed)
      {:exit-message (error-msg (:errors parsed)) :exit-code 1}
      
      (:help parsed)
      {:exit-message (usage (:summary parsed)) :exit-code 0}
      
      (:version parsed)
      {:exit-message "Agent Generator v0.0.1" :exit-code 0}
      
      (not (contains? #{:generate :validate :list-templates :version} 
                      (keyword (first (:arguments parsed)))))
      {:exit-message (usage (:summary parsed)) :exit-code 1}
      
      :else
      {:command (keyword (first (:arguments parsed)))
       :options (:options parsed)})))

(defn initialize-platform []
  "Initialize platform-specific features"
  (println (str "Initializing for platform: " (detection/current-platform)))
  (features/initialize-features!)
  (case (detection/current-platform)
    :babashka (features/use-feature! :babashka-optimizations)
    :jvm (features/use-feature! :jvm-optimizations)
    :node-babashka (features/use-feature! :nodejs-optimizations)
    :clojurescript (features/use-feature! :cljs-optimizations)))

(defn handle-generate [options]
  "Handle generate command"
  (println "Generating agent instruction files...")
  (let [config-overrides (merge options
                                {:verbose (:verbose options)})
        result (generator/generate-with-report config-overrides)]
    (if (:overall-success result)
      (do
        (println "Generation completed successfully!")
        (when (:verbose options)
          (println "\nGeneration Report:")
          (println "==================")
          (println (str "Platform: " (get-in result [:report :platform])))
          (println (str "Outputs generated: " (get-in result [:report :outputs-generated])))
          (println (str "Outputs written: " (get-in result [:report :outputs-written])))
          (println (str "Success rate: " (get-in result [:report :outputs-successful]) 
                       "/" (get-in result [:report :outputs-written]))))
        0)
      (do
        (println "Generation failed!")
        (when-let [errors (seq (get-in result [:report :errors]))]
          (println "\nErrors:")
          (doseq [error errors]
            (println (str "  - " error))))
        1))))

(defn handle-validate [options]
  "Handle validate command"
  (println "Validating templates and configuration...")
  (let [config (config/build-config options)
        validation (config/validate-config config)]
    (if (:valid validation)
      (do
        (println "Configuration is valid!")
        (when (:verbose options)
          (println "\nConfiguration Summary:")
          (println (str "Platform: " (detection/current-platform)))
          (println (str "Template directories: " (:template-dirs config)))
          (println (str "Output directory: " (:output-dir config))))
        0)
      (do
        (println "Configuration validation failed!")
        (doseq [error (:errors validation)]
          (println (str "  - " error)))
        1))))

(defn handle-list-templates [options]
  "Handle list-templates command"
  (println "Available templates:")
  (let [template-dir (:template-dir options)
        file-impl (features/use-feature! :file-system)]
    (if (and file-impl (file-impl template-dir))
      (let [template-files (file-impl template-dir "*.template")]
        (if (seq template-files)
          (doseq [template-file template-files]
            (println (str "  - " template-file)))
          (println "  No template files found"))
        0)
      (do
        (println (str "Template directory not found: " template-dir))
        1))))

(defn handle-version [options]
  "Handle version command"
  (println "Agent Instruction Generator")
  (println "Version: 0.0.1")
  (println (str "Platform: " (detection/current-platform)))
  (println (str "Clojure: " (clojure-version)))
  0)

(defn -main [& args]
  "Main entry point"
  (try
    (let [validated (validate-args args)]
      (if (:exit-message validated)
        (do
          (println (:exit-message validated))
          (:exit-code validated))
        (do
          (initialize-platform)
          (let [command (:command validated)
                options (:options validated)]
            (case command
              :generate (handle-generate options)
              :validate (handle-validate options)
              :list-templates (handle-list-templates options)
              :version (handle-version options)
              (do
                (println (str "Unknown command: " command))
                1))))))
    (catch Exception e
      (println (str "Error: " (.getMessage e)))
      (when (:verbose (:options (validate-args args)))
        (.printStackTrace e))
      1)))

(defn main [command & args]
  "Alternative main function for programmatic use"
  (apply -main (into [command] args)))