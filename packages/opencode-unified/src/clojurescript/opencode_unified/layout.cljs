(ns opencode-unified.layout
  (:require [reagent.core :as r]
            [opencode-unified.state :as state]
            [opencode-unified.buffers :as buffers]
            [clojure.string :as str]))

;; Header component with menu bar
(defn header []
  [:div.header
   {:style {:background-color "var(--bg-secondary)"
            :border-bottom "1px solid var(--border)"
            :padding "0.5rem 1rem"
            :display "flex"
            :align-items "center"
            :justify-content "space-between"
            :height "40px"}}

   ;; App title and menu
   [:div.header-left
    {:style {:display "flex"
             :align-items "center"
             :gap "1rem"}}

    [:h1.app-title
     {:style {:margin 0
              :font-size "1rem"
              :font-weight "500"}}
     "Opencode"]

    [:nav.menu-bar
     {:style {:display "flex"
              :gap "0.5rem"}}

     [:button.menu-item
      {:on-click #(js/alert "File menu")
       :style {:background "none"
               :border "none"
               :color "var(--text-primary)"
               :padding "0.25rem 0.5rem"
               :cursor "pointer"
               :border-radius "4px"}}
      "File"]

     [:button.menu-item
      {:on-click #(js/alert "Edit menu")
       :style {:background "none"
               :border "none"
               :color "var(--text-primary)"
               :padding "0.25rem 0.5rem"
               :cursor "pointer"
               :border-radius "4px"}}
      "Edit"]

     [:button.menu-item
      {:on-click #(js/alert "View menu")
       :style {:background "none"
               :border "none"
               :color "var(--text-primary)"
               :padding "0.25rem 0.5rem"
               :cursor "pointer"
               :border-radius "4px"}}
      "View"]]]

   ;; Window controls (web version - simplified)
   [:div.header-right
    {:style {:display "flex"
             :align-items "center"
             :gap "0.5rem"}}

    [:button.window-control
     {:on-click #(js/alert "Minimize")
      :style {:background "none"
              :border "none"
              :color "var(--text-primary)"
              :padding "0.25rem"
              :cursor "pointer"
              :border-radius "4px"}}
     "−"]

    [:button.window-control
     {:on-click #(js/alert "Maximize")
      :style {:background "none"
              :border "none"
              :color "var(--text-primary)"
              :padding "0.25rem"
              :cursor "pointer"
              :border-radius "4px"}}
     "□"]

    [:button.window-control
     {:on-click #(js/window.close)
      :style {:background "var(--error)"
              :border "none"
              :color "white"
              :padding "0.25rem 0.5rem"
              :cursor "pointer"
              :border-radius "4px"}}
     "×"]]])

