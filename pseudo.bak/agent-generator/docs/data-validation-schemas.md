# Data Validation Schemas

## Overview

The data validation system provides comprehensive schema-based validation for all data collected by the agent generation system. This ensures data consistency, type safety, and reliability across different data sources.

## Schema Architecture

### Base Schema Types

The validation system is built on a set of base schema types that can be composed to create complex validation rules:

```clojure
;; Base Types
{:type :string}     ; String validation
{:type :number}     ; Number validation
{:type :boolean}    ; Boolean validation
{:type :array}      ; Array validation
{:type :object}     ; Object validation
{:type :uuid}       ; UUID string validation
```

### Schema Composition

Schemas can be composed and extended:

```clojure
;; String with constraints
{:type :string
 :required true
 :min-length 1
 :max-length 100
 :pattern #"[a-zA-Z0-9_-]+"}

;; Array with item validation
{:type :array
 :required true
 :min-items 0
 :max-items 100
 :item-schema {:type :string :min-length 1}}

;; Object with property validation
{:type :object
 :required true
 :properties {:name {:type :string :required true}
              :age {:type :number :min 0 :max 150}}
 :additional-properties false}
```

## Data Source Schemas

### Environment Data Schema

```clojure
(def environment-schema
  {:type :object
   :required true
   :properties {:agent-name {:type :string :required false}
                :environment {:type :string :required false}
                :debug-level {:type :string :required false}
                :node-env {:type :string :required false}
                :collection-method {:type :string :required true}
                :timestamp {:type :number :required true}}
   :additional-properties true})
```

#### Validation Rules

- **agent-name**: Optional string, any content
- **environment**: Optional string, any content
- **debug-level**: Optional string, any content
- **node-env**: Optional string, any content
- **collection-method**: Required string, must be present
- **timestamp**: Required number, Unix timestamp
- **additional-properties**: Allows custom environment variables

#### Examples

```clojure
;; Valid data
{:agent-name "test-agent"
 :environment "development"
 :debug-level "info"
 :node-env "test"
 :collection-method "environment-variables"
 :timestamp 1234567890
 :custom-var "custom-value"}

;; Invalid data (missing required fields)
{:agent-name "test-agent"
 :environment "development"}
;; Error: Required fields missing: collection-method, timestamp
```

### Kanban Data Schema

```clojure
(def kanban-schema
  {:type :object
   :required true
   :properties {:tasks {:type :array :required false}
                :columns {:type :array :required false}
                :wip-limits {:type :object :required false}
                :collection-method {:type :string :required true}
                :command {:type :string :required false}
                :timestamp {:type :number :required true}}
   :additional-properties true})
```

#### Validation Rules

- **tasks**: Optional array of task objects
- **columns**: Optional array of column names (strings)
- **wip-limits**: Optional object mapping column names to limits
- **collection-method**: Required string, collection method identifier
- **command**: Optional string, command that was executed
- **timestamp**: Required number, Unix timestamp
- **additional-properties**: Allows additional kanban data

#### Examples

```clojure
;; Valid data
{:tasks [{:uuid "123" :title "Test Task" :status "ready"}]
 :columns ["incoming" "ready" "in_progress" "done"]
 :wip-limits {"incoming" 100 "ready" 75 "in_progress" 50}
 :collection-method "kanban-cli"
 :command "pnpm kanban list --json"
 :timestamp 1234567890}

;; Valid minimal data (fallback)
{:tasks []
 :columns ["incoming" "ready" "in_progress" "done"]
 :wip-limits {"incoming" 100 "ready" 75 "in_progress" 50 "done" 100}
 :collection-method "fallback"
 :timestamp 1234567890}
```

### File Index Data Schema

```clojure
(def file-index-schema
  {:type :object
   :required true
   :properties {:packages {:type :array :required false}
                :tools {:type :array :required false}
                :configs {:type :object :required false}
                :collection-method {:type :string :required true}
                :base-path {:type :string :required false}
                :timestamp {:type :number :required true}}
   :additional-properties true})
```

#### Validation Rules

- **packages**: Optional array of package information objects
- **tools**: Optional array of tool information objects
- **configs**: Optional object with configuration data
- **collection-method**: Required string, collection method identifier
- **base-path**: Optional string, base directory path
- **timestamp**: Required number, Unix timestamp
- **additional-properties**: Allows additional file system data

#### Examples

```clojure
;; Valid data
{:packages [{:name "agent-generator" :path "./packages/agent-generator"}]
 :tools ["clojure" "node" "pnpm"]
 :configs {:build "debug" :env "test"}
 :collection-method "file-system-scan"
 :base-path "."
 :timestamp 1234567890}

;; Valid minimal data (fallback)
{:packages []
 :tools []
 :configs {}
 :collection-method "fallback"
 :timestamp 1234567890}
```

### Collection Result Schema

