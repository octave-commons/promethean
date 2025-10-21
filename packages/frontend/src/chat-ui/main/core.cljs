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
  (let [app-element (js/document.getElementById "root")]
    (if app-element
      (do
        (js/console.log "Found app element:" app-element)
        (if (exists? js/ReactDOM)
          (do
            (js/console.log "Using React 18 createRoot")
            (let [root (js/ReactDOM.createRoot app-element)]
              (.render root (r/as-element [app]))))
          (do
            (js/console.log "Using legacy ReactDOM.render")
            (dom/render [app] app-element)))
        (js/console.log "App rendered"))
      (js/console.error "App element not found!"))))