;; Left sidebar with file tree
(defn left-sidebar []
  (let [expanded (r/atom #{})]
    [:div.left-sidebar
     {:style {:width "250px"
              :background-color "var(--bg-secondary)"
              :border-right "1px solid var(--border)"
              :padding "1rem"
              :overflow-y "auto"}}

     [:div.sidebar-section
      [:h3.sidebar-title
       {:style {:margin "0 0 0.5rem 0"
                :font-size "0.9rem"
                :color "var(--text-secondary)"}}
       "Explorer"]

      ;; File tree placeholder
      [:div.file-tree
       {:style {:font-size "0.85rem"}}

       ;; Project files would go here
       [:div.file-item
        {:style {:padding "0.25rem 0"
                 :cursor "pointer"
                 :color "var(--text-secondary)"}}
        "📁 src/"]

       [:div.file-item
        {:on-click #(buffers/open-file "src/app.cljs")
         :style {:padding "0.25rem 0.5rem"
                 :cursor "pointer"
                 :color "var(--text-secondary)"}}
        "  📄 app.cljs"]

       [:div.file-item
        {:on-click #(buffers/open-file "src/state.cljs")
         :style {:padding "0.25rem 0.5rem"
                 :cursor "pointer"
                 :color "var(--text-secondary)"}}
        "  📄 state.cljs"]]]

     ;; Recent files
     [:div.sidebar-section
      {:style {:margin-top "1rem"}}

      [:h3.sidebar-title
       {:style {:margin "0 0 0.5rem 0"
                :font-size "0.9rem"
                :color "var(--text-secondary)"}}
       "Recent"]

      [:div.recent-files
       {:style {:font-size "0.85rem"}}

       (for [file (take 5 (:recent-files @state/app-state))]
         ^{:key file}
         [:div.recent-file
          {:on-click #(buffers/open-file file)
           :style {:padding "0.25rem 0"
                   :cursor "pointer"
                   :color "var(--text-secondary)"
                   :white-space "nowrap"
                   :overflow "hidden"
                   :text-overflow "ellipsis"}}
          (:name file)])]]]))

;; Tab bar
(defn tab-bar []
  (let [buffers (:buffers @state/app-state)
        current-buffer-id (:current-buffer @state/app-state)]
    [:div.tab-bar
     {:style {:background-color "var(--bg-secondary)"
              :border-bottom "1px solid var(--border)"
              :display "flex"
              :overflow-x "auto"
              :height "32px"}}

     (for [[buffer-id buffer] buffers]
       ^{:key buffer-id}
       [:div.tab
        {:class (when (= buffer-id current-buffer-id) "active")
         :on-click #(state/update-current-buffer!
                     (fn [b] (assoc b :id buffer-id)))
         :style {:display "flex"
                 :align-items "center"
                 :padding "0 1rem"
                 :background-color (if (= buffer-id current-buffer-id)
                                     "var(--bg-primary)"
                                     "transparent")
                 :border-right "1px solid var(--border)"
                 :cursor "pointer"
                 :min-width "120px"
                 :font-size "0.85rem"
                 :color (if (= buffer-id current-buffer-id)
                          "var(--text-primary)"
                          "var(--text-secondary)")}}

        [:span.tab-name
         {:style {:margin-right "0.5rem"
                  :white-space "nowrap"
                  :overflow "hidden"
                  :text-overflow "ellipsis"}}
         (:name buffer)]

        (when (:modified? buffer)
          [:span.modified-indicator
           {:style {:color "var(--accent)"}}
           "●"])

        [:button.tab-close
         {:on-click (fn [e]
                      (.stopPropagation e)
                      (buffers/close-buffer buffer-id))
          :style {:background "none"
                  :border "none"
                  :color "var(--text-secondary)"
                  :padding "0.25rem"
                  :cursor "pointer"
                  :border-radius "2px"
                  :margin-left "0.5rem"}}
         "×"]])]))

;; Right sidebar for plugins
(defn right-sidebar []
  [:div.right-sidebar
   {:style {:width "300px"
            :background-color "var(--bg-secondary)"
            :border-left "1px solid var(--border)"
            :padding "1rem"
            :overflow-y "auto"}}

   ;; Opencode integration
   [:div.sidebar-section
    [:h3.sidebar-title
     {:style {:margin "0 0 0.5rem 0"
              :font-size "0.9rem"
              :color "var(--text-secondary)"}}
     "Opencode"]

    [:div.opencode-status
     {:style {:font-size "0.85rem"
              :color (if (get-in @state/app-state [:opencode :connected])
                       "var(--success)"
                       "var(--text-dim)")}}
     (if (get-in @state/app-state [:opencode :connected])
       "🟢 Connected"
       "🔴 Disconnected")]

    ;; Plugins
    [:div.sidebar-section
     {:style {:margin-top "1rem"}}

     [:h3.sidebar-title
      {:style {:margin "0 0 0.5rem 0"
               :font-size "0.9rem"
               :color "var(--text-secondary)"}}
      "Plugins"]

     [:div.plugins-list
      {:style {:font-size "0.85rem"}}

       ;; TODO: Fix plugin rendering
      [:div "Plugin rendering temporarily disabled"]]]]])

;; Status bar
(defn status-bar []
  (let [evil-mode (r/track #(get-in @state/app-state [:evil-state :mode]))
        left-text (r/track #(clojure.string/upper-case (name (get-in @state/app-state [:evil-state :mode]))))
        center-text (r/track #(get-in @state/app-state [:statusbar :center]))
        right-text (r/track #(str "Evil Mode - " (name (get-in @state/app-state [:evil-state :mode]))))]
    [:div.status-bar
     {:style {:background-color "var(--bg-secondary)"
              :border-top "1px solid var(--border)"
              :display "flex"
              :justify-content "space-between"
              :align-items "center"
              :padding "0 1rem"
              :height "24px"
              :font-size "0.8rem"
              :color "var(--text-secondary)"}}

     ;; Left section
     [:div.status-left
      @left-text]

     ;; Center section
     [:div.status-center
      @center-text]

     ;; Right section
     [:div.status-right
      @right-text]]))

;; Which-key popup
(defn which-key-popup []
  (let [which-key-state (:which-key @state/app-state)]
    [:div.which-key-popup
     {:class (when (:active which-key-state) "visible")
      :style {:position "fixed"
              :bottom "60px"
              :left "50%"
              :transform "translateX(-50%)"
              :background-color "var(--bg-tertiary)"
              :border "1px solid var(--border)"
              :border-radius "8px"
              :padding "1rem"
              :box-shadow "0 4px 12px rgba(0, 0, 0, 0.3)"
              :z-index 1000
              :min-width "300px"
              :opacity (if (:active which-key-state) 1 0)
              :visibility (if (:active which-key-state) "visible" "hidden")
              :transition "all 0.2s ease-in-out"}}

     [:div.which-key-title
      {:style {:margin "0 0 0.5rem 0"
               :font-size "0.9rem"
               :color "var(--text-primary)"
               :font-weight "500"}}
      (str "Prefix: " (str/join " " (:prefix which-key-state)))]

     [:div.which-key-bindings
      {:style {:font-size "0.85rem"}}

      ;; Sample bindings - would be dynamic based on current prefix
      [:div.binding-row
       {:style {:display "flex"
                :justify-content "space-between"
                :padding "0.25rem 0"}}
       [:span.key "f"] [:span.desc "File"]]

      [:div.binding-row
       {:style {:display "flex"
                :justify-content "space-between"
                :padding "0.25rem 0"}}
       [:span.key "b"] [:span.desc "Buffer"]]

      [:div.binding-row
       {:style {:display "flex"
                :justify-content "space-between"
                :padding "0.25rem 0"}}
       [:span.key "w"] [:span.desc "Window"]]]]))

;; Command palette
(defn command-palette []
  (let [visible (r/atom false)
        query (r/atom "")
        selected-index (r/atom 0)]

    (fn []
      [:div.command-palette
       {:class (when @visible "visible")
        :style {:position "fixed"
                :top "50%"
                :left "50%"
                :transform "translate(-50%, -50%)"
                :background-color "var(--bg-tertiary)"
                :border "1px solid var(--border)"
                :border-radius "8px"
                :box-shadow "0 8px 24px rgba(0, 0, 0, 0.4)"
                :z-index 2000
                :width "600px"
                :max-height "400px"
                :opacity (if @visible 1 0)
                :visibility (if @visible "visible" "hidden")
                :transition "all 0.2s ease-in-out"}}

       [:input.command-input
        {:value @query
         :on-change #(reset! query (-> % .-target .-value))
         :placeholder "Type a command..."
         :style {:width "100%"
                 :padding "1rem"
                 :border "none"
                 :background "transparent"
                 :color "var(--text-primary)"
                 :font-size "1rem"
                 :outline "none"}}]

       [:div.command-list
        {:style {:max-height "300px"
                 :overflow-y "auto"}}

        ;; Basic commands for now
        (for [command [{:name "New File" :description "Create new buffer" :keys "SPC f n"}
                       {:name "Open File" :description "Open file in new buffer" :keys "SPC f o"}
                       {:name "Save File" :description "Save current buffer" :keys "SPC f s"}
                       {:name "Toggle Theme" :description "Switch theme" :keys "SPC t t"}
                       {:name "Save Workspace" :description "Save workspace" :keys "SPC w s"}
                       {:name "Load Workspace" :description "Load workspace" :keys "SPC w l"}]
              :when (str/includes? (str/lower-case (:name command)) (str/lower-case @query))]
          ^{:key (:name command)}
          [:div.command-item
           {:on-click #(do
                         (reset! visible false)
                         (println "Execute command:" (:name command)))
            :style {:padding "0.75rem 1rem"
                    :cursor "pointer"
                    :border-bottom "1px solid var(--border)"
                    :display "flex"
                    :justify-content "space-between"
                    :align-items "center"}}

           [:div.command-info
            [:div.command-name
             {:style {:color "var(--text-primary)"
                      :font-weight "500"}}
             (:name command)]

            [:div.command-description
             {:style {:color "var(--text-secondary)"
                      :font-size "0.85rem"}}
             (:description command)]]

           [:div.command-keys
            {:style {:color "var(--text-dim)"
                     :font-size "0.8rem"}}
            (:keys command)]])]])))

;; Minimap
(defn minimap [buffer]
  (when buffer
    [:div.minimap
     {:style {:width "120px"
              :background-color "var(--bg-secondary)"
              :border-left "1px solid var(--border)"
              :padding "0.5rem"
              :overflow-y "auto"
              :font-size "0.6rem"
              :color "var(--text-dim)"
              :line-height "1.2"}}

     ;; Simplified minimap content
     (for [line (take 50 (str/split-lines (:content buffer)))]
       ^{:key line}
       [:div.minimap-line
        {:style {:white-space "nowrap"
                 :overflow "hidden"
                 :text-overflow "ellipsis"}}
        (or line "")])]))