Below is a complete, repo-ready implementation of:

1. a shared **`ollama`** client namespace (for all benchmarks)
2. a tiny **tool registry + `def-tool` macro** (so `tools.clj` can define tools + implementations)
3. a new **tool-calling benchmark** that loads `tools.clj`, runs an agent loop, and scores tool-calling quality

---

## 1) Shared Ollama namespace (for all benchmarks)

**`cache/benchmark/src/promethean/benchmark/ollama.clj`**

```clj
(ns promethean.benchmark.ollama
  "Shared Ollama client helpers for benchmarks.

  Implements the non-streaming /api/chat call and returns the parsed JSON response.
  Benchmarks can share this namespace instead of re-implementing HTTP + JSON.

  Docs:
  - Tool calling: https://docs.ollama.com/capabilities/tool-calling"
  (:require
    [cheshire.core :as json]
    [clojure.string :as str])
  (:import
    (java.net URI)
    (java.net.http HttpClient HttpRequest HttpResponse$BodyHandlers)
    (java.time Duration)))

(def ^:private default-timeout-ms 300000) ;; 5 minutes
(def default-host "http://localhost:11434")

(defn- normalize-host [host]
  (cond
    (nil? host) default-host
    (str/blank? host) default-host
    :else (str/replace host #"/+$" "")))

(defn- uri [host path]
  (URI/create (str (normalize-host host) path)))

(defn- http-client ^HttpClient []
  ;; A single client is fine, but creating on-demand is okay for benchmarks.
  (-> (HttpClient/newBuilder)
      (.connectTimeout (Duration/ofMillis default-timeout-ms))
      (.build)))

(defn- post-json!
  "POST a JSON body to an Ollama endpoint and parse JSON response into a Clojure map.
   Returns parsed response with keyword keys."
  [{:keys [host path body timeout-ms]
    :or {host default-host
         timeout-ms default-timeout-ms}}]
  (let [client (http-client)
        req (-> (HttpRequest/newBuilder (uri host path))
                (.timeout (Duration/ofMillis (long timeout-ms)))
                (.header "Content-Type" "application/json")
                (.POST (HttpRequest$BodyPublishers/ofString (json/generate-string body)))
                (.build))
        resp (.send client req (HttpResponse$BodyHandlers/ofString))
        status (.statusCode resp)
        text (.body resp)]
    (when-not (<= 200 status 299)
      (throw (ex-info "Ollama HTTP error"
                      {:status status
                       :path path
                       :body text})))
    (json/parse-string text true)))

(defn chat!
  "Call Ollama /api/chat.

  opts:
  - :host          (default http://localhost:11434)
  - :model         (required)
  - :messages      (required) [{:role \"user\" :content \"...\"} ...]
  - :tools         (optional) ollama tool schemas [{:type \"function\" :function {...}} ...]
  - :stream        (default false) (this helper is non-streaming)
  - :think         (optional true/false for models that support it)
  - :options       (optional map) passed to Ollama (temperature, seed, etc)
  - :timeout-ms    (default 5 minutes)

  Returns the parsed JSON response.
  The assistant message is usually at (:message resp)."
  [{:keys [host model messages tools stream think options timeout-ms]
    :or {host default-host
         stream false}}]
  (when (true? stream)
    (throw (ex-info "This benchmark client currently supports stream=false only."
                    {:hint "Use a streaming client if you need chunked tool_calls."})))
  (when (or (nil? model) (str/blank? (str model)))
    (throw (ex-info "Missing required :model" {})))
  (when-not (sequential? messages)
    (throw (ex-info "Missing/invalid :messages (must be a vector/list)" {:messages messages})))
  (post-json! {:host host
               :path "/api/chat"
               :timeout-ms timeout-ms
               :body (cond-> {:model model
                              :messages messages
                              :stream false}
                       (some? tools) (assoc :tools tools)
                       (some? think) (assoc :think think)
                       (some? options) (assoc :options options))}))
```

---

## 2) Tool registry + `def-tool` macro (what your `tools.clj` will use)

**`cache/benchmark/src/promethean/benchmark/tools.clj`**

