declare module 'globby' {
  export function globby(patterns: string | string[], options?: any): Promise<string[]>;
}
