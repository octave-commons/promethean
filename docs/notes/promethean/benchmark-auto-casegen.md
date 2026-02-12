Yep. Next tier: **auto-generate tool-choice cases** from the tool registry (plus optional “no tool” control cases), and let **auto-decoys** do the pressure test.

You’ll get a new shared namespace:

* ✅ `promethean.benchmark.casegen`

  * Generates `:expect {:choose ...}` cases programmatically
  * Uses tool `:domain`, `:tags`, and schema to make “natural-ish” prompts when possible
  * Falls back to “call tool X with args Y” when it can’t infer semantics

And then we wire it into the runner:

* ✅ `--generate true`
* ✅ `--gen-config '{...}'`
* ✅ works with `--auto-decoys true`

---

# 1) New namespace: `promethean.benchmark.casegen`

**`cache/benchmark/src/promethean/benchmark/casegen.clj`**

```clj
(ns promethean.benchmark.casegen
  "Automatic case generation for tool-choice benchmarks.

  Generates :choose cases from the registered tool set.

  Works best when tools include:
    :domain :math | :search | :io | ...
    :tags   #{:math :arithmetic :powerful ...}

  It tries to infer a natural prompt + args for common patterns (math/search).
  If it can't infer semantics, it falls back to a direct instruction case:
    \"Use tool NAME with exactly these args ...\"

  You can combine with auto-decoys:
    - omit :tools from generated cases
    - runner will inject a decoy toolset per case"
  (:require
    [clojure.string :as str]
    [promethean.benchmark.tools :as tools]))

(def default-gen-config
  {:seed 1
   :n-per-tool 2
   :include-final-expect? true

   ;; If we can compute a stable final answer, we add :final {:contains "..."}.
   ;; Only safe for simple arithmetic by default.
   :compute-final? true

   ;; when we cannot infer semantics for a tool:
   ;;   :direct -> generate "call this tool with args" prompt
   ;;   :skip   -> do not generate choose cases for this tool
   :fallback-mode :direct

   ;; numeric arg ranges for generated arithmetic
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

(defn- rand-int-range [^java.util.Random r a b]
  (let [lo (long (min a b))
        hi (long (max a b))
        span (max 1 (inc (- hi lo)))]
    (+ lo (.nextInt r (int span)))))

(defn- rng [seed tool-name i]
  (java.util.Random. (long (hash [seed tool-name i]))))

(defn- infer-op-kind
  "Guess arithmetic/search kind from tool name and tags."
  [tool]
  (let [name (str/lower-case (:name tool))
        tags (tool-tags tool)
        domain (tool-domain tool)]
    (cond
      (or (contains? tags :add)
          (str/includes? name "add")
          (str/includes? name "sum")
          (str/includes? name "plus")) :add

      (or (contains? tags :mul)
          (str/includes? name "mul")
          (str/includes? name "times")
          (str/includes? name "multiply")) :mul

      (or (contains? tags :sub)
          (str/includes? name "sub")
          (str/includes? name "minus")
          (str/includes? name "diff")) :sub

      (or (contains? tags :div)
          (str/includes? name "div")) :div

      (or (contains? tags :search)
          (= domain :search)
          (str/includes? name "search")) :search

      :else nil)))

(defn- pick-numeric-params
  "Return vector of numeric required param keywords, in order."
  [tool]
  (let [req (mapv keywordize (schema-required tool))
        props (schema-properties tool)]
    (->> req
         (filter (fn [k]
                   (numeric-prop? (get props (name k) (get props k)))))
         vec)))

(defn- pick-string-params
  [tool]
  (let [req (mapv keywordize (schema-required tool))
        props (schema-properties tool)]
    (->> req
         (filter (fn [k]
                   (string-prop? (get props (name k) (get props k)))))
         vec)))

(defn- make-math-args
  "Build args map for arithmetic tools using the first two numeric required params."
  [tool cfg ^java.util.Random r]
  (let [nums (pick-numeric-params tool)
        akey (first nums)
        bkey (second nums)]
    (when (and akey bkey)
      {akey (rand-int-range r (:int-min cfg) (:int-max cfg))
       bkey (rand-int-range r (:int-min cfg) (:int-max cfg))})))

(defn- make-search-args
  "Build args map for search tools using first string required param."
  [tool ^java.util.Random r]
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

(defn- maybe-final-expect
  "Best-effort stable final expectation:
  - only computes for arithmetic kinds by default
  - safe for add/mul/sub/div when values are integers
  - returns {:final {:contains \"...\"}} or nil"
  [tool kind args cfg]
  (when (and (:include-final-expect? cfg)
             (:compute-final? cfg)
             (map? args)
             (#{:add :mul :sub :div} kind))
    (let [[a b] (vals args)
          v (case kind
              :add (+ a b)
              :mul (* a b)
              :sub (- a b)
              :div (if (zero? b) nil (long (/ a b)))
              nil)]
      (when (some? v)
        {:final {:contains (str v)}}))))

(defn- choose-expect
  "Build :expect {:choose ...} with subset args (keyword keys)."
  [tool args]
  {:choose {:tool (:name tool)
            :arguments-subset args
            :policy :best
            :wrong_first_penalty 0.70
            :extra_calls_penalty 0.80}})

(defn- fallback-direct-case
  "Fallback case when semantics unknown:
  This still tests tool-call formatting and choice among decoys,
  but does NOT test reasoning."
  [tool args]
  {:prompt (str "Use the tool \"" (:name tool) "\" with exactly these arguments:\n"
                (pr-str args)
                "\n\nDo not answer directly. Use a tool call.")})

(defn- gen-one-choose-case
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
                     :else (fallback-direct-case tool args))
            base {:id (str "gen/" tool-name "/" i)
                  :prompt prompt
                  :expect (merge
                            (choose-expect tool args)
                            (maybe-final-expect tool kind args cfg))
                  :generated {:mode :inferred
                              :kind kind
                              :tool tool-name}}]
        base)

      (= :direct (:fallback-mode cfg))
      (let [;; make some args from required fields if possible
            req (mapv keywordize (schema-required tool))
            props (schema-properties tool)
            args2 (into {}
                        (map (fn [k]
                               (let [ps (or (get props (name k)) (get props k))
                                     t (prop-type ps)]
                                 [k (cond
                                      (numeric-prop? ps) (rand-int-range r (:int-min cfg) (:int-max cfg))
                                      (string-prop? ps) "example"
                                      :else "example")]))
                             req))
            base {:id (str "gen/" tool-name "/" i)
                  :prompt (:prompt (fallback-direct-case tool args2))
                  :expect (choose-expect tool args2)
                  :generated {:mode :fallback
                              :kind :direct
                              :tool tool-name}}]
        base)

      :else
      nil)))

(defn generate-choose-cases
  "Generate choose cases for all registered tools.

  Returns a vector of cases (nil cases removed)."
  ([]
   (generate-choose-cases default-gen-config))
  ([config]
   (let [cfg (merge default-gen-config config)
         n (max 1 (long (:n-per-tool cfg)))]
     (->> (tools/tools)
          (mapcat (fn [t]
                    (keep identity
                          (map (fn [i] (gen-one-choose-case t cfg i))
                               (range n)))))
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
  "Generate a full benchmark suite map:
    {:choose [...] :none [...] :all [...]}

  Config:
    :choose-config {...} merged into default-gen-config
    :include-none? bool"
  [{:keys [choose-config include-none? none-seed]
    :or {include-none? true
         none-seed 1}}]
  (let [choose (generate-choose-cases (or choose-config {}))
        none   (if include-none? (generate-none-cases {:seed none-seed}) [])
        all    (vec (concat choose none))]
    {:choose choose :none none :all all}))
```

