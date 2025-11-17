(ns promethean.frontend-service.test.dsl-simple-test
  (:require [clojure.test :refer [deftest testing is]]
            [clojure.spec.alpha :as s]
            [promethean.frontend-service.dsl :as dsl]
            [promethean.frontend-service.dsl.core :as dsl-core]))

;; Simple validation tests
(deftest test-basic-validation
  (testing "Server config validation"
    (is (s/valid? :promethean.frontend-service.dsl/server-config
                  {:port 3000 :host "localhost"}))
    (is (not (s/valid? :promethean.frontend-service.dsl/server-config
                       {:port "invalid"}))))

  (testing "Route validation"
    (is (s/valid? :promethean.frontend-service.dsl/route-method :GET))
    (is (not (s/valid? :promethean.frontend-service.dsl/route-method :INVALID))))

  (testing "Package mounts validation"
    (is (s/valid? :promethean.frontend-service.dsl/package-mounts-config
                  {:scan-dirs ["./packages"]}))
    (is (not (s/valid? :promethean.frontend-service.dsl/package-mounts-config
                       {:scan-dirs "invalid"})))))

;; Environment variable tests
(deftest test-env-resolution
  (testing "Environment variable resolution"
    ;; Set a test environment variable
    (set! js/process.env.TEST_VAR "test_value")
    
    (let [resolved (dsl-core/resolve-env-var "TEST_VAR" "default")]
      (is (= "test_value" resolved)))
    
    (let [resolved (dsl-core/resolve-env-var "NONEXISTENT" "default")]
      (is (= "default" resolved)))))

;; Configuration resolution tests
(deftest test-config-resolution
  (testing "Configuration with environment variables"
    (set! js/process.env.TEST_PORT "8080")
    
    (let [config {:port [:env-or "TEST_PORT" 3000]
                  :host [:env-or "TEST_HOST" "localhost"]}
          resolved (dsl-core/resolve-configuration config)]
      (is (= 8080 (:port resolved)))
      (is (= "localhost" (:host resolved))))))

;; Utility function tests
(deftest test-utility-functions
  (testing "Path normalization"
    (is (= "/api/users" (dsl-core/normalize-route-path "api/users")))
    (is (= "/api/users" (dsl-core/normalize-route-path "/api/users/")))
    (is (= "/api/users" (dsl-core/normalize-route-path "/api/users"))))

  (testing "Health handler creation"
    (let [handler (dsl-core/create-health-handler "test-service")]
      (is (fn? handler)))))

;; Route conflict detection
(deftest test-route-conflicts
  (testing "No conflicts"
    (let [routes [{:path "/api/users" :method :GET}
                  {:path "/api/posts" :method :GET}]]
      (dsl-core/validate-route-conflicts routes)))

  (testing "With conflicts"
    (is (thrown? js/Error
                 (dsl-core/validate-route-conflicts
                   [{:path "/api/users" :method :GET}
                    {:path "/api/users" :method :POST}])))))

;; Route optimization
(deftest test-route-optimization
  (testing "Route ordering"
    (let [routes [{:path "/api/users/:id" :method :GET}
                  {:path "/api/users" :method :GET}]
          optimized (dsl-core/optimize-route-order routes)]
      (is (= "/api/users" (:path (first optimized))))
      (is (= "/api/users/:id" (:path (second optimized)))))))

;; Basic macro usage test
(deftest test-basic-macro-usage
  (testing "Simple server definition"
    (let [server (dsl/defserver simple-server
                    {:port 3000
                     :host "localhost"})]
      (is (delay? server))
      (is (map? @server))
      (is (= 3000 (:port @server)))
      (is (= "localhost" (:host @server)))))

  (testing "Simple routes definition"
    (let [routes (dsl/defroutes simple-routes
                    (dsl/GET "/test" [] "test-response"))]
      (is (delay? routes))
      (is (map? @routes))
      (is (= 1 (count (:routes @routes))))))

  (testing "Package mounts definition"
    (let [mounts (dsl/defpackage-mounts
                   {:scan-dirs ["./packages"]
                    :mount-strategy :auto})]
      (is (map? mounts))
      (is (= ["./packages"] (:scan-dirs mounts))))))

;; Configuration macro test
(deftest test-config-macro
  (testing "Configuration definition"
    (set! js/process.env.CONFIG_TEST "config_value")
    
    (let [config (dsl/defconfig test-config
                  {:value (dsl/env-or "CONFIG_TEST" "default")
                   :static "static-value"})]
      (is (delay? config))
      (is (map? @config))
      (is (= "config_value" (:value @config)))
      (is (= "static-value" (:static @config))))))

;; Integration test
(deftest test-simple-integration
  (testing "Basic integration"
    (set! js/process.env.INTEGRATION_PORT "4000")
    
    (let [server (dsl/defserver integration-server
                    {:port (dsl/env-or "INTEGRATION_PORT" 3000)
                     :host "localhost"})
          routes (dsl/defroutes integration-routes
                   (dsl/GET "/health" [] "OK")
                   (dsl/POST "/data" [] "created"))]
      
      (is (delay? server))
      (is (delay? routes))
      (is (= 4000 (:port @server)))
      (is (= "localhost" (:host @server)))
      (is (= 2 (count (:routes @routes)))))))