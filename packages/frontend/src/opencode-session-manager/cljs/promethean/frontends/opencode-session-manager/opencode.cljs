(ns app.opencode
  (:require [clojure.walk :as walk]
            [clojure.string :as str]
            [reagent.core :as r]
            [clojure.pprint :as pprint]))

;; The OpenCode SDK wrapper is available globally via js/window.opencodeSDK
(def opencode-sdk js/window.opencodeSDK)

;; State management
(defonce opencode-state (r/atom {:client nil
                                 :connected? false
                                 :loading? false
                                 :error nil}))

;; Helper functions for JS interop
(defn js->clj-safe [x]
  "Safely convert JavaScript objects to Clojure data"
  (when x
    (walk/keywordize-keys (js->clj x :keywordize-keys true))))

(defn clj->js-safe [x]
  "Safely convert Clojure data to JavaScript objects"
  (when x
    (clj->js x)))

;; Client initialization
(defn initialize-opencode!
  "Initialize the OpenCode client with optional configuration"
  ([]
   (initialize-opencode! {}))
  ([options]
   (swap! opencode-state assoc :loading? true :error nil)
   (-> (.initializeOpencode opencode-sdk (clj->js-safe options))
       (.then (fn [client]
                (swap! opencode-state assoc
                       :client client
                       :connected? true
                       :loading? false
                       :error nil)
                client))
       (.catch (fn [error]
                 (swap! opencode-state assoc
                        :client nil
                        :connected? false
                        :loading? false
                        :error (.-message error))
                 (js/console.error "Failed to initialize OpenCode:" error))))))

(defn get-client []
  "Get the current OpenCode client"
  (:client @opencode-state))

(defn connected? []
  "Check if the client is connected"
  (:connected? @opencode-state))

(defn loading? []
  "Check if the client is loading"
  (:loading? @opencode-state))

(defn get-error []
  "Get the current error state"
  (:error @opencode-state))

;; Session Management API
(defn list-sessions
  "List all sessions"
  [callback]
  (let [client (get-client)]
    (if client
      (-> (.-sessionAPI opencode-sdk)
          (.list)
          (.then (fn [sessions]
                   (callback (js->clj-safe sessions) nil)))
          (.catch (fn [error]
                    (callback nil (.-message error)))))
      (callback nil "OpenCode client not initialized"))))

(defn create-session!
  "Create a new session"
  [session-data callback]
  (let [client (get-client)]
    (if client
      (-> (.-sessionAPI opencode-sdk)
          (.create (clj->js-safe session-data))
          (.then (fn [session]
                   (callback (js->clj-safe session) nil)))
          (.catch (fn [error]
                    (callback nil (.-message error)))))
      (callback nil "OpenCode client not initialized"))))

(defn get-session
  "Get a specific session by ID"
  [session-id callback]
  (let [client (get-client)]
    (if client
      (-> (.-sessionAPI opencode-sdk)
          (.get session-id)
          (.then (fn [session]
                   (callback (js->clj-safe session) nil)))
          (.catch (fn [error]
                    (callback nil (.-message error)))))
      (callback nil "OpenCode client not initialized"))))

(defn delete-session!
  "Delete a session by ID"
  [session-id callback]
  (let [client (get-client)]
    (if client
      (-> (.-sessionAPI opencode-sdk)
          (.delete session-id)
          (.then (fn []
                   (callback true nil)))
          (.catch (fn [error]
                    (callback nil (.-message error)))))
      (callback nil "OpenCode client not initialized"))))

(defn update-session!
  "Update a session"
  [session-id update-data callback]
  (let [client (get-client)]
    (if client
      (-> (.-sessionAPI opencode-sdk)
          (.update session-id (clj->js-safe update-data))
          (.then (fn [session]
                   (callback (js->clj-safe session) nil)))
          (.catch (fn [error]
                    (callback nil (.-message error)))))
      (callback nil "OpenCode client not initialized"))))

;; Code Review API
(defn start-code-review!
  "Start a code review for files/directories"
  [review-data callback]
  (let [client (get-client)]
    (if client
      (-> (.-codeReviewAPI opencode-sdk)
          (.startReview (clj->js-safe review-data))
          (.then (fn [review]
                   (callback (js->clj-safe review) nil)))
          (.catch (fn [error]
                    (callback nil (.-message error)))))
      (callback nil "OpenCode client not initialized"))))

