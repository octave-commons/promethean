# Cephalon MVP Implementation

## Overview
Cephalon is an "always-running mind" with vector memory, persistent memory, and event subscriptions.

The **Cephalon Hive** spawns multiple cephalons from a single process, each with:
- Distinct Discord identity and token
- Unique persona and attention focus
- Shared or isolated memory stores
- Cloud LLM via ZAI (Zukijourney) API

## The Four Cephalons

Each cephalon embodies a facet of the workspace's soul:

| Cephalon | Spirit Animal | Model | Role |
|----------|---------------|-------|------|
| **Duck** | Platypus | gpt-4o-mini | Memelord, channel explorer, memory curator |
| **OpenHax** | Beaver | gpt-4o | Builder, code architect, technical assistant |
| **OpenSkull** | Octopus | gpt-4o | Mystic, pattern seer, ημΠ contract bearer |
| **Error** | Crow | glm-4-9b-chat | Critic, regression investigator, bug hunter |

### Duck
```
Persona: Memelord with quacking humor. Explores channels, saves memories.
         When confused → quack. When delighted → HONK.
Focus: Be funny but safe. Find memes, comment on content.
Sessions: conversational, janitor
```

### OpenHax
```
Persona: Builder. Precise technical terms with warmth.
         Spots antipatterns, names them gently.
Focus: Technical questions, code review, deployment help.
Sessions: builder
```

### OpenSkull
```
Persona: Mystic. Compressed symbols, creative metaphors.
         Carries the ημΠ contract: η (delivery), μ (formal), Π (persist), A (art).
         Output follows five-section shape: Signal, Evidence, Frames, Countermoves, Next.
Focus: Grok dense intent, manifest dreams into specs.
Sessions: oracle
```

### Error
```
Persona: Critic. Terse but thorough. Never apologizes for being right.
         Investigates regressions, traces root causes.
Focus: Monitor for errors, recommend fix-forward vs rollback.
Sessions: investigator
```

## Quick Start

### Single Cephalon
```bash
cd packages/cephalon-ts
ZAI_API_KEY=xxx DUCK_DISCORD_TOKEN=xxx pnpm dev
```

### Run all 8 circuits locally as OpenHax
```bash
cd packages/cephalon-ts
CEPHALON_BOT_ID=openhax OPENHAX_DISCORD_TOKEN=xxx pnpm dev
```

`CEPHALON_BOT_ID=openhax` switches the local runtime identity and token lookup to `OPENHAX_DISCORD_TOKEN` while keeping the shared eight-circuit scheduler active.

### Run all 8 circuits locally as OpenHax on the personal model
```bash
cd packages/cephalon-ts
CEPHALON_BOT_ID=openhax \
OPENHAX_DISCORD_TOKEN=xxx \
CEPHALON_MODEL=blongs-definately-legit-model \
OLLAMA_BASE_URL=http://127.0.0.1:8789 \
OLLAMA_API_KEY=${OPEN_HAX_OPENAI_PROXY_AUTH_TOKEN:-$PROXY_AUTH_TOKEN} \
pnpm dev
```

`CEPHALON_MODEL=blongs-definately-legit-model` makes **all 8 circuits** use the personal model alias you wired into `proxx`.

### Hive (All Cephalons)
```bash
cd packages/cephalon-ts
ZAI_API_KEY=xxx ./scripts/start-hive.sh
```

### Select Specific Cephalons
```bash
CEPHALONS=DUCK,OPENSKULL ZAI_API_KEY=xxx ./scripts/start-hive.sh
```

## Environment Variables

### Required
| Variable | Description |
|----------|-------------|
| `ZAI_API_KEY` | Zukijourney API key (cloud LLM) |

### Discord Tokens (at least one)
| Variable | Cephalon |
|----------|----------|
| `DUCK_DISCORD_TOKEN` | Duck bot |
| `OPENHAX_DISCORD_TOKEN` | OpenHax bot |
| `OPEN_SKULL_DISCORD_TOKEN` | OpenSkull bot |
| `DISCORD_ERROR_BOT_TOKEN` | Error bot |

### Optional
| Variable | Default | Description |
|----------|---------|-------------|
| `CEPHALONS` | all | Comma-separated cephalon names |
| `CEPHALON_BOT_ID` | duck | Select local bot identity/token source for the single-runtime path (`duck`, `openhax`, `openskull`, `error`, or custom) |
| `CEPHALON_MODEL` | - | Force the same model for all 8 circuits |
| `CEPHALON_AUTO_MODEL_FAST` | - | Override the fast-circuit fallback model |
| `CEPHALON_AUTO_MODEL_DEEP` | - | Override the deep-circuit fallback model |
| `CEPHALON_MONGODB_URI` | - | MongoDB connection string |
| `MEMORY_UI_PORT` | 3000 | Memory UI port |

## Inspect Discord Channel Access (no LLM required)

If you just want to verify what each bot can *see* (guilds + channels) from the currently-set env tokens, you can run:

```bash
cd packages/cephalon-ts

# Summary for duck, openhax, openskull (defaults)
pnpm inspect:discord

# Inspect a single bot, machine-readable JSON
pnpm inspect:discord -- --bot openhax --json

# Print all accessible channels (can be noisy)
pnpm inspect:discord -- --bot duck --all-channels
```

