declare module 'jsedn' {
  export function parse(input: string): any;
  export function stringify(data: any): string;
  export function toJS(data: any): any;

  const jsedn: {
    parse: typeof parse;
    stringify: typeof stringify;
    toJS: typeof toJS;
  };
  export default jsedn;
}
