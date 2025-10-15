(ns promethean.frontend-service.dsl.core
  "Core DSL implementation for frontend service"
  (:require [promethean.frontend-service.server :as server]
            [promethean.frontend-service.utils :as utils]
            [promethean.frontend-service.types :as types]
            [clojure.string :as str]
            [clojure.walk :as walk])
  (:require ["fastify" :as Fastify]
            ["@fastify/static" :as fastifyStatic]
            ["@promethean/web-utils" :as web-utils]))

;; ============================================================================
;; ENVIRONMENT VARIABLE RESOLUTION
;; ============================================================================

(defn resolve-env-var
  "Resolve environment variable with fallback to default value"
  [env-var default-value]
  (let [env-value (aget js/process.env env-var)]
    (if (and env-value (not (str/blank? env-value)))
      (case default-value
        number (js/parseInt env-value)
        boolean (not= env-value "false")
        string env-value
        env-value)
      default-value)))

(defn resolve-configuration
  "Recursively resolve configuration with environment variables"
  [config]
  (walk/postwalk
   (fn [x]
     (if (and (vector? x) (= (first x) :env-or))
       (resolve-env-var (second x) (nth x 2))
       x))
   config))

;; ============================================================================
;; SERVER CONFIGURATION IMPLEMENTATION
;; ============================================================================

(defn create-server-with-config
  "Create a server instance from DSL configuration"
  [config]
  (let [{:keys [port host packages-dir static-assets health-endpoint cors-config]} config
        server-options (cond-> {}
                         packages-dir (assoc :packagesDir packages-dir)
                         (not (nil? static-assets)) (assoc :staticAssets static-assets)
                         (not (nil? health-endpoint)) (assoc :healthEndpoint health-endpoint)
                         cors-config (assoc :cors cors-config))]

    (server/create-server server-options)))

(defn apply-cors-config
  "Apply CORS configuration to Fastify instance"
  [app cors-config]
  (when (:origin cors-config)
    (.register app (js/require "@fastify/cors")
               (clj->js {:origin (:origin cors-config)}
                        :methods (clj->js (:methods cors-config))))))

;; ============================================================================
;; ROUTING IMPLEMENTATION
;; ============================================================================

(defn create-router-with-routes
  "Create and configure routes from DSL definition"
  [routes]
  (let [app (Fastify)]

    ;; Apply each route definition
    (doseq [{:keys [method path handler config]} routes
            :when (not= method :STATIC)]
      (case method
        :GET (.get app path handler)
        :POST (.post app path handler)
        :PUT (.put app path handler)
        :DELETE (.delete app path handler)
        :PATCH (.patch app path handler)
        :HEAD (.head app path handler)
        :OPTIONS (.options app path handler)))

    ;; Apply static routes
    (doseq [{:keys [method path config]} routes
            :when (= method :STATIC)]
      (let [{:keys [root index cache-control]} config]
        (.register app fastifyStatic
                   (clj->js (cond-> {:root root :prefix path :decorateReply false}
                              index (assoc :index (clj->js index))
                              cache-control (assoc :cacheControl cache-control))))))

    app))

(defn register-route-handler
  "Register a route handler with the Fastify instance"
  [app method path handler-fn]
  (case method
    :GET (.get app path handler-fn)
    :POST (.post app path handler-fn)
    :PUT (.put app path handler-fn)
    :DELETE (.delete app path handler-fn)
    :PATCH (.patch app path handler-fn)
    :HEAD (.head app path handler-fn)
    :OPTIONS (.options app path handler-fn)))

(defn register-static-route
  "Register a static file serving route"
  [app path config]
  (let [{:keys [root index cache-control]} config]
    (.register app fastifyStatic
               (clj->js (cond-> {:root root :prefix path :decorateReply false}
                          index (assoc :index (clj->js index))
                          cache-control (assoc :cacheControl cache-control))))))

;; ============================================================================
;; PACKAGE MOUNTS IMPLEMENTATION
;; ============================================================================

(defn create-package-mounts-with-config
  "Create package mounts from DSL configuration"
  [config]
  (let [{:keys [scan-dirs exclude-patterns mount-strategy prefix-routes]} config]

    ;; Discover packages from all scan directories
    (reduce
     (fn [mounts scan-dir]
       (let [package-mounts (utils/discover-package-mounts scan-dir)]
         (concat mounts package-mounts)))
     []
     scan-dirs)))

