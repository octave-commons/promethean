(ns app.opencode.client
  (:require ["@opencode-ai/sdk" :as opencode]))

(defn create-client
  "Create an opencode client with optional config"
  [config]
  (let [config (clj->js (or config {}))]
    (-> (opencode/createOpencode config)
        (.then (fn [result]
                 (.-client result))))))

(defn list-sessions
  "List all sessions"
  [client]
  (-> (.session client)
      (.list)))

(defn create-session
  "Create a new session"
  [client session-data]
  (-> (.session client)
      (.create #js {:body (clj->js session-data)})))

(defn delete-session
  "Delete a session by ID"
  [client session-id]
  (-> (.session client)
      (.delete #js {:path #js {:id session-id}})))

(defn get-session
  "Get a session by ID"
  [client session-id]
  (-> (.session client)
      (.get #js {:path #js {:id session-id}})))

(defn send-prompt
  "Send a prompt to a session"
  [client session-id prompt-text]
  (-> (.session client)
      (.prompt #js {:path #js {:id session-id}
                   :body #js {:parts [#js {:type "text" :text prompt-text}]}})))

(defn get-session-messages
  "Get messages for a session"
  [client session-id]
  (-> (.session client)
      (.messages #js {:path #js {:id session-id}})))