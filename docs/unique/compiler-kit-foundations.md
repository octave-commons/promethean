---
uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
created_at: 2025.08.08.22.08.06.md
filename: compiler-kit-foundations
description: >-
  A minimal compiler kit for building language-agnostic compilers with
  tokenization, Pratt parsing, ANF IR, and code generation hooks.
tags:
  - compiler
  - tokenizer
  - pratt-parser
  - ast
  - ir
  - optimizations
  - codegen
related_to_title:
  - Interop and Source Maps
  - set-assignment-in-lisp-ast
  - Lispy Macros with syntax-rules
  - template-based-compilation
  - Lisp-Compiler-Integration
  - 'Polyglot S-expr Bridge: Python-JS-Lisp Interop'
  - sibilant-metacompiler-overview
  - ts-to-lisp-transpiler
  - typed-struct-compiler
  - DSL
  - Unique Info Dump Index
  - sibilant-macro-targets
  - Language-Agnostic Mirror System
  - archetype-ecs
  - ecs-scheduler-and-prefabs
  - js-to-lisp-reverse-compiler
  - ecs-offload-workers
  - aionian-circuit-math
  - Diagrams
  - Cross-Target Macro System in Sibilant
  - lisp-dsl-for-window-management
  - polyglot-repl-interface-layer
  - graph-ds
  - Cross-Language Runtime Polymorphism
  - polymorphic-meta-programming-engine
  - JavaScript
  - Window Management
  - ParticleSimulationWithCanvasAndFFmpeg
  - mystery-lisp-search-session
  - field-interaction-equations
related_to_uuid:
  - cdfac40c-00e4-458f-96a7-4c37d0278731
  - c5fba0a0-9196-468d-a0f3-51c99e987263
  - cbfe3513-6a4a-4d2e-915d-ddfab583b2de
  - f8877e5e-1e4f-4478-93cd-a0bf86d26a41
  - cfee6d36-b9f5-4587-885a-cdfddb4f054e
  - 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
  - 61d4086b-4adf-4e94-95e4-95a249cd1b53
  - ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
  - 78eeedf7-75bc-4692-a5a7-bb6857270621
  - e87bc036-1570-419e-a558-f45b9c0db698
  - 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
  - c5c9a5c6-427d-4864-8084-c083cd55faa0
  - d2b3628c-6cad-4664-8551-94ef8280851d
  - 8f4c1e86-1236-4936-84ca-6ed7082af6b7
  - c62a1815-c43b-4a3b-88e6-d7fa008a155e
  - 58191024-d04a-4520-8aae-a18be7b94263
  - 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
  - f2d83a77-7f86-4c56-8538-1350167a0c6c
  - 45cd25b5-ed36-49ab-82c8-10d0903e34db
  - 5f210ca2-54e9-445b-afe4-fb340d4992c5
  - c5c5ff1c-d1bc-45c7-8a84-55a4a847dfc5
  - 9c79206d-4cb9-4f00-87e0-782dcea37bc7
  - 6620e2f2-de6d-45d8-a722-5d26e160b370
  - c34c36a6-80c9-4b44-a200-6448543b1b33
  - 7bed0b9a-8b22-4b1f-be81-054a179453cb
  - c1618c66-f73a-4e04-9bfa-ef38755f7acc
  - 9e8ae388-767a-4ea8-9f2e-88801291d947
  - e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
  - 513dc4c7-e045-4123-ba2e-cf5ef0b7b4a3
  - b09141b7-544f-4c8e-8f49-bf76cecaacbb
references: []
---
Note: Consolidated here → ../notes/dsl/compiler-kit-foundations.md

Love it. Let’s start a **compiler kit** you can grow into whatever language you want. I’ll give you:

* a tiny **tokenizer**
* a pluggable **Pratt parser** → **AST**
* a minimal, language-agnostic **ANF IR**
* a **lowering** pass (AST → IR)
* hooks for **optimizations** & **codegen** (VM/JS/WASM later)

Paste these under `shared/js/prom-lib/compiler/`.

