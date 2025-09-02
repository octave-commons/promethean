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
related_to_title: []
related_to_uuid: []
references: []
---
Note: Consolidated here → ../notes/dsl/interop-and-source-maps.md ^ref-cdfac40c-1-0

Absolutely—let’s add **Interop** (ergonomic JS access) and real **Source Maps** that thread your Lisp spans all the way to generated JS. No deps, Node + browser safe. ^ref-cdfac40c-3-0

I’ll give you: ^ref-cdfac40c-5-0

* Lisp → JS **interop macros** (`js/get`, `js/set!`, `js/call`, `js/new`, `js/global`) ^ref-cdfac40c-7-0
* An **IR pattern** and **JS emitter** special-cases that inline to clean JS (`o[k]`, `o[k]=v`, `o[[...|k]]`, `new Ctor(...)`, `globalThis[name]`) ^ref-cdfac40c-8-0
* A tiny **source-map v3 builder** (base64 VLQ) and plumbing: ^ref-cdfac40c-9-0

  * carry spans from Lisp → Expr → IR symbols ^ref-cdfac40c-11-0
  * record mappings while emitting JS ^ref-cdfac40c-12-0
  * return `{ code, map }` (optionally inline as a data URL) ^ref-cdfac40c-13-0

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
^ref-cdfac40c-21-0
 ^ref-cdfac40c-66-0
Wire them into the expander right after core macros:
 ^ref-cdfac40c-68-0
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
^ref-cdfac40c-68-0
```

## 2) JS emitter inlines the interop ^ref-cdfac40c-83-0

No runtime helpers; we pattern-match calls to `"$get"`, `"$set"`, … and emit plain JS. ^ref-cdfac40c-85-0

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
^ref-cdfac40c-85-0
}
```

---

# Source maps end-to-end
 ^ref-cdfac40c-317-0
## 3) Lowerer records symbol ↔ source span
 ^ref-cdfac40c-319-0
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
^ref-cdfac40c-319-0
}
function binToPrim(op: string) { /* same as before */ }
```
^ref-cdfac40c-322-0
 ^ref-cdfac40c-421-0
--- ^ref-cdfac40c-421-0

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
^ref-cdfac40c-421-0
  const fn = (0, eval)(typeof code === "string" ? code : code.code);
  return fn(imports);
}
```
 ^ref-cdfac40c-460-0
---

# How you use it

```lisp
; demo.lisp
(let ((doc (js/global "document"))
      (div (js/new (js/get (js/global "Image")))))
^ref-cdfac40c-460-0
  (js/set! div "alt" "hello")
  (js/set! div "width" 320)
  (js/set! div "height" 200)
  (js/call (js/get doc "body") "appendChild" div))
```
^ref-cdfac40c-470-0

```ts
import { compileLispToJS } from "./compiler/lisp/driver";
const src = await (await fetch("/demo.lisp")).text();
^ref-cdfac40c-470-0
const { code, map } = compileLispToJS(src, { pretty:true, sourceName:"demo.lisp" }); ^ref-cdfac40c-480-0

// Browser: attach map file (or inlineMap:true). Node: write .js and .js.map for debugging.
console.log(code);
console.log(map);
^ref-cdfac40c-482-0
^ref-cdfac40c-480-0
^ref-cdfac40c-482-0
^ref-cdfac40c-480-0
```
^ref-cdfac40c-482-0
^ref-cdfac40c-480-0

Generated JS (clean, no runtime helpers):

```js
(function(imports){
  let v_jtkf1t, v_2k1m3f, v_1n3sdf, v_kk92ls, v_f33f2d;
  v_jtkf1t = globalThis["document"];
  v_2k1m3f = new Image();
  (v_2k1m3f["alt"] = "hello");
  (v_2k1m3f["width"] = 320);
^ref-cdfac40c-482-0
  (v_2k1m3f["height"] = 200); ^ref-cdfac40c-497-0
  v_1n3sdf = v_jtkf1t["body"];
  v_kk92ls = v_1n3sdf["appendChild"](v_2k1m3f);
  return v_kk92ls;
^ref-cdfac40c-503-0 ^ref-cdfac40c-504-0
^ref-cdfac40c-497-0 ^ref-cdfac40c-505-0
}) ^ref-cdfac40c-506-0
^ref-cdfac40c-507-0 ^ref-cdfac40c-509-0
^ref-cdfac40c-506-0
^ref-cdfac40c-505-0
^ref-cdfac40c-504-0 ^ref-cdfac40c-512-0
^ref-cdfac40c-503-0
^ref-cdfac40c-516-0 ^ref-cdfac40c-517-0
^ref-cdfac40c-515-0 ^ref-cdfac40c-518-0
^ref-cdfac40c-514-0 ^ref-cdfac40c-519-0
^ref-cdfac40c-512-0
^ref-cdfac40c-509-0
^ref-cdfac40c-507-0
^ref-cdfac40c-506-0
^ref-cdfac40c-505-0
^ref-cdfac40c-504-0
^ref-cdfac40c-503-0 ^ref-cdfac40c-526-0
^ref-cdfac40c-497-0 ^ref-cdfac40c-527-0
^ref-cdfac40c-494-0 ^ref-cdfac40c-528-0
^ref-cdfac40c-497-0 ^ref-cdfac40c-514-0
//# sourceMappingURL=demo.lisp.js.map ^ref-cdfac40c-507-0 ^ref-cdfac40c-515-0
``` ^ref-cdfac40c-503-0 ^ref-cdfac40c-516-0 ^ref-cdfac40c-531-0
 ^ref-cdfac40c-504-0 ^ref-cdfac40c-509-0 ^ref-cdfac40c-517-0 ^ref-cdfac40c-532-0
…and the `.map` points right back to your Lisp source spans for stepping and stack traces. ^ref-cdfac40c-505-0 ^ref-cdfac40c-518-0 ^ref-cdfac40c-533-0
 ^ref-cdfac40c-506-0 ^ref-cdfac40c-519-0 ^ref-cdfac40c-534-0
--- ^ref-cdfac40c-507-0 ^ref-cdfac40c-512-0 ^ref-cdfac40c-535-0

# Notes / next knobs ^ref-cdfac40c-509-0 ^ref-cdfac40c-514-0 ^ref-cdfac40c-537-0
 ^ref-cdfac40c-515-0
