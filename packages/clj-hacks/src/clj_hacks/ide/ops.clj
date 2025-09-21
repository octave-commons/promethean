(ns clj-hacks.ide.ops
  "Operations for synchronising canonical IDE settings with editor targets."
  (:require [babashka.fs :as fs]
            [clj-hacks.ide.adapter-settings-json :as sjson]
            [clj-hacks.ide.core :as core]))

;; ---------- merge helpers ----------

(defn deep-merge
  "Recursive merge that prefers values from `b` on conflict."
  [a b]
  (cond
    (and (map? a) (map? b)) (merge-with deep-merge a b)
    :else b))

(defn deep-merge-prefer-left
  "Recursive merge that keeps entries from `a` when both sides provide a value."
  [a b]
  (cond
    (and (map? a) (map? b)) (merge-with deep-merge-prefer-left a b)
    :else (if (nil? b) a a)))

;; ---------- ops ----------

(defn pull-one
  "Load target settings and merge into canonical {:vscode-settings m} using merge-fn.
   Returns updated EDN map."
  [edn-map base {:keys [path merge-policy]}]
  (let [abs (core/resolve-path base path)
        tgt (sjson/read-full abs)
        mfn (case merge-policy
              :prefer-target deep-merge
              ;; default: prefer canonical
              deep-merge-prefer-left)]
    (update edn-map :vscode-settings #(mfn % (:settings tgt)))))

(defn push-one!
  "Write canonical settings into target, preserving unknown keys according to `merge-policy`."
  [edn-map base {:keys [path merge-policy]}]
  (let [abs    (core/resolve-path base path)
        tgt    (sjson/read-full abs)
        canon  (:vscode-settings edn-map)
        mfn    (case merge-policy
                 :prefer-target deep-merge
                 deep-merge-prefer-left)
        merged (mfn (:settings tgt) canon)]
    (sjson/write-full abs {:settings merged})
    {:path abs}))

(defn sync-one!
  "Pull target -> merge into canonical -> write back."
  [edn-map base {:keys [path merge-policy]}]
  (let [edn* (pull-one edn-map base {:path path :merge-policy merge-policy})]
    (push-one! edn* base {:path path :merge-policy merge-policy})
    edn*))

(defn push-all!
  "Push canonical settings to each configured target."
  [edn-map base targets]
  (mapv (fn [t] (push-one! edn-map base t)) targets))

(defn sync-all!
  "Synchronise all targets, returning the final canonical map."
  [edn-map base targets]
  (reduce (fn [acc t] (sync-one! acc base t)) edn-map targets))

;; ---------- doctor ----------

(defn doctor-target
  "Return diagnostic information for a target entry."
  [base {:keys [path]}]
  (let [abs    (core/resolve-path base path)
        parent (-> abs fs/path fs/parent)]
    {:path abs
     :exists? (fs/exists? abs)
     :parent (str parent)
     :parent-exists? (fs/exists? parent)}))

(defn doctor
  "Return {:targets [...]} with diagnostics for configured settings targets."
  [edn-map base]
  (let [targets (:settings-targets edn-map)]
    {:targets (mapv (partial doctor-target base) targets)}))
