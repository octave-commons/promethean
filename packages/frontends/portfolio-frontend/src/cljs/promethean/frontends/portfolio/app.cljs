(ns promethean.frontends.portfolio.app
  "Shadow-CLJS bootstrap placeholder for the portfolio frontend."
  (:require [promethean.shadow-ui.runtime :as runtime]))

(defn ^:private announce! []
  (runtime/log-ready! "portfolio" {:bundle :shadow}))

(defn ^:export mount []
  (announce!))
