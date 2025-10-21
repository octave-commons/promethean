(ns app.state
  (:require [reagent.core :as r]
            [reagent.ratom :as ratom]
            [clojure.string :as str]))

;; Global app state
(defonce app-state
  (r/atom {:buffers {}                    ; Map of buffer ID -> buffer data
           :current-buffer nil           ; Currently active buffer ID
           :windows {}                   ; Window layout state
           :keymap-state {}              ; Current keymap state
           :evil-state {:mode :normal     ; Evil mode state
                        :count nil
                        :register nil
                        :mark nil
                        :last-search nil
                        :search-direction :forward}
           :which-key {:active false      ; Which-key popup state
                      :prefix []
                      :timeout nil}
           :statusbar {:left ""           ; Statusbar content
                      :center ""
                      :right ""}
           :plugins {}                   ; Loaded plugins
           :opencode {:connected false   ; Opencode connection state
                     :session-id nil
                     :available-agents []
                     :active-tasks {}}
           :ui {:theme :dark             ; UI preferences
                :font-size 14
                :line-numbers true
                :minimap true}
           :workspace {:current-dir nil   ; Workspace state
                      :project-files []
                      :recent-files []
                      :bookmarks {}}}))

;; Buffer structure
(defn create-buffer
  "Create a new buffer with the given content and metadata"
  [id content & {:keys [name path language modified?]
                 :or {name (str "Buffer " id)
                      path nil
                      language "text"
                      modified? false}}]
  {:id id
   :name name
   :path path
   :content content
   :original-content content
   :language language
   :modified? modified?
   :cursor-pos 0
   :scroll-pos 0
   :selection nil
   :undo-stack []
   :redo-stack []
   :metadata {:created-at (js/Date.)
              :last-modified (js/Date.)}})

;; Buffer operations
(defn add-buffer!
  "Add a new buffer to the app state"
  [buffer]
  (swap! app-state update :buffers assoc (:id buffer) buffer)
  (when (nil? (:current-buffer @app-state))
    (swap! app-state assoc :current-buffer (:id buffer))))

(defn remove-buffer!
  "Remove a buffer from the app state"
  [buffer-id]
  (swap! app-state update :buffers dissoc buffer-id)
  (when (= (:current-buffer @app-state) buffer-id)
    (let [remaining-buffers (keys (:buffers @app-state))]
      (swap! app-state assoc :current-buffer (first remaining-buffers)))))

(defn get-current-buffer
  "Get the currently active buffer"
  []
  (when-let [buffer-id (:current-buffer @app-state)]
    (get-in @app-state [:buffers buffer-id])))

(defn update-current-buffer!
  "Update the current buffer with the given function"
  [f]
  (when-let [buffer-id (:current-buffer @app-state)]
    (swap! app-state update-in [:buffers buffer-id] f)))

;; Evil mode operations
(defn set-evil-mode!
  "Set the current Evil mode"
  [mode]
  (swap! app-state assoc-in [:evil-state :mode] mode))

(defn get-evil-mode
  "Get the current Evil mode"
  []
  (get-in @app-state [:evil-state :mode]))

;; Which-key operations
(defn show-which-key!
  "Show which-key popup with the given prefix"
  [prefix]
  (swap! app-state assoc :which-key {:active true
                                    :prefix prefix
                                    :timeout (js/setTimeout 
                                              #(swap! app-state assoc-in [:which-key :active] false)
                                              3000)}))

(defn hide-which-key!
  "Hide which-key popup"
  []
  (when-let [timeout (get-in @app-state [:which-key :timeout])]
    (js/clearTimeout timeout))
  (swap! app-state assoc-in [:which-key :active] false))

;; Statusbar operations
(defn update-statusbar!
  "Update statusbar content"
  [left center right]
  (swap! app-state assoc :statusbar {:left left
                                     :center center
                                     :right right}))

;; Plugin operations
(defn add-plugin!
  "Add a plugin to the app state"
  [plugin-name plugin-data]
  (swap! app-state update :plugins assoc plugin-name plugin-data))

(defn remove-plugin!
  "Remove a plugin from the app state"
  [plugin-name]
  (swap! app-state update :plugins dissoc plugin-name))

;; Opencode operations
(defn set-opencode-connection!
  "Set Opencode connection state"
  [connected?]
  (swap! app-state assoc-in [:opencode :connected] connected?))

(defn update-opencode-agents!
  "Update the list of available Opencode agents"
  [agents]
  (swap! app-state assoc-in [:opencode :available-agents] agents))

;; Derived state (ratoms)
(defn current-buffer-content
  "Ratom for current buffer content"
  []
  (ratom/reaction 
    (when-let [buffer (get-current-buffer)]
      (:content buffer))))

(defn current-buffer-language
  "Ratom for current buffer language"
  []
  (ratom/reaction 
    (when-let [buffer (get-current-buffer)]
      (:language buffer))))

(defn current-evil-mode
  "Ratom for current Evil mode"
  []
  (ratom/reaction 
    (get-evil-mode)))

(defn statusbar-left
  "Ratom for statusbar left content"
  []
  (ratom/reaction 
    (get-in @app-state [:statusbar :left])))

(defn statusbar-center
  "Ratom for statusbar center content"
  []
  (ratom/reaction 
    (get-in @app-state [:statusbar :center])))

(defn statusbar-right
  "Ratom for statusbar right content"
  []
  (ratom/reaction 
    (get-in @app-state [:statusbar :right])))

;; Utility functions
(defn reset-state!
  "Reset the entire app state"
  []
  (reset! app-state {:buffers {}
                     :current-buffer nil
                     :windows {}
                     :keymap-state {}
                     :evil-state {:mode :normal}
                     :which-key {:active false}
                     :statusbar {:left "" :center "" :right ""}
                     :plugins {}
                     :opencode {:connected false}
                     :ui {:theme :dark}
                     :workspace {}}))

(defn save-workspace!
  "Save current workspace state to localStorage"
  []
  (when (exists? js/localStorage)
    (.setItem js/localStorage "opencode-workspace" 
              (js/JSON.stringify (clj->js @app-state)))))

(defn load-workspace!
  "Load workspace state from localStorage"
  []
  (when (exists? js/localStorage)
    (when-let [saved (.getItem js/localStorage "opencode-workspace")]
      (try
        (let [parsed (js->clj (js/JSON.parse saved) :keywordize-keys true)]
          (reset! app-state (merge @app-state parsed)))
        (catch js/Error e
          (js/console.error "Failed to load workspace:" e))))))

;; Auto-save workspace on state changes
(add-watch app-state :workspace-auto-save
           (fn [_key _ref old-state new-state]
             (save-workspace!)))