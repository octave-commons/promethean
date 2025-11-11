(ns app.webcomponents.create-session-modal
  (:require [reagent.core :as r]
            [reagent.dom :as dom]
            [re-frame.core :as rf]
            [app.events :as events]))

(defn create-session-modal-template []
  (let [this (r/current-component)
        props (r/props this)
        {:keys [visible? on-create on-cancel]} props
        title (r/atom "")
        description (r/atom "")]
    
    [:div.modal-overlay
     {:class (when visible? "visible")
      :on-click on-cancel}
     [:div.modal-content
      {:on-click (fn [e] (.stopPropagation e))}
      [:div.modal-header
       [:h2 "Create New Session"]
       [:button.close-btn {:on-click on-cancel} "×"]]
      
      [:div.modal-body
       [:div.form-group
        [:label {:for "session-title"} "Title"]
        [:input 
         {:type "text"
          :id "session-title"
          :value @title
          :on-change (fn [e] (reset! title (.. e -target -value)))
          :placeholder "Enter session title"}]]
       
       [:div.form-group
        [:label {:for "session-description"} "Description (optional)"]
        [:textarea 
         {:id "session-description"
          :value @description
          :on-change (fn [e] (reset! description (.. e -target -value)))
          :placeholder "Enter session description"
          :rows 3}]]]
      
      [:div.modal-footer
       [:button.btn.btn-secondary
        {:on-click on-cancel}
        "Cancel"]
       
       [:button.btn.btn-primary
        {:on-click (fn []
                     (when (and (not-empty @title) on-create)
                       (on-create {:title @title :description @description})
                       (reset! title "")
                       (reset! description "")))
        :disabled (empty? @title)}
        "Create Session"]]]]))

(defn define-create-session-modal! []
  (js/customElements.define 
   "create-session-modal"
   (clj->js 
    (prototype
     (fn []
       (this-as this
         (let [props (r/atom {})]
           (set! (.-props this) props)
           (set! (.-shadowRoot this) (.attachShadow this #js {:mode "open"}))
           
           (.defineProperty this "visible"
             #js {:get (fn [] (get @props :visible? false))
                  :set (fn [value] (swap! props assoc :visible? value))})
           
           (.defineProperty this "onCreate"
             #js {:get (fn [] (get @props :on-create nil))
                  :set (fn [value] (swap! props assoc :on-create value))})
           
           (.defineProperty this "onCancel"
             #js {:get (fn [] (get @props :on-cancel nil))
                  :set (fn [value] (swap! props assoc :on-cancel value))}))))
     
     (fn connectedCallback []
       (this-as this
         (let [props (.-props this)]
           (dom/render 
            [create-session-modal-template @props]
            (.-shadowRoot this)))))
     
     (fn attributeChangedCallback [name old-value new-value]
       (this-as this
         (let [props (.-props this)]
           (when (= name "visible")
             (swap! props assoc :visible? (js/Boolean new-value))))))
     
     (fn observedAttributes []
       #js ["visible"])))))