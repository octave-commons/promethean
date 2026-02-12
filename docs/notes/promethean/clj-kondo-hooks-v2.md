Yep — we can make **clj-kondo treat your DSL as “real code”** instead of a pile of “unused values” + macro mystery.

You already have the core **analyze-call hooks**. The next step is:

1. **Rewrite macros into meaningful shapes** (`def` + `merge` + vectors) so kondo sees *real structure*
2. **Disable noisy linters only inside these DSL calls** (`unused-value` mainly)
3. (Optional) ship as **clj-kondo.exports** so consumers get this automatically

Below is a **more serious setup**.

---

# 1) `.clj-kondo/config.edn` (upgraded)

```clj
{:hooks
 {:analyze-call
  {promethean.ollama.tools/def-tool     clj-kondo.hooks.promethean.ollama.tools/def-tool
   promethean.ollama.agents/def-agent   clj-kondo.hooks.promethean.ollama.agents/def-agent
   promethean.benchmark.dsl/defcase     clj-kondo.hooks.promethean.benchmark.dsl/defcase
   promethean.benchmark.dsl/defsuite    clj-kondo.hooks.promethean.benchmark.dsl/defsuite}}

 ;; Keep these DSL forms from spamming "unused value" warnings.
 ;; (They are intentionally declarative.)
 :config-in-call
 {promethean.ollama.agents/def-agent
  {:linters {:unused-value {:level :off}}}

  promethean.benchmark.dsl/defcase
  {:linters {:unused-value {:level :off}}}

  promethean.benchmark.dsl/defsuite
  {:linters {:unused-value {:level :off}}}}

 ;; Optional fallback if hooks aren’t loaded for some reason
 :lint-as
 {promethean.benchmark.dsl/defcase  clojure.core/def
  promethean.benchmark.dsl/defsuite clojure.core/def
  promethean.ollama.agents/def-agent clojure.core/def}}
```

> `:config-in-call` is the secret sauce for “this is declarative, stop yelling”.

---

# 2) Hook: `def-tool` (same idea, but slightly smarter)

**`.clj-kondo/hooks/clj_kondo/hooks/promethean/ollama/tools.clj`**

```clj
(ns clj-kondo.hooks.promethean.ollama.tools
  (:require
    [clj-kondo.hooks-api :as api]
    [clojure.string :as str]))

(defn- find-impl-form
  "Find (impl [args] ...) or (run [args] ...) in def-tool body."
  [forms]
  (some (fn [f]
          (when (and (seq? f) (#{'impl 'run} (first f)))
            f))
        forms))

(defn- join-body [body]
  (if (seq body)
    (str/join " " (map pr-str body))
    "nil"))

(defn def-tool
  "Rewrite:
    (def-tool name ... (impl [args] body...))
  into:
    (do
      (def name nil)
      (defn name__impl [args] body...))

  This makes:
  - the tool var exist (no unresolved symbol)
  - the impl body lint like normal code (bindings, etc)"
  [{:keys [node]}]
  (let [[_ tool-name & forms] (api/sexpr node)
        impl (find-impl-form forms)
        def-part (str "(def " tool-name " nil)")
        impl-part (when impl
                    (let [[_ argv & body] impl
                          impl-name (symbol (str tool-name "__impl"))]
                      (str " (defn " impl-name " " (pr-str argv) " "
                           (join-body body) ")")))
        rewritten (str "(do " def-part (or impl-part "") ")")]
    {:node (api/parse-string rewritten)}))
```

This one intentionally **ignores** the directive DSL (`params`, `bench`, etc).
That keeps kondo from trying to “evaluate” your declarative forms.

---

# 3) Hook: `def-agent` (rewrite into a real-ish map)

This version stops unused-value noise *and* gives kondo a concrete structure.

**`.clj-kondo/hooks/clj_kondo/hooks/promethean/ollama/agents.clj`**

