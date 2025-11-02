(ns validation
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

(defn evaluate-rule-string [task-js board-js rule-string]
  (let [task (js->clj task-js :keywordize-keys true)
        board (js->clj board-js :keywordize-keys true)]
    (try
      ;; Evaluate the rule string in a context where task and board are available
      (eval (read-string (str "(fn [task board] " rule-string ")")))
      (catch js/Error e
        (throw (js/Error. (str "Failed to evaluate rule string: " (.-message e))))))))

(defn evaluate-resolved-function [from-js to-js task-js board-js resolved-fn]
  (let [from (if (string? from-js) from-js (str from-js))
        to (if (string? to-js) to-js (str to-js))
        task (js->clj task-js :keywordize-keys true)
        board (js->clj board-js :keywordize-keys true)]
    (try
      (boolean (resolved-fn from to task board))
      (catch js/Error e
        (throw (js/Error. (str "Failed to call resolved function: " (.-message e))))))))

;; Export functions for JavaScript usage
#js {:validate-task validate-task
     :validate-board validate-board
     :evaluate-transition-rule evaluate-transition-rule
     :evaluate-rule-string evaluate-rule-string
     :evaluate-resolved-function evaluate-resolved-function}
