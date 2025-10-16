#!/usr/bin/env node

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// WIP Management Tool
class WIPManager {
  constructor() {
    this.wipLimits = {
      todo: 15,
      in_progress: 3,
      review: 2,
      blocked: 3,
      done: 500,
      backlog: Infinity,
      icebox: 200
    };
  }

  async getCurrentWIPStatus() {
    console.log('🔍 Checking current WIP status...\n');

    const columnsToCheck = ['todo', 'in_progress', 'review', 'blocked', 'done', 'backlog', 'icebox'];
    const status = {};

    for (const columnName of columnsToCheck) {
      try {
        const { stdout } = await execAsync(`pnpm kanban getColumn ${columnName}`);
        const columnData = JSON.parse(stdout);

        status[columnName] = {
          count: columnData.count,
          limit: columnData.limit || '∞',
          overLimit: columnData.limit ? Math.max(0, columnData.count - columnData.limit) : 0,
          violation: columnData.limit && columnData.count > columnData.limit
        };

        const status = columnData.limit && columnData.count > columnData.limit ? '🚨' : '✅';
        console.log(`  ${columnName}: ${columnData.count}/${columnData.limit || '∞'} ${status}`);
      } catch (error) {
        console.log(`  ${columnName}: ❌ Could not check`);
      }
    }

    return status;
  }

  async findTasksForBreakdown() {
    console.log('\n🔨 Finding tasks that could benefit from breakdown...\n');

    try {
      const { stdout } = await execAsync('pnpm kanban getColumn todo');
      const columnData = JSON.parse(stdout);

      // Look for tasks with certain keywords that suggest they're complex
      const breakdownKeywords = ['implement', 'build', 'create', 'design', 'refactor', 'migrate'];
      const candidates = columnData.tasks?.filter(task =>
        breakdownKeywords.some(keyword =>
          task.title.toLowerCase().includes(keyword)
        )
      ) || [];

      console.log(`Found ${candidates.length} potential candidates for breakdown:`);
      candidates.slice(0, 5).forEach(task => {
        console.log(`  - ${task.title} (${task.uuid})`);
      });

      return candidates.slice(0, 3); // Return top 3 candidates
    } catch (error) {
      console.error('Failed to find breakdown candidates:', error.message);
      return [];
    }
  }

  async compareSimilarTasks() {
    console.log('\n🔍 Finding similar tasks for comparison...\n');

    try {
      // Get a sample of tasks from different columns
      const todoResult = await execAsync('pnpm kanban getColumn todo');
      const todoData = JSON.parse(todoResult.stdout);

      const iceboxResult = await execAsync('pnpm kanban getColumn icebox');
      const iceboxData = JSON.parse(iceboxResult.stdout);

      const sampleTasks = [
        ...(todoData.tasks?.slice(0, 2) || []),
        ...(iceboxData.tasks?.slice(0, 2) || [])
      ];

      if (sampleTasks.length < 2) {
        console.log('Not enough tasks to compare');
        return [];
      }

      const taskUuids = sampleTasks.map(t => t.uuid);

      try {
        const { stdout } = await execAsync(`pnpm kanban compare-tasks "${taskUuids.join(',')}"`);
        const comparisons = JSON.parse(stdout);

        console.log('Task comparisons:');
        comparisons.forEach(comp => {
          if (comp.similarity > 0.1) {
            console.log(`  ${comp.title}: ${(comp.similarity * 100).toFixed(1)}% similar to other tasks`);
            if (comp.reasons.length > 0) {
              console.log(`    Reasons: ${comp.reasons.join(', ')}`);
            }
          }
        });

        return comparisons;
      } catch (error) {
        console.log('Could not compare tasks (may need kanban tools installed)');
        return [];
      }
    } catch (error) {
      console.error('Failed to compare tasks:', error.message);
      return [];
    }
  }

  async suggestPrioritization() {
    console.log('\n📊 Suggesting task prioritization...\n');

    try {
      // Get tasks from todo column
      const { stdout } = await execAsync('pnpm kanban getColumn todo');
      const columnData = JSON.parse(stdout);

      const sampleTasks = columnData.tasks?.slice(0, 5) || [];

      if (sampleTasks.length === 0) {
        console.log('No tasks in todo column to prioritize');
        return [];
      }

      const taskUuids = sampleTasks.map(t => t.uuid);

      try {
        const { stdout } = await execAsync(`pnpm kanban prioritize-tasks "${taskUuids.join(',')}"`);
        const priorities = JSON.parse(stdout);

        console.log('Task prioritization suggestions:');
        priorities.forEach(prio => {
          const arrow = prio.currentPriority !== prio.suggestedPriority ? '→' : '=';
          console.log(`  ${prio.title}: ${prio.currentPriority} ${arrow} ${prio.suggestedPriority} (score: ${prio.priorityScore.toFixed(2)})`);
          console.log(`    ${prio.reasoning}`);
        });

        return priorities;
      } catch (error) {
        console.log('Could not prioritize tasks (may need kanban tools installed)');
        return [];
      }
    } catch (error) {
      console.error('Failed to prioritize tasks:', error.message);
      return [];
    }
  }

