(ns promethean.agent-generator.collectors.environment
  "Environment variable data collector"
  (:require [promethean.agent-generator.collectors.protocol :as protocol]
            [promethean.agent-generator.platform.features :as features]
            [clojure.string :as str]))

(defrecord EnvironmentCollector [config]
  protocol/Collector
  (collect! [this config]
    (let [env-config (merge (:environment config) config)
          variables (or (:variables env-config) 
                       (:environment-variables config)
                       ["AGENT_NAME" "ENVIRONMENT" "DEBUG_LEVEL" "OLLAMA_URL" "GITHUB_TOKEN"])]
      (collect-environment-data variables env-config)))

  (available? [this]
    true) ; Environment variables always available

  (validate [this data]
    (and (map? data)
         (contains? data :variables)
         (every? string? (keys (:variables data)))))

  (collector-name [this] "environment")
  (collector-priority [this] 5)) ; High priority - always available

(defn collect-environment-data [variables config]
  "Collect environment variable data"
  (try
    (let [env-vars (get-environment-variables)
          filtered-vars (select-keys env-vars (map keyword variables))
          processed-vars (process-variables filtered-vars config)]
      (protocol/success-result 
        {:variables processed-vars
         :all-variables env-vars
         :statistics {:requested-count (count variables)
                      :found-count (count processed-vars)
                      :total-count (count env-vars)}
         :metadata {:timestamp (java.time.Instant/now)
                    :platform (features/detection/current-platform)}}
        {:source :environment
         :variables variables}))
    (catch Exception e
      (protocol/error-result [(str "Environment collection failed: " (.getMessage e))]))))

(defn get-environment-variables []
  "Get all environment variables as keyword keys"
  (let [env (System/getenv)]
    (reduce-kv (fn [m k v] (assoc m (keyword k) v)) {} env)))

(defn process-variables [variables config]
  "Process and transform environment variables"
  (reduce-kv 
    (fn [processed key value]
      (let [processed-value (process-variable-value key value config)]
        (assoc processed key processed-value)))
    {}
    variables))

(defn process-variable-value [key value config]
  "Process individual environment variable value"
  (let [processed {:raw value
                   :value value
                   :type (detect-variable-type value)
                   :sensitive? (sensitive-variable? key value)}]
    (if (:include-metadata config)
      processed
      (:value processed))))

(defn detect-variable-type [value]
  "Detect the type of environment variable value"
  (cond
    (nil? value) :nil
    (str/blank? value) :empty
    (str/includes? value "http") :url
    (str/includes? value "://") :url
    (re-matches #"\d+" value) :integer
    (re-matches #"\d+\.\d+" value) :float
    (str/starts-with? value "[") :json-array
    (str/starts-with? value "{") :json-object
    (str/includes? value ",") :comma-separated
    (str/starts-with? value "true") :boolean
    (str/starts-with? value "false") :boolean
    :else :string))

(defn sensitive-variable? [key value]
  "Check if variable contains sensitive information"
  (let [key-str (str/lower-case (name key))
        value-str (str/lower-case value)]
    (or (str/includes? key-str "token")
        (str/includes? key-str "secret")
        (str/includes? key-str "password")
        (str/includes? key-str "key")
        (str/includes? key-str "auth")
        (and (str/includes? key-str "url")
             (or (str/includes? value-str "token")
                 (str/includes? value-str "secret")
                 (str/includes? value-str "key")))
        (> (count value) 100) ; Long values might be sensitive
        (re-matches #"[A-Za-z0-9+/]{20,}={0,2}" value)))) ; Base64 encoded

(defn create-environment-collector [config]
  "Create environment collector instance"
  (->EnvironmentCollector config))