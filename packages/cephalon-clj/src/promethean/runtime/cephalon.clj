(ns promethean.runtime.cephalon
  (:require [clojure.core.async :as a]
            [promethean.runtime.eventbus :as bus]
            [promethean.runtime.eidolon :as eid]
            [promethean.llm.openai-compat :as llm]
            [promethean.memory.store :as store]
            [promethean.util.ids :as ids])
  (:import [java.util.concurrent Executors TimeUnit]))

(defn make-cephalon [{:keys [agent-name llm-cfg eidolon mem-store]}]
  {:cephalon/id (ids/uuid)
   :agent/name agent-name
   :llm-cfg llm-cfg
   :eidolon eidolon
   :mem-store mem-store
   :persistent (atom [])
   :sessions (atom {})})

(defn make-session [name]
  {:session/id (ids/uuid)
   :session/name name
   :recent []
   :recent-max 96})

(defn add-recent [session ev]
  (let [maxn (:recent-max session)]
    (update session :recent (fn [v] (-> (conj (vec v) ev) (take-last maxn) vec)))))

(defn subscribe-session! [cephalon bus session-id pred]
  (let [{:keys [ch] :as sub} (bus/subscribe! bus pred 512)]
    (swap! (:sessions cephalon) update session-id assoc :sub sub :sub-ch ch)
    sub))

(defn build-context [{:keys [agent-name llm-cfg eidolon mem-store persistent] :as cephalon} session]
  (let [recent (:recent session)
        latest (or (get-in (last recent) [:event/payload :discord/content])
                   (get-in (last recent) [:content])
                   "")
        related-hits (when (seq latest)
                       (eid/related {:eidolon eidolon :llm-cfg llm-cfg :top-k 24} latest))
        related-mems (->> related-hits
                          (map (fn [{:keys [meta]}] (store/get* mem-store (:memory/id meta))))
                          (filter some?)
                          (map (fn [m] {:role (or (:role m) "user") :content (:content m)}))
                          vec)
        persistent-mems (->> @persistent
                             (map (fn [id] (store/get* mem-store id)))
                             (filter some?)
                             (map (fn [m] {:role (or (:role m) "system") :content (:content m)}))
                             vec)
        recent-messages (->> recent
                             (map (fn [ev]
                                    (cond
                                      (= (:event/type ev) :discord/message-created)
                                      {:role "user" :content (get-in ev [:event/payload :discord/content])}
                                      (:role ev) {:role (:role ev) :content (:content ev)}
                                      :else {:role "system" :content (pr-str ev)})))
                             vec)]
    (vec (concat related-mems persistent-mems recent-messages))))

(defn step! [cephalon session]
  (let [{:keys [llm-cfg agent-name]} cephalon
        messages (build-context cephalon session)
        resp (llm/chat-completions llm-cfg {:model (:model llm-cfg)
                                            :messages (into [{:role "system"
                                                              :content (str "You are " agent-name
                                                                            ". Always running. Keep outputs concise.")}]
                                                           messages)
                                            :temperature (:temperature llm-cfg)
                                            :max-tokens (:max-tokens llm-cfg)})
        text (llm/first-message-text resp)
        tool-calls (llm/first-tool-calls resp)]
    {:text text :tool-calls tool-calls :raw resp}))

(defn run-loop! [{:keys [bus]} cephalon session-id {:keys [interval-ms]}]
  (let [pool (Executors/newSingleThreadScheduledExecutor)
        stop? (atom false)]
    (.scheduleAtFixedRate
      pool
      (fn []
        (when-not @stop?
          (try
            (when-let [session (get @(:sessions cephalon) session-id)]
              (let [ch (:sub-ch session)]
                (loop [n 0]
                  (when-let [ev (a/poll! ch)]
                    (eid/remember! {:eidolon (:eidolon cephalon)
                                    :mem-store (:mem-store cephalon)
                                    :llm-cfg (:llm-cfg cephalon)
                                    :embedding-prompt "As it relates to system health and up time:"
                                    :agent-name (:agent/name cephalon)}
                                  {:memory/kind :event
                                   :role "user"
                                   :content (or (get-in ev [:event/payload :discord/content]) (pr-str ev))
                                   :meta (merge {:source :discord} (get-in ev [:event/payload]))})
                    (swap! (:sessions cephalon) update session-id add-recent ev)
                    (when (< n 512) (recur (inc n))))))
              (let [session (get @(:sessions cephalon) session-id)
                    {:keys [text]} (step! cephalon session)]
                (when (seq (str text))
                  (bus/emit! bus {:event/type :cephalon/thought
                                  :event/payload {:cephalon/id (:cephalon/id cephalon)
                                                  :session/id session-id
                                                  :text text}}))))
            (catch Throwable e
              (bus/emit! bus {:event/type :cephalon/error
                              :event/payload {:error (.getMessage e)
                                              :session/id session-id}})))))
      0
      (long (or interval-ms 1500))
      TimeUnit/MILLISECONDS)
    {:stop! (fn []
              (reset! stop? true)
              (try (.shutdownNow pool) (catch Throwable _))
              true)}))
