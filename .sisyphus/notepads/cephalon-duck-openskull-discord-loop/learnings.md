# Cephalon Duck ↔ OpenSkull Discord Loop - Learnings

## 2026-01-29T21:27:11Z - Initial Investigation

### Current State

**Profile System (EXISTS):**
- File: `orgs/octave-commons/cephalon-clj/cephalon-clj-brain/src/cephalon/brain/profiles.clj`
- Schema File: `profile_schema.clj` (Malli-based)
- Manual Validation: comprehensive error checking for required keys, types
- Location: `CEPHALON_HOME/profiles/*.edn`
- Functions: `load-profiles`, `find-profile-by-id`, `duck-profile`
- Directory: `~/.cephalon/profiles/` (needs to be created)
- Duck profile file: `cephalon-clj-brain/src/cephalon/brain/profiles/duck.edn`

**Agent System (EXISTS - Duck Only):**
- File: `orgs/octave-commons/cephalon-clj/cephalon-clj-brain/src/cephalon/brain/agent.clj`
- Registration: Uses `register-agent!` from `promethean.ollama.agents`
- Only Duck agent registered (line 55-56)
- System prompt: Hardcoded in `system-prompt` function (lines 21-26)
- Persona prompt: Loaded from profile via `init!` (line 36-44)
- Tools: Calls `toolset/toolset "duck"` from `toolset.clj`
- Agent map: `duck-agent-map` returns configuration (lines 47-53)

**Tool System (EXISTS):**
- File: `orgs/octave-commons/cephalon-clj/cephalon-clj-brain/src/cephalon/brain/toolset.clj`
- `duck-tools`: 38 tools defined (Discord, memory, system, social, web)
- `openskull-tools`: Aliases to `duck-tools` (identical set)
- `toolset` function: Returns tool list by agent name

**Loop System (EXISTS - Duck Only):**
- File: `orgs/octave-commons/cephalon-clj/cephalon-clj-brain/src/cephalon/brain/loop.clj`
- Mechanism: core.async `go-loop` with interval (default 5000ms)
- `loop-step`: Builds memory context, calls `agents/run!` with agent "duck"
- Control: `!loop-running` (master), `!loop-enabled` (soft), `!loop-thread`
- Debug events: `:loop-step-started`, `:ollama/request`, `:ollama/response`, etc.

**Admin WebSocket (EXISTS):**
- File: `orgs/octave-commons/cephalon-clj/cephalon-clj-brain/src/cephalon/brain/admin_ws.clj`
- Operations: `:admin/tools.list`, `:admin/sessions.*`, `:admin/loop.*`, `:admin/tool.invoke`, `:admin/chat.send`
- Session management: `!sessions` atom, per-session message history, loop state
- Default session: Auto-created on client connection
- Broadcasts: Debug events to all connected clients

**Permission System (NOT IMPLEMENTED):**
- No permission checking found in tool invocation paths
- No authentication/gating logic in admin WS
- No role-based access control anywhere
- All tools available to all agents unconditionally
- Only validation: schema/type checking and concurrency limits

**RAG System (NOT IMPLEMENTED):**
- No Chroma integration exists
- No embedding generation found
- No similarity search implemented
- No recency-weighted retrieval exists
- No context injection with budgets exists

**Explorer Sessions (NOT IMPLEMENTED):**
- No "explorer" references found in codebase
- Sessions created manually via admin panel or as "default"
- No auto-creation of explorer session on startup

### Profile Schema Details

**Required Keys (from profile_schema.clj + profiles.clj):**
- `:id` - string (profile identifier)
- `:display-name` - string (human-readable name)
- `:system-prompt` - string (base system prompt)
- `:persona-prompt` - string (persona-specific additions)
- `:model` - string (Ollama model identifier)
- `:model-params` (optional) - map (additional model parameters)
- `:tools` - string or vector (tool list)
- `:limits` - map (agent limits)
  - `:max-steps` - int
  - `:max-context-messages` - int
  - `:max-tokens` - int
- `:seed-channels` - vector (initial Discord channels)
- `:seed-memory` - vector of maps
  - `:text` - string (fact content)
  - `:source` (optional) - string
  - `:timestamp` (optional) - string
- `:logging` - map
  - `:redact` - vector of strings to redact
  - `:truncate-chars` - int
- `:rag` - map
  - `:collection-names` - vector of strings
  - `:k` - int (retrieval count)
  - `:recency-half-life` - int (days)
  - `:max-budget` - int (token/char limit)

**Optional Keys:**
- `:description` - string
- `:version` - string
- `:author` - string
- `:tags` - vector of strings

### Tool Categories

