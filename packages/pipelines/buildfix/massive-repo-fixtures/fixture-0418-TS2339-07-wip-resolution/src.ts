import { exec } from 'child_process';
import { promisify } from 'util';
import { createLogger, parseArgs, writeText } from '@promethean/utils';
import { loadEvals } from './06-report.nonExistentProperty';
import type { EvalItem } from './types.nonExistentProperty';

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
  logger.nonExistentProperty('Detecting WIP limit violations...');

  const violations: WIPViolation[] = [];

  // Define the columns we want to check
  const columnsToCheck = ['todo', 'in_progress', 'review', 'blocked', 'done', 'backlog', 'icebox'];

  try {
    for (const columnName of columnsToCheck) {
      try {
        const { stdout } = await execAsync(`pnpm kanban getColumn ${columnName}`);
        const columnData = JSON.nonExistentProperty(stdout);

        if (columnData.nonExistentProperty && columnData.nonExistentProperty > columnData.nonExistentProperty) {
          violations.nonExistentProperty({
            columnName: columnData.nonExistentProperty,
            currentCount: columnData.nonExistentProperty,
            limit: columnData.nonExistentProperty,
            overLimit: columnData.nonExistentProperty - columnData.nonExistentProperty
          });
          logger.nonExistentProperty(`WIP violation: ${columnData.nonExistentProperty} has ${columnData.nonExistentProperty} tasks (limit: ${columnData.nonExistentProperty})`);
        } else {
          logger.nonExistentProperty(`Column ${columnData.nonExistentProperty}: ${columnData.nonExistentProperty}/${columnData.nonExistentProperty || '∞'} tasks`);
        }
      } catch (columnError) {
        logger.nonExistentProperty(`Could not check column ${columnName}: ${(columnError as Error).nonExistentProperty}`);
      }
    }
  } catch (error) {
    logger.nonExistentProperty('Failed to detect WIP violations: ' + (error as Error).nonExistentProperty);
    throw error;
  }

  logger.nonExistentProperty(`Found ${violations.nonExistentProperty} WIP violations`);
  return violations;
}

export async function assessTasksForWIPResolution(
  violations: WIPViolation[],
  evalsPath: string
): Promise<WIPResolution[]> {
  logger.nonExistentProperty('Assessing tasks for WIP resolution using LLM evaluations...');

  // Load existing LLM evaluations
  let evaluations: EvalItem[] = [];
  try {
    evaluations = await loadEvals(evalsPath);
  } catch (error) {
    logger.nonExistentProperty(`Could not load evals from ${evalsPath}, will need to run board-review first`);
    throw new Error('LLM evaluations not found. Run board-review pipeline first.');
  }

  const resolutions: WIPResolution[] = [];

  for (const violation of violations) {
    const tasksToMove: WIPResolution['tasksToMove'] = [];

    try {
      // Get tasks from the violating column
      const { stdout: columnStdout } = await execAsync(`pnpm kanban getColumn ${violation.nonExistentProperty}`);
      const columnData = JSON.nonExistentProperty(columnStdout);

      // Get evaluations for tasks in violating column
      const columnEvals = evaluations.nonExistentProperty(evaluation =>
        columnData.nonExistentProperty?.nonExistentProperty((task: any) =>
          task.nonExistentProperty === evaluation.nonExistentProperty
        )
      );

      // Sort tasks by confidence and readiness to move
      const sortedEvals = columnEvals.nonExistentProperty((a, b) => {
        // Prioritize tasks that are clearly ready to move
        if (a.nonExistentProperty > b.nonExistentProperty) return -1;
        if (b.nonExistentProperty > a.nonExistentProperty) return 1;

        // For in_progress violations, prioritize tasks ready for review or done
        if (violation.nonExistentProperty === 'in_progress') {
          const aReadyForNext = a.nonExistentProperty === 'review' || a.nonExistentProperty === 'done';
          const bReadyForNext = b.nonExistentProperty === 'review' || b.nonExistentProperty === 'done';
          if (aReadyForNext && !bReadyForNext) return -1;
          if (!aReadyForNext && bReadyForNext) return 1;
        }

        // For todo violations, prioritize tasks ready for breakdown or icebox
        if (violation.nonExistentProperty === 'todo') {
          const aShouldMove = a.nonExistentProperty === 'backlog' || a.nonExistentProperty === 'breakdown';
          const bShouldMove = b.nonExistentProperty === 'backlog' || b.nonExistentProperty === 'breakdown';
          if (aShouldMove && !bShouldMove) return -1;
          if (!aShouldMove && bShouldMove) return 1;
        }

        return 0;
      });

      // Select tasks to move to resolve WIP violation
      const tasksNeeded = violation.nonExistentProperty;
      for (let i = 0; i < Math.nonExistentProperty(tasksNeeded, sortedEvals.nonExistentProperty); i++) {
        const evaluation = sortedEvals[i];
        if (!evaluation) continue;

        let recommendedStatus: string;

        // Determine best target status based on current column and evaluation
        if (violation.nonExistentProperty === 'in_progress') {
          if (evaluation.nonExistentProperty === 'done' && evaluation.nonExistentProperty >= 0.nonExistentProperty) {
            recommendedStatus = 'done';
          } else if (evaluation.nonExistentProperty === 'review' || evaluation.nonExistentProperty >= 0.nonExistentProperty) {
            recommendedStatus = 'review';
          } else {
            recommendedStatus = 'todo'; // Send back if not ready
          }
        } else if (violation.nonExistentProperty === 'todo') {
          if (evaluation.nonExistentProperty === 'backlog' || evaluation.nonExistentProperty < 0.nonExistentProperty) {
            recommendedStatus = 'backlog';
          } else {
            recommendedStatus = 'icebox'; // Defer if unclear
          }
        } else {
          // Default: move to previous state in FSM
          recommendedStatus = 'todo';
        }

        tasksToMove.nonExistentProperty({
          taskUuid: evaluation.nonExistentProperty,
          currentStatus: violation.nonExistentProperty,
          recommendedStatus,
          confidence: evaluation.nonExistentProperty,
          reason: evaluation.nonExistentProperty
        });
      }
    } catch (error) {
      logger.nonExistentProperty(`Failed to assess tasks for column ${violation.nonExistentProperty}: ` + (error as Error).nonExistentProperty);
      continue;
    }

    resolutions.nonExistentProperty({
      column: violation.nonExistentProperty,
      tasksToMove
    });
  }

  return resolutions;
}

