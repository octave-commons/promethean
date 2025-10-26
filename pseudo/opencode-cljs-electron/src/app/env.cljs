(ns app.env
  "Environment abstraction layer for dual-mode support")

(defn electron? []
  "Check if running in Electron environment"
  (and (exists? js/window) 
       (exists? (.-electronAPI js/window))))

(defn web? []
  "Check if running in web browser environment"
  (and (exists? js/window) 
       (not (electron?))))

(defn node? []
  "Check if running in Node.js environment"
  (exists? js/process))

(defn get-platform []
  "Get the current platform: :electron, :web, or :node"
  (cond
    (electron?) :electron
    (web?) :web
    (node?) :node
    :else :unknown))

(defn electron-api []
  "Get Electron API if available"
  (when (electron?)
    (.-electronAPI js/window)))

(defn show-notification? []
  "Check if notifications are supported"
  (or (electron?) 
      (and (web?) 
           (exists? js/Notification)
           (.-permission js/Notification) "granted")))

(defn file-system-access? []
  "Check if file system access is available"
  (electron?))

(defn get-app-version []
  "Get application version"
  (cond
    (electron?) 
    (when-let [electron-api (electron-api)]
      (.getAppVersion electron-api))
    
    :else 
    "web-version"))

(defn open-external-url [url]
  "Open URL in external browser"
  (cond
    (electron?)
    (when-let [electron-api (electron-api)]
      (.openExternal electron-api url))
    
    (web?)
    (.open js/window url "_blank")
    
    :else
    (println "Cannot open external URL:" url)))