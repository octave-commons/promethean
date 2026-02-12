Yep — let’s do it.

Below are **repo-ready full-file replacements + a new namespace**:

* ✅ `def-tool` now supports **`clojure.spec.alpha` arg validation** (your “core.alpha” intent, but using the real spec namespace)
* ✅ Tool-choice test support (correct tool selection among multiple)
* ✅ New `def-agent` macro + agent registry (OpenAI Agent SDK-ish shape)
* ✅ Benchmark can optionally load `agents.clj` + run cases with a chosen agent

---

# 1) Replace `promethean.benchmark.tools` (adds spec validation)

**`cache/benchmark/src/promethean/benchmark/tools.clj`**

```clj
(ns promethean.benchmark.tools
  "Tool definition + registry for tool-calling benchmarks.

  User provides a tools.clj which `load-file`s into the runtime and registers tools
  via `def-tool`.

  Each tool becomes:
  - registry entry (name -> {:name :description :parameters :invoke :args-spec ...})
  - Ollama/OpenAI-ish tool schema:
      {:type \"function\"
       :function {:name \"...\"
                  :description \"...\"
                  :parameters { ...JSON Schema... }}}

  Validation:
  - required keys are checked via JSON schema `required`
  - optional clojure.spec.alpha validation via :args-spec"
  (:require
    [cheshire.core :as json]
    [clojure.spec.alpha :as s]
    [clojure.string :as str]
    [clojure.walk :as walk]))

(defonce ^:private *registry (atom {}))

(defn clear-tools! [] (reset! *registry {}))
(defn tools [] (vals @*registry))

(defn tool-by-name [tool-name]
  (get @*registry tool-name))

(defn- normalize-tool-name [n]
  (cond
    (keyword? n) (name n)
    (string? n) n
    (symbol? n) (name n)
    (nil? n) ""
    :else (str n)))

(defn- keywordize-keys-recursive [x]
  (cond
    (map? x)
    (into {}
          (map (fn [[k v]]
                 [(cond
                    (keyword? k) k
                    (string? k) (keyword k)
                    :else k)
                  (keywordize-keys-recursive v)]))
          x)

    (sequential? x)
    (mapv keywordize-keys-recursive x)

    :else x))

(defn- jsonify
  "Convert a Clojure-ish schema/value into JSON-ready form:
  - keyword/symbol keys -> string keys
  - keyword/symbol values -> string values"
  [x]
  (cond
    (map? x)
    (into {}
          (map (fn [[k v]]
                 [(cond
                    (keyword? k) (name k)
                    (symbol? k) (name k)
                    (string? k) k
                    :else (str k))
                  (jsonify v)]))
          x)

    (sequential? x)
    (mapv jsonify x)

    (keyword? x) (name x)
    (symbol? x) (name x)

    :else x))

(defn coerce-arguments
  "Tool-call arguments may arrive as:
  - a map
  - a JSON string
  - nil

  Returns a map or nil."
  [arguments]
  (cond
    (nil? arguments) nil
    (map? arguments) arguments
    (string? arguments)
    (try
      (json/parse-string arguments true)
      (catch Throwable _
        nil))
    :else nil))

(defn register-tool!
  "Register a tool definition + implementation in the runtime registry.

  Required keys:
  - :name
  - :description
  - :parameters  (JSON Schema map — we normalize)
  - :invoke      (fn [args-map] ...)

  Optional keys:
  - :args-spec   clojure.spec for args map
  - :bench/cases vector of cases

  Returns normalized tool map."
  [{:keys [name description parameters invoke args-spec] :as tool}]
  (let [tool-name (normalize-tool-name name)
        params-json (jsonify parameters)
        tool* (-> tool
                  (assoc :name tool-name)
                  (assoc :description (or description ""))
                  (assoc :parameters params-json)
                  (assoc :args-spec args-spec))]
    (when (str/blank? tool-name)
      (throw (ex-info "Tool name cannot be blank" {:tool tool})))
    (when-not (map? (:parameters tool*))
      (throw (ex-info "Tool :parameters must be a JSON schema map" {:tool tool*})))
    (when-not (ifn? invoke)
      (throw (ex-info "Tool :invoke must be callable" {:tool tool*})))
    (when (some? args-spec)
      ;; don't force (s/get-spec ...) because spec objects and spec keywords are both valid
      ;; but we *can* sanity check valid? won't throw
      (try
        (s/valid? args-spec {})
        (catch Throwable t
          (throw (ex-info "Tool :args-spec is not usable as a spec" {:tool tool-name} t)))))
    (swap! *registry assoc tool-name tool*)
    tool*))

(defn tool->ollama-schema
  "Convert a registered tool into Ollama tool schema:
  {:type \"function\" :function {:name ... :description ... :parameters ...}}"
  [{:keys [name description parameters]}]
  {:type "function"
   :function {:name name
              :description (or description "")
              :parameters parameters}})

(defn tools->ollama-schemas []
  (mapv tool->ollama-schema (tools)))

(defn validate-tool-call
  "Validate a tool call structure against:
  - tool exists
  - arguments is a map or JSON string parseable to map
  - required keys present (JSON schema required)
  - optional args-spec passes

  Input: {:name \"...\" :arguments ...}

  Returns:
    {:ok true}
  or {:ok false :error ... :details ...}"
  [{:keys [name arguments]}]
  (let [tool (tool-by-name (normalize-tool-name name))
        args (coerce-arguments arguments)]
    (cond
      (nil? tool)
      {:ok false :error :unknown-tool :details {:name name}}

      (nil? args)
      {:ok false :error :invalid-arguments :details {:name name :arguments arguments}}

      :else
      (let [schema (:parameters tool)
            required (set (get schema "required" []))   ;; strings
            args-kw (keywordize-keys-recursive args)
            present (set (map name (keys args-kw)))
            missing (seq (remove present required))

            args-spec (:args-spec tool)
            spec-ok? (if (some? args-spec) (s/valid? args-spec args-kw) true)
            spec-problems (when (and (some? args-spec) (not spec-ok?))
                            (s/explain-data args-spec args-kw))]
        (cond
          missing
          {:ok false
           :error :missing-required
           :details {:name name
                     :missing (vec missing)
                     :required (vec required)}}

          (not spec-ok?)
          {:ok false
           :error :spec-invalid
           :details {:name name
                     :problems spec-problems}}

          :else
          {:ok true})))))

(defn invoke-tool!
  "Invoke a registered tool by name with arguments (map or JSON string).
  Runs validation first (required keys + optional spec).

  Returns:
    {:ok true :value ...}
  or {:ok false :error ... :details ...}"
  [tool-name arguments]
  (let [name* (normalize-tool-name tool-name)
        tool (tool-by-name name*)
        args (coerce-arguments arguments)]
    (cond
      (nil? tool)
      {:ok false :error :unknown-tool :details {:name name*}}

      (nil? args)
      {:ok false :error :invalid-arguments :details {:name name* :arguments arguments}}

      :else
      (let [valid (validate-tool-call {:name name* :arguments args})]
        (if-not (:ok valid)
          valid
          (try
            (let [args' (keywordize-keys-recursive args)
                  v ((:invoke tool) args')]
              {:ok true :value v})
            (catch Throwable t
              {:ok false
               :error :tool-threw
               :details {:name name* :message (.getMessage t)}})))))))

(defmacro def-tool
  "Define + register a tool.

  Supports optional :args-spec (clojure.spec.alpha) for runtime validation.

  Example:

  (s/def ::city string?)
  (s/def ::get-temp-args (s/keys :req-un [::city]))

  (def-tool get_temperature
    {:description \"Get temp\"
     :parameters {:type :object
                  :required [:city]
                  :properties {:city {:type :string}}}
     :args-spec ::get-temp-args}
    [{:keys [city]}]
    \"22°C\")"
  [sym {:keys [name description parameters bench/cases args-spec] :as meta} argvec & body]
  (let [tool-name (or name (name sym))
        impl-sym (symbol (str (name sym) "-invoke"))]
    `(do
       (defn ~impl-sym ~argvec ~@body)
       (def ~sym
         (register-tool!
           {:name ~tool-name
            :description ~description
            :parameters ~parameters
            :args-spec ~args-spec
            :bench/cases ~bench/cases
            :invoke ~impl-sym}))
       ~sym)))
