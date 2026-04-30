(ns promethean.runtime.eventbus
  (:require [clojure.core.async :as a]
            [promethean.util.ids :as ids]
            [promethean.util.time :as t]))

(defn make-bus
  ([] (make-bus 4096))
  ([buffer-size]
   {:bus/id (ids/uuid)
    :bus/in (a/chan buffer-size)
    :bus/subs (atom {})
    :bus/running? (atom false)}))

(defn emit! [bus ev]
  (a/put! (:bus/in bus) (assoc ev :event/at (or (:event/at ev) (t/now-inst)))))

(defn subscribe!
  ([bus pred] (subscribe! bus pred 256))
  ([bus pred buffer-size]
   (let [sub-id (ids/uuid)
         ch (a/chan buffer-size)]
     (swap! (:bus/subs bus) assoc sub-id {:pred pred :ch ch})
     {:sub/id sub-id :ch ch})))

(defn start-dispatcher! [bus]
  (when (compare-and-set! (:bus/running? bus) false true)
    (a/go-loop []
      (when-let [ev (a/<! (:bus/in bus))]
        (doseq [[_ {:keys [pred ch]}] @(:bus/subs bus)]
          (when (try (pred ev) (catch Throwable _ false))
            (a/put! ch ev)))
        (recur))))
  bus)