# Big picture

```mermaid
flowchart LR
  SRC[Source Text] --> TOK[Tokenizer]
  TOK --> PARSER[Pratt Parser]
  PARSER --> AST[AST (CST-lite)]
  AST --> LOWER[Lowering/Desugar]
  LOWER --> IR[ANF IR]
  IR -->|opt passes| IR2[Optimized IR]
  IR2 --> CG[Codegen (VM/JS/WASM)]
  CG --> RUN[Run/Emit]
```

---

# 1) Common utilities

```ts
// shared/js/prom-lib/compiler/common.ts
export type Span = { start: number; end: number; line: number; col: number };
export class Diag extends Error {
  constructor(message: string, public span?: Span) { super(message); }
}
export function spanMerge(a: Span, b: Span): Span {
  return { start: a.start, end: b.end, line: a.line, col: a.col };
}
export function assert<T>(x: T | undefined | null, msg="assert"): T {
  if (x == null) throw new Diag(msg);
  return x;
}
```

---

# 2) Tokenizer (tiny, extensible)

```ts
// shared/js/prom-lib/compiler/lexer.ts
import { Span } from "./common";

export type TokKind =
  | "id" | "num" | "str"
  | "op" | "punct" | "kw" | "eof";

export type Tok = { kind: TokKind; text: string; span: Span };

const KEYWORDS = new Set(["let","in","if","then","else","fun","return","true","false","null"]);

export function lex(src: string): Tok[] {
  const out: Tok[] = [];
  let i = 0, line = 1, col = 1;

  const startSpan = () => ({ start: i, end: i, line, col });

  const push = (kind: TokKind, text: string, s: Span) => {
    s.end = i; out.push({ kind, text, span: s });
  };

  while (i < src.length) {
    const s = startSpan();
    const c = src[i];

    // whitespace / newline
    if (c === " " || c === "\t" || c === "\r") { i++; col++; continue; }
    if (c === "\n") { i++; line++; col = 1; continue; }

    // line comment //
    if (c === "/" && src[i+1] === "/") {
      while (i < src.length && src[i] !== "\n") { i++; col++; }
      continue;
    }

    // string
    if (c === '"' || c === "'") {
      const quote = c; i++; col++;
      let buf = "";
      while (i < src.length && src[i] !== quote) {
        if (src[i] === "\\" && i+1 < src.length) { buf += src[i+1]; i+=2; col+=2; }
        else { buf += src[i]; i++; col++; }
      }
      i++; col++;
      push("str", buf, s); continue;
    }

    // number
    if (/[0-9]/.test(c) || (c === "." && /[0-9]/.test(src[i+1] || ""))) {
      let j = i;
      while (/[0-9_]/.test(src[j] || "")) j++;
      if (src[j] === ".") { j++; while (/[0-9_]/.test(src[j] || "")) j++; }
      const t = src.slice(i,j).replace(/_/g,"");
      i = j; col += (j - s.start);
      push("num", t, s); continue;
    }

    // id / kw
    if (/[A-Za-z_\$]/.test(c)) {
      let j = i+1;
      while (/[A-Za-z0-9_\$]/.test(src[j] || "")) j++;
      const t = src.slice(i,j);
      i = j; col += (j - s.start);
      push(KEYWORDS.has(t) ? "kw" : "id", t, s); continue;
    }

    // operators (multi-char first)
    const two = src.slice(i,i+2);
    if (["=>","==","!=",">=","<=","&&","||","::","->"].includes(two)) {
      i+=2; col+=2; push("op", two, s); continue;
    }
    if ("+-*/%=!<>".includes(c)) { i++; col++; push("op", c, s); continue; }

    // punctuation
    if ("(){}[],.;:".includes(c)) { i++; col++; push("punct", c, s); continue; }

    // unknown
    i++; col++; push("op", c, s);
  }
  const s = { start: i, end: i, line, col };
  out.push({ kind: "eof", text: "<eof>", span: s });
  return out;
}
```

---

# 3) AST (simple core + sugar)

