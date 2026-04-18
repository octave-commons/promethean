(ns promethean.eidolon.vector)
(defn dot [a b] (reduce + (map * a b)))
(defn norm [v] (Math/sqrt (double (dot v v))))
(defn cosine [a b]
  (let [na (norm a) nb (norm b)]
    (if (or (zero? na) (zero? nb)) 0.0 (/ (double (dot a b)) (* na nb)))))
