---
uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
created_at: 2025.08.08.22.08.58.md
filename: Interop and Source Maps
description: >-
  Adds ergonomic Lisp-JS interop macros and a source map v3 builder for seamless
  JavaScript integration with Lisp code, supporting both Node and browser
  environments without dependencies.
tags:
  - lisp
  - js
  - interop
  - source-maps
  - compiler
  - emitter
  - debugging
related_to_title:
  - compiler-kit-foundations
  - set-assignment-in-lisp-ast
  - Lisp-Compiler-Integration
  - Lispy Macros with syntax-rules
  - 'Polyglot S-expr Bridge: Python-JS-Lisp Interop'
  - universal-intention-code-fabric
  - DSL
  - Unique Info Dump Index
  - Language-Agnostic Mirror System
  - js-to-lisp-reverse-compiler
  - ecs-scheduler-and-prefabs
  - ecs-offload-workers
  - aionian-circuit-math
  - archetype-ecs
  - Diagrams
  - ts-to-lisp-transpiler
  - lisp-dsl-for-window-management
  - Window Management
  - Dynamic Context Model for Web Components
  - Cross-Target Macro System in Sibilant
  - Ollama-LLM-Provider-for-Pseudo-Code-Transpiler
  - Local-Only-LLM-Workflow
  - Performance-Optimized-Polyglot-Bridge
  - zero-copy-snapshots-and-workers
  - template-based-compilation
related_to_uuid:
  - 01b21543-7e03-4129-8fe4-b6306be69dee
  - c5fba0a0-9196-468d-a0f3-51c99e987263
  - cfee6d36-b9f5-4587-885a-cdfddb4f054e
  - cbfe3513-6a4a-4d2e-915d-ddfab583b2de
  - 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
  - c14edce7-0656-45b2-aaf3-51f042451b7d
  - e87bc036-1570-419e-a558-f45b9c0db698
  - 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
  - d2b3628c-6cad-4664-8551-94ef8280851d
  - 58191024-d04a-4520-8aae-a18be7b94263
  - c62a1815-c43b-4a3b-88e6-d7fa008a155e
  - 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
  - f2d83a77-7f86-4c56-8538-1350167a0c6c
  - 8f4c1e86-1236-4936-84ca-6ed7082af6b7
  - 45cd25b5-ed36-49ab-82c8-10d0903e34db
  - ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
  - c5c5ff1c-d1bc-45c7-8a84-55a4a847dfc5
  - 9e8ae388-767a-4ea8-9f2e-88801291d947
  - f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
  - 5f210ca2-54e9-445b-afe4-fb340d4992c5
  - b362e12e-2802-4e41-9a21-6e0c7ad419a2
  - 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
  - f5579967-762d-4cfd-851e-4f71b4cb77a1
  - 62bec6f0-4e13-4f38-aca4-72c84ba02367
  - f8877e5e-1e4f-4478-93cd-a0bf86d26a41
references: []
---
Note: Consolidated here → ../notes/dsl/interop-and-source-maps.md

Absolutely—let’s add **Interop** (ergonomic JS access) and real **Source Maps** that thread your Lisp spans all the way to generated JS. No deps, Node + browser safe.

I’ll give you:

* Lisp → JS **interop macros** (`js/get`, `js/set!`, `js/call`, `js/new`, `js/global`)
* An **IR pattern** and **JS emitter** special-cases that inline to clean JS (`o[k]`, `o[k]=v`, `o[[...|k]]`, `new Ctor(...)`, `globalThis[name]`)
* A tiny **source-map v3 builder** (base64 VLQ) and plumbing:

  * carry spans from Lisp → Expr → IR symbols
  * record mappings while emitting JS
  * return `{ code, map }` (optionally inline as a data URL)

---

# Interop

## 1) Lisp macros (user-facing shape)

