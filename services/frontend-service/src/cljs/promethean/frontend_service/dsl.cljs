(ns promethean.frontend-service.dsl
  "Comprehensive DSL for frontend service configuration and management"
  (:require [clojure.spec.alpha :as s]
            [clojure.walk :as walk]
            [clojure.string :as str])
  (:require-macros [promethean.frontend-service.dsl-macros 
                   :refer [defserver defroutes defpackage-mounts defconfig 
                           GET POST PUT DELETE PATCH HEAD OPTIONS 
                           static-route route server-config package-config 
                           static-config env-or]]))

;; ============================================================================
;; RUNTIME FUNCTIONS
;; ============================================================================

(defn normalize-path
  "Normalize a file path for cross-platform compatibility."
  [path]
  (str/replace path "\\" "/"))

(defn validate-route-conflicts
  "Check for conflicting routes in the route definitions."
  [routes]
  (let [paths (map first routes)
        duplicates (->> paths
                        frequencies
                        (filter #(> (val %) 1))
                        keys)]
    (when (seq duplicates)
      (throw (ex-info "Route conflicts detected" 
                     {:conflicts duplicates})))))

(defn resolve-package-path
  "Resolve the actual path for a package, considering node_modules and custom paths."
  [package-name base-path]
  (let [node-modules-path (normalize-path (str base-path "/node_modules/" package-name))
        custom-path (normalize-path (str base-path "/" package-name))]
    (cond
      (.existsSync js/fs node-modules-path) node-modules-path
      (.existsSync js/fs custom-path) custom-path
      :else (throw (ex-info "Package path not found" 
                           {:package package-name :base-path base-path})))))

(defn create-route-handler
  "Create a route handler function from the DSL route definition."
  [route-def]
  (let [[method path handler] route-def]
    {:method method
     :path path
     :handler handler
     :metadata {:created-at (js/Date.)
                :type (if (= :static method) :static :dynamic)}}))

(defn mount-package
  "Mount a package with the given configuration."
  [package-name package-path mount-strategy]
  (case mount-strategy
    :eager (println "Eagerly loading package:" package-name)
    :lazy (println "Lazily loading package:" package-name)
    :dynamic (println "Dynamic loading for package:" package-name)
    (throw (ex-info "Unknown mount strategy" {:strategy mount-strategy}))))

(defn apply-security-config
  "Apply security configuration to the server."
  [security-config server-instance]
  (when-let [cors-config (:cors security-config)]
    (println "Applying CORS configuration:" cors-config))
  ;; Additional security configurations would be applied here
  server-instance)

(defn start-server
  "Start the server with the given configuration."
  [server-config routes package-mounts]
  (println "Starting server with configuration:" server-config)
  (validate-route-conflicts @routes)
  (let [server-instance {:config server-config
                         :routes @routes
                         :packages @package-mounts
                         :status :starting}]
    (when-let [security-config (:security server-config)]
      (apply-security-config security-config server-instance))
    (assoc server-instance :status :running)))

(defn stop-server
  "Stop the server gracefully."
  [server-instance]
  (println "Stopping server...")
  (assoc server-instance :status :stopped))

;; ============================================================================
;; UTILITY FUNCTIONS
;; ============================================================================

(defn get-route-by-path
  "Find a route by its path."
  [routes path]
  (some #(when (= (first %) path) %) @routes))

(defn get-package-by-name
  "Find a package configuration by name."
  [package-mounts package-name]
  (some #(when (= (first %) package-name) %) @package-mounts))

(defn reload-package
  "Reload a package with the given name."
  [package-name]
  (println "Reloading package:" package-name)
  ;; In a real implementation, this would invalidate require caches
  true)

(defn health-check
  "Perform a health check on the server."
  [server-instance]
  {:status (:status server-instance)
   :timestamp (js/Date.)
   :uptime (if-let [start-time (:started-at server-instance)]
             (- (js/Date.) start-time)
             0)
   :routes-count (count (:routes server-instance))
   :packages-count (count (:packages server-instance))})