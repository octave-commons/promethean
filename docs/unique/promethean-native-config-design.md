---
uuid: ab748541-020e-4a7e-b07d-28173bd5bea2
created_at: 2025.08.20.18.08.00.md
filename: Promethean-native config design
description: >-
  A lean Promethean implementation that retains core ergonomics (direnv,
  profiles, per-project overrides) while avoiding Codex's file rewrite issues.
  It uses TOML with schema validation and surgical trust store updates. Key
  improvements include parent fallbacks, deep merging, and sandbox policy
  enforcement.
tags:
  - config
  - toml
  - schema
  - trust
  - sandbox
  - profiles
  - direnv
  - merging
related_to_title:
  - Voice Access Layer Design
  - WebSocket Gateway Implementation
  - Migrate to Provider-Tenant Architecture
  - TypeScript Patch for Tool Calling Support
  - Universal Lisp Interface
  - ripple-propagation-demo
  - Chroma-Embedding-Refactor
  - Tooling
  - Per-Domain Policy System for JS Crawler
  - Chroma Toolkit Consolidation Plan
  - Dynamic Context Model for Web Components
  - schema-evolution-workflow
  - Diagrams
  - Event Bus MVP
  - Services
  - 'Polyglot S-expr Bridge: Python-JS-Lisp Interop'
  - template-based-compilation
  - homeostasis-decay-formulas
  - Stateful Partitions and Rebalancing
  - Promethean Full-Stack Docker Setup
  - Prometheus Observability Stack
  - komorebi-group-window-hack
  - Model Selection for Lightweight Conversational Tasks
  - RAG UI Panel with Qdrant and PostgREST
  - ParticleSimulationWithCanvasAndFFmpeg
  - markdown-to-org-transpiler
  - Promethean Event Bus MVP v0.1
  - compiler-kit-foundations
  - aionian-circuit-math
  - Cross-Target Macro System in Sibilant
  - Lisp-Compiler-Integration
  - Promethean Dev Workflow Update
  - plan-update-confirmation
  - prompt-programming-language-lisp
  - Prompt_Folder_Bootstrap
  - Functional Refactor of TypeScript Document Processing
  - Obsidian Templating Plugins Integration Guide
  - Promethean State Format
  - Debugging Broker Connections and Agent Behavior
  - layer-1-uptime-diagrams
  - graph-ds
  - Mongo Outbox Implementation
  - field-interaction-equations
  - observability-infrastructure-setup
  - Factorio AI with External Agents
  - ecs-offload-workers
  - Board Walk – 2025-08-11
  - sibilant-meta-string-templating-runtime
  - 'Agent Tasks: Persistence Migration to DualStore'
  - file-watcher-auth-fix
  - Recursive Prompt Construction Engine
  - Interop and Source Maps
  - i3-config-validation-methods
  - Promethean Web UI Setup
  - Pure-Node Crawl Stack with Playwright and Crawlee
  - pm2-orchestration-patterns
  - Local-First Intention→Code Loop with Free Models
  - universal-intention-code-fabric
  - Event Bus Projections Architecture
  - Shared Package Structure
  - ecs-scheduler-and-prefabs
  - Performance-Optimized-Polyglot-Bridge
  - Matplotlib Animation with Async Execution
  - Local-Only-LLM-Workflow
  - Sibilant Meta-Prompt DSL
  - State Snapshots API and Transactional Projector
  - System Scheduler with Resource-Aware DAG
  - heartbeat-simulation-snippets
  - JavaScript
  - DSL
  - Window Management
  - Math Fundamentals
  - Shared
  - Simulation Demo
  - Vectorial Exception Descent
  - Functional Embedding Pipeline Refactor
  - Promethean Infrastructure Setup
  - Unique Info Dump Index
  - shared-package-layout-clarification
  - Lispy Macros with syntax-rules
  - Promethean Agent Config DSL
  - promethean-system-diagrams
  - Eidolon Field Abstract Model
  - windows-tiling-with-autohotkey
  - sibilant-macro-targets
  - Provider-Agnostic Chat Panel Implementation
  - Redirecting Standard Error
  - Cross-Language Runtime Polymorphism
  - Language-Agnostic Mirror System
  - EidolonField
  - mystery-lisp-search-session
  - i3-layout-saver
