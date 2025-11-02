declare module 'jsedn' {
  export function parse(data: string): unknown;
  export function stringify(data: unknown): string;
  export function toJS(data: unknown): unknown;
}
