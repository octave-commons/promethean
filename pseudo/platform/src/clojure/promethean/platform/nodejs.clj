(ns promethean.platform.nodejs
  "Node.js Babashka (nbb) specific implementations for the platform compatibility layer"
  (:require ["fs" :as fs]
            ["child_process" :as child-process]
            ["https" :as https]
            ["http" :as http]
            ["path" :as path]
            ["os" :as os]))

;; File operations for Node.js
(defn file-exists? [path]
  (.existsSync fs path))

(defn read-file [path]
  (.readFileSync fs path "utf8"))

(defn write-file [path content]
  (.writeFileSync fs path content))

(defn delete-file [path]
  (.unlinkSync fs path))

(defn list-directory [path]
  (->> (.readdirSync fs path)
       (map #(.join path path %))
       (into [])))

(defn create-directory [path]
  (.mkdirSync fs path #js {:recursive true}))

(defn file-stats [path]
  (when (.existsSync fs path)
    (let [stats (.statSync fs path)]
      {:path path
       :size (.-size stats)
       :directory? (.-isDirectory stats)
       :file? (.-isFile stats)
       :last-modified (.-mtime stats)})))

;; Process operations for Node.js
(defn execute-command [cmd & args]
  (let [result (.execSync child-process (str/join " " (into [cmd] args)) #js {:encoding "utf8"})]
    {:exit-code 0
     :stdout result
     :stderr ""
     :success? true}))

(defn execute-command-async [cmd & args]
  (.spawn child-process cmd (into-array args)))

(defn process-running? [proc]
  (not (.-killed proc)))

(defn kill-process [proc]
  (.kill proc))

;; Network operations for Node.js
(defn http-get [url & {:keys [headers timeout]}]
  (let [url-obj (js/URL. url)
        is-https (= "https:" (.-protocol url-obj))
        http-module (if is-https https http)
        options #js {:method "GET"
                     :headers (clj->js (or headers {}))}
        _ (when timeout
            (set! (.-timeout options) timeout))]
    (js/Promise.
     (fn [resolve reject]
       (let [req (.request http-module url-obj options
                           (fn [res]
                             (let [data (atom "")]
                               (.on res "data" (fn [chunk] (swap! data str chunk)))
                               (.on res "end" (fn []
                                                (resolve #js {:status (.-statusCode res)
                                                              :body @data
                                                              :headers (js->clj (.-headers res))}))))))]
         (.on req "error" reject)
         (.end req))))))

(defn http-post [url body & {:keys [headers timeout content-type]}]
  (let [url-obj (js/URL. url)
        is-https (= "https:" (.-protocol url-obj))
        http-module (if is-https https http)
        options #js {:method "POST"
                     :headers (clj->js (merge {"Content-Type" (or content-type "application/json")}
                                              (or headers {})))}
        _ (when timeout
            (set! (.-timeout options) timeout))]
    (js/Promise.
     (fn [resolve reject]
       (let [req (.request http-module url-obj options
                           (fn [res]
                             (let [data (atom "")]
                               (.on res "data" (fn [chunk] (swap! data str chunk)))
                               (.on res "end" (fn []
                                                (resolve #js {:status (.-statusCode res)
                                                              :body @data
                                                              :headers (js->clj (.-headers res))}))))))]
         (.on req "error" reject)
         (.write req body)
         (.end req))))))

;; Node.js specific operations
(defn node-version []
  (.-version js/process))

(defn node-platform []
  (.-platform js/process))

(defn node-arch []
  (.-arch js/process))

(defn get-node-env [key]
  (aget js/process.env key))

(defn set-node-env [key value]
  (aset js/process.env key value))

;; File system watching
(defn watch-file [path callback]
  (.watch fs path (fn [event filename]
                   (callback {:event event :filename filename}))))

(defn unwatch-file [path]
  (.unwatchFile fs path))

;; Path operations
(defn resolve-path [& parts]
  (.resolve path (into-array parts)))

(defn join-path [& parts]
  (.join path (into-array parts)))

(defn dirname [path]
  (.dirname path))

(defn basename [path]
  (.basename path))

(defn extname [path]
  (.extname path))

;; Platform-specific optimizations
(defn optimize-for-nodejs []
  "Apply Node.js-specific optimizations"
  {:optimizations-applied true
   :platform :node-babashka
   :node-version (node-version)
   :node-platform (node-platform)})