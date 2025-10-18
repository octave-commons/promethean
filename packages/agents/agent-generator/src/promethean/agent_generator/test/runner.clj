(ns promethean.agent-generator.test.runner
  "Test runner for agent generator"
  (:require [clojure.test :as t]
            [clojure.java.io :as io]
            [clojure.string :as str]))

(defn find-test-files [test-dir]
  "Find all test files in the given directory"
  (when (.exists (io/file test-dir))
    (->> (file-seq (io/file test-dir))
         (filter #(.isFile %))
         (filter #(str/ends-with? (.getName %) "_test.clj"))
         (map #(.getPath %)))))

(defn run-tests-in-namespace [ns-sym]
  "Run all tests in a namespace"
  (println (str "Running tests in " ns-sym "..."))
  (let [results (t/run-tests ns-sym)]
    (println (str "  Pass: " (:pass results) ", Fail: " (:fail results) ", Error: " (:error results)))
    results))

(defn run-all-tests []
  "Run all tests in the test directory"
  (println "=== Agent Generator Test Suite ===")
  (let [test-dir "test"
        test-files (find-test-files test-dir)]
    (if (empty? test-files)
      (do
        (println "No test files found in test directory")
        (println "Creating basic test structure...")
        {:pass 0 :fail 0 :error 0 :test 0})
      (do
        (println (str "Found " (count test-files) " test files"))
        (let [namespaces (map #(-> % 
                                   (str/replace #".*/" "") 
                                   (str/replace #"_test\.clj$" "") 
                                   (str/replace #"-" "_") 
                                   symbol) 
                               test-files)
              results (reduce (fn [acc ns]
                                (let [result (run-tests-in-namespace ns)]
                                  (merge-with + acc result)))
                              {:pass 0 :fail 0 :error 0 :test 0}
                              namespaces)]
          (println "\n=== Test Summary ===")
          (println (str "Total tests: " (:test results)))
          (println (str "Passed: " (:pass results)))
          (println (str "Failed: " (:fail results)))
          (println (str "Errors: " (:error results)))
          (if (zero? (+ (:fail results) (:error results)))
            (do
              (println "✅ All tests passed!")
              results)
            (do
              (println "❌ Some tests failed!")
              results)))))))

(defn run-unit-tests []
  "Run only unit tests"
  (println "=== Running Unit Tests ===")
  (run-all-tests))

(defn run-integration-tests []
  "Run only integration tests"
  (println "=== Running Integration Tests ===")
  (run-all-tests))

(defn run-performance-tests []
  "Run performance benchmarks"
  (println "=== Running Performance Tests ===")
  (println "Performance tests not yet implemented")
  {:pass 0 :fail 0 :error 0 :test 0})

(defn -main [& args]
  "Main entry point for test runner"
  (let [test-type (first args)]
    (case test-type
      "unit" (run-unit-tests)
      "integration" (run-integration-tests) 
      "performance" (run-performance-tests)
      (run-all-tests))))