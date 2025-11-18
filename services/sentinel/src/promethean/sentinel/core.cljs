(ns promethean.sentinel.core
  "Sentinel: unified file-event daemon scaffold. Uses chokidar for watching and reserves nodegit
   for submodule-safe workflows. Messaging integration will publish raw and synthetic events
   (e.g., submodule moves) to downstream services."
  (:require [clojure.edn :as edn]
            [clojure.string :as str]))

(def chokidar (js/require "chokidar"))
(def nodegit (js/require "nodegit"))
(def fs-lib (js/require "@promethean-os/fs"))
(def logger (js/require "@promethean-os/logger"))
(def fs (js/require "fs"))
(def path (js/require "path"))

(def default-root
  (or (aget (.-env js/process) "SENTINEL_ROOT")
      (.-HOME (.-env js/process))
      (.cwd js/process)))

(def default-config-path
  (or (aget (.-env js/process) "SENTINEL_CONFIG")
      (path.join default-root ".sentinel.edn")))

(defn keyword->path [k]
  (when (keyword? k)
    (let [base (str (or (namespace k) "")
                    (when (namespace k) "/")
                    (name k))]
      (-> base
          (str/replace #"^/+|/+$" "")
          (str/replace #"//+" "/")))))

(defn read-edn-file [p]
  (when (.existsSync fs p)
    (try
      (edn/read-string (.readFileSync fs p "utf8"))
      (catch :default e
        (log :error "failed to read sentinel edn config" {:path p :error e})
        nil))))

(defn normalize-watch-node [k v]
  {:key k
   :path (keyword->path k)
   :synthetic (:synthetic v)
   :actions (:actions v)
   :children (:children v)
   :raw v})

(defn load-pack-watchers [pack-name]
  (try
    (let [resolved (.resolve js/require (str pack-name "/sentinel.edn"))
          pack-edn (read-edn-file resolved)
          watchers (when (map? pack-edn)
                     (->> (:watchers pack-edn)
                          (map (fn [[k v]] (normalize-watch-node k v)))
                          (vec)))]
      (when watchers
        (log :info "loaded sentinel pack" {:pack pack-name
                                            :resolved resolved
                                            :watchers (map :path watchers)}))
      watchers)
    (catch :default e
      (log :error "failed to load sentinel pack" {:pack pack-name :error e})
      nil)))

(defn sentinel-files-for-anchor [anchor-path]
  (let [dir (.dirname path anchor-path)
        base (.basename path anchor-path)]
    [(path.join dir sentinel-filename)
     (path.join dir (str "sentinel." base))]))

(defn registry-assoc [k watchers]
  (swap! sentinel-state assoc-in [:registry k] watchers)
  (log :info "sentinel.detected" {:source k :watchers (map :path watchers)}))

(defn registry-dissoc [k]
  (when (get-in @sentinel-state [:registry k])
    (swap! sentinel-state update :registry dissoc k)
    (log :info "sentinel.pack.unloaded" {:source k})))

(defn sentinel-pack-names [config]
  (when (map? config)
    (vec (concat (:packs config) (:use config)))))

(defn load-sentinel-file [sentinel-path]
  (when (.existsSync fs sentinel-path)
    (let [config (read-edn-file sentinel-path)
          base-watchers (when (map? config)
                          (->> (:watchers config)
                               (map (fn [[k v]] (normalize-watch-node k v)))
                               (vec)))
          pack-names (sentinel-pack-names config)
          pack-watchers (when (seq pack-names)
                          (->> pack-names
                               (map load-pack-watchers)
                               (remove nil?)
                               (mapcat identity)
                               (vec)))
          watchers (vec (concat base-watchers pack-watchers))]
      (registry-assoc sentinel-path watchers)
      {:config config
       :watchers watchers
       :config-path sentinel-path
       :packs pack-names})))

(defn load-watch-config [root]
  (let [config-path (or (aget (.-env js/process) "SENTINEL_CONFIG")
                        (path.join root ".sentinel.edn"))
        loaded (load-sentinel-file config-path)
        watchers (:watchers loaded)]
    (swap! sentinel-state assoc :config-path config-path :watchers watchers)
    loaded))

(def anchor-names
  #{"shadow-cljs.edn" "bb.edn" "nbb.edn" "deps.edn" "package.json"})

(def sentinel-filename "sentinel.edn")

(defonce sentinel-state (atom {:root default-root
                               :watcher nil
                               :anchor-watcher nil
                               :backend :uninitialized
                               :watchers []
                               :registry {}
                               :config-path default-config-path}))

(defn log [level message & [data]]
  (let [payload (cond-> {:level level
                          :service "sentinel"
                          :message message}
                   data (assoc :data data))]
    ;; placeholder until logger wiring is finalized; keeps output visible
    (.log js/console (clj->js payload))))

(def ignored-patterns
  ["**/node_modules/**" "**/.git/**" "**/.cache/**"
   "**/.turbo/**" "**/dist/**" "**/build/**"])

(defn anchor-file? [p]
  (contains? anchor-names (.basename path p)))

(defn start-anchor-watcher [root]
  (let [globs (clj->js (map (fn [a] (path.join root "**" a)) anchor-names))
        watcher (.watch chokidar globs #js {:ignoreInitial false
                                            :ignored (clj->js ignored-patterns)})]
    (.on watcher "error" (fn [err] (log :error "anchor watcher error" {:error err})))
    (.on watcher "add" (fn [p]
                          (when (anchor-file? p)
                            (doseq [s (sentinel-files-for-anchor p)]
                              (load-sentinel-file s)))))
    (.on watcher "change" (fn [p]
                             (when (anchor-file? p)
                               (doseq [s (sentinel-files-for-anchor p)]
                                 (load-sentinel-file s)))))
    (.on watcher "unlink" (fn [p]
                             (when (anchor-file? p)
                               (doseq [s (sentinel-files-for-anchor p)]
                                 (registry-dissoc s)))))
    {:watcher watcher
     :stop    #(.close watcher)}))

(defn start-chokidar [root]
  (let [watcher (.watch chokidar root #js {:ignoreInitial true
                                           :ignored (clj->js ignored-patterns)})]
    (.on watcher "error" (fn [err] (log :error "chokidar watcher error" {:error err})))
    {:watcher watcher
     :stop    #(.close watcher)}))

(defn -main [& _args]
  (let [root (or default-root (.cwd js/process))
        _cfg (load-watch-config root)
        backend (start-chokidar root)
        anchors (start-anchor-watcher root)]
    (swap! sentinel-state assoc :root root :watcher backend :anchor-watcher anchors :backend :chokidar)
    (log :info "sentinel scaffold started" {:root root
                                             :backend (:backend @sentinel-state)
                                             :config-path (:config-path @sentinel-state)
                                             :watchers (map :path (:watchers @sentinel-state))})
    ;; keep process alive while stub; replace with real event wiring soon
    (js/setInterval (fn [] nil) 3600000)))

(set! *main-cli-fn* -main)

(defn ^:export main [& args]
  (apply -main args))

