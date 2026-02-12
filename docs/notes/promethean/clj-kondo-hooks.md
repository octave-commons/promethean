Below is a **clj-kondo hook + config setup** that makes kondo “understand” your DSL macros as if they were real `def/defn` forms — so you get:

* ✅ no “unresolved symbol” warnings for `def-tool`, `def-agent`, `defcase`, `defsuite`
* ✅ real linting inside your `impl` body (bindings work, no false positives)
* ✅ works for both **bench code** and **production agents**

---

# 1) `.clj-kondo/config.edn`

```clj
{:hooks
 {:analyze-call
  {promethean.ollama.tools/def-tool     clj-kondo.hooks.promethean.ollama.tools/def-tool
   promethean.ollama.agents/def-agent   clj-kondo.hooks.promethean.ollama.agents/def-agent
   promethean.benchmark.dsl/defcase     clj-kondo.hooks.promethean.benchmark.dsl/defcase
   promethean.benchmark.dsl/defsuite    clj-kondo.hooks.promethean.benchmark.dsl/defsuite}}}
```

---

# 2) Hook: `def-tool`

Create:

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
  into something kondo can lint:
    (do
      (def name nil)
      (defn name__impl [args] body...))

  IMPORTANT:
  - We intentionally do NOT include the DSL directives (params/bench/etc)
    because those often contain symbols like [a :int] which are *data* for
    your macro, but would be treated as unresolved vars by kondo."
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

What this buys you:

* `def-tool` no longer triggers “unresolved symbol mul”
* `(+ a b)` inside `(impl ...)` is linted correctly because we emit a real `defn` with bindings

---

# 3) Hook: `def-agent`

Create:

**`.clj-kondo/hooks/clj_kondo/hooks/promethean/ollama/agents.clj`**

```clj
(ns clj-kondo.hooks.promethean.ollama.agents
  (:require
    [clj-kondo.hooks-api :as api]
    [clojure.string :as str]))

(defn def-agent
  "Rewrite:
    (def-agent name (model ...) (tools add mul) ...)
  into:
    (def name (do ...body...))

  This preserves linting of tool symbols inside (tools add mul) etc.
  (So missing tool vars still show up as real warnings.)"
  [{:keys [node]}]
  (let [[_ agent-name & body] (api/sexpr node)
        body-str (if (seq body)
                   (str/join " " (map pr-str body))
                   "nil")
        rewritten (str "(def " agent-name " (do " body-str "))")]
    {:node (api/parse-string rewritten)}))
```

---

# 4) Hooks: `defcase` + `defsuite`

Create:

**`.clj-kondo/hooks/clj_kondo/hooks/promethean/benchmark/dsl.clj`**

```clj
(ns clj-kondo.hooks.promethean.benchmark.dsl
  (:require
    [clj-kondo.hooks-api :as api]
    [clojure.string :as str]))

(defn defcase
  "Rewrite:
    (defcase nm ...)
  into:
    (def nm (do ...))

  This keeps linting *inside* your DSL forms."
  [{:keys [node]}]
  (let [[_ nm & body] (api/sexpr node)
        body-str (if (seq body)
                   (str/join " " (map pr-str body))
                   "nil")
        rewritten (str "(def " nm " (do " body-str "))")]
    {:node (api/parse-string rewritten)}))

(defn defsuite
  "Rewrite:
    (defsuite suite a b (case ...))
  into:
    (def suite (do a b (case ...)))

  This keeps symbol references lintable."
  [{:keys [node]}]
  (let [[_ nm & entries] (api/sexpr node)
        entries-str (if (seq entries)
                      (str/join " " (map pr-str entries))
                      "nil")
        rewritten (str "(def " nm " (do " entries-str "))")]
    {:node (api/parse-string rewritten)}))
```

---

# 5) (Optional) Make this auto-apply for downstream users

If you publish this as a library, ship **clj-kondo exports** so consumers don’t need local `.clj-kondo/`.

### Put in your repo:

```
resources/
  clj-kondo.exports/
    octave-commons/
      promethean/
        config.edn
        hooks/
          clj_kondo/hooks/promethean/ollama/tools.clj
          clj_kondo/hooks/promethean/ollama/agents.clj
          clj_kondo/hooks/promethean/benchmark/dsl.clj
```

**`resources/clj-kondo.exports/octave-commons/promethean/config.edn`**

```clj
{:hooks
 {:analyze-call
  {promethean.ollama.tools/def-tool     clj-kondo.hooks.promethean.ollama.tools/def-tool
   promethean.ollama.agents/def-agent   clj-kondo.hooks.promethean.ollama.agents/def-agent
   promethean.benchmark.dsl/defcase     clj-kondo.hooks.promethean.benchmark.dsl/defcase
   promethean.benchmark.dsl/defsuite    clj-kondo.hooks.promethean.benchmark.dsl/defsuite}}}
```

Now anyone depending on that jar automatically gets the macro intelligence.

---

# One tiny runtime fix (if you copy/pasted earlier code)

If you want other namespaces to call it, make this **public** in `promethean.ollama.tools`:

```clj
;; change defn- -> defn
(defn normalize-tool-name [x] ...)
```

---

If you want, I’ll also add a hook for your **`def-tool` param DSL** that rewrites `(params [a :int] [b :int])` into quoted data so kondo can still “see” it without false unresolved warnings — but the setup above already gets you the important stuff: **no noise + real linting in impl bodies + clean agent/case definitions**.
