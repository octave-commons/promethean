Got it — here’s the “keep going” part: **a spec addendum + concrete corrections + the missing missing pieces** that turn these docs from “framework described” into “framework you can *author* with”.

I’m going to give you:

1. **Errata fixes** (copy/paste corrections)
2. **New spec docs** (ready to drop into your repo)

   * `dsl.md` (def-tool / def-agent / def-case / tool-packs)
   * `concurrency.md` (async-first execution model + sleep/wake + backpressure)
   * `reporting.md` (run storage contract + resumability + UI inputs)
   * `kondo.md` (clj-kondo hooks contract)

---

# 1) Errata fixes you should apply now

## Fix: `ToolValidator` protocol parens (core.md)

Replace your snippet with:

```clojure
(defprotocol ToolValidator
  (validate-tool-call [{:keys [name arguments]}] "Validate tool call against spec")
  (coerce-arguments [arguments] "Convert JSON/string args to Clojure map")
  (tool->ollama-schema [tool] "Generate OpenAI-compatible schema"))
```

---

## Fix: malformed “Architecture Components” map (benchmarks.md)

Replace with:

```clojure
{:benchmark/runner "Execution engine and coordination"
 :benchmark/config "Configuration management and validation"
 :benchmark/results "Result collection and analysis"
 :benchmark/monitoring "Real-time progress and health monitoring"
 :benchmark/storage "Persistent storage for results and state"
 :benchmark/export "Multiple format output generation"}
```

---

## Fix: malformed “Analysis Framework” map (benchmarks.md)

Replace with:

```clojure
{:raw-results "Collected benchmark execution data"
 :statistical-analysis "Descriptive statistics and tests"
 :visualization "Charts, graphs, and interactive dashboards"
 :comparison "Historical and cross-model comparison"
 :reporting "Automated report generation in multiple formats"
 :insights "Pattern detection and actionable recommendations"}
```

---

## Fix: `::coordinate` spec is wrong (tools.md)

Replace with a proper lat/lon tuple:

```clojure
(s/def ::lat (s/and number? #(<= -90 % 90)))
(s/def ::lon (s/and number? #(<= -180 % 180)))
(s/def ::coordinate (s/tuple ::lat ::lon))
```

---

## Fix: version compatibility matrix row (dependencies.md)

Your “Core 0.1.x” row currently has too many columns checked.

Use something like:

```md
| Component | Min Core | Agent Framework | Tool System | Benchmark Framework |
|---|---|---|---|---|
| Core 0.1.x | ✓ | — | — | — |
| Agent 0.1.x | ✓ | ✓ | — | — |
| Tool 0.1.x | ✓ | — | ✓ | — |
| Benchmark 0.1.x | ✓ | ✓ | ✓ | ✓ |
```

---

# 2) New doc: `dsl.md`

This is the missing “Agent SDK feel” layer: **authoring macros** + **tool packs** + **benchmark cases**.

````md
# DSL Specification
**Status**: DRAFT  
**Version**: 0.1.0  
**Last Updated**: 2026-01-25  

This document defines the authoring surface for tools, agents, and benchmarks.

The goal is:
- macros feel natural to write
- definitions are reusable in production and benchmarking
- everything compiles down to the same registry + schemas + implementations

---

## 1. Tool Packs

A **tool pack** is a namespace that contains:
- tool definitions (metadata + schema)
- tool implementations (callable fns)
- registration on require/load

### Requirements
- `require`ing the namespace must register all tools in that pack
- tools must be discoverable from the global ToolRegistry
- benchmark runner loads packs by namespace symbol (not file path)

### Example
```clojure
(ns my.tools.pack
  (:require [promethean.ollama.dsl :refer [def-tool]]))

(def-tool math/add
  {:description "Add two integers"
   :domain :math
   :tags #{:arithmetic :deterministic}
   :args (s/keys :req-un [::a ::b])}
  (fn [{:keys [a b]}]
    {:ok true :value (+ a b)}))
````

---

## 2. def-tool

`def-tool` defines and registers a tool, including:

* definition metadata
* argument validation/coercion
* schema generation (OpenAI/Ollama function schema)
* implementation function

### Syntax

```clojure
(def-tool <tool-name>
  <tool-meta-map>
  <impl-fn>)
