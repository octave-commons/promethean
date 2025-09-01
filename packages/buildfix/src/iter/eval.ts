import * as path from "path";
import { tsc } from "../utils.js";

export function errorStillPresent(diags: any[], key: string) {
  const [code, file, lineStr] = key.split("|"); const line = Number(lineStr);
  return diags.some(d => d.code === code && path.resolve(d.file) === path.resolve(file) && Math.abs(d.line - line) <= 2);
}

export async function buildAndJudge(tsconfig: string, key: string) {
  const r = await tsc(tsconfig);
  const present = errorStillPresent(r.diags, key);
  return { r, present };
}
