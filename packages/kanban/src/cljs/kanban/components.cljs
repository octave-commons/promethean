(ns kanban.components
  (:require [kanban.state :as state]
            [kanban.api :as api]
            [kanban.styles :as styles]
            [goog.string :as gstring]
            [goog.dom :as gdom]
            [goog.dom.classlist :as gclass]
            [goog.events :as gevents]))

;; Simple component system using native DOM
(defn create-element [tag attrs & children]
  "Create a DOM element with attributes and children"
  (let [element (js/document.createElement tag)]
    (when attrs
      (doseq [[key value] attrs]
        (cond
          (= key :class)
          (gclass/add element value)
          
          (= key :on-click)
          (gevents/listen element "click" value)
          
          (= key :data-action)
          (.setAttribute element "data-action" value)
          
          (= key :data-state)
          (.setAttribute element "data-state" value)
          
          (= key :data-task-id)
          (.setAttribute element "data-task-id" value)
          
          (= key :data-command)
          (.setAttribute element "data-command" value)
          
          (= key :data-current-status)
          (.setAttribute element "data-current-status" value)
          
          (= key :data-ui-action)
          (.setAttribute element "data-ui-action" value)
          
          (= key :data-form)
          (.setAttribute element "data-form" value)
          
          (= key :data-role)
          (.setAttribute element "data-role" value)
          
          (= key :data-priority)
          (.setAttribute element "data-priority" value)
          
          (= key :disabled)
          (when value
            (.setAttribute element "disabled" "disabled"))
          
          :else
          (.setAttribute element (name key) value))))
    (doseq [child children]
      (if (string? child)
        (.appendChild element (js/document.createTextNode child))
        (.appendChild element child)))
    element))

(defn escape-html [text]
  "Escape HTML entities in text"
  (if (string? text)
    (-> text
        (.replace "&" "&amp;")
        (.replace "<" "&lt;")
        (.replace ">" "&gt;")
        (.replace "\"" "&quot;")
        (.replace "'" "&#x27;"))
    text))

(defn format-timestamp [iso]
  "Format ISO timestamp for display"
  (if (string? iso)
    (let [date (js/Date. iso)]
      (if (js/isNaN (.getTime date))
        iso
        (str (.toLocaleDateString date) " " (.toLocaleTimeString date))))
    iso))

(defn truncate [text limit]
  "Truncate text to specified length"
  (if (and text (string? text))
    (if (<= (.-length text) limit)
      text
      (str (.substring text 0 (dec limit)) "…"))
    text))

;; Header component
(defn header []
  "Application header with title and controls"
  (let [app-state (state/get-state)
        status (:status app-state)
        board-path (:board-path app-state)
        tasks-path (:tasks-path app-state)]
    (create-element "header" {:class "kanban-header"}
      (create-element "div" {}
        (create-element "h1" {} "Promethean Kanban")
        (when (seq board-path)
          (create-element "p" {:class "muted"}
            "Board: "
            (create-element "code" {} (escape-html board-path))))
        (when (seq tasks-path)
          (create-element "p" {:class "muted"}
            "Tasks: "
            (create-element "code" {} (escape-html tasks-path)))))
      (create-element "div" {:class "kanban-controls"}
        (create-element "button" {:type "button"
                                  :class "dark-mode-toggle"
                                  :data-theme (if (:dark-mode? app-state) "dark" "light")
                                  :data-action "toggle-dark-mode"
                                  :on-click (fn [_] (state/toggle-dark-mode!))})
        (create-element "button" {:type "button"
                                  :data-action "refresh"
                                  :on-click api/refresh-board!}
          "Refresh")
        (create-element "span" {:class "status"
                                :data-state (name (:mode status))}
          (escape-html (:message status)))
        (create-element "time" {:dateTime (or (:updated-at status) "")}
          (if (:updated-at status)
            (format-timestamp (:updated-at status))
            "—"))))))

