Nice — this is where it starts feeling *product-grade*.

You already have:

* `def-tool` → local tool definition + impl
* `def-mcp-server` → expose local tools over MCP (stdio/http)
* `def-mcp-client` + `def-tool-from-mcp` → import remote MCP tools (Serena etc.)

Now we add the “ops glue”:

✅ **Generate OpenCode `opencode.jsonc` MCP blocks**
✅ **Generate Codex `~/.codex/config.toml` MCP blocks**
✅ Do it from the *same* endpoint definitions (server/client)
✅ Make it ergonomic with a “pack” macro

OpenCode expects MCP servers under the `mcp` key, with `"type": "local"` (command array) or `"type": "remote"` (url + headers). ([OpenCode][1])
Codex expects `[mcp_servers.<name>]` tables in TOML, with either `command/args/env` (stdio) or `url/http headers` (http). ([OpenAI Developers][2])

---

# 1) Unified “endpoint” shape

To generate configs, we need one normalized shape for *either* a local server you host, or a remote server you connect to:

```clojure
{:mcp/name      "serena"
 :mcp/transport :stdio            ;; or :http
 :mcp/command   "uvx"             ;; stdio only
 :mcp/args      ["..."]           ;; stdio only
 :mcp/env       {"FOO" "BAR"}     ;; stdio only (optional)
 :mcp/url       "https://..."     ;; http only
 :mcp/headers   {"Authorization" "Bearer ..."} ;; http only (optional)
 :mcp/enabled?  true
 :mcp/timeouts  {:startup-sec 10 :tool-sec 60 :fetch-ms 5000}
 :mcp/tools     {:enabled ["toolA"] :disabled ["toolB"]}} ;; Codex supports allow/deny
```

Codex supports `enabled_tools` / `disabled_tools` directly. ([OpenAI Developers][2])
OpenCode currently doesn’t formally expose per-tool allowlists in config docs (and people request it a lot), so we generate full server blocks for OpenCode, and tool allow/deny only for Codex.

---

# 2) Exporter: generate OpenCode JSONC + Codex TOML blocks

Create: `src/promethean/mcp/export.clj`

