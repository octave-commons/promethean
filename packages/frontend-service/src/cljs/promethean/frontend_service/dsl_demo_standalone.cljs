(ns promethean.frontend-service.dsl-demo-standalone
  "Standalone DSL demonstration without typed clojure dependencies"
  (:require [promethean.frontend-service.dsl :as dsl]))

;; Simple main function to test DSL compilation
(defn -main [& args]
  (println "=== DSL Demo Standalone ===")
  (println "Testing DSL macro compilation...")
  
  ;; Test basic server definition
  (let [server-config (dsl/defserver test-server
                       {:port 3000
                        :host "localhost"
                        :routes ["/api" "/health"]})]
    (println "Server config created:" server-config))
  
  ;; Test route definition  
  (let [routes (dsl/defroutes test-routes
                 [["/api/users" :get]
                  ["/api/posts" :post]])]
    (println "Routes created:" routes))
    
  (println "DSL demo completed successfully!"))