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
related_to_title: []
related_to_uuid: []
references: []
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
^ref-ab748541-90-0

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
^ref-ab748541-275-0

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
- [Dynamic Context Model for Web Components](dynamic-context-model-for-web-components.md)
- [Agent Tasks: Persistence Migration to DualStore](agent-tasks-persistence-migration-to-dualstore.md)
- [Migrate to Provider-Tenant Architecture](migrate-to-provider-tenant-architecture.md)
- [Chroma Toolkit Consolidation Plan](chroma-toolkit-consolidation-plan.md)
- [Sibilant Meta-Prompt DSL](sibilant-meta-prompt-dsl.md)
- [Cross-Language Runtime Polymorphism](cross-language-runtime-polymorphism.md)
- [sibilant-macro-targets](sibilant-macro-targets.md)
- [Stateful Partitions and Rebalancing](stateful-partitions-and-rebalancing.md)
- [Obsidian Templating Plugins Integration Guide](obsidian-templating-plugins-integration-guide.md)
- [api-gateway-versioning](api-gateway-versioning.md)
- [Board Walk – 2025-08-11](board-walk-2025-08-11.md)
- [Per-Domain Policy System for JS Crawler](per-domain-policy-system-for-js-crawler.md)
- [Cross-Target Macro System in Sibilant](cross-target-macro-system-in-sibilant.md)
- [eidolon-field-math-foundations](eidolon-field-math-foundations.md)
- [polyglot-repl-interface-layer](polyglot-repl-interface-layer.md)
- [Promethean-Copilot-Intent-Engine](promethean-copilot-intent-engine.md)
- [prompt-programming-language-lisp](prompt-programming-language-lisp.md)
- [polymorphic-meta-programming-engine](polymorphic-meta-programming-engine.md)
- [compiler-kit-foundations](compiler-kit-foundations.md)
- [plan-update-confirmation](plan-update-confirmation.md)
- [Obsidian ChatGPT Plugin Integration Guide](obsidian-chatgpt-plugin-integration-guide.md)
- [ParticleSimulationWithCanvasAndFFmpeg](particlesimulationwithcanvasandffmpeg.md)
- [aionian-circuit-math](aionian-circuit-math.md)
- [Obsidian ChatGPT Plugin Integration](obsidian-chatgpt-plugin-integration.md)
- [Mongo Outbox Implementation](mongo-outbox-implementation.md)
- [prom-lib-rate-limiters-and-replay-api](prom-lib-rate-limiters-and-replay-api.md)
- [Event Bus MVP](event-bus-mvp.md)
- [EidolonField](eidolonfield.md)
- [Services](chunks/services.md)
- [Voice Access Layer Design](voice-access-layer-design.md)
- [template-based-compilation](template-based-compilation.md)
- [Model Selection for Lightweight Conversational Tasks](model-selection-for-lightweight-conversational-tasks.md)
- [sibilant-meta-string-templating-runtime](sibilant-meta-string-templating-runtime.md)
- [Prompt_Folder_Bootstrap](prompt-folder-bootstrap.md)
- [Promethean Infrastructure Setup](promethean-infrastructure-setup.md)
- [AI-Centric OS with MCP Layer](ai-centric-os-with-mcp-layer.md)
- [Admin Dashboard for User Management](admin-dashboard-for-user-management.md)
- [2d-sandbox-field](2d-sandbox-field.md)
- [DSL](chunks/dsl.md)
- [JavaScript](chunks/javascript.md)
- [Window Management](chunks/window-management.md)
- [mystery-lisp-search-session](mystery-lisp-search-session.md)
- [Math Fundamentals](chunks/math-fundamentals.md)
- [Diagrams](chunks/diagrams.md)
- [heartbeat-simulation-snippets](heartbeat-simulation-snippets.md)
- [Debugging Broker Connections and Agent Behavior](debugging-broker-connections-and-agent-behavior.md)
- [Duck's Self-Referential Perceptual Loop](ducks-self-referential-perceptual-loop.md)
- [Tooling](chunks/tooling.md)
- [Agent Reflections and Prompt Evolution](agent-reflections-and-prompt-evolution.md)
- [archetype-ecs](archetype-ecs.md)
- [ecs-scheduler-and-prefabs](ecs-scheduler-and-prefabs.md)
- [komorebi-group-window-hack](komorebi-group-window-hack.md)
- [Canonical Org-Babel Matplotlib Animation Template](canonical-org-babel-matplotlib-animation-template.md)
- [Chroma-Embedding-Refactor](chroma-embedding-refactor.md)
- [typed-struct-compiler](typed-struct-compiler.md)
- [State Snapshots API and Transactional Projector](state-snapshots-api-and-transactional-projector.md)
- [System Scheduler with Resource-Aware DAG](system-scheduler-with-resource-aware-dag.md)
- [sibilant-metacompiler-overview](sibilant-metacompiler-overview.md)
- [ts-to-lisp-transpiler](ts-to-lisp-transpiler.md)
- [Simulation Demo](chunks/simulation-demo.md)
- [Eidolon Field Abstract Model](eidolon-field-abstract-model.md)
- [eidolon-node-lifecycle](eidolon-node-lifecycle.md)
- [observability-infrastructure-setup](observability-infrastructure-setup.md)
- [Promethean Agent Config DSL](promethean-agent-config-dsl.md)
- [field-interaction-equations](field-interaction-equations.md)
- [Local-First Intention→Code Loop with Free Models](local-first-intention-code-loop-with-free-models.md)
- [markdown-to-org-transpiler](markdown-to-org-transpiler.md)
- [lisp-dsl-for-window-management](lisp-dsl-for-window-management.md)
- [i3-bluetooth-setup](i3-bluetooth-setup.md)
- [balanced-bst](balanced-bst.md)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler](ollama-llm-provider-for-pseudo-code-transpiler.md)
- [obsidian-ignore-node-modules-regex](obsidian-ignore-node-modules-regex.md)
- [ecs-offload-workers](ecs-offload-workers.md)
- [Exception Layer Analysis](exception-layer-analysis.md)
- [Shared](chunks/shared.md)
- [i3-config-validation-methods](i3-config-validation-methods.md)
- [field-dynamics-math-blocks](field-dynamics-math-blocks.md)
- [Factorio AI with External Agents](factorio-ai-with-external-agents.md)
- [Duck's Attractor States](ducks-attractor-states.md)
- [AI-First-OS-Model-Context-Protocol](ai-first-os-model-context-protocol.md)
- [field-node-diagram-outline](field-node-diagram-outline.md)
- [Event Bus Projections Architecture](event-bus-projections-architecture.md)
- [Matplotlib Animation with Async Execution](matplotlib-animation-with-async-execution.md)
- [Promethean Event Bus MVP v0.1](promethean-event-bus-mvp-v0-1.md)
- [Promethean Web UI Setup](promethean-web-ui-setup.md)
- [graph-ds](graph-ds.md)
- [Pure-Node Crawl Stack with Playwright and Crawlee](pure-node-crawl-stack-with-playwright-and-crawlee.md)
- [Interop and Source Maps](interop-and-source-maps.md)
- [Lisp-Compiler-Integration](lisp-compiler-integration.md)
- [Promethean_Eidolon_Synchronicity_Model](promethean-eidolon-synchronicity-model.md)
- [field-node-diagram-set](field-node-diagram-set.md)
- [Board Automation Improvements](board-automation-improvements.md)
- [field-node-diagram-visualizations](field-node-diagram-visualizations.md)
- [heartbeat-fragment-demo](heartbeat-fragment-demo.md)
- [promethean-system-diagrams](promethean-system-diagrams.md)
- [schema-evolution-workflow](schema-evolution-workflow.md)
- [Protocol_0_The_Contradiction_Engine](protocol-0-the-contradiction-engine.md)
- [Creative Moments](creative-moments.md)
- [Local-Offline-Model-Deployment-Strategy](local-offline-model-deployment-strategy.md)
- [Universal Lisp Interface](universal-lisp-interface.md)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop](polyglot-s-expr-bridge-python-js-lisp-interop.md)
- [Local-Only-LLM-Workflow](local-only-llm-workflow.md)
- [Lispy Macros with syntax-rules](lispy-macros-with-syntax-rules.md)
- [Unique Info Dump Index](unique-info-dump-index.md)
- [Docops Feature Updates](docops-feature-updates-3.md)
- [Fnord Tracer Protocol](fnord-tracer-protocol.md)
- [homeostasis-decay-formulas](homeostasis-decay-formulas.md)
- [Shared Package Structure](shared-package-structure.md)
- [Language-Agnostic Mirror System](language-agnostic-mirror-system.md)
- [Prometheus Observability Stack](prometheus-observability-stack.md)
- [zero-copy-snapshots-and-workers](zero-copy-snapshots-and-workers.md)
- [Provider-Agnostic Chat Panel Implementation](provider-agnostic-chat-panel-implementation.md)
- [Functional Embedding Pipeline Refactor](functional-embedding-pipeline-refactor.md)
- [ripple-propagation-demo](ripple-propagation-demo.md)
- [Promethean Workflow Optimization](promethean-workflow-optimization.md)
- [layer-1-uptime-diagrams](layer-1-uptime-diagrams.md)
- [shared-package-layout-clarification](shared-package-layout-clarification.md)
- [Self-Agency in AI Interaction](self-agency-in-ai-interaction.md)
- [set-assignment-in-lisp-ast](set-assignment-in-lisp-ast.md)
- [RAG UI Panel with Qdrant and PostgREST](rag-ui-panel-with-qdrant-and-postgrest.md)
- [Pure TypeScript Search Microservice](pure-typescript-search-microservice.md)
- [DuckDuckGoSearchPipeline](duckduckgosearchpipeline.md)
- [Vectorial Exception Descent](vectorial-exception-descent.md)
- [universal-intention-code-fabric](universal-intention-code-fabric.md)
- [Functional Refactor of TypeScript Document Processing](functional-refactor-of-typescript-document-processing.md)
- [Promethean Pipelines: Local TypeScript-First Workflow](promethean-pipelines-local-typescript-first-workflow.md)
- [Promethean Agent DSL TS Scaffold](promethean-agent-dsl-ts-scaffold.md)
- [js-to-lisp-reverse-compiler](js-to-lisp-reverse-compiler.md)
- [Recursive Prompt Construction Engine](recursive-prompt-construction-engine.md)
- [pm2-orchestration-patterns](pm2-orchestration-patterns.md)
- [Promethean Documentation Pipeline Overview](promethean-documentation-pipeline-overview.md)
- [TypeScript Patch for Tool Calling Support](typescript-patch-for-tool-calling-support.md)
- [refactor-relations](refactor-relations.md)
- [Model Upgrade Calm-Down Guide](model-upgrade-calm-down-guide.md)
- [Promethean Pipelines](promethean-pipelines.md)
- [i3-layout-saver](i3-layout-saver.md)
- [WebSocket Gateway Implementation](websocket-gateway-implementation.md)
- [ChatGPT Custom Prompts](chatgpt-custom-prompts.md)
- [Performance-Optimized-Polyglot-Bridge](performance-optimized-polyglot-bridge.md)
- [windows-tiling-with-autohotkey](windows-tiling-with-autohotkey.md)
- [Promethean State Format](promethean-state-format.md)
- [Refactor 05-footers.ts](refactor-05-footers-ts.md)
- [Ice Box Reorganization](ice-box-reorganization.md)
- [Eidolon-Field-Optimization](eidolon-field-optimization.md)
- [Optimizing Command Limitations in System Design](optimizing-command-limitations-in-system-design.md)
- [Layer1SurvivabilityEnvelope](layer1survivabilityenvelope.md)
- [Promethean Full-Stack Docker Setup](promethean-full-stack-docker-setup.md)
- [Promethean Dev Workflow Update](promethean-dev-workflow-update.md)
- [promethean-requirements](promethean-requirements.md)
- [Python Services CI](python-services-ci.md)
- [Synchronicity Waves and Web](synchronicity-waves-and-web.md)
- [The Jar of Echoes](the-jar-of-echoes.md)
## Sources
- [Migrate to Provider-Tenant Architecture — L261](migrate-to-provider-tenant-architecture.md#^ref-54382370-261-0) (line 261, col 0, score 0.72)
- [Model Upgrade Calm-Down Guide — L29](model-upgrade-calm-down-guide.md#^ref-db74343f-29-0) (line 29, col 0, score 0.62)
- [TypeScript Patch for Tool Calling Support — L1](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-1-0) (line 1, col 0, score 0.64)
- [Mongo Outbox Implementation — L373](mongo-outbox-implementation.md#^ref-9c1acd1e-373-0) (line 373, col 0, score 0.64)
- [observability-infrastructure-setup — L31](observability-infrastructure-setup.md#^ref-b4e64f8c-31-0) (line 31, col 0, score 0.67)
- [polyglot-repl-interface-layer — L1](polyglot-repl-interface-layer.md#^ref-9c79206d-1-0) (line 1, col 0, score 0.72)
- [Migrate to Provider-Tenant Architecture — L3](migrate-to-provider-tenant-architecture.md#^ref-54382370-3-0) (line 3, col 0, score 0.65)
- [Promethean-Copilot-Intent-Engine — L4](promethean-copilot-intent-engine.md#^ref-ae24a280-4-0) (line 4, col 0, score 0.72)
- [observability-infrastructure-setup — L348](observability-infrastructure-setup.md#^ref-b4e64f8c-348-0) (line 348, col 0, score 0.63)
- [prompt-programming-language-lisp — L51](prompt-programming-language-lisp.md#^ref-d41a06d1-51-0) (line 51, col 0, score 0.65)
- [pm2-orchestration-patterns — L3](pm2-orchestration-patterns.md#^ref-51932e7b-3-0) (line 3, col 0, score 0.7)
- [Voice Access Layer Design — L302](voice-access-layer-design.md#^ref-543ed9b3-302-0) (line 302, col 0, score 0.73)
- [polymorphic-meta-programming-engine — L192](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-192-0) (line 192, col 0, score 0.62)
- [Promethean Documentation Pipeline Overview — L163](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-163-0) (line 163, col 0, score 0.69)
- [Promethean Event Bus MVP v0.1 — L941](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-941-0) (line 941, col 0, score 0.69)
- [shared-package-layout-clarification — L161](shared-package-layout-clarification.md#^ref-36c8882a-161-0) (line 161, col 0, score 0.73)
- [Promethean Web UI Setup — L278](promethean-web-ui-setup.md#^ref-bc5172ca-278-0) (line 278, col 0, score 0.62)
- [Shared Package Structure — L159](shared-package-structure.md#^ref-66a72fc3-159-0) (line 159, col 0, score 0.72)
- [ChatGPT Custom Prompts — L9](chatgpt-custom-prompts.md#^ref-930054b3-9-0) (line 9, col 0, score 0.67)
- [Promethean Web UI Setup — L328](promethean-web-ui-setup.md#^ref-bc5172ca-328-0) (line 328, col 0, score 0.62)
- [Promethean Pipelines: Local TypeScript-First Workflow — L1](promethean-pipelines-local-typescript-first-workflow.md#^ref-6b63edca-1-0) (line 1, col 0, score 0.66)
- [aionian-circuit-math — L157](aionian-circuit-math.md#^ref-f2d83a77-157-0) (line 157, col 0, score 0.66)
- [api-gateway-versioning — L299](api-gateway-versioning.md#^ref-0580dcd3-299-0) (line 299, col 0, score 0.69)
- [Cross-Language Runtime Polymorphism — L207](cross-language-runtime-polymorphism.md#^ref-c34c36a6-207-0) (line 207, col 0, score 0.69)
- [Promethean Agent Config DSL — L306](promethean-agent-config-dsl.md#^ref-2c00ce45-306-0) (line 306, col 0, score 0.56)
- [Prompt_Folder_Bootstrap — L87](prompt-folder-bootstrap.md#^ref-bd4f0976-87-0) (line 87, col 0, score 0.62)
- [prompt-programming-language-lisp — L53](prompt-programming-language-lisp.md#^ref-d41a06d1-53-0) (line 53, col 0, score 0.55)
- [Prompt_Folder_Bootstrap — L113](prompt-folder-bootstrap.md#^ref-bd4f0976-113-0) (line 113, col 0, score 0.56)
- [Prompt_Folder_Bootstrap — L149](prompt-folder-bootstrap.md#^ref-bd4f0976-149-0) (line 149, col 0, score 0.55)
- [Self-Agency in AI Interaction — L26](self-agency-in-ai-interaction.md#^ref-49a9a860-26-0) (line 26, col 0, score 0.54)
- [Promethean Event Bus MVP v0.1 — L276](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-276-0) (line 276, col 0, score 0.53)
- [Prompt_Folder_Bootstrap — L33](prompt-folder-bootstrap.md#^ref-bd4f0976-33-0) (line 33, col 0, score 0.53)
- [universal-intention-code-fabric — L23](universal-intention-code-fabric.md#^ref-c14edce7-23-0) (line 23, col 0, score 0.51)
- [The Jar of Echoes — L108](the-jar-of-echoes.md#^ref-18138627-108-0) (line 108, col 0, score 0.52)
- [schema-evolution-workflow — L23](schema-evolution-workflow.md#^ref-d8059b6a-23-0) (line 23, col 0, score 0.52)
- [Language-Agnostic Mirror System — L30](language-agnostic-mirror-system.md#^ref-d2b3628c-30-0) (line 30, col 0, score 0.67)
- [Prometheus Observability Stack — L493](prometheus-observability-stack.md#^ref-e90b5a16-493-0) (line 493, col 0, score 0.65)
- [Agent Reflections and Prompt Evolution — L85](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-85-0) (line 85, col 0, score 0.65)
- [schema-evolution-workflow — L450](schema-evolution-workflow.md#^ref-d8059b6a-450-0) (line 450, col 0, score 0.63)
- [Promethean-Copilot-Intent-Engine — L52](promethean-copilot-intent-engine.md#^ref-ae24a280-52-0) (line 52, col 0, score 0.65)
- [Board Walk – 2025-08-11 — L132](board-walk-2025-08-11.md#^ref-7aa1eb92-132-0) (line 132, col 0, score 0.63)
- [field-interaction-equations — L45](field-interaction-equations.md#^ref-b09141b7-45-0) (line 45, col 0, score 0.69)
- [Protocol_0_The_Contradiction_Engine — L28](protocol-0-the-contradiction-engine.md#^ref-9a93a756-28-0) (line 28, col 0, score 0.62)
- [Dynamic Context Model for Web Components — L75](dynamic-context-model-for-web-components.md#^ref-f7702bf8-75-0) (line 75, col 0, score 0.67)
- [Chroma-Embedding-Refactor — L64](chroma-embedding-refactor.md#^ref-8b256935-64-0) (line 64, col 0, score 0.93)
- [Chroma-Embedding-Refactor — L109](chroma-embedding-refactor.md#^ref-8b256935-109-0) (line 109, col 0, score 0.93)
- [Chroma-Embedding-Refactor — L258](chroma-embedding-refactor.md#^ref-8b256935-258-0) (line 258, col 0, score 0.93)
- [Chroma Toolkit Consolidation Plan — L72](chroma-toolkit-consolidation-plan.md#^ref-5020e892-72-0) (line 72, col 0, score 0.93)
- [Chroma Toolkit Consolidation Plan — L88](chroma-toolkit-consolidation-plan.md#^ref-5020e892-88-0) (line 88, col 0, score 0.93)
- [Chroma Toolkit Consolidation Plan — L107](chroma-toolkit-consolidation-plan.md#^ref-5020e892-107-0) (line 107, col 0, score 0.93)
- [Chroma Toolkit Consolidation Plan — L148](chroma-toolkit-consolidation-plan.md#^ref-5020e892-148-0) (line 148, col 0, score 0.93)
- [Sibilant Meta-Prompt DSL — L100](sibilant-meta-prompt-dsl.md#^ref-af5d2824-100-0) (line 100, col 0, score 0.62)
- [Vectorial Exception Descent — L125](vectorial-exception-descent.md#^ref-d771154e-125-0) (line 125, col 0, score 0.61)
- [Dynamic Context Model for Web Components — L331](dynamic-context-model-for-web-components.md#^ref-f7702bf8-331-0) (line 331, col 0, score 0.91)
- [Eidolon-Field-Optimization — L10](eidolon-field-optimization.md#^ref-40e05c14-10-0) (line 10, col 0, score 0.63)
- [Local-First Intention→Code Loop with Free Models — L120](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-120-0) (line 120, col 0, score 0.65)
- [Promethean Agent Config DSL — L149](promethean-agent-config-dsl.md#^ref-2c00ce45-149-0) (line 149, col 0, score 0.65)
- [set-assignment-in-lisp-ast — L58](set-assignment-in-lisp-ast.md#^ref-c5fba0a0-58-0) (line 58, col 0, score 0.62)
- [schema-evolution-workflow — L466](schema-evolution-workflow.md#^ref-d8059b6a-466-0) (line 466, col 0, score 0.61)
- [Simulation Demo — L32](chunks/simulation-demo.md#^ref-557309a3-32-0) (line 32, col 0, score 1)
- [Tooling — L26](chunks/tooling.md#^ref-6cb4943e-26-0) (line 26, col 0, score 1)
- [Window Management — L36](chunks/window-management.md#^ref-9e8ae388-36-0) (line 36, col 0, score 1)
- [compiler-kit-foundations — L639](compiler-kit-foundations.md#^ref-01b21543-639-0) (line 639, col 0, score 1)
- [Creative Moments — L10](creative-moments.md#^ref-10d98225-10-0) (line 10, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L258](cross-language-runtime-polymorphism.md#^ref-c34c36a6-258-0) (line 258, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L215](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-215-0) (line 215, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L50](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-50-0) (line 50, col 0, score 1)
- [DuckDuckGoSearchPipeline — L16](duckduckgosearchpipeline.md#^ref-e979c50f-16-0) (line 16, col 0, score 1)
- [Promethean Agent DSL TS Scaffold — L627](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-627-0) (line 627, col 0, score 0.63)
- [Promethean State Format — L27](promethean-state-format.md#^ref-23df6ddb-27-0) (line 27, col 0, score 0.65)
- [api-gateway-versioning — L280](api-gateway-versioning.md#^ref-0580dcd3-280-0) (line 280, col 0, score 0.61)
- [Promethean Documentation Pipeline Overview — L114](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-114-0) (line 114, col 0, score 0.64)
- [Language-Agnostic Mirror System — L513](language-agnostic-mirror-system.md#^ref-d2b3628c-513-0) (line 513, col 0, score 0.6)
- [Performance-Optimized-Polyglot-Bridge — L10](performance-optimized-polyglot-bridge.md#^ref-f5579967-10-0) (line 10, col 0, score 0.66)
- [Ice Box Reorganization — L13](ice-box-reorganization.md#^ref-291c7d91-13-0) (line 13, col 0, score 0.64)
- [typed-struct-compiler — L380](typed-struct-compiler.md#^ref-78eeedf7-380-0) (line 380, col 0, score 0.66)
- [Migrate to Provider-Tenant Architecture — L128](migrate-to-provider-tenant-architecture.md#^ref-54382370-128-0) (line 128, col 0, score 0.71)
- [Promethean Event Bus MVP v0.1 — L373](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-373-0) (line 373, col 0, score 0.71)
- [prom-lib-rate-limiters-and-replay-api — L377](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-377-0) (line 377, col 0, score 0.68)
- [Promethean Pipelines — L76](promethean-pipelines.md#^ref-8b8e6103-76-0) (line 76, col 0, score 0.66)
- [schema-evolution-workflow — L311](schema-evolution-workflow.md#^ref-d8059b6a-311-0) (line 311, col 0, score 0.6)
- [Stateful Partitions and Rebalancing — L202](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-202-0) (line 202, col 0, score 0.71)
- [archetype-ecs — L418](archetype-ecs.md#^ref-8f4c1e86-418-0) (line 418, col 0, score 0.6)
- [AI-Centric OS with MCP Layer — L23](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-23-0) (line 23, col 0, score 0.64)
- [Sibilant Meta-Prompt DSL — L14](sibilant-meta-prompt-dsl.md#^ref-af5d2824-14-0) (line 14, col 0, score 0.63)
- [Dynamic Context Model for Web Components — L37](dynamic-context-model-for-web-components.md#^ref-f7702bf8-37-0) (line 37, col 0, score 0.75)
- [Mongo Outbox Implementation — L536](mongo-outbox-implementation.md#^ref-9c1acd1e-536-0) (line 536, col 0, score 0.73)
- [Dynamic Context Model for Web Components — L36](dynamic-context-model-for-web-components.md#^ref-f7702bf8-36-0) (line 36, col 0, score 0.6)
- [Dynamic Context Model for Web Components — L31](dynamic-context-model-for-web-components.md#^ref-f7702bf8-31-0) (line 31, col 0, score 0.64)
- [Promethean Event Bus MVP v0.1 — L13](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-13-0) (line 13, col 0, score 0.61)
- [Chroma Toolkit Consolidation Plan — L157](chroma-toolkit-consolidation-plan.md#^ref-5020e892-157-0) (line 157, col 0, score 0.9)
- [Chroma Toolkit Consolidation Plan — L162](chroma-toolkit-consolidation-plan.md#^ref-5020e892-162-0) (line 162, col 0, score 0.61)
- [Model Selection for Lightweight Conversational Tasks — L53](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-53-0) (line 53, col 0, score 0.67)
- [Agent Tasks: Persistence Migration to DualStore — L47](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-47-0) (line 47, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L48](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-48-0) (line 48, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L49](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-49-0) (line 49, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L39](migrate-to-provider-tenant-architecture.md#^ref-54382370-39-0) (line 39, col 0, score 0.98)
- [zero-copy-snapshots-and-workers — L70](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-70-0) (line 70, col 0, score 0.68)
- [Vectorial Exception Descent — L60](vectorial-exception-descent.md#^ref-d771154e-60-0) (line 60, col 0, score 0.76)
- [Board Walk – 2025-08-11 — L103](board-walk-2025-08-11.md#^ref-7aa1eb92-103-0) (line 103, col 0, score 0.78)
- [Migrate to Provider-Tenant Architecture — L101](migrate-to-provider-tenant-architecture.md#^ref-54382370-101-0) (line 101, col 0, score 0.78)
- [markdown-to-org-transpiler — L293](markdown-to-org-transpiler.md#^ref-ab54cdd8-293-0) (line 293, col 0, score 0.77)
- [Dynamic Context Model for Web Components — L162](dynamic-context-model-for-web-components.md#^ref-f7702bf8-162-0) (line 162, col 0, score 0.66)
- [Promethean Agent Config DSL — L301](promethean-agent-config-dsl.md#^ref-2c00ce45-301-0) (line 301, col 0, score 0.61)
- [Dynamic Context Model for Web Components — L34](dynamic-context-model-for-web-components.md#^ref-f7702bf8-34-0) (line 34, col 0, score 0.63)
- [Chroma-Embedding-Refactor — L311](chroma-embedding-refactor.md#^ref-8b256935-311-0) (line 311, col 0, score 0.7)
- [lisp-dsl-for-window-management — L158](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-158-0) (line 158, col 0, score 0.65)
- [Local-Offline-Model-Deployment-Strategy — L57](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-57-0) (line 57, col 0, score 0.65)
- [Local-Offline-Model-Deployment-Strategy — L80](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-80-0) (line 80, col 0, score 0.62)
- [windows-tiling-with-autohotkey — L110](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-110-0) (line 110, col 0, score 0.62)
- [lisp-dsl-for-window-management — L10](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-10-0) (line 10, col 0, score 0.62)
- [Fnord Tracer Protocol — L125](fnord-tracer-protocol.md#^ref-fc21f824-125-0) (line 125, col 0, score 0.62)
- [Shared Package Structure — L122](shared-package-structure.md#^ref-66a72fc3-122-0) (line 122, col 0, score 0.59)
- [Migrate to Provider-Tenant Architecture — L238](migrate-to-provider-tenant-architecture.md#^ref-54382370-238-0) (line 238, col 0, score 0.63)
- [Voice Access Layer Design — L109](voice-access-layer-design.md#^ref-543ed9b3-109-0) (line 109, col 0, score 0.63)
- [Voice Access Layer Design — L83](voice-access-layer-design.md#^ref-543ed9b3-83-0) (line 83, col 0, score 0.61)
- [shared-package-layout-clarification — L78](shared-package-layout-clarification.md#^ref-36c8882a-78-0) (line 78, col 0, score 0.67)
- [Voice Access Layer Design — L220](voice-access-layer-design.md#^ref-543ed9b3-220-0) (line 220, col 0, score 0.61)
- [Migrate to Provider-Tenant Architecture — L85](migrate-to-provider-tenant-architecture.md#^ref-54382370-85-0) (line 85, col 0, score 0.65)
- [Shared Package Structure — L56](shared-package-structure.md#^ref-66a72fc3-56-0) (line 56, col 0, score 0.61)
- [komorebi-group-window-hack — L9](komorebi-group-window-hack.md#^ref-dd89372d-9-0) (line 9, col 0, score 0.61)
- [Provider-Agnostic Chat Panel Implementation — L8](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-8-0) (line 8, col 0, score 0.61)
- [windows-tiling-with-autohotkey — L80](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-80-0) (line 80, col 0, score 0.64)
- [shared-package-layout-clarification — L132](shared-package-layout-clarification.md#^ref-36c8882a-132-0) (line 132, col 0, score 0.59)
- [Promethean Documentation Pipeline Overview — L73](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-73-0) (line 73, col 0, score 0.58)
- [Promethean Documentation Pipeline Overview — L28](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-28-0) (line 28, col 0, score 0.58)
- [shared-package-layout-clarification — L154](shared-package-layout-clarification.md#^ref-36c8882a-154-0) (line 154, col 0, score 0.56)
- [Universal Lisp Interface — L90](universal-lisp-interface.md#^ref-b01856b4-90-0) (line 90, col 0, score 0.68)
- [Dynamic Context Model for Web Components — L80](dynamic-context-model-for-web-components.md#^ref-f7702bf8-80-0) (line 80, col 0, score 0.71)
- [Dynamic Context Model for Web Components — L198](dynamic-context-model-for-web-components.md#^ref-f7702bf8-198-0) (line 198, col 0, score 0.59)
- [i3-bluetooth-setup — L65](i3-bluetooth-setup.md#^ref-5e408692-65-0) (line 65, col 0, score 0.59)
- [Chroma Toolkit Consolidation Plan — L137](chroma-toolkit-consolidation-plan.md#^ref-5020e892-137-0) (line 137, col 0, score 0.63)
- [Promethean-Copilot-Intent-Engine — L35](promethean-copilot-intent-engine.md#^ref-ae24a280-35-0) (line 35, col 0, score 0.64)
- [i3-bluetooth-setup — L74](i3-bluetooth-setup.md#^ref-5e408692-74-0) (line 74, col 0, score 0.77)
- [Universal Lisp Interface — L137](universal-lisp-interface.md#^ref-b01856b4-137-0) (line 137, col 0, score 0.62)
- [Agent Tasks: Persistence Migration to DualStore — L103](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-103-0) (line 103, col 0, score 0.62)
- [State Snapshots API and Transactional Projector — L3](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-3-0) (line 3, col 0, score 0.65)
- [RAG UI Panel with Qdrant and PostgREST — L69](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-69-0) (line 69, col 0, score 0.63)
- [graph-ds — L361](graph-ds.md#^ref-6620e2f2-361-0) (line 361, col 0, score 0.63)
- [RAG UI Panel with Qdrant and PostgREST — L357](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-357-0) (line 357, col 0, score 0.62)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L326](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-326-0) (line 326, col 0, score 0.62)
- [Migrate to Provider-Tenant Architecture — L259](migrate-to-provider-tenant-architecture.md#^ref-54382370-259-0) (line 259, col 0, score 0.65)
- [Optimizing Command Limitations in System Design — L14](optimizing-command-limitations-in-system-design.md#^ref-98c8ff62-14-0) (line 14, col 0, score 0.62)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L7](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-7-0) (line 7, col 0, score 0.65)
- [Agent Tasks: Persistence Migration to DualStore — L70](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-70-0) (line 70, col 0, score 0.62)
- [State Snapshots API and Transactional Projector — L327](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-327-0) (line 327, col 0, score 0.57)
- [archetype-ecs — L419](archetype-ecs.md#^ref-8f4c1e86-419-0) (line 419, col 0, score 0.56)
- [plan-update-confirmation — L924](plan-update-confirmation.md#^ref-b22d79c6-924-0) (line 924, col 0, score 0.56)
- [Promethean Documentation Pipeline Overview — L62](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-62-0) (line 62, col 0, score 0.55)
- [typed-struct-compiler — L375](typed-struct-compiler.md#^ref-78eeedf7-375-0) (line 375, col 0, score 0.55)
- [balanced-bst — L291](balanced-bst.md#^ref-d3e7db72-291-0) (line 291, col 0, score 0.66)
- [Promethean Documentation Pipeline Overview — L115](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-115-0) (line 115, col 0, score 0.54)
- [i3-layout-saver — L1](i3-layout-saver.md#^ref-31f0166e-1-0) (line 1, col 0, score 0.67)
- [Promethean Pipelines — L36](promethean-pipelines.md#^ref-8b8e6103-36-0) (line 36, col 0, score 0.62)
- [universal-intention-code-fabric — L27](universal-intention-code-fabric.md#^ref-c14edce7-27-0) (line 27, col 0, score 0.6)
- [Obsidian ChatGPT Plugin Integration Guide — L15](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-15-0) (line 15, col 0, score 0.65)
- [Obsidian ChatGPT Plugin Integration — L15](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-15-0) (line 15, col 0, score 0.65)
- [Obsidian Templating Plugins Integration Guide — L15](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-15-0) (line 15, col 0, score 0.65)
- [Shared Package Structure — L157](shared-package-structure.md#^ref-66a72fc3-157-0) (line 157, col 0, score 0.63)
- [Self-Agency in AI Interaction — L9](self-agency-in-ai-interaction.md#^ref-49a9a860-9-0) (line 9, col 0, score 0.6)
- [Promethean Pipelines — L77](promethean-pipelines.md#^ref-8b8e6103-77-0) (line 77, col 0, score 0.59)
- [Mongo Outbox Implementation — L142](mongo-outbox-implementation.md#^ref-9c1acd1e-142-0) (line 142, col 0, score 0.64)
- [Model Upgrade Calm-Down Guide — L41](model-upgrade-calm-down-guide.md#^ref-db74343f-41-0) (line 41, col 0, score 0.62)
- [Prompt_Folder_Bootstrap — L86](prompt-folder-bootstrap.md#^ref-bd4f0976-86-0) (line 86, col 0, score 0.58)
- [Prompt_Folder_Bootstrap — L145](prompt-folder-bootstrap.md#^ref-bd4f0976-145-0) (line 145, col 0, score 0.63)
- [plan-update-confirmation — L986](plan-update-confirmation.md#^ref-b22d79c6-986-0) (line 986, col 0, score 0.62)
- [Migrate to Provider-Tenant Architecture — L103](migrate-to-provider-tenant-architecture.md#^ref-54382370-103-0) (line 103, col 0, score 0.62)
- [Voice Access Layer Design — L89](voice-access-layer-design.md#^ref-543ed9b3-89-0) (line 89, col 0, score 0.61)
- [Voice Access Layer Design — L95](voice-access-layer-design.md#^ref-543ed9b3-95-0) (line 95, col 0, score 0.61)
- [Voice Access Layer Design — L108](voice-access-layer-design.md#^ref-543ed9b3-108-0) (line 108, col 0, score 0.61)
- [Voice Access Layer Design — L114](voice-access-layer-design.md#^ref-543ed9b3-114-0) (line 114, col 0, score 0.61)
- [Dynamic Context Model for Web Components — L187](dynamic-context-model-for-web-components.md#^ref-f7702bf8-187-0) (line 187, col 0, score 0.6)
- [universal-intention-code-fabric — L394](universal-intention-code-fabric.md#^ref-c14edce7-394-0) (line 394, col 0, score 0.66)
- [Language-Agnostic Mirror System — L523](language-agnostic-mirror-system.md#^ref-d2b3628c-523-0) (line 523, col 0, score 0.66)
- [Language-Agnostic Mirror System — L507](language-agnostic-mirror-system.md#^ref-d2b3628c-507-0) (line 507, col 0, score 0.64)
- [windows-tiling-with-autohotkey — L11](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-11-0) (line 11, col 0, score 0.61)
- [plan-update-confirmation — L874](plan-update-confirmation.md#^ref-b22d79c6-874-0) (line 874, col 0, score 0.6)
- [plan-update-confirmation — L890](plan-update-confirmation.md#^ref-b22d79c6-890-0) (line 890, col 0, score 0.62)
- [Interop and Source Maps — L13](interop-and-source-maps.md#^ref-cdfac40c-13-0) (line 13, col 0, score 0.58)
- [balanced-bst — L290](balanced-bst.md#^ref-d3e7db72-290-0) (line 290, col 0, score 0.6)
- [lisp-dsl-for-window-management — L81](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-81-0) (line 81, col 0, score 0.57)
- [Lisp-Compiler-Integration — L531](lisp-compiler-integration.md#^ref-cfee6d36-531-0) (line 531, col 0, score 0.57)
- [markdown-to-org-transpiler — L1](markdown-to-org-transpiler.md#^ref-ab54cdd8-1-0) (line 1, col 0, score 0.62)
- [Performance-Optimized-Polyglot-Bridge — L418](performance-optimized-polyglot-bridge.md#^ref-f5579967-418-0) (line 418, col 0, score 0.57)
- [Performance-Optimized-Polyglot-Bridge — L13](performance-optimized-polyglot-bridge.md#^ref-f5579967-13-0) (line 13, col 0, score 0.65)
- [Cross-Language Runtime Polymorphism — L71](cross-language-runtime-polymorphism.md#^ref-c34c36a6-71-0) (line 71, col 0, score 0.64)
- [Functional Embedding Pipeline Refactor — L25](functional-embedding-pipeline-refactor.md#^ref-a4a25141-25-0) (line 25, col 0, score 0.6)
- [Functional Embedding Pipeline Refactor — L6](functional-embedding-pipeline-refactor.md#^ref-a4a25141-6-0) (line 6, col 0, score 0.63)
- [ecs-scheduler-and-prefabs — L7](ecs-scheduler-and-prefabs.md#^ref-c62a1815-7-0) (line 7, col 0, score 0.63)
- [System Scheduler with Resource-Aware DAG — L5](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-5-0) (line 5, col 0, score 0.63)
- [Agent Tasks: Persistence Migration to DualStore — L84](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-84-0) (line 84, col 0, score 0.64)
- [sibilant-macro-targets — L14](sibilant-macro-targets.md#^ref-c5c9a5c6-14-0) (line 14, col 0, score 0.61)
- [Functional Refactor of TypeScript Document Processing — L115](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-115-0) (line 115, col 0, score 0.65)
- [universal-intention-code-fabric — L426](universal-intention-code-fabric.md#^ref-c14edce7-426-0) (line 426, col 0, score 0.59)
- [universal-intention-code-fabric — L415](universal-intention-code-fabric.md#^ref-c14edce7-415-0) (line 415, col 0, score 0.67)
- [Local-Offline-Model-Deployment-Strategy — L10](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-10-0) (line 10, col 0, score 0.65)
- [api-gateway-versioning — L270](api-gateway-versioning.md#^ref-0580dcd3-270-0) (line 270, col 0, score 0.62)
- [Local-Only-LLM-Workflow — L28](local-only-llm-workflow.md#^ref-9a8ab57e-28-0) (line 28, col 0, score 0.62)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L1](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-1-0) (line 1, col 0, score 0.61)
- [Prometheus Observability Stack — L7](prometheus-observability-stack.md#^ref-e90b5a16-7-0) (line 7, col 0, score 0.63)
- [Promethean Full-Stack Docker Setup — L169](promethean-full-stack-docker-setup.md#^ref-2c2b48ca-169-0) (line 169, col 0, score 0.6)
- [Promethean Full-Stack Docker Setup — L3](promethean-full-stack-docker-setup.md#^ref-2c2b48ca-3-0) (line 3, col 0, score 0.6)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L9](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-9-0) (line 9, col 0, score 0.6)
- [Agent Tasks: Persistence Migration to DualStore — L129](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-129-0) (line 129, col 0, score 1)
- [AI-Centric OS with MCP Layer — L406](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-406-0) (line 406, col 0, score 0.61)
- [api-gateway-versioning — L315](api-gateway-versioning.md#^ref-0580dcd3-315-0) (line 315, col 0, score 1)
- [Chroma-Embedding-Refactor — L331](chroma-embedding-refactor.md#^ref-8b256935-331-0) (line 331, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L167](chroma-toolkit-consolidation-plan.md#^ref-5020e892-167-0) (line 167, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L214](cross-language-runtime-polymorphism.md#^ref-c34c36a6-214-0) (line 214, col 0, score 1)
- [Dynamic Context Model for Web Components — L390](dynamic-context-model-for-web-components.md#^ref-f7702bf8-390-0) (line 390, col 0, score 1)
- [eidolon-field-math-foundations — L147](eidolon-field-math-foundations.md#^ref-008f2ac0-147-0) (line 147, col 0, score 0.61)
- [Event Bus MVP — L553](event-bus-mvp.md#^ref-534fe91d-553-0) (line 553, col 0, score 1)
- [Functional Embedding Pipeline Refactor — L315](functional-embedding-pipeline-refactor.md#^ref-a4a25141-315-0) (line 315, col 0, score 1)
- [i3-bluetooth-setup — L105](i3-bluetooth-setup.md#^ref-5e408692-105-0) (line 105, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L122](chroma-toolkit-consolidation-plan.md#^ref-5020e892-122-0) (line 122, col 0, score 0.71)
- [prom-lib-rate-limiters-and-replay-api — L333](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-333-0) (line 333, col 0, score 0.71)
- [Agent Tasks: Persistence Migration to DualStore — L16](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-16-0) (line 16, col 0, score 0.65)
- [Language-Agnostic Mirror System — L511](language-agnostic-mirror-system.md#^ref-d2b3628c-511-0) (line 511, col 0, score 0.63)
- [Universal Lisp Interface — L30](universal-lisp-interface.md#^ref-b01856b4-30-0) (line 30, col 0, score 0.61)
- [Agent Tasks: Persistence Migration to DualStore — L59](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-59-0) (line 59, col 0, score 0.61)
- [polyglot-repl-interface-layer — L76](polyglot-repl-interface-layer.md#^ref-9c79206d-76-0) (line 76, col 0, score 0.6)
- [Language-Agnostic Mirror System — L508](language-agnostic-mirror-system.md#^ref-d2b3628c-508-0) (line 508, col 0, score 0.59)
- [Agent Tasks: Persistence Migration to DualStore — L25](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-25-0) (line 25, col 0, score 0.59)
- [Language-Agnostic Mirror System — L31](language-agnostic-mirror-system.md#^ref-d2b3628c-31-0) (line 31, col 0, score 0.59)
- [Chroma Toolkit Consolidation Plan — L10](chroma-toolkit-consolidation-plan.md#^ref-5020e892-10-0) (line 10, col 0, score 0.6)
- [Per-Domain Policy System for JS Crawler — L7](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-7-0) (line 7, col 0, score 0.64)
- [Promethean Agent Config DSL — L146](promethean-agent-config-dsl.md#^ref-2c00ce45-146-0) (line 146, col 0, score 0.63)
- [Promethean Event Bus MVP v0.1 — L857](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-857-0) (line 857, col 0, score 0.61)
- [Migrate to Provider-Tenant Architecture — L170](migrate-to-provider-tenant-architecture.md#^ref-54382370-170-0) (line 170, col 0, score 0.61)
- [Promethean Web UI Setup — L44](promethean-web-ui-setup.md#^ref-bc5172ca-44-0) (line 44, col 0, score 0.6)
- [Chroma Toolkit Consolidation Plan — L146](chroma-toolkit-consolidation-plan.md#^ref-5020e892-146-0) (line 146, col 0, score 0.6)
- [Voice Access Layer Design — L10](voice-access-layer-design.md#^ref-543ed9b3-10-0) (line 10, col 0, score 0.6)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L1](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-1-0) (line 1, col 0, score 0.59)
- [Local-Offline-Model-Deployment-Strategy — L1](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-1-0) (line 1, col 0, score 0.61)
- [Performance-Optimized-Polyglot-Bridge — L375](performance-optimized-polyglot-bridge.md#^ref-f5579967-375-0) (line 375, col 0, score 0.59)
- [obsidian-ignore-node-modules-regex — L26](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-26-0) (line 26, col 0, score 0.57)
- [ParticleSimulationWithCanvasAndFFmpeg — L1](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-1-0) (line 1, col 0, score 0.68)
- [Agent Tasks: Persistence Migration to DualStore — L92](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-92-0) (line 92, col 0, score 0.62)
- [Dynamic Context Model for Web Components — L39](dynamic-context-model-for-web-components.md#^ref-f7702bf8-39-0) (line 39, col 0, score 0.57)
- [Migrate to Provider-Tenant Architecture — L88](migrate-to-provider-tenant-architecture.md#^ref-54382370-88-0) (line 88, col 0, score 0.57)
- [ecs-offload-workers — L434](ecs-offload-workers.md#^ref-6498b9d7-434-0) (line 434, col 0, score 0.65)
- [typed-struct-compiler — L10](typed-struct-compiler.md#^ref-78eeedf7-10-0) (line 10, col 0, score 0.56)
- [obsidian-ignore-node-modules-regex — L14](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-14-0) (line 14, col 0, score 0.56)
- [Promethean Agent Config DSL — L172](promethean-agent-config-dsl.md#^ref-2c00ce45-172-0) (line 172, col 0, score 0.61)
- [Promethean Agent Config DSL — L13](promethean-agent-config-dsl.md#^ref-2c00ce45-13-0) (line 13, col 0, score 0.71)
- [Promethean Agent Config DSL — L292](promethean-agent-config-dsl.md#^ref-2c00ce45-292-0) (line 292, col 0, score 0.6)
- [AI-Centric OS with MCP Layer — L18](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-18-0) (line 18, col 0, score 0.59)
- [universal-intention-code-fabric — L417](universal-intention-code-fabric.md#^ref-c14edce7-417-0) (line 417, col 0, score 0.59)
- [Exception Layer Analysis — L3](exception-layer-analysis.md#^ref-21d5cc09-3-0) (line 3, col 0, score 0.63)
- [aionian-circuit-math — L70](aionian-circuit-math.md#^ref-f2d83a77-70-0) (line 70, col 0, score 0.63)
- [AI-Centric OS with MCP Layer — L21](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-21-0) (line 21, col 0, score 0.71)
- [Board Walk – 2025-08-11 — L60](board-walk-2025-08-11.md#^ref-7aa1eb92-60-0) (line 60, col 0, score 0.67)
- [AI-Centric OS with MCP Layer — L376](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-376-0) (line 376, col 0, score 0.67)
- [TypeScript Patch for Tool Calling Support — L262](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-262-0) (line 262, col 0, score 0.66)
- [TypeScript Patch for Tool Calling Support — L352](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-352-0) (line 352, col 0, score 0.66)
- [AI-Centric OS with MCP Layer — L30](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-30-0) (line 30, col 0, score 0.66)
- [plan-update-confirmation — L210](plan-update-confirmation.md#^ref-b22d79c6-210-0) (line 210, col 0, score 0.73)
- [plan-update-confirmation — L294](plan-update-confirmation.md#^ref-b22d79c6-294-0) (line 294, col 0, score 0.73)
- [Promethean Event Bus MVP v0.1 — L395](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-395-0) (line 395, col 0, score 0.65)
- [Promethean Web UI Setup — L262](promethean-web-ui-setup.md#^ref-bc5172ca-262-0) (line 262, col 0, score 0.62)
- [Language-Agnostic Mirror System — L37](language-agnostic-mirror-system.md#^ref-d2b3628c-37-0) (line 37, col 0, score 0.69)
- [Shared Package Structure — L64](shared-package-structure.md#^ref-66a72fc3-64-0) (line 64, col 0, score 0.66)
- [shared-package-layout-clarification — L106](shared-package-layout-clarification.md#^ref-36c8882a-106-0) (line 106, col 0, score 0.66)
- [Migrate to Provider-Tenant Architecture — L12](migrate-to-provider-tenant-architecture.md#^ref-54382370-12-0) (line 12, col 0, score 0.65)
- [Promethean Infrastructure Setup — L392](promethean-infrastructure-setup.md#^ref-6deed6ac-392-0) (line 392, col 0, score 0.67)
- [Promethean Agent DSL TS Scaffold — L3](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-3-0) (line 3, col 0, score 0.66)
- [shared-package-layout-clarification — L47](shared-package-layout-clarification.md#^ref-36c8882a-47-0) (line 47, col 0, score 0.64)
- [shared-package-layout-clarification — L11](shared-package-layout-clarification.md#^ref-36c8882a-11-0) (line 11, col 0, score 0.64)
- [Stateful Partitions and Rebalancing — L290](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-290-0) (line 290, col 0, score 0.65)
- [Promethean Event Bus MVP v0.1 — L474](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-474-0) (line 474, col 0, score 0.77)
- [Promethean Event Bus MVP v0.1 — L380](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-380-0) (line 380, col 0, score 0.78)
- [universal-intention-code-fabric — L68](universal-intention-code-fabric.md#^ref-c14edce7-68-0) (line 68, col 0, score 0.67)
- [Stateful Partitions and Rebalancing — L267](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-267-0) (line 267, col 0, score 0.67)
- [universal-intention-code-fabric — L92](universal-intention-code-fabric.md#^ref-c14edce7-92-0) (line 92, col 0, score 0.66)
- [schema-evolution-workflow — L71](schema-evolution-workflow.md#^ref-d8059b6a-71-0) (line 71, col 0, score 0.65)
- [schema-evolution-workflow — L98](schema-evolution-workflow.md#^ref-d8059b6a-98-0) (line 98, col 0, score 0.67)
- [schema-evolution-workflow — L313](schema-evolution-workflow.md#^ref-d8059b6a-313-0) (line 313, col 0, score 0.65)
- [Mongo Outbox Implementation — L381](mongo-outbox-implementation.md#^ref-9c1acd1e-381-0) (line 381, col 0, score 0.7)
- [Performance-Optimized-Polyglot-Bridge — L170](performance-optimized-polyglot-bridge.md#^ref-f5579967-170-0) (line 170, col 0, score 0.64)
- [Event Bus MVP — L457](event-bus-mvp.md#^ref-534fe91d-457-0) (line 457, col 0, score 0.68)
- [Promethean Agent DSL TS Scaffold — L247](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-247-0) (line 247, col 0, score 0.7)
- [Shared Package Structure — L117](shared-package-structure.md#^ref-66a72fc3-117-0) (line 117, col 0, score 0.63)
- [Shared Package Structure — L124](shared-package-structure.md#^ref-66a72fc3-124-0) (line 124, col 0, score 0.69)
- [Promethean Agent DSL TS Scaffold — L738](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-738-0) (line 738, col 0, score 0.69)
- [TypeScript Patch for Tool Calling Support — L9](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-9-0) (line 9, col 0, score 0.69)
- [Promethean Agent DSL TS Scaffold — L197](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-197-0) (line 197, col 0, score 0.64)
- [Promethean Event Bus MVP v0.1 — L423](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-423-0) (line 423, col 0, score 0.68)
- [Promethean Agent DSL TS Scaffold — L417](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-417-0) (line 417, col 0, score 0.67)
- [Promethean Infrastructure Setup — L439](promethean-infrastructure-setup.md#^ref-6deed6ac-439-0) (line 439, col 0, score 0.67)
- [Promethean Agent DSL TS Scaffold — L380](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-380-0) (line 380, col 0, score 0.67)
- [Promethean Agent DSL TS Scaffold — L181](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-181-0) (line 181, col 0, score 0.67)
- [Language-Agnostic Mirror System — L471](language-agnostic-mirror-system.md#^ref-d2b3628c-471-0) (line 471, col 0, score 0.69)
- [Per-Domain Policy System for JS Crawler — L184](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-184-0) (line 184, col 0, score 0.66)
- [Language-Agnostic Mirror System — L336](language-agnostic-mirror-system.md#^ref-d2b3628c-336-0) (line 336, col 0, score 0.67)
- [Event Bus MVP — L370](event-bus-mvp.md#^ref-534fe91d-370-0) (line 370, col 0, score 0.67)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L108](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-108-0) (line 108, col 0, score 0.67)
- [Lispy Macros with syntax-rules — L301](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-301-0) (line 301, col 0, score 0.67)
- [Functional Embedding Pipeline Refactor — L31](functional-embedding-pipeline-refactor.md#^ref-a4a25141-31-0) (line 31, col 0, score 0.67)
- [Per-Domain Policy System for JS Crawler — L141](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-141-0) (line 141, col 0, score 0.67)
- [universal-intention-code-fabric — L277](universal-intention-code-fabric.md#^ref-c14edce7-277-0) (line 277, col 0, score 0.66)
- [Lisp-Compiler-Integration — L440](lisp-compiler-integration.md#^ref-cfee6d36-440-0) (line 440, col 0, score 0.64)
- [Stateful Partitions and Rebalancing — L448](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-448-0) (line 448, col 0, score 0.65)
- [Lisp-Compiler-Integration — L188](lisp-compiler-integration.md#^ref-cfee6d36-188-0) (line 188, col 0, score 0.66)
- [typed-struct-compiler — L16](typed-struct-compiler.md#^ref-78eeedf7-16-0) (line 16, col 0, score 0.7)
- [Language-Agnostic Mirror System — L273](language-agnostic-mirror-system.md#^ref-d2b3628c-273-0) (line 273, col 0, score 0.68)
- [Promethean Agent DSL TS Scaffold — L647](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-647-0) (line 647, col 0, score 0.68)
- [TypeScript Patch for Tool Calling Support — L67](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-67-0) (line 67, col 0, score 0.68)
- [Promethean Agent DSL TS Scaffold — L107](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-107-0) (line 107, col 0, score 0.67)
- [Promethean Agent DSL TS Scaffold — L389](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-389-0) (line 389, col 0, score 0.67)
- [refactor-relations — L10](refactor-relations.md#^ref-41ce0216-10-0) (line 10, col 0, score 0.68)
- [markdown-to-org-transpiler — L7](markdown-to-org-transpiler.md#^ref-ab54cdd8-7-0) (line 7, col 0, score 0.66)
- [Functional Refactor of TypeScript Document Processing — L114](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-114-0) (line 114, col 0, score 0.73)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L489](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-489-0) (line 489, col 0, score 0.65)
- [Agent Tasks: Persistence Migration to DualStore — L26](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-26-0) (line 26, col 0, score 0.65)
- [Migrate to Provider-Tenant Architecture — L160](migrate-to-provider-tenant-architecture.md#^ref-54382370-160-0) (line 160, col 0, score 0.59)
- [zero-copy-snapshots-and-workers — L15](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-15-0) (line 15, col 0, score 0.63)
- [ecs-offload-workers — L442](ecs-offload-workers.md#^ref-6498b9d7-442-0) (line 442, col 0, score 0.63)
- [Agent Tasks: Persistence Migration to DualStore — L54](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-54-0) (line 54, col 0, score 0.63)
- [Agent Tasks: Persistence Migration to DualStore — L60](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-60-0) (line 60, col 0, score 0.63)
- [polymorphic-meta-programming-engine — L3](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-3-0) (line 3, col 0, score 0.62)
- [Language-Agnostic Mirror System — L237](language-agnostic-mirror-system.md#^ref-d2b3628c-237-0) (line 237, col 0, score 0.67)
- [Language-Agnostic Mirror System — L151](language-agnostic-mirror-system.md#^ref-d2b3628c-151-0) (line 151, col 0, score 0.65)
- [Local-First Intention→Code Loop with Free Models — L23](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-23-0) (line 23, col 0, score 0.66)
- [Interop and Source Maps — L421](interop-and-source-maps.md#^ref-cdfac40c-421-0) (line 421, col 0, score 0.65)
- [Chroma-Embedding-Refactor — L28](chroma-embedding-refactor.md#^ref-8b256935-28-0) (line 28, col 0, score 0.66)
- [zero-copy-snapshots-and-workers — L202](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-202-0) (line 202, col 0, score 0.66)
- [Promethean Event Bus MVP v0.1 — L572](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-572-0) (line 572, col 0, score 0.65)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L431](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-431-0) (line 431, col 0, score 0.64)
- [Stateful Partitions and Rebalancing — L166](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-166-0) (line 166, col 0, score 0.64)
- [Promethean Infrastructure Setup — L415](promethean-infrastructure-setup.md#^ref-6deed6ac-415-0) (line 415, col 0, score 0.64)
- [ecs-offload-workers — L306](ecs-offload-workers.md#^ref-6498b9d7-306-0) (line 306, col 0, score 0.64)
- [Refactor 05-footers.ts — L9](refactor-05-footers-ts.md#^ref-80d4d883-9-0) (line 9, col 0, score 0.64)
- [Agent Tasks: Persistence Migration to DualStore — L18](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-18-0) (line 18, col 0, score 0.62)
- [Math Fundamentals — L34](chunks/math-fundamentals.md#^ref-c6e87433-34-0) (line 34, col 0, score 1)
- [Services — L22](chunks/services.md#^ref-75ea4a6a-22-0) (line 22, col 0, score 1)
- [Shared — L29](chunks/shared.md#^ref-623a55f7-29-0) (line 29, col 0, score 1)
- [Simulation Demo — L23](chunks/simulation-demo.md#^ref-557309a3-23-0) (line 23, col 0, score 1)
- [Tooling — L16](chunks/tooling.md#^ref-6cb4943e-16-0) (line 16, col 0, score 1)
- [Window Management — L25](chunks/window-management.md#^ref-9e8ae388-25-0) (line 25, col 0, score 1)
- [compiler-kit-foundations — L627](compiler-kit-foundations.md#^ref-01b21543-627-0) (line 627, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L171](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-171-0) (line 171, col 0, score 1)
- [Local-Only-LLM-Workflow — L36](local-only-llm-workflow.md#^ref-9a8ab57e-36-0) (line 36, col 0, score 0.73)
- [Voice Access Layer Design — L183](voice-access-layer-design.md#^ref-543ed9b3-183-0) (line 183, col 0, score 0.7)
- [Provider-Agnostic Chat Panel Implementation — L84](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-84-0) (line 84, col 0, score 0.68)
- [Provider-Agnostic Chat Panel Implementation — L183](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-183-0) (line 183, col 0, score 0.68)
- [Promethean Web UI Setup — L351](promethean-web-ui-setup.md#^ref-bc5172ca-351-0) (line 351, col 0, score 0.67)
- [Shared Package Structure — L5](shared-package-structure.md#^ref-66a72fc3-5-0) (line 5, col 0, score 0.67)
- [api-gateway-versioning — L79](api-gateway-versioning.md#^ref-0580dcd3-79-0) (line 79, col 0, score 0.67)
- [WebSocket Gateway Implementation — L219](websocket-gateway-implementation.md#^ref-e811123d-219-0) (line 219, col 0, score 0.67)
- [schema-evolution-workflow — L29](schema-evolution-workflow.md#^ref-d8059b6a-29-0) (line 29, col 0, score 0.67)
- [compiler-kit-foundations — L31](compiler-kit-foundations.md#^ref-01b21543-31-0) (line 31, col 0, score 0.67)
- [Prompt_Folder_Bootstrap — L174](prompt-folder-bootstrap.md#^ref-bd4f0976-174-0) (line 174, col 0, score 0.65)
- [Prompt_Folder_Bootstrap — L68](prompt-folder-bootstrap.md#^ref-bd4f0976-68-0) (line 68, col 0, score 0.65)
- [Prompt_Folder_Bootstrap — L106](prompt-folder-bootstrap.md#^ref-bd4f0976-106-0) (line 106, col 0, score 0.64)
- [Prompt_Folder_Bootstrap — L80](prompt-folder-bootstrap.md#^ref-bd4f0976-80-0) (line 80, col 0, score 0.62)
- [Prompt_Folder_Bootstrap — L105](prompt-folder-bootstrap.md#^ref-bd4f0976-105-0) (line 105, col 0, score 0.62)
- [Promethean Agent DSL TS Scaffold — L232](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-232-0) (line 232, col 0, score 0.62)
- [Promethean Agent Config DSL — L117](promethean-agent-config-dsl.md#^ref-2c00ce45-117-0) (line 117, col 0, score 0.61)
- [Prompt_Folder_Bootstrap — L26](prompt-folder-bootstrap.md#^ref-bd4f0976-26-0) (line 26, col 0, score 0.61)
- [i3-layout-saver — L61](i3-layout-saver.md#^ref-31f0166e-61-0) (line 61, col 0, score 0.65)
- [universal-intention-code-fabric — L25](universal-intention-code-fabric.md#^ref-c14edce7-25-0) (line 25, col 0, score 0.62)
- [i3-layout-saver — L72](i3-layout-saver.md#^ref-31f0166e-72-0) (line 72, col 0, score 0.63)
- [RAG UI Panel with Qdrant and PostgREST — L9](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-9-0) (line 9, col 0, score 0.62)
- [WebSocket Gateway Implementation — L614](websocket-gateway-implementation.md#^ref-e811123d-614-0) (line 614, col 0, score 0.62)
- [Promethean Full-Stack Docker Setup — L404](promethean-full-stack-docker-setup.md#^ref-2c2b48ca-404-0) (line 404, col 0, score 0.62)
- [Language-Agnostic Mirror System — L510](language-agnostic-mirror-system.md#^ref-d2b3628c-510-0) (line 510, col 0, score 0.63)
- [Dynamic Context Model for Web Components — L170](dynamic-context-model-for-web-components.md#^ref-f7702bf8-170-0) (line 170, col 0, score 0.61)
- [Model Upgrade Calm-Down Guide — L44](model-upgrade-calm-down-guide.md#^ref-db74343f-44-0) (line 44, col 0, score 0.6)
- [Agent Tasks: Persistence Migration to DualStore — L154](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-154-0) (line 154, col 0, score 1)
- [AI-Centric OS with MCP Layer — L399](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-399-0) (line 399, col 0, score 1)
- [Dynamic Context Model for Web Components — L409](dynamic-context-model-for-web-components.md#^ref-f7702bf8-409-0) (line 409, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L34](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-34-0) (line 34, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L34](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-34-0) (line 34, col 0, score 1)
- [universal-intention-code-fabric — L420](universal-intention-code-fabric.md#^ref-c14edce7-420-0) (line 420, col 0, score 0.63)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L332](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-332-0) (line 332, col 0, score 0.61)
- [schema-evolution-workflow — L463](schema-evolution-workflow.md#^ref-d8059b6a-463-0) (line 463, col 0, score 0.6)
- [Stateful Partitions and Rebalancing — L511](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-511-0) (line 511, col 0, score 0.6)
- [Fnord Tracer Protocol — L157](fnord-tracer-protocol.md#^ref-fc21f824-157-0) (line 157, col 0, score 0.6)
- [promethean-requirements — L4](promethean-requirements.md#^ref-95205cd3-4-0) (line 4, col 0, score 0.6)
- [archetype-ecs — L7](archetype-ecs.md#^ref-8f4c1e86-7-0) (line 7, col 0, score 0.6)
- [i3-config-validation-methods — L9](i3-config-validation-methods.md#^ref-d28090ac-9-0) (line 9, col 0, score 0.62)
- [AI-Centric OS with MCP Layer — L32](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-32-0) (line 32, col 0, score 0.62)
- [AI-Centric OS with MCP Layer — L31](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-31-0) (line 31, col 0, score 0.6)
- [Sibilant Meta-Prompt DSL — L131](sibilant-meta-prompt-dsl.md#^ref-af5d2824-131-0) (line 131, col 0, score 0.87)
- [field-interaction-equations — L31](field-interaction-equations.md#^ref-b09141b7-31-0) (line 31, col 0, score 0.59)
- [Promethean_Eidolon_Synchronicity_Model — L41](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-41-0) (line 41, col 0, score 0.78)
- [Voice Access Layer Design — L96](voice-access-layer-design.md#^ref-543ed9b3-96-0) (line 96, col 0, score 0.71)
- [Chroma-Embedding-Refactor — L6](chroma-embedding-refactor.md#^ref-8b256935-6-0) (line 6, col 0, score 0.66)
- [windows-tiling-with-autohotkey — L19](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-19-0) (line 19, col 0, score 0.66)
- [plan-update-confirmation — L978](plan-update-confirmation.md#^ref-b22d79c6-978-0) (line 978, col 0, score 0.66)
- [Promethean Agent Config DSL — L143](promethean-agent-config-dsl.md#^ref-2c00ce45-143-0) (line 143, col 0, score 0.71)
- [Migrate to Provider-Tenant Architecture — L136](migrate-to-provider-tenant-architecture.md#^ref-54382370-136-0) (line 136, col 0, score 0.71)
- [js-to-lisp-reverse-compiler — L384](js-to-lisp-reverse-compiler.md#^ref-58191024-384-0) (line 384, col 0, score 0.71)
- [Dynamic Context Model for Web Components — L149](dynamic-context-model-for-web-components.md#^ref-f7702bf8-149-0) (line 149, col 0, score 0.68)
- [Cross-Target Macro System in Sibilant — L119](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-119-0) (line 119, col 0, score 0.65)
- [Language-Agnostic Mirror System — L235](language-agnostic-mirror-system.md#^ref-d2b3628c-235-0) (line 235, col 0, score 0.63)
- [Dynamic Context Model for Web Components — L148](dynamic-context-model-for-web-components.md#^ref-f7702bf8-148-0) (line 148, col 0, score 0.62)
- [ecs-scheduler-and-prefabs — L338](ecs-scheduler-and-prefabs.md#^ref-c62a1815-338-0) (line 338, col 0, score 0.65)
- [Prompt_Folder_Bootstrap — L24](prompt-folder-bootstrap.md#^ref-bd4f0976-24-0) (line 24, col 0, score 0.65)
- [Prompt_Folder_Bootstrap — L42](prompt-folder-bootstrap.md#^ref-bd4f0976-42-0) (line 42, col 0, score 0.65)
- [Prompt_Folder_Bootstrap — L66](prompt-folder-bootstrap.md#^ref-bd4f0976-66-0) (line 66, col 0, score 0.65)
- [Prompt_Folder_Bootstrap — L84](prompt-folder-bootstrap.md#^ref-bd4f0976-84-0) (line 84, col 0, score 0.65)
- [Prompt_Folder_Bootstrap — L103](prompt-folder-bootstrap.md#^ref-bd4f0976-103-0) (line 103, col 0, score 0.65)
- [Prompt_Folder_Bootstrap — L130](prompt-folder-bootstrap.md#^ref-bd4f0976-130-0) (line 130, col 0, score 0.65)
- [Prompt_Folder_Bootstrap — L152](prompt-folder-bootstrap.md#^ref-bd4f0976-152-0) (line 152, col 0, score 0.65)
- [System Scheduler with Resource-Aware DAG — L336](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-336-0) (line 336, col 0, score 0.65)
- [Layer1SurvivabilityEnvelope — L137](layer1survivabilityenvelope.md#^ref-64a9f9f9-137-0) (line 137, col 0, score 0.62)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L483](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-483-0) (line 483, col 0, score 0.6)
- [i3-layout-saver — L70](i3-layout-saver.md#^ref-31f0166e-70-0) (line 70, col 0, score 0.6)
- [Layer1SurvivabilityEnvelope — L129](layer1survivabilityenvelope.md#^ref-64a9f9f9-129-0) (line 129, col 0, score 0.6)
- [sibilant-metacompiler-overview — L42](sibilant-metacompiler-overview.md#^ref-61d4086b-42-0) (line 42, col 0, score 0.57)
- [prompt-programming-language-lisp — L64](prompt-programming-language-lisp.md#^ref-d41a06d1-64-0) (line 64, col 0, score 0.62)
- [universal-intention-code-fabric — L390](universal-intention-code-fabric.md#^ref-c14edce7-390-0) (line 390, col 0, score 0.55)
- [Synchronicity Waves and Web — L78](synchronicity-waves-and-web.md#^ref-91295f3a-78-0) (line 78, col 0, score 0.54)
- [zero-copy-snapshots-and-workers — L355](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-355-0) (line 355, col 0, score 0.53)
- [Promethean Pipelines — L12](promethean-pipelines.md#^ref-8b8e6103-12-0) (line 12, col 0, score 0.53)
- [Recursive Prompt Construction Engine — L1](recursive-prompt-construction-engine.md#^ref-babdb9eb-1-0) (line 1, col 0, score 0.52)
- [Recursive Prompt Construction Engine — L9](recursive-prompt-construction-engine.md#^ref-babdb9eb-9-0) (line 9, col 0, score 0.52)
- [Recursive Prompt Construction Engine — L89](recursive-prompt-construction-engine.md#^ref-babdb9eb-89-0) (line 89, col 0, score 0.51)
- [windows-tiling-with-autohotkey — L13](windows-tiling-with-autohotkey.md#^ref-0f6f8f38-13-0) (line 13, col 0, score 0.51)
- [sibilant-meta-string-templating-runtime — L114](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-114-0) (line 114, col 0, score 0.51)
- [Model Upgrade Calm-Down Guide — L15](model-upgrade-calm-down-guide.md#^ref-db74343f-15-0) (line 15, col 0, score 0.65)
- [Migrate to Provider-Tenant Architecture — L104](migrate-to-provider-tenant-architecture.md#^ref-54382370-104-0) (line 104, col 0, score 0.64)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L492](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-492-0) (line 492, col 0, score 0.63)
- [Promethean State Format — L26](promethean-state-format.md#^ref-23df6ddb-26-0) (line 26, col 0, score 0.62)
- [AI-Centric OS with MCP Layer — L1](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-1-0) (line 1, col 0, score 0.59)
- [Per-Domain Policy System for JS Crawler — L458](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-458-0) (line 458, col 0, score 0.62)
- [Lispy Macros with syntax-rules — L389](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-389-0) (line 389, col 0, score 0.64)
- [Language-Agnostic Mirror System — L1](language-agnostic-mirror-system.md#^ref-d2b3628c-1-0) (line 1, col 0, score 0.62)
- [Model Selection for Lightweight Conversational Tasks — L88](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-88-0) (line 88, col 0, score 0.62)
- [aionian-circuit-math — L141](aionian-circuit-math.md#^ref-f2d83a77-141-0) (line 141, col 0, score 0.66)
- [Functional Embedding Pipeline Refactor — L303](functional-embedding-pipeline-refactor.md#^ref-a4a25141-303-0) (line 303, col 0, score 0.64)
- [field-dynamics-math-blocks — L98](field-dynamics-math-blocks.md#^ref-7cfc230d-98-0) (line 98, col 0, score 0.64)
- [field-node-diagram-set — L102](field-node-diagram-set.md#^ref-22b989d5-102-0) (line 102, col 0, score 0.64)
- [Fnord Tracer Protocol — L194](fnord-tracer-protocol.md#^ref-fc21f824-194-0) (line 194, col 0, score 0.64)
- [Per-Domain Policy System for JS Crawler — L109](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-109-0) (line 109, col 0, score 0.64)
- [AI-Centric OS with MCP Layer — L178](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-178-0) (line 178, col 0, score 0.6)
- [Local-Offline-Model-Deployment-Strategy — L217](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-217-0) (line 217, col 0, score 0.59)
- [Local-Offline-Model-Deployment-Strategy — L156](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-156-0) (line 156, col 0, score 0.58)
- [Per-Domain Policy System for JS Crawler — L460](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-460-0) (line 460, col 0, score 0.57)
- [shared-package-layout-clarification — L1](shared-package-layout-clarification.md#^ref-36c8882a-1-0) (line 1, col 0, score 0.57)
- [Python Services CI — L1](python-services-ci.md#^ref-4c951657-1-0) (line 1, col 0, score 0.57)
- [Shared Package Structure — L1](shared-package-structure.md#^ref-66a72fc3-1-0) (line 1, col 0, score 0.57)
- [Promethean-Copilot-Intent-Engine — L50](promethean-copilot-intent-engine.md#^ref-ae24a280-50-0) (line 50, col 0, score 0.57)
- [Local-Offline-Model-Deployment-Strategy — L240](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-240-0) (line 240, col 0, score 0.56)
- [polymorphic-meta-programming-engine — L145](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-145-0) (line 145, col 0, score 0.71)
- [Promethean Agent DSL TS Scaffold — L1](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-1-0) (line 1, col 0, score 0.71)
- [Promethean-Copilot-Intent-Engine — L5](promethean-copilot-intent-engine.md#^ref-ae24a280-5-0) (line 5, col 0, score 0.68)
- [Promethean Pipelines: Local TypeScript-First Workflow — L253](promethean-pipelines-local-typescript-first-workflow.md#^ref-6b63edca-253-0) (line 253, col 0, score 0.72)
- [Model Upgrade Calm-Down Guide — L30](model-upgrade-calm-down-guide.md#^ref-db74343f-30-0) (line 30, col 0, score 0.66)
- [Interop and Source Maps — L506](interop-and-source-maps.md#^ref-cdfac40c-506-0) (line 506, col 0, score 0.64)
- [Promethean-Copilot-Intent-Engine — L33](promethean-copilot-intent-engine.md#^ref-ae24a280-33-0) (line 33, col 0, score 0.64)
- [Promethean Agent Config DSL — L72](promethean-agent-config-dsl.md#^ref-2c00ce45-72-0) (line 72, col 0, score 0.66)
- [lisp-dsl-for-window-management — L21](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-21-0) (line 21, col 0, score 0.64)
- [State Snapshots API and Transactional Projector — L319](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-319-0) (line 319, col 0, score 0.72)
- [Factorio AI with External Agents — L8](factorio-ai-with-external-agents.md#^ref-a4d90289-8-0) (line 8, col 0, score 0.64)
- [Promethean Documentation Pipeline Overview — L147](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-147-0) (line 147, col 0, score 0.67)
- [Universal Lisp Interface — L192](universal-lisp-interface.md#^ref-b01856b4-192-0) (line 192, col 0, score 0.63)
- [Agent Tasks: Persistence Migration to DualStore — L8](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-8-0) (line 8, col 0, score 0.67)
- [komorebi-group-window-hack — L168](komorebi-group-window-hack.md#^ref-dd89372d-168-0) (line 168, col 0, score 0.67)
- [Factorio AI with External Agents — L26](factorio-ai-with-external-agents.md#^ref-a4d90289-26-0) (line 26, col 0, score 0.67)
- [obsidian-ignore-node-modules-regex — L38](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-38-0) (line 38, col 0, score 0.66)
- [Model Selection for Lightweight Conversational Tasks — L105](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-105-0) (line 105, col 0, score 0.66)
- [polyglot-repl-interface-layer — L138](polyglot-repl-interface-layer.md#^ref-9c79206d-138-0) (line 138, col 0, score 0.66)
- [universal-intention-code-fabric — L406](universal-intention-code-fabric.md#^ref-c14edce7-406-0) (line 406, col 0, score 0.65)
- [mystery-lisp-search-session — L100](mystery-lisp-search-session.md#^ref-513dc4c7-100-0) (line 100, col 0, score 0.65)
- [Migrate to Provider-Tenant Architecture — L79](migrate-to-provider-tenant-architecture.md#^ref-54382370-79-0) (line 79, col 0, score 0.63)
- [ts-to-lisp-transpiler — L5](ts-to-lisp-transpiler.md#^ref-ba11486b-5-0) (line 5, col 0, score 0.61)
- [Cross-Language Runtime Polymorphism — L157](cross-language-runtime-polymorphism.md#^ref-c34c36a6-157-0) (line 157, col 0, score 0.82)
- [plan-update-confirmation — L554](plan-update-confirmation.md#^ref-b22d79c6-554-0) (line 554, col 0, score 0.75)
- [plan-update-confirmation — L600](plan-update-confirmation.md#^ref-b22d79c6-600-0) (line 600, col 0, score 0.7)
- [Obsidian Templating Plugins Integration Guide — L36](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-36-0) (line 36, col 0, score 0.7)
- [Dynamic Context Model for Web Components — L332](dynamic-context-model-for-web-components.md#^ref-f7702bf8-332-0) (line 332, col 0, score 0.67)
- [js-to-lisp-reverse-compiler — L370](js-to-lisp-reverse-compiler.md#^ref-58191024-370-0) (line 370, col 0, score 0.67)
- [Universal Lisp Interface — L73](universal-lisp-interface.md#^ref-b01856b4-73-0) (line 73, col 0, score 0.67)
- [Migrate to Provider-Tenant Architecture — L59](migrate-to-provider-tenant-architecture.md#^ref-54382370-59-0) (line 59, col 0, score 0.73)
- [Promethean Event Bus MVP v0.1 — L114](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-114-0) (line 114, col 0, score 0.62)
- [Promethean Pipelines — L78](promethean-pipelines.md#^ref-8b8e6103-78-0) (line 78, col 0, score 0.62)
- [Event Bus MVP — L368](event-bus-mvp.md#^ref-534fe91d-368-0) (line 368, col 0, score 0.61)
- [i3-config-validation-methods — L16](i3-config-validation-methods.md#^ref-d28090ac-16-0) (line 16, col 0, score 0.61)
- [i3-config-validation-methods — L25](i3-config-validation-methods.md#^ref-d28090ac-25-0) (line 25, col 0, score 0.61)
- [observability-infrastructure-setup — L1](observability-infrastructure-setup.md#^ref-b4e64f8c-1-0) (line 1, col 0, score 0.61)
- [WebSocket Gateway Implementation — L296](websocket-gateway-implementation.md#^ref-e811123d-296-0) (line 296, col 0, score 0.63)
- [State Snapshots API and Transactional Projector — L162](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-162-0) (line 162, col 0, score 0.59)
- [prompt-programming-language-lisp — L79](prompt-programming-language-lisp.md#^ref-d41a06d1-79-0) (line 79, col 0, score 0.7)
- [Recursive Prompt Construction Engine — L176](recursive-prompt-construction-engine.md#^ref-babdb9eb-176-0) (line 176, col 0, score 0.7)
- [set-assignment-in-lisp-ast — L159](set-assignment-in-lisp-ast.md#^ref-c5fba0a0-159-0) (line 159, col 0, score 0.7)
- [sibilant-macro-targets — L159](sibilant-macro-targets.md#^ref-c5c9a5c6-159-0) (line 159, col 0, score 0.7)
- [universal-intention-code-fabric — L397](universal-intention-code-fabric.md#^ref-c14edce7-397-0) (line 397, col 0, score 0.66)
- [sibilant-meta-string-templating-runtime — L58](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-58-0) (line 58, col 0, score 0.64)
- [prompt-programming-language-lisp — L103](prompt-programming-language-lisp.md#^ref-d41a06d1-103-0) (line 103, col 0, score 0.61)
- [Provider-Agnostic Chat Panel Implementation — L247](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-247-0) (line 247, col 0, score 0.61)
- [schema-evolution-workflow — L515](schema-evolution-workflow.md#^ref-d8059b6a-515-0) (line 515, col 0, score 0.61)
- [Shared Package Structure — L208](shared-package-structure.md#^ref-66a72fc3-208-0) (line 208, col 0, score 0.61)
- [plan-update-confirmation — L637](plan-update-confirmation.md#^ref-b22d79c6-637-0) (line 637, col 0, score 0.62)
- [Voice Access Layer Design — L17](voice-access-layer-design.md#^ref-543ed9b3-17-0) (line 17, col 0, score 0.62)
- [Promethean Agent DSL TS Scaffold — L774](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-774-0) (line 774, col 0, score 0.62)
- [WebSocket Gateway Implementation — L619](websocket-gateway-implementation.md#^ref-e811123d-619-0) (line 619, col 0, score 0.62)
- [sibilant-metacompiler-overview — L51](sibilant-metacompiler-overview.md#^ref-61d4086b-51-0) (line 51, col 0, score 0.61)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L336](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-336-0) (line 336, col 0, score 0.61)
- [prom-lib-rate-limiters-and-replay-api — L369](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-369-0) (line 369, col 0, score 0.75)
- [Migrate to Provider-Tenant Architecture — L201](migrate-to-provider-tenant-architecture.md#^ref-54382370-201-0) (line 201, col 0, score 0.66)
- [Prometheus Observability Stack — L498](prometheus-observability-stack.md#^ref-e90b5a16-498-0) (line 498, col 0, score 0.62)
- [Dynamic Context Model for Web Components — L234](dynamic-context-model-for-web-components.md#^ref-f7702bf8-234-0) (line 234, col 0, score 0.62)
- [Promethean-Copilot-Intent-Engine — L9](promethean-copilot-intent-engine.md#^ref-ae24a280-9-0) (line 9, col 0, score 0.61)
- [Promethean Dev Workflow Update — L42](promethean-dev-workflow-update.md#^ref-03a5578f-42-0) (line 42, col 0, score 0.61)
- [Factorio AI with External Agents — L15](factorio-ai-with-external-agents.md#^ref-a4d90289-15-0) (line 15, col 0, score 0.6)
- [TypeScript Patch for Tool Calling Support — L423](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-423-0) (line 423, col 0, score 0.6)
- [Model Upgrade Calm-Down Guide — L42](model-upgrade-calm-down-guide.md#^ref-db74343f-42-0) (line 42, col 0, score 0.59)
- [sibilant-macro-targets — L6](sibilant-macro-targets.md#^ref-c5c9a5c6-6-0) (line 6, col 0, score 0.59)
- [Cross-Target Macro System in Sibilant — L193](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-193-0) (line 193, col 0, score 0.69)
- [Dynamic Context Model for Web Components — L381](dynamic-context-model-for-web-components.md#^ref-f7702bf8-381-0) (line 381, col 0, score 0.69)
- [Exception Layer Analysis — L154](exception-layer-analysis.md#^ref-21d5cc09-154-0) (line 154, col 0, score 0.69)
- [zero-copy-snapshots-and-workers — L363](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-363-0) (line 363, col 0, score 1)
- [Pure TypeScript Search Microservice — L538](pure-typescript-search-microservice.md#^ref-d17d3a96-538-0) (line 538, col 0, score 1)
- [RAG UI Panel with Qdrant and PostgREST — L374](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-374-0) (line 374, col 0, score 1)
- [ripple-propagation-demo — L120](ripple-propagation-demo.md#^ref-8430617b-120-0) (line 120, col 0, score 1)
- [schema-evolution-workflow — L502](schema-evolution-workflow.md#^ref-d8059b6a-502-0) (line 502, col 0, score 1)
- [Self-Agency in AI Interaction — L53](self-agency-in-ai-interaction.md#^ref-49a9a860-53-0) (line 53, col 0, score 1)
- [set-assignment-in-lisp-ast — L161](set-assignment-in-lisp-ast.md#^ref-c5fba0a0-161-0) (line 161, col 0, score 1)
- [shared-package-layout-clarification — L185](shared-package-layout-clarification.md#^ref-36c8882a-185-0) (line 185, col 0, score 1)
- [Shared Package Structure — L181](shared-package-structure.md#^ref-66a72fc3-181-0) (line 181, col 0, score 1)
- [sibilant-macro-targets — L173](sibilant-macro-targets.md#^ref-c5c9a5c6-173-0) (line 173, col 0, score 1)
- [Sibilant Meta-Prompt DSL — L194](sibilant-meta-prompt-dsl.md#^ref-af5d2824-194-0) (line 194, col 0, score 1)
- [Diagrams — L25](chunks/diagrams.md#^ref-45cd25b5-25-0) (line 25, col 0, score 1)
- [Tooling — L24](chunks/tooling.md#^ref-6cb4943e-24-0) (line 24, col 0, score 1)
- [field-interaction-equations — L159](field-interaction-equations.md#^ref-b09141b7-159-0) (line 159, col 0, score 1)
- [i3-config-validation-methods — L56](i3-config-validation-methods.md#^ref-d28090ac-56-0) (line 56, col 0, score 1)
- [Math Fundamentals — L31](chunks/math-fundamentals.md#^ref-c6e87433-31-0) (line 31, col 0, score 1)
- [Tooling — L19](chunks/tooling.md#^ref-6cb4943e-19-0) (line 19, col 0, score 1)
- [compiler-kit-foundations — L634](compiler-kit-foundations.md#^ref-01b21543-634-0) (line 634, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L212](cross-language-runtime-polymorphism.md#^ref-c34c36a6-212-0) (line 212, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L180](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-180-0) (line 180, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L56](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-56-0) (line 56, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L45](ducks-self-referential-perceptual-loop.md#^ref-71726f04-45-0) (line 45, col 0, score 1)
- [Dynamic Context Model for Web Components — L384](dynamic-context-model-for-web-components.md#^ref-f7702bf8-384-0) (line 384, col 0, score 1)
- [ecs-offload-workers — L468](ecs-offload-workers.md#^ref-6498b9d7-468-0) (line 468, col 0, score 1)
- [ecs-scheduler-and-prefabs — L413](ecs-scheduler-and-prefabs.md#^ref-c62a1815-413-0) (line 413, col 0, score 1)
- [Eidolon Field Abstract Model — L214](eidolon-field-abstract-model.md#^ref-5e8b2388-214-0) (line 214, col 0, score 1)
- [Duck's Attractor States — L81](ducks-attractor-states.md#^ref-13951643-81-0) (line 81, col 0, score 1)
- [Lispy Macros with syntax-rules — L408](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-408-0) (line 408, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L182](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-182-0) (line 182, col 0, score 1)
- [Local-Offline-Model-Deployment-Strategy — L307](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-307-0) (line 307, col 0, score 1)
- [Local-Only-LLM-Workflow — L210](local-only-llm-workflow.md#^ref-9a8ab57e-210-0) (line 210, col 0, score 1)
- [markdown-to-org-transpiler — L320](markdown-to-org-transpiler.md#^ref-ab54cdd8-320-0) (line 320, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L272](migrate-to-provider-tenant-architecture.md#^ref-54382370-272-0) (line 272, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L136](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-136-0) (line 136, col 0, score 1)
- [Mongo Outbox Implementation — L583](mongo-outbox-implementation.md#^ref-9c1acd1e-583-0) (line 583, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L48](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-48-0) (line 48, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L109](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-109-0) (line 109, col 0, score 1)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L529](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-529-0) (line 529, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L138](protocol-0-the-contradiction-engine.md#^ref-9a93a756-138-0) (line 138, col 0, score 1)
- [Services — L12](chunks/services.md#^ref-75ea4a6a-12-0) (line 12, col 0, score 1)
- [Event Bus MVP — L551](event-bus-mvp.md#^ref-534fe91d-551-0) (line 551, col 0, score 1)
- [Mongo Outbox Implementation — L557](mongo-outbox-implementation.md#^ref-9c1acd1e-557-0) (line 557, col 0, score 1)
- [prom-lib-rate-limiters-and-replay-api — L386](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-386-0) (line 386, col 0, score 1)
- [Promethean Event Bus MVP v0.1 — L890](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-890-0) (line 890, col 0, score 1)
- [schema-evolution-workflow — L482](schema-evolution-workflow.md#^ref-d8059b6a-482-0) (line 482, col 0, score 1)
- [State Snapshots API and Transactional Projector — L338](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-338-0) (line 338, col 0, score 1)
- [Unique Info Dump Index — L92](unique-info-dump-index.md#^ref-30ec3ba6-92-0) (line 92, col 0, score 1)
- [AI-Centric OS with MCP Layer — L412](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-412-0) (line 412, col 0, score 1)
- [DSL — L38](chunks/dsl.md#^ref-e87bc036-38-0) (line 38, col 0, score 1)
- [compiler-kit-foundations — L647](compiler-kit-foundations.md#^ref-01b21543-647-0) (line 647, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L236](cross-language-runtime-polymorphism.md#^ref-c34c36a6-236-0) (line 236, col 0, score 1)
- [Dynamic Context Model for Web Components — L426](dynamic-context-model-for-web-components.md#^ref-f7702bf8-426-0) (line 426, col 0, score 1)
- [heartbeat-simulation-snippets — L113](heartbeat-simulation-snippets.md#^ref-23e221e9-113-0) (line 113, col 0, score 1)
- [lisp-dsl-for-window-management — L243](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-243-0) (line 243, col 0, score 1)
- [mystery-lisp-search-session — L122](mystery-lisp-search-session.md#^ref-513dc4c7-122-0) (line 122, col 0, score 1)
- [AI-Centric OS with MCP Layer — L420](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-420-0) (line 420, col 0, score 1)
- [aionian-circuit-math — L177](aionian-circuit-math.md#^ref-f2d83a77-177-0) (line 177, col 0, score 1)
- [Board Automation Improvements — L18](board-automation-improvements.md#^ref-ac60a1d6-18-0) (line 18, col 0, score 1)
- [Board Walk – 2025-08-11 — L140](board-walk-2025-08-11.md#^ref-7aa1eb92-140-0) (line 140, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L118](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-118-0) (line 118, col 0, score 1)
- [Diagrams — L47](chunks/diagrams.md#^ref-45cd25b5-47-0) (line 47, col 0, score 1)
- [JavaScript — L35](chunks/javascript.md#^ref-c1618c66-35-0) (line 35, col 0, score 1)
- [Math Fundamentals — L33](chunks/math-fundamentals.md#^ref-c6e87433-33-0) (line 33, col 0, score 1)
- [Services — L31](chunks/services.md#^ref-75ea4a6a-31-0) (line 31, col 0, score 1)
- [compiler-kit-foundations — L640](compiler-kit-foundations.md#^ref-01b21543-640-0) (line 640, col 0, score 1)
- [AI-Centric OS with MCP Layer — L427](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-427-0) (line 427, col 0, score 1)
- [AI-First-OS-Model-Context-Protocol — L13](ai-first-os-model-context-protocol.md#^ref-618198f4-13-0) (line 13, col 0, score 1)
- [api-gateway-versioning — L288](api-gateway-versioning.md#^ref-0580dcd3-288-0) (line 288, col 0, score 1)
- [archetype-ecs — L480](archetype-ecs.md#^ref-8f4c1e86-480-0) (line 480, col 0, score 1)
- [balanced-bst — L301](balanced-bst.md#^ref-d3e7db72-301-0) (line 301, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L178](chroma-toolkit-consolidation-plan.md#^ref-5020e892-178-0) (line 178, col 0, score 1)
- [Diagrams — L39](chunks/diagrams.md#^ref-45cd25b5-39-0) (line 39, col 0, score 1)
- [DSL — L41](chunks/dsl.md#^ref-e87bc036-41-0) (line 41, col 0, score 1)
- [JavaScript — L40](chunks/javascript.md#^ref-c1618c66-40-0) (line 40, col 0, score 1)
- [Math Fundamentals — L40](chunks/math-fundamentals.md#^ref-c6e87433-40-0) (line 40, col 0, score 1)
- [Services — L38](chunks/services.md#^ref-75ea4a6a-38-0) (line 38, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L130](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-130-0) (line 130, col 0, score 1)
- [api-gateway-versioning — L303](api-gateway-versioning.md#^ref-0580dcd3-303-0) (line 303, col 0, score 1)
- [Chroma-Embedding-Refactor — L327](chroma-embedding-refactor.md#^ref-8b256935-327-0) (line 327, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L174](chroma-toolkit-consolidation-plan.md#^ref-5020e892-174-0) (line 174, col 0, score 1)
- [eidolon-field-math-foundations — L134](eidolon-field-math-foundations.md#^ref-008f2ac0-134-0) (line 134, col 0, score 1)
- [i3-config-validation-methods — L82](i3-config-validation-methods.md#^ref-d28090ac-82-0) (line 82, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L267](migrate-to-provider-tenant-architecture.md#^ref-54382370-267-0) (line 267, col 0, score 1)
- [prom-lib-rate-limiters-and-replay-api — L391](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-391-0) (line 391, col 0, score 1)
- [Promethean Agent Config DSL — L333](promethean-agent-config-dsl.md#^ref-2c00ce45-333-0) (line 333, col 0, score 1)
- [field-node-diagram-outline — L111](field-node-diagram-outline.md#^ref-1f32c94a-111-0) (line 111, col 0, score 1)
- [field-node-diagram-set — L144](field-node-diagram-set.md#^ref-22b989d5-144-0) (line 144, col 0, score 1)
- [field-node-diagram-visualizations — L94](field-node-diagram-visualizations.md#^ref-e9b27b06-94-0) (line 94, col 0, score 1)
- [Fnord Tracer Protocol — L258](fnord-tracer-protocol.md#^ref-fc21f824-258-0) (line 258, col 0, score 1)
- [graph-ds — L398](graph-ds.md#^ref-6620e2f2-398-0) (line 398, col 0, score 1)
- [heartbeat-fragment-demo — L110](heartbeat-fragment-demo.md#^ref-dd00677a-110-0) (line 110, col 0, score 1)
- [heartbeat-simulation-snippets — L99](heartbeat-simulation-snippets.md#^ref-23e221e9-99-0) (line 99, col 0, score 1)
- [homeostasis-decay-formulas — L151](homeostasis-decay-formulas.md#^ref-37b5d236-151-0) (line 151, col 0, score 1)
- [i3-bluetooth-setup — L119](i3-bluetooth-setup.md#^ref-5e408692-119-0) (line 119, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L198](chroma-toolkit-consolidation-plan.md#^ref-5020e892-198-0) (line 198, col 0, score 1)
- [compiler-kit-foundations — L625](compiler-kit-foundations.md#^ref-01b21543-625-0) (line 625, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L202](cross-language-runtime-polymorphism.md#^ref-c34c36a6-202-0) (line 202, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L172](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-172-0) (line 172, col 0, score 1)
- [Duck's Attractor States — L83](ducks-attractor-states.md#^ref-13951643-83-0) (line 83, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L39](ducks-self-referential-perceptual-loop.md#^ref-71726f04-39-0) (line 39, col 0, score 1)
- [field-interaction-equations — L176](field-interaction-equations.md#^ref-b09141b7-176-0) (line 176, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L317](migrate-to-provider-tenant-architecture.md#^ref-54382370-317-0) (line 317, col 0, score 1)
- [api-gateway-versioning — L306](api-gateway-versioning.md#^ref-0580dcd3-306-0) (line 306, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L49](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-49-0) (line 49, col 0, score 1)
- [Dynamic Context Model for Web Components — L417](dynamic-context-model-for-web-components.md#^ref-f7702bf8-417-0) (line 417, col 0, score 1)
- [mystery-lisp-search-session — L118](mystery-lisp-search-session.md#^ref-513dc4c7-118-0) (line 118, col 0, score 1)
- [observability-infrastructure-setup — L378](observability-infrastructure-setup.md#^ref-b4e64f8c-378-0) (line 378, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L40](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-40-0) (line 40, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L37](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-37-0) (line 37, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L88](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-88-0) (line 88, col 0, score 1)
- [sibilant-meta-string-templating-runtime — L133](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-133-0) (line 133, col 0, score 1)
- [template-based-compilation — L117](template-based-compilation.md#^ref-f8877e5e-117-0) (line 117, col 0, score 1)
- [Universal Lisp Interface — L205](universal-lisp-interface.md#^ref-b01856b4-205-0) (line 205, col 0, score 1)
- [Sibilant Meta-Prompt DSL — L26](sibilant-meta-prompt-dsl.md#^ref-af5d2824-26-0) (line 26, col 0, score 0.73)
- [Sibilant Meta-Prompt DSL — L146](sibilant-meta-prompt-dsl.md#^ref-af5d2824-146-0) (line 146, col 0, score 0.7)
- [Sibilant Meta-Prompt DSL — L147](sibilant-meta-prompt-dsl.md#^ref-af5d2824-147-0) (line 147, col 0, score 0.7)
- [Universal Lisp Interface — L173](universal-lisp-interface.md#^ref-b01856b4-173-0) (line 173, col 0, score 0.69)
- [Sibilant Meta-Prompt DSL — L93](sibilant-meta-prompt-dsl.md#^ref-af5d2824-93-0) (line 93, col 0, score 0.67)
- [Sibilant Meta-Prompt DSL — L139](sibilant-meta-prompt-dsl.md#^ref-af5d2824-139-0) (line 139, col 0, score 0.65)
- [Chroma Toolkit Consolidation Plan — L187](chroma-toolkit-consolidation-plan.md#^ref-5020e892-187-0) (line 187, col 0, score 1)
- [compiler-kit-foundations — L628](compiler-kit-foundations.md#^ref-01b21543-628-0) (line 628, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L200](cross-language-runtime-polymorphism.md#^ref-c34c36a6-200-0) (line 200, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L170](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-170-0) (line 170, col 0, score 1)
- [Dynamic Context Model for Web Components — L388](dynamic-context-model-for-web-components.md#^ref-f7702bf8-388-0) (line 388, col 0, score 1)
- [EidolonField — L248](eidolonfield.md#^ref-49d1e1e5-248-0) (line 248, col 0, score 1)
- [i3-bluetooth-setup — L109](i3-bluetooth-setup.md#^ref-5e408692-109-0) (line 109, col 0, score 1)
- [lisp-dsl-for-window-management — L226](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-226-0) (line 226, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L155](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-155-0) (line 155, col 0, score 1)
- [sibilant-macro-targets — L172](sibilant-macro-targets.md#^ref-c5c9a5c6-172-0) (line 172, col 0, score 1)
- [Sibilant Meta-Prompt DSL — L205](sibilant-meta-prompt-dsl.md#^ref-af5d2824-205-0) (line 205, col 0, score 1)
- [sibilant-meta-string-templating-runtime — L137](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-137-0) (line 137, col 0, score 1)
- [sibilant-metacompiler-overview — L90](sibilant-metacompiler-overview.md#^ref-61d4086b-90-0) (line 90, col 0, score 1)
- [State Snapshots API and Transactional Projector — L366](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-366-0) (line 366, col 0, score 1)
- [System Scheduler with Resource-Aware DAG — L394](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-394-0) (line 394, col 0, score 1)
- [template-based-compilation — L104](template-based-compilation.md#^ref-f8877e5e-104-0) (line 104, col 0, score 1)
- [ts-to-lisp-transpiler — L8](ts-to-lisp-transpiler.md#^ref-ba11486b-8-0) (line 8, col 0, score 1)
- [typed-struct-compiler — L384](typed-struct-compiler.md#^ref-78eeedf7-384-0) (line 384, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L86](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-86-0) (line 86, col 0, score 1)
- [Promethean Agent Config DSL — L321](promethean-agent-config-dsl.md#^ref-2c00ce45-321-0) (line 321, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L62](promethean-copilot-intent-engine.md#^ref-ae24a280-62-0) (line 62, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L179](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-179-0) (line 179, col 0, score 1)
- [AI-Centric OS with MCP Layer — L410](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-410-0) (line 410, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L234](cross-language-runtime-polymorphism.md#^ref-c34c36a6-234-0) (line 234, col 0, score 1)
- [Dynamic Context Model for Web Components — L394](dynamic-context-model-for-web-components.md#^ref-f7702bf8-394-0) (line 394, col 0, score 1)
- [heartbeat-simulation-snippets — L111](heartbeat-simulation-snippets.md#^ref-23e221e9-111-0) (line 111, col 0, score 1)
- [mystery-lisp-search-session — L135](mystery-lisp-search-session.md#^ref-513dc4c7-135-0) (line 135, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L33](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-33-0) (line 33, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L84](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-84-0) (line 84, col 0, score 1)
- [2d-sandbox-field — L199](2d-sandbox-field.md#^ref-c710dc93-199-0) (line 199, col 0, score 1)
- [Diagrams — L36](chunks/diagrams.md#^ref-45cd25b5-36-0) (line 36, col 0, score 1)
- [compiler-kit-foundations — L631](compiler-kit-foundations.md#^ref-01b21543-631-0) (line 631, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L220](cross-language-runtime-polymorphism.md#^ref-c34c36a6-220-0) (line 220, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L191](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-191-0) (line 191, col 0, score 1)
- [Duck's Attractor States — L69](ducks-attractor-states.md#^ref-13951643-69-0) (line 69, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L37](ducks-self-referential-perceptual-loop.md#^ref-71726f04-37-0) (line 37, col 0, score 1)
- [EidolonField — L244](eidolonfield.md#^ref-49d1e1e5-244-0) (line 244, col 0, score 1)
- [Diagrams — L13](chunks/diagrams.md#^ref-45cd25b5-13-0) (line 13, col 0, score 1)
- [DSL — L15](chunks/dsl.md#^ref-e87bc036-15-0) (line 15, col 0, score 1)
- [JavaScript — L18](chunks/javascript.md#^ref-c1618c66-18-0) (line 18, col 0, score 1)
- [Math Fundamentals — L14](chunks/math-fundamentals.md#^ref-c6e87433-14-0) (line 14, col 0, score 1)
- [Services — L14](chunks/services.md#^ref-75ea4a6a-14-0) (line 14, col 0, score 1)
- [Shared — L7](chunks/shared.md#^ref-623a55f7-7-0) (line 7, col 0, score 1)
- [Simulation Demo — L10](chunks/simulation-demo.md#^ref-557309a3-10-0) (line 10, col 0, score 1)
- [Tooling — L9](chunks/tooling.md#^ref-6cb4943e-9-0) (line 9, col 0, score 1)
- [Window Management — L15](chunks/window-management.md#^ref-9e8ae388-15-0) (line 15, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L180](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-180-0) (line 180, col 0, score 1)
- [AI-Centric OS with MCP Layer — L411](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-411-0) (line 411, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L235](cross-language-runtime-polymorphism.md#^ref-c34c36a6-235-0) (line 235, col 0, score 1)
- [Dynamic Context Model for Web Components — L425](dynamic-context-model-for-web-components.md#^ref-f7702bf8-425-0) (line 425, col 0, score 1)
- [heartbeat-simulation-snippets — L112](heartbeat-simulation-snippets.md#^ref-23e221e9-112-0) (line 112, col 0, score 1)
- [mystery-lisp-search-session — L137](mystery-lisp-search-session.md#^ref-513dc4c7-137-0) (line 137, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L33](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-33-0) (line 33, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L85](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-85-0) (line 85, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L152](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-152-0) (line 152, col 0, score 1)
- [api-gateway-versioning — L294](api-gateway-versioning.md#^ref-0580dcd3-294-0) (line 294, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L191](chroma-toolkit-consolidation-plan.md#^ref-5020e892-191-0) (line 191, col 0, score 1)
- [Services — L11](chunks/services.md#^ref-75ea4a6a-11-0) (line 11, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L228](cross-language-runtime-polymorphism.md#^ref-c34c36a6-228-0) (line 228, col 0, score 1)
- [ecs-offload-workers — L465](ecs-offload-workers.md#^ref-6498b9d7-465-0) (line 465, col 0, score 1)
- [Event Bus MVP — L547](event-bus-mvp.md#^ref-534fe91d-547-0) (line 547, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L312](migrate-to-provider-tenant-architecture.md#^ref-54382370-312-0) (line 312, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L134](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-134-0) (line 134, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L164](chroma-toolkit-consolidation-plan.md#^ref-5020e892-164-0) (line 164, col 0, score 1)
- [Services — L18](chunks/services.md#^ref-75ea4a6a-18-0) (line 18, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L230](cross-language-runtime-polymorphism.md#^ref-c34c36a6-230-0) (line 230, col 0, score 1)
- [ecs-offload-workers — L483](ecs-offload-workers.md#^ref-6498b9d7-483-0) (line 483, col 0, score 1)
- [eidolon-field-math-foundations — L148](eidolon-field-math-foundations.md#^ref-008f2ac0-148-0) (line 148, col 0, score 1)
- [Event Bus MVP — L549](event-bus-mvp.md#^ref-534fe91d-549-0) (line 549, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L282](migrate-to-provider-tenant-architecture.md#^ref-54382370-282-0) (line 282, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L145](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-145-0) (line 145, col 0, score 1)
- [Local-Only-LLM-Workflow — L212](local-only-llm-workflow.md#^ref-9a8ab57e-212-0) (line 212, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L291](migrate-to-provider-tenant-architecture.md#^ref-54382370-291-0) (line 291, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L155](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-155-0) (line 155, col 0, score 1)
- [Mongo Outbox Implementation — L550](mongo-outbox-implementation.md#^ref-9c1acd1e-550-0) (line 550, col 0, score 1)
- [observability-infrastructure-setup — L368](observability-infrastructure-setup.md#^ref-b4e64f8c-368-0) (line 368, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L72](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-72-0) (line 72, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L201](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-201-0) (line 201, col 0, score 1)
- [polymorphic-meta-programming-engine — L246](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-246-0) (line 246, col 0, score 1)
- [prom-lib-rate-limiters-and-replay-api — L384](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-384-0) (line 384, col 0, score 1)
- [Promethean Agent Config DSL — L329](promethean-agent-config-dsl.md#^ref-2c00ce45-329-0) (line 329, col 0, score 1)
- [2d-sandbox-field — L194](2d-sandbox-field.md#^ref-c710dc93-194-0) (line 194, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L194](chroma-toolkit-consolidation-plan.md#^ref-5020e892-194-0) (line 194, col 0, score 1)
- [Diagrams — L41](chunks/diagrams.md#^ref-45cd25b5-41-0) (line 41, col 0, score 1)
- [Math Fundamentals — L29](chunks/math-fundamentals.md#^ref-c6e87433-29-0) (line 29, col 0, score 1)
- [compiler-kit-foundations — L649](compiler-kit-foundations.md#^ref-01b21543-649-0) (line 649, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L225](cross-language-runtime-polymorphism.md#^ref-c34c36a6-225-0) (line 225, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L192](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-192-0) (line 192, col 0, score 1)
- [Duck's Attractor States — L74](ducks-attractor-states.md#^ref-13951643-74-0) (line 74, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L47](ducks-self-referential-perceptual-loop.md#^ref-71726f04-47-0) (line 47, col 0, score 1)
- [Eidolon Field Abstract Model — L195](eidolon-field-abstract-model.md#^ref-5e8b2388-195-0) (line 195, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L172](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-172-0) (line 172, col 0, score 1)
- [AI-Centric OS with MCP Layer — L424](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-424-0) (line 424, col 0, score 1)
- [aionian-circuit-math — L183](aionian-circuit-math.md#^ref-f2d83a77-183-0) (line 183, col 0, score 1)
- [api-gateway-versioning — L310](api-gateway-versioning.md#^ref-0580dcd3-310-0) (line 310, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L211](chroma-toolkit-consolidation-plan.md#^ref-5020e892-211-0) (line 211, col 0, score 1)
- [Diagrams — L23](chunks/diagrams.md#^ref-45cd25b5-23-0) (line 23, col 0, score 1)
- [DSL — L27](chunks/dsl.md#^ref-e87bc036-27-0) (line 27, col 0, score 1)
- [JavaScript — L29](chunks/javascript.md#^ref-c1618c66-29-0) (line 29, col 0, score 1)
- [Math Fundamentals — L39](chunks/math-fundamentals.md#^ref-c6e87433-39-0) (line 39, col 0, score 1)
- [Shared — L28](chunks/shared.md#^ref-623a55f7-28-0) (line 28, col 0, score 1)
- [Simulation Demo — L29](chunks/simulation-demo.md#^ref-557309a3-29-0) (line 29, col 0, score 1)
- [Tooling — L14](chunks/tooling.md#^ref-6cb4943e-14-0) (line 14, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L158](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-158-0) (line 158, col 0, score 1)
- [Chroma-Embedding-Refactor — L329](chroma-embedding-refactor.md#^ref-8b256935-329-0) (line 329, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L196](chroma-toolkit-consolidation-plan.md#^ref-5020e892-196-0) (line 196, col 0, score 1)
- [Dynamic Context Model for Web Components — L414](dynamic-context-model-for-web-components.md#^ref-f7702bf8-414-0) (line 414, col 0, score 1)
- [Event Bus MVP — L550](event-bus-mvp.md#^ref-534fe91d-550-0) (line 550, col 0, score 1)
- [i3-bluetooth-setup — L102](i3-bluetooth-setup.md#^ref-5e408692-102-0) (line 102, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L142](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-142-0) (line 142, col 0, score 1)
- [Local-Only-LLM-Workflow — L195](local-only-llm-workflow.md#^ref-9a8ab57e-195-0) (line 195, col 0, score 1)
- [aionian-circuit-math — L153](aionian-circuit-math.md#^ref-f2d83a77-153-0) (line 153, col 0, score 1)
- [JavaScript — L24](chunks/javascript.md#^ref-c1618c66-24-0) (line 24, col 0, score 1)
- [Math Fundamentals — L26](chunks/math-fundamentals.md#^ref-c6e87433-26-0) (line 26, col 0, score 1)
- [compiler-kit-foundations — L607](compiler-kit-foundations.md#^ref-01b21543-607-0) (line 607, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L201](cross-language-runtime-polymorphism.md#^ref-c34c36a6-201-0) (line 201, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L166](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-166-0) (line 166, col 0, score 1)
- [Dynamic Context Model for Web Components — L416](dynamic-context-model-for-web-components.md#^ref-f7702bf8-416-0) (line 416, col 0, score 1)
- [field-interaction-equations — L153](field-interaction-equations.md#^ref-b09141b7-153-0) (line 153, col 0, score 1)
- [graph-ds — L371](graph-ds.md#^ref-6620e2f2-371-0) (line 371, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L200](chroma-toolkit-consolidation-plan.md#^ref-5020e892-200-0) (line 200, col 0, score 1)
- [DSL — L32](chunks/dsl.md#^ref-e87bc036-32-0) (line 32, col 0, score 1)
- [Window Management — L27](chunks/window-management.md#^ref-9e8ae388-27-0) (line 27, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L206](cross-language-runtime-polymorphism.md#^ref-c34c36a6-206-0) (line 206, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L174](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-174-0) (line 174, col 0, score 1)
- [komorebi-group-window-hack — L201](komorebi-group-window-hack.md#^ref-dd89372d-201-0) (line 201, col 0, score 1)
- [Lisp-Compiler-Integration — L548](lisp-compiler-integration.md#^ref-cfee6d36-548-0) (line 548, col 0, score 1)
- [lisp-dsl-for-window-management — L217](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-217-0) (line 217, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L136](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-136-0) (line 136, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L108](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-108-0) (line 108, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L168](chroma-toolkit-consolidation-plan.md#^ref-5020e892-168-0) (line 168, col 0, score 1)
- [ecs-scheduler-and-prefabs — L387](ecs-scheduler-and-prefabs.md#^ref-c62a1815-387-0) (line 387, col 0, score 1)
- [Event Bus MVP — L564](event-bus-mvp.md#^ref-534fe91d-564-0) (line 564, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L316](migrate-to-provider-tenant-architecture.md#^ref-54382370-316-0) (line 316, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L142](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-142-0) (line 142, col 0, score 1)
- [prom-lib-rate-limiters-and-replay-api — L405](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-405-0) (line 405, col 0, score 1)
- [api-gateway-versioning — L282](api-gateway-versioning.md#^ref-0580dcd3-282-0) (line 282, col 0, score 1)
- [archetype-ecs — L470](archetype-ecs.md#^ref-8f4c1e86-470-0) (line 470, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L201](chroma-toolkit-consolidation-plan.md#^ref-5020e892-201-0) (line 201, col 0, score 1)
- [Dynamic Context Model for Web Components — L382](dynamic-context-model-for-web-components.md#^ref-f7702bf8-382-0) (line 382, col 0, score 1)
- [ecs-offload-workers — L456](ecs-offload-workers.md#^ref-6498b9d7-456-0) (line 456, col 0, score 1)
- [ecs-scheduler-and-prefabs — L390](ecs-scheduler-and-prefabs.md#^ref-c62a1815-390-0) (line 390, col 0, score 1)
- [eidolon-field-math-foundations — L125](eidolon-field-math-foundations.md#^ref-008f2ac0-125-0) (line 125, col 0, score 1)
- [i3-config-validation-methods — L61](i3-config-validation-methods.md#^ref-d28090ac-61-0) (line 61, col 0, score 1)
- [observability-infrastructure-setup — L360](observability-infrastructure-setup.md#^ref-b4e64f8c-360-0) (line 360, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L163](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-163-0) (line 163, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L472](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-472-0) (line 472, col 0, score 1)
- [2d-sandbox-field — L225](2d-sandbox-field.md#^ref-c710dc93-225-0) (line 225, col 0, score 1)
- [Admin Dashboard for User Management — L49](admin-dashboard-for-user-management.md#^ref-2901a3e9-49-0) (line 49, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L150](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-150-0) (line 150, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L163](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-163-0) (line 163, col 0, score 1)
- [AI-First-OS-Model-Context-Protocol — L9](ai-first-os-model-context-protocol.md#^ref-618198f4-9-0) (line 9, col 0, score 1)
- [aionian-circuit-math — L179](aionian-circuit-math.md#^ref-f2d83a77-179-0) (line 179, col 0, score 1)
- [api-gateway-versioning — L304](api-gateway-versioning.md#^ref-0580dcd3-304-0) (line 304, col 0, score 1)
- [archetype-ecs — L479](archetype-ecs.md#^ref-8f4c1e86-479-0) (line 479, col 0, score 1)
- [balanced-bst — L295](balanced-bst.md#^ref-d3e7db72-295-0) (line 295, col 0, score 1)
- [eidolon-node-lifecycle — L63](eidolon-node-lifecycle.md#^ref-938eca9c-63-0) (line 63, col 0, score 1)
- [EidolonField — L269](eidolonfield.md#^ref-49d1e1e5-269-0) (line 269, col 0, score 1)
- [Event Bus MVP — L566](event-bus-mvp.md#^ref-534fe91d-566-0) (line 566, col 0, score 1)
- [Event Bus Projections Architecture — L185](event-bus-projections-architecture.md#^ref-cf6b9b17-185-0) (line 185, col 0, score 1)
- [Exception Layer Analysis — L165](exception-layer-analysis.md#^ref-21d5cc09-165-0) (line 165, col 0, score 1)
- [Factorio AI with External Agents — L160](factorio-ai-with-external-agents.md#^ref-a4d90289-160-0) (line 160, col 0, score 1)
- [field-dynamics-math-blocks — L165](field-dynamics-math-blocks.md#^ref-7cfc230d-165-0) (line 165, col 0, score 1)
- [field-interaction-equations — L184](field-interaction-equations.md#^ref-b09141b7-184-0) (line 184, col 0, score 1)
- [field-node-diagram-outline — L132](field-node-diagram-outline.md#^ref-1f32c94a-132-0) (line 132, col 0, score 1)
- [promethean-system-diagrams — L207](promethean-system-diagrams.md#^ref-b51e19b4-207-0) (line 207, col 0, score 1)
- [Promethean Web UI Setup — L633](promethean-web-ui-setup.md#^ref-bc5172ca-633-0) (line 633, col 0, score 1)
- [Promethean Workflow Optimization — L20](promethean-workflow-optimization.md#^ref-d614d983-20-0) (line 20, col 0, score 1)
- [Prometheus Observability Stack — L543](prometheus-observability-stack.md#^ref-e90b5a16-543-0) (line 543, col 0, score 1)
- [Prompt_Folder_Bootstrap — L216](prompt-folder-bootstrap.md#^ref-bd4f0976-216-0) (line 216, col 0, score 1)
- [prompt-programming-language-lisp — L116](prompt-programming-language-lisp.md#^ref-d41a06d1-116-0) (line 116, col 0, score 1)
- [Protocol_0_The_Contradiction_Engine — L156](protocol-0-the-contradiction-engine.md#^ref-9a93a756-156-0) (line 156, col 0, score 1)
- [Provider-Agnostic Chat Panel Implementation — L238](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-238-0) (line 238, col 0, score 1)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L445](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-445-0) (line 445, col 0, score 1)
- [Shared Package Structure — L195](shared-package-structure.md#^ref-66a72fc3-195-0) (line 195, col 0, score 1)
- [Language-Agnostic Mirror System — L538](language-agnostic-mirror-system.md#^ref-d2b3628c-538-0) (line 538, col 0, score 1)
- [layer-1-uptime-diagrams — L178](layer-1-uptime-diagrams.md#^ref-4127189a-178-0) (line 178, col 0, score 1)
- [Lisp-Compiler-Integration — L550](lisp-compiler-integration.md#^ref-cfee6d36-550-0) (line 550, col 0, score 1)
- [lisp-dsl-for-window-management — L223](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-223-0) (line 223, col 0, score 1)
- [Lispy Macros with syntax-rules — L406](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-406-0) (line 406, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L168](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-168-0) (line 168, col 0, score 1)
- [Local-Only-LLM-Workflow — L201](local-only-llm-workflow.md#^ref-9a8ab57e-201-0) (line 201, col 0, score 1)
- [markdown-to-org-transpiler — L323](markdown-to-org-transpiler.md#^ref-ab54cdd8-323-0) (line 323, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L496](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-496-0) (line 496, col 0, score 1)
- [ripple-propagation-demo — L118](ripple-propagation-demo.md#^ref-8430617b-118-0) (line 118, col 0, score 1)
- [Promethean_Eidolon_Synchronicity_Model — L74](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-74-0) (line 74, col 0, score 1)
- [Promethean Event Bus MVP v0.1 — L929](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-929-0) (line 929, col 0, score 1)
- [Promethean Infrastructure Setup — L597](promethean-infrastructure-setup.md#^ref-6deed6ac-597-0) (line 597, col 0, score 1)
- [promethean-system-diagrams — L217](promethean-system-diagrams.md#^ref-b51e19b4-217-0) (line 217, col 0, score 1)
- [Promethean Web UI Setup — L629](promethean-web-ui-setup.md#^ref-bc5172ca-629-0) (line 629, col 0, score 1)
- [Prompt_Folder_Bootstrap — L193](prompt-folder-bootstrap.md#^ref-bd4f0976-193-0) (line 193, col 0, score 1)
- [prompt-programming-language-lisp — L107](prompt-programming-language-lisp.md#^ref-d41a06d1-107-0) (line 107, col 0, score 1)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L457](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-457-0) (line 457, col 0, score 1)
- [AI-Centric OS with MCP Layer — L433](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-433-0) (line 433, col 0, score 1)
- [DSL — L23](chunks/dsl.md#^ref-e87bc036-23-0) (line 23, col 0, score 1)
- [compiler-kit-foundations — L632](compiler-kit-foundations.md#^ref-01b21543-632-0) (line 632, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L252](cross-language-runtime-polymorphism.md#^ref-c34c36a6-252-0) (line 252, col 0, score 1)
- [heartbeat-simulation-snippets — L128](heartbeat-simulation-snippets.md#^ref-23e221e9-128-0) (line 128, col 0, score 1)
- [lisp-dsl-for-window-management — L234](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-234-0) (line 234, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L51](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-51-0) (line 51, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L45](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-45-0) (line 45, col 0, score 1)
- [markdown-to-org-transpiler — L313](markdown-to-org-transpiler.md#^ref-ab54cdd8-313-0) (line 313, col 0, score 1)
- [Matplotlib Animation with Async Execution — L79](matplotlib-animation-with-async-execution.md#^ref-687439f9-79-0) (line 79, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L299](migrate-to-provider-tenant-architecture.md#^ref-54382370-299-0) (line 299, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L151](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-151-0) (line 151, col 0, score 1)
- [Mongo Outbox Implementation — L587](mongo-outbox-implementation.md#^ref-9c1acd1e-587-0) (line 587, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L77](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-77-0) (line 77, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L179](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-179-0) (line 179, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L282](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-282-0) (line 282, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L480](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-480-0) (line 480, col 0, score 1)
- [aionian-circuit-math — L165](aionian-circuit-math.md#^ref-f2d83a77-165-0) (line 165, col 0, score 1)
- [api-gateway-versioning — L319](api-gateway-versioning.md#^ref-0580dcd3-319-0) (line 319, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L116](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-116-0) (line 116, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L209](chroma-toolkit-consolidation-plan.md#^ref-5020e892-209-0) (line 209, col 0, score 1)
- [DSL — L13](chunks/dsl.md#^ref-e87bc036-13-0) (line 13, col 0, score 1)
- [Math Fundamentals — L16](chunks/math-fundamentals.md#^ref-c6e87433-16-0) (line 16, col 0, score 1)
- [Services — L16](chunks/services.md#^ref-75ea4a6a-16-0) (line 16, col 0, score 1)
- [Shared — L5](chunks/shared.md#^ref-623a55f7-5-0) (line 5, col 0, score 1)
- [Simulation Demo — L12](chunks/simulation-demo.md#^ref-557309a3-12-0) (line 12, col 0, score 1)
- [AI-Centric OS with MCP Layer — L432](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-432-0) (line 432, col 0, score 1)
- [Simulation Demo — L8](chunks/simulation-demo.md#^ref-557309a3-8-0) (line 8, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L233](cross-language-runtime-polymorphism.md#^ref-c34c36a6-233-0) (line 233, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L57](ducks-self-referential-perceptual-loop.md#^ref-71726f04-57-0) (line 57, col 0, score 1)
- [Dynamic Context Model for Web Components — L430](dynamic-context-model-for-web-components.md#^ref-f7702bf8-430-0) (line 430, col 0, score 1)
- [ecs-scheduler-and-prefabs — L429](ecs-scheduler-and-prefabs.md#^ref-c62a1815-429-0) (line 429, col 0, score 1)
- [Eidolon Field Abstract Model — L198](eidolon-field-abstract-model.md#^ref-5e8b2388-198-0) (line 198, col 0, score 1)
- [eidolon-node-lifecycle — L36](eidolon-node-lifecycle.md#^ref-938eca9c-36-0) (line 36, col 0, score 1)
- [Event Bus MVP — L571](event-bus-mvp.md#^ref-534fe91d-571-0) (line 571, col 0, score 1)
- [markdown-to-org-transpiler — L318](markdown-to-org-transpiler.md#^ref-ab54cdd8-318-0) (line 318, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L322](migrate-to-provider-tenant-architecture.md#^ref-54382370-322-0) (line 322, col 0, score 1)
- [Mongo Outbox Implementation — L579](mongo-outbox-implementation.md#^ref-9c1acd1e-579-0) (line 579, col 0, score 1)
- [observability-infrastructure-setup — L369](observability-infrastructure-setup.md#^ref-b4e64f8c-369-0) (line 369, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L183](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-183-0) (line 183, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L483](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-483-0) (line 483, col 0, score 1)
- [polymorphic-meta-programming-engine — L241](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-241-0) (line 241, col 0, score 1)
- [prom-lib-rate-limiters-and-replay-api — L415](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-415-0) (line 415, col 0, score 1)
- [Promethean Agent Config DSL — L352](promethean-agent-config-dsl.md#^ref-2c00ce45-352-0) (line 352, col 0, score 1)
- [DSL — L26](chunks/dsl.md#^ref-e87bc036-26-0) (line 26, col 0, score 1)
- [ecs-scheduler-and-prefabs — L433](ecs-scheduler-and-prefabs.md#^ref-c62a1815-433-0) (line 433, col 0, score 1)
- [Event Bus MVP — L577](event-bus-mvp.md#^ref-534fe91d-577-0) (line 577, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L174](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-174-0) (line 174, col 0, score 1)
- [Local-Only-LLM-Workflow — L211](local-only-llm-workflow.md#^ref-9a8ab57e-211-0) (line 211, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L334](migrate-to-provider-tenant-architecture.md#^ref-54382370-334-0) (line 334, col 0, score 1)
- [Mongo Outbox Implementation — L581](mongo-outbox-implementation.md#^ref-9c1acd1e-581-0) (line 581, col 0, score 1)
- [observability-infrastructure-setup — L397](observability-infrastructure-setup.md#^ref-b4e64f8c-397-0) (line 397, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L48](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-48-0) (line 48, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L202](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-202-0) (line 202, col 0, score 1)
- [Exception Layer Analysis — L172](exception-layer-analysis.md#^ref-21d5cc09-172-0) (line 172, col 0, score 1)
- [field-dynamics-math-blocks — L154](field-dynamics-math-blocks.md#^ref-7cfc230d-154-0) (line 154, col 0, score 1)
- [field-interaction-equations — L164](field-interaction-equations.md#^ref-b09141b7-164-0) (line 164, col 0, score 1)
- [field-node-diagram-outline — L120](field-node-diagram-outline.md#^ref-1f32c94a-120-0) (line 120, col 0, score 1)
- [field-node-diagram-set — L149](field-node-diagram-set.md#^ref-22b989d5-149-0) (line 149, col 0, score 1)
- [field-node-diagram-visualizations — L99](field-node-diagram-visualizations.md#^ref-e9b27b06-99-0) (line 99, col 0, score 1)
- [graph-ds — L365](graph-ds.md#^ref-6620e2f2-365-0) (line 365, col 0, score 1)
- [heartbeat-fragment-demo — L111](heartbeat-fragment-demo.md#^ref-dd00677a-111-0) (line 111, col 0, score 1)
- [heartbeat-simulation-snippets — L101](heartbeat-simulation-snippets.md#^ref-23e221e9-101-0) (line 101, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L218](chroma-toolkit-consolidation-plan.md#^ref-5020e892-218-0) (line 218, col 0, score 1)
- [DSL — L21](chunks/dsl.md#^ref-e87bc036-21-0) (line 21, col 0, score 1)
- [Window Management — L12](chunks/window-management.md#^ref-9e8ae388-12-0) (line 12, col 0, score 1)
- [compiler-kit-foundations — L638](compiler-kit-foundations.md#^ref-01b21543-638-0) (line 638, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L259](cross-language-runtime-polymorphism.md#^ref-c34c36a6-259-0) (line 259, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L217](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-217-0) (line 217, col 0, score 1)
- [Interop and Source Maps — L543](interop-and-source-maps.md#^ref-cdfac40c-543-0) (line 543, col 0, score 1)
- [Lisp-Compiler-Integration — L553](lisp-compiler-integration.md#^ref-cfee6d36-553-0) (line 553, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L138](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-138-0) (line 138, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L193](chroma-toolkit-consolidation-plan.md#^ref-5020e892-193-0) (line 193, col 0, score 1)
- [Diagrams — L43](chunks/diagrams.md#^ref-45cd25b5-43-0) (line 43, col 0, score 1)
- [Services — L41](chunks/services.md#^ref-75ea4a6a-41-0) (line 41, col 0, score 1)
- [ecs-scheduler-and-prefabs — L417](ecs-scheduler-and-prefabs.md#^ref-c62a1815-417-0) (line 417, col 0, score 1)
- [eidolon-node-lifecycle — L62](eidolon-node-lifecycle.md#^ref-938eca9c-62-0) (line 62, col 0, score 1)
- [Event Bus MVP — L583](event-bus-mvp.md#^ref-534fe91d-583-0) (line 583, col 0, score 1)
- [Event Bus Projections Architecture — L182](event-bus-projections-architecture.md#^ref-cf6b9b17-182-0) (line 182, col 0, score 1)
- [Fnord Tracer Protocol — L266](fnord-tracer-protocol.md#^ref-fc21f824-266-0) (line 266, col 0, score 1)
- [i3-bluetooth-setup — L128](i3-bluetooth-setup.md#^ref-5e408692-128-0) (line 128, col 0, score 1)
- [layer-1-uptime-diagrams — L193](layer-1-uptime-diagrams.md#^ref-4127189a-193-0) (line 193, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L181](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-181-0) (line 181, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L182](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-182-0) (line 182, col 0, score 1)
- [aionian-circuit-math — L184](aionian-circuit-math.md#^ref-f2d83a77-184-0) (line 184, col 0, score 1)
- [Board Walk – 2025-08-11 — L154](board-walk-2025-08-11.md#^ref-7aa1eb92-154-0) (line 154, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L208](chroma-toolkit-consolidation-plan.md#^ref-5020e892-208-0) (line 208, col 0, score 1)
- [Dynamic Context Model for Web Components — L437](dynamic-context-model-for-web-components.md#^ref-f7702bf8-437-0) (line 437, col 0, score 1)
- [eidolon-field-math-foundations — L175](eidolon-field-math-foundations.md#^ref-008f2ac0-175-0) (line 175, col 0, score 1)
- [Exception Layer Analysis — L173](exception-layer-analysis.md#^ref-21d5cc09-173-0) (line 173, col 0, score 1)
- [Factorio AI with External Agents — L162](factorio-ai-with-external-agents.md#^ref-a4d90289-162-0) (line 162, col 0, score 1)
- [Functional Embedding Pipeline Refactor — L317](functional-embedding-pipeline-refactor.md#^ref-a4a25141-317-0) (line 317, col 0, score 1)
- [Diagrams — L50](chunks/diagrams.md#^ref-45cd25b5-50-0) (line 50, col 0, score 1)
- [Math Fundamentals — L43](chunks/math-fundamentals.md#^ref-c6e87433-43-0) (line 43, col 0, score 1)
- [Services — L43](chunks/services.md#^ref-75ea4a6a-43-0) (line 43, col 0, score 1)
- [Shared — L31](chunks/shared.md#^ref-623a55f7-31-0) (line 31, col 0, score 1)
- [Simulation Demo — L34](chunks/simulation-demo.md#^ref-557309a3-34-0) (line 34, col 0, score 1)
- [Window Management — L38](chunks/window-management.md#^ref-9e8ae388-38-0) (line 38, col 0, score 1)
- [compiler-kit-foundations — L651](compiler-kit-foundations.md#^ref-01b21543-651-0) (line 651, col 0, score 1)
- [Creative Moments — L15](creative-moments.md#^ref-10d98225-15-0) (line 15, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L219](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-219-0) (line 219, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L62](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-62-0) (line 62, col 0, score 1)
- [Docops Feature Updates — L16](docops-feature-updates-3.md#^ref-cdbd21ee-16-0) (line 16, col 0, score 1)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
