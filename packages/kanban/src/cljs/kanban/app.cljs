(ns kanban.app
  (:require [kanban.core :as core]
            [goog.dom :as gdom]))

(defn mount! [root-element]
  "Mount the kanban application to the given root element"
  (core/init))

(defn unmount! [root-element]
  "Unmount the kanban application from the given root element"
  (core/cleanup))