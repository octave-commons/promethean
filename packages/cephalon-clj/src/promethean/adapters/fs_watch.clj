(ns promethean.adapters.fs-watch
  (:require [clojure.java.io :as io]
            [clojure.string :as str])
  (:import [java.nio.file FileSystems Path StandardWatchEventKinds WatchKey]
           [java.util.concurrent Executors TimeUnit]))

(defn- register! [watcher ^Path dir]
  (.register dir watcher (into-array [StandardWatchEventKinds/ENTRY_CREATE
                                      StandardWatchEventKinds/ENTRY_MODIFY])))

(defn start-watch! [{:keys [dir handler]}]
  (let [watcher (.newWatchService (FileSystems/getDefault))
        dir-path (.toPath (io/file dir))
        _ (register! watcher dir-path)
        stopped? (atom false)
        pool (Executors/newSingleThreadExecutor)]
    (.submit pool
             ^Runnable
             (fn []
                (while (not @stopped?)
                  (when-let [^WatchKey key (.poll watcher 250 TimeUnit/MILLISECONDS)]
                    (doseq [ev (.pollEvents key)]
                      (let [kind (.kind ev)
                            ctx (.context ev)
                            p (.resolve dir-path ^Path ctx)
                            path-str (.toString p)]
                        (when (str/ends-with? path-str ".md")
                          (handler {:op (cond
                                          (= kind StandardWatchEventKinds/ENTRY_CREATE) :fs/create
                                          (= kind StandardWatchEventKinds/ENTRY_MODIFY) :fs/modify
                                          :else :fs/other)
                                    :path path-str}))))
                    (.reset key)))))
    (fn stop! []
      (reset! stopped? true)
      (try (.close watcher) (catch Throwable _))
      (try (.shutdownNow pool) (catch Throwable _))
      true)))
