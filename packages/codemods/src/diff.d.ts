declare module 'diff' {
  export function diff(oldStr: string, newStr: string, options?: any): any[];
  export function diffChars(oldStr: string, newStr: string, options?: any): any[];
  export function diffWords(oldStr: string, newStr: string, options?: any): any[];
  export function diffLines(oldStr: string, newStr: string, options?: any): any[];
  export function diffCss(oldStr: string, newStr: string): any[];
  export function diffJson(oldObj: any, newObj: any, options?: any): any[];
  export function diffArrays(oldArr: any[], newArr: any[], options?: any): any[];
  export function createPatch(
    fileName: string,
    oldStr: string,
    newStr: string,
    oldHeader?: string,
    newHeader?: string,
    options?: any,
  ): string;
  export function applyPatch(oldStr: string, uniDiff: string): string;
  export function parsePatch(uniDiff: string): any[];
  export function structuredPatch(
    oldFileName: string,
    newFileName: string,
    oldStr: string,
    newStr: string,
    oldHeader?: string,
    newHeader?: string,
    options?: any,
  ): any;
}
