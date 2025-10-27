(ns promethean.main.app
  (:require [reagent.dom :as rdom]
            [reagent.core :as r]
            [promethean.main.router :as router]
            [promethean.main.layout :as layout]))

(defn ^:dev/after-load mount-root []
  (let [root-el (.getElementById js/document "app")]
    (rdom/unmount-component-at-node root-el)
    (rdom/render [layout/app-container] root-el)))

(defn init []
  (router/init-routes!)
  (mount-root))