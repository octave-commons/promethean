Alright — now we build the **Ollama adapter** that makes the whole framework actually usable with “kinda tool calling” models like `PetrosStav/gemma3-tools:4b`.

This adapter will:

* accept **soft / sloppy tool calls** (json-ish, yaml-ish, function-call-ish)
* **repair** them into a canonical structure
* **validate** with `clojure.spec.alpha` (your “core.alpha” intent)
* execute tools through the **registry + hooks**
* loop until a **final answer**
* optionally support **stream performer mode** (emit partial text + tool events)

This is where you stop needing “tool calling built-in” and instead run a **tool calling protocol** *around* the model.

---

# 1) Canonical tool call format (the only thing your runtime needs)

Everything gets normalized into:

```clojure
{:type :tool_calls
 :tool_calls [{:id "call_1"
               :name "overlay_text"
               :arguments {"text" "hello"}}]
 :content [{:type "text" :text "optional preface"}]}
```

Or final:

```clojure
{:type :final
 :content [{:type "text" :text "done"}]}
```

So the loop doesn’t care if:

* model is OpenAI-native tool calling
* Ollama with some template
* random multimodal model that prints pseudo calls

---

# 2) Specs for validation (`clojure.spec.alpha`)

Create: `src/promethean/llm/specs.clj`

```clojure
(ns promethean.llm.specs
  (:require [clojure.spec.alpha :as s]))

(s/def :tool-call/id string?)
(s/def :tool-call/name string?)
(s/def :tool-call/arguments map?)

(s/def :llm/tool-call
  (s/keys :req-un [:tool-call/id :tool-call/name :tool-call/arguments]))

(s/def :llm/tool-calls
  (s/coll-of :llm/tool-call :min-count 1))

(s/def :llm/type #{:final :tool_calls})

(s/def :llm/content
  (s/coll-of map? :min-count 1))

(s/def :llm/step
  (s/keys :req-un [:llm/type]
          :opt-un [:llm/tool-calls :llm/content]))
```

Why spec matters here:

* **repair layer** can keep trying until it matches spec
* benchmark can score: “was tool call parsable + valid?”

---

# 3) Soft tool call parsing (repairable)

This is the fun part. We assume the model might output any of these:

### A) JSON tool block

```json
{"tool_calls":[{"name":"overlay_text","arguments":{"text":"hi"}}]}
```

### B) “function-call” style

```
CALL overlay_text {"text":"hi"}
```

### C) YAML-ish

```yaml
tool: overlay_text
args:
  text: hi
```

### D) Narrative + embedded snippet

````
I'll add a caption now.

```tool
overlay_text
text: hi
````

````

We want a parser that attempts multiple strategies **in priority order**, returns best-effort.

Create: `src/promethean/llm/parse.clj`

```clojure
(ns promethean.llm.parse
  (:require
    [clojure.string :as str]
    [cheshire.core :as json]
    [clojure.edn :as edn]
    [clojure.spec.alpha :as s]
    [promethean.llm.specs :as specs]))

(defn- try-json [s]
  (try
    (json/parse-string s true)
    (catch Throwable _ nil)))

(defn- try-edn [s]
  (try
    (edn/read-string s)
    (catch Throwable _ nil)))

