(ns promethean.frontend-service.dsl-simple-test
  "Simple test to verify DSL macros compile and work"
  (:require [promethean.frontend-service.dsl :as dsl]))

;; Test that macros can be called and create vars
(dsl/defserver simple-test-server
  {:port 8080
   :host "localhost"})

(dsl/defroutes simple-test-routes
  [["/api/test" :get]
   ["/api/test" :post]])

(dsl/defconfig simple-test-config
  {:debug true
   :version "1.0.0"})

(defn test-dsl-functionality []
  "Test basic DSL functionality"
  (println "=== DSL Simple Test ===")
  (println "Server port:" (:port @simple-test-server))
  (println "Route count:" (count @simple-test-routes))
  (println "Config debug:" (:debug @simple-test-config))
  (println "DSL test completed successfully!"))

(defn -main [& args]
  (test-dsl-functionality))