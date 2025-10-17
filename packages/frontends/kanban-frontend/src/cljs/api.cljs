(ns api
  (:require [state :as state]
            [cljs.core.async :refer [<! >! put! take! chan close! timeout]]
            [goog.string :as gstring])
  (:require-macros [cljs.core.async.macros :refer [go]]))

(def API-ENDPOINTS
  {:board "/api/board"
   :actions "/api/actions"
   :actions-list "/api/actions"})

(defn fetch-json [url & {:keys [method headers body]
                         :or {method "GET"
                              headers {}
                              body nil}}]
  "Fetch JSON from an API endpoint"
  (let [ch (chan)]
    (go
      (try
        (let [options (cond-> {:method method
                               :headers (merge {"Accept" "application/json"
                                                "Content-Type" "application/json"}
                                               headers)}
                          body (assoc :body (js/JSON.stringify (clj->js body)))
                          true (assoc :credentials "same-origin"))
              response (<! (js/fetch url (clj->js options)))]
          (if (.-ok response)
            (let [data (<! (.json response))]
              (put! ch {:success true :data (js->clj data :keywordize-keys true)}))
            (let [error-text (or (.-statusText response) "Request failed")]
              (put! ch {:success false :error error-text}))))
        (catch js/Error e
          (put! ch {:success false :error (.-message e)}))))
    ch))

(defn fetch-board! []
  "Fetch the current board data"
  (go
    (state/set-loading! true)
    (state/set-status! "Loading board…" :loading)
    (let [response (<! (fetch-json (:board API-ENDPOINTS)))]
      (if (:success response)
        (do
          (state/set-board! (:data response))
          (state/set-status! "Board loaded" :idle))
        (do
          (state/set-error! (:error response))
          (state/set-status! "Failed to load board" :error)))
      (state/set-loading! false))))

(defn fetch-initial-data! []
  "Fetch initial data when the app starts"
  (fetch-board!))

(defn execute-command! [command args & {:keys [on-success on-error 
                                             refresh-after? update-status?]
                                        :or {refresh-after? true
                                             update-status? true}}]
  "Execute a remote command"
  (go
    (when update-status?
      (state/set-status! (gstring/format "Running %s…" command) :loading))
    
    (let [response (<! (fetch-json (:actions API-ENDPOINTS)
                                   :method "POST"
                                   :body {:command command
                                          :args args}))]
      (if (:success response)
        (let [result (:data response)]
          (state/add-action-log! {:command command
                                  :status :ok
                                  :message "completed"
                                  :timestamp (:executedAt result)
                                  :id (str (:executedAt result) ":" command)})
          (state/set-last-action! {:command command
                                   :executedAt (:executedAt result)
                                   :result (:result result)})
          (when update-status?
            (state/set-status! (gstring/format "%s completed" command) :idle))
          (when on-success
            (on-success (:result result) (:executedAt result)))
          (when refresh-after?
            (<! (fetch-board!)))
          result)
        (do
          (state/add-action-log! {:command command
                                  :status :error
                                  :message (:error response)
                                  :timestamp (js/Date.)
                                  :id (str (js/Date.) ":" command)})
          (when update-status?
            (state/set-status! (gstring/format "Error: %s" (:error response)) :error))
          (state/set-error! (:error response))
          (when on-error
            (on-error (js/Error. (:error response))))
          nil)))))

(defn get-available-actions! []
  "Get the list of available remote commands"
  (go
    (let [response (<! (fetch-json (:actions-list API-ENDPOINTS)))]
      (if (:success response)
        (:data response)
        []))))

;; Command-specific helpers
(defn refresh-board! []
  "Refresh the board data"
  (fetch-board!))

(defn search-tasks! [term callback]
  "Search for tasks by term"
  (execute-command! "search" [term]
                    :on-success callback
                    :refresh-after? false))

(defn find-task-by-title! [title callback]
  "Find a task by its title"
  (execute-command! "find-by-title" [title]
                    :on-success callback
                    :refresh-after? false))

(defn get-column-info! [column command callback]
  "Get column information (count, getColumn, getByColumn)"
  (execute-command! command [column]
                    :on-success callback
                    :refresh-after? false))

(defn update-task-status! [task-id new-status & {:keys [on-success on-error]}]
  "Update a task's status"
  (execute-command! "update_status" [task-id new-status]
                    :on-success on-success
                    :on-error on-error))

(defn move-task! [task-id direction & {:keys [on-success on-error]}]
  "Move a task up or down in its column"
  (execute-command! direction [task-id]
                    :on-success on-success
                    :on-error on-error))

(defn sync-board! []
  "Synchronize the board"
  (execute-command! "sync" []))

(defn pull-board! []
  "Pull changes from remote"
  (execute-command! "pull" []))

(defn push-board! []
  "Push changes to remote"
  (execute-command! "push" []))

(defn regenerate-board! []
  "Regenerate the board"
  (execute-command! "regenerate" []))

(defn index-for-search! []
  "Index tasks for search"
  (execute-command! "indexForSearch" [] :refresh-after? false))

;; Task CRUD operations
(defn create-task! [title & {:keys [content priority status labels]
                              :or {content "" priority "P3" status "incoming" labels []}}]
  "Create a new task"
  (let [args (cond-> [title]
               content (conj "--content" content)
               priority (conj "--priority" priority)
               status (conj "--status" status)
               (seq labels) (conj "--labels" (clojure.string/join "," labels)))]
    (execute-command! "create" args)))

(defn update-task! [uuid & {:keys [title content priority status labels]
                            :or {title nil content nil priority nil status nil labels nil}}]
  "Update an existing task"
  (let [args (cond-> [uuid]
               title (conj "--title" title)
               content (conj "--content" content)
               priority (conj "--priority" priority)
               status (conj "--status" status)
               (seq labels) (conj "--labels" (clojure.string/join "," labels)))]
    (execute-command! "update" args)))

(defn delete-task! [uuid & {:keys [confirm]
                             :or {confirm false}}]
  "Delete a task"
  (let [args (cond-> [uuid]
               confirm (conj "--confirm"))]
    (execute-command! "delete" args)))

;; Advanced operations
(defn audit-board! []
  "Audit board for consistency issues"
  (execute-command! "audit" [] :refresh-after? false))

(defn enforce-wip-limits! []
  "Check and report WIP limit violations"
  (execute-command! "enforce-wip-limits" [] :refresh-after? false))

(defn generate-by-tags! [tags]
  "Generate filtered board by tags"
  (execute-command! "generate-by-tags" [tags] :refresh-after? false))

(defn compare-tasks! [task-uuids]
  "Compare multiple tasks"
  (execute-command! "compare-tasks" [(clojure.string/join "," task-uuids)] :refresh-after? false))

(defn breakdown-task! [task-uuid]
  "Get AI-powered task breakdown"
  (execute-command! "breakdown-task" [task-uuid] :refresh-after? false))

(defn prioritize-tasks! [task-uuids]
  "Get task prioritization analysis"
  (execute-command! "prioritize-tasks" [(clojure.string/join "," task-uuids)] :refresh-after? false))

(defn list-tasks! []
  "List all tasks with status"
  (execute-command! "list" [] :refresh-after? false))

(defn show-process! [& [section]]
  "Show development process information"
  (let [args (if section [section] [])]
    (execute-command! "show-process" args :refresh-after? false)))

(defn show-transitions! []
  "Show valid state transitions"
  (execute-command! "show-transitions" [] :refresh-after? false))