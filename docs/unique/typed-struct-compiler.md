---
uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
created_at: 2025.08.08.22.08.05.md
filename: typed-struct-compiler
description: >-
  A TypeScript library for compiling typed struct schemas into binary layouts
  with alignment, fast pack/unpack operations, and SoA column specifications for
  zero-copy workers.
tags:
  - typescript
  - binary
  - layout
  - alignment
  - pack
  - unpack
  - soa
  - zero-copy
  - worker
related_to_title: []
related_to_uuid: []
references: []
---
Note: Consolidated here → ../notes/js/typed-struct-compiler.md ^ref-78eeedf7-1-0

Ohhh nice—let’s bolt on a **typed struct compiler** that turns declarative schemas into: ^ref-78eeedf7-3-0

* **Binary layouts** with alignment/size/offsets ^ref-78eeedf7-5-0
* **Fast pack/unpack** to/from `ArrayBuffer`/`DataView`
* **Flattened column specs** you can feed straight into the zero-copy worker layer (SoA columns) ^ref-78eeedf7-7-0
* **Type inference** so your objects are fully typed in TS ^ref-78eeedf7-8-0

Drop this in as `shared/js/prom-lib/worker/zero/struct.ts`. It’s dependency-free, Node + browser safe. ^ref-78eeedf7-10-0

---

# Typed Struct Compiler (fixed-size, aligned; scalars + arrays + nested structs)

```ts
// shared/js/prom-lib/worker/zero/struct.ts
// MIT. No deps. Node + browser safe.
//
// Features:
// - Scalars: f32,f64,i8,u8,i16,u16,i32,u32,bool (bool packs as u8 0/1)
// - Arrays: fixed length arrays of any element type
// - Nested structs
// - Alignment: scalar-aligned per-field + struct alignment = max(field align)
// - Endianness configurable (default little-endian)
// - Pack/Unpack (AoS) + Columns spec for SoA (flattened field paths)
// - TS type inference from schema
//
// If you later want bitfields/strings/varlen, we can extend this.

export type Scalar = "f32"|"f64"|"i8"|"u8"|"i16"|"u16"|"i32"|"u32"|"bool";

export type ScalarInfo = {
  kind: "scalar";
  t: Scalar;
};
export type ArrayInfo = {
  kind: "array";
  elem: TypeInfo;
  len: number; // fixed length
};
export type StructInfo = {
  kind: "struct";
  fields: Record<string, TypeInfo>;
};
export type PadInfo = {
  kind: "pad";
  bytes: number;
};

export type TypeInfo = ScalarInfo | ArrayInfo | StructInfo | PadInfo;

// ---------- Schema DSL ----------
export const S = {
  f32: (): ScalarInfo => ({ kind: "scalar", t: "f32" }),
  f64: (): ScalarInfo => ({ kind: "scalar", t: "f64" }),
  i8:  (): ScalarInfo => ({ kind: "scalar", t: "i8" }),
  u8:  (): ScalarInfo => ({ kind: "scalar", t: "u8" }),
  i16: (): ScalarInfo => ({ kind: "scalar", t: "i16" }),
  u16: (): ScalarInfo => ({ kind: "scalar", t: "u16" }),
  i32: (): ScalarInfo => ({ kind: "scalar", t: "i32" }),
  u32: (): ScalarInfo => ({ kind: "scalar", t: "u32" }),
  bool: (): ScalarInfo => ({ kind: "scalar", t: "bool" }),

  array: (elem: TypeInfo, len: number): ArrayInfo => ({ kind: "array", elem, len }),
  struct: (fields: Record<string, TypeInfo>): StructInfo => ({ kind: "struct", fields }),
  pad: (bytes: number): PadInfo => ({ kind: "pad", bytes }),
};

// ---------- Type inference (TS) ----------
export type Infer<T extends TypeInfo> =
  T extends ScalarInfo ? (
    T["t"] extends "bool" ? boolean :
    T["t"] extends "f32"|"f64" ? number :
    T["t"] extends "i8"|"u8"|"i16"|"u16"|"i32"|"u32" ? number :
    never
  ) :
  T extends ArrayInfo ? Infer<T["elem"]>[] :
  T extends StructInfo ? { [K in keyof T["fields"]]: Infer<T["fields"][K]> } :
  T extends PadInfo ? never :
  never;

// ---------- Size/align ----------
const SCALAR_SIZE: Record<Exclude<Scalar,"bool">, number> = {
  f32: 4, f64: 8, i8: 1, u8: 1, i16: 2, u16: 2, i32: 4, u32: 4
};
function sizeOf(t: TypeInfo): number {
  switch (t.kind) {
    case "scalar": return t.t === "bool" ? 1 : SCALAR_SIZE[t.t as Exclude<Scalar,"bool">];
    case "pad":    return t.bytes;
    case "array":  return t.len * sizeOf(t.elem);
    case "struct": {
      let off = 0, align = 1;
      for (const [_, f] of Object.entries(t.fields)) {
        const a = alignOf(f);
        off = alignUp(off, a);
        off += sizeOf(f);
        align = Math.max(align, a);
      }
      return alignUp(off, align);
    }
  }
}
function alignOf(t: TypeInfo): number {
  switch (t.kind) {
    case "scalar": return t.t === "bool" ? 1 : SCALAR_SIZE[t.t as Exclude<Scalar,"bool">];
    case "pad":    return 1;
    case "array":  return alignOf(t.elem);
    case "struct": {
      let a = 1;
      for (const f of Object.values(t.fields)) a = Math.max(a, alignOf(f));
      return a;
    }
  }
}
function alignUp(x: number, a: number) { return (x + (a-1)) & ~(a-1); }

// ---------- Compiler ----------
export type FieldLayout = {
  path: string;     // flattened path, e.g. "pos.x" or "vel[3].y"
  offset: number;
  size: number;
  align: number;
  info: TypeInfo;
};

export type StructLayout<T> = {
  size: number;
  align: number;
  fields: FieldLayout[];
  // fast pack/unpack
  read(view: DataView, offset?: number, littleEndian?: boolean): T;
  write(view: DataView, value: T, offset?: number, littleEndian?: boolean): void;
  // Helpers
  flattenColumns(prefixToUnderscore?: boolean): Record<string, Scalar>; // scalars only, flattened
};

export function compileStruct<T extends StructInfo>(schema: T): StructLayout<Infer<T>> {
  const fields: FieldLayout[] = [];
  let offset = 0, maxAlign = 1;

  const visit = (info: TypeInfo, base: string) => {
    if (info.kind === "pad") {
      offset += info.bytes; // explicit pad (no alignment)
      return;
    }
    const a = alignOf(info);
    offset = alignUp(offset, a);
    maxAlign = Math.max(maxAlign, a);

    if (info.kind === "scalar") {
      const sz = sizeOf(info);
      fields.push({ path: base, offset, size: sz, align: a, info });
      offset += sz;
      return;
    }
    if (info.kind === "array") {
      const elemSize = sizeOf(info.elem);
      const elemAlign = alignOf(info.elem);
      for (let i=0;i<info.len;i++) {
        offset = alignUp(offset, elemAlign);
        const start = offset;
        visit(info.elem, `${base}[${i}]`);
        // ensure fixed stride
        offset = start + elemSize;
      }
      return;
    }
    if (info.kind === "struct") {
      const start = offset;
      let innerAlign = 1;
      for (const [k, child] of Object.entries(info.fields)) {
        const a2 = alignOf(child);
        offset = alignUp(offset, a2);
        innerAlign = Math.max(innerAlign, a2);
        visit(child, base ? `${base}.${k}` : k);
      }
      // pad struct to its alignment
      offset = alignUp(offset, innerAlign);
      maxAlign = Math.max(maxAlign, innerAlign);
      return;
    }
  };

  // assign offsets in order
  for (const [k, child] of Object.entries(schema.fields)) {
    const a = alignOf(child);
    offset = alignUp(offset, a);
    visit(child, k);
  }
  const total = alignUp(offset, maxAlign);

  // Runtime read/write using DataView
  function read(view: DataView, off = 0, le = true): any {
    const out: any = {};
    // we’ll lazily build nested objects on demand
    const ensurePath = (p: string): { parent: any, key: string } => {
      const parts = p.split("."); // might contain [i] segments—handle later
      let cur = out;
      for (let i=0;i<parts.length;i++) {
        const seg = parts[i];
        // split idx if array notation present
        const m = seg.match(/^([^\[]+)(\[(\d+)\])?$/);
        if (!m) continue;
        const key = m[1];
        const hasIdx = !!m[3];
        if (i === parts.length - 1 && !hasIdx) return { parent: cur, key };
        if (!(key in cur)) cur[key] = hasIdx ? [] : {};
        cur = cur[key];
        if (hasIdx) {
          const idx = Number(m[3]);
          if (!Array.isArray(cur)) cur = cur[key] = [];
          if (!cur[idx]) cur[idx] = {};
          if (i === parts.length - 1) return { parent: cur, key: String(idx) };
          cur = cur[idx];
        }
      }
      // fallback, though we should have returned
      return { parent: out, key: p };
    };

    for (const f of fields) {
      if (f.info.kind !== "scalar") continue; // only scalars produce values
      const addr = off + f.offset;
      const { parent, key } = ensurePath(f.path);
      parent[key] = readScalar(view, addr, f.info.t, le);
    }
    return out;
  }

  function write(view: DataView, value: any, off = 0, le = true) {
    // Walk all scalar leaves and write from 'value' by path
    for (const f of fields) {
      if (f.info.kind !== "scalar") continue;
      const addr = off + f.offset;
      const v = getByPath(value, f.path);
      writeScalar(view, addr, f.info.t, v ?? 0, le);
    }
  }

  function flattenColumns(prefixToUnderscore = true): Record<string, Scalar> {
    const out: Record<string, Scalar> = {};
    for (const f of fields) {
      if (f.info.kind !== "scalar") continue;
      const name = prefixToUnderscore ? f.path.replace(/\./g, "_").replace(/\[/g, "_").replace(/\]/g, "") : f.path;
      out[name] = f.info.t;
    }
    return out;
  }

  return { size: total, align: maxAlign, fields, read, write, flattenColumns };
}

// ---------- Scalar R/W ----------
function readScalar(view: DataView, addr: number, t: Scalar, le: boolean): number|boolean {
  switch (t) {
    case "f32": return view.getFloat32(addr, le);
    case "f64": return view.getFloat64(addr, le);
    case "i8":  return view.getInt8(addr);
    case "u8":  return view.getUint8(addr);
    case "i16": return view.getInt16(addr, le);
    case "u16": return view.getUint16(addr, le);
    case "i32": return view.getInt32(addr, le);
    case "u32": return view.getUint32(addr, le);
    case "bool":return view.getUint8(addr) !== 0;
  }
}
function writeScalar(view: DataView, addr: number, t: Scalar, v: any, le: boolean) {
  switch (t) {
    case "f32": view.setFloat32(addr, +v, le); break;
    case "f64": view.setFloat64(addr, +v, le); break;
    case "i8":  view.setInt8(addr, v|0); break;
    case "u8":  view.setUint8(addr, v>>>0 & 0xff); break;
    case "i16": view.setInt16(addr, v|0, le); break;
    case "u16": view.setUint16(addr, v>>>0 & 0xffff, le); break;
    case "i32": view.setInt32(addr, v|0, le); break;
    case "u32": view.setUint32(addr, v>>>0, le); break;
    case "bool":view.setUint8(addr, v ? 1 : 0); break;
  }
}

// ---------- Utils ----------
function getByPath(obj: any, path: string): any {
  const parts = path.split(".");
  let cur = obj;
  for (const seg of parts) {
    const m = seg.match(/^([^\[]+)(\[(\d+)\])?$/);
    if (!m) return undefined;
    const key = m[1];
    if (cur == null) return undefined;
    cur = cur[key];
    if (m[3]) cur = cur?.[Number(m[3])];
  }
  return cur;
}
```
^ref-78eeedf7-16-0

