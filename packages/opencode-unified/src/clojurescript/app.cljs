(ns opencode.app
  "Main application entry point"
  (:require [opencode.editor.core :as editor]
            [opencode.shared.utils :as utils]))

(defn init
  "Initialize the complete application"
  []
  (utils/log "INFO" "Starting Promethean OpenCode Unified")
  (editor/init)
  (utils/log "INFO" "Application initialized successfully"))

(defn ^:export main
  "Main entry point for the application"
  []
  (init))