(ns clj-hacks.mcp.adapter-opencode
  "Adapter for Opencode JSON configuration files."
  (:require [babashka.fs :as fs]
            [cheshire.core :as json]
            [clj-hacks.mcp.core :as core]
            [clojure.string :as str]))

(defn- ->vector [v]
  (cond
    (nil? v) nil
    (vector? v) v
    (sequential? v) (vec v)
    :else nil))

(defn- ->map [m]
  (when (map? m) m))

(def ^:private opencode-server->edn
  {"type"     {:key :type :transform identity}
   "command"  {:key :command :transform identity :include-nil? true}
   "enabled"  {:key :enabled? :transform identity}
   "args"     {:key :args :transform ->vector}
   "cwd"      {:key :cwd :transform identity}
   "env"      {:key :env :transform ->map}
   "timeout"  {:key :timeout :transform identity}
   "url"      {:key :url :transform identity}
   "version"  {:key :version :transform identity}
   "metadata" {:key :metadata :transform ->map}
   "capabilities" {:key :capabilities :transform ->map}
   "autoConnect" {:key :auto-connect? :transform identity}
   "autoApprove" {:key :auto-approve :transform ->vector}
   "autoAccept"  {:key :auto-accept :transform ->vector}
   "disabled"    {:key :disabled? :transform identity}})

(def ^:private opencode-server->edn-kw
  {:type     {:key :type :transform identity}
   :command  {:key :command :transform identity :include-nil? true}
   :enabled  {:key :enabled? :transform identity}
   :args     {:key :args :transform ->vector}
   :cwd      {:key :cwd :transform identity}
   :env      {:key :env :transform ->map}
   :timeout  {:key :timeout :transform identity}
   :url      {:key :url :transform identity}
   :version  {:key :version :transform identity}
   :metadata {:key :metadata :transform ->map}
   :capabilities {:key :capabilities :transform ->map}
   :autoConnect {:key :auto-connect? :transform identity}
   :autoApprove {:key :auto-approve :transform ->vector}
   :autoAccept  {:key :auto-accept :transform ->vector}
   :disabled    {:key :disabled? :transform identity}})

(def ^:private edn->opencode-server
  {:type         {:key "type" :transform identity}
   :command      {:key "command" :transform identity :include-nil? true}
   :enabled?     {:key "enabled" :transform identity}
   :args         {:key "args" :transform ->vector}
   :cwd          {:key "cwd" :transform identity}
   :env          {:key "env" :transform ->map}
   :timeout      {:key "timeout" :transform identity}
   :url          {:key "url" :transform identity}
   :version      {:key "version" :transform identity}
   :metadata     {:key "metadata" :transform ->map}
   :capabilities {:key "capabilities" :transform ->map}
   :auto-connect? {:key "autoConnect" :transform identity}
   :auto-approve {:key "autoApprove" :transform ->vector}
   :auto-accept  {:key "autoAccept" :transform ->vector}
   :disabled?    {:key "disabled" :transform identity}})

(defn parse-opencode-server [spec]
  "Parse a single Opencode MCP server configuration."
  (let [spec (or spec {})
        mapping (if (string? (first (keys spec)))
                 opencode-server->edn
                 opencode-server->edn-kw)]
    (reduce (fn [acc [json-key {:keys [key transform include-nil?]}]
              (if (contains? spec json-key)
                (let [raw (get spec json-key)
                      value (if transform (transform raw) raw)]
                  (if (or include-nil? (some? value))
                    (assoc acc key value)
                    acc))
            {}
            mapping)))

(defn opencode-server->json [spec]
  "Convert EDN server spec back to Opencode JSON format."
  (let [spec (or spec {})
        spec (cond-> spec
                (not (contains? spec :command)) (assoc :command nil))]
    (reduce (fn [acc [edn-key {:keys [key transform include-nil?]}]]
              (if (contains? spec edn-key)
                (let [raw (get spec edn-key)
                      value (if transform (transform raw) raw)]
                  (if (or include-nil? (some? value))
                    (assoc acc key value)
                    acc))
                acc))
            {}
            edn->opencode-server)))

(defn read-full [path]
  "Read Opencode JSON configuration and convert to canonical MCP format."
  (let [m       (json/parse-string (slurp path) true)
        mcp     (get m :mcp)
        servers (when mcp (get mcp :mcpServers))
        mcp-data {:mcp-servers
                  (when servers
                    (into (sorted-map)
                          (for [[nm spec] servers]
                            [(keyword nm) (parse-opencode-server spec)])))}
        ;; Extract non-MCP sections as rest data
        rest    (dissoc m :mcp)]
    {:mcp mcp-data :rest rest}))

(defn write-full [path {:keys [mcp rest]}]
  "Write canonical MCP format back to Opencode JSON configuration."
  (let [existing (if (fs/exists? path)
                   (json/parse-string (slurp path) true)
                   {})
        ;; Merge existing non-MCP data with new rest data
        merged-rest (merge (dissoc existing "mcp") rest)
        mcp'       (core/expand-servers-home mcp)
        servers    (when (:mcp-servers mcp')
                      (into (sorted-map)
                            (for [[k spec] (:mcp-servers mcp')
                                  :let [json (opencode-server->json spec)]
                                  :when json]
                              [(name k) json])))
        ;; Build final Opencode config - always include MCP section if we have servers
        out        (cond-> merged-rest
                     (some? servers) (assoc "mcp" {"mcpServers" servers}))]
    (core/ensure-parent! path)
    (spit path (json/generate-string out {:pretty true}))))