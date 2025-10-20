(ns promethean.agent-generator.data-collection-simple-test
  "Tests for simplified data collection functionality"
  
  (:require [clojure.test :refer [deftest testing is]]
            [promethean.agent-generator.data-collection-simple :as dc]))

;; ============================================================================
;; Environment Data Collection Tests
;; ============================================================================

(deftest test-collect-environment-data
  (testing "Environment data collection works"
    (let [result (dc/collect-environment-data {})]
      (is (contains? result :success))
      (is (contains? result :data))
      (is (contains? result :source))
      (is (contains? result :timestamp))
      (is (= "environment" (:source result)))
      
      (when (:success result)
        (let [data (:data result)]
          (is (contains? data :collection-method))
          (is (contains? data :timestamp))
          (is (= "environment-variables" (:collection-method data))))))))

(deftest test-collect-environment-data-custom-vars
  (testing "Environment data collection with custom variables"
    (let [config {:variables ["PATH"]}
          result (dc/collect-environment-data config)]
      (is (contains? result :success))
      (when (:success result)
        (let [data (:data result)]
          (is (contains? data :path)))))))

;; ============================================================================
;; Kanban Data Collection Tests
;; ============================================================================

(deftest test-collect-kanban-data
  (testing "Kanban data collection works"
    (let [result (dc/collect-kanban-data {})]
      (is (contains? result :success))
      (is (contains? result :data))
      (is (contains? result :source))
      (is (contains? result :timestamp))
      (is (= "kanban" (:source result)))
      
      (when (:success result)
        (let [data (:data result)]
          (is (contains? data :collection-method))
          (is (contains? data :timestamp))
          (is (= "kanban-cli" (:collection-method data))))))))

(deftest test-collect-kanban-data-fallback
  (testing "Kanban data collection provides fallback on error"
    ;; This test verifies that even when kanban command fails, we get fallback data
    (let [result (dc/collect-kanban-data {:kanban-command "nonexistent-command"})]
      (is (contains? result :success))
      (when (not (:success result))
        (is (contains? result :fallback))
        (let [fallback (:fallback result)]
          (is (contains? fallback :tasks))
          (is (contains? fallback :columns))
          (is (contains? fallback :wip-limits))
          (is (= "fallback" (:collection-method fallback))))))))

;; ============================================================================
;; File Index Data Collection Tests
;; ============================================================================

(deftest test-collect-file-index-data
  (testing "File index data collection works"
    (let [result (dc/collect-file-index-data {})]
      (is (contains? result :success))
      (is (contains? result :data))
      (is (contains? result :source))
      (is (contains? result :timestamp))
      (is (= "file-index" (:source result)))
      
      (when (:success result)
        (let [data (:data result)]
          (is (contains? data :collection-method))
          (is (contains? data :timestamp))
          (is (contains? data :packages))
          (is (contains? data :tools))
          (is (contains? data :configs))
          (is (= "file-system-scan" (:collection-method data))))))))

(deftest test-collect-file-index-data-custom-config
  (testing "File index data collection with custom configuration"
    (let [config {:base-path "." :scan-dirs ["src" "test"]}
          result (dc/collect-file-index-data config)]
      (is (contains? result :success))
      (when (:success result)
        (let [data (:data result)]
          (is (= "." (:base-path data)))
          (is (= ["src" "test"] (:scanned-dirs data))))))))

;; ============================================================================
;; Collection Manager Tests
;; ============================================================================

(deftest test-collect-all-data
  (testing "Collect all data from default sources"
    (let [result (dc/collect-all-data {})]
      (is (map? result))
      (is (contains? result :environment))
      (is (contains? result :kanban))
      (is (contains? result :file-index)))))

(deftest test-collect-all-data-selective
  (testing "Collect data from selective sources"
    (let [result (dc/collect-all-data {:collectors [:environment]})]
      (is (map? result))
      (is (contains? result :environment))
      (is (not (contains? result :kanban)))
      (is (not (contains? result :file-index))))))

(deftest test-collect-agent-context
  (testing "Collect complete agent context"
    (let [context (dc/collect-agent-context {})]
      (is (contains? context :success))
      (is (contains? context :data))
      (is (contains? context :timestamp))
      (is (contains? context :collectors))
      (is (true? (:success context)))
      
      (let [data (:data context)]
        (is (contains? data :environment))
        (is (contains? data :kanban))
        (is (contains? data :file-index))))))

;; ============================================================================
;; Utility Function Tests
;; ============================================================================

(deftest test-get-available-collectors
  (testing "Get available collectors"
    (let [collectors (dc/get-available-collectors)]
      (is (vector? collectors))
      (is (= 3 (count collectors)))
      (is (contains? (set collectors) :environment))
      (is (contains? (set collectors) :kanban))
      (is (contains? (set collectors) :file-index)))))

(deftest test-validate-collection-result
  (testing "Validate collection result"
    (let [valid-result {:success true :timestamp 123}
          invalid-result {:success false}
          result-with-fallback {:success false :error {} :fallback {} :timestamp 123}]
      
      (is (true? (dc/validate-collection-result valid-result)))
      (is (false? (dc/validate-collection-result invalid-result)))
      (is (true? (dc/validate-collection-result result-with-fallback))))))

;; ============================================================================
;; Integration Tests
;; ============================================================================

(deftest test-complete-workflow
  (testing "Complete data collection workflow"
    (let [context (dc/collect-agent-context {:collectors [:environment :file-index]})]
      (is (true? (:success context)))
      
      ;; Verify all requested collectors have results
      (let [data (:data context)]
        (is (contains? data :environment))
        (is (contains? data :file-index))
        (is (not (contains? data :kanban))) ; not requested
        
        ;; Verify each collector result is valid
        (is (true? (dc/validate-collection-result (:environment data))))
        (is (true? (dc/validate-collection-result (:file-index data))))))))

(deftest test-error-handling
  (testing "Error handling in data collection"
    ;; Test with invalid kanban command to trigger error handling
    (let [context (dc/collect-agent-context {:kanban-command "invalid-command"})]
      (is (true? (:success context))) ; Overall context should still succeed
      
      (let [data (:data context)]
        ;; Environment should succeed
        (is (true? (:success (:environment data))))
        
        ;; Kanban might fail but should have fallback
        (let [kanban-result (:kanban data)]
          (if (:success kanban-result)
            (is (true? (:success kanban-result)))
            (is (contains? kanban-result :fallback))))))))

;; ============================================================================
;; Performance Tests
;; ============================================================================

(deftest test-performance
  (testing "Data collection completes within reasonable time"
    (let [start-time (System/currentTimeMillis)
          context (dc/collect-agent-context {})
          end-time (System/currentTimeMillis)
          duration (- end-time start-time)]
      ;; Should complete within 3 seconds
      (is (< duration 3000))
      (is (true? (:success context))))))