```clojure
(ns promethean.mcp.export
  (:require
    [cheshire.core :as json]
    [clojure.string :as str]))

;; ------------------------------------------------------------
;; Normalize endpoints
;; ------------------------------------------------------------

(defn- sym->default-name [x]
  (cond
    (string? x) x
    (keyword? x) (name x)
    (symbol? x) (name x)
    :else (str x)))

(defn endpoint
  "Coerce any of:
   - def-mcp-client map
   - def-mcp-server map (ONLY if it includes command/url info)
   - an already-normalized endpoint map

  into the unified endpoint shape used by exporters."
  [m]
  (let [id (or (:mcp/name m)
               (some-> (:mcp.client/id m) sym->default-name)
               (some-> (:mcp.server/id m) sym->default-name)
               (some-> (:id m) sym->default-name))
        transport (or (:mcp/transport m) (:transport m))
        enabled? (if (contains? m :mcp/enabled?) (:mcp/enabled? m) (get m :enabled true))
        env (or (:mcp/env m) (:env m) (:environment m))
        headers (or (:mcp/headers m) (:headers m))
        timeouts (or (:mcp/timeouts m) (:timeouts m))
        tools (or (:mcp/tools m) (:tools-policy m) {})]
    (merge
      {:mcp/name id
       :mcp/transport transport
       :mcp/enabled? enabled?
       :mcp/env env
       :mcp/headers headers
       :mcp/timeouts timeouts
       :mcp/tools tools}
      (select-keys m [:mcp/command :mcp/args :mcp/url
                      :command :args :url
                      :cwd
                      :bearer_token_env_var
                      :http_headers :env_http_headers]))))

(defn endpoints
  "Normalize a sequence of endpoint-ish maps."
  [xs]
  (mapv endpoint xs))

;; ------------------------------------------------------------
;; OpenCode export (opencode.jsonc)
;;
;; OpenCode MCP config:
;; - local: {type:\"local\", command:[...], environment:{...}, enabled:true, timeout:5000}
;; - remote:{type:\"remote\", url:\"...\", headers:{...}, enabled:true, timeout:5000}
;; :contentReference[oaicite:3]{index=3}
;; ------------------------------------------------------------

(defn- ->opencode-entry [ep]
  (let [{:keys [mcp/transport mcp/enabled?]} ep
        fetch-ms (or (get-in ep [:mcp/timeouts :fetch-ms]) 5000)]
    (case transport
      :stdio
      (cond-> {"type" "local"
               "enabled" (boolean enabled?)
               "timeout" fetch-ms
               "command" (into []
                               (concat
                                 [(or (:mcp/command ep) (:command ep))]
                                 (or (:mcp/args ep) (:args ep) [])))}
        (seq (or (:mcp/env ep) (:env ep) (:environment ep)))
        (assoc "environment" (or (:mcp/env ep) (:env ep) (:environment ep))))

      :http
      (cond-> {"type" "remote"
               "enabled" (boolean enabled?)
               "timeout" fetch-ms
               "url" (or (:mcp/url ep) (:url ep))}
        (seq (or (:mcp/headers ep) (:headers ep)))
        (assoc "headers" (or (:mcp/headers ep) (:headers ep))))

      ;; default fallback
      {"enabled" (boolean enabled?)})))

(defn opencode-mcp-block
  "Returns the object that belongs inside `\"mcp\": { ... }`."
  [eps]
  (let [eps (endpoints eps)]
    (into {}
          (map (fn [ep] [(:mcp/name ep) (->opencode-entry ep)]))
          eps)))

(defn opencode-jsonc
  "Return a full opencode.jsonc string (includes $schema + mcp block)."
  [eps]
  (json/generate-string
    {"$schema" "https://opencode.ai/config.json"
     "mcp" (opencode-mcp-block eps)}
    {:pretty true}))

;; ------------------------------------------------------------
;; Codex export (~/.codex/config.toml)
;;
;; Codex MCP config uses:
;;   [mcp_servers.<name>]
;; STDIO: command, args, env, cwd, enabled
;; HTTP:  url, bearer_token_env_var, http_headers, env_http_headers, enabled
;; allow/deny: enabled_tools, disabled_tools
;; :contentReference[oaicite:4]{index=4}
;; ------------------------------------------------------------