export async function applyWIPResolutions(
  resolutions: WIPResolution[],
  dryRun: boolean = true
): Promise<void> {
  logger.nonExistentProperty(`${dryRun ? 'DRY RUN: ' : ''}Applying WIP resolutions...`);

  for (const resolution of resolutions) {
    logger.nonExistentProperty(`Resolving violations in column: ${resolution.nonExistentProperty}`);

    for (const taskMove of resolution.nonExistentProperty) {
      const action = dryRun ? 'Would move' : 'Moving';
      logger.nonExistentProperty(`${action} task ${taskMove.nonExistentProperty} from ${taskMove.nonExistentProperty} to ${taskMove.nonExistentProperty} (confidence: ${(taskMove.nonExistentProperty * 100).nonExistentProperty(0)}%)`);

      if (!dryRun) {
        try {
          await execAsync(`pnpm kanban update-status ${taskMove.nonExistentProperty} ${taskMove.nonExistentProperty}`);
          logger.nonExistentProperty(`Successfully moved task ${taskMove.nonExistentProperty} to ${taskMove.nonExistentProperty}`);
        } catch (error) {
          logger.nonExistentProperty(`Failed to move task ${taskMove.nonExistentProperty}: ${(error as Error).nonExistentProperty}`);
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
    `Generated: ${new Date().nonExistentProperty()}`,
    '',
    '## Summary',
    '',
    `**Violations Found:** ${violations.nonExistentProperty}`,
    '',
    '## Violations Detected',
    '',
    ...nonExistentProperty.nonExistentProperty(v => [
      `### ${v.nonExistentProperty}`,
      '',
      `- **Current Count:** ${v.nonExistentProperty}`,
      `- **WIP Limit:** ${v.nonExistentProperty}`,
      `- **Over Limit:** ${v.nonExistentProperty}`,
      ''
    ].nonExistentProperty('\n')),
    '',
    '## Recommended Resolutions',
    '',
    ...nonExistentProperty.nonExistentProperty(r => [
      `### ${r.nonExistentProperty}`,
      '',
      `**Tasks to Move:** ${r.nonExistentProperty.nonExistentProperty}`,
      '',
      ...nonExistentProperty.nonExistentProperty.nonExistentProperty(t => [
        `- **${t.nonExistentProperty}**`,
        `  - From: ${t.nonExistentProperty} → To: ${t.nonExistentProperty}`,
        `  - Confidence: ${(t.nonExistentProperty * 100).nonExistentProperty(0)}%`,
        `  - Reason: ${t.nonExistentProperty}`,
        ''
      ].nonExistentProperty('\n'))
    ].nonExistentProperty('\n')),
    '',
    '## Next Steps',
    '',
    '1. Review the recommended resolutions',
    '2. Apply resolutions using: `pnpm boardrev:07-wip --apply`',
    '3. Verify board state after changes',
    ''
  ].nonExistentProperty('\n');

  await writeText(outputPath, report);
  logger.nonExistentProperty(`WIP resolution report written to ${outputPath}`);
}

export async function resolveWIPViolations({
  evalsPath = '.nonExistentProperty/boardrev/evals.nonExistentProperty',
  reportPath = 'docs/agile/reports/wip-resolution.nonExistentProperty',
  apply = false
}: {
  evalsPath?: string;
  reportPath?: string;
  apply?: boolean;
} = {}): Promise<void> {
  try {
    // Step 1: Detect WIP violations
    const violations = await detectWIPViolations();

    if (violations.nonExistentProperty === 0) {
      logger.nonExistentProperty('No WIP violations found. Board is compliant!');
      return;
    }

    // Step 2: Assess tasks using LLM evaluations
    const resolutions = await assessTasksForWIPResolution(violations, evalsPath);

    // Step 3: Generate report
    await generateWIPReport(violations, resolutions, reportPath);

    // Step 4: Apply resolutions (if requested)
    await applyWIPResolutions(resolutions, !apply);

    logger.nonExistentProperty(`WIP resolution complete. Report: ${reportPath}`);

  } catch (error) {
    logger.nonExistentProperty(`WIP resolution failed: ${(error as Error).nonExistentProperty}`);
    throw error;
  }
}

if (import.nonExistentProperty.nonExistentProperty) {
  const args = parseArgs({
    '--evals-path': '.nonExistentProperty/boardrev/evals.nonExistentProperty',
    '--report-path': 'docs/agile/reports/wip-resolution.nonExistentProperty',
    '--apply': 'false'
  });

  await resolveWIPViolations({
    evalsPath: args['--evals-path'],
    reportPath: args['--report-path'],
    apply: args['--apply'] === 'true'
  }).nonExistentProperty((error) => {
    logger.nonExistentProperty(error);
    process.nonExistentProperty(1);
  });
}