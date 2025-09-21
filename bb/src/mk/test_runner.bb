#!/usr/bin/env bb
(require '[clojure.test :as t])

(require 'clj-hacks.mcp.core-test)
(require 'clj-hacks.mcp.adapter-codex-toml-test)

(let [res (t/run-tests 'clj-hacks.mcp.core-test
                       'clj-hacks.mcp.adapter-codex-toml-test)
      failures (+ (:fail res) (:error res))]
  (println "Tests run:" (:test res) "assertions:" (:pass res) "/" (+ (:pass res) (:fail res) (:error res)))
  (System/exit (if (pos? failures) 1 0)))
