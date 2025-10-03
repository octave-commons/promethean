(ns clj-hacks.mcp.adapter-mcp-json
  "Adapter for official MCP JSON configuration files."
  (:require [babashka.fs :as fs]
            [cheshire.core :as json]
            [clj-hacks.mcp.core :as core]))

(defn- ->vector [v]
  (cond
    (nil? v) nil
    (vector? v) v
    (sequential? v) (vec v)
    :else nil))

(defn- parse-expectations [m]
  (when (map? m)
    (let [usage         (->vector (get m "usage"))
          pitfalls      (->vector (get m "pitfalls"))
          prerequisites (->vector (get m "prerequisites"))]
      (-> {}
          (cond-> (contains? m "usage") (assoc :usage usage))
          (cond-> (contains? m "pitfalls") (assoc :pitfalls pitfalls))
          (cond-> (contains? m "prerequisites") (assoc :prerequisites prerequisites))))))

(defn- parse-meta [m]
  (when (map? m)
    (let [workflow     (->vector (get m "workflow"))
          expectations (parse-expectations (get m "expectations"))]
      (-> {}
          (cond-> (contains? m "title") (assoc :title (get m "title")))
          (cond-> (contains? m "description") (assoc :description (get m "description")))
          (cond-> (contains? m "workflow") (assoc :workflow workflow))
          (cond-> (contains? m "expectations") (assoc :expectations expectations))))))

(defn- parse-endpoint [spec]
  (let [tools        (->vector (get spec "tools"))
        include-help (get spec "includeHelp")
        meta         (parse-meta (get spec "meta"))]
    (-> {}
        (cond-> (contains? spec "tools") (assoc :tools tools))
        (cond-> (contains? spec "includeHelp") (assoc :include-help? include-help))
        (cond-> (contains? spec "meta") (assoc :meta meta)))))

(defn- string->endpoint-key [s]
  (cond
    (keyword? s) s
    (string? s) (keyword s)
    :else (keyword (str s))))

(defn- parse-endpoints [m]
  (when (map? m)
    (into (sorted-map)
          (for [[nm spec] m]
            [(string->endpoint-key nm)
             (parse-endpoint spec)]))))

(defn- parse-http [m]
  (let [transport   (get m "transport")
        tools       (->vector (get m "tools"))
        include     (get m "includeHelp")
        stdio-meta  (parse-meta (get m "stdioMeta"))
        endpoints   (parse-endpoints (get m "endpoints"))
        proxy-path  (get m "stdioProxyConfig")]
    (not-empty
     (-> {}
         (cond-> (contains? m "transport") (assoc :transport (some-> transport keyword)))
         (cond-> (contains? m "tools") (assoc :tools tools))
         (cond-> (contains? m "includeHelp") (assoc :include-help? include))
         (cond-> (contains? m "stdioMeta") (assoc :stdio-meta stdio-meta))
         (cond-> (contains? m "endpoints") (assoc :endpoints endpoints))
         (cond-> (contains? m "stdioProxyConfig")
           (assoc :proxy {:config proxy-path}))))))

(defn- expectations->json [m]
  (when (map? m)
    (let [usage         (:usage m)
          pitfalls      (:pitfalls m)
          prerequisites (:prerequisites m)]
      (-> {}
          (cond-> (contains? m :usage) (assoc "usage" (->vector usage)))
          (cond-> (contains? m :pitfalls) (assoc "pitfalls" (->vector pitfalls)))
          (cond-> (contains? m :prerequisites)
            (assoc "prerequisites" (->vector prerequisites)))))))

(defn- meta->json [m]
  (when (map? m)
    (let [workflow     (:workflow m)
          expectations (:expectations m)
          json-ex      (expectations->json expectations)]
      (-> {}
          (cond-> (contains? m :title) (assoc "title" (:title m)))
          (cond-> (contains? m :description) (assoc "description" (:description m)))
          (cond-> (contains? m :workflow) (assoc "workflow" (->vector workflow)))
          (cond-> (contains? m :expectations) (assoc "expectations" json-ex))))))

(defn- endpoint-key->string [k]
  (cond
    (string? k) k
    (keyword? k) (if-let [ns (namespace k)]
                   (str ns "/" (name k))
                   (name k))
    :else (str k)))

(defn- endpoint->json [spec]
  (let [tools        (:tools spec)
        include-help (:include-help? spec)
        meta         (:meta spec)
        meta-json    (meta->json meta)]
    (-> {}
        (cond-> (contains? spec :tools) (assoc "tools" (->vector tools)))
        (cond-> (contains? spec :include-help?) (assoc "includeHelp" include-help))
        (cond-> (contains? spec :meta) (assoc "meta" meta-json)))))

(defn- endpoints->json [m]
  (when (map? m)
    (into (sorted-map)
          (for [[nm spec] m]
            [(endpoint-key->string nm)
             (endpoint->json spec)]))))

(defn- transport->string [t]
  (cond
    (nil? t) nil
    (keyword? t) (name t)
    (string? t) t
    :else (str t)))

(defn- http->json [m]
  (when (map? m)
    (let [proxy (:proxy m)
          proxy-config (:config proxy)]
      (-> {}
          (cond-> (contains? m :transport) (assoc "transport" (transport->string (:transport m))))
          (cond-> (contains? m :tools) (assoc "tools" (->vector (:tools m))))
          (cond-> (contains? m :include-help?) (assoc "includeHelp" (:include-help? m)))
          (cond-> (contains? m :stdio-meta) (assoc "stdioMeta" (meta->json (:stdio-meta m))))
          (cond-> (contains? m :endpoints) (assoc "endpoints" (endpoints->json (:endpoints m))))
          (cond-> (and proxy (contains? proxy :config))
            (assoc "stdioProxyConfig" proxy-config))))))

(defn read-full [path]
  (let [m       (json/parse-string (slurp path))
        servers (get m "mcpServers")
        mcp     {:mcp-servers
                 (into (sorted-map)
                       (for [[nm spec] servers]
                         (let [args (get spec "args")
                               cwd  (get spec "cwd")]
                           [(keyword nm)
                            (cond-> {:command (get spec "command")}
                              (seq args) (assoc :args (vec args))
                              (some? cwd) (assoc :cwd cwd))])))}
        http    (parse-http m)
        rest    (apply dissoc m ["mcpServers" "transport" "tools" "includeHelp"
                                 "stdioMeta" "endpoints" "stdioProxyConfig"])]
    {:mcp (cond-> mcp http (assoc :http http))
     :rest rest}))

(defn write-full [path {:keys [mcp rest]}]
  (let [existing (if (fs/exists? path)
                   (json/parse-string (slurp path))
                   {})
        ;; Replace only the "mcpServers" key, keep all others from either rest or existing
        m*      (merge existing rest)
        servers (into (sorted-map)
                      (for [[k {:keys [command args cwd]}] (:mcp-servers mcp)]
                        [(name k) (cond-> {"command" command}
                                    (seq args) (assoc "args" (vec args))
                                    (some? cwd) (assoc "cwd" cwd))]))
        http    (http->json (:http mcp))
        cleaned (apply dissoc (assoc m* "mcpServers" servers)
                       ["transport" "tools" "includeHelp" "stdioMeta" "endpoints" "stdioProxyConfig"])
        out     (merge cleaned (or http {}))]
    (core/ensure-parent! path)
    (spit path (json/generate-string out {:pretty true}))))
