(ns promethean.frontends.health_dashboard.app
  "Shadow-CLJS bootstrap placeholder for the health dashboard frontend."
  (:require [promethean.shadow-ui.runtime :as runtime]))

(defn ^:private announce! []
  (runtime/log-ready! "health-dashboard" {:bundle :shadow}))

(defn ^:export mount []
  (announce!))
