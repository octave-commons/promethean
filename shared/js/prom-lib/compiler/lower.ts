import type { Expr } from "./ast";
export type IR = Expr;
export function lower(expr: Expr): IR {
  return expr;
}
