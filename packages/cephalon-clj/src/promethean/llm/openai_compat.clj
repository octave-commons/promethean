(ns promethean.llm.openai-compat
  (:require [clj-http.client :as http]
            [cheshire.core :as json]))

(defn env [k] (System/getenv k))
(defn base-url [cfg] (or (:base-url cfg) (env "OPENAI_BASE_URL") "https://api.openai.com/v1"))
(defn api-key [cfg] (or (:api-key cfg) (env "OPENAI_API_KEY") (env "OPENAI_KEY")))

(defn headers [cfg]
  (let [k (api-key cfg)]
    (cond-> {"Content-Type" "application/json"}
      k (assoc "Authorization" (str "Bearer " k)))))

(defn post-json [cfg path body]
  (let [url (str (base-url cfg) path)
        resp (http/post url {:headers (headers cfg)
                             :socket-timeout 60000
                             :connection-timeout 15000
                             :as :text
                             :body (json/generate-string body)})]
    (json/parse-string (:body resp) true)))

(defn chat-completions [cfg {:keys [model messages temperature max-tokens tools tool-choice]}]
  (post-json cfg "/chat/completions"
             (cond-> {:model model :messages messages}
               temperature (assoc :temperature temperature)
               max-tokens (assoc :max_tokens max-tokens)
               tools (assoc :tools tools)
               tool-choice (assoc :tool_choice tool-choice))))

(defn embeddings [cfg {:keys [model input]}]
  (post-json cfg "/embeddings" {:model model :input input}))

(defn first-message-text [chat-resp]
  (or (get-in chat-resp [:choices 0 :message :content])
      (get-in chat-resp [:choices 0 :delta :content])
      (get-in chat-resp [:choices 0 :text])
      ""))

(defn first-tool-calls [chat-resp]
  (or (get-in chat-resp [:choices 0 :message :tool_calls]) []))

(defn first-embedding [emb-resp]
  (or (get-in emb-resp [:data 0 :embedding]) []))
