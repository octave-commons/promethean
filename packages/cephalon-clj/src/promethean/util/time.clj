(ns promethean.util.time
  (:import [java.time Instant ZoneId]
           [java.time.format DateTimeFormatter]))

(defn now-inst ^Instant [] (Instant/now))
(defn now-ms [] (.toEpochMilli (now-inst)))

(def ^DateTimeFormatter iso
  (.withZone (DateTimeFormatter/ISO_INSTANT) (ZoneId/of "UTC")))

(defn fmt [^Instant inst] (.format iso inst))
