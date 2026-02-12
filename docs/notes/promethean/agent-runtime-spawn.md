Alright — now we build the **actual runtime substrate**: spawn/supervise, async message routing, action execution, and a plan reconciler.

This is the “Agent OS” core that both **real agents** and **benchmarks** can reuse.

Below are **drop-in namespace skeletons** that make the design *tangible* and composable.

---

# ✅ Core runtime pieces we’re adding now

## What you’ll get after this step

* **Supervisor tree** (`spawn!`, `stop!`, parent/child relationships)
* **Async message bus** (topology rules: parent/child only by default)
* **Action interpreter** (tool calls / lock acquire / spawn / send / sleep)
* **Work queues** (LLM + tools executed on worker pools)
* **Plan reconciliation skeleton** (EDN plan drives agent spawning + progress)

Everything writes to **events.jsonl**.

---

# 1) Message bus: topology-aware routing

**`src/promethean/agent/bus.clj`**

```clj
(ns promethean.agent.bus
  "Async-first message router with topology constraints.

  Default:
    - child <-> parent allowed
    - child -> sibling disallowed unless enabled
    - parent -> any child allowed

  Bus owns inbox channels and handles delivery."
  (:require
    [clojure.core.async :as a]
    [promethean.agent.events :as evt]))

(defn- now-ms [] (System/currentTimeMillis))

(defn start-bus!
  [{:keys [emit! run-id inbox-size]
    :or {inbox-size 256}}]
  (let [!agents (atom {})]
    {:run-id run-id
     :emit! emit!
     :agents !agents

     :register!
     (fn register! [{:keys [agent/id agent/parent agent/topology]} inbox-ch]
       (swap! !agents assoc agent/id
              {:id agent/id
               :parent agent/parent
               :topology (or agent/topology {:allow-peer? false
                                             :peer-via-parent? true
                                             :can-talk-to #{:parent :children}})
               :inbox inbox-ch})
       (when emit!
         (emit! run-id {:type "bus/agent-registered"
                        :agent/id agent/id
                        :agent/parent agent/parent
                        :t (now-ms)}))
       true)

     :unregister!
     (fn unregister! [agent-id]
       (swap! !agents dissoc agent-id)
       (when emit!
         (emit! run-id {:type "bus/agent-unregistered"
                        :agent/id agent-id
                        :t (now-ms)}))
       true)

     :lookup
     (fn lookup [agent-id]
       (get @!agents agent-id))

     :can-send?
     (fn can-send? [from-id to-id]
       (let [from (get @!agents from-id)
             to   (get @!agents to-id)]
         (cond
           (nil? from) false
           (nil? to) false
           (= from-id to-id) true

           ;; parent-child allowed
           (= (:parent to) from-id) true
           (= (:parent from) to-id) true

           ;; peers?
           :else
           (let [top (:topology from)
                 allow-peer? (boolean (:allow-peer? top))]
             allow-peer?))))

     :send!
     (fn send!
       "Send a message map to another agent's inbox (async).
        Returns {:ok true} or {:ok false :error ...}."
       [{:keys [from to kind body thread/id] :as msg}]
       (let [from-id (str from)
             to-id   (str to)
             to-agent (get @!agents to-id)]
         (cond
           (nil? to-agent)
           {:ok false :error :unknown-target :to to-id}

           (not ((:can-send? (start-bus! {:emit! emit! :run-id run-id})) from-id to-id))
           ;; NOTE: above line is a bit dumb to call start-bus! again; see below.
           {:ok false :error :topology-denied :from from-id :to to-id}

           :else
           (let [inbox (:inbox to-agent)
                 delivered? (a/offer! inbox
                                     (merge {:msg/id (str "m-" (java.util.UUID/randomUUID))
                                             :msg/from from-id
                                             :msg/to to-id
                                             :msg/kind (or kind "chat")
                                             :msg/thread-id thread/id
                                             :msg/body body
                                             :t (now-ms)}
                                            (dissoc msg :from :to :kind :body :thread/id)))]
             (when emit!
               (emit! run-id {:type "agent/message"
                              :agent/id to-id
                              :from from-id
                              :kind (or kind "chat")
                              :thread/id thread/id
                              :body body
                              :delivered delivered?
                              :t (now-ms)}))
             (if delivered?
               {:ok true}
               {:ok false :error :inbox-full :to to-id})))))}))
```

