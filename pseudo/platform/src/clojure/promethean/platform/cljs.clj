(ns promethean.platform.cljs
  "ClojureScript specific implementations for the platform compatibility layer"
  (:require [clojure.string :as str]
            [goog.net.XhrIo :as xhr]
            [goog.Uri :as uri]))

;; File operations for ClojureScript (limited)
(defn file-exists? [path]
  ;; In ClojureScript, file access is limited to browser sandbox
  ;; This would typically work with IndexedDB or localStorage
  (if (exists? js/localStorage)
    (some? (.getItem js/localStorage path))
    false))

(defn read-file [path]
  (if (exists? js/localStorage)
    (.getItem js/localStorage path)
    (throw (ex-info "File operations not supported in ClojureScript environment"
                    {:path path}))))

(defn write-file [path content]
  (if (exists? js/localStorage)
    (.setItem js/localStorage path content)
    (throw (ex-info "File operations not supported in ClojureScript environment"
                    {:path path}))))

(defn delete-file [path]
  (if (exists? js/localStorage)
    (.removeItem js/localStorage path)
    (throw (ex-info "File operations not supported in ClojureScript environment"
                    {:path path}))))

(defn list-directory [path]
  ;; Limited implementation for localStorage keys
  (if (exists? js/localStorage)
    (->> (range (.-length js/localStorage))
         (map #(.key js/localStorage %))
         (filter #(str/starts-with? % path))
         (into []))
    []))

(defn create-directory [path]
  ;; No-op in ClojureScript environment
  (throw (ex-info "Directory operations not supported in ClojureScript environment"
                  {:path path})))

(defn file-stats [path]
  (when (file-exists? path)
    {:path path
     :size (if-let [content (read-file path)]
             (.-length content)
             0)
     :directory? false
     :file? true
     :last-modified (js/Date.)}))

;; Process operations for ClojureScript (limited)
(defn execute-command [cmd & args]
  (throw (ex-info "Process execution not supported in ClojureScript environment"
                  {:cmd cmd :args args})))

(defn execute-command-async [cmd & args]
  (throw (ex-info "Async process execution not supported in ClojureScript environment"
                  {:cmd cmd :args args})))

(defn process-running? [proc]
  false)

(defn kill-process [proc]
  false)

;; Network operations for ClojureScript
(defn http-get [url & {:keys [headers timeout]}]
  (js/Promise.
   (fn [resolve reject]
     (xhr/send url
               (fn [event]
                 (let [xhr (.-target event)]
                   (if (.isSuccess xhr)
                     (resolve {:status (.getStatus xhr)
                               :body (.getResponseText xhr)
                               :headers (js->clj (.getResponseHeaders xhr))})
                     (reject {:status (.getStatus xhr)
                              :error (.getLastError xhr)}))))
               "GET"
               nil
               (clj->js (merge {"Content-Type" "application/json"}
                               (or headers {})))
               timeout))))

(defn http-post [url body & {:keys [headers timeout content-type]}]
  (js/Promise.
   (fn [resolve reject]
     (xhr/send url
               (fn [event]
                 (let [xhr (.-target event)]
                   (if (.isSuccess xhr)
                     (resolve {:status (.getStatus xhr)
                               :body (.getResponseText xhr)
                               :headers (js->clj (.getResponseHeaders xhr))})
                     (reject {:status (.getStatus xhr)
                              :error (.getLastError xhr)}))))
               "POST"
               body
               (clj->js (merge {"Content-Type" (or content-type "application/json")}
                               (or headers {})))
               timeout))))

;; Browser-specific operations
(defn browser-info []
  {:user-agent (.-userAgent js/navigator)
   :platform (.-platform js/navigator)
   :language (.-language js/navigator)
   :on-line? (.-onLine js/navigator)
   :cookie-enabled? (.-cookieEnabled js/navigator)})

(defn window-info []
  {:inner-width (.-innerWidth js/window)
   :inner-height (.-innerHeight js/window)
   :outer-width (.-outerWidth js/window)
   :outer-height (.-outerHeight js/window)
   :scroll-x (.-scrollX js/window)
   :scroll-y (.-scrollY js/window)})

(defn document-info []
  {:title (.-title js/document)
   :ready-state (.-readyState js/document)
   :domain (.-domain js/document)
   :url (.-URL js/document)})

;; Storage operations
(defn local-storage-available? []
  (try
    (let [test "__promethean_test__"]
      (.setItem js/localStorage test test)
      (.removeItem js/localStorage test)
      true)
    (catch js/Error _
      false)))

(defn session-storage-available? []
  (try
    (let [test "__promethean_test__"]
      (.setItem js/sessionStorage test test)
      (.removeItem js/sessionStorage test)
      true)
    (catch js/Error _
      false)))

(defn get-local-storage [key]
  (when (local-storage-available?)
    (.getItem js/localStorage key)))

(defn set-local-storage [key value]
  (when (local-storage-available?)
    (.setItem js/localStorage key value)))

(defn remove-local-storage [key]
  (when (local-storage-available?)
    (.removeItem js/localStorage key)))

(defn get-session-storage [key]
  (when (session-storage-available?)
    (.getItem js/sessionStorage key)))

(defn set-session-storage [key value]
  (when (session-storage-available?)
    (.setItem js/sessionStorage key value)))

(defn remove-session-storage [key]
  (when (session-storage-available?)
    (.removeItem js/sessionStorage key)))

;; DOM manipulation utilities
(defn get-element-by-id [id]
  (.getElementById js/document id))

(defn query-selector [selector]
  (.querySelector js/document selector))

(defn query-selector-all [selector]
  (array-seq (.querySelectorAll js/document selector)))

(defn create-element [tag-name]
  (.createElement js/document tag-name))

;; Event handling
(defn add-event-listener [element event-type handler]
  (.addEventListener element event-type handler))

(defn remove-event-listener [element event-type handler]
  (.removeEventListener element event-type handler))

(defn dispatch-event [element event-type & [event-data]]
  (let [event (js/CustomEvent. event-type #js {:detail (clj->js event-data)})]
    (.dispatchEvent element event)))

;; Platform-specific optimizations
(defn optimize-for-cljs []
  "Apply ClojureScript-specific optimizations"
  {:optimizations-applied true
   :platform :clojurescript
   :browser-info (browser-info)
   :local-storage-available? (local-storage-available?)
   :session-storage-available? (session-storage-available?)})