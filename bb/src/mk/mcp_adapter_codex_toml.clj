(ns mk.mcp-adapter-codex-toml
  (:require [clojure.string :as str]
            [mk.mcp-core :as core]))

(defn splitr
  ([s] (str/split s #"\s+"))
  ([s re] 
   (if (string? s)
     (str/split s (re-pattern re))
     (str/split (str s) (re-pattern re)))))
(defn- extract-mcp-tables [s]
  ;; Returns {:tables {name {command .. args ..}} :rest-string "..."}
  (let [lines (str/split s #"\r?\n")
        out (volatile! {:tables {} :rest [] :cur nil :buf {}})]
    (doseq [ln lines]
      (if-let [[_ inner] (re-matches #"\[\s*mcp_servers\.(.+?)\s*\]" ln)]
        (do
          ;; flush previous cur table into tables
          (when-let [{:keys [name buf]} (:cur @out)]
            (vswap! out update :tables assoc name (:buf @out)))
          ;; start new table
          (vswap! out assoc :cur {:name (str/replace inner #"^\"|\"$" "")}
                          :buf {}))
        (if-let [m (re-matches #"^(\w+)\s*=\s*(.+)$" ln)]
          (let [[_ k v] m]
            (if-let [{:keys [name]} (:cur @out)]
              (let [v* (cond
                         (str/starts-with? v "[")
                         (->> (subs v 1 (dec (count v)))
                              (splitr #"\s*,\s*")
                              (remove str/blank?)
                              (map #(str/replace % #"^\"|\"$" ""))
                              vec)
                         (str/starts-with? v "\"")
                         (str/replace v #"^\"|\"$" "")
                         :else v)]
                (vswap! out assoc-in [:buf k] v*))
              (vswap! out update :rest conj ln)))
          ;; no key=value
          (if (:cur @out)
            (vswap! out update :rest conj) ;; ignore interior formatting
            (vswap! out update :rest conj ln)))))
    ;; flush last table
    (when-let [{:keys [name buf]} (:cur @out)]
      (vswap! out update :tables assoc name (:buf @out)))
    {:tables (:tables @out)
     :rest-string (str/join "\n" (:rest @out))}))

(defn read-full [path]
  (let [s (slurp path)
        {:keys [tables rest-string]} (extract-mcp-tables s)
        mcp {:mcp-servers
             (into (sorted-map)
                   (for [[nm kv] tables]
                     [(keyword nm)
                      (cond-> {:command (get kv "command")}
                        (seq (get kv "args")) (assoc :args (vec (get kv "args")))
                        (get kv "cwd") (assoc :cwd (get kv "cwd")) )]))}]
    {:mcp mcp :rest rest-string :raw s}))

(defn- render-toml-table [[k {:keys [command args cwd]}]]
  (str "[mcp_servers." (format "\"%s\"" (name k)) "]\n"
       "command = " (format "\"%s\"" command) "\n"
       (when (seq args)
         (str "args = [" (str/join ", " (map #(str "\"" % "\"") args)) "]\n"))
       (when cwd
         (str "cwd = \"" cwd "\"\n"))
       "\n"))

(defn write-full [path {:keys [mcp rest]}]
  ;; rest is the "rest-string" we kept; we append regenerated mcp tables at the end.
  (let [block (apply str (map render-toml-table (:mcp-servers mcp)))
        out (str (str/trimr (or rest "")) "\n\n# --- MCP (generated) ---\n\n" block)]
    (core/ensure-parent! path)
    (spit path out)))
