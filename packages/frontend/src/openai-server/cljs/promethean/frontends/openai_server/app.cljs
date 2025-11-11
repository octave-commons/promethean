(ns promethean.frontends.openai-server.app
  (:require [promethean.shadow-ui.runtime :as runtime]))

(def placeholder
  [:section.module-placeholder
   [:h2 "OpenAI Server"]
   [:p "Server orchestration UI is maintained outside the shadow build."]
   [:p "Use the standalone dashboard or API to interact with it."]])

(defn main-component []
  placeholder)

(defn ^:export init []
  (runtime/log-ready! "openai-server" {:bundle :shadow}))
