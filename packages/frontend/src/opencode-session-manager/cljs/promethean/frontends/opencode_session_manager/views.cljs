(ns app.views
  (:require [reagent.core :as r]
            [re-frame.core :as rf]
            [app.subs :as subs]
            [app.events :as events]))

(defn header []
  [:header.app-header
   [:div.container
    [:h1 "OpenCode Session Manager"]
    [:p "Manage your opencode sessions with this web components interface"]]])

(defn loading-spinner []
  [:div.loading-spinner
   [:div.spinner]
   [:p "Loading..."]])

(defn error-message [error]
  [:div.error-message
   [:h3 "Error"]
   [:p error]
   [:button {:on-click #(rf/dispatch [::events/set-error nil])}
    "Dismiss"]])

(defn create-session-button []
  [:button.btn.btn-primary
   {:on-click #(rf/dispatch [::events/show-create-modal true])}
   "+ New Session"])

(defn session-stats []
  (let [session-count (rf/subscribe [::subs/session-count])]
    [:div.session-stats
     [:div.stat
      [:span.stat-value @session-count]
      [:span.stat-label "Total Sessions"]]]))

(defn toolbar []
  [:div.toolbar
   [create-session-button]
   [session-stats]
   [:button.btn.btn-secondary
    {:on-click #(rf/dispatch [::events/load-sessions])}
    "Refresh"]])

(defn main-panel []
  (let [loading? (rf/subscribe [::subs/loading?])
        error (rf/subscribe [::subs/error])
        sessions (rf/subscribe [::subs/sessions])
        show-modal? (rf/subscribe [::subs/show-create-modal?])]
    [:div.app
     [header]
     [:main.container
      [toolbar]
      
      (cond
        @loading? [loading-spinner]
        @error [error-message @error]
        :else [:div.sessions-container
               [:h2 "Sessions"]
               (if (empty? @sessions)
                 [:div.empty-state
                  [:p "No sessions found. Create your first session to get started."]
                  [create-session-button]]
                 [:div.sessions-grid
                  (for [session @sessions]
                    ^{:key (:id session)}
                    [:session-card {:session session}])])])]
     
     (when @show-modal?
       [:create-session-modal])]))

(defn app []
  [:div#app
   [main-panel]])