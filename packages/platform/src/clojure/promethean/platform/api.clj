(ns promethean.platform.api
  "Unified cross-platform API that provides consistent interface across all platforms"
  (:require [promethean.platform.core :as platform]))

;; Unified file operations API
(defprotocol FileOperations
  "Protocol for file operations across platforms"
  (exists? [this path] "Check if file exists")
  (read [this path] "Read file contents")
  (write [this path content] "Write content to file")
  (delete [this path] "Delete file")
  (list-dir [this path] "List directory contents")
  (mkdir [this path] "Create directory")
  (stats [this path] "Get file statistics"))

(defprotocol ProcessOperations
  "Protocol for process operations across platforms"
  (exec [this cmd & args] "Execute command")
  (exec-async [this cmd & args] "Execute command asynchronously")
  (running? [this proc] "Check if process is running")
  (kill [this proc] "Kill process"))

(defprotocol NetworkOperations
  "Protocol for network operations across platforms"
  (http-get [this url & opts] "Make HTTP GET request")
  (http-post [this url body & opts] "Make HTTP POST request"))

(defprotocol PlatformOperations
  "Protocol for platform-specific operations"
  (platform-info [this] "Get platform information")
  (optimize [this] "Apply platform optimizations"))

;; Default implementations that delegate to platform-specific code
(defn create-file-operations []
  "Create file operations instance for current platform"
  (let [impl (platform/get-platform-implementation)
        file-ns (:file-operations impl)]
    (when file-ns
      (require file-ns)
      (reify FileOperations
        (exists? [_ path] ((resolve (symbol (str file-ns) "file-exists?")) path))
        (read [_ path] ((resolve (symbol (str file-ns) "read-file")) path))
        (write [_ path content] ((resolve (symbol (str file-ns) "write-file")) path content))
        (delete [_ path] ((resolve (symbol (str file-ns) "delete-file")) path))
        (list-dir [_ path] ((resolve (symbol (str file-ns) "list-directory")) path))
        (mkdir [_ path] ((resolve (symbol (str file-ns) "create-directory")) path))
        (stats [_ path] ((resolve (symbol (str file-ns) "file-stats")) path))))))

(defn create-process-operations []
  "Create process operations instance for current platform"
  (let [impl (platform/get-platform-implementation)
        process-ns (:process-operations impl)]
    (when process-ns
      (require process-ns)
      (reify ProcessOperations
        (exec [_ cmd & args] (apply (resolve (symbol (str process-ns) "execute-command")) cmd args))
        (exec-async [_ cmd & args] (apply (resolve (symbol (str process-ns) "execute-command-async")) cmd args))
        (running? [_ proc] ((resolve (symbol (str process-ns) "process-running?")) proc))
        (kill [_ proc] ((resolve (symbol (str process-ns) "kill-process")) proc))))))

(defn create-network-operations []
  "Create network operations instance for current platform"
  (let [impl (platform/get-platform-implementation)
        network-ns (:network-operations impl)]
    (when network-ns
      (require network-ns)
      (reify NetworkOperations
        (http-get [_ url & opts] (apply (resolve (symbol (str network-ns) "http-get")) url opts))
        (http-post [_ url body & opts] (apply (resolve (symbol (str network-ns) "http-post")) url body opts))))))

(defn create-platform-operations []
  "Create platform operations instance for current platform"
  (let [current-platform (platform/current-platform)]
    (reify PlatformOperations
      (platform-info [_] (platform/platform-info))
      (optimize [_] 
        (case current-platform
          :babashka (require 'promethean.platform.babashka) ((resolve 'promethean.platform.babashka/optimize-for-babashka))
          :node-babashka (require 'promethean.platform.nodejs) ((resolve 'promethean.platform.nodejs/optimize-for-nodejs))
          :jvm (require 'promethean.platform.jvm) ((resolve 'promethean.platform.jvm/optimize-for-jvm))
          :clojurescript (require 'promethean.platform.cljs) ((resolve 'promethean.platform.cljs/optimize-for-cljs)))))))

;; Convenience functions that work across all platforms
(defn file-exists? [path]
  "Check if file exists on current platform"
  (when (platform/feature-available? :file-io)
    (if-let [file-ops (create-file-operations)]
      (exists? file-ops path)
      (throw (ex-info "File operations not available on this platform" {:path path})))))

