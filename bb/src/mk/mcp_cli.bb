#!/usr/bin/env bb
(ns mk.mcp-cli
  (:require
    [babashka.fs :as fs]
    [clojure.edn :as edn]
    [clojure.string :as str]
    [mk.mcp-ops :as ops]
    [mk.mcp-core :as core]))

;; ---------------- utils ----------------

(defn die! [msg usage]
  (binding [*out* *err*]
    (println msg)
    (println usage)
    (System/exit 2)))

(defn value-after
  "Return the element immediately after `flag` in `xs`, or nil."
  [xs flag]
  (some (fn [[a b]] (when (= a flag) b)) (partition 2 1 xs)))

(defn kw-schema [s] (some-> s (str/replace #"^:" "") keyword))

(defn ensure-edn-base [edn-path]
  (or (some-> edn-path fs/path fs/parent str)
      (str (fs/cwd))))

(defn refresh-after-edn!
  "Push all configured outputs when we mutated the source EDN in-place."
  [edn-map base out]
  (when (nil? out)
    (let [{:keys [results]} (ops/refresh-outputs! edn-map base)]
      (doseq [{:keys [path schema]} results]
        (println "refreshed ->" path "(" (name schema) ")")))))

;; ---------------- command specs ----------------
;; Describe args once; parser uses this per-command.
(def cmd-spec
  {:pull     {:pos   [:schema :target] :req-opts [:edn] :opt-opts [:out]
              :usage "usage: bb -m mk.mcp-cli pull <schema> <target> --edn <path> [--out <path>]"}
   :push     {:pos   [:schema :target] :req-opts [:edn] :opt-opts [:out]
              :usage "usage: bb -m mk.mcp-cli push <schema> <target> --edn <path> [--out <path>]"}
   :sync     {:pos   [:schema :target] :req-opts [:edn] :opt-opts [:out]
              :usage "usage: bb -m mk.mcp-cli sync <schema> <target> --edn <path> [--out <path>]"}
   :push-all {:pos   []                :req-opts [:edn] :opt-opts []
              :usage "usage: bb -m mk.mcp-cli push-all --edn <path>"}
   :sync-all {:pos   []                :req-opts [:edn] :opt-opts [:out]
              :usage "usage: bb -m mk.mcp-cli sync-all --edn <path> [--out <path>]"}
;; in cmd-spec:
   :doctor   {:pos [] :req-opts [:edn] :opt-opts []
              :usage "usage: bb -m mk.mcp-cli doctor --edn <path>"}})

(defn parse-argv
  "Parse argv according to per-command spec. Returns {:cmd args…} or dies with usage."
  [argv]
  (let [[raw-cmd & rest] argv
        cmd (some-> raw-cmd name keyword)
        {:keys [pos req-opts opt-opts usage]} (get cmd-spec cmd)]
    (when-not pos
      (die! (str "unknown cmd: " raw-cmd)
            "usage: bb -m mk.mcp-cli <pull|push|sync|push-all|sync-all> …"))
    (let [n-pos (count pos)
          positionals (take n-pos rest)
          flags       (drop n-pos rest)
          ;; map required/optional opts -> values
          opts-map (into {}
                         (for [o (concat req-opts opt-opts)]
                           [o (value-after flags (str "--" (name o)))]))
          ;; normalize schema if present
          pos-map (into {}
                        (map (fn [[k v]]
                               [k (if (= k :schema) (kw-schema v) v)])
                             (map vector pos positionals)))]
      ;; validate presence
      (doseq [k pos]
        (when (nil? (get pos-map k))
          (die! (str "missing positional arg: " (name k)) usage)))
      (doseq [o req-opts]
        (when (nil? (get opts-map o))
          (die! (str "missing required option: --" (name o)) usage)))
      (merge {:cmd cmd} pos-map opts-map))))

;; ---------------- handlers ----------------
(defn handle-doctor [{:keys [edn]}]
  (let [base    (ensure-edn-base edn)
        edn-map (edn/read-string (slurp edn))
        {:keys [servers outputs]} (ops/doctor edn-map base)]
    (println "Servers:")
    (doseq [{:keys [server command resolved? resolved-path]} servers]
      (println (format "  %-18s %-30s  %s%s"
                       (name server)
                       (or command "<no command>")
                       (if resolved? "OK" "MISSING")
                       (if resolved-path (str " -> " resolved-path) ""))))
    (println "Outputs:")
    (doseq [{:keys [schema path parent-exists?]} outputs]
      (println (format "  %-12s %s  %s"
                       (name schema) path (if parent-exists? "OK" "PARENT MISSING"))))))

(defn handle-pull [{:keys [schema target edn out]}]
  (let [base    (ensure-edn-base edn)
        edn-map (edn/read-string (slurp edn))
        merged  (ops/pull-one edn-map base {:schema schema :path target})
        target-edn (or out edn)]
    (core/spit-edn! target-edn merged)
    (println "pulled ->" target-edn)
    (refresh-after-edn! merged base out)))

(defn handle-push [{:keys [schema target edn]}]
  (let [base    (ensure-edn-base edn)
        edn-map (edn/read-string (slurp edn))
        {:keys [path]} (ops/push-one! edn-map base {:schema schema :path target})]
    (println "pushed ->" path)))

(defn handle-sync [{:keys [schema target edn out]}]
  (let [base    (ensure-edn-base edn)
        edn-map (edn/read-string (slurp edn))
        merged  (ops/sync-one! edn-map base {:schema schema :path target})
        target-edn (or out edn)]
    (core/spit-edn! target-edn merged)
    (println "synced EDN & target")
    (refresh-after-edn! merged base out)))

(defn handle-push-all [{:keys [edn]}]
  (let [base    (ensure-edn-base edn)
        edn-map (edn/read-string (slurp edn))]
    (doseq [{:keys [path schema]} (ops/push-all! edn-map base (:outputs edn-map))]
      (println "pushed ->" path "(" (name schema) ")"))))

(defn handle-sync-all [{:keys [edn out]}]
  (let [base    (ensure-edn-base edn)
        edn-map (edn/read-string (slurp edn))
        merged  (ops/sync-all! edn-map base (:outputs edn-map))]
    (core/spit-edn! (or out edn)  merged)
    (println "synced all; wrote" (or out edn))))

(def cmd->handler
  {:pull handle-pull
   :push handle-push
   :sync handle-sync
   :push-all handle-push-all
   :sync-all handle-sync-all
   :doctor handle-doctor})


(defn -main [& argv]
  (let [{:keys [cmd] :as args} (parse-argv argv)
        f (cmd->handler cmd)]
    (f args)))