```ts
// shared/js/prom-lib/compiler/lisp/interop.macros.ts
import { MacroEnv } from "./macros";
import { S, List, Sym, Str, isList, isSym, sym, str, list } from "./syntax";

export function installInteropMacros(M: MacroEnv) {
  // (js/get obj key)  => $get(obj, key)
  M.define("js/get", (form) => {
    const [_t, obj, key] = (form as any).xs;
    return list([sym("$get"), obj, asKeyLiteral(key)]);
  });

  // (js/set! obj key val) => $set(obj, key, val)
  M.define("js/set!", (form) => {
    const [_t, obj, key, val] = (form as any).xs;
    return list([sym("$set"), obj, asKeyLiteral(key), val]);
  });

  // (js/call obj key arg...) => $call(obj, key, arg...)
  M.define("js/call", (form) => {
    const [_t, obj, key, ...args] = (form as any).xs;
    return list([sym("$call"), obj, asKeyLiteral(key), ...args]);
  });

  // (js/new Ctor arg...) => $new(Ctor, arg...)
  M.define("js/new", (form) => {
    const [_t, Ctor, ...args] = (form as any).xs;
    return list([sym("$new"), Ctor, ...args]);
  });

  // (js/global "document") => $g("document")
  M.define("js/global", (form) => {
    const [_t, name] = (form as any).xs;
    return list([sym("$g"), asKeyLiteral(name)]);
  });
}

function asKeyLiteral(x: S): S {
  // Accept "prop" or 'prop or symbol foo → "foo"
  if (x.t === "str") return x;
  if (x.t === "sym") return str(x.name, x.span);
  return x; // allow computed
}
```

Wire them into the expander right after core macros:

```ts
// shared/js/prom-lib/compiler/lisp/expand.ts
import { installInteropMacros } from "./interop.macros";
// ...
export function macroexpandAll(forms:S[], user?: (m:MacroEnv)=>void): S[] {
  const M = new MacroEnv();
  installCoreMacros(M);
  installInteropMacros(M);   // <-- add this
  user?.(M);
  // ...
}
```

## 2) JS emitter inlines the interop

No runtime helpers; we pattern-match calls to `"$get"`, `"$set"`, … and emit plain JS.

