(ns promethean.frontends.docops.app
  "Shadow-CLJS bootstrap placeholder for the DocOps frontend."
  (:require [promethean.shadow-ui.runtime :as runtime]))

(defn ^:private announce! []
  (runtime/log-ready! "docops" {:bundle :shadow}))

(defn ^:export mount []
  (announce!))
