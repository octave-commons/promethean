(ns promethean.frontends.kanban.app
  (:require [kanban.app :as kanban]))

(defn ^:export init []
  (kanban/init))