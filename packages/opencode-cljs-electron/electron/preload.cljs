(ns electron.preload
  (:require ["electron" :refer [contextBridge ipcRenderer]]))

;; Context bridge to expose secure APIs to renderer process
(contextBridge.exposeInMainWorld 
  "electronAPI"
  #js {:openFile 
       (fn [path] 
         (.invoke ipcRenderer "open-file" path))
       
       :saveFile 
       (fn [path content] 
         (.invoke ipcRenderer "save-file" path content))
       
       :listDirectory 
       (fn [path] 
         (.invoke ipcRenderer "list-directory" path))
       
       :onMenuAction 
       (fn [callback] 
         (.on ipcRenderer "menu-action" 
             (fn [_event data] 
               (callback data))))
       
       :sendToMain 
       (fn [channel data] 
         (.send ipcRenderer channel data))
       
       :onMainMessage 
       (fn [channel callback] 
         (.on ipcRenderer channel 
             (fn [_event data] 
               (callback data))))
       
       :removeAllListeners 
       (fn [channel] 
         (.removeAllListeners ipcRenderer channel))

       ;; Plugin system APIs
       :loadPlugin 
       (fn [pluginPath] 
         (.invoke ipcRenderer "load-plugin" pluginPath))
       
       :unloadPlugin 
       (fn [pluginName] 
         (.invoke ipcRenderer "unload-plugin" pluginName))
       
       :listPlugins 
       (fn [] 
         (.invoke ipcRenderer "list-plugins"))
       
       :onPluginEvent 
       (fn [callback] 
         (.on ipcRenderer "plugin-event" 
             (fn [_event data] 
               (callback data))))

       ;; Window management APIs
       :minimizeWindow 
       (fn [] 
         (.invoke ipcRenderer "minimize-window"))
       
       :maximizeWindow 
       (fn [] 
         (.invoke ipcRenderer "maximize-window"))
       
       :closeWindow 
       (fn [] 
         (.invoke ipcRenderer "close-window"))

       ;; Development APIs
       :openDevTools 
       (fn [] 
         (.invoke ipcRenderer "open-dev-tools"))

       ;; App info APIs
       :getAppVersion 
       (fn [] 
         (.invoke ipcRenderer "get-app-version"))})

;; Log that preload script has loaded
(println "Preload script loaded successfully")