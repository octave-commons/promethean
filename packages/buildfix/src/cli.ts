#!/usr/bin/env node

/* eslint-disable max-lines */

import * as nodePath from 'path';
import process from 'node:process';
import * as fsp from 'node:fs/promises';

import { globby } from 'globby';

import { BuildFix, type FixResult } from './buildfix.js';
import { WORKSPACE_ROOT } from './utils.js';
import { renderReport } from './report.js';
import { createMutaant } from './mutaant.js';

type ParsedArgs = {
  readonly positional: string[];
  readonly flags: Record<string, string | boolean>;
};

type CommonFlags = {
  readonly models: string[];
  readonly maxAttempts: number;
  readonly prompt?: string;
  readonly system?: string;
  readonly tsconfig?: string;
  readonly acceptFirst: boolean;
  readonly report: boolean;
};

type ModelRun = {
  readonly model: string;
  readonly result: FixResult;
};

type FolderRun = {
  readonly filePath: string;
  readonly runs: ModelRun[];
};

type FixOverrides = {
  readonly tsconfig?: string;
  readonly planDir?: string;
};

const DEFAULT_MODELS = ['qwen3:4b'];

function usage(): string {
  return `buildfix CLI

Usage:
  buildfix file <input> [-o <output>] [options]
  buildfix folder <source> [-o <output>] [options]
  buildfix create-mutaant <source-folder> <target-folder> [options]

Common options:
  --models, -m <list>         Comma-separated list of models to try (default: ${DEFAULT_MODELS.join(',')})
  --max-attempts <number>     Maximum attempts per model (default: 5)
  --prompt <text>             Additional context prompt for the model
  --system <text>             System prompt for the model
  --ts-config <path>          Path to tsconfig.json
  --accept-first <boolean>    Stop after the first successful model (default: true)
  --report                    Write a markdown report to stdout instead of modifying files

create-mutaant options:
  --min-mutants <number>      Minimum number of mutations to introduce (default: 100)
  --error-codes <path>        JSON file listing desired TypeScript error codes
  --min-instances <number>    Minimum instances per error code (default: 5)
  --seed <number>             Seed for deterministic mutations (default: current time)
`;
}

// eslint-disable-next-line sonarjs/cognitive-complexity
function parseArgv(argv: string[]): ParsedArgs {
  const positional: string[] = [];
  const flags: Record<string, string | boolean> = {};

  for (let i = 0; i < argv.length; i += 1) {
    const raw = argv[i]!;
    if (raw.startsWith('--')) {
      const [keyPart, valuePart] = raw.split('=', 2);
      if (!keyPart) continue;
      const flag = keyPart.slice(2);
      if (!flag) continue;
      if (valuePart !== undefined) {
        flags[flag] = valuePart;
        continue;
      }
      const next = argv[i + 1];
      if (!next || next.startsWith('-')) {
        flags[flag] = 'true';
      } else {
        flags[flag] = next;
        i += 1;
      }
    } else if (raw.startsWith('-') && raw.length > 1) {
      const flagName = raw.slice(1);
      if (!flagName) continue;
      if (flagName.length > 1) {
        flags[flagName] = 'true';
      } else {
        const next = argv[i + 1];
        if (!next || next.startsWith('-')) {
          flags[flagName] = 'true';
        } else {
          flags[flagName] = next;
          i += 1;
        }
      }
    } else {
      positional.push(raw);
    }
  }

  return { positional, flags };
}

function parseModels(value: string | boolean | undefined): string[] {
  if (!value || typeof value !== 'string') return DEFAULT_MODELS;
  return value
    .split(',')
    .map((v) => v.trim())
    .filter((v) => v.length > 0);
}

function parseNumber(value: string | boolean | undefined, fallback: number): number {
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function parseBoolean(value: string | boolean | undefined, fallback: boolean): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value !== 'string') return fallback;
  const normalized = value.toLowerCase();
  if (normalized === 'true' || normalized === '1') return true;
  if (normalized === 'false' || normalized === '0') return false;
  return fallback;
}

function normalizeCommonFlags(parsed: ParsedArgs): CommonFlags {
  return {
    models: parseModels(parsed.flags.models ?? parsed.flags.m),
    maxAttempts: parseNumber(parsed.flags['max-attempts'], 5),
    prompt: typeof parsed.flags.prompt === 'string' ? parsed.flags.prompt : undefined,
    system: typeof parsed.flags.system === 'string' ? parsed.flags.system : undefined,
    tsconfig: typeof parsed.flags['ts-config'] === 'string' ? parsed.flags['ts-config'] : undefined,
    acceptFirst: parseBoolean(parsed.flags['accept-first'], true),
    report: parseBoolean(parsed.flags.report, false),
  };
}

