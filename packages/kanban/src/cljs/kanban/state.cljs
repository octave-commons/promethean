(ns kanban.state)

;; Global application state using a simple atom
(defonce app-state
  (atom {:status {:message "Ready"
                  :mode :idle
                  :updated-at nil}
         :board nil
         :selected-task-id nil
         :selected-task nil
         :search-state nil
         :column-insight nil
         :last-action nil
         :action-log []
         :board-path ""
         :tasks-path ""
         :loading? false
         :error nil
         :dark-mode? false}))

;; State access functions
(defn get-state []
  "Get the current app state"
  @app-state)

;; Derived state calculations
(defn selected-task [state]
  "Get the currently selected task"
  (:selected-task state))

(defn board-tasks [state]
  "Get all tasks from the board"
  (->> (:board state)
       :columns
       (mapcat :tasks)))

(defn find-task-by-id [state task-id]
  "Find a task by its UUID in the current board"
  (some #(when (= (:uuid %) task-id) %)
        (board-tasks state)))

(defn total-task-count [state]
  "Get total number of tasks across all columns"
  (->> (:board state)
       :columns
       (map :count)
       (reduce + 0)))

(defn column-names [state]
  "Get list of column names"
  (->> (:board state)
       :columns
       (map :name)))

;; State update functions
(defn set-status! [message mode]
  "Update the application status"
  (swap! app-state assoc 
         :status {:message message
                  :mode mode
                  :updated-at (js/Date.)}))

(defn set-loading! [loading?]
  "Set the loading state"
  (swap! app-state assoc :loading? loading?))

(defn set-error! [error]
  "Set an error message"
  (swap! app-state assoc :error error))

(defn clear-error! []
  "Clear any error message"
  (swap! app-state assoc :error nil))

(defn set-board! [board]
  "Update the board data"
  (swap! app-state assoc :board board))

(defn select-task! [task-id]
  "Select a task by ID"
  (swap! app-state assoc 
         :selected-task-id task-id
         :selected-task (find-task-by-id @app-state task-id)))

(defn clear-selection! []
  "Clear the current task selection"
  (swap! app-state assoc 
         :selected-task-id nil
         :selected-task nil))

(defn set-search-state! [search-state]
  "Update the search state"
  (swap! app-state assoc :search-state search-state))

(defn set-column-insight! [insight]
  "Update the column insight"
  (swap! app-state assoc :column-insight insight))

(defn set-last-action! [action]
  "Update the last action"
  (swap! app-state assoc :last-action action))

(defn add-action-log! [entry]
  "Add an entry to the action log"
  (swap! app-state update :action-log 
         #(take 20 (cons entry %))))

(defn initialize! [board-path tasks-path]
  "Initialize the application state with paths"
  (swap! app-state assoc 
         :board-path board-path
         :tasks-path tasks-path))

(defn cleanup! []
  "Clean up the application state"
  (apply-dark-mode false)
  (reset! app-state {:status {:message "Ready"
                              :mode :idle
                              :updated-at nil}
                     :board nil
                     :selected-task-id nil
                     :selected-task nil
                     :search-state nil
                     :column-insight nil
                     :last-action nil
                     :action-log []
                     :board-path ""
                     :tasks-path ""
                     :loading? false
                     :error nil
                     :dark-mode? false}))

;; Event system for state changes
(defonce state-listeners (atom []))

(defn add-state-listener! [listener]
  "Add a listener that gets called when state changes"
  (swap! state-listeners conj listener))

(defn remove-state-listener! [listener]
  "Remove a state listener"
  (swap! state-listeners #(filterv (partial not= listener) %)))

(defn notify-state-change! [old-state new-state]
  "Notify all listeners of a state change"
  (doseq [listener @state-listeners]
    (listener old-state new-state)))

;; Enhanced swap! that notifies listeners
(defn swap-and-notify! [atom f & args]
  "Swap atom value and notify listeners"
  (let [old-value @atom
        new-value (apply swap! atom f args)]
    (when (= atom app-state)
      (notify-state-change! old-value new-value))
    new-value))

;; Override the default swap! for app-state to include notifications
(defn update-state! [f & args]
  "Update app state and notify listeners"
  (apply swap-and-notify! app-state f args))

;; Helper functions for common state updates
(defn update-status! [message mode]
  "Update status and notify listeners"
  (update-state! assoc :status {:message message
                                 :mode mode
                                 :updated-at (js/Date.)}))

(defn update-board! [board]
  "Update board and notify listeners"
  (update-state! assoc :board board))

(defn update-selection! [task-id]
  "Update task selection and notify listeners"
  (update-state! assoc 
                 :selected-task-id task-id
                 :selected-task (find-task-by-id @app-state task-id)))

;; Dark mode state functions
(defn get-stored-dark-mode []
  "Get dark mode preference from localStorage"
  (try
    (= (.getItem js/localStorage "kanban-dark-mode") "true")
    (catch js/Error _
      false)))

(defn set-stored-dark-mode! [dark-mode?]
  "Store dark mode preference in localStorage"
  (try
    (.setItem js/localStorage "kanban-dark-mode" (str dark-mode?))
    (catch js/Error _
      ;; Ignore localStorage errors
      )))

(defn toggle-dark-mode! []
  "Toggle dark mode state"
  (let [current-dark-mode? (:dark-mode? @app-state)
        new-dark-mode? (not current-dark-mode?)]
    (set-stored-dark-mode! new-dark-mode?)
    (update-state! assoc :dark-mode? new-dark-mode?)
    (apply-dark-mode new-dark-mode?)))

(defn apply-dark-mode [dark-mode?]
  "Apply dark mode to the document"
  (let [root js/document.documentElement]
    (if dark-mode?
      (.setAttribute root "data-theme" "dark")
      (.removeAttribute root "data-theme"))))

(defn initialize-dark-mode! []
  "Initialize dark mode from stored preference"
  (let [dark-mode? (get-stored-dark-mode)]
    (update-state! assoc :dark-mode? dark-mode?)
    (apply-dark-mode dark-mode?)))