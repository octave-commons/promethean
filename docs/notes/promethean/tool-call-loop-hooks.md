Alright — now we build the **actual heart** of the system:

✅ the **tool-call loop** (agent ↔ tools ↔ agent)
✅ **local tools + remote MCP tools** in one registry
✅ **before/after/around hooks** applied everywhere
✅ **async sub-agents** returning partials / events
✅ “stream performer” mode (vision + fun tools) without turning into spaghetti

This is the part where your framework stops being “DSL theory” and becomes a **machine**.

---

# 1) One unified “Call Graph” abstraction

Everything becomes a function:

```clojure
(call ctx input) -> result
```

Where `ctx` contains:

* `:registry` → tool registry (local + MCP proxies)
* `:bus` → event bus
* `:agent` → current agent instance
* `:llm` → model driver (ollama/openai/etc.)
* `:policy` → deny/allow + capability narrowing

And *calls emit events*.

---

# 2) Tool registry: local + MCP proxies look identical

A tool is a map with:

```clojure
{:tool/name "overlay_text"
 :tool/inputSchema {...}
 :tool/impl (fn [ctx args] ...)
 :tool/meta {...}}
```

Local tools already work.

Now make MCP tools also look like that.

## MCP tool proxy shape

```clojure
(defn mcp-tool-proxy
  [{:keys [server-id tool-name inputSchema description call-fn]}]
  {:tool/name tool-name
   :tool/description description
   :tool/inputSchema inputSchema
   :tool/impl (fn [ctx args]
                ;; this is where hooks still wrap it
                (call-fn ctx {:tool tool-name :args args}))
   :tool/meta {:tool/remote? true
               :mcp/server server-id}})
```

So your registry can be:

```clojure
{:tools/by-name {"overlay_text" <local-tool>
                 "go_to_definition" <mcp-tool>}}
```

---

# 3) Registry API (fast + boring)

Create: `src/promethean/tools/registry.clj`

```clojure
(ns promethean.tools.registry)

(defn make-registry []
  {:tools/by-name (atom {})})

(defn register-tool! [reg tool]
  (swap! (:tools/by-name reg) assoc (:tool/name tool) tool)
  reg)

(defn register-tools! [reg tools]
  (reduce register-tool! reg tools))

(defn get-tool [reg name]
  (get @(:tools/by-name reg) name))

(defn list-tools [reg]
  (vals @(:tools/by-name reg)))
```

---

# 4) Tool calling runtime: hooks + tracing + result normalization

This is where “before/after hooks on tools” becomes real.

Create: `src/promethean/tools/runtime.clj`

```clojure
(ns promethean.tools.runtime
  (:require [promethean.tool :as tool]            ;; your materialize-tool / wrap hooks
            [promethean.agent.runtime :as rt]))

(defn normalize-tool-result [x]
  ;; Normalize into OpenAI-ish tool result content.
  ;; You want everything to become a "message chunk"
  (cond
    (and (map? x) (:content x)) x
    (string? x) {:content [{:type "text" :text x}]}
    :else {:content [{:type "json" :json x}]}))

(defn call-tool!
  "Invoke a tool by name with hooks and emit events."
  [{:keys [registry bus agent] :as ctx} tool-name args]
  (let [t (or ((:tools/by-name registry) tool-name)
              (get-tool registry tool-name))]
    (when-not t
      (throw (ex-info "Unknown tool" {:tool tool-name})))

    ;; materialize hooks (proto + per-tool overrides)
    (let [t* (tool/materialize-tool t)
          ctx* (assoc ctx :tool/name tool-name)]
      (rt/emit! bus {:event :tool/call
                     :agent (:agent/id agent)
                     :tool tool-name
                     :args args})

      (try
        (let [raw ((:tool/impl t*) ctx* args)
              res (normalize-tool-result raw)]
          (rt/emit! bus {:event :tool/done
                         :agent (:agent/id agent)
                         :tool tool-name})
          res)
        (catch Throwable e
          (rt/emit! bus {:event :tool/error
                         :agent (:agent/id agent)
                         :tool tool-name
                         :err (.getMessage e)})
          (throw e))))))
```

*(You can decide later if tool execution is synchronous, future-based, virtual-threaded, etc. The interface stays the same.)*

---

# 5) The tool-call loop (model ↔ tools ↔ model)

