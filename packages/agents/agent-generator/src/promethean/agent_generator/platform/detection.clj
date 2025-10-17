(ns promethean.agent-generator.platform.detection
  "Platform detection and capability management for cross-platform compatibility")

(defn detect-platform []
  "Detect current Clojure platform runtime"
  (cond
    ;; Check for Babashka first (most restrictive)
    #?(:bb true :default false) :babashka
    
    ;; Check for ClojureScript (browser or Node.js)
    #?(:cljs true :default false) 
    (if #?(:cljs (exists? js/process) :default false)
      :node-babashka
      :clojurescript)
    
    ;; Check for Node.js environment (nbb)
    (and #?(:clj true :default false)
         (contains? (System/getenv) "NODE_ENV")) 
    :node-babashka
    
    ;; Check for Babashka classpath (alternative detection)
    (and #?(:clj true :default false)
         (contains? (System/getenv) "BABASHKA_CLASSPATH"))
    :babashka
    
    ;; Default to JVM
    :jvm))

(defn platform-capabilities [platform]
  "Return map of available capabilities per platform"
  (case platform
    :babashka 
    {:fs true 
     :http true 
     :json true 
     :yaml true 
     :process true 
     :cli true
     :native-binary true
     :fast-startup true
     :limited-memory true}
    
    :node-babashka 
    {:fs true 
     :http true 
     :json true 
     :yaml true 
     :nodejs true 
     :npm true
     :cli true
     :javascript-runtime true}
    
    :jvm 
    {:fs true 
     :http true 
     :json true 
     :yaml true 
     :process true 
     :database true 
     :threads true
     :full-clojure true
     :libraries true
     :reflection true}
    
    :clojurescript 
    {:fs false 
     :http true 
     :json true 
     :yaml true 
     :browser true 
     :javascript-runtime true
     :async true
     :limited-io true}))

(def ^:dynamic *platform* (detect-platform))

(defn current-platform []
  "Get the current platform"
  *platform*)

(defn feature-available? [feature]
  "Check if feature is available on current platform"
  (get (platform-capabilities *platform*) feature false))

(defn platform-info []
  "Get comprehensive platform information"
  {:platform *platform*
   :capabilities (platform-capabilities *platform*)
   :properties (platform-properties *platform*)})

(defn platform-properties [platform]
  "Get platform-specific properties"
  (case platform
    :babashka
    {:name "Babashka"
     :description "Native Clojure interpreter"
     :startup-time "<100ms"
     :memory-usage "Low"
     :deployment "Single binary"}
    
    :node-babashka
    {:name "Node.js Babashka"
     :description "Clojure on Node.js runtime"
     :startup-time "~200ms"
     :memory-usage "Medium"
     :deployment "Node.js package"}
    
    :jvm
    {:name "JVM Clojure"
     :description "Full JVM Clojure"
     :startup-time "1-3s"
     :memory-usage "High"
     :deployment "JAR file"}
    
    :clojurescript
    {:name "ClojureScript"
     :description "Clojure to JavaScript"
     :startup-time "~500ms"
     :memory-usage "Medium"
     :deployment "JavaScript bundle"}))

(defmacro when-platform [platform & body]
  "Execute body only if running on specified platform"
  `(when (= *platform* ~platform)
     ~@body))

(defmacro when-feature [feature & body]
  "Execute body only if feature is available"
  `(when (feature-available? ~feature)
     ~@body))

(defn platform-implementation [feature-symbol]
  "Get platform-specific implementation namespace for feature"
  (case *platform*
    :babashka (symbol (str "promethean.agent-generator.platform.adapters.bb/" feature-symbol))
    :node-babashka (symbol (str "promethean.agent-generator.platform.adapters.nbb/" feature-symbol))
    :jvm (symbol (str "promethean.agent-generator.platform.adapters.jvm/" feature-symbol))
    :clojurescript (symbol (str "promethean.agent-generator.platform.adapters.cljs/" feature-symbol))
    (throw (ex-info "Unsupported platform" {:platform *platform*}))))

(defn require-platform-implementation! [feature-symbol]
  "Require platform-specific implementation"
  (let [ns-sym (platform-implementation feature-symbol)]
    (when-let [ns-obj (find-ns ns-sym)]
      (require ns-obj))
    ns-obj))

(defn validate-platform-compatibility [required-features]
  "Validate that current platform supports required features"
  (let [missing-features (remove feature-available? required-features)]
    (if (seq missing-features)
      {:compatible false
       :missing-features missing-features
       :platform *platform*}
      {:compatible true
       :platform *platform*
       :capabilities (platform-capabilities *platform*)})))