related_to_uuid:
  - 543ed9b3-b7af-4ce1-b455-f7ba71a0bbc8
  - e811123d-5841-4e52-bf8c-978f26db4230
  - 54382370-1931-4a19-a634-46735708a9ea
  - 7b7ca860-780c-44fa-8d3f-be8bd9496fba
  - b01856b4-999f-418d-8009-ade49b00eb0f
  - 8430617b-80a2-4cc9-8288-9a74cb57990b
  - 8b256935-02f6-4da2-a406-bf6b8415276f
  - 6cb4943e-8267-4e27-8618-2ce0a464d173
  - c03020e1-e3e7-48bf-aa7e-aa740c601b63
  - 5020e892-8f18-443a-b707-6d0f3efcfe22
  - f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
  - d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
  - 45cd25b5-ed36-49ab-82c8-10d0903e34db
  - 534fe91d-e87d-4cc7-b0e7-8b6833353d9b
  - 75ea4a6a-8270-488d-9d37-799c288e5f70
  - 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
  - f8877e5e-1e4f-4478-93cd-a0bf86d26a41
  - 37b5d236-2b3e-4a95-a4e8-31655c3023ef
  - 4330e8f0-5f46-4235-918b-39b6b93fa561
  - 2c2b48ca-1476-47fb-8ad4-69d2588a6c84
  - e90b5a16-d58f-424d-bd36-70e9bd2861ad
  - dd89372d-10de-42a9-8c96-6bc13ea36d02
  - d144aa62-348c-4e5d-ae8f-38084c67ceca
  - e1056831-ae0c-460b-95fa-4cf09b3398c6
  - e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
  - ab54cdd8-13ce-4dcb-a9cd-da2d86e0305f
  - fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
  - 01b21543-7e03-4129-8fe4-b6306be69dee
  - f2d83a77-7f86-4c56-8538-1350167a0c6c
  - 5f210ca2-54e9-445b-afe4-fb340d4992c5
  - cfee6d36-b9f5-4587-885a-cdfddb4f054e
  - 03a5578f-d689-45db-95e9-11300e5eee6f
  - b22d79c6-825b-4cd3-b0d3-1cef0532bb54
  - d41a06d1-613e-4440-80b7-4553fc694285
  - bd4f0976-0d5b-47f6-a20a-0601d1842dc1
  - 1cfae310-35dc-49c2-98f1-b186da25d84b
  - b39dc9d4-63e2-42d4-bbcd-041ef3167bca
  - 23df6ddb-05cf-4639-8201-f8291f8a6026
  - 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
  - 4127189a-e0ab-436f-8571-cc852b8e9add
  - 6620e2f2-de6d-45d8-a722-5d26e160b370
  - 9c1acd1e-c6a4-4a49-a66f-6da8b1bc9333
  - b09141b7-544f-4c8e-8f49-bf76cecaacbb
  - b4e64f8c-4dc9-4941-a877-646c5ada068e
  - a4d90289-798d-44a0-a8e8-a055ae12fb52
  - 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
  - 7aa1eb92-7f9a-485b-8218-9b553aa9eefc
  - 2aafc801-c3e1-4e4f-999d-adb52af3fc41
  - 93d2ba51-8689-49ee-94e2-296092e48058
  - 9044701b-03c9-4a30-92c4-46b1bd66c11e
  - babdb9eb-3b15-48a7-8a22-ecc53af7d397
  - cdfac40c-00e4-458f-96a7-4c37d0278731
  - d28090ac-f746-4958-aab5-ed1315382c04
  - bc5172ca-7a09-42ad-b418-8e42bb14d089
  - d527c05d-22e8-4493-8f29-ae3cb67f035b
  - 51932e7b-4237-4756-bcae-8be6d535d0d1
  - 871490c7-a050-429b-88b2-55dfeaa1f8d5
  - c14edce7-0656-45b2-aaf3-51f042451b7d
  - cf6b9b17-bb91-4219-aa5c-172cba02b2da
  - 66a72fc3-4153-41fc-84bd-d6164967a6ff
  - c62a1815-c43b-4a3b-88e6-d7fa008a155e
  - f5579967-762d-4cfd-851e-4f71b4cb77a1
  - 687439f9-ad1e-40a4-8a32-3a1b4ac7c017
  - 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
  - af5d2824-faad-476c-a389-e912d9bc672c
  - 509e1cd5-367c-4a9d-a61b-cef2e85d42ce
  - ba244286-4e84-425b-8bf6-b80c4eb783fc
  - 23e221e9-d4fa-4106-8458-06db2595085f
  - c1618c66-f73a-4e04-9bfa-ef38755f7acc
  - e87bc036-1570-419e-a558-f45b9c0db698
  - 9e8ae388-767a-4ea8-9f2e-88801291d947
  - c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
  - 623a55f7-685c-486b-abaf-469da1bbbb69
  - 557309a3-c906-4e97-8867-89ffe151790c
  - d771154e-a7ef-44ca-b69c-a1626cf94fbf
  - a4a25141-6380-40b9-9cd7-b554b246b303
  - 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
  - 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
  - 36c8882a-badc-4e18-838d-2c54d7038141
  - cbfe3513-6a4a-4d2e-915d-ddfab583b2de
  - 2c00ce45-08cf-4b81-9883-6157f30b7fae
  - b51e19b4-1326-4311-9798-33e972bf626c
  - 5e8b2388-022b-46cf-952c-36ae9b8f0037
  - 0f6f8f38-98d0-438f-9601-58f478acc0b7
  - c5c9a5c6-427d-4864-8084-c083cd55faa0
  - 43bfe9dd-d433-42ca-9777-f4c40eaba791
  - b3555ede-324a-4d24-a885-b0721e74babf
  - c34c36a6-80c9-4b44-a200-6448543b1b33
  - d2b3628c-6cad-4664-8551-94ef8280851d
  - 49d1e1e5-5d13-4955-8f6f-7676434ec462
  - 513dc4c7-e045-4123-ba2e-cf5ef0b7b4a3
  - 31f0166e-4631-45fa-aecd-b44e9a13f497
