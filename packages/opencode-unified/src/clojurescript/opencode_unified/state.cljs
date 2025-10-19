(ns opencode-unified.state
  (:require [reagent.core :as r]
            [clojure.string :as str]
            [opencode-unified.env :as env]
            [opencode-unified.buffers :as buffers]))

;; Global app state - simplified for debugging
(defonce app-state
  (r/atom {:buffers {}
           :current-buffer nil
           :evil-state {:mode :normal
                        :register ""
                        :last-search ""
                        :search-direction :forward
                        :count 1}
           :statusbar {:left "NORMAL" :center "" :right "Evil Mode - normal"}
           :ui {:theme :dark}}))

;; Buffer structure
(defn create-buffer
  "Create a new buffer with given content and metadata"
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
  "Add a new buffer to app state"
  [buffer]
  (swap! app-state update :buffers assoc (:id buffer) buffer)
  (when (nil? (:current-buffer @app-state))
    (swap! app-state assoc :current-buffer (:id buffer))))

(defn remove-buffer!
  "Remove a buffer from app state"
  [buffer-id]
  (swap! app-state update :buffers dissoc buffer-id)
  (when (= (:current-buffer @app-state) buffer-id)
    (let [remaining-buffers (keys (:buffers @app-state))]
      (swap! app-state assoc :current-buffer (first remaining-buffers)))))

(defn get-current-buffer
  "Get currently active buffer"
  []
  (when-let [buffer-id (:current-buffer @app-state)]
    (get-in @app-state [:buffers buffer-id])))

(defn update-current-buffer!
  "Update the current buffer with the given function"
  [f]
  (when-let [buffer-id (:current-buffer @app-state)]
    (swap! app-state update-in [:buffers buffer-id] f)))

(defn set-current-buffer!
  "Set the current buffer by ID"
  [buffer-id]
  (swap! app-state assoc :current-buffer buffer-id))

;; Evil mode operations
(defn set-evil-mode!
  "Set the current Evil mode"
  [mode]
  (swap! app-state assoc-in [:evil-state :mode] mode))

(defn get-evil-mode
  "Get the current Evil mode"
  []
  (get-in @app-state [:evil-state :mode]))

;; Statusbar operations
(defn update-statusbar!
  "Update statusbar content"
  [left center right]
  (swap! app-state assoc :statusbar {:left left
                                     :center center
                                     :right right}))

;; Which-key operations
(defn show-which-key!
  "Show which-key popup"
  []
  (swap! app-state assoc-in [:ui :which-key?] true))

(defn hide-which-key!
  "Hide which-key popup"
  []
  (swap! app-state assoc-in [:ui :which-key?] false))

;; Command palette operations
(defn command-palette
  "Get command palette state"
  []
  (get-in @app-state [:ui :command-palette]))

;; Workspace operations
(defn load-workspace!
  "Load workspace from file"
  [workspace-path]
  (println "Loading workspace from:" workspace-path)
  (if (and (exists? js/require) (not env/web?))
    ;; Electron environment - use Node.js fs
    (try
      (let [fs (js/require "fs")
            path (js/require "path")
            workspace-data (-> fs (.readFileSync workspace-path "utf8") js/JSON.parse (js->clj :keywordize-keys true))]

        ;; Restore buffers
        (when (:buffers workspace-data)
          (doseq [buffer-data (:buffers workspace-data)]
            (buffers/create-buffer
             (:id buffer-data)
             (:content buffer-data)
             (:metadata buffer-data))))

        ;; Restore current buffer
        (when (:current-buffer workspace-data)
          (set-current-buffer! (:current-buffer workspace-data)))

        ;; Restore UI state
        (when (:ui workspace-data)
          (swap! app-state update :ui merge (:ui workspace-data)))

        ;; Restore Evil state
        (when (:evil-state workspace-data)
          (swap! app-state update :evil-state merge (:evil-state workspace-data)))

        (println "Workspace loaded successfully")
        {:success true})
      (catch js/Error e
        (println "Error loading workspace:" (.-message e))
        {:success false :error (.-message e)}))

    ;; Web environment - use localStorage or fetch
    (try
      (let [workspace-key (str "workspace-" (hash workspace-path))
            stored-data (.getItem js/localStorage workspace-key)]
        (if stored-data
          (let [workspace-data (-> stored-data js/JSON.parse (js->clj :keywordize-keys true))]
            ;; Restore state similar to Electron version
            (when (:buffers workspace-data)
              (doseq [buffer-data (:buffers workspace-data)]
                (buffers/create-buffer
                 (:id buffer-data)
                 (:content buffer-data)
                 (:metadata buffer-data))))

            (when (:current-buffer workspace-data)
              (set-current-buffer! (:current-buffer workspace-data)))

            (when (:ui workspace-data)
              (swap! app-state update :ui merge (:ui workspace-data)))

            (when (:evil-state workspace-data)
              (swap! app-state update :evil-state merge (:evil-state workspace-data)))

            (println "Workspace loaded from localStorage")
            {:success true})
          {:success false :error "No workspace found in storage"}))
      (catch js/Error e
        (println "Error loading workspace from localStorage:" (.-message e))
        {:success false :error (.-message e)}))))

