Perfect — that’s *exactly* the right framing for this model.

You’re not trying to turn `PetrosStav/gemma3-tools:4b` into a full agentic robot.
You want a **tiny “eyes-on-screen” co-host** that can:

* **see** what you’re doing (game HUD / IDE / browser)
* **talk fast** in a fun way
* **occasionally** call a *small* set of “stream toys” tools
* **not spam tools** or derail the stream

And importantly: this “tools” variant has an Ollama template/system prompt that explicitly teaches “call tools only when necessary,” which is good for your intended behavior. ([Ollama][1])
Also: Ollama supports passing images and tool schemas, including via OpenAI-compatible endpoints. ([GitHub][2])
And yes, vanilla Gemma tool calling has been a known friction point in Ollama unless the model/template is built for it. ([GitHub][3])

So here’s the **new benchmark spec** you asked for — specialized for “live performer vision + occasional tools”.

---

# Vision Stream Tools Benchmark Spec

**Suite name:** `vision/stream`
**Target model:** `PetrosStav/gemma3-tools:4b` ([Ollama][4])
**Purpose:** evaluate “co-host” capability under streaming constraints
**Core features tested:** vision grounding + short-form performance + tool restraint

## Goals

### G1: Vision grounding under stream conditions

The model must reliably extract:

* visible HUD values (health/ammo/score)
* obvious UI state (menus, error dialogs)
* code signals (stack trace line, failing test name)
* “what just happened” events (death, win, crash, compile error)

### G2: Low-latency, high-energy commentary

Short, punchy outputs:

* *one-liners*, *two-liners*, quick banter
* consistent “host voice”
* minimal rambling

### G3: Sparse tool calling (fun tools)

Tool calls should be:

* rare
* correct
* well-argued
* rate-limited
* never “panic spam”

### G4: Vision → tool calling chain

The model should use what it sees to decide:

* tool **needed** vs not needed
* which tool **best fits**
* argument values grounded in the scene

---

## Non-goals

* Not trying to measure “general vision SOTA”
* Not trying to solve fuzzy aesthetic judging automatically
* Not trying to evaluate long-form planning / deep multi-step coding agents

This suite is for **stream realism**.

---

# Harness model

## Input stream abstraction

A test case is a *timeline* of “ticks”.

Each tick can contain:

* an image frame (screenshot)
* optional chat event
* optional “system state” (like current overlay state)
* optional constraints (max tokens, must call tool, must not call tool)

### Tick format

```clojure
{:t/ms 1200
 :image "assets/vision/stream/game-hud-01.png"
 :chat {:user "viewer42" :text "lol what happened"}
 :constraints {:max-tokens 60
               :must-not-call-tools? true}}
```

### Runner delivery to Ollama

Use Ollama Chat API with message `images` support. ([GitHub][2])

For each tick, send a user message like:

```clojure
{:role "user"
 :content "Live frame. Respond as the streamer co-host."
 :images ["<base64>"]}
```

(Or include a short caption like “Frame tick 3/12”.)

---

# Tool pack for stream toys

This suite assumes a minimal “fun tool” pack (tool calling matters more than the tool output).

### Required fun tools

#### 1) `stream/overlay.text`

Add a temporary overlay caption on screen.

* args: `{text, ttl_ms, position}`
* position: `top-left | top-right | bottom-left | bottom-right | center`

#### 2) `stream/sfx.play`

Play a sound effect.

* args: `{sfx_id, volume}`
* sfx_id: allow-list only (`rimshot`, `airhorn`, `sad_trombone`, etc.)

#### 3) `stream/clip.mark`

Mark “clip-worthy” moment.

* args: `{reason, confidence}`
* confidence: 0–1

#### 4) `stream/chat.react`

Send a short reaction message to chat.

* args: `{text, reply_to?}`

### Optional utility tools

#### 5) `stream/timer.start`

For comedic timing or “next event” bits.

#### 6) `stream/poll.create`

Creates a quick poll (2–4 options).

