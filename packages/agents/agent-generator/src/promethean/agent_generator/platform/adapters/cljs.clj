(ns promethean.agent-generator.platform.adapters.cljs
  "ClojureScript-specific platform adapter implementations"
  (:require [clojure.string :as str]
            ["fs" :as fs]
            ["path" :as path]
            ["process" :as node-process]
            ["https" :as https]
            ["http" :as http]))

(defn file-exists? [path]
  "Check if file exists (limited in browser environment)"
  #?(:cljs 
     (if (exists? js/window)
       false ; Browser environment - no file system
       (.existsSync fs path)) ; Node.js environment
     :clj false))

(defn read-file [path]
  "Read file content (limited in browser environment)"
  #?(:cljs 
     (if (exists? js/window)
       (throw (ex-info "File system not available in browser" {:path path}))
       (.readFileSync fs path "utf8"))
     :clj (throw (ex-info "Not implemented in Clojure" {}))))

(defn write-file [path content]
  "Write content to file (limited in browser environment)"
  #?(:cljs 
     (if (exists? js/window)
       (throw (ex-info "File system not available in browser" {:path path}))
       (do
         (.mkdirSync fs (path/dirname path) #js {:recursive true})
         (.writeFileSync fs path content "utf8")))
     :clj (throw (ex-info "Not implemented in Clojure" {}))))

