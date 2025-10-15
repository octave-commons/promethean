import * as path from 'path';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'node:url';

import { parseArgs } from '@promethean/utils';

import {
  writeJSON,
  readJSON,
  applySnippetToProject,
  resolveFromWorkspace,
  WORKSPACE_ROOT,
} from './utils.js';
import type { ErrorList, History, Attempt, Summary, BuildError } from './types.js';
import { requestPlan, writePlanFile } from './iter/plan.js';
import { materializeSnippet } from './iter/dsl.js';
import { buildAndJudge } from './iter/eval.js';
import {
  ensureBranch,
  commitIfChanges,
  pushBranch,
  createPR,
  isGitRepo,
  sanitizeBranch,
  rollbackWorktree,
} from './iter/git.js';

export type IterateOptions = {
  readonly errors?: string;
  readonly out?: string;
  readonly model?: string;
  readonly maxCycles?: number;
  readonly onlyCode?: string;
  readonly onlyFile?: string;
  readonly tsconfig?: string;
  readonly git?: string;
  readonly commitOn?: 'always' | 'success';
  readonly branchPrefix?: string;
  readonly remote?: string;
  readonly push?: boolean;
  readonly useGh?: boolean;
  readonly rollbackOnRegress?: boolean;
};

function makeBranch(err: BuildError, branchPrefix: string): string {
  const fileSlug = err.file.replace(WORKSPACE_ROOT + path.sep, '').replace(/[\/\\\.]/g, '-');
  return sanitizeBranch(`${branchPrefix}/${err.code}/${fileSlug}/${err.line}`);
}

interface IterateContext {
  errors: ErrorList;
  tsconfig: string;
  onlyCode: string;
  onlyFile: string;
  maxCycles: number;
  OUT: string;
  useGit: boolean;
  commitOn: 'always' | 'success';
  remote: string;
  push: boolean;
  useGh: boolean;
  doRollback: boolean;
}

async function initializeContext(opts: IterateOptions): Promise<IterateContext> {
  const errors = await readJSON<ErrorList>(
    resolveFromWorkspace(opts.errors ?? '.cache/buildfix/errors.json'),
  );
  if (!errors) throw new Error('errors.json not found');

  const tsconfig = opts.tsconfig ? resolveFromWorkspace(opts.tsconfig) : errors.tsconfig;
  const onlyCode = (opts.onlyCode ?? '').trim();
  const onlyFile = (opts.onlyFile ?? '').trim();
  const maxCycles = opts.maxCycles ?? 5;
  const OUT = resolveFromWorkspace(opts.out ?? '.cache/buildfix');

  const useGit = opts.git !== 'off' && (await isGitRepo());
  const commitOn = opts.commitOn || 'always';
  const remote = opts.remote || 'origin';
  const push = opts.push ?? false;
  const useGh = opts.useGh ?? false;
  const doRollback = opts.rollbackOnRegress ?? true;

  return {
    errors,
    tsconfig,
    onlyCode,
    onlyFile,
    maxCycles,
    OUT,
    useGit,
    commitOn,
    remote,
    push,
    useGh,
    doRollback,
  };
}

function filterErrors(errors: ErrorList, onlyCode: string, onlyFile: string): BuildError[] {
  return errors.errors.filter(
    (e) => (!onlyCode || e.code === onlyCode) && (!onlyFile || e.file.includes(onlyFile)),
  );
}

async function loadOrCreateHistory(err: BuildError, OUT: string): Promise<History> {
  const histDir = path.join(OUT, 'history', err.key);
  const histPath = path.join(histDir, 'history.json');
  await fs.mkdir(histDir, { recursive: true });

  return (
    (await readJSON<History>(histPath)) ?? {
      key: err.key,
      file: err.file,
      code: err.code,
      attempts: [],
    }
  );
}