  async generateWIPReport() {
    console.log('\n📋 Generating comprehensive WIP management report...\n');

    const status = await this.getCurrentWIPStatus();
    const breakdownCandidates = await this.findTasksForBreakdown();
    const comparisons = await this.compareSimilarTasks();
    const priorities = await this.suggestPrioritization();

    // Calculate summary metrics
    const violatingColumns = Object.entries(status).filter(([_, data]) => data.violation);
    const totalOverLimit = violatingColumns.reduce((sum, [_, data]) => sum + data.overLimit, 0);

    console.log('\n📈 SUMMARY');
    console.log('=========');
    console.log(`Violating columns: ${violatingColumns.length}`);
    console.log(`Total tasks over limit: ${totalOverLimit}`);

    if (totalOverLimit > 0) {
      console.log('\n🎯 IMMEDIATE ACTIONS');
      console.log('==================');

      violatingColumns.forEach(([column, data]) => {
        console.log(`${column}: Move ${data.overLimit} tasks to other columns`);
      });

      if (breakdownCandidates.length > 0) {
        console.log('\nConsider breaking down complex tasks:');
        breakdownCandidates.forEach(task => {
          console.log(`  - ${task.title}`);
        });
      }

      if (priorities.length > 0) {
        console.log('\nReview task priorities:');
        priorities.filter(p => p.currentPriority !== p.suggestedPriority).forEach(p => {
          console.log(`  - ${p.title}: ${p.currentPriority} → ${p.suggestedPriority}`);
        });
      }
    } else {
      console.log('\n✅ WIP limits are within acceptable ranges!');
    }

    console.log('\n🛠️  RECOMMENDED TOOLS');
    console.log('====================');
    console.log('• Use `pnpm kanban breakdown-task <uuid>` to analyze complex tasks');
    console.log('• Use `pnpm kanban compare-tasks <uuid1,uuid2>` to find similar work');
    console.log('• Use `pnpm kanban prioritize-tasks <uuid1,uuid2,uuid3>` to optimize priorities');
    console.log('• Use `pnpm --filter @promethean/boardrev br:07-wip --apply` for automated resolution');

    return {
      status,
      breakdownCandidates,
      comparisons,
      priorities,
      summary: {
        violatingColumns: violatingColumns.length,
        totalOverLimit,
        inGoodHealth: totalOverLimit === 0
      }
    };
  }

  async runQuickWIPResolution() {
    console.log('🚀 Running quick WIP resolution...\n');

    const status = await this.getCurrentWIPStatus();
    let movedCount = 0;

    // Move obvious candidates
    const obviousMoves = [
      // Move test tasks to done/icebox
      { pattern: /test.*progress|monitoring.*test|fix.*test/, from: 'todo', to: 'done' },
      { pattern: /test.*integration|test.*unit/, from: 'todo', to: 'icebox' },

      // Move documentation tasks to document column
      { pattern: /doc.*readme|review.*documentation|documentation/, from: 'todo', to: 'document' },

      // Move breakdown tasks to backlog
      { pattern: /breakdown|break.*down/, from: 'todo', to: 'backlog' }
    ];

    for (const move of obviousMoves) {
      try {
        const { stdout } = await execAsync(`pnpm kanban getColumn ${move.from}`);
        const columnData = JSON.parse(stdout);

        const matchingTasks = columnData.tasks?.filter(task =>
          move.pattern.test(task.title.toLowerCase())
        ) || [];

        // Move up to the over-limit amount
        const overLimit = status[move.from]?.overLimit || 0;
        const toMove = matchingTasks.slice(0, Math.min(matchingTasks.length, overLimit));

        for (const task of toMove) {
          try {
            await execAsync(`pnpm kanban update_status "${task.uuid}" ${move.to}`);
            console.log(`✅ Moved "${task.title}" from ${move.from} to ${move.to}`);
            movedCount++;
          } catch (error) {
            if (error.message.includes('WIP limit violation')) {
              console.log(`⚠️  Cannot move "${task.title}" to ${move.to} - column full`);
            } else {
              console.log(`❌ Failed to move "${task.title}": ${error.message}`);
            }
          }
        }
      } catch (error) {
        console.log(`Could not process ${move.from} column: ${error.message}`);
      }
    }

    console.log(`\n🎉 Quick resolution complete! Moved ${movedCount} tasks.`);

    // Show final status
    await this.getCurrentWIPStatus();

    return movedCount;
  }
}

// CLI interface
async function main() {
  const command = process.argv[2];

  const manager = new WIPManager();

  switch (command) {
    case 'status':
      await manager.getCurrentWIPStatus();
      break;

    case 'report':
      await manager.generateWIPReport();
      break;

    case 'resolve':
      await manager.runQuickWIPResolution();
      break;

    case 'all':
      await manager.generateWIPReport();
      console.log('\n' + '='.repeat(50));
      await manager.runQuickWIPResolution();
      break;

    default:
      console.log('WIP Manager - Tool for managing Work in Progress limits');
      console.log('');
      console.log('Usage:');
      console.log('  node wip-manager.js status    - Show current WIP status');
      console.log('  node wip-manager.js report    - Generate comprehensive report');
      console.log('  node wip-manager.js resolve   - Run quick WIP resolution');
      console.log('  node wip-manager.js all       - Generate report and resolve');
      break;
  }
}

if (import.meta.main) {
  main().catch(console.error);
}