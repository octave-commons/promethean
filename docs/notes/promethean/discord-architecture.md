Yesss. Thinking in **prototypes + mixing + hooks** is the right mental model for “agents + tools as living objects”.

Instead of “class inheritance”, we’ll do:

* **prototypes** = *maps with behavior + defaults*
* **tools** = *instances* that can inherit/override/mix from prototypes
* **servers** = *composed runtime objects* built from prototypes + tool sets
* **hooks** = first-class middleware on *tools and servers*

This gives you a *Lisp-native* version of prototypal inheritance (JS vibes, but cleaner).

Below is a full design + DSL that makes this feel natural.

---

# Core idea

Everything becomes:

```clojure
{:proto/id ...
 :proto/extends ...
 :proto/mixins [...]
 :proto/defaults {...}
 :proto/hooks {:before [...] :after [...] :around [...]}
 :proto/methods {:call fn ... :list-tools fn ...}}
```

And “real things” like tools/servers/agents are **instances** built by:

1. resolving prototype chain
2. merging defaults
3. applying mixins
4. wrapping behavior with hooks

---

# 1) Prototype DSL

Create: `src/promethean/proto.clj`

```clojure
(ns promethean.proto
  "Prototypal inheritance + mixing for tools, servers, agents."
  (:require [clojure.set :as set]))

(defonce ^:private *protos (atom {}))

(defn register-proto! [m]
  (swap! *protos assoc (:proto/id m) m)
  m)

(defn get-proto [id]
  (or (get @*protos id)
      (throw (ex-info "Unknown prototype" {:id id}))))

(defn list-protos [] (vals @*protos))

(defn deep-merge
  "Recursive merge, maps merge deeply, vectors concat, sets union."
  [& ms]
  (letfn [(m2 [a b]
            (merge-with
              (fn [x y]
                (cond
                  (and (map? x) (map? y)) (m2 x y)
                  (and (vector? x) (vector? y)) (into x y)
                  (and (set? x) (set? y)) (set/union x y)
                  :else y))
              a b))]
    (reduce m2 {} ms)))

(defn- resolve-chain
  "Linearized prototype chain, oldest -> newest."
  [proto-id]
  (loop [acc []
         cur proto-id
         seen #{}]
    (when (seen cur)
      (throw (ex-info "Prototype cycle detected" {:at cur})))
    (let [p (get-proto cur)
          parent (:proto/extends p)]
      (if parent
        (recur (conj acc p) parent (conj seen cur))
        (conj acc p)))))

(defn- resolve-mixins
  "Resolve mixins into list of prototype maps."
  [proto]
  (mapv get-proto (:proto/mixins proto)))

(defn materialize
  "Materialize a prototype into a concrete config:
  - merge chain defaults
  - merge mixins defaults
  - merge methods
  - merge hooks

  Returns a resolved prototype-map."
  [proto-id]
  (let [chain (reverse (resolve-chain proto-id)) ;; oldest -> newest
        base (reduce
              (fn [acc p]
                (deep-merge acc
                           (:proto/defaults p)
                           {:proto/hooks (:proto/hooks p)
                            :proto/methods (:proto/methods p)}))
              {:proto/hooks {:before [] :after [] :around []}
               :proto/methods {}}
              chain)
        ;; apply mixins last (so mixins can add behavior, then newest in chain overrides it)
        newest (last chain)
        mixins (resolve-mixins newest)
        mixed (reduce
               (fn [acc m]
                 (deep-merge acc
                            (:proto/defaults m)
                            {:proto/hooks (:proto/hooks m)
                             :proto/methods (:proto/methods m)}))
               base
               mixins)]
    mixed))

(defmacro def-proto
  "Define a prototype.

  (def-proto proto/tool-base
    {:defaults {...}
     :hooks {:before [...] :after [...] :around [...]}
     :methods {:invoke fn}})"
  [id {:keys [extends mixins defaults hooks methods] :as m}]
  `(do
     (def ~id
       (register-proto!
         {:proto/id '~id
          :proto/extends ~extends
          :proto/mixins ~(vec mixins)
          :proto/defaults ~defaults
          :proto/hooks ~(merge {:before [] :after [] :around []} hooks)
          :proto/methods ~methods}))
     ~id))
```

---

# 2) Hook model: before / after / around

Hooks are **functions that transform the invocation**, not random callbacks.

## Hook signatures (clean + composable)

### `:before`

Runs before the tool impl. Can mutate ctx, args, or short-circuit.

```clojure
(fn before [ctx args]
  ;; return {:ctx ctx' :args args'} or {:return result}
  {:ctx ctx :args args})
```

### `:after`

Runs after tool impl. Can rewrite result.

```clojure
(fn after [ctx args result]
  ;; return new result
  result)
```

### `:around`

Full middleware wrapper:

```clojure
(fn around [next]
  (fn [ctx args]
    (next ctx args)))
