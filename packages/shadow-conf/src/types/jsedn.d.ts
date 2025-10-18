declare module 'jsedn' {
  export function parse(data: string): any;
  export function stringify(data: any): string;
  export function toJS(data: any): any;
  export class EDN {
    constructor(data: any);
    toString(): string;
  }
}
