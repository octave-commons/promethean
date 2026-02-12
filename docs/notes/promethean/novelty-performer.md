Perfect — now we make your MCP layer *actually shippable* by having **one source of truth** generate:

* ✅ **OpenCode** `opencode.jsonc` `"mcp": { ... }` blocks ([OpenCode][1])
* ✅ **Codex** `~/.codex/config.toml` `[mcp_servers.*]` blocks ([OpenAI Developers][2])
* ✅ from the *same* definitions you already have (`def-mcp-server`, `def-mcp-client`, imports, etc.)

And we’ll do it in a way that supports **stdio + http** transports the MCP spec describes. ([Model Context Protocol][3])

Below is the next “real DSL” layer: **packs/bundles + exporters + file writers**, with sane collision handling and tool allow/deny support (Codex).

---

# ✅ Step 1: Make `def-mcp-server` carry its own launch info

Right now your server spec knows tools, but *other clients* need a command to start it.

So we extend your server definition to include a **`:launch`** map usable by OpenCode/Codex.

```clojure
;; src/promethean/mcp/dsl.clj

(defmacro def-mcp-server
  "Expose local def-tool tools as an MCP server, *and* include launch info
   so OpenCode/Codex can start it."
  [id {:keys [tools launch] :as config}]
  `(do
     (def ~id
       (register-server!
         (merge
           {:mcp.server/id '~id
            :mcp.server/tools (vec (mapv (fn [v#] (deref (resolve v#))) ~tools))
            :mcp.server/tool-map (into {}
                                       (map tool->dispatch-entry)
                                       (mapv (fn [v#] (deref (resolve v#))) ~tools))
            ;; NEW: launch spec for exporters
            :mcp/launch ~launch}
           ~config)))
     ~id))
```

Example server:

```clojure
(def-mcp-server mcp/stream-fun
  {:name "stream-fun"
   :version "0.1.0"
   :transport :stdio
   :launch {:transport :stdio
            :command "clojure"
            :args ["-M:mcp-stream-fun"]
            :cwd "."
            :env {"LOG_LEVEL" "info"}}
   :tools [stream.tools/overlay_text stream.tools/play_sfx]})
```

---

# ✅ Step 2: Introduce `def-endpoint` and `def-mcp-bundle`

Servers and clients both become **endpoints** once they have transport + launch connection info.

### Endpoint macro (stdlib ergonomic)

```clojure
;; src/promethean/mcp/bundle.clj
(ns promethean.mcp.bundle
  (:require
    [clojure.string :as str]
    [promethean.mcp.dsl :as dsl]
    [promethean.mcp.export :as export]))

(defonce ^:private *bundles (atom {}))
(defn register-bundle! [m] (swap! *bundles assoc (:mcp.bundle/id m) m) m)
(defn get-bundle [id] (get @*bundles id))

(defmacro def-endpoint
  "Define a standalone endpoint (useful for remote servers or aliases)."
  [id m]
  `(def ~id (assoc ~m :mcp/name ~(name id))))
```

### Bundle macro

This can mix:

* server vars (with `:mcp/launch`)
* client vars (`def-mcp-client`)
* explicit endpoints (`def-endpoint`)

```clojure
(defn- ->endpoint [x]
  ;; x is a *value* (server map, client map, endpoint map)
  (cond
    (:mcp/launch x)
    (merge
      {:mcp/name (or (:name x) (some-> (:mcp.server/id x) name) "mcp-server")
       :mcp/enabled? true}
      (:mcp/launch x))

    (:mcp.client/id x)
    (merge
      {:mcp/name (some-> (:mcp.client/id x) name)
       :mcp/enabled? true}
      (select-keys x [:transport :command :args :url :env :headers :bearer_token_env_var
                      :http_headers :env_http_headers])
      {:mcp/transport (:transport x)})

    (:mcp/name x) x

    :else
    (throw (ex-info "Not an MCP endpoint-ish value" {:value x}))))

(defn resolve-var* [sym]
  (let [v (requiring-resolve sym)]
    (when-not v (throw (ex-info "Could not resolve symbol" {:sym sym})))
    @v))

(defn bundle-endpoints [bundle]
  (mapv (comp ->endpoint resolve-var*) (:mcp.bundle/refs bundle)))

(defmacro def-mcp-bundle
  "Bundle endpoints, and attach export targets for OpenCode + Codex."
  [id {:keys [refs exports] :as cfg}]
  `(do
     (def ~id
       (register-bundle!
         {:mcp.bundle/id '~id
          :mcp.bundle/refs ~(vec (map (fn [s] `(quote ~s)) refs))
          :mcp.bundle/exports ~exports}))
     ~id))
```

---

# ✅ Step 3: Exporters that generate *blocks* for both tools

You already had exporters — we refine them to match the real docs:

## OpenCode block format

OpenCode config: `"mcp": { "<name>": { "type": "local|remote", ... } }` ([OpenCode][1])

## Codex TOML format

Codex config uses `[mcp_servers.<name>]` with stdio/http options and tool allow/deny. ([OpenAI Developers][2])

Here’s the “block output” API:

```clojure
;; src/promethean/mcp/export_blocks.clj
(ns promethean.mcp.export-blocks
  (:require
    [cheshire.core :as json]
    [clojure.string :as str]
    [promethean.mcp.export :as export]
    [promethean.mcp.bundle :as bundle]))

(defn opencode-mcp-block-jsonc [bundle-id]
  (let [b (bundle/get-bundle bundle-id)
        eps (bundle/bundle-endpoints b)]
    (json/generate-string
      {"mcp" (export/opencode-mcp-block eps)}
      {:pretty true})))

(defn codex-mcp-block-toml [bundle-id]
  (let [b (bundle/get-bundle bundle-id)
        eps (bundle/bundle-endpoints b)]
    (export/codex-toml eps)))
```

---

# ✅ Step 4: File writers (generate full config files)

You wanted *blocks*, but you’ll almost always want “write it out”.

```clojure
;; src/promethean/mcp/write.clj
(ns promethean.mcp.write
  (:require
    [clojure.java.io :as io]
    [cheshire.core :as json]
    [promethean.mcp.bundle :as bundle]
    [promethean.mcp.export :as export]))

(defn write-opencode-jsonc! [bundle-id path]
  (let [b (bundle/get-bundle bundle-id)
        eps (bundle/bundle-endpoints b)
        data {"$schema" "https://opencode.ai/config.json"
              "mcp" (export/opencode-mcp-block eps)}]
    (spit path (json/generate-string data {:pretty true}))
    path))

(defn write-codex-config-toml! [bundle-id path]
  (let [b (bundle/get-bundle bundle-id)
        eps (bundle/bundle-endpoints b)]
    (spit path (export/codex-toml eps))
    path))
```

---

# ✅ Step 5: Tool allow/deny lists (Codex-only)

Codex supports **tool filtering** per server (`enabled_tools`, `disabled_tools`). ([OpenAI Developers][2])

So let endpoints carry:

```clojure
{:mcp/tools {:enabled ["go_to_definition" "find_references"]
             :disabled ["dangerous_tool"]}}
```

Your existing `codex-toml` exporter already included this pattern (good).

OpenCode doesn’t document per-tool filtering in config yet, so we leave that out. ([OpenCode][1])

---

# ✅ Step 6: Example bundle and generated outputs

## Define Serena endpoint (stdio)

Serena exists and is commonly launched via stdio server. ([GitHub][4])

```clojure
(def-endpoint serena
  {:mcp/transport :stdio
   :command "uvx"
   :args ["--from" "git+https://github.com/oraios/serena"
          "serena" "start-mcp-server"]
   :env {"SERENA_LOG" "info"}
   :mcp/tools {:enabled ["go_to_definition" "find_references"]}})
```

## Bundle it with your local server

```clojure
(def-mcp-bundle pack/dev
  {:refs [external.serena/serena
          stream.mcp/mcp/stream-fun]
   :exports {:opencode ".opencode/opencode.jsonc"
             :codex "~/.codex/config.toml"}})
```

---

## Generated OpenCode block (JSONC)

```json
{
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
      ],
      "environment": {
        "SERENA_LOG": "info"
      }
    },
    "stream-fun": {
      "type": "local",
      "enabled": true,
      "timeout": 5000,
      "command": [
        "clojure",
        "-M:mcp-stream-fun"
      ],
      "environment": {
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

Matches OpenCode’s MCP config shape. ([OpenCode][1])

> Note: OpenCode recently had a regression where servers show disabled even if `enabled: true` in certain versions — worth knowing while testing. ([GitHub][5])

---

## Generated Codex block (TOML)

```toml
[mcp_servers.serena]
command = "uvx"
args = ["--from", "git+https://github.com/oraios/serena", "serena", "start-mcp-server"]
enabled = true
enabled_tools = ["go_to_definition", "find_references"]

[mcp_servers.stream-fun]
command = "clojure"
args = ["-M:mcp-stream-fun"]
enabled = true

[mcp_servers.stream-fun.env]
LOG_LEVEL = "info"
```

Codex format references and config live at `~/.codex/config.toml`. ([OpenAI Developers][2])

---

# ✅ Step 7: clj-kondo support for `def-endpoint` + `def-mcp-bundle`

Add to `.clj-kondo/config.edn`:

```edn
{:hooks
 {:analyze-call
  {promethean.mcp.bundle/def-endpoint   hooks.promethean.mcp/def-endpoint
   promethean.mcp.bundle/def-mcp-bundle hooks.promethean.mcp/def-mcp-bundle}}}
```

Hook impl:

```clojure
(ns hooks.promethean.mcp
  (:require [clj-kondo.hooks-api :as api]))

(defn def-endpoint [{:keys [node]}]
  (let [[_ name init] (:children node)]
    {:node (api/list-node [(api/token-node 'def) name init])}))

(defn def-mcp-bundle [{:keys [node]}]
  (let [[_ name init] (:children node)]
    {:node (api/list-node [(api/token-node 'def) name init])}))
```

---

# 🔥 Next upgrade: “single macro = define + export + write”

If you want this to feel **absurdly smooth**, we add:

```clojure
(def-mcp-workspace ws/dev
  (endpoint serena {...})
  (server stream-fun {...})
  (emit :opencode ".opencode/opencode.jsonc")
  (emit :codex "~/.codex/config.toml"))
```

…and it becomes your “MCP infra file” the way `deps.edn` is your dependency file.

If you want that version, say: **“add def-mcp-workspace and emit forms”** and I’ll drop the whole macro set.

[1]: https://opencode.ai/docs/mcp-servers/?utm_source=chatgpt.com "MCP servers"
[2]: https://developers.openai.com/codex/mcp/?utm_source=chatgpt.com "Model Context Protocol"
[3]: https://modelcontextprotocol.io/specification/2025-06-18/basic/transports?utm_source=chatgpt.com "Transports"
[4]: https://github.com/github/github-mcp-server/issues/1396?utm_source=chatgpt.com "Unable to connect to GitHub MCP Server from within ..."
[5]: https://github.com/anomalyco/opencode/issues/8990?utm_source=chatgpt.com "MCP servers showing as disabled #8990"
