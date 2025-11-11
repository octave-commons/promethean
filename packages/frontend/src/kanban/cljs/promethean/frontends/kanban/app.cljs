(ns promethean.frontends.kanban.app
  (:require [promethean.shadow-ui.runtime :as runtime]))

(def placeholder
  [:section.module-placeholder
   [:h2 "Kanban"]
   [:p "The Kanban board currently runs as a separate bundle."]
   [:p "Check /kanban or the dedicated workspace to interact with it."]])

(defn main-component []
  placeholder)

(defn ^:export init []
  (runtime/log-ready! "kanban" {:bundle :shadow}))
