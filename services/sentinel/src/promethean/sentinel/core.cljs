(ns promethean.sentinel.core
  "Sentinel: unified file-event daemon. Uses chokidar for watching, nodegit for submodule-safe
   workflows, and @promethean-os/messaging for publishing events and RPC-style pack control."
  (:require [clojure.edn :as edn]
            [clojure.string :as str]))

(def chokidar (js/require "chokidar"))
(def minimatch-lib (js/require "minimatch"))
(def minimatch-fn (or (.-default minimatch-lib) (.-minimatch minimatch-lib) minimatch-lib))
(def messaging (js/require "@promethean-os/messaging"))
(def nodegit (js/require "nodegit"))
(def fs-lib (js/require "@promethean-os/fs"))
(def logger (js/require "@promethean-os/logger"))
(def fs (js/require "fs"))
(def path (js/require "path"))

(declare sentinel-state)
(declare log)
(declare normalize-watch-node)
(declare sentinel-pack-names)
(declare load-pack-watchers)
(declare sentinel-filename)
(declare recompute-watchers!)
(declare anchor-names)
(declare ignored-patterns)
(declare normalize-path)
(declare sentinel-files-for-anchor)
(declare load-sentinel-file)
(declare registry-dissoc)
(declare read-edn-file)
(declare default-root)

(def createRabbitContext (when messaging (.-createRabbitContext messaging)))

(defn publish-event! [topic payload]
  (let [{:keys [messaging]} @sentinel-state
        ctx (:ctx messaging)]
    (when ctx
      (-> ^js (.publish ctx topic (clj->js payload))
          (.catch (fn [err]
                    (log :warn "failed to publish event" {:topic topic :error err})))))))


(defn recompute-watchers! []
  (let [all (->> (:registry @sentinel-state)
                 vals
                 (mapcat identity)
                 (remove nil?)
                 vec)]
    (swap! sentinel-state assoc :watchers all)
    all))

(defn registry-assoc [k watchers]
  (swap! sentinel-state assoc-in [:registry k] watchers)
  (recompute-watchers!)
  (log :info "sentinel.detected" {:source k :watchers (map :path watchers)})
  (publish-event! "sentinel.detected" {:source k :watchers (map :path watchers)}))

(defn registry-dissoc [k]
  (when (get-in @sentinel-state [:registry k])
    (swap! sentinel-state update :registry dissoc k)
    (let [remaining (recompute-watchers!)]
      (log :info "sentinel.pack.unloaded" {:source k :remaining (count remaining)})
      (publish-event! "sentinel.pack.unloaded" {:source k :remaining (count remaining)}))))

