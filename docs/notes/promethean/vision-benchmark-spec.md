Below is a **new benchmark spec** for **vision + image-generation (via tool-calling)**, designed to plug into the exact framework we’ve been building (suites → cases → JSONL events → UI report), and aimed directly at benching:

* `PetrosStav/gemma3-tools:4b` (small, **vision + tool calling**) ([Ollama][1])
* performative “streaming / entertainment / YouTube” workflows (fast, punchy, visually aware, tool-using)

This spec assumes Ollama multimodal input is supplied via the `images` array in chat messages (base64 via REST; filepaths via SDKs). ([GitHub][2])

---

# Vision + Image Generation Benchmark Suite Specification

**Status:** DRAFT
**Version:** 0.1.0
**Last Updated:** 2026-01-25

## Why this suite exists

We want to measure how well a *small* multimodal model can:

1. **Understand images** (captioning, VQA, OCR-ish tasks, UI understanding)
2. **Use tools correctly** *because of what it saw* (vision-grounded tool choice)
3. **Act performatively** (streaming commentary, comedic bits, “host energy”, thumbnail copy)
4. **Drive image generation** by calling an image-gen tool (prompt + parameters + constraints), even if the model itself can’t render images

`PetrosStav/gemma3-tools:4b` is a good target because it’s a Gemma 3 4B variant packaged for Ollama with tool-calling templates and vision support. ([Ollama][1])

---

## Non-goals

* This suite does **not** try to “fully solve” fuzzy creative judging with only deterministic checks.
* This suite does **not** assume the model can directly output images; image generation is tested via **tool calling**.
* This suite is not a leaderboard; it’s for **practical selection** for your streaming/content workflows.

---

# Model Under Test

## Primary target

* `PetrosStav/gemma3-tools:4b` ([Ollama][1])

## Assumptions / constraints

* Vision input is delivered via `messages[i].images` in Ollama Chat API. ([GitHub][2])
* Tool calling behavior depends on the model template; the “tools Gemma3” variants explicitly instruct tool formatting (e.g. `<tool> { "name": ..., "parameters": ... } </tool>`). ([Ollama][3])
* For consistent grading, structured outputs (JSON schema enforcing) are allowed when needed. ([Ollama Documentation][4])

---

# Suite Layout

This spec defines **two benchmark suites**:

1. `vision/understanding`
2. `vision/imagegen-via-tools`

Both write results under:

* `reports/vision/<run-id>/...` (same reporting contract you already defined)

---

# Shared Inputs and Formats

## Image transport (Ollama)

### Chat request supports `images`

Ollama’s chat endpoint accepts an `images` array; REST expects base64-encoded image strings, while SDKs may accept file paths/URLs/bytes. ([GitHub][2])

**Canonical internal format (recommended):**

```clojure
{:role "user"
 :content "What is in this image?"
 :images [{:image/id "img-01"
           :image/source :file
           :image/path "/abs/path/to/img.jpg"}]}
```

**Runner responsibilities:**

* Convert `:file` paths to base64 for REST mode
* Keep both the original file + base64 hash in artifacts

---

# Tool Pack Requirements (for this suite)

This suite expects a `tools.clj` / tool pack that includes at least:

## Vision-related tools (optional but recommended)

These are tools the model may call **because of what it sees**:

* `search.web` (fetch context for a logo, brand, game title, etc.)
* `ocr.extract` (if you want OCR tool-calls as a test dimension)
* `ui.lookup` (for “what menu option do I click” assistance)
* `fact.check` (for “what is this thing” verification)

## Image generation tools (required for suite #2)

* `image.generate`
* `image.edit` (optional)

These do not have to render in-process; they can proxy to:

* local ComfyUI
* Automatic1111
* a remote SDXL endpoint
* or a placeholder generator for dry-runs

**Important:** the benchmark grades the *tool call + prompt + params* even if the image backend is swapped.

---

# Suite 1: `vision/understanding`

## Purpose

Measure *raw vision skill* + *structured reliability* + *speed*.

## Core task categories

### A) Captioning (concise + faithful)

* “What is in this image? Be concise.”
* Score on:

  * core objects present
  * hallucination rate (adds objects not present)
  * brevity

### B) VQA (visual question answering)

* Questions whose answer is only in the image:

  * “What color is the car?”
  * “How many cats are there?”
  * “What does the sign say?”

### C) OCR-lite

We don’t need perfect OCR; we need “can it reliably read big obvious text”.

* scoreboard text
* menu text
* meme text
* UI labels

### D) UI reasoning

This is *your streaming + real-world app* sweet spot.

Examples:

* “What button would you click to start recording?”
* “Which option would open settings?”
* “What’s the current health value in the HUD?”

### E) Multi-image disambiguation (optional)

Ollama doesn’t fully support interleaving multiple images inside one message in a perfect way yet, but you *can* pass multiple images in `images`. ([GitHub][5])
Test if the model handles “image 1 vs image 2” comparisons without losing its mind.

---

## Case Definition Shape

Each case is a map.

```clojure
{:case/id "vision.caption.001"
 :case/type :vision/caption
 :prompt "Describe this image in one sentence."
 :images ["assets/vision/cat01.jpg"]

 ;; grading mode
 :expects {:type :text
           :must-include ["cat"]
           :must-not-include ["dog"]
           :max-tokens 40}

 ;; optional formatting enforcement
 :response-schema nil

 ;; metrics tags
 :tags #{:caption :faithfulness}}
```

### Optional: enforce structured outputs

If you want machine-grading, use JSON schema enforcement and require a stable output shape. ([Ollama Documentation][4])

Example:

```clojure
{:response-schema
 {:type "object"
  :properties
  {"objects" {:type "array" :items {:type "string"}}
   "summary" {:type "string"}}
  :required ["objects" "summary"]}}
```

---

## Scoring

Each case produces:

### Accuracy

* `vision/answer_correct?` (boolean)
* `vision/partial_credit` (0.0–1.0)
* `vision/hallucination_count` (int)

### Reliability

* `format/valid?` (boolean)
* `schema/valid?` (boolean)

### Performance

* `latency/ttft_ms` (time-to-first-token)
* `latency/total_ms`
* `throughput/tokens_per_sec`

### Tool behavior (if tools enabled)

* `tool/should_call?`
* `tool/called?`
* `tool/correct?`
* `tool/extra_calls`

---

## “Tool choice under vision” (the real spice)

A sub-benchmark inside suite 1:

You show an image, then ask something that *requires* a tool.

Example:

* image shows a movie poster
* user asks: “What year was this released?”
  Expected: call `search.web` (or your own `lookup`) instead of hallucinating.

**This makes “vision → tool calling” measurable.**

---

# Suite 2: `vision/imagegen-via-tools`

## Purpose

Measure whether the model can act as a **creative director** that calls image tools correctly:

* chooses the right tool (`image.generate` vs `image.edit`)
* produces a strong prompt under constraints
* picks sane params (aspect ratio, seed policy, steps, style)

This is ideal for:

* thumbnail concepting
* on-stream scene generation
* meme templates
* character cards / overlays

---

## Tool contract: `image.generate`

**Required parameters:**

* `prompt` (string)
* `size` or `width/height`
* optional `negative_prompt`
* optional `seed`
* optional `steps`
* optional `cfg_scale`
* optional `style_preset`

Example tool signature:

```clojure
(def-tool image/generate
  {:description "Generate an image from a prompt"
   :domain :imagegen
   :tags #{:creative :render}
   :args (s/keys :req-un [::prompt ::size]
                 :opt-un [::negative_prompt ::seed ::steps ::cfg_scale])}
  (fn [{:keys [prompt size] :as params}]
    ...))
```

---

## Case types

### A) “Prompt writing only” (no render)

Fast, cheap, good for iteration.

Grade:

* includes required entities
* respects constraints (no forbidden content, correct aspect ratio)
* matches style requirements

Example:

```clojure
{:case/id "imagegen.prompt.001"
 :case/type :imagegen/prompt-only
 :prompt "Make a YouTube thumbnail concept: 'I Built a Robot Duck'. Needs bold readable text, high contrast, funny."
 :expects
 {:tool "image/generate"
  :args {:size "1280x720"
         :must-include ["robot duck" "thumbnail" "bold text"]
         :style-hints ["high contrast" "readable"]}}}
```

### B) “Render + judge” (optional)

If you plug a generator backend, you can store the produced image and run an automated judge:

* CLIP similarity between prompt and generated image
* caption model check (“does it contain a duck?”)
* composition heuristics (text legibility is hard though)

This can also be a “human review later” track.

---

## Scoring for imagegen-via-tools

### Tool correctness

* `tool/correct_tool_selected?`
* `tool/args_valid?`
* `tool/constraint_satisfied?` (aspect ratio, required words)

### Prompt quality (semi-automatic)

* `prompt/entity_coverage` (0..1)
* `prompt/style_coverage` (0..1)
* `prompt/clarity_score` (0..1)
* `prompt/overconstraint_penalty`

### Performance

* first tool call latency
* tool call count
* total time

---

# Entertainment / Streaming Tracks

