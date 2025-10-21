(ns promethean.agent-generator.validation-test
  "Tests for data validation functionality"
  
  (:require [clojure.test :refer [deftest testing is]]
            [promethean.agent-generator.validation :as validation]))

;; ============================================================================
;; Type Validation Tests
;; ============================================================================

(deftest test-validate-type
  (testing "Type validation works correctly"
    (is (true? (validation/validate-type "hello" :string)))
    (is (true? (validation/validate-type 42 :number)))
    (is (true? (validation/validate-type true :boolean)))
    (is (true? (validation/validate-type [1 2 3] :array)))
    (is (true? (validation/validate-type {:a 1} :object)))
    
    (is (false? (validation/validate-type 42 :string)))
    (is (false? (validation/validate-type "hello" :number)))
    (is (false? (validation/validate-type [1 2 3] :object)))))

(deftest test-validate-uuid
  (testing "UUID validation works correctly"
    (is (true? (validation/validate-type "123e4567-e89b-12d3-a456-426614174000" :uuid)))
    (is (false? (validation/validate-type "invalid-uuid" :uuid)))
    (is (false? (validation/validate-type 123 :uuid)))))

;; ============================================================================
;; String Validation Tests
;; ============================================================================

(deftest test-validate-string-basic
  (testing "Basic string validation"
    (let [schema {:type :string :required true}]
      (is (empty? (validation/validate-string "hello" schema)))
      (is (not (empty? (validation/validate-string 42 schema)))))))

(deftest test-validate-string-length
  (testing "String length validation"
    (let [schema {:type :string :required true :min-length 3 :max-length 10}]
      (is (empty? (validation/validate-string "hello" schema)))
      (is (not (empty? (validation/validate-string "hi" schema)))) ; too short
      (is (not (empty? (validation/validate-string "this is too long" schema))))))) ; too long

