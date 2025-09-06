---
uuid: ed7b7f6e-1371-4161-af98-0457ea79ee54
created_at: promethean-native-config-design.md
filename: promethean-native-config-design
title: promethean-native-config-design
description: >-
  Promethean-native configuration design that retains Codex's ergonomics while
  avoiding 'last writer wins' issues through deep merging and surgical file
  updates. Uses TOML with schema validation and a trust store that doesn't trash
  files.
tags:
  - config
  - toml
  - deep-merge
  - trust-store
  - surgical-updates
  - provider-registry
  - sandbox-policy
related_to_uuid:
  - abe9ec8d-5a0f-42c5-b2ab-a2080c86d70c
  - 543ed9b3-b7af-4ce1-b455-f7ba71a0bbc8
  - e811123d-5841-4e52-bf8c-978f26db4230
  - 4316c3f9-551f-4872-b5c5-98ae73508535
  - 54382370-1931-4a19-a634-46735708a9ea
  - 2611e17e-c7dd-4de6-9c66-d98fcfa9ffb5
  - 7b7ca860-780c-44fa-8d3f-be8bd9496fba
  - b01856b4-999f-418d-8009-ade49b00eb0f
  - 2c9f86e6-9b63-44d7-902d-84b10b0bdbe3
  - 8430617b-80a2-4cc9-8288-9a74cb57990b
  - 8b256935-02f6-4da2-a406-bf6b8415276f
  - 534fe91d-e87d-4cc7-b0e7-8b6833353d9b
  - 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
  - f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
  - f8877e5e-1e4f-4478-93cd-a0bf86d26a41
  - 37b5d236-2b3e-4a95-a4e8-31655c3023ef
  - 4330e8f0-5f46-4235-918b-39b6b93fa561
  - 2c2b48ca-1476-47fb-8ad4-69d2588a6c84
  - e90b5a16-d58f-424d-bd36-70e9bd2861ad
  - dd89372d-10de-42a9-8c96-6bc13ea36d02
  - d144aa62-348c-4e5d-ae8f-38084c67ceca
  - 5020e892-8f18-443a-b707-6d0f3efcfe22
  - e1056831-ae0c-460b-95fa-4cf09b3398c6
  - e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
  - ab54cdd8-13ce-4dcb-a9cd-da2d86e0305f
related_to_title:
  - RAG UI Panel with Qdrant and PostgREST
  - Voice Access Layer Design
  - WebSocket Gateway Implementation
  - Migrate to Provider-Tenant Architecture
  - Universal Lisp Interface
  - TypeScript Patch for Tool Calling Support
  - Field Node Diagrams
  - ripple-propagation-demo
  - Chroma-Embedding-Refactor
  - Event Bus MVP
  - 'Polyglot S-expr Bridge: Python-JS-Lisp Interop'
  - Dynamic Context Model for Web Components
  - template-based-compilation
  - homeostasis-decay-formulas
  - Stateful Partitions and Rebalancing
  - Promethean Full-Stack Docker Setup
  - Prometheus Observability Stack
  - komorebi-group-window-hack
  - Model Selection for Lightweight Conversational Tasks
  - Chroma Toolkit Consolidation Plan
  - ParticleSimulationWithCanvasAndFFmpeg
  - markdown-to-org-transpiler