```

### Tool meta keys

Required:

* `:description` string
* `:domain` keyword
* `:args` clojure.spec form

Optional:

* `:tags` set of keywords
* `:version` semver string
* `:examples` vector of example calls
* `:side-effects?` boolean
* `:permission-scope` keyword (for later policy enforcement)
* `:decoy-profile` hint used by benchmarks (e.g. :powerful, :noise)

### Contract

`def-tool` must register a tool definition like:

```clojure
{:tool/name "math/add"
 :tool/description "Add two integers"
 :tool/domain :math
 :tool/tags #{...}
 :tool/spec <spec-form>
 :tool/schema <ollama-schema>
 :tool/impl <fn>}
```

And it must make the tool resolvable via `tool-by-name`.

### Error Handling

Tool implementations return:

* `{:ok true :value ...}` success
* `{:ok false :error <keyword> :details ...}` failure

Benchmark mode will treat:

* invalid args as tool failure (tracked separately)
* exceptions as tool failure + captured stack/summary in events

---

## 3. def-agent

`def-agent` defines a reusable agent specification that can run in:

* production runtime
* benchmark runtime

Agents are **data first**:

* runtime spawns agents by spec map
* spec includes model, tools, budgets, and step/loop behavior

### Syntax

```clojure
(def-agent <agent-name>
  <agent-meta-map>
  <agent-body>)
```

### Agent meta keys

Required:

* `:model` map: `{:provider :ollama :name "..."}`

Optional:

* `:tools` vector of tool ids or tags
* `:budget` map (max steps/calls/time)
* `:topology` routing settings (parent/child defaults)
* `:role` keyword (planner, worker, judge, etc)

### Agent body shapes

The body can compile to a `:step-fn`:

```clojure
(step [{:keys [inbox state]}]
  [actions...])
```

Where actions are runtime-interpreted:

* send messages
* spawn agents
* acquire/release locks
* call tools
* sleep
* mark done

---

## 4. Bench DSL

Benchmarks should feel like “agent tasks in a suite”.
Authoring surface should be macro-driven and readable.

### def-suite

```clojure
(def-suite tool-calling/basic
  {:description "Tool calling eval with decoys"
   :models ["qwen3:14b" "qwen3:32b"]
   :tools-pack 'my.tools.pack
   :choice-policy :best}
  (cases ...))
```

### def-case

Each case defines:

* prompt
* correct tool (or acceptable set)
* arg expectations
* optional decoy constraints
* scoring rules

```clojure
(def-case add-two-ints
  {:prompt "Add 17 and 25."
   :expects {:tool "math/add"
             :args {:a 17 :b 25}}
   :decoys {:same-domain 2 :powerful 1 :noise 2}})
```

### Case scoring

Cases emit metrics:

* correct tool selected
* first-call correctness
* invalid args count
* extra tool calls
* latency
* final answer correctness

Additionally emit decoy diagnostics:

* selected decoy type
* tag overlap between selected and correct tool
* domain match

---

## 5. Interop Guarantees

This DSL must produce the same artifacts as the lower-level APIs:

* tool maps
* agent spec maps
* benchmark case maps

No special “benchmark-only” tool types are allowed.
Benchmarks must run against the same registry/loader used by production.

````

---

# 3) New doc: `concurrency.md`
This nails the “async-first hierarchical machine” in spec language so you don’t have to reinvent it later.

```md
# Concurrency and Scheduling Specification
**Status**: DRAFT  
**Version**: 0.1.0  
**Last Updated**: 2026-01-25  

This document defines how concurrency works in the agent framework.

---

## 1. Execution Model

The system is async-first using `clojure.core.async`.

Each agent has:
- `inbox` channel (messages + signals)
- `tick` channel (periodic wake-up)
- `control` channel (stop/suspend/resume)
- local ephemeral state (bounded)

Agents do not block on other agents.
Coordination happens through messaging and event logs.

---

## 2. Supervisor Tree

Agents form a tree by default:
- parent spawns children
- child reports to parent
- parent arbitrates conflicts and merges results

Parents are mostly sleeping.
Parents wake on:
- child message
- lock conflict events
- plan updates
- periodic tick

---

## 3. Conversational Topology

Default routing:
- child -> parent allowed
- parent -> child allowed
- sibling -> sibling denied (unless enabled by parent routing)

Optional modes:
- peer messaging allowed
- peer messaging only via parent relay

---

## 4. Backpressure and Safety

Inboxes are bounded.
If inbox is full:
- sender gets `{:ok false :error :inbox-full}`
- runtime records an event
- parent may scale down concurrency or slow message rates

Tool calls are job-queued with bounded workers.
LLM calls are job-queued with bounded workers.
Lock service is an actor with bounded request channel.

