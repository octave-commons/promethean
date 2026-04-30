(ns promethean.util.ids
  (:require [clojure.string :as str])
  (:import [java.security MessageDigest]
           [java.util UUID]))

(defn uuid [] (str (UUID/randomUUID)))

(defn sha256-hex ^String [^String s]
  (let [dig (MessageDigest/getInstance "SHA-256")
        bs (.digest dig (.getBytes (or s "") "UTF-8"))]
    (->> bs (map #(format "%02x" (bit-and 0xff %))) (apply str))))

(defn stable-id [{:keys [kind source key content]}]
  (sha256-hex (str (or kind "") "|" (or source "") "|" (or key "") "|" (or content ""))))

(defn slugify [s]
  (-> (or s "") str/lower-case (str/replace #"[^a-z0-9]+" "-") (str/replace #"^-+|-+$" "")))
