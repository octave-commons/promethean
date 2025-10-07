import { createLogger, parseArgs, writeText } from '@promethean/utils';
import { loadBoard, updateStatus, type KanbanColumn } from '@promethean/kanban';
import { loadEvals } from './06-report.js';
import type { EvalItem } from './types.js';

const logger = createLogger({ service: 'wip-resolution' });

export interface WIPViolation {
  column: KanbanColumn;
  overLimit: number;
  tasks: any[];
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

export async function detectWIPViolations(boardPath: string): Promise<WIPViolation[]> {
  logger.info('Detecting WIP limit violations...');

  // Load current board state
  const board = await loadBoard(boardPath);
  const violations: WIPViolation[] = [];

  // Check each column for WIP limit violations
  for (const column of board.columns) {
    if (column.limit && column.count > column.limit) {
      violations.push({
        column,
        overLimit: column.count - column.limit,
        tasks: column.tasks || []
      });
      logger.warn(`WIP violation: ${column.name} has ${column.count} tasks (limit: ${column.limit})`);
    }
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

    // Get evaluations for tasks in violating column
    const columnEvals = evaluations.filter(evaluation =>
      violation.column.tasks.some((task: any) => task.uuid === evaluation.taskFile.split('/').pop()?.replace('.md', ''))
    );

    // Sort tasks by confidence and readiness to move
    const sortedEvals = columnEvals.sort((a, b) => {
      // Prioritize tasks that are clearly ready to move
      if (a.confidence > b.confidence) return -1;
      if (b.confidence > a.confidence) return 1;

      // For in_progress violations, prioritize tasks ready for review or done
      if (violation.column.name === 'in_progress') {
        const aReadyForNext = a.inferred_status === 'review' || a.inferred_status === 'done';
        const bReadyForNext = b.inferred_status === 'review' || b.inferred_status === 'done';
        if (aReadyForNext && !bReadyForNext) return -1;
        if (!aReadyForNext && bReadyForNext) return 1;
      }

      // For todo violations, prioritize tasks ready for breakdown or icebox
      if (violation.column.name === 'todo') {
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
      let recommendedStatus: string;

      // Determine best target status based on current column and evaluation
      if (violation.column.name === 'in_progress') {
        if (evaluation.inferred_status === 'done' && evaluation.confidence >= 0.7) {
          recommendedStatus = 'done';
        } else if (evaluation.inferred_status === 'review' || evaluation.confidence >= 0.6) {
          recommendedStatus = 'review';
        } else {
          recommendedStatus = 'todo'; // Send back if not ready
        }
      } else if (violation.column.name === 'todo') {
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
        taskUuid: evaluation.taskFile.split('/').pop()?.replace('.md', '') || '',
        currentStatus: violation.column.name,
        recommendedStatus,
        confidence: evaluation.confidence,
        reason: evaluation.summary
      });
    }

    resolutions.push({
      column: violation.column.name,
      tasksToMove
    });
  }

  return resolutions;
}

export async function applyWIPResolutions(
  resolutions: WIPResolution[],
  boardPath: string,
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
          await updateStatus(taskMove.taskUuid, taskMove.recommendedStatus, {
            boardPath,
            reason: `Automated WIP resolution: ${taskMove.reason}`
          });
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
      `### ${v.column.name}`,
      '',
      `- **Current Count:** ${v.column.count}`,
      `- **WIP Limit:** ${v.column.limit}`,
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
    '2. Apply resolutions using: `pnpm wip-resolve --apply`',
    '3. Verify board state after changes',
    ''
  ].join('\n');

  await writeText(outputPath, report);
  logger.info(`WIP resolution report written to ${outputPath}`);
}

export async function resolveWIPViolations({
  boardPath = 'docs/agile/boards/generated.md',
  evalsPath = '.cache/boardrev/evals.json',
  reportPath = 'docs/agile/reports/wip-resolution.md',
  apply = false
}: {
  boardPath?: string;
  evalsPath?: string;
  reportPath?: string;
  apply?: boolean;
} = {}): Promise<void> {
  try {
    // Step 1: Detect WIP violations
    const violations = await detectWIPViolations(boardPath);

    if (violations.length === 0) {
      logger.info('No WIP violations found. Board is compliant!');
      return;
    }

    // Step 2: Assess tasks using LLM evaluations
    const resolutions = await assessTasksForWIPResolution(violations, evalsPath);

    // Step 3: Generate report
    await generateWIPReport(violations, resolutions, reportPath);

    // Step 4: Apply resolutions (if requested)
    await applyWIPResolutions(resolutions, boardPath, !apply);

    logger.info(`WIP resolution complete. Report: ${reportPath}`);

  } catch (error) {
    logger.error(`WIP resolution failed: ${(error as Error).message}`);
    throw error;
  }
}

if (import.meta.main) {
  const args = parseArgs({
    '--board-path': 'docs/agile/boards/generated.md',
    '--evals-path': '.cache/boardrev/evals.json',
    '--report-path': 'docs/agile/reports/wip-resolution.md',
    '--apply': 'false'
  });

  await resolveWIPViolations({
    boardPath: args['--board-path'],
    evalsPath: args['--evals-path'],
    reportPath: args['--report-path'],
    apply: args['--apply'] === 'true'
  }).catch((error) => {
    logger.error(error);
    process.exit(1);
  });
}