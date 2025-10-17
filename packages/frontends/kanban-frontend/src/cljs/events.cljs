(ns events
  (:require [state :as state]
            [api :as api]
            [components :as components]
            [goog.events :as gevents]))

(defn handle-click [event]
  "Handle click events throughout the application"
  (let [target (.-target event)]
    (cond
      ;; Refresh button
      (= (.-action (.-dataset target)) "refresh")
      (do
        (.preventDefault event)
        (api/refresh-board!))
      
      ;; Task selection
      (some? (.-taskId (.-dataset target)))
      (let [task-id (.-taskId (.-dataset target))]
        (when (seq task-id)
          (.preventDefault event)
          (state/select-task! task-id)))
      
      ;; Command buttons
      (some? (.-command (.-dataset target)))
      (let [command (.-command (.-dataset target))
            task-id (.-taskId (.-dataset target))]
        (.preventDefault event)
        (case command
          ("move_up" "move_down")
          (when task-id
            (api/move-task! task-id command))
          
          ("pull" "push" "sync" "regenerate")
          (api/execute-command! command [])
          
          ("indexForSearch")
          (api/index-for-search!)
          
          ("audit" "enforce-wip-limits" "list" "show-process" "show-transitions")
           (api/execute-command! command [])
           
           ("delete-task")
           (when task-id
             (api/delete-task! task-id))
           
           ;; Default command execution
          (api/execute-command! command [])))
      
      ;; Search result selection
      (= (.-uiAction (.-dataset target)) "select-result")
      (let [task-id (.-taskId (.-dataset target))]
        (when (seq task-id)
          (.preventDefault event)
          (state/select-task! task-id)))
      
      :else
      ;; Let other clicks bubble up
      nil)))

(defn handle-change [event]
  "Handle change events (mainly for select elements)"
  (let [target (.-target event)]
    (when (= (.-command (.-dataset target)) "update_status")
      (let [task-id (.-taskId (.-dataset target))
            current-status (.-currentStatus (.-dataset target))
            new-status (.-value target)]
        (when (and task-id (not= new-status current-status))
          (api/update-task-status! task-id new-status
                                  :on-success #(state/select-task! task-id)
                                  :on-error #(do
                                               (set! (.-value target) current-status)
                                               (set! (.-currentStatus (.-dataset target)) current-status))))))))

(defn handle-submit [event]
  "Handle form submission events"
  (.preventDefault event)
  (let [form (.-target event)
        submitter (.-submitter event)]
    (when (and form submitter)
      (let [command (.-command (.-dataset submitter))
            form-type (.-form (.-dataset form))]
        (case form-type
          :search
          (let [form-data (js/FormData. form)
                term (.. form-data (get "term") (trim))]
            (if (empty? term)
              (state/set-status! "Enter a term to search" :error)
              (case command
                "search"
                (api/search-tasks! term
                                  (fn [result]
                                    (state/set-search-state! 
                                      {:mode :search
                                       :term term
                                       :executedAt (js/Date.)
                                       :result result})))
                
                "find-by-title"
                (api/find-task-by-title! term
                                         (fn [result]
                                           (state/set-search-state! 
                                             {:mode :find-by-title
                                              :term term
                                              :executedAt (js/Date.)
                                              :result result})))))
            (.reset form))
          
          :column-tools
          (let [form-data (js/FormData. form)
                column (.. form-data (get "column") (trim))]
            (if (empty? column)
              (state/set-status! "Select a column first" :error)
              (api/get-column-info! column command
                                    (fn [result]
                                      (state/set-column-insight! 
                                        {:command (keyword command)
                                         :column column
                                         :executedAt (js/Date.)
                                         :payload result})))))
          
          :create-task
          (let [form-data (js/FormData. form)
                title (.. form-data (get "title") (trim))
                content (.. form-data (get "content") (trim))
                priority (.. form-data (get "priority") (trim))
                status (.. form-data (get "status") (trim))
                labels (.. form-data (get "labels") (trim))]
            (if (empty? title)
              (state/set-status! "Task title is required" :error)
              (let [labels-vec (if (empty? labels) [] (clojure.string/split labels #","))]
                (api/create-task! title 
                                  :content content 
                                  :priority priority 
                                  :status status 
                                  :labels labels-vec)
                (.reset form))))
          
          :edit-task
          (let [form-data (js/FormData. form)
                task-id (.-taskId (.-dataset form))
                title (.. form-data (get "title") (trim))
                content (.. form-data (get "content") (trim))
                priority (.. form-data (get "priority") (trim))
                status (.. form-data (get "status") (trim))
                labels (.. form-data (get "labels") (trim))]
            (if (empty? title)
              (state/set-status! "Task title is required" :error)
              (let [labels-vec (if (empty? labels) [] (clojure.string/split labels #","))]
                (api/update-task! task-id
                                  :title title
                                  :content content
                                  :priority priority
                                  :status status
                                  :labels labels-vec))))
          
          :else
          nil)))))

(defn handle-keydown [event]
  "Handle keyboard events"
  (let [key (.-key event)]
    (case key
      "Escape"
      (state/clear-selection!)
      
      ;; Add more keyboard shortcuts as needed
      ;; "r" (when (.-ctrlKey event) (api/refresh-board!))
      ;; "f" (when (.-ctrlKey event) (.focus (js/document.getElementById "search-term")))
      
      nil)))

(defn setup-global-handlers! []
  "Set up global event handlers"
  (gevents/listen js/document "click" handle-click)
  (gevents/listen js/document "change" handle-change)
  (gevents/listen js/document "submit" handle-submit)
  (gevents/listen js/document "keydown" handle-keydown))

(defn remove-global-handlers! []
  "Remove global event handlers"
  (gevents/unlisten js/document "click" handle-click)
  (gevents/unlisten js/document "change" handle-change)
  (gevents/unlisten js/document "submit" handle-submit)
  (gevents/unlisten js/document "keydown" handle-keydown))