Hell yes. Now we make this thing *scoreable*, *repeatable*, and *mean* in the way you want.

We’re going to add:

* ✅ **schema-driven argument repair** (turn “msg” into “text”, coerce types, fill defaults)
* ✅ a **benchmark harness DSL** that feels like writing specs, not tests
* ✅ decoys + abstention + multi-step chains
* ✅ streaming JSONL report output (crash-safe, append-only)
* ✅ “same framework = benchmark + real agents”

Everything below is written so you can drop it straight into your `ollama` namespace / benchmark suite structure.

---

# 1) Schema-driven argument repair

Your soft tool calling models will *almost always* get argument keys slightly wrong.

So: if the model calls a tool with `{"msg":"hi"}` but schema wants `{"text":"hi"}`, we repair it.

This repair must be:

* deterministic
* schema-guided
* conservative (don’t invent meaning)

## 1.1 Tool schema helpers

Create: `src/promethean/tools/schema.clj`

```clojure
(ns promethean.tools.schema
  (:require [clojure.string :as str]))

(defn props
  "Return schema properties map."
  [tool]
  (get-in tool [:tool/inputSchema :properties] {}))

(defn required
  [tool]
  (set (get-in tool [:tool/inputSchema :required] [])))

(defn property-names
  [tool]
  (->> (props tool) keys (map name) set))

(defn- normalize-k [k]
  (-> (name k)
      str/lower-case
      (str/replace "-" "_")
      (str/replace " " "_")
      (str/replace #"[^\w_\.]" "")))

(defn best-key-match
  "Find the best schema key candidate for an incoming key.
  Very conservative: exact normalized match or common synonyms."
  [tool incoming-k]
  (let [incoming (normalize-k incoming-k)
        schema-ks (props tool)
        candidates (keys schema-ks)
        normalized->orig (into {}
                               (map (fn [k] [(normalize-k k) (name k)]))
                               candidates)]

    (or
      ;; exact normalized match
      (get normalized->orig incoming)

      ;; tiny synonym map (extend over time)
      (let [synonyms {"msg" "text"
                      "message" "text"
                      "caption" "text"
                      "prompt" "text"
                      "path" "path"
                      "file" "path"
                      "filename" "path"}]
        (when-let [syn (get synonyms incoming)]
          (when (contains? (property-names tool) syn)
            syn)))

      ;; last resort: nil (do not guess)
      nil)))

(defn coerce-value
  "Coerce a value into the schema type if possible."
  [schema v]
  (let [t (:type schema)]
    (cond
      (nil? v) nil
      (nil? t) v

      (= t "string")
      (cond
        (string? v) v
        :else (str v))

      (= t "number")
      (cond
        (number? v) v
        (string? v) (try (Double/parseDouble v) (catch Throwable _ v))
        :else v)

      (= t "integer")
      (cond
        (integer? v) v
        (number? v) (long v)
        (string? v) (try (Long/parseLong v) (catch Throwable _ v))
        :else v)

      (= t "boolean")
      (cond
        (boolean? v) v
        (string? v) (contains? #{"true" "1" "yes" "y"} (str/lower-case v))
        :else v)

      (= t "object")
      (if (map? v) v v)

      (= t "array")
      (cond
        (vector? v) v
        (seq? v) (vec v)
        :else [v])

      :else v)))

(defn repair-args
  "Repair args map to match tool schema keys & basic types.
  Returns {:args repaired :repairs [...]}."
  [tool args]
  (let [args (if (map? args) args {})
        schema-props (props tool)
        schema-keys (property-names tool)

        ;; pass 1: rename keys if obvious
        renamed
        (reduce-kv
          (fn [m k v]
            (let [target (best-key-match tool k)]
              (cond
                ;; keep if already schema key
                (contains? schema-keys (name k))
                (assoc m (name k) v)

                ;; rename if match
                (some? target)
                (assoc m target v)

                ;; drop unknown key (or keep under _extra)
                :else
                (assoc m (str "_extra." (name k)) v))))
          {}
          args)

        repairs (atom [])

        ;; pass 2: coerce types
        coerced
        (reduce-kv
          (fn [m k v]
            (if-let [ps (get schema-props (keyword k))]
              (let [v2 (coerce-value ps v)]
                (when (not= v v2)
                  (swap! repairs conj {:op :coerce :key k :from v :to v2}))
                (assoc m k v2))
              (assoc m k v)))
          {}
          renamed)]

    {:args coerced
     :repairs @repairs}))
```

