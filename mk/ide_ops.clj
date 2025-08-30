(ns mk.ide-ops
  (:require [mk.ide-core :as core]
            [mk.ide-adapter-settings-json :as sjson]
            [babashka.fs :as fs]))

;; ---------- merge helpers ----------

(defn deep-merge
  "Shallow for non-maps; prefers rhs on conflict; recurses for maps."
  [a b]
  (cond
    (and (map? a) (map? b))
    (merge-with deep-merge a b)
    :else b))

(defn deep-merge-prefer-left
  "Like deep-merge but keeps left on conflict."
  [a b]
  (cond
    (and (map? a) (map? b))
    (merge-with deep-merge-prefer-left a b)
    :else (if (nil? b) a a))) ;; if rhs nil keep lhs, else rhs

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
  "Write canonical into target settings while preserving unknown target keys.
   merge-policy determines who wins on conflicts (:prefer-canonical default)."
  [edn-map base {:keys [path merge-policy]}]
  (let [abs (core/resolve-path base path)
        tgt (sjson/read-full abs)
        canon (:vscode-settings edn-map)
        mfn  (case merge-policy
               :prefer-target deep-merge
               deep-merge-prefer-left)
        merged (mfn (:settings tgt) canon)]
    (sjson/write-full abs {:settings merged})
    {:path abs}))

(defn sync-one!
  "Pull target -> merge into canonical -> write back."
  [edn-map base {:keys [path merge-policy]}]
  (let [edn*   (pull-one edn-map base {:path path :merge-policy merge-policy})
        _      (push-one! edn* base {:path path :merge-policy merge-policy})]
    edn*))

(defn push-all!
  [edn-map base targets]
  (mapv (fn [t] (push-one! edn-map base t)) targets))

(defn sync-all!
  [edn-map base targets]
  (reduce (fn [acc t] (sync-one! acc base t)) edn-map targets))

;; ---------- doctor ----------

(defn doctor-target
  [base {:keys [path]}]
  (let [abs (core/resolve-path base path)
        parent (-> abs fs/path fs/parent)]
    {:path abs
     :exists? (fs/exists? abs)
     :parent (str parent)
     :parent-exists? (fs/exists? parent)}))

(defn doctor
  [edn-map base]
  (let [targets (:settings-targets edn-map)]
    {:targets (mapv (partial doctor-target base) targets)}))
