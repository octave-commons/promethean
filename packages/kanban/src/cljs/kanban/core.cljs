(ns kanban.core
  (:require [kanban.state :as state]
            [kanban.api :as api]
            [kanban.components :as components]
            [kanban.events :as events]
            [kanban.styles :as styles]
            [goog.dom :as gdom]))

(defn ^:export init []
  "Initialize the kanban application"
  (let [root (gdom/getElement "app")]
    (when root
      (let [board-path (or (.-boardPath (.-dataset root)) "")
            tasks-path (or (.-tasksPath (.-dataset root)) "")]
        (state/initialize! board-path tasks-path)
        (state/initialize-dark-mode!)
        (components/render)
        (api/fetch-initial-data!)
        (events/setup-global-handlers!)))))

(defn ^:export cleanup []
  "Clean up the kanban application"
  (events/remove-global-handlers!)
  (state/cleanup!))

;; Auto-initialize when DOM is ready
(when (and js/document
           (not= js/document.readyState "loading"))
  (init))

;; Listen for DOM ready if not already loaded
(when js/document
  (.addEventListener js/document "DOMContentLoaded" init))