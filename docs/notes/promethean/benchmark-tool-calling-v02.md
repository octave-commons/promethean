Alright — here’s the **next chunk**: I’m going to harden what you already have into something you can actually lean on for real tool-calling eval.

Big fixes / upgrades:

* ✅ **JSON Schema is now actually JSON** (string keys, string `"type"`, etc). Your previous `:parameters` could silently be “Clojure schema-ish” and break tool calling.
* ✅ **Tool call args can be a map OR a JSON string** (both show up in the wild).
* ✅ **Tool result messages include `tool_call_id`** (critical for compatibility; Ollama ecosystems often expect this). ([GitHub][1])
* ✅ **Cases can expect multiple tool calls** in sequence, not just the first.
* ✅ Adds optional final-answer expectations (`:final {:contains ...}` or `:final {:regex ...}`).

Below are **full-file replacements**.

---

# 1) Replace `promethean.benchmark.tools`

**`cache/benchmark/src/promethean/benchmark/tools.clj`**

```clj
(ns promethean.benchmark.tools
  "Tool definition + registry for tool-calling benchmarks.

  User provides a tools.clj which `load-file`s into the runtime and registers tools
  via `def-tool`.

  Each tool becomes:
  - registry entry (name -> {:name :description :parameters :invoke ...})
  - Ollama/OpenAI-ish tool schema:
      {:type \"function\"
       :function {:name \"...\"
                  :description \"...\"
                  :parameters { ...JSON Schema... }}}

  IMPORTANT:
  - JSON Schema must be *real JSON* (string keys), we normalize for you.
  - Tool call arguments may arrive as a map OR a JSON string; we coerce both."
  (:require
    [cheshire.core :as json]
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
  - keyword/symbol values -> string values
  - vectors/lists -> vectors
  - maps -> maps"
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
  - :parameters  (JSON Schema map — we'll normalize)
  - :invoke      (fn [args-map] ...)

  Optional keys:
  - :bench/cases (vector of cases)

  Returns normalized tool map."
  [{:keys [name description parameters invoke] :as tool}]
  (let [tool-name (normalize-tool-name name)
        params-json (jsonify parameters)
        tool* (-> tool
                  (assoc :name tool-name)
                  (assoc :description (or description ""))
                  (assoc :parameters params-json))]
    (when (str/blank? tool-name)
      (throw (ex-info "Tool name cannot be blank" {:tool tool})))
    (when-not (map? (:parameters tool*))
      (throw (ex-info "Tool :parameters must be a JSON schema map" {:tool tool*})))
    (when-not (ifn? invoke)
      (throw (ex-info "Tool :invoke must be callable" {:tool tool*})))
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
  - required keys are present (per JSON schema)

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
            required (set (get schema "required" []))         ;; strings
            args-kw (keywordize-keys-recursive args)
            present (set (map name (keys args-kw)))           ;; strings
            missing (seq (remove present required))]
        (if missing
          {:ok false
           :error :missing-required
           :details {:name name
                     :missing (vec missing)
                     :required (vec required)}}
          {:ok true})))))

(defn invoke-tool!
  "Invoke a registered tool by name with arguments (map or JSON string).

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
      (try
        (let [args' (keywordize-keys-recursive args)
              v ((:invoke tool) args')]
          {:ok true :value v})
        (catch Throwable t
          {:ok false
           :error :tool-threw
           :details {:name name* :message (.getMessage t)}})))))

(defmacro def-tool
  "Define + register a tool.

  Example:

  (def-tool get_temperature
    {:description \"Get temp\"
     :parameters {:type :object
                  :required [:city]
                  :properties {:city {:type :string}}}
     :bench/cases [{:id \"nyc\"
                    :prompt \"What is the temperature in New York?\"
                    :expect {:arguments {:city \"New York\"}}}]}
    [{:keys [city]}]
    \"22°C\")

  Implementation receives ONE arg: an args map."
  [sym {:keys [name description parameters bench/cases] :as meta} argvec & body]
  (let [tool-name (or name (name sym))
        impl-sym (symbol (str (name sym) "-invoke"))]
    `(do
       (defn ~impl-sym ~argvec ~@body)
       (def ~sym
         (register-tool!
           {:name ~tool-name
            :description ~description
            :parameters ~parameters
            :bench/cases ~bench/cases
            :invoke ~impl-sym}))
       ~sym)))