### Quick fix to avoid the “start-bus! recursion”

In `:send!`, instead of calling `start-bus!` again, do this:

Replace this line:

```clj
(not ((:can-send? (start-bus! {:emit! emit! :run-id run-id})) from-id to-id))
```

With:

```clj
(not ((fn can-send? [from-id to-id]
        (let [from (get @!agents from-id)
              to   (get @!agents to-id)]
          (cond
            (nil? from) false
            (nil? to) false
            (= from-id to-id) true
            (= (:parent to) from-id) true
            (= (:parent from) to-id) true
            :else (boolean (get-in from [:topology :allow-peer?])))))
      from-id to-id))
```

(Or, better: pull `can-send?` into a local `letfn` when building the map.)

---

# 2) Work orchestration: job queues for tools + LLM calls

This is the **work plane**.
Control plane schedules “jobs”, orch runs them concurrently.

**`src/promethean/agent/orch.clj`**

```clj
(ns promethean.agent.orch
  "Work plane: async job queues for LLM and tool calls.

  - jobs are durable via events (requested/result)
  - execution is concurrent, bounded by worker count"
  (:require
    [clojure.core.async :as a]
    [promethean.agent.events :as evt]
    [promethean.ollama.client :as ollama]
    [promethean.ollama.tools :as tools]))

(defn- now-ms [] (System/currentTimeMillis))
(defn- uuid [] (str (java.util.UUID/randomUUID)))

(defn start-orch!
  [{:keys [emit! run-id host model llm-workers tool-workers]
    :or {llm-workers 4 tool-workers 8}}]
  (let [llm-ch (a/chan 256)
        tool-ch (a/chan 256)]

    ;; LLM pipeline
    (a/pipeline-blocking
      llm-workers
      (a/chan 256)
      (map (fn [{:keys [reply job] :as m}]
             (let [{:keys [agent/id messages tools options timeout-ms think]} job
                   call-id (or (:call-id job) (str "llm-" (uuid)))]
               (when emit!
                 (emit! run-id {:type "llm/requested"
                                :llm/call-id call-id
                                :agent/id agent/id
                                :t (now-ms)}))
               (try
                 (let [resp (ollama/chat! {:host (or host "http://localhost:11434")
                                           :model (or (:model job) model)
                                           :messages messages
                                           :tools tools
                                           :options options
                                           :timeout-ms (or timeout-ms 300000)
                                           :think think})]
                   (when emit!
                     (emit! run-id {:type "llm/result"
                                    :llm/call-id call-id
                                    :agent/id agent/id
                                    :ok true
                                    :t (now-ms)}))
                   (when reply (a/>!! reply {:ok true :call-id call-id :resp resp}))
                   m)
                 (catch Throwable t
                   (when emit!
                     (emit! run-id {:type "llm/result"
                                    :llm/call-id call-id
                                    :agent/id agent/id
                                    :ok false
                                    :error (.getMessage t)
                                    :t (now-ms)}))
                   (when reply (a/>!! reply {:ok false :call-id call-id :error (.getMessage t)}))
                   m)))))
      llm-ch)

    ;; Tool pipeline
    (a/pipeline-blocking
      tool-workers
      (a/chan 256)
      (map (fn [{:keys [reply job] :as m}]
             (let [{:keys [agent/id tool/name tool/arguments tool/call-id]} job
                   call-id (or tool/call-id (str "tc-" (uuid)))]
               (when emit!
                 (emit! run-id {:type "tool/requested"
                                :tool/call-id call-id
                                :tool/name tool/name
                                :agent/id agent/id
                                :t (now-ms)}))
               (let [valid (tools/validate-tool-call {:name tool/name
                                                      :arguments tool/arguments})
                     result (if (:ok valid)
                              (tools/invoke-tool! tool/name (:arguments valid))
                              {:ok false :error :invalid-arguments :details (:details valid)})]
                 (when emit!
                   (emit! run-id {:type "tool/result"
                                  :tool/call-id call-id
                                  :tool/name tool/name
                                  :agent/id agent/id
                                  :ok (:ok result)
                                  :t (now-ms)}))
                 (when reply (a/>!! reply (assoc result :tool/call-id call-id)))
                 m))))
      tool-ch)

    {:llm-ch llm-ch
     :tool-ch tool-ch

     :llm!
     (fn llm! [job]
       (let [reply (a/promise-chan)]
         (a/put! llm-ch {:job job :reply reply})
         reply))

     :tool!
     (fn tool! [job]
       (let [reply (a/promise-chan)]
         (a/put! tool-ch {:job job :reply reply})
         reply))}))
```