function relativePath(p: string): string {
  return nodePath.relative(process.cwd(), p) || '.';
}

// eslint-disable-next-line sonarjs/cognitive-complexity
async function runModelsForFile(
  fixer: BuildFix,
  filePath: string,
  flags: CommonFlags,
  overrides: FixOverrides = {},
): Promise<ModelRun[]> {
  const models = flags.models.length > 0 ? flags.models : DEFAULT_MODELS;
  const runs: ModelRun[] = [];
  const fileContent = await fsp.readFile(filePath, 'utf-8').catch(() => '');
  const planDirBase = nodePath.join(
    WORKSPACE_ROOT,
    '.cache',
    'buildfix-cli',
    relativePath(filePath).replace(/[\\/]/g, '--'),
  );

  let firstSuccess: ModelRun | undefined;
  for (const model of models) {
    const result = await fixer.fixErrors(fileContent, {
      filePath,
      model,
      maxAttempts: flags.maxAttempts,
      tsconfig: flags.tsconfig ? nodePath.resolve(flags.tsconfig) : overrides.tsconfig,
      prompt: flags.prompt,
      system: flags.system,
      planDir: overrides.planDir ?? planDirBase,
    });
    const run: ModelRun = { model, result };
    runs.push(run);
    if (result.success && !firstSuccess) {
      firstSuccess = run;
      if (flags.acceptFirst) break;
    }
  }

  if (!flags.acceptFirst && firstSuccess) {
    // ensure successful result is last for downstream selection
    const idx = runs.indexOf(firstSuccess);
    if (idx >= 0 && idx !== runs.length - 1) {
      runs.splice(idx, 1);
      runs.push(firstSuccess);
    }
  }

  return runs;
}

async function handleFileCommand(parsed: ParsedArgs, flags: CommonFlags): Promise<void> {
  const [inputPath] = parsed.positional;
  if (!inputPath) {
    console.error('buildfix file: missing input path');
    process.exitCode = 1;
    return;
  }
  const rawOutputFlag = typeof parsed.flags.o === 'string' ? parsed.flags.o : parsed.flags.output;
  const outputPathRaw = typeof rawOutputFlag === 'string' ? rawOutputFlag : undefined;

  const sourcePath = nodePath.resolve(inputPath);
  const outputPath = outputPathRaw ? nodePath.resolve(outputPathRaw) : sourcePath;

  const fixer = new BuildFix();
  const runs = await runModelsForFile(fixer, sourcePath, flags, {
    tsconfig: flags.tsconfig ? nodePath.resolve(flags.tsconfig) : undefined,
  });

  if (flags.report) {
    const title = relativePath(sourcePath);
    process.stdout.write(`${renderReport(title, runs)}\n`);
    return;
  }

  const winningRun =
    runs.find((run) => run.result.success && run.result.finalContent) ??
    runs.find((run) => run.result.success) ??
    runs[runs.length - 1];

  if (!winningRun) {
    console.error('No runs executed.');
    process.exitCode = 1;
    return;
  }

  if (!winningRun.result.finalContent) {
    console.error('No fix content produced; nothing to write.');
    process.exitCode = 1;
    return;
  }

  await fsp.mkdir(nodePath.dirname(outputPath), { recursive: true });
  await fsp.writeFile(outputPath, winningRun.result.finalContent, 'utf-8');
  console.log(
    `buildfix: wrote ${relativePath(outputPath)} using model ${winningRun.model} (${winningRun.result.attemptDetails.length} attempt(s))`,
  );
}

