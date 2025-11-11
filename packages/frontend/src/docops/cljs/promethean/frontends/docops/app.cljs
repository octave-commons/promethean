(ns promethean.frontends.docops.app
  (:require [promethean.shadow-ui.runtime :as runtime]))

(def placeholder
  [:section.module-placeholder
   [:h2 "DocOps"]
   [:p "Documentation tooling still lives in the legacy dashboard."]
   [:p "Launch the DocOps client directly; this shell simply tracks bundle readiness."]])

(defn main-component []
  placeholder)

(defn ^:export init []
  (runtime/log-ready! "docops" {:bundle :shadow}))