This gives you:

* bounded concurrency
* async replies
* evented durability

---

# 3) Runtime: spawn agents, supervise, interpret actions

This is the **control plane**.

Key design choice:

> Each agent has a `step-fn` that returns **actions**.
> Runtime interprets actions (send/spawn/lock/tool/sleep).

That means:

* **benchmarks** can use deterministic `step-fn`
* **production** uses “LLM step-fn”
* same runtime

---

## 3a) Action helpers

**`src/promethean/agent/actions.clj`**

```clj
(ns promethean.agent.actions)

(defn send-msg
  ([to kind body] (send-msg to kind body nil))
  ([to kind body thread-id]
   {:action :send :to (str to) :kind (name kind) :body body :thread/id thread-id}))

(defn spawn-agent [spec]
  {:action :spawn :spec spec})

(defn acquire-lock [path]
  {:action :lock/acquire :path path})

(defn release-lock [path]
  {:action :lock/release :path path})

(defn call-tool [tool-name arguments]
  {:action :tool/call :tool/name (str tool-name) :tool/arguments arguments})

(defn sleep-ms [ms]
  {:action :sleep :ms (long ms)})

(defn done
  ([] (done :ok nil))
  ([status result] {:action :done :status status :result result}))
```

---

## 3b) The runtime itself

**`src/promethean/agent/runtime.clj`**