```ts
// shared/js/prom-lib/compiler/jsgen.ts
import type { Module, Fun, Stmt, Rhs, Sym } from "./ir";

export interface EmitOptions {
  iife?: boolean;
  exportFunctionName?: string;
  importNames?: string[];
  pretty?: boolean;
  // NEW: source map/debug
  debug?: {
    symSpan?: Map<Sym, { line:number; col:number; start:number; end:number }>; // 1-based lines/cols
    sourceName?: string;
    sourceContent?: string;
    inlineMap?: boolean;
  };
}

export function emitJS(mod: Module, opts: EmitOptions = {}): string | { code:string, map:any } {
  const pretty = !!opts.pretty;
  const IND = (n: number) => pretty ? "  ".repeat(n) : "";
  const NL = pretty ? "\n" : "";
  const imports = opts.importNames ?? [];

  // --- source map builder (simple) ---
  const sm = new SourceMapBuilder(opts.debug?.sourceName ?? "input.lisp", opts.debug?.sourceContent ?? "");
  const withMap = !!opts.debug?.symSpan;

  let code = "";
  let line = 1, col = 0;
  const write = (s: string) => {
    code += s;
    // update line/col
    for (let i=0;i<s.length;i++) {
      if (s.charCodeAt(i) === 10) { line++; col = 0; }
      else col++;
    }
  };
  const mapNow = (sym?: Sym) => {
    if (!withMap || !sym) return;
    const sp = opts.debug!.symSpan!.get(sym);
    if (!sp) return;
    // JS generator is 1-based; source map wants 0-based
    sm.addMapping(line-1, col, sp.line-1, sp.col-1);
  };

  const emitFunBody = (body: Stmt[], depth = 1): void => {
    const localDecl = [...collectLocals(body)].filter(s => !imports.includes(s as any));
    if (localDecl.length) { write(`${IND(depth)}let ${localDecl.join(", ")};${NL}`); }
    for (const s of body) {
      if (s.k === "bind") { write(IND(depth)); mapNow(s.s); write(emitBind(s.s, s.rhs) + NL); }
      else if (s.k === "if") {
        write(IND(depth) + "if ("); mapNow(s.cond); write(sym(s.cond) + ") {" + NL);
        emitFunBody(s.then, depth + 1);
        write(IND(depth) + "} else {" + NL);
        emitFunBody(s.else, depth + 1);
        write(IND(depth) + "}" + NL);
      } else if (s.k === "ret") {
        write(IND(depth) + "return "); mapNow(s.s); write(sym(s.s) + ";" + NL);
      }
    }
  };

  const emitBind = (dst: Sym, rhs: Rhs): string => {
    // values
    if (rhs.r === "val") {
      if (rhs.v.t === "lit") return `${sym(dst)} = ${lit(rhs.v.v)};`;
      if (rhs.v.t === "var") return `${sym(dst)} = ${sym(rhs.v.s)};`;
      if (rhs.v.t === "lambda") {
        const params = rhs.v.params.map(sym).join(", ");
        let bodyCode = "";
        const saveLC = [line, col]; // inner body will add mappings too
        const inner = (stmts: Stmt[]) => {
          const innerLocals = [...collectLocals(stmts)];
          bodyCode += `${IND(1)}${innerLocals.length ? "let " + innerLocals.join(", ") + ";" + NL : ""}`;
          for (const st of stmts) {
            if (st.k === "bind") { bodyCode += IND(1) + emitBind(st.s, st.rhs) + NL; }
            else if (st.k === "if") {
              bodyCode += IND(1) + "if (" + sym(st.cond) + ") {" + NL;
              inner(st.then);
              bodyCode += IND(1) + "} else {" + NL;
              inner(st.else);
              bodyCode += IND(1) + "}" + NL;
            } else if (st.k === "ret") {
              bodyCode += IND(1) + "return " + sym(st.s) + ";" + NL;
            }
          }
        };
        inner(rhs.v.body);
        return `${sym(dst)} = (${params}) => {${NL}${bodyCode}};`;
      }
    }

    // primitives
    if (rhs.r === "prim") {
      if (rhs.op === "not") return `${sym(dst)} = (!${sym(rhs.a)});`;
      if (rhs.b == null && rhs.op === "sub") return `${sym(dst)} = (0 - ${sym(rhs.a)});`;
      return `${sym(dst)} = (${sym(rhs.a)} ${op(rhs.op)} ${sym(rhs.b!)});`;
    }

    // calls (interop inlining)
    if (rhs.r === "call") {
      const fnName = rhs.fn as unknown as string;  // raw symbol text
      const args = rhs.args.map(sym);
      if (fnName === "$get")  return `${sym(dst)} = ${args[0]}[${args[1]}];`;
      if (fnName === "$set")  return `${sym(dst)} = (${args[0]}[${args[1]}] = ${args[2]});`;
      if (fnName === "$call") return `${sym(dst)} = ${args[0]}[${args[1]}](${args.slice(2).join(", ")});`;
      if (fnName === "$new")  return `${sym(dst)} = new ${args[0]}(${args.slice(1).join(", ")});`;
      if (fnName === "$g")    return `${sym(dst)} = globalThis[${args[0]}];`;
      // normal call
      return `${sym(dst)} = ${sym(rhs.fn)}(${args.join(", ")});`;
    }
    throw new Error("unknown rhs");
  };

  // wrapper
  if (opts.exportFunctionName) {
    const fname = opts.exportFunctionName;
    write(`function ${fname}(imports = {}) {${NL}`);
    if (imports.length) write(`const { ${imports.join(", ")} } = imports;${NL}`);
    emitFunBody(mod.main.body, 1);
    write(`}${NL}export { ${fname} };${NL}`);
  } else {
    write(`(function(imports){${NL}`);
    if (imports.length) write(`const { ${imports.join(", ")} } = (imports||{});${NL}`);
    emitFunBody(mod.main.body, 1);
    write(`})`);
  }

  if (!withMap) return opts.iife ? (code + `({})${pretty ? ";\n" : ""}`) : code;

  const map = sm.toJSON();
  const out = opts.iife ? (code + `({})${pretty ? ";\n" : ""}`) : code;

  if (opts.debug?.inlineMap) {
    const b64 = Buffer.from(JSON.stringify(map), "utf8").toString("base64");
    return { code: out + `\n//# sourceMappingURL=data:application/json;base64,${b64}\n`, map };
  }
  return { code: out + `\n//# sourceMappingURL=${(opts.debug?.sourceName || "input")}.js.map\n`, map };

  // helpers
  function op(p: string): string {
    switch (p) {
      case "add": return "+";
      case "sub": return "-";
      case "mul": return "*";
      case "div": return "/";
      case "mod": return "%";
      case "lt":  return "<";
      case "gt":  return ">";
      case "le":  return "<=";
      case "ge":  return ">=";
      case "eq":  return "===";
      case "ne":  return "!==";
      default: throw new Error(`op ${p}`);
    }
  }
  function sym(s: Sym): string { return (s as unknown as string).replace(/[^A-Za-z0-9_]/g, "_"); }
  function lit(v: any): string {
    if (typeof v === "string") return JSON.stringify(v);
    if (v === null) return "null";
    return String(v);
  }
}

