import { promises as fs } from 'fs';
import path from 'path';
import matter from 'gray-matter';
import type { Task } from './types.js';
import { ollamaJSON, createLogger, type LogFields } from '@promethean/utils';
import { z } from 'zod';

const logger = createLogger({ service: 'task-complexity-estimator' });

const toErrorFields = (error: unknown): LogFields => {
  if (error instanceof Error) {
    return {
      errorName: error.name,
      errorMessage: error.message,
      errorStack: error.stack,
    };
  }
  return { error };
};

const ensureString = (value: unknown): string | undefined => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.length > 0) {
      return trimmed;
    }
  }
  return undefined;
};

const ensurePriority = (value: unknown): string | number | undefined => {
  if (typeof value === 'number') {
    return value;
  }
  return ensureString(value);
};

const ensureLabels = (value: unknown): string[] | undefined => {
  if (Array.isArray(value)) {
    const normalized = value
      .map((entry) => ensureString(entry) ?? String(entry ?? '').trim())
      .filter((entry): entry is string => entry.length > 0);
    return normalized.length > 0 ? normalized : undefined;
  }
  if (typeof value === 'string') {
    const normalized = value
      .split(/[,\s]+/)
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0);
    return normalized.length > 0 ? normalized : undefined;
  }
  return undefined;
};

const slugFromFileName = (fileName: string): string => fileName.replace(/\.(md|json)$/i, '');

const readTasksFromDirectory = async (dir: string): Promise<Task[]> => {
  let entries: string[] = [];
  try {
    entries = await fs.readdir(dir);
  } catch (error) {
    logger.warn(`Unable to read tasks directory ${dir}`, {
      directory: dir,
      ...toErrorFields(error),
    });
    return [];
  }

  const tasks: Task[] = [];

  for (const entry of entries) {
    const filePath = path.join(dir, entry);
    if (entry.toLowerCase().endsWith('.json')) {
      try {
        const raw = await fs.readFile(filePath, 'utf8');
        const data = JSON.parse(raw) as Record<string, unknown>;
        const uuid = ensureString(data.uuid);
        if (!uuid) {
          logger.warn('Skipping JSON task without uuid', { filePath });
          continue;
        }
        const title = ensureString(data.title) ?? slugFromFileName(entry);
        const labels = ensureLabels(data.labels);
        const priority = ensurePriority(data.priority);
        const status = ensureString(data.status) ?? 'todo';
        const createdAt = ensureString(data.created_at);
        const content = ensureString(data.content);
        tasks.push({
          uuid,
          title,
          status,
          priority,
          labels,
          created_at: createdAt,
          content,
          slug: slugFromFileName(entry),
          sourcePath: filePath,
        });
      } catch (error) {
        logger.warn(`Failed to parse JSON task ${filePath}`, {
          filePath,
          ...toErrorFields(error),
        });
      }
      continue;
    }

    if (!entry.toLowerCase().endsWith('.md')) {
      continue;
    }

    let raw: string;
    try {
      raw = await fs.readFile(filePath, 'utf8');
    } catch (error) {
      logger.warn(`Failed to read markdown task ${filePath}`, {
        filePath,
        ...toErrorFields(error),
      });
      continue;
    }

    try {
      const parsed = matter(raw);
      const frontmatter = parsed.data as Record<string, unknown>;
      const uuid = ensureString(frontmatter.uuid);
      if (!uuid) {
        logger.warn('Skipping markdown task without uuid', { filePath });
        continue;
      }
      const title = ensureString(frontmatter.title) ?? slugFromFileName(entry);
      const labels = ensureLabels(frontmatter.labels);
      const priority = ensurePriority(frontmatter.priority);
      const status = ensureString(frontmatter.status) ?? 'todo';
      const createdAt = ensureString(frontmatter.created_at);
      tasks.push({
        uuid,
        title,
        status,
        priority,
        labels,
        created_at: createdAt,
        content: parsed.content,
        slug: slugFromFileName(entry),
        sourcePath: filePath,
      });
    } catch (error) {
      logger.warn(`Failed to parse markdown task ${filePath}`, {
        filePath,
        ...toErrorFields(error),
      });
      const fallback = recoverTaskFromMalformedMarkdown(
        raw,
        filePath,
        slugFromFileName(entry),
      );
      if (fallback) {
        tasks.push(fallback);
      }
    }
  }

  return tasks;
};