**Design choice:** unknown keys get tucked under `_extra.*` instead of deleted.
That makes debugging + benchmarking easier.

---

# 2) Validate tool calls against schema (and score it)

Now we build a tool-call validator that can answer:

* did it choose the correct tool?
* did it supply required args?
* did repair have to do work?
* did it still fail?

Create: `src/promethean/bench/tool_validation.clj`

```clojure
(ns promethean.bench.tool-validation
  (:require
    [promethean.tools.schema :as schema]))

(defn missing-required
  [tool args]
  (let [req (schema/required tool)]
    (->> req
         (remove #(contains? args %))
         vec)))

(defn validate-tool-call
  "Return {:ok? boolean, :missing [...], :repairs [...], :repaired-args {...}}"
  [tool args]
  (let [{:keys [args repairs]} (schema/repair-args tool args)
        missing (missing-required tool args)]
    {:ok? (empty? missing)
     :missing missing
     :repairs repairs
     :repaired-args args}))
```

---

# 3) Integrate repair into runtime tool execution

We want repair to happen *before the tool impl runs*.

Modify your tool runtime call (the thing that executes registry tools).

Create: `src/promethean/tools/runtime_repair.clj`

```clojure
(ns promethean.tools.runtime-repair
  (:require
    [promethean.tools.registry :as reg]
    [promethean.tools.runtime :as base]
    [promethean.bench.tool-validation :as v]
    [promethean.agent.runtime :as rt]))

(defn call-tool!
  "Like base/call-tool!, but repairs args + emits repair events."
  [{:keys [registry bus agent] :as ctx} tool-name args]
  (let [tool (reg/get-tool registry tool-name)]
    (when-not tool
      (throw (ex-info "Unknown tool" {:tool tool-name})))

    (let [{:keys [ok? missing repairs repaired-args]} (v/validate-tool-call tool args)]
      (when (seq repairs)
        (rt/emit! bus {:event :tool/repair
                       :agent (:agent/id agent)
                       :tool tool-name
                       :repairs repairs}))
      (when-not ok?
        (rt/emit! bus {:event :tool/invalid
                       :agent (:agent/id agent)
                       :tool tool-name
                       :missing missing}))

      ;; even if invalid, you can choose:
      ;; - hard stop
      ;; - run anyway
      ;; benchmark wants to observe behavior, so run anyway, but record invalid.
      (base/call-tool! ctx tool-name repaired-args))))
```

Then in your tool loop, swap `tools/call-tool!` -> `runtime-repair/call-tool!`.

---

# 4) Benchmark DSL: cases that feel like “spec sheets”

You want to write benchmarks like:

```clojure
(def-benchmark tool-choice
  (suite "basic"
    (case "overlay caption"
      :prompt "Put hello on screen"
      :expect (calls "overlay_text" {:text "hello"})
      :decoys [tools/overlay-text]))
```

So we add macros that compile into pure data.

Create: `src/promethean/bench/dsl.clj`

```clojure
(ns promethean.bench.dsl)

(defmacro calls
  "Expectation: the run must call tool name at least once.
  Optionally expect subset of args."
  [tool-name & [args]]
  `{:expect/type :calls
    :expect/tool ~tool-name
    :expect/args ~args})

(defmacro abstains
  "Expectation: no tool calls should occur."
  []
  `{:expect/type :abstains})

(defmacro case
  [id & {:as m}]
  `(merge {:case/id ~id} ~m))

(defmacro suite
  [id & cases]
  `{:suite/id ~id
    :suite/cases ~(vec cases)})

(defmacro def-benchmark
  [id & suites]
  `(def ~id
     {:bench/id ~(name id)
      :bench/suites ~(vec suites)}))
```

This doesn’t run anything. It’s a “manifest”.

---

# 5) Capturing tool-call traces for scoring

We need to extract tool calls from the event bus stream.

You already have events:

* `:tool/call`
* `:tool/done`
* `:tool/repair`
* `:tool/invalid`

We’ll write a “trace collector” that listens while a case runs.

Create: `src/promethean/bench/trace.clj`

```clojure
(ns promethean.bench.trace
  (:require [clojure.core.async :as async]))

