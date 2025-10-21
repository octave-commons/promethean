(ns app.webcomponents.session-card
  (:require [reagent.core :as r]
            [reagent.dom :as dom]
            [re-frame.core :as rf]
            [app.events :as events]))

(defn session-card-template []
  (let [this (r/current-component)
        props (r/props this)
        {:keys [session selected? on-click on-delete on-prompt]} props]
    
    [:div.session-card 
     {:class (when selected? "selected")
      :on-click on-click}
     [:div.session-header
      [:h3.session-title (:title session)]
      [:span.session-status (get-in session [:status :name] "active")]]
     
     [:div.session-meta
      [:p.session-id "ID: " (:id session)]
      [:p.session-date 
       "Created: " 
       (if-let [created-at (:createdAt session)]
         (.toLocaleDateString (js/Date. created-at))
         "Unknown")]]
     
     (when-let [description (:description session)]
       [:p.session-description description])
     
     [:div.session-actions
      [:button.prompt-btn
       {:on-click (fn [e]
                    (.stopPropagation e)
                    (when on-prompt
                      (on-prompt (:id session))))}
       "Send Prompt"]
      
      [:button.delete-btn
       {:on-click (fn [e]
                    (.stopPropagation e)
                    (when on-delete
                      (on-delete (:id session))))}
       "Delete"]]]))

(defn define-session-card! []
  (js/customElements.define 
   "session-card"
   (clj->js 
    (prototype
     (fn []
       (this-as this
         (let [props (r/atom {})]
           (set! (.-props this) props)
           (set! (.-shadowRoot this) (.attachShadow this #js {:mode "open"}))
           
           (.defineProperty this "session"
             #js {:get (fn [] (get @props :session {}))
                  :set (fn [value] (swap! props assoc :session value))})
           
           (.defineProperty this "selected"
             #js {:get (fn [] (get @props :selected? false))
                  :set (fn [value] (swap! props assoc :selected? value))})
           
           (.defineProperty this "onClick"
             #js {:get (fn [] (get @props :on-click nil))
                  :set (fn [value] (swap! props assoc :on-click value))})
           
           (.defineProperty this "onDelete"
             #js {:get (fn [] (get @props :on-delete nil))
                  :set (fn [value] (swap! props assoc :on-delete value))})
           
           (.defineProperty this "onPrompt"
             #js {:get (fn [] (get @props :on-prompt nil))
                  :set (fn [value] (swap! props assoc :on-prompt value))}))))
     
     (fn connectedCallback []
       (this-as this
         (let [props (.-props this)]
           (dom/render 
            [session-card-template @props]
            (.-shadowRoot this)))))
     
     (fn attributeChangedCallback [name old-value new-value]
       (this-as this
         (let [props (.-props this)]
           (case name
             "session" (swap! props assoc :session (js/JSON.parse new-value))
             "selected" (swap! props assoc :selected? (js/Boolean new-value))))))
     
     (fn observedAttributes []
       #js ["session" "selected"])))))