(defn read-file [path]
  "Read file contents on current platform"
  (when (platform/feature-available? :file-io)
    (if-let [file-ops (create-file-operations)]
      (read file-ops path)
      (throw (ex-info "File operations not available on this platform" {:path path})))))

(defn write-file [path content]
  "Write content to file on current platform"
  (when (platform/feature-available? :file-io)
    (if-let [file-ops (create-file-operations)]
      (write file-ops path content)
      (throw (ex-info "File operations not available on this platform" {:path path})))))

(defn delete-file [path]
  "Delete file on current platform"
  (when (platform/feature-available? :file-io)
    (if-let [file-ops (create-file-operations)]
      (delete file-ops path)
      (throw (ex-info "File operations not available on this platform" {:path path})))))

(defn list-directory [path]
  "List directory contents on current platform"
  (when (platform/feature-available? :file-io)
    (if-let [file-ops (create-file-operations)]
      (list-dir file-ops path)
      (throw (ex-info "File operations not available on this platform" {:path path})))))

(defn create-directory [path]
  "Create directory on current platform"
  (when (platform/feature-available? :file-io)
    (if-let [file-ops (create-file-operations)]
      (mkdir file-ops path)
      (throw (ex-info "File operations not available on this platform" {:path path})))))

(defn file-stats [path]
  "Get file statistics on current platform"
  (when (platform/feature-available? :file-io)
    (if-let [file-ops (create-file-operations)]
      (stats file-ops path)
      (throw (ex-info "File operations not available on this platform" {:path path})))))

(defn execute-command [cmd & args]
  "Execute command on current platform"
  (when (platform/feature-available? :process)
    (if-let [process-ops (create-process-operations)]
      (apply exec process-ops cmd args)
      (throw (ex-info "Process operations not available on this platform" {:cmd cmd :args args})))))

(defn execute-command-async [cmd & args]
  "Execute command asynchronously on current platform"
  (when (platform/feature-available? :process)
    (if-let [process-ops (create-process-operations)]
      (apply exec-async process-ops cmd args)
      (throw (ex-info "Process operations not available on this platform" {:cmd cmd :args args})))))

(defn http-get [url & opts]
  "Make HTTP GET request on current platform"
  (when (platform/feature-available? :network)
    (if-let [network-ops (create-network-operations)]
      (apply http-get network-ops url opts)
      (throw (ex-info "Network operations not available on this platform" {:url url})))))

(defn http-post [url body & opts]
  "Make HTTP POST request on current platform"
  (when (platform/feature-available? :network)
    (if-let [network-ops (create-network-operations)]
      (apply http-post network-ops url body opts)
      (throw (ex-info "Network operations not available on this platform" {:url url})))))

(defn get-platform-info []
  "Get comprehensive platform information"
  (if-let [platform-ops (create-platform-operations)]
    (platform-info platform-ops)
    (platform/platform-info)))

(defn optimize-platform []
  "Apply platform-specific optimizations"
  (if-let [platform-ops (create-platform-operations)]
    (optimize platform-ops)
    {:optimizations-applied false :reason "Platform operations not available"}))

;; Cross-platform utilities
(defn with-file-operations [f]
  "Execute function with file operations if available"
  (platform/with-platform-requirements [:file-io] f))

(defn with-process-operations [f]
  "Execute function with process operations if available"
  (platform/with-platform-requirements [:process] f))

(defn with-network-operations [f]
  "Execute function with network operations if available"
  (platform/with-platform-requirements [:network] f))

(defn platform-specific-call
  "Make platform-specific calls with fallbacks"
  {:arglists '([babashka-fn node-babashka-fn jvm-fn cljs-fn])}
  [& functions]
  (apply platform/platform-specific functions))

;; Feature detection utilities
(defn supports-file-operations? []
  "Check if current platform supports file operations"
  (platform/feature-available? :file-io))

(defn supports-process-operations? []
  "Check if current platform supports process operations"
  (platform/feature-available? :process))

(defn supports-network-operations? []
  "Check if current platform supports network operations"
  (platform/feature-available? :network))

(defn supports-java-interop? []
  "Check if current platform supports Java interop"
  (platform/feature-available? :java-interop))

(defn supports-nodejs? []
  "Check if current platform supports Node.js APIs"
  (platform/feature-available? :nodejs))

(defn supports-native-libs? []
  "Check if current platform supports native libraries"
  (platform/feature-available? :native-libs))