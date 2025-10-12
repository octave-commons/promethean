import * as nodePath from 'path';
import { promises as fs } from 'fs';

import { applySnippetToProject, codeFrame, tsc, WORKSPACE_ROOT } from './utils.js';
import { requestPlan, writePlanFile } from './iter/plan.js';
import { materializeSnippet, type Plan } from './iter/dsl.js';
import { buildAndJudge, errorStillPresent } from './iter/eval.js';
import type { Attempt, BuildError, History } from './types.js';

const SNAPSHOT_IGNORES = new Set(['node_modules', '.git', '.cache', 'dist']);

type Snapshot = Map<string, Buffer>;

export type FixOptions = {
  readonly filePath: string;
  readonly tsconfig?: string;
  readonly model?: string;
  readonly maxAttempts?: number;
  readonly planDir?: string;
  readonly prompt?: string;
  readonly system?: string;
};

export type AttemptDetail = Attempt & {
  readonly model: string;
  readonly beforeContent?: string;
  readonly afterContent?: string;
  readonly durationMs: number;
  readonly planRationale?: string;
};

export type FixResult = {
  success: boolean;
  errorCountBefore: number;
  errorCountAfter: number;
  errorsResolved: boolean;
  planGenerated: boolean;
  attempts: number;
  duration: number;
  plan?: Plan;
  error?: string;
  model: string;
  finalContent?: string;
  attemptDetails: AttemptDetail[];
};

async function pathExists(candidate: string): Promise<boolean> {
  try {
    await fs.access(candidate);
    return true;
  } catch {
    return false;
  }
}

async function findNearestTsconfig(startDir: string): Promise<string | undefined> {
  let current = nodePath.resolve(startDir);
  const root = nodePath.parse(current).root;
  while (true) {
    const candidate = nodePath.join(current, 'tsconfig.json');
    if (await pathExists(candidate)) return candidate;
    if (current === root) break;
    current = nodePath.dirname(current);
  }
  return undefined;
}

async function takeSnapshot(dir: string, snapshot: Snapshot, prefix = ''): Promise<void> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (SNAPSHOT_IGNORES.has(entry.name)) continue;
    const abs = nodePath.join(dir, entry.name);
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      await takeSnapshot(abs, snapshot, rel);
    } else if (entry.isFile()) {
      snapshot.set(rel, await fs.readFile(abs));
    }
  }
}

async function listFiles(dir: string, acc: Set<string>, prefix = ''): Promise<void> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (SNAPSHOT_IGNORES.has(entry.name)) continue;
    const abs = nodePath.join(dir, entry.name);
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      await listFiles(abs, acc, rel);
    } else if (entry.isFile()) {
      acc.add(rel);
    }
  }
}

async function restoreSnapshot(baseDir: string, snapshot: Snapshot): Promise<void> {
  const existing = new Set<string>();
  await listFiles(baseDir, existing);
  for (const [rel, content] of snapshot) {
    const abs = nodePath.join(baseDir, rel);
    await fs.mkdir(nodePath.dirname(abs), { recursive: true });
    await fs.writeFile(abs, content);
    existing.delete(rel);
  }
  for (const rel of existing) {
    await fs.rm(nodePath.join(baseDir, rel));
  }
}

function resolveDiagnosticFile(tsconfigPath: string, diagFile: string): string {
  return nodePath.isAbsolute(diagFile)
    ? diagFile
    : nodePath.resolve(nodePath.dirname(tsconfigPath), diagFile);
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (typeof error === 'number' || typeof error === 'boolean') return String(error);
  return 'Unknown error';
}

export class BuildFix {
  constructor(private readonly defaults: Partial<FixOptions> = {}) {}

