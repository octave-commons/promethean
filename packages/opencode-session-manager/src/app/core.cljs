(ns app.core
  "OpenCode Session Manager - Core initialization")

(defn log-ready!
  "Write a console banner when the session manager loads."
  []
  (.info js/console "[opencode-session-manager] OpenCode Session Manager ready"))

(defn init []
  "Initialize the OpenCode Session Manager"
  (log-ready!))