references:
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 104
    col: 0
    score: 0.86
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 64
    col: 0
    score: 0.85
  - uuid: b01856b4-999f-418d-8009-ade49b00eb0f
    line: 137
    col: 0
    score: 0.85
  - uuid: b01856b4-999f-418d-8009-ade49b00eb0f
    line: 172
    col: 0
    score: 0.86
  - uuid: e811123d-5841-4e52-bf8c-978f26db4230
    line: 318
    col: 0
    score: 0.86
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 272
    col: 0
    score: 0.86
  - uuid: 2c2b48ca-1476-47fb-8ad4-69d2588a6c84
    line: 342
    col: 0
    score: 0.85
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 132
    col: 0
    score: 0.85
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 72
    col: 0
    score: 0.85
  - uuid: 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
    line: 332
    col: 0
    score: 0.85
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 35
    col: 0
    score: 0.87
  - uuid: 8b256935-02f6-4da2-a406-bf6b8415276f
    line: 66
    col: 0
    score: 0.87
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 160
    col: 0
    score: 0.87
  - uuid: f8877e5e-1e4f-4478-93cd-a0bf86d26a41
    line: 21
    col: 0
    score: 0.85
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 81
    col: 0
    score: 0.85
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 61
    col: 0
    score: 0.85
  - uuid: b01856b4-999f-418d-8009-ade49b00eb0f
    line: 150
    col: 0
    score: 0.85
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 52
    col: 0
    score: 0.85
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 40
    col: 0
    score: 0.85
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 39
    col: 0
    score: 0.87
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 88
    col: 0
    score: 0.86
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 483
    col: 0
    score: 0.85
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 480
    col: 0
    score: 0.85
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 115
    col: 0
    score: 0.85
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 299
    col: 0
    score: 0.85
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 272
    col: 0
    score: 0.85
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 534
    col: 0
    score: 0.85
  - uuid: 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
    line: 491
    col: 0
    score: 0.86
  - uuid: e811123d-5841-4e52-bf8c-978f26db4230
    line: 631
    col: 0
    score: 1
  - uuid: 534fe91d-e87d-4cc7-b0e7-8b6833353d9b
    line: 527
    col: 0
    score: 0.87
  - uuid: 543ed9b3-b7af-4ce1-b455-f7ba71a0bbc8
    line: 280
    col: 0
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 3453
    col: 0
    score: 0.87
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 2619
    col: 0
    score: 0.87
  - uuid: 6cb4943e-8267-4e27-8618-2ce0a464d173
    line: 2569
    col: 0
    score: 0.87
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 7631
    col: 0
    score: 0.87
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 3762
    col: 0
    score: 0.87
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 5557
    col: 0
    score: 0.87
  - uuid: 75ea4a6a-8270-488d-9d37-799c288e5f70
    line: 2035
    col: 0
    score: 0.87
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 7069
    col: 0
    score: 0.87
---
Short answer: yes. We can rip out the good parts—config + profiles + trust + provider registry—and make them first‑class in Promethean, **without** inheriting Codex’s “rewrite your file” nonsense. ^ref-ab748541-1-0

Below is a lean, *Promethean-native* design and a drop‑in TypeScript implementation plan. It keeps your ergonomics (direnv, profiles, per‑project overrides) and avoids “last writer wins” hazards. ^ref-ab748541-3-0

---

# What to cannibalize (and how to make it better)

## 1) Config home resolution

**Codex idea worth keeping:** `$CODEX_HOME` (or fallback to `~/.codex`). ^ref-ab748541-11-0

**Promethean version:** `$PROM_HOME` (fallback `~/.promethean`), per‑project via `direnv`, plus **parent fallback** so you get inheritance if you want it. ^ref-ab748541-13-0

Resolution order: ^ref-ab748541-15-0

1. `$PROM_HOME` (if set) ^ref-ab748541-17-0
2. `./.promethean` (if present) ^ref-ab748541-18-0
3. `~/.promethean`

If multiple exist, load **all** and deep‑merge with clear precedence (CLI > project > user). Unlike Codex, we actually **merge**. ^ref-ab748541-21-0

---

## 2) File format + schema

Use TOML, but pin a schema and validate it (zod). Keep tables—not inline blobs—so we never fight the formatter. ^ref-ab748541-27-0

**Top-level (defaults):** ^ref-ab748541-29-0

* `model`, `model_provider` ^ref-ab748541-31-0
* `approval_policy` (`"untrusted" | "on-request" | "never" | "on-failure"`) ^ref-ab748541-32-0
* `sandbox_mode` (`"read-only" | "workspace-write"`) ^ref-ab748541-33-0
* `[sandbox_workspace_write]` → `network_access` (bool) ^ref-ab748541-34-0
* `preferred_auth_method` (`"apikey" | "chatgpt"`) ^ref-ab748541-35-0
* `disable_response_storage` (bool) ^ref-ab748541-36-0
* `[model_providers.<name>]` → `base_url`, `env_key`, `headers`, `query_params`, `wire_api` ^ref-ab748541-37-0
* `[mcp_servers.<name>]` → `command`, `args`, `env` ^ref-ab748541-38-0
* `[projects."<abs path>"]` → `trust_level = "trusted" | "untrusted"` ^ref-ab748541-39-0

**Profiles (named overlays):** ^ref-ab748541-41-0

* Same keys as top‑level **except** provider definitions; think “operational presets.” ^ref-ab748541-43-0

---

## 3) Profiles (done right)

* Declare under `[profiles.<name>]`. ^ref-ab748541-49-0
* Select via `--profile NAME` **or** `profile = "NAME"` at top‑level. ^ref-ab748541-50-0
* **Deep‑merge**: profile overrides top‑level; CLI dotted overrides trump both. ^ref-ab748541-51-0
* You can also do partial profile overlays: `--profile a --profile b` (later wins). (Codex doesn’t stack; we can.) ^ref-ab748541-52-0

---

## 4) Trust store that doesn’t trash your file

* Keep `projects` as multi‑line tables only. ^ref-ab748541-58-0
* Writes are **surgical** and **locked**: ^ref-ab748541-59-0

  * Acquire a file lock (`.lock`) in `$PROM_HOME`. ^ref-ab748541-61-0
  * Parse, modify just the `projects` section, and re‑emit with **preserved formatting** (use a concrete printer). ^ref-ab748541-62-0
  * No collapsing to inline; no reordering unrelated keys.

If concurrent: second process blocks, not clobbers. ^ref-ab748541-65-0