const recoverTaskFromMalformedMarkdown = (
  raw: string,
  filePath: string,
  slug: string,
): Task | null => {
  const frontmatterMatch = raw.match(/^---\s*[\r\n]+([\s\S]*?)[\r\n]+---\s*/);
  if (!frontmatterMatch) {
    return null;
  }
  const frontmatter = frontmatterMatch[1];
  if (!frontmatter) {
    return null;
  }
  const body = raw.slice(frontmatterMatch[0].length).trim();

  const getValue = (key: string): string | undefined => {
    const pattern = new RegExp(`^\s*${key}\s*:\\s*(.+)$`, 'im');
    const match = frontmatter.match(pattern);
    if (!match || match[1] == null) {
      return undefined;
    }
    return match[1].trim().replace(/^['"]|['"]$/g, '');
  };

  const uuid = ensureString(getValue('uuid'));
  if (!uuid) {
    return null;
  }

  const title = ensureString(getValue('title')) ?? slug;
  const status = ensureString(getValue('status')) ?? 'todo';
  const priority = ensurePriority(getValue('priority'));
  const labels = ensureLabels(getValue('labels'));
  const createdAt = ensureString(getValue('created_at'));

  return {
    uuid,
    title,
    status,
    priority,
    labels,
    created_at: createdAt,
    content: body.length > 0 ? body : undefined,
    slug,
    sourcePath: filePath,
  };
};

/**
 * Task complexity factors to consider
 */
interface ComplexityFactors {
  /** Lines of code estimated to be touched */
  locImpact: number;
  /** Number of files that need modification */
  fileCount: number;
  /** Technical complexity (1-5 scale) */
  technicalComplexity: number;
  /** Research/learning required (1-5 scale) */
  researchComplexity: number;
  /** Testing complexity (1-5 scale) */
  testingComplexity: number;
  /** Integration complexity with other systems (1-5 scale) */
  integrationComplexity: number;
  /** Estimated time in hours */
  estimatedHours: number;
  /** Whether task requires human judgment/creativity */
  requiresHumanJudgment: boolean;
  /** Whether task has clear acceptance criteria */
  hasClearAcceptanceCriteria: boolean;
  /** Whether task involves external dependencies/APIs */
  hasExternalDependencies: boolean;
}

/**
 * Complexity estimation result
 */
interface ComplexityEstimate {
  taskId: string;
  taskTitle: string;
  factors: ComplexityFactors;
  overallScore: number; // 1-10 scale
  complexityLevel: 'simple' | 'moderate' | 'complex' | 'expert';
  suitableForLocalModel: boolean;
  recommendedModel: string | null;
  reasoning: string;
  breakdownSteps: string[];
  estimatedTokens: number;
}

const ComplexitySchema = z.object({
  locImpact: z.number().min(0),
  fileCount: z.number().min(0),
  technicalComplexity: z.number().min(1).max(5),
  researchComplexity: z.number().min(1).max(5),
  testingComplexity: z.number().min(1).max(5),
  integrationComplexity: z.number().min(1).max(5),
  estimatedHours: z.number().min(0.25),
  requiresHumanJudgment: z.boolean(),
  hasClearAcceptanceCriteria: z.boolean(),
  hasExternalDependencies: z.boolean(),
  overallScore: z.number().min(1).max(10),
  complexityLevel: z.enum(['simple', 'moderate', 'complex', 'expert']),
  suitableForLocalModel: z.boolean(),
  recommendedModel: z.string().nullable(),
  reasoning: z.string(),
  breakdownSteps: z.array(z.string()),
  estimatedTokens: z.number().min(0),
});

type ComplexityResult = z.infer<typeof ComplexitySchema>;

/**
 * Analyze task content and title to estimate complexity factors
 */
function analyzeTaskContent(task: Task): ComplexityFactors {
  const title = task.title.toLowerCase();
  const content = (task.content || '').toLowerCase();
  const labels = task.labels || [];
  const fullText = `${title} ${content} ${labels.join(' ')}`;

  // Count indicators of complexity
  const fileIndicators = /\.(ts|js|tsx|jsx|py|rs|go|java|cpp|c|md|yaml|json|toml)/g;
  const complexityIndicators = [
    'test',
    'spec',
    'mock',
    'stub',
    'fixture',
    'refactor',
    'rewrite',
    'migrate',
    'upgrade',
    'integrate',
    'connect',
    'bridge',
    'api',
    'service',
    'architecture',
    'design',
    'pattern',
    'framework',
    'performance',
    'optimization',
    'cache',
    'async',
    'security',
    'auth',
    'crypto',
    'validation',
    'database',
    'schema',
    'migration',
    'query',
  ];

  const highComplexityIndicators = [
    'architecture',
    'rewrite',
    'migration',
    'performance',
    'security',
    'database schema',
    'api design',
    'framework',
  ];

  const lowComplexityIndicators = [
    'fix typo',
    'update doc',
    'add comment',
    'format',
    'lint',
    'simple',
    'minor',
    'trivial',
    'quick',
    'small',
  ];

  // Estimate file count
  const fileMatches = fullText.match(fileIndicators) || [];
  const fileCount = Math.max(1, fileMatches.length + (fullText.includes('file') ? 1 : 0));

  // Estimate LOC impact based on patterns
  let locImpact = 10; // baseline

  if (fullText.includes('test') || fullText.includes('spec')) {
    locImpact += 50;
  }
  if (fullText.includes('refactor') || fullText.includes('rewrite')) {
    locImpact += 200;
  }
  if (fullText.includes('add') || fullText.includes('create')) {
    locImpact += 30;
  }
  if (fullText.includes('fix') || fullText.includes('update')) {
    locImpact += 20;
  }
  if (fullText.includes('remove') || fullText.includes('delete')) {
    locImpact += 15;
  }

  // Calculate complexity scores
  const complexityScore = complexityIndicators.filter((indicator) =>
    fullText.includes(indicator),
  ).length;

  const highComplexityScore = highComplexityIndicators.filter((indicator) =>
    fullText.includes(indicator),
  ).length;

  const lowComplexityScore = lowComplexityIndicators.filter((indicator) =>
    fullText.includes(indicator),
  ).length;

  const technicalComplexity = Math.max(
    1,
    Math.min(5, 2 + complexityScore * 0.5 + highComplexityScore * 1.5 - lowComplexityScore * 0.5),
  );

  const researchComplexity =
    fullText.includes('research') ||
    fullText.includes('investigate') ||
    fullText.includes('explore') ||
    fullText.includes('prototype')
      ? 4
      : 2;

  const testingComplexity = fullText.includes('test') || fullText.includes('spec') ? 3 : 2;

  const integrationComplexity =
    fullText.includes('integrate') ||
    fullText.includes('api') ||
    fullText.includes('service') ||
    fullText.includes('connect')
      ? 4
      : 2;

  // Estimate hours based on factors
  const estimatedHours = Math.max(
    0.25,
    locImpact / 50 + fileCount * 0.5 + technicalComplexity * 0.5 + integrationComplexity * 0.5,
  );

  return {
    locImpact,
    fileCount,
    technicalComplexity,
    researchComplexity,
    testingComplexity,
    integrationComplexity,
    estimatedHours,
    requiresHumanJudgment: highComplexityScore > 0 || fullText.includes('design'),
    hasClearAcceptanceCriteria: !fullText.includes('investigate') && !fullText.includes('explore'),
    hasExternalDependencies:
      fullText.includes('api') ||
      fullText.includes('service') ||
      fullText.includes('external') ||
      fullText.includes('third-party'),
  };
}

/**
 * Generate LLM prompt for complexity estimation
 */
function generateComplexityEstimationPrompt(task: Task): string {
  return `You are estimating the complexity of a software development task for local AI model assignment.

TASK DETAILS:
Title: ${task.title}
Priority: ${task.priority || 'P3'}
Labels: ${(task.labels || []).join(', ')}
Content: ${task.content || 'No content provided'}

CONTEXT:
This is a TypeScript/Node.js monorepo with various packages including:
- Build tools and CI/CD pipelines
- Discord bots and AI agents
- Web crawlers and data processing
- Documentation systems
- Testing frameworks

ANALYZE the task and provide JSON with:
1. locImpact: Estimated lines of code to be touched
2. fileCount: Number of files that likely need modification
3. technicalComplexity: 1-5 scale (1=simple change, 5=complex technical work)
4. researchComplexity: 1-5 scale (1=well-understood, 5=requires research)
5. testingComplexity: 1-5 scale (1=minimal testing, 5=extensive test suite)
6. integrationComplexity: 1-5 scale (1=isolated change, 5=many system touchpoints)
7. estimatedHours: Realistic time estimate in hours
8. requiresHumanJudgment: Does this need creativity/human insight?
9. hasClearAcceptanceCriteria: Are success criteria well-defined?
10. hasExternalDependencies: Does it rely on external APIs/services?
11. overallScore: 1-10 complexity score (1=trivial, 10=very complex)
12. complexityLevel: "simple" (1-3), "moderate" (4-6), "complex" (7-8), "expert" (9-10)
13. suitableForLocalModel: Can a local LLM handle this task effectively?
14. recommendedModel: Best model for this task (e.g., "qwen2.5:3b", "llama3.2:3b", or null if unsuitable)
15. reasoning: Brief explanation of your assessment
16. breakdownSteps: 3-5 concrete steps to complete this task
17. estimatedTokens: Approximate tokens needed for AI to work on this task

Consider whether the task has clear boundaries and well-defined requirements, making it suitable for automated AI assistance.`;
}

/**
 * Estimate task complexity using LLM analysis
 */
async function estimateTaskComplexity(
  task: Task,
  model: string = 'qwen2.5:3b',
): Promise<ComplexityEstimate> {
  logger.info(`Estimating complexity for task: ${task.title}`);

  // Get initial analysis from content
  const baseAnalysis = analyzeTaskContent(task);

  try {
    const prompt = generateComplexityEstimationPrompt(task);
    const raw = await ollamaJSON(model, prompt);
    const parsed: ComplexityResult = ComplexitySchema.parse(raw);

    // Type guard to ensure result matches expected schema
    if (!ComplexitySchema.safeParse(parsed).success) {
      throw new Error('LLM result does not match expected schema');
    }

    // Merge LLM analysis with base analysis
    const factors: ComplexityFactors = {
      locImpact: parsed.locImpact,
      fileCount: parsed.fileCount,
      technicalComplexity: parsed.technicalComplexity,
      researchComplexity: parsed.researchComplexity,
      testingComplexity: parsed.testingComplexity,
      integrationComplexity: parsed.integrationComplexity,
      estimatedHours: parsed.estimatedHours,
      requiresHumanJudgment: parsed.requiresHumanJudgment,
      hasClearAcceptanceCriteria: parsed.hasClearAcceptanceCriteria,
      hasExternalDependencies: parsed.hasExternalDependencies,
    };

    return {
      taskId: task.uuid,
      taskTitle: task.title,
      factors,
      overallScore: parsed.overallScore,
      complexityLevel: parsed.complexityLevel,
      suitableForLocalModel: parsed.suitableForLocalModel,
      recommendedModel: parsed.recommendedModel,
      reasoning: parsed.reasoning,
      breakdownSteps: parsed.breakdownSteps,
      estimatedTokens: parsed.estimatedTokens,
    };
  } catch (error) {
    logger.warn(
      `LLM complexity estimation failed for ${task.title}, using fallback analysis:`,
      toErrorFields(error),
    );

    // Fallback to rule-based estimation
    const overallScore = Math.min(
      10,
      Math.max(
        1,
        (baseAnalysis.technicalComplexity +
          baseAnalysis.integrationComplexity +
          baseAnalysis.researchComplexity) *
          1.5,
      ),
    );

    const complexityLevel =
      overallScore <= 3
        ? 'simple'
        : overallScore <= 6
          ? 'moderate'
          : overallScore <= 8
            ? 'complex'
            : 'expert';

    return {
      taskId: task.uuid,
      taskTitle: task.title,
      factors: baseAnalysis,
      overallScore,
      complexityLevel,
      suitableForLocalModel: overallScore <= 6,
      recommendedModel: overallScore <= 4 ? 'qwen2.5:3b' : overallScore <= 6 ? 'llama3.2:3b' : null,
      reasoning: 'Rule-based estimation (LLM analysis unavailable)',
      breakdownSteps: [
        'Analyze current implementation',
        'Make required changes',
        'Test the changes',
        'Update documentation',
      ],
      estimatedTokens: Math.max(1000, overallScore * 500),
    };
  }
}

/**
 * Batch estimate complexity for multiple tasks
 */
export async function estimateBatchComplexity(
  tasksDir: string,
  options: {
    statusFilter?: string;
    priorityFilter?: string;
    maxTasks?: number;
    model?: string;
  } = {},
): Promise<ComplexityEstimate[]> {
  const { statusFilter = 'todo', priorityFilter, maxTasks = 50, model = 'qwen2.5:3b' } = options;

  logger.info(`Starting batch complexity estimation for status: ${statusFilter}`);

  const tasks = await readTasksFromDirectory(tasksDir);
  const normalizedStatusFilter = statusFilter.toLowerCase();
  const filteredTasks = tasks
    .filter((task: Task) => {
      const taskStatus = String(task.status ?? '').toLowerCase();
      if (taskStatus !== normalizedStatusFilter) return false;
      if (
        priorityFilter &&
        (task.priority === undefined ||
          String(task.priority).toLowerCase() !== priorityFilter.toLowerCase())
      ) {
        return false;
      }
      return true;
    })
    .slice(0, maxTasks);

  logger.info(`Analyzing ${filteredTasks.length} tasks with model: ${model}`);

  const estimates: ComplexityEstimate[] = [];
  for (const task of filteredTasks) {
    try {
      const estimate = await estimateTaskComplexity(task, model);
      estimates.push(estimate);
    } catch (error) {
      logger.error(`Failed to estimate complexity for task ${task.uuid}:`, toErrorFields(error));
    }
  }

  // Sort by complexity (simplest first for local models)
  estimates.sort((a, b) => {
    if (a.suitableForLocalModel !== b.suitableForLocalModel) {
      return b.suitableForLocalModel ? 1 : -1;
    }
    return a.overallScore - b.overallScore;
  });

  logger.info(`Completed complexity estimation for ${estimates.length} tasks`);
  return estimates;
}

/**
 * Get tasks suitable for local model work
 */
export function getTasksForLocalModel(
  estimates: ComplexityEstimate[],
  maxComplexity: number = 6,
): ComplexityEstimate[] {
  return estimates.filter(
    (estimate) => estimate.suitableForLocalModel && estimate.overallScore <= maxComplexity,
  );
}

/**
 * Save complexity estimates to file
 */
export async function saveComplexityEstimates(
  estimates: ComplexityEstimate[],
  outputPath: string,
): Promise<void> {
  const report = {
    generatedAt: new Date().toISOString(),
    totalTasks: estimates.length,
    suitableForLocalModel: estimates.filter((e) => e.suitableForLocalModel).length,
    complexityBreakdown: {
      simple: estimates.filter((e) => e.complexityLevel === 'simple').length,
      moderate: estimates.filter((e) => e.complexityLevel === 'moderate').length,
      complex: estimates.filter((e) => e.complexityLevel === 'complex').length,
      expert: estimates.filter((e) => e.complexityLevel === 'expert').length,
    },
    estimates,
  };

  await fs.writeFile(outputPath, JSON.stringify(report, null, 2));
  logger.info(`Complexity estimates saved to: ${outputPath}`);
}

// CLI interface - disabled for now
/*
if (import.meta.main) {
  // CLI usage
  const tasksDir = process.argv[2] || 'docs/agile/tasks';
  const outputPath = process.argv[3] || '.cache/task-complexity.json';

  estimateBatchComplexity(tasksDir)
    .then((estimates) => saveComplexityEstimates(estimates, outputPath))
    .catch((error) => {
      console.error('Complexity estimation failed:', error);
      process.exit(1);
    });
}
*/
