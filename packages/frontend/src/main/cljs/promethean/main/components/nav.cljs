(ns promethean.main.components.nav)

(defn nav-item [current-route navigate page title]
  [:li.nav-item
   {:class (when (= page (:page @current-route)) "active")
    :on-click #(navigate page)}
   [:a {:href "#" :on-click #(.preventDefault %)} title]])

(defn navigation-bar [current-route navigate]
  [:nav.navbar
   [:div.nav-container
    [:h1.logo "Promethean OS"]
    [:ul.nav-menu
     [nav-item current-route navigate :home "Home"]
     [nav-item current-route navigate :chat-ui "Chat UI"]
     [nav-item current-route navigate :docops "DocOps"]
     [nav-item current-route navigate :kanban "Kanban"]
     [nav-item current-route navigate :openai-server "OpenAI Server"]
     [nav-item current-route navigate :opencode-session "Opencode Session"]
     [nav-item current-route navigate :piper "Piper"]
     [nav-item current-route navigate :report-forge "Report Forge"]
     [nav-item current-route navigate :smartgpt-dashboard "SmartGPT Dashboard"]]]])

(defn home-page [navigate]
  [:div.home-page
   [:h2 "Welcome to Promethean OS"]
   [:p "Select an application from the navigation menu above."]
   [:div.app-grid
    [:div.app-card {:on-click #(navigate :chat-ui)}
     [:h3 "Chat UI"]
     [:p "Interactive chat interface"]]
    [:div.app-card {:on-click #(navigate :kanban)}
     [:h3 "Kanban"]
     [:p "Task management board"]]
    [:div.app-card {:on-click #(navigate :docops)}
     [:h3 "DocOps"]
     [:p "Documentation operations"]]
    [:div.app-card {:on-click #(navigate :openai-server)}
     [:h3 "OpenAI Server"]
     [:p "AI server management"]]
    [:div.app-card {:on-click #(navigate :opencode-session)}
     [:h3 "Opencode Session"]
     [:p "Development session manager"]]

    [:div.app-card {:on-click #(navigate :piper)}
     [:h3 "Piper"]
     [:p "Pipeline automation"]]
    [:div.app-card {:on-click #(navigate :report-forge)}
     [:h3 "Report Forge"]
     [:p "Report generation tools"]]
    [:div.app-card {:on-click #(navigate :smartgpt-dashboard)}
     [:h3 "SmartGPT Dashboard"]
     [:p "AI analytics dashboard"]]]])