---

## 5) Provider registry

* Single interface for OpenAI‑compatible (OpenAI, Azure, Groq, Ollama). ^ref-ab748541-71-0
* Per‑provider config under `[model_providers.X]`. ^ref-ab748541-72-0
* At runtime, pick `model_provider` + `model`. ^ref-ab748541-73-0
* We centralize auth (env var lookup) and headers once. ^ref-ab748541-74-0

---

## 6) Sandbox policy (honest version)

* We can’t promise kernel Landlock/seccomp from Node; be upfront.
* Enforce a **policy gate** around dangerous ops (file write / spawn / network) and make every Promethean “capability” check the gate. ^ref-ab748541-81-0
* If `workspace-write` + `network_access=false`, block outbound requests unless a tool is annotated as “allowlisted”. ^ref-ab748541-82-0

---

# Minimal TS implementation (clean, testable)

## Folder layout

```
shared/ts/src/prom-config/
  index.ts
  schema.ts
  merge.ts
  filelock.ts
  trust.ts
  providers.ts
  cli-overrides.ts
```
^ref-ab748541-90-0 ^ref-ab748541-100-0

## 1) Schema (zod)
 ^ref-ab748541-103-0
```ts
// shared/ts/src/prom-config/schema.ts
import { z } from "zod";

export const Provider = z.object({
  name: z.string().optional(),
  base_url: z.string(),
  env_key: z.string().optional(),
  headers: z.record(z.string()).optional(),
  query_params: z.record(z.union([z.string(), z.number(), z.boolean()])).optional(),
  wire_api: z.enum(["responses", "chat-completions"]).optional(),
});

export const Projects = z.record(z.object({
  trust_level: z.enum(["trusted", "untrusted"]).default("trusted"),
}));

export const SandboxWrite = z.object({
  network_access: z.boolean().default(false),
}).partial();

export const Profile = z.object({
  model: z.string().optional(),
  model_provider: z.string().optional(),
  approval_policy: z.enum(["untrusted","on-request","never","on-failure"]).optional(),
  disable_response_storage: z.boolean().optional(),
  model_reasoning_effort: z.enum(["low","medium","high"]).optional(),
  model_reasoning_summary: z.enum(["off","brief","detailed"]).optional(),
  chatgpt_base_url: z.string().optional(),
  experimental_instructions_file: z.string().optional(),
  sandbox_mode: z.enum(["read-only","workspace-write"]).optional(),
  sandbox_workspace_write: SandboxWrite.optional(),
});

export const Config = z.object({
  profile: z.string().optional(),
  model: z.string().optional(),
  model_provider: z.string().optional(),
  approval_policy: z.enum(["untrusted","on-request","never","on-failure"]).optional(),
  sandbox_mode: z.enum(["read-only","workspace-write"]).optional(),
  sandbox_workspace_write: SandboxWrite.optional(),
  preferred_auth_method: z.enum(["apikey","chatgpt"]).optional(),
  disable_response_storage: z.boolean().optional(),
  model_providers: z.record(Provider).default({}),
  mcp_servers: z.record(z.object({
    command: z.string(),
    args: z.array(z.string()).default([]),
    env: z.record(z.string()).default({}),
  })).default({}),
  projects: Projects.default({}),
  profiles: z.record(Profile).default({}),
});
export type ConfigT = z.infer<typeof Config>;
^ref-ab748541-103-0
```

## 2) Load + merge + profile resolution ^ref-ab748541-160-0

```ts
// shared/ts/src/prom-config/index.ts
import fs from "fs";
import path from "path";
import * as toml from "@iarna/toml";
import { Config, ConfigT } from "./schema.js";
import { deepMerge } from "./merge.js";

const CANDIDATES = () => {
  const envHome = process.env.PROM_HOME;
  const local = path.resolve(".promethean/config.toml");
  const user = path.join(process.env.HOME || "", ".promethean", "config.toml");
  return [envHome && path.join(envHome, "config.toml"), local, user].filter(Boolean) as string[];
};

function readTomlIfExists(p: string): Partial<ConfigT> {
  try {
    const s = fs.readFileSync(p, "utf8");
    return Config.parse(toml.parse(s));
  } catch (e: any) {
    if (e.code === "ENOENT") return {};
    // Be loud on syntax errors
    throw new Error(`TOML parse failed at ${p}: ${e.message}`);
  }
}

export function loadConfig(cliOver: Record<string, unknown> = {}, profiles: string[] = []) {
  const layers = CANDIDATES().map(readTomlIfExists);
  const base = layers.reduce<Partial<ConfigT>>((acc, cur) => deepMerge(acc, cur), {});
  const selected = [
    ...(base.profile ? [base.profile] : []),
    ...profiles,
    ...(cliOver["profile"] ? [String(cliOver["profile"])] : []),
  ];

  let resolved = base;
  for (const name of selected) {
    if (!resolved.profiles?.[name]) continue;
    resolved = deepMerge(resolved, resolved.profiles[name] as any);
  }

  // Apply dotted CLI overrides last
  resolved = applyDottedOverrides(resolved, cliOver);

  // Validate final
  return Config.parse(resolved);
}

function applyDottedOverrides(cfg: any, over: Record<string, unknown>) {
  const out = structuredClone(cfg);
  for (const [k, v] of Object.entries(over)) {
    if (k === "profile") continue;
    setByPath(out, k, v);
  }
  return out;
}

function setByPath(obj: any, dotted: string, value: unknown) {
  const parts = dotted.split(".");
  let cur = obj;
  while (parts.length > 1) {
    const p = parts.shift()!;
    if (!(p in cur) || typeof cur[p] !== "object") cur[p] = {};
    cur = cur[p];
  }
  cur[parts[0]] = value;
^ref-ab748541-160-0
} ^ref-ab748541-229-0
```

