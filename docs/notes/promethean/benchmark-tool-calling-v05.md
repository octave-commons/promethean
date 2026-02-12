Alright — next upgrade is **trace-aware tool choice** with a real evaluation policy.

You’ll get:

* ✅ `:choose-policy` modes: `:first` | `:any` | `:best`
* ✅ “wrong-first” penalties (model calls a decoy tool before the right one)
* ✅ Choice confusion matrix + precision/recall/F1 computed **according to the policy**
* ✅ Fixed a bug in `match-calls-strict` from the last version (it returned nested `{:ok {:ok false ...}}`)

Below is a **full file replacement**.

---

# Replace `tool_calling` benchmark runner (adds choose-policy)

**`cache/benchmark/src/promethean/benchmark/bench/tool_calling.clj`**

```clj
(ns promethean.benchmark.bench.tool-calling
  "Tool-calling benchmark runner for Ollama.

  Expectations:
  - strict call sequence:
      :expect {:calls [{:tool \"add\" :arguments {...}} ...]}
  - tool choice:
      :expect {:choose {:tool \"mul\"
                        :arguments-subset {...}
                        :policy :first|:any|:best
                        :wrong_first_penalty 0.70   ;; optional (best)
                        :extra_calls_penalty 0.80}} ;; optional
  - should NOT call tools:
      :expect {:none true}
  - final answer checks:
      :expect {:final {:contains \"...\"}} or {:final {:regex \"...\"}}

  Decoy pressure:
  - per-case toolset override:
      {:tools [\"add\" \"mul\" \"search_web\" ...]}  ;; only expose these tools

  Global knobs:
  - :choose-policy (default :first)
  - :penalize-extra-calls? (default false)

  Choice stats:
  - confusion matrix and per-tool precision/recall/F1 computed using chosen tool per policy."
  (:require
    [cheshire.core :as json]
    [clojure.edn :as edn]
    [clojure.java.io :as io]
    [clojure.string :as str]
    [promethean.benchmark.ollama :as ollama]
    [promethean.benchmark.tools :as tools]
    [promethean.benchmark.agents :as agents])
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
  (let [t (get prop-schema "type")
        enum (get prop-schema "enum")]
    (cond
      (seq enum) (first enum)
      (= t "string")
      (case prop-name
        ("city") "New York"
        ("country") "USA"
        ("state") "AZ"
        ("query" "q" "search") "clojure tool calling"
        ("name") "example"
        "example")
      (= t "integer") 1
      (= t "number") 1.0
      (= t "boolean") true
      (= t "array") []
      (= t "object") {}
      :else "example")))

(defn- sample-args-for-tool [tool]
  (let [schema (:parameters tool)
        required (vec (get schema "required" []))
        props (get schema "properties" {})
        make-one (fn [k]
                   (let [k* (name k)
                         s (get props k* {"type" "string"})]
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

(defn- build-cases [{:keys [cases-file]}]
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

(defn- assistant->tool-calls [assistant-message]
  (or (:tool_calls assistant-message) []))

(defn- extract-call [tool-call]
  ;; Ollama style: {:type "function" :function {:name "...", :arguments {...}}}
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
  (cond
    (string? x) x
    :else (pr-str x)))

(defn- choose-tools-schemas
  "Compute tool schemas for this run:
  - if case has :tools -> that subset
  - else if agent is present -> agent subset
  - else -> all tools"
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
  "Runs an agent loop until the model stops returning tool_calls or max-steps is hit."
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
  "Return true if expected is a subset of actual (deep-ish on maps)."
  [expected actual]
  (cond
    (nil? expected) true
    (nil? actual) false

    (and (map? expected) (map? actual))
    (every? (fn [[k v]]
              (match-args-subset? v (get actual k)))
            expected)

    (sequential? expected)
    (= expected actual)

    :else
    (= expected actual)))

(defn- match-calls-strict
  "Strict match of expected calls in sequence (no extras)."
  [actual expected]
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

;; -------------------------------
;; Choose policy
;; -------------------------------

(defn- normalize-policy [p]
  (cond
    (keyword? p) p
    (string? p) (keyword p)
    (nil? p) :first
    :else :first))

(defn- find-first-index
  "Return index of first call where (:name call) == tool-name, else nil."
  [tool-calls tool-name]
  (first
    (keep-indexed (fn [i c] (when (= tool-name (:name c)) i))
                  tool-calls)))

(defn- any-tool-call-matches?
  [tool-calls tool-name]
  (boolean (find-first-index tool-calls tool-name)))

(defn- args-map-for-call
  "Return keywordized args map for a call, or {}."
  [call]
  (let [args (tools/coerce-arguments (:arguments call))]
    (cond
      (map? args)
      (into {} (map (fn [[k v]] [(keyword (name k)) v])) args)

      :else {})))

(defn- choose-match-first
  [tool-calls {:keys [tool arguments-subset]}]
  (let [first-call (first tool-calls)]
    (cond
      (nil? first-call)
      {:ok false :error :no-tool-call}

      (not= tool (:name first-call))
      {:ok false :error :wrong-tool
       :details {:expected tool :got (:name first-call)}}

      (some? arguments-subset)
      (let [got (args-map-for-call first-call)]
        (if (match-args-subset? arguments-subset got)
          {:ok true}
          {:ok false :error :wrong-arguments
           :details {:expected_subset arguments-subset :got got}}))

      :else
      {:ok true})))

(defn- choose-match-any
  "Passes if the correct tool is called at least once.
  If arguments-subset is provided, requires at least one matching correct-tool call."
  [tool-calls {:keys [tool arguments-subset]}]
  (cond
    (empty? tool-calls)
    {:ok false :error :no-tool-call}

    (nil? arguments-subset)
    (if (any-tool-call-matches? tool-calls tool)
      {:ok true}
      {:ok false :error :wrong-tool
       :details {:expected tool
                 :got_first (:name (first tool-calls))}})

    :else
    (let [idx (find-first-index tool-calls tool)]
      (if (nil? idx)
        {:ok false :error :wrong-tool
         :details {:expected tool
                   :got_first (:name (first tool-calls))}}
        (let [matching?
              (some (fn [c]
                      (and (= tool (:name c))
                           (match-args-subset? arguments-subset (args-map-for-call c))))
                    tool-calls)]
          (if matching?
            {:ok true}
            {:ok false :error :wrong-arguments
             :details {:expected_subset arguments-subset
                       :note "Correct tool was called, but none of its calls matched arguments-subset"}}))))))

(defn- choose-match-best
  "Best policy:
  - must call correct tool at least once (like :any)
  - but penalize calling decoy tools before the first correct call
  - also optionally penalize extra calls (handled elsewhere)"
  [tool-calls {:keys [tool arguments-subset]}]
  (let [idx (find-first-index tool-calls tool)]
    (cond
      (empty? tool-calls)
      {:ok false :error :no-tool-call}

      (nil? idx)
      {:ok false :error :wrong-tool
       :details {:expected tool
                 :got_first (:name (first tool-calls))}}

      :else
      (let [wrong-before? (pos? idx)
            base (choose-match-any tool-calls {:tool tool :arguments-subset arguments-subset})]
        (assoc base :wrong_before? wrong-before? :first_correct_index idx)))))

(defn- eval-choose
  "Returns choose-match map, plus derived chosen tool string for stats."
  [{:keys [tool-calls choose expect global-policy]}]
  (let [policy (normalize-policy (or (:policy choose) global-policy))
        match (case policy
                :any   (choose-match-any tool-calls choose)
                :best  (choose-match-best tool-calls choose)
                :first (choose-match-first tool-calls choose)
                (choose-match-first tool-calls choose))
        chosen
        (case policy
          :first (or (:name (first tool-calls)) "<none>")
          :any   (if (any-tool-call-matches? tool-calls (:tool choose))
                   (:tool choose)
                   (or (:name (first tool-calls)) "<none>"))
          :best  (if (any-tool-call-matches? tool-calls (:tool choose))
                   (:tool choose)
                   (or (:name (first tool-calls)) "<none>"))
          (or (:name (first tool-calls)) "<none>"))]
    {:policy policy
     :chosen chosen
     :match match}))

;; -------------------------------
;; Final checks
;; -------------------------------

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

    :else
    {:ok false :error :final-invalid-expect :details final-expect}))

;; -------------------------------
;; Penalties
;; -------------------------------

(defn- apply-penalty [score mult] (* score (double mult)))

(defn- score-case
  "Returns a rich score map including a final numeric :score."
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
                                   :expect expect
                                   :global-policy choose-policy}))

        choose-match (when choose-eval (:match choose-eval))

        none-match (when exp-none
                     (if (zero? total)
                       {:ok true}
                       {:ok false :error :unexpected-tool-calls
                        :details {:tool_calls_count total}}))

        final-match (match-final exp-final final-content)

        ;; base weights
        w-valid 0.35
        w-invk  0.25
        w-strict (if (seq exp-calls) 0.25 0.0)
        w-choose (if (some? exp-choose) 0.25 0.0)
        w-none   (if exp-none 0.25 0.0)
        w-final  (if (some? exp-final) 0.15 0.0)

        correctness-score
        (+ (* w-strict (if (and strict-match (:ok strict-match)) 1.0 0.0))
           (* w-choose (if (and choose-match (:ok choose-match)) 1.0 0.0))
           (* w-none   (if (and none-match (:ok none-match)) 1.0 0.0))
           (* w-final  (if (:ok final-match) 1.0 0.0)))

        base
        (+ (* w-valid validity-rate)
           (* w-invk invoked-rate)
           correctness-score)

        ;; loop penalty
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
     :wrong_first (boolean wrong-first?)

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

;; -------------------------------
;; Choice metrics
;; -------------------------------

(defn- assoc-in+ [m ks f]
  (update-in m ks (fnil f 0)))

(defn- compute-choice-stats
  "Build confusion matrix + per-tool precision/recall/F1 from results.

  Uses the chosen tool recorded in each result's score (:expected_choose_chosen)."
  [results]
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

        totals-per-expected
        (reduce (fn [m [e row]]
                  (assoc m e (reduce + (vals row))))
                {}
                confusion)

        totals-per-chosen
        (reduce
          (fn [m [e row]]
            (reduce (fn [m2 [c n]] (update m2 c (fnil + 0) n))
                    m
                    row))
          {}
          confusion)

        per-tool
        (reduce
          (fn [m t]
            (let [tp (get-in confusion [t t] 0)
                  fp (max 0 (- (get totals-per-chosen t 0) tp))
                  fn (max 0 (- (get totals-per-expected t 0) tp))
                  precision (if (pos? (+ tp fp)) (/ tp (+ tp fp)) 0.0)
                  recall    (if (pos? (+ tp fn)) (/ tp (+ tp fn)) 0.0)
                  f1        (if (pos? (+ precision recall))
                              (/ (* 2 precision recall) (+ precision recall))
                              0.0)]
              (assoc m t {:tp tp :fp fp :fn fn
                          :precision precision
                          :recall recall
                          :f1 f1
                          :support (get totals-per-expected t 0)})))
          {}
          (->> labels
               (remove #{"<none>"})
               vec))

        overall
        (let [n (count choice-results)
              correct (count (filter #(true? (get-in % [:score :expected_choose_match])) choice-results))
              wrong-first (count (filter #(true? (get-in % [:score :wrong_first])) choice-results))]
          {:choice_cases n
           :choice_correct correct
           :choice_accuracy (if (pos? n) (/ correct n) 0.0)
           :wrong_first_count wrong-first
           :wrong_first_rate (if (pos? n) (/ wrong-first n) 0.0)})]
    {:labels labels
     :confusion_matrix confusion
     :per_tool per-tool
     :overall overall}))

;; -------------------------------
;; Runner
;; -------------------------------

(defn run!
  "Run the tool calling benchmark.

  opts:
  - :host        (default ollama/default-host)
  - :model       (required unless agent provides one)
  - :tools-file  (required path to tools.clj)
  - :agents-file (optional path to agents.clj)
  - :agent-name  (optional string)
  - :cases-file  (optional path to cases.edn)
  - :max-steps   (default 4)
  - :think       (optional bool)
  - :options     (optional map passed to Ollama)
  - :timeout-ms  (default 5 minutes)
  - :out         (optional output json path)
  - :penalize-extra-calls? (default false)
  - :choose-policy (default :first)  ;; global default for choose cases"
  [{:keys [host model tools-file agents-file agent-name cases-file max-steps think options timeout-ms out
           penalize-extra-calls? choose-policy]
    :or {host ollama/default-host
         max-steps 4
         timeout-ms 300000
         penalize-extra-calls? false
         choose-policy :first}}]
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

        cases (build-cases {:cases-file cases-file})
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
               :messages (:messages c)
               :tools (:tools c)
               :system (:system c)
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
              avg (if (pos? n)
                    (long (/ (reduce + (map :duration_ms results)) n))
                    0)
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
         :agents_file agents-file
         :agent_name agent-name
         :max_steps max-steps
         :think think*
         :options options*
         :choose_policy choose-policy
         :penalize_extra_calls penalize-extra-calls?
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
                     :out out})]
      (println (json/generate-string (:summary res) {:pretty true})))))
```

