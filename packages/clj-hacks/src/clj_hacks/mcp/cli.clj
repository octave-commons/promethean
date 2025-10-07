(ns clj-hacks.mcp.cli
  "Clojure CLI entry point for MCP configuration operations. Mirrors the
  historical mk.mcp-cli Babashka tooling so users can run everything with
  `clojure -M` instead of `bb -m`."
  (:require [babashka.fs :as fs]
            [clojure.edn :as edn]
            [clojure.string :as str]
            [clj-hacks.mcp.core :as core]
            [clj-hacks.mcp.ops :as ops]))

(def ^:private usage-overview
  "usage: clojure -M:clj-hacks/tasks <command> ...\n\nCommands:\n  pull <schema> <target> --edn <path> [--out <path>]\n  push <schema> <target> --edn <path> [--out <path>]\n  sync <schema> <target> --edn <path> [--out <path>]\n  push-all --edn <path>\n  sync-all --edn <path> [--out <path>]\n  doctor --edn <path>\n")

(def cmd-spec
  "Command metadata copied from the Babashka mk.mcp-cli tool."
  {:pull     {:pos   [:schema :target]
              :req-opts [:edn]
              :opt-opts [:out]
              :usage "usage: clojure -M:clj-hacks/tasks pull <schema> <target> --edn <path> [--out <path>]"}
   :push     {:pos   [:schema :target]
              :req-opts [:edn]
              :opt-opts [:out]
              :usage "usage: clojure -M:clj-hacks/tasks push <schema> <target> --edn <path> [--out <path>]"}
   :sync     {:pos   [:schema :target]
              :req-opts [:edn]
              :opt-opts [:out]
              :usage "usage: clojure -M:clj-hacks/tasks sync <schema> <target> --edn <path> [--out <path>]"}
   :push-all {:pos []
              :req-opts [:edn]
              :opt-opts []
              :usage "usage: clojure -M:clj-hacks/tasks push-all --edn <path>"}
   :sync-all {:pos []
              :req-opts [:edn]
              :opt-opts [:out]
              :usage "usage: clojure -M:clj-hacks/tasks sync-all --edn <path> [--out <path>]"}
   :doctor   {:pos []
              :req-opts [:edn]
              :opt-opts []
              :usage "usage: clojure -M:clj-hacks/tasks doctor --edn <path>"}})

(defn known-command?
  "True when `cmd` (string or keyword) is a valid MCP command."
  [cmd]
  (contains? cmd-spec (keyword cmd)))

(defn commands
  "Return the set of command keywords supported by the MCP CLI."
  []
  (keys cmd-spec))

(defn usage
  "Overview usage string for inclusion in higher-level help messages."
  []
  usage-overview)

(defn- value-after
  "Return the element immediately after `flag` in `xs`, or nil if absent."
  [xs flag]
  (some (fn [[a b]] (when (= a flag) b)) (partition 2 1 xs)))