```clj
(ns promethean.benchmark.tools
  "Tool definition + registry for tool-calling benchmarks.

  The benchmark loads a user-provided tools.clj via `load-file`.
  That file should `require` this namespace and define tools using `def-tool`.

  Each tool becomes:
  - a registry entry (name -> {:name :description :parameters :invoke ...})
  - an Ollama/OpenAI-style tool schema (type=function, function={name,description,parameters})

  `def-tool` resembles OpenAI Agent SDK tool defs:
  - you provide name/description/parameters
  - you provide an implementation fn body receiving a single args-map"
  (:require
    [clojure.walk :as walk]
    [clojure.string :as str]))

(defonce ^:private *registry (atom {}))

(defn clear-tools! []
  (reset! *registry {}))

(defn tools []
  (vals @*registry))

(defn tool-by-name [tool-name]
  (get @*registry tool-name))

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

(defn- stringify-keywords-recursive [x]
  ;; JSON Schema wants string keys + values (e.g. "object"), not :object
  (walk/postwalk
    (fn [v]
      (cond
        (keyword? v) (name v)
        :else v))
    x))

(defn- normalize-tool-name [n]
  (cond
    (keyword? n) (name n)
    (string? n) n
    (symbol? n) (name n)
    :else (str n)))

(defn register-tool!
  "Register a tool (runtime), returning the tool map.

  Required keys:
  - :name
  - :description
  - :parameters  (JSON schema object for arguments)

  Optional keys:
  - :bench/cases  [{:id ... :prompt ... :expect {:arguments {...}}} ...]

  Implementation key:
  - :invoke  (fn [args-map] ...)  -> return any value (will be stringified for tool message content)"
  [{:keys [name description parameters invoke] :as tool}]
  (let [tool-name (normalize-tool-name name)
        tool* (-> tool
                  (assoc :name tool-name)
                  (assoc :description (or description ""))
                  (update :parameters stringify-keywords-recursive))]
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
  "Validate a tool call structure against registry + required fields in JSON schema.

  Returns {:ok true} or {:ok false :error ... :details ...}"
  [{:keys [name arguments]}]
  (let [tool (tool-by-name name)]
    (cond
      (nil? tool)
      {:ok false
       :error :unknown-tool
       :details {:name name}}

      (not (map? arguments))
      {:ok false
       :error :invalid-arguments
       :details {:name name :arguments arguments}}

      :else
      (let [schema (:parameters tool)
            required (set (get schema "required" []))
            ;; Ollama gives args as JSON -> parsed as keywords by our client,
            ;; but we accept string or keyword keys.
            args-kw (keywordize-keys-recursive arguments)
            present (set (map name (keys args-kw)))
            missing (seq (remove present required))]
        (if missing
          {:ok false
           :error :missing-required
           :details {:name name
                     :missing (vec missing)
                     :required (vec required)}}
          {:ok true})))))

(defn invoke-tool!
  "Invoke a registered tool by name with arguments map.

  - keywordizes arg keys recursively
  - returns {:ok true :value ...} or {:ok false :error ...}"
  [tool-name arguments]
  (let [name* (normalize-tool-name tool-name)
        tool (tool-by-name name*)]
    (cond
      (nil? tool)
      {:ok false :error :unknown-tool :details {:name name*}}

      :else
      (try
        (let [args (keywordize-keys-recursive arguments)
              v ((:invoke tool) args)]
          {:ok true :value v})
        (catch Throwable t
          {:ok false
           :error :tool-threw
           :details {:name name* :message (.getMessage t)}})))))

(defmacro def-tool
  "Define + register a tool.

  Example:

  (def-tool get_temperature
    {:description \"Get the current temperature for a city\"
     :parameters {:type :object
                  :required [:city]
                  :properties {:city {:type :string :description \"City name\"}}}
     :bench/cases [{:id \"nyc\"
                    :prompt \"What is the temperature in New York?\"
                    :expect {:arguments {:city \"New York\"}}}]}
    [{:keys [city]}]
    (str \"22°C in \" city))

  The implementation is called with ONE argument: an args-map."
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

## 3) New benchmark: tool calling evaluation

This benchmark:

* accepts the **same baseline arguments** (model/host/options/output/etc)
* **adds** `--tools tools.clj`
* loads tool definitions + implementations via `load-file`
* runs an **agent loop** until the model stops requesting tools
* scores:

  * tool call validity (known tool + required args)
  * tool call correctness (if a case provides an expected tool+args)
  * tool execution success

**`cache/benchmark/src/promethean/benchmark/bench/tool_calling.clj`**

```clj
(ns promethean.benchmark.bench.tool-calling
  "Tool-calling benchmark runner for Ollama.

  Usage idea (bb or clj):
    - Provide --tools path/to/tools.clj
    - Optionally provide --cases path/to/cases.edn
    - Otherwise, uses tools' :bench/cases if present, or auto-generates direct-call cases."
  (:require
    [cheshire.core :as json]
    [clojure.edn :as edn]
    [clojure.java.io :as io]
    [clojure.string :as str]
    [promethean.benchmark.ollama :as ollama]
    [promethean.benchmark.tools :as tools])
  (:import
    (java.time Instant Duration)))

