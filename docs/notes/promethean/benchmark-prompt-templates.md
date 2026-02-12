Cool — let’s make **prompt templates first-class**, validated with **`clojure.spec.alpha`**, and have `casegen` *prefer* them so your “unknown tools” become **real tool-choice reasoning tests**, not just “call this tool with args”.

Below is a **full file replacement** for `casegen.clj` that adds:

* ✅ `:bench/prompt-templates` support on tools
* ✅ spec validation (`clojure.spec.alpha`)
* ✅ template-driven `:choose` cases (optionally with `:final`)
* ✅ mixes templates + inferred cases (configurable)
* ✅ still compatible with **auto-decoys**

---

# Replace `casegen.clj` (templates + spec validation)

**`cache/benchmark/src/promethean/benchmark/casegen.clj`**

```clj
(ns promethean.benchmark.casegen
  "Automatic case generation for tool-choice benchmarks.

  NEW: Tools can provide validated templates via :bench/prompt-templates.

  Tool metadata shape (recommended):
    {:domain :math
     :tags #{:math :arithmetic}
     :bench/prompt-templates
     [{:id \"mul/basic\"
       :prompt \"Compute 7 times 9.\"
       :args {:a 7 :b 9}
       :final {:contains \"63\"}
       :policy :best}]}

  The generator will prefer templates first, then fill with inferred/fallback cases.

  Designed to combine with auto-decoys:
    - generated cases omit :tools by default
    - runner injects decoys for choose-cases when --auto-decoys true"
  (:require
    [clojure.spec.alpha :as s]
    [clojure.string :as str]
    [promethean.benchmark.tools :as tools]))

;; ----------------------------
;; Specs (core alpha validation)
;; ----------------------------

(s/def ::id string?)
(s/def ::prompt string?)
(s/def ::system string?)
(s/def ::messages vector?)
(s/def ::policy keyword?)

(s/def ::args map?)
(s/def ::arguments-subset map?)

(s/def ::contains string?)
(s/def ::regex string?)
(s/def ::final (s/keys :opt-un [::contains ::regex]))

(s/def ::tools
  (s/coll-of (s/or :s string? :k keyword? :sym symbol?) :kind vector?))

(s/def ::wrong_first_penalty number?)
(s/def ::extra_calls_penalty number?)
(s/def ::no_extras boolean?)

;; prompt template = one concrete case for a tool
(s/def ::prompt-template
  (s/keys :opt-un [::id ::prompt ::messages ::system ::args ::arguments-subset ::final ::tools
                   ::policy ::wrong_first_penalty ::extra_calls_penalty ::no_extras]))

(s/def ::prompt-templates
  (s/coll-of ::prompt-template :kind vector?))

(defn- explain-spec [spec x]
  (with-out-str (s/explain spec x)))

(defn- validate-templates!
  "Validate tool templates early so failures are obvious."
  [tool]
  (let [ts (:bench/prompt-templates tool)]
    (when (some? ts)
      (when-not (s/valid? ::prompt-templates ts)
        (throw (ex-info "Invalid :bench/prompt-templates on tool"
                        {:tool (:name tool)
                         :explain (explain-spec ::prompt-templates ts)}))))
    true))

;; ----------------------------
;; Defaults
;; ----------------------------

(def default-gen-config
  {:seed 1
   :n-per-tool 2

   ;; template behavior
   :use-templates? true
   :templates-only? false           ;; if true, ONLY templates generate choose-cases
   :max-templates-per-tool 999      ;; cap if you want sampling

   ;; final expectations
   :include-final-expect? true
   :compute-final? true

   ;; fallback:
   ;;   :direct -> generate "call tool X with these args"
   ;;   :skip   -> no choose-case for unknown tool
   :fallback-mode :direct

   ;; numeric arg ranges for inferred arithmetic
   :int-min 1
   :int-max 20})

(defn- normalize-tool-name [x]
  (cond
    (string? x) x
    (keyword? x) (name x)
    (symbol? x) (name x)
    (map? x) (:name x)
    :else (str x)))

(defn- tool-domain [tool]
  (let [d (:domain tool)]
    (cond
      (keyword? d) d
      (string? d) (keyword d)
      (nil? d) nil
      :else (keyword (str d)))))

(defn- tool-tags [tool]
  (let [tags (:tags tool)]
    (cond
      (set? tags) tags
      (sequential? tags) (set tags)
      (keyword? tags) #{tags}
      (nil? tags) #{}
      :else #{})))

(defn- schema-required [tool]
  (let [p (:parameters tool)]
    (cond
      (vector? (:required p)) (:required p)
      (sequential? (:required p)) (vec (:required p))
      (vector? (get p "required")) (vec (get p "required"))
      (sequential? (get p "required")) (vec (get p "required"))
      :else [])))

(defn- schema-properties [tool]
  (let [p (:parameters tool)]
    (or (:properties p)
        (get p "properties")
        {})))

(defn- prop-type [prop-schema]
  (or (:type prop-schema)
      (get prop-schema "type")))

(defn- numeric-prop? [prop-schema]
  (let [t (prop-type prop-schema)]
    (or (= t :integer)
        (= t :number)
        (= t "integer")
        (= t "number"))))

(defn- string-prop? [prop-schema]
  (let [t (prop-type prop-schema)]
    (or (= t :string)
        (= t "string"))))

(defn- keywordize [x]
  (cond
    (keyword? x) x
    (string? x) (keyword x)
    (symbol? x) (keyword (name x))
    :else (keyword (str x))))

(defn- rng [seed tool-name i]
  (java.util.Random. (long (hash [seed tool-name i]))))

(defn- rand-int-range [^java.util.Random r a b]
  (let [lo (long (min a b))
        hi (long (max a b))
        span (max 1 (inc (- hi lo)))]
    (+ lo (.nextInt r (int span)))))

(defn- infer-op-kind
  "Guess arithmetic/search kind from tool name and tags."
  [tool]
  (let [nm (str/lower-case (:name tool))
        tags (tool-tags tool)
        domain (tool-domain tool)]
    (cond
      (or (contains? tags :add)
          (str/includes? nm "add")
          (str/includes? nm "sum")
          (str/includes? nm "plus")) :add

      (or (contains? tags :mul)
          (str/includes? nm "mul")
          (str/includes? nm "times")
          (str/includes? nm "multiply")) :mul

      (or (contains? tags :sub)
          (str/includes? nm "sub")
          (str/includes? nm "minus")
          (str/includes? nm "diff")) :sub

      (or (contains? tags :div)
          (str/includes? nm "div")) :div

      (or (contains? tags :search)
          (= domain :search)
          (str/includes? nm "search")) :search

      :else nil)))

(defn- pick-numeric-params [tool]
  (let [req (mapv keywordize (schema-required tool))
        props (schema-properties tool)]
    (->> req
         (filter (fn [k]
                   (numeric-prop? (or (get props (name k))
                                      (get props k)))))
         vec)))

(defn- pick-string-params [tool]
  (let [req (mapv keywordize (schema-required tool))
        props (schema-properties tool)]
    (->> req
         (filter (fn [k]
                   (string-prop? (or (get props (name k))
                                     (get props k)))))
         vec)))

(defn- make-math-args [tool cfg ^java.util.Random r]
  (let [nums (pick-numeric-params tool)
        akey (first nums)
        bkey (second nums)]
    (when (and akey bkey)
      {akey (rand-int-range r (:int-min cfg) (:int-max cfg))
       bkey (rand-int-range r (:int-min cfg) (:int-max cfg))})))

(defn- make-search-args [tool ^java.util.Random r]
  (let [sparams (pick-string-params tool)
        qk (first sparams)]
    (when qk
      {qk (nth ["clojure spec alpha"
                "ollama tool calling benchmark"
                "vector similarity search"
                "promethean project architecture"
                "Clojure macros for DSLs"]
               (.nextInt r 5))})))

(defn- mk-math-prompt [kind args]
  (let [[a b] (vals args)]
    (case kind
      :add (format "What is %d plus %d? Use tools if available." a b)
      :mul (format "Compute %d times %d. Use tools if available." a b)
      :sub (format "Compute %d minus %d. Use tools if available." a b)
      :div (format "Compute %d divided by %d. Use tools if available." a b)
      (format "Compute a result from %s. Use tools if available." (pr-str args)))))

(defn- mk-search-prompt [args]
  (let [q (first (vals args))]
    (format "Search for: %s. Use the best available search tool." (pr-str q))))

(defn- maybe-final-expect [kind args cfg]
  (when (and (:include-final-expect? cfg)
             (:compute-final? cfg)
             (map? args)
             (#{:add :mul :sub :div} kind))
    (let [[a b] (vals args)
          v (case kind
              :add (+ a b)
              :mul (* a b)
              :sub (- a b)
              :div (when-not (zero? b) (long (/ a b)))
              nil)]
      (when (some? v)
        {:final {:contains (str v)}}))))

(defn- choose-expect
  "Build :expect {:choose ...} for a specific tool call."
  [tool args {:keys [policy wrong_first_penalty extra_calls_penalty]}]
  {:choose (cond-> {:tool (:name tool)
                    :arguments-subset args
                    :policy (or policy :best)}
            (some? wrong_first_penalty) (assoc :wrong_first_penalty wrong_first_penalty)
            (some? extra_calls_penalty) (assoc :extra_calls_penalty extra_calls_penalty))})

(defn- fallback-direct-prompt [tool args]
  {:prompt (str "Use the tool \"" (:name tool) "\" with exactly these arguments:\n"
                (pr-str args)
                "\n\nDo not answer directly. Use a tool call.")})

(defn- required-args-default
  "Best-effort args map for required fields."
  [tool cfg ^java.util.Random r]
  (let [req (mapv keywordize (schema-required tool))
        props (schema-properties tool)]
    (into {}
          (map (fn [k]
                 (let [ps (or (get props (name k)) (get props k))
                       v (cond
                           (numeric-prop? ps) (rand-int-range r (:int-min cfg) (:int-max cfg))
                           (string-prop? ps) "example"
                           :else "example")]
                   [k v]))
               req))))

;; -----------------------------------
;; Template -> case (the important bit)
;; -----------------------------------

(defn- template->case
  "Convert one tool template into a benchmark case."
  [tool idx template]
  (let [tool-name (:name tool)
        tmpl-id (:id template)
        case-id (or tmpl-id (str "tmpl/" tool-name "/" idx))
        args (or (:args template) {})
        args-subset (or (:arguments-subset template) args)
        policy (:policy template)
        wrong-first-penalty (:wrong_first_penalty template)
        extra-calls-penalty (:extra_calls_penalty template)
        no-extras (:no_extras template)]
    (cond-> {:id case-id
             :prompt (:prompt template)
             :messages (:messages template)
             :system (:system template)
             :tools (:tools template) ;; optional explicit exposure override
             :expect (merge
                       (choose-expect tool args-subset
                                      {:policy policy
                                       :wrong_first_penalty wrong-first-penalty
                                       :extra_calls_penalty extra-calls-penalty})
                       (when (:final template) {:final (:final template)}))
             :generated {:mode :template
                         :tool tool-name}}
      (some? no-extras) (assoc-in [:expect :no_extras] no-extras))))

(defn- tool-templates
  "Return validated templates vector for a tool (or [])."
  [tool]
  (validate-templates! tool)
  (let [ts (:bench/prompt-templates tool)]
    (cond
      (vector? ts) ts
      (nil? ts) []
      :else [])))

;; -----------------------------------
;; Inferred/fallback choose-case gen
;; -----------------------------------

(defn- gen-one-inferred-case
  [tool cfg i]
  (let [tool-name (:name tool)
        r (rng (:seed cfg) tool-name i)
        kind (infer-op-kind tool)
        args (cond
               (#{:add :mul :sub :div} kind) (make-math-args tool cfg r)
               (= :search kind) (make-search-args tool r)
               :else nil)]
    (cond
      (and args kind)
      (let [prompt (cond
                     (#{:add :mul :sub :div} kind) (mk-math-prompt kind args)
                     (= :search kind) (mk-search-prompt args)
                     :else (:prompt (fallback-direct-prompt tool args)))]
        {:id (str "gen/" tool-name "/" i)
         :prompt prompt
         :expect (merge
                   (choose-expect tool args
                                  {:policy :best
                                   :wrong_first_penalty 0.70
                                   :extra_calls_penalty 0.80})
                   (maybe-final-expect kind args cfg))
         :generated {:mode :inferred
                     :kind kind
                     :tool tool-name}})

      (= :direct (:fallback-mode cfg))
      (let [args2 (required-args-default tool cfg r)]
        {:id (str "gen/" tool-name "/" i)
         :prompt (:prompt (fallback-direct-prompt tool args2))
         :expect (choose-expect tool args2
                                {:policy :best
                                 :wrong_first_penalty 0.70
                                 :extra_calls_penalty 0.80})
         :generated {:mode :fallback
                     :kind :direct
                     :tool tool-name}})

      :else
      nil)))

;; ----------------------------
;; Public API
;; ----------------------------

(defn generate-choose-cases
  "Generate choose cases for all registered tools.

  Precedence per tool:
    templates (if enabled) -> inferred/fallback to fill remaining

  Config keys:
    :use-templates?
    :templates-only?
    :max-templates-per-tool
    :n-per-tool  ;; total desired cases per tool (templates count toward this)

  Returns vector of cases (nil removed)."
  ([]
   (generate-choose-cases default-gen-config))
  ([config]
   (let [cfg (merge default-gen-config config)
         n (max 1 (long (:n-per-tool cfg)))]
     (->> (tools/tools)
          (mapcat
            (fn [t]
              (let [tname (:name t)
                    tmpl (if (:use-templates? cfg) (tool-templates t) [])
                    tmpl* (vec (take (:max-templates-per-tool cfg) tmpl))
                    tmpl-cases (mapv (fn [idx tm] (template->case t idx tm))
                                     (range (count tmpl*)) tmpl*)
                    remaining (max 0 (- n (count tmpl-cases)))
                    inferred (if (:templates-only? cfg)
                               []
                               (keep identity
                                     (map (fn [i] (gen-one-inferred-case t cfg i))
                                          (range remaining))))]
                (vec (concat tmpl-cases inferred)))))
          vec))))

(defn generate-none-cases
  "Generate 'should NOT call tools' control cases."
  ([] (generate-none-cases {:seed 1}))
  ([{:keys [seed] :or {seed 1}}]
   (let [r (java.util.Random. (long seed))
         prompts ["Say hello in one sentence."
                  "Write a short haiku about rain."
                  "Explain what a hashmap is in plain language."
                  "What is 2 + 2? (Answer directly.)"
                  "Give me a one-line joke."]]
     (mapv (fn [i]
             {:id (str "gen/none/" i)
              :prompt (nth prompts (.nextInt r (count prompts)))
              :expect {:none true}
              :generated {:mode :none}})
           (range 5)))))

(defn generate-suite
  "Generate a full suite:
    {:choose [...] :none [...] :all [...]}

  Input config:
    {:choose-config {...} :include-none? true :none-seed 1}"
  [{:keys [choose-config include-none? none-seed]
    :or {include-none? true
         none-seed 1}}]
  (let [choose (generate-choose-cases (or choose-config {}))
        none   (if include-none? (generate-none-cases {:seed none-seed}) [])
        all    (vec (concat choose none))]
    {:choose choose :none none :all all}))
```

