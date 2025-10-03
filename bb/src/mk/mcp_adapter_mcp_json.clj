;; mk/mcp_adapter_mcp_json.clj
(ns mk.mcp-adapter-mcp-json
  (:require
   [babashka.fs :as fs]
   [cheshire.core :as json]
   [mk.mcp-core :as core]))


(defn read-full [path]
  (let [m (json/parse-string (slurp path))
        servers (get m "mcpServers")
        mcp {:mcp-servers
             (into (sorted-map)
                   (for [[nm spec] servers]
                     [(keyword nm)
                      (cond-> {:command (get spec "command")}
                        (seq (get spec "args")) (assoc :args (vec (get spec "args")))
                        (get spec "cwd") (assoc :cwd (get spec "cwd")) )]))}
        rest (dissoc m "mcpServers")]
    {:mcp mcp :rest rest}))

(defn write-full [path {:keys [mcp rest]}]
  (let [existing (if (fs/exists? path)
                   (json/parse-string (slurp path))
                   {})
        ;; Replace only the "mcpServers" key, keep all others from either rest or existing
        m* (merge existing rest)
        servers (into (sorted-map)
                      (for [[k {:keys [command args cwd]}] (:mcp-servers mcp)]
                        [(name k) (cond-> {"command" command}
                                    (seq args) (assoc "args" (vec args))
                                    cwd       (assoc "cwd" cwd))]))
        out (assoc m* "mcpServers" servers)]
    (core/ensure-parent! path)
    (spit path (json/generate-string out {:pretty true}))))
