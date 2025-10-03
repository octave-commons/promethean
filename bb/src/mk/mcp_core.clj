(ns mk.mcp-core
  (:require [babashka.fs :as fs]
            [clojure.string :as str]
            [clojure.pprint :as pp]))

;; ... your existing stuff ...

(defn pretty-edn-str
  "Reasonable EDN formatting; no namespace-map sugar; wider margin."
  [x]
  (binding [*print-namespace-maps* false
            pp/*print-right-margin* 100]
    (with-out-str (pp/write x :dispatch pp/code-dispatch))))

(defn write-atomic! [path s]
  (let [p      (fs/path path)
        dir    (fs/parent p)
        _      (fs/create-dirs dir)
        tmp    (fs/create-temp-file {:dir (str dir) :prefix ".tmp-mcp-" :suffix ".edn"})]
    (spit (str tmp) s)
    (fs/move tmp p {:replace-existing true :atomic true})
    (str path)))

(defn spit-edn!
  "Pretty-print EDN to path atomically."
  [path data]
  (write-atomic! path (pretty-edn-str data)))


;; ----- paths -----
(defn resolve-path [base p]
  (let [p1 (-> (str p)
               (str/replace #"\$HOME\b" (System/getenv "HOME"))
               fs/expand-home)]
    (-> (if (fs/absolute? p1) p1 (fs/path base p1))
        fs/absolutize
        str)))

(defn ensure-parent! [p]
  (when-let [dir (some-> p fs/path fs/parent)]
    (fs/create-dirs dir)))

;; ----- canonical model -----
;; {:mcp-servers {name {:command "…" :args [...] :cwd "…"}} ...maybe future keys}
(defn canonical? [m] (and (map? m) (map? (:mcp-servers m))))

;; ----- merges (maps only) -----
(defn deep-merge
  "Later maps win for conflicts."
  [& ms]
  (letfn [(mrg [a b]
            (cond (and (map? a) (map? b)) (merge-with mrg a b)
                  :else b))]
    (reduce mrg {} ms)))

(defn deep-merge-prefer-existing
  "Earlier maps win."
  [& ms]
  (letfn [(mrg [a b]
            (cond (and (map? a) (map? b)) (merge-with mrg a b)
                  :else a))]
    (reduce mrg {} ms)))

;; ----- policies -----
(def ^:dynamic *push-policy*
  ;; When pushing to a target: EDN overrides target’s MCP (but preserves target :rest)
  {:mcp-merge deep-merge
   :rest-policy :preserve})  ;; never touch :rest

(def ^:dynamic *pull-policy*
  ;; When pulling into EDN: target MCP fills gaps; EDN wins on conflict by default
  {:mcp-merge deep-merge-prefer-existing}) ;; keep existing EDN on conflict
 

;; keep compatibility helper if called indirectly
;; (spit-edn! path data) is already defined above
