// SPDX-License-Identifier: GPL-3.0-only
declare module 'globby' {
  export function globby(patterns: string | string[], options?: any): Promise<string[]>;
}
