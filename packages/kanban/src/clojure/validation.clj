(ns promethean.kanban.validation
  (:require [clojure.spec.alpha :as s]))

;; Task validation specs
(s/def :task/uuid string?)
(s/def :task/title string?)
(s/def :task/priority #{"P0" "P1" "P2" "P3" "high" "medium" "low"})
(s/def :task/content string?)
(s/def :task/status string?)
(s/def :task/estimates (s/keys :req-un [:estimates/complexity]))
(s/def :estimates/complexity number?)
(s/def :task/labels (s/coll-of string? :kind vector?))
(s/def :task/map (s/keys :req-un [:task/uuid :task/title :task/priority :task/status :task/estimates :task/labels] 
                              :opt-un [:task/content :task/id :task/owner :task/created]))

;; Board validation specs
(s/def :column/name string?)
(s/def :column/limit (s/nilable number?))
(s/def :column/tasks (s/coll-of any? :kind vector?))
(s/def :column/map (s/keys :req-un [:column/name :column/limit :column/tasks]))
(s/def :board/columns (s/coll-of :column/map :kind vector?))
(s/def :board/map (s/keys :req-un [:board/columns]))

(defn validate-task [task-js]
  (let [task (js->clj task-js :keywordize-keys true)
        valid? (s/valid? :task/map task)
        problems (when-not valid? (s/explain-data :task/map task))
        errors (when problems ["Task validation failed"])
        debug-info (when problems (pr-str problems))]
    {:isValid (boolean valid?) 
     :errors (or errors ["No specific errors"]) 
     :debugInfo debug-info}))

(defn validate-board [board-js]
  (let [board (js->clj board-js :keywordize-keys true)
        valid? (s/valid? :board/map board)
        problems (when-not valid? (s/explain-data :board/map board))
        errors (when problems ["Board validation failed"])
        debug-info (when problems (pr-str problems))]
    {:isValid (boolean valid?) 
     :errors (or errors ["No specific errors"]) 
     :debugInfo debug-info}))

(defn evaluate-transition-rule [task-js board-js rule-fn]
  (let [task (js->clj task-js :keywordize-keys true)
        board (js->clj board-js :keywordize-keys true)]
    (boolean (rule-fn task board))))