(ns promethean.agent-generator.data-collection-test
  "Tests for data collection functionality"
  
  (:require [clojure.test :refer [deftest testing is use-fixtures]]
            [promethean.agent-generator.data-collection :as dc]
            [promethean.agent-generator.validation :as validation]
            [clojure.java.shell :as shell]))

;; ============================================================================
;; Test Fixtures
;; ============================================================================

(def test-env-vars
  {"AGENT_NAME" "test-agent"
   "ENVIRONMENT" "test"
   "DEBUG_LEVEL" "debug"
   "NODE_ENV" "test"})

(defn with-test-env [f]
  (let [original-env (System/getenv)]
    (try
      ;; Set test environment variables
      (doseq [[k v] test-env-vars]
        (System/setProperty k v))
      (f)
      (finally
        ;; Restore original environment
        (doseq [k (keys test-env-vars)]
          (System/clearProperty k))))))

(use-fixtures :each with-test-env)

;; ============================================================================
;; Environment Collector Tests
;; ============================================================================

(deftest test-environment-collector-creation
  (testing "Environment collector can be created"
    (let [collector (dc/create-environment-collector)]
      (is (some? collector))
      (is (= "environment" (:name collector))))))

(deftest test-environment-collector-availability
  (testing "Environment collector is available when env vars exist"
    (let [collector (dc/create-environment-collector)]
      (is (true? (dc/available? collector))))))

(deftest test-environment-collector-collection
  (testing "Environment collector collects data correctly"
    (let [collector (dc/create-environment-collector)
          result (dc/collect collector {})]
      (is (true? (:success result)))
      (is (contains? (:data result) :agent-name))
      (is (contains? (:data result) :environment))
      (is (contains? (:data result) :debug-level))
      (is (contains? (:data result) :collection-method))
      (is (contains? (:data result) :timestamp)))))

(deftest test-environment-collector-custom-variables
  (testing "Environment collector can collect custom variables"
    (let [collector (dc/create-environment-collector)
          config {:variables ["AGENT_NAME" "CUSTOM_VAR"]}
          result (dc/collect collector config)]
      (is (true? (:success result)))
      (is (contains? (:data result) :agent-name)))))

(deftest test-environment-collector-fallback
  (testing "Environment collector provides fallback data"
    (let [collector (dc/create-environment-collector)
          fallback (dc/get-fallback collector {})]
      (is (contains? fallback :agent-name))
      (is (contains? fallback :environment))
      (is (= "fallback" (:collection-method fallback))))))

;; ============================================================================
;; Kanban Collector Tests
;; ============================================================================

(deftest test-kanban-collector-creation
  (testing "Kanban collector can be created"
    (let [collector (dc/create-kanban-collector)]
      (is (some? collector))
      (is (= "kanban" (:name collector))))))

(deftest test-kanban-collector-availability
  (testing "Kanban collector availability depends on pnpm"
    (let [collector (dc/create-kanban-collector)]
      ;; This test might fail if pnpm is not installed
      ;; We'll just test that the method doesn't throw
      (is (some? (dc/available? collector))))))

(deftest test-kanban-collector-fallback
  (testing "Kanban collector provides fallback data"
    (let [collector (dc/create-kanban-collector)
          fallback (dc/get-fallback collector {})]
      (is (contains? fallback :tasks))
      (is (contains? fallback :columns))
      (is (contains? fallback :wip-limits))
      (is (= "fallback" (:collection-method fallback))))))

(deftest test-kanban-collector-collection
  (testing "Kanban collector attempts collection"
    (let [collector (dc/create-kanban-collector)
          result (dc/collect collector {})]
      ;; Result might be successful or failed depending on kanban availability
      (is (contains? result :success))
      (is (contains? result :timestamp))
      (when (not (:success result))
        (is (contains? result :fallback))))))

;; ============================================================================
;; File Index Collector Tests
;; ============================================================================

(deftest test-file-index-collector-creation
  (testing "File index collector can be created"
    (let [collector (dc/create-file-index-collector)]
      (is (some? collector))
      (is (= "file-index" (:name collector))))))

(deftest test-file-index-collector-availability
  (testing "File index collector is available when directory exists"
    (let [collector (dc/create-file-index-collector)]
      (is (true? (dc/available? collector))))))

(deftest test-file-index-collector-collection
  (testing "File index collector analyzes project structure"
    (let [collector (dc/create-file-index-collector)
          result (dc/collect collector {:base-path "."})]
      (is (true? (:success result)))
      (is (contains? (:data result) :packages))
      (is (contains? (:data result) :collection-method))
      (is (contains? (:data result) :timestamp)))))

(deftest test-file-index-collector-fallback
  (testing "File index collector provides fallback data"
    (let [collector (dc/create-file-index-collector)
          fallback (dc/get-fallback collector {})]
      (is (contains? fallback :packages))
      (is (contains? fallback :tools))
      (is (contains? fallback :configs))
      (is (= "fallback" (:collection-method fallback))))))

;; ============================================================================
;; Collection Manager Tests
;; ============================================================================

(deftest test-collection-manager-creation
  (testing "Collection manager can be created"
    (let [manager (dc/create-collection-manager {})]
      (is (some? manager))
      (is (contains? (:collectors manager) :environment))
      (is (contains? (:collectors manager) :kanban))
      (is (contains? (:collectors manager) :file-index)))))

