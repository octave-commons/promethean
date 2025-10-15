// import * as path from "path";
// import { exec } from "child_process";
// import { promisify } from "util";
// import { promises as fs } from "fs";
// import matter from "gray-matter";
// import { openLevelCache, type Cache } from "@promethean/level-cache";
// import {
  cosine,
  parseArgs,
  ollamaEmbed,
  writeText,
  createLogger,
} from "@promethean/utils";

// import { listTaskFiles } from "./utils.js";
// import type { RepoDoc, Embeddings, TaskContext } from "./types.js";

const execAsync = promisify(exec);
const logger = createLogger({ service: "boardrev-enhanced" });

interface BuildTestResult {
  taskFile: string;
  affectedFiles: string[];
  buildResult?: {
    success: boolean;
    output: string;
    errors: string[];
  };
  testResult?: {
    success: boolean;
    output: string;
    failedTests: string[];
  };
  lintResult?: {
    success: boolean;
    output: string;
    warnings: string[];
    errors: string[];
  };
}

// Extract file paths from task content using various patterns
function extractFilePaths(taskContent: string): string[] {
  const filePaths: string[] = [];

  // Pattern 1: Files mentioned in backticks or code blocks
  const codeBlockPattern = /(?:`[^`]+`)|(?:```[\s\S]*?```)/g;
  const codeMatches = taskContent.match(codeBlockPattern) || [];
  for (const match of codeMatches) {
    const clean = match.replace(/`/g, '');
    if (clean.includes('/') && clean.includes('.')) {
      filePaths.push(clean);
    }
  }

  // Pattern 2: Package references
  const packagePattern = /@promethean\/([a-z-]+)/g;
  const packageMatches = taskContent.match(packagePattern) || [];
  for (const pkg of packageMatches) {
    filePaths.push(`packages/${pkg.replace('@promethean/', '')}`);
  }

  // Pattern 3: Explicit file paths in text
  const filePathPattern = /packages\/[^\s\)]+/g;
  const pathMatches = taskContent.match(filePathPattern) || [];
  filePaths.push(...pathMatches);

  // Pattern 4: Service references
  const servicePattern = /services\/([a-z-]+)/g;
  const serviceMatches = taskContent.match(servicePattern) || [];
  for (const service of serviceMatches) {
    filePaths.push(service);
  }

  return [...new Set(filePaths)]; // Deduplicate
}

// Run build command on specific files or packages
async function runBuild(affectedFiles: string[]): Promise<BuildTestResult['buildResult']> {
  if (affectedFiles.length === 0) return undefined;

  try {
    logger.info(`Running build on affected files: ${affectedFiles.join(', ')}`);

    // Try to build specific packages first
    const packageFiles = affectedFiles.filter(f => f.startsWith('packages/'));
    if (packageFiles.length > 0) {
      const packages = [...new Set(packageFiles.map(f => f.split('/')[1]))];
      for (const pkg of packages) {
        try {
          const { stdout, stderr } = await execAsync(`pnpm --filter @promethean/${pkg} build`, {
            timeout: 60000,
            cwd: process.cwd()
          });

          if (stderr && !stdout) {
            return {
              success: false,
              output: stderr,
              errors: [stderr]
            };
          }

          return {
            success: true,
            output: stdout,
            errors: []
          };
        } catch (error) {
          return {
            success: false,
            output: (error as any).stdout || (error as any).stderr || 'Build failed',
            errors: [(error as Error).message]
          };
        }
      }
    }

    // Fallback to general build
    const { stdout, stderr } = await execAsync('pnpm build', {
      timeout: 120000,
      cwd: process.cwd()
    });

    return {
      success: !stderr,
      output: stdout + (stderr ? '\nSTDERR:\n' + stderr : ''),
      errors: stderr ? [stderr] : []
    };

  } catch (error) {
    return {
      success: false,
      output: (error as any).stdout || (error as any).stderr || 'Build command failed',
      errors: [(error as Error).message]
    };
  }
}