  // eslint-disable-next-line max-lines-per-function, sonarjs/cognitive-complexity, complexity
  async fixErrors(_source: string, rawOptions: FixOptions): Promise<FixResult> {
    const start = Date.now();
    const options = { ...this.defaults, ...rawOptions };
    const absoluteFile = nodePath.resolve(options.filePath);
    const workdir = nodePath.dirname(absoluteFile);
    const snapshot: Snapshot = new Map();
    await takeSnapshot(workdir, snapshot);

    const attemptDetails: AttemptDetail[] = [];
    let finalContent: string | undefined;

    const result: FixResult = {
      success: false,
      errorCountBefore: 0,
      errorCountAfter: 0,
      errorsResolved: false,
      planGenerated: false,
      attempts: 0,
      duration: 0,
      model: options.model ?? 'qwen3:4b',
      attemptDetails,
    };

    try {
      const resolvedTsconfig =
        options.tsconfig ??
        (await findNearestTsconfig(workdir)) ??
        nodePath.join(WORKSPACE_ROOT, 'tsconfig.json');

      if (!(await pathExists(resolvedTsconfig))) {
        throw new Error(`tsconfig.json not found for ${absoluteFile}`);
      }

      const initial = await tsc(resolvedTsconfig);
      result.errorCountBefore = initial.diags.length;
      if (initial.diags.length === 0) {
        result.success = true;
        result.errorsResolved = true;
        return result;
      }

      const targetDiagCandidate =
        initial.diags.find((d) => resolveDiagnosticFile(resolvedTsconfig, d.file) === absoluteFile) ??
        initial.diags[0];
      if (!targetDiagCandidate) {
        result.error = 'No diagnostic information available for requested file.';
        return result;
      }
      const targetDiag = targetDiagCandidate;

      const targetFile = resolveDiagnosticFile(resolvedTsconfig, targetDiag.file);
      const frame = await codeFrame(targetFile, targetDiag.line);
      let buildError: BuildError = {
        file: targetFile,
        line: targetDiag.line,
        col: targetDiag.col,
        code: targetDiag.code,
        message: targetDiag.message,
        frame,
        key: `${targetDiag.code}|${targetFile}|${targetDiag.line}`,
      };

      let history: History = {
        key: buildError.key,
        file: buildError.file,
        code: buildError.code,
        attempts: [],
      };

      const planRoot =
        options.planDir ??
        nodePath.join(
          workdir,
          '.cache',
          'buildfix',
          nodePath.basename(absoluteFile, nodePath.extname(absoluteFile)),
        );
      const model = result.model;
      const maxAttempts = options.maxAttempts ?? 3;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        result.attempts = attempt;
        const attemptStartedAt = Date.now();
        const attemptFile = buildError.file;

        const { r: before, present: presentBefore } = await buildAndJudge(
          resolvedTsconfig,
          buildError.key,
        );
        const beforeCount = before.diags.length;
        if (!presentBefore) {
          result.success = true;
          result.errorsResolved = true;
          result.errorCountAfter = beforeCount;
          break;
        }

        let plan: Plan;
        try {
          plan = await requestPlan(model, buildError, history, {
            prompt: options.prompt,
            system: options.system,
          });
        } catch (error) {
          result.error = toErrorMessage(error);
          break;
        }

        result.planGenerated = true;
        result.plan = plan;
        await writePlanFile(nodePath.join(planRoot, 'plans'), attempt, plan);

        const snippetPath = nodePath.join(
          planRoot,
          `attempt-${String(attempt).padStart(2, '0')}.mjs`,
        );
        await materializeSnippet(plan, snippetPath);

        const beforeContent = await fs.readFile(attemptFile, 'utf-8').catch(() => undefined);
        await applySnippetToProject(resolvedTsconfig, snippetPath);
        const afterContent = await fs.readFile(attemptFile, 'utf-8').catch(() => undefined);

        const { r: after, present } = await buildAndJudge(resolvedTsconfig, buildError.key);
        const afterCount = after.diags.length;
        const regressed = afterCount > beforeCount;

        result.errorCountAfter = afterCount;
        result.errorsResolved = !present && !regressed;
        result.success = result.errorsResolved;

        const attemptSummary: Attempt = {
          n: attempt,
          snippetPath,
          planSummary: plan.title,
          tscBeforeCount: beforeCount,
          tscAfterCount: regressed ? beforeCount : afterCount,
          resolved: result.errorsResolved,
          errorStillPresent: present && !regressed,
          newErrors: after.diags
            .slice(0, 5)
            .map((d) => `${d.code} ${d.file}(${d.line},${d.col}) ${d.message}`),
          regressed,
          rolledBack: false,
        };

        history = { ...history, attempts: [...history.attempts, attemptSummary] };
        attemptDetails.push({
          ...attemptSummary,
          model,
          beforeContent,
          afterContent,
          durationMs: Date.now() - attemptStartedAt,
          planRationale: plan.rationale,
        });

        if (result.success) break;

        if (!errorStillPresent(after.diags, buildError.key)) {
          // Error changed shape; recompute build error to keep key aligned.
          const nextDiag = after.diags.find(
            (d) => resolveDiagnosticFile(resolvedTsconfig, d.file) === absoluteFile,
          );
          if (nextDiag) {
            const nextFile = resolveDiagnosticFile(resolvedTsconfig, nextDiag.file);
            const nextFrame = await codeFrame(nextFile, nextDiag.line);
            buildError = {
              file: nextFile,
              line: nextDiag.line,
              col: nextDiag.col,
              code: nextDiag.code,
              message: nextDiag.message,
              frame: nextFrame,
              key: `${nextDiag.code}|${absoluteFile}|${nextDiag.line}`,
            };
            history = { ...history, key: buildError.key, file: buildError.file, code: buildError.code };
          }
        }
      }
      try {
        finalContent = await fs.readFile(buildError.file, 'utf-8');
      } catch {
        finalContent = undefined;
      }
    } catch (error) {
      result.error = toErrorMessage(error);
    } finally {
      if (finalContent !== undefined) {
        result.finalContent = finalContent;
      }
      await restoreSnapshot(workdir, snapshot);
      result.duration = Date.now() - start;
    }

    return result;
  }
}
