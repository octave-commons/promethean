(ns main.core
  (:require [reagent.core :as r]
            [reagent.dom :as dom]
            [re-frame.core :as rf]
            [main.events :as events]
            [main.subs :as subs]
            [components.app :refer [app]]))

(defn ^:export init []
  (js/console.log "Initializing app...")
  (rf/dispatch-sync [:initialize-db])
  (js/console.log "DB initialized")
  (rf/dispatch [:load-sessions])
  (js/console.log "Load sessions dispatched")
  (if js/ReactDOM
    ;; React 18 with createRoot
    (let [root (js/ReactDOM.createRoot (js/document.getElementById "app"))]
      (.render root [app]))
    ;; Fallback to legacy ReactDOM.render
    (dom/render [app] (js/document.getElementById "app")))
  (js/console.log "App rendered"))