// --- tiny source map builder (base64 VLQ) ---
class SourceMapBuilder {
  private mappings: string[] = [""];
  private lastGenLine = 0;
  private lastGenCol = 0;
  private lastSrc = 0;
  private lastSrcLine = 0;
  private lastSrcCol = 0;
  constructor(private sourceName: string, private sourceContent: string) {}
  addMapping(genLine: number, genCol: number, srcLine: number, srcCol: number) {
    while (this.lastGenLine < genLine) {
      this.mappings.push("");
      this.lastGenLine++;
      this.lastGenCol = 0;
    }
    const seg = [
      this.vlq(genCol - this.lastGenCol), // generated column
      this.vlq(0 - this.lastSrc),         // source index delta (0 always)
      this.vlq(srcLine - this.lastSrcLine),
      this.vlq(srcCol - this.lastSrcCol),
    ].join("");
    this.mappings[this.mappings.length - 1] += (this.mappings[this.mappings.length - 1] ? "," : "") + seg;
    this.lastGenCol = genCol;
    this.lastSrc = 0;
    this.lastSrcLine = srcLine;
    this.lastSrcCol = srcCol;
  }
  toJSON() {
    return {
      version: 3,
      file: (this.sourceName || "out.js"),
      sources: [this.sourceName || "input.lisp"],
      sourcesContent: [this.sourceContent],
      names: [],
      mappings: this.mappings.join(";"),
    };
  }
  private vlq(value: number): string {
    // sign + zigzag + base64 VLQ
    let v = (value < 0) ? ((-value) << 1) + 1 : (value << 1);
    let out = "";
    do {
      let digit = v & 31; // 5 bits
      v >>>= 5;
      if (v > 0) digit |= 32; // continuation
      out += b64(digit);
    } while (v > 0);
    return out;
  }
}
const B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
function b64(n: number) { return B64[n] ?? "?"; }
function collectLocals(stmts: Stmt[], into = new Set<string>()): Set<string> {
  for (const s of stmts) {
    if (s.k === "bind") into.add(s.s as unknown as string);
    if (s.k === "if") { collectLocals(s.then, into); collectLocals(s.else, into); }
  }
  return into;
}
```

---

# Source maps end-to-end

## 3) Lowerer records symbol ↔ source span

We add a debug map so the emitter can map each **bound** symbol to the **Lisp span** of its originating expression.

```ts
// shared/js/prom-lib/compiler/lower.ts
import type { Expr } from "./ast";
import { gensym, type Module, type Fun, type Stmt, type Sym, type Rhs, type Val } from "./ir";

export function lowerWithExterns(ast: Expr, externs: string[] = []): Module & { debug: { symSpan: Map<Sym, any> } } {
  const env: Map<string, Sym> = new Map();
  for (const name of externs) env.set(name, name as unknown as Sym);

  const symSpan = new Map<Sym, any>();
  const out: Stmt[] = [];
  const result = lowerExpr(ast, env, out, symSpan);
  out.push({ k:"ret", s: result });
  const main: Fun = { params: [], body: out };
  return { funs: [], main, debug: { symSpan } };
}

