Alright — now we wire the **prototype + mixin + hooks** idea all the way up into an **async-first hierarchical agent framework**, without losing the “tools are reusable objects” vibe.

What you want is basically:

* **Objects** (tools / agents / servers) are *instances* created from prototypes
* **Behavior** is *composition* (mixins) + *middleware* (hooks)
* **Concurrency** is *structured* (tasks + leases + cancellation)
* **Hierarchy** is *parent/child* with *capability narrowing* by prototype selection

Let’s build the next layer cleanly.

---

# 0) Mental model (JS prototypal inheritance, but better)

In JS, you do:

```js
const child = Object.create(parent)
child.fn = ...
```

In Clojure, we do:

```clojure
(materialize proto-id overrides mixins)
```

Where the “functionality” is a **dispatch fn** wrapped by `:around` middleware,
and policy is injected via `:before/:after`.

That’s it.

---

# 1) A mixin library you actually want

Create: `src/promethean/mixins.clj`

These are *reusable proto blocks* you can attach anywhere:

* tools
* agents
* servers

```clojure
(ns promethean.mixins
  (:require [promethean.proto :as proto]))

;; ------------------------------------------------------------
;; Timing + tracing
;; ------------------------------------------------------------

(proto/def-proto proto/mixin-trace
  {:defaults {:trace/enabled true}
   :hooks
   {:around
    [(fn trace-around [next]
       (fn [& call-args]
         ;; call-args could be [ctx args] (tool) or [server ctx tool args] (server)
         (let [t0 (System/nanoTime)]
           (try
             (let [res (apply next call-args)
                   dt (/ (- (System/nanoTime) t0) 1e6)
                   ctx (first call-args)
                   emit (:trace/emit ctx)]
               (when emit
                 (emit {:event :trace/done :ms dt}))
               res)
             (catch Throwable t
               (let [ctx (first call-args)
                     emit (:trace/emit ctx)]
                 (when emit
                   (emit {:event :trace/error :err (.getMessage t)})))
               (throw t))))))]}})

;; ------------------------------------------------------------
;; Retry (async-safe if your impl returns a future/promise)
;; ------------------------------------------------------------

(proto/def-proto proto/mixin-retry
  {:defaults {:retry/max 2
              :retry/backoff-ms 50}
   :hooks
   {:around
    [(fn retry-around [next]
       (fn [ctx args]
         (let [max (get-in ctx [:retry/max] (get ctx :retry/max 2))
               backoff (get-in ctx [:retry/backoff-ms] (get ctx :retry/backoff-ms 50))]
           (loop [n 0]
             (try
               (next ctx args)
               (catch Throwable t
                 (if (>= n max)
                   (throw t)
                   (do
                     (Thread/sleep (* backoff (inc n)))
                     (recur (inc n))))))))))]}})

;; ------------------------------------------------------------
;; Concurrency limiter (global semaphore)
;; ------------------------------------------------------------

(defonce ^:private *sem (java.util.concurrent.Semaphore. 32))

(proto/def-proto proto/mixin-concurrency-limit
  {:defaults {:concurrency/permits 1}
   :hooks
   {:around
    [(fn limit-around [next]
       (fn [ctx args]
         (let [permits (or (:concurrency/permits ctx) 1)]
           (.acquire *sem permits)
           (try
             (next ctx args)
             (finally
               (.release *sem permits))))))]}})

;; ------------------------------------------------------------
;; Denylist enforcement (capability narrowing)
;; ------------------------------------------------------------

(proto/def-proto proto/mixin-denylist
  {:hooks
   {:before
    [(fn deny-before [ctx args]
       (let [deny (set (:deny/tools ctx))
             tool (:tool/name ctx)]
         (if (contains? deny tool)
           {:return {:content [{:type "text" :text "Denied by policy"}]}}
           {:ctx ctx :args args})))]}})
```

These are “LEGO bricks” you slap onto anything.

---

# 2) A real async primitive: tasks + cancellation + parent/child

Clojure’s concurrency options:

* `future` → simplest, JVM threads
* `core.async` → great for pipelines / events
* virtual threads (Java 21) → also great, if you want

For now, we’ll build with **futures** + **core.async for events**, because it matches your JS intuition:

> “promise + event stream”

Create: `src/promethean/agent/runtime.clj`

```clojure
(ns promethean.agent.runtime
  (:require
    [clojure.core.async :as async]
    [promethean.proto :as proto]
    [promethean.tool :as tool]))

;; ------------------------------------------------------------
;; Event bus
;; ------------------------------------------------------------

(defn make-bus []
  {:events (async/chan 1024)})

(defn emit! [bus evt]
  (async/put! (:events bus) evt))

;; ------------------------------------------------------------
;; Task model
;; ------------------------------------------------------------

(defn make-task
  [{:keys [id parent-id label run-fn]}]
  {:task/id id
   :task/parent-id parent-id
   :task/label label
   :task/status (atom :created)
   :task/cancel? (atom false)
   :task/future (future
                  (reset! (:task/status *1) :running)
                  (try
                    (let [res (run-fn)]
                      (reset! (:task/status *1) :done)
                      res)
                    (catch Throwable t
                      (reset! (:task/status *1) :error)
                      t)))})

(defn cancel-task! [t]
  (reset! (:task/cancel? t) true)
  t)

(defn task-done? [t]
  (let [s @(:task/status t)]
    (or (= s :done) (= s :error))))
```