async function setupGitBranch(
  useGit: boolean,
  err: BuildError,
  gitMode: string | undefined,
  branchPrefix: string | undefined,
): Promise<string | undefined> {
  if (useGit && gitMode === 'per-error') {
    const branch = makeBranch(err, branchPrefix || 'buildfix');
    await ensureBranch(branch);
    return branch;
  }
  return undefined;
}

async function executeFixAttempt(
  ctx: IterateContext,
  err: BuildError,
  history: History,
  attemptNumber: number,
  opts: IterateOptions,
  branch: string | undefined,
): Promise<{ attempt: Attempt; resolved: boolean }> {
  // Baseline
  const { r: before, present: presentBefore } = await buildAndJudge(ctx.tsconfig, err.key);
  const beforeCount = before.diags.length;
  if (!presentBefore) {
    return { attempt: { n: attemptNumber, resolved: true } as Attempt, resolved: true };
  }

  // 1) Plan
  let plan;
  try {
    plan = await requestPlan(opts.model ?? 'qwen3:4b', err, history);
  } catch (e) {
    console.error(`✖ plan failed for ${err.key}:`, e);
    throw new Error(`Plan generation failed: ${e}`);
  }
  await writePlanFile(path.join(ctx.OUT, 'plans', err.key), attemptNumber, plan);

  // 2) Materialize snippet
  const snippetsDir = path.join(ctx.OUT, 'snippets', err.key);
  await fs.mkdir(snippetsDir, { recursive: true });
  const snippetPath = path.join(
    snippetsDir,
    `attempt-${String(attemptNumber).padStart(2, '0')}.mjs`,
  );
  await materializeSnippet(plan, snippetPath);

  // 3) Apply
  try {
    await applySnippetToProject(ctx.tsconfig, snippetPath);
  } catch (e) {
    console.error(`✖ apply failed (#${attemptNumber})`, e);
  }

  // 4) Evaluate
  const { r: after, present } = await buildAndJudge(ctx.tsconfig, err.key);
  const afterCount = after.diags.length;
  const regressed = afterCount > beforeCount;

  // 5) Rollback if worse
  let rolledBack = false;
  if (regressed && ctx.doRollback) {
    if (ctx.useGit) {
      await rollbackWorktree();
      rolledBack = true;
      // recompute to keep history consistent with tree
      const { r: re } = await buildAndJudge(ctx.tsconfig, err.key);
      // replace "after" snapshot with the post-rollback state
      (after as any).diags = re.diags;
    } else {
      console.warn('⚠ rollback requested but not in a git repo — cannot revert changes.');
    }
  }

  const attempt: Attempt = {
    n: attemptNumber,
    snippetPath,
    planSummary: plan.title,
    tscBeforeCount: beforeCount,
    tscAfterCount: regressed && rolledBack ? beforeCount : afterCount,
    resolved: !present && !regressed,
    errorStillPresent: present && !regressed,
    newErrors: after.diags
      .slice(0, 5)
      .map((d) => `${d.code} ${d.file}(${d.line},${d.col}) ${d.message}`),
    regressed,
    rolledBack,
  };

  // 6) Git: never commit a regressed attempt
  if (ctx.useGit && !regressed && (ctx.commitOn === 'always' || attempt.resolved)) {
    await handleGitCommit(ctx, err, attempt, plan, snippetPath, branch);
  }

  return { attempt, resolved: attempt.resolved };
}

async function handleGitCommit(
  ctx: IterateContext,
  err: BuildError,
  attempt: Attempt,
  plan: any,
  snippetPath: string,
  branch: string | undefined,
): Promise<void> {
  const title = `[buildfix] ${err.code} at ${path.relative(
    process.cwd(),
    err.file,
  )}:${err.line} — attempt ${attempt.n}`;

  const bodyPath = path.join(
    path.dirname(snippetPath),
    `attempt-${String(attempt.n).padStart(2, '0')}.msg.md`,
  );

  await fs.writeFile(bodyPath, `${title}\n\nPlan: ${plan.title}\n\n${plan.rationale}\n`, 'utf-8');

  const sha = await commitIfChanges(title);
  if (sha) {
    attempt.commitSha = sha;
    if (branch) attempt.branch = branch;
    if (ctx.push && branch) {
      attempt.pushed = await pushBranch(branch, ctx.remote);
      if (attempt.pushed && ctx.useGh) {
        const pr = await createPR(branch, title, bodyPath);
        if (pr) attempt.prUrl = pr;
      }
    }
  }
}

