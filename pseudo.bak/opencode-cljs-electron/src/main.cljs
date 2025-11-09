(ns main
  (:require [app.ui :as ui]
            [app.state :as state]
            [app.keymap :as keymap]
            [app.evil :as evil]
            [app.opencode :as opencode]
            [app.env :as env]))

;; Initialize the application
(defn init []
  (println (str "Starting Opencode on platform: " (env/get-platform)))

  ;; Initialize app state
  (println "Initializing app state...")

  ;; Initialize keymap
  (keymap/init)

  ;; Initialize Evil mode
  (evil/init)

  ;; Initialize UI
  (ui/init)

  ;; Initialize Opencode SDK integration
  (opencode/init-opencode)

  ;; Set up Electron-specific event listeners
  (when (env/electron?)
    (let [electron-api (env/electron-api)]
      (.onMenuAction electron-api
                     (fn [action]
                       (println "Menu action:" action)
                       (case action
                         "open-file" (println "Open file requested")
                         "save-file" (println "Save file requested")
                         "new-file" (println "New file requested")
                         "quit" (println "Quit requested")
                         (println "Unknown menu action:" action))))

      (.onPluginEvent electron-api
                      (fn [event]
                        (println "Plugin event:" event)))

      (.onMainMessage electron-api
                      "opencode-response"
                      (fn [response]
                        (println "Opencode response:" response)))))

  ;; Web-specific setup
  (when (env/web?)
    (println "Running in web mode - some Electron features will be unavailable"))

  (println "Opencode started successfully!"))

;; Start the app when DOM is ready
(if (and js/document
         (not= (.-readyState js/document) "loading"))
  (init)
  (.addEventListener js/document "DOMContentLoaded" init))

;; Hot module replacement support
(defn ^:export reload []
  (println "Hot reloading main...")
  (ui/reload))

(defn ^:export clear []
  (println "Clearing main...")
  (ui/clear))