(defn- kw-schema [s]
  (some-> s (str/replace #"^:" "") keyword))

(defn- ensure-edn-base [edn-path]
  (or (some-> edn-path fs/path fs/parent str)
      (str (fs/cwd))))

(defn- refresh-after-edn!
  "Push all configured outputs when we mutated the source EDN in-place."
  [edn-map base out]
  (when (nil? out)
    (doseq [{:keys [path schema]} (ops/push-all! edn-map base (:outputs edn-map))]
      (println "refreshed ->" path "(" (name schema) ")"))))

(defn- parse-argv
  "Parse ARGV according to per-command metadata.

  Returns {:ok parsed-map} on success or {:error {:message string :usage string}}
  on validation failures."
  [cmd args]
  (let [cmd (keyword cmd)
        {:keys [pos req-opts opt-opts usage]} (get cmd-spec cmd)]
    (if-not usage
      {:error {:message (str "unknown cmd: " (name cmd))
               :usage usage-overview}}
      (let [n-pos (count pos)
            positionals (take n-pos args)
            flags       (drop n-pos args)
            opts-map    (into {}
                               (for [o (concat req-opts opt-opts)]
                                 [o (value-after flags (str "--" (name o)))]))
            pos-map     (into {}
                               (map (fn [[k v]]
                                      [k (if (= k :schema) (kw-schema v) v)])
                                    (map vector pos positionals)))
            missing-pos (seq (for [k pos :when (nil? (get pos-map k))] k))
            missing-req (seq (for [o req-opts :when (nil? (get opts-map o))] o))]
        (cond
          missing-pos
          {:error {:message (str "missing positional arg: " (name (first missing-pos)))
                   :usage usage}}

          missing-req
          {:error {:message (str "missing required option: --" (name (first missing-req)))
                   :usage usage}}

          :else
          {:ok (merge {:cmd cmd}
                      pos-map
                      opts-map
                      {:argv (into [(name cmd)] args)})})))))

(defn- read-edn [path]
  (try
    (let [content (slurp path)
          parsed (edn/read-string content)]
      (when-not (map? parsed)
        (throw (ex-info (str "EDN file must contain a map, got " (type parsed))
                        {:path path :content content})))
      parsed)
    (catch Exception e
      (throw (ex-info (str "Failed reading EDN file: " path "\nCause: " (ex-message e)) 
                      {:path path}
                      e)))))

(defn- handle-doctor [{:keys [edn]}]
  (let [base    (ensure-edn-base edn)
        edn-map (-> (read-edn edn)
                    (core/validate-edn-structure!))
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
                       (name schema) path (if parent-exists? "OK" "PARENT MISSING")))))
  {:exit 0})

(defn- ensure-parent-and-write! [merged target-edn]
  (when-let [parent (some-> target-edn fs/path fs/parent)]
    (fs/create-dirs parent))
  (core/spit-edn! target-edn merged)
  target-edn)

(defn- handle-pull [{:keys [schema target edn out]}]
  (let [base       (ensure-edn-base edn)
        edn-map    (read-edn edn)
        merged     (ops/pull-one edn-map base {:schema schema :path target})
        target-edn (or out edn)]
    (ensure-parent-and-write! merged target-edn)
    (println "pulled ->" target-edn)
    (refresh-after-edn! merged base out)
    {:exit 0}))

(defn- handle-push [{:keys [schema target edn]}]
  (let [base    (ensure-edn-base edn)
        edn-map (read-edn edn)
        {:keys [path]} (ops/push-one! edn-map base {:schema schema :path target})]
    (println "pushed ->" path)
    {:exit 0}))

(defn- handle-sync [{:keys [schema target edn out]}]
  (let [base       (ensure-edn-base edn)
        edn-map    (read-edn edn)
        merged     (ops/sync-one! edn-map base {:schema schema :path target})
        target-edn (or out edn)]
    (ensure-parent-and-write! merged target-edn)
    (println "synced EDN & target")
    (refresh-after-edn! merged base out)
    {:exit 0}))

(defn- handle-push-all [{:keys [edn]}]
  (let [base    (ensure-edn-base edn)
        edn-map (read-edn edn)]
    (doseq [{:keys [path schema]} (ops/push-all! edn-map base (:outputs edn-map))]
      (println "pushed ->" path "(" (name schema) ")"))
    {:exit 0}))

(defn- handle-sync-all [{:keys [edn out]}]
  (let [base    (ensure-edn-base edn)
        edn-map (read-edn edn)
        merged  (ops/sync-all! edn-map base (:outputs edn-map))
        target  (or out edn)]
    (ensure-parent-and-write! merged target)
    (println "synced all; wrote" target)
    {:exit 0}))

(defn- command->handler [cmd]
  (case (keyword cmd)
    :pull handle-pull
    :push handle-push
    :sync handle-sync
    :push-all handle-push-all
    :sync-all handle-sync-all
    :doctor handle-doctor))

(defn run
  "Execute an MCP command. Accepts the command keyword/string and the remaining
  argv tokens. Returns {:exit n :message string? :err? boolean?}."
  [cmd args]
  (let [{:keys [ok error]} (parse-argv cmd args)]
    (if error
      (let [{:keys [message usage]} error]
        {:exit 2
         :err? true
         :message (str message "\n\n" (or usage usage-overview))})
      (let [parsed ok
            handler (command->handler (:cmd parsed))]
        (try
          (handler parsed)
          (catch Exception e
            {:exit 1
             :err? true
             :message (or (ex-message e) (str e))}))))))

(defn -main
  "Standalone entry point so callers can run
  `clojure -M:clj-hacks/tasks <command> ...` or
directly `clojure -M:clj-hacks/mcp <command> ...`."
  [& argv]
  (let [[cmd & args] argv]
    (if-not (known-command? cmd)
      (do
        (binding [*out* *err*]
          (println (str "unknown cmd: " (or cmd "<none>")))
          (println (usage)))
        (shutdown-agents)
        (System/exit 2))
      (let [{:keys [exit message err?]} (run cmd args)]
        (when message
          (binding [*out* (if err? *err* *out*)]
            (println message)))
        (shutdown-agents)
        (System/exit (or exit 0))))))