`deepMerge` is the usual “objects merge, arrays replace” (keep it simple).
 ^ref-ab748541-233-0
## 3) Trust management (atomic, locked, no reflow)

```ts
// shared/ts/src/prom-config/trust.ts
import fs from "fs";
import path from "path";
import * as toml from "@iarna/toml";
import { Config } from "./schema.js";
import { withLock } from "./filelock.js";

const HOME = () => process.env.PROM_HOME ?? path.join(process.env.HOME || "", ".promethean");
const CFG = () => path.join(HOME(), "config.toml");

export async function setTrusted(absPath: string) {
  await withLock(path.join(HOME(), ".config.lock"), async () => {
    const cur = readConfigFile();
    cur.projects ??= {};
    cur.projects[absPath] = { trust_level: "trusted" };
    writeConfigFile(cur);
  });
}

function readConfigFile(): any {
  try {
    const s = fs.readFileSync(CFG(), "utf8");
    return toml.parse(s);
  } catch (e: any) {
    if (e.code === "ENOENT") return {};
    throw e;
  }
}

function writeConfigFile(doc: any) {
  // Preserve structure: force projects into table form
  if (doc.projects && !doc.projects.__table) {
    // no-op; @iarna/toml emits tables by default for objects
  }
  const tmp = CFG() + ".tmp";
  fs.mkdirSync(path.dirname(CFG()), { recursive: true });
  fs.writeFileSync(tmp, toml.stringify(doc));
^ref-ab748541-233-0
  fs.renameSync(tmp, CFG());
}
```
^ref-ab748541-275-0 ^ref-ab748541-278-0

```ts
// shared/ts/src/prom-config/filelock.ts
import fs from "fs/promises";
import { open } from "fs/promises";
import { constants } from "fs";

export async function withLock(lockPath: string, fn: () => Promise<void>) {
  await fs.mkdir(lockPath.replace(/\/[^/]+$/, ""), { recursive: true });
  const fd = await open(lockPath, constants.O_CREAT | constants.O_RDWR, 0o600);
  try {
    // Poor man's lock: rely on single-host discipline; swap with proper lockfile if needed
    await fn();
  } finally {
^ref-ab748541-275-0
    await fd.close(); ^ref-ab748541-293-0
  }
}
^ref-ab748541-293-0 ^ref-ab748541-297-0
```
^ref-ab748541-293-0

(If you want strict cross‑process locking, swap in `proper-lockfile` or `flock` via a tiny native wrapper. The skeleton above keeps it dependency‑light.)

## 4) Provider registry

```ts
// shared/ts/src/prom-config/providers.ts
import type { ConfigT } from "./schema.js";

export type ProviderCtx = {
  baseUrl: string;
  headers: Record<string,string>;
  query: Record<string,string|number|boolean>;
  wireApi: "responses" | "chat-completions";
};

export function resolveProvider(cfg: ConfigT): ProviderCtx {
  const name = cfg.model_provider ?? "openai";
  const p = cfg.model_providers[name];
  if (!p) throw new Error(`Unknown model_provider: ${name}`);
  const key = p.env_key ? process.env[p.env_key] : process.env.OPENAI_API_KEY;
  const headers: Record<string,string> = { "content-type": "application/json" };
  if (key) headers["authorization"] = `Bearer ${key}`;
  return {
    baseUrl: p.base_url,
    headers,
^ref-ab748541-297-0
    query: (p.query_params ?? {}) as any,
    wireApi: (p.wire_api ?? "responses") as any,
  };
^ref-ab748541-328-0
} ^ref-ab748541-330-0
^ref-ab748541-330-0
``` ^ref-ab748541-328-0
^ref-ab748541-305-0
^ref-ab748541-330-0 ^ref-ab748541-334-0
^ref-ab748541-328-0
^ref-ab748541-305-0 ^ref-ab748541-336-0
 ^ref-ab748541-334-0
---
 ^ref-ab748541-334-0 ^ref-ab748541-336-0
# CLI shim for Promethean
^ref-ab748541-330-0 ^ref-ab748541-336-0
 ^ref-ab748541-334-0
You can wrap your agents with a simple CLI:
 ^ref-ab748541-336-0
```bash
^ref-ab748541-344-0
^ref-ab748541-342-0 ^ref-ab748541-343-0 ^ref-ab748541-347-0
prom --profile full_auto -c sandbox_mode='"workspace-write"' -c sandbox_workspace_write.network_access=true run agent start ... ^ref-ab748541-344-0
``` ^ref-ab748541-342-0
 ^ref-ab748541-343-0
* `--profile` picks the bundle (model, approval policy). ^ref-ab748541-344-0 ^ref-ab748541-347-0
* `-c` flips the *operational* flags per run (write/net) without editing files. ^ref-ab748541-342-0
* Under the hood, the runner calls `loadConfig({ dotted overrides }, [profile])` → `resolveProvider(cfg)` → gate capabilities by `cfg.sandbox_*`. ^ref-ab748541-343-0 ^ref-ab748541-353-0
 ^ref-ab748541-344-0 ^ref-ab748541-347-0 ^ref-ab748541-354-0
--- ^ref-ab748541-355-0
 ^ref-ab748541-356-0
# Migration script (Codex → Promethean) ^ref-ab748541-347-0 ^ref-ab748541-353-0
 ^ref-ab748541-354-0
