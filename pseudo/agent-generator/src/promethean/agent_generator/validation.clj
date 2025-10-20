(ns promethean.agent-generator.validation
  "Data validation and schema definitions for agent generation.
   
   This namespace provides comprehensive data validation capabilities
   including schema validation, type checking, and error reporting."
  
  (:require [clojure.string :as str]
            [clojure.walk :as walk]))

;; ============================================================================
;; Schema Definitions
;; ============================================================================

(def base-schemas
  "Base validation schemas for common data types"
  {:string {:type :string 
            :required true
            :min-length 0
            :max-length 1000}
   :number {:type :number
            :required true
            :min nil
            :max nil}
   :boolean {:type :boolean
             :required true}
   :array {:type :array
           :required true
           :min-items 0
           :max-items nil
           :item-schema nil}
   :object {:type :object
            :required true
            :properties {}
            :additional-properties true}
   :uuid {:type :string
          :required true
          :pattern #"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{8}$"}})

(def environment-schema
  "Schema for environment variables data"
  {:type :object
   :required true
   :properties {:agent-name (merge base-schemas :string {:required false})
                :environment (merge base-schemas :string {:required false})
                :debug-level (merge base-schemas :string {:required false})
                :node-env (merge base-schemas :string {:required false})
                :collection-method (merge base-schemas :string {:required true})
                :timestamp (merge base-schemas :number {:required true})}
   :additional-properties true})

(def kanban-schema
  "Schema for kanban board data"
  {:type :object
   :required true
   :properties {:tasks (merge base-schemas :array {:required false})
                :columns (merge base-schemas :array {:required false})
                :wip-limits (merge base-schemas :object {:required false})
                :collection-method (merge base-schemas :string {:required true})
                :command (merge base-schemas :string {:required false})
                :timestamp (merge base-schemas :number {:required true})}
   :additional-properties true})

(def file-index-schema
  "Schema for file index data"
  {:type :object
   :required true
   :properties {:packages (merge base-schemas :array {:required false})
                :tools (merge base-schemas :array {:required false})
                :configs (merge base-schemas :object {:required false})
                :collection-method (merge base-schemas :string {:required true})
                :base-path (merge base-schemas :string {:required false})
                :timestamp (merge base-schemas :number {:required true})}
   :additional-properties true})

(def collection-result-schema
  "Schema for individual collection results"
  {:type :object
   :required true
   :properties {:success (merge base-schemas :boolean {:required true})
                :data {:type :object :required true}
                :source (merge base-schemas :string {:required false})
                :error {:type :object :required false}
                :fallback {:type :object :required false}
                :timestamp (merge base-schemas :number {:required true})}
   :additional-properties false})

;; ============================================================================
;; Validation Functions
;; ============================================================================

(defn validate-type
  "Validate value against expected type"
  [value expected-type]
  (case expected-type
    :string (string? value)
    :number (number? value)
    :boolean (boolean? value)
    :array (or (vector? value) (list? value))
    :object (or (map? value) (record? value))
    :uuid (and (string? value) 
               (re-matches #"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{8}$" value))
    true)) ; Unknown type, assume valid

(defn validate-string
  "Validate string value against constraints"
  [value schema]
  (let [errors []]
    (cond-> errors
      (not (string? value)) (conj "Value must be a string")
      (:min-length schema) (as-> errors $
                            (if (< (count value) (:min-length schema))
                              (conj $ (str "String too short, minimum " (:min-length schema) " characters"))
                              $))
      (:max-length schema) (as-> errors $
                            (if (> (count value) (:max-length schema))
                              (conj $ (str "String too long, maximum " (:max-length schema) " characters"))
                              $))
      (:pattern schema) (as-> errors $
                          (if (not (re-matches (:pattern schema) value))
                            (conj $ "String does not match required pattern")
                            $)))))

(defn validate-number
  "Validate number value against constraints"
  [value schema]
  (let [errors []]
    (cond-> errors
      (not (number? value)) (conj "Value must be a number")
      (:min schema) (as-> errors $
                    (if (< value (:min schema))
                      (conj $ (str "Number too small, minimum " (:min schema)))
                      $))
      (:max schema) (as-> errors $
                    (if (> value (:max schema))
                      (conj $ (str "Number too large, maximum " (:max schema)))
                      $)))))

(defn validate-array
  "Validate array value against constraints"
  [value schema]
  (let [errors []]
    (cond-> errors
      (not (or (vector? value) (list? value))) (conj "Value must be an array")
      (:min-items schema) (as-> errors $
                        (if (< (count value) (:min-items schema))
                          (conj $ (str "Array too small, minimum " (:min-items schema) " items"))
                          $))
      (:max-items schema) (as-> errors $
                        (if (> (count value) (:max-items schema))
                          (conj $ (str "Array too large, maximum " (:max-items schema) " items"))
                          $))
      (:item-schema schema) (as-> errors $
                           (reduce-kv 
                            (fn [acc idx item]
                              (let [item-errors (validate-value item (:item-schema schema))]
                                (if (seq item-errors)
                                  (conj acc (str "Item " idx ": " (str/join ", " item-errors)))
                                  acc)))
                            $
                            value)))))

(defn validate-object
  "Validate object value against constraints"
  [value schema]
  (let [errors []]
    (cond-> errors
      (not (or (map? value) (record? value))) (conj "Value must be an object")
      (:properties schema) (as-> errors $
                          (reduce-kv 
                           (fn [acc prop-name prop-schema]
                             (let [prop-value (get value prop-name)
                                   prop-errors (if (and (:required prop-schema) (nil? prop-value))
                                                [(str "Required property '" prop-name "' is missing")]
                                                (when prop-value
                                                  (validate-value prop-value prop-schema)))]
                               (if (seq prop-errors)
                                 (conj acc (str prop-name ": " (str/join ", " prop-errors)))
                                 acc)))
                           $
                           (:properties schema)))
      (false (:additional-properties schema)) (as-> errors $
                                            (reduce-kv 
                                             (fn [acc prop-name _]
                                               (when (not (contains? (:properties schema) prop-name))
                                                 (conj acc (str "Additional property not allowed: " prop-name))))
                                             $
                                             value)))))

(defn validate-value
  "Validate a single value against a schema"
  [value schema]
  (let [expected-type (:type schema)]
    (cond
      (not (validate-type value expected-type))
      [(str "Expected type " expected-type ", got " (type value))]
      
      (= expected-type :string)
      (validate-string value schema)
      
      (= expected-type :number)
      (validate-number value schema)
      
      (= expected-type :array)
      (validate-array value schema)
      
      (= expected-type :object)
      (validate-object value schema)
      
      :else [])))

(defn validate-data
  "Validate data against a schema"
  ([data schema]
   (validate-data data schema {}))
  ([data schema options]
   (let [errors (validate-value data schema)
         strict? (:strict options true)]
     (if (seq errors)
       {:valid false :errors errors :data data}
       {:valid true :errors [] :data data}))))

(defn validate-collection-result
  "Validate a collection result"
  [result]
  (validate-data result collection-result-schema))

(defn validate-environment-data
  "Validate environment variables data"
  [data]
  (validate-data data environment-schema))

(defn validate-kanban-data
  "Validate kanban board data"
  [data]
  (validate-data data kanban-schema))

(defn validate-file-index-data
  "Validate file index data"
  [data]
  (validate-data data file-index-schema))

;; ============================================================================
;; Data Sanitization
;; ============================================================================

(defn sanitize-string
  "Sanitize string value"
  [value schema]
  (let [max-length (:max-length schema 1000)]
    (when (string? value)
      (-> value
          (str/trim)
          (subs 0 (min (count value) max-length))))))

(defn sanitize-number
  "Sanitize number value"
  [value schema]
  (when (number? value)
    (cond
      (:min schema) (max value (:min schema))
      (:max schema) (min value (:max schema))
      :else value)))

(defn sanitize-array
  "Sanitize array value"
  [value schema]
  (when (or (vector? value) (list? value))
    (let [max-items (:max-items schema)
          sanitized-items (when (:item-schema schema)
                            (map #(sanitize-value % (:item-schema schema)) value))]
      (cond-> (or sanitized-items value)
        max-items (take max-items)))))

(defn sanitize-object
  "Sanitize object value"
  [value schema]
  (when (or (map? value) (record? value))
    (reduce-kv 
     (fn [acc key val]
       (let [prop-schema (get-in schema [:properties key])]
         (if prop-schema
           (let [sanitized-val (sanitize-value val prop-schema)]
             (if (nil? sanitized-val)
               acc
               (assoc acc key sanitized-val)))
           (if (:additional-properties schema)
             (assoc acc key val)
             acc))))
     {}
     value)))

(defn sanitize-value
  "Sanitize a value according to schema"
  [value schema]
  (let [expected-type (:type schema)]
    (case expected-type
      :string (sanitize-string value schema)
      :number (sanitize-number value schema)
      :array (sanitize-array value schema)
      :object (sanitize-object value schema)
      value)))

(defn sanitize-data
  "Sanitize data according to schema"
  [data schema]
  (sanitize-value data schema))

;; ============================================================================
;; Error Reporting
;; ============================================================================

(defn format-validation-errors
  "Format validation errors for display"
  [errors]
  (map-indexed 
   (fn [idx error]
     (str (inc idx) ". " error))
   errors))

(defn create-validation-report
  "Create a detailed validation report"
  [data schema options]
  (let [result (validate-data data schema options)]
    {:valid (:valid result)
     :error-count (count (:errors result))
     :errors (format-validation-errors (:errors result))
     :data-size (when (map? data) (count data))
     :schema-type (:type schema)
     :timestamp (System/currentTimeMillis)}))

;; ============================================================================
;; Schema Utilities
;; ============================================================================

(defn merge-schemas
  "Merge multiple schemas with later schemas taking precedence"
  [& schemas]
  (reduce merge {} schemas))

(defn create-property-schema
  "Create a property schema with common options"
  [type & {:keys [required min-length max-length min max pattern]
           :or {required true}}]
  (cond-> {:type type :required required}
    min-length (assoc :min-length min-length)
    max-length (assoc :max-length max-length)
    min (assoc :min min)
    max (assoc :max max)
    pattern (assoc :pattern pattern)))

(defn create-array-schema
  "Create an array schema"
  [item-schema & {:keys [required min-items max-items]
                  :or {required true min-items 0}}]
  {:type :array
   :required required
   :min-items min-items
   :max-items max-items
   :item-schema item-schema})

(defn create-object-schema
  "Create an object schema"
  [properties & {:keys [required additional-properties]
                 :or {required true additional-properties true}}]
  {:type :object
   :required required
   :properties properties
   :additional-properties additional-properties})

;; ============================================================================
;; Public API
;; ============================================================================

(defn validate-agent-context
  "Validate complete agent context data"
  [context]
  (let [environment-valid (validate-environment-data (get-in context [:data :environment]))
        kanban-valid (validate-kanban-data (get-in context [:data :kanban]))
        file-index-valid (validate-file-index-data (get-in context [:data :file-index]))
        all-errors (concat (:errors environment-valid)
                          (:errors kanban-valid)
                          (:errors file-index-valid))]
    {:valid (and (:valid environment-valid) 
                 (:valid kanban-valid) 
                 (:valid file-index-valid))
     :errors all-errors
     :details {:environment environment-valid
               :kanban kanban-valid
               :file-index file-index-valid}}))

(defn sanitize-agent-context
  "Sanitize complete agent context data"
  [context]
  (update context :data 
          (fn [data]
            (cond-> data
              (:environment data) (update :environment sanitize-data environment-schema)
              (:kanban data) (update :kanban sanitize-data kanban-schema)
              (:file-index data) (update :file-index sanitize-data file-index-schema)))))