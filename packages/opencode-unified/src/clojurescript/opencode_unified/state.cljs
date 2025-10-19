(ns opencode-unified.state
  (:require [reagent.core :as r]
            [clojure.string :as str]))

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
  (println "Loading workspace from:" workspace-path))

(defn save-workspace!
  "Save current workspace to file"
  [workspace-path]
  (println "Saving workspace to:" workspace-path))

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