;; Task card component
(defn task-card [task & {:keys [selected?]}]
  "Individual task card component"
  (let [task-id (:uuid task)
        priority (:priority task)
        labels (:labels task)]
    (create-element "li" {:class "task-card"
                          :data-role "task-card"
                          :data-task-id task-id}
      (when selected?
        (gclass/add (.-lastChild js/document.body) "is-selected"))
      (create-element "div" {:class "task-header"}
        (create-element "h3" {} (escape-html (:title task)))
        (when priority
          (create-element "span" {:class "task-priority"
                                  :data-priority (str priority)}
            (str "P" priority))))
      (when (and labels (seq labels))
        (create-element "div" {:class "task-labels"}
          (apply concat
            (for [label labels]
              [(create-element "span" {} (escape-html label))]))))
      (create-element "div" {:class "task-meta"}
        (create-element "span" {:class "meta-label"} "Status")
        (create-element "span" {} (escape-html (:status task)))
        (when (:created_at task)
          (create-element "span" {:class "meta-label"} "Created")
          (create-element "time" {:dateTime (:created_at task)}
            (format-timestamp (:created_at task)))))
      (when (:content task)
        (create-element "p" {:class "task-body"}
          (escape-html (truncate (:content task) 360))))
      (create-element "div" {:class "task-actions"}
        (create-element "button" {:class "task-action"
                                  :data-command "move_up"
                                  :data-task-id task-id}
          "↑")
        (create-element "button" {:class "task-action"
                                  :data-command "move_down"
                                  :data-task-id task-id}
          "↓")
        (let [column-names (state/column-names (state/get-state))]
          (create-element "select" {:class "status-control"
                                    :data-command "update_status"
                                    :data-task-id task-id
                                    :data-current-status (:status task)
                                    :default-value (:status task)}
            (apply concat
              (for [column column-names]
                [(create-element "option" {:value column}
                   (escape-html column))]))))))))

;; Column component
(defn kanban-column [column & {:keys [selected-task-id]}]
  "Individual kanban column component"
  (create-element "section" {:class "kanban-column"}
    (create-element "div" {:class "column-header"}
      (create-element "h2" {} (escape-html (:name column)))
      (create-element "span" {:class "column-count"} (str (:count column))))
    (create-element "ul" {:class "task-list"}
      (if (seq (:tasks column))
        (apply concat
          (for [task (:tasks column)]
            [(task-card task :selected? (= (:uuid task) selected-task-id))]))
        (create-element "li" {:class "task-empty"} "No tasks in this column")))))

;; Board component
(defn kanban-board []
  "Main kanban board component"
  (let [app-state (state/get-state)
        board (:board app-state)
        selected-task-id (:selected-task-id app-state)]
    (if board
      (create-element "div" {:class "kanban-columns"}
        (apply concat
          (for [column (:columns board)]
            [(kanban-column column :selected-task-id selected-task-id)])))
      (create-element "p" {:class "task-empty"} "Board data unavailable."))))

;; Selected task panel
(defn selected-task-panel []
  "Panel showing details of the selected task"
  (let [selected-task (state/selected-task (state/get-state))]
    (create-element "section" {:class "panel"}
      (create-element "h2" {} "Selected task")
      (if selected-task
        (create-element "article" {:class "selected-task"}
          (create-element "header" {}
            (create-element "h3" {} (escape-html (:title selected-task)))
            (create-element "code" {} (escape-html (:uuid selected-task))))
          (when (and (:labels selected-task) (seq (:labels selected-task)))
            (create-element "div" {:class "selected-task-labels"}
              (apply concat
                (for [label (:labels selected-task)]
                  [(create-element "span" {} (escape-html label))]))))
          (create-element "div" {:class "selected-task-meta"}
            (create-element "div" {}
              (create-element "span" {:class "meta-key"} "Status")
              (create-element "span" {} (escape-html (:status selected-task))))
            (when (:priority selected-task)
              (create-element "div" {}
                (create-element "span" {:class "meta-key"} "Priority")
                (create-element "span" {} (str "P" (:priority selected-task)))))
            (when (:created_at selected-task)
              (create-element "div" {}
                (create-element "span" {:class "meta-key"} "Created")
                (create-element "time" {:dateTime (:created_at selected-task)}
                  (format-timestamp (:created_at selected-task)))))
            (when (:slug selected-task)
              (create-element "div" {}
                (create-element "span" {:class "meta-key"} "Slug")
                (create-element "code" {} (escape-html (:slug selected-task)))))
            (when (:sourcePath selected-task)
              (create-element "div" {}
                (create-element "span" {:class "meta-key"} "Source")
                (create-element "code" {} (escape-html (:sourcePath selected-task))))))
          (when (:content selected-task)
            (create-element "p" {:class "selected-task-body"}
              (escape-html (truncate (:content selected-task) 360)))))
        (create-element "p" {:class "muted"} "Select a task to inspect its details.")))))

