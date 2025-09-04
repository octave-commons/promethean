---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Agent contract definition"
conversation_id: 68adda53-6fe4-832a-9ed8-2240d9478818
create_time: 08/26/2025 at 11:01 AM
update_time: 08/26/2025 at 12:48 PM
---

# Title: Agent contract definition

Created: 08/26/2025 at 11:01 AM
Last Updated: 08/26/2025 at 12:48 PM
Chat URL: https://chat.openai.com/c/68adda53-6fe4-832a-9ed8-2240d9478818


>[!nexus_user] **User** - 08/26/2025 at 11:01 AM
> We've been talking about agents, what they are, how to define them. Ideally they are made up of config files that tell a generic like `prom run agent` type thing to use, and it grabs the resources, spins up the tasks, etc that it needs to make that agent do it's job.
<!-- UID: 659e3581-8edf-4867-bd37-d79d818f256f -->




>[!nexus_agent] **Assistant** - 08/26/2025 at 11:01 AM
> Right — what you’re circling around is an **“agent contract”**: a declarative way to define what an agent *is* (its purpose, resources, and services), separate from how it’s run. Then the runtime (`prom run agent`) just interprets the contract and orchestrates accordingly. 
> 
> I think of it like a mix of:
> 
> - **K8s manifests / docker-compose** → declarative service orchestration 
> - **Procfile / PM2 ecosystem** → process definitions for runtime 
> - **Agent metadata (AGENTS.md)** → purpose, capabilities, persona 
> 
> If we break it down, an agent config could have at least these sections:
> 
> ### 1. **Identity & Metadata**
> - Name / ID 
> - Description (what’s its role, “why it exists”) 
> - Tags (like `#discord`, `#indexer`, `#voice`) 
> - Owner / maintainer 
> 
> ### 2. **Runtime Requirements**
> - Services to spin up (`discord_indexer`, `voice`, `cephalon`) 
> - Shared libraries to mount (`@shared/ts/dist/...`, `@shared/py/...`) 
> - Environment variables / secrets (scoped per agent) 
> - Resource constraints (GPU yes/no, memory, concurrency) 
> 
> ### 3. **Tenancies / Integrations**
> - Discord bot token, Twitch key, etc 
> - Optional: multiple tenancy support (an agent could have its own Discord + Reddit + Twitch contexts) 
> 
> ### 4. **Behavior Contract**
> - Entry point (how tasks/events flow in) 
> - Default prompts or state templates (`.prompt.sibilant`, `eidolon config`) 
> - Permissions layer (what the agent is allowed to touch: file system, embeddings, outbound APIs) 
> 
> ### 5. **Lifecycle Hooks**
> - Init (run migrations, preload embeddings, hydrate state) 
> - Tick/loop (recurring tasks, heartbeats) 
> - Shutdown (cleanup) 
> 
> ---
> 
> That way `prom run agent duck` just: 
> 1. Reads `agents/duck/config.yml` (or `.json`, `.sibilant`, etc). 
> 2. Resolves services → spins them up from `services/` with the right env. 
> 3. Loads prompts, fields, memory state. 
> 4. Mounts external tenancies (discord bot, twitch). 
> 5. Starts main loop. 
> 
> ---
> 
> Question for you: 
> 👉 do you want **one universal agent config schema** (so every agent has the same fields, just filled differently), or **layered schemas** (core contract + service-specific overlays, like `discord.yml` or `twitch.yml` that get imported into the main agent file)? 
> 
> That choice will shape whether we treat it as one simple config per agent, or as composable building blocks.
<!-- UID: 65f6cae3-49b5-44ab-adb0-02873e2d6af3 -->

---




>[!nexus_user] **User** - 08/26/2025 at 11:03 AM
> I'm thinking composable building blocks. And screw yaml. Signifigant whitespace in a config file can eat my ass. We talk about it as an s-expression based DSL config system.
<!-- UID: 1e391642-2c85-4d0b-89be-fb06cd5018bc -->




>[!nexus_agent] **Assistant** - 08/26/2025 at 11:05 AM
> heck yes — composable s-expr blocks it is. I just dropped a first-cut spec + examples into a canvas called **“Promethean Agent Config DSL (S-Expr) — Draft v1.”** It includes:
> 
> - A tiny core grammar: `(agent ...)`, `(block ...)`, `(use ... :with {...})`, `(env ...)`, `(perm ...)`, `(topology ...)`, `(hooks ...)`.
> - Three reusable blocks: `discord.bot/v1`, `voice.pipeline/v1`, `cephalon.client/v1`.
> - Parameter substitution (`:$param`), schema/validation stubs, and codegen targets (PM2 ecosystem, `.env`, `permissions.json`, `topology.json`).
> - A mermaid diagram of the compile/run path.
> - Example agents (`duck`, `timmy`) built from blocks.
> 
> If this shape feels right, I’ll carve an MVP plan next:
> 
> 1) **Reader**: minimal s-expr → JS AST (Sibilant-friendly). 
> 2) **Spec/validation**: precise error paths (no silent fails). 
> 3) **Block registry + resolver**: parameters, secrets, imports. 
> 4) **Codegen (PM2 + env + permissions + topology)**. 
> 5) **Runner**: `prom run agent :id` enforcing permissions & wiring WS.
> 
> Want me to wire the first parser + codegen scaffold next, or tweak the forms/keywords before we lock the syntax?
<!-- UID: 3f398869-703f-45b7-8841-9b8855c3d74a -->

---




>[!nexus_user] **User** - 08/26/2025 at 11:13 AM
> Let's go, send it. Generate the parser. we already have code that parses s-expressions
<!-- UID: 2d097ab2-2f71-44ac-9d7a-8b5aab0e4c1f -->




