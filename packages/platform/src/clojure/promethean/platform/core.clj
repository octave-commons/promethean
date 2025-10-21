(ns promethean.platform.core
  "Cross-platform compatibility layer for Clojure environments
   Supports: bb (Babashka), nbb (Node.js Babashka), JVM Clojure, shadow-cljs"
  (:require [clojure.string :as str]))

;; Platform detection constants
(def platforms #{:babashka :node-babashka :jvm :clojurescript})

;; Feature availability matrix
(def feature-matrix
  {:babashka
   {:file-io true
    :network true
    :process true
    :java-interop false
    :nodejs false
    :native-libs true}
   
   :node-babashka
   {:file-io true
    :network true
    :process true
    :java-interop false
    :nodejs true
    :native-libs false}
   
   :jvm
   {:file-io true
    :network true
    :process true
    :java-interop true
    :nodejs false
    :native-libs true}
   
   :clojurescript
   {:file-io false
    :network true
    :process false
    :java-interop false
    :nodejs true
    :native-libs false}})

(defn detect-platform
  "Detect the current Clojure runtime platform"
  []
  (cond
    ;; Check for Babashka
    (and (exists? #?(:clj 'babashka.core :cljs nil))
         (contains? (ns-publics 'babashka.core) 'babashka-version))
    :babashka
    
    ;; Check for Node.js Babashka (nbb)
    (and (exists? #?(:clj 'sci.core :cljs nil))
         (exists? #?(:clj 'nbb.core :cljs nil)))
    :node-babashka
    
    ;; Check for ClojureScript (shadow-cljs or other)
    #?(:cljs :clojurescript
       :default (when (and (exists? 'cljs.core)
                          (exists? 'cljs.analyzer))
                  :clojurescript))
    
    ;; Default to JVM
    :jvm))

(defn current-platform
  "Get the current platform, memoized for performance"
  []
  (or (get @#'platform-cache :current)
      (let [platform (detect-platform)]
        (alter-var-root #'platform-cache assoc :current platform)
        platform)))

(def platform-cache (atom {}))

(defn platform-available?
  "Check if a specific platform is available in the current environment"
  [platform]
  (contains? platforms platform))

(defn feature-available?
  "Check if a feature is available on the current platform"
  [feature]
  (let [platform (current-platform)]
    (get-in feature-matrix [platform feature] false)))

(defn platform-features
  "Get all available features for the current platform"
  []
  (let [platform (current-platform)]
    (get feature-matrix platform)))

(defn require-platform-feature
  "Require a specific feature to be available, throw if not"
  [feature]
  (when-not (feature-available? feature)
    (throw (ex-info (str "Feature '" feature "' is not available on platform " (current-platform))
                    {:feature feature
                     :platform (current-platform)
                     :available-features (platform-features)}))))

(defn with-platform-requirements
  "Execute a function only if all required features are available"
  [features f]
  (if (every? feature-available? features)
    (f)
    (throw (ex-info "Platform requirements not met"
                    {:required features
                     :available (platform-features)
                     :platform (current-platform)}))))

(defn platform-info
  "Get comprehensive platform information"
  []
  {:platform (current-platform)
   :features (platform-features)
   :available-platforms platforms
   :feature-matrix feature-matrix})

;; Platform-specific loading mechanisms
(defmulti load-platform-features
  "Load platform-specific features and implementations"
  (fn [platform] platform))

(defmethod load-platform-features :babashka [_]
  {:file-operations 'promethean.platform.babashka.file
   :process-operations 'promethean.platform.babashka.process
   :network-operations 'promethean.platform.babashka.network})

(defmethod load-platform-features :node-babashka [_]
  {:file-operations 'promethean.platform.nodejs.file
   :process-operations 'promethean.platform.nodejs.process
   :network-operations 'promethean.platform.nodejs.network})

(defmethod load-platform-features :jvm [_]
  {:file-operations 'promethean.platform.jvm.file
   :process-operations 'promethean.platform.jvm.process
   :network-operations 'promethean.platform.jvm.network})

(defmethod load-platform-features :clojurescript [_]
  {:file-operations 'promethean.platform.cljs.file
   :process-operations 'promethean.platform.cljs.process
   :network-operations 'promethean.platform.cljs.network})

(defn get-platform-implementation
  "Get the platform-specific implementation for the current platform"
  []
  (load-platform-features (current-platform)))

;; Graceful fallback utilities
(defn with-fallback
  "Execute function with fallback if platform doesn't support it"
  [primary-fn fallback-fn]
  (try
    (primary-fn)
    (catch #?(:clj Exception :cljs :default) e
      (fallback-fn))))

(defn platform-specific
  "Execute platform-specific code with fallbacks"
  {:arglists '([babashka-fn node-babashka-fn jvm-fn cljs-fn])}
  [& functions]
  (let [platform (current-platform)
        [bb-fn nbb-fn jvm-fn cljs-fn] functions]
    (case platform
      :babashka (when bb-fn (bb-fn))
      :node-babashka (when nbb-fn (nbb-fn))
      :jvm (when jvm-fn (jvm-fn))
      :clojurescript (when cljs-fn (cljs-fn))
      (throw (ex-info "Unsupported platform" {:platform platform})))))

;; Initialization
(defn init!
  "Initialize the platform compatibility layer"
  []
  (let [platform (current-platform)]
    (println (str "Initializing Promethean Platform on " platform))
    (load-platform-features platform)
    platform))