;; Search panel
(defn search-panel []
  "Search functionality panel"
  (let [app-state (state/get-state)
        search-state (:search-state app-state)]
    (create-element "section" {:class "panel"}
      (create-element "h2" {} "Search tasks")
      (create-element "form" {:class "search-form"
                              :data-form "search"}
        (create-element "label" {:class "visually-hidden"
                                 :for "search-term"} "Search term")
        (create-element "input" {:id "search-term"
                                 :name "term"
                                 :type "text"
                                 :placeholder "Search for tasks"})
        (create-element "div" {:class "search-buttons"}
          (create-element "button" {:class "command-button"
                                    :type "submit"
                                    :data-command "search"}
            "Search")
          (create-element "button" {:class "command-button"
                                    :type "submit"
                                    :data-command "find-by-title"}
            "Find by title")))
      (if search-state
        (create-element "div" {:class "search-results"}
          (create-element "header" {:class "panel-subheader"}
            (create-element "h3" {} 
              (if (= (:mode search-state) :search)
                (str "Results for \"" (escape-html (:term search-state)) "\"")
                (str "Find by title: \"" (escape-html (:term search-state)) "\"")))
            (create-element "span" {} (format-timestamp (:executedAt search-state))))
          (if (= (:mode search-state) :search)
            (if (seq (:result search-state))
              (create-element "ol" {:class "search-results-list"}
                (apply concat
                  (for [task (:result search-state)]
                    [(create-element "li" {}
                       (create-element "button" {:class "result-button"
                                                 :data-ui-action "select-result"
                                                 :data-task-id (:uuid task)}
                         (create-element "span" {:class "result-title"}
                           (escape-html (:title task)))
                         (create-element "span" {:class "result-status"}
                           (escape-html (:status task)))))])))
              (create-element "p" {:class "muted"} "No tasks matched your search."))
            (if (:result search-state)
              (create-element "div" {:class "search-single"}
                (create-element "button" {:class "result-button"
                                          :data-ui-action "select-result"
                                          :data-task-id (:uuid (:result search-state))}
                  (create-element "span" {:class "result-title"}
                    (escape-html (:title (:result search-state))))
                  (create-element "span" {:class "result-status"}
                    (escape-html (:status (:result search-state))))))
              (create-element "p" {:class "muted"} "No task title matched the query."))))
        (create-element "p" {:class "muted"} "Run a search to see matching tasks.")))))

