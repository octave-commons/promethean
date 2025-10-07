import { exec } from 'child_process';
import { promisify } from 'util';
import { createLogger, parseArgs, writeText } from '@promethean/utils';
import { loadEvals } from './06-report.js';
import type { EvalItem } from './types.js';

const execAsync = promisify(exec);
const logger = createLogger({ service: 'wip-resolution' });

export interface WIPViolation {
  columnName: string;
  currentCount: number;
  limit: number | null;
  overLimit: number;
}

export interface WIPResolution {
  column: string;
  tasksToMove: Array<{
    taskUuid: string;
    currentStatus: string;
    recommendedStatus: string;
    confidence: number;
    reason: string;
  }>;
}

export async function detectWIPViolations(): Promise<WIPViolation[]> {
  logger.info('Detecting WIP limit violations...');

  const violations: WIPViolation[] = [];

  // Define the columns we want to check
  const columnsToCheck = ['todo', 'in_progress', 'review', 'blocked', 'done', 'backlog', 'icebox'];

  try {
    for (const columnName of columnsToCheck) {
      try {
        const { stdout } = await execAsync(`pnpm kanban getColumn ${columnName}`);
        const columnData = JSON.parse(stdout);

        if (columnData.limit && columnData.count > columnData.limit) {
          violations.push({
            columnName: columnData.name,
            currentCount: columnData.count,
            limit: columnData.limit,
            overLimit: columnData.count - columnData.limit
          });
          logger.warn(`WIP violation: ${columnData.name} has ${columnData.count} tasks (limit: ${columnData.limit})`);
        } else {
          logger.info(`Column ${columnData.name}: ${columnData.count}/${columnData.limit || '∞'} tasks`);
        }
      } catch (columnError) {
        logger.warn(`Could not check column ${columnName}: ${(columnError as Error).message}`);
      }
    }
  } catch (error) {
    logger.error('Failed to detect WIP violations: ' + (error as Error).message);
    throw error;
  }

  logger.info(`Found ${violations.length} WIP violations`);
  return violations;
}

export async function assessTasksForWIPResolution(
  violations: WIPViolation[],
  evalsPath: string
): Promise<WIPResolution[]> {
  logger.info('Assessing tasks for WIP resolution using LLM evaluations...');

  // Load existing LLM evaluations
  let evaluations: EvalItem[] = [];
  try {
    evaluations = await loadEvals(evalsPath);
  } catch (error) {
    logger.warn(`Could not load evals from ${evalsPath}, will need to run board-review first`);
    throw new Error('LLM evaluations not found. Run board-review pipeline first.');
  }

  const resolutions: WIPResolution[] = [];

  for (const violation of violations) {
    const tasksToMove: WIPResolution['tasksToMove'] = [];

    try {
      // Get tasks from the violating column
      const { stdout: columnStdout } = await execAsync(`pnpm kanban getColumn ${violation.columnName}`);
      const columnData = JSON.parse(columnStdout);

      // Get evaluations for tasks in violating column
      const columnEvals = evaluations.filter(evaluation =>
        columnData.tasks?.some((task: any) =>
          task.uuid === evaluation.taskUuid
        )
      );

      // Sort tasks by confidence and readiness to move
      const sortedEvals = columnEvals.sort((a, b) => {
        // Prioritize tasks that are clearly ready to move
        if (a.confidence > b.confidence) return -1;
        if (b.confidence > a.confidence) return 1;

        // For in_progress violations, prioritize tasks ready for review or done
        if (violation.columnName === 'in_progress') {
          const aReadyForNext = a.inferred_status === 'review' || a.inferred_status === 'done';
          const bReadyForNext = b.inferred_status === 'review' || b.inferred_status === 'done';
          if (aReadyForNext && !bReadyForNext) return -1;
          if (!aReadyForNext && bReadyForNext) return 1;
        }

        // For todo violations, prioritize tasks ready for breakdown or icebox
        if (violation.columnName === 'todo') {
          const aShouldMove = a.inferred_status === 'backlog' || a.inferred_status === 'breakdown';
          const bShouldMove = b.inferred_status === 'backlog' || b.inferred_status === 'breakdown';
          if (aShouldMove && !bShouldMove) return -1;
          if (!aShouldMove && bShouldMove) return 1;
        }

        return 0;
      });

      // Select tasks to move to resolve WIP violation
      const tasksNeeded = violation.overLimit;
      for (let i = 0; i < Math.min(tasksNeeded, sortedEvals.length); i++) {
        const evaluation = sortedEvals[i];
        if (!evaluation) continue;

        let recommendedStatus: string;

        // Determine best target status based on current column and evaluation
        if (violation.columnName === 'in_progress') {
          if (evaluation.inferred_status === 'done' && evaluation.confidence >= 0.7) {
            recommendedStatus = 'done';
          } else if (evaluation.inferred_status === 'review' || evaluation.confidence >= 0.6) {
            recommendedStatus = 'review';
          } else {
            recommendedStatus = 'todo'; // Send back if not ready
          }
        } else if (violation.columnName === 'todo') {
          if (evaluation.inferred_status === 'backlog' || evaluation.confidence < 0.5) {
            recommendedStatus = 'backlog';
          } else {
            recommendedStatus = 'icebox'; // Defer if unclear
          }
        } else {
          // Default: move to previous state in FSM
          recommendedStatus = 'todo';
        }

        tasksToMove.push({
          taskUuid: evaluation.taskUuid,
          currentStatus: violation.columnName,
          recommendedStatus,
          confidence: evaluation.confidence,
          reason: evaluation.summary
        });
      }
    } catch (error) {
      logger.warn(`Failed to assess tasks for column ${violation.columnName}: ` + (error as Error).message);
      continue;
    }

    resolutions.push({
      column: violation.columnName,
      tasksToMove
    });
  }

  return resolutions;
}

