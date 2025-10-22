(ns electron.server
  (:require [cljs.nodejs :as nodejs]
            [clojure.string :as str]
            [goog.object :as gobj]))

;; Node.js modules
(def http (nodejs/require "http"))
(def fs (nodejs/require "fs"))
(def path (nodejs/require "path"))
(def url (nodejs/require "url"))

;; Configuration
(def config
  {:port (or (some-> (gobj/get js/process.env "PORT") js/parseInt) 3000)
   :host "localhost"
   :public-dir "public"})

(defn get-content-type [file-path]
  (let [ext (-> file-path
                (str/split #"\.")
                last
                str/lower-case)]
    (case ext
      "html" "text/html"
      "js" "text/javascript"
      "css" "text/css"
      "json" "application/json"
      "png" "image/png"
      "jpg" "image/jpeg"
      "jpeg" "image/jpeg"
      "gif" "image/gif"
      "svg" "image/svg+xml"
      "ico" "image/x-icon"
      "text/plain")))

(defn serve-file [response file-path]
  (let [full-path (.resolve path (:public-dir config) file-path)]
    (if (.existsSync fs full-path)
      (let [stat (.statSync fs full-path)
            content-type (get-content-type file-path)]
        (.writeHead response 200 
                   #js {"Content-Type" content-type
                        "Content-Length" (.-size stat)
                        "Cache-Control" "no-cache"})
        (.createReadStream fs full-path)
        (.pipe response))
      (do
        (.writeHead response 404 #js {"Content-Type" "text/plain"})
        (.end response "Not Found")))))

(defn handle-request [request response]
  (let [parsed-url (.parse url (.-url request))
        pathname (.-pathname parsed-url)]
    (println (str (.-method request) " " pathname))
    
    (cond
      ;; Serve index.html for root path
      (= pathname "/")
      (serve-file response "index.html")
      
      ;; Serve files from public directory
      (or (.startsWith pathname "/renderer")
          (.startsWith pathname "/"))
      (serve-file response (subs pathname 1))
      
      ;; 404 for everything else
      :else
      (do
        (.writeHead response 404 #js {"Content-Type" "text/plain"})
        (.end response "Not Found")))))

(defn start-server []
  (let [server (.createServer http handle-request)]
    (.listen server (:port config) (:host config)
             (fn []
               (println (str "Opencode HTTP server running at http://" 
                           (:host config) ":" (:port config)))
               (println "Press Ctrl+C to stop")))
    
    ;; Handle graceful shutdown
    (.on js/process "SIGINT"
         (fn []
           (println "\nShutting down server...")
           (.close server
                  (fn []
                    (println "Server stopped")
                    (.exit js/process 0)))))))

;; Start the server
(defn start []
  (println "Starting Opencode HTTP server...")
  (start-server))

;; For development - enable hot reload
(defn ^:export reload []
  (println "Server hot reloaded..."))

(defn ^:export clear []
  (println "Server cleared..."))