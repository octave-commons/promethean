(ns clj-hacks.mcp.adapter-codex-toml
  "Adapter for Codex TOML MCP configuration files."
  (:require [clj-hacks.mcp.core :as core]
            [clojure.string :as str]))

(defn splitr
  ([s] (str/split s #"\\s+"))
  ([s re]
   (if (string? s)
     (str/split s (re-pattern re))
     (str/split (str s) (re-pattern re)))))

(defn- strip-quotes [s]
  (str/replace s #"^\"|\"$" ""))

(defn- parse-array [s]
  (let [body (subs s 1 (dec (count s)))]
    (->> (str/split body #",")
         (map #(-> % str/trim strip-quotes))
         (remove str/blank?)
         vec)))

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
                           entry (cond-> {}
                                    command (assoc :command command)
                                    (seq args) (assoc :args args)
                                    (some? cwd) (assoc :cwd cwd))]
                       [name entry])))}]
    {:mcp mcp :rest rest-string :raw s}))

(defn- render-toml-table [[k {:keys [command args cwd]}]]
  (str "[mcp_servers." (format "\"%s\"" (name k)) "]\n"
       "command = " (format "\"%s\"" command) "\n"
       (when (seq args)
         (str "args = [" (str/join ", " (map #(str "\"" % "\"") args)) "]\n"))
       (when cwd (str "cwd = " (format "\"%s\"" cwd) "\n"))
       "\n"))

(defn write-full [path {:keys [mcp rest]}]
  ;; rest is the "rest-string" we kept; we append regenerated mcp tables at the end.
  (let [block (apply str (map render-toml-table (:mcp-servers mcp)))
        out   (str (str/trimr (or rest "")) "\n\n# --- MCP (generated) ---\n\n" block)]
    (core/ensure-parent! path)
    (spit path out)))