references:
  - uuid: e811123d-5841-4e52-bf8c-978f26db4230
    line: 631
    col: 0
    score: 1
  - uuid: 543ed9b3-b7af-4ce1-b455-f7ba71a0bbc8
    line: 280
    col: 0
    score: 1
  - uuid: abe9ec8d-5a0f-42c5-b2ab-a2080c86d70c
    line: 9
    col: 0
    score: 1
  - uuid: abe9ec8d-5a0f-42c5-b2ab-a2080c86d70c
    line: 80
    col: 0
    score: 1
  - uuid: abe9ec8d-5a0f-42c5-b2ab-a2080c86d70c
    line: 343
    col: 0
    score: 0.96
  - uuid: abe9ec8d-5a0f-42c5-b2ab-a2080c86d70c
    line: 50
    col: 0
    score: 0.95
  - uuid: abe9ec8d-5a0f-42c5-b2ab-a2080c86d70c
    line: 146
    col: 0
    score: 0.95
  - uuid: abe9ec8d-5a0f-42c5-b2ab-a2080c86d70c
    line: 316
    col: 0
    score: 0.95
  - uuid: abe9ec8d-5a0f-42c5-b2ab-a2080c86d70c
    line: 318
    col: 0
    score: 0.95
  - uuid: abe9ec8d-5a0f-42c5-b2ab-a2080c86d70c
    line: 47
    col: 0
    score: 0.94
  - uuid: abe9ec8d-5a0f-42c5-b2ab-a2080c86d70c
    line: 137
    col: 0
    score: 0.93
  - uuid: 4316c3f9-551f-4872-b5c5-98ae73508535
    line: 36
    col: 0
    score: 0.92
  - uuid: 4316c3f9-551f-4872-b5c5-98ae73508535
    line: 56
    col: 0
    score: 0.91
  - uuid: abe9ec8d-5a0f-42c5-b2ab-a2080c86d70c
    line: 345
    col: 0
    score: 0.9
  - uuid: 2611e17e-c7dd-4de6-9c66-d98fcfa9ffb5
    line: 117
    col: 0
    score: 0.9
  - uuid: 4316c3f9-551f-4872-b5c5-98ae73508535
    line: 296
    col: 0
    score: 0.89
  - uuid: 4316c3f9-551f-4872-b5c5-98ae73508535
    line: 336
    col: 0
    score: 0.89
  - uuid: 4316c3f9-551f-4872-b5c5-98ae73508535
    line: 630
    col: 0
    score: 0.89
  - uuid: 4316c3f9-551f-4872-b5c5-98ae73508535
    line: 43
    col: 0
    score: 0.89
  - uuid: 2611e17e-c7dd-4de6-9c66-d98fcfa9ffb5
    line: 119
    col: 0
    score: 0.89
  - uuid: 4316c3f9-551f-4872-b5c5-98ae73508535
    line: 450
    col: 0
    score: 0.88
  - uuid: 2611e17e-c7dd-4de6-9c66-d98fcfa9ffb5
    line: 56
    col: 0
    score: 0.88
  - uuid: 2c9f86e6-9b63-44d7-902d-84b10b0bdbe3
    line: 63
    col: 0
    score: 0.88
  - uuid: 2611e17e-c7dd-4de6-9c66-d98fcfa9ffb5
    line: 61
    col: 0
    score: 0.88
  - uuid: 4316c3f9-551f-4872-b5c5-98ae73508535
    line: 449
    col: 0
    score: 0.88
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
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 39
    col: 0
    score: 0.87
  - uuid: 534fe91d-e87d-4cc7-b0e7-8b6833353d9b
    line: 527
    col: 0
    score: 0.87
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 104
    col: 0
    score: 0.86
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
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 88
    col: 0
    score: 0.86
  - uuid: 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
    line: 491
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
^ref-7d584c12-305-0
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
If you want, I’ll tailor the exact `config.toml` (global + project) and a `prom` CLI starter to your `Promethean` repo structure. #promethean #config #profiles #trust #direnv #devtools
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [RAG UI Panel with Qdrant and PostgREST](rag-ui-panel-with-qdrant-and-postgrest.md)
- [Voice Access Layer Design](voice-access-layer-design.md)
- [WebSocket Gateway Implementation](websocket-gateway-implementation.md)
- [WebSocket Gateway Implementation](websocket-gateway-implementation.md)
- [Migrate to Provider-Tenant Architecture](migrate-to-provider-tenant-architecture.md)
- [Universal Lisp Interface](universal-lisp-interface.md)
- [TypeScript Patch for Tool Calling Support](typescript-patch-for-tool-calling-support.md)
- [Universal Lisp Interface](universal-lisp-interface.md)
- [Field Node Diagrams](field-node-diagram-visualizations.md)
- [ripple-propagation-demo](ripple-propagation-demo.md)
- [Chroma-Embedding-Refactor](chroma-embedding-refactor.md)
- [Event Bus MVP](event-bus-mvp.md)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop](polyglot-s-expr-bridge-python-js-lisp-interop.md)
- [Dynamic Context Model for Web Components](dynamic-context-model-for-web-components.md)
- [template-based-compilation](template-based-compilation.md)
- [homeostasis-decay-formulas](homeostasis-decay-formulas.md)
- [Stateful Partitions and Rebalancing](stateful-partitions-and-rebalancing.md)
- [Promethean Full-Stack Docker Setup](promethean-full-stack-docker-setup.md)
- [Prometheus Observability Stack](prometheus-observability-stack.md)
- [komorebi-group-window-hack](komorebi-group-window-hack.md)
- [Model Selection for Lightweight Conversational Tasks](model-selection-for-lightweight-conversational-tasks.md)
- [Chroma Toolkit Consolidation Plan](chroma-toolkit-consolidation-plan.md)
- [RAG UI Panel with Qdrant and PostgREST](rag-ui-panel-with-qdrant-and-postgrest.md)
- [ParticleSimulationWithCanvasAndFFmpeg](particlesimulationwithcanvasandffmpeg.md)
- [markdown-to-org-transpiler](markdown-to-org-transpiler.md)
## Sources
- [WebSocket Gateway Implementation — L631](websocket-gateway-implementation.md#^ref-e811123d-631-0) (line 631, col 0, score 1)
- [Voice Access Layer Design — L280](voice-access-layer-design.md#^ref-543ed9b3-280-0) (line 280, col 0, score 1)
- [RAG UI Panel with Qdrant and PostgREST — L9](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-abe9ec8d-9-0) (line 9, col 0, score 1)
- [RAG UI Panel with Qdrant and PostgREST — L80](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-abe9ec8d-80-0) (line 80, col 0, score 1)
- [RAG UI Panel with Qdrant and PostgREST — L343](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-abe9ec8d-343-0) (line 343, col 0, score 0.96)
- [RAG UI Panel with Qdrant and PostgREST — L50](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-abe9ec8d-50-0) (line 50, col 0, score 0.95)
- [RAG UI Panel with Qdrant and PostgREST — L146](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-abe9ec8d-146-0) (line 146, col 0, score 0.95)
- [RAG UI Panel with Qdrant and PostgREST — L316](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-abe9ec8d-316-0) (line 316, col 0, score 0.95)
- [RAG UI Panel with Qdrant and PostgREST — L318](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-abe9ec8d-318-0) (line 318, col 0, score 0.95)
- [RAG UI Panel with Qdrant and PostgREST — L47](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-abe9ec8d-47-0) (line 47, col 0, score 0.94)
- [RAG UI Panel with Qdrant and PostgREST — L137](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-abe9ec8d-137-0) (line 137, col 0, score 0.93)
- [WebSocket Gateway Implementation — L36](websocket-gateway-implementation.md#^ref-4316c3f9-36-0) (line 36, col 0, score 0.92)
- [WebSocket Gateway Implementation — L56](websocket-gateway-implementation.md#^ref-4316c3f9-56-0) (line 56, col 0, score 0.91)
- [RAG UI Panel with Qdrant and PostgREST — L345](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-abe9ec8d-345-0) (line 345, col 0, score 0.9)
- [Universal Lisp Interface — L117](universal-lisp-interface.md#^ref-2611e17e-117-0) (line 117, col 0, score 0.9)
- [WebSocket Gateway Implementation — L296](websocket-gateway-implementation.md#^ref-4316c3f9-296-0) (line 296, col 0, score 0.89)
- [WebSocket Gateway Implementation — L336](websocket-gateway-implementation.md#^ref-4316c3f9-336-0) (line 336, col 0, score 0.89)
- [WebSocket Gateway Implementation — L630](websocket-gateway-implementation.md#^ref-4316c3f9-630-0) (line 630, col 0, score 0.89)
- [WebSocket Gateway Implementation — L43](websocket-gateway-implementation.md#^ref-4316c3f9-43-0) (line 43, col 0, score 0.89)
- [Universal Lisp Interface — L119](universal-lisp-interface.md#^ref-2611e17e-119-0) (line 119, col 0, score 0.89)
- [WebSocket Gateway Implementation — L450](websocket-gateway-implementation.md#^ref-4316c3f9-450-0) (line 450, col 0, score 0.88)
- [Universal Lisp Interface — L56](universal-lisp-interface.md#^ref-2611e17e-56-0) (line 56, col 0, score 0.88)
- [Field Node Diagrams — L63](field-node-diagram-visualizations.md#^ref-2c9f86e6-63-0) (line 63, col 0, score 0.88)
- [Universal Lisp Interface — L61](universal-lisp-interface.md#^ref-2611e17e-61-0) (line 61, col 0, score 0.88)
- [WebSocket Gateway Implementation — L449](websocket-gateway-implementation.md#^ref-4316c3f9-449-0) (line 449, col 0, score 0.88)
- [TypeScript Patch for Tool Calling Support — L35](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-35-0) (line 35, col 0, score 0.87)
- [Chroma-Embedding-Refactor — L66](chroma-embedding-refactor.md#^ref-8b256935-66-0) (line 66, col 0, score 0.87)
- [TypeScript Patch for Tool Calling Support — L160](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-160-0) (line 160, col 0, score 0.87)
- [Migrate to Provider-Tenant Architecture — L39](migrate-to-provider-tenant-architecture.md#^ref-54382370-39-0) (line 39, col 0, score 0.87)
- [Event Bus MVP — L527](event-bus-mvp.md#^ref-534fe91d-527-0) (line 527, col 0, score 0.87)
- [TypeScript Patch for Tool Calling Support — L104](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-104-0) (line 104, col 0, score 0.86)
- [Universal Lisp Interface — L172](universal-lisp-interface.md#^ref-b01856b4-172-0) (line 172, col 0, score 0.86)
- [WebSocket Gateway Implementation — L318](websocket-gateway-implementation.md#^ref-e811123d-318-0) (line 318, col 0, score 0.86)
- [Dynamic Context Model for Web Components — L272](dynamic-context-model-for-web-components.md#^ref-f7702bf8-272-0) (line 272, col 0, score 0.86)
- [TypeScript Patch for Tool Calling Support — L88](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-88-0) (line 88, col 0, score 0.86)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L491](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-491-0) (line 491, col 0, score 0.86)
- [ripple-propagation-demo — L64](ripple-propagation-demo.md#^ref-8430617b-64-0) (line 64, col 0, score 0.85)
- [Universal Lisp Interface — L137](universal-lisp-interface.md#^ref-b01856b4-137-0) (line 137, col 0, score 0.85)
- [Promethean Full-Stack Docker Setup — L342](promethean-full-stack-docker-setup.md#^ref-2c2b48ca-342-0) (line 342, col 0, score 0.85)
- [komorebi-group-window-hack — L132](komorebi-group-window-hack.md#^ref-dd89372d-132-0) (line 132, col 0, score 0.85)
- [Chroma Toolkit Consolidation Plan — L72](chroma-toolkit-consolidation-plan.md#^ref-5020e892-72-0) (line 72, col 0, score 0.85)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L332](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-332-0) (line 332, col 0, score 0.85)
- [template-based-compilation — L21](template-based-compilation.md#^ref-f8877e5e-21-0) (line 21, col 0, score 0.85)
- [homeostasis-decay-formulas — L81](homeostasis-decay-formulas.md#^ref-37b5d236-81-0) (line 81, col 0, score 0.85)
- [homeostasis-decay-formulas — L61](homeostasis-decay-formulas.md#^ref-37b5d236-61-0) (line 61, col 0, score 0.85)
- [Universal Lisp Interface — L150](universal-lisp-interface.md#^ref-b01856b4-150-0) (line 150, col 0, score 0.85)
- [Model Selection for Lightweight Conversational Tasks — L52](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-52-0) (line 52, col 0, score 0.85)
- [homeostasis-decay-formulas — L40](homeostasis-decay-formulas.md#^ref-37b5d236-40-0) (line 40, col 0, score 0.85)
- [Prometheus Observability Stack — L483](prometheus-observability-stack.md#^ref-e90b5a16-483-0) (line 483, col 0, score 0.85)
- [Prometheus Observability Stack — L480](prometheus-observability-stack.md#^ref-e90b5a16-480-0) (line 480, col 0, score 0.85)
- [TypeScript Patch for Tool Calling Support — L115](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-115-0) (line 115, col 0, score 0.85)
- [Stateful Partitions and Rebalancing — L299](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-299-0) (line 299, col 0, score 0.85)
- [Stateful Partitions and Rebalancing — L272](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-272-0) (line 272, col 0, score 0.85)
- [TypeScript Patch for Tool Calling Support — L534](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-534-0) (line 534, col 0, score 0.85)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
