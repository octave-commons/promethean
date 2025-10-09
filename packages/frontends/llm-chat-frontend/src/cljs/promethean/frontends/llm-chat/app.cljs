(ns promethean.frontends.llm-chat.app
  "Shadow-CLJS bootstrap placeholder for the LLM chat frontend."
  (:require [promethean.shadow-ui.runtime :as runtime]))

(defn ^:private announce! []
  (runtime/log-ready! "llm-chat" {:bundle :shadow}))

(defn ^:export mount []
  (announce!))
