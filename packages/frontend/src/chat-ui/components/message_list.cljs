(ns components.message-list
  (:require [reagent.core :as r]
            [re-frame.core :as rf]
            [main.subs :as subs]
            [main.events :as events]))

(defn format-time [timestamp]
  (if timestamp
    (let [date (js/Date. timestamp)]
      (.toLocaleTimeString date))
    "Unknown"))

(defn message-role [role]
  (case role
    "user" "You"
    "assistant" "Assistant"
    "system" "System"
    role))

(defn message-item [{:keys [id role content created_at]}]
  [:div.message-item 
   {:class (str "message-" role)}
   [:div.message-header
    [:span.role (message-role role)]
    [:span.timestamp (format-time created_at)]
    (when (not= role "user")
      [:button.delete-btn 
       {:on-click (fn [e]
                    (.stopPropagation e)
                    (when (js/confirm "Are you sure you want to delete this message?")
                      (rf/dispatch [:delete-message 
                                   (get @(rf/subscribe [:current-session]) :id) 
                                   id])))}
       "Delete"])]
   [:div.message-content 
    {:dangerouslySetInnerHTML {:__html content}}]])

(defn message-list []
  (let [messages (rf/subscribe [:messages])
        current-session (rf/subscribe [:current-session])
        loading? (rf/subscribe [:loading?])
        error (rf/subscribe [:error])]
    [:div.message-list
     (if @current-session
       [:div
        [:div.session-info
         [:h3 (:title @current-session)]
         [:p (str "Created: " (.toLocaleDateString (js/Date. (:created_at @current-session))))]]
        [:div.messages
         (when @loading?
           [:div.loading "Loading messages..."])
         (when @error
           [:div.error @error])
         (if (empty? @messages)
           [:div.no-messages "No messages in this session"]
           (for [message @messages]
             ^{:key (:id message)}
             [message-item message]))]]
       [:div.no-session-selected
        [:p "Select a session to view messages"]])]))