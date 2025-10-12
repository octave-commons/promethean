import * as nodePath from 'path';
import * as fsp from 'node:fs/promises';

import { Project } from 'ts-morph';

type MutationHandler = (ctx: MutationContext, file: string, id: number) => void;

type MutationContext = {
  readonly project: Project;
  readonly files: string[];
};

const MUTATION_STRATEGIES: Record<string, MutationHandler> = {
  TS2304: ({ project }, file, id) => {
    const sf = project.getSourceFileOrThrow(file);
    sf.addStatements(`const __mutant_${id} = MissingIdentifier_${id};`);
  },
  TS2322: ({ project }, file, id) => {
    const sf = project.getSourceFileOrThrow(file);
    sf.addStatements(`const __mutant_assign_${id}: string = ${id};`);
  },
  TS2339: ({ project }, file, id) => {
    const sf = project.getSourceFileOrThrow(file);
    sf.addStatements(
      `const __mutant_obj_${id}: { readonly value?: number } = {};
const __mutant_prop_${id} = __mutant_obj_${id}.missingProp_${id};`,
    );
  },
  TS2345: ({ project }, file, id) => {
    const sf = project.getSourceFileOrThrow(file);
    sf.addStatements(
      `function __mutant_arg_${id}(value: string) { return value.length; }
__mutant_arg_${id}(${id});`,
    );
  },
  TS2554: ({ project }, file, id) => {
    const sf = project.getSourceFileOrThrow(file);
    sf.addStatements(`function __mutant_call_${id}(value: number) { return value; }
__mutant_call_${id}();`);
  },
  TS7006: ({ project }, file, id) => {
    const sf = project.getSourceFileOrThrow(file);
    sf.addStatements(`function __mutant_param_${id}(param) { return param; }
__mutant_param_${id}(${id});`);
  },
};

function ensureStrategy(code: string): MutationHandler {
  const handler = (MUTATION_STRATEGIES as Record<string, MutationHandler | undefined>)[code];
  return (handler ?? MUTATION_STRATEGIES.TS2304) as MutationHandler;
}

function createRng(seed: number): () => number {
  let state = seed % 2147483647;
  if (state <= 0) state += 2147483646;
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

function chooseRandom<T>(values: readonly T[], rng: () => number): T {
  const idx = Math.max(0, Math.min(values.length - 1, Math.floor(rng() * values.length)));
  return values[idx]!;
}

export type MutaantOptions = {
  readonly sourcePath: string;
  readonly targetPath: string;
  readonly minMutants: number;
  readonly minInstances: number;
  readonly seed: number;
  readonly errorCodes: readonly string[];
  readonly tsconfigOverride?: string;
};

export type MutaantResult = {
  readonly totalMutants: number;
  readonly counts: Map<string, number>;
};

// eslint-disable-next-line max-lines-per-function
export async function createMutaant(options: MutaantOptions): Promise<MutaantResult> {
  const {
    sourcePath,
    targetPath,
    minMutants,
    minInstances,
    seed,
    errorCodes,
    tsconfigOverride,
  } = options;

  try {
    await fsp.access(targetPath);
    throw new Error(`Target directory already exists: ${targetPath}`);
  } catch {
    // ok when target doesn't exist
  }

  await fsp.mkdir(nodePath.dirname(targetPath), { recursive: true });
  await fsp.cp(sourcePath, targetPath, { recursive: true });

  const tsconfigPath = tsconfigOverride ?? nodePath.join(targetPath, 'tsconfig.json');
  try {
    await fsp.access(tsconfigPath);
  } catch {
    throw new Error(`tsconfig.json not found at ${tsconfigPath}`);
  }

  const project = new Project({ tsConfigFilePath: tsconfigPath });
  const sourceFiles = project
    .getSourceFiles()
    .map((sf) => sf.getFilePath())
    .filter((file) => (file.endsWith('.ts') || file.endsWith('.tsx')) && !file.endsWith('.d.ts'));

  if (sourceFiles.length === 0) {
    throw new Error('No TypeScript source files found to mutate.');
  }

  const codes = errorCodes.length > 0 ? [...new Set(errorCodes)] : ['TS2304'];
  const counts = new Map<string, number>();
  for (const code of codes) counts.set(code, 0);

  const rng = createRng(seed);
  const strategyContext: MutationContext = { project, files: sourceFiles };

  const outstanding = (): string[] => {
    const unmetCodes = codes.filter((code) => (counts.get(code) ?? 0) < minInstances);
    if (unmetCodes.length > 0) return unmetCodes;
    if (Array.from(counts.values()).reduce((acc, value) => acc + value, 0) < minMutants) return codes;
    return [];
  };

  let totalMutants = 0;
  let iteration = 0;
  const MAX_ITERATIONS = Math.max(minMutants * 20, 200);

  while (outstanding().length > 0) {
    iteration += 1;
    if (iteration > MAX_ITERATIONS) break;
    const remaining = outstanding();
    if (remaining.length === 0) break;
    const code = chooseRandom(remaining, rng);
    const file = chooseRandom(sourceFiles, rng);
    const handler = ensureStrategy(code);
    handler(strategyContext, file, totalMutants + 1);
    counts.set(code, (counts.get(code) ?? 0) + 1);
    totalMutants += 1;
  }

  await project.save();

  return { totalMutants, counts };
}