---

# 2) Wire generation into the runner

This is a **full replacement** of the runner that adds:

* `--generate true`
* `--gen-config '{:choose-config {...} :include-none? true}'`

It still supports:

* `--auto-decoys true`
* `--decoy-config '{...}'`

**`cache/benchmark/src/promethean/benchmark/bench/tool_calling.clj`**

```clj
(ns promethean.benchmark.bench.tool-calling
  (:require
    [cheshire.core :as json]
    [clojure.edn :as edn]
    [clojure.java.io :as io]
    [clojure.string :as str]
    [promethean.benchmark.ollama :as ollama]
    [promethean.benchmark.tools :as tools]
    [promethean.benchmark.agents :as agents]
    [promethean.benchmark.decoys :as decoys]
    [promethean.benchmark.casegen :as casegen])
  (:import
    (java.util.regex Pattern)))

(defn- now-ms [] (System/currentTimeMillis))

(defn- read-edn-file [path]
  (with-open [r (io/reader path)]
    (edn/read {:eof nil} r)))

(defn- write-json-file! [path data]
  (io/make-parents path)
  (spit path (json/generate-string data {:pretty true})))

(defn- normalize-case [c]
  (cond-> c
    (nil? (:id c)) (assoc :id (str "case-" (hash c)))))

(defn- tool-provided-cases []
  (->> (tools/tools)
       (mapcat (fn [t]
                 (for [c (:bench/cases t)]
                   (-> c
                       (assoc :tool (:name t))
                       (update :expect #(or % {}))))))
       (map normalize-case)
       vec))

(defn- schema-sample-value [prop-name prop-schema]
  (let [t (or (:type prop-schema) (get prop-schema "type"))
        enum (or (:enum prop-schema) (get prop-schema "enum"))]
    (cond
      (seq enum) (first enum)
      (= t "string") "example"
      (= t :string) "example"
      (= t "integer") 1
      (= t :integer) 1
      (= t "number") 1.0
      (= t :number) 1.0
      (= t "boolean") true
      (= t :boolean) true
      (= t "array") []
      (= t :array) []
      (= t "object") {}
      (= t :object) {}
      :else "example")))

(defn- sample-args-for-tool [tool]
  (let [schema (:parameters tool)
        required (vec (or (:required schema) (get schema "required") []))
        props (or (:properties schema) (get schema "properties") {})
        make-one (fn [k]
                   (let [k* (name k)
                         s (or (get props k*) (get props k) {"type" "string"})]
                     [(keyword k*) (schema-sample-value k* s)]))]
    (into {} (map make-one required))))

(defn- autogen-direct-call-cases []
  (->> (tools/tools)
       (map (fn [t]
              (let [args (sample-args-for-tool t)]
                {:id (str "autogen/" (:name t))
                 :prompt (str
                           "Call the tool \"" (:name t) "\" with exactly these arguments:\n"
                           (pr-str args)
                           "\n\nDo not answer directly. Use a tool call.")
                 :expect {:calls [{:tool (:name t)
                                   :arguments args}]}})))
       vec))

(defn- load-tools-file! [tools-file]
  (when-not (.exists (io/file tools-file))
    (throw (ex-info "tools.clj does not exist" {:tools-file tools-file})))
  (tools/clear-tools!)
  (load-file tools-file)
  (let [n (count (tools/tools))]
    (when (zero? n)
      (throw (ex-info "Loaded tools.clj but no tools were registered. Did you use promethean.benchmark.tools/def-tool ?"
                      {:tools-file tools-file})))
    n))

(defn- load-agents-file! [agents-file]
  (when-not (.exists (io/file agents-file))
    (throw (ex-info "agents.clj does not exist" {:agents-file agents-file})))
  (agents/clear-agents!)
  (load-file agents-file)
  (count (agents/agents)))

(defn- build-cases-from-files
  [{:keys [cases-file]}]
  (cond
    (some? cases-file)
    (->> (read-edn-file cases-file)
         (map normalize-case)
         vec)

    :else
    (let [provided (tool-provided-cases)]
      (if (seq provided)
        provided
        (autogen-direct-call-cases)))))

(defn- build-cases
  "Build cases with precedence:
  1) --generate true -> casegen suite
  2) --cases cases.edn -> load that
  3) tool-provided cases -> use those
  4) fallback -> autogen direct tool-call cases

  Then optionally:
  - auto-decoys for choose cases that lack :tools"
  [{:keys [cases-file generate? gen-config auto-decoys? decoy-config]}]
  (let [cases
        (cond
          generate?
          (let [suite (casegen/generate-suite (or gen-config {}))]
            (:all suite))

          :else
          (build-cases-from-files {:cases-file cases-file}))

        cases' (mapv normalize-case cases)]
    (if auto-decoys?
      (decoys/ensure-decoys cases' (or decoy-config {}))
      cases')))

(defn- assistant->tool-calls [assistant-message]
  (or (:tool_calls assistant-message) []))

(defn- extract-call [tool-call]
  (let [f (:function tool-call)
        id (or (:id tool-call)
               (:tool_call_id tool-call)
               (:id f)
               (:tool_call_id f)
               (:index f)
               (:index tool-call))]
    {:id (when (some? id) (str id))
     :name (:name f)
     :arguments (:arguments f)
     :raw tool-call}))

(defn- tool-result-message [{:keys [name tool_call_id content]}]
  (cond-> {:role "tool"
           :name name
           :tool_name name
           :content content}
    (some? tool_call_id) (assoc :tool_call_id tool_call_id)))

(defn- stringify-result [x]
  (if (string? x) x (pr-str x)))

(defn- choose-tools-schemas
  [{:keys [case agent]}]
  (let [case-tools (:tools case)]
    (cond
      (seq case-tools)
      (let [names (set (map (fn [t]
                              (cond
                                (string? t) t
                                (keyword? t) (name t)
                                (symbol? t) (name t)
                                (map? t) (:name t)
                                :else (str t)))
                            case-tools))
            subset (filter (fn [t] (contains? names (:name t))) (tools/tools))]
        (mapv tools/tool->ollama-schema subset))

      (some? agent)
      (agents/agent-tools->schemas agent)

      :else
      (tools/tools->ollama-schemas))))

(defn- run-agent-loop!
  [{:keys [host model think options max-steps tools-schemas initial-messages timeout-ms]}]
  (loop [messages (vec initial-messages)
         steps []
         i 0]
    (let [resp (ollama/chat! {:host host
                              :model model
                              :messages messages
                              :tools tools-schemas
                              :think think
                              :options options
                              :timeout-ms timeout-ms})
          assistant (:message resp)
          messages' (conj messages assistant)
          tool-calls (mapv extract-call (assistant->tool-calls assistant))]
      (if (or (empty? tool-calls) (>= i (dec (long max-steps))))
        {:messages messages'
         :steps steps
         :final_assistant assistant
         :raw_last_response resp
         :stopped_reason (if (empty? tool-calls) :no_tool_calls :max_steps)}
        (let [tool-results
              (mapv (fn [{:keys [name arguments id] :as c}]
                      (let [valid (tools/validate-tool-call {:name name :arguments arguments})
                            invoked (when (:ok valid)
                                      (tools/invoke-tool! name arguments))]
                        (assoc c :valid valid :invoked invoked)))
                    tool-calls)

              tool-messages
              (mapv (fn [{:keys [name id invoked]}]
                      (tool-result-message
                        {:name name
                         :tool_call_id id
                         :content (stringify-result
                                   (if (:ok invoked) (:value invoked) invoked))}))
                    tool-results)

              messages'' (into messages' tool-messages)
              step {:i i
                    :assistant assistant
                    :tool_calls tool-results
                    :tool_messages tool-messages
                    :raw resp}]
          (recur messages'' (conj steps step) (inc i)))))))

(defn- expected-calls [expect] (when (vector? (:calls expect)) (:calls expect)))
(defn- expected-choose [expect] (:choose expect))
(defn- expected-none? [expect] (true? (:none expect)))
(defn- expected-final [expect] (:final expect))

(defn- match-args-subset?
  [expected actual]
  (cond
    (nil? expected) true
    (nil? actual) false
    (and (map? expected) (map? actual))
    (every? (fn [[k v]] (match-args-subset? v (get actual k))) expected)
    (sequential? expected) (= expected actual)
    :else (= expected actual)))

(defn- match-calls-strict [actual expected]
  (let [a (vec actual)
        e (vec expected)]
    (cond
      (empty? e) {:ok true}
      (< (count a) (count e))
      {:ok false :error :missing-calls
       :details {:expected_count (count e) :actual_count (count a)}}
      (> (count a) (count e))
      {:ok false :error :extra-calls
       :details {:expected_count (count e) :actual_count (count a)}}
      :else
      (let [mismatches
            (keep-indexed
              (fn [idx [{:keys [name arguments]} {:keys [tool arguments :as exp]}]]
                (cond
                  (not= tool name)
                  {:i idx :error :wrong-tool :expected tool :got name}
                  (not= (or (:arguments exp) {}) (or arguments {}))
                  {:i idx :error :wrong-arguments
                   :expected (:arguments exp) :got (or arguments {})}
                  :else nil))
              (map vector a e))]
        (if (seq mismatches)
          {:ok false :error :mismatch :details {:mismatches (vec mismatches)}}
          {:ok true})))))

;; choose-policy helpers

(defn- normalize-policy [p]
  (cond
    (keyword? p) p
    (string? p) (keyword p)
    (nil? p) :first
    :else :first))

(defn- find-first-index [tool-calls tool-name]
  (first (keep-indexed (fn [i c] (when (= tool-name (:name c)) i)) tool-calls)))

(defn- any-tool-call-matches? [tool-calls tool-name]
  (boolean (find-first-index tool-calls tool-name)))

(defn- args-map-for-call [call]
  (let [args (tools/coerce-arguments (:arguments call))]
    (if (map? args)
      (into {} (map (fn [[k v]] [(keyword (name k)) v])) args)
      {})))

(defn- choose-match-first [tool-calls {:keys [tool arguments-subset]}]
  (let [first-call (first tool-calls)]
    (cond
      (nil? first-call) {:ok false :error :no-tool-call}
      (not= tool (:name first-call))
      {:ok false :error :wrong-tool :details {:expected tool :got (:name first-call)}}
      (some? arguments-subset)
      (let [got (args-map-for-call first-call)]
        (if (match-args-subset? arguments-subset got)
          {:ok true}
          {:ok false :error :wrong-arguments
           :details {:expected_subset arguments-subset :got got}}))
      :else {:ok true})))

(defn- choose-match-any [tool-calls {:keys [tool arguments-subset]}]
  (cond
    (empty? tool-calls) {:ok false :error :no-tool-call}
    (nil? arguments-subset)
    (if (any-tool-call-matches? tool-calls tool)
      {:ok true}
      {:ok false :error :wrong-tool
       :details {:expected tool :got_first (:name (first tool-calls))}})
    :else
    (let [matching?
          (some (fn [c]
                  (and (= tool (:name c))
                       (match-args-subset? arguments-subset (args-map-for-call c))))
                tool-calls)]
      (if matching?
        {:ok true}
        {:ok false :error :wrong-arguments
         :details {:expected_subset arguments-subset
                   :note "Correct tool was called, but none matched arguments-subset"}}))))

(defn- choose-match-best [tool-calls choose]
  (let [idx (find-first-index tool-calls (:tool choose))]
    (cond
      (empty? tool-calls) {:ok false :error :no-tool-call}
      (nil? idx) {:ok false :error :wrong-tool
                  :details {:expected (:tool choose) :got_first (:name (first tool-calls))}}
      :else
      (let [wrong-before? (pos? idx)
            base (choose-match-any tool-calls choose)]
        (assoc base :wrong_before? wrong-before? :first_correct_index idx)))))

(defn- eval-choose [{:keys [tool-calls choose global-policy]}]
  (let [policy (normalize-policy (or (:policy choose) global-policy))
        match (case policy
                :any  (choose-match-any tool-calls choose)
                :best (choose-match-best tool-calls choose)
                :first (choose-match-first tool-calls choose)
                (choose-match-first tool-calls choose))
        chosen (case policy
                 :first (or (:name (first tool-calls)) "<none>")
                 :any   (if (any-tool-call-matches? tool-calls (:tool choose))
                          (:tool choose)
                          (or (:name (first tool-calls)) "<none>"))
                 :best  (if (any-tool-call-matches? tool-calls (:tool choose))
                          (:tool choose)
                          (or (:name (first tool-calls)) "<none>"))
                 (or (:name (first tool-calls)) "<none>"))]
    {:policy policy :chosen chosen :match match}))

(defn- match-final [final-expect final-content]
  (cond
    (nil? final-expect) {:ok true}
    (some? (:contains final-expect))
    (let [needle (:contains final-expect)]
      (if (str/includes? (or final-content "") needle)
        {:ok true}
        {:ok false :error :final-missing-contains :details {:contains needle}}))
    (some? (:regex final-expect))
    (let [re (Pattern/compile (str (:regex final-expect)))]
      (if (re-find re (or final-content ""))
        {:ok true}
        {:ok false :error :final-regex-no-match :details {:regex (:regex final-expect)}}))
    :else {:ok false :error :final-invalid-expect :details final-expect}))

(defn- apply-penalty [score mult] (* score (double mult)))

(defn- score-case
  [{:keys [case tool-calls final-content stopped-reason penalize-extra-calls? choose-policy]}]
  (let [total (count tool-calls)
        valid-n (count (filter #(true? (get-in % [:valid :ok])) tool-calls))
        invoked-n (count (filter #(true? (get-in % [:invoked :ok])) tool-calls))
        validity-rate (if (pos? total) (/ valid-n total) 1.0)
        invoked-rate  (if (pos? total) (/ invoked-n total) 1.0)

        expect (:expect case)
        exp-calls (expected-calls expect)
        exp-choose (expected-choose expect)
        exp-none (expected-none? expect)
        exp-final (expected-final expect)

        strict-match (when (seq exp-calls)
                       (match-calls-strict
                         (mapv (fn [c] {:name (:name c)
                                        :arguments (tools/coerce-arguments (:arguments c))})
                               tool-calls)
                         exp-calls))

        choose-eval (when (some? exp-choose)
                      (eval-choose {:tool-calls tool-calls
                                   :choose exp-choose
                                   :global-policy choose-policy}))

        choose-match (when choose-eval (:match choose-eval))

        none-match (when exp-none
                     (if (zero? total)
                       {:ok true}
                       {:ok false :error :unexpected-tool-calls
                        :details {:tool_calls_count total}}))

        final-match (match-final exp-final final-content)

        w-valid 0.35
        w-invk  0.25
        w-strict (if (seq exp-calls) 0.25 0.0)
        w-choose (if (some? exp-choose) 0.25 0.0)
        w-none   (if exp-none 0.25 0.0)
        w-final  (if (some? exp-final) 0.15 0.0)

        correctness
        (+ (* w-strict (if (and strict-match (:ok strict-match)) 1.0 0.0))
           (* w-choose (if (and choose-match (:ok choose-match)) 1.0 0.0))
           (* w-none   (if (and none-match (:ok none-match)) 1.0 0.0))
           (* w-final  (if (:ok final-match) 1.0 0.0)))

        base (+ (* w-valid validity-rate)
                (* w-invk invoked-rate)
                correctness)

        base' (if (= stopped-reason :max_steps) (* base 0.5) base)

        extra-calls (max 0 (dec total))
        no-extras? (true? (:no_extras expect))
        penalize-extras? (and (some? exp-choose) (or penalize-extra-calls? no-extras?))
        extra-penalty (or (get-in expect [:choose :extra_calls_penalty]) 0.80)

        wrong-first-penalty (or (get-in expect [:choose :wrong_first_penalty]) 0.70)
        wrong-first?
        (boolean (and (some? exp-choose)
                      (= :best (get choose-eval :policy))
                      (true? (get choose-match :wrong_before?))))

        score1 (if (and penalize-extras? (pos? extra-calls))
                 (apply-penalty base' extra-penalty)
                 base')
        score2 (if wrong-first?
                 (apply-penalty score1 wrong-first-penalty)
                 score1)]
    {:tool_calls_count total
     :tool_calls_valid_count valid-n
     :tool_calls_invoked_count invoked-n
     :validity_rate validity-rate
     :invoked_rate invoked-rate

     :expected_strict_present (boolean (seq exp-calls))
     :expected_strict_match (when (seq exp-calls) (boolean (:ok strict-match)))
     :expected_strict_error (when (seq exp-calls) (dissoc strict-match :ok))

     :expected_choose_present (boolean (some? exp-choose))
     :expected_choose_policy (when choose-eval (:policy choose-eval))
     :expected_choose_chosen (when choose-eval (:chosen choose-eval))
     :expected_choose_match (when (some? exp-choose) (boolean (:ok choose-match)))
     :expected_choose_error (when (some? exp-choose) (dissoc choose-match :ok))
     :wrong_first wrong-first?

     :expected_none_present (boolean exp-none)
     :expected_none_match (when exp-none (boolean (:ok none-match)))
     :expected_none_error (when exp-none (dissoc none-match :ok))

     :expected_final_present (boolean (some? exp-final))
     :expected_final_match (boolean (:ok final-match))
     :expected_final_error (dissoc final-match :ok)

     :extra_calls extra-calls
     :extra_calls_penalized (boolean penalize-extras?)
     :stopped_reason stopped-reason
     :score score2}))

(defn- assoc-in+ [m ks f]
  (update-in m ks (fnil f 0)))

(defn- compute-choice-stats [results]
  (let [choice-results
        (filter (fn [r] (true? (get-in r [:score :expected_choose_present])))
                results)

        labels
        (->> choice-results
             (map (fn [r]
                    [(get-in r [:expect :choose :tool])
                     (get-in r [:score :expected_choose_chosen] "<none>")]))
             (mapcat identity)
             set
             (conj "<none>")
             vec)

        confusion
        (reduce
          (fn [m r]
            (let [expected (get-in r [:expect :choose :tool])
                  chosen (get-in r [:score :expected_choose_chosen] "<none>")]
              (assoc-in+ m [expected chosen] inc)))
          {}
          choice-results)

        overall
        (let [n (count choice-results)
              correct (count (filter #(true? (get-in % [:score :expected_choose_match])) choice-results))
              wrong-first (count (filter #(true? (get-in % [:score :wrong_first])) choice-results))]
          {:choice_cases n
           :choice_correct correct
           :choice_accuracy (if (pos? n) (/ correct n) 0.0)
           :wrong_first_rate (if (pos? n) (/ wrong-first n) 0.0)})]
    {:labels labels
     :confusion_matrix confusion
     :overall overall}))

(defn run!
  [{:keys [host model tools-file agents-file agent-name cases-file
           max-steps think options timeout-ms out
           penalize-extra-calls? choose-policy
           auto-decoys? decoy-config
           generate? gen-config]
    :or {host ollama/default-host
         max-steps 4
         timeout-ms 300000
         penalize-extra-calls? false
         choose-policy :first
         auto-decoys? false
         generate? false}}]
  (when (or (nil? tools-file) (str/blank? (str tools-file)))
    (throw (ex-info "Missing :tools-file" {})))

  (let [_tool-count (load-tools-file! tools-file)
        _agent-count (when agents-file (load-agents-file! agents-file))
        agent (when agent-name (agents/agent-by-name agent-name))

        model* (or (:model agent) model)
        think* (if (some? (:think agent)) (:think agent) think)
        options* (or (:options agent) options)

        _ (when (or (nil? model*) (str/blank? (str model*)))
            (throw (ex-info "Missing :model (either pass :model or define it on the agent)" {})))

        cases (build-cases {:cases-file cases-file
                            :generate? generate?
                            :gen-config gen-config
                            :auto-decoys? auto-decoys?
                            :decoy-config decoy-config})
        started (now-ms)

        results
        (mapv
          (fn [c]
            (let [c (normalize-case c)
                  t0 (now-ms)

                  system-msg (when agent {:role "system" :content (:instructions agent)})
                  case-system (when (string? (:system c))
                                {:role "system" :content (:system c)})

                  base-messages
                  (cond
                    (vector? (:messages c)) (:messages c)
                    (string? (:prompt c)) [{:role "user" :content (:prompt c)}]
                    :else [{:role "user" :content (str (:prompt c))}])

                  initial-messages
                  (cond-> []
                    (some? system-msg) (conj system-msg)
                    (some? case-system) (conj case-system)
                    true (into base-messages))

                  tools-schemas (choose-tools-schemas {:case c :agent agent})

                  loop-result
                  (run-agent-loop!
                    {:host host
                     :model model*
                     :think think*
                     :options options*
                     :max-steps max-steps
                     :tools-schemas tools-schemas
                     :timeout-ms timeout-ms
                     :initial-messages initial-messages})

                  t1 (now-ms)
                  final-assistant (:final_assistant loop-result)
                  final-content (:content final-assistant)

                  tool-calls
                  (->> (:steps loop-result)
                       (mapcat :tool_calls)
                       (mapv (fn [tc]
                               {:id (:id tc)
                                :name (:name tc)
                                :arguments (:arguments tc)
                                :valid (:valid tc)
                                :invoked (:invoked tc)})))

                  score (score-case {:case c
                                     :tool-calls tool-calls
                                     :final-content final-content
                                     :stopped-reason (:stopped_reason loop-result)
                                     :penalize-extra-calls? penalize-extra-calls?
                                     :choose-policy choose-policy})]
              {:id (:id c)
               :prompt (:prompt c)
               :tools (:tools c)
               :decoy_plan (:decoy_plan c)
               :generated (:generated c)
               :expect (:expect c)
               :duration_ms (- t1 t0)
               :final_assistant {:content final-content
                                 :tool_calls (assistant->tool-calls final-assistant)}
               :tool_calls tool-calls
               :score score}))
          cases)

        finished (now-ms)
        choice-stats (compute-choice-stats results)

        summary
        (let [n (count results)
              avg (if (pos? n) (long (/ (reduce + (map :duration_ms results)) n)) 0)
              mean-score (if (pos? n)
                           (/ (reduce + (map #(get-in % [:score :score]) results)) n)
                           0.0)]
          {:total_cases n
           :avg_case_duration_ms avg
           :mean_score mean-score
           :choice_accuracy (get-in choice-stats [:overall :choice_accuracy] 0.0)
           :wrong_first_rate (get-in choice-stats [:overall :wrong_first_rate] 0.0)})

        out-map
        {:benchmark "tool-calling"
         :model model*
         :host host
         :tools_file tools-file
         :agent_name agent-name
         :max_steps max-steps
         :choose_policy choose-policy
         :penalize_extra_calls penalize-extra-calls?
         :generate generate?
         :gen_config (or gen-config {})
         :auto_decoys auto-decoys?
         :decoy_config (or decoy-config {})
         :started_ms started
         :finished_ms finished
         :summary summary
         :choice_stats choice-stats
         :results results}]

    (when (some? out)
      (write-json-file! out out-map))
    out-map))

(defn -main [& args]
  (let [m (->> (partition 2 args)
               (map (fn [[k v]] [(keyword (subs k 2)) v]))
               (into {}))
        host (get m :host ollama/default-host)
        model (get m :model)
        tools-file (get m :tools)
        agents-file (get m :agents)
        agent-name (get m :agent)
        cases-file (get m :cases)
        max-steps (some-> (get m :max-steps) parse-long)
        out (get m :out)
        think (some-> (get m :think) Boolean/parseBoolean)
        penalize-extra (some-> (get m :penalize-extra-calls) Boolean/parseBoolean)
        choose-policy (some-> (get m :choose-policy) keyword)
        auto-decoys (some-> (get m :auto-decoys) Boolean/parseBoolean)
        decoy-config (some-> (get m :decoy-config) edn/read-string)
        generate? (some-> (get m :generate) Boolean/parseBoolean)
        gen-config (some-> (get m :gen-config) edn/read-string)
        options (some-> (get m :options) edn/read-string)]
    (let [res (run! {:host host
                     :model model
                     :tools-file tools-file
                     :agents-file agents-file
                     :agent-name agent-name
                     :cases-file cases-file
                     :max-steps (or max-steps 4)
                     :think think
                     :options options
                     :choose-policy (or choose-policy :first)
                     :penalize-extra-calls? (boolean penalize-extra)
                     :auto-decoys? (boolean auto-decoys)
                     :decoy-config decoy-config
                     :generate? (boolean generate?)
                     :gen-config gen-config
                     :out out})]
      (println (json/generate-string (:summary res) {:pretty true})))))
```

---

# 3) Run it (generated + decoys)

This creates a suite automatically and injects decoys for every `:choose` case:

```bash
clj -M -m promethean.benchmark.bench.tool-calling \
  --host http://localhost:11434 \
  --model qwen3 \
  --tools ./tools.clj \
  --generate true \
  --gen-config '{:choose-config {:n-per-tool 2 :seed 7 :compute-final? true}
                :include-none? true
                :none-seed 99}' \
  --auto-decoys true \
  --decoy-config '{:n-total 8 :same-domain 3 :powerful 1 :noise 3 :seed 42}' \
  --choose-policy best \
  --penalize-extra-calls true \
  --out ./tool_calling_results.json
```

---

# 4) What to do next to make this *really* good

Right now the generator is **smart for math/search**, and **fallback-forced** for unknown tools.

To make “unknown tools” become **real choice tests**, the tool needs *one extra hint*:

### Add per-tool prompt templates

In your `def-tool` metadata, add:

```clj
:bench/prompt-templates
[{:prompt "Convert 212F to Celsius"
  :args {:f 212}
  :final-contains "100"}]
```

Then the generator can use *those* instead of guessing.

If you want, I’ll extend `casegen` to prefer `:bench/prompt-templates` whenever present (and it’ll still work with decoys).
