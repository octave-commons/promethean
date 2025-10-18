import * as path from 'path';
import { promises as fs } from 'fs';

import { tsc } from '../utils.js';
import type { RawTscDiagnostic } from '../types.js';

export function errorStillPresent(diags: RawTscDiagnostic[], key: string) {
  const [code, file, lineStr] = key.split('|') as [string, string, string];
  const line = Number(lineStr);
  return diags.some(
    (d) =>
      d.code === code &&
      path.resolve(d.file) === path.resolve(file) &&
      Math.abs(d.line - line) <= 2,
  );
}

export async function buildAndJudge(tsconfig: string, key: string, options?: { timeout?: number }) {
  // Check if tsconfig exists before running tsc
  try {
    await fs.access(tsconfig);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error(`ENOENT: no such file or directory, access '${tsconfig}'`);
    }
    throw error;
  }

  const r = await tsc(tsconfig, options);
  const present = errorStillPresent(r.diags, key);
  return { r, present };
}