;; -------------------------
;; Case format (EDN)
;; -------------------------
;; {:id "case-1"
;;  :prompt "What is the temperature in New York?"
;;  :expect {:tool "get_temperature"
;;           :arguments {:city "New York"}}}
;;
;; If :expect missing, we still validate that any tool calls were valid + executable.

(defn- now-ms [] (System/currentTimeMillis))

(defn- read-edn-file [path]
  (with-open [r (io/reader path)]
    (edn/read {:eof nil} r)))

(defn- write-json-file! [path data]
  (io/make-parents path)
  (spit path (json/generate-string data {:pretty true})))

(defn- duration-ms [t0 t1]
  (long (- t1 t0)))

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
                       (update :expect assoc :tool (:name t))))))
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
  ;; This creates explicit “call tool X with args Y” cases to test the
  ;; model's tool-call formatting and argument passing.
  (->> (tools/tools)
       (map (fn [t]
              (let [args (sample-args-for-tool t)]
                {:id (str "autogen/" (:name t))
                 :prompt (str
                           "Call the tool \"" (:name t) "\" with exactly these arguments:\n"
                           (pr-str args)
                           "\n\nDo not answer directly. Use a tool call.")
                 :expect {:tool (:name t)
                          :arguments args}})))
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
  ;; Ollama: {:role "assistant" :content "..." :tool_calls [...]}
  (or (:tool_calls assistant-message) []))

(defn- extract-call [tool-call]
  ;; Ollama tool call object:
  ;; {:type "function" :function {:name "...", :arguments {...}, :index 0}}
  (let [f (:function tool-call)]
    {:name (:name f)
     :arguments (:arguments f)
     :raw tool-call}))

(defn- call->tool-message [{:keys [name result]}]
  ;; Ollama tool result message format:
  ;; {:role "tool" :tool_name "get_temperature" :content "22°C"}
  {:role "tool"
   :tool_name name
   :content (cond
              (string? result) result
              :else (pr-str result))})

(defn- run-agent-loop!
  "Runs an agent loop until the model stops returning tool_calls or max-steps is hit.

  Returns:
  {:messages [...]
   :steps [...]
   :final-assistant {...} }"
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
         :final-assistant assistant
         :raw-last-response resp}
        (let [tool-results
              (mapv (fn [{:keys [name arguments] :as c}]
                      (let [valid (tools/validate-tool-call {:name name :arguments arguments})
                            invoked (when (:ok valid)
                                      (tools/invoke-tool! name arguments))]
                        (assoc c
                               :valid valid
                               :invoked invoked)))
                    tool-calls)
              tool-messages
              (mapv (fn [{:keys [name invoked]}]
                      (call->tool-message {:name name
                                           :result (if (:ok invoked)
                                                     (:value invoked)
                                                     invoked)}))
                    tool-results)
              messages'' (into messages' tool-messages)
              step {:i i
                    :assistant assistant
                    :tool_calls tool-results
                    :tool_messages tool-messages
                    :raw resp}]
          (recur messages'' (conj steps step) (inc i)))))))

(defn- match-expectation?
  "Checks (very strictly) whether the first tool call matches expected :tool and :arguments.
  Returns {:ok true} or {:ok false ...}"
  [tool-calls {:keys [tool arguments]}]
  (let [first-call (first tool-calls)]
    (cond
      (nil? first-call)
      {:ok false :error :no-tool-call}

      (not= tool (:name first-call))
      {:ok false :error :wrong-tool
       :details {:expected tool :got (:name first-call)}}

      (and (some? arguments)
           (not= arguments (or (:arguments first-call) {})))
      {:ok false :error :wrong-arguments
       :details {:expected arguments :got (:arguments first-call)}}

      :else
      {:ok true})))

(defn- score-case [{:keys [expect]} tool-calls]
  (let [validity (mapv (fn [c] (:ok (tools/validate-tool-call {:name (:name c) :arguments (:arguments c)})))
                       tool-calls)
        all-valid? (every? true? validity)
        invoked-ok? (every? true? (map (fn [c] (-> c :invoked :ok true?)) tool-calls))
        expected? (some? expect)
        match (when expected?
                (match-expectation? tool-calls expect))]
    {:tool_calls_count (count tool-calls)
     :all_tool_calls_valid all-valid?
     :all_tool_calls_invoked invoked-ok?
     :expected_match (when expected? (:ok match))
     :expected_error (when expected? (dissoc match :ok))}))