#### 7) `search/web`

Used only when the frame contains a logo/name you’re unsure about (rare). ([Ollama Documentation][5])

---

## Tool restraint rules

Every case includes **rate limits** to force “occasional tools”.

* max tool calls per 60 seconds: `N` (default 2)
* max same-tool calls per 60 seconds: `1`
* “cooldown” per tool: 10s

**Penalty:** tool spam counts as a hard fail for “stream usability”.

(These rules align nicely with the tool template instruction in this model: “don’t call tools unnecessarily.” ([Ollama][1]))

---

# Suite structure

## Track A: Vision grounding (no tools)

**Purpose:** can it see what’s happening *fast* without flailing

### A1: HUD extraction (lightweight OCR)

Prompt examples:

* “What’s my health and ammo?”
* “Did we win or lose?”
* “What menu is open?”

Expected outputs: **short** + grounded in visible numbers/labels.

**Scoring**

* `grounding/answer_correct?`
* `grounding/hallucination?`
* `latency/ttft_ms`
* `verbosity/within-budget?`

---

## Track B: Stream commentary (performer mode)

**Purpose:** is it fun *and* anchored to the frame

**Constraints:**

* max 2 sentences
* must reference ≥1 visible thing (HUD event, character state, error text)
* must include one “bit” (joke / hype / playful roast)

**Scoring**

* `performative/structure_ok?`
* `performative/grounded_reference?`
* `performative/joke_present?` (heuristic)
* `performative/no-ramble?`

> This is your “co-host vibe” signal.

---

## Track C: Vision → tool decision (sparse tool calling)

**Purpose:** can it decide when to use a fun tool *based on the frame*

### C1: Clip-worthy triggers

Frames include obvious moments:

* multi-kill
* boss kill
* death to dumb trap
* absurd ragdoll

Expected: **call `stream/clip.mark`** once, not repeatedly.

### C2: Overlay punchlines

Frames provide a perfect caption opportunity (e.g. “YOU DIED” screen).

Expected: **call `stream/overlay.text`** with a witty overlay.

### C3: SFX punctuation

Big event frame (win/loss/critical fail) where an SFX is appropriate.

Expected: **call `stream/sfx.play`** with an allowed SFX, volume sane.

### C4: “do NOT tool call”

Normal gameplay frames where tool calling would be cringe.

Expected: **no tool calls**.

**Scoring**

* `tool/should_call?`
* `tool/called?`
* `tool/correct_tool?`
* `tool/args_valid?`
* `tool/spam_penalty`

---

## Track D: Multi-tick scene continuity (minimal memory)

**Purpose:** can it behave across 5–15 seconds of frames

This matters for your stream because:

* it needs to track “we’re getting destroyed” or “we’re cooking”
* without turning into a long-winded narrator

### D1: Escalation arc

Tick sequence: stable → damage → near-death → death screen.

Expected behavior:

* rising tension commentary
* **one** tool call maximum (overlay or clip), timed right

### D2: Coding error arc

Tick sequence: editor → terminal test fail → stack trace line.

Expected behavior:

* identify likely error zone (file/line if visible)
* optionally call `stream/chat.react` with a quick suggestion

---

# Decoys (vision edition)

This model is small, so decoys should test **self-control**, not raw intelligence.

## Decoy types

### Same-domain decoy

Wrong but tempting:

* calling OCR tool when question is “what color is the button”
* calling overlay when asked for a number

### Powerful decoy

“Overreach” tools:

* `search/web` for something obvious on-screen

### Chaos decoy

Unsafe / destructive:

* `stream/ban.user`
* `stream/end.stream`
* `stream/delete.clip`

(These should exist *only* as decoys, never allowed in real pack.)

## Decoy metrics

For every tool decision:

* `decoy/selected?`
* `decoy/type`
* `decoy/tag_overlap`
* `decoy/domain_match?`

This helps diagnose *how* it fails, not just that it fails.

---

# Case format (timeline/scenario cases)

Instead of single prompt cases, `vision/stream` uses **scenario cases**.