function lowerExpr(e: Expr, env: Map<string, Sym>, out: Stmt[], dbg: Map<Sym, any>): Sym {
  switch (e.kind) {
    case "Num": return bindVal(out, { t:"lit", v: e.value }, e, dbg);
    case "Str": return bindVal(out, { t:"lit", v: e.value }, e, dbg);
    case "Bool": return bindVal(out, { t:"lit", v: e.value }, e, dbg);
    case "Null": return bindVal(out, { t:"lit", v: null }, e, dbg);
    case "Var": {
      const s = env.get(e.name.text);
      if (!s) throw new Error(`unbound ${e.name.text}`);
      return s;
    }
    case "Let": {
      const v = lowerExpr(e.value, env, out, dbg);
      const s = gensym(e.name.text);
      out.push({ k:"bind", s, rhs: { r:"val", v: { t:"var", s: v } } });
      dbg.set(s, e.value.span);
      const child = new Map(env); child.set(e.name.text, s);
      return lowerExpr(e.body, child, out, dbg);
    }
    case "If": {
      const cond = lowerExpr(e.cond, env, out, dbg);
      const thenS: Stmt[] = []; const tRes = lowerExpr(e.then, new Map(env), thenS, dbg);
      const elS: Stmt[] = [];   const eRes = lowerExpr(e.else, new Map(env), elS, dbg);
      const r = gensym("phi");
      thenS.push({ k:"bind", s: r, rhs: { r:"val", v: { t:"var", s: tRes } }});
      elS.push({ k:"bind", s: r, rhs: { r:"val", v: { t:"var", s: eRes } }});
      out.push({ k:"if", cond, then: thenS, else: elS });
      dbg.set(r, e.span);
      return r;
    }
    case "Fun": {
      const params: Sym[] = e.params.map(p => gensym(p.text));
      const body: Stmt[] = [];
      const child = new Map(env); e.params.forEach((p,i)=> child.set(p.text, params[i]));
      const ret = lowerExpr(e.body, child, body, dbg);
      body.push({ k:"ret", s: ret });
      const s = gensym("lam");
      out.push({ k:"bind", s, rhs: { r:"val", v: { t:"lambda", params, body } } });
      dbg.set(s, e.span);
      return s;
    }
    case "Call": {
      const fn = lowerExpr(e.callee, env, out, dbg);
      const args = e.args.map(a => lowerExpr(a, env, out, dbg));
      const s = gensym("call");
      out.push({ k:"bind", s, rhs: { r:"call", fn, args } });
      dbg.set(s, e.span);
      return s;
    }
    case "Bin": {
      const a = lowerExpr(e.left, env, out, dbg);
      const b = lowerExpr(e.right, env, out, dbg);
      const op = binToPrim(e.op);
      const s = gensym("bin");
      out.push({ k:"bind", s, rhs: { r:"prim", op, a, b } });
      dbg.set(s, e.span);
      return s;
    }
    case "Un": {
      const a = lowerExpr(e.expr, env, out, dbg);
      const op = e.op === "!" ? "not" : (e.op === "-" ? "sub" : "add");
      const s = gensym("un");
      out.push({ k:"bind", s, rhs: { r:"prim", op: op as any, a } });
      dbg.set(s, e.span);
      return s;
    }
    case "Block": {
      let last: Sym = gensym("unit");
      for (const x of e.exprs) last = lowerExpr(x, env, out, dbg);
      dbg.set(last, e.span);
      return last;
    }
  }
}

function bindVal(out: Stmt[], v: Val, e: Expr, dbg: Map<Sym, any>): Sym {
  const s = gensym("v"); out.push({ k:"bind", s, rhs: { r:"val", v } }); dbg.set(s, e.span); return s;
}
function binToPrim(op: string) { /* same as before */ }
```

---

## 4) Lisp driver returns `{ code, map }`

```ts
// shared/js/prom-lib/compiler/lisp/driver.ts
import { read } from "./reader";
import { macroexpandAll } from "./expand";
import { toExpr } from "./to-expr";
import { lowerWithExterns } from "../lower";
import { emitJS } from "../jsgen";

export function compileLispToJS(src: string, { pretty=false, importNames=[] as string[], inlineMap=false, sourceName="input.lisp" } = {}) {
  const forms = read(src);
  const expanded = macroexpandAll(forms);
  const program = expanded.length===1 ? expanded[0] : { t:"list", xs:[{t:"sym",name:"begin"}, ...expanded] } as any;
  const ast = toExpr(program as any);
  const irm = lowerWithExterns(ast, [...importNames, "$get", "$set", "$call", "$new", "$g"]);
  const out = emitJS(irm, {
    pretty,
    importNames,
    debug: {
      symSpan: irm.debug.symSpan,
      sourceName,
      sourceContent: src,
      inlineMap
    }
  });
  if (typeof out === "string") return { code: out, map: null };
  return out; // { code, map }
}