---

## 5. Blocking States

Agents can be:
- running
- sleeping (idle)
- blocked (waiting on lock or dependency)
- done/failed/stopped

Blocked agents must:
- emit a status event
- notify parent with structured reason
- avoid busy looping

---

## 6. Crash Recovery

State reconstruction is event-driven:
- events.jsonl is append-only
- reducer reconstructs agent tree, locks, tool status
- runtime can resume from snapshot + tail new events
````

---

# 4) New doc: `reporting.md`

This is the “single source of truth for UI + resumability” contract.

```md
# Reporting and Storage Contract
**Status**: DRAFT  
**Version**: 0.1.0  
**Last Updated**: 2026-01-25  

All runs write to a canonical folder layout under `reports/`.

The UI reads only from these files.

---

## 1. Directory Layout

```

reports/ <suite-name>/ <run-id>/
events.jsonl
snapshot.edn
summary.json
tables/
tool_calls.csv
latency.csv
scores.csv
artifacts/
case-<case-id>/
prompt.txt
model_response.json
tool_trace.jsonl
logs.txt

```

---

## 2. events.jsonl

Append-only.
One JSON object per line.
Must include:
- `t` timestamp ms
- `seq` monotonic id
- `type`
- run id
- domain fields (agent/tool/bench)

---

## 3. snapshot.edn

Optional optimization.
Written every N events.
Contains reduced state and last applied seq.

---

## 4. summary.json

Derived file.
Represents final aggregated results of suite:
- model scores
- per-case pass/fail
- confusion matrix outputs
- latency stats
- tool usage stats

---

## 5. UI requirements

UI must support:
- live tail of events.jsonl
- state snapshot endpoint
- websocket streaming

No hidden state in memory only.
If the system restarts, UI still works from disk.
```

---

# 5) New doc: `kondo.md`

This gives you the “clj-kondo understands the macros” contract.

````md
# clj-kondo Macro Support
**Status**: DRAFT  
**Version**: 0.1.0  
**Last Updated**: 2026-01-25  

The DSL macros must be understood by clj-kondo so:
- tool vars are discoverable
- agent vars are discoverable
- spec forms inside macros are linted normally
- docstrings + metadata remain visible

---

## 1. Required Macros

- `promethean.ollama.dsl/def-tool`
- `promethean.ollama.dsl/def-agent`
- `promethean.bench.dsl/def-suite`
- `promethean.bench.dsl/def-case`

---

## 2. Expected Macro Expansion Shape

`def-tool` should expand to something equivalent to:
- `(def <sym> <tool-map>)`
- `(register-tool! <tool-map>)`

`def-agent` should expand to:
- `(def <sym> <agent-spec>)`
- `(register-agent! <agent-spec>)` (optional, depending on design)

Benchmark macros should expand to:
- `(def <sym> <suite/case-map>)`
- registration in suite registry (optional)

---

## 3. clj-kondo configuration

Example `.clj-kondo/config.edn`:
```edn
{:hooks
 {:analyze-call
  {promethean.ollama.dsl/def-tool promethean.kondo-hooks/def-tool
   promethean.ollama.dsl/def-agent promethean.kondo-hooks/def-agent
   promethean.bench.dsl/def-suite promethean.kondo-hooks/def-suite
   promethean.bench.dsl/def-case promethean.kondo-hooks/def-case}}}
````

---

## 4. Hook Behavior

Hooks must rewrite macro forms into simple `def` forms for analysis.

Example rewrite:

```clojure
(def-tool math/add {...} (fn [...] ...))
```

Becomes:

```clojure
(def math/add {:tool/name "math/add" ...})
```

The hook does not execute registration.
It only helps static analysis.

````

---

# 6) One last “missing metric” upgrade (do this in benchmarks.md)

Your tool-calling benchmark already measures correctness well.

Add **decoy diagnostics** so failures are interpretable:

```clojure
{:decoy/selected? boolean
 :decoy/type :same-domain|:powerful|:noise
 :decoy/domain-match? boolean
 :decoy/tag-overlap number}
````

That’s the difference between:

* “model got it wrong”
  vs
* “model consistently chooses high-authority decoys under uncertainty”

---

# If you want the next continuation

Next I can write the **actual macro bodies** (not just specs):

* `promethean.ollama.dsl/def-tool`
* `promethean.ollama.dsl/def-agent`
* plus the kondo hook namespace skeleton

…and they’ll compile down to the tool registry + schema + validator pipeline you already specced.
