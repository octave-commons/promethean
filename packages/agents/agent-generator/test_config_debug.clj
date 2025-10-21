#!/usr/bin/env bb

(println "Testing config step by step...")

(require '[promethean.agent-generator.platform.detection :as detection])
(println "✓ Detection loaded")

(require '[promethean.agent-generator.config.core :as config])
(println "✓ Config loaded")

(println "Step 1: Getting environment config...")
(when-let [env-config (config/environment-config)]
  (println "✓ Environment config:" env-config)
  (println "✓ Environment config type:" (type env-config))
  (println "✓ Template dirs in env:" (:template-dirs env-config) "type:" (type (:template-dirs env-config))))

(println "Step 2: Testing merge with empty config...")
(try
  (let [result (config/merge-config {:template-dirs ["default"]} {})]
    (println "✓ Empty merge works:" result))
  (catch Exception e
    (println "✗ Empty merge failed:" (.getMessage e))))

(println "Step 3: Testing merge with string template-dirs...")
(try
  (let [result (config/merge-config {:template-dirs ["default"]} {:template-dirs "string"})]
    (println "✓ String merge works:" result))
  (catch Exception e
    (println "✗ String merge failed:" (.getMessage e))))

(println "Config debug completed!")