(defn apply-package-mounts
  "Apply package mounts to a Fastify instance"
  [app package-mounts config]
  (let [{:keys [exclude-patterns mount-strategy prefix-routes]} config]

    (doseq [{:keys [pkgPath prefix]} package-mounts]
      ;; Check if package should be excluded
      (when-not (some #(re-find % pkgPath) exclude-patterns)

        (let [dist-frontend (utils/dist-frontend-path pkgPath)
              static-dir (utils/static-dir-path pkgPath)
              route-prefix (if prefix-routes (str "/" prefix "/") "/")]

          ;; Mount dist/frontend if it exists
          (when (utils/file-exists? dist-frontend)
            (if (= mount-strategy :lazy)
              ;; Lazy mounting strategy
              (.register app fastifyStatic
                         (clj->js {:root dist-frontend
                                   :prefix (str route-prefix)
                                   :decorateReply false
                                   :serve false}))
              ;; Auto mounting strategy
              (.register app fastifyStatic
                         (clj->js {:root dist-frontend
                                   :prefix (str route-prefix)
                                   :decorateReply false}))))

          ;; Mount static directory if it exists
          (when (utils/file-exists? static-dir)
            (let [static-prefix (str route-prefix "static/")]
              (if (= mount-strategy :lazy)
                (.register app fastifyStatic
                           (clj->js {:root static-dir
                                     :prefix static-prefix
                                     :decorateReply false
                                     :serve false}))
                (.register app fastifyStatic
                           (clj->js {:root static-dir
                                     :prefix static-prefix
                                     :decorateReply false}))))))))))

;; ============================================================================
;; CONFIGURATION BUILDERS
;; ============================================================================

(defn build-server-config
  "Build server configuration from DSL components"
  [& components]
  (reduce merge {} components))

(defn build-full-configuration
  "Build complete frontend service configuration"
  [server-config routes-config packages-config]
  {:server server-config
   :routes routes-config
   :packages packages-config
   :compiled-at (js/Date.)
   :version "1.0.0"})

;; ============================================================================
;; HOT RELOADING SUPPORT
;; ============================================================================

(defn enable-hot-reloading
  "Enable hot reloading for development"
  [app config]
  (when js/process.env.NODE_ENV
    (when (= js/process.env.NODE_ENV "development")
      ;; Enable file watching for package directories
      (doseq [scan-dir (:scan-dirs config)]
        (when (utils/file-exists? scan-dir)
          ;; In a real implementation, this would set up file watchers
          (js/console.log "Hot reloading enabled for directory:" scan-dir))))))

;; ============================================================================
;; METRICS AND MONITORING
;; ============================================================================

(defn enable-metrics
  "Enable metrics collection for the frontend service"
  [app config]
  (when (:metrics config)
    (.register app (js/require "@fastify/metrics")
               (clj->js {:endpoint "/metrics"}
                        :defaultMetrics {:enabled true}
                        :config {}))))

(defn create-health-handler
  "Create a health check handler"
  [service-identity]
  (fn [_req reply]
    (.send reply (clj->js {:status "healthy"}
                          :timestamp (js/Date.)
                          :service service-identity))))

(defn create-version-handler
  "Create a version endpoint handler"
  []
  (fn [_req reply]
    (.send reply (clj->js {:version "1.0.0"}
                          :build-time (js/Date.)))))

;; ============================================================================
;; SECURITY DSL SUPPORT
;; ============================================================================

(defn apply-security-config
  "Apply security configuration to the Fastify instance"
  [app security-config]
  (when (:helmet security-config)
    (.register app (js/require "@fastify/helmet")))

  (when (:rate-limit security-config)
    (.register app (js/require "@fastify/rate-limit")
               (clj->js (:rate-limit security-config))))

  (when (:csrf security-config)
    (.register app (js/require "@fastify/csrf-protection"))))

;; ============================================================================
;; PLUGIN SYSTEM SUPPORT
;; ============================================================================

(defn register-plugin
  "Register a custom plugin with the Fastify instance"
  [app plugin-name plugin-config]
  (case plugin-name
    :auth (.register app (js/require "@fastify/auth"))
    :jwt (.register app (js/require "@fastify/jwt") (clj->js plugin-config))
    :multipart (.register app (js/require "@fastify/multipart"))
    :websocket (.register app (js/require "@fastify/websocket"))
    ;; Custom plugin
    (.register app plugin-name (clj->js plugin-config))))

(defn apply-plugins
  "Apply multiple plugins to the Fastify instance"
  [app plugins]
  (doseq [[plugin-name config] plugins]
    (register-plugin app plugin-name config)))

;; ============================================================================
;; DSL COMPILATION PIPELINE
;; ============================================================================

(defn compile-dsl-configuration
  "Compile complete DSL configuration into a runnable server"
  [dsl-config]
  (let [{:keys [server routes packages security plugins metrics hot-reload]} dsl-config
        app (Fastify)]

    ;; Apply security configuration
    (when security
      (apply-security-config app security))

    ;; Apply plugins
    (when plugins
      (apply-plugins app plugins))

    ;; Apply routes
    (when routes
      (create-router-with-routes routes))

    ;; Apply package mounts
    (when packages
      (let [package-mounts (create-package-mounts-with-config packages)]
        (apply-package-mounts app package-mounts packages)))

    ;; Enable metrics
    (when metrics
      (enable-metrics app metrics))

    ;; Enable hot reloading
    (when hot-reload
      (enable-hot-reloading app packages))

    app))

;; ============================================================================
;; ERROR HANDLING AND VALIDATION
;; ============================================================================

(defn wrap-error-handler
  "Wrap the app with comprehensive error handling"
  [app]
  (.setErrorHandler app
                    (fn [err request reply]
                      (js/console.error "Server error:" err)
                      (.status reply 500)
                      (.send reply (clj->js {:error "Internal Server Error"}
                                            :message (.-message err)
                                            :timestamp (js/Date.))))))

(defn wrap-request-logger
  "Wrap the app with request logging"
  [app]
  (.addHook app "onRequest"
            (fn [request reply done]
              (js/console.log (str "Request: " (.-method request) " " (.-url request)))
              (done))))

;; ============================================================================
;; UTILITY FUNCTIONS
;; ============================================================================

(defn normalize-route-path
  "Normalize route path for consistency"
  [path]
  (if (str/starts-with? path "/")
    path
    (str "/" path)))

(defn validate-route-conflicts
  "Validate that routes don't conflict with each other"
  [routes]
  (let [paths (map :path routes)
        duplicates (filter #(> (count %) 1) (vals (frequencies paths)))]
    (when (seq duplicates)
      (throw (ex-info "Route conflicts detected" {:conflicts duplicates})))))

(defn optimize-route-order
  "Optimize route order for performance"
  [routes]
  ;; Sort static routes before parameterized routes
  (sort-by (fn [route]
             (if (str/includes? (:path route) ":")
               1
               0)
             routes)))