async function processError(
  ctx: IterateContext,
  err: BuildError,
  opts: IterateOptions,
): Promise<{ resolved: boolean; attempts: number; lastSnippet?: string; branch?: string }> {
  const history = await loadOrCreateHistory(err, ctx.OUT);
  const branch = await setupGitBranch(ctx.useGit, err, opts.git, opts.branchPrefix);

  let resolved = false;
  for (let n = history.attempts.length + 1; n <= ctx.maxCycles; n++) {
    try {
      const { attempt, resolved: attemptResolved } = await executeFixAttempt(
        ctx,
        err,
        history,
        n,
        opts,
        branch,
      );

      history.attempts.push(attempt);

      const histPath = path.join(ctx.OUT, 'history', err.key, 'history.json');
      await writeJSON(histPath, history);

      if (attemptResolved) {
        resolved = true;
        history.resolvedAt = new Date().toISOString();
        await writeJSON(histPath, history);
        break;
      }
    } catch (e) {
      console.error(`✖ attempt ${n} failed for ${err.key}:`, e);
      break;
    }
  }

  const last = history.attempts.at(-1)?.snippetPath;
  return { resolved, attempts: history.attempts.length, lastSnippet: last, branch };
}

async function writeSummary(ctx: IterateContext, items: Summary['items']): Promise<void> {
  const summary: Summary = {
    iteratedAt: new Date().toISOString(),
    tsconfig: ctx.tsconfig,
    maxCycles: ctx.maxCycles,
    items,
  };

  await writeJSON(path.join(ctx.OUT, 'summary.json'), summary);
  console.log(
    `buildfix: iterate — resolved ${
      summary.items.filter((i) => i.resolved).length
    }/${summary.items.length}`,
  );
}

export async function run(opts: IterateOptions = {}): Promise<void> {
  const ctx = await initializeContext(opts);
  const todo = filterErrors(ctx.errors, ctx.onlyCode, ctx.onlyFile);
  const items: Summary['items'] = [];

  for (const err of todo) {
    const result = await processError(ctx, err, opts);

    const item: Summary['items'][number] = {
      key: err.key,
      resolved: result.resolved,
      attempts: result.attempts,
    };

    if (result.lastSnippet) item.lastSnippet = result.lastSnippet;
    if (result.branch) item.branch = result.branch;

    items.push(item);
  }

  await writeSummary(ctx, items);
}

export default run;

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = parseArgs({
    '--errors': '.cache/buildfix/errors.json',
    '--out': '.cache/buildfix',
    '--model': 'qwen3:4b',
    '--max-cycles': '5',
    '--only-code': '',
    '--only-file': '',
    '--tsconfig': '',
    '--git': 'off',
    '--commit-on': 'always',
    '--branch-prefix': 'buildfix',
    '--remote': 'origin',
    '--push': 'false',
    '--use-gh': 'false',
    '--rollback-on-regress': 'true',
  });
  run({
    errors: args['--errors'],
    out: args['--out'],
    model: args['--model'],
    maxCycles: Number(args['--max-cycles']),
    onlyCode: args['--only-code'],
    onlyFile: args['--only-file'],
    tsconfig: args['--tsconfig'],
    git: args['--git'],
    commitOn: args['--commit-on'] as 'always' | 'success',
    branchPrefix: args['--branch-prefix'],
    remote: args['--remote'],
    push: args['--push'] === 'true',
    useGh: args['--use-gh'] === 'true',
    rollbackOnRegress: args['--rollback-on-regress'] === 'true',
  }).catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
