#!/usr/bin/env bb

(println "Testing feature system...")

;; Test basic imports
(require '[promethean.agent-generator.platform.detection :as detection])
(println "✓ Detection loaded")

(require '[promethean.agent-generator.platform.features :as features])
(println "✓ Features loaded")

;; Test feature system
(println "Current platform:" (detection/current-platform))
(println "Available features:" (features/available-features))

(when-let [file-fn (features/use-feature! :file-system)]
  (println "✓ File system feature resolved:" file-fn)
  (println "✓ File system feature type:" (type file-fn)))

(println "Feature system test completed!")