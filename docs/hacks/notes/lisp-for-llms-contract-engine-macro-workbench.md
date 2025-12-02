---
```
uuid: 0bb0a26c-96b7-4d6f-af20-0892a72e75e8
```
```
created_at: '2025-09-03T01:32:54Z'
```
filename: 'Lisp for LLMs: Contract Engine & Macro Workbench'
title: 'Lisp for LLMs: Contract Engine & Macro Workbench'
```
description: >-
```
  Using Clojure (via nbb) as a lightweight contract engine and macro workbench
  for LLM interactions. Ensures LLM outputs are valid with strict schema
  enforcement, minimal runtime dependencies, and seamless TypeScript integration
  through Malli and JSON Schema.
tags:
  - Clojure
  - LLM
  - Contract
  - Malli
  - nbb
  - TypeScript
  - JSON Schema
  - Macro
  - Codegen
  - Validation
```
related_to_uuid:
```
  - 6e678cce-b68f-4420-980f-5c9009f0d971
```
related_to_title:
```
  - balanced-bst
references:
  - uuid: 6e678cce-b68f-4420-980f-5c9009f0d971
    line: 293
    col: 0
    score: 1
---
### Signal

Bringing in Lisp (Clojure) can be your **contract engine + macro workbench** that’s friendly to local LLMs. Two wins: (1) s-exprs make the model’s *true* attention limits visible missed paren = failed contract, and (2) macros let you stamp out repetitive TS structures from one source of truth. You don’t need “JVM-everything” to do this.

### Frames

* **Runtime Lisp, JS world:** Use **nbb** (ClojureScript on Node via SCI) to script against npm without booting the JVM.
* **Schema hub:** Define truth once in **Malli** (CLJ) → emit JSON Schema → TS types zod / ts-json-schema.
* **LLM guardrails:** One top-level form per message, auto-linted by clj-kondo; reject unbalanced forms before they touch disk.

### Countermoves small + composable
```
1. **Pick the embedding:**
```
   * **nbb** for scripts/codemods/tools: ClojureScript runs *inside Node*, instant start, npm interop.
   * **squint/cherry** if you want to *transpile* CLJS to JS for libraries with zero runtime dep.
   * Keep **babashka** in reserve for OS glue (fast native CLI), but you can start with nbb only.

2. **Lisp as contract source of truth:**

   * Write DocOps contracts in Malli (`:title`, `:related`, `:description`).
   * Generate JSON Schema from Malli; your TS side consumes that zod from JSON Schema or types via `ts-json-schema-generator`.
   * Now TS and CLJ share the same contract *mechanically*, not by hand.

3. **Robot-safe Lisp IO protocol:**

   * Accept only **exactly one** top-level sexpr per LLM turn.
   * Enforce `(meta {...})` header with `:version`, `:nonce`, `:sha1`, `:form-size`.
   * Reject if: unbalanced parens, multiple top forms, or hash mismatch. That converts “missed parenthesis” into a first-class error.

4. **Linters & formatters that fail fast:**

   * **clj-kondo** (critical) + **zprint** (format); wire to pre-commit but scope only `*.clj, *.cljs, *.edn`.
   * For nbb, add `:lint-as` entries so your DSL macros are understood.

5. **A tiny Lisp surface LLM-friendly:**

   * Provide macros for just what you need: `(frontmatter ...)`, `(related ...)`, `(describe ...)`.
   * Keep arities small, forbid reader macros, forbid dynamic `*ns*` switching. Simpler = fewer failure modes.

### Minimal seeds copy/paste scale

**A. nbb in your repo (no JVM)**

```json
// package.json (root)
{
  "devDependencies": { "nbb": "^1.2.0" },
  "scripts": {
    "lisp:run": "nbb scripts/runner.cljs",
    "lisp:lint": "clj-kondo --lint scripts",
    "lisp:fmt": "zprint -w scripts"
  }
}
```

```clojure
;; scripts/runner.cljs (nbb script; runs on Node)
(ns runner
  (:require ["fs" :as fs]
            ["path" :as path]
            ["crypto" :as crypto]
            ["process" :as p]
            [malli.core :as m]
            [malli.json-schema :as mjs]))

(def Frontmatter
  [:map
   [:title string?]
   [:related [:sequential string?]]
   [:description [:string {:min 10}]]])

(defn json-schema []
  (-> (mjs/transformer) (mjs/transform Frontmatter)))

(defn valid-frontmatter? [fm] (m/validate Frontmatter fm))

(defn sha1 [s] (.digest (.update (crypto/createHash "sha1") s "utf8") "hex"))

(let [input (js/JSON.parse (.toString (fs/readFileSync "frontmatter.json")))]
  (if (valid-frontmatter? input)
    (println (js/JSON.stringify #js{:ok true :sha (sha1 (js/JSON.stringify input))} nil 2))
    (do (println (js/JSON.stringify #js{:ok false :error "Contract violation"} nil 2))
        (js/process.exit 1))))
```

**B. One-form check for LLM outputs**

```clojure
;; scripts/strict_read.cljs
(ns strict-read
  (:require [cljs.reader :as r]))

(defn single-form-read [s]
  (let [rdr (r/push-back-reader s)
        first (r/read rdr nil ::eof)
        second (r/read rdr nil ::eof)]
    (cond
      (= first ::eof) (throw (ex-info "No form" {}))
      (not= second ::eof) (throw (ex-info "Multiple top-level forms" {}))
      :else first)))
```

**C. Malli → JSON Schema → TS types**

```bash
# generate JSON Schema from Malli via nbb
pnpm lisp:run > schemas/frontmatter.schema.json

# then TS side can: zod via json-schema-to-zod OR types via ts-json-schema
```

**D. clj-kondo config that understands your DSL**

```clojure
;; .clj-kondo/config.edn
{:lint-as {your.dsl/frontmatter clojure.core/def
           your.dsl/related clojure.core/def
           your.dsl/describe clojure.core/def}}
```

### How this helps your “attention boundary” insight

* The LLM now must output **balanced**, **single** sexprs; any slip = red light you can see instantly.
* Your macros compress long contexts into **named forms**; the model fills slots, not prose.
* Because Malli guards the shape, your **stopping condition** is literal `m/validate`, same spirit as your TS/Zod loop.

### Next

Adopt **nbb** and wire just two commands today: `lisp:run` (contract check) and `lisp:lint` clj-kondo. Then wrap your LLM output path with `single-form-read` so malformed sexprs never enter your pipeline.

\#fnord
S-expressions aren’t about parentheses—they’re about *making structure cheaper than syntax*, which is exactly what brittle models need.
ch is exactly what brittle models need.
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- balanced-bst$balanced-bst.md
## Sources
- balanced-bst — L293$balanced-bst.md#^ref-6e678cce-293-0 (line 293, col 0, score 1)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