---

# How to use `:choose` policies in `cases.edn`

### `:first` (default)

Strict: “what tool did you pick first?”

```clj
{:id "choice.first.mul"
 :prompt "Compute 7 times 9."
 :tools ["add" "mul" "search_web"]
 :expect {:choose {:tool "mul"
                   :arguments-subset {:a 7 :b 9}
                   :policy :first}
          :final {:contains "63"}}}
```

### `:any`

Loose: “did you eventually call the right tool?”

```clj
{:id "choice.any.mul"
 :prompt "Compute 7 times 9."
 :tools ["add" "mul" "search_web"]
 :expect {:choose {:tool "mul"
                   :arguments-subset {:a 7 :b 9}
                   :policy :any}
          :final {:contains "63"}}}
```

### `:best`

This is the “real” one:

* must call correct tool at least once
* **penalize wrong-first** (decoy tool before correct tool)

```clj
{:id "choice.best.mul.decoy"
 :prompt "Compute 7 times 9."
 :tools ["add" "mul" "search_web"]
 :expect {:choose {:tool "mul"
                   :arguments-subset {:a 7 :b 9}
                   :policy :best
                   :wrong_first_penalty 0.70
                   :extra_calls_penalty 0.80}
          :no_extras true
          :final {:contains "63"}}}
```

---

# CLI usage

Global defaults (policy + extra penalty):

```bash
clj -M -m promethean.benchmark.bench.tool-calling \
  --host http://localhost:11434 \
  --model qwen3 \
  --tools ./tools.clj \
  --cases ./cases.edn \
  --choose-policy best \
  --penalize-extra-calls true \
  --out ./tool_calling_results.json
```

---

# What changes in outputs

Now each case includes:

* `score.expected_choose_policy`
* `score.expected_choose_chosen`
* `score.wrong_first` (true/false)
* choice stats include:

  * `choice_stats.overall.wrong_first_rate`
  * confusion matrix computed from **chosen tool per policy**

---

If you want the next “real benchmark” step after this: I’d add **a decoy generator helper** (like “make 20 math choice cases with 3 correct tools + 10 decoys each”) so you can build entire suites from a tool registry automatically.
