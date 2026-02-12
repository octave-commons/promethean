Here’s a spec review pass, focused on **coherence**, **missing pieces vs the conversation**, and **the sharp edges that will bite you during implementation**.

---

# High-level: what you captured correctly ✅

## You built the right “4-layer stack”

You implicitly landed on a clean layering:

* **Core framework** (Ollama client, events, bus, locks, config) 
* **Tool system** (registry, validation, schema, execution engine) 
* **Agent framework** (supervisor tree, tiering, comms, state, tasks) 
* **Benchmark framework** (tool-calling, coding agent, interactive, reporting) 

That matches the core idea from the convo: **make the `ollama` module reusable for real agents AND benchmarks**, not a one-off harness.

## Tool-calling benchmark core is strong

You nailed the *important* parts:

* choice policies (`:first`, `:any`, `:best`, `:adaptive`) 
* decoy generation config and intent 
* metrics that let you build confusion matrices and scoring 

That’s exactly the “tool choice test is a really good one” direction.

## Event sourcing as the backbone ✅

Your JSONL append-only log is the right “never lose progress” primitive (and supports resumability + debugging) .

---

# What’s missing (relative to *our actual conversation*) ⚠️

## 1) The macro DSL isn’t specified yet (the “natural” feel)

You wanted:

* `def-tool` macro resembling OpenAI Agent SDK tool defs
* `def-agent` macro resembling OpenAI Agent SDK agent defs
* both usable in **benchmarks** and **real agents**
* and you want **clj-kondo support**

Right now, the specs describe protocols + data shapes, but there’s **no spec section** for the DSL itself (syntax, expansion contract, metadata rules, where it registers, how it compiles into schemas, etc.).
Tool definitions are described structurally , but not in the “macro-first authoring” way.

✅ Recommendation: add a **“DSL Authoring Layer”** spec file (or sections in tools/agents docs):

* `def-tool` -> expands to a tool map + registers it
* `def-agent` -> expands to agent config + registers it
* shared options: `:tags`, `:domain`, `:examples`, `:decoy-profile`, `:permission-scope`, `:arg-spec`

That’s the missing bridge between “spec says tools exist” and “writing tools feels like breathing”.

---

## 2) “tools.clj includes implementation functions” isn’t covered

You explicitly wanted a benchmark that loads a `tools.clj` containing:

* tool definitions
* tool schemas
* tool **implementations** (callable functions)

Your current tool spec talks about an execution engine and tool definitions, but doesn’t define the **tool pack** concept (a single file being both registry + runtime) or how it plugs into the benchmark runner. 

✅ Recommendation: define a “Tool Pack” contract:

* a namespace that **declares tools and provides impl fns**
* can be loaded in two modes:

  * production agent mode
  * benchmark mode (with decoys, sandbox rules, and strict validation)

---

## 3) Async-first agents: the concurrency model isn’t nailed down

You say async-first in the agent overview , and core says async by default , but the specs don’t commit to:

* core.async channels vs futures vs threadpools
* “parent sleeps and wakes periodically while children still running”
* “ephemeral parent-child context channel”
* “agent graph vs conversational graph rules” (only parent/child by default)

Those features are *the soul* of the hierarchical design, and they’re not yet formalized.

✅ Recommendation: add a short “Concurrency & Scheduling” section:

* agent execution units (go loops? dedicated threads? virtual threads?)
* supervisor wake policy
* message routing defaults
* backpressure rules

---

## 4) File-locking escalation thread exists as a concept, not as a protocol

You specify locks + TTL + conflict handling 
…but the convo had an extra step:

> when an agent hits a locked file, it can open a special conflict conversation thread

That’s not in the spec as an explicit workflow/state machine.

✅ Recommendation: extend LockService return values to include:

* conflict payload: `{owner-agent-id lock-age thread-id?}`
* a standard “conflict escalation event type”
* optional helper: `open-conflict-thread!`

---

# Internal consistency issues / sharp edges 🪓

## A) Minor syntax/paren mismatches in spec snippets