```ts
// shared/js/prom-lib/compiler/ast.ts
import type { Span } from "./common";

export type Name = { kind: "Name"; text: string; span: Span };
export type Expr =
  | { kind: "Num"; value: number; span: Span }
  | { kind: "Str"; value: string; span: Span }
  | { kind: "Bool"; value: boolean; span: Span }
  | { kind: "Null"; span: Span }
  | { kind: "Var"; name: Name }
  | { kind: "Let"; name: Name; value: Expr; body: Expr; span: Span }
  | { kind: "If"; cond: Expr; then: Expr; else: Expr; span: Span }
  | { kind: "Fun"; params: Name[]; body: Expr; span: Span }
  | { kind: "Call"; callee: Expr; args: Expr[]; span: Span }
  | { kind: "Bin"; op: string; left: Expr; right: Expr; span: Span }
  | { kind: "Un"; op: string; expr: Expr; span: Span }
  | { kind: "Block"; exprs: Expr[]; span: Span };

export function name(text: string, span: Span): Name { return { kind:"Name", text, span }; }
```

---

# 4) Pratt parser (extensible operator table)

```ts
// shared/js/prom-lib/compiler/parser.ts
import { Diag, assert } from "./common";
import type { Tok } from "./lexer";
import { lex } from "./lexer";
import type { Expr, Name } from "./ast";
import { name as mkName } from "./ast";

type Nud = () => Expr;
type Led = (left: Expr) => Expr;

type Op = { lbp: number; led?: Led; nud?: Nud };

export class Parser {
  private i = 0;
  constructor(private tokens: Tok[]) {}

  peek() { return this.tokens[this.i]; }
  next() { return this.tokens[this.i++]; }
  match(kind: Tok["kind"], text?: string) {
    const t = this.peek();
    if (t.kind === kind && (text===undefined || t.text === text)) { this.i++; return true; }
    return false;
  }
  expect(kind: Tok["kind"], text?: string) {
    const t = this.peek();
    if (t.kind !== kind || (text !== undefined && t.text !== text)) throw new Diag(`expected ${text ?? kind} but got ${t.text}`, t.span);
    this.i++;
    return t;
  }

  parseProgram(): Expr {
    const exprs: Expr[] = [];
    while (!this.match("eof")) {
      exprs.push(this.parseExpr(0));
      this.match("punct",";"); // optional semis
    }
    const first = exprs[0]?.["span"] ?? this.peek().span;
    return { kind:"Block", exprs, span: { ...first, end: this.peek().span.end } };
    }

  // Pratt machinery
  private ops = new Map<string, Op>();

  registerInfix(op: string, lbp: number) {
    this.ops.set(op, { lbp, led: (left) => {
      const t = this.tokens[this.i-1];
      const right = this.parseExpr(lbp);
      return { kind:"Bin", op, left, right, span: { ...left.span, end: right.span.end } } as any;
    }});
  }
  registerPrefix(op: string, lbp: number) {
    this.ops.set(op, { lbp, nud: () => {
      const t = this.tokens[this.i-1];
      const expr = this.parseExpr(lbp);
      return { kind:"Un", op, expr, span: { ...t.span, end: expr.span.end } } as any;
    }});
  }

  constructorOpsInit() {
    // precedence (lowest→highest): ||, &&, == !=, < > <= >=, + -, * / %, unary, call, primary
    for (const op of ["||"]) this.registerInfix(op, 10);
    for (const op of ["&&"]) this.registerInfix(op, 20);
    for (const op of ["==","!="]) this.registerInfix(op, 30);
    for (const op of ["<",">","<=",">="]) this.registerInfix(op, 40);
    for (const op of ["+","-"]) this.registerInfix(op, 50);
    for (const op of ["*","/","%"]) this.registerInfix(op, 60);
    for (const op of ["!","-","+"]) this.registerPrefix(op, 70);
  }

  parseExpr(rbp: number): Expr {
    let t = this.next();
    let left = this.nud(t);
    // postfix/call
    while (true) {
      const p = this.peek();
      // call: f(args)
      if (p.kind === "punct" && p.text === "(" && 80 > rbp) {
        this.next();
        const args: Expr[] = [];
        if (!this.match("punct",")")) {
          do { args.push(this.parseExpr(0)); } while (this.match("punct",","));
          this.expect("punct",")");
        }
        left = { kind:"Call", callee: left, args, span: { ...left.span, end: this.peek().span.end } } as any;
        continue;
      }
      const op = (p.kind === "op" ? this.ops.get(p.text) : undefined);
      if (!op || !op.lbp || op.lbp <= rbp) break;
      this.next();
      left = assert(op.led)(left);
    }
    return left;
  }

  private nud(t: Tok): Expr {
    if (t.kind === "num") return { kind:"Num", value: Number(t.text), span: t.span } as any;
    if (t.kind === "str") return { kind:"Str", value: t.text, span: t.span } as any;
    if (t.kind === "kw" && (t.text === "true" || t.text === "false"))
      return { kind:"Bool", value: t.text === "true", span: t.span } as any;
    if (t.kind === "kw" && t.text === "null") return { kind:"Null", span: t.span } as any;

    // (expr)
    if (t.kind === "punct" && t.text === "(") {
      const e = this.parseExpr(0); this.expect("punct",")"); return e;
    }

    // let name = value in body
    if (t.kind === "kw" && t.text === "let") {
      const id = this.expect("id"); const nm = mkName(id.text, id.span);
      this.expect("op","="); const value = this.parseExpr(0);
      this.expect("kw","in"); const body = this.parseExpr(0);
      return { kind:"Let", name: nm, value, body, span: { ...t.span, end: body.span.end } } as any;
    }

    // if cond then a else b
    if (t.kind === "kw" && t.text === "if") {
      const cond = this.parseExpr(0);
      this.expect("kw","then"); const th = this.parseExpr(0);
      this.expect("kw","else"); const el = this.parseExpr(0);
      return { kind:"If", cond, then: th, else: el, span: { ...t.span, end: el.span.end } } as any;
    }

    // fun (a,b) => body
    if (t.kind === "kw" && t.text === "fun") {
      this.expect("punct","(");
      const params: Name[] = [];
      if (!this.match("punct",")")) {
        do { const id = this.expect("id"); params.push(mkName(id.text, id.span)); } while (this.match("punct",","));
        this.expect("punct",")");
      }
      this.expect("op","=>");
      const body = this.parseExpr(0);
      return { kind:"Fun", params, body, span: { ...t.span, end: body.span.end } } as any;
    }

    // identifier
    if (t.kind === "id") return { kind:"Var", name: mkName(t.text, t.span) } as any;

    // prefix operator?
    if (t.kind === "op") {
      const op = this.ops.get(t.text);
      if (op?.nud) return op.nud();
    }

    throw new Diag(`unexpected token ${t.text}`, t.span);
  }
}

export function parse(src: string): Expr {
  const p = new Parser(lex(src)); p.constructorOpsInit(); return p.parseProgram();
}
```

