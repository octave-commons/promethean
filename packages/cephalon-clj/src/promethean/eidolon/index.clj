(ns promethean.eidolon.index
  (:require [promethean.eidolon.vector :as v]
            [promethean.util.ids :as ids]
            [promethean.util.time :as t]))

(defn make-index []
  {:index/id (ids/uuid)
   :vec/by-id (atom {})
   :key->id (atom {})})

(defn put-vec! [idx {:keys [id key vec meta]}]
  (let [id (or id (ids/uuid))
        entry {:vec vec :meta (assoc (or meta {}) :stored-at (t/now-inst))}]
    (swap! (:vec/by-id idx) assoc id entry)
    (when key (swap! (:key->id idx) assoc key id))
    {:id id :key key}))

(defn maybe-existing-id [idx key] (get @(:key->id idx) key))

(defn search [idx qvec {:keys [top-k]}]
  (let [top-k (long (or top-k 24))]
    (->> @(:vec/by-id idx)
         (map (fn [[id {:keys [vec meta]}]] {:id id :score (v/cosine qvec vec) :meta meta}))
         (sort-by (comp - :score))
         (take top-k)
         vec)))