```

---

# 2) New: `promethean.benchmark.agents` + `def-agent`

**`cache/benchmark/src/promethean/benchmark/agents.clj`**

```clj
(ns promethean.benchmark.agents
  "Agent definition + registry for benchmarks.

  This is intentionally lightweight and benchmark-oriented.

  OpenAI Agent SDK-ish shape:
  - name
  - instructions (system prompt)
  - model
  - tools (subset of registered tools or nil => all tools)
  - think/options (passed to Ollama)

  Agents are used by benchmarks to provide consistent system behavior."
  (:require
    [clojure.string :as str]
    [promethean.benchmark.tools :as tools]))

(defonce ^:private *agents (atom {}))

(defn clear-agents! [] (reset! *agents {}))
(defn agents [] (vals @*agents))
(defn agent-by-name [n] (get @*agents n))

(defn- normalize-agent-name [n]
  (cond
    (keyword? n) (name n)
    (string? n) n
    (symbol? n) (name n)
    (nil? n) ""
    :else (str n)))

(defn register-agent!
  "Register an agent definition.

  Required:
  - :name
  - :instructions (string)

  Optional:
  - :model
  - :tools   (vector of tool names or tool vars) ; nil => all tools
  - :think
  - :options"
  [{:keys [name instructions tools model think options] :as agent}]
  (let [nm (normalize-agent-name name)]
    (when (str/blank? nm)
      (throw (ex-info "Agent name cannot be blank" {:agent agent})))
    (when-not (string? instructions)
      (throw (ex-info "Agent :instructions must be a string" {:agent nm})))
    (swap! *agents assoc nm
           (assoc agent :name nm))
    (agent-by-name nm)))

