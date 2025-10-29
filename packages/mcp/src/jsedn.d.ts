declare module 'jsedn' {
  export function parse(data: string): { toJS(): unknown };
  export function stringify(data: unknown): string;
}
