(ns promethean.frontends.opencode-session-manager.app
  (:require [promethean.shadow-ui.runtime :as runtime]))

(def placeholder
  [:section.module-placeholder
   [:h2 "OpenCode Session Manager"]
   [:p "Session orchestration lives inside the standalone Opencode workspace."]
   [:p "This shell tracks readiness until the new UI is embedded."]])

(defn main-component []
  placeholder)

(defn ^:export init []
  (runtime/log-ready! "opencode-session-manager" {:bundle :shadow}))
