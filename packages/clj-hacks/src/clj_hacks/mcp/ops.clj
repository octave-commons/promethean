(ns clj-hacks.mcp.ops
  "High-level operations for reading and writing MCP configuration sets."
  (:require [babashka.fs :as fs]
            [babashka.process :as proc]
            [clj-hacks.mcp.core :as core]
            [clj-hacks.mcp.merge :as m]
            [clojure.string :as str]))

;; ---------- tiny helpers ----------

(defn normalize-schema [s]
  ;; accepts :mcp.json or "mcp.json" -> :mcp.json
  (-> s name keyword))

(defn edn-base [edn-path]
  (or (some-> edn-path fs/path fs/parent str)
      (str (fs/cwd))))

(defn abs-target [base path]
  (core/resolve-path base path))

(defn validate-outputs! [outs]
  (when-not (sequential? outs)
    (throw (ex-info ":outputs must be a vector of {:schema <kw> :path <str> ...}"
                    {:found (type outs)})))
  (doseq [o outs]
    (when (or (nil? (:schema o)) (nil? (:path o)))
      (throw (ex-info "Each :outputs entry needs :schema and :path" {:bad o}))))
  outs)

;; ---------- operations ----------

(defn push-one!
  "Push EDN MCP into one target. Returns {:schema kw :path abs}."
  [edn-map base {:keys [schema path] :as out}]
  (let [schema (normalize-schema schema)
        abs    (abs-target base path)]
    (m/push {:schema schema :path abs} edn-map)
    {:schema schema :path abs}))

(defn pull-one
  "Pull MCP from one target into EDN (returns merged EDN map)."
  [edn-map base {:keys [schema path]}]
  (let [schema (normalize-schema schema)
        abs    (abs-target base path)]
    (m/pull {:schema schema :path abs} edn-map)))

(defn sync-one!
  "Pull -> push for one target. Returns updated EDN map."
  [edn-map base {:keys [schema path]}]
  (let [schema (normalize-schema schema)
        abs    (abs-target base path)]
    (m/sync! {:schema schema :path abs} edn-map)))

(defn push-all!
  "Iterate :outputs and push each. Returns vector of {:schema kw :path abs}."
  [edn-map base outs]
  (->> (validate-outputs! outs)
       (mapv (fn [o] (push-one! edn-map base o)))))

(defn sync-all!
  "Reduce sync across :outputs. Returns final updated EDN map."
  [edn-map base outs]
  (reduce (fn [acc o] (sync-one! acc base o))
          edn-map
          (validate-outputs! outs)))

;; ---------- doctor ----------

(defn- expand-home [s]
  (-> s
      (str/replace #"\\$HOME\\b" (System/getenv "HOME"))
      fs/expand-home))

(defn- which [cmd]
  ;; Use babashka.fs/which to check executable existence and permissions
  (when-let [cmd* (some-> cmd expand-home)]
    (if (str/includes? cmd* "/")
      (when (fs/executable? cmd*) cmd*)
      (fs/which cmd*))))

(defn doctor-server
  "Return a status map for one server {:server kw :command str :resolved? bool :resolved-path str|nil}."
  [[k {:keys [command]}]]
  (let [resolved (when command (which command))]
    {:server k
     :command command
     :resolved? (boolean resolved)
     :resolved-path resolved}))

(defn doctor-output
  "Return a status map for one output {:schema kw :path str :parent-exists? bool}."
  [base {:keys [schema path]}]
  (let [abs    (abs-target base path)
        parent (-> abs fs/path fs/parent)]
    {:schema schema
     :path abs
     :parent (str parent)
     :parent-exists? (fs/exists? parent)}))

(defn doctor
  "Run checks over {:mcp-servers …} and :outputs. Returns {:servers [...] :outputs [...] }."
  [edn-map base]
  (let [servers   (:mcp-servers edn-map)
        outputs   (:outputs edn-map)
        srv-stats (mapv doctor-server servers)
        out-stats (mapv (partial doctor-output base) outputs)]
    {:servers srv-stats
     :outputs out-stats}))
