(ns promethean.agent-generator.platform-test
  "Tests for platform detection functionality."
  (:require [clojure.test :refer [deftest testing is]]
            [promethean.agent-generator.platform :as platform]))

(deftest test-detect-platform
  (testing "Platform detection"
    (let [platform (platform/detect-platform)]
      (is (contains? #{:babashka :nbb :node :jvm} platform)))))

(deftest test-platform-features
  (testing "Platform features"
    (doseq [platform [:babashka :nbb :node :jvm]]
      (let [features (platform/platform-features platform)]
        (is (map? features))))))

(deftest test-adapt-to-platform
  (testing "Platform adaptation placeholder"
    (let [result (platform/adapt-to-platform :test-op :jvm)]
      (is (= :not-implemented (:status result))))))