(deftest test-validate-string-pattern
  (testing "String pattern validation"
    (let [schema {:type :string :required true :pattern #"[a-z]+"}]
      (is (empty? (validation/validate-string "hello" schema)))
      (is (not (empty? (validation/validate-string "Hello123" schema))))))) ; doesn't match

;; ============================================================================
;; Number Validation Tests
;; ============================================================================

(deftest test-validate-number-basic
  (testing "Basic number validation"
    (let [schema {:type :number :required true}]
      (is (empty? (validation/validate-number 42 schema)))
      (is (not (empty? (validation/validate-number "42" schema)))))))

(deftest test-validate-number-range
  (testing "Number range validation"
    (let [schema {:type :number :required true :min 0 :max 100}]
      (is (empty? (validation/validate-number 50 schema)))
      (is (not (empty? (validation/validate-number -5 schema)))) ; too small
      (is (not (empty? (validation/validate-number 150 schema))))))) ; too large

;; ============================================================================
;; Array Validation Tests
;; ============================================================================

(deftest test-validate-array-basic
  (testing "Basic array validation"
    (let [schema {:type :array :required true}]
      (is (empty? (validation/validate-array [1 2 3] schema)))
      (is (not (empty? (validation/validate-array "not-array" schema)))))))

(deftest test-validate-array-size
  (testing "Array size validation"
    (let [schema {:type :array :required true :min-items 2 :max-items 5}]
      (is (empty? (validation/validate-array [1 2 3] schema)))
      (is (not (empty? (validation/validate-array [1] schema)))) ; too few items
      (is (not (empty? (validation/validate-array [1 2 3 4 5 6] schema))))))) ; too many items

(deftest test-validate-array-items
  (testing "Array item validation"
    (let [item-schema {:type :string :required true}
          schema {:type :array :required true :item-schema item-schema}]
      (is (empty? (validation/validate-array ["a" "b" "c"] schema)))
      (is (not (empty? (validation/validate-array ["a" 42 "c"] schema))))))) ; invalid item

;; ============================================================================
;; Object Validation Tests
;; ============================================================================

(deftest test-validate-object-basic
  (testing "Basic object validation"
    (let [schema {:type :object :required true}]
      (is (empty? (validation/validate-object {:a 1} schema)))
      (is (not (empty? (validation/validate-object "not-object" schema)))))))

(deftest test-validate-object-properties
  (testing "Object property validation"
    (let [properties {:name {:type :string :required true}
                      :age {:type :number :required false}}
          schema {:type :object :required true :properties properties}]
      (is (empty? (validation/validate-object {:name "John" :age 30} schema)))
      (is (not (empty? (validation/validate-object {:age 30} schema))))))) ; missing required property

(deftest test-validate-object-additional-properties
  (testing "Object additional properties validation"
    (let [properties {:name {:type :string :required true}}
          schema {:type :object :required true :properties properties :additional-properties false}]
      (is (empty? (validation/validate-object {:name "John"} schema)))
      (is (not (empty? (validation/validate-object {:name "John" :extra "value"} schema))))))) ; extra property not allowed

;; ============================================================================
;; Schema Validation Tests
;; ============================================================================

(deftest test-validate-data-basic
  (testing "Basic data validation"
    (let [schema {:type :string :required true}]
      (let [result (validation/validate-data "hello" schema)]
        (is (true? (:valid result)))
        (is (empty? (:errors result))))
      
      (let [result (validation/validate-data 42 schema)]
        (is (false? (:valid result)))
        (is (not (empty? (:errors result))))))))

(deftest test-validate-data-with-options
  (testing "Data validation with options"
    (let [schema {:type :object :required true}
          options {:strict false}]
      (let [result (validation/validate-data {:a 1} schema options)]
        (is (true? (:valid result)))))))

;; ============================================================================
;; Environment Data Validation Tests
;; ============================================================================

(deftest test-validate-environment-data-valid
  (testing "Valid environment data passes validation"
    (let [data {:agent-name "test-agent"
                :environment "development"
                :debug-level "info"
                :collection-method "environment-variables"
                :timestamp 1234567890}
          result (validation/validate-environment-data data)]
      (is (true? (:valid result)))
      (is (empty? (:errors result))))))

(deftest test-validate-environment-data-invalid
  (testing "Invalid environment data fails validation"
    (let [data {:agent-name 123 ; should be string
                :collection-method "environment-variables"
                :timestamp 1234567890}
          result (validation/validate-environment-data data)]
      (is (false? (:valid result)))
      (is (not (empty? (:errors result)))))))

(deftest test-validate-environment-data-missing-required
  (testing "Environment data missing required fields fails validation"
    (let [data {:agent-name "test-agent"} ; missing collection-method and timestamp
          result (validation/validate-environment-data data)]
      (is (false? (:valid result)))
      (is (not (empty? (:errors result)))))))

;; ============================================================================
;; Kanban Data Validation Tests
;; ============================================================================

(deftest test-validate-kanban-data-valid
  (testing "Valid kanban data passes validation"
    (let [data {:tasks [{:uuid "123" :title "Test Task"}]
                :columns ["todo" "doing" "done"]
                :wip-limits {"todo" 5 "doing" 3}
                :collection-method "kanban-cli"
                :timestamp 1234567890}
          result (validation/validate-kanban-data data)]
      (is (true? (:valid result)))
      (is (empty? (:errors result))))))

(deftest test-validate-kanban-data-minimal
  (testing "Minimal kanban data passes validation"
    (let [data {:collection-method "fallback"
                :timestamp 1234567890}
          result (validation/validate-kanban-data data)]
      (is (true? (:valid result)))
      (is (empty? (:errors result))))))

;; ============================================================================
;; File Index Data Validation Tests
;; ============================================================================

(deftest test-validate-file-index-data-valid
  (testing "Valid file index data passes validation"
    (let [data {:packages [{:name "test-package" :path "/test"}]
                :tools ["tool1" "tool2"]
                :configs {:key "value"}
                :collection-method "file-system-scan"
                :timestamp 1234567890}
          result (validation/validate-file-index-data data)]
      (is (true? (:valid result)))
      (is (empty? (:errors result))))))

;; ============================================================================
;; Collection Result Validation Tests
;; ============================================================================

(deftest test-validate-collection-result-success
  (testing "Successful collection result passes validation"
    (let [result {:success true
                  :data {:test "value"}
                  :source "test-collector"
                  :timestamp 1234567890}
          validation (validation/validate-collection-result result)]
      (is (true? (:valid validation)))
      (is (empty? (:errors validation))))))

(deftest test-validate-collection-result-failure
  (testing "Failed collection result passes validation"
    (let [result {:success false
                  :error {:error "Test error" :type "Exception"}
                  :fallback {:test "fallback"}
                  :source "test-collector"
                  :timestamp 1234567890}
          validation (validation/validate-collection-result result)]
      (is (true? (:valid validation)))
      (is (empty? (:errors validation))))))

;; ============================================================================
;; Data Sanitization Tests
;; ============================================================================

(deftest test-sanitize-string
  (testing "String sanitization works correctly"
    (let [schema {:type :string :max-length 10}
          result (validation/sanitize-string "this is too long" schema)]
      (is (= "this is t" result)))
    
    (let [schema {:type :string}
          result (validation/sanitize-string "  trimmed  " schema)]
      (is (= "trimmed" result)))))

(deftest test-sanitize-number
  (testing "Number sanitization works correctly"
    (let [schema {:type :number :min 0 :max 100}]
      (is (= 50 (validation/sanitize-number 50 schema)))
      (is (= 0 (validation/sanitize-number -10 schema))) ; clamped to min
      (is (= 100 (validation/sanitize-number 150 schema))))) ; clamped to max

(deftest test-sanitize-array
  (testing "Array sanitization works correctly"
    (let [item-schema {:type :string :max-length 5}
          schema {:type :array :max-items 3 :item-schema item-schema}]
      (is (= ["hello" "world"] (validation/sanitize-array ["hello" "world" "test"] schema)))
      (is (= ["hell" "world"] (validation/sanitize-array ["hello world" "world"] schema))))))

(deftest test-sanitize-object
  (testing "Object sanitization works correctly"
    (let [properties {:name {:type :string :max-length 5}
                      :age {:type :number :min 0}}
          schema {:type :object :properties properties :additional-properties false}]
      (let [result (validation/sanitize-object 
                    {:name "John Doe" :age -5 :extra "value"} 
                    schema)]
        (is (= {"name" "John" "age" 0} result))))))

;; ============================================================================
;; Agent Context Validation Tests
;; ============================================================================

(deftest test-validate-agent-context-valid
  (testing "Valid agent context passes validation"
    (let [context {:success true
                   :data {:environment {:agent-name "test" 
                                        :collection-method "env"
                                        :timestamp 123}
                           :kanban {:collection-method "fallback" 
                                    :timestamp 123}
                           :file-index {:collection-method "fallback" 
                                       :timestamp 123}}
                   :timestamp 1234567890}
          result (validation/validate-agent-context context)]
      (is (true? (:valid result)))
      (is (empty? (:errors result)))
      (is (contains? result :details)))))

(deftest test-validate-agent-context-partial
  (testing "Partial agent context validation"
    (let [context {:success true
                   :data {:environment {:agent-name "test" 
                                        :collection-method "env"
                                        :timestamp 123}
                           :kanban {:collection-method "fallback" 
                                    :timestamp 123}}
                   :timestamp 1234567890}
          result (validation/validate-agent-context context)]
      ;; Should still be valid with missing file-index
      (is (true? (:valid result))))))

;; ============================================================================
;; Error Reporting Tests
;; ============================================================================

(deftest test-format-validation-errors
  (testing "Validation errors are formatted correctly"
    (let [errors ["Error 1" "Error 2" "Error 3"]
          formatted (validation/format-validation-errors errors)]
      (is (= 3 (count formatted)))
      (is (= "1. Error 1" (first formatted)))
      (is (= "2. Error 2" (second formatted)))
      (is (= "3. Error 3" (nth formatted 2))))))

(deftest test-create-validation-report
  (testing "Validation report contains all required information"
    (let [data {:test "value"}
          schema {:type :object :required true}
          report (validation/create-validation-report data schema {})]
      (is (contains? report :valid))
      (is (contains? report :error-count))
      (is (contains? report :errors))
      (is (contains? report :data-size))
      (is (contains? report :schema-type))
      (is (contains? report :timestamp)))))

;; ============================================================================
;; Schema Utility Tests
;; ============================================================================

(deftest test-merge-schemas
  (testing "Schema merging works correctly"
    (let [schema1 {:type :string :required true}
          schema2 {:max-length 10}
          merged (validation/merge-schemas schema1 schema2)]
      (is (= :string (:type merged)))
      (is (true? (:required merged)))
      (is (= 10 (:max-length merged))))))

(deftest test-create-property-schema
  (testing "Property schema creation works correctly"
    (let [schema (validation/create-property-schema :string :required false :max-length 10)]
      (is (= :string (:type schema)))
      (is (false? (:required schema)))
      (is (= 10 (:max-length schema))))))

(deftest test-create-array-schema
  (testing "Array schema creation works correctly"
    (let [item-schema {:type :string}
          schema (validation/create-array-schema item-schema :min-items 1 :max-items 5)]
      (is (= :array (:type schema)))
      (is (= item-schema (:item-schema schema)))
      (is (= 1 (:min-items schema)))
      (is (= 5 (:max-items schema))))))

(deftest test-create-object-schema
  (testing "Object schema creation works correctly"
    (let [properties {:name {:type :string}}
          schema (validation/create-object-schema properties :additional-properties false)]
      (is (= :object (:type schema)))
      (is (= properties (:properties schema)))
      (is (false? (:additional-properties schema))))))

;; ============================================================================
;; Edge Cases
;; ============================================================================

(deftest test-validate-nil-data
  (testing "Nil data validation"
    (let [schema {:type :string :required false}
          result (validation/validate-data nil schema)]
      (is (true? (:valid result)))))
  
  (let [schema {:type :string :required true}
        result (validation/validate-data nil schema)]
    (is (false? (:valid result))))))

(deftest test-validate-empty-data
  (testing "Empty data validation"
    (let [schema {:type :object :required true}
          result (validation/validate-data {} schema)]
      (is (true? (:valid result))))))

(deftest test-sanitize-nil-data
  (testing "Nil data sanitization"
    (let [schema {:type :string}
          result (validation/sanitize-value nil schema)]
      (is (nil? result)))))