(ns promethean.main.router
  (:require [reagent.core :as r]
            [promethean.main.components.nav :as nav]
            [promethean.frontends.chat-ui.app :as chat-ui]
            [promethean.frontends.docops.app :as docops]
            [promethean.frontends.duck-web.app :as duck-web]
            [promethean.frontends.kanban.app :as kanban]
            [promethean.frontends.openai-server.app :as openai-server]
            [promethean.frontends.opencode-session-manager.app :as opencode-session]
            [promethean.frontends.piper.app :as piper]
            [promethean.frontends.report-forge.app :as report-forge]
            [promethean.frontends.smartgpt-dashboard.app :as smartgpt-dashboard]))

(defonce current-route (r/atom {:page :home}))

(def routes
  {:home {:component nav/home-page
          :title "Promethean OS"}
   :chat-ui {:component chat-ui/main-component
             :title "Chat UI"}
   :docops {:component docops/main-component
            :title "DocOps"}
   :duck-web {:component duck-web/main-component
              :title "Duck Web"}
   :kanban {:component kanban/main-component
            :title "Kanban"}
   :openai-server {:component openai-server/main-component
                   :title "OpenAI Server"}
   :opencode-session {:component opencode-session/main-component
                      :title "Opencode Session Manager"}
   :piper {:component piper/main-component
           :title "Piper"}
   :report-forge {:component report-forge/main-component
                  :title "Report Forge"}
   :smartgpt-dashboard {:component smartgpt-dashboard/main-component
                        :title "SmartGPT Dashboard"}})

(defn navigate-to [page]
  (reset! current-route {:page page})
  (.pushState js/history #js {} "" (str "/" (name page))))

(defn current-page []
  (let [route (get routes (:page @current-route))]
    (if-let [Component (:component route)]
      [Component]
      [:div "Page not found"])))

(defn init-routes! []
  (set! (.-onpopstate js/window)
        (fn [event]
          (let [path (subs (.-pathname js/location) 1)
                page (keyword path)]
            (reset! current-route {:page page}))))
  
  ;; Handle initial route
  (let [path (subs (.-pathname js/location) 1)]
    (when (not-empty path)
      (reset! current-route {:page (keyword path)}))))