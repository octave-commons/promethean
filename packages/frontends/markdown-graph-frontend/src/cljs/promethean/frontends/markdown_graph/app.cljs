(ns promethean.frontends.markdown_graph.app
  "Shadow-CLJS bootstrap placeholder for the markdown graph frontend."
  (:require [promethean.shadow-ui.runtime :as runtime]))

(defn ^:private announce! []
  (runtime/log-ready! "markdown-graph" {:bundle :shadow}))

(defn ^:export mount []
  (announce!))
