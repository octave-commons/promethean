(ns promethean.runtime.eidolon
  (:require [promethean.eidolon.prompt :as prompt]
             [promethean.eidolon.index :as idx]
             [promethean.llm.openai-compat :as llm]
             [promethean.memory.dedup :as dedup]
             [promethean.memory.store :as store]
             [promethean.openplanner.client :as openplanner]
             [promethean.util.time :as t]))

(defn make-eidolon [] {:eidolon/index (idx/make-index)})

(defn embed-text! [eidolon llm-cfg text {:keys [stable-key meta]}]
  (let [emb (llm/embeddings llm-cfg {:model (get-in llm-cfg [:embedding-model] "qwen3-embedding")
                                     :input text})
        vec (llm/first-embedding emb)]
    (idx/put-vec! (:eidolon/index eidolon) {:key stable-key :vec vec :meta meta})))

(defn- memory->openplanner-event [mem]
  (let [meta (or (:meta mem) {})
        source-ref (cond-> {:session (or (:session/id meta) "unknown")
                            :memory (:memory/id mem)}
                     (:discord/message-id meta) (assoc :message (:discord/message-id meta))
                     (:event/id meta) (assoc :message (:event/id meta)))]
    {:schema "openplanner.event.v1"
     :id (:memory/id mem)
     :ts (t/fmt (:memory/created-at mem))
     :source "cephalon-clj"
     :kind "memory.created"
     :source_ref source-ref
     :text (:content mem)
     :meta {:memory_kind (name (:memory/kind mem))
            :role (str (:role mem))}
     :extra {:memory_id (:memory/id mem)
             :memory_created_at (t/fmt (:memory/created-at mem))
             :memory_meta meta}}))

(def openplanner-post-events! openplanner/post-events!)

(defn- emit-openplanner-memory-created! [{:keys [openplanner-cfg]} mem]
  (let [cfg (merge (openplanner/config-from-env) openplanner-cfg)
        event (memory->openplanner-event mem)]
    (try
      (openplanner-post-events! cfg [event])
      (catch Throwable e
        (binding [*out* *err*]
          (println "OpenPlanner memory ingestion failed" {:error (.getMessage e)
                                                           :memory-id (:memory/id mem)
                                                           :openplanner-url (:url cfg)}))))))

(defn remember!
  [{:keys [eidolon mem-store llm-cfg embedding-prompt agent-name] :as opts} mem]
  (let [mem' (store/put! mem-store mem)
        stable-key (dedup/stable-memory-key mem')
        text (prompt/render {:system-defined embedding-prompt
                             :persistent []
                             :recent []
                             :agent-name agent-name
                             :latest (:content mem')
                             :tags (or (:tags mem') [])})]
    (embed-text! eidolon llm-cfg text {:stable-key stable-key
                                       :meta {:memory/id (:memory/id mem')}})
    (emit-openplanner-memory-created! opts mem')
    mem'))

(defn related [{:keys [eidolon llm-cfg top-k]} query-text]
  (let [emb (llm/embeddings llm-cfg {:model (get-in llm-cfg [:embedding-model] "qwen3-embedding")
                                    :input query-text})
        qvec (llm/first-embedding emb)]
    (idx/search (:eidolon/index eidolon) qvec {:top-k top-k})))
