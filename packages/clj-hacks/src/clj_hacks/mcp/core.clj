(ns clj-hacks.mcp.core
  "Shared helpers for manipulating MCP server configuration data."
  (:require [babashka.fs :as fs]
            [clojure.pprint :as pp]
            [clojure.string :as str]))

(defn pretty-edn-str
  "Pretty-print data with readable EDN formatting."
  [x]
  (binding [*print-namespace-maps* false
            pp/*print-right-margin* 100]
    (with-out-str (pp/write x :dispatch pp/code-dispatch))))

(defn write-atomic!
  "Write string `s` to `path` atomically."
  [path s]
  (let [p   (fs/path path)
        dir (fs/parent p)
        _   (fs/create-dirs dir)
        tmp (fs/create-temp-file {:dir (str dir) :prefix ".tmp-mcp-" :suffix ".edn"})]
    (spit (str tmp) s)
    (fs/move tmp p {:replace-existing true :atomic true})
    (str path)))

(defn spit-edn!
  "Pretty-print EDN to `path` atomically."
  [path data]
  (write-atomic! path (pretty-edn-str data)))

;; ----- paths -----
(defn resolve-path
  "Resolve `p` relative to `base`, expanding `~` and `$HOME`."
  [base p]
  (let [home (or (System/getenv "HOME")
                 (System/getProperty "user.home"))
        s    (str p)
        s    (if (and home (str/includes? s "$HOME"))
               (str/replace s "$HOME" home)
               s)
        s    (if (and home (str/starts-with? s "~"))
               (str home (subs s 1))
               s)]
    (-> (if (fs/absolute? s) s (fs/path base s))
        fs/absolutize
        str)))

(defn ensure-parent!
  "Ensure the parent directory of `p` exists."
  [p]
  (when-let [dir (some-> p fs/path fs/parent)]
    (fs/create-dirs dir)))

;; ----- canonical model -----
(defn canonical?
  "True when `m` looks like {:mcp-servers {...}}."
  [m]
  (and (map? m) (map? (:mcp-servers m))))

;; ----- merges (maps only) -----
(defn deep-merge
  "Later maps win for conflicts."
  [& ms]
  (letfn [(mrg [a b]
            (cond (and (map? a) (map? b)) (merge-with mrg a b)
                  :else b))]
    (reduce mrg {} ms)))

(defn deep-merge-prefer-existing
  "Earlier maps win, preserving existing data on conflicts."
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