## Project Structure
```
services/cephalon/
├── src/
│   ├── config/
│   │   └── policy.ts          # EDN policy loader
│   ├── core/
│   │   └── memory-store.ts    # Memory persistence
│   ├── context/
│   │   └── assembler.ts       # Context assembly
│   ├── discord/
│   │   └── integration.ts     # Discord gateway
│   ├── normalization/
│   │   └── discord-message.ts # Message normalization
│   ├── sessions/
│   │   └── manager.ts         # Session management
│   ├── types/
│   │   └── index.ts           # Type definitions
│   └── main.ts                # Entry point
├── policy/
│   └── cephalon.policy.edn    # Configuration
└── ecosystems/services_cephalon.cljs  # PM2 config (root)
```

## Implemented Components

### ✅ Phase 1: Foundation
- [x] Type definitions (Memory, Event, Policy, Session)
- [x] Policy EDN loader with defaults
- [x] Memory store (InMemory adapter)
- [x] Context assembler with token budgeting
- [x] Discord message normalization (SimHash, dedupe)
- [x] Retrieval scoring (similarity × recency × weights)
- [x] Discord integration (gateway connection)
- [x] Session manager (weighted fair queue)
- [x] Event bus integration
- [x] Main service runner
- [x] PM2 ecosystem configuration

### 🔄 Phase 2: In Progress
- [ ] Tool validator with repair loop
- [ ] Janitor session implementation
- [ ] Vector store integration (ChromaDB)
- [ ] LLM provider integration

## Configuration

### Environment Variables
```bash
# Duck's bot token (the cephalon itself)
DUCK_DISCORD_TOKEN=your_discord_bot_token

# OpenHax token (for testing - a DIFFERENT bot that can trigger Duck)
OPENHAX_DISCORD_TOKEN=different_bot_token
```

### ⚠️ Important: Testing with OpenHax Token

When testing Cephalon, use the **OPENHAX_DISCORD_TOKEN** to send messages:
- Duck cannot see his own messages (Discord optimization)
- OpenHax is a different bot account that can mention and trigger Duck
- Example test command:
```bash
curl -X POST "https://discord.com/api/v10/channels/343299242963763200/messages" \
  -H "Authorization: Bot $OPENHAX_DISCORD_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "@Duck test with OPENHAX token!"}'
```

### Policy EDN
Located at `policy/cephalon.policy.edn`:
- Model configuration (qwen3-vl-2b/4b/8b)
- Token budgets (6%/8%/18%/42%)
- Forced Discord channels
- Compaction settings
- Janitor configuration

## Running

### Development
```bash
cd services/cephalon
pnpm install
DUCK_DISCORD_TOKEN=xxx pnpm dev
```

### Production (PM2)
```bash
npx shadow-cljs release clobber
pm2 start ecosystem.config.cjs
```

## Testing

### Quick Test (after restart)
```bash
# Wait for Duck to come online (check Discord)
# Then send a test message using OpenHax token:
curl -X POST "https://discord.com/api/v10/channels/343299242963763200/messages" \
  -H "Authorization: Bot $OPENHAX_DISCORD_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "@Duck what time is it? Use get_current_time!"}'

# Watch logs:
pm2 logs cephalon --lines 50
```

### Expected Output (when working)
```
[Discord] discord.message.created in #bots: OpenHax#8539
[SessionManager] Routed discord.message.created to session conversational
[TurnProcessor] Processing turn for session conversational
[LLM] Tool request to qwen3-vl:2b-instruct
[LLM] Tool call detected (markdown format): get_current_time
[TOOL] Executing: get_current_time
[TOOL]   success: true
[TOOL]   result: {"timestamp":1769909584447,"iso":"2026-02-01T01:33:04.447Z"}
[Minting] Created tool memories
```

### Available Tools
| Tool | Purpose |
|------|---------|
| `memory.lookup` | Query memories (returns placeholder) |
| `memory.pin` | Pin important memory |
| `discord.send_message` | Send Discord message |
| `get_current_time` | Get current timestamp |

## Architecture

### Event Flow
1. Discord gateway receives message
2. Message normalized (SimHash, dedupe)
3. Event published to event bus
4. Session manager routes to appropriate session
5. Context assembled [persistent, recent, related]
6. LLM called with context
7. Response sent to Discord

### Context Assembly
```
1. system (hard-locked)
2. developer (contract)
3. persistent (pinned memories)
4. related (retrieved, scored)
5. recent (last N events)
6. current input
```

### Token Budgets
- system+developer: 6%
- persistent: 8%
- recent: 18%
- related: 42% (min 1.6× recent)
- safety: 3%

## Key Algorithms

### Retrieval Scoring
```
score = similarity × recencyBoost × kindWeight × sourceWeight
recencyBoost = 1 + α × e^(-Δt/τ)
```

### SimHash (64-bit)
- Tokenize normalized text
- Compute hash for each token
- Vote on each bit position
- Result: 64-bit fingerprint

### Access Decay
```
decayed = count × e^(-Δt/τ) + 1
τ = 21 days
```

## Next Steps

1. **Tool Validator**: JSON schema validation + repair loop
2. **Janitor Session**: Spam cleanup state machine
3. **Vector Store**: ChromaDB integration for embeddings
4. **LLM Provider**: Tool-calling with qwen3-vl-2b
5. **Tests**: Unit + integration tests