(defn- tool-ref->name [t]
  (cond
    (string? t) t
    (keyword? t) (name t)
    (symbol? t) (name t)
    (map? t) (:name t)
    :else (str t)))

(defn agent-tools->schemas
  "Return Ollama tool schemas for the agent.

  If agent has :tools => subset that exists in registry.
  If :tools nil => all tools."
  [agent]
  (let [declared (:tools agent)]
    (if (seq declared)
      (let [names (set (map tool-ref->name declared))
            subset (filter (fn [t] (contains? names (:name t))) (tools/tools))]
        (mapv tools/tool->ollama-schema subset))
      (tools/tools->ollama-schemas))))

(defmacro def-agent
  "Define + register an agent.

  Example:

  (def-agent tool-tester
    {:instructions \"You are a tool-calling agent. Always use tools when relevant.\"
     :model \"qwen3\"
     :tools [add mul]
     :think false
     :options {:temperature 0.2 :seed 1}})"
  [sym {:keys [name instructions tools model think options] :as meta}]
  (let [agent-name (or name (name sym))]
    `(def ~sym
       (register-agent!
         {:name ~agent-name
          :instructions ~instructions
          :tools ~tools
          :model ~model
          :think ~think
          :options ~options}))))
```

---

# 3) Replace the benchmark runner (tool choice tests + agent support)

**`cache/benchmark/src/promethean/benchmark/bench/tool_calling.clj`**

```clj
(ns promethean.benchmark.bench.tool-calling
  "Tool-calling benchmark runner for Ollama.

  Adds:
  - --tools tools.clj (required) tool defs + implementations via def-tool
  - --agents agents.clj (optional) agent defs via def-agent
  - --agent \"name\" (optional) which agent to use
  - --cases cases.edn (optional) overrides tool-provided cases

  Case expectations supported:
  - strict call sequence:
      :expect {:calls [{:tool \"add\" :arguments {...}} ...]}
  - tool choice (first call must pick correct tool):
      :expect {:choose {:tool \"add\" :arguments-subset {...}}}
  - final answer checks:
      :expect {:final {:contains \"...\"}} or {:final {:regex \"...\"}}"
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
  ;; Ollama style:
  ;; {:type "function" :function {:name "...", :arguments {...}}}
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

(defn- expected-calls [expect]
  (cond
    (nil? expect) nil
    (vector? (:calls expect)) (:calls expect)
    :else nil))

(defn- expected-choose [expect]
  (:choose expect))

(defn- expected-final [expect]
  (:final expect))

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

(defn- match-choose
  "Tool-choice match: only checks FIRST tool call.
  Optional :arguments-subset to avoid brittleness."
  [actual-calls {:keys [tool arguments-subset]}]
  (let [first-call (first actual-calls)
        args (tools/coerce-arguments (:arguments first-call))
        args-kw (when args (into {} (map (fn [[k v]] [(keyword (name k)) v]) args)))]
    (cond
      (nil? first-call)
      {:ok false :error :no-tool-call}

      (not= tool (:name first-call))
      {:ok false :error :wrong-tool
       :details {:expected tool :got (:name first-call)}}

      (and (some? arguments-subset)
           (not (match-args-subset? arguments-subset (or args-kw {}))))
      {:ok false :error :wrong-arguments
       :details {:expected_subset arguments-subset :got (or args-kw {})}}

      :else
      {:ok true})))

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

(defn- score-case [case tool-calls final-content stopped-reason]
  (let [total (count tool-calls)
        valid-n (count (filter #(true? (get-in % [:valid :ok])) tool-calls))
        invoked-n (count (filter #(true? (get-in % [:invoked :ok])) tool-calls))
        validity-rate (if (pos? total) (/ valid-n total) 1.0)
        invoked-rate  (if (pos? total) (/ invoked-n total) 1.0)

        expect (:expect case)
        exp-calls (expected-calls expect)
        exp-choose (expected-choose expect)
        exp-final (expected-final expect)

        calls-match (when (seq exp-calls)
                      (match-calls-strict
                        (mapv (fn [c] {:name (:name c)
                                       :arguments (tools/coerce-arguments (:arguments c))})
                              tool-calls)
                        exp-calls))

        choose-match (when (some? exp-choose)
                       (match-choose tool-calls exp-choose))

        final-match (match-final exp-final final-content)

        ;; scoring weights
        w-valid 0.40
        w-invk  0.30
        w-calls (if (seq exp-calls) 0.20 0.0)
        w-choose (if (some? exp-choose) 0.20 0.0)
        w-final (if (some? exp-final) 0.10 0.0)

        base (+ (* w-valid validity-rate)
                (* w-invk invoked-rate)
                (* w-calls (if (and calls-match (:ok calls-match)) 1.0 0.0))
                (* w-choose (if (and choose-match (:ok choose-match)) 1.0 0.0))
                (* w-final (if (:ok final-match) 1.0 0.0)))

        score (if (= stopped-reason :max_steps) (* 0.5 base) base)]
    {:tool_calls_count total
     :tool_calls_valid_count valid-n
     :tool_calls_invoked_count invoked-n
     :validity_rate validity-rate
     :invoked_rate invoked-rate
     :expected_calls_present (boolean (seq exp-calls))
     :expected_calls_match (when (seq exp-calls) (boolean (:ok calls-match)))
     :expected_calls_error (when (seq exp-calls) (dissoc calls-match :ok))
     :expected_choose_present (boolean (some? exp-choose))
     :expected_choose_match (when (some? exp-choose) (boolean (:ok choose-match)))
     :expected_choose_error (when (some? exp-choose) (dissoc choose-match :ok))
     :expected_final_present (boolean (some? exp-final))
     :expected_final_match (boolean (:ok final-match))
     :expected_final_error (dissoc final-match :ok)
     :stopped_reason stopped-reason
     :score score}))

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

  Returns results map."
  [{:keys [host model tools-file agents-file agent-name cases-file max-steps think options timeout-ms out]
    :or {host ollama/default-host
         max-steps 4
         timeout-ms 300000}}]
  (when (or (nil? tools-file) (str/blank? (str tools-file)))
    (throw (ex-info "Missing :tools-file" {})))

  (let [_tool-count (load-tools-file! tools-file)

        _agent-count (when agents-file (load-agents-file! agents-file))
        agent (when agent-name (agents/agent-by-name agent-name))

        ;; agent may override model/think/options + tool subset
        model* (or (:model agent) model)
        think* (if (some? (:think agent)) (:think agent) think)
        options* (or (:options agent) options)

        _ (when (or (nil? model*) (str/blank? (str model*)))
            (throw (ex-info "Missing :model (either pass :model or define it on the agent)" {})))

        tools-schemas (if agent
                        (agents/agent-tools->schemas agent)
                        (tools/tools->ollama-schemas))

        cases (build-cases {:cases-file cases-file})
        started (now-ms)

        results
        (mapv
          (fn [c]
            (let [c (normalize-case c)
                  t0 (now-ms)

                  system-msg (when agent
                               {:role "system" :content (:instructions agent)})

                  base-messages
                  (cond
                    (vector? (:messages c)) (:messages c)
                    (string? (:prompt c)) [{:role "user" :content (:prompt c)}]
                    :else [{:role "user" :content (str (:prompt c))}])

                  initial-messages
                  (cond-> []
                    (some? system-msg) (conj system-msg)
                    true (into base-messages))

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

                  score (score-case c tool-calls final-content (:stopped_reason loop-result))]
              {:id (:id c)
               :prompt (:prompt c)
               :messages (:messages c)
               :expect (:expect c)
               :duration_ms (- t1 t0)
               :final_assistant {:content final-content
                                 :tool_calls (assistant->tool-calls final-assistant)}
               :tool_calls tool-calls
               :score score}))
          cases)

        finished (now-ms)

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
           :mean_score mean-score})

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
         :started_ms started
         :finished_ms finished
         :summary summary
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
                     :out out})]
      (println (json/generate-string (:summary res) {:pretty true})))))
```

---

# 4) Example `tools.clj` using spec validation

```clj
(ns my.bench.tools
  (:require
    [clojure.spec.alpha :as s]
    [promethean.benchmark.tools :refer [def-tool]]))

(s/def ::a int?)
(s/def ::b int?)
(s/def ::add-args (s/keys :req-un [::a ::b]))

(def-tool add
  {:description "Add two integers"
   :parameters {:type :object
                :required [:a :b]
                :properties {:a {:type :integer}
                             :b {:type :integer}}}
   :args-spec ::add-args}
  [{:keys [a b]}]
  (+ a b))

(def-tool mul
  {:description "Multiply two integers"
   :parameters {:type :object
                :required [:a :b]
                :properties {:a {:type :integer}
                             :b {:type :integer}}}
   :args-spec ::add-args}
  [{:keys [a b]}]
  (* a b))
```

Now your eval will catch:

* wrong arg types
* missing keys
* malformed JSON-string args

---

# 5) Example `agents.clj` (new `def-agent`)

```clj
(ns my.bench.agents
  (:require [promethean.benchmark.agents :refer [def-agent]]))

(def-agent strict-tool-caller
  {:instructions
   "You are a tool calling agent.
    If a tool exists that can help, you MUST call it.
    Do not answer directly until tool calls are complete."
   :model "qwen3"
   :think false
   :options {:temperature 0.2 :seed 1}})
```

---

# 6) Tool-choice cases (`cases.edn`)

This is the “pick the correct tool” thing (no hand-holding “call tool X” prompt):

```clj
[
 {:id "choice/math"
  :prompt "What is 7 times 9? Use tools if available."
  :expect {:choose {:tool "mul"
                    :arguments-subset {:a 7 :b 9}}
           :final {:contains "63"}}}

 {:id "choice/add"
  :prompt "Compute 40 plus 2. Use tools."
  :expect {:choose {:tool "add"
                    :arguments-subset {:a 40 :b 2}}
           :final {:contains "42"}}}
]
```

The benchmark will score:

* did it choose the right tool?
* did args at least contain the expected subset?
* were tool calls valid + did execution succeed?

---

# 7) Run it

```bash
clj -M -m promethean.benchmark.bench.tool-calling \
  --host http://localhost:11434 \
  --tools ./tools.clj \
  --agents ./agents.clj \
  --agent strict-tool-caller \
  --cases ./cases.edn \
  --out ./tool_calling_results.json \
  --max-steps 4
```

---

## Next step (I can implement immediately if you want)

The real killer feature for tool-choice benchmarks is **decoy pressure**:

* same domain tools (“add”, “sum”, “calc”, “math_eval”)
* partially correct tools (“lookup”, “search”) that *shouldn’t* be used
* score penalties for *unnecessary* tool calls

If you say “continue”, I’ll add:

* **confusion-matrix stats** per tool (`expected tool` vs `chosen tool`)
* per-tool precision/recall
* an optional `:penalize-extra-calls?` mode for choice cases