// Run tests on specific files or packages
async function runTests(affectedFiles: string[]): Promise<BuildTestResult['testResult']> {
  if (affectedFiles.length === 0) return undefined;

  try {
    logger.info(`Running tests on affected files: ${affectedFiles.join(', ')}`);

    const packageFiles = affectedFiles.filter(f => f.startsWith('packages/'));
    if (packageFiles.length > 0) {
      const packages = [...new Set(packageFiles.map(f => f.split('/')[1]))];
      for (const pkg of packages) {
        try {
          const { stdout, stderr } = await execAsync(`pnpm --filter @promethean/${pkg} test`, {
            timeout: 120000,
            cwd: process.cwd()
          });

          const failedTests: string[] = [];
          if (stderr) {
            const testFailures = stderr.match(/❌.*|FAIL.*|✗.*/g) || [];
            failedTests.push(...testFailures);
          }

          return {
            success: !failedTests.length,
            output: stdout + (stderr ? '\nSTDERR:\n' + stderr : ''),
            failedTests
          };
        } catch (error) {
          return {
            success: false,
            output: (error as any).stdout || (error as any).stderr || 'Test command failed',
            failedTests: [(error as Error).message]
          };
        }
      }
    }

    // Fallback to general test
    const { stdout, stderr } = await execAsync('pnpm test:unit', {
      timeout: 180000,
      cwd: process.cwd()
    });

    const failedTests: string[] = [];
    if (stderr) {
      const testFailures = stderr.match(/❌.*|FAIL.*|✗.*/g) || [];
      failedTests.push(...testFailures);
    }

    return {
      success: !failedTests.length,
      output: stdout + (stderr ? '\nSTDERR:\n' + stderr : ''),
      failedTests
    };

  } catch (error) {
    return {
      success: false,
      output: (error as any).stdout || (error as any).stderr || 'Test command failed',
      failedTests: [(error as Error).message]
    };
  }
}

// Run lint on specific files or packages
async function runLint(affectedFiles: string[]): Promise<BuildTestResult['lintResult']> {
  if (affectedFiles.length === 0) return undefined;

  try {
    logger.info(`Running lint on affected files: ${affectedFiles.join(', ')}`);

    const packageFiles = affectedFiles.filter(f => f.startsWith('packages/'));
    if (packageFiles.length > 0) {
      const packages = [...new Set(packageFiles.map(f => f.split('/')[1]))];
      for (const pkg of packages) {
        try {
          const { stdout, stderr } = await execAsync(`pnpm --filter @promethean/${pkg} lint`, {
            timeout: 60000,
            cwd: process.cwd()
          });

          const warnings: string[] = [];
          const errors: string[] = [];

          if (stderr) {
            const lintErrors = stderr.match(/error.*|Error.*/gi) || [];
            const lintWarnings = stderr.match(/warning.*|Warning.*/gi) || [];
            errors.push(...lintErrors);
            warnings.push(...lintWarnings);
          }

          return {
            success: errors.length === 0,
            output: stdout + (stderr ? '\nSTDERR:\n' + stderr : ''),
            warnings,
            errors
          };
        } catch (error) {
          return {
            success: false,
            output: (error as any).stdout || (error as any).stderr || 'Lint command failed',
            warnings: [],
            errors: [(error as Error).message]
          };
        }
      }
    }

    return {
      success: true,
      output: 'No lint issues found',
      warnings: [],
      errors: []
    };

  } catch (error) {
    return {
      success: false,
      output: (error as any).stdout || (error as any).stderr || 'Lint command failed',
      warnings: [],
      errors: [(error as Error).message]
    };
  }
}