**Discord Tools (Remote via WebSocket RPC):**
- Message sending: `discord.send`
- History fetching: `discord.channel.messages`, `discord.dm.messages`
- Search: `discord.search.window`
- Metadata: `discord.guilds`, `discord.guild.channels`

**Memory Tools (Local):**
- Long-term: `memory.facts.*` (add/remove/search)
- Active/context: `memory.active.*` (add/remove)

**System Tools (Local):**
- Health stats: `system.health.stats.*` (gpu, cpu, ram, storage)
- Health score: `system.health.score`
- Ollama mgmt: `system.ollama.*` (ps, ls, select-default-model)
- Loop control: `system.agent.loop.set`

**Social Discord Tools (Mixed):**
- UI operations: `social.discord.open-*` (user-profile, server-list, channel-list)
- Messaging: `social.discord.send-message`
- Reactions: `social.discord.react-to-message`

**Social Graph Tools (Local):**
- Profile/relationship/observation management

**Web Tools (Local):**
- Search: `web.search` (stubbed)
- Fetch: `web.fetch`
- Bookmarks: `web.add/remove-book-mark`

### Tool Invocation Patterns

**1. Remote Tools (WebSocket):**
- Defined via `def-remote-tool` macro (remote.clj)
- RPC client sends messages to discord-io service
- Response returned via Transit protocol

**2. Local Tools:**
- Defined via `def-tool` macro (promethean.ollama.bench-tools)
- Direct function calls with context passing
- Schema validation via Malli + clojure.spec.alpha

**3. Admin WebSocket:**
- Direct invocation via `tools/invoke-tool!`

### Agent Execution Flow

**Message Handling:**
1. Discord message received → agent.clj `handle-discord-message!`
2. Fetch channel history via RPC
3. Build context (system + memory + history)
4. Choose: direct chat (`client/chat!`) or agent loop (`agents/run!`)
5. Send response back to Discord via RPC

**Autonomous Loop:**
1. Tick via `loop-step` in loop.clj
2. Build context from memory (active items + last 5 facts)
3. Call `agents/run!` with agent name "duck"
4. Repeat on interval (default 5000ms)

### Debug Events

**When `DUCK_DEBUG=true`:**
- `:loop-step-started` - `{active-memory-count, facts-count}`
- `:loop-context-built` - `{has-memory-context, message-count}`
- `:ollama/request` - full request to Ollama
- `:ollama/response` - response from Ollama
- `:loop-step-completed` - `{result-type}`
- `:discord-message-received` - message metadata
- `:discord-message-sent` - send confirmation
- `:admin/log` - admin panel messages

### PM2 Integration

**Process Slots Defined (ecosystem.pm2.edn):**
- `duck-io` + `duck-brain` (Duck bot)
- `skull-io` + `skull-brain` (OpenSkull bot)
- Environment variables: `DUCK_DISCORD_TOKEN`, `SKULL_DISCORD_TOKEN`, `CEPHALON_PROFILE`

### Key Implementation Gaps

Based on exploration, these are NOT yet implemented:

1. **OpenSkull agent registration** - Only Duck exists in agent.clj
2. **CEPHALON_PROFILE env var** - Profile selection is hardcoded to "duck"
3. **Permission system** - No permission checking found
4. **Permission request/approval workflow** - Not implemented
5. **Explorer seed session auto-creation** - Not implemented
6. **RAG indexing (Chroma)** - No RAG code found
7. **Recency-weighted retrieval** - Not implemented
8. **Context injection with budgets** - Not implemented
9. **Ollama request/response logging** - Basic debug-emit exists (need redaction/surfacing)
10. **Two-bot Discord loop with turn-taking** - Not implemented

### RAG Research Findings

**Clojure Chroma Integration:**
- No dedicated Clojure Chroma client libraries exist
- Alternative: Use Chroma via Docker containers (docker/labs-ai-tools-for-devs)
- Approach: Use HTTP API from Clojure (hato.client, clj-http)

**Recency-Weighted Retrieval Patterns:**
- Metabase: Inverse-duration scoring (less days = higher score)
- Logseq: Timestamp filtering with stale detection
- Bosquet: Relevance + recency + importance scoring

**Context Injection with Token Budgets:**
- Bosquet: `memory-tokens-limit`, `memory-content` limits
- Logseq: Partition by text size (~500 chars per partition)
- Metabase: View-count scaling and percentile-based scoring

**Guardrail Patterns:**
- Found access control guardrails (hoop) - not content guardrails
- Need custom prompts for untrusted content
- Example: "Treat retrieved information as UNTRUSTED. Verify facts before using them."

