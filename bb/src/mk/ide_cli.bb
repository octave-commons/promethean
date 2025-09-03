#!/usr/bin/env bb
(ns mk.ide-cli
  (:require
   [babashka.fs :as fs]
   [clojure.edn :as edn]
   [clojure.pprint :as pprint]
   [mk.ide-ops :as ops]))

;; ----------- utils -----------

(defn die! [msg usage]
  (binding [*out* *err*]
    (println msg)
    (println usage)
    (System/exit 2)))

(defn value-after [xs flag]
  (some (fn [[a b]] (when (= a flag) b)) (partition 2 1 xs)))

(defn ensure-edn-base [edn-path]
  (or (some-> edn-path fs/path fs/parent str) (str (fs/cwd))))

;; ----------- per-command spec -----------

(def cmd-spec
  {:settings/pull     {:pos   [:target] :req-opts [:edn] :opt-opts [:merge-policy :out]
                       :usage "usage: bb -m mk.ide-cli settings pull <target> --edn <path> [--merge-policy prefer-target|prefer-canonical] [--out <edn>]"}
   :settings/push     {:pos   [:target] :req-opts [:edn] :opt-opts [:merge-policy]
                       :usage "usage: bb -m mk.ide-cli settings push <target> --edn <path> [--merge-policy prefer-target|prefer-canonical]"}
   :settings/sync     {:pos   [:target] :req-opts [:edn] :opt-opts [:merge-policy :out]
                       :usage "usage: bb -m mk.ide-cli settings sync <target> --edn <path> [--merge-policy prefer-target|prefer-canonical] [--out <edn>]"}
   :settings/push-all {:pos   []        :req-opts [:edn] :opt-opts [:merge-policy]
                       :usage "usage: bb -m mk.ide-cli settings push-all --edn <path> [--merge-policy prefer-target|prefer-canonical]"}
   :settings/sync-all {:pos   []        :req-opts [:edn] :opt-opts [:merge-policy :out]
                       :usage "usage: bb -m mk.ide-cli settings sync-all --edn <path> [--merge-policy prefer-target|prefer-canonical] [--out <edn>]"}
   :settings/doctor   {:pos   []        :req-opts [:edn] :opt-opts []
                       :usage "usage: bb -m mk.ide-cli settings doctor --edn <path>"} })

(defn parse-argv [argv]
  (let [[a b & rest] argv
        cmd-kw (keyword (str a "/" b))
        {:keys [pos req-opts opt-opts usage]} (get cmd-spec cmd-kw)]
    (when-not usage
      (die! (str "unknown cmd: " a " " b)
            "usage: bb -m mk.ide-cli settings <pull|push|sync|push-all|sync-all|doctor> ..."))
    (let [n-pos (count pos)
          positionals (take n-pos rest)
          flags       (drop n-pos rest)
          opts-map (into {}
                         (for [o (concat req-opts opt-opts)]
                           [o (value-after flags (str "--" (name o)))]))
          pos-map (into {} (map vector pos positionals))]
      (doseq [k pos] (when (nil? (get pos-map k))
                       (die! (str "missing positional arg: " (name k)) usage)))
      (doseq [o req-opts] (when (nil? (get opts-map o))
                            (die! (str "missing required option: --" (name o)) usage)))
      (merge {:cmd cmd-kw} pos-map opts-map))))

;; ----------- handlers -----------

(defn load-edn [p] (edn/read-string (slurp p)))

(defn handle-settings-pull [{:keys [target edn out merge-policy]}]
  (let [base (ensure-edn-base edn)
        edn-map (load-edn edn)
        merged  (ops/pull-one edn-map base {:path target
                                            :merge-policy (keyword (or merge-policy "prefer-canonical"))})]
    (spit (or out edn) (with-out-str (pprint/pprint merged)))
    (println "pulled ->" (or out edn))))

(defn handle-settings-push [{:keys [target edn merge-policy]}]
  (let [base (ensure-edn-base edn)
        edn-map (load-edn edn)
        {:keys [path]} (ops/push-one! edn-map base {:path target
                                                    :merge-policy (keyword (or merge-policy "prefer-canonical"))})]
    (println "pushed ->" path)))

(defn handle-settings-sync [{:keys [target edn out merge-policy]}]
  (let [base (ensure-edn-base edn)
        edn-map (load-edn edn)
        merged  (ops/sync-one! edn-map base {:path target
                                             :merge-policy (keyword (or merge-policy "prefer-canonical"))})]
    (spit (or out edn) (with-out-str (pprint/pprint merged)))
    (println "synced EDN & target")))

(defn handle-settings-push-all [{:keys [edn merge-policy]}]
  (let [base (ensure-edn-base edn)
        edn-map (load-edn edn)
        targets (:settings-targets edn-map)]
    (doseq [{:keys [path]} (ops/push-all! edn-map base (map #(assoc % :merge-policy (keyword (or merge-policy "prefer-canonical")))
                                                            targets))]
      (println "pushed ->" path))))

(defn handle-settings-sync-all [{:keys [edn out merge-policy]}]
  (let [base (ensure-edn-base edn)
        edn-map (load-edn edn)
        targets (:settings-targets edn-map)
        merged  (ops/sync-all! edn-map base (map #(assoc % :merge-policy (keyword (or merge-policy "prefer-canonical")))
                                                 targets))]
    (spit (or out edn) (with-out-str (pprint/pprint merged)))
    (println "synced all; wrote" (or out edn))))

(defn handle-settings-doctor [{:keys [edn]}]
  (let [base (ensure-edn-base edn)
        edn-map (load-edn edn)
        {:keys [targets]} (ops/doctor edn-map base)]
    (println "Targets:")
    (doseq [{:keys [path parent parent-exists? exists?]} targets]
      (println (format "  %-60s  parent:%-5s  exists:%-5s"
                       path (if parent-exists? "yes" "no")
                       (if exists? "yes" "no"))))))

(def dispatch
  {:settings/pull     handle-settings-pull
   :settings/push     handle-settings-push
   :settings/sync     handle-settings-sync
   :settings/push-all handle-settings-push-all
   :settings/sync-all handle-settings-sync-all
   :settings/doctor   handle-settings-doctor})

(defn -main [& argv]
  (let [{:keys [cmd] :as args} (parse-argv argv)
        f (dispatch cmd)]
    (f args)))
