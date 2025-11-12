(ns app.webcomponents.enhanced-session-manager
  (:require [reagent.core :as r]
            [reagent.dom :as dom]
            [app.opencode :as opencode]))

;; Enhanced session manager with real OpenCode SDK integration
(defn create-session-modal []
  "Modal component for creating new sessions"
  (let [show-modal? (r/atom false)
        session-data (r/atom {:title ""
                              :description ""
                              :tags []})
        loading? (r/atom false)
        error (r/atom nil)]

    (fn []
      [:div.create-session-modal
       [:button.create-btn
        {:on-click #(reset! show-modal? true)}
        "+ Create Session"]

       (when @show-modal?
         [:div.modal-overlay
          {:on-click #(reset! show-modal? false)}
          [:div.modal-content
           {:on-click (fn [e] (.stopPropagation e))}
           [:div.modal-header
            [:h3 "Create New Session"]
            [:button.close-btn
             {:on-click #(reset! show-modal? false)}
             "×"]]

           [:div.modal-body
            [:div.form-group
             [:label "Title"]
             [:input
              {:type "text"
               :value (:title @session-data)
               :on-change #(swap! session-data assoc :title (-> % .-target .-value))
               :placeholder "Enter session title"}]]

            [:div.form-group
             [:label "Description"]
             [:textarea
              {:value (:description @session-data)
               :on-change #(swap! session-data assoc :description (-> % .-target .-value))
               :placeholder "Enter session description"
               :rows 4}]]

            [:div.form-group
             [:label "Tags (comma separated)"]
             [:input
              {:type "text"
               :value (clojure.string/join ", " (:tags @session-data))
               :on-change #(swap! session-data assoc :tags
                                  (-> % .-target .-value
                                      (clojure.string/split #",\s*")
                                      (->> (remove clojure.string/blank?))))
               :placeholder "e.g., frontend, review, bugfix"}]]

            (when @error
              [:div.error-message @error])]

           [:div.modal-footer
            [:button.cancel-btn
             {:on-click #(reset! show-modal? false)}
             "Cancel"]
            [:button.create-btn
             {:disabled (or @loading?
                            (clojure.string/blank? (:title @session-data))
                            (clojure.string/blank? (:description @session-data)))
              :on-click (fn []
                          (reset! loading? true)
                          (reset! error nil)
                          (opencode/create-session!
                           @session-data
                           (fn [session err]
                             (reset! loading? false)
                             (if err
                               (reset! error err)
                               (do
                                 (reset! show-modal? false)
                                 (reset! session-data {:title "" :description "" :tags []})
                                 ;; Trigger session refresh
                                 (.dispatchEvent js/document
                                                 (js/CustomEvent. "session-created"
                                                                  #js {:detail (clj->js session)})))))))}
             (if @loading? "Creating..." "Create Session")]]]])])))

(defn session-card [session on-select on-delete]
  "Individual session card component"
  (let [formatted-session (opencode/format-session session)]
    [:div.session-card
     {:on-click #(on-select session)}
     [:div.session-header
      [:h3 (:display-title formatted-session)]
      [:span.session-status (:display-status formatted-session)]]
     [:p.session-description (:description session "")]
     [:div.session-meta
      [:span.session-id "ID: " (:id session)]
      [:span.session-date (:display-date formatted-session)]]
     (when (seq (:tags session))
       [:div.session-tags
        (for [tag (:tags session)]
          ^{:key tag}
          [:span.session-tag tag])])
     [:div.session-actions
      [:button.review-btn
       {:on-click (fn [e]
                    (.stopPropagation e)
                    (.dispatchEvent js/document
                                    (js/CustomEvent. "start-review"
                                                     #js {:detail (clj->js session)})))}
       "Start Review"]
      [:button.delete-btn
       {:on-click (fn [e]
                    (.stopPropagation e)
                    (when (js/confirm "Are you sure you want to delete this session?")
                      (on-delete (:id session))))}
       "Delete"]]]))

(defn code-review-panel [session]
  "Code review panel component"
  (let [show-panel? (r/atom false)
        review-data (r/atom {:path ""
                             :patterns ["**/*.cljs" "**/*.js" "**/*.ts"]
                             :options {:deep-analysis true}})
        loading? (r/atom false)
        error (r/atom nil)
        review-results (r/atom nil)]

    (fn []
      [:div.code-review-section
       [:button.review-toggle-btn
        {:on-click #(reset! show-panel? (not @show-panel?))}
        (if @show-panel? "Hide Code Review" "Start Code Review")]

       (when @show-panel?
         [:div.review-panel
          [:div.review-config
           [:h4 "Review Configuration"]
           [:div.form-group
            [:label "Path to Review"]
            [:input
             {:type "text"
              :value (:path @review-data)
              :on-change #(swap! review-data assoc :path (-> % .-target .-value))
              :placeholder "Enter file or directory path"}]]

           [:div.form-group
            [:label "File Patterns"]
            (for [pattern (:patterns @review-data)]
              ^{:key pattern}
              [:div.pattern-input
               [:input
                {:type "text"
                 :value pattern
                 :on-change #(let [new-value (-> % .-target .-value)]
                               idx (.indexOf (:patterns @review-data) pattern)
                               (if (clojure.string/blank? new-value)
                                 (swap! review-data update :patterns
                                        (fn [patterns]
                                          (vec (remove #{pattern} patterns))))
                                 (swap! review-data assoc-in [:patterns idx] new-value)))}]
               [:button.remove-pattern
                {:on-click #(swap! review-data update :patterns
                                   (fn [patterns]
                                     (vec (remove #{pattern} patterns))))}
                "×"]])
            [:button.add-pattern-btn
             {:on-click #(swap! review-data update :patterns conj "**/*")}
             "Add Pattern"]]]

          [:div.review-actions
           [:button.start-review-btn
            {:disabled (or @loading?
                           (clojure.string/blank? (:path @review-data)))
             :on-click (fn []
                         (reset! loading? true)
                         (reset! error nil)
                         (opencode/start-code-review!
                          (assoc @review-data :session-id (:id session))
                          (fn [review err]
                            (reset! loading? false)
                            (if err
                              (reset! error err)
                              (reset! review-results review)))))}
            (if @loading? "Starting Review..." "Start Review")]

           (when @error
             [:div.error-message @error])]

          (when @review-results
            [:div.review-results
             [:h4 "Review Results"]
             [:div.result-summary
              [:span "Files analyzed: " (get-in @review-results [:summary :files-count] 0)]
              [:span "Issues found: " (get-in @review-results [:summary :issues-count] 0)]]

             (when (seq (:issues @review-results))
               [:div.issues-list
                [:h5 "Issues"]
                (for [issue (:issues @review-results)]
                  ^{:key (:id issue)}
                  [:div.issue-item
                   [:div.issue-header
                    [:span.issue-severity (:severity issue)]
                    [:span.issue-type (:type issue)]]
                   [:div.issue-message (:message issue)]
                   [:div.issue-location
                    "File: " (:file issue) ":" (:line issue)]])])])])])))

(defn enhanced-session-manager-template []
  "Enhanced session manager template with real SDK integration"
  (let [sessions (r/atom [])
        loading? (r/atom false)
        error (r/atom nil)
        selected-session (r/atom nil)
        opencode-state (r/reaction opencode/opencode-state-atom)]

    ;; Initialize OpenCode connection
    (r/create-class
     {:component-did-mount
      (fn []
        (when-not (:connected? @opencode-state)
          (opencode/initialize-opencode!))

        ;; Load sessions
        (reset! loading? true)
        (opencode/list-sessions
         (fn [session-list err]
           (reset! loading? false)
           (if err
             (reset! error err)
             (reset! sessions session-list)))))

      :reagent-render
      (fn []
        [:div.enhanced-session-manager
         ;; Connection status
         [:div.connection-status
          (cond
            (:loading? @opencode-state) [:span.connecting "Connecting to OpenCode..."]
            (:connected? @opencode-state) [:span.connected "✓ Connected to OpenCode"]
            (:error @opencode-state) [:span.error "✗ Connection Error: " (:error @opencode-state)]
            :else [:span.disconnected "✗ Not Connected"])]

         [:div.session-manager-header
          [:h2 "Session Manager"]
          [create-session-modal]]

         (cond
           @loading? [:div.loading "Loading sessions..."]
           @error [:div.error "Error: " @error]
           :else [:div.sessions-container
                  (if (empty? @sessions)
                    [:div.no-sessions
                     [:p "No sessions available"]
                     [:p "Create your first session to get started"]]
                    (for [session @sessions]
                      ^{:key (:id session)}
                      [session-card session
                       (fn [s] (reset! selected-session s))
                       (fn [session-id]
                         (opencode/delete-session!
                          session-id
                          (fn [success err]
                            (if err
                              (js/alert (str "Failed to delete session: " err))
                              ;; Refresh sessions
                              (opencode/list-sessions
                               (fn [session-list err]
                                 (if-not err
                                   (reset! sessions session-list))))))))]))])

         ;; Selected session details
         (when @selected-session
           [:div.session-details
            [:div.session-details-header
             [:h3 "Session Details"]
             [:button.close-details-btn
              {:on-click #(reset! selected-session nil)}
              "×"]]

            [:div.session-details-content
             [:div.detail-row
              [:label "Title:"]
              [:span (:title @selected-session)]]
             [:div.detail-row
              [:label "ID:"]
              [:span (:id @selected-session)]]
             [:div.detail-row
              [:label "Description:"]
              [:span (:description @selected-session)]]
             [:div.detail-row
              [:label "Created:"]
              [:span (-> @selected-session :createdAt js/Date. .toLocaleString)]]

             ;; Code review panel
             [code-review-panel @selected-session]]])])})))

(defn define-enhanced-session-manager! []
  "Define the enhanced session manager web component"
  (js/customElements.define
   "enhanced-session-manager"
   (clj->js
    (prototype
     (fn []
       (this-as this
                (let [props (r/atom {})]
                  (set! (.-props this) props)
                  (set! (.-shadowRoot this) (.attachShadow this #js {:mode "open"}))

           ;; Define properties
                  (.defineProperty this "serverUrl"
                                   #js {:get (fn [] (get @props :server-url "http://localhost:4096"))
                                        :set (fn [value] (swap! props assoc :server-url value))}))))

     (fn connectedCallback []
       (this-as this
                (let [props (.-props this)]
           ;; Initialize OpenCode with custom server URL if provided
                  (when (:server-url @props)
                    (opencode/initialize-opencode! {:serverUrl (:server-url @props)}))

                  (dom/render
                   [enhanced-session-manager-template]
                   (.-shadowRoot this)))))

     (fn attributeChangedCallback [name old-value new-value]
       (this-as this
                (let [props (.-props this)]
                  (case name
                    "server-url" (swap! props assoc :server-url new-value)))))

     (fn observedAttributes []
       #js ["server-url"])))))

;; Auto-define the component
(define-enhanced-session-manager!)