---

# How you use it

## 1) Define schemas
 ^ref-78eeedf7-304-0
```ts
import { S, compileStruct, type Infer } from "./struct";

// Basic
const Position = S.struct({ x: S.f32(), y: S.f32() });
type Position = Infer<typeof Position>; // { x:number; y:number }

// Nested + arrays
const Transform = S.struct({
  pos: Position,
  rot: S.f32(),
  scale: S.f32(),
});

const Trail = S.struct({
  pts: S.array(Position, 8),   // fixed 8 points
  active: S.bool(),
});
^ref-78eeedf7-304-0
```

## 2) Compile, pack, unpack ^ref-78eeedf7-326-0

```ts
const Pos = compileStruct(Position);
console.log(Pos.size, Pos.align); // 8, 4

const buf = new ArrayBuffer(Pos.size);
const view = new DataView(buf);

Pos.write(view, { x: 1.5, y: -2.25 });
^ref-78eeedf7-326-0
const obj = Pos.read(view); // -> { x:1.5, y:-2.25 }
```
 ^ref-78eeedf7-339-0
## 3) Get flattened SoA columns for zero-copy workers

```ts
// For the physics zero-copy snapshot, flatten nested fields into column names:
const Bullet = S.struct({ pos: Position, vel: Position, life: S.f32() });
const B = compileStruct(Bullet);

// columnsSpec matches the earlier zero-copy "FieldSpec" (field -> scalar type)
const columnsSpec = B.flattenColumns(true); 
// => { pos_x:"f32", pos_y:"f32", vel_x:"f32", vel_y:"f32", life:"f32" }

// Build a CompLayout for cid=YourComponent.id:
import type { CompLayout } from "./layout";
function toCompLayout(cid: number): CompLayout {
^ref-78eeedf7-339-0
  return { cid, fields: columnsSpec }; ^ref-78eeedf7-355-0
}
```
^ref-78eeedf7-357-0 ^ref-78eeedf7-358-0

Then plug that `CompLayout` into the **zero-copy snapshot builder** you already have:

```ts
// offload.zeroCopy.build:
zeroCopy: {
  build: () => ({
    types: { [CPos.id]: CPos, [CVel.id]: CVel, [CBullet.id]: CBullet },
    layouts: [
      { cid: CPos.id, fields: compileStruct(Position).flattenColumns(true) },
      { cid: CVel.id, fields: compileStruct(Position).flattenColumns(true) },
      { cid: CBullet.id, fields: compileStruct(Bullet).flattenColumns(true) },
^ref-78eeedf7-357-0
    ]
  })
}
```
 ^ref-78eeedf7-375-0 ^ref-78eeedf7-376-0
--- ^ref-78eeedf7-376-0 ^ref-78eeedf7-377-0
 ^ref-78eeedf7-377-0 ^ref-78eeedf7-378-0
# Notes / Extension ideas ^ref-78eeedf7-378-0
 ^ref-78eeedf7-380-0
* Current implementation is **fixed-size only** (great for hot loops + SAB). If you need **varlen strings/blobs**, we’ll add a sidecar table (offset/length pairs) and a pool. ^ref-78eeedf7-380-0
* **Bitfields**: easy to add by introducing a `S.bits({field:nBits,...}, base: "u32")`.
* **Codegen**: for *absurd* speed, we can JIT `read/write` into a tiny function via `new Function` (still pure TS now for portability).
* **Endian**: defaults to little-endian; pass `le=false` to `read/write` if you target BE data.
 ^ref-78eeedf7-384-0
