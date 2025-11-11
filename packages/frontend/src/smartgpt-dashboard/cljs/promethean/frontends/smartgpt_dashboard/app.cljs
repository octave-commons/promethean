(ns promethean.frontends.smartgpt-dashboard.app
  (:require [promethean.shadow-ui.runtime :as runtime]))

(def placeholder
  [:section.module-placeholder
   [:h2 "SmartGPT Dashboard"]
   [:p "The analytics dashboard deploys separately from the Promethean shell."]
   [:p "Use the standalone dashboard for now; this placeholder only signals readiness."]])

(defn main-component []
  placeholder)

(defn ^:export init []
  (runtime/log-ready! "smartgpt-dashboard" {:bundle :shadow}))
