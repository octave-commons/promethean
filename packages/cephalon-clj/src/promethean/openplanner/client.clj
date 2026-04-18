(ns promethean.openplanner.client
  (:require [cheshire.core :as json]
            [clj-http.client :as http]
            [clojure.string :as str]))

(def ^:private default-openplanner-url "http://127.0.0.1:7777")

(defn- trim-trailing-slash [s]
  (str/replace (or s "") #"/+$" ""))

(defn config-from-env []
  {:url (or (System/getenv "OPENPLANNER_URL") default-openplanner-url)
   :api-key (System/getenv "OPENPLANNER_API_KEY")})

(defn- auth-headers [api-key]
  (cond-> {"Content-Type" "application/json"}
    (seq api-key) (assoc "Authorization" (str "Bearer " api-key))))

(defn post-events!
  [{:keys [url api-key]} events]
  (let [req-url (str (trim-trailing-slash (or url default-openplanner-url)) "/v1/events")
        resp (http/post req-url
                        {:throw-exceptions false
                         :headers (auth-headers api-key)
                         :body (json/generate-string {:events events})})
        status (:status resp)]
    (if (<= 200 (long status) 299)
      resp
      (throw (ex-info (str "OpenPlanner request failed: " status)
                      {:status status
                       :body (:body resp)
                       :url req-url})))))