This is the “agent brain”.

We want a loop that supports:

* single call
* multi-tool call chains
* tool-choice errors
* “decoys”
* streaming partial output (for entertainment)

### Minimal protocol for model drivers

Your model driver returns one step of output:

```clojure
{:type :final
 :content [...]}

;; OR
{:type :tool_calls
 :tool_calls [{:id "call_1" :name "overlay_text" :arguments {...}} ...]
 :content [...]  ;; optional preface text
 }
```

### Loop implementation

Create: `src/promethean/llm/loop.clj`

```clojure
(ns promethean.llm.loop
  (:require
    [promethean.tools.runtime :as tools]
    [promethean.agent.runtime :as rt]))

(defn append-message [state msg]
  (update state :messages conj msg))

(defn tool-result-message [{:keys [tool_call_id name result]}]
  ;; OpenAI-ish message shape (good enough for most adapters)
  {:role "tool"
   :tool_call_id tool_call_id
   :name name
   :content (:content result)})

(defn run-tool-calls!
  [ctx tool_calls]
  (mapv
    (fn [{:keys [id name arguments]}]
      (let [res (tools/call-tool! ctx name arguments)]
        {:id id :name name :result res}))
    tool_calls))

(defn tool-loop!
  "Run an agent conversation until :final or max-steps."
  [{:keys [bus llm agent] :as ctx}
   {:keys [system messages tools max-steps] :as req}]
  (let [max-steps (or max-steps 12)]
    (loop [state {:system system
                  :messages (vec messages)
                  :step 0}]
      (when (>= (:step state) max-steps)
        {:type :final
         :content [{:type "text" :text "Max steps reached."}]
         :messages (:messages state)})

      (rt/emit! bus {:event :llm/step
                     :agent (:agent/id agent)
                     :step (:step state)})

      (let [resp ((:llm/call llm)
                  {:system (:system state)
                   :messages (:messages state)
                   :tools tools
                   :ctx ctx})]

        (case (:type resp)
          :final
          (do
            (rt/emit! bus {:event :llm/final :agent (:agent/id agent)})
            (assoc resp :messages (:messages state)))

          :tool_calls
          (let [tool_calls (:tool_calls resp)
                ;; optional model preface text -> append as assistant message
                state (if (seq (:content resp))
                        (append-message state {:role "assistant" :content (:content resp)})
                        state)

                results (run-tool-calls! ctx tool_calls)

                state (reduce
                        (fn [st {:keys [id name result]}]
                          (append-message st
                                          (tool-result-message
                                            {:tool_call_id id
                                             :name name
                                             :result result})))
                        state
                        results)]
            (recur (-> state
                       (update :step inc))))

          ;; unknown
          {:type :final
           :content [{:type "text" :text "Unknown model response type."}]
           :messages (:messages state)})))))
```

That’s the complete “agentic tool loop”.

Everything else is *adapters and policies*.

---

# 6) Streaming / performer mode

This is the key to “it watches me play a game + cracks jokes + calls fun tools”.

You want:

* partial text streaming chunks
* tool calls interleaved
* event emission to overlay / TTS / SFX
* zero risk tools by default

### Add a “stream hook” mixin

Hook that:

* intercepts assistant text chunks
* emits them to your stream overlay or voice synth

```clojure
(promethean.proto/def-proto proto/mixin-performer
  {:hooks
   {:after
    [(fn performer-after [ctx _args result]
       ;; only if result is assistant content
       (when-let [emit (:trace/emit ctx)]
         (emit {:event :perform/text
                :text (-> result :content first :text)}))
       result)]}})
```

Now slap it on:

* agent proto for entertainer agents
* tool proto for tools producing chat output

### “fun tools” live behind prototypes

Example fun tools:

* `overlay_text`
* `play_sfx`
* `show_emote`
* `spawn_particle`

They’re harmless and instant feedback.
Your agent can call them continuously.

---

# 7) Before/after hooks that actually matter

## A) Rate-limit a tool (stream spam prevention)

```clojure
(defn rate-limit-hook [k ms]
  (let [last* (atom 0)]
    (fn [ctx args]
      (let [now (System/currentTimeMillis)]
        (if (< (- now @last*) ms)
          {:return {:content [{:type "text" :text "Rate limited."}]}}
          (do (reset! last* now)
              {:ctx ctx :args args}))))))
```

