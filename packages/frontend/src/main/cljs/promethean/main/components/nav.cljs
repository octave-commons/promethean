(ns promethean.main.components.nav
  (:require [reagent.core :as r]
            [promethean.main.router :as router]))

(defn nav-item [page title]
  [:li.nav-item
   {:class (when (= page (:page @router/current-route)) "active")
    :on-click #(router/navigate-to page)}
   [:a {:href "#" :on-click #(.preventDefault %)} title]])

(defn navigation-bar []
  [:nav.navbar
   [:div.nav-container
    [:h1.logo "Promethean OS"]
    [:ul.nav-menu
     [nav-item :home "Home"]
     [nav-item :chat-ui "Chat UI"]
     [nav-item :docops "DocOps"]
     [nav-item :duck-web "Duck Web"]
     [nav-item :kanban "Kanban"]
     [nav-item :openai-server "OpenAI Server"]
     [nav-item :opencode-session "Opencode Session"]
     [nav-item :piper "Piper"]
     [nav-item :report-forge "Report Forge"]
     [nav-item :smartgpt-dashboard "SmartGPT Dashboard"]]]])

(defn home-page []
  [:div.home-page
   [:h2 "Welcome to Promethean OS"]
   [:p "Select an application from the navigation menu above."]
   [:div.app-grid
    [:div.app-card {:on-click #(router/navigate-to :chat-ui)}
     [:h3 "Chat UI"]
     [:p "Interactive chat interface"]]
    [:div.app-card {:on-click #(router/navigate-to :kanban)}
     [:h3 "Kanban"]
     [:p "Task management board"]]
    [:div.app-card {:on-click #(router/navigate-to :docops)}
     [:h3 "DocOps"]
     [:p "Documentation operations"]]
    [:div.app-card {:on-click #(router/navigate-to :duck-web)}
     [:h3 "Duck Web"]
     [:p "Web utilities and tools"]]
    [:div.app-card {:on-click #(router/navigate-to :openai-server)}
     [:h3 "OpenAI Server"]
     [:p "AI server management"]]
    [:div.app-card {:on-click #(router/navigate-to :opencode-session)}
     [:h3 "Opencode Session"]
     [:p "Development session manager"]]
    [:div.app-card {:on-click #(router/navigate-to :piper)}
     [:h3 "Piper"]
     [:p "Pipeline automation"]]
    [:div.app-card {:on-click #(router/navigate-to :report-forge)}
     [:h3 "Report Forge"]
     [:p "Report generation tools"]]
    [:div.app-card {:on-click #(router/navigate-to :smartgpt-dashboard)}
     [:h3 "SmartGPT Dashboard"]
     [:p "AI analytics dashboard"]]]])