```

This is **exactly** the shape you want for locking, tracing, rate limits, retries.

---

# 3) Tool objects as prototypes (JS vibes)

Now tools are “instances” that can inherit behavior.

Create: `src/promethean/tool.clj`

```clojure
(ns promethean.tool
  (:require [promethean.proto :as proto]))

(defn wrap-tool
  "Given hooks and a base implementation, build final impl."
  [{:keys [before after around]} impl]
  (let [impl
        ;; around wraps first (middleware pipeline)
        (reduce
          (fn [f mw] ((mw f)))
          impl
          around)

        impl
        ;; before hooks run in order
        (fn [ctx args]
          (loop [ctx ctx
                 args args
                 hs before]
            (if-let [h (first hs)]
              (let [r (h ctx args)]
                (cond
                  (and (map? r) (contains? r :return)) (:return r)
                  (map? r) (recur (:ctx r) (:args r) (rest hs))
                  :else (recur ctx args (rest hs))))
              ;; call the impl if no before short-circuited
              (let [res (impl ctx args)]
                ;; after hooks
                (reduce (fn [r h] (h ctx args r)) res after)))))]
    impl))

(defn materialize-tool
  "Materialize a tool instance from a proto + overrides."
  [{:keys [tool/proto tool/impl] :as tool}]
  (let [p (proto/materialize tool/proto)
        hooks (:proto/hooks p)
        final-impl (wrap-tool hooks tool/impl)]
    (assoc tool
           :tool/impl final-impl
           :tool/resolved hooks
           :tool/methods (:proto/methods p))))
```

---

# 4) Tool DSL: prototypal `def-tool`

Now `def-tool` becomes *prototype aware* + hookable.

```clojure
(ns promethean.ollama.tools
  (:require [promethean.tool :as t]))

