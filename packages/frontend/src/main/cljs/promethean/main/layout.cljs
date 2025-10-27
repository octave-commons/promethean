(ns promethean.main.layout
  (:require [reagent.core :as r]
            [promethean.main.router :as router]
            [promethean.main.components.nav :as nav]))

(defn app-container []
  [:div.app-container
   [nav/navigation-bar]
   [:main.content
    [router/current-page]]])