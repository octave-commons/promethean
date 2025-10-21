(ns chat-ui.core
  (:require [reagent.core :as r]
            [reagent.dom :as dom]
            [re-frame.core :as rf]
            [chat-ui.main.events :as events]
            [chat-ui.main.subs :as subs]
            [chat-ui.components.app :refer [app]]))

(defn ^:export init []
  (rf/dispatch-sync [:initialize-db])
  (rf/dispatch [:load-sessions])
  (dom/render [app] (js/document.getElementById "app")))