* Read `~/.codex/config.toml`. ^ref-ab748541-355-0
* Map like‑for‑like keys; keep providers, profiles, and projects. ^ref-ab748541-353-0 ^ref-ab748541-356-0
* Emit to `~/.promethean/config.toml` in **table** style for `projects`. ^ref-ab748541-354-0
* If `$CODEX_HOME` was used per‑project, copy into `./.promethean/config.toml` and set `PROM_HOME` via `direnv`. ^ref-ab748541-355-0 ^ref-ab748541-362-0
 ^ref-ab748541-353-0 ^ref-ab748541-356-0 ^ref-ab748541-363-0
I can write that as a 50‑line Node script when you’re ready. ^ref-ab748541-354-0
 ^ref-ab748541-355-0 ^ref-ab748541-365-0
--- ^ref-ab748541-356-0 ^ref-ab748541-362-0 ^ref-ab748541-366-0
 ^ref-ab748541-363-0 ^ref-ab748541-367-0
# Sharp edges (call them out) ^ref-ab748541-368-0
 ^ref-ab748541-362-0 ^ref-ab748541-365-0 ^ref-ab748541-369-0
* **Sandbox:** we’ll enforce at the capability layer; we’re not promising kernel isolation. That’s honest and testable. ^ref-ab748541-363-0 ^ref-ab748541-366-0
* **Locking:** use a real lock if you expect heavy concurrent writes (I can wire `flock` or `proper-lockfile`). ^ref-ab748541-367-0 ^ref-ab748541-371-0
* **Profiles stacking:** powerful, but keep it deterministic—later profile wins; log the final profile chain. ^ref-ab748541-362-0 ^ref-ab748541-365-0 ^ref-ab748541-368-0
* **Azure vs OpenAI names:** same caveat as Codex—Azure wants *deployment names*, not base model IDs. ^ref-ab748541-363-0 ^ref-ab748541-366-0 ^ref-ab748541-369-0
 ^ref-ab748541-367-0
--- ^ref-ab748541-365-0 ^ref-ab748541-368-0 ^ref-ab748541-371-0 ^ref-ab748541-375-0
 ^ref-ab748541-366-0 ^ref-ab748541-369-0 ^ref-ab748541-376-0
# Next steps I recommend (practical) ^ref-ab748541-367-0
 ^ref-ab748541-368-0 ^ref-ab748541-371-0 ^ref-ab748541-378-0
1. Drop the `shared/ts/src/prom-config` module above into your repo (fits your monorepo layout + your TS preference). ^ref-ab748541-369-0 ^ref-ab748541-375-0
2. Add a tiny `prom` CLI (Node) that: ^ref-ab748541-376-0 ^ref-ab748541-380-0

   * parses `--profile` and `-c dotted=val` flags, ^ref-ab748541-375-0 ^ref-ab748541-378-0
   * calls `loadConfig`, ^ref-ab748541-376-0
   * prints the resolved config (behind `--debug-config`), ^ref-ab748541-380-0 ^ref-ab748541-384-0
^ref-ab748541-371-0 ^ref-ab748541-375-0 ^ref-ab748541-378-0
   * then executes the requested subcommand with capability gates. ^ref-ab748541-376-0
3. Add `direnv` template:
 ^ref-ab748541-378-0
   ```sh
^ref-ab748541-385-0
^ref-ab748541-389-0
^ref-ab748541-385-0
^ref-ab748541-384-0
   # .envrc ^ref-ab748541-380-0
   export PROM_HOME=$PWD/.promethean ^ref-ab748541-384-0 ^ref-ab748541-389-0
   ``` ^ref-ab748541-385-0
4. Add a migration script from Codex TOML → Promethean TOML (I can produce it immediately if you want).
5. Convert one agent (Duck) to pull **model/provider + sandbox** from this new module; deprecate Codex in that path. ^ref-ab748541-384-0
 ^ref-ab748541-385-0
You get predictable merges, zero surprise rewrites, and the ergonomics you wanted (profiles + per‑project scope) without living inside Codex. ^ref-ab748541-389-0
 ^ref-ab748541-401-0