>[!nexus_agent] **Assistant** - 08/26/2025 at 11:21 AM
> Boom — parser + resolver + codegen scaffold is ready.
> 
> [Download the TS scaffold](https://chat.openai.com/c/68adda53-6fe4-832a-9ed8-2240d9478818) *(visit original conversation to download)*
> 
> What’s inside (repo-ready, no path aliases, ES modules):
> 
> - `src/types/sexpr.ts` — tolerant S-expr node defs + `coerceNode(...)` to adapt your existing reader’s AST.
> - `src/types/dsl.ts` — typed forms: Agent, Block, Env, Perms, Topology, Hooks, etc.
> - `src/parser/index.ts` — parses `(agent ...)`, `(block ...)`, `(use ...)`, `(env ...)`, `(perm ...)`, `(topology ...)`, `(hooks ...)`, `(metrics ...)`.
> - `src/parser/spec.ts` — tiny path-aware validators (`VError`) for clear errors.
> - `src/resolver.ts` — composes agent + blocks, param substitution for `:$param`, merges env/perms/topology.
> - `src/codegen/{pm2,env,permissions}.ts` — emit `ecosystem.config.mjs`, `.env`, `permissions.json`.
> - `src/index.ts` — `buildAgentArtifacts(ast)` → { agent, artifacts }.
> - `src/devtest.ts` — a quick dev harness using a minimal array-style AST to show it working.
> - `examples/duck.sx` — tiny sample agent form.
> - `package.json`, `tsconfig.json`, `README.md`.
> 
> How to use with your existing s-expr reader:
> 
> ```ts
> import { buildAgentArtifacts } from "./src/index.js";
> import { coerceNode } from "./src/types/sexpr.js";
> 
> // 1) read your .sx with your reader (already have this)
> const astFromReader = myReader.readFile("agents/duck/agent.sx");
> 
> // 2) adapt to our tolerant SNode
> const node = coerceNode(astFromReader);
> 
> // 3) build artifacts
> const { agent, artifacts } = buildAgentArtifacts(node);
> 
> // 4) write artifacts wherever you like
> // artifacts.pm2, artifacts.env, artifacts.permissions
> ```
> 
> Notes:
> - It doesn’t replace your s-expr reader — it **adapts** to it. `coerceNode` handles common AST shapes (plain arrays/strings, `{type:'list', value:[...]}` etc.).
> - `(secret :ns/key)` becomes `__SECRET__:ns/key` placeholder in `.env`; swap in your real secret resolver during run.
> - Parameter substitution uses `:$param` in block topology args (as in the canvas draft).
> 
> If you want this wired into `prom run agent`, point that command at `buildAgentArtifacts(...)`, then spawn from the emitted PM2 ecosystem (or read the `topology` directly for a custom runner).
<!-- UID: 270239ab-671a-4e89-bbe9-3199799620b9 -->

---




>[!nexus_user] **User** - 08/26/2025 at 11:28 AM
> This only has devtest.ts and an example.
<!-- UID: 47b8db76-391a-4756-8ea3-7b7992c442aa -->




>[!nexus_agent] **Assistant** - 08/26/2025 at 11:33 AM
> You’re right—I biffed the first zip. I rebuilt the **full scaffold** (parser + types + resolver + codegen + README + tsconfig + example).
> 
> Grab this one:
> - [Download: promethean-dsl-ts-full.zip](https://chat.openai.com/c/68adda53-6fe4-832a-9ed8-2240d9478818) *(visit original conversation to download)*
> 
> Contents:
> - `src/types/sexpr.ts` — S-expr nodes + `coerceNode`.
> - `src/types/dsl.ts` — typed Agent/Block/Perms/Topology/Hooks.
> - `src/parser/index.ts` + `src/parser/spec.ts` — parsers + path-aware validation.
> - `src/resolver.ts` — compose agent with blocks, param substitution for `:$param`.
> - `src/codegen/pm2.ts`, `env.ts`, `permissions.ts`.
> - `src/index.ts` — `buildAgentArtifacts(ast)` entrypoint.
> - `examples/duck.sx`, `README.md`, `tsconfig.json`, `package.json`.
> 
> Wire your existing reader like:
> 
> ```ts
> import { buildAgentArtifacts } from "./src/index.js";
> import { coerceNode } from "./src/types/sexpr.js";
> 
> const astFromReader = myReader.readFile("agents/duck/agent.sx");
> const node = coerceNode(astFromReader);
> const { agent, artifacts } = buildAgentArtifacts(node);
> 
> // write artifacts.pm2 / artifacts.env / artifacts.permissions
> ```
> 
> If you want, I’ll add a tiny `prom` CLI skeleton next (`prom build agent :id`, `prom run agent :id`) that writes artifacts to `dist/agents/<id>/` and spawns via PM2 or a custom runner.
<!-- UID: fb3c1b3a-0ace-4ea3-93be-0705401f3218 -->

---




>[!nexus_user] **User** - 08/26/2025 at 11:56 AM
> Damn it man I didn't open that in time cause you're page k ept crashing on me so i decided to wait til you were done.
<!-- UID: 2f73986e-8404-4505-9b55-4c64575466ab -->




>[!nexus_agent] **Assistant** - 08/26/2025 at 11:57 AM
> Ah, I see — and since the sandbox paths are ephemeral, that zip link is gone now. No worries though — I still have the full scaffold content staged. 
> 
> I can recreate the zip for you right here in one shot so you can grab it again. Want me to:
> 
> - Re-emit the **`promethean-dsl-ts-full.zip`** package with the same contents (parser, resolver, codegen, README, example), 
> - Or would you prefer I inline the full **file tree + code** into a single message so you can just drop it into your repo without downloading? 
> 
> Which works better for you right now?
<!-- UID: 33ea42c9-ab1d-42bc-ab57-924038a57dd9 -->

---




>[!nexus_user] **User** - 08/26/2025 at 11:57 AM
> Give it to us in a single message
<!-- UID: b9b59a4b-c1e9-48ec-8d89-87a7a788cd10 -->




>[!nexus_agent] **Assistant** - 08/26/2025 at 11:57 AM
> Got you. Here’s a **single-paste bootstrap** that lays down the full TS scaffold (parser + types + resolver + codegen + example). Paste this in a shell from the repo root:
> 
> ```bash
> # === Promethean Agent DSL (S-Expr) — TS Scaffold ===
> set -euo pipefail
> ROOT="promethean-agent-dsl"
> mkdir -p "$ROOT"/{src/types,src/parser,src/codegen,examples}
> 
> # package.json
> cat > "$ROOT/package.json" <<'EOF'
> {
>  "name": "promethean-agent-dsl",
>  "version": "0.1.0",
>  "private": true,
>  "type": "module",
>  "main": "dist/index.js",
>  "types": "dist/index.d.ts",
>  "files": ["dist"],
>  "scripts": {
>  "build": "tsc -p tsconfig.json"
>  },
>  "devDependencies": {
>  "typescript": "^5.5.4"
>  }
> }
> EOF
> 
> # tsconfig.json
> cat > "$ROOT/tsconfig.json" <<'EOF'
> {
>  "compilerOptions": {
>  "target": "ES2022",
>  "module": "ES2022",
>  "moduleResolution": "Bundler",
>  "declaration": true,
>  "outDir": "dist",
>  "rootDir": "src",
>  "strict": true,
>  "skipLibCheck": true
>  },
>  "include": ["src/**/*"]
> }
> EOF
> 
> # README.md
> cat > "$ROOT/README.md" <<'EOF'
> # Promethean Agent DSL (S-Expr) — TS Scaffold
> 
> This expects you already have an S-expression **reader**. Feed its AST into `buildAgentArtifacts(ast)`.
> We include a tolerant `coerceNode` to adapt common AST shapes.
> 
> ## Layout
> - src/types/sexpr.ts — S-expr nodes + coercion adapter
> - src/types/dsl.ts — typed Agent/Block/Perms/Topology/Hooks
> - src/parser/index.ts — parses `(agent ...)`, `(block ...)`, `(use ...)`, `(env ...)`, `(perm ...)`, `(topology ...)`, `(hooks ...)`, `(metrics ...)`
> - src/parser/spec.ts — tiny path-aware validation helpers
> - src/resolver.ts — compose agent with blocks, param substitution (`:$param`)
> - src/codegen/pm2.ts — ecosystem emitter
> - src/codegen/env.ts — `.env` emitter
> - src/codegen/permissions.ts — `permissions.json` emitter
> - src/index.ts — `buildAgentArtifacts(ast)` entrypoint
> 
> ## Example
> See `examples/duck.sx`.
> 
> ## Plugging in your reader
> ```ts
> import { buildAgentArtifacts } from "./dist/index.js";
> import { coerceNode } from "./dist/types/sexpr.js";
> 
> const astFromReader = myReader.readFile("agents/duck/agent.sx");
> const node = coerceNode(astFromReader);
> const { agent, artifacts } = buildAgentArtifacts(node);
> 
> // write artifacts.pm2 / artifacts.env / artifacts.permissions as you like
> ```
> EOF
> 
> # src/types/sexpr.ts
> cat > "$ROOT/src/types/sexpr.ts" <<'EOF'
> // Tolerant S-Expression node types + coercion helpers.
> // We do NOT implement a reader here — plug in your own reader and call coerceNode on its output.
> 
> export type SSymbol = { t: 'sym', v: string };
> export type SKeyword = { t: 'kw', v: string }; // v excludes the leading ':' (e.g., "id", "read")
> export type SString = { t: 'str', v: string };
> export type SNumber = { t: 'num', v: number };
> export type SBool = { t: 'bool', v: boolean };
> export type SList = { t: 'list', items: SNode[] };
> export type SVector = { t: 'vec', items: SNode[] };
> export type SMap = { t: 'map', entries: Record<string, SNode> };
> 
> export type SNode = SSymbol | SKeyword | SString | SNumber | SBool | SList | SVector | SMap;
> 
> // Type guards
> export const isList = (n: SNode): n is SList => n.t === 'list';
> export const isVec = (n: SNode): n is SVector => n.t === 'vec';
> export const isMap = (n: SNode): n is SMap => n.t === 'map';
> export const isSym = (n: SNode): n is SSymbol => n.t === 'sym';
> export const isKw = (n: SNode): n is SKeyword => n.t === 'kw';
> export const isStr = (n: SNode): n is SString => n.t === 'str';
> export const isNum = (n: SNode): n is SNumber => n.t === 'num';
> export const isBool = (n: SNode): n is SBool => n.t === 'bool';
> 
> // Coercion from a generic reader output. We are permissive on shapes:
> // - strings beginning with ':' become keywords
> // - arrays become lists; arrays tagged with {type:'vector'} become vectors (best-effort)
> // - plain objects become maps if all values are nodes; otherwise we map KV pairs
> export function coerceNode(x: any): SNode {
>  if (x == null) return { t: 'sym', v: 'nil' }; // sentinel
>  if (typeof x === 'string') {
>  if (x.startsWith(':')) return { t: 'kw', v: x.slice(1) };
>  return { t: 'sym', v: x };
>  }
>  if (typeof x === 'number') return { t: 'num', v: x };
>  if (typeof x === 'boolean') return { t: 'bool', v: x };
>  if (Array.isArray(x)) {
>  return { t: 'list', items: x.map(coerceNode) };
>  }
>  if (typeof x === 'object') {
>  // Recognize possible shapes: { type:'list', value:[...] } or { t:'list', items:[...] }
>  if ((x as any).t === 'list' && Array.isArray((x as any).items)) return { t: 'list', items: (x as any).items.map(coerceNode) };
>  if ((x as any).type === 'list' && Array.isArray((x as any).value)) return { t: 'list', items: (x as any).value.map(coerceNode) };
>  if ((x as any).t === 'vec' && Array.isArray((x as any).items)) return { t: 'vec', items: (x as any).items.map(coerceNode) };
>  if ((x as any).type === 'vector' && Array.isArray((x as any).value)) return { t: 'vec', items: (x as any).value.map(coerceNode) };
>  if ((x as any).t === 'map' && (x as any).entries) {
>  const out: Record<string, SNode> = {};
>  for (const [k, v] of Object.entries((x as any).entries)) out[k] = coerceNode(v);
>  return { t: 'map', entries: out };
>  }
>  // Plain object -> map by string keys
>  const out: Record<string, SNode> = {};
>  for (const [k, v] of Object.entries(x)) out[String(k)] = coerceNode(v);
>  return { t: 'map', entries: out };
>  }
>  // Fallback
>  return { t: 'str', v: String(x) };
> }
> 
> // Utilities
> export function listHeadSym(n: SNode): string | null {
>  if (!isList(n) || n.items.length === 0) return null;
>  const h = n.items[0];
>  return isSym(h) ? h.v : (isKw(h) ? ':' + h.v : null);
> }
> 
> export function expectList(n: SNode, ctx: string): SList {
>  if (!isList(n)) throw new Error(`Expected list at ${ctx}, got ${n.t}`);
>  return n;
> }
> 
> export function kwName(k: SNode): string {
>  if (isKw(k)) return k.v;
>  if (isSym(k) && k.v.startsWith(':')) return k.v.slice(1);
>  throw new Error(`Expected keyword, got ${k.t}`);
> }
> 
> export function toJS(n: SNode): any {
>  switch (n.t) {
>  case 'str': return n.v;
>  case 'num': return n.v;
>  case 'bool': return n.v;
>  case 'sym': return n.v;
>  case 'kw': return ':' + n.v;
>  case 'vec': return n.items.map(toJS);
>  case 'list': return n.items.map(toJS);
>  case 'map': {
>  const o: Record<string, any> = {};
>  for (const [k, v] of Object.entries(n.entries)) o[k] = toJS(v);
>  return o;
>  }
>  default: return null;
>  }
> }
> EOF
> 
> # src/types/dsl.ts
> cat > "$ROOT/src/types/dsl.ts" <<'EOF'
> // DSL typed structures
> export type SecretRef = { kind: 'secret', key: string };
> export type EnvMap = Record<string, string | SecretRef>;
> 
> export type FSRule = { mode: 'read'|'write', globs: string[] };
> export type NetRule = { dir: 'egress'|'ingress', hosts: string[] };
> export type ProcRule = { action: 'spawn', kinds: string[] };
> 
> export type Permissions = {
>  fs: FSRule[];
>  net: NetRule[];
>  gpu?: { allow: boolean };
>  proc?: ProcRule[];
> };
> 
> export type ProcDef = {
>  name: string;
>  service: string;
>  args?: Record<string, any>;
>  env?: EnvMap;
> };
> 
> export type LinkDef = {
>  from: string;
>  to: string;
>  via?: 'ws' | 'http' | 'broker';
> };
> 
> export type Topology = {
>  procs: ProcDef[];
>  : LinkDef[];
> };
> 
> export type HookTask = { type: 'task', name: string, args?: Record<string, any> };
> export type HookInterval = { type: 'interval', seconds: number, task: HookTask };
> export type Hooks = {
>  init?: HookTask[];
>  tick?: (HookTask | HookInterval)[];
>  exit?: HookTask[];
> };
> 
> export type Metrics = {
>  scrape?: { from: string[]; interval: number };
> };
> 
> export type UseRef = {
>  block: string; // e.g., "discord.bot/v1"
>  with?: Record<string, any>;
> };
> 
> export type AgentModule = {
>  kind: 'agent';
>  id: string;
>  name?: string;
>  version?: string;
>  tags?: string[];
>  owner?: string;
>  uses: UseRef[];
>  env: EnvMap;
>  perms: Permissions;
>  topology: Topology;
>  hooks: Hooks;
>  metrics?: Metrics;
> };
> 
> export type BlockModule = {
>  kind: 'block';
>  id: string; // canonical name 'discord.bot/v1'
>  docs?: string;
>  requires?: { services?: string[] };
>  exports?: { capabilities?: string[], streams?: string[] };
>  parameters?: Record<string, any>;
>  env?: EnvMap;
>  perms?: Permissions;
>  topology?: Topology;
> };
> 
> export type Module = AgentModule | BlockModule;
> EOF
> 
> # src/parser/spec.ts
> cat > "$ROOT/src/parser/spec.ts" <<'EOF'
> // Lightweight spec/validation utilities with path-aware errors
> export class VError extends Error {
>  path: string;
>  constructor(path: string, msg: string) {
>  super(`${path}: ${msg}`);
>  this.path = path;
>  }
> }
> export function req<T>(path: string, v: T | undefined | null, msg = 'required'): T {
>  if (v === undefined || v === null) throw new VError(path, msg);
>  return v;
> }
> export function isString(x: any): x is string { return typeof x === 'string'; }
> export function isBool(x: any): x is boolean { return typeof x === 'boolean'; }
> export function isNumber(x: any): x is number { return typeof x === 'number' && Number.isFinite(x); }
> export function isArray(x: any): x is any[] { return Array.isArray(x); }
> export function isRecord(x: any): x is Record<string, any> { return x && typeof x === 'object' && !Array.isArray(x); }
> export function ensureArrayOfStrings(path: string, x: any): string[] {
>  if (!Array.isArray(x) || !x.every(isString)) throw new VError(path, 'expected string[]');
>  return x as string[];
> }
> EOF
> 
> # src/parser/index.ts
> cat > "$ROOT/src/parser/index.ts" <<'EOF'
> import {
>  SNode, isList, isSym, isKw, isMap, isVec, isStr, isNum, isBool,
>  listHeadSym, expectList
> } from "../types/sexpr.js";
> import {
>  AgentModule, BlockModule, Module, EnvMap, Permissions, FSRule, NetRule, ProcRule,
>  Topology, ProcDef, LinkDef, UseRef, SecretRef, HookTask, HookInterval, Hooks, Metrics
> } from "../types/dsl.js";
> import { VError, req } from "./spec.js";
> 
> // Helpers
> function symText(n: SNode, ctx: string): string {
>  if (isSym(n)) return n.v;
>  if (isStr(n)) return n.v;
>  throw new VError(ctx, `expected symbol/string, got ${n.t}`);
> }
> 
> function kwArg(list: SNode[], key: string): SNode | undefined {
>  for (let i = 0; i < list.length - 1; i++) {
>  const a = list[i];
>  if ((isKw(a) && a.v === key) || (isSym(a) && a.v === ':' + key)) {
>  return list[i + 1];
>  }
>  }
>  return undefined;
> }
> 
> function parseMapToJS(n: SNode, ctx: string): Record<string, any> {
>  if (!isMap(n)) throw new VError(ctx, `expected map, got ${n.t}`);
>  const out: Record<string, any> = {};
>  for (const [k, v] of Object.entries(n.entries)) out[k] = sexprToValue(v);
>  return out;
> }
> 
> function parseVectorStrings(n: SNode, ctx: string): string[] {
>  if (!isVec(n)) throw new VError(ctx, `expected vector, got ${n.t}`);
>  return n.items.map(x => {
>  if (isStr(x) || isSym(x)) return (x as any).v;
>  throw new VError(ctx, `expected string/symbol in vector, got ${x.t}`);
>  });
> }
> 
> function sexprToValue(n: SNode): any {
>  if (isStr(n)) return n.v;
>  if (isNum(n)) return n.v;
>  if (isBool(n)) return n.v;
>  if (isSym(n)) return n.v;
>  if (isKw(n)) return ':' + n.v;
>  if (isVec(n)) return n.items.map(sexprToValue);
>  if (isMap(n)) {
>  const o: Record<string, any> = {};
>  for (const [k, v] of Object.entries(n.entries)) o[k] = sexprToValue(v);
>  return o;
>  }
>  if (isList(n)) return n.items.map(sexprToValue);
>  return null;
> }
> 
> // (secret :namespace/key)
> function parseSecret(n: SNode): SecretRef | null {
>  if (!isList(n)) return null;
>  const head = listHeadSym(n);
>  if (head !== 'secret') return null;
>  const arg = n.items[1];
>  if (isKw(arg) || isSym(arg)) {
>  const raw = isKw(arg) ? arg.v : arg.v.replace(/^:/, ''); // allow :ns/key or "ns/key"
>  return { kind: 'secret', key: raw };
>  }
>  throw new VError('(secret ...)', 'expected keyword/symbol path');
> }
> 
> // (env { K V ... }) (env {:FOO "bar" :KEY (secret :path)})
> export function parseEnv(form: SNode): EnvMap {
>  const L = expectList(form, '(env ...)');
>  const head = L.items[0];
>  if (!isSym(head) || head.v !== 'env') throw new VError('(env ...)', 'not an env form');
>  const mapNode = L.items[1];
>  if (!mapNode) return {};
>  if (!isMap(mapNode)) throw new VError('(env ...)', 'expected map');
>  const out: EnvMap = {};
>  for (const [k, v] of Object.entries(mapNode.entries)) {
>  const s = parseSecret(v);
>  if (s) out[k] = s;
>  else if (isStr(v) || isSym(v) || isNum(v) || isBool(v)) out[k] = String(sexprToValue(v));
>  else throw new VError('(env ...)', `unsupported env value for ${k}: ${v.t}`);
>  }
>  return out;
> }
> 
> // (perm (fs :read ["/data"]) (net :egress ["*.discord.com"]) (gpu :allow true) (proc :spawn [:llm]))
> export function parsePerm(form: SNode): Permissions {
>  const L = expectList(form, '(perm ...)');
>  if (!isSym(L.items[0]) || L.items[0].v !== 'perm') throw new VError('(perm ...)', 'not a perm form');
>  const fs: FSRule[] = [];
>  const net: NetRule[] = [];
>  let gpu: { allow: boolean } | undefined;
>  const proc: ProcRule[] = [];
> 
>  for (let i = 1; i < L.items.length; i++) {
>  const sub = L.items[i];
>  if (!isList(sub) || sub.items.length === 0 || !isSym(sub.items[0])) continue;
>  const h = sub.items[0].v;
>  if (h === 'fs') {
>  const mode = kwArg(sub.items, 'read') ? 'read' : 'write';
>  const ptr = sub.items.find(n => isVec(n));
>  if (!ptr || !isVec(ptr)) throw new VError('(perm fs ...)', 'expected vector of globs');
>  fs.push({ mode: mode as 'read' | 'write', globs: parseVectorStrings(ptr, '(perm fs globs)') });
>  } else if (h === 'net') {
>  const dir = kwArg(sub.items, 'egress') ? 'egress' : 'ingress';
>  const ptr = sub.items.find(n => isVec(n));
>  if (!ptr || !isVec(ptr)) throw new VError('(perm net ...)', 'expected vector of hosts');
>  net.push({ dir: dir as 'egress' | 'ingress', hosts: parseVectorStrings(ptr, '(perm net hosts)') });
>  } else if (h === 'gpu') {
>  const allowNode = kwArg(sub.items, 'allow');
>  if (!allowNode || allowNode.t !== 'bool') throw new VError('(perm gpu ...)', 'expected boolean :allow');
>  gpu = { allow: allowNode.v };
>  } else if (h === 'proc') {
>  const kindsNode = kwArg(sub.items, 'spawn');
>  if (!kindsNode || kindsNode.t !== 'vec') throw new VError('(perm proc ...)', 'expected vector after :spawn');
>  const kinds = parseVectorStrings(kindsNode, '(perm proc kinds)');
>  proc.push({ action: 'spawn', kinds });
>  }
>  }
>  return { fs, net, gpu, proc };
> }
> 
> // (topology (proc :name :cephalon :service "services/ts/cephalon" :args {...}) (link :from :discord :to :cephalon :via :ws))
> export function parseTopology(form: SNode): Topology {
>  const L = expectList(form, '(topology ...)');
>  if (!isSym(L.items[0]) || L.items[0].v !== 'topology') throw new Error('not topology');
>  const procs: ProcDef[] = [];
>  const : LinkDef[] = [];
>  for (let i = 1; i < L.items.length; i++) {
>  const sub = expectList(L.items[i], '(topology subform)');
>  const head = symText(sub.items[0], '(topology head)');
>  if (head === 'proc') {
>  const nameNode = kwArg(sub.items, 'name');
>  const serviceNode = kwArg(sub.items, 'service');
>  if (!nameNode || !serviceNode) throw new VError('(topology proc ...)', 'missing :name or :service');
>  const name = symText(nameNode, '(proc :name)');
>  const service = symText(serviceNode, '(proc :service)');
>  const argsNode = kwArg(sub.items, 'args');
>  const envNode = kwArg(sub.items, 'env');
>  const args = argsNode ? parseMapToJS(argsNode, '(proc :args)') : undefined;
>  const env = envNode ? parseEnv({ t: 'list', items: [{ t: 'sym', v: 'env' }, envNode] } as any) : undefined;
>  procs.push({ name, service, args, env });
>  } else if (head === 'link') {
>  const fromNode = kwArg(sub.items, 'from');
>  const toNode = kwArg(sub.items, 'to');
>  if (!fromNode || !toNode) throw new VError('(topology link ...)', 'missing :from or :to');
>  const viaNode = kwArg(sub.items, 'via');
>  const from = symText(fromNode, '(link :from)');
>  const to = symText(toNode, '(link :to)');
>  const via = viaNode ? symText(viaNode, '(link :via)') as any : undefined;
>  .push({ from, to, via });
>  }
>  }
>  return { procs, };
> }
> 
> // (hooks (init (task :name) ...) (tick (interval :seconds 30 (task ...))) (exit (task ...)))
> export function parseHooks(form: SNode): Hooks {
>  const L = expectList(form, '(hooks ...)');
>  if (!isSym(L.items[0]) || L.items[0].v !== 'hooks') throw new Error('not hooks');
>  const out: Hooks = {};
>  for (let i = 1; i < L.items.length; i++) {
>  const sub = expectList(L.items[i], '(hooks section)');
>  const head = symText(sub.items[0], '(hooks section head)');
>  const tasks: (HookTask | HookInterval)[] = [];
>  for (let j = 1; j < sub.items.length; j++) {
>  const item = expectList(sub.items[j], '(hooks item)');
>  const h = symText(item.items[0], '(hooks item head)');
>  if (h === 'task') {
>  const nameNode = item.items[1];
>  const name = symText(nameNode, '(task name)');
>  const argsNode = kwArg(item.items, 'args');
>  const args = argsNode && isMap(argsNode) ? parseMapToJS(argsNode, '(task :args)') : undefined;
>  tasks.push({ type: 'task', name, args });
>  } else if (h === 'interval') {
>  const secNode = kwArg(item.items, 'seconds');
>  if (!secNode || secNode.t !== 'num') throw new VError('(interval ...)', 'missing numeric :seconds');
>  const nestedTask = item.items.find(n => isList(n) && listHeadSym(n as SNode) === 'task') as SNode | undefined;
>  if (!nestedTask) throw new VError('(interval ...)', 'missing (task ...)');
>  const tlist = expectList(nestedTask, '(interval task)');
>  const tname = symText(tlist.items[1], '(interval task name)');
>  const targsNode = kwArg(tlist.items, 'args');
>  const targs = targsNode && isMap(targsNode) ? parseMapToJS(targsNode, '(interval task :args)') : undefined;
>  tasks.push({ type: 'interval', seconds: (secNode as any).v, task: { type: 'task', name: tname, args: targs } });
>  }
>  }
>  if (head === 'init') out.init = tasks as HookTask[];
>  else if (head === 'tick') out.tick = tasks;
>  else if (head === 'exit') out.exit = tasks as HookTask[];
>  }
>  return out;
> }
> 
> // (metrics (scrape :from [:a :b] :interval 15))
> export function parseMetrics(form: SNode): Metrics {
>  const L = expectList(form, '(metrics ...)');
>  if (!isSym(L.items[0]) || L.items[0].v !== 'metrics') throw new Error('not metrics');
>  const sub = L.items[1];
>  if (!sub) return {};
>  const section = expectList(sub, '(metrics section)');
>  const head = symText(section.items[0], '(metrics head)');
>  if (head === 'scrape') {
>  const fromNode = kwArg(section.items, 'from');
>  const intervalNode = kwArg(section.items, 'interval');
>  if (!fromNode || !isVec(fromNode)) throw new VError('(metrics scrape ...)', 'expected vector after :from');
>  const from = fromNode.items.map(s => symText(s, '(metrics :from vec item)'));
>  const interval = intervalNode && intervalNode.t === 'num' ? (intervalNode as any).v : 30;
>  return { scrape: { from, interval } };
>  }
>  return {};
> }
> 
> // (use discord.bot/v1 :with {:stt :whisper})
> export function parseUse(form: SNode): UseRef {
>  const L = expectList(form, '(use ...)');
>  if (!isSym(L.items[0]) || L.items[0].v !== 'use') throw new Error('not use');
>  const blockSym = L.items[1];
>  const block = symText(blockSym, '(use block)');
>  const withNode = kwArg(L.items, 'with');
>  const withMap = withNode ? parseMapToJS(withNode, '(use :with)') : undefined;
>  return { block, with: withMap };
> }
> 
> // (block discord.bot/v1 :docs "..." (requires :services [:discord]) (exports :capabilities [:gateway]) (parameters {...}) (env {...}) (perm ...) (topology ...))
> export function parseBlock(form: SNode): BlockModule {
>  const L = expectList(form, '(block ...)');
>  if (!isSym(L.items[0]) || L.items[0].v !== 'block') throw new Error('not block');
>  const id = symText(L.items[1], '(block id)');
>  const out: BlockModule = { kind: 'block', id };
> 
>  // read keyword args at top level
>  const docs = kwArg(L.items, 'docs');
>  if (docs) out.docs = symText(docs, '(block :docs)');
>  for (let i = 2; i < L.items.length; i++) {
>  const sub = L.items[i];
>  if (!isList(sub)) continue;
>  const head = listHeadSym(sub);
>  if (head === 'requires') {
>  const servicesNode = kwArg((sub as any).items, 'services');
>  if (servicesNode && servicesNode.t === 'vec') {
>  out.requires = { services: servicesNode.items.map(s => symText(s, '(requires :services item)')) };
>  }
>  } else if (head === 'exports') {
>  const capsNode = kwArg((sub as any).items, 'capabilities');
>  const streamsNode = kwArg((sub as any).items, 'streams');
>  out.exports = {
>  capabilities: capsNode && capsNode.t === 'vec' ? capsNode.items.map(s => symText(s, '(exports :capabilities)')) : undefined,
>  streams: streamsNode && streamsNode.t === 'vec' ? streamsNode.items.map(s => symText(s, '(exports :streams)')) : undefined
>  };
>  } else if (head === 'parameters') {
>  out.parameters = parseMapToJS(sub.items[1], '(parameters)');
>  } else if (head === 'env') {
>  out.env = parseEnv(sub);
>  } else if (head === 'perm') {
>  out.perms = parsePerm(sub);
>  } else if (head === 'topology') {
>  out.topology = parseTopology(sub);
>  }
>  }
>  return out;
> }
> 
> // (agent :id duck :name "Duck" ... (use ...) (env ...) (perm ...) (topology ...) (hooks ...) (metrics ...))
> export function parseAgent(form: SNode): AgentModule {
>  const L = expectList(form, '(agent ...)');
>  if (!isSym(L.items[0]) || L.items[0].v !== 'agent') throw new Error('not agent');
>  const idNode = kwArg(L.items, 'id');
>  const id = symText(req('(agent :id)', idNode), '(agent :id)');
>  const nameNode = kwArg(L.items, 'name');
>  const versionNode = kwArg(L.items, 'version');
>  const tagsNode = kwArg(L.items, 'tags');
>  const ownerNode = kwArg(L.items, 'owner');
> 
>  const uses: UseRef[] = [];
>  let env: EnvMap = {};
>  let perms: Permissions = { fs: [], net: [] };
>  let topology: Topology = { procs: [], : [] };
>  let hooks: Hooks = {};
>  let metrics: Metrics | undefined;
> 
>  for (let i = 1; i < L.items.length; i++) {
>  const it = L.items[i];
>  if (isList(it)) {
>  const head = listHeadSym(it);
>  if (head === 'use') uses.push(parseUse(it));
>  else if (head === 'env') env = { ...env, ...parseEnv(it) };
>  else if (head === 'perm') perms = parsePerm(it);
>  else if (head === 'topology') topology = parseTopology(it);
>  else if (head === 'hooks') hooks = parseHooks(it);
>  else if (head === 'metrics') metrics = parseMetrics(it);
>  }
>  }
> 
>  return {
>  kind: 'agent',
>  id,
>  name: nameNode ? symText(nameNode, '(agent :name)') : undefined,
>  version: versionNode ? symText(versionNode, '(agent :version)') : undefined,
>  tags: tagsNode && tagsNode.t === 'vec' ? tagsNode.items.map(s => symText(s, '(agent :tags item)')) : undefined,
>  owner: ownerNode ? symText(ownerNode, '(agent :owner)') : undefined,
>  uses, env, perms, topology, hooks, metrics
>  };
> }
> 
> export function parseTopLevel(form: SNode): Module {
>  const head = listHeadSym(form);
>  if (head === 'agent') return parseAgent(form);
>  if (head === 'block') return parseBlock(form);
>  throw new Error(`Unsupported top-level form: ${head}`);
> }
> 
> // Accept either: a single form or a list/vector of forms
> export function parseModule(ast: any): Module[] {
>  // If caller passes raw JS arrays/objects, we expect them to have been coerced already or shaped like (list ...)
>  const node = (typeof ast === 'object' && (ast.t === 'list' || ast.t === 'vec')) ? ast : { t: 'list', items: Array.isArray(ast) ? ast : [ast] } as any;
>  const forms: SNode[] = (node.t === 'list' || node.t === 'vec') ? (node as any).items : [node];
>  const out: Module[] = [];
>  for (const f of forms) {
>  if (!isList(f)) continue;
>  out.push(parseTopLevel(f));
>  }
>  return out;
> }
> EOF
> 
> # src/resolver.ts
> cat > "$ROOT/src/resolver.ts" <<'EOF'
> import { AgentModule, BlockModule, EnvMap, Module, Permissions, Topology } from "./types/dsl.js";
> 
> export type Registry = Map<string, BlockModule>;
> 
> /** Merge block env/perms/topology into agent, with simple precedence:
>  * - env: agent overrides block
>  * - perms: concatenated
>  * - topology: concatenated procs/
>  * Also substitute parameters in block proc args: strings equal to ":$param" replaced by (use :with {param ...}).
>  */
> export function composeAgent(agent: AgentModule, reg: Registry): AgentModule {
>  let env: EnvMap = { ...agent.env };
>  let perms: Permissions = {
>  fs: [...(agent.perms.fs ?? [])],
>  net: [...(agent.perms.net ?? [])],
>  gpu: agent.perms.gpu,
>  proc: [...(agent.perms.proc ?? [])],
>  };
>  let topology: Topology = {
>  procs: [...(agent.topology.procs ?? [])],
>  : [...(agent.topology. ?? [])],
>  };
> 
>  for (const u of agent.uses) {
>  const blk = reg.get(u.block);
>  if (!blk) throw new Error(`Block not found: ${u.block}`);
>  if (blk.env) env = { ...blk.env, ...env }; // agent has priority
>  if (blk.perms) {
>  perms = {
>  fs: [...perms.fs, ...(blk.perms.fs ?? [])],
>  net: [...perms.net, ...(blk.perms.net ?? [])],
>  gpu: perms.gpu ?? blk.perms.gpu,
>  proc: [...(perms.proc ?? []), ...(blk.perms.proc ?? [])]
>  };
>  }
>  if (blk.topology) {
>  topology = {
>  procs: [...topology.procs, ...(blk.topology.procs ?? [])],
>  : [...topology., ...(blk.topology. ?? [])]
>  };
>  }
>  // parameter substitution
>  if (u.with && blk.topology?.procs) {
>  for (const p of topology.procs) {
>  if (!p.args) continue;
>  for (const [k, v] of Object.entries(p.args)) {
>  if (typeof v === 'string' && v.startsWith(':$')) {
>  const name = v.slice(2);
>  if (Object.prototype.hasOwnProperty.call(u.with, name)) {
>  p.args[k] = (u.with as any)[name];
>  }
>  }
>  }
>  }
>  }
>  }
> 
>  return { ...agent, env, perms, topology };
> }
> 
> export function registryFromModules(mods: Module[]): Registry {
>  const r: Registry = new Map();
>  for (const m of mods) if (m.kind === 'block') r.set(m.id, m);
>  return r;
> }
> EOF
> 
> # src/codegen/pm2.ts
> cat > "$ROOT/src/codegen/pm2.ts" <<'EOF'
> import { AgentModule, ProcDef } from "../types/dsl.js";
> 
> export function emitPm2Ecosystem(agent: AgentModule) {
>  const apps = agent.topology.procs.map(procToApp);
>  return `// Auto-generated for agent: ${agent.id}
> export default {
>  apps: ${JSON.stringify(apps, null, 2)}
> };
> `;
> }
> 
> function procToApp(p: ProcDef) {
>  const script = serviceToScript(p.service);
>  return {
>  name: `agent:${p.name}`,
>  script,
>  args: p.args ? JSON.stringify(p.args) : undefined,
>  env: mapEnv(p.env),
>  autorestart: true
>  };
> }
> 
> function serviceToScript(svc: string) {
>  // naive mapping; adjust as needed
>  if (svc.endsWith(".ts")) return svc;
>  if (svc.startsWith("services/")) return `${svc}/index.ts`;
>  return svc;
> }
> 
> function mapEnv(env?: Record<string, any>) {
>  if (!env) return undefined;
>  const out: Record<string, string> = {};
>  for (const [k, v] of Object.entries(env)) {
>  out[k] = typeof v === 'string' ? v : JSON.stringify(v);
>  }
>  return out;
> }
> EOF
> 
> # src/codegen/env.ts
> cat > "$ROOT/src/codegen/env.ts" <<'EOF'
> import { AgentModule } from "../types/dsl.js";
> 
> export function emitDotEnv(agent: AgentModule): string {
>  const lines: string[] = [];
>  for (const [k, v] of Object.entries(agent.env)) {
>  if (typeof v === 'string') lines.push(`${k}=${escapeVal(v)}`);
>  else if (v && v.kind === 'secret') lines.push(`${k}=${`__SECRET__:${v.key}`}`);
>  }
>  return lines.join('\n') + '\n';
> }
> 
> function escapeVal(v: string) {
>  if (/[\s#]/.test(v)) return JSON.stringify(v);
>  return v;
> }
> EOF
> 
> # src/codegen/permissions.ts
> cat > "$ROOT/src/codegen/permissions.ts" <<'EOF'
> import { AgentModule } from "../types/dsl.js";
> 
> export function emitPermissionsJSON(agent: AgentModule): string {
>  // no further processing; emit as-is
>  return JSON.stringify(agent.perms ?? {}, null, 2) + '\n';
> }
> EOF
> 
> # src/index.ts
> cat > "$ROOT/src/index.ts" <<'EOF'
> import { parseModule } from "./parser/index.js";
> import { Module, AgentModule } from "./types/dsl.js";
> import { composeAgent, registryFromModules } from "./resolver.js";
> import { emitPm2Ecosystem } from "./codegen/pm2.js";
> import { emitDotEnv } from "./codegen/env.js";
> import { emitPermissionsJSON } from "./codegen/permissions.js";
> 
> export type BuiltArtifacts = {
>  pm2: string;
>  env: string;
>  permissions: string;
> };
> 
> export function buildAgentArtifacts(ast: any): { agent: AgentModule, artifacts: BuiltArtifacts } {
>  const mods = parseModule(ast);
>  const agent = mods.find(m => (m as Module).kind === 'agent') as AgentModule | undefined;
>  if (!agent) throw new Error('No (agent ...) form found');
>  const reg = registryFromModules(mods);
>  const composed = composeAgent(agent, reg);
> 
>  const artifacts: BuiltArtifacts = {
>  pm2: emitPm2Ecosystem(composed),
>  env: emitDotEnv(composed),
>  permissions: emitPermissionsJSON(composed)
>  };
>  return { agent: composed, artifacts };
> }
> EOF
> 
> # examples/duck.sx
> cat > "$ROOT/examples/duck.sx" <<'EOF'
> (agent
>  :id duck
>  :name "Duck"
>  (use discord.bot/v1)
>  (env {:DISCORD_TOKEN (secret :discord/duck)})
>  (perm
>  (fs :read ["/data/**"])
>  (net :egress ["*.discord.com"])
>  (gpu :allow true))
>  (topology
>  (proc :name :discord :service "services/ts/discord" :args {:agent "duck"})
>  (link :from :discord :to :cephalon :via :ws)))
> EOF
> 
> echo "Wrote scaffold to $ROOT"
> echo "Next:"
> echo " cd $ROOT && npm i && npm run build"
> ```
> 
> Quick notes:
> - This is **runtime-agnostic**; `emitPm2Ecosystem` gives you a ready `ecosystem.config.mjs` string if you want PM2, but you can also read `agent.topology` directly for a custom runner.
> - `:secret` forms emit `__SECRET__:ns/key` placeholders in `.env`. Wire your secret resolver at run/start time.
> - Block parameter substitution uses `:$param` in block `proc.args`, filled from `(use some.block/vN :with {:param ...})`.
> 
> Want me to tack on a tiny `prom` CLI (Node) next that:
> - reads `.sx`, calls your reader → `coerceNode` → `buildAgentArtifacts`,
> - writes artifacts into `dist/agents/<id>/`,
> - and optionally spawns via PM2 or a minimal custom runner?
<!-- UID: ca6f7c5e-f172-4ff1-84ab-d4ca241ad124 -->

---




>[!nexus_user] **User** - 08/26/2025 at 12:40 PM
> yeap
<!-- UID: cb3499b7-6a35-4fc0-83b5-e3b316ebadd2 -->




>[!nexus_agent] **Assistant** - 08/26/2025 at 12:40 PM
> sweet — here’s a **single-paste installer** that lays down the **DSL library + a `prom` CLI**. It assumes you already have an s-expr reader; just pass `--reader ./path/to/your/reader.js`.
> 
> Paste this into a shell from your repo root:
> 
> ```bash
> # === Promethean Agent DSL + CLI (TypeScript) ===
> set -euo pipefail
> ROOT="promethean-agent-dsl"
> mkdir -p "$ROOT"/{src/types,src/parser,src/codegen,src/bin,examples}
> 
> ########################################
> # package.json (adds a `prom` bin)
> ########################################
> cat > "$ROOT/package.json" <<'EOF'
> {
>  "name": "promethean-agent-dsl",
>  "version": "0.2.0",
>  "private": true,
>  "type": "module",
>  "main": "dist/index.js",
>  "types": "dist/index.d.ts",
>  "files": ["dist"],
>  "bin": {
>  "prom": "dist/bin/prom.js"
>  },
>  "scripts": {
>  "build": "tsc -p tsconfig.json"
>  },
>  "devDependencies": {
>  "commander": "^12.1.0",
>  "typescript": "^5.5.4"
>  }
> }
> EOF
> 
> ########################################
> # tsconfig.json
> ########################################
> cat > "$ROOT/tsconfig.json" <<'EOF'
> {
>  "compilerOptions": {
>  "target": "ES2022",
>  "module": "ES2022",
>  "moduleResolution": "Bundler",
>  "declaration": true,
>  "outDir": "dist",
>  "rootDir": "src",
>  "strict": true,
>  "skipLibCheck": true
>  },
>  "include": ["src/**/*"]
> }
> EOF
> 
> ########################################
> # README.md
> ########################################
> cat > "$ROOT/README.md" <<'EOF'
> # Promethean Agent DSL (S-Expr) — Library + CLI
> 
> This expects you already have an S-expression **reader**. The CLI loads your reader with `--reader ./path/to/reader.js` and feeds its AST into the DSL builder.
> 
> ## CLI
> 
> ```bash
> # Build artifacts from agent file + optional block files
> prom build agent agents/duck/agent.sx \
>  --reader ./reader.js \
>  --include blocks/discord.sx --include blocks/voice.sx \
>  --out dist/agents
> 
> # Run via PM2 (pm2 must be installed globally)
> prom run agent agents/duck/agent.sx \
>  --reader ./reader.js \
>  --include blocks/discord.sx --include blocks/voice.sx \
>  --out dist/agents --pm2
> ```
> 
> Your reader module should export `readFile(path: string): any | Promise<any>`. It can also export `read(text: string): any` (not required).
> 
> ## Library API
> 
> - `coerceNode(ast: any): SNode` (adapts various reader AST shapes)
> - `buildAgentArtifacts(ast: any) -> { agent, artifacts }`
> 
> Artifacts:
> - PM2 ecosystem (`ecosystem.config.mjs`)
> - `.env` (with `__SECRET__:` placeholders for `(secret ...)`)
> - `permissions.json`
> - `topology.json`
> 
> See `examples/duck.sx` for a tiny sample.
> EOF
> 
> ########################################
> # src/types/sexpr.ts
> ########################################
> cat > "$ROOT/src/types/sexpr.ts" <<'EOF'
> // Tolerant S-Expression node types + coercion helpers.
> // We do NOT implement a reader here — plug in your own reader and call coerceNode on its output.
> 
> export type SSymbol = { t: 'sym', v: string };
> export type SKeyword = { t: 'kw', v: string }; // v excludes the leading ':' (e.g., "id", "read")
> export type SString = { t: 'str', v: string };
> export type SNumber = { t: 'num', v: number };
> export type SBool = { t: 'bool', v: boolean };
> export type SList = { t: 'list', items: SNode[] };
> export type SVector = { t: 'vec', items: SNode[] };
> export type SMap = { t: 'map', entries: Record<string, SNode> };
> 
> export type SNode = SSymbol | SKeyword | SString | SNumber | SBool | SList | SVector | SMap;
> 
> // Type guards
> export const isList = (n: SNode): n is SList => n.t === 'list';
> export const isVec = (n: SNode): n is SVector => n.t === 'vec';
> export const isMap = (n: SNode): n is SMap => n.t === 'map';
> export const isSym = (n: SNode): n is SSymbol => n.t === 'sym';
> export const isKw = (n: SNode): n is SKeyword => n.t === 'kw';
> export const isStr = (n: SNode): n is SString => n.t === 'str';
> export const isNum = (n: SNode): n is SNumber => n.t === 'num';
> export const isBool = (n: SNode): n is SBool => n.t === 'bool';
> 
> // Coercion from a generic reader output. We are permissive on shapes.
> export function coerceNode(x: any): SNode {
>  if (x == null) return { t: 'sym', v: 'nil' }; // sentinel
>  if (typeof x === 'string') {
>  if (x.startsWith(':')) return { t: 'kw', v: x.slice(1) };
>  return { t: 'sym', v: x };
>  }
>  if (typeof x === 'number') return { t: 'num', v: x };
>  if (typeof x === 'boolean') return { t: 'bool', v: x };
>  if (Array.isArray(x)) return { t: 'list', items: x.map(coerceNode) };
>  if (typeof x === 'object') {
>  if ((x as any).t === 'list' && Array.isArray((x as any).items)) return { t:'list', items:(x as any).items.map(coerceNode) };
>  if ((x as any).type === 'list' && Array.isArray((x as any).value)) return { t:'list', items:(x as any).value.map(coerceNode) };
>  if ((x as any).t === 'vec' && Array.isArray((x as any).items)) return { t:'vec', items:(x as any).items.map(coerceNode) };
>  if ((x as any).type === 'vector' && Array.isArray((x as any).value)) return { t:'vec', items:(x as any).value.map(coerceNode) };
>  if ((x as any).t === 'map' && (x as any).entries) {
>  const out: Record<string, SNode> = {};
>  for (const [k, v] of Object.entries((x as any).entries)) out[k] = coerceNode(v);
>  return { t:'map', entries: out };
>  }
>  const out: Record<string, SNode> = {};
>  for (const [k, v] of Object.entries(x)) out[String(k)] = coerceNode(v);
>  return { t:'map', entries: out };
>  }
>  return { t: 'str', v: String(x) };
> }
> 
> export function listHeadSym(n: SNode): string | null {
>  if (!isList(n) || n.items.length === 0) return null;
>  const h = n.items[0];
>  return isSym(h) ? h.v : (isKw(h) ? ':' + h.v : null);
> }
> 
> export function expectList(n: SNode, ctx: string): SList {
>  if (!isList(n)) throw new Error(`Expected list at ${ctx}, got ${n.t}`);
>  return n;
> }
> EOF
> 
> ########################################
> # src/types/dsl.ts
> ########################################
> cat > "$ROOT/src/types/dsl.ts" <<'EOF'
> // DSL typed structures
> export type SecretRef = { kind: 'secret', key: string };
> export type EnvMap = Record<string, string | SecretRef>;
> export type FSRule = { mode: 'read'|'write', globs: string[] };
> export type NetRule = { dir: 'egress'|'ingress', hosts: string[] };
> export type ProcRule = { action: 'spawn', kinds: string[] };
> 
> export type Permissions = {
>  fs: FSRule[];
>  net: NetRule[];
>  gpu?: { allow: boolean };
>  proc?: ProcRule[];
> };
> 
> export type ProcDef = {
>  name: string;
>  service: string;
>  args?: Record<string, any>;
>  env?: EnvMap;
> };
> 
> export type LinkDef = {
>  from: string;
>  to: string;
>  via?: 'ws' | 'http' | 'broker';
> };
> 
> export type Topology = {
>  procs: ProcDef[];
>  : LinkDef[];
> };
> 
> export type HookTask = { type: 'task', name: string, args?: Record<string, any> };
> export type HookInterval = { type: 'interval', seconds: number, task: HookTask };
> export type Hooks = {
>  init?: HookTask[];
>  tick?: (HookTask | HookInterval)[];
>  exit?: HookTask[];
> };
> 
> export type Metrics = {
>  scrape?: { from: string[]; interval: number };
> };
> 
> export type UseRef = {
>  block: string; // e.g., "discord.bot/v1"
>  with?: Record<string, any>;
> };
> 
> export type AgentModule = {
>  kind: 'agent';
>  id: string;
>  name?: string;
>  version?: string;
>  tags?: string[];
>  owner?: string;
>  uses: UseRef[];
>  env: EnvMap;
>  perms: Permissions;
>  topology: Topology;
>  hooks: Hooks;
>  metrics?: Metrics;
> };
> 
> export type BlockModule = {
>  kind: 'block';
>  id: string; // canonical name 'discord.bot/v1'
>  docs?: string;
>  requires?: { services?: string[] };
>  exports?: { capabilities?: string[], streams?: string[] };
>  parameters?: Record<string, any>;
>  env?: EnvMap;
>  perms?: Permissions;
>  topology?: Topology;
> };
> 
> export type Module = AgentModule | BlockModule;
> EOF
> 
> ########################################
> # src/parser/spec.ts
> ########################################
> cat > "$ROOT/src/parser/spec.ts" <<'EOF'
> // Lightweight spec/validation utilities with path-aware errors
> export class VError extends Error {
>  path: string;
>  constructor(path: string, msg: string) {
>  super(`${path}: ${msg}`);
>  this.path = path;
>  }
> }
> 
> export function req<T>(path: string, v: T | undefined | null, msg = 'required'): T {
>  if (v === undefined || v === null) throw new VError(path, msg);
>  return v;
> }
> 
> export function isString(x: any): x is string { return typeof x === 'string'; }
> export function isBool(x: any): x is boolean { return typeof x === 'boolean'; }
> export function isNumber(x: any): x is number { return typeof x === 'number' && Number.isFinite(x); }
> export function isArray(x: any): x is any[] { return Array.isArray(x); }
> export function isRecord(x: any): x is Record<string, any> { return x && typeof x === 'object' && !Array.isArray(x); }
> EOF
> 
> ########################################
> # src/parser/index.ts
> ########################################
> cat > "$ROOT/src/parser/index.ts" <<'EOF'
> import {
>  SNode, isList, isSym, isKw, isMap, isVec, isStr, isNum, isBool,
>  listHeadSym, expectList
> } from "../types/sexpr.js";
> import {
>  AgentModule, BlockModule, Module, EnvMap, Permissions, FSRule, NetRule, ProcRule,
>  Topology, ProcDef, LinkDef, UseRef, SecretRef, HookTask, HookInterval, Hooks, Metrics
> } from "../types/dsl.js";
> import { VError, req } from "./spec.js";
> 
> // Helpers
> function symText(n: SNode, ctx: string): string {
>  if (isSym(n)) return n.v;
>  if (isStr(n)) return n.v;
>  throw new VError(ctx, `expected symbol/string, got ${n.t}`);
> }
> function kwArg(list: SNode[], key: string): SNode | undefined {
>  for (let i = 0; i < list.length - 1; i++) {
>  const a = list[i];
>  if ((isKw(a) && a.v === key) || (isSym(a) && a.v === ':' + key)) return list[i + 1];
>  }
>  return undefined;
> }
> function parseMapToJS(n: SNode, ctx: string): Record<string, any> {
>  if (!isMap(n)) throw new VError(ctx, `expected map, got ${n.t}`);
>  const out: Record<string, any> = {};
>  for (const [k, v] of Object.entries(n.entries)) out[k] = sexprToValue(v);
>  return out;
> }
> function parseVectorStrings(n: SNode, ctx: string): string[] {
>  if (!isVec(n)) throw new VError(ctx, `expected vector, got ${n.t}`);
>  return n.items.map(x => {
>  if (isStr(x) || isSym(x)) return (x as any).v;
>  throw new VError(ctx, `expected string/symbol in vector, got ${x.t}`);
>  });
> }
> function sexprToValue(n: SNode): any {
>  if (isStr(n)) return n.v;
>  if (isNum(n)) return n.v;
>  if (isBool(n)) return n.v;
>  if (isSym(n)) return n.v;
>  if (isKw(n)) return ':' + n.v;
>  if (isVec(n)) return n.items.map(sexprToValue);
>  if (isMap(n)) { const o: Record<string, any> = {}; for (const [k, v] of Object.entries(n.entries)) o[k] = sexprToValue(v); return o; }
>  if (isList(n)) return n.items.map(sexprToValue);
>  return null;
> }
> // (secret :namespace/key)
> function parseSecret(n: SNode): SecretRef | null {
>  if (!isList(n)) return null;
>  const head = listHeadSym(n);
>  if (head !== 'secret') return null;
>  const arg = n.items[1];
>  if (isKw(arg) || isSym(arg)) {
>  const raw = isKw(arg) ? arg.v : arg.v.replace(/^:/, '');
>  return { kind: 'secret', key: raw };
>  }
>  throw new VError('(secret ...)', 'expected keyword/symbol path');
> }
> // (env {...})
> export function parseEnv(form: SNode): EnvMap {
>  const L = expectList(form, '(env ...)');
>  const head = L.items[0];
>  if (!isSym(head) || head.v !== 'env') throw new VError('(env ...)', 'not an env form');
>  const mapNode = L.items[1];
>  if (!mapNode) return {};
>  if (!isMap(mapNode)) throw new VError('(env ...)', 'expected map');
>  const out: EnvMap = {};
>  for (const [k, v] of Object.entries(mapNode.entries)) {
>  const s = parseSecret(v);
>  if (s) out[k] = s;
>  else if (isStr(v) || isSym(v) || isNum(v) || isBool(v)) out[k] = String(sexprToValue(v));
>  else throw new VError('(env ...)', `unsupported env value for ${k}: ${v.t}`);
>  }
>  return out;
> }
> // (perm ...)
> export function parsePerm(form: SNode): Permissions {
>  const L = expectList(form, '(perm ...)');
>  if (!isSym(L.items[0]) || L.items[0].v !== 'perm') throw new VError('(perm ...)', 'not a perm form');
>  const fs: FSRule[] = []; const net: NetRule[] = []; let gpu: { allow: boolean } | undefined; const proc: ProcRule[] = [];
>  for (let i = 1; i < L.items.length; i++) {
>  const sub = L.items[i];
>  if (!isList(sub) || sub.items.length === 0 || !isSym(sub.items[0])) continue;
>  const h = sub.items[0].v;
>  if (h === 'fs') {
>  const mode = kwArg(sub.items, 'read') ? 'read' : 'write';
>  const ptr = sub.items.find(n => isVec(n));
>  if (!ptr || !isVec(ptr)) throw new VError('(perm fs ...)', 'expected vector of globs');
>  fs.push({ mode: mode as 'read'|'write', globs: parseVectorStrings(ptr, '(perm fs globs)') });
>  } else if (h === 'net') {
>  const dir = kwArg(sub.items, 'egress') ? 'egress' : 'ingress';
>  const ptr = sub.items.find(n => isVec(n));
>  if (!ptr || !isVec(ptr)) throw new VError('(perm net ...)', 'expected vector of hosts');
>  net.push({ dir: dir as 'egress'|'ingress', hosts: parseVectorStrings(ptr, '(perm net hosts)') });
>  } else if (h === 'gpu') {
>  const allowNode = kwArg(sub.items, 'allow');
>  if (!allowNode || allowNode.t !== 'bool') throw new VError('(perm gpu ...)', 'expected boolean :allow');
>  gpu = { allow: allowNode.v };
>  } else if (h === 'proc') {
>  const kindsNode = kwArg(sub.items, 'spawn');
>  if (!kindsNode || kindsNode.t !== 'vec') throw new VError('(perm proc ...)', 'expected vector after :spawn');
>  const kinds = parseVectorStrings(kindsNode, '(perm proc kinds)');
>  proc.push({ action: 'spawn', kinds });
>  }
>  }
>  return { fs, net, gpu, proc };
> }
> // (topology ...)
> export function parseTopology(form: SNode): Topology {
>  const L = expectList(form, '(topology ...)');
>  if (!isSym(L.items[0]) || L.items[0].v !== 'topology') throw new Error('not topology');
>  const procs: ProcDef[] = []; const : LinkDef[] = [];
>  for (let i = 1; i < L.items.length; i++) {
>  const sub = expectList(L.items[i], '(topology subform)');
>  const head = symText(sub.items[0], '(topology head)');
>  if (head === 'proc') {
>  const nameNode = kwArg(sub.items, 'name'); const serviceNode = kwArg(sub.items, 'service');
>  if (!nameNode || !serviceNode) throw new VError('(topology proc ...)', 'missing :name or :service');
>  const name = symText(nameNode, '(proc :name)'); const service = symText(serviceNode, '(proc :service)');
>  const argsNode = kwArg(sub.items, 'args'); const envNode = kwArg(sub.items, 'env');
>  const args = argsNode ? parseMapToJS(argsNode, '(proc :args)') : undefined;
>  const env = envNode ? parseEnv({ t:'list', items:[{ t:'sym', v:'env' }, envNode] } as any) : undefined;
>  procs.push({ name, service, args, env });
>  } else if (head === 'link') {
>  const fromNode = kwArg(sub.items, 'from'); const toNode = kwArg(sub.items, 'to');
>  if (!fromNode || !toNode) throw new VError('(topology link ...)', 'missing :from or :to');
>  const viaNode = kwArg(sub.items, 'via');
>  const from = symText(fromNode, '(link :from)'); const to = symText(toNode, '(link :to)');
>  const via = viaNode ? symText(viaNode, '(link :via)') as any : undefined;
>  .push({ from, to, via });
>  }
>  }
>  return { procs, };
> }
> // (hooks ...)
> export function parseHooks(form: SNode): Hooks {
>  const L = expectList(form, '(hooks ...)');
>  if (!isSym(L.items[0]) || L.items[0].v !== 'hooks') throw new Error('not hooks');
>  const out: Hooks = {};
>  for (let i = 1; i < L.items.length; i++) {
>  const sub = expectList(L.items[i], '(hooks section)');
>  const head = symText(sub.items[0], '(hooks section head)');
>  const tasks: (HookTask | HookInterval)[] = [];
>  for (let j = 1; j < sub.items.length; j++) {
>  const item = expectList(sub.items[j], '(hooks item)');
>  const h = symText(item.items[0], '(hooks item head)');
>  if (h === 'task') {
>  const nameNode = item.items[1];
>  const name = symText(nameNode, '(task name)');
>  const argsNode = kwArg(item.items, 'args');
>  const args = argsNode && isMap(argsNode) ? parseMapToJS(argsNode, '(task :args)') : undefined;
>  tasks.push({ type: 'task', name, args });
>  } else if (h === 'interval') {
>  const secNode = kwArg(item.items, 'seconds');
>  if (!secNode || secNode.t !== 'num') throw new VError('(interval ...)', 'missing numeric :seconds');
>  const nestedTask = item.items.find(n => isList(n) && listHeadSym(n as SNode) === 'task') as SNode | undefined;
>  if (!nestedTask) throw new VError('(interval ...)', 'missing (task ...)');
>  const tlist = expectList(nestedTask, '(interval task)');
>  const tname = symText(tlist.items[1], '(interval task name)');
>  const targsNode = kwArg(tlist.items, 'args');
>  const targs = targsNode && isMap(targsNode) ? parseMapToJS(targsNode, '(interval task :args)') : undefined;
>  tasks.push({ type: 'interval', seconds: (secNode as any).v, task: { type: 'task', name: tname, args: targs } });
>  }
>  }
>  if (head === 'init') out.init = tasks as HookTask[];
>  else if (head === 'tick') out.tick = tasks;
>  else if (head === 'exit') out.exit = tasks as HookTask[];
>  }
>  return out;
> }
> // (metrics ...)
> export function parseMetrics(form: SNode): Metrics {
>  const L = expectList(form, '(metrics ...)');
>  if (!isSym(L.items[0]) || L.items[0].v !== 'metrics') throw new Error('not metrics');
>  const sub = L.items[1];
>  if (!sub) return {};
>  const section = expectList(sub, '(metrics section)');
>  const head = symText(section.items[0], '(metrics head)');
>  if (head === 'scrape') {
>  const fromNode = kwArg(section.items, 'from');
>  const intervalNode = kwArg(section.items, 'interval');
>  if (!fromNode || !isVec(fromNode)) throw new VError('(metrics scrape ...)', 'expected vector after :from');
>  const from = fromNode.items.map(s => symText(s, '(metrics :from vec item)'));
>  const interval = intervalNode && intervalNode.t === 'num' ? (intervalNode as any).v : 30;
>  return { scrape: { from, interval } };
>  }
>  return {};
> }
> // (use ...)
> export function parseUse(form: SNode): UseRef {
>  const L = expectList(form, '(use ...)');
>  if (!isSym(L.items[0]) || L.items[0].v !== 'use') throw new Error('not use');
>  const blockSym = L.items[1];
>  const block = symText(blockSym, '(use block)');
>  const withNode = kwArg(L.items, 'with');
>  const withMap = withNode ? parseMapToJS(withNode, '(use :with)') : undefined;
>  return { block, with: withMap };
> }
> // (block ...)
> export function parseBlock(form: SNode): BlockModule {
>  const L = expectList(form, '(block ...)');
>  if (!isSym(L.items[0]) || L.items[0].v !== 'block') throw new Error('not block');
>  const id = symText(L.items[1], '(block id)');
>  const out: BlockModule = { kind: 'block', id };
>  const docs = kwArg(L.items, 'docs');
>  if (docs) out.docs = symText(docs, '(block :docs)');
>  for (let i = 2; i < L.items.length; i++) {
>  const sub = L.items[i];
>  if (!isList(sub)) continue;
>  const head = listHeadSym(sub);
>  if (head === 'requires') {
>  const servicesNode = kwArg((sub as any).items, 'services');
>  if (servicesNode && servicesNode.t === 'vec') {
>  out.requires = { services: servicesNode.items.map(s => symText(s, '(requires :services item)')) };
>  }
>  } else if (head === 'exports') {
>  const capsNode = kwArg((sub as any).items, 'capabilities');
>  const streamsNode = kwArg((sub as any).items, 'streams');
>  out.exports = {
>  capabilities: capsNode && capsNode.t === 'vec' ? capsNode.items.map(s => symText(s, '(exports :capabilities)')) : undefined,
>  streams: streamsNode && streamsNode.t === 'vec' ? streamsNode.items.map(s => symText(s, '(exports :streams)')) : undefined
>  };
>  } else if (head === 'parameters') {
>  out.parameters = parseMapToJS(sub.items[1], '(parameters)');
>  } else if (head === 'env') {
>  out.env = parseEnv(sub);
>  } else if (head === 'perm') {
>  out.perms = parsePerm(sub);
>  } else if (head === 'topology') {
>  out.topology = parseTopology(sub);
>  }
>  }
>  return out;
> }
> // (agent ...)
> export function parseAgent(form: SNode): AgentModule {
>  const L = expectList(form, '(agent ...)');
>  if (!isSym(L.items[0]) || L.items[0].v !== 'agent') throw new Error('not agent');
>  const idNode = kwArg(L.items, 'id');
>  const id = symText(req('(agent :id)', idNode), '(agent :id)');
>  const nameNode = kwArg(L.items, 'name');
>  const versionNode = kwArg(L.items, 'version');
>  const tagsNode = kwArg(L.items, 'tags');
>  const ownerNode = kwArg(L.items, 'owner');
>  const uses: UseRef[] = [];
>  let env: EnvMap = {};
>  let perms: Permissions = { fs: [], net: [] };
>  let topology: Topology = { procs: [], : [] };
>  let hooks: Hooks = {};
>  let metrics: Metrics | undefined;
>  for (let i = 1; i < L.items.length; i++) {
>  const it = L.items[i];
>  if (isList(it)) {
>  const head = listHeadSym(it);
>  if (head === 'use') uses.push(parseUse(it));
>  else if (head === 'env') env = { ...env, ...parseEnv(it) };
>  else if (head === 'perm') perms = parsePerm(it);
>  else if (head === 'topology') topology = parseTopology(it);
>  else if (head === 'hooks') hooks = parseHooks(it);
>  else if (head === 'metrics') metrics = parseMetrics(it);
>  }
>  }
>  return {
>  kind: 'agent',
>  id,
>  name: nameNode ? symText(nameNode, '(agent :name)') : undefined,
>  version: versionNode ? symText(versionNode, '(agent :version)') : undefined,
>  tags: tagsNode && tagsNode.t === 'vec' ? tagsNode.items.map(s => symText(s, '(agent :tags item)')) : undefined,
>  owner: ownerNode ? symText(ownerNode, '(agent :owner)') : undefined,
>  uses, env, perms, topology, hooks, metrics
>  };
> }
> export function parseTopLevel(form: SNode): Module {
>  const head = listHeadSym(form);
>  if (head === 'agent') return parseAgent(form);
>  if (head === 'block') return parseBlock(form);
>  throw new Error(`Unsupported top-level form: ${head}`);
> }
> // Accept either: a single form or a list/vector of forms
> export function parseModule(ast: any): Module[] {
>  const node = (typeof ast === 'object' && (ast.t === 'list' || ast.t === 'vec')) ? ast : { t: 'list', items: Array.isArray(ast) ? ast : [ast] } as any;
>  const forms: SNode[] = (node.t === 'list' || node.t === 'vec') ? (node as any).items : [node];
>  const out: Module[] = [];
>  for (const f of forms) { if (!isList(f)) continue; out.push(parseTopLevel(f)); }
>  return out;
> }
> EOF
> 
> ########################################
> # src/resolver.ts
> ########################################
> cat > "$ROOT/src/resolver.ts" <<'EOF'
> import { AgentModule, BlockModule, EnvMap, Module, Permissions, Topology } from "./types/dsl.js";
> 
> export type Registry = Map<string, BlockModule>;
> 
> /** Merge block env/perms/topology into agent, with simple precedence:
>  * - env: agent overrides block
>  * - perms: concatenated
>  * - topology: concatenated procs/
>  * Also substitute parameters in block proc args: values equal to ":$param" replaced from (use :with {param ...}).
>  */
> export function composeAgent(agent: AgentModule, reg: Registry): AgentModule {
>  let env: EnvMap = { ...agent.env };
>  let perms: Permissions = { fs: [...(agent.perms.fs ?? [])], net: [...(agent.perms.net ?? [])], gpu: agent.perms.gpu, proc: [...(agent.perms.proc ?? [])] };
>  let topology: Topology = { procs: [...(agent.topology.procs ?? [])], : [...(agent.topology. ?? [])] };
> 
>  for (const u of agent.uses) {
>  const blk = reg.get(u.block);
>  if (!blk) throw new Error(`Block not found: ${u.block}`);
>  if (blk.env) env = { ...blk.env, ...env }; // agent overrides
>  if (blk.perms) {
>  perms = {
>  fs: [...perms.fs, ...(blk.perms.fs ?? [])],
>  net: [...perms.net, ...(blk.perms.net ?? [])],
>  gpu: perms.gpu ?? blk.perms.gpu,
>  proc: [...(perms.proc ?? []), ...(blk.perms.proc ?? [])]
>  };
>  }
>  if (blk.topology) {
>  topology = {
>  procs: [...topology.procs, ...(blk.topology.procs ?? [])],
>  : [...topology., ...(blk.topology. ?? [])]
>  };
>  }
>  // parameter substitution
>  if (u.with && blk.topology?.procs) {
>  for (const p of topology.procs) {
>  if (!p.args) continue;
>  for (const [k, v] of Object.entries(p.args)) {
>  if (typeof v === 'string' && v.startsWith(':$')) {
>  const name = v.slice(2);
>  if (Object.prototype.hasOwnProperty.call(u.with, name)) {
>  (p.args as any)[k] = (u.with as any)[name];
>  }
>  }
>  }
>  }
>  }
>  }
> 
>  return { ...agent, env, perms, topology };
> }
> 
> export function registryFromModules(mods: Module[]): Registry {
>  const r: Registry = new Map();
>  for (const m of mods) if (m.kind === 'block') r.set(m.id, m);
>  return r;
> }
> EOF
> 
> ########################################
> # src/codegen/pm2.ts
> ########################################
> cat > "$ROOT/src/codegen/pm2.ts" <<'EOF'
> import { AgentModule, ProcDef } from "../types/dsl.js";
> 
> export function emitPm2Ecosystem(agent: AgentModule) {
>  const apps = agent.topology.procs.map(procToApp);
>  return `// Auto-generated for agent: ${agent.id}
> export default {
>  apps: ${JSON.stringify(apps, null, 2)}
> };
> `;
> }
> 
> function procToApp(p: ProcDef) {
>  const script = serviceToScript(p.service);
>  return {
>  name: `agent:${p.name}`,
>  script,
>  args: p.args ? JSON.stringify(p.args) : undefined,
>  env: mapEnv(p.env),
>  autorestart: true
>  };
> }
> 
> function serviceToScript(svc: string) {
>  if (svc.endsWith(".ts")) return svc;
>  if (svc.startsWith("services/")) return `${svc}/index.ts`;
>  return svc;
> }
> 
> function mapEnv(env?: Record<string, any>) {
>  if (!env) return undefined;
>  const out: Record<string, string> = {};
>  for (const [k, v] of Object.entries(env)) {
>  out[k] = typeof v === 'string' ? v : JSON.stringify(v);
>  }
>  return out;
> }
> EOF
> 
> ########################################
> # src/codegen/env.ts
> ########################################
> cat > "$ROOT/src/codegen/env.ts" <<'EOF'
> import { AgentModule } from "../types/dsl.js";
> 
> export function emitDotEnv(agent: AgentModule): string {
>  const lines: string[] = [];
>  for (const [k, v] of Object.entries(agent.env)) {
>  if (typeof v === 'string') lines.push(`${k}=${escapeVal(v)}`);
>  else if (v && v.kind === 'secret') lines.push(`${k}=${`__SECRET__:${v.key}`}`);
>  }
>  return lines.join('\n') + '\n';
> }
> 
> function escapeVal(v: string) {
>  if (/[\s#]/.test(v)) return JSON.stringify(v);
>  return v;
> }
> EOF
> 
> ########################################
> # src/codegen/permissions.ts
> ########################################
> cat > "$ROOT/src/codegen/permissions.ts" <<'EOF'
> import { AgentModule } from "../types/dsl.js";
> 
> export function emitPermissionsJSON(agent: AgentModule): string {
>  return JSON.stringify(agent.perms ?? {}, null, 2) + '\n';
> }
> EOF
> 
> ########################################
> # src/index.ts (library entry)
> ########################################
> cat > "$ROOT/src/index.ts" <<'EOF'
> import { parseModule } from "./parser/index.js";
> import { Module, AgentModule } from "./types/dsl.js";
> import { composeAgent, registryFromModules } from "./resolver.js";
> import { emitPm2Ecosystem } from "./codegen/pm2.js";
> import { emitDotEnv } from "./codegen/env.js";
> import { emitPermissionsJSON } from "./codegen/permissions.js";
> 
> export type BuiltArtifacts = {
>  pm2: string;
>  env: string;
>  permissions: string;
> };
> 
> export function buildFromModules(mods: Module[]): { agent: AgentModule, artifacts: BuiltArtifacts } {
>  const agent = mods.find(m => (m as Module).kind === 'agent') as AgentModule | undefined;
>  if (!agent) throw new Error('No (agent ...) form found among modules');
>  const reg = registryFromModules(mods);
>  const composed = composeAgent(agent, reg);
> 
>  const artifacts: BuiltArtifacts = {
>  pm2: emitPm2Ecosystem(composed),
>  env: emitDotEnv(composed),
>  permissions: emitPermissionsJSON(composed)
>  };
>  return { agent: composed, artifacts };
> }
> 
> export { parseModule } from "./parser/index.js";
> export { coerceNode } from "./types/sexpr.js";
> EOF
> 
> ########################################
> # src/bin/prom.ts (CLI)
> ########################################
> cat > "$ROOT/src/bin/prom.ts" <<'EOF'
> #!/usr/bin/env node
> import { Command } from "commander";
> import fs from "node:fs/promises";
> import path from "node:path";
> import { fileURLToPath, pathToFileURL } from "node:url";
> import { coerceNode } from "../types/sexpr.js";
> import { parseModule } from "../parser/index.js";
> import { buildFromModules } from "../index.js";
> import { execFile } from "node:child_process";
> 
> const program = new Command();
> 
> type ReaderMod = {
>  readFile?: (p: string) => any | Promise<any>;
>  read?: (s: string) => any | Promise<any>;
> };
> 
> async function loadReader(readerPath?: string): Promise<ReaderMod> {
>  if (!readerPath) {
>  throw new Error("No --reader provided. Please pass a path to your s-expression reader module.");
>  }
>  const abs = path.isAbsolute(readerPath) ? readerPath : path.join(process.cwd(), readerPath);
>  const mod = await import(pathToFileURL(abs).href);
>  return mod as ReaderMod;
> }
> 
> async function parseFilesWithReader(reader: ReaderMod, files: string[]) {
>  const modules = [];
>  for (const f of files) {
>  const abs = path.isAbsolute(f) ? f : path.join(process.cwd(), f);
>  const ast = reader.readFile ? await reader.readFile(abs) : (reader.read ? await reader.read(await fs.readFile(abs, "utf8")) : null);
>  if (!ast) throw new Error(`Reader did not return AST for ${f}`);
>  // Parse this file's AST into DSL modules and concatenate
>  const mods = parseModule(coerceNode(ast));
>  modules.push(...mods);
>  }
>  return modules;
> }
> 
> async function writeArtifacts(outDir: string, agentId: string, artifacts: { pm2: string, env: string, permissions: string }, topology: any) {
>  const target = path.join(outDir, agentId);
>  await fs.mkdir(target, { recursive: true });
>  await fs.writeFile(path.join(target, "ecosystem.config.mjs"), artifacts.pm2, "utf8");
>  await fs.writeFile(path.join(target, ".env"), artifacts.env, "utf8");
>  await fs.writeFile(path.join(target, "permissions.json"), artifacts.permissions, "utf8");
>  await fs.writeFile(path.join(target, "topology.json"), JSON.stringify(topology, null, 2) + "\n", "utf8");
>  return target;
> }
> 
> program
>  .name("prom")
>  .description("Promethean Agent DSL CLI")
>  .version("0.2.0");
> 
> program
>  .command("build")
>  .description("Build artifacts")
>  .command("agent <agentFile>")
>  .option("--reader <module>", "Path to ESM reader module exporting readFile()")
>  .option("--include <file...>", "Additional .sx files with blocks", [])
>  .option("--out <dir>", "Output base directory", "dist/agents")
>  .action(async (agentFile, opts) => {
>  try {
>  const reader = await loadReader(opts.reader);
>  const files = [agentFile, ...(opts.include ?? [])];
>  const mods = await parseFilesWithReader(reader, files);
>  const { agent, artifacts } = buildFromModules(mods);
>  const target = await writeArtifacts(opts.out, agent.id, artifacts, agent.topology);
>  console.log(`Built agent '${agent.id}' → ${target}`);
>  } catch (err: any) {
>  console.error("Build failed:", err?.stack || err?.message || String(err));
>  process.exit(1);
>  }
>  });
> 
> program
>  .command("run")
>  .description("Build and run an agent")
>  .command("agent <agentFile>")
>  .option("--reader <module>", "Path to ESM reader module exporting readFile()")
>  .option("--include <file...>", "Additional .sx files with blocks", [])
>  .option("--out <dir>", "Output base directory", "dist/agents")
>  .option("--pm2", "Start with PM2 (requires pm2 installed)", false)
>  .action(async (agentFile, opts) => {
>  try {
>  const reader = await loadReader(opts.reader);
>  const files = [agentFile, ...(opts.include ?? [])];
>  const mods = await parseFilesWithReader(reader, files);
>  const { agent, artifacts } = buildFromModules(mods);
>  const target = await writeArtifacts(opts.out, agent.id, artifacts, agent.topology);
>  console.log(`Built agent '${agent.id}' → ${target}`);
> 
>  if (opts.pm2) {
>  await new Promise<void>((resolve, reject) => {
>  execFile("pm2", ["start", path.join(target, "ecosystem.config.mjs"), "--update-env"], (err, stdout, stderr) => {
>  if (err) return reject(err);
>  process.stdout.write(stdout);
>  process.stderr.write(stderr);
>  resolve();
>  });
>  });
>  console.log(`PM2 started for agent '${agent.id}'.`);
>  } else {
>  console.log(`To run with PM2: pm2 start ${path.join(target, "ecosystem.config.mjs")} --update-env`);
>  }
>  } catch (err: any) {
>  console.error("Run failed:", err?.stack || err?.message || String(err));
>  process.exit(1);
>  }
>  });
> 
> program.parseAsync(process.argv);
> EOF
> chmod +x "$ROOT/src/bin/prom.ts"
> 
> ########################################
> # examples/duck.sx
> ########################################
> cat > "$ROOT/examples/duck.sx" <<'EOF'
> (agent
>  :id duck
>  :name "Duck"
>  (use discord.bot/v1)
>  (env {:DISCORD_TOKEN (secret :discord/duck)})
>  (perm
>  (fs :read ["/data/**"])
>  (net :egress ["*.discord.com"])
>  (gpu :allow true))
>  (topology
>  (proc :name :discord :service "services/ts/discord" :args {:agent "duck"})
>  (link :from :discord :to :cephalon :via :ws)))
> EOF
> 
> echo "✅ Wrote: $ROOT"
> echo "Next:"
> echo " cd $ROOT && npm i && npm run build"
> echo "Usage:"
> echo " prom build agent examples/duck.sx --reader ./your-reader.js --include ./blocks/discord.sx --out dist/agents"
> echo " prom run agent examples/duck.sx --reader ./your-reader.js --include ./blocks/discord.sx --out dist/agents --pm2"
> ```
> 
> That gives you:
> 
> - a clean **DSL library** (`coerceNode`, parsers, resolver, codegen)
> - a **`prom` CLI** with `build` and `run` (optional PM2 start)
> - sane output layout: `dist/agents/<id>/{ecosystem.config.mjs,.env,permissions.json,topology.json}`
> 
> If you want me to add a minimal **custom runner** (no PM2) that directly spawns processes based on `topology.json` (e.g., `node services/.../index.js`), say the word and I’ll drop that in too.
<!-- UID: 94c6d5bf-f6d4-4883-b347-67bfa49a330d -->

---


