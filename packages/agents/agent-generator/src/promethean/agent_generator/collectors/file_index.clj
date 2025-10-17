(ns promethean.agent-generator.collectors.file-index
  "File index data collector"
  (:require [promethean.agent-generator.collectors.protocol :as protocol]
            [promethean.agent-generator.platform.features :as features]
            [clojure.string :as str]
            [clojure.walk :as walk]))

(defrecord FileIndexCollector [config]
  protocol/Collector
  (collect! [this config]
    (let [file-index-config (merge (:file-index config) config)
          root-dir (:root-dir file-index-config)
          include-patterns (:include-patterns file-index-config)
          exclude-patterns (:exclude-patterns file-index-config)]
      (if (and root-dir (features/feature-available? :file-system))
        (collect-from-filesystem root-dir include-patterns exclude-patterns file-index-config)
        (protocol/error-result ["File system not available or no root directory specified"]))))

  (available? [this]
    (and (features/feature-available? :file-system)
         (:root-dir (merge (:file-index config) config))))

  (validate [this data]
    (and (map? data)
         (contains? data :root-dir)
         (or (contains? data :directories)
             (contains? data :files))))

  (collector-name [this] "file-index")
  (collector-priority [this] 20))

(defn collect-from-filesystem [root-dir include-patterns exclude-patterns config]
  "Collect file index data from filesystem"
  (try
    (let [file-impl (features/use-feature! :file-system)
          directories (scan-directories file-impl root-dir exclude-patterns)
          files (scan-files file-impl root-dir include-patterns exclude-patterns)
          packages (when (:analyze-packages config) (detect-packages files))
          tools (when (:detect-tools config) (detect-tools files))]
      (protocol/success-result 
        {:root-dir root-dir
         :directories directories
         :files files
         :packages packages
         :tools tools
         :statistics {:directory-count (count directories)
                      :file-count (count files)
                      :package-count (count packages)
                      :tool-count (count tools)}}
        {:source :filesystem
         :root-dir root-dir}))
    (catch Exception e
      (protocol/error-result [(str "Filesystem collection failed: " (.getMessage e))]))))

(defn scan-directories [file-impl root-dir exclude-patterns]
  "Scan directories under root"
  (let [exclude-regexes (map re-pattern exclude-patterns)]
    (->> (file-impl root-dir)
         (filter #(.isDirectory %))
         (map #(.getPath %))
         (filter #(not (some #(re-matches % %) exclude-regexes)))
         (sort))))

(defn scan-files [file-impl root-dir include-patterns exclude-patterns]
  "Scan files matching patterns"
  (let [include-regexes (map re-pattern include-patterns)
        exclude-regexes (map re-pattern exclude-patterns)]
    (->> (file-impl root-dir)
         (filter #(.isFile %))
         (map #(.getPath %))
         (filter #(some #(re-matches % %) include-regexes))
         (filter #(not (some #(re-matches % %) exclude-regexes)))
         (map #(analyze-file % file-impl))
         (sort-by :path))))

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
     :language (detect-language extension)}))

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

(defn detect-language [extension]
  "Detect programming language from extension"
  (case extension
    ("clj" "cljs" "cljc") "Clojure"
    ("ts" "tsx") "TypeScript"
    ("js" "jsx" "mjs") "JavaScript"
    ("md" "mdx") "Markdown"
    ("json") "JSON"
    ("yaml" "yml") "YAML"
    ("java") "Java"
    ("kt") "Kotlin"
    ("scala") "Scala"
    ("py" "pyx" "pyi") "Python"
    ("rs" "rlib") "Rust"
    ("go") "Go"
    ("sh" "bash" "zsh" "fish") "Shell"
    ("Dockerfile") "Dockerfile"
    ("gradle" "kts") "Gradle"
    ("pom") "Maven"
    ("edn") "EDN"
    ("toml") "TOML"
    "Unknown"))

(defn detect-packages [files]
  "Detect packages from file structure"
  (let [package-files (filter #(= :configuration (:category %)) files)
        package-jsons (filter #(= "json" (:extension %)) package-files)
        edn-files (filter #(= "edn" (:extension %)) package-files)]
    (concat
      (detect-npm-packages package-jsons)
      (detect-clojure-packages edn-files)
      (detect-maven-packages package-files))))

(defn detect-npm-packages [package-jsons]
  "Detect npm packages from package.json files"
  (mapv (fn [file]
          (let [content (try (slurp (:path file)) (catch Exception e "{}"))
                parsed (try (json/parse-string content keyword) (catch Exception e {}))]
            {:name (:name parsed)
             :version (:version parsed)
             :type :npm
             :path (:path file)
             :dependencies (:dependencies parsed)
             :devDependencies (:devDependencies parsed)}))
        package-jsons))

(defn detect-clojure-packages [edn-files]
  "Detect Clojure packages from edn files"
  (filterv (fn [file]
              (let [filename (:name file)]
                (or (str/includes? filename "deps.edn")
                    (str/includes? filename "bb.edn")
                    (str/includes? filename "shadow-cljs.edn"))))
            edn-files))

(defn detect-maven-packages [files]
  "Detect Maven packages from xml files"
  (filterv (fn [file]
              (let [filename (:name file)]
                (or (str/includes? filename "pom.xml")
                    (str/includes? filename "build.gradle"))))
            files))

(defn detect-tools [files]
  "Detect development tools from file structure"
  (let [tool-indicators {
                         :linting ["eslint.config" ".eslintrc" "clj-kondo" "kibit"]
                         :testing ["test" "spec" "ava" "jest" "kaocha"]
                         :building ["webpack" "rollup" "vite" "shadow-cljs" "gradle" "maven"]
                         :ci-cd [".github" "gitlab-ci" "jenkins"]
                         :documentation ["docs" "readme" "mkdocs"]
                         :container ["Dockerfile" "docker-compose"]
                         :monitoring ["prometheus" "grafana" "datadog"]}]
        detected-tools (atom {})]
    
    (doseq [[tool-category indicators] tool-indicators]
      (let [matching-files (filter (fn [file]
                                     (let [filename (str/lower-case (:name file))
                                           path (str/lower-case (:path file))]
                                       (some #(str/includes? filename %) indicators)))
                                   files)]
        (when (seq matching-files)
          (swap! detected-tools assoc tool-category 
                 (mapv :name matching-files)))))
    
    @detected-tools))

(defn create-file-index-collector [config]
  "Create file index collector instance"
  (->FileIndexCollector config))