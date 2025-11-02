(ns omni-tools.config.adapters
  "Configuration format adapters for various IDE and MCP formats."
  (:require [cheshire.core :as json]
            [clojure.string :as str]
            [omni-tools.config.core :as core]))

;; ----- JSON Adapter -----
(defn read-json
  "Read JSON configuration file and return canonical map."
  [path]
  (try
    (-> path slurp json/parse-str)
    (catch Exception e
      (throw (ex-info "Failed to parse JSON" {:path path :error e})))))

(defn write-json
  "Write canonical map to JSON file."
  [path data]
  (core/write-atomic! path (json/generate-string data)))

;; ----- TOML Adapter (with HTTP streamable support) -----
(def ^:private table-header-re #"\[\s*mcp_servers\.(.+?)\s*\]")
(def ^:private key-value-re #"^([^=\s]+)\s*=\s*(.+)$")

(defn- strip-quotes [s]
  (str/replace s #"^\"|\"$" ""))

(defn- parse-array [s]
  (let [body (subs s 1 (dec (count s)))]
    (->> (str/split body #",")
         (map #(-> % str/trim strip-quotes))
         (remove str/blank?)
         vec)))

(defn- parse-inline-table [s]
  (let [body (subs s 1 (dec (count s)))]
    (if (str/blank? body)
      {}
      (->> (str/split body #",")
           (reduce (fn [acc entry]
                    (if-let [[_ k v] (re-matches #"^([^=]+?)\s*=\s*(.+)$" entry)]
                      (assoc acc (strip-quotes k) (parse-value v)
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
          (cond->> parts
            (not (str/blank? piece)) (conj piece)))

        escaped?
        (recur rest in-quote? false bracket-depth brace-depth (conj current ch) parts)

        (= ch \")
        (recur rest (not in-quote?) false bracket-depth brace-depth (conj current ch) parts)

        (and (not in-quote?) (= ch \\) in-quote?)
        (recur rest in-quote? true bracket-depth brace-depth (conj current ch) parts)

        (and (not in-quote?) (= ch \[))
        (recur rest in-quote? false (inc bracket-depth) brace-depth (conj current ch) parts)

        (and (not in-quote?) (= ch \]))
        (recur rest in-quote? false (max 0 (dec bracket-depth)) brace-depth (conj current ch) parts)

        (and (not in-quote?) (= ch \{))
        (recur rest in-quote? false bracket-depth (inc brace-depth) (conj current ch) parts)

        (and (not in-quote?) (= ch \}))
        (recur rest in-quote? false bracket-depth (max 0 (dec brace-depth)) (conj current ch) parts)

        (and (not in-quote?) (= ch \,) (zero? bracket-depth) (zero? brace-depth))
        (let [piece (str/trim (apply str current))
              parts' (cond->> parts
                        (not (str/blank? piece)) (conj piece))]
          (recur rest in-quote? false bracket-depth brace-depth [] parts'))

        :else
        (recur rest in-quote? false bracket-depth brace-depth (conj current ch) parts)))))

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
        (let [tables' (cond->> tables
                        cur-name (assoc cur-name cur-entries))]
          {:tables tables'
           :rest-string (str/join "\n" rest-lines)})
        (if-let [[_ inner] (re-matches table-header-re ln)]
          (let [tables' (cond->> tables
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

(defn- sanitize-http-headers [headers]
  (when (map? headers)
    (into (sorted-map)
          (for [[k v] headers]
            [(strip-quotes k) (strip-quotes v)]))))

(defn- sanitize-env-http-headers [headers]
  (when (map? headers)
    (into (sorted-map)
          (for [[k v] headers]
            [(strip-quotes k) (strip-quotes v)]))))

(defn read-toml
  "Read TOML configuration file and return canonical map."
  [path]
  (let [s (slurp path)
        {:keys [tables rest-string experimental-use-rmcp-client]} (extract-mcp-tables s)
        mcp {:mcp-servers
             (into (sorted-map)
                   (for [[nm kv] tables]
                     (let [name (keyword (strip-quotes nm))
                           command (sanitize-command (get kv "command"))
                           args (sanitize-args (get kv "args"))
                           cwd (sanitize-cwd (get kv "cwd"))
                           env (sanitize-env (get kv "env"))
                           url (some-> (get kv "url") strip-quotes)
                           bearer-token-env-var (some-> (get kv "bearer_token_env_var") strip-quotes)
                           http-headers (sanitize-http-headers (get kv "http_headers"))
                           env-http-headers (sanitize-env-http-headers (get kv "env_http_headers"))
                           entry (cond-> {}
                                    command (assoc :command command)
                                    (seq args) (assoc :args args)
                                    (some? cwd) (assoc :cwd cwd)
                                    (seq env) (assoc :env env)
                                    url (assoc :url url)
                                    bearer-token-env-var (assoc :bearer-token-env-var bearer-token-env-var)
                                    (seq http-headers) (assoc :http-headers http-headers)
                                    (seq env-http-headers) (assoc :env-http-headers env-http-headers))]
                       [name entry])))}]
    (cond-> mcp
      experimental-use-rmcp-client (assoc :experimental-use-rmcp-client experimental-use-rmcp-client))))

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

(defn- render-http-headers [headers]
  (when (seq headers)
    (let [pairs (for [[k v] headers]
                  (format "%s = \"%s\"" k (toml-escape v)))]
      (str "http_headers = { " (str/join ", " pairs) " }\n"))))

(defn- render-env-http-headers [headers]
  (when (seq headers)
    (let [pairs (for [[k v] headers]
                  (format "%s = \"%s\"" k (toml-escape v)))]
      (str "env_http_headers = { " (str/join ", " pairs) " }\n"))))

(defn- render-toml-table [[k {:keys [command args cwd env url bearer-token-env-var http-headers env-http-headers]}]]
  (str "[mcp_servers." (format "\"%s\"" (name k)) "]\n"
       (if url
         (str "url = " (format "\"%s\"" url) "\n")
         (str "command = " (format "\"%s\"" command) "\n"))
       (when (and command (seq args))
         (str "args = [" (str/join ", " (map #(format "\"%s\"" %) args)) "]\n"))
       (when cwd (str "cwd = " (format "\"%s\"" cwd) "\n"))
       (when bearer-token-env-var 
         (str "bearer_token_env_var = " (format "\"%s\"" bearer-token-env-var) "\n"))
       (render-env env)
       (render-http-headers http-headers)
       (render-env-http-headers env-http-headers)
       "\n"))

(defn write-toml
  "Write canonical map to TOML file."
  [path {:keys [mcp rest]}]
  (let [expanded (core/expand-servers-home mcp)
        servers* (:mcp-servers expanded)
        block (apply str (map render-toml-table servers*))
        experimental-block (when (:experimental-use-rmcp-client expanded)
                           (str "experimental_use_rmcp_client = " 
                                 (if (:experimental-use-rmcp-client expanded) "true" "false") "\n\n"))
        out (str (str/trimr (or rest "")) "\n\n# --- MCP (generated) ---\n\n" 
                   experimental-block
                   block)]
    (core/ensure-parent! path)
    (spit path out)))

;; ----- EDL Adapter (Emacs Lisp) -----
(defn read-edl
  "Read EDL (Emacs Lisp) configuration file and return canonical map."
  [path]
  (require '[omni-tools.config.edl :as edl])
  (edl/read-full path))

(defn write-edl
  "Write canonical map to EDL (Emacs Lisp) file."
  [path data]
  (require '[omni-tools.config.edl :as edl])
  (edl/write-full path data))