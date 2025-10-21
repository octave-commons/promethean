(ns promethean.frontend-service.dsl-macros
  "Macros for the frontend service DSL"
  (:require [clojure.spec.alpha :as s]))

;; ============================================================================
;; DSL VALIDATION SPECS (in macros file for compile-time access)
;; ============================================================================

(s/def ::port (s/and int? #(<= 1 % 65535)))
(s/def ::host string?)
(s/def ::packages-dir string?)
(s/def ::static-assets boolean?)
(s/def ::health-endpoint boolean?)
(s/def ::cors-origin (s/nilable string?))
(s/def ::cors-methods (s/coll-of keyword?))
(s/def ::cors-config (s/keys :req-un [::cors-origin ::cors-methods]))
(s/def ::security-config (s/keys :opt-un [::cors-config]))
(s/def ::route-path string?)
(s/def ::route-method keyword?)
(s/def ::route-handler any?)
(s/def ::route (s/tuple ::route-path ::route-method ::route-handler))
(s/def ::routes (s/coll-of ::route))
(s/def ::server-config (s/keys :req-un [::port ::host]
                                   :opt-un [::packages-dir ::static-assets ::health-endpoint ::security-config]))
(s/def ::package-name string?)
(s/def ::package-path string?)
(s/def ::package (s/tuple ::package-name ::package-path))
(s/def ::packages (s/coll-of ::package))
(s/def ::mount-strategy keyword?)
(s/def ::scan-dirs (s/coll-of string?))
(s/def ::prefix-routes boolean?)
(s/def ::package-mounts (s/keys :req-un [::packages]
                                   :opt-un [::mount-strategy ::scan-dirs ::prefix-routes]))
(s/def ::config-name symbol?)
(s/def ::config-value any?)
(s/def ::config-map (s/map-of keyword? ::config-value))

;; ============================================================================
;; CORE DSL MACROS
;; ============================================================================

(defmacro defserver
  "Define a frontend service server with comprehensive configuration options.
   
   Usage:
   ```clojure
   (defserver my-server
     {:port 3000
      :host \"localhost\"
      :packages-dir \"./packages\"
      :static-assets true
      :health-endpoint true
      :security {:cors {:origin \"*\" :methods [:get :post]}}})
   ```"
  [name config]
  `(do
     (when-not (s/valid? ::server-config ~config)
       (throw (ex-info "Invalid server configuration" 
                      {:problems (s/explain-data ::server-config ~config)})))
     (def ~name (atom ~config))
     (println "Server" '~name "configured with:" ~config)
     ~name))

(defmacro defroutes
  "Define routes for the frontend service with validation.
   
   Usage:
   ```clojure
   (defroutes api-routes
     [[\"/api/users\" :get get-users]
      [\"/api/posts\" :post create-post]
      [\"/api/posts/:id\" :get get-post]])
   ```"
  [name route-defs]
  `(do
     (when-not (s/valid? ::routes ~route-defs)
       (throw (ex-info "Invalid routes configuration" 
                      {:problems (s/explain-data ::routes ~route-defs)})))
     (def ~name (atom ~route-defs))
     (println "Routes" '~name "defined with" (count ~route-defs) "routes")
     ~name))

(defmacro defpackage-mounts
  "Define package mounting configuration with flexible options.
   
   Usage:
   ```clojure
   (defpackage-mounts my-mounts
     {:packages [[\"@promethean/core\" \"./packages/core\"]
                 [\"@promethean/ui\" \"./packages/ui\"]]
      :mount-strategy :lazy
      :scan-dirs [\"./packages\"]
      :prefix-routes true})
   ```"
  [name config]
  `(do
     (when-not (s/valid? ::package-mounts ~config)
       (throw (ex-info "Invalid package mounts configuration" 
                      {:problems (s/explain-data ::package-mounts ~config)})))
     (def ~name (atom ~config))
     (println "Package mounts" '~name "configured for" (count (:packages ~config)) "packages")
     ~name))

(defmacro defconfig
  "Define a general configuration with environment variable support.
   
   Usage:
   ```clojure
   (defconfig app-config
     {:port (env-or \"PORT\" 3000)
      :host (env-or \"HOST\" \"localhost\")
      :debug (env-or \"DEBUG\" false)})
   ```"
  [name config]
  `(do
     (def ~name (atom ~config))
     (println "Configuration" '~name "defined")
     ~name))

;; ============================================================================
;; ROUTING MACROS
;; ============================================================================

(defmacro GET [path args & body]
  `[:get ~path (fn ~args ~@body)])

(defmacro POST [path args & body]
  `[:post ~path (fn ~args ~@body)])

(defmacro PUT [path args & body]
  `[:put ~path (fn ~args ~@body)])

(defmacro DELETE [path args & body]
  `[:delete ~path (fn ~args ~@body)])

(defmacro PATCH [path args & body]
  `[:patch ~path (fn ~args ~@body)])

(defmacro HEAD [path args & body]
  `[:head ~path (fn ~args ~@body)])

(defmacro OPTIONS [path args & body]
  `[:options ~path (fn ~args ~@body)])

(defmacro static-route [path config]
  `[:static ~path ~config])

(defmacro route [method path args & body]
  `[~method ~path (fn ~args ~@body)])

;; ============================================================================
;; CONFIGURATION MACROS
;; ============================================================================

(defmacro server-config [& kvs]
  `(hash-map ~@kvs))

(defmacro package-config [& kvs]
  `(hash-map ~@kvs))

(defmacro static-config [& kvs]
  `(hash-map ~@kvs))

(defmacro env-or [env-var default-value]
  `(or (some-> js/process.env (aget ~env-var))
       ~default-value))