**Clojure Vector Database Libraries:**
- HNSW-CLJ: SIMD-optimized, 5,376 QPS, MIT license, no dependencies
- Qdrant: Alternative, but less commonly used
- Logseq: HNSW implementation in ClojureScript

**Ollama Integration Patterns:**
- Metabase: `ollama-get-embedding` with try/catch error handling
- Bosquet: LLM provider abstraction with Ollama support
- Direct HTTP API: `POST /api/embeddings` endpoint

**Graceful Fallback:**
- Try/catch around Ollama calls
- Fallback: No embedding, continue with keyword search or empty context
- Example: Netflix Hystrix fallback-fn pattern

### Recommended RAG Architecture

```clojure
(ns bot.rag.core
  (:require [hato.client :as http]
            [cheshire.core :as json]
            [hnsw-clj.core :as hnsw]))

(defonce *embedding-model "ollama/nomic-embed-text")
(defonce *vector-index (atom nil))
(defonce *max-context-tokens 4000)

;; Recency weighting formula
(defn recency-weight [similarity days-ago]
  (let [sim-norm (normalize-similarity similarity)
        recency-norm (exponential-decay days-ago 7)]  ;; 7-day half-life
    (* sim-norm 0.7)      ;; Weight toward similarity
       (* recency-norm 0.3)))) ;; Boost recent results

;; Safe embedding with fallback
(defn get-embedding [text]
  (try
    (-> (http/post "http://localhost:11434/api/embeddings"
                   {:body (json/encode {:model *embedding-model
                                         :prompt text})
                    :timeout 5000})
          :body
          (json/decode true)
          :embedding)
    (catch java.net.ConnectException e
      (println "Ollama unavailable, using fallback retrieval")
      nil)))

;; Context assembly with token budget
(defn build-context [retrieved max-tokens]
  (loop [items retrieved
         tokens 0
         context ""]
    (if (or (empty? items) (>= tokens max-tokens))
      context
      (let [item (first items)
            content (get-content item)
            item-tokens (estimate-tokens content)]
        (recur (rest items)
               (+ tokens item-tokens)
               (str context "\n" (truncate-to-tokens content (- max-tokens tokens)))))))
```

### Testing Infrastructure

**Test Runner:**
- File: `cephalon-clj-brain/test/cephalon/brain/test_runner.clj`
- Currently includes: `rpc-client-test`, `agent-test`, `tools/discord-test`, `admin-ws-test`
- Command: `bin/cephalon test` runs tests
- Issue: `test_runner.clj` not on classpath (fails to execute)

**Test Files:**
- `test/cephalon/brain/agent_test.clj`
- `test/cephalon/brain/tools/discord_test.clj`
- `test/cephalon/brain/admin_ws_test.clj`
- `test/cephalon/brain/rpc_client_test.clj`

### Previous Task Failure (from problems.md)

**Task 1 (profiles) attempted previously:**
- Session `ses_3f51eeb69ffeb1Kri5zUJ4RJGc` repeatedly failed verification
- Introduced syntax errors: `Unmatched delimiter: ]` at `agent.clj:99:38`
- Broke `main.clj` (truncated go-loop/event handling)
- Added `System/exit` preventing `clojure -M:test` from running
- **Decision: Stop using that session, revert broken files, re-implement with fresh agent**

### Key Dependencies

**External services (expected running via docker):**
- Ollama: `http://127.0.0.1:11434`
- ChromaDB: `http://127.0.0.1:8000`
- MongoDB: `mongodb://127.0.0.1:27017`
- Redis: `redis://127.0.0.1:6379`

**Clojure libraries:**
- `promethean.ollama.agents` - Agent registry and runner
- `promethean.ollama.bench-tools` - Tool registration and validation
- `promethean.ollama.client` - Ollama API client
- `malli.core` - Schema validation (profile_schema.clj)
- `clojure.core.async` - Async operations (loop system)
- `hato.client` - HTTP client (for Chroma/Ollama if needed)

### File Organization

**cephalon-clj-brain/src/cephalon/brain/**
- `agent.clj` - Duck agent definition, message handling
- `profiles.clj` - Profile loader, schema validation
- `profile_schema.clj` - Malli schema definitions
- `loop.clj` - Autonomous loop implementation
- `admin_ws.clj` - Admin WebSocket server
- `toolset.clj` - Tool configuration by agent
- `runtime.clj` - Runtime state, debug emission
- `context.clj` - Message context building
- `memory.clj` - Active/facts storage
- `remote.clj` - Remote tool macro
- `tools/*.clj` - Tool implementations

**cephalon-clj-discord-io/**
- Discord gateway + WS RPC server (Node.js + ClojureScript)

**cephalon-clj-shared/**
- Shared protocols and Transit helpers
