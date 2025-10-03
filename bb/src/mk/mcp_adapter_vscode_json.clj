(ns mk.mcp-adapter-vscode-json
  (:require
   [babashka.fs :as fs]
   [cheshire.core :as json]
   [mk.mcp-core :as core]))

(defn read-full [path]
  (let [m (json/parse-string (slurp path))
        servers (get m "servers")
        mcp {:mcp-servers
             (into (sorted-map)
                   (for [[nm spec] servers]
                     [(keyword nm)
                      (cond-> {:command (get spec "command")}
                        (seq (get spec "args")) (assoc :args (vec (get spec "args")))
                        (get spec "cwd") (assoc :cwd (get spec "cwd")) )]))}
        rest (dissoc m "servers")]
    {:mcp mcp :rest rest}))

(defn write-full [path {:keys [mcp rest]}]
  (let [existing (if (fs/exists? path)
                   (json/parse-string (slurp path))
                   {})
        m* (merge existing rest)
        servers (into (sorted-map)
                      (for [[k {:keys [command args cwd]}] (:mcp-servers mcp)]
                        [(name k) (cond-> {"command" command "type" "stdio"}
                                    (seq args) (assoc "args" (vec args))
                                    cwd       (assoc "cwd" cwd))]))
        out (assoc m* "servers" servers)]
    (core/ensure-parent! path)
    (spit path (json/generate-string out {:pretty true}))))
