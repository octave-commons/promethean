(ns clj-hacks.cli-test
  (:require [clj-hacks.cli :as cli]
            [clojure.string :as str]
            [clojure.test :refer [deftest is testing]]))

(deftest dispatch-valid-command
  (testing "returns the automation command entry"
    (let [result (cli/dispatch ["prepare"])]
      (is (= 0 (:exit result)))
      (is (= :automation (get-in result [:command :entry :group])))
      (is (empty? (get-in result [:command :args]))))))

(deftest dispatch-help
  (testing "prints usage for help flags"
    (let [result (cli/dispatch ["--help"])]
      (is (= 0 (:exit result)))
      (is (nil? (:command result)))
      (is (str/includes? (:message result) "Usage: clojure -M:tasks")))))

(deftest dispatch-missing-command
  (testing "signals when command is missing"
    (let [result (cli/dispatch [])]
      (is (= 1 (:exit result)))
      (is (:err? result))
      (is (str/includes? (:message result) "Missing command.")))))

(deftest dispatch-unknown-command
  (testing "signals unknown commands"
    (let [result (cli/dispatch ["boom"])]
      (is (= 1 (:exit result)))
      (is (:err? result))
      (is (str/includes? (:message result) "Unknown command")))))

(deftest dispatch-extra-args
  (testing "rejects additional arguments for zero-arity commands"
    (let [result (cli/dispatch ["prepare" "oops"])]
      (is (= 1 (:exit result)))
      (is (:err? result))
      (is (str/includes? (:message result) "Unexpected arguments")))))

(deftest dispatch-mcp-command
  (testing "passes arguments through for MCP commands"
    (let [args ["codex.toml" "--edn" "my.edn"]
          result (cli/dispatch (into ["pull"] args))]
      (is (= 0 (:exit result)))
      (is (= :mcp (get-in result [:command :entry :group])))
      (is (= args (get-in result [:command :args]))))))