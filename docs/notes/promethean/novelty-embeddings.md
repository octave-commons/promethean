Alright—let’s make the **“workspace file”** that becomes the single source of truth for:

* ✅ **OpenCode** `opencode.jsonc` MCP blocks (`type: local|remote`) ([OpenCode][1])
* ✅ **Codex** `config.toml` MCP blocks (`[mcp_servers.<name>]`) + allow/deny tools ([OpenAI Developers][2])
* ✅ aware of MCP transports (**stdio** + **streamable HTTP**) ([Model Context Protocol][3])

…and feels like you’re writing a **natural “infra DSL”** instead of config boilerplate.

---

# `def-mcp-workspace` DSL

You’ll write something like:

```clojure
(def-mcp-workspace ws/dev
  {:collision :rename
   :defaults {:timeouts {:fetch-ms 5000 :startup-sec 10 :tool-sec 60}}}

  ;; Use a local def-mcp-server var (must include :mcp/launch in its spec)
  (use stream.mcp/mcp/stream-fun
    :name "stream-fun"
    :tools {:disabled ["dangerous_tool"]})

  ;; Define a remote or local endpoint inline
  (endpoint serena
    {:transport :stdio
     :command "uvx"
     :args ["--from" "git+https://github.com/oraios/serena"
            "serena" "start-mcp-server"]
     :tools {:enabled ["go_to_definition" "find_references"]}})

  ;; Emit config files
  (emit :opencode ".opencode/opencode.jsonc")
  (emit :codex "~/.codex/config.toml"))
```

Then you run:

```clojure
(write-workspace! ws/dev)
```

…and it writes both configs correctly.

---

# Implementation (macros + compiler + writers)

Create: `src/promethean/mcp/workspace.clj`

```clojure
(ns promethean.mcp.workspace
  (:require
    [clojure.string :as str]
    [clojure.java.io :as io]
    [cheshire.core :as json]))

;; =============================================================================
;; Registry
;; =============================================================================

(defonce ^:private *workspaces (atom {}))

(defn register-workspace! [m]
  (swap! *workspaces assoc (:mcp.workspace/id m) m)
  m)

(defn get-workspace [id] (get @*workspaces id))
(defn list-workspaces [] (vals @*workspaces))

(defn- requiring-resolve* [sym]
  (let [v (requiring-resolve sym)]
    (when-not v
      (throw (ex-info "Could not resolve symbol" {:sym sym})))
    v))

(defn- sym->name [x]
  (cond
    (string? x) x
    (keyword? x) (name x)
    (symbol? x) (name x)
    :else (str x)))

;; =============================================================================
;; DSL forms (macros that expand to data)
;; =============================================================================

(defmacro endpoint
  "Define an MCP endpoint inline.

  (endpoint serena {:transport :stdio :command \"uvx\" :args [...]})
  (endpoint figma  {:transport :http  :url \"https://...\" ...})"
  [id m]
  `{:ws/op :endpoint
    :ws/id ~(sym->name id)
    :ws/endpoint ~m})

(defmacro use
  "Use a var that resolves to either:
  - a def-mcp-server map (with :mcp/launch)
  - a def-mcp-client map (with :transport + command/url)
  - a raw endpoint map

  You may override:
    :name, :transport, :command, :args, :url, :env, :headers, :tools, :timeouts"
  [ref & {:as overrides}]
  `{:ws/op :use
    :ws/ref ~(list 'quote ref)
    :ws/overrides ~overrides})

(defmacro emit
  "Emit config targets from the workspace:
    :opencode => writes JSONC opencode.jsonc
    :codex    => writes TOML blocks for ~/.codex/config.toml

  (emit :opencode \".opencode/opencode.jsonc\")
  (emit :codex \"~/.codex/config.toml\")"
  [target path]
  `{:ws/op :emit
    :ws/target ~target
    :ws/path ~path})