(defn- strip-fences [s]
  ;; remove triple backtick fences but keep inside
  (-> s
      (str/replace #"(?s)```(?:json|tool|yaml|yml|edn)?\s*" "")
      (str/replace #"(?s)```" "")))

(defn- find-json-object [s]
  ;; naive: grab first {...} block with balanced braces
  (let [s (strip-fences s)
        start (.indexOf s "{")]
    (when (>= start 0)
      (loop [i start
             depth 0]
        (when (< i (count s))
          (let [ch (.charAt s i)
                depth' (cond
                         (= ch \{) (inc depth)
                         (= ch \}) (dec depth)
                         :else depth)]
            (cond
              (and (= depth' 0) (> depth 0))
              (subs s start (inc i))

              :else
              (recur (inc i) depth'))))))))

(defn- parse-call-line [line]
  ;; "CALL toolName {json...}"
  (when-let [[_ name args] (re-matches #"(?i)\s*CALL\s+([a-zA-Z0-9_\-\.]+)\s+(.*)" line)]
    {:tool_calls [{:name name
                   :arguments (or (try-json args) {})}]}))

(defn- parse-tool-fence [s]
  ;; ```tool <name>\nkey: value\n```
  (when (re-find #"(?s)```tool" s)
    (let [inside (-> s
                     (str/replace #"(?s)^.*```tool" "")
                     (str/replace #"(?s)```.*$" "")
                     str/trim)
          lines (str/split-lines inside)
          name (first lines)
          kvs (rest lines)
          args (into {}
                     (keep (fn [ln]
                             (when-let [[_ k v] (re-matches #"\s*([a-zA-Z0-9_\-\.]+)\s*:\s*(.+)\s*" ln)]
                               [k v])))
                     kvs)]
      {:tool_calls [{:name (str/trim name)
                    :arguments args}]})))

(defn parse-soft
  "Parse model output into a raw tool-call-ish map:
    {:tool_calls [...]}
  Returns nil if no tool call signal detected."
  [s]
  (let [s0 (str/trim s)]

    ;; 1) explicit tool fence
    (or (parse-tool-fence s0)

        ;; 2) a CALL line
        (some parse-call-line (str/split-lines s0))

        ;; 3) try embedded json object
        (when-let [obj-str (find-json-object s0)]
          (or (try-json obj-str)
              (try-edn obj-str)))

        ;; 4) try whole string as json/edn
        (or (try-json s0)
            (try-edn s0)))))

(defn ->step
  "Convert parsed output into canonical {:type ...} step.
  If no tool calls -> final text."
  [text]
  (let [parsed (parse-soft text)]
    (cond
      (and (map? parsed) (seq (:tool_calls parsed)))
      (let [calls (:tool_calls parsed)
            calls (mapv (fn [i {:keys [name arguments]}]
                          {:id (str "call_" (inc i))
                           :name (str name)
                           :arguments (if (map? arguments) arguments {})})
                        (range) calls)
            step {:type :tool_calls
                  :tool_calls calls}]
        step)

      :else
      {:type :final
       :content [{:type "text" :text text}]})))
````

This is intentionally “dumb but robust” — it will parse **a lot** of real-world garbage.

---

# 4) Repair + validation loop

Sometimes parsing gives you something close but invalid:

* missing `arguments`
* tool name has spaces
* arguments is a string not a map
* tool_calls is nested differently

So we add a “repair layer” that tries to coerce it into spec.

Create: `src/promethean/llm/repair.clj`

```clojure
(ns promethean.llm.repair
  (:require
    [clojure.spec.alpha :as s]
    [clojure.string :as str]
    [promethean.llm.specs :as specs]))

(defn- normalize-tool-name [s]
  (-> s str str/trim (str/replace #" " "_")))

(defn- normalize-call [call idx]
  (let [name (normalize-tool-name (or (:name call) (:tool call) ""))
        args (or (:arguments call) (:args call) {})]
    {:id (or (:id call) (str "call_" (inc idx)))
     :name name
     :arguments (if (map? args) args {})}))

(defn repair-step [step]
  (cond
    (= (:type step) :tool_calls)
    (let [calls (or (:tool_calls step)
                    (get step :toolCalls)
                    (:tool_calls (get step :data))
                    [])
          calls (mapv normalize-call calls (range))
          step' (-> step
                    (assoc :type :tool_calls)
                    (assoc :tool_calls calls)
                    (dissoc :toolCalls))]
      step')

    (= (:type step) :final)
    (if (seq (:content step))
      step
      (assoc step :content [{:type "text" :text (or (:text step) "")}]))

    :else
    ;; unknown -> treat as final
    {:type :final
     :content [{:type "text" :text (pr-str step)}]}))

(defn validate-step [step]
  (s/valid? :llm/step step))

(defn repair+validate [step]
  (let [step' (repair-step step)]
    (if (validate-step step')
      step'
      ;; last resort: force final
      {:type :final
       :content [{:type "text" :text "Invalid tool call output."}]})))
```

---

# 5) Ollama driver: “model outputs text, we interpret it”

Now we implement `:llm/call` for Ollama.

The key design:

* **Ollama call returns text**
* We parse text into a **step**
* Step goes into **tool loop**
* Tool results become “tool messages” appended to conversation
* Next iteration includes tool results

Create: `src/promethean/llm/ollama.clj`

```clojure
(ns promethean.llm.ollama
  (:require
    [clojure.string :as str]
    [promethean.llm.parse :as parse]
    [promethean.llm.repair :as repair]))

(defn build-system
  "System prompt template that teaches the model your tool protocol.

  This is how you get tool calling even when model lacks native tool calling."
  [{:keys [system tools]}]
  (let [tool-lines
        (->> tools
             (map (fn [t]
                    (str "- " (:tool/name t) ": " (:tool/description t))))
             (str/join "\n"))]
    (str system
         "\n\n"
         "## Tool Calling Protocol\n"
         "If you need a tool, respond with ONLY ONE of these formats:\n\n"
         "1) JSON:\n"
         "{\"tool_calls\":[{\"name\":\"tool_name\",\"arguments\":{...}}]}\n\n"
         "2) CALL line:\n"
         "CALL tool_name {\"arg\": \"value\"}\n\n"
         "Available tools:\n"
         tool-lines
         "\n\n"
         "If you do not need tools, respond normally.")))

(defn messages->plain
  "Convert structured messages into a plain chat transcript for Ollama text models."
  [messages]
  (->> messages
       (map (fn [m]
              (let [role (:role m)
                    content (:content m)]
                (cond
                  (string? content) (str role ": " content)
                  (vector? content)
                  (str role ": "
                       (->> content
                            (map (fn [c]
                                   (or (:text c)
                                       (when (:json c) (pr-str (:json c)))
                                       (pr-str c))))
                            (str/join "\n")))
                  :else
                  (str role ": " (pr-str content))))))
       (str/join "\n\n")))

(defn make-ollama-driver
  "Return {:llm/call fn}.

  You provide:
    - call-ollama! (fn [{:keys [model prompt]}] -> string text)
      (this is your actual HTTP adapter / ollama client)"
  [{:keys [call-ollama!]}]
  {:llm/call
   (fn [{:keys [system messages tools ctx model] :as req}]
     ;; build tool-aware system prompt
     (let [sys (build-system {:system system :tools tools})
           transcript (messages->plain messages)
           prompt (str sys "\n\n" transcript "\n\nassistant: ")
           text (call-ollama! {:model model :prompt prompt :ctx ctx})
           step (-> text parse/->step repair/repair+validate)]
       step))})
```

That’s it: **Ollama tool calling** without native support.

The model just needs to follow *your protocol*.

---

# 6) Plugging into your tool loop engine

Now your `tool-loop!` can run using this driver.

Example runtime ctx:

```clojure
{:llm (make-ollama-driver {:call-ollama! ...})
 :registry registry
 :bus bus
 :agent agent}
```

Then call:

```clojure
(promethean.llm.loop/tool-loop! ctx
  {:system (:agent/prompt agent)
   :messages [{:role "user" :content [{:type "text" :text "Put 'hello' on screen"}]}]
   :tools (promethean.tools.registry/list-tools registry)
   :max-steps 8})
```

---

# 7) Performer mode: “streamer agent” working with vision-ish inputs

Even if the model is “vision enabled”, in practice you may provide:

* screen description text (from your own detector / OCR / game API)
* or base64 image tokens (depending on model/runtime)

Your adapter can treat “vision” as another content block:

```clojure
{:role "user"
 :content [{:type "image" :data "<b64>"} {:type "text" :text "react to this"}]}
```

But since Ollama text drivers are often limited, a practical path is:

### “Vision frontend” tool

Have a tool that turns an image/frame into text:

* local tiny vision model (or just basic heuristics)
* outputs a summary string

Then the performer agent uses tool calling to “see”.

That’s hilarious and *works*.

Example:

* tool: `describe_frame`
* agent: calls it every N seconds
* then calls `overlay_text` or `play_sfx`

And you can benchmark:

* tool usage frequency
* reaction relevance
* latency / loop stability

---

# 8) Benchmarks become straightforward now

Because every run produces the same event stream:

* `:llm/step`
* `:tool/call`
* `:tool/done`
* `:tool/error`
* `:llm/final`

Tool calling ability score becomes:

* ✅ correct tool chosen (avoid decoy)
* ✅ correct args schema keys
* ✅ number of tool steps minimal
* ✅ final answer quality

And this works for:

* OpenAI-native tool calling models
* Ollama soft tool calling models
* *anything* that can follow a protocol

---

# 9) Next “hardening” upgrades

These are worth adding soon:

## A) “Schema-driven argument repair”

If model outputs:

```json
{"tool_calls":[{"name":"overlay_text","arguments":{"msg":"hi"}}]}
```

But schema expects `"text"`,

You can repair by:

* looking at tool schema properties
* mapping nearest keys (`msg` -> `text`)
* or falling back to “first stringy key”

That gives you *huge* wins with small models.

## B) “Tool abstention”

Add a test where the best answer is **no tool call**.

Small models love to call tools unnecessarily.
Score them down for it.

## C) “Max step safety”

Hard cap loops to prevent “tool spirals”.
You already have `max-steps`.

---

# 10) If you want, I’ll do the next drop as *one cohesive chunk*

Say the word and I’ll write:

* `schema-driven args repair`
* `decoy tool scoring harness`
* `ollama namespace benchmark suite: tool choice + arg correctness + abstention`
* plus the DSL:

```clojure
(def-benchmark tool-choice
  {:agent agents/streamer
   :cases [(case ...)]})
```

So you can point it at `PetrosStav/gemma3-tools:4b` and immediately get a report.

Just say: **“add schema repair + benchmark harness DSL”**.
