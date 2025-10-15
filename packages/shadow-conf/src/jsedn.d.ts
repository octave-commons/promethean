declare module 'jsedn' {
  type EDNData =
    | string
    | number
    | boolean
    | null
    | readonly EDNData[]
    | { readonly [key: string]: EDNData }
    | Map<EDNData, EDNData>
    | Set<EDNData>;

  export function parse(input: string): EDNData;
  export function stringify(data: EDNData): string;
  export function toJS(data: EDNData): unknown;

  export const jsedn: {
    parse: typeof parse;
    stringify: typeof stringify;
    toJS: typeof toJS;
  };
}