(defn load-sentinel-file [sentinel-path]
  (when (.existsSync fs sentinel-path)
    (let [config (read-edn-file sentinel-path)
          base-dir (.dirname path sentinel-path)
          base-watchers (when (map? config)
                          (->> (:watchers config)
                               (map (fn [[k v]] (normalize-watch-node base-dir k v)))
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
                        (path.join root sentinel-filename))
        loaded (load-sentinel-file config-path)
        watchers (:watchers loaded)]
    (swap! sentinel-state assoc :config-path config-path :watchers watchers)
    loaded))

(defn sentinel-files-for-anchor [anchor-path]
  (let [dir (.dirname path anchor-path)
        base (.basename path anchor-path)]
    [(path.join dir sentinel-filename)
     (path.join dir (str "sentinel." base))]))

(defn anchor-file? [p]
  (contains? anchor-names (.basename path p)))

(defn match-glob? [glob-str rel]
  (if (or (nil? glob-str) (str/blank? glob-str) (nil? minimatch-fn))
    true
    (try
      (minimatch-fn rel glob-str)
      (catch :default _ true))))

(defn file-size [p]
  (try
    (.-size (.statSync fs p))
    (catch :default _ 0)))

(defn should-emit? [rule abs-path now]
  (let [debounce-ms (:debounce-ms rule)
        cache-key [(:id rule) abs-path]
        last-ts (get-in @sentinel-state [:debounce-cache cache-key])]
    (if (and debounce-ms last-ts (< (- now last-ts) debounce-ms))
      false
      (do (swap! sentinel-state assoc-in [:debounce-cache cache-key] now)
          true))))

(defn match-rule? [rule event-type rel-path abs-path]
  (let [on (:on rule)
        size-over (get-in rule [:when :size-over])]
    (and (or (nil? on)
             (= on :any)
             (= on event-type))
         (match-glob? (:glob rule) rel-path)
         (if size-over
           (> (file-size abs-path) size-over)
           true))))

(defn emit-synthetic! [rule watcher event]
  (let [id (:id rule)
        topic (str "sentinel.synthetic." (name (or id :unknown)))
        payload {:id id
                 :rule rule
                 :watcher (select-keys watcher [:key :path :abs-path])
                 :event event}]
    (log :info "sentinel synthetic" {:topic topic :path (:path event) :id id})
    (publish-event! topic payload)))

(defn handle-fs-event [etype file-path]
  (let [abs (normalize-path file-path)
        now (.now js/Date)
        watchers (:watchers @sentinel-state)]
    (doseq [w watchers
            :when (and abs (.startsWith abs (:abs-path w)))]
      (let [rel (.relative path (:abs-path w) abs)
            rules (:synthetic w)]
        (doseq [r rules
                :when (and r (match-rule? r etype rel abs) (should-emit? r abs now))]
          (emit-synthetic! r w {:type etype
                                :path abs
                                :relative rel
                                :ts now}))))))

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
    (.on watcher "all" (fn [etype p]
                          (handle-fs-event (keyword etype) p)))
    {:watcher watcher
     :stop    #(.close watcher)}))

(defn register-rpc! [ctx queue handler]
  (-> (.respond ctx queue handler #js {:autoAck false})
      (.then (fn [closer]
               (swap! sentinel-state update :rpc-closers conj closer)))
      (.catch (fn [err]
                (log :warn "rpc responder failed" {:queue queue :error err})))))

(defn start-messaging! []
  (try
    (let [ctx (createRabbitContext)]
      (register-rpc! ctx "sentinel.pack.add"
                     (fn [envelope helpers]
                       (let [payload (js->clj (.-payload ^js envelope) :keywordize-keys true)
                             path (:path payload)
                             pack (:pack payload)
                             res (cond
                                   path (load-sentinel-file path)
                                   pack (load-pack-watchers pack)
                                   :else nil)]
                         (when res
                           (.reply ^js helpers (clj->js {:ok true :source (or path pack)}))))))
      (register-rpc! ctx "sentinel.pack.remove"
                     (fn [envelope helpers]
                       (let [payload (js->clj (.-payload ^js envelope) :keywordize-keys true)
                             path (:path payload)]
                         (when path (registry-dissoc path))
                         (.reply ^js helpers (clj->js {:ok true :source path})))))
      (register-rpc! ctx "sentinel.pack.reload"
                     (fn [envelope helpers]
                       (let [payload (js->clj (.-payload ^js envelope) :keywordize-keys true)
                             path (:path payload)
                             _ (when path (registry-dissoc path))
                             res (when path (load-sentinel-file path))]
                         (.reply ^js helpers (clj->js {:ok true :source path :watchers (count (:watchers res))})))))
      (swap! sentinel-state assoc :messaging {:ctx ctx})
      (log :info "sentinel messaging initialized" {})
      {:ctx ctx})
    (catch :default e
      (log :warn "messaging unavailable" {:error e})
      nil)))

(defn -main [& _args]
  (let [root (or default-root (.cwd js/process))
        _cfg (load-watch-config root)
        backend (start-chokidar root)
        anchors (start-anchor-watcher root)]
    (start-messaging!)
    (swap! sentinel-state assoc :root root :watcher backend :anchor-watcher anchors :backend :chokidar)
    (log :info "sentinel started" {:root root
                                    :backend (:backend @sentinel-state)
                                    :config-path (:config-path @sentinel-state)
                                    :watchers (map :path (:watchers @sentinel-state))})
    ;; keep process alive while stub; replace with real event wiring soon
    (js/setInterval (fn [] nil) 3600000)))

(set! *main-cli-fn* -main)

(defn ^:export main [& args]
  (apply -main args))
