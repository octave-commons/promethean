(ns promethean.main
  (:require [clojure.edn :as edn]
            [clojure.java.io :as io]
            [clojure.string :as str]
            [promethean.runtime.eventbus :as bus]
            [promethean.runtime.eidolon :as eid]
            [promethean.memory.store :as store]
            [promethean.adapters.fs-watch :as fs]
            [promethean.runtime.sentinel :as sentinel]
            [promethean.runtime.cephalon :as cephalon]
            [promethean.util.time :as t]))

(defn read-config []
  (with-open [r (io/reader (io/resource "config.edn"))]
    (edn/read (java.io.PushbackReader. r))))

(defn -main [& _args]
  (let [cfg (read-config)
        bus (-> (bus/make-bus) bus/start-dispatcher!)
        mem-store (store/make-store)
        eidolon (eid/make-eidolon)
        llm-cfg (merge (:llm cfg) {:embedding-model (get-in cfg [:eidolon :embedding-model])})
        agent-name (get-in cfg [:agent/name] "Cephalon")
        c (cephalon/make-cephalon {:agent-name agent-name
                                  :llm-cfg llm-cfg
                                  :eidolon eidolon
                                  :mem-store mem-store})
        session (cephalon/make-session "main")
        session-id (:session/id session)]
    (swap! (:sessions c) assoc session-id session)
    (cephalon/subscribe-session! c bus session-id #(= (:event/type %) :discord/message-created))
    (cephalon/run-loop! {:bus bus} c session-id {:interval-ms 1200})

    (let [notes-dir "docs/notes"
          notes-path (io/file notes-dir)
          _ (when-not (.exists notes-path)
              (.mkdirs notes-path))
          _ (fs/start-watch!
              {:dir notes-dir
               :handler (fn [{:keys [op path]}]
                          (when (and (#{:fs/create :fs/modify} op)
                                     (str/ends-with? path ".md"))
                            (try (sentinel/run-contract! llm-cfg path)
                                 (catch Throwable _ nil))))})]
      (println "Promethean JVM runtime started." (str "@" (t/fmt (t/now-inst))))
      (println "- Cephalon:" agent-name "session" (:session/name session) "(" session-id ")")
      (println "- Watching:" notes-dir "for sentinel tagging")
      (println "Press Ctrl+C to exit.")
      (loop [] (Thread/sleep 100000) (recur)))))
