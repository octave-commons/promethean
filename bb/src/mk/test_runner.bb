#!/usr/bin/env bb
(require '[clojure.test :as t])

(require 'mk.mcp-core-test)
(require 'mk.mcp-adapter-codex-toml-test)

(let [res (t/run-tests 'mk.mcp-core-test
                       'mk.mcp-adapter-codex-toml-test)
      failures (+ (:fail res) (:error res))]
  (println "Tests run:" (:test res) "assertions:" (:pass res) "/" (+ (:pass res) (:fail res) (:error res)))
  (System/exit (if (pos? failures) 1 0)))
