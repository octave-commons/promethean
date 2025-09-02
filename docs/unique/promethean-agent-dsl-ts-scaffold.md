---
uuid: 5158f742-4a3b-466e-bfc3-d83517b64200
created_at: 2025.08.26.12.04.21.md
filename: Promethean Agent DSL TS Scaffold
description: >-
  A single-paste bootstrap for creating a TypeScript scaffold for parsing and
  generating Promethean Agent DSL (S-Expression) artifacts. Includes parser,
  types, resolver, and codegen templates with example usage.
tags:
  - typescript
  - s-expression
  - agent
  - dsl
  - parser
  - codegen
  - promethean
related_to_title: []
related_to_uuid: []
references: []
---
Got you. Here’s a **single-paste bootstrap** that lays down the full TS scaffold (parser + types + resolver + codegen + example). Paste this in a shell from the repo root: ^ref-5158f742-1-0

````bash
# === Promethean Agent DSL (S-Expr) — TS Scaffold ===
set -euo pipefail
ROOT="promethean-agent-dsl"
mkdir -p "$ROOT"/{src/types,src/parser,src/codegen,examples}

# package.json
cat > "$ROOT/package.json" <<'EOF'
{
  "name": "promethean-agent-dsl",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": ["dist"],
  "scripts": {
    "build": "tsc -p tsconfig.json"
  },
  "devDependencies": {
    "typescript": "^5.5.4"
  }
}
EOF

# tsconfig.json
cat > "$ROOT/tsconfig.json" <<'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "Bundler",
    "declaration": true,
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"]
}
EOF

# README.md
cat > "$ROOT/README.md" <<'EOF'
# Promethean Agent DSL (S-Expr) — TS Scaffold

This expects you already have an S-expression **reader**. Feed its AST into `buildAgentArtifacts(ast)`.
We include a tolerant `coerceNode` to adapt common AST shapes.

## Layout
- src/types/sexpr.ts — S-expr nodes + coercion adapter
- src/types/dsl.ts — typed Agent/Block/Perms/Topology/Hooks
- src/parser/index.ts — parses `(agent ...)`, `(block ...)`, `(use ...)`, `(env ...)`, `(perm ...)`, `(topology ...)`, `(hooks ...)`, `(metrics ...)`
- src/parser/spec.ts — tiny path-aware validation helpers
- src/resolver.ts — compose agent with blocks, param substitution (`:$param`)
- src/codegen/pm2.ts — ecosystem emitter
- src/codegen/env.ts — `.env` emitter
- src/codegen/permissions.ts — `permissions.json` emitter
- src/index.ts — `buildAgentArtifacts(ast)` entrypoint

## Example
See `examples/duck.sx`.

