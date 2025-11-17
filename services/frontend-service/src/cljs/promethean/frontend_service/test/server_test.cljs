(ns promethean.frontend-service.test.server-test
  (:require [typed.clojure :as t]
            [promethean.frontend-service.types :as types]
            [promethean.frontend-service.utils :as utils]
            [promethean.frontend-service.server :as server]
            [cljs.test :refer [deftest testing is async use-fixtures]])
  (:require ["fs" :as fs]
            ["os" :as os]
            ["path" :as path])
  (:require-macros [typed.clojure.macros :as tm]))

;; Typed namespace annotation
(t/ann-ns promethean.frontend-service.test.server-test)

;; ============================================================================
;; TEST FIXTURES
;; ============================================================================

(t/defn create-package-fixture
  "Create a package fixture in the given root directory"
  [root :- t/Str
   pkg :- types/PackageFixture]
  :- t/Nil
  (let [pkg-dir (path/join root (:dir pkg))]
    (.mkdirSync pkg-dir #js {:recursive true})
    (utils/write-file {:filePath (path/join pkg-dir "package.json")
                       :contents (js/JSON.stringify (clj->js {:name (:name pkg)}) nil 2)})

    ;; Create dist files
    (when-let [dist-files (:distFiles pkg)]
      (doseq [[rel-path contents] (js/Object.entries dist-files)]
        (utils/write-file {:filePath (path/join pkg-dir "dist" rel-path)
                           :contents contents})))

    ;; Create static files
    (when-let [static-files (:staticFiles pkg)]
      (doseq [[rel-path contents] (js/Object.entries static-files)]
        (utils/write-file {:filePath (path/join pkg-dir "static" rel-path)
                           :contents contents})))))

(t/defn setup-packages-fixture
  "Set up a temporary packages directory with test fixtures"
  []
  :- t/Str
  (let [root (.mkdtempSync fs (path/join (.tmpdir os) "frontend-service-test-"))
        fixtures [{:dir "piper"
                   :name "@promethean/piper"
                   :distFiles {"frontend/main.js" "export default 'ok';"}}
                  {:dir "llm-chat-frontend"
                   :name "@promethean/llm-chat-frontend"
                   :staticFiles {"index.html" "<html></html>"}}
                  {:dir "smart-chat-frontend"
                   :name "@promethean/smart-chat-frontend"
                   :staticFiles {"index.html" "<html></html>"}}]]
    (doseq [pkg fixtures]
      (create-package-fixture root pkg))
    root))

(t/defn start-app
  "Start the app with a test packages fixture"
  []
  :- (t/Promise (t/HMap :mandatory {:packagesDir t/Str
                                    :app types/FastifyInstance}))
  (t/promise
   (fn [resolve reject]
     (let [packages-dir (setup-packages-fixture)]
       (.then (server/create-test-server packages-dir)
              (fn [app]
                (resolve {:packagesDir packages-dir :app app}))
              (fn [err]
                (reject err)))))))

;; ============================================================================
;; TESTS
;; ============================================================================

(deftest health-route-test
  (async done
         (.then (start-app)
                (fn [{:keys [packages-dir app]}]
                  (.then (server/inject-request app "/health")
                         (fn [res]
                           (try
                             (is (= 200 (.-statusCode res)) "Health route should return 200")
                             (.rmSync fs packages-dir #js {:recursive true :force true})
                             (.then (server/stop-server app)
                                    (fn [_] (done)))
                             (catch :default e
                               (js/console.error "Error in health route test:" e)
                               (done))))
                         (fn [err]
                           (js/console.error "Health route injection failed:" err)
                           (done))))
                (fn [err]
                  (js/console.error "Failed to start app for health test:" err)
                  (done)))))

(deftest diagnostics-route-test
  (async done
         (.then (start-app)
                (fn [{:keys [packagesDir app]}]
                  (.then (server/inject-request app "/diagnostics")
                         (fn [res]
                           (try
                             (is (= 200 (.-statusCode res)) "Diagnostics route should return 200")
                             (.rmSync fs packagesDir #js {:recursive true :force true})
                             (.then (server/stop-server app)
                                    (fn [_] (done)))
                             (catch :default e
                               (js/console.error "Error in diagnostics route test:" e)
                               (done))))
                         (fn [err]
                           (js/console.error "Diagnostics route injection failed:" err)
                           (done))))
                (fn [err]
                  (js/console.error "Failed to start app for diagnostics test:" err)
                  (done)))))

(deftest piper-frontend-asset-test
  (async done
         (.then (start-app)
                (fn [{:keys [packagesDir app]}]
                  (.then (server/inject-request app "/piper/main.js")
                         (fn [res]
                           (try
                             (is (= 200 (.-statusCode res)) "Should serve piper frontend asset")
                             (.rmSync fs packagesDir #js {:recursive true :force true})
                             (.then (server/stop-server app)
                                    (fn [_] (done)))
                             (catch :default e
                               (js/console.error "Error in piper asset test:" e)
                               (done))))
                         (fn [err]
                           (js/console.error "Piper asset injection failed:" err)
                           (done))))
                (fn [err]
                  (js/console.error "Failed to start app for piper test:" err)
                  (done)))))

(deftest static-asset-tests
  (testing "Static assets for various packages"
    (doseq [pkg-name ["llm-chat-frontend" "smart-chat-frontend"]]
      (async done
             (.then (start-app)
                    (fn [{:keys [packagesDir app]}]
                      (.then (server/inject-request app (str "/" pkg-name "/static/index.html"))
                             (fn [res]
                               (try
                                 (is (= 200 (.-statusCode res))
                                     (str "Should serve static asset for " pkg-name))
                                 (.rmSync fs packagesDir #js {:recursive true :force true})
                                 (.then (server/stop-server app)
                                        (fn [_] (done)))
                                 (catch :default e
                                   (js/console.error "Error in static asset test:" e)
                                   (done))))
                             (fn [err]
                               (js/console.error "Static asset injection failed:" err)
                               (done))))
                    (fn [err]
                      (js/console.error "Failed to start app for static test:" err)
                      (done)))))))

;; ============================================================================
;; UTILS TESTS
;; ============================================================================

(deftest package-name-for-dir-test
  (testing "Extract package name from package.json"
    (let [root (.mkdtempSync fs (path/join (.tmpdir os) "package-name-test-"))
          pkg-dir (path/join root "test-pkg")]
      (try
        (.mkdirSync pkg-dir #js {:recursive true})
        (utils/write-file {:filePath (path/join pkg-dir "package.json")
                           :contents (js/JSON.stringify (clj->js {:name "@promethean/test-package"}) nil 2)})

        (let [result (utils/package-name-for-dir {:pkgDir pkg-dir :fallback "test-pkg"})]
          (is (= "@promethean/test-package" result) "Should extract correct package name"))

        (finally
          (.rmSync fs root #js {:recursive true :force true}))))))

(deftest url-prefix-from-pkg-name-test
  (testing "Convert package name to URL prefix"
    (is (= "test-package"
           (utils/url-prefix-from-pkg-name {:name "@promethean/test-package"}))
        "Should handle @promethean/ scoped packages")

    (is (= "regular-package"
           (utils/url-prefix-from-pkg-name {:name "regular-package"}))
        "Should handle regular package names")))

(deftest discover-package-mounts-test
  (testing "Discover package mounts in directory"
    (let [packages-dir (setup-packages-fixture)]
      (try
        (let [mounts (utils/discover-package-mounts packages-dir)]
          (is (= 3 (count mounts)) "Should discover 3 packages")
          (is (some #(= "piper" (:prefix %)) mounts) "Should include piper package")
          (is (some #(= "llm-chat-frontend" (:prefix %)) mounts) "Should include llm-chat-frontend")
          (is (some #(= "smart-chat-frontend" (:prefix %)) mounts) "Should include smart-chat-frontend"))

        (finally
          (.rmSync fs packages-dir #js {:recursive true :force true}))))))