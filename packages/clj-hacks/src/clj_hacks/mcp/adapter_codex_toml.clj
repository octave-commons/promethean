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
  (str/replace s #"^\\\"|\\\"$" ""))

(defn- parse-array [s]
  (let [body (subs s 1 (dec (count s)))]
    (->> (splitr body #"\\s*,\\s*")
         (map str/trim)
         (remove str/blank?)
         (map strip-quotes)
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

(defn- flush-table [tables cur]
  (if-let [{:keys [name entries]} cur]
    (assoc tables name entries)
    tables))

(defn- normalize-table-name [inner]
  (-> inner str/trim strip-quotes))

(defn- extract-mcp-tables [s]
  ;; Returns {:tables {name {command .. args ..}} :rest-string "..."}
  (let [lines (str/split s #"\\r?\\n")]
    (loop [[ln & more] lines
           cur nil
           tables (sorted-map)
           rest-lines []]
      (if (nil? ln)
        {:tables (flush-table tables cur)
         :rest-string (str/join "\n" rest-lines)}
        (if-let [[_ inner] (re-matches #"\\[\\s*mcp_servers\\.(.+?)\\s*\\]" ln)]
          (recur more {:name (normalize-table-name inner) :entries {}}
                 (flush-table tables cur)
                 rest-lines)
          (if-let [[_ k v] (re-matches #"^([^=\s]+)\\s*=\\s*(.+)$" ln)]
            (if cur
              (recur more
                     (update cur :entries assoc k (parse-value v))
                     tables
                     rest-lines)
              (recur more cur tables (conj rest-lines ln)))
            (recur more cur tables (conj rest-lines ln))))))))

(defn read-full [path]
  (let [s (slurp path)
        {:keys [tables rest-string]} (extract-mcp-tables s)
        mcp {:mcp-servers
             (into (sorted-map)
                   (for [[nm kv] tables]
                     [(keyword nm)
                      (cond-> {:command (get kv "command")}
                        (seq (get kv "args")) (assoc :args (vec (get kv "args"))))]))}]
    {:mcp mcp :rest rest-string :raw s}))

(defn- render-toml-table [[k {:keys [command args]}]]
  (str "[mcp_servers." (format "\"%s\"" (name k)) "]\n"
       "command = " (format "\"%s\"" command) "\n"
       (when (seq args)
         (str "args = [" (str/join ", " (map #(str "\"" % "\"") args)) "]\n"))
       "\n"))

(defn write-full [path {:keys [mcp rest]}]
  ;; rest is the "rest-string" we kept; we append regenerated mcp tables at the end.
  (let [block (apply str (map render-toml-table (:mcp-servers mcp)))
        out   (str (str/trimr (or rest "")) "\n\n# --- MCP (generated) ---\n\n" block)]
    (core/ensure-parent! path)
    (spit path out)))
