(ns promethean.agent-generator.collectors.protocol
  "Protocol definitions for data collectors")

(defprotocol Collector
  "Protocol for data collection from various sources"
  (collect! [this config] "Collect data from source")
  (available? [this] "Check if collector is available")
  (validate [this data] "Validate collected data")
  (collector-name [this] "Get collector name")
  (collector-priority [this] "Get collection priority (lower number = higher priority)"))

(defprotocol AsyncCollector
  "Protocol for asynchronous data collection"
  (collect-async! [this config callback] "Collect data asynchronously")
  (cancel! [this] "Cancel ongoing collection"))

(defrecord CollectionResult [success data errors metadata]
  "Result of data collection operation"
  clojure.lang.ILookup
  (val [this k] (get this k))
  (val [this k not-found] (get this k not-found)))

(defn success-result [data & [metadata]]
  "Create successful collection result"
  ->CollectionResult [true data nil metadata])

(defn error-result [errors & [metadata]]
  "Create error collection result"
  ->CollectionResult [false nil errors metadata))

(defn merge-results [results]
  "Merge multiple collection results"
  (let [successes (filter :success results)
        errors (remove :success results)]
    (if (empty? errors)
      (success-result (reduce merge (map :data successes))
                      {:merged-count (count successes)})
      (error-result (mapcat :errors errors)
                   {:success-count (count successes)
                    :error-count (count errors)}))))

(defprotocol CollectorRegistry
  "Protocol for collector registry management"
  (register-collector! [this collector] "Register a collector")
  (unregister-collector! [this collector-name] "Unregister a collector")
  (get-collector [this collector-name] "Get collector by name")
  (list-collectors [this] "List all registered collectors")
  (get-available-collectors [this] "Get list of available collectors"))

(defn collector-available? [collector]
  "Check if collector is available"
  (and (satisfies? Collector collector)
       (available? collector)))

(defn safe-collect [collector config]
  "Safely collect data with error handling"
  (try
    (if (collector-available? collector)
      (let [data (collect! collector config)]
        (if (validate collector data)
          (success-result data {:collector (collector-name collector)})
          (error-result [(str "Validation failed for collector " (collector-name collector))])))
      (error-result [(str "Collector " (collector-name collector) " not available")]))
    (catch Exception e
      (error-result [(str "Collection failed for " (collector-name collector) ": " (.getMessage e))]))))

(defn sort-collectors-by-priority [collectors]
  "Sort collectors by priority"
  (sort-by collector-priority collectors))