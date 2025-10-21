(ns db.core
  (:require [cljs.core.async :refer [<! >! chan go]]))

(defn create-http-client []
  (js/XMLHttpRequest.))

(defn api-request [method endpoint & [data]]
  (let [ch (chan)
        xhr (create-http-client)]
    (.open xhr method (str "http://localhost:3001/api" endpoint) true)
    (.setRequestHeader xhr "Content-Type" "application/json")
    (.send xhr (when data (js/JSON.stringify (clj->js data)))
    
    (.addEventListener xhr "load"
                      (fn [e]
                        (let [status (.-status xhr)
                              response (.-responseText xhr)]
(if (>= status 200)
                             (>! ch {:success true :data (js->clj (js/JSON.parse response) :keywordize-keys true)})
                             (>! ch {:success false :error response}))))))
    
    (.addEventListener xhr "error"
                      (fn [e]
                        (>! ch {:success false :error "Network error"})))
    
    ch))

(defn get-sessions []
  (api-request "GET" "/sessions"))

(defn get-session [session-id]
  (api-request "GET" (str "/sessions/" session-id)))

(defn get-messages [session-id]
  (api-request "GET" (str "/sessions/" session-id "/messages")))

(defn delete-session [session-id]
  (api-request "DELETE" (str "/sessions/" session-id)))

(defn delete-message [session-id message-id]
  (api-request "DELETE" (str "/sessions/" session-id "/messages/" message-id)))