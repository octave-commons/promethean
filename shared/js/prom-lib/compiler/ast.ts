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

export function name(text: string, span: Span): Name {
  return { kind: "Name", text, span };
}