(defmacro def-tool
  "Define a tool. You can attach a prototype + per-tool hooks.

  (def-tool overlay_text
    {:proto proto/tool-safe
     :description \"...\"
     :inputSchema {...}
     :hooks {:before [...] :after [...]}}
    (fn [ctx args] ...))"
  [id {:keys [proto hooks] :as meta} impl]
  `(do
     (def ~id
       (t/materialize-tool
         (merge
           {:tool/name ~(name id)
            :tool/proto ~proto
            :tool/description ~(:description meta)
            :tool/inputSchema ~(:inputSchema meta)
            :tool/impl ~impl}
           ;; per-tool hooks are mixins on top of proto hooks
           (when ~hooks
             {:tool/hook-overrides ~hooks}))))
     ~id))
```

We haven’t applied per-tool hook-overrides yet — we’ll do that next, because it’s where mixing gets *spicy*.

---

# 5) Mixing tool-local hooks on top of prototype hooks

Modify `materialize-tool` to merge hook overrides:

```clojure
(defn materialize-tool
  [{:keys [tool/proto tool/impl tool/hook-overrides] :as tool}]
  (let [p (proto/materialize tool/proto)
        base-hooks (:proto/hooks p)
        hooks (proto/deep-merge base-hooks (or tool/hook-overrides {}))
        final-impl (wrap-tool hooks tool/impl)]
    (assoc tool
           :tool/impl final-impl
           :tool/resolved hooks
           :tool/methods (:proto/methods p))))
```

Now you can do:

* global safety proto hooks
* plus tool-specific timing hooks
* plus server-specific dispatch hooks later

---

# 6) Prototypes you actually want

## A) Tracing + timing (stream-friendly)

```clojure
(promethean.proto/def-proto proto/traced
  {:defaults {:trace/enabled true}
   :hooks
   {:around
    [(fn traced-around [next]
       (fn [ctx args]
         (let [t0 (System/nanoTime)]
           (try
             (let [res (next ctx args)
                   dt (/ (- (System/nanoTime) t0) 1e6)]
               (when-let [emit (:trace/emit ctx)]
                 (emit {:event :tool.done
                        :tool (:tool/name ctx)
                        :ms dt}))
               res)
             (catch Throwable t
               (when-let [emit (:trace/emit ctx)]
                 (emit {:event :tool.err
                        :tool (:tool/name ctx)
                        :err (.getMessage t)}))
               (throw t))))))]}})
```

## B) File locking (your multi-agent constraint)

```clojure
(promethean.proto/def-proto proto/file-locked
  {:hooks
   {:before
    [(fn lock-before [ctx args]
       (let [lock! (:locks/acquire! ctx)
             release! (:locks/release! ctx)
             files (or (:files args) [])]
         ;; acquire all locks
         (doseq [f files]
           (lock! f {:by (:agent/id ctx)}))
         ;; attach release fn into ctx
         {:ctx (assoc ctx :locks/release-files! (fn []
                                                 (doseq [f files]
                                                   (release! f {:by (:agent/id ctx)}))))
          :args args}))]

    :after
    [(fn lock-after [ctx _args result]
       (when-let [rel (:locks/release-files! ctx)]
         (rel))
       result)]}})
```

## C) “Safe tool” restrictions (sub-agent gating)

```clojure
(promethean.proto/def-proto proto/safe
  {:hooks
   {:before
    [(fn safe-before [ctx args]
       (when (= :restricted (:agent/mode ctx))
         ;; hard deny certain tools
         (when (contains? (set (:deny/tools ctx)) (:tool/name ctx))
           {:return {:content [{:type "text" :text "Denied by policy."}]}}))
       {:ctx ctx :args args})]}})
```

Now you can build “tiers” of agents by giving them different tool prototypes or deny lists.

---

# 7) Tool mixing feels like JS prototypes now

Example tools:

```clojure
(def-tool overlay_text
  {:proto proto/traced
   :description "Render a caption overlay."
   :inputSchema {:type "object"
                 :properties {:text {:type "string"}}
                 :required ["text"]}}
  (fn [_ctx {:strs [text]}]
    (str "overlayed: " text)))

(def-tool write_file
  {:proto proto/file-locked
   :description "Write text to a file."
   :inputSchema {:type "object"
                 :properties {:path {:type "string"}
                              :content {:type "string"}}
                 :required ["path" "content"]}}
  (fn [_ctx {:strs [path content]}]
    (spit path content)
    "ok"))
```

Now your “tool object” *inherits* traced behavior, locking behavior, etc.

---

# 8) Server-side hooks (the real payoff)

You want hooks **around the tool dispatcher itself**, not only the tool impl.

That’s how you add:

* concurrency limits
* queueing
* retry policy
* global rate limit
* session context injection
* per-agent policy overlays

## Server prototype with dispatch hook chain

Make server “call tool” logic a prototype method:

```clojure
(promethean.proto/def-proto proto/mcp-server-base
  {:methods
   {:dispatch
    (fn [server ctx tool args]
      ;; default dispatch = call tool impl
      ((:tool/impl tool) (assoc ctx :tool/name (:tool/name tool)) args))}
   :hooks
   {:around
    [(fn server-trace [next]
       (fn [server ctx tool args]
         (let [emit (:trace/emit ctx)]
           (when emit (emit {:event :mcp.call :tool (:tool/name tool)}))
           (next server ctx tool args))))]}})
```

Then your server instance becomes:

```clojure
(defn materialize-server
  [{:keys [server/proto] :as server}]
  (let [p (promethean.proto/materialize server/proto)
        dispatch (get-in p [:proto/methods :dispatch])
        hooks (:proto/hooks p)
        final-dispatch
        ;; wrap server dispatch using the same wrap-tool pattern,
        ;; but with signature (server ctx tool args)
        (let [around (:around hooks)]
          (reduce (fn [f mw] ((mw f))) dispatch around))]
    (assoc server :server/dispatch final-dispatch)))
```

Now your MCP server has middleware.

---

# 9) Mixing + “composition objects” (prototypes as Lego bricks)

You’ll want mixins like:

* `proto/retry`
* `proto/timeout`
* `proto/concurrency-limit`
* `proto/log-jsonl`
* `proto/metrics`

These should be **mixins** that can be attached to:

* tool prototypes
* server prototypes
* agent prototypes

Same abstraction. Same hook format.

---

# 10) The *killer* DSL: `def-mixin` + `mix`

Add this sugar:

```clojure
(defmacro def-mixin [id m]
  `(promethean.proto/def-proto ~id (assoc ~m :mixins [])))

(defmacro mix
  "Attach mixins to an instance."
  [m & mixins]
  `(assoc ~m :proto/mixins ~(vec mixins)))
```

Then you can do stuff like:

```clojure
(def-tool shell_exec
  {:proto proto/safe
   :hooks {:before [(fn [_ _] {:return "nope"})]}}
  ...)
```

and later:

```clojure
(def-tool overlay_text
  (mix {:proto proto/traced ...} proto/file-locked proto/safe)
  ...)
```

It reads like JS object composition.

---

# 11) What this buys you for hierarchical async agents

Your parent agent can **spawn sub-agents with stricter prototypes**:

* child gets `proto/safe + proto/traced`
* grandchild gets `proto/safe` only
* “worker” agents get `proto/file-locked`

And you don’t have to change your tool impls at all — policy is purely through prototypes and hooks.

That’s *exactly* what you described.

---

# 12) Next step (I recommend)

If you want the whole framework to feel “alive”:

## Add “event hooks”

Hooks can emit events that go into your report streams:

* `:tool.call`
* `:tool.done`
* `:tool.err`
* `:server.call`
* `:agent.spawn`
* `:agent.message`

This becomes your benchmarking + real world telemetry in one pipe.

---

If you want, I’ll write the next chunk as full files:

* `proto/` mixins library (retry/timeout/concurrency)
* a server materializer that merges tool prototypes + server prototypes cleanly
* a clean `def-agent` that is prototype-based too (agent inherits prompt policies, tool sets, rate limits, etc.)

Just say: **“write proto mixin library + agent prototype dsl”**.
