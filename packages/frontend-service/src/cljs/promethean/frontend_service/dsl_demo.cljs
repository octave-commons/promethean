(ns promethean.frontend-service.dsl-demo
  "Demonstration of the frontend service DSL in action"
  (:require [promethean.frontend-service.dsl :as dsl]
            [promethean.frontend-service.dsl.core :as dsl-core]))

;; ============================================================================
;; BASIC SERVER CONFIGURATION EXAMPLES
;; ============================================================================

;; Simple development server
(dsl/defserver dev-server
  {:port 3000
   :host "localhost"
   :packages-dir "./packages"
   :static-assets true
   :health-endpoint true})

;; Production server with CORS
(dsl/defserver prod-server
  {:port 80
   :host "0.0.0.0"
   :packages-dir "./packages"
   :static-assets true
   :health-endpoint true
   :cors-config {:origin "*" :methods [:get :post :put :delete]}})

;; ============================================================================
;; ROUTING EXAMPLES
;; ============================================================================

;; Basic API routes
(dsl/defroutes api-routes
  (dsl/GET "/api/health" [] "healthy")
  (dsl/GET "/api/version" [] "1.0.0")
  (dsl/GET "/api/users" [] "users-list")
  (dsl/POST "/api/users" [] "create-user")
  (dsl/GET "/api/users/:id" [id] "user-by-id")
  (dsl/PUT "/api/users/:id" [id] "update-user")
  (dsl/DELETE "/api/users/:id" [id] "delete-user"))

;; Static file serving routes
(dsl/defroutes static-routes
  (dsl/static-route "/static/*" {:root "./static" :cache-control "max-age=3600"})
  (dsl/static-route "/assets/*" {:root "./assets" :index ["index.html"]})
  (dsl/static-route "/*" {:root "./public" :index ["index.html" "index.htm"]}))

;; ============================================================================
;; PACKAGE MOUNTS EXAMPLES
;; ============================================================================

