(ns promethean.agent-generator.platform.adapters.nbb
  "Node.js Babashka-specific platform adapter implementations"
  (:require ["fs" :as fs]
            ["path" :as path]
            ["process" :as node-process]
            ["child_process" :as child-process]
            ["https" :as https]
            ["http" :as http]
            ["os" :as os]
            [clojure.string :as str]))

(defn file-exists? [path]
  "Check if file exists"
  (.existsSync fs path))

(defn read-file [path]
  "Read file content"
  (.readFileSync fs path "utf8"))

(defn write-file [path content]
  "Write content to file"
  (.mkdirSync fs (path/dirname path) #js {:recursive true})
  (.writeFileSync fs path content "utf8"))

(defn list-files [dir pattern]
  "List files matching pattern"
  (let [files (.readdirSync fs dir #js {:withFileTypes true})]
    (->> (array-seq files)
         (filter #(.isFile %))
         (map #(.name %))
         (filter #(re-matches (re-pattern pattern) %))
         (map #(path/join dir %)))))

(defn make-directory [path]
  "Create directory"
  (.mkdirSync fs path #js {:recursive true}))

(defn http-get [url]
  "Make HTTP GET request"
  (let [url-obj (js/URL. url)
        is-https (= "https:" (.-protocol url-obj))
        http-module (if is-https https http)]
    (try
      (let [result (js/Promise.resolve
                     (.then (.get http-module url-obj
                                   #js {:headers #js {"User-Agent" "Agent-Generator/1.0"}})
                           (fn [res]
                             (js/Promise.resolve
                               (.then (js-obj "data" "")
                                     (fn [data]
                                       (.on res "data" 
                                             (fn [chunk] 
                                               (set! data (str data chunk))))
                                       (.on res "end" 
                                             (fn [] 
                                               #js {:success true :body data})))))))]
        (clj->js result))
      (catch :default e
        #js {:success false :error (.-message e)}))))

(defn parse-json [content]
  "Parse JSON content"
  (js->clj (js/JSON.parse content) :keywordize-keys true))

(defn generate-json [data]
  "Generate JSON content"
  (.stringify js/JSON (clj->js data) nil 2))

(defn parse-yaml [content]
  "Parse YAML content"
  (try
    (require '["js-yaml" :as yaml])
    (js->clj (.load yaml js-yaml content) :keywordize-keys true)
    (catch :default e
      (throw (ex-info "YAML parsing not available" {:error (.-message e)})))))

(defn generate-yaml [data]
  "Generate YAML content"
  (try
    (require '["js-yaml" :as yaml])
    (.dump yaml js-yaml (clj->js data))
    (catch :default e
      (throw (ex-info "YAML generation not available" {:error (.-message e)})))))

(defn execute-command [cmd & args]
  "Execute external command"
  (let [result (.execSync child-process (str/join " " (into [cmd] args)) #js {:encoding "utf8"})]
    {:exit 0
     :out result
     :err ""
     :success true}))

(defn get-environment-variable [name]
  "Get environment variable"
  (.env node-process name))

(defn get-environment-variables []
  "Get all environment variables"
  (js->clj (.env node-process) :keywordize-keys true))

(defn current-directory []
  "Get current working directory"
  (.cwd node-process))

(defn change-directory [path]
  "Change current working directory"
  (.chdir node-process path))

(defn get-file-info [path]
  "Get file information"
  (let [stats (.statSync fs path)]
    {:path path
     :size (.-size stats)
     :modified (.-mtimeMs stats)
     :directory? (.isDirectory stats)
     :file? (.isFile stats)
     :readable? (.mode stats)
     :writable? (.mode stats)}))

(defn copy-file [source dest]
  "Copy file"
  (.mkdirSync fs (path/dirname dest) #js {:recursive true})
  (.copyFileSync fs source dest))

(defn delete-file [path]
  "Delete file"
  (.rmSync fs path #js {:recursive true :force true}))

(defn temp-directory []
  "Get temporary directory"
  (.tmpdir os))

(defn temp-file [prefix suffix]
  "Create temporary file"
  (.mkdtempSync fs (str prefix "-") suffix))

(defn platform-info []
  "Get platform-specific information"
  {:platform :node-babashka
   :node-version (.-version node-process)
   :platform (.-platform node-process)
   :arch (.-arch node-process)
   :user-dir (current-directory)
   :user-home (.homedir os)})

(defn nodejs-available? []
  "Check if Node.js features are available"
  true)

(defn npm-available? []
  "Check if npm is available"
  (try
    (.execSync child-process "npm --version" #js {:encoding "utf8"})
    true
    (catch :default e
      false)))

(defn javascript-runtime? []
  "Check if running on JavaScript runtime"
  true)

(defn async-support? []
  "Check if async operations are supported"
  true)

;; Node.js-specific optimizations
(defn optimize-for-nodejs! []
  "Apply Node.js-specific optimizations"
  (println "Optimizing for Node.js runtime...")
  ;; Enable Node.js-specific features
  (set! *print-fn* js/console.log)
  (set! *print-err-fn* js/console.error))

(defn nodejs-specific-features []
  "Get Node.js-specific features"
  {:javascript-runtime true
   :npm-support (npm-available?)
   :async-support true
   :event-loop true
   :buffer-support true
   :stream-support true})