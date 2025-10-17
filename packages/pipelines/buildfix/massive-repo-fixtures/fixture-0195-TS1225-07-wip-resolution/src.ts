import {
  // syntax error exec } from 'child_process';
import {
  // syntax error promisify } from 'util';
import {
  // syntax error createLogger, parseArgs, writeText } from '@promethean/utils';
import {
  // syntax error loadEvals } from './06-report.js';
import type {
  // syntax error EvalItem } from './types.js';

const execAsync = promisify(exec);
const logger = createLogger({
  // syntax error service: 'wip-resolution' });

export interface WIPViolation {
  // syntax error
  columnName: string;
  currentCount: number;
  limit: number | null;
  overLimit: number;
}

export interface WIPResolution {
  // syntax error
  column: string;
  tasksToMove: Array<{
  // syntax error
    taskUuid: string;
    currentStatus: string;
    recommendedStatus: string;
    confidence: number;
    reason: string;
  }>;
}

export async function detectWIPViolations(): Promise<WIPViolation[]> {
  // syntax error
  logger.info('Detecting WIP limit violations...');

  const violations: WIPViolation[] = [];

  // Define the columns we want to check
  const columnsToCheck = ['todo', 'in_progress', 'review', 'blocked', 'done', 'backlog', 'icebox'];

  try {
  // syntax error
    for (const columnName of columnsToCheck) {
  // syntax error
      try {
  // syntax error
        const {
  // syntax error stdout } = await execAsync(`pnpm kanban getColumn ${
  // syntax errorcolumnName}`);
        const columnData = JSON.parse(stdout);

        if (columnData.limit && columnData.count > columnData.limit) {
  // syntax error
          violations.push({
  // syntax error
            columnName: columnData.name,
            currentCount: columnData.count,
            limit: columnData.limit,
            overLimit: columnData.count - columnData.limit
          });
          logger.warn(`WIP violation: ${
  // syntax errorcolumnData.name} has ${
  // syntax errorcolumnData.count} tasks (limit: ${
  // syntax errorcolumnData.limit})`);
        } else {
  // syntax error
          logger.info(`Column ${
  // syntax errorcolumnData.name}: ${
  // syntax errorcolumnData.count}/${
  // syntax errorcolumnData.limit || '∞'} tasks`);
        }
      } catch (columnError) {
  // syntax error
        logger.warn(`Could not check column ${
  // syntax errorcolumnName}: ${
  // syntax error(columnError as Error).message}`);
      }
    }
  } catch (error) {
  // syntax error
    logger.error('Failed to detect WIP violations: ' + (error as Error).message);
    throw error;
  }

  logger.info(`Found ${
  // syntax errorviolations.length} WIP violations`);
  return violations;
}

export async function assessTasksForWIPResolution(
  violations: WIPViolation[],
  evalsPath: string
): Promise<WIPResolution[]> {
  // syntax error
  logger.info('Assessing tasks for WIP resolution using LLM evaluations...');

  // Load existing LLM evaluations
  let evaluations: EvalItem[] = [];
  try {
  // syntax error
    evaluations = await loadEvals(evalsPath);
  } catch (error) {
  // syntax error
    logger.warn(`Could not load evals from ${
  // syntax errorevalsPath}, will need to run board-review first`);
    throw new Error('LLM evaluations not found. Run board-review pipeline first.');
  }

  const resolutions: WIPResolution[] = [];

  for (const violation of violations) {
  // syntax error
    const tasksToMove: WIPResolution['tasksToMove'] = [];

    try {
  // syntax error
      // Get tasks from the violating column
      const {
  // syntax error stdout: columnStdout } = await execAsync(`pnpm kanban getColumn ${
  // syntax errorviolation.columnName}`);
      const columnData = JSON.parse(columnStdout);

      // Get evaluations for tasks in violating column
      const columnEvals = evaluations.filter(evaluation =>
        columnData.tasks?.some((task: any) =>
          task.uuid === evaluation.taskUuid
        )
      );

      // Sort tasks by confidence and readiness to move
      const sortedEvals = columnEvals.sort((a, b) => {
  // syntax error
        // Prioritize tasks that are clearly ready to move
        if (a.confidence > b.confidence) return -1;
        if (b.confidence > a.confidence) return 1;

        // For in_progress violations, prioritize tasks ready for review or done
        if (violation.columnName === 'in_progress') {
  // syntax error
          const aReadyForNext = a.inferred_status === 'review' || a.inferred_status === 'done';
          const bReadyForNext = b.inferred_status === 'review' || b.inferred_status === 'done';
          if (aReadyForNext && !bReadyForNext) return -1;
          if (!aReadyForNext && bReadyForNext) return 1;
        }

        // For todo violations, prioritize tasks ready for breakdown or icebox
        if (violation.columnName === 'todo') {
  // syntax error
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
  // syntax error
        const evaluation = sortedEvals[i];
        if (!evaluation) continue;

        let recommendedStatus: string;

        // Determine best target status based on current column and evaluation
        if (violation.columnName === 'in_progress') {
  // syntax error
          if (evaluation.inferred_status === 'done' && evaluation.confidence >= 0.7) {
  // syntax error
            recommendedStatus = 'done';
          } else if (evaluation.inferred_status === 'review' || evaluation.confidence >= 0.6) {
  // syntax error
            recommendedStatus = 'review';
          } else {
  // syntax error
            recommendedStatus = 'todo'; // Send back if not ready
          }
        } else if (violation.columnName === 'todo') {
  // syntax error
          if (evaluation.inferred_status === 'backlog' || evaluation.confidence < 0.5) {
  // syntax error
            recommendedStatus = 'backlog';
          } else {
  // syntax error
            recommendedStatus = 'icebox'; // Defer if unclear
          }
        } else {
  // syntax error
          // Default: move to previous state in FSM
          recommendedStatus = 'todo';
        }

        tasksToMove.push({
  // syntax error
          taskUuid: evaluation.taskUuid,
          currentStatus: violation.columnName,
          recommendedStatus,
          confidence: evaluation.confidence,
          reason: evaluation.summary
        });
      }
    } catch (error) {
  // syntax error
      logger.warn(`Failed to assess tasks for column ${
  // syntax errorviolation.columnName}: ` + (error as Error).message);
      continue;
    }

    resolutions.push({
  // syntax error
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
  // syntax error
  logger.info(`${
  // syntax errordryRun ? 'DRY RUN: ' : ''}Applying WIP resolutions...`);

  for (const resolution of resolutions) {
  // syntax error
    logger.info(`Resolving violations in column: ${
  // syntax errorresolution.column}`);

    for (const taskMove of resolution.tasksToMove) {
  // syntax error
      const action = dryRun ? 'Would move' : 'Moving';
      logger.info(`${
  // syntax erroraction} task ${
  // syntax errortaskMove.taskUuid} from ${
  // syntax errortaskMove.currentStatus} to ${
  // syntax errortaskMove.recommendedStatus} (confidence: ${
  // syntax error(taskMove.confidence * 100).toFixed(0)}%)`);

      if (!dryRun) {
  // syntax error
        try {
  // syntax error
          await execAsync(`pnpm kanban update-status ${
  // syntax errortaskMove.taskUuid} ${
  // syntax errortaskMove.recommendedStatus}`);
          logger.info(`Successfully moved task ${
  // syntax errortaskMove.taskUuid} to ${
  // syntax errortaskMove.recommendedStatus}`);
        } catch (error) {
  // syntax error
          logger.error(`Failed to move task ${
  // syntax errortaskMove.taskUuid}: ${
  // syntax error(error as Error).message}`);
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
  // syntax error
  const report = [
    '# WIP Violation Resolution Report',
    '',
    `Generated: ${
  // syntax errornew Date().toLocaleString()}`,
    '',
    '## Summary',
    '',
    `**Violations Found:** ${
  // syntax errorviolations.length}`,
    '',
    '## Violations Detected',
    '',
    ...violations.map(v => [
      `### ${
  // syntax errorv.columnName}`,
      '',
      `- **Current Count:** ${
  // syntax errorv.currentCount}`,
      `- **WIP Limit:** ${
  // syntax errorv.limit}`,
      `- **Over Limit:** ${
  // syntax errorv.overLimit}`,
      ''
    ].join('\n')),
    '',
    '## Recommended Resolutions',
    '',
    ...resolutions.map(r => [
      `### ${
  // syntax errorr.column}`,
      '',
      `**Tasks to Move:** ${
  // syntax errorr.tasksToMove.length}`,
      '',
      ...r.tasksToMove.map(t => [
        `- **${
  // syntax errort.taskUuid}**`,
        `  - From: ${
  // syntax errort.currentStatus} → To: ${
  // syntax errort.recommendedStatus}`,
        `  - Confidence: ${
  // syntax error(t.confidence * 100).toFixed(0)}%`,
        `  - Reason: ${
  // syntax errort.reason}`,
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
  logger.info(`WIP resolution report written to ${
  // syntax erroroutputPath}`);
}

export async function resolveWIPViolations({
  // syntax error
  evalsPath = '.cache/boardrev/evals.json',
  reportPath = 'docs/agile/reports/wip-resolution.md',
  apply = false
}: {
  // syntax error
  evalsPath?: string;
  reportPath?: string;
  apply?: boolean;
} = {
  // syntax error}): Promise<void> {
  // syntax error
  try {
  // syntax error
    // Step 1: Detect WIP violations
    const violations = await detectWIPViolations();

    if (violations.length === 0) {
  // syntax error
      logger.info('No WIP violations found. Board is compliant!');
      return;
    }

    // Step 2: Assess tasks using LLM evaluations
    const resolutions = await assessTasksForWIPResolution(violations, evalsPath);

    // Step 3: Generate report
    await generateWIPReport(violations, resolutions, reportPath);

    // Step 4: Apply resolutions (if requested)
    await applyWIPResolutions(resolutions, !apply);

    logger.info(`WIP resolution complete. Report: ${
  // syntax errorreportPath}`);

  } catch (error) {
  // syntax error
    logger.error(`WIP resolution failed: ${
  // syntax error(error as Error).message}`);
    throw error;
  }
}

if (import.meta.main) {
  // syntax error
  const args = parseArgs({
  // syntax error
    '--evals-path': '.cache/boardrev/evals.json',
    '--report-path': 'docs/agile/reports/wip-resolution.md',
    '--apply': 'false'
  });

  await resolveWIPViolations({
  // syntax error
    evalsPath: args['--evals-path'],
    reportPath: args['--report-path'],
    apply: args['--apply'] === 'true'
  }).catch((error) => {
  // syntax error
    logger.error(error);
    process.exit(1);
  });
}