(defn run!
  "Run the tool calling benchmark.

  opts:
  - :host        (default ollama/default-host)
  - :model       (required)
  - :tools-file  (required path to tools.clj)
  - :cases-file  (optional path to cases.edn)
  - :max-steps   (default 4)
  - :think       (optional bool)
  - :options     (optional map passed to Ollama: {:temperature 0.2 :seed 123 ...})
  - :timeout-ms  (default 5 minutes)
  - :out         (optional output json path)

  Returns full results map."
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
                  loop-result
                  (run-agent-loop!
                    {:host host
                     :model model
                     :think think
                     :options options
                     :max-steps max-steps
                     :tools-schemas tools-schemas
                     :timeout-ms timeout-ms
                     :initial-messages [{:role "user" :content (:prompt c)}]})
                  t1 (now-ms)
                  last-assistant (:final-assistant loop-result)
                  tool-calls (->> (:steps loop-result)
                                  (mapcat :tool_calls)
                                  (mapv (fn [tc]
                                          ;; keep a lean view of each tool call in the output
                                          {:name (:name tc)
                                           :arguments (:arguments tc)
                                           :valid (:valid tc)
                                           :invoked (:invoked tc)})))
                  score (score-case c tool-calls)]
              {:id (:id c)
               :prompt (:prompt c)
               :expect (:expect c)
               :duration_ms (duration-ms t0 t1)
               :final_assistant {:content (:content last-assistant)
                                 :tool_calls (assistant->tool-calls last-assistant)}
               :tool_calls tool-calls
               :score score}))
          cases)
        finished (now-ms)

        summary
        (let [n (count results)
              valid (count (filter #(true? (get-in % [:score :all_tool_calls_valid])) results))
              invoked (count (filter #(true? (get-in % [:score :all_tool_calls_invoked])) results))
              matched (count (filter #(true? (get-in % [:score :expected_match])) results))
              avg (if (pos? n)
                    (long (/ (reduce + (map :duration_ms results)) n))
                    0)]
          {:total_cases n
           :all_calls_valid valid
           :all_calls_invoked invoked
           :expected_matched matched
           :avg_case_duration_ms avg})

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

;; Optional CLI entrypoint (simple, no deps on tools.cli)
(defn -main [& args]
  (let [m (->> (partition 2 args)
               (map (fn [[k v]]
                      [(keyword (subs k 2)) v]))
               (into {}))
        ;; basic parsing
        host (get m :host ollama/default-host)
        model (get m :model)
        tools-file (get m :tools)
        cases-file (get m :cases)
        max-steps (some-> (get m :max-steps) parse-long)
        out (get m :out)
        think (some-> (get m :think) Boolean/parseBoolean)
        ;; options as EDN: --options "{:temperature 0.2 :seed 123}"
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

## `tools.clj` format (the thing you pass into the benchmark)

Here’s a minimal example `tools.clj` showing the **definition + implementation** style:

**`tools.clj`**

```clj
(ns my.bench.tools
  (:require [promethean.benchmark.tools :refer [def-tool]]))

(def-tool get_temperature
  {:description "Get the current temperature for a city"
   :parameters {:type :object
                :required [:city]
                :properties {:city {:type :string
                                    :description "The name of the city"}}}
   :bench/cases [{:id "nyc"
                  :prompt "What is the temperature in New York?"
                  :expect {:arguments {:city "New York"}}}]}
  [{:keys [city]}]
  (case city
    "New York" "22°C"
    "London" "15°C"
    "Tokyo" "18°C"
    "Unknown"))
```

✅ This file contains:

* tool definitions (name/description/schema)
* implementations (the body of the tool)
* optional benchmark cases

---

## Running it

### Clojure

```bash
clj -M -m promethean.benchmark.bench.tool-calling \
  --host http://localhost:11434 \
  --model qwen3 \
  --tools ./tools.clj \
  --out ./tool_calling_results.json \
  --options "{:temperature 0.2 :seed 1}" \
  --max-steps 4
```

### Babashka

```bash
bb -m promethean.benchmark.bench.tool-calling \
  --model qwen3 \
  --tools ./tools.clj
```

---

## What you get back

* `:summary`

  * how often tool calls were valid
  * how often tool calls executed
  * (if expectations exist) exact tool+args match rate
* `:results` per case

  * latency
  * tool calls made
  * validation + tool execution outcomes
  * final assistant content

---

If you want, I can also add **parallel execution** (run N cases concurrently) and **more forgiving argument scoring** (like “contains required keys + values within tolerance” instead of strict equality).
