export type Sym = string & { __sym: true };
export type Lit = number | string | boolean | null;

export type Prim =
  | "add"
  | "sub"
  | "mul"
  | "div"
  | "mod"
  | "lt"
  | "gt"
  | "le"
  | "ge"
  | "eq"
  | "ne"
  | "not";

export type Val =
  | { t: "lit"; v: Lit }
  | { t: "var"; s: Sym }
  | { t: "lambda"; params: Sym[]; body: Stmt[] };

export type Stmt =
  | { k: "bind"; s: Sym; rhs: Rhs } // s = rhs
  | { k: "if"; cond: Sym; then: Stmt[]; else: Stmt[] }
  | { k: "ret"; s: Sym };

export type Rhs =
  | { r: "prim"; op: Prim; a: Sym; b?: Sym } // unary if b undefined when op=="not"
  | { r: "call"; fn: Sym; args: Sym[] }
  | { r: "val"; v: Val };

export type Fun = { name?: Sym; params: Sym[]; body: Stmt[] };

export type Module = { funs: Fun[]; main: Fun };

export function gensym(prefix = "t"): Sym {
  return (prefix + "_" + Math.random().toString(36).slice(2, 8)) as Sym;
}