---

# 5) ANF IR (small, SSA-ish without phi)

```ts
// shared/js/prom-lib/compiler/ir.ts
export type Sym = string & { __sym: true };
export type Lit = number | string | boolean | null;

export type Prim = "add"|"sub"|"mul"|"div"|"mod"|"lt"|"gt"|"le"|"ge"|"eq"|"ne"|"not";

export type Val =
  | { t: "lit"; v: Lit }
  | { t: "var"; s: Sym }
  | { t: "lambda"; params: Sym[]; body: Stmt[] };

export type Stmt =
  | { k: "bind"; s: Sym; rhs: Rhs }               // s = rhs
  | { k: "if"; cond: Sym; then: Stmt[]; else: Stmt[] }
  | { k: "ret"; s: Sym };

export type Rhs =
  | { r: "prim"; op: Prim; a: Sym; b?: Sym }      // unary if b undefined when op=="not"
  | { r: "call"; fn: Sym; args: Sym[] }
  | { r: "val"; v: Val };

export type Fun = { name?: Sym; params: Sym[]; body: Stmt[] };

export type Module = { funs: Fun[]; main: Fun };

export function gensym(prefix="t"): Sym {
  return (prefix + "_" + Math.random().toString(36).slice(2,8)) as Sym;
}
```

---

