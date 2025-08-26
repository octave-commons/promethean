export type Span = { start: number; end: number; line: number; col: number };
export class Diag extends Error {
  constructor(
    message: string,
    public span?: Span,
  ) {
    super(message);
  }
}
export function spanMerge(a: Span, b: Span): Span {
  return { start: a.start, end: b.end, line: a.line, col: a.col };
}
export function assert<T>(x: T | undefined | null, msg = "assert"): T {
  if (x == null) throw new Diag(msg);
  return x;
}
