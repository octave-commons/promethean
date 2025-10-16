(ns main
  (:require [app.ui :as ui]
            [app.state :as state]
            [app.keymap :as keymap]
            [app.evil :as evil]
            [app.opencode :as opencode]))

;; Initialize the application
(defn init []
  (println "Starting Opencode...")
  
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
  
  ;; Set up Opencode API event listeners
  (when js/window.electronAPI
    (.onMenuAction js/window.electronAPI 
                   (fn [action]
                     (println "Menu action:" action)
                     (case action
                       "open-file" (println "Open file requested")
                       "save-file" (println "Save file requested")
                       "new-file" (println "New file requested")
                       "quit" (println "Quit requested")
                       (println "Unknown menu action:" action))))
    
    (.onPluginEvent js.window.electronAPI
                    (fn [event]
                      (println "Plugin event:" event)))
    
    (.onMainMessage js.window.electronAPI
                    "opencode-response"
                    (fn [response]
                      (println "Opencode response:" response))))
  
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