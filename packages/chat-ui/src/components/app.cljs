(ns components.app
  (:require [reagent.core :as r]
            [re-frame.core :as rf]
            [components.session-list :refer [session-list]]
            [components.message-list :refer [message-list]]
            [main.subs :as subs]))

(defn header []
  [:header.app-header
   [:h1 "Chat UI"]
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
  [:div.app
   [header]
   [error-notification]
   [loading-overlay]
   [:main.app-content
    [:aside.sidebar
     [session-list]]
    [:section.chat-area
     [message-list]]]])