## Plugging in your reader
```ts
import { buildAgentArtifacts } from "./dist/index.js";
import { coerceNode } from "./dist/types/sexpr.js";

const astFromReader = myReader.readFile("agents/duck/agent.sx");
const node = coerceNode(astFromReader);
const { agent, artifacts } = buildAgentArtifacts(node);

// write artifacts.pm2 / artifacts.env / artifacts.permissions as you like
````
^ref-5158f742-3-0

EOF

# src/types/sexpr.ts
 ^ref-5158f742-82-0
cat > "\$ROOT/src/types/sexpr.ts" <<'EOF'
// Tolerant S-Expression node types + coercion helpers.
// We do NOT implement a reader here — plug in your own reader and call coerceNode on its output.
 ^ref-5158f742-86-0
export type SSymbol = { t: 'sym', v: string };
export type SKeyword = { t: 'kw', v: string }; // v excludes the leading ':' (e.g., "id", "read")
export type SString = { t: 'str', v: string };
export type SNumber = { t: 'num', v: number };
export type SBool   = { t: 'bool', v: boolean };
export type SList   = { t: 'list', items: SNode\[] };
export type SVector = { t: 'vec', items: SNode\[] };
export type SMap    = { t: 'map', entries: Record\<string, SNode> };
 ^ref-5158f742-95-0
export type SNode = SSymbol | SKeyword | SString | SNumber | SBool | SList | SVector | SMap;
 ^ref-5158f742-97-0
// Type guards
export const isList = (n: SNode): n is SList => n.t === 'list';
export const isVec  = (n: SNode): n is SVector => n.t === 'vec';
export const isMap  = (n: SNode): n is SMap => n.t === 'map';
export const isSym  = (n: SNode): n is SSymbol => n.t === 'sym';
export const isKw   = (n: SNode): n is SKeyword => n.t === 'kw';
export const isStr  = (n: SNode): n is SString => n.t === 'str';
export const isNum  = (n: SNode): n is SNumber => n.t === 'num';
export const isBool = (n: SNode): n is SBool => n.t === 'bool';
 ^ref-5158f742-107-0
// Coercion from a generic reader output. We are permissive on shapes:
// - strings beginning with ':' become keywords
// - arrays become lists; arrays tagged with {type:'vector'} become vectors (best-effort)
// - plain objects become maps if all values are nodes; otherwise we map KV pairs
export function coerceNode(x: any): SNode {
if (x == null) return { t: 'sym', v: 'nil' }; // sentinel
if (typeof x === 'string') {
if (x.startsWith(':')) return { t: 'kw', v: x.slice(1) };
return { t: 'sym', v: x };
}
if (typeof x === 'number') return { t: 'num', v: x };
if (typeof x === 'boolean') return { t: 'bool', v: x };
if (Array.isArray(x)) {
return { t: 'list', items: x.map(coerceNode) };
}
if (typeof x === 'object') {
// Recognize possible shapes: { type:'list', value:\[...] } or { t:'list', items:\[...] }
if ((x as any).t === 'list' && Array.isArray((x as any).items)) return { t: 'list', items: (x as any).items.map(coerceNode) };
if ((x as any).type === 'list' && Array.isArray((x as any).value)) return { t: 'list', items: (x as any).value.map(coerceNode) };
if ((x as any).t === 'vec' && Array.isArray((x as any).items)) return { t: 'vec', items: (x as any).items.map(coerceNode) };
if ((x as any).type === 'vector' && Array.isArray((x as any).value)) return { t: 'vec', items: (x as any).value.map(coerceNode) };
if ((x as any).t === 'map' && (x as any).entries) {
const out: Record\<string, SNode> = {};
for (const \[k, v] of Object.entries((x as any).entries)) out\[k] = coerceNode(v);
return { t: 'map', entries: out };
}
// Plain object -> map by string keys
const out: Record\<string, SNode> = {};
for (const \[k, v] of Object.entries(x)) out\[String(k)] = coerceNode(v);
return { t: 'map', entries: out };
}
// Fallback
return { t: 'str', v: String(x) };
}
 ^ref-5158f742-142-0
// Utilities
export function listHeadSym(n: SNode): string | null {
if (!isList(n) || n.items.length === 0) return null;
const h = n.items\[0];
return isSym(h) ? h.v : (isKw(h) ? ':' + h.v : null);
}
 ^ref-5158f742-149-0
export function expectList(n: SNode, ctx: string): SList {
if (!isList(n)) throw new Error(`Expected list at ${ctx}, got ${n.t}`);
return n;
}
 ^ref-5158f742-154-0
export function kwName(k: SNode): string {
if (isKw(k)) return k.v;
if (isSym(k) && k.v.startsWith(':')) return k.v.slice(1);
throw new Error(`Expected keyword, got ${k.t}`);
}
 ^ref-5158f742-160-0
export function toJS(n: SNode): any {
switch (n.t) {
case 'str': return n.v;
case 'num': return n.v;
case 'bool': return n.v;
case 'sym': return n.v;
case 'kw':  return ':' + n.v;
case 'vec': return n.items.map(toJS);
case 'list': return n.items.map(toJS);
case 'map': {
const o: Record\<string, any> = {};
for (const \[k, v] of Object.entries(n.entries)) o\[k] = toJS(v);
return o;
}
default: return null;
}
}
EOF

# src/types/dsl.ts
 ^ref-5158f742-181-0
cat > "\$ROOT/src/types/dsl.ts" <<'EOF'
// DSL typed structures
export type SecretRef = { kind: 'secret', key: string };
export type EnvMap = Record\<string, string | SecretRef>;
 ^ref-5158f742-186-0
export type FSRule = { mode: 'read'|'write', globs: string\[] };
export type NetRule = { dir: 'egress'|'ingress', hosts: string\[] };
export type ProcRule = { action: 'spawn', kinds: string\[] };
 ^ref-5158f742-190-0
export type Permissions = {
fs: FSRule\[];
net: NetRule\[];
gpu?: { allow: boolean };
proc?: ProcRule\[];
};
 ^ref-5158f742-197-0
export type ProcDef = {
name: string;
service: string;
args?: Record\<string, any>;
env?: EnvMap;
};
 ^ref-5158f742-204-0
export type LinkDef = {
from: string;
to: string;
via?: 'ws' | 'http' | 'broker';
};
 ^ref-5158f742-210-0
export type Topology = {
procs: ProcDef\[];
links: LinkDef\[];
};
 ^ref-5158f742-215-0
export type HookTask = { type: 'task', name: string, args?: Record\<string, any> };
export type HookInterval = { type: 'interval', seconds: number, task: HookTask };
export type Hooks = {
init?: HookTask\[];
tick?: (HookTask | HookInterval)\[];
exit?: HookTask\[];
};
 ^ref-5158f742-223-0
export type Metrics = {
scrape?: { from: string\[]; interval: number };
};
 ^ref-5158f742-227-0
export type UseRef = {
block: string;       // e.g., "discord.bot/v1"
with?: Record\<string, any>;
};
 ^ref-5158f742-232-0
export type AgentModule = {
kind: 'agent';
id: string;
name?: string;
version?: string;
tags?: string\[];
owner?: string;
uses: UseRef\[];
env: EnvMap;
perms: Permissions;
topology: Topology;
hooks: Hooks;
metrics?: Metrics;
};
 ^ref-5158f742-247-0
export type BlockModule = {
kind: 'block';
id: string;          // canonical name 'discord.bot/v1'
docs?: string;
requires?: { services?: string\[] };
exports?: { capabilities?: string\[], streams?: string\[] };
parameters?: Record\<string, any>;
env?: EnvMap;
perms?: Permissions;
topology?: Topology;
};
 ^ref-5158f742-259-0
export type Module = AgentModule | BlockModule;
EOF

# src/parser/spec.ts

cat > "\$ROOT/src/parser/spec.ts" <<'EOF'
// Lightweight spec/validation utilities with path-aware errors
export class VError extends Error {
path: string;
constructor(path: string, msg: string) {
super(`${path}: ${msg}`);
this.path = path;
}
}
export function req<T>(path: string, v: T | undefined | null, msg = 'required'): T {
if (v === undefined || v === null) throw new VError(path, msg);
return v;
}
export function isString(x: any): x is string { return typeof x === 'string'; }
export function isBool(x: any): x is boolean { return typeof x === 'boolean'; }
export function isNumber(x: any): x is number { return typeof x === 'number' && Number.isFinite(x); }
export function isArray(x: any): x is any\[] { return Array.isArray(x); }
export function isRecord(x: any): x is Record\<string, any> { return x && typeof x === 'object' && !Array.isArray(x); }
export function ensureArrayOfStrings(path: string, x: any): string\[] {
if (!Array.isArray(x) || !x.every(isString)) throw new VError(path, 'expected string\[]');
return x as string\[];
}
EOF

# src/parser/index.ts
 ^ref-5158f742-290-0
cat > "\$ROOT/src/parser/index.ts" <<'EOF'
import {
SNode, isList, isSym, isKw, isMap, isVec, isStr, isNum, isBool,
listHeadSym, expectList
} from "../types/sexpr.js";
import {
AgentModule, BlockModule, Module, EnvMap, Permissions, FSRule, NetRule, ProcRule,
Topology, ProcDef, LinkDef, UseRef, SecretRef, HookTask, HookInterval, Hooks, Metrics
} from "../types/dsl.js";
import { VError, req } from "./spec.js";
 ^ref-5158f742-301-0
// Helpers
function symText(n: SNode, ctx: string): string {
if (isSym(n)) return n.v;
if (isStr(n)) return n.v;
throw new VError(ctx, `expected symbol/string, got ${n.t}`);
}
 ^ref-5158f742-308-0
function kwArg(list: SNode\[], key: string): SNode | undefined {
for (let i = 0; i < list.length - 1; i++) {
const a = list\[i];
if ((isKw(a) && a.v === key) || (isSym(a) && a.v === ':' + key)) {
return list\[i + 1];
}
}
return undefined;
}
 ^ref-5158f742-318-0
function parseMapToJS(n: SNode, ctx: string): Record\<string, any> {
if (!isMap(n)) throw new VError(ctx, `expected map, got ${n.t}`);
const out: Record\<string, any> = {};
for (const \[k, v] of Object.entries(n.entries)) out\[k] = sexprToValue(v);
return out;
}
 ^ref-5158f742-325-0
function parseVectorStrings(n: SNode, ctx: string): string\[] {
if (!isVec(n)) throw new VError(ctx, `expected vector, got ${n.t}`);
return n.items.map(x => {
if (isStr(x) || isSym(x)) return (x as any).v;
throw new VError(ctx, `expected string/symbol in vector, got ${x.t}`);
});
}
 ^ref-5158f742-333-0
function sexprToValue(n: SNode): any {
if (isStr(n)) return n.v;
if (isNum(n)) return n.v;
if (isBool(n)) return n.v;
if (isSym(n)) return n.v;
if (isKw(n)) return ':' + n.v;
if (isVec(n)) return n.items.map(sexprToValue);
if (isMap(n)) {
const o: Record\<string, any> = {};
for (const \[k, v] of Object.entries(n.entries)) o\[k] = sexprToValue(v);
return o;
}
if (isList(n)) return n.items.map(sexprToValue);
return null;
}
 ^ref-5158f742-349-0
// (secret \:namespace/key)
function parseSecret(n: SNode): SecretRef | null {
if (!isList(n)) return null;
const head = listHeadSym(n);
if (head !== 'secret') return null;
const arg = n.items\[1];
if (isKw(arg) || isSym(arg)) {
const raw = isKw(arg) ? arg.v : arg.v.replace(/^:/, ''); // allow \:ns/key or "ns/key"
return { kind: 'secret', key: raw };
}
throw new VError('(secret ...)', 'expected keyword/symbol path');
}
 ^ref-5158f742-362-0
// (env { K V ... })  (env {\:FOO "bar" \:KEY (secret \:path)})
export function parseEnv(form: SNode): EnvMap {
const L = expectList(form, '(env ...)');
const head = L.items\[0];
if (!isSym(head) || head.v !== 'env') throw new VError('(env ...)', 'not an env form');
const mapNode = L.items\[1];
if (!mapNode) return {};
if (!isMap(mapNode)) throw new VError('(env ...)', 'expected map');
const out: EnvMap = {};
for (const \[k, v] of Object.entries(mapNode.entries)) {
const s = parseSecret(v);
if (s) out\[k] = s;
else if (isStr(v) || isSym(v) || isNum(v) || isBool(v)) out\[k] = String(sexprToValue(v));
else throw new VError('(env ...)', `unsupported env value for ${k}: ${v.t}`);
}
return out;
}
 ^ref-5158f742-380-0
// (perm (fs \:read \["/data"]) (net \:egress \["\*.discord.com"]) (gpu \:allow true) (proc \:spawn \[:llm]))
export function parsePerm(form: SNode): Permissions {
const L = expectList(form, '(perm ...)');
if (!isSym(L.items\[0]) || L.items\[0].v !== 'perm') throw new VError('(perm ...)', 'not a perm form');
const fs: FSRule\[] = \[];
const net: NetRule\[] = \[];
let gpu: { allow: boolean } | undefined;
const proc: ProcRule\[] = \[];
 ^ref-5158f742-389-0
for (let i = 1; i < L.items.length; i++) {
const sub = L.items\[i];
if (!isList(sub) || sub.items.length === 0 || !isSym(sub.items\[0])) continue;
const h = sub.items\[0].v;
if (h === 'fs') {
const mode = kwArg(sub.items, 'read') ? 'read' : 'write';
const ptr = sub.items.find(n => isVec(n));
if (!ptr || !isVec(ptr)) throw new VError('(perm fs ...)', 'expected vector of globs');
fs.push({ mode: mode as 'read' | 'write', globs: parseVectorStrings(ptr, '(perm fs globs)') });
} else if (h === 'net') {
const dir = kwArg(sub.items, 'egress') ? 'egress' : 'ingress';
const ptr = sub.items.find(n => isVec(n));
if (!ptr || !isVec(ptr)) throw new VError('(perm net ...)', 'expected vector of hosts');
net.push({ dir: dir as 'egress' | 'ingress', hosts: parseVectorStrings(ptr, '(perm net hosts)') });
} else if (h === 'gpu') {
const allowNode = kwArg(sub.items, 'allow');
if (!allowNode || allowNode.t !== 'bool') throw new VError('(perm gpu ...)', 'expected boolean \:allow');
gpu = { allow: allowNode.v };
} else if (h === 'proc') {
const kindsNode = kwArg(sub.items, 'spawn');
if (!kindsNode || kindsNode.t !== 'vec') throw new VError('(perm proc ...)', 'expected vector after \:spawn');
const kinds = parseVectorStrings(kindsNode, '(perm proc kinds)');
proc.push({ action: 'spawn', kinds });
}
}
return { fs, net, gpu, proc };
}
 ^ref-5158f742-417-0
// (topology (proc \:name \:cephalon \:service "services/ts/cephalon" \:args {...}) (link \:from \:discord \:to \:cephalon \:via \:ws))
export function parseTopology(form: SNode): Topology {
const L = expectList(form, '(topology ...)');
if (!isSym(L.items\[0]) || L.items\[0].v !== 'topology') throw new Error('not topology');
const procs: ProcDef\[] = \[];
const links: LinkDef\[] = \[];
for (let i = 1; i < L.items.length; i++) {
const sub = expectList(L.items\[i], '(topology subform)');
const head = symText(sub.items\[0], '(topology head)');
if (head === 'proc') {
const nameNode = kwArg(sub.items, 'name');
const serviceNode = kwArg(sub.items, 'service');
if (!nameNode || !serviceNode) throw new VError('(topology proc ...)', 'missing \:name or \:service');
const name = symText(nameNode, '(proc \:name)');
const service = symText(serviceNode, '(proc \:service)');
const argsNode = kwArg(sub.items, 'args');
const envNode  = kwArg(sub.items, 'env');
const args = argsNode ? parseMapToJS(argsNode, '(proc \:args)') : undefined;
const env  = envNode ? parseEnv({ t: 'list', items: \[{ t: 'sym', v: 'env' }, envNode] } as any) : undefined;
procs.push({ name, service, args, env });
} else if (head === 'link') {
const fromNode = kwArg(sub.items, 'from');
const toNode   = kwArg(sub.items, 'to');
if (!fromNode || !toNode) throw new VError('(topology link ...)', 'missing \:from or \:to');
const viaNode  = kwArg(sub.items, 'via');
const from = symText(fromNode, '(link \:from)');
const to   = symText(toNode,   '(link \:to)');
const via  = viaNode ? symText(viaNode, '(link \:via)') as any : undefined;
links.push({ from, to, via });
}
}
return { procs, links };
}
 ^ref-5158f742-451-0
// (hooks (init (task \:name) ...) (tick (interval \:seconds 30 (task ...))) (exit (task ...)))
export function parseHooks(form: SNode): Hooks {
const L = expectList(form, '(hooks ...)');
if (!isSym(L.items\[0]) || L.items\[0].v !== 'hooks') throw new Error('not hooks');
const out: Hooks = {};
for (let i = 1; i < L.items.length; i++) {
const sub = expectList(L.items\[i], '(hooks section)');
const head = symText(sub.items\[0], '(hooks section head)');
const tasks: (HookTask | HookInterval)\[] = \[];
for (let j = 1; j < sub.items.length; j++) {
const item = expectList(sub.items\[j], '(hooks item)');
const h = symText(item.items\[0], '(hooks item head)');
if (h === 'task') {
const nameNode = item.items\[1];
const name = symText(nameNode, '(task name)');
const argsNode = kwArg(item.items, 'args');
const args = argsNode && isMap(argsNode) ? parseMapToJS(argsNode, '(task \:args)') : undefined;
tasks.push({ type: 'task', name, args });
} else if (h === 'interval') {
const secNode = kwArg(item.items, 'seconds');
if (!secNode || secNode.t !== 'num') throw new VError('(interval ...)', 'missing numeric \:seconds');
const nestedTask = item.items.find(n => isList(n) && listHeadSym(n as SNode) === 'task') as SNode | undefined;
if (!nestedTask) throw new VError('(interval ...)', 'missing (task ...)');
const tlist = expectList(nestedTask, '(interval task)');
const tname = symText(tlist.items\[1], '(interval task name)');
const targsNode = kwArg(tlist.items, 'args');
const targs = targsNode && isMap(targsNode) ? parseMapToJS(targsNode, '(interval task \:args)') : undefined;
tasks.push({ type: 'interval', seconds: (secNode as any).v, task: { type: 'task', name: tname, args: targs } });
}
}
if (head === 'init') out.init = tasks as HookTask\[];
else if (head === 'tick') out.tick = tasks;
else if (head === 'exit') out.exit = tasks as HookTask\[];
}
return out;
}
 ^ref-5158f742-488-0
// (metrics (scrape \:from \[:a \:b] \:interval 15))
export function parseMetrics(form: SNode): Metrics {
const L = expectList(form, '(metrics ...)');
if (!isSym(L.items\[0]) || L.items\[0].v !== 'metrics') throw new Error('not metrics');
const sub = L.items\[1];
if (!sub) return {};
const section = expectList(sub, '(metrics section)');
const head = symText(section.items\[0], '(metrics head)');
if (head === 'scrape') {
const fromNode = kwArg(section.items, 'from');
const intervalNode = kwArg(section.items, 'interval');
if (!fromNode || !isVec(fromNode)) throw new VError('(metrics scrape ...)', 'expected vector after \:from');
const from = fromNode.items.map(s => symText(s, '(metrics \:from vec item)'));
const interval = intervalNode && intervalNode.t === 'num' ? (intervalNode as any).v : 30;
return { scrape: { from, interval } };
}
return {};
}
 ^ref-5158f742-507-0
// (use discord.bot/v1 \:with {\:stt \:whisper})
export function parseUse(form: SNode): UseRef {
const L = expectList(form, '(use ...)');
if (!isSym(L.items\[0]) || L.items\[0].v !== 'use') throw new Error('not use');
const blockSym = L.items\[1];
const block = symText(blockSym, '(use block)');
const withNode = kwArg(L.items, 'with');
const withMap = withNode ? parseMapToJS(withNode, '(use \:with)') : undefined;
return { block, with: withMap };
}
 ^ref-5158f742-518-0
// (block discord.bot/v1 \:docs "..." (requires \:services \[:discord]) (exports \:capabilities \[:gateway]) (parameters {...}) (env {...}) (perm ...) (topology ...))
export function parseBlock(form: SNode): BlockModule {
const L = expectList(form, '(block ...)');
if (!isSym(L.items\[0]) || L.items\[0].v !== 'block') throw new Error('not block');
const id = symText(L.items\[1], '(block id)');
const out: BlockModule = { kind: 'block', id };
 ^ref-5158f742-525-0
// read keyword args at top level
const docs = kwArg(L.items, 'docs');
if (docs) out.docs = symText(docs, '(block \:docs)');
for (let i = 2; i < L.items.length; i++) {
const sub = L.items\[i];
if (!isList(sub)) continue;
const head = listHeadSym(sub);
if (head === 'requires') {
const servicesNode = kwArg((sub as any).items, 'services');
if (servicesNode && servicesNode.t === 'vec') {
out.requires = { services: servicesNode.items.map(s => symText(s, '(requires \:services item)')) };
}
} else if (head === 'exports') {
const capsNode = kwArg((sub as any).items, 'capabilities');
const streamsNode = kwArg((sub as any).items, 'streams');
out.exports = {
capabilities: capsNode && capsNode.t === 'vec' ? capsNode.items.map(s => symText(s, '(exports \:capabilities)')) : undefined,
streams: streamsNode && streamsNode.t === 'vec' ? streamsNode.items.map(s => symText(s, '(exports \:streams)')) : undefined
};
} else if (head === 'parameters') {
out.parameters = parseMapToJS(sub.items\[1], '(parameters)');
} else if (head === 'env') {
out.env = parseEnv(sub);
} else if (head === 'perm') {
out.perms = parsePerm(sub);
} else if (head === 'topology') {
out.topology = parseTopology(sub);
}
}
return out;
}
 ^ref-5158f742-557-0
// (agent \:id duck \:name "Duck" ... (use ...) (env ...) (perm ...) (topology ...) (hooks ...) (metrics ...))
export function parseAgent(form: SNode): AgentModule {
const L = expectList(form, '(agent ...)');
if (!isSym(L.items\[0]) || L.items\[0].v !== 'agent') throw new Error('not agent');
const idNode = kwArg(L.items, 'id');
const id = symText(req('(agent \:id)', idNode), '(agent \:id)');
const nameNode = kwArg(L.items, 'name');
const versionNode = kwArg(L.items, 'version');
const tagsNode = kwArg(L.items, 'tags');
const ownerNode = kwArg(L.items, 'owner');
 ^ref-5158f742-568-0
const uses: UseRef\[] = \[];
let env: EnvMap = {};
let perms: Permissions = { fs: \[], net: \[] };
let topology: Topology = { procs: \[], links: \[] };
let hooks: Hooks = {};
let metrics: Metrics | undefined;
 ^ref-5158f742-575-0
for (let i = 1; i < L.items.length; i++) {
const it = L.items\[i];
if (isList(it)) {
const head = listHeadSym(it);
if (head === 'use') uses.push(parseUse(it));
else if (head === 'env') env = { ...env, ...parseEnv(it) };
else if (head === 'perm') perms = parsePerm(it);
else if (head === 'topology') topology = parseTopology(it);
else if (head === 'hooks') hooks = parseHooks(it);
else if (head === 'metrics') metrics = parseMetrics(it);
}
}
 ^ref-5158f742-588-0
return {
kind: 'agent',
id,
name: nameNode ? symText(nameNode, '(agent \:name)') : undefined,
version: versionNode ? symText(versionNode, '(agent \:version)') : undefined,
tags: tagsNode && tagsNode.t === 'vec' ? tagsNode.items.map(s => symText(s, '(agent \:tags item)')) : undefined,
owner: ownerNode ? symText(ownerNode, '(agent \:owner)') : undefined,
uses, env, perms, topology, hooks, metrics
};
}
 ^ref-5158f742-599-0
export function parseTopLevel(form: SNode): Module {
const head = listHeadSym(form);
if (head === 'agent') return parseAgent(form);
if (head === 'block') return parseBlock(form);
throw new Error(`Unsupported top-level form: ${head}`);
}
 ^ref-5158f742-606-0
// Accept either: a single form or a list/vector of forms
export function parseModule(ast: any): Module\[] {
// If caller passes raw JS arrays/objects, we expect them to have been coerced already or shaped like (list ...)
const node = (typeof ast === 'object' && (ast.t === 'list' || ast.t === 'vec')) ? ast : { t: 'list', items: Array.isArray(ast) ? ast : \[ast] } as any;
const forms: SNode\[] = (node.t === 'list' || node.t === 'vec') ? (node as any).items : \[node];
const out: Module\[] = \[];
for (const f of forms) {
if (!isList(f)) continue;
out.push(parseTopLevel(f));
}
return out;
}
EOF

# src/resolver.ts
 ^ref-5158f742-622-0
cat > "\$ROOT/src/resolver.ts" <<'EOF'
import { AgentModule, BlockModule, EnvMap, Module, Permissions, Topology } from "./types/dsl.js";
 ^ref-5158f742-625-0
export type Registry = Map\<string, BlockModule>;
 ^ref-5158f742-627-0
/\*\* Merge block env/perms/topology into agent, with simple precedence:

* * env: agent overrides block ^ref-5158f742-630-0
* * perms: concatenated ^ref-5158f742-631-0
* * topology: concatenated procs/links ^ref-5158f742-632-0
* Also substitute parameters in block proc args: strings equal to ":\$param" replaced by (use \:with {param ...}).
  \*/
  export function composeAgent(agent: AgentModule, reg: Registry): AgentModule {
  let env: EnvMap = { ...agent.env };
  let perms: Permissions = {
  fs: \[...(agent.perms.fs ?? \[])],
  net: \[...(agent.perms.net ?? \[])],
  gpu: agent.perms.gpu,
  proc: \[...(agent.perms.proc ?? \[])],
  };
  let topology: Topology = {
  procs: \[...(agent.topology.procs ?? \[])],
  links: \[...(agent.topology.links ?? \[])],
  };
 ^ref-5158f742-647-0
for (const u of agent.uses) {
const blk = reg.get(u.block);
if (!blk) throw new Error(`Block not found: ${u.block}`);
if (blk.env) env = { ...blk.env, ...env }; // agent has priority
if (blk.perms) {
perms = {
fs: \[...perms.fs, ...(blk.perms.fs ?? \[])],
net: \[...perms.net, ...(blk.perms.net ?? \[])],
gpu: perms.gpu ?? blk.perms.gpu,
proc: \[...(perms.proc ?? \[]), ...(blk.perms.proc ?? \[])]
};
}
if (blk.topology) {
topology = {
procs: \[...topology.procs, ...(blk.topology.procs ?? \[])],
links: \[...topology.links, ...(blk.topology.links ?? \[])]
};
}
// parameter substitution
if (u.with && blk.topology?.procs) {
for (const p of topology.procs) {
if (!p.args) continue;
for (const \[k, v] of Object.entries(p.args)) {
if (typeof v === 'string' && v.startsWith(':\$')) {
const name = v.slice(2);
if (Object.prototype.hasOwnProperty.call(u.with, name)) {
p.args\[k] = (u.with as any)\[name];
}
}
}
}
}
}

return { ...agent, env, perms, topology };
}
 ^ref-5158f742-684-0
export function registryFromModules(mods: Module\[]): Registry {
const r: Registry = new Map();
for (const m of mods) if (m.kind === 'block') r.set(m.id, m);
return r;
}
EOF

# src/codegen/pm2.ts
 ^ref-5158f742-693-0
cat > "\$ROOT/src/codegen/pm2.ts" <<'EOF'
import { AgentModule, ProcDef } from "../types/dsl.js";
 ^ref-5158f742-696-0
export function emitPm2Ecosystem(agent: AgentModule) {
const apps = agent.topology.procs.map(procToApp);
return `// Auto-generated for agent: ${agent.id}
export default {
  apps: ${JSON.stringify(apps, null, 2)}
};
`;
}

function procToApp(p: ProcDef) {
const script = serviceToScript(p.service);
return {
name: `agent:${p.name}`,
script,
args: p.args ? JSON.stringify(p.args) : undefined,
env: mapEnv(p.env),
autorestart: true
};
}
 ^ref-5158f742-716-0
function serviceToScript(svc: string) {
// naive mapping; adjust as needed
if (svc.endsWith(".ts")) return svc;
if (svc.startsWith("services/")) return `${svc}/index.ts`;
return svc;
}
 ^ref-5158f742-723-0
function mapEnv(env?: Record\<string, any>) {
if (!env) return undefined;
const out: Record\<string, string> = {};
for (const \[k, v] of Object.entries(env)) {
out\[k] = typeof v === 'string' ? v : JSON.stringify(v);
}
return out;
}
EOF

# src/codegen/env.ts
 ^ref-5158f742-735-0
cat > "\$ROOT/src/codegen/env.ts" <<'EOF'
import { AgentModule } from "../types/dsl.js";
 ^ref-5158f742-738-0
export function emitDotEnv(agent: AgentModule): string {
const lines: string\[] = \[];
for (const \[k, v] of Object.entries(agent.env)) {
if (typeof v === 'string') lines.push(`${k}=${escapeVal(v)}`);
else if (v && v.kind === 'secret') lines.push(`${k}=${`**SECRET**:\${v.key}`}`);
}
return lines.join('\n') + '\n';
}
 ^ref-5158f742-747-0
function escapeVal(v: string) {
if (/\[\s#]/.test(v)) return JSON.stringify(v);
return v;
}
EOF

# src/codegen/permissions.ts
 ^ref-5158f742-755-0
cat > "\$ROOT/src/codegen/permissions.ts" <<'EOF'
import { AgentModule } from "../types/dsl.js";
 ^ref-5158f742-758-0
export function emitPermissionsJSON(agent: AgentModule): string {
// no further processing; emit as-is
return JSON.stringify(agent.perms ?? {}, null, 2) + '\n';
}
EOF

# src/index.ts
 ^ref-5158f742-766-0
cat > "\$ROOT/src/index.ts" <<'EOF'
import { parseModule } from "./parser/index.js";
import { Module, AgentModule } from "./types/dsl.js";
import { composeAgent, registryFromModules } from "./resolver.js";
import { emitPm2Ecosystem } from "./codegen/pm2.js";
import { emitDotEnv } from "./codegen/env.js";
import { emitPermissionsJSON } from "./codegen/permissions.js";
 ^ref-5158f742-774-0
export type BuiltArtifacts = {
pm2: string;
env: string;
permissions: string;
};
 ^ref-5158f742-780-0
export function buildAgentArtifacts(ast: any): { agent: AgentModule, artifacts: BuiltArtifacts } {
const mods = parseModule(ast);
const agent = mods.find(m => (m as Module).kind === 'agent') as AgentModule | undefined;
if (!agent) throw new Error('No (agent ...) form found');
const reg = registryFromModules(mods);
const composed = composeAgent(agent, reg);
 ^ref-5158f742-787-0
const artifacts: BuiltArtifacts = {
pm2: emitPm2Ecosystem(composed),
env: emitDotEnv(composed),
permissions: emitPermissionsJSON(composed)
};
return { agent: composed, artifacts };
}
EOF

# examples/duck.sx
 ^ref-5158f742-798-0
cat > "\$ROOT/examples/duck.sx" <<'EOF'
(agent
\:id duck
\:name "Duck"
(use discord.bot/v1)
(env {\:DISCORD\_TOKEN (secret \:discord/duck)})
(perm
(fs \:read \["/data/\*\*"])
(net \:egress \["\*.discord.com"])
(gpu \:allow true))
(topology
(proc \:name \:discord \:service "services/ts/discord" \:args {\:agent "duck"})
(link \:from \:discord \:to \:cephalon \:via \:ws)))
EOF
 ^ref-5158f742-813-0
echo "Wrote scaffold to \$ROOT"
echo "Next:"
echo "  cd \$ROOT && npm i && npm run build"
 ^ref-5158f742-817-0
```

