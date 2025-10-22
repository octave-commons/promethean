(ns promethean.agent-generator.platform.adapters.jvm
  "JVM Clojure-specific platform adapter implementations"
  (:require [clojure.java.io :as io]
            [clojure.java.shell :as shell]
            [clojure.string :as str]
            [cheshire.core :as json])
  (:import [java.io File]
           [java.net URL HttpURLConnection]
           [java.nio.file Files Paths CopyOption]
           [java.nio.file.attribute FileAttribute]
           [java.util Properties]
           [java.lang.management ManagementFactory]))

(defn file-exists? [path]
  "Check if file exists"
  (.exists (File. path)))

(defn read-file [path]
  "Read file content"
  (slurp path))

(defn write-file [path content]
  "Write content to file"
  (.mkdirs (.getParentFile (File. path)))
  (spit path content))

(defn list-files [dir pattern]
  "List files matching pattern"
  (let [dir-file (File. dir)
        pattern-regex (re-pattern pattern)]
    (when (.exists dir-file)
      (->> (.listFiles dir-file)
           (filter #(.isFile %))
           (map #(.getName %))
           (filter #(re-matches pattern-regex %))
           (map #(.getAbsolutePath %))))))

(defn make-directory [path]
  "Create directory"
  (.mkdirs (File. path)))

(defn http-get [url]
  "Make HTTP GET request"
  (try
    (let [connection (doto (URL. url) .openConnection)]
      (.setRequestMethod connection "GET")
      (.setRequestProperty connection "User-Agent" "Agent-Generator/1.0")
      (.connect connection)
      (if (= (.getResponseCode connection) 200)
        {:success true 
         :body (slurp (.getInputStream connection))}
        {:success false 
         :error (str "HTTP " (.getResponseCode connection))}))
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
  (let [result (apply shell/sh cmd args)]
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
  (System/getProperty "user.dir"))

(defn change-directory [path]
  "Change current working directory"
  (System/setProperty "user.dir" path))

(defn get-file-info [path]
  "Get file information"
  (let [file (File. path)]
    {:path (.getAbsolutePath file)
     :size (.length file)
     :modified (.lastModified file)
     :directory? (.isDirectory file)
     :file? (.isFile file)
     :readable? (.canRead file)
     :writable? (.canWrite file)}))

(defn copy-file [source dest]
  "Copy file"
  (let [source-path (Paths/get source)
        dest-path (Paths/get dest)]
    (.createDirectories (.getParent dest-path))
    (Files/copy source-path dest-path (into-array CopyOption []))))

(defn delete-file [path]
  "Delete file"
  (let [file-path (Paths/get path)]
    (Files/deleteIfExists file-path)))

(defn temp-directory []
  "Get temporary directory"
  (.getAbsolutePath (File. (System/getProperty "java.io.tmpdir"))))

(defn temp-file [prefix suffix]
  "Create temporary file"
  (.getAbsolutePath (File/createTempFile prefix suffix)))

(defn platform-info []
  "Get platform-specific information"
  {:platform :jvm
   :java-version (System/getProperty "java.version")
   :java-vendor (System/getProperty "java.vendor")
   :os-name (System/getProperty "os.name")
   :os-version (System/getProperty "os.version")
   :os-arch (System/getProperty "os.arch")
   :user-dir (System/getProperty "user.dir")
   :user-home (System/getProperty "user.home")
   :available-processors (.availableProcessors (Runtime/getRuntime))
   :max-memory (.maxMemory (Runtime/getRuntime))
   :total-memory (.totalMemory (Runtime/getRuntime))})

(defn jvm-features []
  "Get JVM-specific features"
  {:full-clojure true
   :threads true
   :libraries true
   :reflection true
   :database true
   :jni true
   :classloader true
   :garbage-collection true})

(defn memory-usage []
  "Get current memory usage"
  (let [runtime (Runtime/getRuntime)]
    {:total-memory (.totalMemory runtime)
     :free-memory (.freeMemory runtime)
     :used-memory (- (.totalMemory runtime) (.freeMemory runtime))
     :max-memory (.maxMemory runtime)}))

(defn thread-info []
  "Get thread information"
  {:active-threads (.getThreadCount (ManagementFactory/getThreadMXBean))
   :daemon-threads (.getDaemonThreadCount (ManagementFactory/getThreadMXBean))
   :peak-threads (.getPeakThreadCount (ManagementFactory/getThreadMXBean))})

(defn classpath-info []
  "Get classpath information"
  (str/split (System/getProperty "java.class.path") #":"))

(defn system-properties []
  "Get all system properties"
  (let [props (System/getProperties)]
    (reduce-kv (fn [m k v] (assoc m (keyword k) v)) {} props)))

;; JVM-specific optimizations
(defn optimize-for-jvm! []
  "Apply JVM-specific optimizations"
  (println "Optimizing for JVM runtime...")
  ;; Pre-load commonly used namespaces
  (require '[clojure.string :as str])
  (require '[clojure.set :as set])
  (require '[clojure.walk :as walk])
  (require '[clojure.java.io :as io]))

(defn enable-performance-tuning! []
  "Enable JVM performance tuning"
  (println "Enabling JVM performance tuning...")
  ;; Suggest JVM flags for optimal performance
  (println "Recommended JVM flags:")
  (println "  -XX:+UseG1GC")
  (println "  -XX:+UseStringDeduplication")
  (println "  -XX:+OptimizeStringConcat")
  (println "  -Xms512m -Xmx2g"))

(defn jvm-specific-features []
  "Get JVM-specific features"
  {:full-clojure true
   :threads true
   :libraries true
   :reflection true
   :database true
   :jni true
   :classloader true
   :garbage-collection true
   :jit-compilation true
   :memory-management true
   :performance-monitoring true})