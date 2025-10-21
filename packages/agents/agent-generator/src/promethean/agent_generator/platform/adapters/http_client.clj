(ns promethean.agent-generator.platform.adapters.http-client
  "HTTP client functionality adapter for SCI compatibility")

(defn mock-http-get [url]
  "Mock HTTP GET response"
  {:status 200
   :body (str "Mock response for " url)
   :headers {"content-type" "text/plain"}})

(defn mock-http-post [url body]
  "Mock HTTP POST response"
  {:status 201
   :body (str "Mock POST response for " url " with body: " body)
   :headers {"content-type" "application/json"}})

(defn get-request [url & {:keys [headers timeout]}]
  "Make HTTP GET request"
  (try
    (mock-http-get url)
    (catch Exception _
      {:status 500
       :body "Internal Server Error"
       :headers {}})))

(defn post-request [url body & {:keys [headers timeout]}]
  "Make HTTP POST request"
  (try
    (mock-http-post url body)
    (catch Exception _
      {:status 500
       :body "Internal Server Error"
       :headers {}})))

(defn put-request [url body & {:keys [headers timeout]}]
  "Make HTTP PUT request"
  (try
    {:status 200
     :body (str "Mock PUT response for " url)
     :headers {"content-type" "application/json"}}
    (catch Exception _
      {:status 500
       :body "Internal Server Error"
       :headers {}})))

(defn delete-request [url & {:keys [headers timeout]}]
  "Make HTTP DELETE request"
  (try
    {:status 204
     :body ""
     :headers {}}
    (catch Exception _
      {:status 500
       :body "Internal Server Error"
       :headers {}})))

;; Main adapter function that features expect
(defn http-client [base-url]
  "HTTP client adapter function"
  (fn [operation & args]
    (case operation
      :get (apply get-request args)
      :post (apply post-request args)
      :put (apply put-request args)
      :delete (apply delete-request args)
      nil)))