This is where we test “performative usefulness” without pretending it’s purely objective.

## Track A: Live commentary

Input: screenshot of a game / desktop / meme
Output: short energetic commentary under constraints:

* max 2 sentences
* “streamer voice”
* avoid slurs / mean punching down
* include one joke + one observation

**Scoring:**

* rule compliance (length, structure)
* presence of “observation tied to image”
* latency/ttft

## Track B: Chat interaction bits

Input: image + chat prompt like “roast this UI lovingly”
Output: comedic but useful critique.

**Scoring:**

* includes at least 1 actionable suggestion
* avoids unsafe content
* stays within token budget

## Track C: YouTube packaging

Input: image (scene) + title concept
Output:

* 3 title variants
* 1 hook line
* 1 thumbnail prompt (calls `image.generate`)

**Scoring:**

* structure compliance
* tool call correctness
* “title diversity” heuristic (string similarity threshold)

---

# Decoys (vision edition)

Decoys matter more in multimodal because models love to hallucinate confidence.

### Tool decoy types

* **same-domain decoy**: plausible but wrong (e.g., `ocr.extract` when question is “what color?”)
* **powerful decoy**: “search.web” even when answer is obvious from image
* **noise decoy**: irrelevant tools

### Metrics

Add these for every tool decision:

* `decoy/selected?`
* `decoy/type` (`:same-domain | :powerful | :noise`)
* `decoy/domain-match?`
* `decoy/tag-overlap` (Jaccard of tags)

This gives “why it failed”, not just “wrong”.

---

# Dataset and Assets

## Required structure

```
benchmarks/
  vision/
    assets/
      caption/
      vqa/
      ocr/
      ui/
      entertainment/
    cases/
      understanding.clj
      imagegen.clj
```

## Licensing rule

All images must be:

* created by you, or
* permissively licensed, or
* downloaded with explicit redistribution rights

Store license notes per directory.

---

# Output Events (JSONL)

Events should include these new types:

* `vision/case.started`
* `vision/case.completed`
* `vision/model.response`
* `vision/tool.called`
* `vision/tool.result`
* `imagegen/render.saved`
* `judge/scored` (if render judging is enabled)

Each event includes:

* `case/id`
* `model/name`
* `image/hashes` (sha256)
* timing fields

---

# Recommended “first suite” for PetrosStav/gemma3-tools:4b

Start small, brutal, practical:

## Understanding (10–30 cases)

* 5 caption cases
* 10 VQA cases (counting/colors/text)
* 5 UI reasoning cases (buttons/menus)
* 5 OCR-lite cases (big text)

## Imagegen via tools (10–20 cases)

* 10 “thumbnail prompt” cases
* 5 “character card prompt” cases
* 5 “meme variant prompt” cases

## Streaming track (10 cases)

* 5 “commentary max 2 sentences”
* 5 “title/hook/thumbnail bundle”

This will tell you in one run if the model is:

* actually seeing the image
* actually using tools cleanly
* quick enough to feel alive on stream

---

# Notes about Gemma tool calling (reliability expectations)

Gemma 3 general models don’t always have *native* tool tokens; many rely on prompting/templates for function calling, which is why these “tools variants” exist. ([Google AI for Developers][6])
Your benchmark should **explicitly record tool-call format failures**, because that’s a big practical failure mode in small models.

---

If you want, I can follow this by writing:

* the `vision/understanding.clj` and `vision/imagegen.clj` **case packs** (as real `def-suite` / `def-case` DSL forms)
* a minimal `image.generate` tool definition + fake backend (so you can benchmark prompt+args immediately)
* and a “streamer track” rubric that stays mostly auto-gradable (structure + grounding + latency)

[1]: https://ollama.com/PetrosStav/gemma3-tools%3A4b?utm_source=chatgpt.com "PetrosStav/gemma3-tools:4b"
[2]: https://github.com/ollama/ollama/blob/main/docs/api.md?utm_source=chatgpt.com "ollama/docs/api.md at main"
[3]: https://ollama.com/PetrosStav/gemma3-tools%3A4b/blobs/fd46d06e2520?utm_source=chatgpt.com "PetrosStav/gemma3-tools:4b/template"
[4]: https://docs.ollama.com/capabilities/structured-outputs?utm_source=chatgpt.com "Structured Outputs"
[5]: https://github.com/ollama/ollama/issues/10274?utm_source=chatgpt.com "Add a way to interleave messages and images in `/api/chat`"
[6]: https://ai.google.dev/gemma/docs/capabilities/function-calling?utm_source=chatgpt.com "Function calling with Gemma | Google AI for Developers"
