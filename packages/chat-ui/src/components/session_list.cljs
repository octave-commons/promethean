(ns chat-ui.components.session-list
  (:require [reagent.core :as r]
            [re-frame.core :as rf]
            [chat-ui.main.subs :as subs]
            [chat-ui.main.events :as events]))

(defn format-date [timestamp]
  (if timestamp
    (let [date (js/Date. timestamp)]
      (.toLocaleDateString date))
    "Unknown"))

(defn session-item [{:keys [id title created_at message_count]}]
  [:div.session-item 
   {:class (when (= id (get @(rf/subscribe [:current-session]) :id)) "active")
    :on-click #(rf/dispatch [:select-session id])}
   [:div.session-header
    [:h3.session-title (or title "Untitled Session")]
    [:div.session-meta
     [:span.session-date (format-date created_at)]
     [:span.message-count (str message_count " messages")]]]
   [:div.session-actions
    [:button.delete-btn 
     {:on-click (fn [e]
                  (.stopPropagation e)
                  (when (js/confirm "Are you sure you want to delete this session?")
                    (rf/dispatch [:delete-session id])))}
     "Delete"]]])

(defn session-list []
  (let [sessions (rf/subscribe [:sessions])
        loading? (rf/subscribe [:loading?])
        error (rf/subscribe [:error])]
    [:div.session-list
     [:h2 "Sessions"]
     (when @loading?
       [:div.loading "Loading..."])
     (when @error
       [:div.error @error])
     (if (empty? @sessions)
       [:div.no-sessions "No sessions found"]
       [:div.sessions
        (for [session @sessions]
          ^{:key (:id session)}
          [session-item session])])]))