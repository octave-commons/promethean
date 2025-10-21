(ns main.test
  (:require [reagent.core :as r]
            [reagent.dom :as dom]))

(defn simple-app []
  [:div {:style {:padding "20px"}}
   [:h1 "Simple Test App"]
   [:p "ClojureScript is working!"]
   [:button {:on-click #(js/alert "Button clicked!")}
    "Click me"]])

(defn ^:export init []
  (dom/render [simple-app] (js/document.getElementById "app")))