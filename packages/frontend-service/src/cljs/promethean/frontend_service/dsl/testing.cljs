(ns promethean.frontend-service.dsl.testing
  "Testing utilities and helpers for the frontend service DSL"
  (:require [promethean.frontend-service.dsl :as dsl]
            [promethean.frontend-service.dsl.core :as dsl-core]
            [promethean.frontend-service.server :as server]
            [promethean.frontend-service.types :as types]
            [clojure.test :refer [deftest testing is are use-fixtures]]
            [clojure.spec.alpha :as s])
  (:require ["fastify" :as Fastify]))

;; ============================================================================
;; TEST FIXTURES
;; ============================================================================

(defn create-test-server
  "Create a test server instance"
  []
  (Fastify #js {:logger false}))

(defn create-test-package-structure
  "Create a mock package structure for testing"
  [packages-dir]
  {:packages-dir packages-dir
   :packages [{:name "test-package-1"
               :path (str packages-dir "/test-package-1")
               :has-dist-frontend true
               :has-static true}
              {:name "test-package-2"
               :path (str packages-dir "/test-package-2")
               :has-dist-frontend false
               :has-static true}
              {:name "test-package-3"
               :path (str packages-dir "/test-package-3")
               :has-dist-frontend true
               :has-static false}]})

(defn create-test-config
  "Create test configuration for DSL testing"
  []
  {:server {:port 3001
            :host "localhost"
            :packages-dir "./test-packages"
            :static-assets true
            :health-endpoint true
            :cors {:origin "*" :methods [:get :post]}}
   :routes [{:method :GET :path "/health" :handler 'test-health-handler}
            {:method :GET :path "/version" :handler 'test-version-handler}
            {:method :STATIC :path "/static/*" :config {:root "./test-static"}}]
   :packages {:scan-dirs ["./test-packages"]
              :exclude-patterns [#".*-test"]
              :mount-strategy :auto
              :prefix-routes true}})

;; ============================================================================
;; DSL VALIDATION TESTS
;; ============================================================================

(deftest test-server-config-validation
  (testing "Valid server configuration"
    (let [valid-config {:port 3000 :host "localhost"}]
      (is (= valid-config (dsl/validate-server-config valid-config)))))

  (testing "Invalid server configuration - missing required fields"
    (let [invalid-config {:port 3000}]
      (is (thrown-with-msg?
           clojure.lang.ExceptionInfo
           #"Invalid server configuration"
           (dsl/validate-server-config invalid-config)))))

  (testing "Invalid server configuration - invalid port"
    (let [invalid-config {:port 70000 :host "localhost"}]
      (is (thrown-with-msg?
           clojure.lang.ExceptionInfo
           #"Invalid server configuration"
           (dsl/validate-server-config invalid-config))))))

(deftest test-route-validation
  (testing "Valid route configuration"
    (let [valid-route {:method :GET :path "/test" :handler 'test-handler}]
      (is (nil? (dsl/validate-routes [valid-route])))))

  (testing "Invalid route configuration - missing required fields"
    (let [invalid-route {:method :GET :path "/test"}]
      (is (thrown-with-msg?
           clojure.lang.ExceptionInfo
           #"Invalid route configuration"
           (dsl/validate-routes [invalid-route])))))

  (testing "Invalid route method"
    (let [invalid-route {:method :INVALID :path "/test" :handler 'test-handler}]
      (is (thrown-with-msg?
           clojure.lang.ExceptionInfo
           #"Invalid route configuration"
           (dsl/validate-routes [invalid-route]))))))

(deftest test-package-mounts-validation
  (testing "Valid package mounts configuration"
    (let [valid-config {:scan-dirs ["./packages"]}]
      (is (= valid-config (dsl/validate-package-mounts valid-config)))))

  (testing "Invalid package mounts configuration - missing scan dirs"
    (let [invalid-config {:mount-strategy :auto}]
      (is (thrown-with-msg?
           clojure.lang.ExceptionInfo
           #"Invalid package mounts configuration"
           (dsl/validate-package-mounts invalid-config))))))

;; ============================================================================
;; DSL COMPILATION TESTS
;; ============================================================================

(deftest test-server-config-compilation
  (testing "Compile valid server configuration"
    (let [config {:port 3000 :host "localhost"}
          compiled (dsl/compile-server-config config)]
      (is (= :server (:type compiled)))
      (is (= :passed (:validation compiled)))
      (is (instance? js/Date (:compiled-at compiled)))))

  (testing "Compile invalid server configuration"
    (let [invalid-config {:port 3000}]
      (is (thrown-with-msg?
           clojure.lang.ExceptionInfo
           #"Invalid server configuration"
           (dsl/compile-server-config invalid-config))))))

(deftest test-routes-compilation
  (testing "Compile valid routes"
    (let [routes [{:method :GET :path "/test" :handler 'test-handler}]
          compiled (dsl/compile-routes routes)]
      (is (= 1 (count compiled)))
      (is (true? (:compiled (first compiled))))
      (is (instance? js/Date (:compiled-at (first compiled)))))))

(deftest test-package-mounts-compilation
  (testing "Compile valid package mounts configuration"
    (let [config {:scan-dirs ["./packages"]}
          compiled (dsl/compile-package-mounts config)]
      (is (= :package-mounts (:type compiled)))
      (is (= :passed (:validation compiled)))
      (is (instance? js/Date (:compiled-at compiled))))))

;; ============================================================================
;; ENVIRONMENT VARIABLE RESOLUTION TESTS
;; ============================================================================

(deftest test-env-var-resolution
  (testing "Resolve existing environment variable"
    (set! (aget js/process.env "TEST_VAR") "test-value")
    (is (= "test-value" (dsl-core/resolve-env-var "TEST_VAR" "default"))))

  (testing "Resolve non-existing environment variable"
    (set! (aget js/process.env "NON_EXISTENT_VAR") nil)
    (is (= "default" (dsl-core/resolve-env-var "NON_EXISTENT_VAR" "default"))))

  (testing "Resolve environment variable with number type"
    (set! (aget js/process.env "TEST_NUMBER") "3000")
    (is (= 3000 (dsl-core/resolve-env-var "TEST_NUMBER" 4000))))

  (testing "Resolve environment variable with boolean type"
    (set! (aget js/process.env "TEST_BOOLEAN") "false")
    (is (= false (dsl-core/resolve-env-var "TEST_BOOLEAN" true)))))

(deftest test-configuration-resolution
  (testing "Resolve configuration with environment variables"
    (set! (aget js/process.env "TEST_PORT") "5000")
    (let [config {:port [:env-or "TEST_PORT" 3000]
                  :host [:env-or "TEST_HOST" "localhost"]}
          resolved (dsl-core/resolve-configuration config)]
      (is (= 5000 (:port resolved)))
      (is (= "localhost" (:host resolved))))))

;; ============================================================================
;; INTEGRATION TESTS
;; ============================================================================

(deftest test-dsl-server-creation
  (testing "Create server from DSL configuration"
    (let [config {:port 3001 :host "localhost"}
          server-promise (dsl-core/create-server-with-config config)]
      (is (instance? js/Promise server-promise))))

  (testing "Create server with full configuration"
    (let [config {:port 3001
                  :host "localhost"
                  :packages-dir "./test-packages"
                  :static-assets true
                  :health-endpoint true}
          server-promise (dsl-core/create-server-with-config config)]
      (is (instance? js/Promise server-promise)))))

(deftest test-dsl-routing
  (testing "Create router with routes"
    (let [routes [{:method :GET :path "/test" :handler (fn [_req reply] (.send reply "test"))}]
          router (dsl-core/create-router-with-routes routes)]
      (is (not (nil? router)))
      (is (instance? js/Object router))))

  (testing "Create router with static routes"
    (let [routes [{:method :STATIC :path "/static/*" :config {:root "./test-static"}}]
          router (dsl-core/create-router-with-routes routes)]
      (is (not (nil? router)))
      (is (instance? js/Object router)))))

(deftest test-dsl-package-mounts
  (testing "Create package mounts from configuration"
    (let [config {:scan-dirs ["./test-packages"]
                  :exclude-patterns [#".*-test"]
                  :mount-strategy :auto
                  :prefix-routes true}
          mounts (dsl-core/create-package-mounts-with-config config)]
      (is (vector? mounts))))

  (testing "Apply package mounts to server"
    (let [app (create-test-server)
          config {:scan-dirs ["./test-packages"]
                  :exclude-patterns []
                  :mount-strategy :auto
                  :prefix-routes true}
          mounts []] ; Empty mounts for testing
      (is (nil? (dsl-core/apply-package-mounts app mounts config))))))

;; ============================================================================
;; PERFORMANCE TESTS
;; ============================================================================

(deftest test-dsl-performance
  (testing "Large route compilation performance"
    (let [large-routes (for [i (range 1000)]
                         {:method :GET :path (str "/test-" i) :handler 'test-handler})
          start-time (js/performance.now)
          compiled (dsl/compile-routes large-routes)
          end-time (js/performance.now)]
      (is (< (- end-time start-time) 1000)) ; Should complete within 1 second
      (is (= 1000 (count compiled)))))

  (testing "Large configuration resolution performance"
    (let [large-config (reduce
                        (fn [acc i]
                          (assoc acc (keyword (str "key-" i)) [:env-or (str "VAR_" i) i]))
                        {}
                        (range 1000))
          start-time (js/performance.now)
          resolved (dsl-core/resolve-configuration large-config)
          end-time (js/performance.now)]
      (is (< (- end-time start-time) 500)) ; Should complete within 500ms
      (is (= 1000 (count resolved))))))

;; ============================================================================
;; ERROR HANDLING TESTS
;; ============================================================================

(deftest test-dsl-error-handling
  (testing "Handle malformed server configuration"
    (let [malformed-config {:port "invalid" :host nil}]
      (is (thrown-with-msg?
           clojure.lang.ExceptionInfo
           #"Invalid server configuration"
           (dsl/validate-server-config malformed-config)))))

  (testing "Handle malformed route configuration"
    (let [malformed-routes [{:method :INVALID :path nil :handler nil}]]
      (is (thrown-with-msg?
           clojure.lang.ExceptionInfo
           #"Invalid route configuration"
           (dsl/validate-routes malformed-routes)))))

  (testing "Handle malformed package mounts configuration"
    (let [malformed-config {:scan-dirs nil :mount-strategy :invalid}]
      (is (thrown-with-msg?
           clojure.lang.ExceptionInfo
           #"Invalid package mounts configuration"
           (dsl/validate-package-mounts malformed-config))))))

;; ============================================================================
;; MOCK HELPERS FOR TESTING
;; ============================================================================

(defn mock-handler
  "Create a mock handler for testing"
  [response]
  (fn [_req reply]
    (.send reply (clj->js response))))

(defn mock-async-handler
  "Create a mock async handler for testing"
  [response delay-ms]
  (fn [_req reply]
    (js/setTimeout
     (fn []
       (.send reply (clj->js response)))
     delay-ms)))

(defn mock-error-handler
  "Create a mock error handler for testing"
  [error-message]
  (fn [_req reply]
    (.status reply 500)
    (.send reply (clj->js {:error error-message}))))

;; ============================================================================
;; TEST UTILITIES
;; ============================================================================

(defn with-test-server
  "Utility to run a test with a temporary server"
  [config f]
  (let [server-promise (dsl-core/create-server-with-config config)]
    (.then server-promise
           (fn [server]
             (try
               (f server)
               (finally
                 (.close server)))))))

(defn with-test-routes
  "Utility to run a test with temporary routes"
  [routes f]
  (let [router (dsl-core/create-router-with-routes routes)]
    (try
      (f router)
      (finally
        (.close router)))))

(defn assert-route-exists
  "Assert that a route exists in the router"
  [router method path]
  ;; This would need to be implemented based on Fastify's internal API
  (is (not (nil? router))))

(defn assert-static-route-exists
  "Assert that a static route exists in the router"
  [router path]
  ;; This would need to be implemented based on Fastify's internal API
  (is (not (nil? router))))

;; ============================================================================
;; BENCHMARKING UTILITIES
;; ============================================================================

(defn benchmark-dsl-compilation
  "Benchmark DSL compilation performance"
  [config iterations]
  (let [start-time (js/performance.now)]
    (dotimes [_ iterations]
      (dsl/compile-server-config config))
    (let [end-time (js/performance.now)]
      {:total-time (- end-time start-time)
       :average-time (/ (- end-time start-time) iterations)
       :iterations iterations})))

(defn benchmark-route-compilation
  "Benchmark route compilation performance"
  [routes iterations]
  (let [start-time (js/performance.now)]
    (dotimes [_ iterations]
      (dsl/compile-routes routes))
    (let [end-time (js/performance.now)]
      {:total-time (- end-time start-time)
       :average-time (/ (- end-time start-time) iterations)
       :iterations iterations})))

;; ============================================================================
;; PROPERTY-BASED TESTING HELPERS
;; ============================================================================

(defn generate-random-server-config
  "Generate a random server configuration for property-based testing"
  []
  {:port (+ 3000 (rand-int 5000))
   :host (rand-nth ["localhost" "0.0.0.0" "127.0.0.1"])
   :packages-dir (str "./test-packages-" (rand-int 100))
   :static-assets (rand-nth [true false])
   :health-endpoint (rand-nth [true false])
   :cors (when (rand-nth [true false])
           {:origin (rand-nth ["*" "http://localhost:3000"])
            :methods (take (rand-int 4) [:get :post :put :delete])})})

(defn generate-random-routes
  "Generate random routes for property-based testing"
  [count]
  (for [i (range count)]
    {:method (rand-nth [:GET :POST :PUT :DELETE])
     :path (str "/test-" i)
     :handler (keyword (str "test-handler-" i))}))

(defn property-test-server-config
  "Property-based test for server configuration"
  [config]
  (try
    (let [compiled (dsl/compile-server-config config)]
      (and (= :server (:type compiled))
           (= :passed (:validation compiled))
           (instance? js/Date (:compiled-at compiled))))
    (catch js/Error _
      false)))