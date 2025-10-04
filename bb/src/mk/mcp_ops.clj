(ns mk.mcp-ops
  "Thin wrapper around clj-hacks MCP operations plus higher level helpers."
  (:require [babashka.fs :as fs]
            [clojure.edn :as edn]
            [clj-hacks.mcp.core :as core]
            [clj-hacks.mcp.ops :as ops]))

(defn- ensure-base
  "Resolve the working directory for relative :outputs paths."
  [edn-path]
  (or (some-> edn-path fs/path fs/parent str)
      (str (fs/cwd))))

(defn load-edn
  "Read EDN configuration from `path`."
  [path]
  (edn/read-string (slurp path)))

(defn pull-one [edn-map base out]
  (ops/pull-one edn-map base out))

(defn push-one! [edn-map base out]
  (ops/push-one! edn-map base out))

(defn sync-one! [edn-map base out]
  (ops/sync-one! edn-map base out))

(defn push-all! [edn-map base outs]
  (ops/push-all! edn-map base outs))

(defn sync-all! [edn-map base outs]
  (ops/sync-all! edn-map base outs))

(defn refresh-outputs!
  "Push or sync all outputs for `edn-map` relative to `base`.

  Returns {:edn <map> :mode <keyword> :results <vector>} where :edn reflects
  any updated EDN map when :mode = :sync (since sync-all! can pull remote
  changes)."
  ([edn-map base]
   (refresh-outputs! edn-map base {:mode :push}))
  ([edn-map base {:keys [mode]}]
   (let [mode   (or mode :push)
         outs   (:outputs edn-map)
         result (cond
                  (not (seq outs)) {:edn edn-map :mode mode :results []}

                  (= mode :sync)
                  (let [edn* (ops/sync-all! edn-map base outs)]
                    {:edn edn* :mode :sync
                     :results (mapv #(select-keys % [:schema :path]) outs)})

                  (= mode :push)
                  {:edn edn-map :mode :push
                   :results (ops/push-all! edn-map base outs)}

                  :else
                  (throw (ex-info "Unknown refresh mode" {:mode mode})))]
     result)))

(defn write-edn!
  "Persist `data` to `path` and refresh :outputs. Accepts {:mode :push|:sync}."
  ([path data]
   (write-edn! path data {:mode :push}))
  ([path data {:keys [mode]}]
   (core/spit-edn! path data)
   (let [base            (ensure-base path)
         {:keys [edn] :as refresh} (refresh-outputs! data base {:mode mode})]
     (when (and (= (:mode refresh) :sync)
                (not= edn data))
       ;; Sync may have pulled new data; persist it immediately.
       (core/spit-edn! path edn))
     refresh)))

(defn update-edn!
  "Load EDN from `path`, apply `f` (plus optional :args vector), write results,
  and refresh :outputs. Optional {:mode :push|:sync}. Returns the final EDN map."
  ([path f]
   (update-edn! path f {:mode :push}))
  ([path f {:keys [args mode] :or {args [] mode :push}}]
   (let [current (load-edn path)
         updated (apply f current args)
         {:keys [edn]} (write-edn! path updated {:mode mode})]
     edn)))

(defn doctor
  "Expose clj-hacks doctor helper for mk.mcp-cli."
  [edn-map base]
  (ops/doctor edn-map base))
