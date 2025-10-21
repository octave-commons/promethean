(ns components.app
  (:require [reagent.core :as r]
            [re-frame.core :as rf]
            [components.session-list :refer [session-list]]
            [components.message-list :refer [message-list]]
            [main.subs :as subs]))

(defn header []
  [:header.app-header
   [:h1 "Chat UI"]
   [:div.debug-info "App is running!"]
   [:div.header-actions
    [:button.refresh-btn 
     {:on-click #(rf/dispatch [:load-sessions])}
     "Refresh"]]])

(defn loading-overlay []
  (let [loading? (rf/subscribe [:loading?])]
    (when @loading?
      [:div.loading-overlay
       [:div.spinner "Loading..."]])))

(defn error-notification []
  (let [error (rf/subscribe [:error])]
    (when @error
      [:div.error-notification
       [:span.error-message @error]
       [:button.close-btn 
        {:on-click #(rf/dispatch [:set-error nil])}
        "×"]])))

(defn app []
  (js/console.log "App component rendering!")
  [:div.app 
   {:style {:background "#f0f0f0" :padding "20px"}}
   [header]
   [error-notification]
   [loading-overlay]
   [:main.app-content
    {:style {:display "flex" :gap "20px"}}
    [:aside.sidebar
     {:style {:background "white" :padding "15px" :border-radius "8px" :min-width "300px"}}
     [session-list]]
    [:section.chat-area
     {:style {:background "white" :padding "15px" :border-radius "8px" :flex "1"}}
     [message-list]]]])