If you want, I can add a helper that takes a **Zod schema** and emits this struct schema automatically (mapping `z.number()` → `f32`/`f64`, tuple to fixed array, object to struct), so your schema registry doubles as your binary layout source of truth.<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [JavaScript](chunks/javascript.md)
- [Unique Info Dump Index](unique-info-dump-index.md)
- [compiler-kit-foundations](compiler-kit-foundations.md)
- [template-based-compilation](template-based-compilation.md)
- [graph-ds](graph-ds.md)
- [archetype-ecs](archetype-ecs.md)
- [aionian-circuit-math](aionian-circuit-math.md)
- [Diagrams](chunks/diagrams.md)
- [DSL](chunks/dsl.md)
- [Interop and Source Maps](interop-and-source-maps.md)
- [Lispy Macros with syntax-rules](lispy-macros-with-syntax-rules.md)
- [Lisp-Compiler-Integration](lisp-compiler-integration.md)
- [Cross-Language Runtime Polymorphism](cross-language-runtime-polymorphism.md)
- [ecs-offload-workers](ecs-offload-workers.md)
- [ecs-scheduler-and-prefabs](ecs-scheduler-and-prefabs.md)
- [Cross-Target Macro System in Sibilant](cross-target-macro-system-in-sibilant.md)
- [balanced-bst](balanced-bst.md)
- [AI-Centric OS with MCP Layer](ai-centric-os-with-mcp-layer.md)
- [AI-First-OS-Model-Context-Protocol](ai-first-os-model-context-protocol.md)
- [Agent Tasks: Persistence Migration to DualStore](agent-tasks-persistence-migration-to-dualstore.md)
- [Window Management](chunks/window-management.md)
- [Admin Dashboard for User Management](admin-dashboard-for-user-management.md)
- [api-gateway-versioning](api-gateway-versioning.md)
- [Agent Reflections and Prompt Evolution](agent-reflections-and-prompt-evolution.md)
- [Board Automation Improvements](board-automation-improvements.md)
- [Operations](chunks/operations.md)
- [Board Walk – 2025-08-11](board-walk-2025-08-11.md)
- [Chroma Toolkit Consolidation Plan](chroma-toolkit-consolidation-plan.md)
- [Math Fundamentals](chunks/math-fundamentals.md)
- [2d-sandbox-field](2d-sandbox-field.md)
- [Sibilant Meta-Prompt DSL](sibilant-meta-prompt-dsl.md)
- [State Snapshots API and Transactional Projector](state-snapshots-api-and-transactional-projector.md)
- [sibilant-meta-string-templating-runtime](sibilant-meta-string-templating-runtime.md)
- [System Scheduler with Resource-Aware DAG](system-scheduler-with-resource-aware-dag.md)
- [sibilant-macro-targets](sibilant-macro-targets.md)
- [sibilant-metacompiler-overview](sibilant-metacompiler-overview.md)
- [ts-to-lisp-transpiler](ts-to-lisp-transpiler.md)
- [Event Bus MVP](event-bus-mvp.md)
- [eidolon-field-math-foundations](eidolon-field-math-foundations.md)
- [Dynamic Context Model for Web Components](dynamic-context-model-for-web-components.md)
- [Services](chunks/services.md)
- [Debugging Broker Connections and Agent Behavior](debugging-broker-connections-and-agent-behavior.md)
- [Migrate to Provider-Tenant Architecture](migrate-to-provider-tenant-architecture.md)
- [Mongo Outbox Implementation](mongo-outbox-implementation.md)
- [ParticleSimulationWithCanvasAndFFmpeg](particlesimulationwithcanvasandffmpeg.md)
- [markdown-to-org-transpiler](markdown-to-org-transpiler.md)
- [Factorio AI with External Agents](factorio-ai-with-external-agents.md)
- [Language-Agnostic Mirror System](language-agnostic-mirror-system.md)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler](ollama-llm-provider-for-pseudo-code-transpiler.md)
- [Eidolon Field Abstract Model](eidolon-field-abstract-model.md)
- [EidolonField](eidolonfield.md)
- [field-interaction-equations](field-interaction-equations.md)
- [Exception Layer Analysis](exception-layer-analysis.md)
- [field-dynamics-math-blocks](field-dynamics-math-blocks.md)
- [field-node-diagram-outline](field-node-diagram-outline.md)
- [Shared](chunks/shared.md)
- [Simulation Demo](chunks/simulation-demo.md)
- [Tooling](chunks/tooling.md)
- [Model Selection for Lightweight Conversational Tasks](model-selection-for-lightweight-conversational-tasks.md)
- [Obsidian Templating Plugins Integration Guide](obsidian-templating-plugins-integration-guide.md)
- [Duck's Self-Referential Perceptual Loop](ducks-self-referential-perceptual-loop.md)
- [Event Bus Projections Architecture](event-bus-projections-architecture.md)
- [eidolon-node-lifecycle](eidolon-node-lifecycle.md)
- [Matplotlib Animation with Async Execution](matplotlib-animation-with-async-execution.md)
- [obsidian-ignore-node-modules-regex](obsidian-ignore-node-modules-regex.md)
- [Post-Linguistic Transhuman Design Frameworks](post-linguistic-transhuman-design-frameworks.md)
- [Canonical Org-Babel Matplotlib Animation Template](canonical-org-babel-matplotlib-animation-template.md)
- [Promethean Infrastructure Setup](promethean-infrastructure-setup.md)
- [Promethean Event Bus MVP v0.1](promethean-event-bus-mvp-v0-1.md)
- [Prompt_Folder_Bootstrap](prompt-folder-bootstrap.md)
- [Promethean-native config design](promethean-native-config-design.md)
- [Promethean_Eidolon_Synchronicity_Model](promethean-eidolon-synchronicity-model.md)
- [promethean-system-diagrams](promethean-system-diagrams.md)
- [Promethean Web UI Setup](promethean-web-ui-setup.md)
- [prompt-programming-language-lisp](prompt-programming-language-lisp.md)
- [field-node-diagram-visualizations](field-node-diagram-visualizations.md)
- [heartbeat-fragment-demo](heartbeat-fragment-demo.md)
- [heartbeat-simulation-snippets](heartbeat-simulation-snippets.md)
- [field-node-diagram-set](field-node-diagram-set.md)
- [Duck's Attractor States](ducks-attractor-states.md)
- [Creative Moments](creative-moments.md)
- [DuckDuckGoSearchPipeline](duckduckgosearchpipeline.md)
- [Local-Only-LLM-Workflow](local-only-llm-workflow.md)
- [observability-infrastructure-setup](observability-infrastructure-setup.md)
- [plan-update-confirmation](plan-update-confirmation.md)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop](polyglot-s-expr-bridge-python-js-lisp-interop.md)
- [Performance-Optimized-Polyglot-Bridge](performance-optimized-polyglot-bridge.md)
- [js-to-lisp-reverse-compiler](js-to-lisp-reverse-compiler.md)
- [Local-First Intention→Code Loop with Free Models](local-first-intention-code-loop-with-free-models.md)
- [mystery-lisp-search-session](mystery-lisp-search-session.md)
- [Local-Offline-Model-Deployment-Strategy](local-offline-model-deployment-strategy.md)
- [Obsidian ChatGPT Plugin Integration](obsidian-chatgpt-plugin-integration.md)
- [Protocol_0_The_Contradiction_Engine](protocol-0-the-contradiction-engine.md)
- [Model Upgrade Calm-Down Guide](model-upgrade-calm-down-guide.md)
- [NPU Voice Code and Sensory Integration](npu-voice-code-and-sensory-integration.md)
- [OpenAPI Validation Report](openapi-validation-report.md)
- [Optimizing Command Limitations in System Design](optimizing-command-limitations-in-system-design.md)
- [pm2-orchestration-patterns](pm2-orchestration-patterns.md)
- [Mindful Prioritization](mindful-prioritization.md)
- [MindfulRobotIntegration](mindfulrobotintegration.md)
- [Obsidian ChatGPT Plugin Integration Guide](obsidian-chatgpt-plugin-integration-guide.md)
- [Docops Feature Updates](docops-feature-updates-3.md)
- [lisp-dsl-for-window-management](lisp-dsl-for-window-management.md)
- [Pure-Node Crawl Stack with Playwright and Crawlee](pure-node-crawl-stack-with-playwright-and-crawlee.md)
- [Shared Package Structure](shared-package-structure.md)
- [Per-Domain Policy System for JS Crawler](per-domain-policy-system-for-js-crawler.md)
- [homeostasis-decay-formulas](homeostasis-decay-formulas.md)
- [layer-1-uptime-diagrams](layer-1-uptime-diagrams.md)
- [ripple-propagation-demo](ripple-propagation-demo.md)
- [Promethean Workflow Optimization](promethean-workflow-optimization.md)
- [Prometheus Observability Stack](prometheus-observability-stack.md)
- [Provider-Agnostic Chat Panel Implementation](provider-agnostic-chat-panel-implementation.md)
- [Recursive Prompt Construction Engine](recursive-prompt-construction-engine.md)
- [schema-evolution-workflow](schema-evolution-workflow.md)
- [set-assignment-in-lisp-ast](set-assignment-in-lisp-ast.md)
- [Pure TypeScript Search Microservice](pure-typescript-search-microservice.md)
- [RAG UI Panel with Qdrant and PostgREST](rag-ui-panel-with-qdrant-and-postgrest.md)
- [komorebi-group-window-hack](komorebi-group-window-hack.md)
- [Redirecting Standard Error](redirecting-standard-error.md)
- [Self-Agency in AI Interaction](self-agency-in-ai-interaction.md)
- [shared-package-layout-clarification](shared-package-layout-clarification.md)
- [zero-copy-snapshots-and-workers](zero-copy-snapshots-and-workers.md)
- [prom-lib-rate-limiters-and-replay-api](prom-lib-rate-limiters-and-replay-api.md)
- [refactor-relations](refactor-relations.md)
- [Stateful Partitions and Rebalancing](stateful-partitions-and-rebalancing.md)
- [Chroma-Embedding-Refactor](chroma-embedding-refactor.md)
- [Promethean Agent DSL TS Scaffold](promethean-agent-dsl-ts-scaffold.md)
- [universal-intention-code-fabric](universal-intention-code-fabric.md)
- [Functional Embedding Pipeline Refactor](functional-embedding-pipeline-refactor.md)
- [Promethean-Copilot-Intent-Engine](promethean-copilot-intent-engine.md)
- [Layer1SurvivabilityEnvelope](layer1survivabilityenvelope.md)
- [TypeScript Patch for Tool Calling Support](typescript-patch-for-tool-calling-support.md)
- [WebSocket Gateway Implementation](websocket-gateway-implementation.md)
- [Promethean Agent Config DSL](promethean-agent-config-dsl.md)
- [Universal Lisp Interface](universal-lisp-interface.md)
- [i3-config-validation-methods](i3-config-validation-methods.md)
- [Vectorial Exception Descent](vectorial-exception-descent.md)
## Sources
- [JavaScript — L3](chunks/javascript.md#^ref-c1618c66-3-0) (line 3, col 0, score 0.81)
- [Unique Info Dump Index — L22](unique-info-dump-index.md#^ref-30ec3ba6-22-0) (line 22, col 0, score 0.81)
- [compiler-kit-foundations — L1](compiler-kit-foundations.md#^ref-01b21543-1-0) (line 1, col 0, score 0.81)
- [template-based-compilation — L1](template-based-compilation.md#^ref-f8877e5e-1-0) (line 1, col 0, score 0.8)
- [graph-ds — L1](graph-ds.md#^ref-6620e2f2-1-0) (line 1, col 0, score 0.78)
- [archetype-ecs — L459](archetype-ecs.md#^ref-8f4c1e86-459-0) (line 459, col 0, score 0.69)
- [JavaScript — L15](chunks/javascript.md#^ref-c1618c66-15-0) (line 15, col 0, score 0.69)
- [compiler-kit-foundations — L612](compiler-kit-foundations.md#^ref-01b21543-612-0) (line 612, col 0, score 0.69)
- [ecs-offload-workers — L490](ecs-offload-workers.md#^ref-6498b9d7-490-0) (line 490, col 0, score 0.69)
- [ecs-scheduler-and-prefabs — L414](ecs-scheduler-and-prefabs.md#^ref-c62a1815-414-0) (line 414, col 0, score 0.69)
- [graph-ds — L367](graph-ds.md#^ref-6620e2f2-367-0) (line 367, col 0, score 0.69)
- [template-based-compilation — L115](template-based-compilation.md#^ref-f8877e5e-115-0) (line 115, col 0, score 0.69)
- [Unique Info Dump Index — L98](unique-info-dump-index.md#^ref-30ec3ba6-98-0) (line 98, col 0, score 0.69)
- [lisp-dsl-for-window-management — L10](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-10-0) (line 10, col 0, score 0.73)
- [lisp-dsl-for-window-management — L140](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-140-0) (line 140, col 0, score 0.65)
- [Chroma-Embedding-Refactor — L328](chroma-embedding-refactor.md#^ref-8b256935-328-0) (line 328, col 0, score 0.62)
- [Diagrams — L46](chunks/diagrams.md#^ref-45cd25b5-46-0) (line 46, col 0, score 0.62)
- [i3-config-validation-methods — L53](i3-config-validation-methods.md#^ref-d28090ac-53-0) (line 53, col 0, score 0.62)
- [Local-Only-LLM-Workflow — L180](local-only-llm-workflow.md#^ref-9a8ab57e-180-0) (line 180, col 0, score 0.62)
- [Migrate to Provider-Tenant Architecture — L276](migrate-to-provider-tenant-architecture.md#^ref-54382370-276-0) (line 276, col 0, score 0.62)
- [observability-infrastructure-setup — L376](observability-infrastructure-setup.md#^ref-b4e64f8c-376-0) (line 376, col 0, score 0.62)
- [Post-Linguistic Transhuman Design Frameworks — L89](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-89-0) (line 89, col 0, score 0.62)
- [Board Walk – 2025-08-11 — L92](board-walk-2025-08-11.md#^ref-7aa1eb92-92-0) (line 92, col 0, score 0.61)
- [Sibilant Meta-Prompt DSL — L91](sibilant-meta-prompt-dsl.md#^ref-af5d2824-91-0) (line 91, col 0, score 0.6)
- [Sibilant Meta-Prompt DSL — L100](sibilant-meta-prompt-dsl.md#^ref-af5d2824-100-0) (line 100, col 0, score 0.6)
- [Migrate to Provider-Tenant Architecture — L132](migrate-to-provider-tenant-architecture.md#^ref-54382370-132-0) (line 132, col 0, score 0.59)
- [Vectorial Exception Descent — L60](vectorial-exception-descent.md#^ref-d771154e-60-0) (line 60, col 0, score 0.57)
- [Chroma-Embedding-Refactor — L64](chroma-embedding-refactor.md#^ref-8b256935-64-0) (line 64, col 0, score 0.63)
- [Chroma-Embedding-Refactor — L109](chroma-embedding-refactor.md#^ref-8b256935-109-0) (line 109, col 0, score 0.63)
- [Chroma-Embedding-Refactor — L258](chroma-embedding-refactor.md#^ref-8b256935-258-0) (line 258, col 0, score 0.63)
- [Chroma Toolkit Consolidation Plan — L72](chroma-toolkit-consolidation-plan.md#^ref-5020e892-72-0) (line 72, col 0, score 0.63)
- [Chroma Toolkit Consolidation Plan — L88](chroma-toolkit-consolidation-plan.md#^ref-5020e892-88-0) (line 88, col 0, score 0.57)
- [Chroma Toolkit Consolidation Plan — L107](chroma-toolkit-consolidation-plan.md#^ref-5020e892-107-0) (line 107, col 0, score 0.57)
- [Chroma Toolkit Consolidation Plan — L148](chroma-toolkit-consolidation-plan.md#^ref-5020e892-148-0) (line 148, col 0, score 0.57)
- [Agent Reflections and Prompt Evolution — L136](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-136-0) (line 136, col 0, score 0.57)
- [Canonical Org-Babel Matplotlib Animation Template — L108](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-108-0) (line 108, col 0, score 0.57)
- [zero-copy-snapshots-and-workers — L7](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-7-0) (line 7, col 0, score 0.69)
- [JavaScript — L11](chunks/javascript.md#^ref-c1618c66-11-0) (line 11, col 0, score 0.76)
- [ecs-offload-workers — L457](ecs-offload-workers.md#^ref-6498b9d7-457-0) (line 457, col 0, score 0.76)
- [ecs-scheduler-and-prefabs — L419](ecs-scheduler-and-prefabs.md#^ref-c62a1815-419-0) (line 419, col 0, score 0.76)
- [Interop and Source Maps — L534](interop-and-source-maps.md#^ref-cdfac40c-534-0) (line 534, col 0, score 0.76)
- [Lisp-Compiler-Integration — L539](lisp-compiler-integration.md#^ref-cfee6d36-539-0) (line 539, col 0, score 0.76)
- [Lispy Macros with syntax-rules — L412](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-412-0) (line 412, col 0, score 0.76)
- [State Snapshots API and Transactional Projector — L353](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-353-0) (line 353, col 0, score 0.76)
- [plan-update-confirmation — L738](plan-update-confirmation.md#^ref-b22d79c6-738-0) (line 738, col 0, score 0.67)
- [Mongo Outbox Implementation — L443](mongo-outbox-implementation.md#^ref-9c1acd1e-443-0) (line 443, col 0, score 0.67)
- [plan-update-confirmation — L832](plan-update-confirmation.md#^ref-b22d79c6-832-0) (line 832, col 0, score 0.67)
- [plan-update-confirmation — L876](plan-update-confirmation.md#^ref-b22d79c6-876-0) (line 876, col 0, score 0.66)
- [plan-update-confirmation — L829](plan-update-confirmation.md#^ref-b22d79c6-829-0) (line 829, col 0, score 0.66)
- [plan-update-confirmation — L866](plan-update-confirmation.md#^ref-b22d79c6-866-0) (line 866, col 0, score 0.65)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L489](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-489-0) (line 489, col 0, score 0.63)
- [plan-update-confirmation — L827](plan-update-confirmation.md#^ref-b22d79c6-827-0) (line 827, col 0, score 0.65)
- [plan-update-confirmation — L850](plan-update-confirmation.md#^ref-b22d79c6-850-0) (line 850, col 0, score 0.65)
- [plan-update-confirmation — L904](plan-update-confirmation.md#^ref-b22d79c6-904-0) (line 904, col 0, score 0.65)
- [plan-update-confirmation — L834](plan-update-confirmation.md#^ref-b22d79c6-834-0) (line 834, col 0, score 0.64)
- [plan-update-confirmation — L884](plan-update-confirmation.md#^ref-b22d79c6-884-0) (line 884, col 0, score 0.64)
- [plan-update-confirmation — L730](plan-update-confirmation.md#^ref-b22d79c6-730-0) (line 730, col 0, score 0.64)
- [Migrate to Provider-Tenant Architecture — L41](migrate-to-provider-tenant-architecture.md#^ref-54382370-41-0) (line 41, col 0, score 0.64)
- [ParticleSimulationWithCanvasAndFFmpeg — L1](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-1-0) (line 1, col 0, score 0.73)
- [graph-ds — L5](graph-ds.md#^ref-6620e2f2-5-0) (line 5, col 0, score 0.64)
- [Mongo Outbox Implementation — L379](mongo-outbox-implementation.md#^ref-9c1acd1e-379-0) (line 379, col 0, score 0.66)
- [markdown-to-org-transpiler — L1](markdown-to-org-transpiler.md#^ref-ab54cdd8-1-0) (line 1, col 0, score 0.65)
- [ecs-offload-workers — L209](ecs-offload-workers.md#^ref-6498b9d7-209-0) (line 209, col 0, score 0.64)
- [Interop and Source Maps — L3](interop-and-source-maps.md#^ref-cdfac40c-3-0) (line 3, col 0, score 0.64)
- [WebSocket Gateway Implementation — L628](websocket-gateway-implementation.md#^ref-e811123d-628-0) (line 628, col 0, score 0.63)
- [Factorio AI with External Agents — L26](factorio-ai-with-external-agents.md#^ref-a4d90289-26-0) (line 26, col 0, score 0.63)
- [Promethean Infrastructure Setup — L33](promethean-infrastructure-setup.md#^ref-6deed6ac-33-0) (line 33, col 0, score 0.63)
- [lisp-dsl-for-window-management — L178](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-178-0) (line 178, col 0, score 0.62)
- [Performance-Optimized-Polyglot-Bridge — L375](performance-optimized-polyglot-bridge.md#^ref-f5579967-375-0) (line 375, col 0, score 0.62)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L1](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-1-0) (line 1, col 0, score 0.62)
- [Universal Lisp Interface — L91](universal-lisp-interface.md#^ref-b01856b4-91-0) (line 91, col 0, score 0.62)
- [zero-copy-snapshots-and-workers — L15](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-15-0) (line 15, col 0, score 0.61)
- [archetype-ecs — L7](archetype-ecs.md#^ref-8f4c1e86-7-0) (line 7, col 0, score 0.63)
- [Promethean Event Bus MVP v0.1 — L395](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-395-0) (line 395, col 0, score 0.63)
- [zero-copy-snapshots-and-workers — L70](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-70-0) (line 70, col 0, score 0.66)
- [js-to-lisp-reverse-compiler — L13](js-to-lisp-reverse-compiler.md#^ref-58191024-13-0) (line 13, col 0, score 0.65)
- [zero-copy-snapshots-and-workers — L355](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-355-0) (line 355, col 0, score 0.54)
- [sibilant-meta-string-templating-runtime — L114](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-114-0) (line 114, col 0, score 0.54)
- [universal-intention-code-fabric — L23](universal-intention-code-fabric.md#^ref-c14edce7-23-0) (line 23, col 0, score 0.5)
- [Sibilant Meta-Prompt DSL — L123](sibilant-meta-prompt-dsl.md#^ref-af5d2824-123-0) (line 123, col 0, score 0.48)
- [Shared Package Structure — L91](shared-package-structure.md#^ref-66a72fc3-91-0) (line 91, col 0, score 0.48)
- [Prompt_Folder_Bootstrap — L15](prompt-folder-bootstrap.md#^ref-bd4f0976-15-0) (line 15, col 0, score 0.48)
- [sibilant-meta-string-templating-runtime — L58](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-58-0) (line 58, col 0, score 0.48)
- [Sibilant Meta-Prompt DSL — L26](sibilant-meta-prompt-dsl.md#^ref-af5d2824-26-0) (line 26, col 0, score 0.46)
- [Recursive Prompt Construction Engine — L154](recursive-prompt-construction-engine.md#^ref-babdb9eb-154-0) (line 154, col 0, score 0.46)
- [Sibilant Meta-Prompt DSL — L44](sibilant-meta-prompt-dsl.md#^ref-af5d2824-44-0) (line 44, col 0, score 0.45)
- [sibilant-meta-string-templating-runtime — L133](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-133-0) (line 133, col 0, score 0.45)
- [template-based-compilation — L117](template-based-compilation.md#^ref-f8877e5e-117-0) (line 117, col 0, score 0.45)
- [Universal Lisp Interface — L205](universal-lisp-interface.md#^ref-b01856b4-205-0) (line 205, col 0, score 0.45)
- [compiler-kit-foundations — L31](compiler-kit-foundations.md#^ref-01b21543-31-0) (line 31, col 0, score 0.66)
- [Event Bus MVP — L7](event-bus-mvp.md#^ref-534fe91d-7-0) (line 7, col 0, score 0.66)
- [universal-intention-code-fabric — L68](universal-intention-code-fabric.md#^ref-c14edce7-68-0) (line 68, col 0, score 0.66)
- [Language-Agnostic Mirror System — L52](language-agnostic-mirror-system.md#^ref-d2b3628c-52-0) (line 52, col 0, score 0.64)
- [Promethean Event Bus MVP v0.1 — L28](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-28-0) (line 28, col 0, score 0.66)
- [Promethean Agent DSL TS Scaffold — L181](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-181-0) (line 181, col 0, score 0.65)
- [prom-lib-rate-limiters-and-replay-api — L186](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-186-0) (line 186, col 0, score 0.64)
- [Chroma-Embedding-Refactor — L260](chroma-embedding-refactor.md#^ref-8b256935-260-0) (line 260, col 0, score 0.64)
- [plan-update-confirmation — L650](plan-update-confirmation.md#^ref-b22d79c6-650-0) (line 650, col 0, score 0.64)
- [plan-update-confirmation — L662](plan-update-confirmation.md#^ref-b22d79c6-662-0) (line 662, col 0, score 0.64)
- [plan-update-confirmation — L674](plan-update-confirmation.md#^ref-b22d79c6-674-0) (line 674, col 0, score 0.64)
- [Promethean Event Bus MVP v0.1 — L423](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-423-0) (line 423, col 0, score 0.64)
- [compiler-kit-foundations — L359](compiler-kit-foundations.md#^ref-01b21543-359-0) (line 359, col 0, score 0.61)
- [Interop and Source Maps — L85](interop-and-source-maps.md#^ref-cdfac40c-85-0) (line 85, col 0, score 0.61)
- [Stateful Partitions and Rebalancing — L202](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-202-0) (line 202, col 0, score 0.62)
- [Performance-Optimized-Polyglot-Bridge — L22](performance-optimized-polyglot-bridge.md#^ref-f5579967-22-0) (line 22, col 0, score 0.64)
- [compiler-kit-foundations — L50](compiler-kit-foundations.md#^ref-01b21543-50-0) (line 50, col 0, score 0.69)
- [Performance-Optimized-Polyglot-Bridge — L170](performance-optimized-polyglot-bridge.md#^ref-f5579967-170-0) (line 170, col 0, score 0.63)
- [Lispy Macros with syntax-rules — L9](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-9-0) (line 9, col 0, score 0.63)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L7](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-7-0) (line 7, col 0, score 0.59)
- [Functional Embedding Pipeline Refactor — L31](functional-embedding-pipeline-refactor.md#^ref-a4a25141-31-0) (line 31, col 0, score 0.66)
- [Eidolon Field Abstract Model — L34](eidolon-field-abstract-model.md#^ref-5e8b2388-34-0) (line 34, col 0, score 0.65)
- [2d-sandbox-field — L76](2d-sandbox-field.md#^ref-c710dc93-76-0) (line 76, col 0, score 0.67)
- [ParticleSimulationWithCanvasAndFFmpeg — L30](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-30-0) (line 30, col 0, score 0.65)
- [Language-Agnostic Mirror System — L507](language-agnostic-mirror-system.md#^ref-d2b3628c-507-0) (line 507, col 0, score 0.66)
- [EidolonField — L140](eidolonfield.md#^ref-49d1e1e5-140-0) (line 140, col 0, score 0.64)
- [2d-sandbox-field — L145](2d-sandbox-field.md#^ref-c710dc93-145-0) (line 145, col 0, score 0.67)
- [Promethean Agent DSL TS Scaffold — L488](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-488-0) (line 488, col 0, score 0.65)
- [Promethean Event Bus MVP v0.1 — L474](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-474-0) (line 474, col 0, score 0.65)
- [Promethean Event Bus MVP v0.1 — L380](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-380-0) (line 380, col 0, score 0.65)
- [js-to-lisp-reverse-compiler — L267](js-to-lisp-reverse-compiler.md#^ref-58191024-267-0) (line 267, col 0, score 0.65)
- [schema-evolution-workflow — L9](schema-evolution-workflow.md#^ref-d8059b6a-9-0) (line 9, col 0, score 0.64)
- [compiler-kit-foundations — L166](compiler-kit-foundations.md#^ref-01b21543-166-0) (line 166, col 0, score 0.64)
- [Language-Agnostic Mirror System — L336](language-agnostic-mirror-system.md#^ref-d2b3628c-336-0) (line 336, col 0, score 0.66)
- [Language-Agnostic Mirror System — L273](language-agnostic-mirror-system.md#^ref-d2b3628c-273-0) (line 273, col 0, score 0.65)
- [Lisp-Compiler-Integration — L188](lisp-compiler-integration.md#^ref-cfee6d36-188-0) (line 188, col 0, score 0.65)
- [refactor-relations — L10](refactor-relations.md#^ref-41ce0216-10-0) (line 10, col 0, score 0.64)
- [Promethean-native config design — L160](promethean-native-config-design.md#^ref-ab748541-160-0) (line 160, col 0, score 0.71)
- [ecs-scheduler-and-prefabs — L7](ecs-scheduler-and-prefabs.md#^ref-c62a1815-7-0) (line 7, col 0, score 0.62)
- [System Scheduler with Resource-Aware DAG — L5](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-5-0) (line 5, col 0, score 0.62)
- [Interop and Source Maps — L21](interop-and-source-maps.md#^ref-cdfac40c-21-0) (line 21, col 0, score 0.65)
- [balanced-bst — L3](balanced-bst.md#^ref-d3e7db72-3-0) (line 3, col 0, score 0.62)
- [Stateful Partitions and Rebalancing — L351](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-351-0) (line 351, col 0, score 0.62)
- [Promethean Agent DSL TS Scaffold — L107](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-107-0) (line 107, col 0, score 0.64)
- [markdown-to-org-transpiler — L7](markdown-to-org-transpiler.md#^ref-ab54cdd8-7-0) (line 7, col 0, score 0.71)
- [Promethean Agent DSL TS Scaffold — L723](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-723-0) (line 723, col 0, score 0.66)
- [set-assignment-in-lisp-ast — L144](set-assignment-in-lisp-ast.md#^ref-c5fba0a0-144-0) (line 144, col 0, score 0.65)
- [markdown-to-org-transpiler — L219](markdown-to-org-transpiler.md#^ref-ab54cdd8-219-0) (line 219, col 0, score 0.64)
- [universal-intention-code-fabric — L277](universal-intention-code-fabric.md#^ref-c14edce7-277-0) (line 277, col 0, score 0.64)
- [Pure TypeScript Search Microservice — L178](pure-typescript-search-microservice.md#^ref-d17d3a96-178-0) (line 178, col 0, score 0.59)
- [Per-Domain Policy System for JS Crawler — L141](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-141-0) (line 141, col 0, score 0.6)
- [sibilant-macro-targets — L127](sibilant-macro-targets.md#^ref-c5c9a5c6-127-0) (line 127, col 0, score 0.6)
- [Per-Domain Policy System for JS Crawler — L184](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-184-0) (line 184, col 0, score 0.58)
- [Local-Only-LLM-Workflow — L69](local-only-llm-workflow.md#^ref-9a8ab57e-69-0) (line 69, col 0, score 0.58)
- [State Snapshots API and Transactional Projector — L179](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-179-0) (line 179, col 0, score 0.63)
- [set-assignment-in-lisp-ast — L58](set-assignment-in-lisp-ast.md#^ref-c5fba0a0-58-0) (line 58, col 0, score 0.62)
- [Local-First Intention→Code Loop with Free Models — L120](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-120-0) (line 120, col 0, score 0.62)
- [universal-intention-code-fabric — L26](universal-intention-code-fabric.md#^ref-c14edce7-26-0) (line 26, col 0, score 0.62)
- [Cross-Language Runtime Polymorphism — L141](cross-language-runtime-polymorphism.md#^ref-c34c36a6-141-0) (line 141, col 0, score 0.62)
- [Cross-Target Macro System in Sibilant — L62](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-62-0) (line 62, col 0, score 0.62)
- [Mongo Outbox Implementation — L74](mongo-outbox-implementation.md#^ref-9c1acd1e-74-0) (line 74, col 0, score 0.62)
- [Local-First Intention→Code Loop with Free Models — L47](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-47-0) (line 47, col 0, score 0.64)
- [Cross-Target Macro System in Sibilant — L74](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-74-0) (line 74, col 0, score 0.6)
- [universal-intention-code-fabric — L418](universal-intention-code-fabric.md#^ref-c14edce7-418-0) (line 418, col 0, score 0.6)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L194](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-194-0) (line 194, col 0, score 0.65)
- [State Snapshots API and Transactional Projector — L9](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-9-0) (line 9, col 0, score 0.64)
- [TypeScript Patch for Tool Calling Support — L35](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-35-0) (line 35, col 0, score 0.64)
- [Promethean Agent DSL TS Scaffold — L308](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-308-0) (line 308, col 0, score 0.64)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L108](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-108-0) (line 108, col 0, score 0.65)
- [compiler-kit-foundations — L574](compiler-kit-foundations.md#^ref-01b21543-574-0) (line 574, col 0, score 0.64)
- [universal-intention-code-fabric — L353](universal-intention-code-fabric.md#^ref-c14edce7-353-0) (line 353, col 0, score 0.64)
- [2d-sandbox-field — L129](2d-sandbox-field.md#^ref-c710dc93-129-0) (line 129, col 0, score 0.67)
- [ecs-offload-workers — L306](ecs-offload-workers.md#^ref-6498b9d7-306-0) (line 306, col 0, score 0.67)
- [Layer1SurvivabilityEnvelope — L63](layer1survivabilityenvelope.md#^ref-64a9f9f9-63-0) (line 63, col 0, score 0.65)
- [zero-copy-snapshots-and-workers — L202](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-202-0) (line 202, col 0, score 0.64)
- [ecs-scheduler-and-prefabs — L340](ecs-scheduler-and-prefabs.md#^ref-c62a1815-340-0) (line 340, col 0, score 0.64)
- [System Scheduler with Resource-Aware DAG — L338](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-338-0) (line 338, col 0, score 0.64)
- [System Scheduler with Resource-Aware DAG — L410](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-410-0) (line 410, col 0, score 0.76)
- [zero-copy-snapshots-and-workers — L306](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-306-0) (line 306, col 0, score 0.66)
- [zero-copy-snapshots-and-workers — L267](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-267-0) (line 267, col 0, score 0.65)
- [ecs-offload-workers — L7](ecs-offload-workers.md#^ref-6498b9d7-7-0) (line 7, col 0, score 0.62)
- [zero-copy-snapshots-and-workers — L156](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-156-0) (line 156, col 0, score 0.62)
- [Performance-Optimized-Polyglot-Bridge — L394](performance-optimized-polyglot-bridge.md#^ref-f5579967-394-0) (line 394, col 0, score 0.64)
- [Performance-Optimized-Polyglot-Bridge — L13](performance-optimized-polyglot-bridge.md#^ref-f5579967-13-0) (line 13, col 0, score 0.63)
- [ecs-scheduler-and-prefabs — L381](ecs-scheduler-and-prefabs.md#^ref-c62a1815-381-0) (line 381, col 0, score 0.62)
- [System Scheduler with Resource-Aware DAG — L379](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-379-0) (line 379, col 0, score 0.62)
- [Factorio AI with External Agents — L15](factorio-ai-with-external-agents.md#^ref-a4d90289-15-0) (line 15, col 0, score 0.62)
- [Promethean Agent Config DSL — L11](promethean-agent-config-dsl.md#^ref-2c00ce45-11-0) (line 11, col 0, score 0.62)
- [universal-intention-code-fabric — L393](universal-intention-code-fabric.md#^ref-c14edce7-393-0) (line 393, col 0, score 0.62)
- [Agent Tasks: Persistence Migration to DualStore — L8](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-8-0) (line 8, col 0, score 0.72)
- [Local-Only-LLM-Workflow — L122](local-only-llm-workflow.md#^ref-9a8ab57e-122-0) (line 122, col 0, score 0.71)
- [eidolon-field-math-foundations — L105](eidolon-field-math-foundations.md#^ref-008f2ac0-105-0) (line 105, col 0, score 0.71)
- [Per-Domain Policy System for JS Crawler — L115](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-115-0) (line 115, col 0, score 0.69)
- [Migrate to Provider-Tenant Architecture — L38](migrate-to-provider-tenant-architecture.md#^ref-54382370-38-0) (line 38, col 0, score 0.69)
- [Chroma-Embedding-Refactor — L26](chroma-embedding-refactor.md#^ref-8b256935-26-0) (line 26, col 0, score 0.69)
- [Prompt_Folder_Bootstrap — L60](prompt-folder-bootstrap.md#^ref-bd4f0976-60-0) (line 60, col 0, score 0.68)
- [Performance-Optimized-Polyglot-Bridge — L339](performance-optimized-polyglot-bridge.md#^ref-f5579967-339-0) (line 339, col 0, score 0.67)
- [Migrate to Provider-Tenant Architecture — L100](migrate-to-provider-tenant-architecture.md#^ref-54382370-100-0) (line 100, col 0, score 0.67)
- [js-to-lisp-reverse-compiler — L383](js-to-lisp-reverse-compiler.md#^ref-58191024-383-0) (line 383, col 0, score 0.63)
- [Interop and Source Maps — L504](interop-and-source-maps.md#^ref-cdfac40c-504-0) (line 504, col 0, score 0.66)
- [Promethean Agent DSL TS Scaffold — L1](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-1-0) (line 1, col 0, score 0.65)
- [Chroma-Embedding-Refactor — L7](chroma-embedding-refactor.md#^ref-8b256935-7-0) (line 7, col 0, score 0.65)
- [Language-Agnostic Mirror System — L234](language-agnostic-mirror-system.md#^ref-d2b3628c-234-0) (line 234, col 0, score 0.65)
- [Language-Agnostic Mirror System — L235](language-agnostic-mirror-system.md#^ref-d2b3628c-235-0) (line 235, col 0, score 0.65)
- [Promethean-Copilot-Intent-Engine — L31](promethean-copilot-intent-engine.md#^ref-ae24a280-31-0) (line 31, col 0, score 0.65)
- [compiler-kit-foundations — L9](compiler-kit-foundations.md#^ref-01b21543-9-0) (line 9, col 0, score 0.64)
- [universal-intention-code-fabric — L1](universal-intention-code-fabric.md#^ref-c14edce7-1-0) (line 1, col 0, score 0.64)
- [Cross-Target Macro System in Sibilant — L160](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-160-0) (line 160, col 0, score 0.64)
- [template-based-compilation — L90](template-based-compilation.md#^ref-f8877e5e-90-0) (line 90, col 0, score 0.64)
- [Dynamic Context Model for Web Components — L331](dynamic-context-model-for-web-components.md#^ref-f7702bf8-331-0) (line 331, col 0, score 0.64)
- [Promethean-native config design — L31](promethean-native-config-design.md#^ref-ab748541-31-0) (line 31, col 0, score 0.64)
- [Promethean-native config design — L32](promethean-native-config-design.md#^ref-ab748541-32-0) (line 32, col 0, score 0.64)
- [Promethean-native config design — L33](promethean-native-config-design.md#^ref-ab748541-33-0) (line 33, col 0, score 0.64)
- [Promethean-native config design — L35](promethean-native-config-design.md#^ref-ab748541-35-0) (line 35, col 0, score 0.64)
- [Promethean Event Bus MVP v0.1 — L373](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-373-0) (line 373, col 0, score 0.76)
- [Migrate to Provider-Tenant Architecture — L128](migrate-to-provider-tenant-architecture.md#^ref-54382370-128-0) (line 128, col 0, score 0.74)
- [Promethean-native config design — L27](promethean-native-config-design.md#^ref-ab748541-27-0) (line 27, col 0, score 0.72)
- [prom-lib-rate-limiters-and-replay-api — L377](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-377-0) (line 377, col 0, score 0.71)
- [Promethean-native config design — L103](promethean-native-config-design.md#^ref-ab748541-103-0) (line 103, col 0, score 0.66)
- [Pure TypeScript Search Microservice — L514](pure-typescript-search-microservice.md#^ref-d17d3a96-514-0) (line 514, col 0, score 0.65)
- [Stateful Partitions and Rebalancing — L290](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-290-0) (line 290, col 0, score 0.64)
- [schema-evolution-workflow — L311](schema-evolution-workflow.md#^ref-d8059b6a-311-0) (line 311, col 0, score 0.63)
- [Stateful Partitions and Rebalancing — L3](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-3-0) (line 3, col 0, score 0.63)
- [RAG UI Panel with Qdrant and PostgREST — L357](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-357-0) (line 357, col 0, score 0.63)
- [Promethean_Eidolon_Synchronicity_Model — L74](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-74-0) (line 74, col 0, score 1)
- [Promethean Event Bus MVP v0.1 — L929](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-929-0) (line 929, col 0, score 1)
- [Promethean Infrastructure Setup — L597](promethean-infrastructure-setup.md#^ref-6deed6ac-597-0) (line 597, col 0, score 1)
- [Promethean-native config design — L421](promethean-native-config-design.md#^ref-ab748541-421-0) (line 421, col 0, score 1)
- [promethean-system-diagrams — L217](promethean-system-diagrams.md#^ref-b51e19b4-217-0) (line 217, col 0, score 1)
- [Promethean Web UI Setup — L629](promethean-web-ui-setup.md#^ref-bc5172ca-629-0) (line 629, col 0, score 1)
- [Prompt_Folder_Bootstrap — L193](prompt-folder-bootstrap.md#^ref-bd4f0976-193-0) (line 193, col 0, score 1)
- [prompt-programming-language-lisp — L107](prompt-programming-language-lisp.md#^ref-d41a06d1-107-0) (line 107, col 0, score 1)
- [field-node-diagram-visualizations — L89](field-node-diagram-visualizations.md#^ref-e9b27b06-89-0) (line 89, col 0, score 1)
- [graph-ds — L373](graph-ds.md#^ref-6620e2f2-373-0) (line 373, col 0, score 1)
- [heartbeat-fragment-demo — L99](heartbeat-fragment-demo.md#^ref-dd00677a-99-0) (line 99, col 0, score 1)
- [heartbeat-simulation-snippets — L86](heartbeat-simulation-snippets.md#^ref-23e221e9-86-0) (line 86, col 0, score 1)
- [homeostasis-decay-formulas — L154](homeostasis-decay-formulas.md#^ref-37b5d236-154-0) (line 154, col 0, score 1)
- [Interop and Source Maps — L518](interop-and-source-maps.md#^ref-cdfac40c-518-0) (line 518, col 0, score 1)
- [komorebi-group-window-hack — L205](komorebi-group-window-hack.md#^ref-dd89372d-205-0) (line 205, col 0, score 1)
- [layer-1-uptime-diagrams — L166](layer-1-uptime-diagrams.md#^ref-4127189a-166-0) (line 166, col 0, score 1)
- [Lisp-Compiler-Integration — L558](lisp-compiler-integration.md#^ref-cfee6d36-558-0) (line 558, col 0, score 1)
- [sibilant-macro-targets — L172](sibilant-macro-targets.md#^ref-c5c9a5c6-172-0) (line 172, col 0, score 1)
- [Sibilant Meta-Prompt DSL — L205](sibilant-meta-prompt-dsl.md#^ref-af5d2824-205-0) (line 205, col 0, score 1)
- [sibilant-meta-string-templating-runtime — L137](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-137-0) (line 137, col 0, score 1)
- [sibilant-metacompiler-overview — L90](sibilant-metacompiler-overview.md#^ref-61d4086b-90-0) (line 90, col 0, score 1)
- [State Snapshots API and Transactional Projector — L366](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-366-0) (line 366, col 0, score 1)
- [System Scheduler with Resource-Aware DAG — L394](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-394-0) (line 394, col 0, score 1)
- [template-based-compilation — L104](template-based-compilation.md#^ref-f8877e5e-104-0) (line 104, col 0, score 1)
- [ts-to-lisp-transpiler — L8](ts-to-lisp-transpiler.md#^ref-ba11486b-8-0) (line 8, col 0, score 1)
- [Unique Info Dump Index — L103](unique-info-dump-index.md#^ref-30ec3ba6-103-0) (line 103, col 0, score 1)
- [aionian-circuit-math — L153](aionian-circuit-math.md#^ref-f2d83a77-153-0) (line 153, col 0, score 1)
- [JavaScript — L24](chunks/javascript.md#^ref-c1618c66-24-0) (line 24, col 0, score 1)
- [Math Fundamentals — L26](chunks/math-fundamentals.md#^ref-c6e87433-26-0) (line 26, col 0, score 1)
- [compiler-kit-foundations — L607](compiler-kit-foundations.md#^ref-01b21543-607-0) (line 607, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L201](cross-language-runtime-polymorphism.md#^ref-c34c36a6-201-0) (line 201, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L166](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-166-0) (line 166, col 0, score 1)
- [Dynamic Context Model for Web Components — L416](dynamic-context-model-for-web-components.md#^ref-f7702bf8-416-0) (line 416, col 0, score 1)
- [field-interaction-equations — L153](field-interaction-equations.md#^ref-b09141b7-153-0) (line 153, col 0, score 1)
- [graph-ds — L371](graph-ds.md#^ref-6620e2f2-371-0) (line 371, col 0, score 1)
- [homeostasis-decay-formulas — L175](homeostasis-decay-formulas.md#^ref-37b5d236-175-0) (line 175, col 0, score 1)
- [archetype-ecs — L457](archetype-ecs.md#^ref-8f4c1e86-457-0) (line 457, col 0, score 1)
- [JavaScript — L21](chunks/javascript.md#^ref-c1618c66-21-0) (line 21, col 0, score 1)
- [compiler-kit-foundations — L626](compiler-kit-foundations.md#^ref-01b21543-626-0) (line 626, col 0, score 1)
- [ecs-offload-workers — L488](ecs-offload-workers.md#^ref-6498b9d7-488-0) (line 488, col 0, score 1)
- [ecs-scheduler-and-prefabs — L412](ecs-scheduler-and-prefabs.md#^ref-c62a1815-412-0) (line 412, col 0, score 1)
- [Language-Agnostic Mirror System — L547](language-agnostic-mirror-system.md#^ref-d2b3628c-547-0) (line 547, col 0, score 1)
- [System Scheduler with Resource-Aware DAG — L407](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-407-0) (line 407, col 0, score 1)
- [template-based-compilation — L130](template-based-compilation.md#^ref-f8877e5e-130-0) (line 130, col 0, score 1)
- [Exception Layer Analysis — L172](exception-layer-analysis.md#^ref-21d5cc09-172-0) (line 172, col 0, score 1)
- [field-dynamics-math-blocks — L154](field-dynamics-math-blocks.md#^ref-7cfc230d-154-0) (line 154, col 0, score 1)
- [field-interaction-equations — L164](field-interaction-equations.md#^ref-b09141b7-164-0) (line 164, col 0, score 1)
- [field-node-diagram-outline — L120](field-node-diagram-outline.md#^ref-1f32c94a-120-0) (line 120, col 0, score 1)
- [field-node-diagram-set — L149](field-node-diagram-set.md#^ref-22b989d5-149-0) (line 149, col 0, score 1)
- [field-node-diagram-visualizations — L99](field-node-diagram-visualizations.md#^ref-e9b27b06-99-0) (line 99, col 0, score 1)
- [graph-ds — L365](graph-ds.md#^ref-6620e2f2-365-0) (line 365, col 0, score 1)
- [heartbeat-fragment-demo — L111](heartbeat-fragment-demo.md#^ref-dd00677a-111-0) (line 111, col 0, score 1)
- [heartbeat-simulation-snippets — L101](heartbeat-simulation-snippets.md#^ref-23e221e9-101-0) (line 101, col 0, score 1)
- [Diagrams — L13](chunks/diagrams.md#^ref-45cd25b5-13-0) (line 13, col 0, score 1)
- [DSL — L15](chunks/dsl.md#^ref-e87bc036-15-0) (line 15, col 0, score 1)
- [JavaScript — L18](chunks/javascript.md#^ref-c1618c66-18-0) (line 18, col 0, score 1)
- [Math Fundamentals — L14](chunks/math-fundamentals.md#^ref-c6e87433-14-0) (line 14, col 0, score 1)
- [Services — L14](chunks/services.md#^ref-75ea4a6a-14-0) (line 14, col 0, score 1)
- [Shared — L7](chunks/shared.md#^ref-623a55f7-7-0) (line 7, col 0, score 1)
- [Simulation Demo — L10](chunks/simulation-demo.md#^ref-557309a3-10-0) (line 10, col 0, score 1)
- [Tooling — L9](chunks/tooling.md#^ref-6cb4943e-9-0) (line 9, col 0, score 1)
- [Window Management — L15](chunks/window-management.md#^ref-9e8ae388-15-0) (line 15, col 0, score 1)
- [aionian-circuit-math — L165](aionian-circuit-math.md#^ref-f2d83a77-165-0) (line 165, col 0, score 1)
- [api-gateway-versioning — L319](api-gateway-versioning.md#^ref-0580dcd3-319-0) (line 319, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L116](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-116-0) (line 116, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L209](chroma-toolkit-consolidation-plan.md#^ref-5020e892-209-0) (line 209, col 0, score 1)
- [DSL — L13](chunks/dsl.md#^ref-e87bc036-13-0) (line 13, col 0, score 1)
- [Math Fundamentals — L16](chunks/math-fundamentals.md#^ref-c6e87433-16-0) (line 16, col 0, score 1)
- [Services — L16](chunks/services.md#^ref-75ea4a6a-16-0) (line 16, col 0, score 1)
- [Shared — L5](chunks/shared.md#^ref-623a55f7-5-0) (line 5, col 0, score 1)
- [Simulation Demo — L12](chunks/simulation-demo.md#^ref-557309a3-12-0) (line 12, col 0, score 1)
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
- [Language-Agnostic Mirror System — L532](language-agnostic-mirror-system.md#^ref-d2b3628c-532-0) (line 532, col 0, score 1)
- [Lispy Macros with syntax-rules — L399](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-399-0) (line 399, col 0, score 1)
- [Local-Only-LLM-Workflow — L183](local-only-llm-workflow.md#^ref-9a8ab57e-183-0) (line 183, col 0, score 1)
- [markdown-to-org-transpiler — L306](markdown-to-org-transpiler.md#^ref-ab54cdd8-306-0) (line 306, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L314](migrate-to-provider-tenant-architecture.md#^ref-54382370-314-0) (line 314, col 0, score 1)
- [mystery-lisp-search-session — L127](mystery-lisp-search-session.md#^ref-513dc4c7-127-0) (line 127, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L171](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-171-0) (line 171, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L255](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-255-0) (line 255, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L448](performance-optimized-polyglot-bridge.md#^ref-f5579967-448-0) (line 448, col 0, score 1)
- [archetype-ecs — L467](archetype-ecs.md#^ref-8f4c1e86-467-0) (line 467, col 0, score 1)
- [DSL — L20](chunks/dsl.md#^ref-e87bc036-20-0) (line 20, col 0, score 1)
- [compiler-kit-foundations — L606](compiler-kit-foundations.md#^ref-01b21543-606-0) (line 606, col 0, score 1)
- [Interop and Source Maps — L514](interop-and-source-maps.md#^ref-cdfac40c-514-0) (line 514, col 0, score 1)
- [js-to-lisp-reverse-compiler — L437](js-to-lisp-reverse-compiler.md#^ref-58191024-437-0) (line 437, col 0, score 1)
- [Language-Agnostic Mirror System — L534](language-agnostic-mirror-system.md#^ref-d2b3628c-534-0) (line 534, col 0, score 1)
- [Lisp-Compiler-Integration — L536](lisp-compiler-integration.md#^ref-cfee6d36-536-0) (line 536, col 0, score 1)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L515](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-515-0) (line 515, col 0, score 1)
- [AI-Centric OS with MCP Layer — L405](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-405-0) (line 405, col 0, score 1)
- [archetype-ecs — L469](archetype-ecs.md#^ref-8f4c1e86-469-0) (line 469, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L219](chroma-toolkit-consolidation-plan.md#^ref-5020e892-219-0) (line 219, col 0, score 1)
- [DSL — L19](chunks/dsl.md#^ref-e87bc036-19-0) (line 19, col 0, score 1)
- [JavaScript — L25](chunks/javascript.md#^ref-c1618c66-25-0) (line 25, col 0, score 1)
- [Window Management — L26](chunks/window-management.md#^ref-9e8ae388-26-0) (line 26, col 0, score 1)
- [compiler-kit-foundations — L608](compiler-kit-foundations.md#^ref-01b21543-608-0) (line 608, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L261](cross-language-runtime-polymorphism.md#^ref-c34c36a6-261-0) (line 261, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L181](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-181-0) (line 181, col 0, score 1)
- [Math Fundamentals — L34](chunks/math-fundamentals.md#^ref-c6e87433-34-0) (line 34, col 0, score 1)
- [Services — L22](chunks/services.md#^ref-75ea4a6a-22-0) (line 22, col 0, score 1)
- [Shared — L29](chunks/shared.md#^ref-623a55f7-29-0) (line 29, col 0, score 1)
- [Simulation Demo — L23](chunks/simulation-demo.md#^ref-557309a3-23-0) (line 23, col 0, score 1)
- [Tooling — L16](chunks/tooling.md#^ref-6cb4943e-16-0) (line 16, col 0, score 1)
- [Window Management — L25](chunks/window-management.md#^ref-9e8ae388-25-0) (line 25, col 0, score 1)
- [compiler-kit-foundations — L627](compiler-kit-foundations.md#^ref-01b21543-627-0) (line 627, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L171](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-171-0) (line 171, col 0, score 1)
- [Duck's Attractor States — L81](ducks-attractor-states.md#^ref-13951643-81-0) (line 81, col 0, score 1)
- [Math Fundamentals — L20](chunks/math-fundamentals.md#^ref-c6e87433-20-0) (line 20, col 0, score 1)
- [Services — L20](chunks/services.md#^ref-75ea4a6a-20-0) (line 20, col 0, score 1)
- [compiler-kit-foundations — L620](compiler-kit-foundations.md#^ref-01b21543-620-0) (line 620, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L237](cross-language-runtime-polymorphism.md#^ref-c34c36a6-237-0) (line 237, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L40](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-40-0) (line 40, col 0, score 1)
- [Dynamic Context Model for Web Components — L401](dynamic-context-model-for-web-components.md#^ref-f7702bf8-401-0) (line 401, col 0, score 1)
- [ecs-scheduler-and-prefabs — L386](ecs-scheduler-and-prefabs.md#^ref-c62a1815-386-0) (line 386, col 0, score 1)
- [eidolon-field-math-foundations — L127](eidolon-field-math-foundations.md#^ref-008f2ac0-127-0) (line 127, col 0, score 1)
- [Event Bus MVP — L557](event-bus-mvp.md#^ref-534fe91d-557-0) (line 557, col 0, score 1)
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
- [Admin Dashboard for User Management — L55](admin-dashboard-for-user-management.md#^ref-2901a3e9-55-0) (line 55, col 0, score 1)
- [AI-Centric OS with MCP Layer — L414](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-414-0) (line 414, col 0, score 1)
- [Board Walk – 2025-08-11 — L144](board-walk-2025-08-11.md#^ref-7aa1eb92-144-0) (line 144, col 0, score 1)
- [Operations — L7](chunks/operations.md#^ref-f1add613-7-0) (line 7, col 0, score 1)
- [Shared — L15](chunks/shared.md#^ref-623a55f7-15-0) (line 15, col 0, score 1)
- [Window Management — L23](chunks/window-management.md#^ref-9e8ae388-23-0) (line 23, col 0, score 1)
- [Creative Moments — L7](creative-moments.md#^ref-10d98225-7-0) (line 7, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L210](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-210-0) (line 210, col 0, score 1)
- [DuckDuckGoSearchPipeline — L11](duckduckgosearchpipeline.md#^ref-e979c50f-11-0) (line 11, col 0, score 1)
- [Duck's Attractor States — L68](ducks-attractor-states.md#^ref-13951643-68-0) (line 68, col 0, score 1)
- [Duck's Self-Referential Perceptual Loop — L44](ducks-self-referential-perceptual-loop.md#^ref-71726f04-44-0) (line 44, col 0, score 1)
- [Dynamic Context Model for Web Components — L424](dynamic-context-model-for-web-components.md#^ref-f7702bf8-424-0) (line 424, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L96](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-96-0) (line 96, col 0, score 1)
- [2d-sandbox-field — L225](2d-sandbox-field.md#^ref-c710dc93-225-0) (line 225, col 0, score 1)
- [Admin Dashboard for User Management — L49](admin-dashboard-for-user-management.md#^ref-2901a3e9-49-0) (line 49, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L150](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-150-0) (line 150, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L163](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-163-0) (line 163, col 0, score 1)
- [AI-First-OS-Model-Context-Protocol — L9](ai-first-os-model-context-protocol.md#^ref-618198f4-9-0) (line 9, col 0, score 1)
- [aionian-circuit-math — L179](aionian-circuit-math.md#^ref-f2d83a77-179-0) (line 179, col 0, score 1)
- [api-gateway-versioning — L304](api-gateway-versioning.md#^ref-0580dcd3-304-0) (line 304, col 0, score 1)
- [archetype-ecs — L479](archetype-ecs.md#^ref-8f4c1e86-479-0) (line 479, col 0, score 1)
- [balanced-bst — L295](balanced-bst.md#^ref-d3e7db72-295-0) (line 295, col 0, score 1)
- [DuckDuckGoSearchPipeline — L10](duckduckgosearchpipeline.md#^ref-e979c50f-10-0) (line 10, col 0, score 1)
- [Event Bus Projections Architecture — L169](event-bus-projections-architecture.md#^ref-cf6b9b17-169-0) (line 169, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L63](model-upgrade-calm-down-guide.md#^ref-db74343f-63-0) (line 63, col 0, score 1)
- [NPU Voice Code and Sensory Integration — L10](npu-voice-code-and-sensory-integration.md#^ref-5a02283e-10-0) (line 10, col 0, score 1)
- [observability-infrastructure-setup — L391](observability-infrastructure-setup.md#^ref-b4e64f8c-391-0) (line 391, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L111](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-111-0) (line 111, col 0, score 1)
- [OpenAPI Validation Report — L29](openapi-validation-report.md#^ref-5c152b08-29-0) (line 29, col 0, score 1)
- [Optimizing Command Limitations in System Design — L36](optimizing-command-limitations-in-system-design.md#^ref-98c8ff62-36-0) (line 36, col 0, score 1)
- [plan-update-confirmation — L1013](plan-update-confirmation.md#^ref-b22d79c6-1013-0) (line 1013, col 0, score 1)
- [pm2-orchestration-patterns — L252](pm2-orchestration-patterns.md#^ref-51932e7b-252-0) (line 252, col 0, score 1)
- [Pure TypeScript Search Microservice — L538](pure-typescript-search-microservice.md#^ref-d17d3a96-538-0) (line 538, col 0, score 1)
- [RAG UI Panel with Qdrant and PostgREST — L374](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-374-0) (line 374, col 0, score 1)
- [Recursive Prompt Construction Engine — L200](recursive-prompt-construction-engine.md#^ref-babdb9eb-200-0) (line 200, col 0, score 1)
- [Redirecting Standard Error — L31](redirecting-standard-error.md#^ref-b3555ede-31-0) (line 31, col 0, score 1)
- [ripple-propagation-demo — L120](ripple-propagation-demo.md#^ref-8430617b-120-0) (line 120, col 0, score 1)
- [schema-evolution-workflow — L502](schema-evolution-workflow.md#^ref-d8059b6a-502-0) (line 502, col 0, score 1)
- [Self-Agency in AI Interaction — L53](self-agency-in-ai-interaction.md#^ref-49a9a860-53-0) (line 53, col 0, score 1)
- [set-assignment-in-lisp-ast — L161](set-assignment-in-lisp-ast.md#^ref-c5fba0a0-161-0) (line 161, col 0, score 1)
- [shared-package-layout-clarification — L185](shared-package-layout-clarification.md#^ref-36c8882a-185-0) (line 185, col 0, score 1)
- [Shared Package Structure — L181](shared-package-structure.md#^ref-66a72fc3-181-0) (line 181, col 0, score 1)
- [sibilant-macro-targets — L173](sibilant-macro-targets.md#^ref-c5c9a5c6-173-0) (line 173, col 0, score 1)
- [eidolon-node-lifecycle — L63](eidolon-node-lifecycle.md#^ref-938eca9c-63-0) (line 63, col 0, score 1)
- [EidolonField — L269](eidolonfield.md#^ref-49d1e1e5-269-0) (line 269, col 0, score 1)
- [Event Bus MVP — L566](event-bus-mvp.md#^ref-534fe91d-566-0) (line 566, col 0, score 1)
- [Event Bus Projections Architecture — L185](event-bus-projections-architecture.md#^ref-cf6b9b17-185-0) (line 185, col 0, score 1)
- [Exception Layer Analysis — L165](exception-layer-analysis.md#^ref-21d5cc09-165-0) (line 165, col 0, score 1)
- [Factorio AI with External Agents — L160](factorio-ai-with-external-agents.md#^ref-a4d90289-160-0) (line 160, col 0, score 1)
- [field-dynamics-math-blocks — L165](field-dynamics-math-blocks.md#^ref-7cfc230d-165-0) (line 165, col 0, score 1)
- [field-interaction-equations — L184](field-interaction-equations.md#^ref-b09141b7-184-0) (line 184, col 0, score 1)
- [field-node-diagram-outline — L132](field-node-diagram-outline.md#^ref-1f32c94a-132-0) (line 132, col 0, score 1)
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
- [Simulation Demo — L32](chunks/simulation-demo.md#^ref-557309a3-32-0) (line 32, col 0, score 1)
- [Tooling — L26](chunks/tooling.md#^ref-6cb4943e-26-0) (line 26, col 0, score 1)
- [Window Management — L36](chunks/window-management.md#^ref-9e8ae388-36-0) (line 36, col 0, score 1)
- [compiler-kit-foundations — L639](compiler-kit-foundations.md#^ref-01b21543-639-0) (line 639, col 0, score 1)
- [Creative Moments — L10](creative-moments.md#^ref-10d98225-10-0) (line 10, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L258](cross-language-runtime-polymorphism.md#^ref-c34c36a6-258-0) (line 258, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L215](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-215-0) (line 215, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L50](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-50-0) (line 50, col 0, score 1)
- [DuckDuckGoSearchPipeline — L16](duckduckgosearchpipeline.md#^ref-e979c50f-16-0) (line 16, col 0, score 1)
- [Admin Dashboard for User Management — L45](admin-dashboard-for-user-management.md#^ref-2901a3e9-45-0) (line 45, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L170](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-170-0) (line 170, col 0, score 1)
- [AI-Centric OS with MCP Layer — L416](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-416-0) (line 416, col 0, score 1)
- [AI-First-OS-Model-Context-Protocol — L11](ai-first-os-model-context-protocol.md#^ref-618198f4-11-0) (line 11, col 0, score 1)
- [aionian-circuit-math — L178](aionian-circuit-math.md#^ref-f2d83a77-178-0) (line 178, col 0, score 1)
- [api-gateway-versioning — L312](api-gateway-versioning.md#^ref-0580dcd3-312-0) (line 312, col 0, score 1)
- [balanced-bst — L297](balanced-bst.md#^ref-d3e7db72-297-0) (line 297, col 0, score 1)
- [Board Walk – 2025-08-11 — L131](board-walk-2025-08-11.md#^ref-7aa1eb92-131-0) (line 131, col 0, score 1)
- [Operations — L8](chunks/operations.md#^ref-f1add613-8-0) (line 8, col 0, score 1)
- [Local-Offline-Model-Deployment-Strategy — L305](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-305-0) (line 305, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L331](migrate-to-provider-tenant-architecture.md#^ref-54382370-331-0) (line 331, col 0, score 1)
- [Mindful Prioritization — L9](mindful-prioritization.md#^ref-40185d05-9-0) (line 9, col 0, score 1)
- [MindfulRobotIntegration — L7](mindfulrobotintegration.md#^ref-5f65dfa5-7-0) (line 7, col 0, score 1)
- [Model Upgrade Calm-Down Guide — L66](model-upgrade-calm-down-guide.md#^ref-db74343f-66-0) (line 66, col 0, score 1)
- [NPU Voice Code and Sensory Integration — L13](npu-voice-code-and-sensory-integration.md#^ref-5a02283e-13-0) (line 13, col 0, score 1)
- [observability-infrastructure-setup — L393](observability-infrastructure-setup.md#^ref-b4e64f8c-393-0) (line 393, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L59](obsidian-chatgpt-plugin-integration-guide.md#^ref-1d3d6c3a-59-0) (line 59, col 0, score 1)
- [Obsidian ChatGPT Plugin Integration — L56](obsidian-chatgpt-plugin-integration.md#^ref-ca8e1399-56-0) (line 56, col 0, score 1)
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
- [markdown-to-org-transpiler — L313](markdown-to-org-transpiler.md#^ref-ab54cdd8-313-0) (line 313, col 0, score 1)
- [Matplotlib Animation with Async Execution — L79](matplotlib-animation-with-async-execution.md#^ref-687439f9-79-0) (line 79, col 0, score 1)
- [Migrate to Provider-Tenant Architecture — L299](migrate-to-provider-tenant-architecture.md#^ref-54382370-299-0) (line 299, col 0, score 1)
- [Model Selection for Lightweight Conversational Tasks — L151](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-151-0) (line 151, col 0, score 1)
- [Mongo Outbox Implementation — L587](mongo-outbox-implementation.md#^ref-9c1acd1e-587-0) (line 587, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L77](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-77-0) (line 77, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L120](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-120-0) (line 120, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L179](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-179-0) (line 179, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L282](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-282-0) (line 282, col 0, score 1)
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
- [Diagrams — L50](chunks/diagrams.md#^ref-45cd25b5-50-0) (line 50, col 0, score 1)
- [DSL — L44](chunks/dsl.md#^ref-e87bc036-44-0) (line 44, col 0, score 1)
- [JavaScript — L48](chunks/javascript.md#^ref-c1618c66-48-0) (line 48, col 0, score 1)
- [Math Fundamentals — L43](chunks/math-fundamentals.md#^ref-c6e87433-43-0) (line 43, col 0, score 1)
- [Operations — L15](chunks/operations.md#^ref-f1add613-15-0) (line 15, col 0, score 1)
- [Services — L43](chunks/services.md#^ref-75ea4a6a-43-0) (line 43, col 0, score 1)
- [Shared — L31](chunks/shared.md#^ref-623a55f7-31-0) (line 31, col 0, score 1)
- [Simulation Demo — L34](chunks/simulation-demo.md#^ref-557309a3-34-0) (line 34, col 0, score 1)
- [Window Management — L38](chunks/window-management.md#^ref-9e8ae388-38-0) (line 38, col 0, score 1)
- [compiler-kit-foundations — L651](compiler-kit-foundations.md#^ref-01b21543-651-0) (line 651, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L263](cross-language-runtime-polymorphism.md#^ref-c34c36a6-263-0) (line 263, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L219](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-219-0) (line 219, col 0, score 1)
- [Docops Feature Updates — L16](docops-feature-updates-3.md#^ref-cdbd21ee-16-0) (line 16, col 0, score 1)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