export async function applyWIPResolutions(
  resolutions: WIPResolution[],
  dryRun: boolean = true
): Promise<void> {
  logger.info(`${dryRun ? 'DRY RUN: ' : ''}Applying WIP resolutions...`);

  for (const resolution of resolutions) {
    logger.info(`Resolving violations in column: ${resolution.column}`);

    for (const taskMove of resolution.tasksToMove) {
      const action = dryRun ? 'Would move' : 'Moving';
      logger.info(`${action} task ${taskMove.taskUuid} from ${taskMove.currentStatus} to ${taskMove.recommendedStatus} (confidence: ${(taskMove.confidence * 100).toFixed(0)}%)`);

      if (!dryRun) {
        try {
          await execAsync(`pnpm kanban update-status ${taskMove.taskUuid} ${taskMove.recommendedStatus}`);
          logger.info(`Successfully moved task ${taskMove.taskUuid} to ${taskMove.recommendedStatus}`);
        } catch (error) {
          logger.error(`Failed to move task ${taskMove.taskUuid}: ${(error as Error).message}`);
        }
      }
    }
  }
}

export async function generateWIPReport(
  violations: WIPViolation[],
  resolutions: WIPResolution[],
  outputPath: string
): Promise<void> {
  const report = [
    '# WIP Violation Resolution Report',
    '',
    `Generated: ${new Date().toLocaleString()}`,
    '',
    '## Summary',
    '',
    `**Violations Found:** ${violations.length}`,
    '',
    '## Violations Detected',
    '',
    ...violations.map(v => [
      `### ${v.columnName}`,
      '',
      `- **Current Count:** ${v.currentCount}`,
      `- **WIP Limit:** ${v.limit}`,
      `- **Over Limit:** ${v.overLimit}`,
      ''
    ].join('\n')),
    '',
    '## Recommended Resolutions',
    '',
    ...resolutions.map(r => [
      `### ${r.column}`,
      '',
      `**Tasks to Move:** ${r.tasksToMove.length}`,
      '',
      ...r.tasksToMove.map(t => [
        `- **${t.taskUuid}**`,
        `  - From: ${t.currentStatus} → To: ${t.recommendedStatus}`,
        `  - Confidence: ${(t.confidence * 100).toFixed(0)}%`,
        `  - Reason: ${t.reason}`,
        ''
      ].join('\n'))
    ].join('\n')),
    '',
    '## Next Steps',
    '',
    '1. Review the recommended resolutions',
    '2. Apply resolutions using: `pnpm boardrev:07-wip --apply`',
    '3. Verify board state after changes',
    ''
  ].join('\n');

  await writeText(outputPath, report);
  logger.info(`WIP resolution report written to ${outputPath}`);
}

export async function resolveWIPViolations({
  evalsPath = '.cache/boardrev/evals.json',
  reportPath = 'docs/agile/reports/wip-resolution.md',
  apply = false
}: {
  evalsPath?: string;
  reportPath?: string;
  apply?: boolean;
} = {}): Promise<void> {
  try {
    // Step 1: Detect WIP violations
    const violations = await detectWIPViolations();

    if (violations.length === 0) {
      logger.info('No WIP violations found. Board is compliant!');
      return;
    }

    // Step 2: Assess tasks using LLM evaluations
    const resolutions = await assessTasksForWIPResolution(violations, evalsPath);

    // Step 3: Generate report
    await generateWIPReport(violations, resolutions, reportPath);

    // Step 4: Apply resolutions (if requested)
    await applyWIPResolutions(resolutions, !apply);

    logger.info(`WIP resolution complete. Report: ${reportPath}`);

  } catch (error) {
    logger.error(`WIP resolution failed: ${(error as Error).message}`);
    throw error;
  }
}

if (import.meta.main) {
  const args = parseArgs({
    '--evals-path': '.cache/boardrev/evals.json',
    '--report-path': 'docs/agile/reports/wip-resolution.md',
    '--apply': 'false'
  });

  await resolveWIPViolations({
    evalsPath: args['--evals-path'],
    reportPath: args['--report-path'],
    apply: args['--apply'] === 'true'
  }).catch((error) => {
    logger.error(error);
    process.exit(1);
  });
}