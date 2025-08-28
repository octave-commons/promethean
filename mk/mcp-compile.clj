#!/usr/bin/env bb
(ns mcp-compile
  (:require [clojure.edn :as edn]
            [clojure.string :as str]
            [cheshire.core :as json]))

;; ---------- helpers ----------
(defn ensure-str [x where]
  (cond
    (string? x) x
    (keyword? x) (name x)
    (symbol? x)  (name x)
    (nil? x)     (throw (ex-info (str where ": got nil") {:where where}))
    :else        (str x)))

(defn q [s] (str "\"" (str/replace s #"\"" "\\\\\"") "\""))
(defn toml-table [nm] (format "[mcp_servers.%s]\n" (q nm)))
(defn toml-assign [k v] (format "%s = %s\n" k v))
(defn toml-array [xs] (str "[" (str/join ", " xs) "]"))

;; ---------- renderers ----------
(defn render-toml [[k spec]]
  (let [name-str (ensure-str k "server name")
        cmd      (ensure-str (:command spec) ":command")
        args     (:args spec)]
    (str
      (toml-table name-str)
      (toml-assign "command" (q cmd))
      (when (seq args)
        (toml-assign "args" (toml-array (map #(q (ensure-str % ":args")) args))))
      "\n")))

(defn json-codex-server [[k spec]]
  ;; Codex JSON shape: {"mcpServers": {"name": {"command": "...", "args":[...]}}}
  (let [name-str (ensure-str k "server name")
        cmd      (ensure-str (:command spec) ":command")
        args     (vec (map #(ensure-str % ":args") (:args spec)))]
    [name-str (cond-> {"command" cmd}
                (seq args) (assoc "args" args))]))

(defn json-vscode-server [[k spec]]
  ;; VS Code shape: {"servers":{"name":{"command":"...","type":"stdio","args":[...]}}}
  (let [name-str (ensure-str k "server name")
        cmd      (ensure-str (:command spec) ":command")
        args     (vec (map #(ensure-str % ":args") (:args spec)))]
    [name-str (cond-> {"command" cmd
                       "type"    "stdio"}
                (seq args) (assoc "args" args))]))

;; ---------- main ----------
(defn -main [& [in codex-toml codex-json vscode-json]]
  (when (or (nil? in) (nil? codex-toml) (nil? codex-json) (nil? vscode-json))
    (binding [*out* *err*]
      (println "usage:")
      (println "  bb ./mk/mcp-compile.clj <input.edn> <codex.toml> <codex.json> <vscode.json>")
      (System/exit 2)))
  (let [cfg     (-> in slurp edn/read-string)
        servers (:mcp-servers cfg)]
    (when-not (map? servers)
      (throw (ex-info ":mcp-servers must be a map" {:found (type servers)})))

    (println "mcp-servers:" (->> servers keys (map #(or % :<nil>)) (map str) sort vec))

    ;; 1) Codex TOML
    (spit codex-toml
          (str "# generated — do not edit\n\n"
               (apply str (map render-toml (sort-by (comp name key) servers)))))

    ;; 2) Codex JSON ("mcpServers")
    (spit codex-json
          (json/generate-string
            {"mcpServers" (into (sorted-map) (map json-codex-server servers))}
            {:pretty true}))

    ;; 3) VS Code JSON ("servers" + "type":"stdio")
    (spit vscode-json
          (json/generate-string
            {"servers" (into (sorted-map) (map json-vscode-server servers))
             "inputs"  []}                    ;; keep parity with your earlier config
            {:pretty true}))

    (println "wrote")
    (println "  " codex-toml)
    (println "  " codex-json)
    (println "  " vscode-json)))

(apply -main *command-line-args*)
