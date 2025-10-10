(ns clj-hacks.mcp.adapter-codex-toml
  "Adapter for Codex TOML MCP configuration files."
  (:require
   [cheshire.core :as json]
   [clj-hacks.mcp.core :as core]
   [clojure.string :as str]))

(defn splitr
  ([s] (str/split s #"\\s+"))
  ([s re]
   (if (string? s)
     (str/split s (re-pattern re))
     (str/split (str s) (re-pattern re)))))

(declare parse-value)

(defn- strip-quotes [s]
  (str/replace s #"^\"|\"$" ""))

(defn- parse-array [s]
  (let [body (subs s 1 (dec (count s)))]
    (->> (str/split body #",")
         (map #(-> % str/trim strip-quotes))
         (remove str/blank?)
         vec)))

(defn- split-top-level [s]
  (loop [chars (seq s)
         in-quote? false
         escaped? false
         bracket-depth 0
         brace-depth 0
         current []
         parts []]
    (let [[ch & rest] chars]
      (cond
        (nil? ch)
        (let [piece (str/trim (apply str current))]
          (cond-> parts
            (not (str/blank? piece)) (conj piece)))

        escaped?
        (recur rest in-quote? false bracket-depth brace-depth (conj current ch) parts)

        (= ch \")
        (recur rest (not in-quote?) false bracket-depth brace-depth (conj current ch) parts)

        (and (= ch \\) in-quote?)
        (recur rest in-quote? true bracket-depth brace-depth (conj current ch) parts)

        (and (not in-quote?) (= ch \,) (zero? bracket-depth) (zero? brace-depth))
        (let [piece (str/trim (apply str current))
              parts' (cond-> parts (not (str/blank? piece)) (conj piece))]
          (recur rest in-quote? false bracket-depth brace-depth [] parts'))

        (and (not in-quote?) (= ch \[))
        (recur rest in-quote? false (inc bracket-depth) brace-depth (conj current ch) parts)

        (and (not in-quote?) (= ch \]))
        (recur rest in-quote? false (max 0 (dec bracket-depth)) brace-depth (conj current ch) parts)

        (and (not in-quote?) (= ch \{))
        (recur rest in-quote? false bracket-depth (inc brace-depth) (conj current ch) parts)

        (and (not in-quote?) (= ch \}))
        (recur rest in-quote? false bracket-depth (max 0 (dec brace-depth)) (conj current ch) parts)

        :else
        (recur rest in-quote? false bracket-depth brace-depth (conj current ch) parts)))))
(defn- parse-inline-table [s]
  (let [body (subs s 1 (dec (count s)))]
    (if (str/blank? body)
      {}
      (->> (split-top-level body)
           (reduce (fn [acc entry]
                     (if-let [[_ k v] (re-matches #"^([^=]+?)\\s*=\\s*(.+)$" entry)]
                       (assoc acc (strip-quotes k) (parse-value v))
                       acc))
                   {})))))

(defn- parse-value [raw]
  (let [v (str/trim raw)]
    (cond
      (and (>= (count v) 2)
           (str/starts-with? v "[")
           (str/ends-with? v "]"))
      (parse-array v)

      (and (>= (count v) 2)
           (str/starts-with? v "\"")
           (str/ends-with? v "\""))
      (strip-quotes v)

      (and (>= (count v) 2)
           (str/starts-with? v "{")
           (str/ends-with? v "}"))
      (parse-inline-table v)

      :else v)))

(def ^:private table-header-re #"\[\s*mcp_servers\.(.+?)\s*\]")
(def ^:private key-value-re #"^([^=\s]+)\s*=\s*(.+)$")

(defn- normalize-table-name [inner]
  (-> inner str/trim strip-quotes))

(defn- extract-mcp-tables [s]
  ;; Returns {:tables {name {command .. args ..}} :rest-string "..."}
  (let [lines (str/split s #"\r?\n")]
    (loop [[ln & more] lines
           cur-name nil
           cur-entries {}
           tables (sorted-map)
           rest-lines []]
      (if (nil? ln)
        (let [tables' (cond-> tables
                         cur-name (assoc cur-name cur-entries))]
          {:tables tables'
           :rest-string (str/join "\n" rest-lines)})
        (if-let [[_ inner] (re-matches table-header-re ln)]
          (let [tables' (cond-> tables
                          cur-name (assoc cur-name cur-entries))
                name (normalize-table-name inner)]
            (recur more name {} tables' rest-lines))
          (if-let [[_ k v] (re-matches key-value-re ln)]
            (if cur-name
              (recur more cur-name (assoc cur-entries k (parse-value v)) tables rest-lines)
              (recur more cur-name cur-entries tables (conj rest-lines ln)))
            (recur more cur-name cur-entries tables (conj rest-lines ln))))))))

(defn- sanitize-command [c]
  (some-> c strip-quotes))

(defn- sanitize-cwd [c]
  (some-> c strip-quotes))

(defn- sanitize-args [args]
  (when (seq args)
    (->> args
         (map strip-quotes)
         (remove str/blank?)
         vec)))

(defn- sanitize-env [env]
  (when (map? env)
    (into (sorted-map)
          (for [[k v] env]
            [(strip-quotes k)
             (cond
               (string? v) v
               (map? v) v
               (coll? v) (vec v)
               :else (str v))]))))

(defn read-full [path]
  (let [s (slurp path)
        {:keys [tables rest-string]} (extract-mcp-tables s)
        mcp {:mcp-servers
             (into (sorted-map)
                   (for [[nm kv] tables]
                     (let [name (keyword (strip-quotes nm))
                           command (sanitize-command (get kv "command"))
                           args (sanitize-args (get kv "args"))
                           cwd (sanitize-cwd (get kv "cwd"))
                           env (sanitize-env (get kv "env"))
                           entry (cond-> {}
                                    command (assoc :command command)
                                    (seq args) (assoc :args args)
                                    (some? cwd) (assoc :cwd cwd)
                                    (seq env) (assoc :env env))]
                       [name entry])))}]
    {:mcp mcp :rest rest-string :raw s}))

(defn- tool-id->string [t]
  (cond
    (string? t) t
    (keyword? t) (if-let [ns (namespace t)]
                   (str ns "/" (name t))
                   (name t))
    :else (str t)))

(defn- vector-of-strings [xs]
  (->> (or xs [])
       (map tool-id->string)
       vec))

(defn- expectations->json [m]
  (when (map? m)
    (let [usage (get m :usage)
          pitfalls (get m :pitfalls)
          prerequisites (get m :prerequisites)]
      (cond-> {}
        (contains? m :usage) (assoc "usage" (vector-of-strings usage))
        (contains? m :pitfalls) (assoc "pitfalls" (vector-of-strings pitfalls))
        (contains? m :prerequisites)
        (assoc "prerequisites" (vector-of-strings prerequisites))))))

(defn- meta->json [m]
  (when (map? m)
    (let [workflow (get m :workflow)
          expectations (expectations->json (get m :expectations))]
      (cond-> {}
        (contains? m :title) (assoc "title" (str (:title m)))
        (contains? m :description) (assoc "description" (str (:description m)))
        (contains? m :workflow) (assoc "workflow" (vector-of-strings workflow))
        (contains? m :expectations) (assoc "expectations" expectations)))))

(defn- endpoint-key->path [k]
  (let [s (cond
            (keyword? k) (if-let [ns (namespace k)]
                           (str ns "/" (name k))
                           (name k))
            (string? k) k
            :else (str k))]
    (if (str/starts-with? s "/") s (str "/" s))))

(defn- path->http-key [path]
  (if (= path "/mcp")
    :http-default
    (keyword (str "http-" (str/replace (subs path 1) #"/" "-")))))

(defn- detect-default-cwd [servers]
  (some (fn [[_ spec]] (:cwd spec)) servers))

(def ^:private stdio-command ["--filter" "@promethean/mcp" "dev"])

(defn- build-stdio-config
  [tools include-help meta proxy-config]
  (let [base {"transport" "stdio"
              "tools" (vector-of-strings tools)}
        meta-json (meta->json meta)]
    (cond-> base
      (some? include-help) (assoc "includeHelp" (boolean include-help))
      (seq meta-json) (assoc "stdioMeta" meta-json)
      (and proxy-config (not (str/blank? (str proxy-config))))
      (assoc "stdioProxyConfig" (str proxy-config)))))

(defn- endpoint->server-spec [config cwd]
  (let [json-config (json/generate-string config)]
    (cond-> {:command "pnpm"
             :args stdio-command
             :env {"MCP_CONFIG_JSON" json-config}}
      cwd (assoc :cwd cwd))))

(defn- merge-http-stdio-servers [servers http]
  (if (and (map? http) (= (:transport http) :http))
    (let [cwd (detect-default-cwd servers)
          proxy-config (get-in http [:proxy :config])
          default-config (build-stdio-config (:tools http)
                                             (:include-help? http)
                                             (:stdio-meta http)
                                             proxy-config)
          default-entry [:http-default (endpoint->server-spec default-config cwd)]
          endpoint-entries
          (for [[endpoint spec] (sort-by (comp endpoint-key->path first) (:endpoints http))]
            (let [path (endpoint-key->path endpoint)
                  key (path->http-key path)
                  config (build-stdio-config (:tools spec)
                                             (:include-help? spec)
                                             (:meta spec)
                                             proxy-config)]
              [key (endpoint->server-spec config cwd)]))
          http-map (into (sorted-map) (concat [default-entry] endpoint-entries))]
      (merge-with (fn [existing new]
                    (if (some? (:command existing))
                      existing
                      new))
                  servers
                  http-map))
    servers))

(defn- toml-escape [s]
  (-> s
      (str/replace "\\" "\\\\")
      (str/replace "\"" "\\\"")))

(defn- render-env [env]
  (when (seq env)
    (let [pairs (for [[k v] env]
                  (let [value (cond
                                (string? v) (toml-escape v)
                                (map? v) (toml-escape (json/generate-string v))
                                (coll? v) (toml-escape (json/generate-string v))
                                :else (toml-escape (str v)))]
                    (format "%s = \"%s\"" k value)))]
      (str "env = { " (str/join ", " pairs) " }\n"))))

(defn- render-toml-table [[k {:keys [command args cwd env]}]]
  (str "[mcp_servers." (format "\"%s\"" (name k)) "]\n"
       "command = " (format "\"%s\"" command) "\n"
       (when (seq args)
         (str "args = [" (str/join ", " (map #(str "\"" % "\"") args)) "]\n"))
       (when cwd (str "cwd = " (format "\"%s\"" cwd) "\n"))
       (render-env env)
       "\n"))

(defn write-full [path {:keys [mcp rest]}]
  ;; rest is the "rest-string" we kept; we append regenerated mcp tables at the end.
  (let [expanded (core/expand-servers-home mcp)
        servers* (merge-http-stdio-servers (:mcp-servers expanded) (:http expanded))
        mcp'     (assoc expanded :mcp-servers servers*)
        block (apply str (map render-toml-table (:mcp-servers mcp')))
        out   (str (str/trimr (or rest "")) "\n\n# --- MCP (generated) ---\n\n" block)]
    (core/ensure-parent! path)
    (spit path out)))
