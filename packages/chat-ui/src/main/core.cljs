(ns main.core
  (:require [reagent.core :as r]
            [reagent.dom :as dom]
            [re-frame.core :as rf]
            [main.events :as events]
            [main.subs :as subs]
            [components.app :refer [app]]))

(defn ^:export init []
  (rf/dispatch-sync [:initialize-db])
  (rf/dispatch [:load-sessions])
  (dom/render [app] (js/document.getElementById "app")))