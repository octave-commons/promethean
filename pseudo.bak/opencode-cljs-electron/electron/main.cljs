(ns electron.main
  (:require [clojure.string :as str]
            [goog.object :as gobj]
            [cljs.nodejs :as nodejs]))

(nodejs/enable-util-print!)

(def electron (js/require "electron"))
(def app (.-app electron))
(def BrowserWindow (.-BrowserWindow electron))
(def ipcMain (.-ipcMain electron))
(def path (js/require "path"))
(def fs (js/require "fs"))
(def chokidar (js/require "chokidar"))

(defonce win* (atom nil))

(defn user-data-path [] (.getPath app "userData"))
(defn plugin-dir [] (.join path (user-data-path) "plugins"))
(defn workspace-dir [] (.join path (user-data-path) "workspaces"))
(defn state-file [] (.join path (user-data-path) "state.json"))

(defn ensure-dir! [p]
  (when-not (.existsSync fs p) (.mkdirSync fs p #js {:recursive true})) p)

(defn ensure-plugin-dir! [] (ensure-dir! (plugin-dir)))
(defn ensure-workspace-dir! [] (ensure-dir! (workspace-dir)))

(defn create-window []
  (let [preload (.join path (.cwd js/process) "dist" "preload.js")
        w (BrowserWindow. (clj->js {:width 1400 :height 900
                                    :title "OpenCode • Spacemacs UI"
                                    :webPreferences {:contextIsolation true
                                                     :nodeIntegration false
                                                     :preload preload}}))]
    (reset! win* w)
    (let [url (str "file://" (.join path (.cwd js/process) "public" "index.html"))]
      (.loadURL w url))
    #_(.openDevTools (.-webContents w))
    (.on w "closed" #(reset! win* nil))))

(defn list-plugin-manifests []
  (ensure-plugin-dir!)
  (let [dir (plugin-dir)
        items (.readdirSync fs dir)]
    (->> items
         (map (fn [name]
                (let [m (.join path dir name "manifest.json")]
                  (when (.existsSync fs m)
                    (try
                      (let [txt (.readFileSync fs m "utf8")
                            data (js/JSON.parse txt)
                            entry (or (gobj/get data "entry") "dist/index.js")
                            url (str "file://" (.join path dir name entry))]
                        (clj->js {:id name :manifest data :url url}))
                      (catch :default _ nil))))))
         (filter identity)
         clj->js)))

(defn register-ipc! []
  (.handle ipcMain "paths" (fn [_]
                               (clj->js {:userData (user-data-path)
                                         :plugins  (plugin-dir)
                                         :workspaces (workspace-dir)})))
  (.handle ipcMain "plugins:list" (fn [_] (list-plugin-manifests)))
  ;; filesystem helpers
  (.handle ipcMain "fs:readFile" (fn [_ p] (.readFileSync fs p "utf8")))
  (.handle ipcMain "fs:writeFile" (fn [_ p data]
                                     (ensure-dir! (.dirname path p))
                                     (.writeFileSync fs p data "utf8")
                                     true))
  ;; state helpers
  (.handle ipcMain "state:read" (fn [_]
                                   (try (.readFileSync fs (state-file) "utf8")
                                        (catch :default _ nil))))
  (.handle ipcMain "state:write" (fn [_ data]
                                    (.writeFileSync fs (state-file) data "utf8") true))
  
  ;; File operations (from preload script)
  (.handle ipcMain "open-file" (fn [_ p] (.readFileSync fs p "utf8")))
  (.handle ipcMain "save-file" (fn [_ p content]
                                (ensure-dir! (.dirname path p))
                                (.writeFileSync fs p content "utf8")
                                true))
  (.handle ipcMain "list-directory" (fn [_ p]
                                      (try
                                        (let [items (.readdirSync fs p)]
                                          (clj->js (map str items)))
                                        (catch :default _ 
                                          (clj->js [])))))
  
  ;; Window management
  (.handle ipcMain "minimize-window" (fn [_]
                                      (when-let [win @win*]
                                        (.minimize win)
                                        true)))
  (.handle ipcMain "maximize-window" (fn [_]
                                      (when-let [win @win*]
                                        (if (.isMaximized win)
                                          (.unmaximize win)
                                          (.maximize win))
                                        true)))
  (.handle ipcMain "close-window" (fn [_]
                                   (when-let [win @win*]
                                     (.close win)
                                     true)))
  
  ;; Development tools
  (.handle ipcMain "open-dev-tools" (fn [_]
                                     (when-let [win @win*]
                                       (.openDevTools (.-webContents win))
                                       true)))
  
  ;; App info
  (.handle ipcMain "get-app-version" (fn [_]
                                      (.-version app)))
  
  ;; Plugin management
  (.handle ipcMain "load-plugin" (fn [_ plugin-path]
                                  (println "Load plugin requested:" plugin-path)
                                  (clj->js {:loaded true :path plugin-path})))
  (.handle ipcMain "unload-plugin" (fn [_ plugin-name]
                                    (println "Unload plugin requested:" plugin-name)
                                    (clj->js {:unloaded true :name plugin-name})))
  (.handle ipcMain "list-plugins" (fn [_]
                                    (list-plugin-manifests))))

(defn start-plugin-watch! []
  (ensure-plugin-dir!)
  (let [w (chokidar.watch (plugin-dir) #js {:ignoreInitial true})]
    (.on w "all" (fn [_ _]
                    (when-let [win @win*]
                      (.send (.-webContents win) "plugins:changed"))))))

(defn setup-menu-handlers! []
  (let [menu (.-Menu electron)]
    (.on ipcMain "menu-action" 
          (fn [_event action]
            (when-let [win @win*]
              (.send (.-webContents win) "menu-action" action))))))

(defn setup-plugin-handlers! []
  (.on ipcMain "plugin-event"
        (fn [_event event]
          (when-let [win @win*]
            (.send (.-webContents win) "plugin-event" event)))))

(defn start []
  (.on app "window-all-closed" (fn [] (when (not= (.-platform js/process) "darwin") (.quit app))))
  (.whenReady app (fn []
                    (ensure-plugin-dir!)
                    (ensure-workspace-dir!)
                    (register-ipc!)
                    (setup-menu-handlers!)
                    (setup-plugin-handlers!)
                    (start-plugin-watch!)
                    (create-window)
                    (.on app "activate" (fn [] (when (nil? @win*) (create-window)))))))