(ns omni-tools.config.ops
  "High-level operations for configuration management."
  (:require [omni-tools.config.core :as core]
            [omni-tools.config.adapters :as adapters]))

(defn sync-all!
  "Synchronize all configurations from EDN to output paths."
  [edn-path]
  (let [edn (-> edn-path slurp read-string)
        outputs (:outputs edn)
        base-path (core/resolve-path edn-path ".")]
    (core/validate-edn-structure! edn)
    (doseq [output-path (:outputs outputs)]
      (let [output-file (core/resolve-path base-path output-path)]
        (core/ensure-parent! output-file)
        (case (:format output)
          "json" (adapters/write-json output-file (:mcp edn))
          "toml" (adapters/write-toml output-file (:mcp edn))
          "edl" (adapters/write-edl output-file (:mcp edn))
          (throw (ex-info "Unsupported output format" {:format (:format output-path)}))))))

(defn push-to-target!
  "Push configuration from EDN to a specific target format."
  [edn-path target-path]
  (binding [core/*push-policy*]
    (let [edn (-> edn-path slurp read-string)
          target-format (detect-format target-path)
          target-data (case target-format
                        "json" (adapters/read-json target-path)
                        "toml" (adapters/read-toml target-path)
                        "edl" (adapters/read-edl target-path)
                        (throw (ex-info "Unsupported target format" {:format target-format}))]
          merged-mcp ((:mcp-merge core/*push-policy*) (:mcp edn) (:mcp target-data))
          merged-edn (assoc edn :mcp merged-mcp)]
      (case target-format
        "json" (adapters/write-json target-path merged-edn)
        "toml" (adapters/write-toml target-path merged-edn)
        "edl" (adapters/write-edl target-path merged-edn)))))

(defn pull-from-target!
  "Pull configuration from target format into EDN."
  [target-path edn-path]
  (let [target-format (detect-format target-path)
        target-data (case target-format
                      "json" (adapters/read-json target-path)
                      "toml" (adapters/read-toml target-path)
                      "edl" (adapters/read-edl target-path)
                      (throw (ex-info "Unsupported target format" {:format target-format}))]
          edn (-> edn-path slurp read-string)
        target-mcp (:mcp target-data)
        merged-mcp ((:mcp-merge core/*pull-policy*) (:mcp edn) target-mcp)
        merged-edn (assoc edn :mcp merged-mcp)]
    (core/spit-edn! edn-path merged-edn)))

(defn- detect-format
  "Detect configuration format from file extension."
  [path]
  (cond
    (str/ends-with? path ".json") "json"
    (str/ends-with? path ".toml") "toml"
    (str/ends-with? path ".edl") "edl"
    :else "edn")))

(defn doctor
  "Check configuration health and provide diagnostics."
  [edn-path]
  (let [edn (-> edn-path slurp read-string)]
    (core/validate-edn-structure! edn)
    (println "✅ EDN structure is valid")
    (when-let [outputs (:outputs edn)]
      (doseq [[output-name output-path] outputs]
        (let [format (detect-format output-path)]
          (println (str "📁 " output-name " (" format "): " output-path))
          (try
            (case format
              "json" (adapters/read-json output-path)
              "toml" (adapters/read-toml output-path)
              "edl" (adapters/read-edl output-path))
            (println "✅ " output-name " configuration is readable")
            (catch Exception e
              (println "❌ " output-name " configuration error: " (.getMessage e)))))))))