;; Column inspector panel
(defn column-inspector-panel []
  "Column inspection tools panel"
  (let [app-state (state/get-state)
        board (:board app-state)
        column-insight (:column-insight app-state)
        column-names (state/column-names app-state)]
    (create-element "section" {:class "panel"}
      (create-element "h2" {} "Column inspector")
      (create-element "form" {:class "column-form"
                              :data-form "column-tools"}
        (create-element "label" {:class "visually-hidden"
                                 :for "column-name"} "Column")
        (create-element "select" {:id "column-name"
                                  :name "column"
                                  :disabled (empty? column-names)}
          (apply concat
            (for [column-name column-names]
              [(create-element "option" {:value column-name}
                 (escape-html column-name))])))
        (create-element "div" {:class "column-buttons"}
          (create-element "button" {:class "command-button"
                                    :type "submit"
                                    :data-command "count"
                                    :disabled (empty? column-names)}
            "Count")
          (create-element "button" {:class "command-button"
                                    :type "submit"
                                    :data-command "getColumn"
                                    :disabled (empty? column-names)}
            "Get column")
          (create-element "button" {:class "command-button"
                                    :type "submit"
                                    :data-command "getByColumn"
                                    :disabled (empty? column-names)}
            "List tasks")))
      (if column-insight
        (create-element "div" {:class "column-insight"}
          (create-element "header" {:class "panel-subheader"}
            (create-element "h3" {} (str (name (:command column-insight)) " → " (escape-html (:column column-insight))))
            (create-element "span" {} (format-timestamp (:executedAt column-insight))))
          (create-element "pre" {} (escape-html (js/JSON.stringify (clj->js (:payload column-insight)) nil 2))))
        (create-element "p" {:class "muted"} "Inspect a column to see details here.")))))

;; Board maintenance panel
(defn board-maintenance-panel []
  "Board maintenance operations panel"
  (create-element "section" {:class "panel"}
    (create-element "h2" {} "Board maintenance")
    (create-element "div" {:class "button-grid"}
      (create-element "button" {:class "command-button"
                                :data-command "pull"
                                :on-click api/pull-board!}
        "Pull")
      (create-element "button" {:class "command-button"
                                :data-command "push"
                                :on-click api/push-board!}
        "Push")
      (create-element "button" {:class "command-button"
                                :data-command "sync"
                                :on-click api/sync-board!}
        "Sync")
      (create-element "button" {:class "command-button"
                                :data-command "regenerate"
                                :on-click api/regenerate-board!}
        "Regenerate")
      (create-element "button" {:class "command-button"
                                :data-command "indexForSearch"
                                :on-click api/index-for-search!}
        "Index for search"))))

;; Last action panel
(defn last-action-panel []
  "Panel showing the last command response"
  (let [last-action (:last-action (state/get-state))]
    (create-element "section" {:class "panel"}
      (create-element "h2" {} "Last response")
      (if last-action
        (create-element "div" {:class "command-output"}
          (create-element "header" {:class "panel-subheader"}
            (create-element "h3" {} (escape-html (:command last-action)))
            (create-element "span" {} (format-timestamp (:executedAt last-action))))
          (create-element "pre" {} (escape-html (js/JSON.stringify (clj->js (:result last-action)) nil 2))))
        (create-element "p" {:class "muted"} "Run a command to view its response.")))))

;; Activity log panel
(defn activity-log-panel []
  "Panel showing command activity log"
  (let [action-log (:action-log (state/get-state))]
    (create-element "section" {:class "panel"}
      (create-element "h2" {} "Activity")
      (if (seq action-log)
        (create-element "ol" {:class "action-log"}
          (apply concat
            (for [entry action-log]
              [(create-element "li" {:data-status (name (:status entry))}
                 (create-element "span" {} (escape-html (:command entry)))
                 (create-element "time" {:dateTime (:timestamp entry)}
                   (format-timestamp (:timestamp entry)))
                 (create-element "span" {:class "log-message"}
                   (escape-html (:message entry))))])))
        (create-element "p" {:class "muted"} "Command activity will appear here.")))))

;; Main application component
(defn kanban-app []
  "Main kanban application component"
  (styles/inject-styles!)
  (create-element "div" {:class "kanban-app"}
    (header)
    (create-element "div" {:class "kanban-main"}
      (create-element "div" {:class "board-container"}
        (kanban-board))
      (create-element "aside" {:class "kanban-sidebar"}
        (selected-task-panel)
        (search-panel)
        (column-inspector-panel)
        (board-maintenance-panel)
        (last-action-panel)
        (activity-log-panel)))))

;; Render function to mount the app
(defn render []
  "Render the application to the DOM"
  (let [app-element (.getElementById js/document "app")]
    (when app-element
      ;; Clear existing content
      (gdom/removeChildren app-element)
      ;; Append the new app
      (.appendChild app-element (kanban-app)))))