# 6) Lowering: AST → ANF (with simple env)

```ts
// shared/js/prom-lib/compiler/lower.ts
import type { Expr } from "./ast";
import { gensym, type Module, type Fun, type Stmt, type Sym, type Rhs, type Val } from "./ir";

export function lower(ast: Expr): Module {
  const env: Map<string, Sym> = new Map();
  const stmts: Stmt[] = [];
  const result = lowerExpr(ast, env, stmts);
  stmts.push({ k:"ret", s: result });
  const main: Fun = { params: [], body: stmts };
  return { funs: [], main };
}

function lowerExpr(e: Expr, env: Map<string, Sym>, out: Stmt[]): Sym {
  switch (e.kind) {
    case "Num": return bindVal(out, { t:"lit", v: e.value });
    case "Str": return bindVal(out, { t:"lit", v: e.value });
    case "Bool": return bindVal(out, { t:"lit", v: e.value });
    case "Null": return bindVal(out, { t:"lit", v: null });
    case "Var": {
      const s = env.get(e.name.text);
      if (!s) throw new Error(`unbound ${e.name.text}`);
      return s;
    }
    case "Let": {
      const v = lowerExpr(e.value, env, out);
      const s = gensym(e.name.text);
      out.push({ k:"bind", s, rhs: { r:"val", v: { t:"var", s: v } } });
      const child = new Map(env); child.set(e.name.text, s);
      return lowerExpr(e.body, child, out);
    }
    case "If": {
      const cond = lowerExpr(e.cond, env, out);
      const thenS: Stmt[] = [];
      const tRes = lowerExpr(e.then, new Map(env), thenS);
      const elS: Stmt[] = [];
      const eRes = lowerExpr(e.else, new Map(env), elS);
      // Join via let temp and branches assign to it
      const r = gensym("phi");
      thenS.push({ k:"bind", s: r, rhs: { r:"val", v: { t:"var", s: tRes } }});
      elS.push({ k:"bind", s: r, rhs: { r:"val", v: { t:"var", s: eRes } }});
      out.push({ k:"if", cond, then: thenS, else: elS });
      return r;
    }
    case "Fun": {
      const params: Sym[] = e.params.map(p => gensym(p.text));
      // Capture environment via closure later; for now naive
      const body: Stmt[] = [];
      const child = new Map(env);
      e.params.forEach((p,i)=> child.set(p.text, params[i]));
      const ret = lowerExpr(e.body, child, body);
      body.push({ k:"ret", s: ret });
      const s = gensym("lam");
      out.push({ k:"bind", s, rhs: { r:"val", v: { t:"lambda", params, body } } });
      return s;
    }
    case "Call": {
      const fn = lowerExpr(e.callee, env, out);
      const args = e.args.map(a => lowerExpr(a, env, out));
      const s = gensym("call");
      out.push({ k:"bind", s, rhs: { r:"call", fn, args } });
      return s;
    }
    case "Bin": {
      const a = lowerExpr(e.left, env, out);
      const b = lowerExpr(e.right, env, out);
      const op = binToPrim(e.op);
      const s = gensym("bin");
      out.push({ k:"bind", s, rhs: { r:"prim", op, a, b } });
      return s;
    }
    case "Un": {
      const a = lowerExpr(e.expr, env, out);
      const op = e.op === "!" ? "not" : (e.op === "-" ? "sub" : "add");
      const s = gensym("un");
      out.push({ k:"bind", s, rhs: { r:"prim", op: op as any, a } });
      return s;
    }
    case "Block": {
      let last: Sym = gensym("unit");
      for (const x of e.exprs) last = lowerExpr(x, env, out);
      return last;
    }
  }
}

function bindVal(out: Stmt[], v: Val): Sym {
  const s = gensym("v"); out.push({ k:"bind", s, rhs: { r:"val", v } }); return s;
}
function binToPrim(op: string) {
  switch (op) {
    case "+": return "add";
    case "-": return "sub";
    case "*": return "mul";
    case "/": return "div";
    case "%": return "mod";
    case "<": return "lt";
    case ">": return "gt";
    case "<=": return "le";
    case ">=": return "ge";
    case "==": return "eq";
    case "!=": return "ne";
    default: throw new Error(`op ${op}`);
  }
}
```

