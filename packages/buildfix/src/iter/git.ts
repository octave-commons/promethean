import * as path from "path";
import { promises as fs } from "fs";
import { git, isGitRepo, sanitizeBranch } from "../utils.js";

export async function ensureBranch(branch: string) {
  const chk = await git(`rev-parse --verify ${branch}`);
  if (chk.code !== 0) await git(`checkout -b ${branch}`); else await git(`checkout ${branch}`);
}
export async function commitIfChanges(message: string){
  const st = await git("status --porcelain");
  if (!st.out) return undefined;
  await git("add -A");
  const c = await git(`commit -m "${message.replace(/"/g,'\\"')}"`);
  if (c.code !== 0) return undefined;
  const sha = await git("rev-parse HEAD"); return sha.out || undefined;
}
export async function pushBranch(branch: string, remote: string){ return (await git(`push ${remote} ${branch}`)).code === 0; }
export async function createPR(branch: string, title: string, bodyPath: string){
  const { exec } = await import("child_process");
  return new Promise<string|undefined>((resolve) => {
    exec(`gh pr create --fill --title "${title.replace(/"/g,'\\"')}" --body-file "${bodyPath}" --head ${branch}`, {}, (err, stdout)=> resolve(err?undefined:String(stdout).trim()));
  });
}
export { isGitRepo, sanitizeBranch };
