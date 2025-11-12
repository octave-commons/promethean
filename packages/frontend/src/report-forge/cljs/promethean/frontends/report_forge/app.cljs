(ns promethean.frontends.report-forge.app
  (:require [promethean.shadow-ui.runtime :as runtime]))

(def placeholder
  [:section.module-placeholder
   [:h2 "Report Forge"]
   [:p "Report generation tools run via the dedicated /report-forge workspace."]
   [:p "This placeholder sticks around until we wire the real UI into Shadow."]])

(defn main-component []
  placeholder)

(defn ^:export init []
  (runtime/log-ready! "report-forge" {:bundle :shadow}))