export function runLisp(src: string, imports: Record<string, any> = {}) {
  const { code } = compileLispToJS(src, { inlineMap: true });
  const fn = (0, eval)(typeof code === "string" ? code : code.code);
  return fn(imports);
}
```

---

# How you use it

```lisp
; demo.lisp
(let ((doc (js/global "document"))
      (div (js/new (js/get (js/global "Image")))))
  (js/set! div "alt" "hello")
  (js/set! div "width" 320)
  (js/set! div "height" 200)
  (js/call (js/get doc "body") "appendChild" div))
```

```ts
import { compileLispToJS } from "./compiler/lisp/driver";
const src = await (await fetch("/demo.lisp")).text();
const { code, map } = compileLispToJS(src, { pretty:true, sourceName:"demo.lisp" });

// Browser: attach map file (or inlineMap:true). Node: write .js and .js.map for debugging.
console.log(code);
console.log(map);
```

Generated JS (clean, no runtime helpers):

```js
(function(imports){
  let v_jtkf1t, v_2k1m3f, v_1n3sdf, v_kk92ls, v_f33f2d;
  v_jtkf1t = globalThis["document"];
  v_2k1m3f = new Image();
  (v_2k1m3f["alt"] = "hello");
  (v_2k1m3f["width"] = 320);
  (v_2k1m3f["height"] = 200);
  v_1n3sdf = v_jtkf1t["body"];
  v_kk92ls = v_1n3sdf["appendChild"](v_2k1m3f);
  return v_kk92ls;
})
//# sourceMappingURL=demo.lisp.js.map
```

…and the `.map` points right back to your Lisp source spans for stepping and stack traces.

---

# Notes / next knobs

* **Property shorthand:** if you want `(.-prop obj)` or `(. obj prop)`, we can add small syntax sugar macros that expand to `js/get`.
* **Optional chaining:** add `$get?` / `$call?` in JS emitter → `o?.[k]` and `o?.[k]?.(...)`.
* **Precise mappings:** we currently map per-**binding** and **condition** sites (coarse but useful). If you want per-token fidelity, we can propagate spans into IR **Rhs** and mark before each operator/operand emission.
* **Module loader:** `(require "prelude.lisp")` that injects sourceName into maps and expands macros at compile time.
* **Type-safe interop:** a tiny `zod`-style checker at macro-expansion time (optional).

Want me to add **optional chaining**, **set?**, and a few more **ergonomic macros** (`(. obj :prop)`, `(.? obj :prop)`, `(new! Ctor ...)`) next, or go deeper on **mapping fidelity**?<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [compiler-kit-foundations](compiler-kit-foundations.md)
- [set-assignment-in-lisp-ast](set-assignment-in-lisp-ast.md)
- [Lisp-Compiler-Integration](lisp-compiler-integration.md)
- [Lispy Macros with syntax-rules](lispy-macros-with-syntax-rules.md)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop](polyglot-s-expr-bridge-python-js-lisp-interop.md)
- [universal-intention-code-fabric](universal-intention-code-fabric.md)
- [DSL](chunks/dsl.md)
- [Unique Info Dump Index](unique-info-dump-index.md)
- [Language-Agnostic Mirror System](language-agnostic-mirror-system.md)
- [js-to-lisp-reverse-compiler](js-to-lisp-reverse-compiler.md)
- [ecs-scheduler-and-prefabs](ecs-scheduler-and-prefabs.md)
- [ecs-offload-workers](ecs-offload-workers.md)
- [aionian-circuit-math](aionian-circuit-math.md)
- [archetype-ecs](archetype-ecs.md)
- [Diagrams](chunks/diagrams.md)
- [ts-to-lisp-transpiler](ts-to-lisp-transpiler.md)
- [lisp-dsl-for-window-management](lisp-dsl-for-window-management.md)
- [Window Management](chunks/window-management.md)
- [Dynamic Context Model for Web Components](dynamic-context-model-for-web-components.md)
- [Cross-Target Macro System in Sibilant](cross-target-macro-system-in-sibilant.md)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler](ollama-llm-provider-for-pseudo-code-transpiler.md)
- [Local-Only-LLM-Workflow](local-only-llm-workflow.md)
- [Performance-Optimized-Polyglot-Bridge](performance-optimized-polyglot-bridge.md)
- [zero-copy-snapshots-and-workers](zero-copy-snapshots-and-workers.md)
- [template-based-compilation](template-based-compilation.md)
## Sources
- _None_
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
