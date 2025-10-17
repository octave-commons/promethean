#!/usr/bin/env node

import * as nodePath from 'path';
import process from 'node:process';
import * as fsp from 'node:fs/promises';

import { Command } from 'commander';
import { globby } from 'globby';

import { BuildFix, type FixResult } from './buildfix.js';
import { WORKSPACE_ROOT } from './utils.js';
import { renderReport } from './report.js';
import { createMutaant } from './mutaant.js';

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

function relativePath(p: string): string {
  return nodePath.relative(process.cwd(), p) || '.';
}

async function runModelsForFile(
  fixer: BuildFix,
  filePath: string,
  options: any,
  overrides: FixOverrides = {},
): Promise<ModelRun[]> {
  const models = options.models.length > 0 ? options.models : DEFAULT_MODELS;
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
      maxAttempts: options.maxAttempts,
      tsconfig: options.tsConfig ? nodePath.resolve(options.tsConfig) : overrides.tsconfig,
      prompt: options.prompt,
      system: options.system,
      planDir: overrides.planDir ?? planDirBase,
    });
    const run: ModelRun = { model, result };
    runs.push(run);
    if (result.success && !firstSuccess) {
      firstSuccess = run;
      if (options.acceptFirst) break;
    }
  }

  if (!options.acceptFirst && firstSuccess) {
    // ensure successful result is last for downstream selection
    const idx = runs.indexOf(firstSuccess);
    if (idx >= 0 && idx !== runs.length - 1) {
      runs.splice(idx, 1);
      runs.push(firstSuccess);
    }
  }

  return runs;
}

async function handleFileCommand(inputPath: string, options: any): Promise<void> {
  const sourcePath = nodePath.resolve(inputPath);
  const outputPath = options.output ? nodePath.resolve(options.output) : sourcePath;

  const fixer = new BuildFix();
  const runs = await runModelsForFile(fixer, sourcePath, options, {
    tsconfig: options.tsConfig ? nodePath.resolve(options.tsConfig) : undefined,
  });

  if (options.report) {
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

async function handleFolderCommand(sourceDir: string, options: any): Promise<void> {
  const sourcePath = nodePath.resolve(sourceDir);
  const outputPath = options.output ? nodePath.resolve(options.output) : sourcePath;

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
    const fileRuns = await runModelsForFile(fixer, file, options, {
      tsconfig: options.tsConfig ? nodePath.resolve(options.tsConfig) : undefined,
    });
    runsByFile.push({ filePath: file, runs: fileRuns });

    const winningRun =
      fileRuns.find((run) => run.result.success && run.result.finalContent) ??
      fileRuns.find((run) => run.result.success);
    if (!options.report && winningRun?.result.finalContent) {
      await fsp.writeFile(file, winningRun.result.finalContent, 'utf-8');
      console.log(`buildfix: updated ${relativePath(file)} via ${winningRun.model}`);
    }
  }

  if (options.report) {
    const sections: string[] = [];
    for (const entry of runsByFile) {
      sections.push(renderReport(relativePath(entry.filePath), entry.runs));
    }
    process.stdout.write(`${sections.join('\n\n')}\n`);
  }
}

async function handleMutaantCommand(
  sourceDir: string,
  targetDir: string,
  options: any,
): Promise<void> {
  let codes: string[];
  if (options.errorCodes) {
    try {
      const raw = await fsp.readFile(nodePath.resolve(options.errorCodes), 'utf-8');
      const parsedValue: unknown = JSON.parse(raw);
      if (!Array.isArray(parsedValue))
        throw new Error('error codes file must be an array of strings');
      const normalized = parsedValue as unknown[];
      codes = normalized.map((code) => String(code).toUpperCase());
    } catch (error) {
      console.error(
        `Failed to read error codes file: ${error instanceof Error ? error.message : String(error)}`,
      );
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
    const result = await createMutaant({
      sourcePath,
      targetPath,
      minMutants: options.minMutants,
      minInstances: options.minInstances,
      seed: options.seed,
      errorCodes: codes,
      tsconfigOverride: options.tsConfig ? nodePath.resolve(options.tsConfig) : undefined,
    });
    console.log(
      `create-mutaant: generated ${result.totalMutants} mutations in ${relativePath(targetPath)}`,
    );
    for (const code of codes) {
      console.log(`  - ${code}: ${result.counts.get(code) ?? 0}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`create-mutaant failed: ${message}`);
    process.exitCode = 1;
  }
}

const program = new Command();

program.name('buildfix').description('Automated TypeScript error fixing CLI').version('0.1.0');

program
  .command('file')
  .description('Fix errors in a single TypeScript file')
  .argument('<input>', 'Input file path')
  .option('-o, --output <path>', 'Output file path')
  .option(
    '-m, --models <list>',
    `Comma-separated list of models to try (default: ${DEFAULT_MODELS.join(',')})`,
    DEFAULT_MODELS.join(','),
  )
  .option('--max-attempts <number>', 'Maximum attempts per model', '5')
  .option('--prompt <text>', 'Additional context prompt for the model')
  .option('--system <text>', 'System prompt for the model')
  .option('--ts-config <path>', 'Path to tsconfig.json')
  .option('--accept-first <boolean>', 'Stop after the first successful model', 'true')
  .option('--report', 'Write a markdown report to stdout instead of modifying files')
  .action(handleFileCommand);

program
  .command('folder')
  .description('Fix errors in all TypeScript files in a folder')
  .argument('<source>', 'Source directory path')
  .option('-o, --output <path>', 'Output directory path')
  .option(
    '-m, --models <list>',
    `Comma-separated list of models to try (default: ${DEFAULT_MODELS.join(',')})`,
    DEFAULT_MODELS.join(','),
  )
  .option('--max-attempts <number>', 'Maximum attempts per model', '5')
  .option('--prompt <text>', 'Additional context prompt for the model')
  .option('--system <text>', 'System prompt for the model')
  .option('--ts-config <path>', 'Path to tsconfig.json')
  .option('--accept-first <boolean>', 'Stop after the first successful model', 'true')
  .option('--report', 'Write a markdown report to stdout instead of modifying files')
  .action(handleFolderCommand);

program
  .command('create-mutaant')
  .alias('mutaant')
  .description('Create a mutant version of a TypeScript project with injected errors')
  .argument('<source-folder>', 'Source folder path')
  .argument('<target-folder>', 'Target folder path')
  .option('--min-mutants <number>', 'Minimum number of mutations to introduce', '100')
  .option('--error-codes <path>', 'JSON file listing desired TypeScript error codes')
  .option('--min-instances <number>', 'Minimum instances per error code', '5')
  .option('--seed <number>', 'Seed for deterministic mutations', String(Date.now()))
  .option('--ts-config <path>', 'Path to tsconfig.json')
  .action(handleMutaantCommand);

program.parse();