// Enhanced context matching with build/test/lint results
export async function matchEnhancedContext({
  tasks,
  cache,
  embedModel,
  k,
  out,
  runBuildTests = false,
}: Readonly<{
  tasks: string;
  cache: string;
  embedModel: string;
  k: number;
  out: string;
  runBuildTests?: boolean;
}>): Promise<void> {
  const tasksDir = path.resolve(tasks);
  const files = await listTaskFiles(tasksDir);
  const db = await openLevelCache<unknown>({
    path: path.resolve(cache),
  });
  const docCache = db.withNamespace("idx") as Cache<RepoDoc>;
  const embCache = db.withNamespace("emb") as Cache<number[]>;
  const repoIndex: RepoDoc[] = [];
  const repoEmb: Embeddings = {};

  for await (const [p, d] of docCache.entries()) {
    repoIndex.push(d);
    const v = await embCache.get(p);
    if (v) repoEmb[p] = v;
  }

  const outData: TaskContext[] = [];
  const buildTestResults: BuildTestResult[] = [];

  for (const f of files) {
    const raw = await fs.readFile(f, "utf-8");
    const gm = matter(raw);

    // Extract affected files from task content
    const affectedFiles = extractFilePaths(gm.content || '');

    let buildTestResult: BuildTestResult | undefined;
    if (runBuildTests && affectedFiles.length > 0) {
      logger.info(`Processing task ${path.basename(f)} with affected files: ${affectedFiles.join(', ')}`);

      // Run build, tests, and lint in parallel
      const [buildResult, testResult, lintResult] = await Promise.all([
        runBuild(affectedFiles),
        runTests(affectedFiles),
        runLint(affectedFiles)
      ]);

      buildTestResult = {
        taskFile: f.replace(/\\/g, "/"),
        affectedFiles,
        buildResult,
        testResult,
        lintResult
      };

      buildTestResults.push(buildTestResult);
    }

    // Enhanced text for embedding includes build/test results
    const enhancedText = [
      `TITLE: ${gm.data?.title ?? ""}`,
      `STATUS: ${gm.data?.status ?? ""}  PRIORITY: ${gm.data?.priority ?? ""}`,
      gm.content,
      buildTestResult ? buildTestResult.buildResult?.output || '' : '',
      buildTestResult ? buildTestResult.testResult?.output || '' : '',
      buildTestResult ? buildTestResult.lintResult?.output || '' : '',
    ].join("\n").trim();

    const vec = await ollamaEmbed(embedModel, enhancedText);

    const scored: Array<{path: string; kind: 'code' | 'doc' | 'test-results'; excerpt: string; score: number}> = repoIndex
      .map((d) => ({
        path: d.path,
        kind: d.kind as 'code' | 'doc',
        excerpt: d.excerpt,
        score: cosine(vec, repoEmb[d.path] ?? []),
      }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, k);

    const links = Array.from(raw.matchAll(/\[[^\]]*?\]\(([^)]+)\)/g))
      .map((m) => m[1])
      .filter((x): x is string => Boolean(x));

    // Add build/test results to context hits if available
    if (buildTestResult) {
      const buildTestHit: {path: string; kind: 'code' | 'doc' | 'test-results'; excerpt: string; score: number} = {
        path: `${buildTestResult.taskFile}:build-test-results`,
        kind: 'test-results',
        excerpt: [
          `Build: ${buildTestResult.buildResult?.success ? '✅ PASSED' : '❌ FAILED'}`,
          `Tests: ${buildTestResult.testResult?.success ? '✅ PASSED' : '❌ FAILED'}`,
          `Lint: ${buildTestResult.lintResult?.success ? '✅ PASSED' : '❌ FAILED'}`,
          '',
          `Affected Files: ${buildTestResult.affectedFiles.join(', ')}`,
          buildTestResult.buildResult?.errors.length ? `Build Errors: ${buildTestResult.buildResult.errors.join('; ')}` : '',
          buildTestResult.testResult?.failedTests.length ? `Failed Tests: ${buildTestResult.testResult.failedTests.join('; ')}` : '',
          buildTestResult.lintResult?.errors.length ? `Lint Errors: ${buildTestResult.lintResult.errors.join('; ')}` : '',
        ].filter(Boolean).join('\n'),
        score: 0.9, // High score for build/test results
      };
      scored.unshift(buildTestHit);
    }

    outData.push({ taskFile: f.replace(/\\/g, "/"), hits: scored, links });
  }

  // Write enhanced context data
  const outputData = {
    contexts: outData,
    buildTestResults: runBuildTests ? buildTestResults : undefined,
  };

  await writeText(
    path.resolve(out),
    JSON.stringify(outputData, null, 2),
  );
  await db.close();

  logger.info(`boardrev: enhanced context matched for ${outData.length} task(s)${runBuildTests ? ` with build/test results for ${buildTestResults.length} task(s)` : ''}`);
}

if (// import.meta.main) {
  const args = parseArgs({
    "--tasks": "docs/agile/tasks",
    "--cache": ".cache/boardrev/repo-cache",
    "--embed-model": "nomic-embed-text:latest",
    "--k": "8",
    "--out": ".cache/boardrev/enhanced-context.json",
    "--run-build-tests": "false",
  });

  matchEnhancedContext({
    tasks: args["--tasks"],
    cache: args["--cache"],
    embedModel: args["--embed-model"],
    k: Number(args["--k"]),
    out: args["--out"],
    runBuildTests: args["--run-build-tests"] === "true",
  }).catch((e) => {
    logger.error((e as Error).message);
    process.exit(1);
  });
}