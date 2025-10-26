(ns test-integration
  "Comprehensive integration tests for Opencode Unified Editor"
  (:require [opencode-unified.main :as main]
            [opencode-unified.state :as state]
            [opencode-unified.buffers :as buffers]
            [opencode-unified.evil :as evil]
            [opencode-unified.keymap :as keymap]
            [opencode-unified.layout :as layout]
            [opencode-unified.plugins :as plugins]
            [opencode-unified.opencode :as opencode]
            [opencode-unified.ui :as ui]
            [clojure.test :refer [deftest testing is async use-fixtures]]))

;; Mock environment setup
(defn mock-electron-api []
  "Mock Electron APIs for testing"
  {:ipcRenderer {:invoke (fn [cmd & args] #js {:success true})
                 :on (fn [event handler] nil)
                 :removeAllListeners (fn [event] nil)}
   :app {:getPath (fn [name] "/mock/path")}
   :shell {:openExternal (fn [url] (js/Promise.resolve true))}})

(defn setup-test-env [f]
  "Setup test environment"
  (println "Setting up integration test environment...")
  ;; Set up mock Electron API
  (set! js/electron (mock-electron-api))
  ;; Initialize test state
  (state/reset-test-state!)
  (f)
  (println "Cleaning up integration test environment..."))

(use-fixtures :each setup-test-env)

(deftest test-system-initialization
  (testing "System can initialize all components"
    (async done
           (-> (main/init-app)
               (.then (fn [config]
                        (is (some? config) "App should initialize with config")
                        (is (map? config) "Config should be a map")
                        (done)))
               (.catch (fn [error]
                         (is nil error "Initialization should not fail")
                         (done))))))

  (deftest test-plugin-system-integration
    (testing "Plugin system can discover and load plugins"
      (async done
             (-> (plugins/initialize-plugins)
                 (.then (fn [plugin-manager]
                          (is (some? plugin-manager) "Plugin manager should be initialized")
                          (let [loaded-plugins (plugins/get-loaded-plugins plugin-manager)]
                            (is (>= (count loaded-plugins) 1) "Should load at least one plugin")
                            (let [plugin-names (map :name loaded-plugins)]
                              (is (some #{"example-plugin"} plugin-names) "Should load example plugin"))))
                        (done)))
             (.catch (fn [error]
                       (is nil error "Plugin system should not fail")
                       (done))))))

  (deftest test-opencode-integration
    (testing "Opencode SDK integration works"
      (async done
             (-> (opencode/initialize-opencode)
                 (.then (fn [opencode-config]
                          (is (some? opencode-config) "Opencode should initialize")
                          (-> (opencode/execute-opencode-command "test-command" {})
                              (.then (fn [result]
                                       (is (some? result) "Command should return result"))
                                     (done))
                              (.catch (fn [error]
                                        (is nil error "Command execution should not fail")
                                        (done))))))
                 (.catch (fn [error]
                           (is nil error "Opencode initialization should not fail")
                           (done)))))))

  (deftest test-workspace-persistence
    (testing "Workspace can save and load state"
      (async done
             (let [test-workspace {:buffers [{:id "test-buffer" :content "test content" :path "/test.txt"}]
                                   :layout {:active-buffer "test-buffer"}
                                   :plugins {"example-plugin" {:enabled true}}}]
               (-> (state/save-workspace "test-workspace.json")
                   (.then (fn [save-result]
                            (is (true? save-result) "Workspace should save successfully")
                            (-> (state/load-workspace "test-workspace.json")
                                (.then (fn [loaded-workspace]
                                         (is (some? loaded-workspace) "Workspace should load")
                                         (is (= "test content"
                                                (get-in loaded-workspace [:buffers 0 :content]))
                                             "Content should be preserved"))
                                       (done))
                                (.catch (fn [error]
                                          (is nil error "Workspace load should not fail")
                                          (done))))))
                   (.catch (fn [error]
                             (is nil error "Workspace save should not fail")
                             (done))))))))

  (deftest test-buffer-and-evil-integration
    (testing "Buffers work with Evil mode"
      (async done
             (-> (buffers/create-buffer "test.txt" "Line 1\nLine 2\nLine 3")
                 (.then (fn [buffer]
                          (is (some? buffer) "Buffer should be created")
                          (is (contains? buffer :id) "Buffer should have ID")
                          (-> (evil/enter-normal-mode (:id buffer))
                              (.then (fn [normal-result]
                                       (is (true? normal-result) "Should enter normal mode")
                                       (-> (evil/enter-insert-mode (:id buffer))
                                           (.then (fn [insert-result]
                                                    (is (true? insert-result) "Should enter insert mode"))
                                                  (done))
                                           (.catch (fn [error]
                                                     (is nil error "Insert mode should not fail")
                                                     (done))))))
                              (.catch (fn [error]
                                        (is nil error "Normal mode should not fail")
                                        (done))))))
                 (.catch (fn [error]
                           (is nil error "Buffer creation should not fail")
                           (done)))))))

  (deftest test-keymap-integration
    (testing "Keymap system integrates with components"
      (async done
             (-> (keymap/initialize-keymap)
                 (.then (fn [keymap]
                          (is (some? keymap) "Keymap should initialize")
                          (-> (keymap/register-keybinding "C-c C-t" "test-command" "Test command")
                              (.then (fn [result]
                                       (is (true? result) "Keybinding should register"))
                                     (done))
                              (.catch (fn [error]
                                        (is nil error "Keybinding registration should not fail")
                                        (done))))))
                 (.catch (fn [error]
                           (is nil error "Keymap initialization should not fail")
                           (done)))))))

  (deftest test-layout-integration
    (testing "Layout system manages UI components"
      (async done
             (-> (layout/initialize-layout)
                 (.then (fn [layout]
                          (is (some? layout) "Layout should initialize")
                          (-> (layout/update-layout {:sidebar-width 300 :show-minimap true})
                              (.then (fn [result]
                                       (is (true? result) "Layout should update"))
                                     (done))
                              (.catch (fn [error]
                                        (is nil error "Layout update should not fail")
                                        (done))))))
                 (.catch (fn [error]
                           (is nil error "Layout initialization should not fail")
                           (done)))))))

  (deftest test-command-palette-integration
    (testing "Command palette provides access to commands"
      (async done
             (let [mock-palette {:show (fn [] (js/Promise.resolve "workspace.save"))
                                 :hide (fn [] nil)}]
               (-> (layout/show-command-palette mock-palette)
                   (.then (fn [result]
                            (is (some? result) "Command palette should show")
                            (-> (layout/execute-command "workspace.save")
                                (.then (fn [exec-result]
                                         (is (true? exec-result) "Command should execute"))
                                       (done))
                                (.catch (fn [error]
                                          (is nil error "Command execution should not fail")
                                          (done))))))
                   (.catch (fn [error]
                             (is nil error "Command palette should not fail")
                             (done))))))))

  (deftest test-event-system-integration
    (testing "Events flow between components"
      (async done
             (let [event-received (atom false)
                   event-data (atom nil)]
               (-> (state/subscribe-to-events "buffer:changed"
                                              (fn [data]
                                                (reset! event-received true)
                                                (reset! event-data data)))
                   (.then (fn [unsubscribe]
                            (-> (state/emit-event "buffer:changed"
                                                  {:buffer-id "test" :content "new content"})
                                (.then (fn [emit-result]
                                         (is (true? emit-result) "Event should emit")
                                  ;; Wait a bit for event processing
                                         (js/setTimeout
                                          (fn []
                                            (is (true? @event-received) "Event should be received")
                                            (is (= {:buffer-id "test" :content "new content"}
                                                   @event-data)
                                                "Event data should match")
                                            (unsubscribe)
                                            (done))
                                          100)))
                                (.catch (fn [error]
                                          (is nil error "Event emission should not fail")
                                          (done))))))
                   (.catch (fn [error]
                             (is nil error "Event subscription should not fail")
                             (done))))))))

  (deftest test-auto-save-integration
    (testing "Auto-save functionality works"
      (async done
             (-> (state/enable-auto-save 1000) ; 1 second for testing
                 (.then (fn [result]
                          (is (true? result) "Auto-save should enable")
                   ;; Test that auto-save timer is set
                          (is (some? (state/get-auto-save-timer)) "Auto-save timer should be set")
                          (-> (state/disable-auto-save)
                              (.then (fn [disable-result]
                                       (is (true? disable-result) "Auto-save should disable")
                                       (is (nil? (state/get-auto-save-timer)) "Timer should be cleared")
                                       (done)))
                              (.catch (fn [error]
                                        (is nil error "Auto-save disable should not fail")
                                        (done))))))
                 (.catch (fn [error]
                           (is nil error "Auto-save enable should not fail")
                           (done))))))))

(deftest test-full-workflow-integration
  (testing "Complete user workflow works end-to-end"
    (async done
           (-> (main/init-app)
               (.then (fn [app-config]
                        (is (some? app-config) "App should initialize")
                   ;; Create workspace
                        (-> (state/enable-auto-save 5000)
                            (.then (fn []
                                ;; Create buffers
                                     (-> (buffers/create-buffer "main.cljs" "(ns main.core)\n(defn hello [] \"Hello\"))")
                                         (.then (fn [buffer1]
                                                  (-> (buffers/create-buffer "test.cljs" "(ns test.core)\n(deftest hello-test (is (= \"Hello\" (hello))))")
                                                      (.then (fn [buffer2]
                                                          ;; Switch between buffers
                                                               (-> (buffers/switch-to-buffer (:id buffer2))
                                                                   (.then (fn []
                                                                       ;; Enter normal mode
                                                                            (-> (evil/enter-normal-mode (:id buffer2))
                                                                                (.then (fn []
                                                                                    ;; Execute command
                                                                                         (-> (layout/execute-command "workspace.save")
                                                                                             (.then (fn [save-result]
                                                                                                      (is (true? save-result) "Save should work"))
                                                                                                    (done))
                                                                                             (.catch (fn [error]
                                                                                                       (is nil error "Save should not fail")
                                                                                                       (done)))))
                                                                                       (.catch (fn [error]
                                                                                                 (is nil error "Normal mode should not fail")
                                                                                                 (done)))))
                                                                            (.catch (fn [error]
                                                                                      (is nil error "Buffer switch should not fail")
                                                                                      (done)))))
                                                                   (.catch (fn [error]
                                                                             (is nil error "Second buffer creation should not fail")
                                                                             (done)))))
                                                             (.catch (fn [error]
                                                                       (is nil error "First buffer creation should not fail")
                                                                       (done)))))))
                                         (.catch (fn [error]
                                                   (is nil error "Auto-save should not fail")
                                                   (done))))))
                            (.catch (fn [error]
                                      (is nil error "App initialization should not fail")
                                      (done))))))))

    (deftest test-error-handling-integration
      (testing "Error handling works across components"
        (async done
               (-> (state/get-error-handler)
                   (.then (fn [error-handler]
                            (is (some? error-handler) "Error handler should be available")
                            (-> (state/report-error (js/Error. "Test error")
                                                    {:component "test" :context "integration"})
                                (.then (fn [report-result]
                                         (is (true? report-result) "Error should be reported")
                                         (-> (:recover error-handler "test-component" "test-error")
                                             (.then (fn [recovery-result]
                                                      (is (true? recovery-result) "Error recovery should work"))
                                                    (done))
                                             (.catch (fn [error]
                                                       (is nil error "Error recovery should not fail")
                                                       (done))))))
                                (.catch (fn [error]
                                          (is nil error "Error reporting should not fail")
                                          (done))))))
                   (.catch (fn [error]
                             (is nil error "Error handler setup should not fail")
                             (done))))))))

  (deftest test-memory-management-integration
    (testing "Memory management works correctly"
      (async done
             (-> (state/get-memory-usage)
                 (.then (fn [initial-memory]
                          (is (some? initial-memory) "Should get initial memory")
                          (is (number? (:used initial-memory)) "Memory usage should be number")
                   ;; Create some buffers to test memory growth
                          (-> (js/Promise.all
                               (for [i (range 5)]
                                 (buffers/create-buffer (str "test-" i ".txt")
                                                        (str "Content " i) 100)))
                              (.then (fn [buffers]
                                       (-> (state/get-memory-usage)
                                           (.then (fn [after-memory]
                                                    (is (> (:used after-memory) (:used initial-memory))
                                                        "Memory should increase with usage")
                                             ;; Cleanup
                                                    (-> (state/cleanup-resources)
                                                        (.then (fn [cleanup-result]
                                                                 (is (true? cleanup-result) "Cleanup should succeed"))
                                                               (done))
                                                        (.catch (fn [error]
                                                                  (is nil error "Cleanup should not fail")
                                                                  (done))))))
                                           (.catch (fn [error]
                                                     (is nil error "Memory check should not fail")
                                                     (done))))))
                              (.catch (fn [error]
                                        (is nil error "Buffer creation should not fail")
                                        (done))))))
                 (.catch (fn [error]
                           (is nil error "Initial memory check should not fail")
                           (done))))))))

;; Run integration tests
(defn run-integration-tests []
  "Run all integration tests"
  (println "Running Opencode Unified integration tests...")
  ;; This would be called from a test runner
  (clojure.test/run-tests 'test-integration))