* **Property shorthand:** if you want `(.-prop obj)` or `(. obj prop)`, we can add small syntax sugar macros that expand to `js/get`. ^ref-cdfac40c-516-0 ^ref-cdfac40c-539-0
* **Optional chaining:** add `$get?` / `$call?` in JS emitter → `o?.[k]` and `o?.[k]?.(...)`. ^ref-cdfac40c-512-0 ^ref-cdfac40c-517-0
* **Precise mappings:** we currently map per-**binding** and **condition** sites (coarse but useful). If you want per-token fidelity, we can propagate spans into IR **Rhs** and mark before each operator/operand emission. ^ref-cdfac40c-518-0 ^ref-cdfac40c-526-0
* **Module loader:** `(require "prelude.lisp")` that injects sourceName into maps and expands macros at compile time. ^ref-cdfac40c-514-0 ^ref-cdfac40c-519-0 ^ref-cdfac40c-527-0 ^ref-cdfac40c-542-0
* **Type-safe interop:** a tiny `zod`-style checker at macro-expansion time (optional). ^ref-cdfac40c-515-0 ^ref-cdfac40c-528-0 ^ref-cdfac40c-543-0
 ^ref-cdfac40c-516-0
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
- [Admin Dashboard for User Management](admin-dashboard-for-user-management.md)
- [AI-Centric OS with MCP Layer](ai-centric-os-with-mcp-layer.md)
- [Agent Tasks: Persistence Migration to DualStore](agent-tasks-persistence-migration-to-dualstore.md)
- [JavaScript](chunks/javascript.md)
- [Cross-Language Runtime Polymorphism](cross-language-runtime-polymorphism.md)
- [Agent Reflections and Prompt Evolution](agent-reflections-and-prompt-evolution.md)
- [api-gateway-versioning](api-gateway-versioning.md)
- [komorebi-group-window-hack](komorebi-group-window-hack.md)
- [Chroma Toolkit Consolidation Plan](chroma-toolkit-consolidation-plan.md)
- [Board Walk – 2025-08-11](board-walk-2025-08-11.md)
- [Math Fundamentals](chunks/math-fundamentals.md)
- [2d-sandbox-field](2d-sandbox-field.md)
- [sibilant-macro-targets](sibilant-macro-targets.md)
- [eidolon-field-math-foundations](eidolon-field-math-foundations.md)
- [i3-config-validation-methods](i3-config-validation-methods.md)
- [sibilant-metacompiler-overview](sibilant-metacompiler-overview.md)
- [Sibilant Meta-Prompt DSL](sibilant-meta-prompt-dsl.md)
- [System Scheduler with Resource-Aware DAG](system-scheduler-with-resource-aware-dag.md)
- [typed-struct-compiler](typed-struct-compiler.md)
- [State Snapshots API and Transactional Projector](state-snapshots-api-and-transactional-projector.md)
- [sibilant-meta-string-templating-runtime](sibilant-meta-string-templating-runtime.md)
- [Event Bus MVP](event-bus-mvp.md)
- [Services](chunks/services.md)
- [Debugging Broker Connections and Agent Behavior](debugging-broker-connections-and-agent-behavior.md)
- [ParticleSimulationWithCanvasAndFFmpeg](particlesimulationwithcanvasandffmpeg.md)
- [EidolonField](eidolonfield.md)
- [field-dynamics-math-blocks](field-dynamics-math-blocks.md)
- [field-node-diagram-outline](field-node-diagram-outline.md)
- [Eidolon Field Abstract Model](eidolon-field-abstract-model.md)
- [Exception Layer Analysis](exception-layer-analysis.md)
- [markdown-to-org-transpiler](markdown-to-org-transpiler.md)
- [Mongo Outbox Implementation](mongo-outbox-implementation.md)
- [Factorio AI with External Agents](factorio-ai-with-external-agents.md)
- [field-interaction-equations](field-interaction-equations.md)
- [balanced-bst](balanced-bst.md)
- [Local-First Intention→Code Loop with Free Models](local-first-intention-code-loop-with-free-models.md)
- [mystery-lisp-search-session](mystery-lisp-search-session.md)
- [Duck's Self-Referential Perceptual Loop](ducks-self-referential-perceptual-loop.md)
- [Model Selection for Lightweight Conversational Tasks](model-selection-for-lightweight-conversational-tasks.md)
- [Migrate to Provider-Tenant Architecture](migrate-to-provider-tenant-architecture.md)
- [obsidian-ignore-node-modules-regex](obsidian-ignore-node-modules-regex.md)
- [Promethean Agent Config DSL](promethean-agent-config-dsl.md)
- [field-node-diagram-set](field-node-diagram-set.md)
- [Shared](chunks/shared.md)
- [Simulation Demo](chunks/simulation-demo.md)
- [Tooling](chunks/tooling.md)
- [Obsidian Templating Plugins Integration Guide](obsidian-templating-plugins-integration-guide.md)
- [eidolon-node-lifecycle](eidolon-node-lifecycle.md)
- [Event Bus Projections Architecture](event-bus-projections-architecture.md)
- [AI-First-OS-Model-Context-Protocol](ai-first-os-model-context-protocol.md)
- [Matplotlib Animation with Async Execution](matplotlib-animation-with-async-execution.md)
- [graph-ds](graph-ds.md)
- [Promethean Infrastructure Setup](promethean-infrastructure-setup.md)
- [Promethean Web UI Setup](promethean-web-ui-setup.md)
- [Duck's Attractor States](ducks-attractor-states.md)
- [Promethean-native config design](promethean-native-config-design.md)
- [field-node-diagram-visualizations](field-node-diagram-visualizations.md)
- [heartbeat-fragment-demo](heartbeat-fragment-demo.md)
- [heartbeat-simulation-snippets](heartbeat-simulation-snippets.md)
- [Canonical Org-Babel Matplotlib Animation Template](canonical-org-babel-matplotlib-animation-template.md)
- [Promethean_Eidolon_Synchronicity_Model](promethean-eidolon-synchronicity-model.md)
- [Promethean Event Bus MVP v0.1](promethean-event-bus-mvp-v0-1.md)
- [promethean-system-diagrams](promethean-system-diagrams.md)
- [Prompt_Folder_Bootstrap](prompt-folder-bootstrap.md)
- [prompt-programming-language-lisp](prompt-programming-language-lisp.md)
- [Board Automation Improvements](board-automation-improvements.md)
- [Creative Moments](creative-moments.md)
- [Local-Offline-Model-Deployment-Strategy](local-offline-model-deployment-strategy.md)
- [Obsidian ChatGPT Plugin Integration](obsidian-chatgpt-plugin-integration.md)
- [Protocol_0_The_Contradiction_Engine](protocol-0-the-contradiction-engine.md)
- [Operations](chunks/operations.md)
- [Per-Domain Policy System for JS Crawler](per-domain-policy-system-for-js-crawler.md)
- [polymorphic-meta-programming-engine](polymorphic-meta-programming-engine.md)
- [observability-infrastructure-setup](observability-infrastructure-setup.md)
- [Post-Linguistic Transhuman Design Frameworks](post-linguistic-transhuman-design-frameworks.md)
- [layer-1-uptime-diagrams](layer-1-uptime-diagrams.md)
- [Pure-Node Crawl Stack with Playwright and Crawlee](pure-node-crawl-stack-with-playwright-and-crawlee.md)
- [ripple-propagation-demo](ripple-propagation-demo.md)
- [Shared Package Structure](shared-package-structure.md)
- [Promethean Workflow Optimization](promethean-workflow-optimization.md)
- [Prometheus Observability Stack](prometheus-observability-stack.md)
- [Provider-Agnostic Chat Panel Implementation](provider-agnostic-chat-panel-implementation.md)
- [RAG UI Panel with Qdrant and PostgREST](rag-ui-panel-with-qdrant-and-postgrest.md)
- [homeostasis-decay-formulas](homeostasis-decay-formulas.md)
- [Pure TypeScript Search Microservice](pure-typescript-search-microservice.md)
- [schema-evolution-workflow](schema-evolution-workflow.md)
- [Self-Agency in AI Interaction](self-agency-in-ai-interaction.md)
- [shared-package-layout-clarification](shared-package-layout-clarification.md)
- [DuckDuckGoSearchPipeline](duckduckgosearchpipeline.md)
- [Ice Box Reorganization](ice-box-reorganization.md)
- [refactor-relations](refactor-relations.md)
- [Promethean Agent DSL TS Scaffold](promethean-agent-dsl-ts-scaffold.md)
- [Functional Refactor of TypeScript Document Processing](functional-refactor-of-typescript-document-processing.md)
- [Promethean State Format](promethean-state-format.md)
- [Refactor Frontmatter Processing](refactor-frontmatter-processing.md)
- [Promethean-Copilot-Intent-Engine](promethean-copilot-intent-engine.md)
- [plan-update-confirmation](plan-update-confirmation.md)
- [Voice Access Layer Design](voice-access-layer-design.md)
- [Promethean Pipelines](promethean-pipelines.md)
- [polyglot-repl-interface-layer](polyglot-repl-interface-layer.md)
- [Fnord Tracer Protocol](fnord-tracer-protocol.md)
- [Chroma-Embedding-Refactor](chroma-embedding-refactor.md)
- [Stateful Partitions and Rebalancing](stateful-partitions-and-rebalancing.md)
- [i3-layout-saver](i3-layout-saver.md)
- [Promethean Documentation Pipeline Overview](promethean-documentation-pipeline-overview.md)
- [prom-lib-rate-limiters-and-replay-api](prom-lib-rate-limiters-and-replay-api.md)
## Sources
- [DSL — L3](chunks/dsl.md#^ref-e87bc036-3-0) (line 3, col 0, score 0.5)
- [Unique Info Dump Index — L34](unique-info-dump-index.md#^ref-30ec3ba6-34-0) (line 34, col 0, score 0.5)
- [DSL — L9](chunks/dsl.md#^ref-e87bc036-9-0) (line 9, col 0, score 0.48)
- [JavaScript — L39](chunks/javascript.md#^ref-c1618c66-39-0) (line 39, col 0, score 0.48)
- [Window Management — L19](chunks/window-management.md#^ref-9e8ae388-19-0) (line 19, col 0, score 0.61)
- [compiler-kit-foundations — L604](compiler-kit-foundations.md#^ref-01b21543-604-0) (line 604, col 0, score 0.48)
- [Cross-Target Macro System in Sibilant — L199](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-199-0) (line 199, col 0, score 0.48)
- [Dynamic Context Model for Web Components — L412](dynamic-context-model-for-web-components.md#^ref-f7702bf8-412-0) (line 412, col 0, score 0.48)
- [ecs-offload-workers — L467](ecs-offload-workers.md#^ref-6498b9d7-467-0) (line 467, col 0, score 0.8)
- [Lispy Macros with syntax-rules — L393](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-393-0) (line 393, col 0, score 0.67)
- [Lispy Macros with syntax-rules — L1](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-1-0) (line 1, col 0, score 0.64)
- [Lisp-Compiler-Integration — L529](lisp-compiler-integration.md#^ref-cfee6d36-529-0) (line 529, col 0, score 0.74)
- [Lispy Macros with syntax-rules — L391](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-391-0) (line 391, col 0, score 0.77)
- [js-to-lisp-reverse-compiler — L406](js-to-lisp-reverse-compiler.md#^ref-58191024-406-0) (line 406, col 0, score 0.72)
- [universal-intention-code-fabric — L383](universal-intention-code-fabric.md#^ref-c14edce7-383-0) (line 383, col 0, score 0.64)
- [js-to-lisp-reverse-compiler — L1](js-to-lisp-reverse-compiler.md#^ref-58191024-1-0) (line 1, col 0, score 0.71)
- [Local-Only-LLM-Workflow — L167](local-only-llm-workflow.md#^ref-9a8ab57e-167-0) (line 167, col 0, score 0.69)
- [graph-ds — L5](graph-ds.md#^ref-6620e2f2-5-0) (line 5, col 0, score 0.66)
- [Admin Dashboard for User Management — L46](admin-dashboard-for-user-management.md#^ref-2901a3e9-46-0) (line 46, col 0, score 1)
- [universal-intention-code-fabric — L424](universal-intention-code-fabric.md#^ref-c14edce7-424-0) (line 424, col 0, score 0.83)
- [ParticleSimulationWithCanvasAndFFmpeg — L222](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-222-0) (line 222, col 0, score 0.77)
- [EidolonField — L228](eidolonfield.md#^ref-49d1e1e5-228-0) (line 228, col 0, score 0.74)
- [Ice Box Reorganization — L55](ice-box-reorganization.md#^ref-291c7d91-55-0) (line 55, col 0, score 0.74)
- [field-dynamics-math-blocks — L117](field-dynamics-math-blocks.md#^ref-7cfc230d-117-0) (line 117, col 0, score 0.72)
- [field-node-diagram-outline — L82](field-node-diagram-outline.md#^ref-1f32c94a-82-0) (line 82, col 0, score 0.72)
- [layer-1-uptime-diagrams — L140](layer-1-uptime-diagrams.md#^ref-4127189a-140-0) (line 140, col 0, score 0.72)
- [2d-sandbox-field — L180](2d-sandbox-field.md#^ref-c710dc93-180-0) (line 180, col 0, score 0.71)
- [Eidolon Field Abstract Model — L176](eidolon-field-abstract-model.md#^ref-5e8b2388-176-0) (line 176, col 0, score 0.71)
- [Exception Layer Analysis — L134](exception-layer-analysis.md#^ref-21d5cc09-134-0) (line 134, col 0, score 0.71)
- [Performance-Optimized-Polyglot-Bridge — L429](performance-optimized-polyglot-bridge.md#^ref-f5579967-429-0) (line 429, col 0, score 0.7)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L497](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-497-0) (line 497, col 0, score 0.7)
- [sibilant-macro-targets — L33](sibilant-macro-targets.md#^ref-c5c9a5c6-33-0) (line 33, col 0, score 0.7)
- [ecs-offload-workers — L446](ecs-offload-workers.md#^ref-6498b9d7-446-0) (line 446, col 0, score 0.69)
- [ecs-scheduler-and-prefabs — L379](ecs-scheduler-and-prefabs.md#^ref-c62a1815-379-0) (line 379, col 0, score 0.69)
- [markdown-to-org-transpiler — L289](markdown-to-org-transpiler.md#^ref-ab54cdd8-289-0) (line 289, col 0, score 0.69)
- [Lisp-Compiler-Integration — L470](lisp-compiler-integration.md#^ref-cfee6d36-470-0) (line 470, col 0, score 0.68)
- [DSL — L22](chunks/dsl.md#^ref-e87bc036-22-0) (line 22, col 0, score 1)
- [compiler-kit-foundations — L609](compiler-kit-foundations.md#^ref-01b21543-609-0) (line 609, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L229](cross-language-runtime-polymorphism.md#^ref-c34c36a6-229-0) (line 229, col 0, score 1)
- [ecs-offload-workers — L460](ecs-offload-workers.md#^ref-6498b9d7-460-0) (line 460, col 0, score 1)
- [ecs-scheduler-and-prefabs — L396](ecs-scheduler-and-prefabs.md#^ref-c62a1815-396-0) (line 396, col 0, score 1)
- [eidolon-field-math-foundations — L157](eidolon-field-math-foundations.md#^ref-008f2ac0-157-0) (line 157, col 0, score 1)
- [Language-Agnostic Mirror System — L235](language-agnostic-mirror-system.md#^ref-d2b3628c-235-0) (line 235, col 0, score 0.66)
- [Language-Agnostic Mirror System — L234](language-agnostic-mirror-system.md#^ref-d2b3628c-234-0) (line 234, col 0, score 0.63)
- [Language-Agnostic Mirror System — L522](language-agnostic-mirror-system.md#^ref-d2b3628c-522-0) (line 522, col 0, score 0.7)
- [Language-Agnostic Mirror System — L521](language-agnostic-mirror-system.md#^ref-d2b3628c-521-0) (line 521, col 0, score 0.69)
- [Cross-Target Macro System in Sibilant — L115](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-115-0) (line 115, col 0, score 0.65)
- [Language-Agnostic Mirror System — L519](language-agnostic-mirror-system.md#^ref-d2b3628c-519-0) (line 519, col 0, score 0.72)
- [set-assignment-in-lisp-ast — L54](set-assignment-in-lisp-ast.md#^ref-c5fba0a0-54-0) (line 54, col 0, score 0.67)
- [Lispy Macros with syntax-rules — L392](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-392-0) (line 392, col 0, score 0.66)
- [Language-Agnostic Mirror System — L273](language-agnostic-mirror-system.md#^ref-d2b3628c-273-0) (line 273, col 0, score 0.82)
- [AI-Centric OS with MCP Layer — L395](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-395-0) (line 395, col 0, score 0.66)
- [Lisp-Compiler-Integration — L7](lisp-compiler-integration.md#^ref-cfee6d36-7-0) (line 7, col 0, score 0.77)
- [Lisp-Compiler-Integration — L13](lisp-compiler-integration.md#^ref-cfee6d36-13-0) (line 13, col 0, score 0.7)
- [Language-Agnostic Mirror System — L332](language-agnostic-mirror-system.md#^ref-d2b3628c-332-0) (line 332, col 0, score 0.69)
- [Promethean Infrastructure Setup — L33](promethean-infrastructure-setup.md#^ref-6deed6ac-33-0) (line 33, col 0, score 0.65)
- [i3-layout-saver — L72](i3-layout-saver.md#^ref-31f0166e-72-0) (line 72, col 0, score 0.63)
- [Promethean Infrastructure Setup — L93](promethean-infrastructure-setup.md#^ref-6deed6ac-93-0) (line 93, col 0, score 0.62)
- [Promethean Documentation Pipeline Overview — L119](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-119-0) (line 119, col 0, score 0.62)
- [Dynamic Context Model for Web Components — L300](dynamic-context-model-for-web-components.md#^ref-f7702bf8-300-0) (line 300, col 0, score 0.62)
- [archetype-ecs — L466](archetype-ecs.md#^ref-8f4c1e86-466-0) (line 466, col 0, score 0.61)
- [i3-config-validation-methods — L57](i3-config-validation-methods.md#^ref-d28090ac-57-0) (line 57, col 0, score 1)
- [Functional Refactor of TypeScript Document Processing — L115](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-115-0) (line 115, col 0, score 0.7)
- [Promethean Agent DSL TS Scaffold — L723](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-723-0) (line 723, col 0, score 0.64)
- [Event Bus MVP — L7](event-bus-mvp.md#^ref-534fe91d-7-0) (line 7, col 0, score 0.62)
- [js-to-lisp-reverse-compiler — L392](js-to-lisp-reverse-compiler.md#^ref-58191024-392-0) (line 392, col 0, score 0.66)
- [sibilant-metacompiler-overview — L15](sibilant-metacompiler-overview.md#^ref-61d4086b-15-0) (line 15, col 0, score 0.69)
- [Cross-Target Macro System in Sibilant — L107](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-107-0) (line 107, col 0, score 0.69)
- [Cross-Target Macro System in Sibilant — L121](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-121-0) (line 121, col 0, score 0.66)
- [Cross-Target Macro System in Sibilant — L97](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-97-0) (line 97, col 0, score 0.66)
- [Fnord Tracer Protocol — L157](fnord-tracer-protocol.md#^ref-fc21f824-157-0) (line 157, col 0, score 0.65)
- [Fnord Tracer Protocol — L41](fnord-tracer-protocol.md#^ref-fc21f824-41-0) (line 41, col 0, score 0.64)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L9](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-9-0) (line 9, col 0, score 0.64)
- [sibilant-macro-targets — L97](sibilant-macro-targets.md#^ref-c5c9a5c6-97-0) (line 97, col 0, score 0.64)
- [ecs-offload-workers — L443](ecs-offload-workers.md#^ref-6498b9d7-443-0) (line 443, col 0, score 0.64)
- [Mongo Outbox Implementation — L538](mongo-outbox-implementation.md#^ref-9c1acd1e-538-0) (line 538, col 0, score 0.62)
- [Agent Tasks: Persistence Migration to DualStore — L70](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-70-0) (line 70, col 0, score 0.63)
- [Dynamic Context Model for Web Components — L80](dynamic-context-model-for-web-components.md#^ref-f7702bf8-80-0) (line 80, col 0, score 0.61)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L405](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-405-0) (line 405, col 0, score 0.92)
- [Lisp-Compiler-Integration — L188](lisp-compiler-integration.md#^ref-cfee6d36-188-0) (line 188, col 0, score 0.75)
- [Lisp-Compiler-Integration — L291](lisp-compiler-integration.md#^ref-cfee6d36-291-0) (line 291, col 0, score 0.74)
- [Lisp-Compiler-Integration — L440](lisp-compiler-integration.md#^ref-cfee6d36-440-0) (line 440, col 0, score 0.97)
- [Lispy Macros with syntax-rules — L243](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-243-0) (line 243, col 0, score 0.73)
- [Lispy Macros with syntax-rules — L217](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-217-0) (line 217, col 0, score 0.82)
- [Lispy Macros with syntax-rules — L319](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-319-0) (line 319, col 0, score 0.73)
- [js-to-lisp-reverse-compiler — L267](js-to-lisp-reverse-compiler.md#^ref-58191024-267-0) (line 267, col 0, score 0.79)
- [Lisp-Compiler-Integration — L151](lisp-compiler-integration.md#^ref-cfee6d36-151-0) (line 151, col 0, score 0.76)
- [Lisp-Compiler-Integration — L491](lisp-compiler-integration.md#^ref-cfee6d36-491-0) (line 491, col 0, score 0.7)
- [Lispy Macros with syntax-rules — L9](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-9-0) (line 9, col 0, score 0.66)
- [Lispy Macros with syntax-rules — L301](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-301-0) (line 301, col 0, score 0.93)
- [js-to-lisp-reverse-compiler — L13](js-to-lisp-reverse-compiler.md#^ref-58191024-13-0) (line 13, col 0, score 0.69)
- [Language-Agnostic Mirror System — L151](language-agnostic-mirror-system.md#^ref-d2b3628c-151-0) (line 151, col 0, score 0.77)
- [Lisp-Compiler-Integration — L341](lisp-compiler-integration.md#^ref-cfee6d36-341-0) (line 341, col 0, score 0.66)
- [compiler-kit-foundations — L359](compiler-kit-foundations.md#^ref-01b21543-359-0) (line 359, col 0, score 0.91)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L421](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-421-0) (line 421, col 0, score 0.71)
- [Sibilant Meta-Prompt DSL — L150](sibilant-meta-prompt-dsl.md#^ref-af5d2824-150-0) (line 150, col 0, score 0.67)
- [sibilant-metacompiler-overview — L49](sibilant-metacompiler-overview.md#^ref-61d4086b-49-0) (line 49, col 0, score 0.7)
- [Lispy Macros with syntax-rules — L389](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-389-0) (line 389, col 0, score 0.66)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L493](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-493-0) (line 493, col 0, score 0.65)
- [Lispy Macros with syntax-rules — L215](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-215-0) (line 215, col 0, score 0.68)
- [template-based-compilation — L41](template-based-compilation.md#^ref-f8877e5e-41-0) (line 41, col 0, score 0.69)
- [template-based-compilation — L33](template-based-compilation.md#^ref-f8877e5e-33-0) (line 33, col 0, score 0.63)
- [Cross-Target Macro System in Sibilant — L54](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-54-0) (line 54, col 0, score 0.62)
- [sibilant-metacompiler-overview — L57](sibilant-metacompiler-overview.md#^ref-61d4086b-57-0) (line 57, col 0, score 0.68)
- [Lisp-Compiler-Integration — L519](lisp-compiler-integration.md#^ref-cfee6d36-519-0) (line 519, col 0, score 0.68)
- [AI-Centric OS with MCP Layer — L1](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-1-0) (line 1, col 0, score 0.63)
- [Cross-Target Macro System in Sibilant — L3](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-3-0) (line 3, col 0, score 0.66)
- [polyglot-repl-interface-layer — L114](polyglot-repl-interface-layer.md#^ref-9c79206d-114-0) (line 114, col 0, score 0.65)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L1](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-1-0) (line 1, col 0, score 0.65)
- [polyglot-repl-interface-layer — L76](polyglot-repl-interface-layer.md#^ref-9c79206d-76-0) (line 76, col 0, score 0.65)
- [Per-Domain Policy System for JS Crawler — L109](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-109-0) (line 109, col 0, score 0.64)
- [Factorio AI with External Agents — L5](factorio-ai-with-external-agents.md#^ref-a4d90289-5-0) (line 5, col 0, score 0.64)
- [Cross-Language Runtime Polymorphism — L169](cross-language-runtime-polymorphism.md#^ref-c34c36a6-169-0) (line 169, col 0, score 0.63)
- [Performance-Optimized-Polyglot-Bridge — L10](performance-optimized-polyglot-bridge.md#^ref-f5579967-10-0) (line 10, col 0, score 0.63)
- [compiler-kit-foundations — L324](compiler-kit-foundations.md#^ref-01b21543-324-0) (line 324, col 0, score 0.79)
- [compiler-kit-foundations — L471](compiler-kit-foundations.md#^ref-01b21543-471-0) (line 471, col 0, score 0.74)
- [universal-intention-code-fabric — L186](universal-intention-code-fabric.md#^ref-c14edce7-186-0) (line 186, col 0, score 0.73)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L423](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-423-0) (line 423, col 0, score 0.73)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L372](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-372-0) (line 372, col 0, score 0.64)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L336](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-336-0) (line 336, col 0, score 0.72)
- [compiler-kit-foundations — L31](compiler-kit-foundations.md#^ref-01b21543-31-0) (line 31, col 0, score 0.72)
- [set-assignment-in-lisp-ast — L58](set-assignment-in-lisp-ast.md#^ref-c5fba0a0-58-0) (line 58, col 0, score 0.98)
- [Language-Agnostic Mirror System — L52](language-agnostic-mirror-system.md#^ref-d2b3628c-52-0) (line 52, col 0, score 0.71)
- [universal-intention-code-fabric — L68](universal-intention-code-fabric.md#^ref-c14edce7-68-0) (line 68, col 0, score 0.69)
- [Lisp-Compiler-Integration — L27](lisp-compiler-integration.md#^ref-cfee6d36-27-0) (line 27, col 0, score 0.59)
- [refactor-relations — L10](refactor-relations.md#^ref-41ce0216-10-0) (line 10, col 0, score 0.59)
- [ecs-scheduler-and-prefabs — L7](ecs-scheduler-and-prefabs.md#^ref-c62a1815-7-0) (line 7, col 0, score 0.59)
- [System Scheduler with Resource-Aware DAG — L5](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-5-0) (line 5, col 0, score 0.59)
- [Promethean Agent DSL TS Scaffold — L451](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-451-0) (line 451, col 0, score 0.69)
- [js-to-lisp-reverse-compiler — L340](js-to-lisp-reverse-compiler.md#^ref-58191024-340-0) (line 340, col 0, score 0.74)
- [typed-struct-compiler — L16](typed-struct-compiler.md#^ref-78eeedf7-16-0) (line 16, col 0, score 0.6)
- [Language-Agnostic Mirror System — L336](language-agnostic-mirror-system.md#^ref-d2b3628c-336-0) (line 336, col 0, score 0.6)
- [markdown-to-org-transpiler — L7](markdown-to-org-transpiler.md#^ref-ab54cdd8-7-0) (line 7, col 0, score 0.55)
- [compiler-kit-foundations — L50](compiler-kit-foundations.md#^ref-01b21543-50-0) (line 50, col 0, score 0.56)
- [compiler-kit-foundations — L166](compiler-kit-foundations.md#^ref-01b21543-166-0) (line 166, col 0, score 0.66)
- [field-interaction-equations — L45](field-interaction-equations.md#^ref-b09141b7-45-0) (line 45, col 0, score 0.51)
- [Per-Domain Policy System for JS Crawler — L141](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-141-0) (line 141, col 0, score 0.66)
- [balanced-bst — L3](balanced-bst.md#^ref-d3e7db72-3-0) (line 3, col 0, score 0.71)
- [Promethean Agent DSL TS Scaffold — L568](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-568-0) (line 568, col 0, score 0.7)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L7](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-7-0) (line 7, col 0, score 0.69)
- [Local-First Intention→Code Loop with Free Models — L116](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-116-0) (line 116, col 0, score 0.66)
- [universal-intention-code-fabric — L149](universal-intention-code-fabric.md#^ref-c14edce7-149-0) (line 149, col 0, score 0.67)
- [Local-First Intention→Code Loop with Free Models — L47](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-47-0) (line 47, col 0, score 0.67)
- [universal-intention-code-fabric — L277](universal-intention-code-fabric.md#^ref-c14edce7-277-0) (line 277, col 0, score 0.66)
- [plan-update-confirmation — L836](plan-update-confirmation.md#^ref-b22d79c6-836-0) (line 836, col 0, score 0.65)
- [Refactor Frontmatter Processing — L11](refactor-frontmatter-processing.md#^ref-cfbdca2f-11-0) (line 11, col 0, score 0.68)
- [Promethean Web UI Setup — L415](promethean-web-ui-setup.md#^ref-bc5172ca-415-0) (line 415, col 0, score 0.67)
- [Per-Domain Policy System for JS Crawler — L184](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-184-0) (line 184, col 0, score 0.67)
- [RAG UI Panel with Qdrant and PostgREST — L172](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-172-0) (line 172, col 0, score 0.67)
- [EidolonField — L81](eidolonfield.md#^ref-49d1e1e5-81-0) (line 81, col 0, score 0.6)
- [ParticleSimulationWithCanvasAndFFmpeg — L30](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-30-0) (line 30, col 0, score 0.59)
- [Lispy Macros with syntax-rules — L365](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-365-0) (line 365, col 0, score 0.89)
- [compiler-kit-foundations — L574](compiler-kit-foundations.md#^ref-01b21543-574-0) (line 574, col 0, score 0.74)
- [js-to-lisp-reverse-compiler — L397](js-to-lisp-reverse-compiler.md#^ref-58191024-397-0) (line 397, col 0, score 0.66)
- [State Snapshots API and Transactional Projector — L319](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-319-0) (line 319, col 0, score 0.68)
- [mystery-lisp-search-session — L97](mystery-lisp-search-session.md#^ref-513dc4c7-97-0) (line 97, col 0, score 0.66)
- [mystery-lisp-search-session — L99](mystery-lisp-search-session.md#^ref-513dc4c7-99-0) (line 99, col 0, score 0.66)
- [Lispy Macros with syntax-rules — L317](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-317-0) (line 317, col 0, score 0.66)
- [ts-to-lisp-transpiler — L5](ts-to-lisp-transpiler.md#^ref-ba11486b-5-0) (line 5, col 0, score 0.65)
- [Lisp-Compiler-Integration — L472](lisp-compiler-integration.md#^ref-cfee6d36-472-0) (line 472, col 0, score 0.67)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L359](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-359-0) (line 359, col 0, score 0.74)
- [set-assignment-in-lisp-ast — L5](set-assignment-in-lisp-ast.md#^ref-c5fba0a0-5-0) (line 5, col 0, score 0.79)
- [compiler-kit-foundations — L140](compiler-kit-foundations.md#^ref-01b21543-140-0) (line 140, col 0, score 0.77)
- [set-assignment-in-lisp-ast — L25](set-assignment-in-lisp-ast.md#^ref-c5fba0a0-25-0) (line 25, col 0, score 0.75)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L345](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-345-0) (line 345, col 0, score 0.74)
- [prom-lib-rate-limiters-and-replay-api — L73](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-73-0) (line 73, col 0, score 0.56)
- [lisp-dsl-for-window-management — L81](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-81-0) (line 81, col 0, score 0.56)
- [polymorphic-meta-programming-engine — L157](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-157-0) (line 157, col 0, score 0.56)
- [lisp-dsl-for-window-management — L158](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-158-0) (line 158, col 0, score 0.56)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L132](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-132-0) (line 132, col 0, score 0.55)
- [Performance-Optimized-Polyglot-Bridge — L170](performance-optimized-polyglot-bridge.md#^ref-f5579967-170-0) (line 170, col 0, score 0.66)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L445](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-445-0) (line 445, col 0, score 0.68)
- [Lisp-Compiler-Integration — L1](lisp-compiler-integration.md#^ref-cfee6d36-1-0) (line 1, col 0, score 0.66)
- [AI-Centric OS with MCP Layer — L413](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-413-0) (line 413, col 0, score 0.65)
- [Cross-Language Runtime Polymorphism — L210](cross-language-runtime-polymorphism.md#^ref-c34c36a6-210-0) (line 210, col 0, score 0.65)
- [Cross-Target Macro System in Sibilant — L189](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-189-0) (line 189, col 0, score 0.65)
- [Duck's Attractor States — L84](ducks-attractor-states.md#^ref-13951643-84-0) (line 84, col 0, score 0.65)
- [Duck's Self-Referential Perceptual Loop — L40](ducks-self-referential-perceptual-loop.md#^ref-71726f04-40-0) (line 40, col 0, score 0.65)
- [set-assignment-in-lisp-ast — L139](set-assignment-in-lisp-ast.md#^ref-c5fba0a0-139-0) (line 139, col 0, score 0.75)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L431](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-431-0) (line 431, col 0, score 0.75)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L425](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-425-0) (line 425, col 0, score 0.74)
- [mystery-lisp-search-session — L78](mystery-lisp-search-session.md#^ref-513dc4c7-78-0) (line 78, col 0, score 0.7)
- [Local-First Intention→Code Loop with Free Models — L100](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-100-0) (line 100, col 0, score 0.7)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L108](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-108-0) (line 108, col 0, score 0.7)
- [js-to-lisp-reverse-compiler — L404](js-to-lisp-reverse-compiler.md#^ref-58191024-404-0) (line 404, col 0, score 0.65)
- [set-assignment-in-lisp-ast — L106](set-assignment-in-lisp-ast.md#^ref-c5fba0a0-106-0) (line 106, col 0, score 0.64)
- [universal-intention-code-fabric — L405](universal-intention-code-fabric.md#^ref-c14edce7-405-0) (line 405, col 0, score 0.64)
- [Factorio AI with External Agents — L26](factorio-ai-with-external-agents.md#^ref-a4d90289-26-0) (line 26, col 0, score 0.63)
- [js-to-lisp-reverse-compiler — L380](js-to-lisp-reverse-compiler.md#^ref-58191024-380-0) (line 380, col 0, score 0.62)
- [Promethean Infrastructure Setup — L388](promethean-infrastructure-setup.md#^ref-6deed6ac-388-0) (line 388, col 0, score 0.7)
- [Promethean Infrastructure Setup — L485](promethean-infrastructure-setup.md#^ref-6deed6ac-485-0) (line 485, col 0, score 0.67)
- [ts-to-lisp-transpiler — L1](ts-to-lisp-transpiler.md#^ref-ba11486b-1-0) (line 1, col 0, score 0.67)
- [js-to-lisp-reverse-compiler — L5](js-to-lisp-reverse-compiler.md#^ref-58191024-5-0) (line 5, col 0, score 0.66)
- [template-based-compilation — L27](template-based-compilation.md#^ref-f8877e5e-27-0) (line 27, col 0, score 0.66)
- [mystery-lisp-search-session — L29](mystery-lisp-search-session.md#^ref-513dc4c7-29-0) (line 29, col 0, score 0.66)
- [DSL — L6](chunks/dsl.md#^ref-e87bc036-6-0) (line 6, col 0, score 0.65)
- [set-assignment-in-lisp-ast — L144](set-assignment-in-lisp-ast.md#^ref-c5fba0a0-144-0) (line 144, col 0, score 0.68)
- [js-to-lisp-reverse-compiler — L383](js-to-lisp-reverse-compiler.md#^ref-58191024-383-0) (line 383, col 0, score 0.7)
- [plan-update-confirmation — L787](plan-update-confirmation.md#^ref-b22d79c6-787-0) (line 787, col 0, score 0.67)
- [Voice Access Layer Design — L115](voice-access-layer-design.md#^ref-543ed9b3-115-0) (line 115, col 0, score 0.66)
- [universal-intention-code-fabric — L418](universal-intention-code-fabric.md#^ref-c14edce7-418-0) (line 418, col 0, score 0.66)
- [Model Selection for Lightweight Conversational Tasks — L53](model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-53-0) (line 53, col 0, score 0.73)
- [Agent Tasks: Persistence Migration to DualStore — L8](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-8-0) (line 8, col 0, score 0.72)
- [Migrate to Provider-Tenant Architecture — L38](migrate-to-provider-tenant-architecture.md#^ref-54382370-38-0) (line 38, col 0, score 0.7)
- [Migrate to Provider-Tenant Architecture — L100](migrate-to-provider-tenant-architecture.md#^ref-54382370-100-0) (line 100, col 0, score 0.7)
- [Migrate to Provider-Tenant Architecture — L79](migrate-to-provider-tenant-architecture.md#^ref-54382370-79-0) (line 79, col 0, score 0.7)
- [Per-Domain Policy System for JS Crawler — L115](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-115-0) (line 115, col 0, score 0.69)
- [js-to-lisp-reverse-compiler — L384](js-to-lisp-reverse-compiler.md#^ref-58191024-384-0) (line 384, col 0, score 0.68)
- [Promethean-native config design — L32](promethean-native-config-design.md#^ref-ab748541-32-0) (line 32, col 0, score 0.67)
- [Promethean-native config design — L33](promethean-native-config-design.md#^ref-ab748541-33-0) (line 33, col 0, score 0.67)
- [Promethean Pipelines — L24](promethean-pipelines.md#^ref-8b8e6103-24-0) (line 24, col 0, score 0.62)
- [Per-Domain Policy System for JS Crawler — L27](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-27-0) (line 27, col 0, score 0.65)
- [universal-intention-code-fabric — L419](universal-intention-code-fabric.md#^ref-c14edce7-419-0) (line 419, col 0, score 0.64)
- [Promethean Pipelines — L22](promethean-pipelines.md#^ref-8b8e6103-22-0) (line 22, col 0, score 0.63)
- [Chroma-Embedding-Refactor — L6](chroma-embedding-refactor.md#^ref-8b256935-6-0) (line 6, col 0, score 0.63)
- [Lisp-Compiler-Integration — L520](lisp-compiler-integration.md#^ref-cfee6d36-520-0) (line 520, col 0, score 0.63)
- [Promethean Pipelines — L1](promethean-pipelines.md#^ref-8b8e6103-1-0) (line 1, col 0, score 0.63)
- [Stateful Partitions and Rebalancing — L514](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-514-0) (line 514, col 0, score 0.63)
- [template-based-compilation — L60](template-based-compilation.md#^ref-f8877e5e-60-0) (line 60, col 0, score 0.7)
- [Lisp-Compiler-Integration — L528](lisp-compiler-integration.md#^ref-cfee6d36-528-0) (line 528, col 0, score 0.69)
- [polymorphic-meta-programming-engine — L145](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-145-0) (line 145, col 0, score 0.69)
- [Promethean State Format — L27](promethean-state-format.md#^ref-23df6ddb-27-0) (line 27, col 0, score 0.66)
- [obsidian-ignore-node-modules-regex — L14](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-14-0) (line 14, col 0, score 0.67)
- [sibilant-macro-targets — L153](sibilant-macro-targets.md#^ref-c5c9a5c6-153-0) (line 153, col 0, score 0.67)
- [Language-Agnostic Mirror System — L507](language-agnostic-mirror-system.md#^ref-d2b3628c-507-0) (line 507, col 0, score 0.67)
- [Lispy Macros with syntax-rules — L390](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-390-0) (line 390, col 0, score 0.63)
- [Dynamic Context Model for Web Components — L174](dynamic-context-model-for-web-components.md#^ref-f7702bf8-174-0) (line 174, col 0, score 0.67)
- [compiler-kit-foundations — L598](compiler-kit-foundations.md#^ref-01b21543-598-0) (line 598, col 0, score 0.66)
- [Lispy Macros with syntax-rules — L388](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-388-0) (line 388, col 0, score 0.66)
- [Dynamic Context Model for Web Components — L171](dynamic-context-model-for-web-components.md#^ref-f7702bf8-171-0) (line 171, col 0, score 0.65)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L26](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-26-0) (line 26, col 0, score 0.65)
- [Lisp-Compiler-Integration — L533](lisp-compiler-integration.md#^ref-cfee6d36-533-0) (line 533, col 0, score 0.65)
- [polymorphic-meta-programming-engine — L192](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-192-0) (line 192, col 0, score 0.63)
- [eidolon-field-math-foundations — L3](eidolon-field-math-foundations.md#^ref-008f2ac0-3-0) (line 3, col 0, score 0.63)
- [graph-ds — L361](graph-ds.md#^ref-6620e2f2-361-0) (line 361, col 0, score 0.62)
- [sibilant-macro-targets — L172](sibilant-macro-targets.md#^ref-c5c9a5c6-172-0) (line 172, col 0, score 1)
- [Sibilant Meta-Prompt DSL — L205](sibilant-meta-prompt-dsl.md#^ref-af5d2824-205-0) (line 205, col 0, score 1)
- [sibilant-meta-string-templating-runtime — L137](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-137-0) (line 137, col 0, score 1)
- [sibilant-metacompiler-overview — L90](sibilant-metacompiler-overview.md#^ref-61d4086b-90-0) (line 90, col 0, score 1)
- [State Snapshots API and Transactional Projector — L366](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-366-0) (line 366, col 0, score 1)
- [System Scheduler with Resource-Aware DAG — L394](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-394-0) (line 394, col 0, score 1)
- [template-based-compilation — L104](template-based-compilation.md#^ref-f8877e5e-104-0) (line 104, col 0, score 1)
- [ts-to-lisp-transpiler — L8](ts-to-lisp-transpiler.md#^ref-ba11486b-8-0) (line 8, col 0, score 1)
- [typed-struct-compiler — L384](typed-struct-compiler.md#^ref-78eeedf7-384-0) (line 384, col 0, score 1)
- [compiler-kit-foundations — L605](compiler-kit-foundations.md#^ref-01b21543-605-0) (line 605, col 0, score 1)
- [js-to-lisp-reverse-compiler — L409](js-to-lisp-reverse-compiler.md#^ref-58191024-409-0) (line 409, col 0, score 1)
- [Language-Agnostic Mirror System — L533](language-agnostic-mirror-system.md#^ref-d2b3628c-533-0) (line 533, col 0, score 1)
- [Lisp-Compiler-Integration — L538](lisp-compiler-integration.md#^ref-cfee6d36-538-0) (line 538, col 0, score 1)
- [Lispy Macros with syntax-rules — L397](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-397-0) (line 397, col 0, score 1)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L512](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-512-0) (line 512, col 0, score 1)
- [Promethean Agent Config DSL — L338](promethean-agent-config-dsl.md#^ref-2c00ce45-338-0) (line 338, col 0, score 1)
- [template-based-compilation — L144](template-based-compilation.md#^ref-f8877e5e-144-0) (line 144, col 0, score 1)
- [AI-Centric OS with MCP Layer — L405](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-405-0) (line 405, col 0, score 1)
- [archetype-ecs — L469](archetype-ecs.md#^ref-8f4c1e86-469-0) (line 469, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L219](chroma-toolkit-consolidation-plan.md#^ref-5020e892-219-0) (line 219, col 0, score 1)
- [DSL — L19](chunks/dsl.md#^ref-e87bc036-19-0) (line 19, col 0, score 1)
- [Window Management — L26](chunks/window-management.md#^ref-9e8ae388-26-0) (line 26, col 0, score 1)
- [compiler-kit-foundations — L608](compiler-kit-foundations.md#^ref-01b21543-608-0) (line 608, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L261](cross-language-runtime-polymorphism.md#^ref-c34c36a6-261-0) (line 261, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L181](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-181-0) (line 181, col 0, score 1)
- [Dynamic Context Model for Web Components — L400](dynamic-context-model-for-web-components.md#^ref-f7702bf8-400-0) (line 400, col 0, score 1)
- [archetype-ecs — L467](archetype-ecs.md#^ref-8f4c1e86-467-0) (line 467, col 0, score 1)
- [DSL — L20](chunks/dsl.md#^ref-e87bc036-20-0) (line 20, col 0, score 1)
- [compiler-kit-foundations — L606](compiler-kit-foundations.md#^ref-01b21543-606-0) (line 606, col 0, score 1)
- [js-to-lisp-reverse-compiler — L437](js-to-lisp-reverse-compiler.md#^ref-58191024-437-0) (line 437, col 0, score 1)
- [Language-Agnostic Mirror System — L534](language-agnostic-mirror-system.md#^ref-d2b3628c-534-0) (line 534, col 0, score 1)
- [Lisp-Compiler-Integration — L536](lisp-compiler-integration.md#^ref-cfee6d36-536-0) (line 536, col 0, score 1)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L515](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-515-0) (line 515, col 0, score 1)
- [set-assignment-in-lisp-ast — L148](set-assignment-in-lisp-ast.md#^ref-c5fba0a0-148-0) (line 148, col 0, score 1)
- [Language-Agnostic Mirror System — L539](language-agnostic-mirror-system.md#^ref-d2b3628c-539-0) (line 539, col 0, score 1)
- [Language-Agnostic Mirror System — L536](language-agnostic-mirror-system.md#^ref-d2b3628c-536-0) (line 536, col 0, score 1)
- [Local-Only-LLM-Workflow — L169](local-only-llm-workflow.md#^ref-9a8ab57e-169-0) (line 169, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L169](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-169-0) (line 169, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L437](performance-optimized-polyglot-bridge.md#^ref-f5579967-437-0) (line 437, col 0, score 1)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L506](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-506-0) (line 506, col 0, score 1)
- [Promethean Infrastructure Setup — L608](promethean-infrastructure-setup.md#^ref-6deed6ac-608-0) (line 608, col 0, score 1)
- [Promethean-Copilot-Intent-Engine — L12](promethean-copilot-intent-engine.md#^ref-ae24a280-12-0) (line 12, col 0, score 0.67)
- [universal-intention-code-fabric — L22](universal-intention-code-fabric.md#^ref-c14edce7-22-0) (line 22, col 0, score 0.67)
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
- [field-node-diagram-visualizations — L89](field-node-diagram-visualizations.md#^ref-e9b27b06-89-0) (line 89, col 0, score 1)
- [graph-ds — L373](graph-ds.md#^ref-6620e2f2-373-0) (line 373, col 0, score 1)
- [heartbeat-fragment-demo — L99](heartbeat-fragment-demo.md#^ref-dd00677a-99-0) (line 99, col 0, score 1)
- [heartbeat-simulation-snippets — L86](heartbeat-simulation-snippets.md#^ref-23e221e9-86-0) (line 86, col 0, score 1)
- [homeostasis-decay-formulas — L154](homeostasis-decay-formulas.md#^ref-37b5d236-154-0) (line 154, col 0, score 1)
- [komorebi-group-window-hack — L205](komorebi-group-window-hack.md#^ref-dd89372d-205-0) (line 205, col 0, score 1)
- [layer-1-uptime-diagrams — L166](layer-1-uptime-diagrams.md#^ref-4127189a-166-0) (line 166, col 0, score 1)
- [Lisp-Compiler-Integration — L558](lisp-compiler-integration.md#^ref-cfee6d36-558-0) (line 558, col 0, score 1)
- [lisp-dsl-for-window-management — L219](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-219-0) (line 219, col 0, score 1)
- [archetype-ecs — L456](archetype-ecs.md#^ref-8f4c1e86-456-0) (line 456, col 0, score 1)
- [DSL — L18](chunks/dsl.md#^ref-e87bc036-18-0) (line 18, col 0, score 1)
- [JavaScript — L27](chunks/javascript.md#^ref-c1618c66-27-0) (line 27, col 0, score 1)
- [compiler-kit-foundations — L616](compiler-kit-foundations.md#^ref-01b21543-616-0) (line 616, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L198](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-198-0) (line 198, col 0, score 1)
- [Dynamic Context Model for Web Components — L408](dynamic-context-model-for-web-components.md#^ref-f7702bf8-408-0) (line 408, col 0, score 1)
- [ecs-offload-workers — L489](ecs-offload-workers.md#^ref-6498b9d7-489-0) (line 489, col 0, score 1)
- [ecs-scheduler-and-prefabs — L415](ecs-scheduler-and-prefabs.md#^ref-c62a1815-415-0) (line 415, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L153](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-153-0) (line 153, col 0, score 1)
- [archetype-ecs — L468](archetype-ecs.md#^ref-8f4c1e86-468-0) (line 468, col 0, score 1)
- [DSL — L17](chunks/dsl.md#^ref-e87bc036-17-0) (line 17, col 0, score 1)
- [compiler-kit-foundations — L619](compiler-kit-foundations.md#^ref-01b21543-619-0) (line 619, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L217](cross-language-runtime-polymorphism.md#^ref-c34c36a6-217-0) (line 217, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L177](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-177-0) (line 177, col 0, score 1)
- [Dynamic Context Model for Web Components — L387](dynamic-context-model-for-web-components.md#^ref-f7702bf8-387-0) (line 387, col 0, score 1)
- [ecs-offload-workers — L472](ecs-offload-workers.md#^ref-6498b9d7-472-0) (line 472, col 0, score 1)
- [eidolon-field-math-foundations — L145](eidolon-field-math-foundations.md#^ref-008f2ac0-145-0) (line 145, col 0, score 1)
- [Exception Layer Analysis — L172](exception-layer-analysis.md#^ref-21d5cc09-172-0) (line 172, col 0, score 1)
- [field-dynamics-math-blocks — L154](field-dynamics-math-blocks.md#^ref-7cfc230d-154-0) (line 154, col 0, score 1)
- [field-interaction-equations — L164](field-interaction-equations.md#^ref-b09141b7-164-0) (line 164, col 0, score 1)
- [field-node-diagram-outline — L120](field-node-diagram-outline.md#^ref-1f32c94a-120-0) (line 120, col 0, score 1)
- [field-node-diagram-set — L149](field-node-diagram-set.md#^ref-22b989d5-149-0) (line 149, col 0, score 1)
- [field-node-diagram-visualizations — L99](field-node-diagram-visualizations.md#^ref-e9b27b06-99-0) (line 99, col 0, score 1)
- [graph-ds — L365](graph-ds.md#^ref-6620e2f2-365-0) (line 365, col 0, score 1)
- [heartbeat-fragment-demo — L111](heartbeat-fragment-demo.md#^ref-dd00677a-111-0) (line 111, col 0, score 1)
- [heartbeat-simulation-snippets — L101](heartbeat-simulation-snippets.md#^ref-23e221e9-101-0) (line 101, col 0, score 1)
- [Math Fundamentals — L20](chunks/math-fundamentals.md#^ref-c6e87433-20-0) (line 20, col 0, score 1)
- [Services — L20](chunks/services.md#^ref-75ea4a6a-20-0) (line 20, col 0, score 1)
- [compiler-kit-foundations — L620](compiler-kit-foundations.md#^ref-01b21543-620-0) (line 620, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L237](cross-language-runtime-polymorphism.md#^ref-c34c36a6-237-0) (line 237, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L40](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-40-0) (line 40, col 0, score 1)
- [Dynamic Context Model for Web Components — L401](dynamic-context-model-for-web-components.md#^ref-f7702bf8-401-0) (line 401, col 0, score 1)
- [ecs-scheduler-and-prefabs — L386](ecs-scheduler-and-prefabs.md#^ref-c62a1815-386-0) (line 386, col 0, score 1)
- [eidolon-field-math-foundations — L127](eidolon-field-math-foundations.md#^ref-008f2ac0-127-0) (line 127, col 0, score 1)
- [Event Bus MVP — L557](event-bus-mvp.md#^ref-534fe91d-557-0) (line 557, col 0, score 1)
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
- [DSL — L12](chunks/dsl.md#^ref-e87bc036-12-0) (line 12, col 0, score 1)
- [Window Management — L20](chunks/window-management.md#^ref-9e8ae388-20-0) (line 20, col 0, score 1)
- [compiler-kit-foundations — L611](compiler-kit-foundations.md#^ref-01b21543-611-0) (line 611, col 0, score 1)
- [komorebi-group-window-hack — L203](komorebi-group-window-hack.md#^ref-dd89372d-203-0) (line 203, col 0, score 1)
- [Lisp-Compiler-Integration — L554](lisp-compiler-integration.md#^ref-cfee6d36-554-0) (line 554, col 0, score 1)
- [lisp-dsl-for-window-management — L216](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-216-0) (line 216, col 0, score 1)
- [mystery-lisp-search-session — L120](mystery-lisp-search-session.md#^ref-513dc4c7-120-0) (line 120, col 0, score 1)
- [Obsidian Templating Plugins Integration Guide — L104](obsidian-templating-plugins-integration-guide.md#^ref-b39dc9d4-104-0) (line 104, col 0, score 1)
- [2d-sandbox-field — L213](2d-sandbox-field.md#^ref-c710dc93-213-0) (line 213, col 0, score 0.67)
- [Agent Tasks: Persistence Migration to DualStore — L166](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-166-0) (line 166, col 0, score 0.67)
- [aionian-circuit-math — L166](aionian-circuit-math.md#^ref-f2d83a77-166-0) (line 166, col 0, score 0.67)
- [archetype-ecs — L464](archetype-ecs.md#^ref-8f4c1e86-464-0) (line 464, col 0, score 0.67)
- [Chroma Toolkit Consolidation Plan — L210](chroma-toolkit-consolidation-plan.md#^ref-5020e892-210-0) (line 210, col 0, score 0.67)
- [JavaScript — L16](chunks/javascript.md#^ref-c1618c66-16-0) (line 16, col 0, score 0.67)
- [Math Fundamentals — L17](chunks/math-fundamentals.md#^ref-c6e87433-17-0) (line 17, col 0, score 0.67)
- [Services — L13](chunks/services.md#^ref-75ea4a6a-13-0) (line 13, col 0, score 0.67)
- [Shared — L9](chunks/shared.md#^ref-623a55f7-9-0) (line 9, col 0, score 0.67)
- [Simulation Demo — L13](chunks/simulation-demo.md#^ref-557309a3-13-0) (line 13, col 0, score 0.67)
- [Tooling — L12](chunks/tooling.md#^ref-6cb4943e-12-0) (line 12, col 0, score 0.67)
- [eidolon-node-lifecycle — L63](eidolon-node-lifecycle.md#^ref-938eca9c-63-0) (line 63, col 0, score 1)
- [EidolonField — L269](eidolonfield.md#^ref-49d1e1e5-269-0) (line 269, col 0, score 1)
- [Event Bus MVP — L566](event-bus-mvp.md#^ref-534fe91d-566-0) (line 566, col 0, score 1)
- [Event Bus Projections Architecture — L185](event-bus-projections-architecture.md#^ref-cf6b9b17-185-0) (line 185, col 0, score 1)
- [Exception Layer Analysis — L165](exception-layer-analysis.md#^ref-21d5cc09-165-0) (line 165, col 0, score 1)
- [Factorio AI with External Agents — L160](factorio-ai-with-external-agents.md#^ref-a4d90289-160-0) (line 160, col 0, score 1)
- [field-dynamics-math-blocks — L165](field-dynamics-math-blocks.md#^ref-7cfc230d-165-0) (line 165, col 0, score 1)
- [field-interaction-equations — L184](field-interaction-equations.md#^ref-b09141b7-184-0) (line 184, col 0, score 1)
- [field-node-diagram-outline — L132](field-node-diagram-outline.md#^ref-1f32c94a-132-0) (line 132, col 0, score 1)
- [field-node-diagram-set — L166](field-node-diagram-set.md#^ref-22b989d5-166-0) (line 166, col 0, score 1)
- [zero-copy-snapshots-and-workers — L363](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-363-0) (line 363, col 0, score 1)
- [Simulation Demo — L32](chunks/simulation-demo.md#^ref-557309a3-32-0) (line 32, col 0, score 1)
- [Tooling — L26](chunks/tooling.md#^ref-6cb4943e-26-0) (line 26, col 0, score 1)
- [Window Management — L36](chunks/window-management.md#^ref-9e8ae388-36-0) (line 36, col 0, score 1)
- [compiler-kit-foundations — L639](compiler-kit-foundations.md#^ref-01b21543-639-0) (line 639, col 0, score 1)
- [Creative Moments — L10](creative-moments.md#^ref-10d98225-10-0) (line 10, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L258](cross-language-runtime-polymorphism.md#^ref-c34c36a6-258-0) (line 258, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L215](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-215-0) (line 215, col 0, score 1)
- [Debugging Broker Connections and Agent Behavior — L50](debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-50-0) (line 50, col 0, score 1)
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
- [Agent Tasks: Persistence Migration to DualStore — L157](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-157-0) (line 157, col 0, score 1)
- [api-gateway-versioning — L298](api-gateway-versioning.md#^ref-0580dcd3-298-0) (line 298, col 0, score 1)
- [ecs-offload-workers — L455](ecs-offload-workers.md#^ref-6498b9d7-455-0) (line 455, col 0, score 1)
- [ecs-scheduler-and-prefabs — L389](ecs-scheduler-and-prefabs.md#^ref-c62a1815-389-0) (line 389, col 0, score 1)
- [eidolon-field-math-foundations — L130](eidolon-field-math-foundations.md#^ref-008f2ac0-130-0) (line 130, col 0, score 1)
- [i3-config-validation-methods — L63](i3-config-validation-methods.md#^ref-d28090ac-63-0) (line 63, col 0, score 1)
- [Language-Agnostic Mirror System — L548](language-agnostic-mirror-system.md#^ref-d2b3628c-548-0) (line 548, col 0, score 1)
- [Local-First Intention→Code Loop with Free Models — L143](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-143-0) (line 143, col 0, score 1)
- [Local-Only-LLM-Workflow — L172](local-only-llm-workflow.md#^ref-9a8ab57e-172-0) (line 172, col 0, score 1)
- [Admin Dashboard for User Management — L43](admin-dashboard-for-user-management.md#^ref-2901a3e9-43-0) (line 43, col 0, score 1)
- [api-gateway-versioning — L300](api-gateway-versioning.md#^ref-0580dcd3-300-0) (line 300, col 0, score 1)
- [observability-infrastructure-setup — L399](observability-infrastructure-setup.md#^ref-b4e64f8c-399-0) (line 399, col 0, score 1)
- [obsidian-ignore-node-modules-regex — L79](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-79-0) (line 79, col 0, score 1)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L165](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-165-0) (line 165, col 0, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L266](particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-266-0) (line 266, col 0, score 1)
- [Per-Domain Policy System for JS Crawler — L488](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-488-0) (line 488, col 0, score 1)
- [Performance-Optimized-Polyglot-Bridge — L436](performance-optimized-polyglot-bridge.md#^ref-f5579967-436-0) (line 436, col 0, score 1)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L504](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-504-0) (line 504, col 0, score 1)
- [polymorphic-meta-programming-engine — L244](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-244-0) (line 244, col 0, score 1)
- [Post-Linguistic Transhuman Design Frameworks — L91](post-linguistic-transhuman-design-frameworks.md#^ref-6bcff92c-91-0) (line 91, col 0, score 1)
- [Admin Dashboard for User Management — L39](admin-dashboard-for-user-management.md#^ref-2901a3e9-39-0) (line 39, col 0, score 1)
- [archetype-ecs — L471](archetype-ecs.md#^ref-8f4c1e86-471-0) (line 471, col 0, score 1)
- [Board Walk – 2025-08-11 — L141](board-walk-2025-08-11.md#^ref-7aa1eb92-141-0) (line 141, col 0, score 1)
- [JavaScript — L31](chunks/javascript.md#^ref-c1618c66-31-0) (line 31, col 0, score 1)
- [ecs-offload-workers — L459](ecs-offload-workers.md#^ref-6498b9d7-459-0) (line 459, col 0, score 1)
- [ecs-scheduler-and-prefabs — L395](ecs-scheduler-and-prefabs.md#^ref-c62a1815-395-0) (line 395, col 0, score 1)
- [eidolon-field-math-foundations — L156](eidolon-field-math-foundations.md#^ref-008f2ac0-156-0) (line 156, col 0, score 1)
- [i3-config-validation-methods — L64](i3-config-validation-methods.md#^ref-d28090ac-64-0) (line 64, col 0, score 1)
- [JavaScript — L11](chunks/javascript.md#^ref-c1618c66-11-0) (line 11, col 0, score 1)
- [ecs-offload-workers — L457](ecs-offload-workers.md#^ref-6498b9d7-457-0) (line 457, col 0, score 1)
- [ecs-scheduler-and-prefabs — L419](ecs-scheduler-and-prefabs.md#^ref-c62a1815-419-0) (line 419, col 0, score 1)
- [Lisp-Compiler-Integration — L539](lisp-compiler-integration.md#^ref-cfee6d36-539-0) (line 539, col 0, score 1)
- [Lispy Macros with syntax-rules — L412](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-412-0) (line 412, col 0, score 1)
- [State Snapshots API and Transactional Projector — L353](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-353-0) (line 353, col 0, score 1)
- [System Scheduler with Resource-Aware DAG — L410](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-410-0) (line 410, col 0, score 1)
- [Unique Info Dump Index — L72](unique-info-dump-index.md#^ref-30ec3ba6-72-0) (line 72, col 0, score 1)
- [aionian-circuit-math — L153](aionian-circuit-math.md#^ref-f2d83a77-153-0) (line 153, col 0, score 1)
- [JavaScript — L24](chunks/javascript.md#^ref-c1618c66-24-0) (line 24, col 0, score 1)
- [Math Fundamentals — L26](chunks/math-fundamentals.md#^ref-c6e87433-26-0) (line 26, col 0, score 1)
- [compiler-kit-foundations — L607](compiler-kit-foundations.md#^ref-01b21543-607-0) (line 607, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L201](cross-language-runtime-polymorphism.md#^ref-c34c36a6-201-0) (line 201, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L166](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-166-0) (line 166, col 0, score 1)
- [Dynamic Context Model for Web Components — L416](dynamic-context-model-for-web-components.md#^ref-f7702bf8-416-0) (line 416, col 0, score 1)
- [field-interaction-equations — L153](field-interaction-equations.md#^ref-b09141b7-153-0) (line 153, col 0, score 1)
- [graph-ds — L371](graph-ds.md#^ref-6620e2f2-371-0) (line 371, col 0, score 1)
- [2d-sandbox-field — L225](2d-sandbox-field.md#^ref-c710dc93-225-0) (line 225, col 0, score 1)
- [Admin Dashboard for User Management — L49](admin-dashboard-for-user-management.md#^ref-2901a3e9-49-0) (line 49, col 0, score 1)
- [Agent Reflections and Prompt Evolution — L150](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-150-0) (line 150, col 0, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L163](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-163-0) (line 163, col 0, score 1)
- [AI-First-OS-Model-Context-Protocol — L9](ai-first-os-model-context-protocol.md#^ref-618198f4-9-0) (line 9, col 0, score 1)
- [aionian-circuit-math — L179](aionian-circuit-math.md#^ref-f2d83a77-179-0) (line 179, col 0, score 1)
- [api-gateway-versioning — L304](api-gateway-versioning.md#^ref-0580dcd3-304-0) (line 304, col 0, score 1)
- [archetype-ecs — L479](archetype-ecs.md#^ref-8f4c1e86-479-0) (line 479, col 0, score 1)
- [balanced-bst — L295](balanced-bst.md#^ref-d3e7db72-295-0) (line 295, col 0, score 1)
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
- [Promethean_Eidolon_Synchronicity_Model — L74](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-74-0) (line 74, col 0, score 1)
- [Promethean Event Bus MVP v0.1 — L929](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-929-0) (line 929, col 0, score 1)
- [Promethean Infrastructure Setup — L597](promethean-infrastructure-setup.md#^ref-6deed6ac-597-0) (line 597, col 0, score 1)
- [Promethean-native config design — L421](promethean-native-config-design.md#^ref-ab748541-421-0) (line 421, col 0, score 1)
- [promethean-system-diagrams — L217](promethean-system-diagrams.md#^ref-b51e19b4-217-0) (line 217, col 0, score 1)
- [Promethean Web UI Setup — L629](promethean-web-ui-setup.md#^ref-bc5172ca-629-0) (line 629, col 0, score 1)
- [Prompt_Folder_Bootstrap — L193](prompt-folder-bootstrap.md#^ref-bd4f0976-193-0) (line 193, col 0, score 1)
- [prompt-programming-language-lisp — L107](prompt-programming-language-lisp.md#^ref-d41a06d1-107-0) (line 107, col 0, score 1)
- [Math Fundamentals — L34](chunks/math-fundamentals.md#^ref-c6e87433-34-0) (line 34, col 0, score 1)
- [Services — L22](chunks/services.md#^ref-75ea4a6a-22-0) (line 22, col 0, score 1)
- [Shared — L29](chunks/shared.md#^ref-623a55f7-29-0) (line 29, col 0, score 1)
- [Simulation Demo — L23](chunks/simulation-demo.md#^ref-557309a3-23-0) (line 23, col 0, score 1)
- [Tooling — L16](chunks/tooling.md#^ref-6cb4943e-16-0) (line 16, col 0, score 1)
- [Window Management — L25](chunks/window-management.md#^ref-9e8ae388-25-0) (line 25, col 0, score 1)
- [compiler-kit-foundations — L627](compiler-kit-foundations.md#^ref-01b21543-627-0) (line 627, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L171](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-171-0) (line 171, col 0, score 1)
- [Duck's Attractor States — L81](ducks-attractor-states.md#^ref-13951643-81-0) (line 81, col 0, score 1)
- [DuckDuckGoSearchPipeline — L16](duckduckgosearchpipeline.md#^ref-e979c50f-16-0) (line 16, col 0, score 1)
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
- [Chroma Toolkit Consolidation Plan — L218](chroma-toolkit-consolidation-plan.md#^ref-5020e892-218-0) (line 218, col 0, score 1)
- [DSL — L21](chunks/dsl.md#^ref-e87bc036-21-0) (line 21, col 0, score 1)
- [Window Management — L12](chunks/window-management.md#^ref-9e8ae388-12-0) (line 12, col 0, score 1)
- [compiler-kit-foundations — L638](compiler-kit-foundations.md#^ref-01b21543-638-0) (line 638, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L259](cross-language-runtime-polymorphism.md#^ref-c34c36a6-259-0) (line 259, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L217](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-217-0) (line 217, col 0, score 1)
- [Lisp-Compiler-Integration — L553](lisp-compiler-integration.md#^ref-cfee6d36-553-0) (line 553, col 0, score 1)
- [lisp-dsl-for-window-management — L220](lisp-dsl-for-window-management.md#^ref-c5c5ff1c-220-0) (line 220, col 0, score 1)
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
- [Math Fundamentals — L43](chunks/math-fundamentals.md#^ref-c6e87433-43-0) (line 43, col 0, score 1)
- [Operations — L15](chunks/operations.md#^ref-f1add613-15-0) (line 15, col 0, score 1)
- [Shared — L31](chunks/shared.md#^ref-623a55f7-31-0) (line 31, col 0, score 1)
- [Simulation Demo — L34](chunks/simulation-demo.md#^ref-557309a3-34-0) (line 34, col 0, score 1)
- [Window Management — L38](chunks/window-management.md#^ref-9e8ae388-38-0) (line 38, col 0, score 1)
- [compiler-kit-foundations — L651](compiler-kit-foundations.md#^ref-01b21543-651-0) (line 651, col 0, score 1)
- [Creative Moments — L15](creative-moments.md#^ref-10d98225-15-0) (line 15, col 0, score 1)
- [Cross-Language Runtime Polymorphism — L263](cross-language-runtime-polymorphism.md#^ref-c34c36a6-263-0) (line 263, col 0, score 1)
- [Cross-Target Macro System in Sibilant — L219](cross-target-macro-system-in-sibilant.md#^ref-5f210ca2-219-0) (line 219, col 0, score 1)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