// eslint-disable-next-line max-lines-per-function, complexity, sonarjs/cognitive-complexity
async function handleFolderCommand(parsed: ParsedArgs, flags: CommonFlags): Promise<void> {
  const [sourceDir] = parsed.positional;
  if (!sourceDir) {
    console.error('buildfix folder: missing source directory');
    process.exitCode = 1;
    return;
  }
  const rawOutputFlag = typeof parsed.flags.o === 'string' ? parsed.flags.o : parsed.flags.output;
  const outputDirRaw = typeof rawOutputFlag === 'string' ? rawOutputFlag : undefined;

  const sourcePath = nodePath.resolve(sourceDir);
  const outputPath = outputDirRaw ? nodePath.resolve(outputDirRaw) : sourcePath;

  if (outputPath !== sourcePath) {
    try {
      await fsp.access(outputPath);
      console.error(`Target folder ${relativePath(outputPath)} already exists.`);
      process.exitCode = 1;
      return;
    } catch {
      // ok
    }
    await fsp.mkdir(nodePath.dirname(outputPath), { recursive: true });
    await fsp.cp(sourcePath, outputPath, { recursive: true });
  }

  const globbed = await globby(['**/*.ts', '**/*.tsx', '!**/*.d.ts'], {
    cwd: outputPath,
    absolute: true,
    gitignore: true,
  });
  if (globbed.length === 0) {
    console.error('No TypeScript files found to mutate.');
    process.exitCode = 1;
    return;
  }

  const fixer = new BuildFix();
  const runsByFile: FolderRun[] = [];

  for (const file of globbed) {
    const fileRuns = await runModelsForFile(fixer, file, flags, {
      tsconfig: flags.tsconfig ? nodePath.resolve(flags.tsconfig) : undefined,
    });
    runsByFile.push({ filePath: file, runs: fileRuns });

    const winningRun =
      fileRuns.find((run) => run.result.success && run.result.finalContent) ??
      fileRuns.find((run) => run.result.success);
    if (!flags.report && winningRun?.result.finalContent) {
      await fsp.writeFile(file, winningRun.result.finalContent, 'utf-8');
      console.log(`buildfix: updated ${relativePath(file)} via ${winningRun.model}`);
    }
  }

  if (flags.report) {
    const sections: string[] = [];
    for (const entry of runsByFile) {
      sections.push(renderReport(relativePath(entry.filePath), entry.runs));
    }
    process.stdout.write(`${sections.join('\n\n')}\n`);
  }
}

// eslint-disable-next-line max-lines-per-function, sonarjs/cognitive-complexity
async function handleMutaantCommand(parsed: ParsedArgs): Promise<void> {

  const [sourceDir, targetDir] = parsed.positional;
  if (!sourceDir || !targetDir) {
    console.error('buildfix create-mutaant: expected <source-folder> <target-folder>');
    process.exitCode = 1;
    return;
  }

  const minMutants = parseNumber(parsed.flags['min-mutants'], 100);
  const minInstances = parseNumber(parsed.flags['min-instances'], 5);
  const seed = parseNumber(parsed.flags.seed, Date.now());
  const errorCodesFlag = parsed.flags['error-codes'];
  const errorCodesPath = typeof errorCodesFlag === 'string' ? nodePath.resolve(errorCodesFlag) : undefined;

  let codes: string[];
  if (errorCodesPath) {
    try {
      const raw = await fsp.readFile(errorCodesPath, 'utf-8');
      const parsedValue: unknown = JSON.parse(raw);
      if (!Array.isArray(parsedValue)) throw new Error('error codes file must be an array of strings');
      const normalized = parsedValue as unknown[];
      codes = normalized.map((code) => String(code).toUpperCase());
    } catch (error) {
      console.error(`Failed to read error codes file: ${error instanceof Error ? error.message : String(error)}`);
      process.exitCode = 1;
      return;
    }
  } else {
    codes = ['TS2304', 'TS2322', 'TS2339', 'TS2345'];
  }

  if (codes.length === 0) {
    console.error('No error codes provided for mutation.');
    process.exitCode = 1;
    return;
  }

  const sourcePath = nodePath.resolve(sourceDir);
  const targetPath = nodePath.resolve(targetDir);

  try {
    const tsconfigFlag = parsed.flags['ts-config'];
    const result = await createMutaant({
      sourcePath,
      targetPath,
      minMutants,
      minInstances,
      seed,
      errorCodes: codes,
      tsconfigOverride: typeof tsconfigFlag === 'string' ? nodePath.resolve(tsconfigFlag) : undefined,
    });
    console.log(`create-mutaant: generated ${result.totalMutants} mutations in ${relativePath(targetPath)}`);
    for (const code of codes) {
      console.log(`  - ${code}: ${result.counts.get(code) ?? 0}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`create-mutaant failed: ${message}`);
    process.exitCode = 1;
  }
}

async function main(): Promise<void> {
  const [, , commandRaw, ...rest] = process.argv;
  if (!commandRaw || commandRaw === '--help' || commandRaw === '-h') {
    process.stdout.write(usage());
    return;
  }

  const command = commandRaw.toLowerCase();
  const parsed = parseArgv(rest);

  switch (command) {
    case 'file': {
      const flags = normalizeCommonFlags(parsed);
      await handleFileCommand(parsed, flags);
      break;
    }
    case 'folder': {
      const flags = normalizeCommonFlags(parsed);
      await handleFolderCommand(parsed, flags);
      break;
    }
    case 'create-mutaant':
    case 'mutaant': {
      await handleMutaantCommand(parsed);
      break;
    }
    default: {
      console.error(`Unknown command: ${command}`);
      process.exitCode = 1;
      process.stdout.write(usage());
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