(defmacro def-mcp-workspace
  "Top-level workspace definition."
  [id opts & forms]
  `(do
     (def ~id
       (register-workspace!
         {:mcp.workspace/id '~id
          :mcp.workspace/opts ~opts
          :mcp.workspace/forms ~(vec forms)}))
     ~id))

;; =============================================================================
;; Normalization: unify everything into the endpoint shape
;; =============================================================================

(defn- server->endpoint
  "Convert a def-mcp-server spec into an endpoint.
  Requires the server map to contain :mcp/launch."
  [server]
  (when-not (:mcp/launch server)
    (throw (ex-info "def-mcp-server is missing :mcp/launch (needed for OpenCode/Codex export)"
                    {:server-id (:mcp.server/id server)})))
  (let [launch (:mcp/launch server)
        name (or (:name server)
                 (some-> (:mcp.server/id server) name)
                 "mcp-server")]
    (merge
      {:mcp/name name
       :mcp/enabled? true}
      {:mcp/transport (:transport launch)
       :command (:command launch)
       :args (vec (:args launch))
       :cwd (:cwd launch)
       :env (:env launch)
       :headers (:headers launch)
       :url (:url launch)
       :oauth (:oauth launch)
       :timeouts (:timeouts launch)})))

(defn- client->endpoint
  "Convert a def-mcp-client spec into an endpoint."
  [client]
  (let [name (or (some-> (:mcp.client/id client) name)
                 (:name client)
                 "mcp-client")]
    (merge
      {:mcp/name name
       :mcp/enabled? true
       :mcp/transport (:transport client)}
      (select-keys client
                   [:command :args :url :env :headers
                    :bearer_token_env_var :http_headers :env_http_headers
                    :cwd])
      {:timeouts (:timeouts client)
       :tools (:tools client)})))

(defn- already-endpoint? [m]
  (and (map? m) (contains? m :mcp/name) (contains? m :mcp/transport)))

(defn- ->endpoint
  "Accept:
   - def-mcp-server map (with :mcp/launch)
   - def-mcp-client map
   - endpoint map"
  [x]
  (cond
    (and (map? x) (:mcp/launch x)) (server->endpoint x)
    (and (map? x) (:mcp.client/id x)) (client->endpoint x)
    (already-endpoint? x) x
    :else (throw (ex-info "Not an MCP endpoint-ish value" {:value x}))))

(defn- deep-merge
  "Simple recursive merge for nested maps."
  [& ms]
  (letfn [(m2 [a b]
            (merge-with
              (fn [x y]
                (if (and (map? x) (map? y)) (m2 x y) y))
              a b))]
    (reduce m2 {} ms)))

(defn- apply-defaults [defaults ep]
  (-> ep
      (update :timeouts #(deep-merge (:timeouts defaults) %))
      (update :tools #(deep-merge (:tools defaults) %))))

(defn- apply-overrides [ep overrides]
  (deep-merge ep overrides))

;; =============================================================================
;; Collision strategies
;; =============================================================================

(defn- dedupe-endpoints
  "Collision handling by :mcp/name.
  Strategies:
    :error       => throw on duplicates
    :rename      => append -2, -3, ...
    :prefer-first
    :prefer-last"
  [strategy eps]
  (let [groups (vals (group-by :mcp/name eps))]
    (case strategy
      :error
      (do
        (doseq [g groups]
          (when (> (count g) 1)
            (throw (ex-info "MCP endpoint name collision"
                            {:name (:mcp/name (first g))
                             :count (count g)}))))
        eps)

      :prefer-first
      (mapv first groups)

      :prefer-last
      (mapv last groups)

      :rename
      (vec
        (mapcat
          (fn [g]
            (if (= 1 (count g))
              g
              (map-indexed
                (fn [i ep]
                  (if (zero? i)
                    ep
                    (assoc ep :mcp/name (str (:mcp/name ep) "-" (inc i)))))
                g)))
          groups))

      ;; default
      (mapv first groups))))

;; =============================================================================
;; Compiler
;; =============================================================================

(defn compile-workspace
  "Return {:endpoints [...], :emits [...], :opts {...}}"
  [ws]
  (let [{:keys [mcp.workspace/forms mcp.workspace/opts]} ws
        defaults (get opts :defaults {})
        collision (get opts :collision :rename)

        step (fn [acc form]
               (case (:ws/op form)
                 :endpoint
                 (let [ep (-> form :ws/endpoint
                              (assoc :mcp/name (:ws/id form))
                              (assoc :mcp/transport (:transport (:ws/endpoint form))))
                       ep (apply-defaults defaults ep)]
                   (update acc :endpoints conj ep))

                 :use
                 (let [ref (:ws/ref form)
                       overrides (:ws/overrides form)
                       v @(requiring-resolve* ref)
                       ep (->endpoint v)
                       ep (apply-defaults defaults ep)
                       ep (if (seq overrides)
                            (apply-overrides ep overrides)
                            ep)
                       ;; allow :name override
                       ep (if-let [nm (:name overrides)]
                            (assoc ep :mcp/name nm)
                            ep)]
                   (update acc :endpoints conj ep))

                 :emit
                 (update acc :emits conj (select-keys form [:ws/target :ws/path]))

                 acc))

        compiled (reduce step {:endpoints [] :emits [] :opts opts} forms)]
    (update compiled :endpoints #(dedupe-endpoints collision %))))

;; =============================================================================
;; Export: OpenCode opencode.jsonc
;; OpenCode MCP local/remote format: type + command/url + headers + environment + timeout :contentReference[oaicite:3]{index=3}
;; =============================================================================

(defn- opencode-entry [ep]
  (let [fetch-ms (or (get-in ep [:timeouts :fetch-ms]) 5000)]
    (case (:mcp/transport ep)
      :stdio
      (cond-> {:type "local"
               :enabled (boolean (:mcp/enabled? ep true))
               :timeout fetch-ms
               :command (into []
                              (concat [(or (:command ep) "clojure")]
                                      (or (:args ep) [])))}
        (seq (:env ep)) (assoc :environment (:env ep)))

      :http
      (cond-> {:type "remote"
               :enabled (boolean (:mcp/enabled? ep true))
               :timeout fetch-ms
               :url (:url ep)}
        (seq (:headers ep)) (assoc :headers (:headers ep))
        (contains? ep :oauth) (assoc :oauth (:oauth ep)))

      ;; fallback
      {:enabled (boolean (:mcp/enabled? ep true))})))

(defn workspace->opencode-jsonc
  "Full file content."
  [ws]
  (let [{:keys [endpoints]} (compile-workspace ws)]
    (json/generate-string
      {"$schema" "https://opencode.ai/config.json"
       "mcp" (into {}
                  (map (fn [ep] [(:mcp/name ep) (opencode-entry ep)]))
                  endpoints)}
      {:pretty true})))

;; =============================================================================
;; Export: Codex config.toml blocks
;; Codex MCP config tables + allow/deny + http header options :contentReference[oaicite:4]{index=4}
;; =============================================================================

(defn- toml-escape [s]
  (-> (str s)
      (str/replace "\\" "\\\\")
      (str/replace "\"" "\\\"")))

(defn- toml-str [s] (str "\"" (toml-escape s) "\""))

(defn- toml-arr [xs]
  (str "[" (str/join ", " (map toml-str xs)) "]"))

(defn- toml-inline-table [m]
  (str "{ "
       (str/join ", "
                 (for [[k v] m]
                   (str (toml-str (name k)) " = " (toml-str (str v)))))
       " }"))

(defn- toml-kv [k v]
  (cond
    (nil? v) nil
    (string? v) (str k " = " (toml-str v))
    (boolean? v) (str k " = " (if v "true" "false"))
    (number? v) (str k " = " v)
    (vector? v) (str k " = " (toml-arr v))
    (map? v) (str k " = " (toml-inline-table v))
    :else (str k " = " (toml-str (pr-str v)))))

(defn- codex-server-table [ep]
  (let [nm (:mcp/name ep)
        transport (:mcp/transport ep)
        enabled? (boolean (:mcp/enabled? ep true))
        {:keys [startup-sec tool-sec]} (:timeouts ep)
        enabled-tools (get-in ep [:tools :enabled])
        disabled-tools (get-in ep [:tools :disabled])]
    (case transport
      :stdio
      {:header (str "[mcp_servers." nm "]")
       :lines  (->> [(toml-kv "command" (:command ep))
                     (when (seq (:args ep)) (toml-kv "args" (vec (:args ep))))
                     (toml-kv "enabled" enabled?)
                     (when startup-sec (toml-kv "startup_timeout_sec" startup-sec))
                     (when tool-sec (toml-kv "tool_timeout_sec" tool-sec))
                     (when (:cwd ep) (toml-kv "cwd" (:cwd ep)))
                     (when (seq enabled-tools) (toml-kv "enabled_tools" (vec enabled-tools)))
                     (when (seq disabled-tools) (toml-kv "disabled_tools" (vec disabled-tools)))]
                    (remove nil?)
                    vec)
       :env    (when (seq (:env ep))
                 {:header (str "[mcp_servers." nm ".env]")
                  :lines  (mapv (fn [[k v]] (str (name k) " = " (toml-str v)))
                                (:env ep))})}

      :http
      {:header (str "[mcp_servers." nm "]")
       :lines  (->> [(toml-kv "url" (:url ep))
                     (toml-kv "enabled" enabled?)
                     (when startup-sec (toml-kv "startup_timeout_sec" startup-sec))
                     (when tool-sec (toml-kv "tool_timeout_sec" tool-sec))
                     ;; Codex HTTP auth + headers options :contentReference[oaicite:5]{index=5}
                     (when (:bearer_token_env_var ep)
                       (toml-kv "bearer_token_env_var" (:bearer_token_env_var ep)))
                     (when (seq (:http_headers ep))
                       (toml-kv "http_headers" (:http_headers ep)))
                     (when (seq (:env_http_headers ep))
                       (toml-kv "env_http_headers" (:env_http_headers ep)))
                     ;; fallback headers => http_headers
                     (when (and (nil? (:http_headers ep)) (seq (:headers ep)))
                       (toml-kv "http_headers" (:headers ep)))
                     (when (seq enabled-tools) (toml-kv "enabled_tools" (vec enabled-tools)))
                     (when (seq disabled-tools) (toml-kv "disabled_tools" (vec disabled-tools)))]
                    (remove nil?)
                    vec)}

      {:header (str "[mcp_servers." nm "]")
       :lines  [(toml-kv "enabled" enabled?)]})))

(defn workspace->codex-toml
  "TOML blocks only (you can paste/merge into ~/.codex/config.toml)."
  [ws]
  (let [{:keys [endpoints]} (compile-workspace ws)
        tables (mapv codex-server-table endpoints)]
    (str/join
      "\n\n"
      (mapcat
        (fn [{:keys [header lines env]}]
          (cond-> [(str header)
                   (str/join "\n" lines)]
            env (conj (str (:header env))
                      (str/join "\n" (:lines env)))))
        tables))))

;; =============================================================================
;; Writers
;; =============================================================================

(defn write-workspace!
  "Execute the emits declared in the workspace."
  [ws-id]
  (let [ws (if (map? ws-id) ws-id (get-workspace ws-id))
        {:keys [emits]} (compile-workspace ws)
        opencode (workspace->opencode-jsonc ws)
        codex (workspace->codex-toml ws)]
    (doseq [{:keys [ws/target ws/path]} emits]
      (case ws/target
        :opencode (do (spit ws/path opencode) ws/path)
        :codex    (do (spit ws/path codex) ws/path)
        nil))
    {:ok true
     :emitted (mapv (fn [{:keys [ws/target ws/path]}] {:target ws/target :path ws/path})
                    emits)}))
```

---

# Why this maps *exactly* to OpenCode + Codex config formats

### OpenCode (`opencode.jsonc`)

* local servers: `{ "type": "local", "command": ["npx","-y",...], "environment": {...}, "timeout": 5000 }`
* remote servers: `{ "type": "remote", "url": "...", "headers": {...}, "oauth": {...}, "timeout": 5000 }` ([OpenCode][1])

### Codex (`~/.codex/config.toml`)

* `[mcp_servers.<name>]`
* `command/args/env/cwd` for stdio
* `url/bearer_token_env_var/http_headers/env_http_headers` for HTTP
* `enabled_tools/disabled_tools`
* `startup_timeout_sec/tool_timeout_sec` ([OpenAI Developers][2])

And both sit on MCP transports:

* stdio = newline-delimited JSON-RPC (no embedded newlines) ([Model Context Protocol][3])
* streamable HTTP = POST JSON-RPC + optional SSE stream ([Model Context Protocol][3])

---

# clj-kondo support (workspace macros)

Add to `.clj-kondo/config.edn`:

```edn
{:hooks
 {:analyze-call
  {promethean.mcp.workspace/def-mcp-workspace hooks.promethean.mcp/ws-def
   promethean.mcp.workspace/endpoint          hooks.promethean.mcp/ws-endpoint
   promethean.mcp.workspace/use               hooks.promethean.mcp/ws-use
   promethean.mcp.workspace/emit              hooks.promethean.mcp/ws-emit}}}
```

Create `clj-kondo/hooks/promethean/mcp.clj`:

```clojure
(ns hooks.promethean.mcp
  (:require [clj-kondo.hooks-api :as api]))

(defn ws-def [{:keys [node]}]
  ;; (def-mcp-workspace name opts & forms)
  (let [[_ name opts & _forms] (:children node)]
    {:node (api/list-node [(api/token-node 'def) name
                           (api/list-node [(api/token-node 'hash-map)])])}))

(defn ws-endpoint [{:keys [node]}]
  ;; endpoint is data => leave as-is
  {:node node})

(defn ws-use [{:keys [node]}]
  {:node node})

(defn ws-emit [{:keys [node]}]
  {:node node})
```

(We only need kondo to not choke; evaluation semantics happen at runtime anyway.)

---

# Bonus: “make it feel illegal” next step

We can add a single macro that:

* declares endpoints
* declares servers
* imports tool proxies
* emits configs
* and generates CLI commands

Because Codex explicitly supports `codex mcp add ...` and `codex mcp login <server>` flows ([OpenAI Developers][2])
and OpenCode supports `opencode mcp auth <server-name>` plus debug flows ([OpenCode][1])

If you want that, the next macro is:

```clojure
(def-mcp-workspace+ ws/dev
  (server stream.mcp/mcp/stream-fun ...)
  (remote figma {:url "https://..." :oauth true})
  (emit :opencode ...)
  (emit :codex ...)
  (emit :codex-cli ...)     ;; prints "codex mcp add ..." commands
  (emit :opencode-cli ...)) ;; prints "opencode mcp auth ..." hints
```

Say “yes” and I’ll drop the `def-mcp-workspace+` expansion + the CLI emitters.

[1]: https://opencode.ai/docs/mcp-servers/ "MCP servers | OpenCode"
[2]: https://developers.openai.com/codex/mcp/ "Model Context Protocol"
[3]: https://modelcontextprotocol.io/specification/2025-06-18/basic/transports "Transports - Model Context Protocol"
