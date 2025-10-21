(ns shared.utils
  "Shared utilities for ClojureScript components")

(defn log
  "Log a message with timestamp"
  [level message]
  (println (str "[" (js/Date.) "] " level ": " message)))

(defn generate-uuid
  "Generate a UUID"
  []
  (random-uuid))