```clj
(ns clj-kondo.hooks.promethean.ollama.agents
  (:require
    [clj-kondo.hooks-api :as api]
    [clojure.string :as str]))

(defn- directive-val [forms sym]
  (some (fn [f]
          (when (and (seq? f) (= sym (first f)))
            (second f)))
        forms))

(defn- directive-rest [forms sym]
  (some (fn [f]
          (when (and (seq? f) (= sym (first f)))
            (rest f)))
        forms))

(defn- tool->name [t]
  (cond
    (string? t) t
    (keyword? t) (name t)
    (symbol? t) (name t)
    :else (str t)))

(defn def-agent
  "Rewrite:
    (def-agent mathy (model \"qwen3\") (tools add mul) ...)
  into:
    (def mathy {:name \"mathy\" :model \"qwen3\" ...})

  We keep tool refs as strings in the rewritten map to avoid false unresolved
  warnings when tools live elsewhere."
  [{:keys [node]}]
  (let [[_ agent-name & forms] (api/sexpr node)
        model (directive-val forms 'model)
        instructions (or (directive-val forms 'instructions) "")
        think (directive-val forms 'think)
        options (directive-val forms 'options)
        max-steps (directive-val forms 'max-steps)
        timeout-ms (directive-val forms 'timeout-ms)
        tools-form (directive-rest forms 'tools)
        tool-names (when (seq tools-form) (vec (map tool->name tools-form)))

        m (cond-> {:name (name agent-name)
                   :model model
                   :instructions instructions}
            (some? tool-names) (assoc :tools tool-names)
            (some? think) (assoc :think think)
            (some? options) (assoc :options options)
            (some? max-steps) (assoc :max-steps max-steps)
            (some? timeout-ms) (assoc :timeout-ms timeout-ms))

        rewritten (str "(def " agent-name " " (pr-str m) ")")]
    {:node (api/parse-string rewritten)}))
```

Result: `def-agent` becomes something that looks like **actual data**, which is what it is.

---

# 4) Hooks: `defcase` + `defsuite` (no more “unused value” hell)

### `defcase` → rewrite into a merged map

### `defsuite` → rewrite into a vector of entries

**`.clj-kondo/hooks/clj_kondo/hooks/promethean/benchmark/dsl.clj`**

```clj
(ns clj-kondo.hooks.promethean.benchmark.dsl
  (:require
    [clj-kondo.hooks-api :as api]))

(defn- find-id [forms]
  (some (fn [f]
          (when (and (seq? f) (= 'id (first f)))
            (second f)))
        forms))

(defn defcase
  "Rewrite:
    (defcase nm (prompt ...) (expect ...) ...)
  into:
    (def nm (merge {:id \"...\"} ...))

  This makes it look like real data-building code."
  [{:keys [node]}]
  (let [[_ nm & forms] (api/sexpr node)
        cid (or (find-id forms) (str (name nm)))
        ;; merge keeps the structure “real” and avoids unused-value warnings
        rewritten (str "(def " nm " (merge {:id " (pr-str cid) "} "
                       (clojure.string/join " " (map pr-str forms))
                       "))")]
    {:node (api/parse-string rewritten)}))

(defn defsuite
  "Rewrite:
    (defsuite suite a b (case ...))
  into:
    (def suite [a b (case ...)])

  This preserves symbol resolution for a/b."
  [{:keys [node]}]
  (let [[_ nm & entries] (api/sexpr node)
        rewritten (str "(def " nm " [" (clojure.string/join " " (map pr-str entries)) "])")]
    {:node (api/parse-string rewritten)}))
```

Now kondo sees:

* “this is a map”
* “this is a vector”
* symbols inside suites resolve normally

…and you stop getting spammed.

---

# 5) Ship this as a library export (recommended)

If you want all repos in your ecosystem to just “get it” automatically:

```
resources/
  clj-kondo.exports/
    octave-commons/
      promethean/
        config.edn
        hooks/...
```

**`resources/clj-kondo.exports/octave-commons/promethean/config.edn`**

```clj
{:hooks
 {:analyze-call
  {promethean.ollama.tools/def-tool     clj-kondo.hooks.promethean.ollama.tools/def-tool
   promethean.ollama.agents/def-agent   clj-kondo.hooks.promethean.ollama.agents/def-agent
   promethean.benchmark.dsl/defcase     clj-kondo.hooks.promethean.benchmark.dsl/defcase
   promethean.benchmark.dsl/defsuite    clj-kondo.hooks.promethean.benchmark.dsl/defsuite}}

 :config-in-call
 {promethean.ollama.agents/def-agent {:linters {:unused-value {:level :off}}}
  promethean.benchmark.dsl/defcase    {:linters {:unused-value {:level :off}}}
  promethean.benchmark.dsl/defsuite   {:linters {:unused-value {:level :off}}}}}
```

Then any project that depends on your lib automatically gets these hooks.

---

# 6) Quick verification commands

Run kondo with your local config:

```bash
clj-kondo --lint src:test --config .clj-kondo/config.edn
```

If you ship exports, you can usually just:

```bash
clj-kondo --lint src:test
```

---

# 7) One small code tweak (public helper)

If you want tool-name normalization used outside the ns (agents/cases), make it public:

```clj
;; in promethean.ollama.tools
(defn normalize-tool-name [x] ...)
```

---

If you want the *next* step: I can add **kondo hooks for your future “sugar macros”** (like `=>`, `cases`, `deftools`, `->agent`) so you can go even more “agent sdk”-ish without kondo getting confused.