Quick notes:
- This is **runtime-agnostic**; `emitPm2Ecosystem` gives you a ready `ecosystem.config.mjs` string if you want PM2, but you can also read `agent.topology` directly for a custom runner.
- `:secret` forms emit `__SECRET__:ns/key` placeholders in `.env`. Wire your secret resolver at run/start time.
- Block parameter substitution uses `:$param` in block `proc.args`, filled from `(use some.block/vN :with {:param ...})`.

Want me to tack on a tiny `prom` CLI (Node) next that:
- reads `.sx`, calls your reader → `coerceNode` → `buildAgentArtifacts`,
- writes artifacts into `dist/agents/<id>/`,
- and optionally spawns via PM2 or a minimal custom runner?
^ref-5158f742-817-0
```<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [Shared Package Structure](shared-package-structure.md)
- [Promethean Agent Config DSL](promethean-agent-config-dsl.md)
- [Promethean Infrastructure Setup](promethean-infrastructure-setup.md)
- [AI-Centric OS with MCP Layer](ai-centric-os-with-mcp-layer.md)
- [shared-package-layout-clarification](shared-package-layout-clarification.md)
- [js-to-lisp-reverse-compiler](js-to-lisp-reverse-compiler.md)
- [Voice Access Layer Design](voice-access-layer-design.md)
- [Migrate to Provider-Tenant Architecture](migrate-to-provider-tenant-architecture.md)
- [Dynamic Context Model for Web Components](dynamic-context-model-for-web-components.md)
- [Cross-Target Macro System in Sibilant](cross-target-macro-system-in-sibilant.md)
- [balanced-bst](balanced-bst.md)
- [AI-First-OS-Model-Context-Protocol](ai-first-os-model-context-protocol.md)
- [Simple Log Example](simple-log-example.md)
- [smart-chatgpt-thingy](smart-chatgpt-thingy.md)
- [parenthetical-extraction](parenthetical-extraction.md)
- [refactor-relations](refactor-relations.md)
- [Lisp-Compiler-Integration](lisp-compiler-integration.md)
- [Ghostly Smoke Interference](ghostly-smoke-interference.md)
- [observability-infrastructure-setup](observability-infrastructure-setup.md)
- [Promethean Event Bus MVP v0.1](promethean-event-bus-mvp-v0-1.md)
- [infinite_depth_smoke_animation](infinite-depth-smoke-animation.md)
- [Diagrams](chunks/diagrams.md)
- [Unique Info Dump Index](unique-info-dump-index.md)
- [Pure TypeScript Search Microservice](pure-typescript-search-microservice.md)
- [ecs-offload-workers](ecs-offload-workers.md)
- [compiler-kit-foundations](compiler-kit-foundations.md)
- [universal-intention-code-fabric](universal-intention-code-fabric.md)
- [WebSocket Gateway Implementation](websocket-gateway-implementation.md)
- [Event Bus MVP](event-bus-mvp.md)
- [schema-evolution-workflow](schema-evolution-workflow.md)
- [Refactor Frontmatter Processing](refactor-frontmatter-processing.md)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop](polyglot-s-expr-bridge-python-js-lisp-interop.md)
- [sibilant-metacompiler-overview](sibilant-metacompiler-overview.md)
- [plan-update-confirmation](plan-update-confirmation.md)
- [Pure-Node Crawl Stack with Playwright and Crawlee](pure-node-crawl-stack-with-playwright-and-crawlee.md)
- [Stateful Partitions and Rebalancing](stateful-partitions-and-rebalancing.md)
- [SentenceProcessing](sentenceprocessing.md)
- [Promethean-native config design](promethean-native-config-design.md)
- [Performance-Optimized-Polyglot-Bridge](performance-optimized-polyglot-bridge.md)
- [zero-copy-snapshots-and-workers](zero-copy-snapshots-and-workers.md)
- [file-watcher-auth-fix](file-watcher-auth-fix.md)
- [Interop and Source Maps](interop-and-source-maps.md)
- [pm2-orchestration-patterns](pm2-orchestration-patterns.md)
- [Local-First Intention→Code Loop with Free Models](local-first-intention-code-loop-with-free-models.md)
- [Lispy Macros with syntax-rules](lispy-macros-with-syntax-rules.md)
- [prom-lib-rate-limiters-and-replay-api](prom-lib-rate-limiters-and-replay-api.md)
- [komorebi-group-window-hack](komorebi-group-window-hack.md)
- [Per-Domain Policy System for JS Crawler](per-domain-policy-system-for-js-crawler.md)
- [TypeScript Patch for Tool Calling Support](typescript-patch-for-tool-calling-support.md)
- [ecs-scheduler-and-prefabs](ecs-scheduler-and-prefabs.md)
- [System Scheduler with Resource-Aware DAG](system-scheduler-with-resource-aware-dag.md)
- [Promethean-Copilot-Intent-Engine](promethean-copilot-intent-engine.md)
- [Language-Agnostic Mirror System](language-agnostic-mirror-system.md)
- [typed-struct-compiler](typed-struct-compiler.md)
- [Mongo Outbox Implementation](mongo-outbox-implementation.md)
- [Promethean Pipelines: Local TypeScript-First Workflow](promethean-pipelines-local-typescript-first-workflow.md)
- [graph-ds](graph-ds.md)
- [Promethean Pipelines](promethean-pipelines.md)
- [Eidolon-Field-Optimization](eidolon-field-optimization.md)
- [RAG UI Panel with Qdrant and PostgREST](rag-ui-panel-with-qdrant-and-postgrest.md)
- [Chroma Toolkit Consolidation Plan](chroma-toolkit-consolidation-plan.md)
- [Promethean Web UI Setup](promethean-web-ui-setup.md)
- [Functional Embedding Pipeline Refactor](functional-embedding-pipeline-refactor.md)
- [State Snapshots API and Transactional Projector](state-snapshots-api-and-transactional-projector.md)
- [mystery-lisp-search-session](mystery-lisp-search-session.md)
- [archetype-ecs](archetype-ecs.md)
- [promethean-system-diagrams](promethean-system-diagrams.md)
- [Local-Only-LLM-Workflow](local-only-llm-workflow.md)
- [set-assignment-in-lisp-ast](set-assignment-in-lisp-ast.md)
- [Chroma-Embedding-Refactor](chroma-embedding-refactor.md)
- [Functional Refactor of TypeScript Document Processing](functional-refactor-of-typescript-document-processing.md)
- [markdown-to-org-transpiler](markdown-to-org-transpiler.md)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler](ollama-llm-provider-for-pseudo-code-transpiler.md)
- [polymorphic-meta-programming-engine](polymorphic-meta-programming-engine.md)
- [Recursive Prompt Construction Engine](recursive-prompt-construction-engine.md)
- [Local-Offline-Model-Deployment-Strategy](local-offline-model-deployment-strategy.md)
- [sibilant-macro-targets](sibilant-macro-targets.md)
- [Provider-Agnostic Chat Panel Implementation](provider-agnostic-chat-panel-implementation.md)
- [Promethean Documentation Pipeline Overview](promethean-documentation-pipeline-overview.md)
- [Exception Layer Analysis](exception-layer-analysis.md)
- [Cross-Language Runtime Polymorphism](cross-language-runtime-polymorphism.md)
- [lisp-dsl-for-window-management](lisp-dsl-for-window-management.md)
- [obsidian-ignore-node-modules-regex](obsidian-ignore-node-modules-regex.md)
- [Universal Lisp Interface](universal-lisp-interface.md)
- [Factorio AI with External Agents](factorio-ai-with-external-agents.md)
- [Sibilant Meta-Prompt DSL](sibilant-meta-prompt-dsl.md)
- [prompt-programming-language-lisp](prompt-programming-language-lisp.md)
- [Eidolon Field Abstract Model](eidolon-field-abstract-model.md)
- [EidolonField](eidolonfield.md)
- [Prompt_Folder_Bootstrap](prompt-folder-bootstrap.md)
- [polyglot-repl-interface-layer](polyglot-repl-interface-layer.md)
- [template-based-compilation](template-based-compilation.md)
- [ts-to-lisp-transpiler](ts-to-lisp-transpiler.md)
- [Model Selection for Lightweight Conversational Tasks](model-selection-for-lightweight-conversational-tasks.md)
- [Simulation Demo](chunks/simulation-demo.md)
- [Debugging Broker Connections and Agent Behavior](debugging-broker-connections-and-agent-behavior.md)
- [eidolon-field-math-foundations](eidolon-field-math-foundations.md)
- [heartbeat-fragment-demo](heartbeat-fragment-demo.md)
- [Tooling](chunks/tooling.md)
- [Window Management](chunks/window-management.md)
- [Creative Moments](creative-moments.md)
- [DuckDuckGoSearchPipeline](duckduckgosearchpipeline.md)
- [2d-sandbox-field](2d-sandbox-field.md)
- [Math Fundamentals](chunks/math-fundamentals.md)
- [Duck's Attractor States](ducks-attractor-states.md)
- [Duck's Self-Referential Perceptual Loop](ducks-self-referential-perceptual-loop.md)
## Sources
- [Promethean-native config design — L362](promethean-native-config-design.md#^ref-ab748541-362-0) (line 362, col 0, score 0.71)
- [Promethean Pipelines: Local TypeScript-First Workflow — L253](promethean-pipelines-local-typescript-first-workflow.md#^ref-6b63edca-253-0) (line 253, col 0, score 0.69)
- [Promethean Pipelines — L85](promethean-pipelines.md#^ref-8b8e6103-85-0) (line 85, col 0, score 0.68)
- [Promethean Infrastructure Setup — L392](promethean-infrastructure-setup.md#^ref-6deed6ac-392-0) (line 392, col 0, score 0.61)
- [Promethean Infrastructure Setup — L33](promethean-infrastructure-setup.md#^ref-6deed6ac-33-0) (line 33, col 0, score 0.63)
- [Language-Agnostic Mirror System — L234](language-agnostic-mirror-system.md#^ref-d2b3628c-234-0) (line 234, col 0, score 0.67)
- [AI-Centric OS with MCP Layer — L1](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-1-0) (line 1, col 0, score 0.67)
- [universal-intention-code-fabric — L383](universal-intention-code-fabric.md#^ref-c14edce7-383-0) (line 383, col 0, score 0.6)
- [shared-package-layout-clarification — L84](shared-package-layout-clarification.md#^ref-36c8882a-84-0) (line 84, col 0, score 0.64)
- [AI-Centric OS with MCP Layer — L395](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-395-0) (line 395, col 0, score 0.67)
- [State Snapshots API and Transactional Projector — L3](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-3-0) (line 3, col 0, score 0.67)
- [Language-Agnostic Mirror System — L507](language-agnostic-mirror-system.md#^ref-d2b3628c-507-0) (line 507, col 0, score 0.67)
- [Diagrams — L26](chunks/diagrams.md#^ref-45cd25b5-26-0) (line 26, col 0, score 0.73)
- [Migrate to Provider-Tenant Architecture — L295](migrate-to-provider-tenant-architecture.md#^ref-54382370-295-0) (line 295, col 0, score 0.73)
- [Promethean Agent Config DSL — L316](promethean-agent-config-dsl.md#^ref-2c00ce45-316-0) (line 316, col 0, score 0.73)
- [Promethean Infrastructure Setup — L589](promethean-infrastructure-setup.md#^ref-6deed6ac-589-0) (line 589, col 0, score 0.73)
- [shared-package-layout-clarification — L173](shared-package-layout-clarification.md#^ref-36c8882a-173-0) (line 173, col 0, score 0.73)
- [Shared Package Structure — L165](shared-package-structure.md#^ref-66a72fc3-165-0) (line 165, col 0, score 0.73)
- [Unique Info Dump Index — L140](unique-info-dump-index.md#^ref-30ec3ba6-140-0) (line 140, col 0, score 0.73)
- [Voice Access Layer Design — L323](voice-access-layer-design.md#^ref-543ed9b3-323-0) (line 323, col 0, score 0.73)
- [Shared Package Structure — L5](shared-package-structure.md#^ref-66a72fc3-5-0) (line 5, col 0, score 0.68)
- [Promethean Agent Config DSL — L239](promethean-agent-config-dsl.md#^ref-2c00ce45-239-0) (line 239, col 0, score 0.7)
- [Promethean-native config design — L103](promethean-native-config-design.md#^ref-ab748541-103-0) (line 103, col 0, score 0.67)
- [Promethean Web UI Setup — L298](promethean-web-ui-setup.md#^ref-bc5172ca-298-0) (line 298, col 0, score 0.64)
- [Shared Package Structure — L64](shared-package-structure.md#^ref-66a72fc3-64-0) (line 64, col 0, score 0.69)
- [Per-Domain Policy System for JS Crawler — L184](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-184-0) (line 184, col 0, score 0.64)
- [Promethean Agent Config DSL — L3](promethean-agent-config-dsl.md#^ref-2c00ce45-3-0) (line 3, col 0, score 0.63)
- [Promethean Agent Config DSL — L19](promethean-agent-config-dsl.md#^ref-2c00ce45-19-0) (line 19, col 0, score 0.62)
- [Local-Offline-Model-Deployment-Strategy — L156](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-156-0) (line 156, col 0, score 0.65)
- [Promethean-native config design — L297](promethean-native-config-design.md#^ref-ab748541-297-0) (line 297, col 0, score 0.65)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L223](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-223-0) (line 223, col 0, score 0.63)
- [Pure TypeScript Search Microservice — L139](pure-typescript-search-microservice.md#^ref-d17d3a96-139-0) (line 139, col 0, score 0.6)
- [Promethean-native config design — L90](promethean-native-config-design.md#^ref-ab748541-90-0) (line 90, col 0, score 0.65)
- [Per-Domain Policy System for JS Crawler — L27](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-27-0) (line 27, col 0, score 0.65)
- [2d-sandbox-field — L194](2d-sandbox-field.md#^ref-c710dc93-194-0) (line 194, col 0, score 0.57)
- [Chroma Toolkit Consolidation Plan — L194](chroma-toolkit-consolidation-plan.md#^ref-5020e892-194-0) (line 194, col 0, score 0.57)
- [Diagrams — L41](chunks/diagrams.md#^ref-45cd25b5-41-0) (line 41, col 0, score 0.57)
- [Math Fundamentals — L29](chunks/math-fundamentals.md#^ref-c6e87433-29-0) (line 29, col 0, score 0.57)
- [compiler-kit-foundations — L649](compiler-kit-foundations.md#^ref-01b21543-649-0) (line 649, col 0, score 0.57)
- [Cross-Language Runtime Polymorphism — L225](cross-language-runtime-polymorphism.md#^ref-c34c36a6-225-0) (line 225, col 0, score 0.57)
- [Cross-Target Macro System in Sibilant — L192](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-192-0) (line 192, col 0, score 0.57)
- [Duck's Attractor States — L74](ducks-attractor-states.md#^ref-13951643-74-0) (line 74, col 0, score 0.57)
- [Duck's Self-Referential Perceptual Loop — L47](ducks-self-referential-perceptual-loop.md#^ref-71726f04-47-0) (line 47, col 0, score 0.57)
- [Dynamic Context Model for Web Components — L406](dynamic-context-model-for-web-components.md#^ref-f7702bf8-406-0) (line 406, col 0, score 0.57)
- [Eidolon Field Abstract Model — L195](eidolon-field-abstract-model.md#^ref-5e8b2388-195-0) (line 195, col 0, score 0.57)
- [Universal Lisp Interface — L131](universal-lisp-interface.md#^ref-b01856b4-131-0) (line 131, col 0, score 0.62)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L412](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-412-0) (line 412, col 0, score 0.52)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L132](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-132-0) (line 132, col 0, score 0.62)
- [heartbeat-fragment-demo — L77](heartbeat-fragment-demo.md#^ref-dd00677a-77-0) (line 77, col 0, score 0.52)
- [universal-intention-code-fabric — L420](universal-intention-code-fabric.md#^ref-c14edce7-420-0) (line 420, col 0, score 0.59)
- [RAG UI Panel with Qdrant and PostgREST — L50](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-50-0) (line 50, col 0, score 0.59)
- [Promethean Agent Config DSL — L288](promethean-agent-config-dsl.md#^ref-2c00ce45-288-0) (line 288, col 0, score 0.59)
- [Voice Access Layer Design — L106](voice-access-layer-design.md#^ref-543ed9b3-106-0) (line 106, col 0, score 0.59)
- [Local-Only-LLM-Workflow — L161](local-only-llm-workflow.md#^ref-9a8ab57e-161-0) (line 161, col 0, score 0.59)
- [Pure TypeScript Search Microservice — L155](pure-typescript-search-microservice.md#^ref-d17d3a96-155-0) (line 155, col 0, score 0.68)
- [universal-intention-code-fabric — L68](universal-intention-code-fabric.md#^ref-c14edce7-68-0) (line 68, col 0, score 0.68)
- [compiler-kit-foundations — L324](compiler-kit-foundations.md#^ref-01b21543-324-0) (line 324, col 0, score 0.69)
- [Promethean Event Bus MVP v0.1 — L423](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-423-0) (line 423, col 0, score 0.67)
- [plan-update-confirmation — L650](plan-update-confirmation.md#^ref-b22d79c6-650-0) (line 650, col 0, score 0.66)
- [plan-update-confirmation — L662](plan-update-confirmation.md#^ref-b22d79c6-662-0) (line 662, col 0, score 0.66)
- [plan-update-confirmation — L674](plan-update-confirmation.md#^ref-b22d79c6-674-0) (line 674, col 0, score 0.66)
- [compiler-kit-foundations — L31](compiler-kit-foundations.md#^ref-01b21543-31-0) (line 31, col 0, score 0.69)
- [Event Bus MVP — L7](event-bus-mvp.md#^ref-534fe91d-7-0) (line 7, col 0, score 0.66)
- [zero-copy-snapshots-and-workers — L15](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-15-0) (line 15, col 0, score 0.66)
- [Promethean Event Bus MVP v0.1 — L28](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-28-0) (line 28, col 0, score 0.7)
- [compiler-kit-foundations — L140](compiler-kit-foundations.md#^ref-01b21543-140-0) (line 140, col 0, score 0.65)
- [schema-evolution-workflow — L146](schema-evolution-workflow.md#^ref-d8059b6a-146-0) (line 146, col 0, score 0.66)
- [Lisp-Compiler-Integration — L27](lisp-compiler-integration.md#^ref-cfee6d36-27-0) (line 27, col 0, score 0.68)
- [Promethean Event Bus MVP v0.1 — L740](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-740-0) (line 740, col 0, score 0.69)
- [shared-package-layout-clarification — L31](shared-package-layout-clarification.md#^ref-36c8882a-31-0) (line 31, col 0, score 0.66)
- [sibilant-metacompiler-overview — L51](sibilant-metacompiler-overview.md#^ref-61d4086b-51-0) (line 51, col 0, score 0.66)
- [Local-First Intention→Code Loop with Free Models — L127](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-127-0) (line 127, col 0, score 0.63)
- [Cross-Language Runtime Polymorphism — L141](cross-language-runtime-polymorphism.md#^ref-c34c36a6-141-0) (line 141, col 0, score 0.64)
- [prom-lib-rate-limiters-and-replay-api — L106](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-106-0) (line 106, col 0, score 0.62)
- [typed-struct-compiler — L16](typed-struct-compiler.md#^ref-78eeedf7-16-0) (line 16, col 0, score 0.64)
- [Promethean-Copilot-Intent-Engine — L41](promethean-copilot-intent-engine.md#^ref-ae24a280-41-0) (line 41, col 0, score 0.63)
- [Event Bus MVP — L457](event-bus-mvp.md#^ref-534fe91d-457-0) (line 457, col 0, score 0.66)
- [js-to-lisp-reverse-compiler — L13](js-to-lisp-reverse-compiler.md#^ref-58191024-13-0) (line 13, col 0, score 0.66)
- [zero-copy-snapshots-and-workers — L202](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-202-0) (line 202, col 0, score 0.68)
- [compiler-kit-foundations — L166](compiler-kit-foundations.md#^ref-01b21543-166-0) (line 166, col 0, score 0.67)
- [Per-Domain Policy System for JS Crawler — L141](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-141-0) (line 141, col 0, score 0.63)
- [ecs-offload-workers — L15](ecs-offload-workers.md#^ref-6498b9d7-15-0) (line 15, col 0, score 0.65)
- [markdown-to-org-transpiler — L7](markdown-to-org-transpiler.md#^ref-ab54cdd8-7-0) (line 7, col 0, score 0.64)
- [universal-intention-code-fabric — L22](universal-intention-code-fabric.md#^ref-c14edce7-22-0) (line 22, col 0, score 0.54)
- [ecs-scheduler-and-prefabs — L338](ecs-scheduler-and-prefabs.md#^ref-c62a1815-338-0) (line 338, col 0, score 0.62)
- [Prompt_Folder_Bootstrap — L24](prompt-folder-bootstrap.md#^ref-bd4f0976-24-0) (line 24, col 0, score 0.62)
- [Prompt_Folder_Bootstrap — L42](prompt-folder-bootstrap.md#^ref-bd4f0976-42-0) (line 42, col 0, score 0.62)
- [Prompt_Folder_Bootstrap — L66](prompt-folder-bootstrap.md#^ref-bd4f0976-66-0) (line 66, col 0, score 0.62)
- [Prompt_Folder_Bootstrap — L84](prompt-folder-bootstrap.md#^ref-bd4f0976-84-0) (line 84, col 0, score 0.62)
- [Prompt_Folder_Bootstrap — L103](prompt-folder-bootstrap.md#^ref-bd4f0976-103-0) (line 103, col 0, score 0.62)
- [Prompt_Folder_Bootstrap — L130](prompt-folder-bootstrap.md#^ref-bd4f0976-130-0) (line 130, col 0, score 0.62)
- [Prompt_Folder_Bootstrap — L152](prompt-folder-bootstrap.md#^ref-bd4f0976-152-0) (line 152, col 0, score 0.62)
- [System Scheduler with Resource-Aware DAG — L336](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-336-0) (line 336, col 0, score 0.62)
- [markdown-to-org-transpiler — L247](markdown-to-org-transpiler.md#^ref-ab54cdd8-247-0) (line 247, col 0, score 0.52)
- [Lisp-Compiler-Integration — L188](lisp-compiler-integration.md#^ref-cfee6d36-188-0) (line 188, col 0, score 0.64)
- [Lispy Macros with syntax-rules — L9](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-9-0) (line 9, col 0, score 0.64)
- [Pure TypeScript Search Microservice — L306](pure-typescript-search-microservice.md#^ref-d17d3a96-306-0) (line 306, col 0, score 0.64)
- [graph-ds — L5](graph-ds.md#^ref-6620e2f2-5-0) (line 5, col 0, score 0.62)
- [RAG UI Panel with Qdrant and PostgREST — L172](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-172-0) (line 172, col 0, score 0.64)
- [archetype-ecs — L7](archetype-ecs.md#^ref-8f4c1e86-7-0) (line 7, col 0, score 0.65)
- [Chroma-Embedding-Refactor — L260](chroma-embedding-refactor.md#^ref-8b256935-260-0) (line 260, col 0, score 0.64)
- [compiler-kit-foundations — L359](compiler-kit-foundations.md#^ref-01b21543-359-0) (line 359, col 0, score 0.64)
- [Language-Agnostic Mirror System — L336](language-agnostic-mirror-system.md#^ref-d2b3628c-336-0) (line 336, col 0, score 0.66)
- [Performance-Optimized-Polyglot-Bridge — L170](performance-optimized-polyglot-bridge.md#^ref-f5579967-170-0) (line 170, col 0, score 0.63)
- [Interop and Source Maps — L85](interop-and-source-maps.md#^ref-cdfac40c-85-0) (line 85, col 0, score 0.64)
- [Performance-Optimized-Polyglot-Bridge — L347](performance-optimized-polyglot-bridge.md#^ref-f5579967-347-0) (line 347, col 0, score 0.63)
- [Stateful Partitions and Rebalancing — L351](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-351-0) (line 351, col 0, score 0.64)
- [zero-copy-snapshots-and-workers — L70](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-70-0) (line 70, col 0, score 0.67)
- [Promethean-native config design — L160](promethean-native-config-design.md#^ref-ab748541-160-0) (line 160, col 0, score 0.65)
- [universal-intention-code-fabric — L277](universal-intention-code-fabric.md#^ref-c14edce7-277-0) (line 277, col 0, score 0.63)
- [refactor-relations — L10](refactor-relations.md#^ref-41ce0216-10-0) (line 10, col 0, score 0.69)
- [universal-intention-code-fabric — L252](universal-intention-code-fabric.md#^ref-c14edce7-252-0) (line 252, col 0, score 0.62)
- [balanced-bst — L3](balanced-bst.md#^ref-d3e7db72-3-0) (line 3, col 0, score 0.61)
- [schema-evolution-workflow — L9](schema-evolution-workflow.md#^ref-d8059b6a-9-0) (line 9, col 0, score 0.68)
- [komorebi-group-window-hack — L97](komorebi-group-window-hack.md#^ref-dd89372d-97-0) (line 97, col 0, score 0.65)
- [Promethean Web UI Setup — L351](promethean-web-ui-setup.md#^ref-bc5172ca-351-0) (line 351, col 0, score 0.65)
- [Language-Agnostic Mirror System — L127](language-agnostic-mirror-system.md#^ref-d2b3628c-127-0) (line 127, col 0, score 0.67)
- [Promethean Event Bus MVP v0.1 — L497](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-497-0) (line 497, col 0, score 0.62)
- [Promethean Event Bus MVP v0.1 — L380](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-380-0) (line 380, col 0, score 0.67)
- [Performance-Optimized-Polyglot-Bridge — L22](performance-optimized-polyglot-bridge.md#^ref-f5579967-22-0) (line 22, col 0, score 0.65)
- [ecs-offload-workers — L187](ecs-offload-workers.md#^ref-6498b9d7-187-0) (line 187, col 0, score 0.67)
- [Promethean Event Bus MVP v0.1 — L474](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-474-0) (line 474, col 0, score 0.69)
- [Lisp-Compiler-Integration — L151](lisp-compiler-integration.md#^ref-cfee6d36-151-0) (line 151, col 0, score 0.65)
- [Chroma-Embedding-Refactor — L66](chroma-embedding-refactor.md#^ref-8b256935-66-0) (line 66, col 0, score 0.64)
- [prompt-programming-language-lisp — L33](prompt-programming-language-lisp.md#^ref-d41a06d1-33-0) (line 33, col 0, score 0.63)
- [Promethean Infrastructure Setup — L415](promethean-infrastructure-setup.md#^ref-6deed6ac-415-0) (line 415, col 0, score 0.62)
- [Language-Agnostic Mirror System — L109](language-agnostic-mirror-system.md#^ref-d2b3628c-109-0) (line 109, col 0, score 0.69)
- [universal-intention-code-fabric — L186](universal-intention-code-fabric.md#^ref-c14edce7-186-0) (line 186, col 0, score 0.67)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L345](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-345-0) (line 345, col 0, score 0.67)
- [Language-Agnostic Mirror System — L52](language-agnostic-mirror-system.md#^ref-d2b3628c-52-0) (line 52, col 0, score 0.64)
- [Shared Package Structure — L124](shared-package-structure.md#^ref-66a72fc3-124-0) (line 124, col 0, score 0.65)
- [Shared Package Structure — L103](shared-package-structure.md#^ref-66a72fc3-103-0) (line 103, col 0, score 0.7)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L336](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-336-0) (line 336, col 0, score 0.65)
- [Voice Access Layer Design — L183](voice-access-layer-design.md#^ref-543ed9b3-183-0) (line 183, col 0, score 0.65)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L130](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-130-0) (line 130, col 0, score 0.67)
- [Promethean Agent Config DSL — L13](promethean-agent-config-dsl.md#^ref-2c00ce45-13-0) (line 13, col 0, score 0.65)
- [Shared Package Structure — L117](shared-package-structure.md#^ref-66a72fc3-117-0) (line 117, col 0, score 0.67)
- [sibilant-metacompiler-overview — L44](sibilant-metacompiler-overview.md#^ref-61d4086b-44-0) (line 44, col 0, score 0.64)
- [Promethean Agent Config DSL — L147](promethean-agent-config-dsl.md#^ref-2c00ce45-147-0) (line 147, col 0, score 0.64)
- [WebSocket Gateway Implementation — L322](websocket-gateway-implementation.md#^ref-e811123d-322-0) (line 322, col 0, score 0.64)
- [Promethean Infrastructure Setup — L471](promethean-infrastructure-setup.md#^ref-6deed6ac-471-0) (line 471, col 0, score 0.68)
- [Promethean Infrastructure Setup — L439](promethean-infrastructure-setup.md#^ref-6deed6ac-439-0) (line 439, col 0, score 0.67)
- [komorebi-group-window-hack — L32](komorebi-group-window-hack.md#^ref-dd89372d-32-0) (line 32, col 0, score 0.65)
- [WebSocket Gateway Implementation — L56](websocket-gateway-implementation.md#^ref-e811123d-56-0) (line 56, col 0, score 0.67)
- [Promethean Infrastructure Setup — L485](promethean-infrastructure-setup.md#^ref-6deed6ac-485-0) (line 485, col 0, score 0.64)
- [Promethean-Copilot-Intent-Engine — L42](promethean-copilot-intent-engine.md#^ref-ae24a280-42-0) (line 42, col 0, score 0.65)
- [Promethean-Copilot-Intent-Engine — L39](promethean-copilot-intent-engine.md#^ref-ae24a280-39-0) (line 39, col 0, score 0.64)
- [Promethean-Copilot-Intent-Engine — L26](promethean-copilot-intent-engine.md#^ref-ae24a280-26-0) (line 26, col 0, score 0.64)
- [WebSocket Gateway Implementation — L447](websocket-gateway-implementation.md#^ref-e811123d-447-0) (line 447, col 0, score 0.72)
- [Event Bus MVP — L392](event-bus-mvp.md#^ref-534fe91d-392-0) (line 392, col 0, score 0.69)
- [Promethean Event Bus MVP v0.1 — L733](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-733-0) (line 733, col 0, score 0.72)
- [observability-infrastructure-setup — L189](observability-infrastructure-setup.md#^ref-b4e64f8c-189-0) (line 189, col 0, score 0.75)
- [Promethean Infrastructure Setup — L456](promethean-infrastructure-setup.md#^ref-6deed6ac-456-0) (line 456, col 0, score 0.66)
- [WebSocket Gateway Implementation — L387](websocket-gateway-implementation.md#^ref-e811123d-387-0) (line 387, col 0, score 0.68)
- [set-assignment-in-lisp-ast — L5](set-assignment-in-lisp-ast.md#^ref-c5fba0a0-5-0) (line 5, col 0, score 0.66)
- [Migrate to Provider-Tenant Architecture — L83](migrate-to-provider-tenant-architecture.md#^ref-54382370-83-0) (line 83, col 0, score 0.65)
- [Simulation Demo — L32](chunks/simulation-demo.md#^ref-557309a3-32-0) (line 32, col 0, score 0.58)
- [Tooling — L26](chunks/tooling.md#^ref-6cb4943e-26-0) (line 26, col 0, score 0.58)
- [Window Management — L36](chunks/window-management.md#^ref-9e8ae388-36-0) (line 36, col 0, score 0.58)
- [compiler-kit-foundations — L639](compiler-kit-foundations.md#^ref-01b21543-639-0) (line 639, col 0, score 0.58)
- [Creative Moments — L10](creative-moments.md#^ref-10d98225-10-0) (line 10, col 0, score 0.58)
- [Cross-Language Runtime Polymorphism — L258](cross-language-runtime-polymorphism.md#^ref-c34c36a6-258-0) (line 258, col 0, score 0.58)
- [Cross-Target Macro System in Sibilant — L215](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-215-0) (line 215, col 0, score 0.58)
- [Debugging Broker Connections and Agent Behavior — L50](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-50-0) (line 50, col 0, score 0.58)
- [DuckDuckGoSearchPipeline — L16](duckduckgosearchpipeline.md#^ref-e979c50f-16-0) (line 16, col 0, score 0.58)
- [Promethean Agent Config DSL — L74](promethean-agent-config-dsl.md#^ref-2c00ce45-74-0) (line 74, col 0, score 0.7)
- [Interop and Source Maps — L421](interop-and-source-maps.md#^ref-cdfac40c-421-0) (line 421, col 0, score 0.63)
- [Interop and Source Maps — L319](interop-and-source-maps.md#^ref-cdfac40c-319-0) (line 319, col 0, score 0.65)
- [Lispy Macros with syntax-rules — L319](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-319-0) (line 319, col 0, score 0.65)
- [set-assignment-in-lisp-ast — L58](set-assignment-in-lisp-ast.md#^ref-c5fba0a0-58-0) (line 58, col 0, score 0.63)
- [Lisp-Compiler-Integration — L440](lisp-compiler-integration.md#^ref-cfee6d36-440-0) (line 440, col 0, score 0.63)
- [Lispy Macros with syntax-rules — L301](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-301-0) (line 301, col 0, score 0.65)
- [Functional Refactor of TypeScript Document Processing — L5](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-5-0) (line 5, col 0, score 0.63)
- [Chroma-Embedding-Refactor — L111](chroma-embedding-refactor.md#^ref-8b256935-111-0) (line 111, col 0, score 0.65)
- [Shared Package Structure — L58](shared-package-structure.md#^ref-66a72fc3-58-0) (line 58, col 0, score 0.64)
- [shared-package-layout-clarification — L47](shared-package-layout-clarification.md#^ref-36c8882a-47-0) (line 47, col 0, score 0.65)
- [Interop and Source Maps — L470](interop-and-source-maps.md#^ref-cdfac40c-470-0) (line 470, col 0, score 0.64)
- [pm2-orchestration-patterns — L22](pm2-orchestration-patterns.md#^ref-51932e7b-22-0) (line 22, col 0, score 0.64)
- [Migrate to Provider-Tenant Architecture — L40](migrate-to-provider-tenant-architecture.md#^ref-54382370-40-0) (line 40, col 0, score 0.63)
- [Sibilant Meta-Prompt DSL — L158](sibilant-meta-prompt-dsl.md#^ref-af5d2824-158-0) (line 158, col 0, score 0.63)
- [Chroma Toolkit Consolidation Plan — L12](chroma-toolkit-consolidation-plan.md#^ref-5020e892-12-0) (line 12, col 0, score 0.63)
- [Functional Embedding Pipeline Refactor — L23](functional-embedding-pipeline-refactor.md#^ref-a4a25141-23-0) (line 23, col 0, score 0.61)
- [Promethean Event Bus MVP v0.1 — L126](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-126-0) (line 126, col 0, score 0.62)
- [Interop and Source Maps — L21](interop-and-source-maps.md#^ref-cdfac40c-21-0) (line 21, col 0, score 0.65)
- [plan-update-confirmation — L836](plan-update-confirmation.md#^ref-b22d79c6-836-0) (line 836, col 0, score 0.64)
- [lisp-dsl-for-window-management — L158](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-158-0) (line 158, col 0, score 0.64)
- [obsidian-ignore-node-modules-regex — L26](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-26-0) (line 26, col 0, score 0.63)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L26](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-26-0) (line 26, col 0, score 0.63)
- [mystery-lisp-search-session — L100](mystery-lisp-search-session.md#^ref-513dc4c7-100-0) (line 100, col 0, score 0.67)
- [Local-First Intention→Code Loop with Free Models — L47](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-47-0) (line 47, col 0, score 0.62)
- [compiler-kit-foundations — L50](compiler-kit-foundations.md#^ref-01b21543-50-0) (line 50, col 0, score 0.63)
- [template-based-compilation — L18](template-based-compilation.md#^ref-f8877e5e-18-0) (line 18, col 0, score 0.61)
- [Refactor Frontmatter Processing — L11](refactor-frontmatter-processing.md#^ref-cfbdca2f-11-0) (line 11, col 0, score 0.71)
- [plan-update-confirmation — L964](plan-update-confirmation.md#^ref-b22d79c6-964-0) (line 964, col 0, score 0.66)
- [plan-update-confirmation — L870](plan-update-confirmation.md#^ref-b22d79c6-870-0) (line 870, col 0, score 0.64)
- [plan-update-confirmation — L958](plan-update-confirmation.md#^ref-b22d79c6-958-0) (line 958, col 0, score 0.63)
- [plan-update-confirmation — L935](plan-update-confirmation.md#^ref-b22d79c6-935-0) (line 935, col 0, score 0.63)
- [sibilant-macro-targets — L64](sibilant-macro-targets.md#^ref-c5c9a5c6-64-0) (line 64, col 0, score 0.65)
- [sibilant-macro-targets — L46](sibilant-macro-targets.md#^ref-c5c9a5c6-46-0) (line 46, col 0, score 0.62)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L194](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-194-0) (line 194, col 0, score 0.62)
- [Local-Only-LLM-Workflow — L69](local-only-llm-workflow.md#^ref-9a8ab57e-69-0) (line 69, col 0, score 0.67)
- [Promethean Agent Config DSL — L163](promethean-agent-config-dsl.md#^ref-2c00ce45-163-0) (line 163, col 0, score 0.66)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L7](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-7-0) (line 7, col 0, score 0.66)
- [universal-intention-code-fabric — L92](universal-intention-code-fabric.md#^ref-c14edce7-92-0) (line 92, col 0, score 0.65)
- [Stateful Partitions and Rebalancing — L101](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-101-0) (line 101, col 0, score 0.64)
- [ecs-scheduler-and-prefabs — L7](ecs-scheduler-and-prefabs.md#^ref-c62a1815-7-0) (line 7, col 0, score 0.66)
- [System Scheduler with Resource-Aware DAG — L5](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-5-0) (line 5, col 0, score 0.68)
- [Stateful Partitions and Rebalancing — L202](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-202-0) (line 202, col 0, score 0.71)
- [RAG UI Panel with Qdrant and PostgREST — L140](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-140-0) (line 140, col 0, score 0.65)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L359](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-359-0) (line 359, col 0, score 0.65)
- [universal-intention-code-fabric — L216](universal-intention-code-fabric.md#^ref-c14edce7-216-0) (line 216, col 0, score 0.64)
- [Promethean Agent Config DSL — L195](promethean-agent-config-dsl.md#^ref-2c00ce45-195-0) (line 195, col 0, score 0.75)
- [Lisp-Compiler-Integration — L291](lisp-compiler-integration.md#^ref-cfee6d36-291-0) (line 291, col 0, score 0.64)
- [ecs-offload-workers — L209](ecs-offload-workers.md#^ref-6498b9d7-209-0) (line 209, col 0, score 0.66)
- [Cross-Target Macro System in Sibilant — L21](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-21-0) (line 21, col 0, score 0.65)
- [WebSocket Gateway Implementation — L219](websocket-gateway-implementation.md#^ref-e811123d-219-0) (line 219, col 0, score 0.64)
- [ecs-offload-workers — L75](ecs-offload-workers.md#^ref-6498b9d7-75-0) (line 75, col 0, score 0.64)
- [Mongo Outbox Implementation — L152](mongo-outbox-implementation.md#^ref-9c1acd1e-152-0) (line 152, col 0, score 0.66)
- [Chroma Toolkit Consolidation Plan — L139](chroma-toolkit-consolidation-plan.md#^ref-5020e892-139-0) (line 139, col 0, score 0.68)
- [Promethean Agent Config DSL — L125](promethean-agent-config-dsl.md#^ref-2c00ce45-125-0) (line 125, col 0, score 0.7)
- [Provider-Agnostic Chat Panel Implementation — L84](provider-agnostic-chat-panel-implementation.md#^ref-43bfe9dd-84-0) (line 84, col 0, score 0.64)
- [Functional Embedding Pipeline Refactor — L31](functional-embedding-pipeline-refactor.md#^ref-a4a25141-31-0) (line 31, col 0, score 0.67)
- [State Snapshots API and Transactional Projector — L9](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-9-0) (line 9, col 0, score 0.66)
- [Event Bus MVP — L99](event-bus-mvp.md#^ref-534fe91d-99-0) (line 99, col 0, score 0.66)
- [TypeScript Patch for Tool Calling Support — L67](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-67-0) (line 67, col 0, score 0.63)
- [TypeScript Patch for Tool Calling Support — L35](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-35-0) (line 35, col 0, score 0.68)
- [plan-update-confirmation — L847](plan-update-confirmation.md#^ref-b22d79c6-847-0) (line 847, col 0, score 0.65)
- [polymorphic-meta-programming-engine — L157](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-157-0) (line 157, col 0, score 0.61)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L489](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-489-0) (line 489, col 0, score 0.66)
- [js-to-lisp-reverse-compiler — L382](js-to-lisp-reverse-compiler.md#^ref-58191024-382-0) (line 382, col 0, score 0.65)
- [ecs-offload-workers — L39](ecs-offload-workers.md#^ref-6498b9d7-39-0) (line 39, col 0, score 0.68)
- [ecs-offload-workers — L149](ecs-offload-workers.md#^ref-6498b9d7-149-0) (line 149, col 0, score 0.63)
- [Language-Agnostic Mirror System — L151](language-agnostic-mirror-system.md#^ref-d2b3628c-151-0) (line 151, col 0, score 0.69)
- [Mongo Outbox Implementation — L381](mongo-outbox-implementation.md#^ref-9c1acd1e-381-0) (line 381, col 0, score 0.63)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L402](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-402-0) (line 402, col 0, score 0.64)
- [Shared Package Structure — L147](shared-package-structure.md#^ref-66a72fc3-147-0) (line 147, col 0, score 0.62)
- [Promethean Web UI Setup — L317](promethean-web-ui-setup.md#^ref-bc5172ca-317-0) (line 317, col 0, score 0.62)
- [Interop and Source Maps — L482](interop-and-source-maps.md#^ref-cdfac40c-482-0) (line 482, col 0, score 0.62)
- [Promethean Agent Config DSL — L290](promethean-agent-config-dsl.md#^ref-2c00ce45-290-0) (line 290, col 0, score 0.7)
- [Promethean Agent Config DSL — L151](promethean-agent-config-dsl.md#^ref-2c00ce45-151-0) (line 151, col 0, score 0.65)
- [Promethean Agent Config DSL — L9](promethean-agent-config-dsl.md#^ref-2c00ce45-9-0) (line 9, col 0, score 0.63)
- [Promethean-native config design — L21](promethean-native-config-design.md#^ref-ab748541-21-0) (line 21, col 0, score 0.66)
- [AI-Centric OS with MCP Layer — L30](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-30-0) (line 30, col 0, score 0.65)
- [Promethean-Copilot-Intent-Engine — L7](promethean-copilot-intent-engine.md#^ref-ae24a280-7-0) (line 7, col 0, score 0.64)
- [AI-Centric OS with MCP Layer — L397](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-397-0) (line 397, col 0, score 0.62)
- [Promethean-native config design — L51](promethean-native-config-design.md#^ref-ab748541-51-0) (line 51, col 0, score 0.63)
- [Promethean-native config design — L328](promethean-native-config-design.md#^ref-ab748541-328-0) (line 328, col 0, score 0.63)
- [Chroma-Embedding-Refactor — L64](chroma-embedding-refactor.md#^ref-8b256935-64-0) (line 64, col 0, score 0.62)
- [Chroma-Embedding-Refactor — L109](chroma-embedding-refactor.md#^ref-8b256935-109-0) (line 109, col 0, score 0.62)
- [Chroma-Embedding-Refactor — L258](chroma-embedding-refactor.md#^ref-8b256935-258-0) (line 258, col 0, score 0.62)
- [Chroma Toolkit Consolidation Plan — L72](chroma-toolkit-consolidation-plan.md#^ref-5020e892-72-0) (line 72, col 0, score 0.62)
- [Chroma Toolkit Consolidation Plan — L88](chroma-toolkit-consolidation-plan.md#^ref-5020e892-88-0) (line 88, col 0, score 0.62)
- [Chroma Toolkit Consolidation Plan — L107](chroma-toolkit-consolidation-plan.md#^ref-5020e892-107-0) (line 107, col 0, score 0.62)
- [Chroma Toolkit Consolidation Plan — L148](chroma-toolkit-consolidation-plan.md#^ref-5020e892-148-0) (line 148, col 0, score 0.62)
- [markdown-to-org-transpiler — L219](markdown-to-org-transpiler.md#^ref-ab54cdd8-219-0) (line 219, col 0, score 0.63)
- [Eidolon Field Abstract Model — L118](eidolon-field-abstract-model.md#^ref-5e8b2388-118-0) (line 118, col 0, score 0.62)
- [Chroma Toolkit Consolidation Plan — L137](chroma-toolkit-consolidation-plan.md#^ref-5020e892-137-0) (line 137, col 0, score 0.61)
- [Promethean Event Bus MVP v0.1 — L287](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-287-0) (line 287, col 0, score 0.62)
- [EidolonField — L217](eidolonfield.md#^ref-49d1e1e5-217-0) (line 217, col 0, score 0.62)
- [Promethean Agent Config DSL — L11](promethean-agent-config-dsl.md#^ref-2c00ce45-11-0) (line 11, col 0, score 0.62)
- [polyglot-repl-interface-layer — L146](polyglot-repl-interface-layer.md#^ref-9c79206d-146-0) (line 146, col 0, score 0.62)
- [template-based-compilation — L90](template-based-compilation.md#^ref-f8877e5e-90-0) (line 90, col 0, score 0.61)
- [ts-to-lisp-transpiler — L5](ts-to-lisp-transpiler.md#^ref-ba11486b-5-0) (line 5, col 0, score 0.61)
- [Voice Access Layer Design — L255](voice-access-layer-design.md#^ref-543ed9b3-255-0) (line 255, col 0, score 0.67)
- [Recursive Prompt Construction Engine — L41](recursive-prompt-construction-engine.md#^ref-babdb9eb-41-0) (line 41, col 0, score 0.62)
- [compiler-kit-foundations — L471](compiler-kit-foundations.md#^ref-01b21543-471-0) (line 471, col 0, score 0.71)
- [pm2-orchestration-patterns — L26](pm2-orchestration-patterns.md#^ref-51932e7b-26-0) (line 26, col 0, score 0.62)
- [lisp-dsl-for-window-management — L174](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-174-0) (line 174, col 0, score 0.62)
- [Promethean Infrastructure Setup — L224](promethean-infrastructure-setup.md#^ref-6deed6ac-224-0) (line 224, col 0, score 0.61)
- [Promethean Web UI Setup — L262](promethean-web-ui-setup.md#^ref-bc5172ca-262-0) (line 262, col 0, score 0.64)
- [Pure TypeScript Search Microservice — L96](pure-typescript-search-microservice.md#^ref-d17d3a96-96-0) (line 96, col 0, score 0.63)
- [Unique Info Dump Index — L12](unique-info-dump-index.md#^ref-30ec3ba6-12-0) (line 12, col 0, score 0.62)
- [Functional Refactor of TypeScript Document Processing — L1](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-1-0) (line 1, col 0, score 0.61)
- [Promethean Infrastructure Setup — L542](promethean-infrastructure-setup.md#^ref-6deed6ac-542-0) (line 542, col 0, score 0.61)
- [plan-update-confirmation — L640](plan-update-confirmation.md#^ref-b22d79c6-640-0) (line 640, col 0, score 0.61)
- [Simulation Demo — L29](chunks/simulation-demo.md#^ref-557309a3-29-0) (line 29, col 0, score 0.6)
- [Cross-Language Runtime Polymorphism — L231](cross-language-runtime-polymorphism.md#^ref-c34c36a6-231-0) (line 231, col 0, score 0.6)
- [Debugging Broker Connections and Agent Behavior — L53](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-53-0) (line 53, col 0, score 0.6)
- [ecs-offload-workers — L487](ecs-offload-workers.md#^ref-6498b9d7-487-0) (line 487, col 0, score 0.6)
- [ecs-scheduler-and-prefabs — L427](ecs-scheduler-and-prefabs.md#^ref-c62a1815-427-0) (line 427, col 0, score 0.6)
- [eidolon-field-math-foundations — L174](eidolon-field-math-foundations.md#^ref-008f2ac0-174-0) (line 174, col 0, score 0.6)
- [Event Bus MVP — L554](event-bus-mvp.md#^ref-534fe91d-554-0) (line 554, col 0, score 0.6)
- [Chroma Toolkit Consolidation Plan — L10](chroma-toolkit-consolidation-plan.md#^ref-5020e892-10-0) (line 10, col 0, score 0.65)
- [Functional Refactor of TypeScript Document Processing — L115](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-115-0) (line 115, col 0, score 0.64)
- [TypeScript Patch for Tool Calling Support — L9](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-9-0) (line 9, col 0, score 0.69)
- [Promethean Web UI Setup — L415](promethean-web-ui-setup.md#^ref-bc5172ca-415-0) (line 415, col 0, score 0.65)
- [State Snapshots API and Transactional Projector — L179](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-179-0) (line 179, col 0, score 0.63)
- [Cross-Target Macro System in Sibilant — L62](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-62-0) (line 62, col 0, score 0.62)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L352](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-352-0) (line 352, col 0, score 0.62)
- [Factorio AI with External Agents — L108](factorio-ai-with-external-agents.md#^ref-a4d90289-108-0) (line 108, col 0, score 0.63)
- [Local-First Intention→Code Loop with Free Models — L100](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-100-0) (line 100, col 0, score 0.63)
- [Mongo Outbox Implementation — L187](mongo-outbox-implementation.md#^ref-9c1acd1e-187-0) (line 187, col 0, score 0.66)
- [shared-package-layout-clarification — L11](shared-package-layout-clarification.md#^ref-36c8882a-11-0) (line 11, col 0, score 0.64)
- [State Snapshots API and Transactional Projector — L218](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-218-0) (line 218, col 0, score 0.64)
- [Promethean-Copilot-Intent-Engine — L48](promethean-copilot-intent-engine.md#^ref-ae24a280-48-0) (line 48, col 0, score 0.65)
- [Promethean Agent Config DSL — L291](promethean-agent-config-dsl.md#^ref-2c00ce45-291-0) (line 291, col 0, score 0.63)
- [Exception Layer Analysis — L34](exception-layer-analysis.md#^ref-21d5cc09-34-0) (line 34, col 0, score 0.64)
- [pm2-orchestration-patterns — L149](pm2-orchestration-patterns.md#^ref-51932e7b-149-0) (line 149, col 0, score 0.67)
- [Migrate to Provider-Tenant Architecture — L113](migrate-to-provider-tenant-architecture.md#^ref-54382370-113-0) (line 113, col 0, score 0.69)
- [Voice Access Layer Design — L236](voice-access-layer-design.md#^ref-543ed9b3-236-0) (line 236, col 0, score 0.68)
- [promethean-system-diagrams — L9](promethean-system-diagrams.md#^ref-b51e19b4-9-0) (line 9, col 0, score 0.67)
- [Promethean Agent Config DSL — L180](promethean-agent-config-dsl.md#^ref-2c00ce45-180-0) (line 180, col 0, score 0.66)
- [pm2-orchestration-patterns — L11](pm2-orchestration-patterns.md#^ref-51932e7b-11-0) (line 11, col 0, score 0.65)
- [Voice Access Layer Design — L222](voice-access-layer-design.md#^ref-543ed9b3-222-0) (line 222, col 0, score 0.65)
- [promethean-system-diagrams — L95](promethean-system-diagrams.md#^ref-b51e19b4-95-0) (line 95, col 0, score 0.65)
- [promethean-system-diagrams — L159](promethean-system-diagrams.md#^ref-b51e19b4-159-0) (line 159, col 0, score 0.64)
- [Promethean Infrastructure Setup — L534](promethean-infrastructure-setup.md#^ref-6deed6ac-534-0) (line 534, col 0, score 0.67)
- [Promethean Web UI Setup — L238](promethean-web-ui-setup.md#^ref-bc5172ca-238-0) (line 238, col 0, score 0.65)
- [Dynamic Context Model for Web Components — L196](dynamic-context-model-for-web-components.md#^ref-f7702bf8-196-0) (line 196, col 0, score 0.64)
- [Promethean Documentation Pipeline Overview — L119](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-119-0) (line 119, col 0, score 0.64)
- [Promethean Web UI Setup — L563](promethean-web-ui-setup.md#^ref-bc5172ca-563-0) (line 563, col 0, score 0.63)
- [shared-package-layout-clarification — L145](shared-package-layout-clarification.md#^ref-36c8882a-145-0) (line 145, col 0, score 0.61)
- [TypeScript Patch for Tool Calling Support — L436](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-436-0) (line 436, col 0, score 0.61)
- [plan-update-confirmation — L637](plan-update-confirmation.md#^ref-b22d79c6-637-0) (line 637, col 0, score 0.61)
- [Pure TypeScript Search Microservice — L73](pure-typescript-search-microservice.md#^ref-d17d3a96-73-0) (line 73, col 0, score 0.61)
- [file-watcher-auth-fix — L9](file-watcher-auth-fix.md#^ref-9044701b-9-0) (line 9, col 0, score 0.61)
- [Model Selection for Lightweight Conversational Tasks — L90](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-90-0) (line 90, col 0, score 0.6)
- [Promethean Agent Config DSL — L10](promethean-agent-config-dsl.md#^ref-2c00ce45-10-0) (line 10, col 0, score 0.65)
- [Promethean Agent Config DSL — L292](promethean-agent-config-dsl.md#^ref-2c00ce45-292-0) (line 292, col 0, score 0.63)
- [Promethean Pipelines: Local TypeScript-First Workflow — L3](promethean-pipelines-local-typescript-first-workflow.md#^ref-6b63edca-3-0) (line 3, col 0, score 0.63)
- [pm2-orchestration-patterns — L3](pm2-orchestration-patterns.md#^ref-51932e7b-3-0) (line 3, col 0, score 0.61)
- [Simple Log Example — L1](simple-log-example.md#^ref-0490eee7-1-0) (line 1, col 0, score 0.83)
- [smart-chatgpt-thingy — L10](smart-chatgpt-thingy.md#^ref-2facccf8-10-0) (line 10, col 0, score 0.81)
- [parenthetical-extraction — L3](parenthetical-extraction.md#^ref-51a4e477-3-0) (line 3, col 0, score 0.78)
- [Ghostly Smoke Interference — L39](ghostly-smoke-interference.md#^ref-b6ae7dfa-39-0) (line 39, col 0, score 0.75)
- [infinite_depth_smoke_animation — L7](infinite-depth-smoke-animation.md#^ref-92a052a5-7-0) (line 7, col 0, score 0.67)
- [SentenceProcessing — L29](sentenceprocessing.md#^ref-681a4ab2-29-0) (line 29, col 0, score 0.71)
- [file-watcher-auth-fix — L32](file-watcher-auth-fix.md#^ref-9044701b-32-0) (line 32, col 0, score 0.7)
- [Promethean-Copilot-Intent-Engine — L4](promethean-copilot-intent-engine.md#^ref-ae24a280-4-0) (line 4, col 0, score 0.69)
- [shared-package-layout-clarification — L161](shared-package-layout-clarification.md#^ref-36c8882a-161-0) (line 161, col 0, score 0.68)
- [Shared Package Structure — L159](shared-package-structure.md#^ref-66a72fc3-159-0) (line 159, col 0, score 0.68)
- [Eidolon-Field-Optimization — L50](eidolon-field-optimization.md#^ref-40e05c14-50-0) (line 50, col 0, score 0.68)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
