(ns promethean.agent-generator.platform.adapters.bb
  "Babashka-specific platform adapter implementations"
  (:require [babashka.fs :as fs]
            [babashka.process :as process]
            [cheshire.core :as json]
            [clojure.string :as str]))

(defn file-exists? [path]
  "Check if file exists"
  (fs/exists? path))

(defn read-file [path]
  "Read file content"
  (slurp path))

(defn write-file [path content]
  "Write content to file"
  (fs/create-dirs (fs/parent path))
  (spit path content))

(defn list-files [dir pattern]
  "List files matching pattern"
  (->> (fs/glob dir pattern)
       (map str)
       (filter fs/file?)
       (map fs/relativize)))

(defn make-directory [path]
  "Create directory"
  (fs/create-dirs path))

(defn http-get [url]
  "Make HTTP GET request"
  (try
    (let [result (process/sh ["curl" "-s" "-L" url])]
      (if (zero? (:exit result))
        {:success true :body (:out result)}
        {:success false :error (:err result)}))
    (catch Exception e
      {:success false :error (.getMessage e)})))

(defn parse-json [content]
  "Parse JSON content"
  (json/parse-string content keyword))

(defn generate-json [data]
  "Generate JSON content"
  (json/generate-string data {:indent true}))

(defn parse-yaml [content]
  "Parse YAML content"
  (try
    (require 'clj-yaml.core)
    ((resolve 'clj-yaml.core/parse-string) content)
    (catch Exception e
      (throw (ex-info "YAML parsing not available" {:error (.getMessage e)})))))

(defn generate-yaml [data]
  "Generate YAML content"
  (try
    (require 'clj-yaml.core)
    ((resolve 'clj-yaml.core/generate-string) data)
    (catch Exception e
      (throw (ex-info "YAML generation not available" {:error (.getMessage e)})))))

(defn execute-command [cmd & args]
  "Execute external command"
  (let [result (process/sh (into [cmd] args))]
    {:exit (:exit result)
     :out (:out result)
     :err (:err result)
     :success (zero? (:exit result))}))

(defn get-environment-variable [name]
  "Get environment variable"
  (System/getenv name))

(defn get-environment-variables []
  "Get all environment variables"
  (into {} (System/getenv)))

(defn current-directory []
  "Get current working directory"
  (fs/cwd))

(defn change-directory [path]
  "Change current working directory"
  (fs/cd path))

(defn get-file-info [path]
  "Get file information"
  (let [attrs (fs/attributes path)]
    {:path path
     :size (:size attrs)
     :modified (:modified-time attrs)
     :directory? (fs/directory? path)
     :file? (fs/file? path)
     :readable? (fs/readable? path)
     :writable? (fs/writable? path)}))

(defn copy-file [source dest]
  "Copy file"
  (fs/create-dirs (fs/parent dest))
  (fs/copy source dest))

(defn delete-file [path]
  "Delete file"
  (fs/delete-tree path))

(defn temp-directory []
  "Get temporary directory"
  (fs/temp-dir))

(defn temp-file [prefix suffix]
  "Create temporary file"
  (fs/create-temp-file prefix suffix))

(defn platform-info []
  "Get platform-specific information"
  {:platform :babashka
   :version (System/getProperty "babashka.version")
   :java-version (System/getProperty "java.version")
   :os-name (System/getProperty "os.name")
   :os-arch (System/getProperty "os.arch")
   :user-dir (System/getProperty "user.dir")
   :user-home (System/getProperty "user.home")})

(defn native-binary? []
  "Check if running as native binary"
  (contains? (System/getenv) "BABASHKA_CLASSPATH"))

(defn fast-startup? []
  "Check if fast startup is available"
  true) ; Babashka always has fast startup

(defn limited-memory? []
  "Check if running with limited memory"
  true) ; Babashka is memory-constrained

;; Babashka-specific optimizations
(defn optimize-for-babashka! []
  "Apply Babashka-specific optimizations"
  (println "Optimizing for Babashka runtime...")
  ;; Pre-load commonly used namespaces
  (require '[clojure.string :as str])
  (require '[clojure.set :as set])
  (require '[clojure.walk :as walk]))

(defn babashka-specific-features []
  "Get Babashka-specific features"
  {:native-binary true
   :fast-startup true
   :limited-memory true
   :pod-support true
   :java-interop true
   :script-friendly true})