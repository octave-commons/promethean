(ns promethean.platform.babashka
  "Babashka-specific implementations for the platform compatibility layer"
  (:require [babashka.fs :as fs]
            [babashka.process :as process]
            [clojure.java.io :as io]
            [clojure.string :as str]))

;; File operations for Babashka
(defn file-exists? [path]
  (fs/exists? path))

(defn read-file [path]
  (slurp path))

(defn write-file [path content]
  (spit path content))

(defn delete-file [path]
  (fs/delete-tree path))

(defn list-directory [path]
  (->> (fs/list-dir path)
       (map str)
       (into [])))

(defn create-directory [path]
  (fs/create-dirs path))

(defn file-stats [path]
  (when (fs/exists? path)
    {:path path
     :size (fs/size path)
     :directory? (fs/directory? path)
     :file? (fs/regular-file? path)
     :last-modified (fs/last-modified-time path)}))

;; Process operations for Babashka
(defn execute-command [cmd & args]
  (let [result (process/shell cmd args)]
    {:exit-code (:exit result)
     :stdout (:out result)
     :stderr (:err result)
     :success? (zero? (:exit result))}))

(defn execute-command-async [cmd & args]
  (process/process cmd args))

(defn process-running? [proc]
  (some? (:proc proc)))

(defn kill-process [proc]
  (process/destroy proc))

;; Network operations for Babashka
(defn http-get [url & {:keys [headers timeout]}]
  (let [client (java.net.HttpURLConnection. (java.net.URL. url))
        _ (.setRequestMethod client "GET")
        _ (when headers
            (doseq [[k v] headers]
              (.setRequestProperty client (name k) (str v))))
        _ (when timeout
            (.setConnectTimeout client timeout)
            (.setReadTimeout client timeout))
        response-code (.getResponseCode client)]
    (if (= response-code 200)
      {:status response-code
       :body (slurp (.getInputStream client))
       :headers (into {} (for [k (.getHeaderFields client)]
                            [(first k) (second k)]))}
      {:status response-code
       :error (slurp (.getErrorStream client))})))

(defn http-post [url body & {:keys [headers timeout content-type]}]
  (let [client (java.net.HttpURLConnection. (java.net.URL. url))
        _ (.setRequestMethod client "POST")
        _ (.setDoOutput client true)
        _ (.setRequestProperty client "Content-Type" (or content-type "application/json"))
        _ (when headers
            (doseq [[k v] headers]
              (.setRequestProperty client (name k) (str v))))
        _ (when timeout
            (.setConnectTimeout client timeout)
            (.setReadTimeout client timeout))
        _ (.getOutputStream client (.getBytes body))
        response-code (.getResponseCode client)]
    (if (= response-code 200)
      {:status response-code
       :body (slurp (.getInputStream client))
       :headers (into {} (for [k (.getHeaderFields client)]
                            [(first k) (second k)]))}
      {:status response-code
       :error (slurp (.getErrorStream client))})))

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

;; Platform-specific optimizations
(defn optimize-for-babashka []
  "Apply Babashka-specific optimizations"
  ;; Babashka is already optimized for startup time
  ;; This is a placeholder for future optimizations
  {:optimizations-applied true
   :platform :babashka})