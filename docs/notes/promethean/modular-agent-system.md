Hell yes. This is the missing ergonomic layer: **“tool defs are the source of truth” → “MCP servers are just a projection of those tool defs”** → “remote MCP servers can be imported back into the same tool format.”

Below is a **macro DSL** that does exactly that:

* `def-mcp-server` → expose a set of `def-tool` tools as an MCP server (stdio OR http)
* `def-mcp-client` → define a connection to an external MCP server (stdio OR http)
* `def-tool-from-mcp` → create a local tool that *proxies* a remote MCP tool (Serena, etc.)
* `def-mcp-import` → bulk import several remote tools into a local namespace
* clj-kondo hooks so your macros are “real” to tooling

This is aligned with MCP’s JSON-RPC data layer (`initialize`, `tools/list`, `tools/call`) and its two transport styles (stdio + streamable HTTP). ([Model Context Protocol][1])

---

# 1) Tool shape assumption

This DSL assumes your existing `def-tool` macro produces a var whose **value is a tool map** like:

```clojure
{:tool/name        "overlay_text"
 :tool/title       "Overlay text"
 :tool/description "Render a caption overlay"
 :tool/inputSchema {...json-schema...}
 :tool/impl        (fn tool-impl [ctx args] ...)}
```

If your current `def-tool` uses different keys, just adjust the `tool->mcp-tool` adapter function below.

---

# 2) MCP DSL: servers + clients + imports

Create: `src/promethean/mcp/dsl.clj`