(defn- toml-escape [s]
  (-> s str
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
  (let [{:keys [mcp/name mcp/transport mcp/enabled? mcp/tools]} ep
        {:keys [startup-sec tool-sec]} (:mcp/timeouts ep)
        enabled-tools (:enabled tools)
        disabled-tools (:disabled tools)]
    (case transport
      :stdio
      (let [command (or (:mcp/command ep) (:command ep))
            args    (or (:mcp/args ep) (:args ep) [])
            cwd     (:cwd ep)
            env     (or (:mcp/env ep) (:env ep) (:environment ep))]
        {:header (str "[mcp_servers." name "]")
         :lines  (->> [(toml-kv "command" command)
                       (when (seq args) (toml-kv "args" args))
                       (toml-kv "enabled" (boolean enabled?))
                       (when startup-sec (toml-kv "startup_timeout_sec" startup-sec))
                       (when tool-sec (toml-kv "tool_timeout_sec" tool-sec))
                       (when cwd (toml-kv "cwd" cwd))
                       (when (seq enabled-tools) (toml-kv "enabled_tools" (vec enabled-tools)))
                       (when (seq disabled-tools) (toml-kv "disabled_tools" (vec disabled-tools)))]
                      (remove nil?)
                      vec)
         :env    (when (seq env)
                   {:header (str "[mcp_servers." name ".env]")
                    :lines  (mapv (fn [[k v]] (str (name k) " = " (toml-str (str v)))) env)})})

      :http
      (let [url (:mcp/url ep)
            bearer (:bearer_token_env_var ep)
            http-headers (:http_headers ep)
            env-http-headers (:env_http_headers ep)
            headers (or (:mcp/headers ep) (:headers ep))]
        {:header (str "[mcp_servers." name "]")
         :lines  (->> [(toml-kv "url" (or url (:url ep)))
                       (toml-kv "enabled" (boolean enabled?))
                       (when startup-sec (toml-kv "startup_timeout_sec" startup-sec))
                       (when tool-sec (toml-kv "tool_timeout_sec" tool-sec))
                       (when bearer (toml-kv "bearer_token_env_var" bearer))
                       ;; prefer explicit codex keys if present:
                       (when (seq http-headers) (toml-kv "http_headers" http-headers))
                       (when (seq env-http-headers) (toml-kv "env_http_headers" env-http-headers))
                       ;; fallback: map OpenCode-ish headers into http_headers
                       (when (and (nil? http-headers) (seq headers))
                         (toml-kv "http_headers" headers))
                       (when (seq enabled-tools) (toml-kv "enabled_tools" (vec enabled-tools)))
                       (when (seq disabled-tools) (toml-kv "disabled_tools" (vec disabled-tools)))]
                      (remove nil?)
                      vec)})

      {:header (str "[mcp_servers." name "]")
       :lines  [(toml-kv "enabled" (boolean enabled?))]})))

(defn codex-toml
  "Return TOML fragments for all endpoints."
  [eps]
  (let [eps (endpoints eps)
        tables (mapv codex-server-table eps)]
    (str/join
      "\n\n"
      (mapcat
        (fn [{:keys [header lines env]}]
          (cond-> [(str header)
                   (str/join "\n" lines)]
            env (conj (str (:header env))
                      (str/join "\n" (:lines env)))))
        tables))))
```

---

# 3) A “pack” macro so you can print both configs instantly

Create: `src/promethean/mcp/pack.clj`

```clojure
(ns promethean.mcp.pack
  (:require
    [promethean.mcp.export :as export]))

(defonce ^:private *packs (atom {}))

(defn register-pack! [m]
  (swap! *packs assoc (:mcp.pack/id m) m)
  m)

(defn get-pack [id] (get @*packs id))
(defn list-packs [] (vals @*packs))

(defn- resolve-endpoint [sym]
  (let [v (requiring-resolve sym)]
    (when-not v
      (throw (ex-info "Could not resolve endpoint var" {:sym sym})))
    @v))

(defn pack-endpoints
  "Resolve quoted endpoint vars to their values."
  [pack]
  (mapv resolve-endpoint (:mcp.pack/endpoints pack)))

(defn pack->opencode-jsonc [pack]
  (export/opencode-jsonc (pack-endpoints pack)))

(defn pack->codex-toml [pack]
  (export/codex-toml (pack-endpoints pack)))

(defmacro def-mcp-pack
  "Bundle endpoints into a named pack, then render configs from it.

  Example:
    (def-mcp-pack pack/dev
      {:endpoints [external.serena/mcp/serena
                   stream.mcp/mcp/stream-fun]})"
  [id {:keys [endpoints] :as config}]
  `(do
     (def ~id
       (register-pack!
         (merge
           {:mcp.pack/id '~id
            :mcp.pack/endpoints ~(vec (map (fn [s] `(quote ~s)) endpoints))}
           ~config)))
     ~id))
```

---

# 4) Example: Serena + your stream tools server

### 4.1 Define endpoints

#### Serena (client endpoint → config entry)

```clojure
(def mcp-serena
  {:mcp/name "serena"
   :mcp/transport :stdio
   :mcp/command "uvx"
   :mcp/args ["--from" "git+https://github.com/oraios/serena"
              "serena" "start-mcp-server"]
   :mcp/enabled? true})