That’s the skeleton. Now we make the agent itself a **prototype instance**.

---

# 3) Agent prototypes (capability narrowing in the chain)

We want `def-agent-proto` and `def-agent` to feel like defining an object graph.

Create: `src/promethean/agent/dsl.clj`

```clojure
(ns promethean.agent.dsl
  (:require
    [promethean.proto :as proto]))

(defonce ^:private *agents (atom {}))

(defn register-agent! [m]
  (swap! *agents assoc (:agent/id m) m)
  m)

(defn get-agent [id] (get @*agents id))
(defn list-agents [] (vals @*agents))

(defmacro def-agent-proto
  "Define an agent prototype (policy + hooks + defaults).

  Defaults you probably care about:
  - :agent/model
  - :agent/prompt
  - :agent/tools (vector of tool maps)
  - :deny/tools  (denylist)
  - :trace/enabled"
  [id m]
  `(proto/def-proto ~id ~m))

(defmacro def-agent
  "Define an agent instance.

  (def-agent agents/top
    {:proto proto/agent-top
     :tools [tools/a tools/b]
     :model \"gpt-5\"
     :prompt \"...\"})"
  [id {:keys [proto tools model prompt] :as cfg}]
  `(do
     (def ~id
       (register-agent!
         (merge
           {:agent/id ~(name id)
            :agent/proto ~proto
            :agent/tools ~(vec tools)
            :agent/model ~model
            :agent/prompt ~prompt}
           ~cfg)))
     ~id))
```

Now the important part: **agent invocation** must be middleware/hookable too.

---

# 4) Agent call pipeline = `around` middleware like tools

We treat the agent’s “think” function as a **callable**:

```clojure
(agent-call agent ctx message)
```

And we wrap it with proto hooks.

Create: `src/promethean/agent/engine.clj`

```clojure
(ns promethean.agent.engine
  (:require
    [promethean.proto :as proto]
    [promethean.tool :as tool]
    [promethean.mixins :as mixins]
    [promethean.agent.runtime :as rt]))

(defn wrap-call
  "Generic around-middleware wrapper, same concept as tools."
  [around base]
  (reduce (fn [f mw] ((mw f))) base around))

(defn materialize-agent
  "Resolve agent proto -> hooks/defaults/methods.
   Return agent with :agent/call fn."
  [agent]
  (let [p (proto/materialize (:agent/proto agent))
        hooks (:proto/hooks p)
        defaults (:proto/defaults p)
        around (:around hooks)

        base-call
        (fn [ctx msg]
          ;; minimal base behavior:
          ;; 1) call model
          ;; 2) optionally tool-call loop
          ;; ctx must provide :llm/call and :tools/call
          ((:llm/call ctx)
           {:model (or (:agent/model agent) (:agent/model defaults))
            :system (or (:agent/prompt agent) (:agent/prompt defaults))
            :message msg
            :tools (or (:agent/tools agent) (:agent/tools defaults))
            :ctx ctx}))]

    (assoc agent
           :agent/defaults defaults
           :agent/call (wrap-call around base-call))))

(defn run-agent!
  "Run an agent once, emitting events.
   Returns result synchronously (whatever llm returns)."
  [bus agent ctx msg]
  (let [agent (materialize-agent agent)
        ctx (assoc ctx :trace/emit (fn [evt]
                                    (rt/emit! bus (merge {:agent (:agent/id agent)} evt))))]
    (rt/emit! bus {:event :agent/start :agent (:agent/id agent)})
    (let [res ((:agent/call agent) ctx msg)]
      (rt/emit! bus {:event :agent/done :agent (:agent/id agent)})
      res)))
```

Now agents are hookable objects like tools.

---

# 5) Prototypes for hierarchical agent tiers

Now we can define tiers that *feel like JS prototypes*:

* top agent: powerful model, big toolset, can spawn subagents
* child agents: weaker model + denylist + fewer tools
* workers: super restricted, only safe tools

Create: `src/promethean/agent/protos.clj`

```clojure
(ns promethean.agent.protos
  (:require
    [promethean.proto :as proto]
    [promethean.mixins :as mixins]
    [promethean.agent.dsl :refer [def-agent-proto]]))

(def-agent-proto proto/agent-base
  {:defaults {:trace/enabled true
              :agent/model "gpt-5"
              :agent/prompt "You are a helpful agent."}
   :mixins [proto/mixin-trace]})

(def-agent-proto proto/agent-top
  {:extends proto/agent-base
   :defaults {:agent/model "gpt-5"
              :agent/prompt "You are the orchestrator. Break tasks into sub tasks."}})

(def-agent-proto proto/agent-child
  {:extends proto/agent-base
   :mixins [proto/mixin-denylist]
   :defaults {:agent/model "gpt-4.1-mini"
              :deny/tools ["shell_exec" "rm_rf"]
              :agent/prompt "You are a worker. Solve only your assigned subproblem."}})

(def-agent-proto proto/agent-micro
  {:extends proto/agent-child
   :defaults {:agent/model "tiny-model"
              :agent/prompt "Do small safe tasks. No creativity, no risk."}})
```

This is capability narrowing via prototype chain.

---

# 6) Spawning async subagents (tree of futures)

Now we do the thing you described:

* parent spawns children **in parallel**
* parent “sleeps”, wakes periodically
* children report back via event bus or parent mailbox
* parent can spawn grandchildren, but with stricter proto

Add to `src/promethean/agent/orchestrator.clj`

```clojure
(ns promethean.agent.orchestrator
  (:require
    [promethean.agent.runtime :as rt]
    [promethean.agent.engine :as engine]
    [promethean.agent.dsl :as dsl]))

(defn spawn-agent!
  "Spawn a child agent task.
   ctx must contain :llm/call and any tool infra needed."
  [{:keys [bus parent agent ctx msg label]}]
  (let [task (rt/make-task
               {:id (str "task-" (java.util.UUID/randomUUID))
                :parent-id (when parent (:agent/id parent))
                :label (or label (str "run " (:agent/id agent)))
                :run-fn (fn []
                          (engine/run-agent! bus agent ctx msg))})]
    (rt/emit! bus {:event :task/spawn
                   :task (:task/id task)
                   :label (:task/label task)
                   :agent (:agent/id agent)})
    task))

(defn sleep-loop!
  "Parent periodically wakes up while tasks are alive."
  [{:keys [bus interval-ms tasks-atom on-tick]}]
  (future
    (loop []
      (Thread/sleep interval-ms)
      (let [tasks @tasks-atom
            alive (filter (complement rt/task-done?) tasks)]
        (when (seq alive)
          (rt/emit! bus {:event :parent/wakeup :alive (count alive)})
          (when on-tick (on-tick alive))
          (recur))))))
```

Now you have a concurrent hierarchical machine.

---

# 7) Tool hooks: before/after for real needs (locking + “special threads”)

You wanted:

> “If file is locked, agent can check who locked it and open special conversation thread.”

That’s literally a `:before` hook on file-based tools.

Example hook:

```clojure
(defn file-lock-hook
  [lock-registry]
  (fn [ctx args]
    (let [path (get args "path")
          who  (get-in @lock-registry [path :by])]
      (cond
        (nil? path) {:ctx ctx :args args}
        (nil? who)  (do (swap! lock-registry assoc path {:by (:agent/id ctx)})
                        {:ctx ctx :args args})
        (= who (:agent/id ctx)) {:ctx ctx :args args}
        :else
        {:return {:content [{:type "text"
                             :text (str "File locked by " who ". Open a coordination thread?")}]}}))))
```

Attach as tool-level hooks:

```clojure
(def-tool write_file
  {:proto proto/file-locked
   :hooks {:before [(file-lock-hook *locks)]}
   :description "Write file"
   :inputSchema {...}}
  (fn [_ctx args] ...))
```

**Before/after hooks are where coordination becomes “physical laws”.**

---

# 8) The *real* mixing trick: toolsets as prototypes too

Toolsets should be composable like prototypes:

* streaming toolset
* coding toolset
* safe base toolset
* “fun tools” toolset

You can define toolset prototypes:

```clojure
(def-proto proto/toolset-base
  {:defaults {:toolset/tools []}})

(def-proto proto/toolset-stream
  {:extends proto/toolset-base
   :defaults {:toolset/tools [tools/overlay_text tools/play_sfx]}})

(def-proto proto/toolset-code
  {:extends proto/toolset-base
   :defaults {:toolset/tools [serena/go_to_definition serena/find_references]}})
```

Then your agent instance can “inherit” tools:

```clojure
(def-agent agents/top
  {:proto proto/agent-top
   :tools (:toolset/tools (proto/materialize proto/toolset-stream))
   :model "gpt-5"})
```

Now toolsets are object-y too.

---

# 9) What’s next (the missing piece)

Right now we have:

✅ prototypes
✅ mixins
✅ hooks
✅ tool instances
✅ agents as instances
✅ async subagent spawning
✅ event bus

What we still need is the **tool-call loop** inside `:llm/call`:

* model returns tool call request(s)
* runtime resolves tool by name
* tool impl runs (with its hooks)
* results get appended back into the conversation
* repeat until final response

That loop will live in `ctx :llm/call` and should be shared by:

* benchmarks
* real-world agents
* stream performer agents

If you say **“implement tool-call loop + MCP tool proxy integration”**, I’ll write:

* a deterministic tool runner
* a multi-step tool-call conversation loop
* a local tool registry + remote MCP tool registry
* and it’ll plug directly into your `ollama` namespace benchmark runner

So the same machinery runs:

* **bench** = “did it call the right tools?”
* **prod** = “do the thing”

That’s the unified system you’re aiming for.
