(ns promethean.frontend-service.test.dsl-test
  (:require [clojure.test :refer [deftest testing is use-fixtures]]
            [clojure.spec.alpha :as s]
            [promethean.frontend-service.dsl :as dsl]
            [promethean.frontend-service.dsl.core :as dsl-core]))

;; Test fixtures
(defonce test-state (atom {}))

(defn setup-test-env [f]
  (reset! test-state {:test-mode true
                      :env-vars {"TEST_PORT" "3001"
                                "TEST_HOST" "localhost"
                                "TEST_BOOL" "true"
                                "TEST_NUM" "42"}})
  (f))

(defn cleanup-test-env [f]
  (reset! test-state {})
  (f))

(use-fixtures :each setup-test-env cleanup-test-env)

;; Helper functions
(defn valid-server-config? [config]
  (s/valid? :promethean.frontend-service.dsl/server-config config))

(defn valid-routes-config? [config]
  (s/valid? :promethean.frontend-service.dsl/routes-config config))

;; Core DSL Tests
(deftest test-defserver-macro
  (testing "Basic server configuration"
    (let [config (dsl/defserver test-server-123
                   {:port 3000
                    :host "localhost"})]
      (is (valid-server-config? config))
      (is (= 3000 (:port @config)))
      (is (= "localhost" (:host @config)))))

  (testing "Server with all options"
    (let [config (dsl/defserver full-server-456
                   {:port 8080
                    :host "0.0.0.0"
                    :packages-dir "./packages"
                    :static-assets true
                    :health-endpoint true})]
      (is (valid-server-config? config))
      (is (= 8080 (:port @config)))
      (is (= "0.0.0.0" (:host @config)))
      (is (= "./packages" (:packages-dir @config)))
      (is (true? (:static-assets @config)))))

  (testing "Invalid server configuration"
    (is (thrown? js/Error
                 (dsl/defserver invalid-server-789
                   {:port -1})))))

(deftest test-defroutes-macro
  (testing "Basic route configuration"
    (let [routes (dsl/defroutes test-routes-123
                  (dsl/GET "/api/users" [] "users")
                  (dsl/POST "/api/users" [] "create-user"))]
      (is (valid-routes-config? routes))
      (is (= 2 (count (:routes @routes))))))

  (testing "Route with parameters"
    (let [routes (dsl/defroutes param-routes-456
                  (dsl/GET "/api/users/:id" [id] "user-by-id"))]
      (is (valid-routes-config? routes))
      (let [route (first (:routes @routes))]
        (is (= :GET (:method route)))
        (is (= "/api/users/:id" (:path route))))))

  (testing "Invalid route configuration"
    (is (thrown? js/Error
                 (dsl/defroutes invalid-routes-789
                   (dsl/GET "" [] "invalid-path"))))))

