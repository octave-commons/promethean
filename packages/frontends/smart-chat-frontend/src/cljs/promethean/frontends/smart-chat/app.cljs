(ns promethean.frontends.smart-chat.app
  "Shadow-CLJS bootstrap placeholder for the smart chat frontend."
  (:require [promethean.shadow-ui.runtime :as runtime]))

(defn ^:private announce! []
  (runtime/log-ready! "smart-chat" {:bundle :shadow}))

(defn ^:export mount []
  (announce!))