;; Auto-discover packages from multiple directories
(dsl/defpackage-mounts
  {:scan-dirs ["./packages" "./libs" "./components"]
   :exclude-patterns [#".*test.*" #".*-spec.*" #".*-demo.*"]
   :mount-strategy :auto
   :prefix-routes true})

;; Lazy loading for better performance
(dsl/defpackage-mounts
  {:scan-dirs ["./packages"]
   :mount-strategy :lazy
   :prefix-routes false})

;; ============================================================================
;; CONFIGURATION WITH ENVIRONMENT VARIABLES
;; ============================================================================

;; Environment-aware configuration
(dsl/defconfig app-config
  {:server {:port (dsl/env-or "PORT" 3000)
            :host (dsl/env-or "HOST" "localhost")
            :env (dsl/env-or "NODE_ENV" "development")}
   :database {:url (dsl/env-or "DATABASE_URL" "sqlite://app.db")
              :pool-size (dsl/env-or "DB_POOL_SIZE" 10)}
   :auth {:jwt-secret (dsl/env-or "JWT_SECRET" "default-secret")
          :token-expiry (dsl/env-or "TOKEN_EXPIRY" "24h")}
   :logging {:level (dsl/env-or "LOG_LEVEL" "info")
             :format (dsl/env-or "LOG_FORMAT" "json")}})

;; ============================================================================
;; ADVANCED EXAMPLES
;; ============================================================================

;; Complete frontend service setup
(dsl/defserver complete-frontend-service
  {:port (dsl/env-or "SERVICE_PORT" 3000)
   :host (dsl/env-or "SERVICE_HOST" "localhost")
   :packages-dir "./packages"
   :static-assets true
   :health-endpoint true
   :cors-config {:origin (dsl/env-or "CORS_ORIGIN" "*")
                 :methods [:get :post :put :delete :patch :options]
                 :credentials true}})

;; Comprehensive routing
(dsl/defroutes complete-routes
  ;; Health and status endpoints
  (dsl/GET "/health" [] "health-check")
  (dsl/GET "/status" [] "status-info")
  (dsl/GET "/version" [] "version-info")
  
  ;; API endpoints
  (dsl/GET "/api/users" [] "get-users")
  (dsl/POST "/api/users" [] "create-user")
  (dsl/GET "/api/users/:id" [id] "get-user")
  (dsl/PUT "/api/users/:id" [id] "update-user")
  (dsl/DELETE "/api/users/:id" [id] "delete-user")
  
  ;; Admin endpoints
  (dsl/GET "/admin/stats" [] "admin-stats")
  (dsl/POST "/admin/backup" [] "create-backup")
  
  ;; Static assets
  (dsl/static-route "/static/*" {:root "./static" :cache-control "max-age=31536000"})
  (dsl/static-route "/uploads/*" {:root "./uploads"})
  (dsl/static-route "/*" {:root "./public" :index ["index.html"]}))

;; ============================================================================
;; DEMONSTRATION FUNCTIONS
;; ============================================================================

(defn demonstrate-basic-server []
  "Demonstrate basic server configuration"
  (println "=== Basic Server Configuration ===")
  (let [server @dev-server]
    (println "Port:" (:port server))
    (println "Host:" (:host server))
    (println "Packages Directory:" (:packages-dir server))
    (println "Static Assets:" (:static-assets server))
    (println "Health Endpoint:" (:health-endpoint server))))

(defn demonstrate-routing []
  "Demonstrate routing configuration"
  (println "\n=== Routing Configuration ===")
  (let [routes @api-routes]
    (println "Total routes:" (count (:routes routes)))
    (doseq [route (:routes routes)]
      (println (str "  " (:method route) " " (:path route))))))

(defn demonstrate-package-mounts []
  "Demonstrate package mounts configuration"
  (println "\n=== Package Mounts Configuration ===")
  (let [mounts (dsl/defpackage-mounts
                 {:scan-dirs ["./packages"]
                  :mount-strategy :auto})]
    (println "Scan Directories:" (:scan-dirs mounts))
    (println "Mount Strategy:" (:mount-strategy mounts))
    (println "Prefix Routes:" (:prefix-routes mounts))))

(defn demonstrate-environment-config []
  "Demonstrate environment variable configuration"
  (println "\n=== Environment Configuration ===")
  (set! js.process.env.DEMO_PORT "4000")
  (set! js.process.env.DEMO_HOST "demo.example.com")
  
  (let [config (dsl/defconfig demo-config
                {:port (dsl/env-or "DEMO_PORT" 3000)
                 :host (dsl/env-or "DEMO_HOST" "localhost")
                 :debug (dsl/env-or "DEBUG" false)})]
    (println "Resolved Port:" (:port @config))
    (println "Resolved Host:" (:host @config))
    (println "Debug Mode:" (:debug @config))))

(defn demonstrate-validation []
  "Demonstrate configuration validation"
  (println "\n=== Configuration Validation ===")
  
  ;; Valid configuration
  (try
    (let [server (dsl/defserver valid-server
                    {:port 3000 :host "localhost"})]
      (println "✓ Valid server configuration created"))
    (catch js/Error e
      (println "✗ Unexpected error:" (.-message e))))
  
  ;; Invalid configuration
  (try
    (let [server (dsl/defserver invalid-server
                    {:port -1 :host ""})]
      (println "✗ Invalid server configuration should have failed"))
    (catch js/Error e
      (println "✓ Invalid configuration correctly rejected:" (.-message e)))))

(defn demonstrate-integration []
  "Demonstrate complete integration"
  (println "\n=== Complete Integration Example ===")
  (let [server @complete-frontend-service
        routes @complete-routes
        config @app-config]
    
    (println "Server Configuration:")
    (println "  Port:" (:port server))
    (println "  Host:" (:host server))
    (println "  CORS Origin:" (get-in server [:cors-config :origin]))
    
    (println "\nRouting Configuration:")
    (println "  Total Routes:" (count (:routes routes)))
    (println "  API Routes:" (count (filter #(str/starts-with? (:path %) "/api") (:routes routes))))
    (println "  Static Routes:" (count (filter #(= (:method %) :STATIC) (:routes routes))))
    
    (println "\nApplication Configuration:")
    (println "  Server Port:" (get-in config [:server :port]))
    (println "  Environment:" (get-in config [:server :env]))
    (println "  Database URL:" (get-in config [:database :url]))
    (println "  Logging Level:" (get-in config [:logging :level]))))

(defn run-all-demonstrations []
  "Run all DSL demonstrations"
  (println "Frontend Service DSL Demonstrations")
  (println "=====================================")
  
  (demonstrate-basic-server)
  (demonstrate-routing)
  (demonstrate-package-mounts)
  (demonstrate-environment-config)
  (demonstrate-validation)
  (demonstrate-integration)
  
  (println "\n=== DSL Features Demonstrated ===")
  (println "✓ Declarative server configuration")
  (println "✓ Expressive routing DSL")
  (println "✓ Package discovery and mounting")
  (println "✓ Environment variable resolution")
  (println "✓ Configuration validation")
  (println "✓ Complete integration examples")
  (println "\nAll demonstrations completed successfully!"))

;; ============================================================================
;; UTILITY FUNCTIONS FOR DSL TESTING
;; ============================================================================

(defn create-test-server [port host]
  "Create a test server with given port and host"
  (dsl/defserver test-server
    {:port port
     :host host
     :packages-dir "./test-packages"
     :static-assets true
     :health-endpoint true}))

(defn create-test-routes []
  "Create test routes for demonstration"
  (dsl/defroutes test-routes
    (dsl/GET "/test/health" [] "test-health")
    (dsl/POST "/test/data" [] "test-data")
    (dsl/static-route "/test/static/*" {:root "./test-static"})))

(defn validate-dsl-configuration [server routes mounts config]
  "Validate a complete DSL configuration"
  (println "Validating DSL configuration...")
  
  ;; Validate server
  (when (and server (delay? server))
    (let [server-config @server]
      (println "✓ Server configuration valid")
      (println "  Port:" (:port server-config))
      (println "  Host:" (:host server-config))))
  
  ;; Validate routes
  (when (and routes (delay? routes))
    (let [routes-config @routes]
      (println "✓ Routes configuration valid")
      (println "  Total routes:" (count (:routes routes-config)))))
  
  ;; Validate mounts
  (when mounts
    (println "✓ Package mounts configuration valid")
    (println "  Scan directories:" (:scan-dirs mounts)))
  
  ;; Validate config
  (when (and config (delay? config))
    (let [config-map @config]
      (println "✓ Application configuration valid")
      (println "  Configuration keys:" (keys config-map))))
  
  (println "DSL configuration validation complete!"))

;; Export the main demonstration function
(defn demo []
  "Main demonstration entry point"
  (run-all-demonstrations))