(defn get-review-results
  "Get results of a code review"
  [review-id callback]
  (let [client (get-client)]
    (if client
      (-> (.-codeReviewAPI opencode-sdk)
          (.getReviewResults review-id)
          (.then (fn [results]
                   (callback (js->clj-safe results) nil)))
          (.catch (fn [error]
                    (callback nil (.-message error)))))
      (callback nil "OpenCode client not initialized"))))

(defn submit-review-feedback!
  "Submit feedback on a code review"
  [review-id feedback callback]
  (let [client (get-client)]
    (if client
      (-> (.-codeReviewAPI opencode-sdk)
          (.submitFeedback review-id (clj->js-safe feedback))
          (.then (fn [result]
                   (callback (js->clj-safe result) nil)))
          (.catch (fn [error]
                    (callback nil (.-message error)))))
      (callback nil "OpenCode client not initialized"))))

(defn list-review-templates
  "List available review templates"
  [callback]
  (let [client (get-client)]
    (if client
      (-> (.-codeReviewAPI opencode-sdk)
          (.listTemplates)
          (.then (fn [templates]
                   (callback (js->clj-safe templates) nil)))
          (.catch (fn [error]
                    (callback nil (.-message error)))))
      (callback nil "OpenCode client not initialized"))))

;; File System API
(defn list-files
  "List files in a directory"
  [path options callback]
  (let [client (get-client)]
    (if client
      (-> (.-fileAPI opencode-sdk)
          (.listFiles path (clj->js-safe options))
          (.then (fn [files]
                   (callback (js->clj-safe files) nil)))
          (.catch (fn [error]
                    (callback nil (.-message error)))))
      (callback nil "OpenCode client not initialized"))))

(defn read-file
  "Read file content"
  [path callback]
  (let [client (get-client)]
    (if client
      (-> (.-fileAPI opencode-sdk)
          (.readFile path)
          (.then (fn [content]
                   (callback content nil)))
          (.catch (fn [error]
                    (callback nil (.-message error)))))
      (callback nil "OpenCode client not initialized"))))

(defn get-file-stats
  "Get file statistics"
  [path callback]
  (let [client (get-client)]
    (if client
      (-> (.-fileAPI opencode-sdk)
          (.getFileStats path)
          (.then (fn [stats]
                   (callback (js->clj-safe stats) nil)))
          (.catch (fn [error]
                    (callback nil (.-message error)))))
      (callback nil "OpenCode client not initialized"))))

;; Event Handling
(defn subscribe-to-session-events
  "Subscribe to session-related events"
  [callback]
  (let [client (get-client)]
    (when client
      (-> (.-eventAPI opencode-sdk)
          (.onSessionEvent callback)))))

(defn subscribe-to-review-events
  "Subscribe to review-related events"
  [callback]
  (let [client (get-client)]
    (when client
      (-> (.-eventAPI opencode-sdk)
          (.onReviewEvent callback)))))

;; Utility functions
(defn format-session
  "Format session data for display"
  [session]
  (let [now (js/Date.)]
    (assoc session
           :display-title (:title session "Untitled Session")
           :display-date (if-let [created-at (:createdAt session)]
                           (.toLocaleDateString (js/Date. created-at))
                           (.toLocaleDateString now))
           :display-status (get-in session [:status :name] "unknown"))))

(defn format-review
  "Format review data for display"
  [review]
  (assoc review
         :display-title (or (:title review)
                            (str "Review of " (:path review)))
         :display-date (if-let [created-at (:createdAt review)]
                         (.toLocaleDateString (js/Date. created-at))
                         (.toLocaleDateString (js/Date.)))
         :display-status (get-in review [:status :name] "pending")))

(defn validate-session-data
  "Validate session data before creation"
  [session-data]
  (let [errors (atom [])]
    (when (str/blank? (:title session-data))
      (swap! errors conj "Title is required"))
    (when (str/blank? (:description session-data))
      (swap! errors conj "Description is required"))
    @errors))

(defn validate-review-data
  "Validate review data before creation"
  [review-data]
  (let [errors (atom [])]
    (when (str/blank? (:path review-data))
      (swap! errors conj "Path is required"))
    (when (empty? (:patterns review-data))
      (swap! errors conj "At least one file pattern is required"))
    @errors))

;; Re-frame integration helpers
(defn init-opencode-effects
  "Initialize OpenCode with re-frame effects"
  [dispatch]
  (initialize-opencode!
   {:serverUrl "http://localhost:4096"}
   (fn [client error]
     (if error
       (dispatch [:opencode/initialization-failed error])
       (dispatch [:opencode/initialized client])))))

;; Export the main state atom for components to subscribe to
(def opencode-state-atom opencode-state)