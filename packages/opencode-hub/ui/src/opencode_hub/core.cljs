(ns opencode-hub.core
  (:require [reagent.core :as r]))

(defonce state (r/atom {:repos [] :messages [] :connected? false :input ""}))

(defn fetch-repos! []
  (-> (js/fetch "/api/repos")
      (.then #(.json %))
      (.then #(swap! state assoc :repos %))
      (.catch #(js/console.warn "fetch repos" %))))

(defonce ws* (atom nil))

(defn connect-ws! []
  (when-not (:connected? @state)
    (let [ws (js/WebSocket. (str "ws://" js/location.host "/ws"))]
      (set! (.-onopen ws) (fn [_] (swap! state assoc :connected? true)))
      (set! (.-onmessage ws) (fn [e]
                                (let [msg (js/JSON.parse (.-data e))]
                                  (swap! state update :messages conj msg))))
      (set! (.-onclose ws) (fn [_] (reset! ws* nil) (swap! state assoc :connected? false)))
      (reset! ws* ws))))

(defn send-msg! [txt]
  (when-let [ws @ws*]
    (.send ws (js/JSON.stringify #js {:id (str (random-uuid))
                                      :role "user"
                                      :text txt
                                      :ts (.now js/Date)}))))

(defn repo-list []
  (let [{:keys [repos]} @state]
    [:div.space-y-2
     [:h2 "Repos"]
     (into
      [:ul]
      (for [{:keys [id name status port]} repos]
        [:li {:key id} name " — " (name status) (when port (str " :" port))]))]))

(defn chat []
  (let [{:keys [messages input]} @state]
    [:div
     [:h2 "Chat"]
     [:div {:style {:border "1px solid #ccc" :height "240px" :overflow "auto" :padding "8px"}}
      (for [{:keys [id role text]} messages]
        ^{:key id} [:div [:b (str (name role) ": ")] text])]
     [:div {:style {:margin-top "8px"}}
      [:input {:style {:width "80%"}
               :value input
               :on-change #(swap! state assoc :input (.. % -target -value))
               :on-key-down #(when (= (.-key %) "Enter")
                               (send-msg! (:input @state))
                               (swap! state assoc :input ""))}]
      [:button {:on-click #(do (send-msg! (:input @state))
                               (swap! state assoc :input ""))} "Send"]]]))

(defn app []
  [:div {:style {:font-family "sans-serif" :padding "12px"}}
   [:h1 "OpenCode Hub"]
   [repo-list]
   [chat]])

(defn init []
  (fetch-repos!)
  (connect-ws!)
  (r/render [app] (.getElementById js/document "app")))