```clojure
(def collection-result-schema
  {:type :object
   :required true
   :properties {:success {:type :boolean :required true}
                :data {:type :object :required true}
                :source {:type :string :required false}
                :error {:type :object :required false}
                :fallback {:type :object :required false}
                :timestamp {:type :number :required true}}
   :additional-properties false})
```

#### Validation Rules

- **success**: Required boolean, collection success status
- **data**: Required object, collected data (validated against source-specific schema)
- **source**: Optional string, collector identifier
- **error**: Optional object, error information (present when success=false)
- **fallback**: Optional object, fallback data (present when success=false)
- **timestamp**: Required number, Unix timestamp
- **additional-properties**: False, strict validation

#### Examples

```clojure
;; Successful collection
{:success true
 :data {:agent-name "test" :collection-method "env" :timestamp 123}
 :source "environment"
 :timestamp 1234567890}

;; Failed collection with fallback
{:success false
 :data {}
 :error {:message "Command not found" :type java.io.IOException}
 :fallback {:agent-name "default" :collection-method "fallback"}
 :source "kanban"
 :timestamp 1234567890}
```

## Validation Functions

### Core Validation API

```clojure
;; Validate data against schema
(validate-data data schema)
;; => {:valid true :errors [] :data data}

;; Validate with options
(validate-data data schema {:strict false})
;; => {:valid true :errors [] :data data}

;; Validate specific data types
(validate-environment-data data)
(validate-kanban-data data)
(validate-file-index-data data)
(validate-collection-result data)
```

### Validation Result Format

```clojure
{:valid true/false          ; Validation success
 :errors ["error1" "error2"] ; Error messages
 :data {...}                ; Original/sanitized data
 :details {...}}            ; Detailed validation info
```

### Error Reporting

```clojure
;; Format validation errors for display
(format-validation-errors ["Error 1" "Error 2"])
;; => ["1. Error 1" "2. Error 2"]

;; Create detailed validation report
(create-validation-report data schema {})
;; => {:valid false
;;     :error-count 2
;;     :errors ["1. Required field missing" "2. Invalid type"]
;;     :data-size 5
;;     :schema-type :object
;;     :timestamp 1234567890}
```

## Data Sanitization

### Sanitization Rules

The validation system includes data sanitization to ensure data consistency:

```clojure
;; String sanitization
(sanitize-string "  trimmed  " {:max-length 10})
;; => "trimmed"

;; Number sanitization
(sanitize-number 150 {:min 0 :max 100})
;; => 100

;; Array sanitization
(sanitize-array ["a" "b" "c" "d"] {:max-items 3})
;; => ["a" "b" "c"]

;; Object sanitization
(sanitize-object {:name "John" :age -5 :extra "value"}
                 {:properties {:name {:type :string}
                               :age {:type :number :min 0}}
                  :additional-properties false})
;; => {"name" "John" "age" 0}
```

### Sanitization Configuration

```clojure
;; Enable/disable sanitization
(validate-data data schema {:sanitize true})

;; Custom sanitization rules
(def custom-schema
  {:type :string
   :required true
   :sanitize-fn #(str/lower-case (str/trim %))})
```

## Schema Utilities

### Schema Creation Helpers

```clojure
;; Create property schema
(create-property-schema :string :required false :max-length 100)
;; => {:type :string :required false :max-length 100}

;; Create array schema
(create-array-schema {:type :string} :min-items 1 :max-items 10)
;; => {:type :array :required true :min-items 1 :max-items 10
;;     :item-schema {:type :string}}

;; Create object schema
(create-object-schema {:name {:type :string}} :additional-properties false)
;; => {:type :object :required true
;;     :properties {:name {:type :string}}
;;     :additional-properties false}
```

### Schema Composition

```clojure
;; Merge schemas
(merge-schemas base-schema additional-schema)

;; Extend base schema
(def extended-schema
  (merge base-schema
         {:properties (merge (:properties base-schema)
                            {:new-field {:type :string}})}))
```

## Advanced Validation

### Conditional Validation

```clojure
;; Conditional required fields
(def conditional-schema
  {:type :object
   :properties {:type {:type :string}
                :config {:type :object :required false}}
   :validation-fn (fn [data]
                    (when (= "database" (:type data))
                      {:valid (contains? data :config)
                       :errors (if (contains? data :config)
                                 []
                                 ["Database type requires config"])}))})
```

### Custom Validation Functions

```clojure
;; Custom validation logic
(def custom-validator
  {:type :string
   :required true
   :validation-fn (fn [value]
                    (if (re-matches #"^[A-Z][a-z]+$" value)
                      {:valid true :errors []}
                      {:valid false
                       :errors ["Must start with uppercase and contain only letters"]}))})
```

### Cross-Field Validation

