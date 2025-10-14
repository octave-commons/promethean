(ns app.webcomponents.session-manager
  (:require [reagent.core :as r]
            [reagent.dom :as dom]
            [re-frame.core :as rf]
            [app.subs :as subs]
            [app.events :as events]
            [app.opencode :as opencode]))

(defn session-manager-template []
  (let [this (r/current-component)
        props (r/props this)
        {:keys [sessions loading? error on-create-session on-delete-session on-select-session]} props]

    [:div.session-manager
     [:div.session-manager-header
      [:h2 "Session Manager"]
      [:button.create-btn
       {:on-click on-create-session}
       "+ Create Session"]]

     (cond
       loading? [:div.loading "Loading sessions..."]
       error [:div.error "Error: " error]
       :else [:div.sessions-list
              (if (empty? sessions)
                [:div.no-sessions "No sessions available"]
                (for [session sessions]
                  ^{:key (:id session)}
                  [:div.session-card
                   {:on-click #(on-select-session session)}
                   [:h3 (:title session)]
                   [:p.session-id "ID: " (:id session)]
                   [:p.session-date "Created: " (:createdAt session)]
                   [:div.session-actions
                    [:button.delete-btn
                     {:on-click (fn [e]
                                  (.stopPropagation e)
                                  (on-delete-session (:id session)))}
                     "Delete"]]]))])]))

(defn define-session-manager! []
  (js/customElements.define
   "session-manager"
   (clj->js
    (prototype
     (fn []
       (this-as this
                (let [props (r/atom {})]
                  (set! (.-props this) props)
                  (set! (.-shadowRoot this) (.attachShadow this #js {:mode "open"}))

                  (.defineProperty this "sessions"
                                   #js {:get (fn [] (get @props :sessions []))
                                        :set (fn [value] (swap! props assoc :sessions value))})

                  (.defineProperty this "loading"
                                   #js {:get (fn [] (get @props :loading? false))
                                        :set (fn [value] (swap! props assoc :loading? value))})

                  (.defineProperty this "error"
                                   #js {:get (fn [] (get @props :error nil))
                                        :set (fn [value] (swap! props assoc :error value))})

                  (.defineProperty this "onCreateSession"
                                   #js {:get (fn [] (get @props :on-create-session nil))
                                        :set (fn [value] (swap! props assoc :on-create-session value))})

                  (.defineProperty this "onDeleteSession"
                                   #js {:get (fn [] (get @props :on-delete-session nil))
                                        :set (fn [value] (swap! props assoc :on-delete-session value))})

                  (.defineProperty this "onSelectSession"
                                   #js {:get (fn [] (get @props :on-select-session nil))
                                        :set (fn [value] (swap! props assoc :on-select-session value))}))))

     (fn connectedCallback []
       (this-as this
                (let [props (.-props this)]
                  (dom/render
                   [session-manager-template @props]
                   (.-shadowRoot this)))))

     (fn attributeChangedCallback [name old-value new-value]
       (this-as this
                (let [props (.-props this)]
                  (case name
                    "sessions" (swap! props assoc :sessions (js/JSON.parse new-value))
                    "loading" (swap! props assoc :loading? (js/Boolean new-value))
                    "error" (swap! props assoc :error new-value)))))

     (fn observedAttributes []
       #js ["sessions" "loading" "error"])))))