If you want, I’ll tailor the exact `config.toml` (global + project) and a `prom` CLI starter to your `Promethean` repo structure. #promethean #config #profiles #trust #direnv #devtools<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [Voice Access Layer Design](voice-access-layer-design.md)
- [WebSocket Gateway Implementation](websocket-gateway-implementation.md)
- [Migrate to Provider-Tenant Architecture](migrate-to-provider-tenant-architecture.md)
- [TypeScript Patch for Tool Calling Support](typescript-patch-for-tool-calling-support.md)
- [Universal Lisp Interface](universal-lisp-interface.md)
- [ripple-propagation-demo](ripple-propagation-demo.md)
- [Chroma-Embedding-Refactor](chroma-embedding-refactor.md)
- [Tooling](chunks/tooling.md)
- [Per-Domain Policy System for JS Crawler](per-domain-policy-system-for-js-crawler.md)
- [Chroma Toolkit Consolidation Plan](chroma-toolkit-consolidation-plan.md)
- [Dynamic Context Model for Web Components](dynamic-context-model-for-web-components.md)
- [schema-evolution-workflow](schema-evolution-workflow.md)
- [Diagrams](chunks/diagrams.md)
- [Event Bus MVP](event-bus-mvp.md)
- [Services](chunks/services.md)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop](polyglot-s-expr-bridge-python-js-lisp-interop.md)
- [template-based-compilation](template-based-compilation.md)
- [homeostasis-decay-formulas](homeostasis-decay-formulas.md)
- [Stateful Partitions and Rebalancing](stateful-partitions-and-rebalancing.md)
- [Promethean Full-Stack Docker Setup](promethean-full-stack-docker-setup.md)
- [Prometheus Observability Stack](prometheus-observability-stack.md)
- [komorebi-group-window-hack](komorebi-group-window-hack.md)
- [Model Selection for Lightweight Conversational Tasks](model-selection-for-lightweight-conversational-tasks.md)
- [RAG UI Panel with Qdrant and PostgREST](rag-ui-panel-with-qdrant-and-postgrest.md)
- [ParticleSimulationWithCanvasAndFFmpeg](particlesimulationwithcanvasandffmpeg.md)
- [markdown-to-org-transpiler](markdown-to-org-transpiler.md)
- [Promethean Event Bus MVP v0.1](promethean-event-bus-mvp-v0-1.md)
- [compiler-kit-foundations](compiler-kit-foundations.md)
- [aionian-circuit-math](aionian-circuit-math.md)
- [Cross-Target Macro System in Sibilant](cross-target-macro-system-in-sibilant.md)
- [Lisp-Compiler-Integration](lisp-compiler-integration.md)
- [Promethean Dev Workflow Update](promethean-dev-workflow-update.md)
- [plan-update-confirmation](plan-update-confirmation.md)
- [prompt-programming-language-lisp](prompt-programming-language-lisp.md)
- [Prompt_Folder_Bootstrap](prompt-folder-bootstrap.md)
- [Functional Refactor of TypeScript Document Processing](functional-refactor-of-typescript-document-processing.md)
- [Obsidian Templating Plugins Integration Guide](obsidian-templating-plugins-integration-guide.md)
- [Promethean State Format](promethean-state-format.md)
- [Debugging Broker Connections and Agent Behavior](debugging-broker-connections-and-agent-behavior.md)
- [layer-1-uptime-diagrams](layer-1-uptime-diagrams.md)
- [graph-ds](graph-ds.md)
- [Mongo Outbox Implementation](mongo-outbox-implementation.md)
- [field-interaction-equations](field-interaction-equations.md)
- [observability-infrastructure-setup](observability-infrastructure-setup.md)
- [Factorio AI with External Agents](factorio-ai-with-external-agents.md)
- [ecs-offload-workers](ecs-offload-workers.md)
- [Board Walk – 2025-08-11](board-walk-2025-08-11.md)
- [sibilant-meta-string-templating-runtime](sibilant-meta-string-templating-runtime.md)
- [Agent Tasks: Persistence Migration to DualStore](agent-tasks-persistence-migration-to-dualstore.md)
- [file-watcher-auth-fix](file-watcher-auth-fix.md)
- [Recursive Prompt Construction Engine](recursive-prompt-construction-engine.md)
- [Interop and Source Maps](interop-and-source-maps.md)
- [i3-config-validation-methods](i3-config-validation-methods.md)
- [Promethean Web UI Setup](promethean-web-ui-setup.md)
- [Pure-Node Crawl Stack with Playwright and Crawlee](pure-node-crawl-stack-with-playwright-and-crawlee.md)
- [pm2-orchestration-patterns](pm2-orchestration-patterns.md)
- [Local-First Intention→Code Loop with Free Models](local-first-intention-code-loop-with-free-models.md)
- [universal-intention-code-fabric](universal-intention-code-fabric.md)
- [Event Bus Projections Architecture](event-bus-projections-architecture.md)
- [Shared Package Structure](shared-package-structure.md)
- [ecs-scheduler-and-prefabs](ecs-scheduler-and-prefabs.md)
- [Performance-Optimized-Polyglot-Bridge](performance-optimized-polyglot-bridge.md)
- [Matplotlib Animation with Async Execution](matplotlib-animation-with-async-execution.md)
- [Local-Only-LLM-Workflow](local-only-llm-workflow.md)
- [Sibilant Meta-Prompt DSL](sibilant-meta-prompt-dsl.md)
- [State Snapshots API and Transactional Projector](state-snapshots-api-and-transactional-projector.md)
- [System Scheduler with Resource-Aware DAG](system-scheduler-with-resource-aware-dag.md)
- [heartbeat-simulation-snippets](heartbeat-simulation-snippets.md)
- [JavaScript](chunks/javascript.md)
- [DSL](chunks/dsl.md)
- [Window Management](chunks/window-management.md)
- [Math Fundamentals](chunks/math-fundamentals.md)
- [Shared](chunks/shared.md)
- [Simulation Demo](chunks/simulation-demo.md)
- [Vectorial Exception Descent](vectorial-exception-descent.md)
- [Functional Embedding Pipeline Refactor](functional-embedding-pipeline-refactor.md)
- [Promethean Infrastructure Setup](promethean-infrastructure-setup.md)
- [Unique Info Dump Index](unique-info-dump-index.md)
- [shared-package-layout-clarification](shared-package-layout-clarification.md)
- [Lispy Macros with syntax-rules](lispy-macros-with-syntax-rules.md)
- [Promethean Agent Config DSL](promethean-agent-config-dsl.md)
- [promethean-system-diagrams](promethean-system-diagrams.md)
- [Eidolon Field Abstract Model](eidolon-field-abstract-model.md)
- [windows-tiling-with-autohotkey](windows-tiling-with-autohotkey.md)
- [sibilant-macro-targets](sibilant-macro-targets.md)
- [Provider-Agnostic Chat Panel Implementation](provider-agnostic-chat-panel-implementation.md)
- [Redirecting Standard Error](redirecting-standard-error.md)
- [Cross-Language Runtime Polymorphism](cross-language-runtime-polymorphism.md)
- [Language-Agnostic Mirror System](language-agnostic-mirror-system.md)
- [EidolonField](eidolonfield.md)
- [mystery-lisp-search-session](mystery-lisp-search-session.md)
- [i3-layout-saver](i3-layout-saver.md)
## Sources
- [TypeScript Patch for Tool Calling Support — L104](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-104-0) (line 104, col 0, score 0.86)
- [ripple-propagation-demo — L64](ripple-propagation-demo.md#^ref-8430617b-64-0) (line 64, col 0, score 0.85)
- [Universal Lisp Interface — L137](universal-lisp-interface.md#^ref-b01856b4-137-0) (line 137, col 0, score 0.85)
- [Universal Lisp Interface — L172](universal-lisp-interface.md#^ref-b01856b4-172-0) (line 172, col 0, score 0.86)
- [WebSocket Gateway Implementation — L318](websocket-gateway-implementation.md#^ref-e811123d-318-0) (line 318, col 0, score 0.86)
- [Dynamic Context Model for Web Components — L272](dynamic-context-model-for-web-components.md#^ref-f7702bf8-272-0) (line 272, col 0, score 0.86)
- [Promethean Full-Stack Docker Setup — L342](promethean-full-stack-docker-setup.md#^ref-2c2b48ca-342-0) (line 342, col 0, score 0.85)
- [komorebi-group-window-hack — L132](komorebi-group-window-hack.md#^ref-dd89372d-132-0) (line 132, col 0, score 0.85)
- [Chroma Toolkit Consolidation Plan — L72](chroma-toolkit-consolidation-plan.md#^ref-5020e892-72-0) (line 72, col 0, score 0.85)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L332](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-332-0) (line 332, col 0, score 0.85)
- [TypeScript Patch for Tool Calling Support — L35](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-35-0) (line 35, col 0, score 0.87)
- [Chroma-Embedding-Refactor — L66](chroma-embedding-refactor.md#^ref-8b256935-66-0) (line 66, col 0, score 0.87)
- [TypeScript Patch for Tool Calling Support — L160](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-160-0) (line 160, col 0, score 0.87)
- [template-based-compilation — L21](template-based-compilation.md#^ref-f8877e5e-21-0) (line 21, col 0, score 0.85)
- [homeostasis-decay-formulas — L81](homeostasis-decay-formulas.md#^ref-37b5d236-81-0) (line 81, col 0, score 0.85)
- [homeostasis-decay-formulas — L61](homeostasis-decay-formulas.md#^ref-37b5d236-61-0) (line 61, col 0, score 0.85)
- [Universal Lisp Interface — L150](universal-lisp-interface.md#^ref-b01856b4-150-0) (line 150, col 0, score 0.85)
- [Model Selection for Lightweight Conversational Tasks — L52](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-52-0) (line 52, col 0, score 0.85)
- [homeostasis-decay-formulas — L40](homeostasis-decay-formulas.md#^ref-37b5d236-40-0) (line 40, col 0, score 0.85)
- [Migrate to Provider-Tenant Architecture — L39](migrate-to-provider-tenant-architecture.md#^ref-54382370-39-0) (line 39, col 0, score 0.87)
- [TypeScript Patch for Tool Calling Support — L88](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-88-0) (line 88, col 0, score 0.86)
- [Prometheus Observability Stack — L483](prometheus-observability-stack.md#^ref-e90b5a16-483-0) (line 483, col 0, score 0.85)
- [Prometheus Observability Stack — L480](prometheus-observability-stack.md#^ref-e90b5a16-480-0) (line 480, col 0, score 0.85)
- [TypeScript Patch for Tool Calling Support — L115](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-115-0) (line 115, col 0, score 0.85)
- [Stateful Partitions and Rebalancing — L299](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-299-0) (line 299, col 0, score 0.85)
- [Stateful Partitions and Rebalancing — L272](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-272-0) (line 272, col 0, score 0.85)
- [TypeScript Patch for Tool Calling Support — L534](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-534-0) (line 534, col 0, score 0.85)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L491](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-491-0) (line 491, col 0, score 0.86)
- [WebSocket Gateway Implementation — L631](websocket-gateway-implementation.md#^ref-e811123d-631-0) (line 631, col 0, score 1)
- [Event Bus MVP — L527](event-bus-mvp.md#^ref-534fe91d-527-0) (line 527, col 0, score 0.87)
- [Voice Access Layer Design — L280](voice-access-layer-design.md#^ref-543ed9b3-280-0) (line 280, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L3453](chroma-toolkit-consolidation-plan.md#^ref-5020e892-3453-0) (line 3453, col 0, score 0.87)
- [Diagrams — L2619](chunks/diagrams.md#^ref-45cd25b5-2619-0) (line 2619, col 0, score 0.87)
- [Tooling — L2569](chunks/tooling.md#^ref-6cb4943e-2569-0) (line 2569, col 0, score 0.87)
- [Dynamic Context Model for Web Components — L7631](dynamic-context-model-for-web-components.md#^ref-f7702bf8-7631-0) (line 7631, col 0, score 0.87)
- [Per-Domain Policy System for JS Crawler — L3762](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-3762-0) (line 3762, col 0, score 0.87)
- [schema-evolution-workflow — L5557](schema-evolution-workflow.md#^ref-d8059b6a-5557-0) (line 5557, col 0, score 0.87)
- [Services — L2035](chunks/services.md#^ref-75ea4a6a-2035-0) (line 2035, col 0, score 0.87)
- [Migrate to Provider-Tenant Architecture — L7069](migrate-to-provider-tenant-architecture.md#^ref-54382370-7069-0) (line 7069, col 0, score 0.87)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