```clojure
;; Validate relationships between fields
(def cross-field-schema
  {:type :object
   :properties {:start-date {:type :number}
                :end-date {:type :number}}
   :validation-fn (fn [data]
                    (let [start (:start-date data)
                          end (:end-date data)]
                      (if (and start end (> start end))
                        {:valid false
                         :errors ["Start date must be before end date"]}
                        {:valid true :errors []})))})
```

## Performance Considerations

### Validation Performance

```clojure
;; Cached validation results
(def cached-validator (memoize validate-data))

;; Batch validation
(defn validate-batch [data-list schema]
  (mapv #(validate-data % schema) data-list))

;; Parallel validation
(defn validate-parallel [data-list schema]
  (->> data-list
       (map #(future (validate-data % schema)))
       (mapv deref)))
```

### Schema Optimization

```clojure
;; Pre-compiled schemas
(def compiled-schema (compile-schema schema))

;; Optimized validation for large datasets
(defn validate-large-dataset [data schema]
  (let [compiled (compile-schema schema)]
    (transduce
      (map #(validate-data-compiled % compiled))
      conj
      []
      data)))
```

## Testing Validation

### Unit Test Examples

```clojure
(deftest test-environment-validation
  (testing "Valid environment data"
    (let [data {:agent-name "test"
                :collection-method "env"
                :timestamp 123}
          result (validation/validate-environment-data data)]
      (is (true? (:valid result)))
      (is (empty? (:errors result)))))

  (testing "Invalid environment data"
    (let [data {:agent-name "test"}  ; Missing required fields
          result (validation/validate-environment-data data)]
      (is (false? (:valid result)))
      (is (not (empty? (:errors result)))))))

(deftest test-sanitization
  (testing "String sanitization"
    (let [schema {:type :string :max-length 5}
          result (validation/sanitize-string "too long" schema)]
      (is (= "too l" result))))

  (testing "Number sanitization"
    (let [schema {:type :number :min 0 :max 100}
          result (validation/sanitize-number 150 schema)]
      (is (= 100 result)))))
```

### Integration Test Examples

```clojure
(deftest test-complete-context-validation
  (testing "Complete agent context validation"
    (let [context {:success true
                   :data {:environment {...}
                          :kanban {...}
                          :file-index {...}}
                   :timestamp 123}
          result (validation/validate-agent-context context)]
      (is (true? (:valid result)))
      (is (contains? result :details)))))
```

## Error Handling

### Validation Error Types

```clojure
;; Type errors
{:type :type-error
 :message "Expected string, got number"
 :field "agent-name"
 :expected :string
 :actual 123}

;; Required field errors
{:type :required-error
 :message "Required field missing"
 :field "collection-method"}

;; Constraint errors
{:type :constraint-error
 :message "String too long"
 :field "agent-name"
 :constraint :max-length
 :value "very long string"
 :limit 100}
```

### Error Recovery

```clojure
;; Attempt to fix validation errors
(defn fix-validation-errors [data schema errors]
  (reduce (fn [acc error]
            (case (:type error)
              :required-error (assoc acc (:field error) (get-default-value (:field error)))
              :type-error (assoc acc (:field error) (convert-type (:actual error) (:expected error)))
              acc))
          data
          errors))

;; Validate with auto-fix
(defn validate-with-fix [data schema]
  (let [result (validate-data data schema)]
    (if (:valid result)
      result
      (let [fixed-data (fix-validation-errors data schema (:errors result))
            fixed-result (validate-data fixed-data schema)]
        (assoc fixed-result :original-data data :fixed-data fixed-data)))))
```

## Best Practices

### Schema Design

1. **Be Specific**: Use specific types and constraints
2. **Provide Defaults**: Include default values where appropriate
3. **Document Constraints**: Add descriptions for complex rules
4. **Version Schemas**: Include version information for compatibility

### Validation Strategy

1. **Validate Early**: Validate data as soon as it's collected
2. **Validate Completely**: Check all constraints, not just first failure
3. **Provide Context**: Include field names and values in error messages
4. **Allow Recovery**: Provide ways to fix or work around validation errors

### Performance Optimization

1. **Cache Compiled Schemas**: Pre-compile schemas for repeated use
2. **Batch Validation**: Validate multiple items together
3. **Parallel Processing**: Use parallel validation for independent data
4. **Selective Validation**: Only validate what's necessary for the context

## Configuration

### Global Validation Configuration

```clojure
{:validation {:strict true              ; Enable strict validation
              :sanitize true           ; Enable data sanitization
              :cache-schemas true       ; Cache compiled schemas
              :parallel-validation true ; Enable parallel processing
              :error-reporting :detailed ; Error reporting level}}
```

### Collector-Specific Validation

```clojure
{:collectors {:environment {:validation {:strict false}}
              :kanban {:validation {:sanitize false}}
              :file-index {:validation {:strict true}}}}
```

This comprehensive validation system ensures data quality and consistency across the agent generation pipeline, providing reliable data for downstream processing.
