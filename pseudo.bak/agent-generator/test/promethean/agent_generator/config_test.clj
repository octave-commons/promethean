(ns promethean.agent-generator.config-test
  "Tests for configuration management."
  (:require [clojure.test :refer [deftest testing is]]
            [promethean.agent-generator.config :as config]))

(deftest test-load-config
  (testing "Default configuration loading"
    (let [cfg (config/load-config {})]
      (is (= "generated-agents" (:output-dir cfg)))
      (is (= true (:validation-enabled cfg))))))

(deftest test-validate-config
  (testing "Valid configuration"
    (let [cfg {:output-dir "test-output"}]
      (is (= cfg (config/validate-config cfg)))))
  
  (testing "Invalid configuration"
    (is (thrown? Exception (config/validate-config {})))))