(defn save-workspace!
  "Save current workspace to file"
  [workspace-path]
  (println "Saving workspace to:" workspace-path)
  (let [workspace-data {:buffers (into {} (for [[id buffer] @buffers]
                                            [id {:id id
                                                 :path (:path buffer)
                                                 :content (:content buffer)
                                                 :language (:language buffer)
                                                 :saved? (:saved? buffer)
                                                 :metadata (:metadata buffer)
                                                 :created-at (:created-at buffer)
                                                 :modified-at (:modified-at buffer)}]))
                        :current-buffer (:current-buffer @app-state)
                        :ui (:ui @app-state)
                        :evil-state (:evil-state @app-state)
                        :version "1.0.0"
                        :saved-at (js/Date.)}]

    (if (and (exists? js/require) (not env/web?))
      ;; Electron environment - use Node.js fs
      (try
        (let [fs (js/require "fs")
              path (js/require "path")
              workspace-dir (.dirname path workspace-path)]

          ;; Ensure directory exists
          (when-not (.existsSync fs workspace-dir)
            (.mkdirSync fs workspace-dir #js {:recursive true}))

          ;; Write workspace file
          (.writeFileSync fs workspace-path
                          (js/JSON.stringify (clj->js workspace-data) nil 2)
                          "utf8")

          (println "Workspace saved successfully")
          {:success true})
        (catch js/Error e
          (println "Error saving workspace:" (.-message e))
          {:success false :error (.-message e)}))

      ;; Web environment - use localStorage
      (try
        (let [workspace-key (str "workspace-" (hash workspace-path))
              json-data (js/JSON.stringify (clj->js workspace-data) nil 2)]
          (.setItem js/localStorage workspace-key json-data)
          (println "Workspace saved to localStorage")
          {:success true})
        (catch js/Error e
          (println "Error saving workspace to localStorage:" (.-message e))
          {:success false :error (.-message e)})))))

;; Buffer accessors
(defn buffers
  "Get all buffers"
  []
  (:buffers @app-state))

;; Evil state helpers
(defn get-evil-state
  "Get the entire Evil state"
  []
  (:evil-state @app-state))

(defn set-evil-register!
  "Set the Evil register (yank buffer)"
  [text]
  (swap! app-state assoc-in [:evil-state :register] text))

(defn get-evil-register
  "Get the Evil register content"
  []
  (get-in @app-state [:evil-state :register]))

(defn set-evil-count!
  "Set the Evil count for commands"
  [count]
  (swap! app-state assoc-in [:evil-state :count] count))

(defn get-evil-count
  "Get the current Evil count"
  []
  (get-in @app-state [:evil-state :count] 1))

(defn set-last-search!
  "Set the last search query"
  [query]
  (swap! app-state assoc-in [:evil-state :last-search] query))

(defn get-last-search
  "Get the last search query"
  []
  (get-in @app-state [:evil-state :last-search]))

(defn set-search-direction!
  "Set the search direction"
  [direction]
  (swap! app-state assoc-in [:evil-state :search-direction] direction))

(defn get-search-direction
  "Get the search direction"
  []
  (get-in @app-state [:evil-state :search-direction] :forward))

;; Auto-save functionality
(defonce auto-save-timer (atom nil))

(defn enable-auto-save!
  "Enable auto-save with specified interval in milliseconds"
  [interval-ms workspace-path]
  (when @auto-save-timer
    (js/clearInterval @auto-save-timer))

  (reset! auto-save-timer
          (js/setInterval
           (fn []
             (when (:current-buffer @app-state)
               (save-workspace! workspace-path)))
           interval-ms))

  (println "Auto-save enabled with" interval-ms "ms interval"))

(defn disable-auto-save!
  "Disable auto-save"
  []
  (when @auto-save-timer
    (js/clearInterval @auto-save-timer)
    (reset! auto-save-timer nil)
    (println "Auto-save disabled")))

(defn get-auto-save-status
  "Get current auto-save status"
  []
  {:enabled (some? @auto-save-timer)
   :interval (when @auto-save-timer "active")})

;; Workspace management commands
(defn workspace-commands
  "Get workspace-related commands for command palette"
  []
  [{:name "Save Workspace"
    :description "Save current workspace to file"
    :keys "SPC w s"
    :handler (fn []
               (let [workspace-path (or (js/prompt "Workspace path:" "./workspace.json")
                                        "./workspace.json")]
                 (when workspace-path
                   (save-workspace! workspace-path))))}

   {:name "Load Workspace"
    :description "Load workspace from file"
    :keys "SPC w l"
    :handler (fn []
               (let [workspace-path (or (js/prompt "Workspace path:" "./workspace.json")
                                        "./workspace.json")]
                 (when workspace-path
                   (load-workspace! workspace-path))))}

   {:name "Enable Auto-Save"
    :description "Enable auto-save with custom interval"
    :keys "SPC w a"
    :handler (fn []
               (let [interval (or (js/prompt "Auto-save interval (ms):" "30000")
                                  "30000")
                     workspace-path (or (js/prompt "Workspace path for auto-save:" "./workspace.json")
                                        "./workspace.json")]
                 (when (and interval workspace-path)
                   (enable-auto-save! (js/parseInt interval) workspace-path))))}

   {:name "Disable Auto-Save"
    :description "Disable auto-save"
    :keys "SPC w d"
    :handler disable-auto-save!}

   {:name "New Workspace"
    :description "Create new workspace (clear current state)"
    :keys "SPC w n"
    :handler (fn []
               (when (js/confirm "Clear current workspace and create new one?")
                 ;; Clear all buffers
                 (reset! buffers {})
                 ;; Reset current buffer
                 (swap! app-state assoc :current-buffer nil)
                 ;; Reset UI state
                 (swap! app-state update :ui merge {:theme :dark})
                 ;; Reset Evil state
                 (swap! app-state update :evil-state merge {:mode :normal})
                 (println "New workspace created")))}])