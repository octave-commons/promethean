(ns test-runner
  "Simple test runner for integration tests"
  (:require [test-integration :as test]))

(defn -main [& args]
  (println "Running Opencode Unified Integration Tests...")
  (test/run-integration-tests))