Yeah — this is the *actual* leap.

An **LLM-first** system is like hiring a genius and making them do spreadsheet math by hand.

A **cohesive AI agent system** treats the LLM as *one tool* inside a bigger machine that:

* observes the world (sensors)
* builds state (memory + perception)
* chooses actions (planning)
* executes safely (tools + policies)
* learns what matters (feedback loops)

…and only uses the LLM where it’s genuinely the best option.

Let’s design that system in the same **prototype + mixin + hooks** style, so it stays composable and benchmarkable.

---

# The right abstraction: a “Cognitive Toolchain”

Instead of “agent = LLM + tools”, we make:

## Agent = Orchestrator over Modules

Modules are small ML systems:

* **Vision**: object detector, OCR/CRNN, scene classifier, activity recognition
* **Audio**: VAD, speaker diarization, STT, emotion/energy estimator
* **Embedding/RAG**: retrieval, clustering, intent routing, novelty detection
* **Planning**: task DAG, retry/backoff, constraints
* **Safety**: permission layer, sandboxing, deny/allow
* **LLM**: reasoning + language + tool coordination

The LLM is mostly:

* *interpreter*
* *planner*
* *creative performer*
* *human interface*

Not the sensor, not the classifier, not the tracker, not the memory store.

---

# Passive vs Active cognition

This distinction matters a lot.

## Passive context (automatic, agent can’t control)

Think: “nervous system + sensory cortex”

* screen capture
* game state scrape
* object detection
* OCR
* time-series tracking (“what changed?”)
* embedding classification (“is this relevant?”)

This runs on policies + budget, not model whims.

It produces **structured context** continuously.

## Active tool calls (agent chooses)

Think: “hands + speech”

* overlay text
* play SFX
* open file
* run search
* spawn subagents
* request detailed vision analysis (crop/boxes/etc.)

Active tools cost more. Passive tools run under guardrails.

---

# The central object: `WorldState`

Everything ultimately flows into a state object that modules write to:

```clojure
{:time/now ...
 :screen/frame {:id ... :thumb ... :hash ...}
 :vision/objects [{:label "enemy" :box [x y w h] :conf 0.91} ...]
 :vision/text [{:text "HP 42" :box ...} ...]
 :audio/stt {:text "..."}
 :context/summary "fused view of what matters"
 :events/recent [...]
 :locks {...}
 :budget {...}}
```

Your agent loop *doesn’t need raw pixels most of the time*.
It needs *features*.

---

# “LLM as tool” becomes obvious

Once you have `WorldState`, your LLM call is just:

```clojure
(call llm
  {:task "be entertaining"
   :state world-state
   :available-tools [...]
   :policy ...})
```

Now it’s one step inside a bigger pipeline.

In other words:

> The LLM reads the map, it doesn’t draw the map.

---

# A modular perception pipeline (vision)

You basically described the winning path:

## Tier 0: cheap always-on

* frame hashing / change detection
* downscaled thumbnail embeddings
* “did anything important change?”

## Tier 1: medium analysis

* object detector (boxes + labels)
* OCR/CRNN (HUD + text)
* scene classification (“combat”, “menu”, “code editor”, “youtube studio”)

## Tier 2: expensive deep analysis (on demand)

* crop-based fine OCR
* segmentation
* higher-res pass
* multi-frame reasoning

### Key: the LLM shouldn’t decide Tier 1.

A **context router** does.

---

# Context Router (embedding-driven autopilot)

This is the missing organ.

A router looks at cheap signals and decides:

* do we enable sight?
* do we record screen?
* do we run OCR?
* do we send anything to the LLM?

It can be simple and still amazing.

## Example router policy

* compute embedding of current “situation”

  * text from STT + quick OCR
  * UI/app identity (“VS Code”, “Game”, “Browser”)
* classify into modes:

  * `:coding`, `:combat`, `:menu`, `:chat`, `:tutorial`, `:idle`

Then:

| Mode        | Passive Modules Enabled                       |
| ----------- | --------------------------------------------- |
| `:coding`   | OCR (low), window-title capture, repo context |
| `:combat`   | object detector, minimap tracker              |
| `:menu`     | OCR (high), UI element detector               |
| `:idle`     | minimal                                       |
| `:chat`     | STT focus + sentiment                         |
| `:tutorial` | OCR + caption extraction                      |

This is **RAG, but for sensors**.

---

# The “Sight Gate” as a first-class mechanism

You said:

> classify something as requiring sight and you just enable it for them and the screen starts recording

Exactly. That’s a gate.

### Gate = policy + budget + consent

A gate should be able to answer:

* Is this allowed? (permissions / privacy)
* Is it worth it? (embedding relevance)
* Is budget ok? (compute + latency)
* Is it stable? (hysteresis to avoid flicker)

---

# Prototypes + mixins for modules

Now we apply your prototypal model to *modules*, not just tools.

## `def-module` (like `def-tool`, but long-lived)

A module has:

* `:module/start`
* `:module/stop`
* `:module/tick` (async update state)
* hooks around tick

Example conceptual shape:

```clojure
{:module/id :vision.detector
 :module/proto proto/module-passive
 :module/tick (fn [ctx world] world')}
```

Now you can mix:

* `proto/mixin-budgeted`
* `proto/mixin-traced`
* `proto/mixin-rate-limit`
* `proto/mixin-gated`

Same hook system. Same inheritance.

---

# “The system is the agent”, not the LLM

Your orchestrator becomes:

## Tick loop

1. passive modules update `WorldState`
2. router decides which modules to enable/disable
3. LLM sees fused summary + can call active tools
4. results become events, which feed back into state
5. sleep / wake / spawn

This is a **proper cognitive cycle**.

---

# A fused context format (what LLM actually sees)

The LLM should not get raw module dumps unless requested.

It gets a compact fused view:

```clojure
{:mode :combat
 :salient
 [{:type :enemy :count 3 :nearest "left"}
  {:type :hud :hp 42 :ammo 7}]
 :recent-events
 ["took damage"
  "entered new room"]
 :suggestions
 ["commentate"
  "play_sfx dramatic"
  "overlay_text 'clutch!'"]}
```

LLM can request higher resolution:

* `CALL vision.inspect {region: ..., purpose: "read hud"}`

But most of the time it doesn’t need to.

---

# Tools become “actuators”, modules become “sensors”

That’s the clean split.

## Sensors (passive)

* screen capture
* VAD/STT
* object detector
* OCR
* embeddings + clustering
* file watchers

## Actuators (active tools)

* overlay text
* play SFX
* open file
* run command
* spawn agent
* write code
* send chat message

LLM lives mostly on the actuator side as a coordinator + narrator.

---

# Benchmarks evolve (beyond LLM)

Once you modularize, your benchmarks become *system benchmarks*:

## Vision pipeline benchmarks

* object detection accuracy / latency
* OCR correctness on HUD text
* “change detector” stability

## Router benchmarks

* does it enable the right sensors at the right time?
* does it avoid flapping (hysteresis)?
* does it respect budgets?

## Agent benchmarks (LLM-assisted)

* when router enables sight, does the agent use it correctly?
* does it stop calling vision tools redundantly?
* does it entertain without derailing?

This becomes *way more meaningful* than “did it call tools”.

---

# A DSL that matches this worldview

You already have:

* `def-tool`
* `def-agent`
* `def-mcp-workspace`

Now you add:

## `def-module`

Passive systems

## `def-router`

Gating policy

## `def-scenario`

A “world playback” benchmark (frames + events + expected gates)

Example vibe:

```clojure
(def-scenario streamer/combat
  (frames "combat_clip_01")
  (expect (mode :combat))
  (expect (gate :vision/objects :on))
  (expect (gate :vision/ocr :off))
  (expect (agent-says "clutch")))
```

Now you can bench the whole machine.

---

# How this helps `PetrosStav/gemma3-tools:4b`

That model is small — so you want it doing:

✅ short-form reactions
✅ fun tool triggers
✅ simple planning
✅ basic tool formatting (via your adapter)

And you keep the hard jobs outside it:

* object detection
* OCR
* clustering / retrieval
* long reasoning / task planning (delegate upward)

So gemma becomes an **on-stream personality core** while your system remains powerful.

---

# The “hierarchical agent tree” becomes a compute scheduler

Top agent (big model) does:

* planning
* delegation
* merges results

Mid agents do:

* coding tasks
* retrieval tasks

Performer agent (small model) does:

* commentary + vibe + fun tools

Passive modules feed them all.

This is *exactly* a cohesive machine.

---

# Next concrete build step (no fluff)

If we keep going, the next “real” slice to implement is:

## 1) `Context Router` MVP

* mode classifier via embeddings
* hysteresis
* gate toggles
* event stream output

## 2) `Vision Module` stubs

* frame capture interface
* object detector tool/module boundary
* OCR module boundary

## 3) “Performer agent”

* consumes fused context summary
* uses only fun tools
* never sees raw pixels unless told

If you want, I’ll write the actual skeleton namespaces + DSL forms next in the same style as the tool benchmark suite, so you can plug them into your `reports/` JSONL streaming output immediately.