(defn list-files [dir pattern]
  "List files matching pattern (limited in browser environment)"
  #?(:cljs 
     (if (exists? js/window)
       [] ; Browser environment - no file system
       (let [files (.readdirSync fs dir #js {:withFileTypes true})]
         (->> (array-seq files)
              (filter #(.isFile %))
              (map #(.name %))
              (filter #(re-matches (re-pattern pattern) %))
              (map #(path/join dir %)))))
     :clj []))

(defn make-directory [path]
  "Create directory (limited in browser environment)"
  #?(:cljs 
     (if (exists? js/window)
       nil ; Browser environment - no file system
       (.mkdirSync fs path #js {:recursive true}))
     :clj nil))

(defn http-get [url]
  "Make HTTP GET request"
  #?(:cljs 
     (let [url-obj (js/URL. url)
           is-https (= "https:" (.-protocol url-obj))
           http-module (if is-https https http)]
       (-> (.get http-module url-obj #js {:headers #js {"User-Agent" "Agent-Generator/1.0"}})
           (.then (fn [res]
                    (let [data (atom "")]
                      (.on res "data" (fn [chunk] (swap! data str chunk)))
                      (.on res "end" (fn [] 
                                       #js {:success true :body @data})))))
           (.catch (fn [error] 
                     #js {:success false :error (.-message error)}))))
     :clj {:success false :error "Not implemented"}))

(defn parse-json [content]
  "Parse JSON content"
  #?(:cljs 
     (js->clj (js/JSON.parse content) :keywordize-keys true)
     :clj (throw (ex-info "Not implemented in Clojure" {}))))

(defn generate-json [data]
  "Generate JSON content"
  #?(:cljs 
     (.stringify js/JSON (clj->js data) nil 2)
     :clj (throw (ex-info "Not implemented in Clojure" {}))))

(defn parse-yaml [content]
  "Parse YAML content"
  #?(:cljs 
     (try
       (require '["js-yaml" :as yaml])
       (js->clj (.load yaml js-yaml content) :keywordize-keys true)
       (catch :default e
         (throw (ex-info "YAML parsing not available" {:error (.-message e)})))
     :clj (throw (ex-info "Not implemented in Clojure" {}))))

(defn generate-yaml [data]
  "Generate YAML content"
  #?(:cljs 
     (try
       (require '["js-yaml" :as yaml])
       (.dump yaml js-yaml (clj->js data))
       (catch :default e
         (throw (ex-info "YAML generation not available" {:error (.-message e)})))
     :clj (throw (ex-info "Not implemented in Clojure" {}))))

(defn execute-command [cmd & args]
  "Execute external command (not available in browser)"
  #?(:cljs 
     (if (exists? js/window)
       {:success false :error "Command execution not available in browser"}
       (try
         (let [result (.execSync js/child_process (str/join " " (into [cmd] args)) #js {:encoding "utf8"})]
           {:exit 0 :out result :err "" :success true})
         (catch :default e
           {:success false :error (.-message e)})))
     :clj {:success false :error "Not implemented"}))

(defn get-environment-variable [name]
  "Get environment variable"
  #?(:cljs 
     (if (exists? js/window)
       nil ; Browser environment - limited environment access
       (.env js/process name))
     :clj (System/getenv name)))

(defn get-environment-variables []
  "Get all environment variables"
  #?(:cljs 
     (if (exists? js/window)
       {} ; Browser environment - limited environment access
       (js->clj (.env js/process) :keywordize-keys true))
     :clj (into {} (System/getenv))))

(defn current-directory []
  "Get current working directory"
  #?(:cljs 
     (if (exists? js/window)
       "/" ; Browser environment - no real directory
       (.cwd js/process))
     :clj (System/getProperty "user.dir")))

(defn change-directory [path]
  "Change current working directory"
  #?(:cljs 
     (if (exists? js/window)
       nil ; Browser environment - no directory changes
       (.chdir js/process path))
     :clj (System/setProperty "user.dir" path)))

(defn get-file-info [path]
  "Get file information (limited in browser environment)"
  #?(:cljs 
     (if (exists? js/window)
       {:path path :directory? false :file? false} ; Browser environment
       (let [stats (.statSync fs path)]
         {:path path
          :size (.-size stats)
          :modified (.-mtimeMs stats)
          :directory? (.isDirectory stats)
          :file? (.isFile stats)
          :readable? true
          :writable? false}))
     :clj {}))

(defn copy-file [source dest]
  "Copy file (limited in browser environment)"
  #?(:cljs 
     (if (exists? js/window)
       nil ; Browser environment - no file operations
       (do
         (.mkdirSync fs (path/dirname dest) #js {:recursive true})
         (.copyFileSync fs source dest)))
     :clj nil))

(defn delete-file [path]
  "Delete file (limited in browser environment)"
  #?(:cljs 
     (if (exists? js/window)
       nil ; Browser environment - no file operations
       (.rmSync fs path #js {:recursive true :force true}))
     :clj nil))

(defn temp-directory []
  "Get temporary directory"
  #?(:cljs 
     (if (exists? js/window)
       "/tmp" ; Browser environment - placeholder
       (.tmpdir (js/require "os")))
     :clj (System/getProperty "java.io.tmpdir")))

(defn temp-file [prefix suffix]
  "Create temporary file"
  #?(:cljs 
     (if (exists? js/window)
       (str prefix "-" (random-uuid) suffix) ; Browser environment - placeholder
       (.mkdtempSync fs (str prefix "-") suffix))
     :clj (str "/tmp/" prefix "-" (random-uuid) suffix)))

(defn platform-info []
  "Get platform-specific information"
  #?(:cljs 
     (if (exists? js/window)
       {:platform :clojurescript
        :user-agent (.-userAgent js/navigator)
        :platform (.-platform js/navigator)
        :language (.-language js/navigator)
        :on-line? (.-onLine js/navigator)
        :browser true}
       {:platform :node-babashka
        :node-version (.-version js/process)
        :platform (.-platform js/process)
        :arch (.-arch js/process)
        :user-dir (.cwd js/process)
        :user-home (.homedir (js/require "os"))})
     :clj {:platform :clojure}))

(defn browser? []
  "Check if running in browser environment"
  #?(:cljs (exists? js/window) :clj false))

(defn nodejs? []
  "Check if running in Node.js environment"
  #?(:cljs (exists? js/process) :clj false))

(defn async-support? []
  "Check if async operations are supported"
  #?(:cljs true :clj false))

(defn limited-io? []
  "Check if I/O operations are limited"
  #?(:cljs (browser?) :clj false))

;; ClojureScript-specific optimizations
(defn optimize-for-cljs! []
  "Apply ClojureScript-specific optimizations"
  (println "Optimizing for ClojureScript runtime...")
  #?(:cljs 
     (when (exists? js/console)
       (set! *print-fn* js/console.log)
       (set! *print-err-fn* js/console.error))))

(defn clojurescript-specific-features []
  "Get ClojureScript-specific features"
  #?(:cljs 
     (merge
       {:javascript-runtime true
        :async-support true
        :browser (browser?)
        :nodejs (nodejs?)
        :limited-io (limited-io?)
        :google-closure true
        :advanced-compilation true
        :source-maps true}
       (when (browser?)
         {:dom-access true
          :web-apis true
          :local-storage true
          :session-storage true})
       (when (nodejs?)
         {:file-system true
          :process-control true
          :npm-support true}))
     :clj {}))

(defn browser-features []
  "Get browser-specific features"
  #?(:cljs 
     (when (browser?)
       {:dom-access true
        :web-apis true
        :local-storage true
        :session-storage true
        :web-workers true
        :service-workers true
        :indexed-db true
        :web-sockets true
        :fetch-api true})
     :clj {}))

(defn nodejs-features []
  "Get Node.js-specific features"
  #?(:cljs 
     (when (nodejs?)
       {:file-system true
        :process-control true
        :npm-support true
        :child-process true
        :os-apis true
        :path-apis true
        :buffer-support true
        :stream-support true})
     :clj {}))