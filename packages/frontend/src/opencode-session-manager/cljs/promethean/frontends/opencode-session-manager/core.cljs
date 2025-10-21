(ns app.core
  "OpenCode Session Manager - Core initialization"
  (:require [app.webcomponents.session-manager :as session-manager]
            [app.webcomponents.enhanced-session-manager :as enhanced-session-manager]
            [app.opencode :as opencode]))

(defn log-ready!
  "Write a console banner when the session manager loads."
  []
  (.info js/console "[opencode-session-manager] OpenCode Session Manager ready"))

(defn init []
  "Initialize the OpenCode Session Manager"
  (log-ready!)

  ;; Initialize OpenCode connection
  (when js/window.opencodeSDK
    (-> js/window.opencodeSDK
        (.initializeOpencode #js {:serverUrl "http://localhost:4096"})
        (.then (fn [result]
                 (js/console.log "OpenCode client initialized successfully")
                 result))
        (.catch (fn [error]
                  (js/console.error "Failed to initialize OpenCode:" error)))))

  ;; Register web components
  (when-let [session-manager-ns (find-ns 'app.webcomponents.session-manager)]
    ((ns-resolve session-manager-ns 'define-session-manager!)))

  (when-let [enhanced-session-manager-ns (find-ns 'app.webcomponents.enhanced-session-manager)]
    ((ns-resolve enhanced-session-manager-ns 'define-enhanced-session-manager!)))

  ;; Set up global event listeners
  (.addEventListener js/document "session-created"
                     (fn [e]
                       (let [session (js->clj (.-detail e) :keywordize-keys true)]
                         (js/console.log "Session created:" session))))

  (.addEventListener js/document "start-review"
                     (fn [e]
                       (let [session (js->clj (.-detail e) :keywordize-keys true)]
                         (js/console.log "Start review for session:" session)
                        ;; Auto-open review panel
                         (.dispatchEvent js/document
                                         (js/CustomEvent. "open-review-panel"
                                                          #js {:detail (.-detail e)}))))))