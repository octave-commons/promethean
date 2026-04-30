(ns promethean.memory.store
  (:require [promethean.util.ids :as ids]
            [promethean.util.time :as t]))

(defn make-store []
  {:mem/by-id (atom {})
   :mem/access (atom {})
   :mem/order (atom [])})

(defn touch! [store id]
  (swap! (:mem/access store)
         (fn [m]
           (let [{:keys [count]} (get m id)]
             (assoc m id {:count (inc (long (or count 0)))
                          :last-used (t/now-inst)}))))
  id)

(defn put! [store mem]
  (let [id (or (:memory/id mem) (ids/uuid))
        mem' (assoc mem :memory/id id :memory/created-at (or (:memory/created-at mem) (t/now-inst)))]
    (swap! (:mem/by-id store) assoc id mem')
    (swap! (:mem/order store) conj id)
    (touch! store id)
    mem'))

(defn get* [store id]
  (when-let [m (get @(:mem/by-id store) id)]
    (touch! store id)
    m))
