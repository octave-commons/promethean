(ns promethean.frontends.smartgpt-dashboard.app
  "Shadow-CLJS bootstrap placeholder for the SmartGPT dashboard frontend."
  (:require [promethean.shadow-ui.runtime :as runtime]))

(defn ^:private announce! []
  (runtime/log-ready! "smartgpt-dashboard" {:bundle :shadow}))

(defn ^:export mount []
  (announce!))
