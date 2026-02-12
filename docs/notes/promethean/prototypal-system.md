Absolutely — embeddings are *the other half* of your whole “agent brain” stack.

Below is a **complete embedding benchmark + DSL setup** that’s:

* **suite-driven** like your other benches
* **decoy-heavy** (because that’s where embedding models lie)
* **cacheable + replayable** (vectors saved so crashes don’t cost hours)
* **Ollama-first** (uses `POST /api/embed` with `input` as string or string[]) ([Ollama Documentation][1])
* **authoring feels natural** (rank/pair/dedup/cluster forms)

You can drop these in as new files.

---

# 0) Embedding benchmark design (what we’re measuring)

## Core case types

* **`pair`**: similarity sanity (same/related/unrelated/contrast)
* **`rank`**: retrieval ranking (MRR / Recall@K)
* **`dedup`**: near-duplicate detection (threshold behavior)
* **`cluster`**: topic coherence (within-topic > cross-topic)

## Why this matters to you

This directly evaluates:

* “can my RAG pull the right chunk?”
* “will it confuse *disable* vs *enable*?”
* “does it collapse code + prose into the same space?”
* “does lexical overlap dominate semantics?”

---

# 1) DSL + data model

## Files added

```
benchmarks/embeddings/
  dsl.clj
  score.clj
  suites/stream_core.clj

clj-kondo/
  config.edn
  hooks/promethean/embeddings.clj
```

---

# 2) `benchmarks/embeddings/dsl.clj`

This is the authoring layer.

