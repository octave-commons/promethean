#!/usr/bin/env bb

(println "Testing basic functionality...")

;; Test basic imports
(require '[promethean.agent-generator.config.core :as config])
(println "✓ Config core loaded")

(require '[promethean.agent-generator.platform.detection :as detection])
(println "✓ Detection loaded")

;; Test basic functionality
(when-let [platform (detection/current-platform)]
  (println (str "✓ Current platform: " platform)))

(println "Testing feature system...")
(require '[promethean.agent-generator.platform.features :as features])
(when-let [file-fn (features/use-feature! :file-system)]
  (println "✓ File system feature:" file-fn)
  (println "✓ File system feature result:" (file-fn "test.edn")))
(when-let [test-config (config/build-config {})]
  (println "✓ Config built:" (keys test-config)))

(println "Basic functionality test completed!")