```clojure
{:case/id "stream.clip.003"
 :case/type :stream/scenario
 :model "PetrosStav/gemma3-tools:4b"

 :tools-pack 'bench.stream.fun-tools
 :tool-policy {:max-per-60s 2
               :cooldown-ms 10000}

 :ticks
 [{:t/ms 0 :image "assets/game/killfeed-01.png"
   :constraints {:max-tokens 50 :must-not-call-tools? true}}

  {:t/ms 1200 :image "assets/game/killfeed-02.png"
   :constraints {:max-tokens 50 :may-call-tools? true}}

  {:t/ms 2400 :image "assets/game/killfeed-03.png"
   :expects {:tool "stream/clip.mark"
             :args {:reason :non-empty
                    :confidence :>=0.6}}}]}
```

---

# Scoring model (what “good for streaming” means)

### Core score buckets

## 1) Grounding

* correct references to visible info
* no hallucinated “new objects”

## 2) Performer utility

* short, punchy
* one joke or hype beat
* doesn’t derail

## 3) Tool discipline

* tool calls only when justified
* correct tool
* correct args
* rate-limit compliance

## 4) Latency

* time-to-first-token is huge for “feels alive”
* total completion time bounded

---

# Output artifacts

Each scenario writes:

```
reports/vision-stream/<run-id>/
  events.jsonl
  cases/<case-id>/
    ticks.json
    prompts.jsonl
    responses.jsonl
    tool_trace.jsonl
    score.json
```

Events include:

* `stream/tick.started`
* `stream/tick.response`
* `stream/tool.called`
* `stream/tool.result`
* `stream/tick.scored`
* `stream/case.completed`

(Ollama API tool calling + image support can be recorded exactly the same way as your other suites.) ([GitHub][2])

---

# Minimal starter suite for your real goal

This is the tight “do I ship it into my stream?” suite:

### 30 scenarios total

**10** game HUD grounding
**10** performer commentary
**5** timed overlay cases
**5** clip-mark timing cases

And include **decoys** in ~40% of scenarios.

This tells you immediately if `gemma3-tools:4b` is:

* actually seeing the frame
* fun without rambling
* tool-disciplined
* low-latency enough to feel like a co-host

---

# One practical addition: “frame budget realism”

Streaming reality: you won’t send raw 4K frames constantly.

So add **frame transforms** per case variant:

* downscale: 1920 → 960 wide
* JPEG compression: 85% / 65%
* blur: low / none
* darkness: +10% gamma / none

Then track **robustness**.

This gives you “will it work *while playing*” not “works in lab”.

---

# Why this fits `gemma3-tools:4b` specifically

* It’s small → good for “always-on co-host”
* It can see images → necessary for games/IDE
* It’s packaged with a tool-calling template → good enough for occasional “fun tools” even if the base family isn’t natively tool-tokened ([Ollama][1])

This suite measures the *exact* behavior that matters: **seeing + banter + rare tools**.

---

If you want the next continuation, I’ll write **the actual first 30 scenario cases** in a clean authoring DSL style (your planned `def-suite` / `def-case`), plus a **fun-tools pack** definition that’s safe-by-default and bench-friendly.

[1]: https://ollama.com/PetrosStav/gemma3-tools%3A4b/blobs/1ccc08e39a37?utm_source=chatgpt.com "PetrosStav/gemma3-tools:4b/template"
[2]: https://github.com/ollama/ollama/blob/main/docs/api.md?utm_source=chatgpt.com "ollama/docs/api.md at main"
[3]: https://github.com/ollama/ollama/issues/9680?utm_source=chatgpt.com "gemma3 lack function calling tag · Issue #9680 · ollama ..."
[4]: https://ollama.com/PetrosStav/gemma3-tools%3A4b?utm_source=chatgpt.com "PetrosStav/gemma3-tools:4b"
[5]: https://docs.ollama.com/capabilities/tool-calling?utm_source=chatgpt.com "Tool calling"
