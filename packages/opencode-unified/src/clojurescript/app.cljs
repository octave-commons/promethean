(ns opencode.app
  "Main application entry point")

(defn init
  "Initialize the complete application"
  []
  (println "Starting Promethean OpenCode Unified")
  (println "Application initialized successfully"))

(defn ^:export main
  "Main entry point for the application"
  []
  (init))