These will cause copy/paste pain later:

* **ToolValidator protocol snippet has parens wrong** 
  (It looks like `tool->ollama-schema` is outside the protocol form)

* Benchmarks “architecture components” map is malformed (braces) 

* Analysis framework map in benchmarks also malformed 

Not conceptually bad—just needs a cleanup pass so these docs can be *executed as examples*.

---

## B) The dependencies table is structurally incorrect

Your “Version Compatibility Matrix” row for Core has too many columns / checkmarks 
It’s small, but it’s the kind of thing that confuses readers immediately.

---

## C) Validation naming: “core.alpha” vs spec.alpha

The spec consistently uses **`clojure.spec.alpha`** , 
…but your convo said “core.alpha for validation”.

That’s probably you shorthand’ing the idea, but it’s worth deciding **now**:

* stick with `clojure.spec.alpha`
* or explicitly move to `malli`
* or use `spec` for authoring and `core.specs.alpha` for internal validation

Because toolcall evaluation *really* depends on stable coercion + clear error messages.

---

# Benchmark scope notes (good, but stage it)

## Tool-calling benchmark = Tier 1 must-have

This is already the cleanest part of the system. Keep it as the first fully-real suite. 

## Coding-agent benchmark needs a stronger “oracle”

Your benchmarks doc acknowledges the core issue:

> tests must be flexible enough when UI ids / shapes aren’t specified

That’s not yet solved in spec form, and it’s the hardest evaluation problem you described.

✅ I’d stage coding-agent benchmarks like this:

1. **hard-spec tasks** (compile/test must pass, exact endpoints)
2. **semi-spec tasks** (allow variants, but assert behavior)
3. **fuzzy UX tasks** (require structured oracle / DOM probing / screenshots / invariants)

Your current spec format works great for stage 1 , but stage 2–3 will need new evaluation primitives.

---

# The biggest missing file: “Reports + UI + resumability” 📊

You said:

* single `reports/` folder
* suite subfolders
* interactive HTTP server
* websocket agent chat
* stream progress to disk so crashes don’t lose work

The benchmark spec covers resumability at a requirements level  and core covers JSONL events , but there’s no explicit “Report Storage Contract”:

✅ Recommendation: one short storage spec section:

* every run has `run-id/`
* append-only `events.jsonl`
* periodic `snapshots/agent-{id}.edn`
* derived `summary.json`
* derived `tables.csv`
* UI reads *only* from these files (no hidden state)

That makes the whole suite crash-proof.

---

# clj-kondo macro understanding (needs its own spec chunk)

Right now: **nothing about clj-kondo hooks exists** in the specs.

Since you *explicitly* want it, you should spec:

* `.clj-kondo/config.edn` entries
* hook namespace + how it rewrites macro forms for analysis
* “what symbols the macro introduces” (registry vars, defs, metadata)

This belongs in the DSL section alongside `def-tool` / `def-agent`.

---

# Suggested spec edits (minimal but high impact)

## Add these sections

1. **DSL Authoring Layer**

   * `def-tool`
   * `def-agent`
   * “tool pack” (`tools.clj`) load contract
2. **Concurrency & Scheduling**

   * supervisor wake policy
   * async execution primitive choice
   * message routing defaults
3. **Reports & Storage Contract**

   * canonical directory layout
   * crash recovery workflow
4. **clj-kondo Support**

   * macro hooks and config patterns

## Patch existing small inconsistencies

* fix malformed maps/parens in benchmarks and core snippets   
* fix dependency matrix row shape 

---

# Bottom line

These specs are **already a real foundation**: the layering is correct, tool-calling benchmark is well-framed, and event sourcing is the right backbone.  

What’s missing is basically **the ergonomics + “living system” behavior**:

* the macro DSL
* async scheduling details
* file-lock conflict threads
* report storage contract
* clj-kondo macro awareness

If you want, next step I can write the missing **DSL spec** in the same style as these docs (including the exact macro surface area + kondo hook contract), and it’ll snap into tools/agents/benchmarks cleanly.
