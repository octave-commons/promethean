#!/usr/bin/env bb

(println "Testing validation directly...")

(require '[promethean.agent-generator.cli.core :as cli])
(println "✓ CLI loaded")

(println "Running validation...")
(let [result (cli/handle-validate {})]
  (println (str "Validation result: " result)))

(println "Validation test completed!")