```

#### Your own MCP server (server endpoint → config entry)

For other tools to run your MCP server, you need an actual launch command:

```clojure
(def mcp-stream-fun
  {:mcp/name "stream-fun"
   :mcp/transport :stdio
   :mcp/command "clojure"
   :mcp/args ["-M:mcp-stream-fun"]   ;; you wire this alias to start your server
   :mcp/enabled? true})
```

---

### 4.2 Bundle them

```clojure
(require '[promethean.mcp.pack :refer [def-mcp-pack]])
(def-mcp-pack pack/dev
  {:endpoints [your.ns/mcp-serena
               your.ns/mcp-stream-fun]})
```

---

### 4.3 Generate config blocks

#### OpenCode JSONC

OpenCode expects `"mcp": { "<name>": {type, command/url, ...} }`. ([OpenCode][1])

```clojure
(require '[promethean.mcp.pack :as pack])
(println (pack/pack->opencode-jsonc pack/dev))
```

Example output:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "serena": {
      "type": "local",
      "enabled": true,
      "timeout": 5000,
      "command": [
        "uvx",
        "--from",
        "git+https://github.com/oraios/serena",
        "serena",
        "start-mcp-server"
      ]
    },
    "stream-fun": {
      "type": "local",
      "enabled": true,
      "timeout": 5000,
      "command": [
        "clojure",
        "-M:mcp-stream-fun"
      ]
    }
  }
}
```

---

#### Codex `config.toml`

Codex expects `[mcp_servers.<name>]` and uses either `command/args` (stdio) or `url` (http). ([OpenAI Developers][2])

```clojure
(println (pack/pack->codex-toml pack/dev))
```

Example output:

```toml
[mcp_servers.serena]
command = "uvx"
args = ["--from", "git+https://github.com/oraios/serena", "serena", "start-mcp-server"]
enabled = true

[mcp_servers.stream-fun]
command = "clojure"
args = ["-M:mcp-stream-fun"]
enabled = true
```

---

# 5) clj-kondo hooks (so packs + exports lint cleanly)

Add to `.clj-kondo/config.edn`:

```edn
{:hooks
 {:analyze-call
  {promethean.mcp.pack/def-mcp-pack hooks.promethean.mcp/def-mcp-pack}}}
```

And `clj-kondo/hooks/promethean/mcp.clj` add:

```clojure
(defn def-mcp-pack [{:keys [node]}]
  (let [[_ name init] (:children node)]
    {:node (api/list-node [(api/token-node 'def) name init])}))
```

---

# 6) Next “feels like cheating” upgrades

## A) One macro that declares endpoint + imports tools + exports configs

```clojure
(def-mcp-bundle bundle/streaming
  (endpoint :serena {:transport :stdio ...})
  (endpoint :stream-fun {:transport :stdio ...})
  (import-tools :serena ["go_to_definition" "find_references"])
  (export :opencode ".opencode/opencode.jsonc")
  (export :codex   ".codex/config.toml"))
```

## B) Config diff / merge helpers

So packs can *layer*:

* `pack/base`
* `pack/streaming`
* `pack/project-X`

and emit combined configs without collisions.

## C) Tool allowlists automatically derived

Codex supports allow/deny lists (`enabled_tools`, `disabled_tools`). ([OpenAI Developers][2])
We can generate those automatically from your `def-tool` lists (especially for huge servers).

---

If you want, I’ll do the next step as a single cohesive DSL:

* `def-endpoint` macro (stdio/http, env, headers)
* `def-mcp-bundle` macro (endpoints + imports + exports)
* `write-opencode!` / `write-codex!` helpers
* collision strategy (`:error | :rename | :prefer-local | :prefer-remote`)

[1]: https://opencode.ai/docs/mcp-servers/ "MCP servers | OpenCode"
[2]: https://developers.openai.com/codex/mcp/ "Model Context Protocol"