---

# 7) VM skeleton (optional next step)

```ts
// shared/js/prom-lib/compiler/vm.ts
import type { Module, Fun, Stmt, Rhs } from "./ir";

export type OpCode =
  | ["LIT", number|string|boolean|null]
  | ["MOV", number]               // move local
  | ["PRIM", string, number, number?]
  | ["CALL", number, number]      // fn local, argc
  | ["JZ", number]                // jump if zero
  | ["JMP", number]
  | ["RET"];

export type Bytecode = { code: OpCode[]; locals: number; };

export function compileToBytecode(mod: Module): Bytecode {
  // super naive linearization of main only; full closure/func index later
  const code: OpCode[] = [];
  let locals = 0;
  const env = new Map<string, number>(); // Sym -> slot

  const slot = (s: string) => {
    if (!env.has(s)) env.set(s, locals++);
    return env.get(s)!;
  };

  const emitStmt = (s: Stmt) => {
    if (s.k === "bind") emitRhs(s.s, s.rhs);
    else if (s.k === "ret") code.push(["MOV", slot(s.s)], ["RET"]);
    else if (s.k === "if") {
      // cond in slot, JZ else, … then …, JMP end, else …
      const c = slot(s.cond);
      code.push(["JZ", 0]); const jzIdx = code.length - 1;
      s.then.forEach(emitStmt);
      code.push(["JMP", 0]); const jmpIdx = code.length - 1;
      (code[jzIdx] as any)[1] = code.length;
      s.else.forEach(emitStmt);
      (code[jmpIdx] as any)[1] = code.length;
    }
  };
  const emitRhs = (dst: string, rhs: Rhs) => {
    const d = slot(dst);
    if (rhs.r === "val") {
      if (rhs.v.t === "lit") code.push(["LIT", rhs.v.v], ["MOV", d]);
      else if (rhs.v.t === "var") { const s = slot(rhs.v.s); code.push(["MOV", s], ["MOV", d]); }
      else if (rhs.v.t === "lambda") { /* closures later */ code.push(["LIT", null], ["MOV", d]); }
    } else if (rhs.r === "prim") {
      const a = slot(rhs.a), b = rhs.b != null ? slot(rhs.b) : -1;
      code.push(["PRIM", rhs.op, a, rhs.b != null ? b : undefined], ["MOV", d]);
    } else if (rhs.r === "call") {
      const fn = slot(rhs.fn);
      code.push(["CALL", fn, rhs.args.length], ["MOV", d]);
    }
  };

  mod.main.body.forEach(emitStmt);
  return { code, locals };
}

export function runBytecode(bc: Bytecode): any {
  const mem: any[] = new Array(bc.locals).fill(undefined);
  const code = bc.code;
  let ip = 0, acc: any = undefined;
  while (ip < code.length) {
    const ins = code[ip++];
    const [op] = ins;
    if (op === "LIT") acc = ins[1];
    else if (op === "MOV") acc = mem[ins[1] as number] = acc ?? mem[ins[1] as number];
    else if (op === "PRIM") {
      const o = ins[1] as string, a = mem[ins[2] as number], b = ins[3] != null ? mem[ins[3] as number] : undefined;
      acc = prim(o, a, b);
    }
    else if (op === "JZ") { const target = ins[1] as number; if (!acc) ip = target; }
    else if (op === "JMP") { ip = ins[1] as number; }
    else if (op === "CALL") { /* stub */ acc = null; }
    else if (op === "RET") return acc;
  }
  return acc;
}

function prim(op: string, a: any, b?: any) {
  switch (op) {
    case "add": return a + b;
    case "sub": return b == null ? -a : a - b;
    case "mul": return a * b;
    case "div": return a / b;
    case "mod": return a % b;
    case "lt": return a < b;
    case "gt": return a > b;
    case "le": return a <= b;
    case "ge": return a >= b;
    case "eq": return a === b;
    case "ne": return a !== b;
    case "not": return !a;
    default: throw new Error("prim " + op);
  }
}
```