(deftest test-collection-manager-custom-collectors
  (testing "Collection manager can use custom collectors"
    (let [custom-collector (dc/create-environment-collector)
          manager (dc/create-collection-manager 
                   {:collectors {:custom custom-collector}})]
      (is (contains? (:collectors manager) :custom)))))

(deftest test-collection-manager-collection
  (testing "Collection manager collects from all collectors"
    (let [manager (dc/create-collection-manager {})
          result (dc/collect manager {})]
      (is (true? (:success result)))
      (is (contains? result :data))
      (is (contains? result :timestamp))
      (is (contains? (:data result) :environment))
      (is (contains? (:data result) :kanban))
      (is (contains? (:data result) :file-index)))))

(deftest test-collection-manager-selective-collection
  (testing "Collection manager can collect from specific collectors"
    (let [manager (dc/create-collection-manager {})
          result (dc/collect manager {:collectors [:environment]})]
      (is (true? (:success result)))
      (is (contains? (:data result) :environment))
      (is (not (contains? (:data result) :kanban)))
      (is (not (contains? (:data result) :file-index))))))

(deftest test-collection-manager-availability
  (testing "Collection manager reports availability of all collectors"
    (let [manager (dc/create-collection-manager {})
          availability (dc/available? manager)]
      (is (contains? availability :environment))
      (is (contains? availability :kanban))
      (is (contains? availability :file-index)))))

;; ============================================================================
;; Utility Function Tests
;; ============================================================================

(deftest test-collect-all-data
  (testing "collect-all-data function works"
    (let [result (dc/collect-all-data {})]
      (is (contains? result :success))
      (is (contains? result :data))
      (is (contains? result :timestamp)))))

(deftest test-collect-with-fallbacks
  (testing "collect-with-fallbacks handles failures gracefully"
    (let [result (dc/collect-with-fallbacks {})]
      (is (contains? result :success))
      (is (contains? result :data))
      ;; Should have data even if some collectors fail
      (is (some? (:data result))))))

(deftest test-get-available-collectors
  (testing "get-available-collectors returns available collectors"
    (let [manager (dc/create-collection-manager {})
          available (dc/get-available-collectors manager)]
      (is (vector? available))
      (is (contains? (set available) :environment)))))

;; ============================================================================
;; Integration Tests
;; ============================================================================

(deftest test-complete-agent-context-collection
  (testing "Complete agent context can be collected"
    (let [context (dc/collect-agent-context {})]
      (is (contains? context :success))
      (is (contains? context :data))
      (is (contains? context :timestamp))
      
      ;; Check that all major data sources are present
      (let [data (:data context)]
        (is (contains? data :environment))
        (is (contains? data :kanban))
        (is (contains? data :file-index))
        
        ;; Check environment data
        (when (:environment data)
          (is (contains? (:environment data) :collection-method)))
        
        ;; Check kanban data
        (when (:kanban data)
          (is (contains? (:kanban data) :collection-method)))
        
        ;; Check file index data
        (when (:file-index data)
          (is (contains? (:file-index data) :collection-method)))))))

(deftest test-agent-context-validation
  (testing "Collected agent context can be validated"
    (let [context (dc/collect-agent-context {})
          validation (validation/validate-agent-context context)]
      (is (contains? validation :valid))
      (is (contains? validation :errors))
      (is (contains? validation :details)))))

(deftest test-error-handling
  (testing "Error handling works correctly"
    (let [collector (dc/create-kanban-collector)
          ;; Force an error by using invalid command
          result (dc/collect collector {:kanban-command "nonexistent-command"})]
      ;; Should handle error gracefully
      (is (contains? result :success))
      (is (contains? result :error))
      (is (contains? result :fallback)))))

;; ============================================================================
;; Performance Tests
;; ============================================================================

(deftest test-collection-performance
  (testing "Collection completes within reasonable time"
    (let [start-time (System/currentTimeMillis)
          result (dc/collect-agent-context {})
          end-time (System/currentTimeMillis)
          duration (- end-time start-time)]
      ;; Should complete within 5 seconds
      (is (< duration 5000))
      (is (true? (:success result))))))

(deftest test-concurrent-collection
  (testing "Multiple collections can run concurrently"
    (let [results (doall 
                    (repeatedly 5 
                               #(future (dc/collect-agent-context {}))))]
      ;; All should complete successfully
      (doseq [result results]
        (let [result-data @result]
          (is (true? (:success result-data))))))))

;; ============================================================================
;; Edge Cases
;; ============================================================================

(deftest test-empty-configuration
  (testing "Collection works with empty configuration"
    (let [result (dc/collect-agent-context {})]
      (is (true? (:success result)))
      (is (contains? result :data)))))

(deftest test-nil-configuration
  (testing "Collection works with nil configuration"
    (let [result (dc/collect-agent-context nil)]
      (is (true? (:success result)))
      (is (contains? result :data)))))

(deftest test-invalid-collector-names
  (testing "Invalid collector names are ignored"
    (let [manager (dc/create-collection-manager {})
          result (dc/collect manager {:collectors [:nonexistent]})]
      (is (true? (:success result)))
      (is (empty? (:data result))))))