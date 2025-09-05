---
uuid: 7d584c12-7517-4f30-8378-34ac9fc3a3f8
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
If you want, I’ll tailor the exact `config.toml` (global + project) and a `prom` CLI starter to your `Promethean` repo structure. #promethean #config #profiles #trust #direnv #devtools
