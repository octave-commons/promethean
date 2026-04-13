(ns promethean.memory.dedup
  (:require [promethean.util.ids :as ids]))

(defn discord-key [{:keys [discord/message-id discord/channel-id]}]
  (when (and message-id channel-id)
    (str channel-id ":" message-id)))

(defn stable-memory-key [mem]
  (or (discord-key (:meta mem))
      (:memory/key mem)
      (ids/stable-id {:kind (:memory/kind mem)
                      :source (get-in mem [:meta :source])
                      :key (get-in mem [:meta :key])
                      :content (:content mem)})))
