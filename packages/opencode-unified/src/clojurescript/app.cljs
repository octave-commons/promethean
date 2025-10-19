(ns opencode.app
  "Main application entry point")

(defn ^:export init
  "Initialize the complete application"
  []
  (js/console.log "Starting Promethean OpenCode Unified")
  (js/console.log "Application initialized successfully")
  (let [app-element (js/document.getElementById "app")]
    (when app-element
      (set! (.-innerHTML app-element) "<div style='padding: 20px; color: #4CAF50;'>Promethean OpenCode Unified - ClojureScript Active! ✅</div>")))

(defn ^:export main
  "Main entry point for the application"
  []
  (init))