(ns clj-hacks.cli
  (:gen-class)
  (:require [clj-hacks.automation :as automation]
            [clj-hacks.mcp.cli :as mcp-cli]
            [clojure.string :as str]))

(def ^:private help-flags
  #{"-h" "--help" "help"})

(defn- ->simple-handler
  "Wrap a zero-argument automation function so it fits the CLI handler contract."
  [f]
  (fn [_]
    (f)
    {:exit 0}))

(def ^:private commands
  {"prepare" {:summary "Download Maven dependencies for clj-hacks."
              :group   :automation
              :arity   :none
              :handler (->simple-handler automation/prepare!)}
   "build"   {:summary "Compile clj-hacks namespaces."
              :group   :automation
              :arity   :none
              :handler (->simple-handler automation/build)}
   "lint"    {:summary "Run clj-kondo across src/ and test/."
              :group   :automation
              :arity   :none
              :handler (->simple-handler automation/lint)}
   "test"    {:summary "Execute the Clojure test suite."
              :group   :automation
              :arity   :none
              :handler (->simple-handler automation/test)}
   "pull"    {:summary "Pull a target schema into the EDN config."
              :group   :mcp
              :arity   :any
              :handler (fn [args] (mcp-cli/run "pull" args))}
   "push"    {:summary "Push EDN configuration to a target."
              :group   :mcp
              :arity   :any
              :handler (fn [args] (mcp-cli/run "push" args))}
   "sync"    {:summary "Synchronise EDN and a specific target."
              :group   :mcp
              :arity   :any
              :handler (fn [args] (mcp-cli/run "sync" args))}
   "push-all" {:summary "Push all configured outputs from the EDN map."
               :group   :mcp
               :arity   :any
               :handler (fn [args] (mcp-cli/run "push-all" args))}
   "sync-all" {:summary "Synchronise all configured outputs."
               :group   :mcp
               :arity   :any
               :handler (fn [args] (mcp-cli/run "sync-all" args))}
   "doctor" {:summary "Inspect MCP config paths and binaries."
              :group   :mcp
              :arity   :any
              :handler (fn [args] (mcp-cli/run "doctor" args))}})

(def ^:private group->label
  {:automation "Build/test commands"
   :mcp        "MCP config commands"})

(defn usage []
  (let [fmt-line (fn [[name {:keys [summary]}]] (format "  %-10s %s" name summary))
        grouped  (group-by (comp :group second) commands)
        section  (fn [group]
                   (when-let [entries (seq (sort-by first (get grouped group)))]
                     (str (group->label group) "\n"
                          (str/join "\n" (map fmt-line entries)) "\n")))]
    (str "Usage: clojure -M:tasks <command> [args]\n\n"
         (str/join "\n" (remove nil? [(section :automation)
                                          (section :mcp)])))))

(defn dispatch [args]
  (let [[cmd & rest] args]
    (cond
      (help-flags cmd)
      {:exit 0 :message (usage)}

      (nil? cmd)
      {:exit 1 :message (str "Missing command.\n\n" (usage)) :err? true}

      (not (contains? commands cmd))
      {:exit 1 :message (str "Unknown command `" cmd "`.\n\n" (usage)) :err? true}

      (and (= :none (get-in commands [cmd :arity])) (seq rest))
      {:exit 1
       :message (str "Unexpected arguments: " (str/join " " rest) "\n\n" (usage))
       :err? true}

      :else
      {:exit 0
       :command {:entry (get commands cmd)
                 :args  rest}})))

(defn -main [& args]
  (let [{:keys [message err? command exit]} (dispatch args)]
    (when message
      (binding [*out* (if err? *err* *out*)]
        (println message)))
    (if command
      (let [{:keys [entry args]} command
            handler (:handler entry)
            result  (or (handler args) {:exit 0})
            res-exit (or (:exit result) 0)
            res-message (:message result)
            res-err? (:err? result)]
        (when res-message
          (binding [*out* (if res-err? *err* *out*)]
            (println res-message)))
        (shutdown-agents)
        (System/exit res-exit))
      (do
        (shutdown-agents)
        (System/exit (or exit 0))))))