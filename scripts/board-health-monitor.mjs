#!/usr/bin/env node

/**
 * Board Health Monitoring Script
 *
 * Monitors kanban board health and implements automated healing processes
 * to address WIP limit violations and automation issues.
 */

import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

const BOARD_FILE = 'docs/agile/boards/generated.md';
const CONFIG_FILE = 'promethean.kanban.json';
const PROCESS_DOC = 'docs/agile/process.md';

// WIP limits from configuration
const WIP_LIMITS = {
  accepted: 21,
  breakdown: 20,
  blocked: 8,
  ready: 55,
  todo: 25,
  in_progress: 13,
  testing: 8,
  review: 8,
  document: 8,
  done: 500,
  rejected: 9999,
  icebox: 9999,
  incoming: 9999,
  archived: 9999,
};

// Critical thresholds for automated healing
const CRITICAL_THRESHOLDS = {
  incoming: 50, // Alert if incoming > 50
  wip_violation: 0.9, // Alert if any WIP column > 90% full
  duplicate_detection: true,
};

class BoardHealthMonitor {
  constructor() {
    this.boardData = null;
    this.healthStatus = {
      healthy: true,
      issues: [],
      recommendations: [],
      automated_actions: [],
    };
  }

  async loadBoardData() {
    try {
      const boardContent = readFileSync(BOARD_FILE, 'utf8');
      this.boardData = this.parseBoardContent(boardContent);
    } catch (error) {
      console.error('Error loading board data:', error.message);
      this.healthStatus.healthy = false;
      this.healthStatus.issues.push(`Failed to load board: ${error.message}`);
    }
  }

  parseBoardContent(content) {
    const columns = {};
    const lines = content.split('\n');
    let currentColumn = null;

    for (const line of lines) {
      if (line.startsWith('## ')) {
        currentColumn = line.replace('## ', '').trim();
        columns[currentColumn] = [];
      } else if (currentColumn && line.startsWith('- [ ]')) {
        const task = this.parseTaskLine(line);
        columns[currentColumn].push(task);
      }
    }

    return columns;
  }

  parseTaskLine(line) {
    const uuidMatch = line.match(/\(uuid:([a-f0-9-]+)\)/);
    const priorityMatch = line.match(/prio:(P[0-3])/);
    const titleMatch = line.match(/\[\[.*?\|(.*?)\]\]/);

    return {
      uuid: uuidMatch ? uuidMatch[1] : null,
      title: titleMatch ? titleMatch[1] : 'Unknown',
      priority: priorityMatch ? priorityMatch[1] : 'P2',
      raw: line,
    };
  }

  checkWIPLimits() {
    if (!this.boardData) return;

    for (const [column, limit] of Object.entries(WIP_LIMITS)) {
      if (column === 'incoming' || column === 'icebox' || column === 'archived') continue;

      const currentCount = this.boardData[column]?.length || 0;
      const utilization = currentCount / limit;

      if (utilization >= CRITICAL_THRESHOLDS.wip_violation) {
        this.healthStatus.healthy = false;
        this.healthStatus.issues.push(
          `WIP violation: ${column} at ${currentCount}/${limit} (${(utilization * 100).toFixed(1)}%)`,
        );

        if (utilization >= 1.0) {
          this.healthStatus.recommendations.push(
            `URGENT: ${column} is over WIP limit. Move tasks to appropriate columns.`,
          );
        }
      }
    }
  }

  checkIncomingOverflow() {
    if (!this.boardData) return;

    const incomingCount = this.boardData.incoming?.length || 0;

    if (incomingCount > CRITICAL_THRESHOLDS.incoming) {
      this.healthStatus.healthy = false;
      this.healthStatus.issues.push(
        `Incoming column overflow: ${incomingCount} tasks (threshold: ${CRITICAL_THRESHOLDS.incoming})`,
      );
      this.healthStatus.recommendations.push(
        `Move ${incomingCount - CRITICAL_THRESHOLDS.incoming} tasks from incoming to icebox`,
      );
    }
  }

  detectDuplicateTasks() {
    if (!this.boardData) return;

    const taskTitles = new Map();
    const duplicates = [];

    for (const [column, tasks] of Object.entries(this.boardData)) {
      for (const task of tasks) {
        const normalizedTitle = task.title.toLowerCase().replace(/\s+/g, ' ').trim();

        if (taskTitles.has(normalizedTitle)) {
          duplicates.push({
            title: task.title,
            uuid: task.uuid,
            column,
            original: taskTitles.get(normalizedTitle),
          });
        } else {
          taskTitles.set(normalizedTitle, { uuid: task.uuid, column });
        }
      }
    }

    if (duplicates.length > 0) {
      this.healthStatus.healthy = false;
      this.healthStatus.issues.push(`Found ${duplicates.length} duplicate tasks`);

      duplicates.forEach((dup) => {
        this.healthStatus.recommendations.push(
          `Move duplicate "${dup.title}" (${dup.uuid}) from ${dup.column} to icebox`,
        );
      });
    }
  }

  detectEmptyColumns() {
    if (!this.boardData) return;

    const expectedColumns = [
      'icebox',
      'incoming',
      'accepted',
      'breakdown',
      'blocked',
      'ready',
      'todo',
      'in_progress',
      'testing',
      'review',
      'document',
      'done',
      'rejected',
      'archived',
    ];

    const emptyColumns = expectedColumns.filter(
      (col) => !this.boardData[col] || this.boardData[col].length === 0,
    );

    if (emptyColumns.length > 0) {
      this.healthStatus.issues.push(`Empty columns detected: ${emptyColumns.join(', ')}`);
      this.healthStatus.recommendations.push(
        'Review automation scripts to ensure empty columns are properly tracked',
      );
    }
  }

