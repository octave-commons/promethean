(def-structure  Name   &props)     ; intrinsic organ
(def-service    name   &props)     ; external tool
(def-agent      Name   &props)     ; being/persona
(def-index      name   &props)     ; searchable corpus
(def-profile    id     &props)     ; behavior overlays (search/rank/etc.)
(def-task       scope  &props)     ; runnable actions
(def-schema     id     &props)     ; typed contracts (json-schema-ish)
(def-pipeline   id     &props)     ; multi-step flows
(def-structure  Proper  &props)
(def-service    kebab   &props)
(def-agent      Proper  &props)
(def-index      kebab   &props)
(def-profile    id      &props)
(def-schema     Id@N    &props)
(def-task       scope   &props)
(def-pipeline   id      &props)

(def-schema AgentContext@1
  (object
    [agentId    (string :min 1)]
    [roles      (array string)]
    [scopes     (array string)]
    [memoryRefs (array (ref MemoryRef@1))]
    [personaId  (string)]
    [runtimeCaps (record any)]))

(def-schema QueryIntent@1
  (object
    [raw   (string :min 1)]
    [kind  (enum "generic" "stacktrace" "error" "symbol")]
    [hints (array string)]
    [artifacts (object
      [stacktrace (string :optional t)]
      [filePath   (string :optional t)]
      [symbol     (string :optional t)])]))

(def-schema SearchPlan@1
  (object
    [targets (array (object
      [index  (string)]
      [engine (enum "vector" "keyword" "web" "custom")]
      [weight (number :min 0 :max 1 :optional t)]
      [where  (record any :optional t)]))]
    [rank (object
      [profile (string)]
      [blend   (enum "rrf" "sum" "max" :default "rrf")])]
    [budgets (object
      [topK    (integer :min 1 :max 100 :default 10)]
      [timeoutMs (integer :default 2500)])]
    [auditTrail (array string :optional t)]))
(def-structure Cephalon
    :version "1.0.0"
    :language ts
    :package "@shared/ts/dist/cephalon"
    :capabilities (perceive route prompt)
    :contracts  (AgentContext@1 QueryIntent@1)
    :policy     (immutability hard) ; organs don’t call the network
    )
(def-service heartbeat
    :version "0.3.2"
    :class GP
    :language ts
    :root "services/ts/heartbeat"
    :capabilities (liveness report enforce)
    :contracts ()
    :runtime (node :entry "pnpm start")
    :tasks   ((install "pnpm install")
              (build   "pnpm run build")
              (test    "pnpm test")))
(def-service smartgpt-bridge
    :version "1.1.0"
    :class GP
    :language ts
    :root "services/ts/smartgpt-bridge"
    :capabilities (http search.exec capabilities)
    :contracts (SearchPlan@1)
    :runtime (node :entry "pnpm start" :port 8140)
    :expose  ((http "/v1/search") (http "/v1/capabilities")))
(def-index repo-embeddings
    :engine vector
    :backing (chroma :collection "repo")
    :filters ([path string] [lang (enum "ts" "py" "md")])
    :policy (scopes ("search:index/repo-embeddings")))
(def-agent Pandora
    :version "0.1.0"
    :structures (Cephalon Eidolon)
    :uses (smartgpt-bridge indexer sinks)
    :profiles ("pandora.dev.search.v1")
    :capabilities (open discover hypothesize)
    :contracts (AgentContext@1 QueryIntent@1 SearchPlan@1)
    :runtime (python :entry "uv run -m pandora.main")
    :policy (scopes ("search:*" "sinks:read") :budgets (targets 3 topK 20 timeoutMs 2500)))
(def-agent Eris
    :version "0.1.0"
    :structures (Cephalon)
    :uses (smartgpt-bridge)
    :profiles ("eris.dev.adversarial.v1")
    :capabilities (perturb falsify stress-test)
    :policy (scopes ("search:*") :budgets (targets 2 topK 12 timeoutMs 1500)))
(def-profile pandora.dev.search.v1
    :targets ((repo-embeddings :engine vector :weight 0.6 :where (path (like "services/ts/%")))
              (code            :engine keyword :weight 0.4))
    :templates ((stacktrace "Extract files/functions/tokens; generate K=3 keyword + K=2 vector paraphrases.")
                (generic    "Prefer recent commits and files touched in last 48h."))
    :blend (rrf :k 60)
    :budgets (maxTargets 3 maxTopK 20 timeoutMs 2500)
    :policy-overrides ((deny "web:*"))
    :telemetry (learn-from-clicks t))
(def-profile eris.dev.adversarial.v1
    :perturbations ((negate-assumptions t)
                    (counterfactuals 2)
                    (site-bias "random"))
    :blend (sum)
    :budgets (maxTargets 2 maxTopK 12 timeoutMs 1500))
(def-task all:install
    :description "Install everything in topo-order"
    :depends-on (shared:install services:install agents:install))

(def-task services:install
    :select (kind service)
    :run (foreach (install)))     ; uses each service’s task map

(def-task agents:start
    :select (kind agent)
    :env (:VENV_IN_PROJECT "1")
    :run (foreach (start)))

(defn load-pil [paths]
  (->> paths
       (map parse-pil)        ; returns seq of (form props)
       (apply concat)
       (map validate-form)    ; naming, kinds, policy
       (group-by :kind)))

(defn build-catalog [forms]
  {"agents"      (-> forms (get "agent"))
  "services"    (-> forms (get "service"))
  "structures"  (-> forms (get "structure"))
  "indexes"     (-> forms (get "index"))
  "profiles"    (-> forms (get "profile"))
  "schemas"     (-> forms (get "schema"))})
(defn select-entities [catalog &preds]
      (let [pred (compile-preds preds)]
           (->> (concat (catalog "services")
                        (catalog "agents")
                        (catalog "structures")
                        (catalog "indexes"))
                (filter pred))))

(defn run-task [entity verb]
      (let [cmd (get-in entity ["tasks" (name verb)])]
           (assert cmd "Missing task")
           (sh cmd :cwd (entity "root"))))

(defn foreach [entities verb]
      (for [e entities] (run-task e verb)))
(defn rrf-blend [hit-lists k]
      (let [score (fn [rank] (/ 1.0 (+ rank k)))]
           (->> hit-lists
                (map-indexed (fn [i hits]
                                 (map-indexed (fn [r h] [h (+ (score (inc r)) (* 0.0 i))]) hits)))
                (apply concat)
                (group-by first)
                (map (fn [[h parts]] [h (->> parts (map second) (sum))]))
                (sort-by second >)
                (map first))))
(defn proper-noun? [s] (re-matches #"[A-Z][A-Za-z0-9_-]*" s))
(defn kebab? [s]       (re-matches #"[a-z][a-z0-9-]*" s))

(defn validate-form [{:keys [form id kind]}]
      (cond
        (= form 'def-agent)     (assert (proper-noun? id) "Agent must be Proper Noun")
        (= form 'def-structure) (assert (proper-noun? id) "Structure must be Proper Noun")
        (= form 'def-service)   (assert (kebab? id)       "Service must be kebab-case")
        (= form 'def-index)     (assert (kebab? id)       "Index must be kebab-case"))
                                        ; more checks: policy scopes, required tasks, schema refs
      )