```

---

# 2) Replace the tool-calling benchmark runner (multi-call + tool_call_id)

**`cache/benchmark/src/promethean/benchmark/bench/tool_calling.clj`**

```clj
(ns promethean.benchmark.bench.tool-calling
  "Tool-calling benchmark runner for Ollama.

  Adds:
  - --tools tools.clj (required) which defines tools + implementations via def-tool
  - --cases cases.edn (optional) overrides any :bench/cases from tools.clj
  - multi-tool-call sequence checking
  - final answer expectations (contains/regex)

  Notes:
  Tool result messages include tool_call_id for compatibility. :contentReference[oaicite:1]{index=1}"
  (:require
    [cheshire.core :as json]
    [clojure.edn :as edn]
    [clojure.java.io :as io]
    [clojure.string :as str]
    [promethean.benchmark.ollama :as ollama]
    [promethean.benchmark.tools :as tools])
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
                       (update :expect #(or % {}))
                       (update :expect (fn [e]
                                         (-> e
                                             ;; legacy format: allow {:arguments {...}} only
                                             (cond-> (nil? (:tool e)) (assoc :tool (:name t))))))))))
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
  ;; {:type "function"
  ;;  :function {:name "...", :arguments {...}}}
  ;; Some ecosystems include an id/tool_call_id/index somewhere.
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
  ;; Most compatible message format uses:
  ;; - role: "tool"
  ;; - tool_call_id: (string)
  ;; - name: tool name
  ;; - content: string
  ;;
  ;; (Some stacks accept tool_name; we include both for safety.)
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
  "Runs an agent loop until the model stops returning tool_calls or max-steps is hit.

  Returns:
  {:messages [...]
   :steps [...]
   :final_assistant {...}
   :stopped_reason :no_tool_calls | :max_steps }"
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

    ;; legacy:
    (some? (:tool expect))
    [{:tool (:tool expect) :arguments (:arguments expect)}]

    (some? (:arguments expect))
    [{:tool (:tool expect) :arguments (:arguments expect)}]

    :else nil))

(defn- expected-final [expect]
  (:final expect))

(defn- normalize-call-expectation [c]
  {:tool (:tool c)
   :arguments (or (:arguments c) {})})