```clj
(ns promethean.agent.runtime
  "Async-first hierarchical agent runtime.

  - spawn agents (tree)
  - message passing via bus (topology)
  - action interpreter
  - integrates locks + orch (tool/llm queues)
  - durable via event log"
  (:require
    [clojure.core.async :as a]
    [promethean.agent.events :as evt]
    [promethean.agent.bus :as bus]
    [promethean.agent.locks :as locks]
    [promethean.agent.orch :as orch]))

(defn- now-ms [] (System/currentTimeMillis))
(defn- uuid [] (str (java.util.UUID/randomUUID)))

(defn default-agent-id []
  (str "agent-" (uuid)))

(defn start-runtime!
  [{:keys [run-id emit-writer host default-model]
    :or {run-id (evt/run-id!)
         default-model "qwen3"}}]
  (let [emit! (:emit! emit-writer)
        ;; services
        lock-svc (locks/start-lock-service! {:emit! emit! :run-id run-id})
        bus-svc  (bus/start-bus! {:emit! emit! :run-id run-id})
        orch-svc (orch/start-orch! {:emit! emit! :run-id run-id :host host :model default-model})

        ;; registry
        !agents (atom {})]

    {:run-id run-id
     :emit! emit!
     :bus bus-svc
     :locks lock-svc
     :orch orch-svc
     :agents !agents

     :agent
     (fn agent [id] (get @!agents id))}))

(defn- register-agent!
  [rt agent inbox done-ch stop-ch]
  (swap! (:agents rt) assoc (:agent/id agent)
         (merge agent
                {:inbox inbox
                 :done done-ch
                 :stop stop-ch
                 :children #{}
                 :status :spawned
                 :t0 (now-ms)}))
  ((:register! (:bus rt)) agent inbox)
  (when-let [emit! (:emit! rt)]
    (emit! (:run-id rt) {:type "agent/spawned"
                         :agent/id (:agent/id agent)
                         :agent/parent (:agent/parent agent)
                         :agent/depth (:agent/depth agent)
                         :model (get-in agent [:agent/model :name])
                         :t (now-ms)}))
  agent)

(defn- update-agent-status!
  [rt agent-id status & [reason]]
  (swap! (:agents rt) assoc-in [agent-id :status] status)
  (when-let [emit! (:emit! rt)]
    (emit! (:run-id rt) {:type "agent/status"
                         :agent/id agent-id
                         :status (name status)
                         :reason (when reason (name reason))
                         :t (now-ms)})))

(defn- interpret-action!
  [rt agent action]
  (let [agent-id (:agent/id agent)
        emit! (:emit! rt)
        run-id (:run-id rt)]
    (case (:action action)

      :send
      (let [resp ((:send! (:bus rt))
                  {:from agent-id
                   :to (:to action)
                   :kind (:kind action)
                   :body (:body action)
                   :thread/id (:thread/id action)})]
        resp)

      :spawn
      (let [spec (:spec action)]
        ;; spawn child under this agent
        {:ok true :spawned (spawn! rt (assoc spec :agent/parent agent-id))})

      :lock/acquire
      (let [reply (a/promise-chan)]
        (a/put! (:req-ch (:locks rt))
                {:op :acquire
                 :agent agent-id
                 :path (:path action)
                 :mode :write
                 :reply reply})
        (a/<!! reply))

      :lock/release
      (let [reply (a/promise-chan)]
        (a/put! (:req-ch (:locks rt))
                {:op :release
                 :agent agent-id
                 :path (:path action)
                 :reply reply})
        (a/<!! reply))

      :tool/call
      (let [reply ((:tool! (:orch rt))
                   {:agent/id agent-id
                    :tool/name (:tool/name action)
                    :tool/arguments (:tool/arguments action)})]
        (a/<!! reply))

      :sleep
      (do
        (Thread/sleep (long (:ms action)))
        {:ok true})

      :done
      (do
        (update-agent-status! rt agent-id :done (:status action))
        (when emit!
          (emit! run-id {:type "agent/done"
                         :agent/id agent-id
                         :status (name (or (:status action) :ok))
                         :t (now-ms)}))
        {:ok true :done true :result (:result action)})

      {:ok false :error :unknown-action :action (:action action)})))

(defn- agent-loop!
  "Core control loop for an agent.

  step-fn signature:
    (fn [{:keys [rt agent inbox-msgs state]}] => [actions...])

  step-fn should be fast; if it wants to call LLM/tools, return actions that do so."
  [rt agent inbox stop-ch done-ch]
  (let [tick (a/chan)
        tick-ms (long (or (get-in agent [:agent/budget :tick-ms]) 2500))

        ;; local state for the agent's step-fn
        !state (atom {:status :running
                      :step 0
                      :ephemeral []
                      :locks #{}})]

    ;; periodic tick
    (a/go-loop []
      (let [[_ ch] (a/alts! [(a/timeout tick-ms) stop-ch] :priority true)]
        (when-not (= ch stop-ch)
          (a/>! tick {:type :tick :t (now-ms)})
          (recur))))

    (a/go-loop []
      (let [[msg ch] (a/alts! [inbox tick stop-ch] :priority true)]
        (cond
          (= ch stop-ch)
          (do
            (update-agent-status! rt (:agent/id agent) :stopped :stop)
            (a/>! done-ch {:ok false :reason :stopped})
            :stopped)

          :else
          (do
            ;; store ephemeral inbox message (bounded)
            (when msg
              (swap! !state update :ephemeral
                     (fn [xs] (vec (take-last 50 (conj (or xs []) msg))))))

            (update-agent-status! rt (:agent/id agent) :running (if (= (:type msg) :tick) :tick :message))

            ;; compute actions
            (let [step-fn (or (:agent/step-fn agent) (fn [_] []))
                  ctx {:rt rt :agent agent :inbox-msg msg :state @!state}
                  actions (try
                            (step-fn ctx)
                            (catch Throwable t
                              (when-let [emit! (:emit! rt)]
                                (emit! (:run-id rt) {:type "agent/error"
                                                     :agent/id (:agent/id agent)
                                                     :error (.getMessage t)
                                                     :t (now-ms)}))
                              []))
                  actions (vec (or actions []))]

              ;; interpret actions sequentially (simple MVP)
              ;; later: allow parallel action batches
              (doseq [a actions]
                (let [resp (interpret-action! rt agent a)]
                  (swap! !state update :step inc)
                  (when (and (map? resp) (:done resp))
                    (a/>! done-ch resp))))

              ;; decide sleep status when idle
              (when (and (empty? actions)
                         (= (:type msg) :tick))
                (update-agent-status! rt (:agent/id agent) :sleeping :idle))

              (recur))))))))

(defn spawn!
  "Spawn an agent process under runtime.

  agent spec keys:
    :agent/id
    :agent/parent
    :agent/depth
    :agent/model {:name ... :provider :ollama}
    :agent/instructions
    :agent/toolset
    :agent/budget {...}
    :agent/step-fn (fn [ctx] => [actions...])

  Returns {:agent/id ... :inbox ... :done ...}"
  [rt spec]
  (let [agent-id (or (:agent/id spec) (default-agent-id))
        parent   (:agent/parent spec)
        depth    (long (or (:agent/depth spec)
                           (if parent (inc (long (or (get-in ((:agent rt) parent) [:agent/depth]) 0))) 0)))
        agent    (merge {:agent/id agent-id
                         :agent/parent parent
                         :agent/depth depth
                         :agent/model (or (:agent/model spec) {:name "qwen3" :provider :ollama})
                         :agent/topology (or (:agent/topology spec)
                                             {:allow-peer? false
                                              :peer-via-parent? true
                                              :can-talk-to #{:parent :children}})
                         :agent/budget (merge {:max-steps 100
                                               :tick-ms 2500}
                                              (:agent/budget spec))}
                        spec)

        inbox (a/chan 256)
        stop-ch (a/chan)
        done-ch (a/promise-chan)]

    (register-agent! rt agent inbox done-ch stop-ch)

    ;; link child to parent registry
    (when parent
      (swap! (:agents rt) update-in [parent :children] (fnil conj #{}) agent-id))

    (agent-loop! rt agent inbox stop-ch done-ch)

    {:agent/id agent-id
     :inbox inbox
     :done done-ch
     :stop stop-ch}))

(defn stop!
  "Stop an agent. Optionally stop subtree."
  ([rt agent-id] (stop! rt agent-id {:subtree? false}))
  ([rt agent-id {:keys [subtree?] :or {subtree? false}}]
   (when subtree?
     (doseq [cid (get-in @(:agents rt) [agent-id :children])]
       (stop! rt cid {:subtree? true})))
   (when-let [stop-ch (get-in @(:agents rt) [agent-id :stop])]
     (a/close! stop-ch))
   true))
```