```clojure
(ns benchmarks.embeddings.dsl
  "Embedding benchmark DSL.

  Defines a compact authoring syntax for:
  - pair similarity checks
  - ranking / retrieval checks
  - dedup thresholds
  - topic coherence / clustering sanity

  The runner is expected to:
  - materialize all texts used by cases
  - embed them with each embedder
  - score each case using benchmarks.embeddings.score"
  (:require
    [clojure.spec.alpha :as s]))

;; ------------------------------------------------------------
;; Registry (simple, optional)
;; ------------------------------------------------------------

(defonce ^:private *embedders (atom {}))
(defonce ^:private *suites    (atom {}))

(defn list-embedders [] (vals @*embedders))
(defn list-suites []    (vals @*suites))

(defn get-embedder [id] (get @*embedders id))
(defn get-suite [id]    (get @*suites id))

(defn register-embedder! [m]
  (swap! *embedders assoc (:embedder/id m) m)
  m)

(defn register-suite! [m]
  (swap! *suites assoc (:suite/id m) m)
  m)

;; ------------------------------------------------------------
;; Specs (lightweight, runner can enforce)
;; ------------------------------------------------------------

(s/def :embedder/id symbol?)
(s/def :embedder/provider keyword?)
(s/def :embedder/model string?)
(s/def :embedder/normalize? boolean?)
(s/def :embedder/dimensions (s/nilable pos-int?))
(s/def :embedder/options (s/map-of keyword? any?))

(s/def :suite/id keyword?)
(s/def :suite/embedders (s/coll-of symbol? :min-count 1))
(s/def :suite/metric #{:cosine :dot})
(s/def :suite/k (s/coll-of pos-int? :min-count 1))

;; ------------------------------------------------------------
;; Macro: def-embedder
;; ------------------------------------------------------------

(defmacro def-embedder
  "Define an embedding model configuration.

  Example:
    (def-embedder embed/nomic
      {:provider :ollama
       :model \"nomic-embed-text\"
       :normalize? true})"
  [id m]
  `(do
     (def ~id (assoc ~m :embedder/id '~id))
     (register-embedder! ~id)))

;; ------------------------------------------------------------
;; Candidate helpers for rank cases
;; ------------------------------------------------------------

(defmacro pos
  "Positive candidate for a rank query."
  [text & {:as opts}]
  `(merge
     {:cand/kind :pos
      :cand/text ~text}
     ~opts))

(defmacro decoy
  "Hard negative candidate with a named decoy type.

  Decoy types you should use:
  - :lexical
  - :negation
  - :near-domain
  - :format
  - :entity-swap"
  [decoy-type text & {:as opts}]
  `(merge
     {:cand/kind :decoy
      :decoy/type ~decoy-type
      :cand/text ~text}
     ~opts))

;; ------------------------------------------------------------
;; Case constructors (macros for readable suite definitions)
;; ------------------------------------------------------------

(defmacro pair
  "Pair similarity case.

  expect:
    :same | :related | :unrelated | :contrast"
  [a b & {:keys [expect tags] :or {expect :related tags #{}}}]
  `{:case/type :embed/pair
    :tags ~tags
    :pair/a ~a
    :pair/b ~b
    :pair/expect ~expect})

(defmacro rank
  "Rank candidates for a query.

  Example:
    (rank \"fix websocket disconnect\"
      (pos \"add ping/pong keepalive\")
      (decoy :negation \"disable keepalive\"))"
  [query & candidates]
  `{:case/type :embed/rank
    :rank/query ~query
    :rank/candidates [~@candidates]})

(defmacro dup
  "Duplicate pair expected to be ABOVE threshold."
  [a b & {:as opts}]
  `(merge {:dedup/kind :dup :a ~a :b ~b} ~opts))

(defmacro near
  "Near-miss pair: often lexical overlap but important difference.
  Expected to be BELOW threshold (or near it), depending on suite settings."
  [a b & {:as opts}]
  `(merge {:dedup/kind :near :a ~a :b ~b} ~opts))

(defmacro uniq
  "Unique item expected NOT to collide with others."
  [text & {:as opts}]
  `(merge {:dedup/kind :uniq :text ~text} ~opts))

(defmacro dedup
  "Dedup case with threshold.

  Example:
    (dedup 0.88
      (dup \"fixed websocket bug\" \"websocket bug fixed\")
      (near \"enable overlay\" \"disable overlay\")
      (uniq \"crispy potato recipe\"))"
  [threshold & items]
  `{:case/type :embed/dedup
    :dedup/threshold ~threshold
    :dedup/items [~@items]})

(defmacro topic
  "Topic group for coherence/cluster sanity cases."
  [label & texts]
  `{:topic/label ~label
    :topic/texts [~@texts]})

(defmacro cluster
  "Topic coherence case.
  We do NOT need full k-means to get signal: the scoring checks that:
    avg(within-topic sim) > avg(cross-topic sim) by a margin."
  [& topics]
  `{:case/type :embed/cluster
    :cluster/topics [~@topics]})

;; ------------------------------------------------------------
;; Macro: def-embed-suite
;; ------------------------------------------------------------

(defmacro def-embed-suite
  "Define a suite of embedding cases.

  Example:
    (def-embed-suite embeddings/stream-core
      {:embedders [embed/nomic]
       :metric :cosine
       :k [1 3 10]}
      (rank ...)
      (pair ...)
      (dedup ...))"
  [suite-id config & cases]
  `(do
     (def ~suite-id
       (register-suite!
         (merge
           {:suite/id ~suite-id
            :suite/cases [~@cases]}
           ~config)))
     ~suite-id))
```

---

# 3) `benchmarks/embeddings/score.clj`

This is the scoring layer. It expects **vectors already computed** by the runner.

It implements:

* cosine similarity
* MRR@K, Recall@K
* dedup threshold checks
* topic coherence score

```clojure
(ns benchmarks.embeddings.score
  "Scoring for embedding benchmark cases.

  Runner supplies:
    - vectors: {text -> double[]}
    - config: {:metric :cosine|:dot, :k [1 3 10]}

  This file stays pure + deterministic."
  (:require [clojure.string :as str]))

;; ------------------------------------------------------------
;; Vector math (minimal, fast enough)
;; ------------------------------------------------------------

(defn- dot ^double [^doubles a ^doubles b]
  (let [n (alength a)]
    (loop [i 0 acc 0.0]
      (if (< i n)
        (recur (inc i) (+ acc (* (aget a i) (aget b i))))
        acc))))

(defn- norm ^double [^doubles v]
  (Math/sqrt (dot v v)))

(defn cosine ^double [^doubles a ^doubles b]
  (let [na (norm a)
        nb (norm b)]
    (if (or (zero? na) (zero? nb))
      0.0
      (/ (dot a b) (* na nb)))))

(defn similarity
  "metric: :cosine or :dot"
  [metric ^doubles a ^doubles b]
  (case metric
    :dot (dot a b)
    :cosine (cosine a b)
    (cosine a b)))

;; ------------------------------------------------------------
;; Retrieval metrics
;; ------------------------------------------------------------

(defn mrr-at-k
  "Given ranked candidate kinds [:decoy :pos ...], compute MRR@k."
  [k ranked-kinds]
  (let [top (take k ranked-kinds)
        idx (first (keep-indexed (fn [i x] (when (= x :pos) i)) top))]
    (if (nil? idx) 0.0 (/ 1.0 (double (inc idx))))))

(defn recall-at-k
  "Fraction of positives appearing in top-k."
  [k ranked-kinds]
  (let [top (take k ranked-kinds)
        pos-in-top (count (filter #(= % :pos) top))
        total-pos (count (filter #(= % :pos) ranked-kinds))]
    (if (zero? total-pos) 0.0 (/ pos-in-top (double total-pos)))))

;; ------------------------------------------------------------
;; Case scorers
;; ------------------------------------------------------------

(defn score-pair
  [metric vectors {:keys [pair/a pair/b pair/expect]}]
  (let [va (get vectors a)
        vb (get vectors b)
        s (similarity metric va vb)]
    {:score/type :pair
     :pair/expect expect
     :sim s}))

(defn score-rank
  [metric ks vectors {:keys [rank/query rank/candidates]}]
  (let [vq (get vectors query)
        scored (mapv (fn [c]
                       (let [t (:cand/text c)
                             v (get vectors t)
                             s (similarity metric vq v)]
                         (assoc c :sim s)))
                     candidates)
        ranked (vec (sort-by :sim > scored))
        ranked-kinds (mapv :cand/kind ranked)
        per-k (into {}
                    (map (fn [k]
                           [k {:mrr (mrr-at-k k ranked-kinds)
                               :recall (recall-at-k k ranked-kinds)}])
                         ks))
        best-pos (some->> ranked (filter #(= (:cand/kind %) :pos)) (map :sim) (apply max))
        best-decoy (some->> ranked (filter #(= (:cand/kind %) :decoy)) (map :sim) (apply max))
        margin (if (and best-pos best-decoy) (- best-pos best-decoy) nil)]
    {:score/type :rank
     :rank/summary per-k
     :rank/margin margin
     :rank/top ranked}))

(defn score-dedup
  [metric vectors {:keys [dedup/threshold dedup/items]}]
  (let [thr (double threshold)
        pairs (->> items (filter #(contains? #{:dup :near} (:dedup/kind %))))
        uniqs (->> items (filter #(= :uniq (:dedup/kind %))))

        pair-scores
        (mapv (fn [{:keys [dedup/kind a b]}]
                (let [sa (get vectors a)
                      sb (get vectors b)
                      s (similarity metric sa sb)
                      pass?
                      (case kind
                        :dup (>= s thr)
                        :near (< s thr)   ;; near misses should NOT dedup by default
                        true)]
                  {:kind kind :a a :b b :sim s :pass pass?}))
              pairs)

        uniq-texts (mapv :text uniqs)
        uniq-sims
        (mapv (fn [t]
                (let [vt (get vectors t)
                      max-collide
                      (->> uniq-texts
                           (remove #(= % t))
                           (map (fn [u] (similarity metric vt (get vectors u))))
                           (reduce max 0.0))]
                  {:text t :max-sim-to-other-uniq max-collide :pass (< max-collide thr)}))
              uniq-texts)

        pass? (and (every? :pass pair-scores)
                   (every? :pass uniq-sims))]
    {:score/type :dedup
     :threshold thr
     :pairs pair-scores
     :uniqs uniq-sims
     :pass pass?}))

(defn score-cluster
  "Topic coherence check:
    avg(within-topic) - avg(cross-topic) should be > 0 by a margin."
  [metric vectors {:keys [cluster/topics]}]
  (let [topics
        (mapv (fn [{:keys [topic/label topic/texts]}]
                {:label label :texts texts})
              topics)

        pairs-within
        (for [{:keys [texts]} topics
              :let [ts texts]
              i (range (count ts))
              j (range (inc i) (count ts))]
          [(nth ts i) (nth ts j)])

        pairs-cross
        (for [i (range (count topics))
              j (range (inc i) (count topics))
              :let [a (nth topics i)
                    b (nth topics j)]
              ta (:texts a)
              tb (:texts b)
              x ta
              y tb]
          [x y])

        sim-pair (fn [[x y]]
                   (similarity metric (get vectors x) (get vectors y)))

        within-sims (map sim-pair pairs-within)
        cross-sims  (map sim-pair pairs-cross)

        avg (fn [xs]
              (if (seq xs) (/ (reduce + 0.0 xs) (double (count xs))) 0.0))

        within-avg (avg within-sims)
        cross-avg  (avg cross-sims)
        margin (- within-avg cross-avg)

        ;; you can tune this later (0.10 is a decent initial "real signal")
        pass? (> margin 0.10)]
    {:score/type :cluster
     :within-avg within-avg
     :cross-avg cross-avg
     :margin margin
     :pass pass?}))

(defn score-case
  "Case dispatcher. Returns a case score map.

  Inputs:
    - config: {:metric :cosine|:dot, :k [1 3 10]}
    - vectors: {text -> double[]}
    - case: case map from DSL"
  [config vectors case]
  (let [metric (:metric config)
        ks (:k config)]
    (case (:case/type case)
      :embed/pair    (assoc (score-pair metric vectors case) :case/type :embed/pair)
      :embed/rank    (assoc (score-rank metric ks vectors case) :case/type :embed/rank)
      :embed/dedup   (assoc (score-dedup metric vectors case) :case/type :embed/dedup)
      :embed/cluster (assoc (score-cluster metric vectors case) :case/type :embed/cluster)
      {:case/type (:case/type case)
       :error :unknown-case-type})))
```

---

# 4) First suite: `benchmarks/embeddings/suites/stream_core.clj`

This suite is tuned to your real world:

* game + stream context
* coding errors + toolchains
* negation traps
* lexical decoys
* code vs prose format traps

```clojure
(ns benchmarks.embeddings.suites.stream-core
  (:require
    [benchmarks.embeddings.dsl :refer
     [def-embedder def-embed-suite
      pair rank pos decoy
      dedup dup near uniq
      cluster topic]]))

;; ------------------------------------------------------------
;; Embedders (Ollama-first)
;; Ollama supports embeddings via POST /api/embed using \"input\" string or array :contentReference[oaicite:1]{index=1}
;; Recommended embed models vary; keep these as examples :contentReference[oaicite:2]{index=2}
;; ------------------------------------------------------------

(def-embedder embed/embeddinggemma
  {:provider :ollama
   :model "embeddinggemma"
   :normalize? true})

(def-embedder embed/nomic
  {:provider :ollama
   :model "nomic-embed-text"
   :normalize? true})

(def-embedder embed/mxbai
  {:provider :ollama
   :model "mxbai-embed-large"
   :normalize? true})

;; ------------------------------------------------------------
;; Suite
;; ------------------------------------------------------------

(def-embed-suite :embeddings/stream-core
  {:embedders [embed/embeddinggemma embed/nomic embed/mxbai]
   :metric :cosine
   :k [1 3 10]}

  ;; -----------------------
  ;; Pair sanity (negation + near meaning)
  ;; -----------------------

  (pair "WebSocket disconnects after idle timeout"
        "Socket closes when idle; add keepalive ping/pong"
        :expect :same)

  (pair "Enable overlay captions on death screen"
        "Disable overlay captions on death screen"
        :expect :contrast)

  (pair "Fix failing tests in Clojure namespace fantasia.server"
        "Resolve red tests in backend server namespace"
        :expect :related)

  (pair "crispy potatoes recipe"
        "WebSocket ping/pong keepalive"
        :expect :unrelated)

  ;; -----------------------
  ;; Retrieval ranking (decoy-heavy)
  ;; -----------------------

  (rank "fix websocket disconnect after silence"
    (pos "WebSocket closes after idle timeout; use ping/pong keepalive")
    (pos "Reconnect loop with exponential backoff; detect server close")
    (decoy :negation "Disable keepalive pings to prevent disconnects")
    (decoy :lexical "CSS visibility hidden vs collapse")
    (decoy :near-domain "Fog of war visibility state bug in tile rendering"))

  (rank "tile visibility state is unknown"
    (pos "Initialize tile-visibility map when state is empty on client connect")
    (pos "Update tile visibility when player moves; recompute LOS on tick")
    (decoy :lexical "Visibility property in HTML/CSS")
    (decoy :near-domain "3D occlusion culling visibility buffer")
    (decoy :negation "Skip visibility computation to improve performance"))

  (rank "Clojure stacktrace points to line number"
    (pos "Read the exception cause and locate the namespace + line in the stacktrace")
    (pos "Often null / nil destructuring; check the indicated function call")
    (decoy :lexical "Stack overflow error in recursion examples")
    (decoy :format "(Exception. \"boom\") at src/foo.clj:72")
    (decoy :near-domain "Java bytecode line number table explanation"))

  (rank "stream moment was insane mark a clip"
    (pos "Mark clip-worthy moment with reason and confidence")
    (decoy :lexical "clip-path CSS tutorial")
    (decoy :near-domain "video editing timeline cut tool usage")
    (decoy :entity-swap "mark a snippet in a code editor"))

  (rank "inventory is full what now"
    (pos "Inventory overflow: drop low-value items or open stash")
    (pos "Sort items by rarity; salvage duplicates")
    (decoy :lexical "array overflow in programming")
    (decoy :near-domain "database index size full error")
    (decoy :negation "Pick up more items to free space"))

  ;; -----------------------
  ;; Dedup thresholds
  ;; -----------------------

  (dedup 0.88
    (dup "I fixed the websocket bug"
         "Websocket bug is fixed now")
    (dup "boss is low health"
         "the boss health is almost gone")
    (near "enable overlay text on death"
          "disable overlay text on death")
    (near "add keepalive ping"
          "remove keepalive ping")
    (uniq "crispy potato recipe oven")
    (uniq "ancient philosophy school of athens painting"))

  ;; -----------------------
  ;; Topic coherence / cluster sanity
  ;; -----------------------

  (cluster
    (topic :streaming
      "play airhorn when I die"
      "overlay text for a funny caption"
      "mark clip-worthy moments automatically")
    (topic :coding
      "fix stacktrace line number error"
      "tests failing in Clojure backend"
      "resolve unmatched bracket in function")
    (topic :gameplay
      "boss is low health push now"
      "inventory full manage items"
      "minimap shows enemy nearby")))
```

---

# 5) Runner contract (minimal + practical)

Your runner only needs to do two big things:

## A) Collect texts from suite cases

From:

* `pair`: `a`, `b`
* `rank`: `query` + each candidate text
* `dedup`: each item text/pair
* `cluster`: all topic texts

## B) Call Ollama embeddings endpoint

Use:

`POST /api/embed` with:

* `"model": "<embedding model>"`
* `"input": "<string>"` or `["a","b",...]` ([Ollama Documentation][1])

…and you get:

* `"embeddings": [[...],[...],...]` ([Ollama Documentation][1])

### Why bulk input matters

Bulk embedding (`input` is an array) improves throughput and makes caching easier.

---

# 6) clj-kondo support for the DSL macros

## 6.1 `.clj-kondo/config.edn`

```edn
{:hooks
 {:analyze-call
  {benchmarks.embeddings.dsl/def-embedder hooks.promethean.embeddings/def-embedder
   benchmarks.embeddings.dsl/def-embed-suite hooks.promethean.embeddings/def-embed-suite}}}
```

## 6.2 `clj-kondo/hooks/promethean/embeddings.clj`

This makes kondo treat your macros like normal `def` forms for analysis.

```clojure
(ns hooks.promethean.embeddings
  (:require [clj-kondo.hooks-api :as api]))

(defn def-embedder [{:keys [node]}]
  ;; (def-embedder embed/x {...})
  (let [[_ name init] (:children node)]
    {:node (api/list-node
            [(api/token-node 'def) name init])}))

(defn def-embed-suite [{:keys [node]}]
  ;; (def-embed-suite :suite/id {...} case1 case2 ...)
  ;; Expand to: (def :suite/id (do {...}))
  ;; We keep it simple: def the suite-id to the config map (kondo just needs symbol/kw existence)
  (let [[_ suite-id config & _cases] (:children node)]
    {:node (api/list-node
            [(api/token-node 'def) suite-id config])}))
```

This is intentionally conservative: it makes the identifiers “exist” so references don’t show as unresolved.

---

# 7) “Decoy discipline” for embeddings (the real upgrade)

You should explicitly measure:

### `margin = best(pos) - best(decoy)`

If margin is small or negative, your embedding model is a liar.

This is already included in `score-rank` as `:rank/margin`.

That single number becomes your “is this safe for retrieval?” warning light.

---

# 8) Next step I can write (if you want more)

If you want to keep going immediately, I can generate:

* **20 more `rank` cases** tuned to your code + stream flows
* an **Ollama embedding client** helper namespace (with retry + batching)
* a **vector cache** format + stable hashing scheme
* a **report table emitter** (CSV + JSON summary)
* a “robustness suite” variant that tests the same cases with:

  * casing changes
  * punctuation noise
  * code formatting changes

Just say: **“extend stream-core to 100 cases + add runner stub”** and I’ll dump the next full files.

[1]: https://docs.ollama.com/api/embed?utm_source=chatgpt.com "Generate embeddings"