---

# Tool-side usage: add `:bench/prompt-templates`

You don’t need any other wiring **as long as your `tools/tools` registry preserves those keys** (which it *should* if you store the tool metadata map as-is).

Example:

```clj
(def-tool mul
  {:description "Multiply two integers"
   :domain :math
   :tags #{:math :mul :arithmetic}

   :bench/prompt-templates
   [{:id "mul/simple-7x9"
     :prompt "Compute 7 times 9. Use tools if available."
     :args {:a 7 :b 9}
     :final {:contains "63"}
     :policy :best
     :no_extras true}]}

  [{:keys [a b]}]
  (* a b))
```

That will produce a **real** tool-choice case (and then decoys can be injected).

---

# Recommended run (generated + template-first + auto-decoys)

```bash
clj -M -m promethean.benchmark.bench.tool-calling \
  --host http://localhost:11434 \
  --model qwen3 \
  --tools ./tools.clj \
  --generate true \
  --gen-config '{:choose-config {:n-per-tool 3
                                :use-templates? true
                                :templates-only? false
                                :seed 7}
                :include-none? true
                :none-seed 99}' \
  --auto-decoys true \
  --decoy-config '{:n-total 8 :same-domain 3 :powerful 1 :noise 3 :seed 42}' \
  --choose-policy best \
  --penalize-extra-calls true \
  --out ./tool_calling_results.json
```

---

# Why this is the unlock

Now **every tool can define “what it means”** in benchmark terms:

* natural prompts
* known correct arguments
* optional final assertions
* and still gets decoy pressure automatically

So your benchmark shifts from *“tool calling format”* → *“tool selection and execution under ambiguity”*.

---

If you want the next step, I’d do **template macros** so authors don’t write verbose maps, e.g.

```clj
(def-template mul "Compute 7 times 9" {:a 7 :b 9} "63")
```

…and it expands into the `:bench/prompt-templates` shape + spec validation.