### What this runtime already supports

* spawn agents **hierarchically**
* each agent is a go-loop with **tick + inbox**
* `step-fn` returns actions → runtime interprets them
* locks + tools integrated via services
* status changes + messages logged to events

### What we deliberately left “simple” (for now)

* action batches run sequentially (easy to debug)
* no parallel “fan-out actions” yet (we’ll add later)
* no budget enforcement yet (we’ll add in the next pass)

---

# 4) Making a real “LLM step-fn” (planner/worker pattern)

Right now the runtime is neutral — it doesn’t care how `step-fn` decides actions.

Here’s the pattern that feels like an agent SDK:

## Parent planner agent step-fn

* receives a new `:goal`
* decomposes into subtasks
* spawns children
* sleeps until updates arrive

**Example sketch (not full):**

```clj
(ns my.steps
  (:require
    [promethean.agent.actions :as act]))

(defn planner-step [{:keys [rt agent inbox-msg state]}]
  (let [msg inbox-msg]
    (cond
      ;; user injects goal
      (= (:msg/kind msg) "goal")
      [(act/spawn-agent {:agent/id "frontend-worker"
                         :agent/model {:name "qwen3:32b"}
                         :agent/step-fn my.frontend/step})
       (act/spawn-agent {:agent/id "backend-worker"
                         :agent/model {:name "qwen3:32b"}
                         :agent/step-fn my.backend/step})
       (act/send-msg (:agent/parent agent) :state {:status :spawned-children})]

      ;; child status update
      (= (:msg/kind msg) "state")
      [(act/send-msg (:agent/parent agent) :state {:child (:msg/from msg)
                                                   :update (:msg/body msg)})]

      :else
      [])))
```