---

# 8) One-line driver to prove the pipeline

```ts
// shared/js/prom-lib/compiler/driver.ts
import { parse } from "./parser";
import { lower } from "./lower";
import { compileToBytecode, runBytecode } from "./vm";

export function compileAndRun(src: string) {
  const ast = parse(src);
  const ir = lower(ast);
  const bc = compileToBytecode(ir);
  const out = runBytecode(bc);
  return { ast, ir, bc, out };
}

// quick demo:
// const r = compileAndRun(`let x = 2 + 3 in if x > 3 then x*10 else 0`);
// console.log(r.out); // 50
```

---

# Where we go next

* Add **symbol tables & closures** (lift lambdas to `Fun[]`, closure env records)
* Optional **types**: Hindley–Milner (or zod powered dynamic checks)
* Real **optimizer** passes (const folding, copy-prop, DCE, inlining)
* Real **VM** (call frames, heap, closures) or emit **JS**/**WASM**

If you want a Lisp-flavored front-end too (Hy/Sibilant/Common Lisp comfort food), I can wire a 30-line **S-expr** reader that targets the same IR, so you can compile either infix or s-expr to the same core. Want me to add that next or jump straight to closures + call frames?<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [Interop and Source Maps](interop-and-source-maps.md)
- [set-assignment-in-lisp-ast](set-assignment-in-lisp-ast.md)
- [Lispy Macros with syntax-rules](lispy-macros-with-syntax-rules.md)
- [template-based-compilation](template-based-compilation.md)
- [Lisp-Compiler-Integration](lisp-compiler-integration.md)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop](polyglot-s-expr-bridge-python-js-lisp-interop.md)
- [sibilant-metacompiler-overview](sibilant-metacompiler-overview.md)
- [ts-to-lisp-transpiler](ts-to-lisp-transpiler.md)
- [typed-struct-compiler](typed-struct-compiler.md)
- [DSL](chunks/dsl.md)
- [Unique Info Dump Index](unique-info-dump-index.md)
- [sibilant-macro-targets](sibilant-macro-targets.md)
- [Language-Agnostic Mirror System](language-agnostic-mirror-system.md)
- [archetype-ecs](archetype-ecs.md)
- [ecs-scheduler-and-prefabs](ecs-scheduler-and-prefabs.md)
- [js-to-lisp-reverse-compiler](js-to-lisp-reverse-compiler.md)
- [ecs-offload-workers](ecs-offload-workers.md)
- [aionian-circuit-math](aionian-circuit-math.md)
- [Diagrams](chunks/diagrams.md)
- [Cross-Target Macro System in Sibilant](cross-target-macro-system-in-sibilant.md)
- [lisp-dsl-for-window-management](lisp-dsl-for-window-management.md)
- [polyglot-repl-interface-layer](polyglot-repl-interface-layer.md)
- [graph-ds](graph-ds.md)
- [Cross-Language Runtime Polymorphism](cross-language-runtime-polymorphism.md)
- [polymorphic-meta-programming-engine](polymorphic-meta-programming-engine.md)
- [JavaScript](chunks/javascript.md)
- [Window Management](chunks/window-management.md)
- [ParticleSimulationWithCanvasAndFFmpeg](particlesimulationwithcanvasandffmpeg.md)
- [mystery-lisp-search-session](mystery-lisp-search-session.md)
- [field-interaction-equations](field-interaction-equations.md)
## Sources
- _None_
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