  async performAutomatedHealing() {
    console.log('🔧 Performing automated board healing...');

    // Move obvious duplicates to icebox
    await this.moveObviousDuplicates();

    // Move test/placeholder tasks to icebox
    await this.moveTestTasks();

    // Update board after automated actions
    try {
      execSync('pnpm kanban regenerate', { stdio: 'inherit' });
      this.healthStatus.automated_actions.push('Regenerated board after healing');
    } catch (error) {
      console.error('Failed to regenerate board:', error.message);
    }
  }

  async moveObviousDuplicates() {
    if (!this.boardData) return;

    const duplicatePatterns = [
      / 2\|/, // Tasks with " 2|" suffix
      /test|Test|TEST/, // Test tasks
      /nothing|default|foobar/, // Placeholder tasks
      /integration-test|delete-test/, // Integration test tasks
    ];

    let movedCount = 0;

    for (const [column, tasks] of Object.entries(this.boardData)) {
      if (column === 'icebox') continue;

      for (const task of tasks) {
        const isDuplicate = duplicatePatterns.some(
          (pattern) => pattern.test(task.title) || pattern.test(task.raw),
        );

        if (isDuplicate && task.uuid) {
          try {
            execSync(`pnpm kanban update-status ${task.uuid} icebox`, { stdio: 'pipe' });
            movedCount++;
            console.log(`  Moved duplicate "${task.title}" to icebox`);
          } catch (error) {
            console.error(`  Failed to move ${task.uuid}:`, error.message);
          }
        }
      }
    }

    if (movedCount > 0) {
      this.healthStatus.automated_actions.push(`Moved ${movedCount} duplicate tasks to icebox`);
    }
  }

  async moveTestTasks() {
    // This is handled by moveObviousDuplicates with test patterns
  }

  generateHealthReport() {
    const report = {
      timestamp: new Date().toISOString(),
      healthy: this.healthStatus.healthy,
      summary: {
        total_tasks: this.getTotalTaskCount(),
        incoming_count: this.boardData?.incoming?.length || 0,
        wip_violations: this.healthStatus.issues.filter((i) => i.includes('WIP violation')).length,
        duplicates_found: this.healthStatus.issues.filter((i) => i.includes('duplicate')).length,
      },
      issues: this.healthStatus.issues,
      recommendations: this.healthStatus.recommendations,
      automated_actions: this.healthStatus.automated_actions,
      board_snapshot: this.getBoardSnapshot(),
    };

    return report;
  }

  getTotalTaskCount() {
    if (!this.boardData) return 0;
    return Object.values(this.boardData).reduce((total, tasks) => total + tasks.length, 0);
  }

  getBoardSnapshot() {
    if (!this.boardData) return {};

    const snapshot = {};
    for (const [column, tasks] of Object.entries(this.boardData)) {
      snapshot[column] = {
        count: tasks.length,
        wip_limit: WIP_LIMITS[column] || 'N/A',
        utilization: WIP_LIMITS[column] ? tasks.length / WIP_LIMITS[column] : 'N/A',
      };
    }

    return snapshot;
  }

  async run() {
    console.log('🏥 Starting board health monitoring...\n');

    await this.loadBoardData();

    if (!this.boardData) {
      console.log('❌ Cannot proceed without board data');
      return;
    }

    // Run health checks
    this.checkWIPLimits();
    this.checkIncomingOverflow();
    this.detectDuplicateTasks();
    this.detectEmptyColumns();

    // Perform automated healing if needed
    if (!this.healthStatus.healthy) {
      await this.performAutomatedHealing();
    }

    // Generate and display report
    const report = this.generateHealthReport();
    this.displayReport(report);

    // Save report
    const reportFile = `board-health-report-${new Date().toISOString().split('T')[0]}.json`;
    writeFileSync(reportFile, JSON.stringify(report, null, 2));
    console.log(`\n📊 Detailed report saved to: ${reportFile}`);

    return report;
  }

  displayReport(report) {
    console.log('\n' + '='.repeat(60));
    console.log('🏥 BOARD HEALTH REPORT');
    console.log('='.repeat(60));

    console.log(`\n📊 Overall Status: ${report.healthy ? '✅ HEALTHY' : '⚠️  NEEDS ATTENTION'}`);
    console.log(`📅 Timestamp: ${report.timestamp}`);

    console.log('\n📈 Summary:');
    console.log(`  Total Tasks: ${report.summary.total_tasks}`);
    console.log(`  Incoming Tasks: ${report.summary.incoming_count}`);
    console.log(`  WIP Violations: ${report.summary.wip_violations}`);
    console.log(`  Duplicates Found: ${report.summary.duplicates_found}`);

    if (report.issues.length > 0) {
      console.log('\n⚠️  Issues:');
      report.issues.forEach((issue) => console.log(`  • ${issue}`));
    }

    if (report.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      report.recommendations.forEach((rec) => console.log(`  • ${rec}`));
    }

    if (report.automated_actions.length > 0) {
      console.log('\n🔧 Automated Actions Taken:');
      report.automated_actions.forEach((action) => console.log(`  • ${action}`));
    }

    console.log('\n📋 Board Snapshot:');
    for (const [column, data] of Object.entries(report.board_snapshot)) {
      const utilization =
        typeof data.utilization === 'number'
          ? `${(data.utilization * 100).toFixed(1)}%`
          : data.utilization;
      console.log(`  ${column}: ${data.count}/${data.wip_limit} (${utilization})`);
    }

    console.log('\n' + '='.repeat(60));
  }
}

// Run the monitor if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const monitor = new BoardHealthMonitor();
  monitor.run().catch(console.error);
}

export default BoardHealthMonitor;