## Worker agent step-fn

* claims lock(s)
* calls tools
* reports progress
* releases locks

```clj
(defn worker-step [{:keys [rt agent inbox-msg state]}]
  (let [path "frontend/src/App.tsx"]
    [(act/acquire-lock path)
     (act/call-tool "fs/write" {:path path :content "..."})
     (act/release-lock path)
     (act/send-msg (:agent/parent agent) :state {:status :done :file path})
     (act/done :ok {:file path})]))
```

This is already enough for real work once you wire file tools.

---

# 5) Plan reconciliation skeleton (the “editable artifact” steering wheel)

The runtime wants a reconciler that watches plan changes and spawns/cancels agents.

We’ll keep it tiny and event-driven.

**`src/promethean/agent/plan.clj`**

```clj
(ns promethean.agent.plan
  "Plan loading + reconciliation skeleton."
  (:require
    [clojure.edn :as edn]
    [clojure.java.io :as io]))

(defn load-plan [path]
  (-> path slurp edn/read-string))

(defn plan->tasks [plan]
  (vec (:tasks plan)))

(defn diff-tasks
  "Return {:added [...] :removed [...] :changed [...]}"
  [old-plan new-plan]
  (let [o (into {} (map (juxt :id identity) (plan->tasks old-plan)))
        n (into {} (map (juxt :id identity) (plan->tasks new-plan)))
        o-ids (set (keys o))
        n-ids (set (keys n))
        added (mapv n (clojure.set/difference n-ids o-ids))
        removed (mapv o (clojure.set/difference o-ids n-ids))
        changed (->> (clojure.set/intersection o-ids n-ids)
                     (filter (fn [id] (not= (get o id) (get n id))))
                     (mapv n))]
    {:added added :removed removed :changed changed}))
```

Then the **planner agent** becomes the reconciler:

* when plan changes → spawn new workers
* when removed → stop workers
* when changed → restart / reassign

---

# 6) The missing “budget + escalation” rules (next)

You want increasing restriction by depth.

We implement that as a *policy function*:

```clj
(defn child-policy [{:keys [parent depth]}]
  (cond
    (= depth 0) {:model "qwen3:70b" :tools :all}
    (= depth 1) {:model "qwen3:32b" :tools :work}
    :else       {:model "qwen3:14b" :tools :tiny}))
```

Then `spawn!` can enforce:

* child model must be allowed
* toolset must be subset
* budget must shrink

That’s a small addition on top of current runtime.

---

# 7) What we can do next (the really powerful parts)

Now that we have: **runtime + bus + orch + locks**, the next upgrades are *pure leverage*.

## A) Parallel action batches

Allow an agent to return:

```clj
{:action :parallel :actions [...]}
```

So the runtime can do concurrent lock/tool calls safely.

## B) Resume-from-events + checkpoint

On startup:

* load checkpoint or replay JSONL
* rebuild which agents were running
* respawn the ones that were mid-task

## C) Conflict threads fully integrated

When lock acquire returns `{:ok false :conflict/id ...}`:

* runtime auto-opens a “conflict thread”
* notifies parent and owner
* routes to arbiter

## D) Container orchestration tools

Add tools like:

* `docker/run`
* `docker/compose-up`
* `docker/logs`
* `docker/exec`

Bench suite uses the same toolset production agents do.

---

# If I keep going: next thing I’d implement

**Budget enforcement + policy-based child spawning**, because that’s the “hierarchical restriction” concept turning into code.

Then we implement a canonical **LLM-driven step-fn** that:

* builds the prompt from ephemeral state
* calls LLM through `orch/llm!`
* parses tool calls
* returns actions

That will make the framework feel like a true Agent SDK while still being *async + observable + recoverable*.

If you want, I’ll write that LLM step-fn next (plus the “tool-calls become actions” bridge so your existing `def-tool` registry immediately works).
