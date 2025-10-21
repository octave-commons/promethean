(ns promethean.frontend-service.core
  (:require [typed.clojure :as t]
            [promethean.frontend-service.types :as types]
            [promethean.frontend-service.utils :as utils]
            [promethean.frontend-service.server :as server])
  (:require-macros [typed.clojure.macros :as tm]))

;; Typed namespace annotation
(t/ann-ns promethean.frontend-service.core)

;; Main entry point with proper typing
(t/defn ^:export create-server
  "Create a frontend service server with optional configuration"
  [options :- (t/U types/CreateServerOptions t/Nil)]
  :- types/FastifyInstance
  (server/create-server options))

;; Development entry point
(t/defn ^:export -main
  "Main entry point for the application"
  []
  (let [port (or (some-> (js/process.env.PORT) js/parseInt) 4500)
        server (create-server nil)]
    (.listen server #js {:port port :host "0.0.0.0"}
             (fn [err]
               (when err
                 (js/console.error err)
                 (js/process.exit 1))))))

;; Export the create-server function for external use
(set! (.-exports js/module) #js {:createServer create-server})