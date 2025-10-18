(ns promethean.platform.jvm
  "JVM Clojure specific implementations for the platform compatibility layer"
  (:require [clojure.java.io :as io]
            [clojure.string :as str]
            [clojure.java.shell :as shell]))

;; File operations for JVM
(defn file-exists? [path]
  (.exists (io/file path)))

(defn read-file [path]
  (slurp (io/file path)))

(defn write-file [path content]
  (spit (io/file path) content))

(defn delete-file [path]
  (.delete (io/file path)))

(defn list-directory [path]
  (->> (.listFiles (io/file path))
       (filter #(.isFile %))
       (map #(.getPath %))
       (into [])))

(defn create-directory [path]
  (.mkdirs (io/file path)))

(defn file-stats [path]
  (when (.exists (io/file path))
    (let [file (io/file path)]
      {:path (.getPath file)
       :size (.length file)
       :directory? (.isDirectory file)
       :file? (.isFile file)
       :last-modified (.lastModified file)})))

;; Process operations for JVM
(defn execute-command [cmd & args]
  (let [result (shell/sh cmd args)]
    {:exit-code (:exit result)
     :stdout (:out result)
     :stderr (:err result)
     :success? (zero? (:exit result))}))

(defn execute-command-async [cmd & args]
  (let [pb (ProcessBuilder. (into-array (into [cmd] args)))]
    (.start pb)))

(defn process-running? [proc]
  (try
    (.exitValue proc)
    false
    (catch IllegalThreadStateException _
      true)))

(defn kill-process [proc]
  (.destroy proc))

;; Network operations for JVM
(defn http-get [url & {:keys [headers timeout]}]
  (let [connection (doto (java.net.HttpURLConnection. (java.net.URL. url))
                    (.setRequestMethod "GET"))
        _ (when headers
            (doseq [[k v] headers]
              (.setRequestProperty connection (name k) (str v))))
        _ (when timeout
            (.setConnectTimeout connection timeout)
            (.setReadTimeout connection timeout))
        response-code (.getResponseCode connection)]
    (if (= response-code 200)
      {:status response-code
       :body (slurp (.getInputStream connection))
       :headers (into {} (for [k (.getHeaderFields connection)]
                            [(first k) (second k)]))}
      {:status response-code
       :error (when (.getErrorStream connection)
                (slurp (.getErrorStream connection)))})))

(defn http-post [url body & {:keys [headers timeout content-type]}]
  (let [connection (doto (java.net.HttpURLConnection. (java.net.URL. url))
                    (.setRequestMethod "POST")
                    (.setDoOutput true))
        _ (.setRequestProperty connection "Content-Type" (or content-type "application/json"))
        _ (when headers
            (doseq [[k v] headers]
              (.setRequestProperty connection (name k) (str v))))
        _ (when timeout
            (.setConnectTimeout connection timeout)
            (.setReadTimeout connection timeout))
        _ (.getOutputStream connection (.getBytes body))
        response-code (.getResponseCode connection)]
    (if (= response-code 200)
      {:status response-code
       :body (slurp (.getInputStream connection))
       :headers (into {} (for [k (.getHeaderFields connection)]
                            [(first k) (second k)]))}
      {:status response-code
       :error (when (.getErrorStream connection)
                (slurp (.getErrorStream connection)))})))

;; Java interop operations
(defn load-java-class [class-name]
  (Class/forName class-name))

(defn create-java-instance [class-name & args]
  (let [class (Class/forName class-name)
        constructor (if (empty? args)
                      (.getConstructor class (into-array Class []))
                      (.getConstructor class (into-array Class (map class args))))]
    (.newInstance constructor (into-array args))))

(defn invoke-java-method [instance method-name & args]
  (let [method (.getMethod instance method-name (into-array Class (map class args)))]
    (.invoke method instance (into-array args))))

(defn get-java-field [instance field-name]
  (let [field (.getField instance field-name)]
    (.get field instance)))

(defn set-java-field [instance field-name value]
  (let [field (.getField instance field-name)]
    (.set field instance value)))

;; Native library operations
(defn load-native-library [lib-path]
  (System/loadLibrary lib-path))

(defn native-library-available? [lib-name]
  (try
    (System/loadLibrary lib-name)
    true
    (catch Exception _
      false)))

;; Environment operations
(defn get-env [key]
  (System/getenv key))

(defn set-env [key value]
  (System/setProperty key value))

(defn get-system-property [key]
  (System/getProperty key))

(defn set-system-property [key value]
  (System/setProperty key value))

;; JVM specific operations
(defn jvm-version []
  (System/getProperty "java.version"))

(defn jvm-vendor []
  (System/getProperty "java.vendor"))

(defn jvm-name []
  (System/getProperty "java.vm.name"))

(defn available-processors []
  (.availableProcessors (Runtime/getRuntime)))

(defn max-memory []
  (.maxMemory (Runtime/getRuntime)))

(defn total-memory []
  (.totalMemory (Runtime/getRuntime)))

(defn free-memory []
  (.freeMemory (Runtime/getRuntime)))

;; Classpath operations
(defn get-classpath []
  (System/getProperty "java.class.path"))

(defn add-to-classpath [path]
  (.addURL (ClassLoader/getSystemClassLoader)
          (.toURL (java.io.File. path))))

;; Platform-specific optimizations
(defn optimize-for-jvm []
  "Apply JVM-specific optimizations"
  {:optimizations-applied true
   :platform :jvm
   :jvm-version (jvm-version)
   :jvm-vendor (jvm-vendor)
   :available-processors (available-processors)
   :max-memory (max-memory)})