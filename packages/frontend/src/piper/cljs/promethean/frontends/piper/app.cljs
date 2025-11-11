(ns promethean.frontends.piper.app
  (:require [promethean.shadow-ui.runtime :as runtime]))

(def placeholder
  [:section.module-placeholder
   [:h2 "Piper"]
   [:p "Pipeline automation UI has not migrated into the unified shell yet."]
   [:p "Track status via the CLI pipelines while we finish this port."]])

(defn main-component []
  placeholder)

(defn ^:export init []
  (runtime/log-ready! "piper" {:bundle :shadow}))