(defn- match-calls-strict
  "Strict match of expected calls in sequence, and optionally no extras.
  Returns {:ok true} or {:ok false ...}."
  [actual expected {:keys [no-extras?] :or {no-extras? true}}]
  (let [a (vec actual)
        e (vec (map normalize-call-expectation expected))]
    (cond
      (empty? e) {:ok true}

      (< (count a) (count e))
      {:ok false
       :error :missing-calls
       :details {:expected_count (count e) :actual_count (count a)}}

      :else
      (let [pairs (map vector a e)
            mismatches
            (keep-indexed
              (fn [idx [{:keys [name arguments]} {:keys [tool arguments :as exp]}]]
                (cond
                  (not= tool name)
                  {:i idx :error :wrong-tool :expected tool :got name}

                  (not= (or arguments {}) (or (:arguments exp) {}))
                  {:i idx :error :wrong-arguments :expected (:arguments exp) :got (or arguments {})}

                  :else nil))
              pairs)

            extras? (and no-extras? (> (count a) (count e)))]
        (cond
          (seq mismatches)
          {:ok false :error :mismatch :details {:mismatches (vec mismatches)}}

          extras?
          {:ok false :error :extra-calls
           :details {:expected_count (count e) :actual_count (count a)}}

          :else
          {:ok true})))))

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
        exp-final (expected-final expect)

        call-match (when (seq exp-calls)
                     (match-calls-strict
                       (mapv (fn [c] {:name (:name c) :arguments (tools/coerce-arguments (:arguments c))}) tool-calls)
                       exp-calls
                       {:no-extras? true}))

        final-match (match-final exp-final final-content)

        ;; Simple weighted score:
        ;; - 40% validity
        ;; - 30% invocation success
        ;; - 20% expectation match (if present)
        ;; - 10% final answer expectation (if present)
        w-valid 0.40
        w-invk  0.30
        w-exp   (if (seq exp-calls) 0.20 0.0)
        w-final (if (some? exp-final) 0.10 0.0)
        base (+ (* w-valid validity-rate)
                (* w-invk invoked-rate)
                (* w-exp (if (and call-match (:ok call-match)) 1.0 0.0))
                (* w-final (if (:ok final-match) 1.0 0.0)))

        ;; Hard penalty if we hit max steps (model kept tool-calling forever)
        score (if (= stopped-reason :max_steps) (* 0.5 base) base)]
    {:tool_calls_count total
     :tool_calls_valid_count valid-n
     :tool_calls_invoked_count invoked-n
     :validity_rate validity-rate
     :invoked_rate invoked-rate
     :expected_calls_present (boolean (seq exp-calls))
     :expected_calls_match (when (seq exp-calls) (boolean (:ok call-match)))
     :expected_calls_error (when (seq exp-calls) (dissoc call-match :ok))
     :expected_final_present (boolean (some? exp-final))
     :expected_final_match (boolean (:ok final-match))
     :expected_final_error (dissoc final-match :ok)
     :stopped_reason stopped-reason
     :score score}))

