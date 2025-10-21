(ns db.core)

(defn create-http-client []
  (js/XMLHttpRequest.))

(defn api-request [method endpoint & [data]]
  (js/Promise.
   (fn [resolve reject]
     (let [xhr (create-http-client)]
       (.open xhr method (str "/api" endpoint) true)
       (.setRequestHeader xhr "Content-Type" "application/json")
       (.setRequestHeader xhr "Accept" "application/json")
       (.send xhr (when data (js/JSON.stringify (clj->js data))))

       (.addEventListener xhr "load"
                          (fn [e]
                            (let [status (.-status xhr)
                                  response (.-responseText xhr)]
                              (js/console.log "XHR Status:" status)
                              (js/console.log "XHR Response:" response)
                              (if (and (>= status 200) (< status 300))
                                (try
                                  (let [parsed-data (if (and response (not= response ""))
                                                      (js->clj (js/JSON.parse response) :keywordize-keys true)
                                                      [])]
                                    (js/console.log "Parsed data:" parsed-data)
                                    (resolve {:success true :data parsed-data}))
                                  (catch js/Error e
                                    (js/console.error "JSON parse error:" e)
                                    (resolve {:success false :error (str "JSON parse error: " (.-message e))})))
                                (resolve {:success false :error (str "HTTP " status ": " response)})))))

       (.addEventListener xhr "error"
                          (fn [e]
                            (js/console.error "XHR Network error:" e)
                            (resolve {:success false :error "Network error"})))))))

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