Attach per tool:

```clojure
(def-tool play_sfx
  {:proto proto/traced
   :hooks {:before [(rate-limit-hook :play_sfx 500)]}
   :description "Play a sound effect"
   :inputSchema {...}}
  (fn [_ctx args] ...))
```

## B) File lock + “open coordination thread” behavior

When file locked, don’t deny — *route the problem*:

```clojure
(defn lock-or-coordinate-hook [locks*]
  (fn [ctx args]
    (let [path (get args "path")
          owner (get-in @locks* [path :by])]
      (cond
        (nil? path) {:ctx ctx :args args}
        (nil? owner) (do (swap! locks* assoc path {:by (:agent/id ctx)})
                         {:ctx ctx :args args})
        (= owner (:agent/id ctx)) {:ctx ctx :args args}
        :else
        ;; return structured instruction to parent agent
        {:return {:content [{:type "json"
                             :json {:event :coordination/request
                                    :path path
                                    :locked-by owner
                                    :from (:agent/id ctx)}}]}}))))
```

That’s exactly your “special conversation thread” mechanic.

---

# 8) Hierarchical subagents that narrow tools via prototype mixing

When parent spawns child agents, you want:

* stricter denylist
* fewer tools
* weaker model
* still same execution engine

### Spawn with a narrower proto

```clojure
(defn spawn-child
  [parent-agent child-msg]
  {:agent/id (str (:agent/id parent-agent) "/child-" (random-uuid))
   :agent/proto proto/agent-child
   :agent/model "tiny-model"
   :deny/tools ["shell_exec" "write_file" "network_request"]
   :agent/tools [tools/overlay_text tools/play_sfx]})
```

You don’t need a new runtime.
Just materialize agent proto at call time.

---

# 9) “Decoys” in tool benchmarks (and real defense)

**Decoys** are fake tools that look tempting.

This is important because:

* dumb tool callers match by semantic similarity
* good ones match by *argument schema + intent*

A decoy looks like:

```clojure
(def-tool overlay-text
  {:proto proto/traced
   :description "Overlay some text on a stream (DECOY older API)"
   :inputSchema {:type "object"
                 :properties {:msg {:type "string"}}
                 :required ["msg"]}}
  (fn [_ctx _args]
    "This tool is deprecated; use overlay_text with {text}"))
```

Now the test expects:

* model chooses `overlay_text` not `overlay-text`
* AND correct args key `text`, not `msg`

That’s a *real* tool-choice benchmark.

---

# 10) Where MCP servers fit in this loop

You already have MCP servers defined from local tools.

For remote MCP tools:

1. connect to remote server
2. call `tools/list`
3. create `mcp-tool-proxy` entries
4. register into registry

At runtime: tool loop doesn’t care if tool is local or remote.

That’s the “single registry” payoff.

---

# 11) The missing runtime detail: *async first*

Right now tools are synchronous calls.

To go async-first cleanly, pick a single abstraction:

### Option A: everything returns `future`

* simple
* fits your current JVM world
* not as controllable

### Option B: everything returns a `promise` value / `CompletableFuture`

* interoperable with Java libraries
* good for timeouts/cancel

### Option C: `core.async`

* best for streaming pipelines
* more ceremony

**The best hybrid for your brain (JS style)** is:

* core tool call loop is sync
* but tools can return `future` and the runtime can `deref` with timeout
* event bus is core.async

That keeps “promises” vibes without infecting everything.

---

# 12) Next step I’d implement immediately

If we keep going, the next things to make this feel “real” are:

## A) An adapter for Ollama tool calling

So `:llm/call` can parse whatever the model outputs into:

* `:final`
* `:tool_calls`

## B) A “tool-call judge” benchmark harness

Uses:

* decoys
* schema correctness
* order correctness
* retries
* tool abstention

## C) A “performer agent”

* vision input (frames or screenshots)
* commentary
* occasional fun tool calls
* strict denylist

---

If you want, I’ll write the **Ollama tool-call adapter** next, specifically tailored for `PetrosStav/gemma3-tools:4b`-style *soft tool calling* (where it might output pseudo-calls instead of strict JSON). That adapter can include a “parser + repair + validate” layer using `core.spec.alpha` or `malli` (your pick).
