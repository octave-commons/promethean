(ns promethean.agent-generator.collectors.file-index-simple
  "Simplified file index data collector for SCI compatibility"
  (:require [promethean.agent-generator.collectors.protocol :as protocol]
            [promethean.agent-generator.platform.features :as features]
            [promethean.agent-generator.platform.detection :as detection]
            [clojure.string :as str]))

;; Simple helper functions - no nested anonymous functions
(defn filename-extension [filename]
  "Get file extension"
  (when-let [dot-idx (str/last-index-of filename ".")]
    (subs filename (inc dot-idx))))

(defn categorize-file [extension]
  "Categorize file by extension"
  (cond
    (contains? #{"clj" "cljs" "cljc" "edn"} extension) :clojure
    (contains? #{"ts" "tsx" "js" "jsx" "mjs"} extension) :javascript
    (contains? #{"md" "mdx"} extension) :documentation
    (contains? #{"json" "yaml" "yml" "toml"} extension) :configuration
    (contains? #{"java" "kt" "scala"} extension) :jvm-language
    (contains? #{"py" "pyx" "pyi"} extension) :python
    (contains? #{"rs" "rlib"} extension) :rust
    (contains? #{"go" "mod" "sum"} extension) :go
    (contains? #{"sh" "bash" "zsh" "fish"} extension) :shell
    (contains? #{"Dockerfile" "dockerignore"} extension) :docker
    (contains? #{"gradle" "kts"} extension) :gradle
    (contains? #{"pom" "xml"} extension) :maven
    :else :other))

(defn analyze-file [file-path file-impl]
  "Analyze individual file"
  (let [file (java.io.File. file-path)
        extension (filename-extension file-path)
        size (.length file)
        last-modified (.lastModified file)]
    {:path file-path
     :name (.getName file)
     :extension extension
     :size size
     :last-modified last-modified
     :category (categorize-file extension)
     :language (or (some-> extension 
                          {"clj" "Clojure"
                           "cljs" "ClojureScript"
                           "cljc" "Clojure"
                           "edn" "EDN"
                           "ts" "TypeScript"
                           "tsx" "TypeScript"
                           "js" "JavaScript"
                           "jsx" "JavaScript"
                           "mjs" "JavaScript"
                           "md" "Markdown"
                           "mdx" "Markdown"
                           "json" "JSON"
                           "yaml" "YAML"
                           "yml" "YAML"
                           "java" "Java"
                           "kt" "Kotlin"
                           "scala" "Scala"
                           "py" "Python"
                           "rs" "Rust"
                           "go" "Go"
                           "sh" "Shell"
                           "Dockerfile" "Dockerfile"})
                   "Unknown")}))

(defn collect-from-filesystem [root-dir include-patterns exclude-patterns config]
  "Collect file index data from filesystem - simplified version"
  (try
    (let [file-impl (features/use-feature! :file-system)]
      (if file-impl
        (let [all-files (file-impl root-dir)
              directories (filterv (fn [f] (.isDirectory f)) all-files)
              files (filterv (fn [f] (.isFile f)) all-files)
              analyzed-files (mapv (fn [f] (analyze-file (.getPath f) file-impl)) files)]
          (protocol/success-result 
            {:root-dir root-dir
             :directories (mapv (fn [d] (.getPath d)) directories)
             :files analyzed-files
             :packages []  ; Simplified - no package detection
             :tools {}     ; Simplified - no tool detection
             :statistics {:directory-count (count directories)
                          :file-count (count files)
                          :package-count 0
                          :tool-count 0}}
            {:source :filesystem
             :root-dir root-dir}))
        (protocol/error-result ["File system feature not available"])))
    (catch Exception e
      (protocol/error-result [(str "Filesystem collection failed: " (.getMessage e))]))))

(defrecord FileIndexCollector [config]
  protocol/Collector
  (collect! [this config]
    (let [file-index-config (merge (:file-index config) config)
          root-dir (:root-dir file-index-config)
          include-patterns (:include-patterns file-index-config ["*"])
          exclude-patterns (:exclude-patterns file-index-config [])]
      (if (and root-dir (detection/feature-available? :file-system))
        (collect-from-filesystem root-dir include-patterns exclude-patterns file-index-config)
        (protocol/error-result ["File system not available or no root directory specified"]))))

  (available? [this]
    (and (detection/feature-available? :file-system)
         (:root-dir (merge (:file-index config) config))))

  (validate [this data]
    (and (map? data)
         (contains? data :root-dir)
         (or (contains? data :directories)
             (contains? data :files))))

  (collector-name [this] "file-index")
  (collector-priority [this] 20))

(defn create-file-index-collector [config]
  "Create file index collector instance"
  (->FileIndexCollector config))