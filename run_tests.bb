#!/usr/bin/env bb

(require '[clojure.test :as t])

;; Load test namespaces
(require 'mk.mcp-core-test)
(require 'mk.mcp-adapter-codex-toml-test)

;; Run tests and exit with appropriate status
(let [res (t/run-tests 'mk.mcp-core-test
                      'mk.mcp-adapter-codex-toml-test)]
  (println "Tests run:" (:test res))
  (println "Passed:" (:pass res))
  (println "Failed:" (:fail res))
  (println "Errors:" (:error res))
  (System/exit (if (zero? (+ (:fail res) (:error res))) 0 1)))