(defn start-collector!
  "Returns {:events-atom ... :stop! fn} that collects all events."
  [bus]
  (let [events* (atom [])
        stop-ch (async/chan 1)
        done (async/chan 1)]
    (async/go-loop []
      (let [[v ch] (async/alts! [(:events bus) stop-ch])]
        (cond
          (= ch stop-ch)
          (do (async/>! done true)
              (async/close! done))

          (nil? v)
          (recur)

          :else
          (do (swap! events* conj v)
              (recur)))))
    {:events events*
     :stop! (fn []
              (async/put! stop-ch true))
     :done done}))
```

---

# 6) Scoring: decoys + correctness + abstention

We define scoring as:

### For `:calls`

* tool was called ✅
* no decoy tools called ✅/❌
* required args satisfied ✅
* arg repairs count (lower is better)
* extra “invalid tool call” penalties

### For `:abstains`

* no tool calls ✅
* tool calls => fail

Create: `src/promethean/bench/score.clj`

```clojure
(ns promethean.bench.score)

(defn tool-call-events [events]
  (filter #(= (:event %) :tool/call) events))

(defn invalid-events [events]
  (filter #(= (:event %) :tool/invalid) events))

(defn repair-events [events]
  (filter #(= (:event %) :tool/repair) events))

(defn called-tool? [events tool-name]
  (some #(= (:tool %) tool-name) (tool-call-events events)))

(defn called-any-tool? [events]
  (seq (tool-call-events events)))

(defn called-decoy? [events decoy-names]
  (let [decoys (set decoy-names)]
    (some #(contains? decoys (:tool %)) (tool-call-events events))))

(defn score-case
  [{:keys [expect decoys] :as case} events]
  (let [{:keys [expect/type expect/tool]} expect
        tool-calls (tool-call-events events)
        invalids (count (invalid-events events))
        repairs (count (repair-events events))
        decoy-names (mapv :tool/name (or decoys []))]

    (case expect/type
      :abstains
      (let [ok? (not (called-any-tool? events))]
        {:ok? ok?
         :score (if ok? 1.0 0.0)
         :details {:tool-calls (count tool-calls)}})

      :calls
      (let [called? (called-tool? events expect/tool)
            decoy? (called-decoy? events decoy-names)
            ok? (and called? (not decoy?))
            ;; score breakdown
            base (if ok? 1.0 0.0)
            penalty (+ (* 0.1 invalids) (* 0.05 repairs) (if decoy? 0.5 0.0))
            score (max 0.0 (- base penalty))]
        {:ok? ok?
         :score score
         :details {:called? called?
                   :decoy? decoy?
                   :invalids invalids
                   :repairs repairs
                   :tool-calls (mapv (fn [e] {:tool (:tool e) :args (:args e)})
                                     tool-calls)}})

      ;; unknown => fail
      {:ok? false
       :score 0.0
       :details {:error "Unknown expectation type"}})))
```

This scoring is intentionally simple but meaningful.

---

# 7) Runner: execute benchmarks and stream JSONL results

We’ll write:

* each case run emits a `case.jsonl` line
* suite summary emits `suite.jsonl`
* overall summary emits `bench.jsonl`
* everything append-only so crash-safe

Create: `src/promethean/bench/runner.clj`

```clojure
(ns promethean.bench.runner
  (:require
    [clojure.java.io :as io]
    [cheshire.core :as json]
    [promethean.bench.trace :as trace]
    [promethean.bench.score :as score]
    [promethean.llm.loop :as loop] ;; your tool-loop! fn
    [promethean.agent.engine :as engine]
    [promethean.agent.runtime :as rt]))

(defn now-ms [] (System/currentTimeMillis))

(defn append-jsonl! [path m]
  (spit path (str (json/generate-string m) "\n") :append true))

(defn run-case!
  "Run one benchmark case, return result map."
  [{:keys [bus registry llm agent]} {:keys [case/id prompt expect decoys max-steps] :as c}]
  (let [collector (trace/start-collector! bus)
        t0 (now-ms)
        ctx {:bus bus
             :registry registry
             :llm llm
             :agent agent}

        ;; Run tool-loop with one user prompt
        _ (loop/tool-loop! ctx
            {:system (:agent/prompt agent)
             :messages [{:role "user"
                         :content [{:type "text" :text prompt}]}]
             :tools (vals @(:tools/by-name registry))
             :max-steps (or max-steps 10)})

        ;; stop collector
        _ ((:stop! collector))
        events @(:events collector)
        t1 (now-ms)

        scored (score/score-case {:expect expect :decoys decoys} events)]

    (merge
      {:case/id id
       :case/prompt prompt
       :time/ms (- t1 t0)
       :events/count (count events)}
      scored)))

(defn run-benchmark!
  "Run a full benchmark manifest and stream results to reports folder."
  [{:keys [report-dir bus registry llm agent bench]}]
  (let [bench-id (:bench/id bench)
        run-id (str bench-id "-" (java.util.UUID/randomUUID))
        out-dir (str report-dir "/" bench-id "/" run-id)
        case-path (str out-dir "/cases.jsonl")
        suite-path (str out-dir "/suites.jsonl")
        bench-path (str out-dir "/bench.jsonl")]

    (.mkdirs (io/file out-dir))
    (append-jsonl! bench-path {:event :bench/start :bench bench-id :run run-id :ts (now-ms)})

    (doseq [{:keys [suite/id suite/cases]} (:bench/suites bench)]
      (append-jsonl! suite-path {:event :suite/start :suite id :ts (now-ms)})

      (let [results
            (mapv
              (fn [c]
                (let [res (run-case! {:bus bus :registry registry :llm llm :agent agent} c)]
                  (append-jsonl! case-path (merge {:suite/id id :ts (now-ms)} res))
                  res))
              cases)

            avg-score (if (seq results)
                        (/ (reduce + (map :score results)) (count results))
                        0.0)
            pass-rate (if (seq results)
                        (/ (count (filter :ok? results)) (count results))
                        0.0)]

        (append-jsonl! suite-path {:event :suite/done
                                   :suite id
                                   :avg-score avg-score
                                   :pass-rate pass-rate
                                   :cases (count results)
                                   :ts (now-ms)})))

    (append-jsonl! bench-path {:event :bench/done :bench bench-id :run run-id :ts (now-ms)})
    {:ok true :out out-dir}))
```

This is already enough to bench models reliably.

---

# 8) Example benchmark manifest (with decoys + abstention)

Create: `src/promethean/benchmarks/tool_choice.clj`

```clojure
(ns promethean.benchmarks.tool-choice
  (:require
    [promethean.bench.dsl :refer [def-benchmark suite case calls abstains]]
    [promethean.ollama.tools :as tools]))

(def-benchmark tool-choice
  (suite "basic"
    (case "overlay caption"
      :prompt "Put the text hello on the screen."
      :expect (calls "overlay_text" {"text" "hello"})
      :decoys [tools/overlay-text])

    (case "play sfx"
      :prompt "Play a dramatic sound effect."
      :expect (calls "play_sfx")
      :decoys [tools/play_sound_effect_legacy])

    (case "abstain"
      :prompt "Say hello politely. Do not use any tools."
      :expect (abstains))))
```

Decoys are real tool instances, which is even better (the model sees them).

---

# 9) Turn this into a reusable “real agent pack”

Because everything is the same registry + tool loop, you can now:

* run `tool-choice` benchmark suite against `PetrosStav/gemma3-tools:4b`
* then use the **same registry** for your streamer “Duck performer agent”

No forked code paths. Same engine.

---

# 10) The “go crazy” macro: `def-performer`

Now we add an *agent DSL* that feels like prototypal mixing.

Example:

```clojure
(def-performer duck
  (extends proto/agent-child)
  (mix proto/mixin-performer proto/mixin-trace)
  (tools [overlay_text play_sfx])
  (model "PetrosStav/gemma3-tools:4b")
  (prompt "You are Duck. You commentate while being funny."))
```

If you want, I’ll write this as a macro that expands into a `def-agent` instance + tool registry builder.

---

# 11) What I’d do next immediately

To make `gemma3-tools:4b` *actually shine* for streaming:

## A) Add “tool budget” + “tool cooldown”

So it doesn’t spam overlay text.

## B) Add “frame summarizer tool”

Even if vision works, you’ll often want:

* cheap OCR
* cheap scene classifier
* cheap “what changed since last frame?”

That’s a tool. The performer calls it.

## C) Add a “joke gate”

Only allow jokes if:

* something changed
* time since last joke > X
* energy level threshold

That’s just a hook + stateful ctx.

---

If you say **“add def-performer + tool cooldown + frame summary tool skeleton”**, I’ll drop the next chunk as a complete mini-pack that you can use both for:

* 📊 vision/tool benchmark suite
* 🎥 live stream entertainer agent