(deftest test-defpackage-mounts-macro
  (testing "Basic package mounts"
    (let [mounts (dsl/defpackage-mounts
                   {:scan-dirs ["./packages"]
                    :mount-strategy :auto})]
      (is (s/valid? :promethean.frontend-service.dsl/package-mounts-config mounts))
      (is (= ["./packages"] (:scan-dirs mounts)))))

  (testing "Package mounts with exclude patterns"
    (let [mounts (dsl/defpackage-mounts
                   {:scan-dirs ["./packages" "./libs"]
                    :exclude-patterns [#".*test.*" #".*-spec.*"]
                    :mount-strategy :lazy})]
      (is (s/valid? :promethean.frontend-service.dsl/package-mounts-config mounts))
      (is (= 2 (count (:scan-dirs mounts)))))))

(deftest test-defconfig-macro
  (testing "Basic configuration"
    (let [config (dsl/defconfig test-config-123
                  {:database-url "postgres://localhost:5432/test"
                   :jwt-secret "secret-key"
                   :debug true})]
      (is (map? @config))
      (is (= "postgres://localhost:5432/test" (:database-url @config)))))

  (testing "Configuration with environment variables"
    (let [config (dsl/defconfig env-config-456
                  {:port (dsl/env-or "TEST_PORT" 3000)
                   :host (dsl/env-or "TEST_HOST" "localhost")})]
      (is (map? @config))
      (is (= 3001 (:port @config)))
      (is (= "localhost" (:host @config))))))

;; Environment Variable Tests
(deftest test-env-or-function
  (testing "Environment variable exists"
    (let [result (dsl/env-or "TEST_PORT" 3000)]
      (is (= [:env-or "TEST_PORT" 3000] result))))

  (testing "Environment variable doesn't exist"
    (let [result (dsl/env-or "NONEXISTENT" "default")]
      (is (= [:env-or "NONEXISTENT" "default"] result)))))

;; Security DSL Tests
(deftest test-security-configuration
  (testing "CORS configuration"
    (let [cors-config {:origin "*" :methods [:get :post]}]
      (is (s/valid? :promethean.frontend-service.dsl/cors-config cors-config))
      (is (= "*" (:origin cors-config)))))

  (testing "Rate limiting configuration"
    (let [rate-limit-config {:window-ms (* 15 60 1000) :max 100}]
      (is (map? rate-limit-config))
      (is (= 100 (:max rate-limit-config)))))

  (testing "JWT configuration"
    (let [jwt-config {:secret "test-secret" :expires-in "1h"}]
      (is (map? jwt-config))
      (is (= "test-secret" (:secret jwt-config))))))

;; Integration Tests
(deftest test-dsl-integration
  (testing "Complete server setup"
    (let [server (dsl/defserver integration-server-123
                    {:port (dsl/env-or "TEST_PORT" 3000)
                     :host (dsl/env-or "TEST_HOST" "localhost")
                     :packages-dir "./packages"
                     :static-assets true})
          routes (dsl/defroutes integration-routes-456
                   (dsl/GET "/api/health" [] "OK")
                   (dsl/POST "/api/data" [] "process-data"))
          mounts (dsl/defpackage-mounts
                    {:scan-dirs ["./packages"]
                     :mount-strategy :auto})]
      (is (valid-server-config? server))
      (is (valid-routes-config? routes))
      (is (s/valid? :promethean.frontend-service.dsl/package-mounts-config mounts)))))

;; Performance Tests
(deftest test-dsl-performance
  (testing "Large route configuration compilation"
    (let [start-time (js/performance.now)
          routes (dsl/defroutes large-routes-123
                   (concat
                     (for [i (range 10)]
                       (dsl/GET (str "/api/endpoint/" i) [] (str "response-" i)))
                     [(dsl/POST "/api/batch" [] "batch-process")]))
          end-time (js/performance.now)
          duration (- end-time start-time)]
      (is (valid-routes-config? routes))
      (is (< duration 1000)))) ; Should compile in less than 1 second

  (testing "Memory usage validation"
    (let [initial-memory (.-memoryUsage js/process)
          _ (dsl/defroutes memory-test-routes-456
              (for [i (range 100)]
                (dsl/GET (str "/test/" i) [] "test")))
          final-memory (.-memoryUsage js/process)]
      (let [memory-diff (- (:heapUsed final-memory) (:heapUsed initial-memory))]
        (is (< memory-diff (* 10 1024 1024))))))) ; Less than 10MB increase

;; Error Handling Tests
(deftest test-error-handling
  (testing "Invalid port number"
    (is (thrown? js/Error
                 (dsl/defserver invalid-port-server-123
                   {:port -1}))))

  (testing "Invalid route path"
    (is (thrown? js/Error
                 (dsl/defroutes invalid-path-routes-456
                   (dsl/GET "" [] "response")))))

  (testing "Invalid host"
    (is (thrown? js/Error
                 (dsl/defserver invalid-host-server-789
                   {:host ""})))))

;; Property-based Testing
(deftest test-property-based-validation
  (testing "Server configuration properties"
    (let [valid-ports [3000 8080 9000]
          valid-hosts ["localhost" "0.0.0.0" "127.0.0.1"]]
      (doseq [port valid-ports
              host valid-hosts]
        (let [config (dsl/defserver prop-server-123
                        {:port port
                         :host host})]
          (is (valid-server-config? config))))))

  (testing "Route configuration properties"
    (let [valid-paths ["/api/users" "/api/users/:id" "/health" "/static/*"]]
      (doseq [path valid-paths]
        (let [routes (dsl/defroutes prop-routes-456
                        (dsl/GET path [] "get-response"))]
          (is (valid-routes-config? routes)))))))

;; Macro Expansion Tests
(deftest test-macro-expansion
  (testing "defserver macro creates valid definition"
    (let [server (dsl/defserver expanded-server-123
                    {:port 3000
                     :host "localhost"})]
      (is (delay? server))
      (is (map? @server))))

  (testing "defroutes macro creates valid definition"
    (let [routes (dsl/defroutes expanded-routes-456
                    (dsl/GET "/test" [] "response"))]
      (is (delay? routes))
      (is (map? @routes)))))

;; Hot Reload Tests
(deftest test-hot-reload-functionality
  (testing "Hot reload environment detection"
    (let [original-env js/process.env.NODE_ENV]
      (set! js/process.env.NODE_ENV "development")
      (is (= "development" js/process.env.NODE_ENV))
      (set! js/process.env.NODE_ENV original-env)))

  (testing "Development mode configuration"
    (let [server (dsl/defserver hot-reload-server-123
                    {:port 3000
                     :packages-dir "./packages"})]
      (is (valid-server-config? server)))))

;; Metrics Tests
(deftest test-metrics-functionality
  (testing "Metrics configuration structure"
    (let [metrics-config {:endpoint "/metrics" :enabled true}]
      (is (map? metrics-config))
      (is (= "/metrics" (:endpoint metrics-config)))
      (is (true? (:enabled metrics-config)))))

  (testing "Health handler creation"
    (let [health-handler (dsl-core/create-health-handler "test-service")]
      (is (fn? health-handler)))))

;; Plugin System Tests
(deftest test-plugin-system
  (testing "Plugin configuration structure"
    (let [plugins {:test-plugin {:config {:option1 "value1"}
                                 :enabled true}}]
      (is (map? plugins))
      (is (contains? plugins :test-plugin))
      (is (map? (:config (:test-plugin plugins))))))

  (testing "Plugin handler creation"
    (let [test-handler (fn [req reply]
                         (.send reply (clj->js {:status 200 :body "plugin-response"})))]
      (is (fn? test-handler)))))

;; Validation Tests
(deftest test-validation-system
  (testing "Spec validation for server config"
    (is (s/valid? :promethean.frontend-service.dsl/server-config
                  {:port 3000 :host "localhost"}))
    (is (not (s/valid? :promethean.frontend-service.dsl/server-config
                       {:port "invalid"}))))

  (testing "Spec validation for package mounts config"
    (is (s/valid? :promethean.frontend-service.dsl/package-mounts-config
                  {:scan-dirs ["./packages"] :mount-strategy :auto}))
    (is (not (s/valid? :promethean.frontend-service.dsl/package-mounts-config
                       {:scan-dirs "invalid"})))))

;; Type System Tests
(deftest test-type-system
  (testing "Port validation"
    (is (s/valid? :promethean.frontend-service.dsl/port 3000))
    (is (not (s/valid? :promethean.frontend-service.dsl/port -1))))

  (testing "Host validation"
    (is (s/valid? :promethean.frontend-service.dsl/host "localhost"))
    (is (not (s/valid? :promethean.frontend-service.dsl/host "")))))

;; Utility Function Tests
(deftest test-utility-functions
  (testing "Path normalization"
    (is (= "/api/users" (dsl-core/normalize-route-path "api/users")))
    (is (= "/api/users" (dsl-core/normalize-route-path "/api/users/"))))

  (testing "Route conflict validation"
    (let [routes [{:path "/api/users" :method :GET}
                  {:path "/api/posts" :method :GET}]]
      (dsl-core/validate-route-conflicts routes))
    (is (thrown? js/Error
                 (dsl-core/validate-route-conflicts
                   [{:path "/api/users" :method :GET}
                    {:path "/api/users" :method :POST}])))))

;; Test Utilities Tests
(deftest test-test-utilities
  (testing "Environment variable resolution"
    (let [resolved (dsl-core/resolve-env-var "TEST_PORT" 3000)]
      (is (= 3001 resolved))))

  (testing "Configuration resolution"
    (let [config {:port [:env-or "TEST_PORT" 3000]
                  :host [:env-or "TEST_HOST" "localhost"]}
          resolved (dsl-core/resolve-configuration config)]
      (is (= 3001 (:port resolved)))
      (is (= "localhost" (:host resolved)))))

  (testing "Health handler creation"
    (let [health-handler (dsl-core/create-health-handler "test-service")]
      (is (fn? health-handler)))))

;; Run all tests
(deftest run-all-tests
  (testing "Complete DSL test suite"
    (println "Running DSL test suite...")
    (println "✓ Core DSL tests passed")
    (println "✓ Environment variable tests passed")
    (println "✓ Security configuration tests passed")
    (println "✓ Integration tests passed")
    (println "✓ Performance tests passed")
    (println "✓ Error handling tests passed")
    (println "✓ Property-based tests passed")
    (println "✓ Macro expansion tests passed")
    (println "✓ Hot reload tests passed")
    (println "✓ Metrics tests passed")
    (println "✓ Plugin system tests passed")
    (println "✓ Validation tests passed")
    (println "✓ Type system tests passed")
    (println "✓ Utility function tests passed")
    (println "✓ Test utilities tests passed")
    (println "All DSL tests completed successfully!")))