(ns promethean.frontend-service.dsl.examples
  "Comprehensive examples demonstrating the frontend service DSL"
  (:require [promethean.frontend-service.dsl :as dsl]
            [promethean.frontend-service.dsl.core :as dsl-core]
            [promethean.frontend-service.types :as types]))

;; ============================================================================
;; BASIC USAGE EXAMPLES
;; ============================================================================

;; Example 1: Simple server configuration
(dsl/defserver simple-frontend-service
  {:port 3000
   :host "localhost"
   :packages-dir "./packages"
   :static-assets true
   :health-endpoint true})

;; Example 2: Server with CORS configuration
(dsl/defserver cors-enabled-service
  {:port 3000
   :host "localhost"
   :packages-dir "./packages"
   :static-assets true
   :health-endpoint true
   :cors {:origin "*" :methods [:get :post :put :delete]}})

;; Example 3: Basic routing
(dsl/defroutes basic-routes
  (dsl/GET "/health" [] health-handler)
  (dsl/GET "/version" [] version-handler)
  (dsl/static-route "/static/*" {:root "./static" :cache-control "max-age=3600"}))

;; Example 4: Package mounts configuration
(dsl/defpackage-mounts
  {:scan-dirs ["./packages" "./libs"]
   :exclude-patterns [#".*-test" #"test-.*"]
   :mount-strategy :auto
   :prefix-routes true})

;; Example 5: Configuration with environment variables
(dsl/defconfig production-config
  {:server (dsl/server-config
            :port (dsl/env-or "PORT" 3000)
            :host (dsl/env-or "HOST" "localhost")
            :packages-dir (dsl/env-or "PACKAGES_DIR" "./packages"))
   :packages (dsl/package-config
              :scan-dirs [(dsl/env-or "SCAN_DIRS" "./packages")]
              :auto-reload (dsl/env-or "AUTO_RELOAD" false))
   :static (dsl/static-config
            :cache-control {:max-age (dsl/env-or "CACHE_MAX_AGE" 86400)
                            :etag (dsl/env-or "ENABLE_ETAG" true)})})

;; ============================================================================
;; ADVANCED USAGE EXAMPLES
;; ============================================================================

;; Example 6: Complete frontend service with all features
(dsl/defserver full-featured-service
  {:port 3000
   :host "0.0.0.0"
   :packages-dir "./packages"
   :static-assets true
   :health-endpoint true
   :cors {:origin "http://localhost:3000"
          :methods [:get :post :put :delete :patch]
          :credentials true}})

(dsl/defroutes full-routes
  ;; Health and diagnostics
  (dsl/GET "/health" [] (dsl-core/create-health-handler {:serviceName "frontend-service"}))
  (dsl/GET "/version" [] (dsl-core/create-version-handler))
  (dsl/GET "/diagnostics" [] diagnostics-handler)

  ;; API routes
  (dsl/GET "/api/packages" [] list-packages-handler)
  (dsl/POST "/api/packages/:name/reload" [] reload-package-handler)
  (dsl/GET "/api/status" [] status-handler)

  ;; Static routes for packages
  (dsl/static-route "/:package/*" {:root "./packages"
                                   :index ["index.html" "index.htm"]
                                   :cache-control "max-age=3600"})

  ;; Static assets
  (dsl/static-route "/static/*" {:root "./static"
                                 :cache-control "max-age=86400"
                                 :etag true}))

(dsl/defpackage-mounts advanced-package-config
  {:scan-dirs ["./packages" "./libs" "./external"]
   :exclude-patterns [#".*-test" #"test-.*" #".*-deprecated"]
   :mount-strategy :lazy
   :prefix-routes true})

;; Example 7: Development vs Production configuration
(dsl/defconfig development-config
  {:server (dsl/server-config
            :port (dsl/env-or "DEV_PORT" 3001)
            :host "localhost"
            :packages-dir "./packages"
            :static-assets true
            :health-endpoint true)
   :packages (dsl/package-config
              :scan-dirs ["./packages"]
              :auto-reload true
              :watch-mode true)
   :static (dsl/static-config
            :cache-control {:max-age 0 ; No caching in dev
                            :etag false})
   :development {:hot-reload true
                 :debug-logging true
                 :source-maps true}})

(dsl/defconfig production-config
  {:server (dsl/server-config
            :port (dsl/env-or "PORT" 80)
            :host "0.0.0.0"
            :packages-dir "./packages"
            :static-assets true
            :health-endpoint true
            :cors {:origin (dsl/env-or "ALLOWED_ORIGIN" "https://example.com")
                   :methods [:get :post]
                   :credentials true})
   :packages (dsl/package-config
              :scan-dirs ["./packages"]
              :auto-reload false
              :mount-strategy :auto)
   :static (dsl/static-config
            :cache-control {:max-age 31536000 ; 1 year
                            :etag true
                            :gzip true})
   :production {:compression true
                :metrics true
                :security true}})

;; ============================================================================
;; SECURITY-FOCUSED EXAMPLES
;; ============================================================================

;; Example 8: Security-hardened configuration
(dsl/defserver secure-frontend-service
  {:port 443
   :host "0.0.0.0"
   :packages-dir "./packages"
   :static-assets true
   :health-endpoint true
   :cors {:origin "https://app.example.com"
          :methods [:get :post]
          :credentials true}})

(dsl/defroutes secure-routes
  ;; Security headers and rate limiting applied at middleware level
  (dsl/GET "/health" [] health-handler)
  (dsl/GET "/version" [] version-handler)

  ;; Protected API routes
  (dsl/POST "/api/auth/login" [] login-handler)
  (dsl/GET "/api/user/profile" [] authenticated-user-handler)
  (dsl/POST "/api/user/logout" [] logout-handler)

  ;; Static routes with security
  (dsl/static-route "/assets/*" {:root "./assets"
                                 :cache-control "max-age=31536000, immutable"
                                 :etag true}))

;; Example 9: Multi-environment configuration with security
(dsl/defconfig secure-production-config
  {:server (dsl/server-config
            :port (dsl/env-or "HTTPS_PORT" 443)
            :host "0.0.0.0"
            :packages-dir "./packages"
            :static-assets true
            :health-endpoint true
            :cors {:origin (dsl/env-or "ALLOWED_ORIGINS" "https://app.example.com")
                   :methods [:get :post]
                   :credentials true})
   :security {:helmet true
              :rate-limit {:max 100 :timeWindow "1 minute"}
              :csrf true
              :jwt {:secret (dsl/env-or "JWT_SECRET" "change-me")}}
   :plugins [[:jwt {:secret (dsl/env-or "JWT_SECRET" "change-me")}]
             [:auth {}]
             [:rate-limit {:max 100 :timeWindow "1 minute"}]]
   :metrics {:enabled true
             :endpoint "/metrics"
             :defaultMetrics {:enabled true}}})

;; ============================================================================
;; MICROSERVICES EXAMPLES
;; ============================================================================

;; Example 10: Microservice-specific configuration
(dsl/defserver user-frontend-service
  {:port 3001
   :host "0.0.0.0"
   :packages-dir "./user-service"
   :static-assets true
   :health-endpoint true
   :cors {:origin "http://gateway.example.com"
          :methods [:get :post :put :delete]}})

(dsl/defroutes user-service-routes
  (dsl/GET "/health" [] (fn [_req reply]
                          (.send reply (clj->js {:service "user-frontend"
                                                 :status "healthy"
                                                 :version "1.0.0"}))))
  (dsl/GET "/user/:id/profile" [] user-profile-handler)
  (dsl/PUT "/user/:id/profile" [] update-user-profile-handler)
  (dsl/static-route "/user/*" {:root "./user-service/dist"
                               :index ["index.html"]
                               :cache-control "max-age=3600"}))

;; Example 11: API Gateway configuration
(dsl/defserver api-gateway-frontend
  {:port 3000
   :host "0.0.0.0"
   :packages-dir "./gateway"
   :static-assets true
   :health-endpoint true
   :cors {:origin "*" :methods [:get :post :put :delete :patch]}})

(dsl/defroutes gateway-routes
  ;; Gateway health and status
  (dsl/GET "/health" [] gateway-health-handler)
  (dsl/GET "/status" [] gateway-status-handler)

  ;; Proxy routes to microservices
  (dsl/GET "/api/user/*" [] user-service-proxy)
  (dsl/POST "/api/user/*" [] user-service-proxy)
  (dsl/GET "/api/order/*" [] order-service-proxy)
  (dsl/POST "/api/order/*" [] order-service-proxy)

  ;; Gateway UI
  (dsl/static-route "/*" {:root "./gateway/dist"
                          :index ["index.html"]
                          :cache-control "max-age=0"}))

;; ============================================================================
;; PERFORMANCE-OPTIMIZED EXAMPLES
;; ============================================================================

;; Example 12: High-performance configuration
(dsl/defserver high-performance-service
  {:port 80
   :host "0.0.0.0"
   :packages-dir "./packages"
   :static-assets true
   :health-endpoint true
   :cors {:origin "*" :methods [:get]}})

(dsl/defroutes performance-routes
  ;; Minimal routes for maximum performance
  (dsl/GET "/health" [] (fn [_req reply]
                          (.send reply (clj->js {:status "ok"}))))
  (dsl/GET "/version" [] (fn [_req reply]
                           (.send reply (clj->js {:version "1.0.0"}))))

  ;; Optimized static serving
  (dsl/static-route "/:package/*" {:root "./packages"
                                   :index ["index.html"]
                                   :cache-control "max-age=31536000, immutable"
                                   :etag true
                                   :gzip true
                                   :brotli true}))

(dsl/defpackage-mounts performance-package-config
  {:scan-dirs ["./packages"]
   :exclude-patterns [#".*-test" #".*-dev"]
   :mount-strategy :auto
   :prefix-routes true})

;; Example 13: CDN-optimized configuration
(dsl/defconfig cdn-optimized-config
  {:server (dsl/server-config
            :port 80
            :host "0.0.0.0"
            :packages-dir "./packages"
            :static-assets true
            :health-endpoint true)
   :static (dsl/static-config
            :cache-control {:max-age 31536000 ; 1 year
                            :etag true
                            :gzip true
                            :brotli true
                            :immutable true})
   :cdn {:enabled true
         :domain (dsl/env-or "CDN_DOMAIN" "cdn.example.com")
         :cache-ttl 31536000
         :edge-locations ["us-east-1" "eu-west-1" "ap-southeast-1"]}})

;; ============================================================================
;; DEVELOPMENT WORKFLOW EXAMPLES
;; ============================================================================

;; Example 14: Development with hot reloading
(dsl/defconfig development-workflow-config
  {:server (dsl/server-config
            :port 3001
            :host "localhost"
            :packages-dir "./packages"
            :static-assets true
            :health-endpoint true
            :cors {:origin "*" :methods [:get :post :put :delete]})
   :packages (dsl/package-config
              :scan-dirs ["./packages"]
              :auto-reload true
              :watch-mode true
              :exclude-patterns [#".*-test"])
   :development {:hot-reload true
                 :live-reload true
                 :debug-logging true
                 :source-maps true
                 :dev-tools {:enabled true
                             :port 3002}}})

;; Example 15: Testing configuration
(dsl/defconfig testing-config
  {:server (dsl/server-config
            :port 0 ; Random port for testing
            :host "localhost"
            :packages-dir "./test-fixtures/packages"
            :static-assets false ; Disable for faster tests
            :health-endpoint true)
   :packages (dsl/package-config
              :scan-dirs ["./test-fixtures/packages"]
              :auto-reload false
              :mount-strategy :manual)
   :testing {:mock-services true
             :test-data true
             :fixtures {:enabled true
                        :auto-cleanup true}}})

;; ============================================================================
;; HANDLER EXAMPLES
;; ============================================================================

;; Example 16: Custom handlers
(defn health-handler
  "Custom health check handler"
  [_req reply]
  (.send reply (clj->js {:status "healthy"
                         :timestamp (js/Date.)
                         :uptime (.-uptime js/process)
                         :memory (.-memoryUsage js/process)})))

(defn version-handler
  "Version information handler"
  [_req reply]
  (.send reply (clj->js {:version "1.0.0"
                         :build-time (js/Date.)
                         :git-commit (or (aget js/process.env "GIT_COMMIT") "unknown")
                         :environment (or (aget js/process.env "NODE_ENV") "development")})))

(defn list-packages-handler
  "List available packages handler"
  [_req reply]
  (let [packages (dsl-core/create-package-mounts-with-config
                  {:scan-dirs ["./packages"]})]
    (.send reply (clj->js {:packages packages}))))

(defn diagnostics-handler
  "Diagnostics information handler"
  [_req reply]
  (.send reply (clj->js {:service "frontend-service"
                         :version "1.0.0"
                         :node-version (.-version js/process)
                         :platform (.-platform js/process)
                         :arch (.-arch js/process)
                         :memory (.-memoryUsage js/process)
                         :uptime (.-uptime js/process)})))

;; ============================================================================
;; INTEGRATION EXAMPLES
;; ============================================================================

;; Example 17: Complete application setup
(defn setup-frontend-service
  "Complete frontend service setup with all features"
  []
  (let [server-config @full-featured-service
        routes @full-routes
        package-config @advanced-package-config]

    (-> (dsl-core/compile-dsl-configuration
         {:server server-config
          :routes routes
          :packages package-config
          :security {:helmet true
                     :rate-limit {:max 100 :timeWindow "1 minute"}}
          :plugins [[:metrics {}]]
          :metrics {:enabled true :endpoint "/metrics"}
          :hot-reload (= (aget js/process.env "NODE_ENV") "development")})

        (dsl-core/wrap-error-handler)
        (dsl-core/wrap-request-logger))))

;; Example 18: Environment-based service creation
(defn create-service-for-environment
  "Create service based on environment"
  [env]
  (case env
    :development (setup-frontend-service)
    :production (let [prod-config @secure-production-config]
                  (dsl-core/compile-dsl-configuration prod-config))
    :testing (let [test-config @testing-config]
               (dsl-core/compile-dsl-configuration test-config))
    (throw (ex-info "Unknown environment" {:environment env}))))

;; ============================================================================
;; MIGRATION EXAMPLES
;; ============================================================================

;; Example 19: Migrating from imperative to declarative
;; Before (imperative):
(comment
  (defn create-old-server []
    (let [app (Fastify)]
      (.register app fastifyStatic
                 (clj->js {:root "./packages"
                           :prefix "/packages/"
                           :decorateReply false}))
      (.get app "/health" health-handler)
      (.listen app #js {:port 3000 :host "localhost"}))))

;; After (declarative with DSL):
(dsl/defserver migrated-service
  {:port 3000
   :host "localhost"
   :packages-dir "./packages"
   :static-assets true
   :health-endpoint true})

(dsl/defroutes migrated-routes
  (dsl/GET "/health" [] health-handler)
  (dsl/static-route "/packages/*" {:root "./packages"}))

;; Example 20: Gradual migration strategy
(defn migrate-gradually
  "Gradually migrate from old to new approach"
  []
  ;; Phase 1: Keep old server, add DSL for new routes
  (let [old-app (create-old-server)
        new-routes @migrated-routes]

    ;; Apply new routes to old app
    (doseq [{:keys [method path handler]} new-routes]
      (when (not= method :STATIC)
        (dsl-core/register-route-handler old-app method path handler)))

    old-app))

;; ============================================================================
;; BEST PRACTICES EXAMPLES
;; ============================================================================

;; Example 21: Configuration validation
(defn validate-and-create-service
  "Validate configuration before creating service"
  [config]
  (try
    (let [validated-config (dsl/validate-server-config config)]
      (dsl-core/create-server-with-config validated-config))
    (catch js/Error e
      (js/console.error "Invalid configuration:" e)
      nil)))

;; Example 22: Graceful error handling
(defn create-service-with-error-handling
  "Create service with comprehensive error handling"
  []
  (try
    (let [service (setup-frontend-service)]
      (.on service "error"
           (fn [err]
             (js/console.error "Service error:" err)
              ;; Implement error recovery logic
             )))
    (catch js/Error e
      (js/console.error "Failed to create service:" e)
      ;; Fallback to minimal service
      (dsl-core/create-server-with-config
       {:port 3000 :host "localhost"}))))

;; Example 23: Configuration composition
(defn compose-configurations
  "Compose multiple configurations"
  [& configs]
  (reduce merge {} configs))

;; Example usage:
(def composed-config
  (compose-configurations
   @development-config
   {:custom-feature true}
   {:experimental {:enabled true}}))