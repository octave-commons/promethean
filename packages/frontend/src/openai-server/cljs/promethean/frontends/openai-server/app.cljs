(ns promethean.frontends.openai-server.app
  (:require [promethean.frontends.openai-server.core :as core]))

(defn ^:export init []
  (core/init))