(defn run!
  "Run the tool calling benchmark.

  opts:
  - :host        (default ollama/default-host)
  - :model       (required)
  - :tools-file  (required path to tools.clj)
  - :cases-file  (optional path to cases.edn)
  - :max-steps   (default 4)
  - :think       (optional bool)
  - :options     (optional map passed to Ollama)
  - :timeout-ms  (default 5 minutes)
  - :out         (optional output json path)

  Returns results map."
  [{:keys [host model tools-file cases-file max-steps think options timeout-ms out]
    :or {host ollama/default-host
         max-steps 4
         timeout-ms 300000}}]
  (when (or (nil? model) (str/blank? (str model)))
    (throw (ex-info "Missing :model" {})))
  (when (or (nil? tools-file) (str/blank? (str tools-file)))
    (throw (ex-info "Missing :tools-file" {})))

  (let [_tool-count (load-tools-file! tools-file)
        tools-schemas (tools/tools->ollama-schemas)
        cases (build-cases {:cases-file cases-file})
        started (now-ms)

        results
        (mapv
          (fn [c]
            (let [c (normalize-case c)
                  t0 (now-ms)
                  initial-messages
                  (cond
                    (vector? (:messages c)) (:messages c)
                    (string? (:prompt c)) [{:role "user" :content (:prompt c)}]
                    :else [{:role "user" :content (str (:prompt c))}])

                  loop-result
                  (run-agent-loop!
                    {:host host
                     :model model
                     :think think
                     :options options
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
                           0.0)
              matched (count (filter #(true? (get-in % [:score :expected_calls_match])) results))
              valid-all (count (filter #(>= (get-in % [:score :validity_rate]) 1.0) results))
              invoked-all (count (filter #(>= (get-in % [:score :invoked_rate]) 1.0) results))]
          {:total_cases n
           :avg_case_duration_ms avg
           :mean_score mean-score
           :cases_with_all_calls_valid valid-all
           :cases_with_all_calls_invoked invoked-all
           :cases_expected_calls_matched matched})

        out-map
        {:benchmark "tool-calling"
         :model model
         :host host
         :tools_file tools-file
         :cases_file cases-file
         :max_steps max-steps
         :think think
         :options options
         :started_ms started
         :finished_ms finished
         :summary summary
         :results results}]

    (when (some? out)
      (write-json-file! out out-map))
    out-map))

;; lightweight CLI entrypoint (no tools.cli)
(defn -main [& args]
  (let [m (->> (partition 2 args)
               (map (fn [[k v]] [(keyword (subs k 2)) v]))
               (into {}))
        host (get m :host ollama/default-host)
        model (get m :model)
        tools-file (get m :tools)
        cases-file (get m :cases)
        max-steps (some-> (get m :max-steps) parse-long)
        out (get m :out)
        think (some-> (get m :think) Boolean/parseBoolean)
        options (some-> (get m :options) edn/read-string)]
    (let [res (run! {:host host
                     :model model
                     :tools-file tools-file
                     :cases-file cases-file
                     :max-steps (or max-steps 4)
                     :think think
                     :options options
                     :out out})]
      (println (json/generate-string (:summary res) {:pretty true})))))
```

---

# 3) `cases.edn` format (new, richer)

You can now define cases like this:

**`cases.edn`**

```clj
[
 ;; single expected tool call
 {:id "add-2-3"
  :prompt "Call tool \"add\" with {:a 2 :b 3}. Use a tool call."
  :expect {:calls [{:tool "add" :arguments {:a 2 :b 3}}]
           :final {:contains "5"}}}

 ;; multi tool call sequence (strict, no extras)
 {:id "compose"
  :messages [{:role "user"
              :content "First call tool \"add\" with {:a 1 :b 2}. Then call tool \"mul\" with {:a 3 :b 4}. Use tools."}]
  :expect {:calls [{:tool "add" :arguments {:a 1 :b 2}}
                   {:tool "mul" :arguments {:a 3 :b 4}}]}}

 ;; final regex scoring only (no expected calls)
 {:id "final-regex-only"
  :prompt "Say hello in a single sentence."
  :expect {:final {:regex "hello|hi"}}}
]
```

---

# 4) Example `tools.clj` (with multiple tools)

**`tools.clj`**

```clj
(ns my.bench.tools
  (:require [promethean.benchmark.tools :refer [def-tool]]))

(def-tool add
  {:description "Add two integers"
   :parameters {:type :object
                :required [:a :b]
                :properties {:a {:type :integer}
                             :b {:type :integer}}}}
  [{:keys [a b]}]
  (+ a b))

(def-tool mul
  {:description "Multiply two integers"
   :parameters {:type :object
                :required [:a :b]
                :properties {:a {:type :integer}
                             :b {:type :integer}}}}
  [{:keys [a b]}]
  (* a b))
```

---

# 5) Run it

```bash
clj -M -m promethean.benchmark.bench.tool-calling \
  --host http://localhost:11434 \
  --model qwen3 \
  --tools ./tools.clj \
  --cases ./cases.edn \
  --out ./tool_calling_results.json \
  --options "{:temperature 0.2 :seed 1}" \
  --max-steps 4
```

---

# Next logical upgrades (if you want me to keep going)

These are the things that make this benchmark *actually* useful at scale:

## A) Argument matching that isn’t brittle

Right now expected args are strict equality. We can add:

* subset matching (expected keys must match, extra keys allowed)
* numeric tolerance
* string normalization

## B) “Tool choice” tests (selection, not just formatting)

Create test sets where multiple tools exist and **only one is correct**.
Score:

* wrong tool called = hard fail
* no tool called = fail
* correct tool + bad args = partial

## C) Multi-step tool planning (ReAct-ish without prompt hacking)

Cases that require:

* tool A → use result to decide tool B
* detect “tool loop” behavior and penalize

## D) Parallel runner

Run N cases concurrently (thread pool) to benchmark throughput.

If you say “keep going”, I’ll implement **A + B + D** cleanly and keep the API stable.

[1]: https://github.com/ollama/ollama/issues/12158?utm_source=chatgpt.com "Response message after a tool_call with OpenAI chat ..."
