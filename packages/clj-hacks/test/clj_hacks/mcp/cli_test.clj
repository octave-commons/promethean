(ns clj-hacks.mcp.cli-test
  (:require [clj-hacks.mcp.cli :as mcp-cli]
            [clojure.string :as str]
            [clojure.test :refer [deftest is testing]]))

(deftest known-command?-covers-supported-ops
  (is (true? (mcp-cli/known-command? "pull")))
  (is (false? (mcp-cli/known-command? "unknown"))))

(deftest run-validates-required-arguments
  (testing "a missing positional argument returns a helpful error"
    (let [{:keys [exit err? message]} (mcp-cli/run "pull" [])]
      (is (= 2 exit))
      (is err?)
      (is (str/includes? message "missing positional arg: schema")))))

(deftest run-rejects-missing-edn-option
  (let [{:keys [exit err? message]} (mcp-cli/run "push" ["codex" "target"])]
    (is (= 2 exit))
    (is err?)
    (is (str/includes? message "missing required option: --edn"))))