```clojure
(ns promethean.mcp.dsl
  "Macro DSL for:
   - defining MCP servers from local def-tool tools
   - defining MCP clients (external servers)
   - defining local tools that proxy remote MCP tools"
  (:require
    [clojure.string :as str]))

;; -------------------------------------------------------------------
;; Registry (optional but convenient)
;; -------------------------------------------------------------------

(defonce ^:private *servers (atom {}))
(defonce ^:private *clients (atom {}))

(defn register-server! [m] (swap! *servers assoc (:mcp.server/id m) m) m)
(defn register-client! [m] (swap! *clients assoc (:mcp.client/id m) m) m)

(defn get-server [id] (get @*servers id))
(defn get-client [id] (get @*clients id))

(defn list-servers [] (vals @*servers))
(defn list-clients [] (vals @*clients))

;; -------------------------------------------------------------------
;; Tool → MCP tool adapter
;; MCP tools/list expects tool objects including:
;; name, title, description, inputSchema :contentReference[oaicite:1]{index=1}
;; -------------------------------------------------------------------

(defn tool->mcp-tool
  [{:tool/keys [name title description inputSchema] :as tool}]
  {:name        name
   :title       (or title name)
   :description (or description "")
   :inputSchema (or inputSchema {:type "object" :additionalProperties true})})

(defn tool->dispatch-entry
  "Creates a dispatch entry mapping MCP tool name -> the tool map."
  [{:tool/keys [name] :as tool}]
  [name tool])

;; -------------------------------------------------------------------
;; Macro: def-mcp-server
;; -------------------------------------------------------------------

(defmacro def-mcp-server
  "Define an MCP server from def-tool vars.

  Example:

    (def-mcp-server mcp/stream-fun
      {:name \"stream-fun\"
       :version \"0.1.0\"
       :transport :stdio
       :tools [stream.tools/overlay_text stream.tools/play_sfx]})

  Transport options:
    :stdio
    :http  (streamable HTTP style)

  This only defines the server 'spec'. The runtime starts it."
  [id {:keys [tools] :as config}]
  `(do
     (def ~id
       (register-server!
         (merge
           {:mcp.server/id '~id
            :mcp.server/tools (vec (mapv (fn [v#]
                                           ;; v# is a var reference to a tool map
                                           (let [t# (deref (resolve v#))]
                                             t#))
                                         ~tools))
            :mcp.server/tool-map (into {}
                                       (map tool->dispatch-entry)
                                       (mapv (fn [v#] (deref (resolve v#))) ~tools))}
           ~config)))
     ~id))

;; -------------------------------------------------------------------
;; Macro: def-mcp-client
;; -------------------------------------------------------------------

(defmacro def-mcp-client
  "Define a handle for connecting to an external MCP server.

  Examples:

  STDIO (spawn subprocess):
    (def-mcp-client mcp/serena
      {:transport :stdio
       :command   \"uvx\"
       :args      [\"--from\" \"git+https://github.com/oraios/serena\" \"serena\" \"start-mcp-server\"]})

  HTTP (remote):
    (def-mcp-client mcp/remote
      {:transport :http
       :url \"http://localhost:8080/mcp\"})"
  [id config]
  `(do
     (def ~id
       (register-client!
         (merge {:mcp.client/id '~id} ~config)))
     ~id))

;; -------------------------------------------------------------------
;; Proxy tool generator
;; -------------------------------------------------------------------

(defn- default-proxy-name
  [client-id remote-tool-name]
  ;; Example: mcp/serena + "find_references" => "serena.find_references"
  (str (name client-id) "." remote-tool-name))

(defmacro def-tool-from-mcp
  "Define a local tool that proxies a remote MCP tool.

  - client: def-mcp-client var
  - remote-name: MCP tool name on the remote server
  - name/title/description/inputSchema can be supplied,
    otherwise we can lazy-discover via tools/list at runtime.

  Example:

    (def-tool-from-mcp serena/find_references
      {:client mcp/serena
       :remote-name \"find_references\"})

  NOTE:
    This macro assumes you have your existing def-tool macro
    in promethean.ollama.tools or similar.
    You can swap that require + expansion to match your codebase."
  [id {:keys [client remote-name name title description inputSchema] :as opts}]
  `(do
     ;; This is intentionally just a def map so it can be used both:
     ;; - by your benchmark DSL (tool registry)
     ;; - by MCP servers (re-exported)
     (def ~id
       {:tool/name ~(or name `(default-proxy-name (:mcp.client/id ~client) ~remote-name))
        :tool/title ~(or title remote-name)
        :tool/description ~(or description (str "Proxy MCP tool: " remote-name))
        :tool/inputSchema ~(or inputSchema {:type "object" :additionalProperties true})
        :tool/remote {:client ~client :name ~remote-name}
        :tool/impl
        (fn proxy-impl# [ctx# args#]
          ;; runtime will implement this:
          ;; (promethean.mcp.runtime/call-tool! client remote-name args)
          ((:mcp.runtime/call-tool! ctx#) ~client ~remote-name args#))})
     ~id))

(defmacro def-mcp-import
  "Bulk import remote MCP tools as local proxy tools.

  Example:

    (def-mcp-import serena
      {:client mcp/serena
       :prefix \"serena/\"
       :tools [\"find_references\" \"go_to_definition\"]})

  Expands into multiple def-tool-from-mcp forms."
  [import-id {:keys [client prefix tools] :as opts}]
  (let [prefix (or prefix (str (name import-id) "/"))]
    `(do
       ~@(for [t tools
               :let [sym (symbol (str prefix t))]]
           `(def-tool-from-mcp ~sym
              {:client ~client
               :remote-name ~t})))))
```

---

# 3) Runtime contract (server + client)

You asked for macro DSL, but the macros need one **small runtime interface** to be real:

### Runtime must implement

* **server-side**

  * `initialize`
  * `tools/list`
  * `tools/call` ([Model Context Protocol][1])
* **client-side**

  * `call-tool!` for stdio + http

MCP data layer uses JSON-RPC 2.0, same message format across transports. ([Model Context Protocol][1])

You can keep runtime *very thin*: your server spec already contains tools + impl fns.

Here’s the minimal runtime skeleton:

Create: `src/promethean/mcp/runtime.clj`

```clojure
(ns promethean.mcp.runtime
  (:require
    [cheshire.core :as json]
    [clojure.java.io :as io]
    [promethean.mcp.dsl :as dsl]))

;; ------------------------------------------------------------
;; Helpers: MCP result content
;; MCP tool call response returns {content: [...]} :contentReference[oaicite:4]{index=4}
;; ------------------------------------------------------------

(defn ->mcp-content [x]
  (cond
    (and (map? x) (contains? x :content)) x
    (string? x) {:content [{:type "text" :text x}]}
    :else {:content [{:type "text" :text (pr-str x)}]}))

;; ------------------------------------------------------------
;; JSON-RPC dispatcher (transport independent)
;; ------------------------------------------------------------

(defn handle-request
  "Returns a JSON-RPC response map (or nil for notifications)."
  [{:keys [server ctx]} req]
  (let [{:keys [id method params]} req]
    (case method
      "initialize"
      {:jsonrpc "2.0"
       :id id
       :result {:protocolVersion (get-in params ["protocolVersion"] "2025-06-18")
                :capabilities {:tools {:listChanged true}}
                :serverInfo {:name (:name server)
                             :version (:version server)}}}

      "tools/list"
      {:jsonrpc "2.0"
       :id id
       :result {:tools (mapv dsl/tool->mcp-tool (:mcp.server/tools server))}}

      "tools/call"
      (let [tool-name (get params "name")
            args      (get params "arguments")
            tool      (get (:mcp.server/tool-map server) tool-name)]
        (if-not tool
          {:jsonrpc "2.0"
           :id id
           :error {:code -32601
                   :message (str "Tool not found: " tool-name)}}
          (try
            (let [res ((:tool/impl tool) ctx args)]
              {:jsonrpc "2.0"
               :id id
               :result (->mcp-content res)})
            (catch Throwable t
              {:jsonrpc "2.0"
               :id id
               :error {:code -32000
                       :message (.getMessage t)}}))))

      ;; notifications (no id)
      nil)))

;; ------------------------------------------------------------
;; STDIO server
;; ------------------------------------------------------------

(defn serve-stdio!
  "Run MCP server over stdin/stdout.
   This is the local-server transport MCP calls 'stdio'. :contentReference[oaicite:5]{index=5}"
  [server ctx]
  (let [in  (io/reader System/in)
        out (io/writer System/out)]
    (loop []
      (when-let [line (.readLine in)]
        (let [req (json/parse-string line true)
              resp (handle-request {:server server :ctx ctx} req)]
          (when resp
            (.write out (json/generate-string resp))
            (.write out "\n")
            (.flush out)))
        (recur)))))

;; ------------------------------------------------------------
;; Client-side tool calling (placeholder)
;; You’ll implement:
;; - stdio: spawn process, maintain req-id, read/write JSON-RPC
;; - http: POST jsonrpc envelopes
;; ------------------------------------------------------------

(defn call-tool!
  "Call tools/call on a remote MCP client.
   This is referenced by proxy tools created via def-tool-from-mcp."
  [client tool-name args]
  (throw (ex-info "call-tool! not implemented yet" {:client client :tool tool-name :args args})))
```

That’s enough to make the whole model consistent.

---

# 4) Example usage

## Local tools → MCP server (stdio)

```clojure
(ns stream.tools
  (:require [promethean.ollama.tools :refer [def-tool]]))

(def-tool overlay_text
  {:description "Render a caption overlay."
   :inputSchema {:type "object"
                 :properties {:text {:type "string"}}
                 :required ["text"]}}
  (fn [_ctx {:strs [text]}]
    (str "overlayed: " text)))

(def-tool play_sfx
  {:description "Play a sound effect by id."
   :inputSchema {:type "object"
                 :properties {:id {:type "string"}}
                 :required ["id"]}}
  (fn [_ctx {:strs [id]}]
    (str "played: " id)))
```

```clojure
(ns stream.mcp
  (:require
    [promethean.mcp.dsl :refer [def-mcp-server]]
    [stream.tools :as tools]))

(def-mcp-server mcp/stream-fun
  {:name "stream-fun"
   :version "0.1.0"
   :transport :stdio
   :tools [stream.tools/overlay_text
           stream.tools/play_sfx]})
```

Start it:

```clojure
(require '[promethean.mcp.runtime :as mcp])
(mcp/serve-stdio! stream.mcp/mcp/stream-fun {:mcp.runtime/call-tool! mcp/call-tool!})
```

---

## Import Serena tools as local tools

Serena is a real MCP server with many coding-oriented tools. ([GitHub][2])

```clojure
(ns external.serena
  (:require
    [promethean.mcp.dsl :refer [def-mcp-client def-mcp-import]]))

(def-mcp-client mcp/serena
  {:transport :stdio
   :command "uvx"
   :args ["--from" "git+https://github.com/oraios/serena"
          "serena" "start-mcp-server"]})

(def-mcp-import serena
  {:client mcp/serena
   :prefix "serena/"
   :tools ["go_to_definition"
           "find_references"
           "workspace_symbols"]})
```

Now you can **re-export** those imported tools from your own server, or use them inside your agents/benchmarks as if they were local.

---

# 5) clj-kondo support

Add to `.clj-kondo/config.edn`:

```edn
{:hooks
 {:analyze-call
  {promethean.mcp.dsl/def-mcp-server     hooks.promethean.mcp/def-mcp-server
   promethean.mcp.dsl/def-mcp-client     hooks.promethean.mcp/def-mcp-client
   promethean.mcp.dsl/def-tool-from-mcp  hooks.promethean.mcp/def-tool-from-mcp
   promethean.mcp.dsl/def-mcp-import     hooks.promethean.mcp/def-mcp-import}}}
```

Create: `clj-kondo/hooks/promethean/mcp.clj`

```clojure
(ns hooks.promethean.mcp
  (:require [clj-kondo.hooks-api :as api]))

(defn def-mcp-server [{:keys [node]}]
  ;; (def-mcp-server sym {...})
  (let [[_ name init] (:children node)]
    {:node (api/list-node [(api/token-node 'def) name init])}))

(defn def-mcp-client [{:keys [node]}]
  ;; (def-mcp-client sym {...})
  (let [[_ name init] (:children node)]
    {:node (api/list-node [(api/token-node 'def) name init])}))

(defn def-tool-from-mcp [{:keys [node]}]
  ;; (def-tool-from-mcp sym {...})
  (let [[_ name init] (:children node)]
    {:node (api/list-node [(api/token-node 'def) name init])}))

(defn def-mcp-import [{:keys [node]}]
  ;; (def-mcp-import import-id {...})
  ;; Create a dummy def so kondo sees *something* exists.
  ;; The expanded tool defs will also be analyzed if loaded normally.
  (let [[_ name init] (:children node)]
    {:node (api/list-node [(api/token-node 'def) name init])}))
```

---

# 6) Why this design is “right” for your framework

### ✅ One tool format everywhere

* benchmark tools
* local agent tools
* MCP tool exports
* MCP imported tools

### ✅ Server definitions are pure data

So you can:

* introspect them
* generate docs
* generate sandbox UIs
* attach policies (rate limit / auth / file locks)

### ✅ External MCP servers become “just another tool source”

So Serena becomes a *dependency*, not a one-off integration.

---

# 7) Next upgrade I’d do immediately

Add **tool namespace prefixing + collision handling** at server definition time:

```clojure
(def-mcp-server mcp/combined
  {:tools [stream.tools/overlay_text serena/go_to_definition]
   :name "combined"
   :namespace "promethean/"
   :on-collision :error}) ; or :rename/:drop
```

Because in the wild, MCP tool-name collisions happen a lot.

---

If you want, I can extend this into a **“server pack” DSL** too:

* `(def-mcp-pack pack/streaming {...} ...)`
* which exports multiple MCP servers (stdio + http variants)
* and generates a Claude Desktop `mcpServers` config block automatically (for local testing)

Just say the word.

[1]: https://modelcontextprotocol.io/docs/learn/architecture "Architecture overview - Model Context Protocol"
[2]: https://github.com/oraios/serena?utm_source=chatgpt.com "oraios/serena: A powerful coding agent toolkit ..."
