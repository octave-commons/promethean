(ns promethean.frontend-service.server
  (:require [typed.clojure :as t]
            [promethean.frontend-service.types :as types]
            [promethean.frontend-service.utils :as utils])
  (:require ["fastify" :as Fastify]
            ["@fastify/static" :as fastifyStatic]
            ["@promethean/web-utils" :as web-utils])
  (:require-macros [typed.clojure.macros :as tm]))

;; Typed namespace annotation
(t/ann-ns promethean.frontend-service.server)

;; ============================================================================
;; SERVER CREATION
;; ============================================================================

(t/defn create-server
  "Create a frontend service server with optional configuration"
  [options :- (t/U types/CreateServerOptions t/Nil)]
  :- types/ServerCreationPromise
  (t/promise
   (fn [resolve reject]
     (try
       (let [app (Fastify)
             resolved-options (or options {})
             repo-root (utils/resolve-repo-root js/__dirname)
             packages-dir (or (:packagesDir resolved-options)
                              (utils/default-packages-dir repo-root))
             package-mounts (utils/discover-package-mounts packages-dir)]

         ;; Register static file mounts for each package
         (doseq [{:keys [pkgPath prefix]} package-mounts]
           (let [dist-frontend (utils/dist-frontend-path pkgPath)
                 static-dir (utils/static-dir-path pkgPath)]

             ;; Mount dist/frontend if it exists
             (when (utils/file-exists? dist-frontend)
               (.register app fastifyStatic
                          (clj->js (utils/create-static-mount-config dist-frontend prefix))))

             ;; Mount static directory if it exists
             (when (utils/file-exists? static-dir)
               (.register app fastifyStatic
                          (clj->js (utils/create-static-mount-config-with-static static-dir prefix))))))

         ;; Service identity for health/diagnostics
         (let [service-identity {:serviceName "frontend-service"}]

           ;; Register health route
           (.then (.registerHealthRoute web-utils app (clj->js service-identity))
                  (fn [_]
                    ;; Register diagnostics route
                    (.then (.registerDiagnosticsRoute web-utils app (clj->js service-identity))
                           (fn [_]
                             ;; Add version route
                             (.get app "/version"
                                   (fn [_req reply]
                                     (.send reply (clj->js {:version "1.0.0"}))))

                             ;; Make server ready and resolve
                             (.then (.ready app)
                                    (fn [_]
                                      (resolve app)))))))))

       (catch :default e
         (reject e))))))

;; ============================================================================
;; SERVER LIFECYCLE
;; ============================================================================

(t/defn start-server
  "Start the server on the specified port"
  [server :- types/FastifyInstance
   port :- t/Int]
  :- (t/Promise t/Any)
  (.listen server #js {:port port :host "0.0.0.0"}))

(t/defn stop-server
  "Stop the server gracefully"
  [server :- types/FastifyInstance]
  :- (t/Promise t/Any)
  (.close server))

;; ============================================================================
;; TESTING HELPERS
;; ============================================================================

(t/defn create-test-server
  "Create a server for testing with custom packages directory"
  [packages-dir :- t/Str]
  :- types/ServerCreationPromise
  (create-server {:packagesDir packages-dir}))

(t/defn inject-request
  "Inject a test request into the server"
  [server :- types/FastifyInstance
   path :- t/Str]
  :- (t/Promise t/Any)
  (.inject server path))