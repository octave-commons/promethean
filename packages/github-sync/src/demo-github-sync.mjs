#!/usr/bin/env node

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Demo mode GitHub sync (no actual API calls)
class DemoGitHubSync {
  constructor() {
    this.dryRun = true;
  }

  async testKanbanExtraction() {
    console.log('📋 Testing kanban task extraction...\n');

    const columns = ['icebox', 'incoming', 'accepted', 'breakdown', 'blocked', 'ready', 'todo', 'in_progress', 'review', 'document', 'done', 'rejected'];
    const allTasks = [];

    for (const columnName of columns) {
      try {
        console.log(`   Getting tasks from "${columnName}" column...`);
        const { stdout } = await execAsync(`pnpm kanban getByColumn "${columnName}"`);

        // getByColumn outputs NDJSON (one JSON object per line)
        const lines = stdout.trim().split('\n').filter(line => line.trim());
        const tasks = lines.map(line => JSON.parse(line));

        for (const task of tasks) {
          allTasks.push({
            ...task,
            column: columnName,
            githubIssueTitle: task.title || task.metadata?.title || `Task ${task.uuid}`,
          });
        }

        console.log(`   Found ${tasks.length} tasks in "${columnName}"`);
      } catch (error) {
        console.log(`   No tasks found in "${columnName}" column`);
      }
    }

    console.log(`\n✅ Extracted ${allTasks.length} total tasks from kanban board`);
    return allTasks;
  }

  async simulateGitHubSync(tasks) {
    console.log(`\n🔄 Simulating GitHub sync for ${tasks.length} tasks...\n`);

    // Only sync first 3 tasks for demo
    const sampleTasks = tasks.slice(0, 3);
    const results = [];

    for (const task of sampleTasks) {
      console.log(`🔄 Processing task: "${task.githubIssueTitle}"`);
      console.log(`   Column: ${task.column}`);
      console.log(`   UUID: ${task.uuid}`);
      console.log(`   Status: ${task.status}`);
      console.log(`   Priority: ${task.metadata?.priority || 'Not set'}`);

      // Simulate searching for existing issue
      console.log(`   🔍 Searching for existing issue... (simulated)`);

      // Simulate creating new issue
      console.log(`   ➕ Creating new GitHub issue... (simulated)`);
      console.log(`   ✅ Would create issue: https://github.com/owner/repo/issues/1234`);

      results.push({
        success: true,
        task,
        simulatedUrl: `https://github.com/owner/repo/issues/1234`
      });

      console.log('');
    }

    return results;
  }

  async runDemo() {
    console.log('🚀 GitHub Sync Demo Mode (No API Calls)\n');
    console.log('This demonstrates the task extraction and sync logic without requiring a real GitHub repository.\n');

    // Extract tasks from kanban
    const tasks = await this.testKanbanExtraction();

    if (tasks.length === 0) {
      console.log('❌ No tasks found in kanban board');
      return;
    }

    console.log(`\n📝 Found ${tasks.length} tasks to process`);
    console.log(`🔄 Simulating sync for first 3 tasks...\n`);

    // Simulate sync
    const results = await this.simulateGitHubSync(tasks);

    // Summary
    const successful = results.filter(r => r.success).length;

    console.log(`✅ GitHub sync demo completed!`);
    console.log(`📊 Summary:`);
    console.log(`   - Successfully processed: ${successful} tasks`);
    console.log(`   - Total available to sync: ${tasks.length} tasks`);
    console.log(`   - Demo mode: No actual API calls made`);

    // Show sample task data
    if (tasks.length > 0) {
      console.log(`\n📋 Sample task data from board:`);
      const sampleTask = tasks[0];
      console.log(`   Title: ${sampleTask.githubIssueTitle}`);
      console.log(`   UUID: ${sampleTask.uuid}`);
      console.log(`   Column: ${sampleTask.column}`);
      console.log(`   Status: ${sampleTask.status}`);
      console.log(`   Priority: ${sampleTask.metadata?.priority || 'Not set'}`);
      if (sampleTask.metadata?.description) {
        console.log(`   Description: ${sampleTask.metadata.description.substring(0, 100)}...`);
      }
    }

    return { results, totalAvailable: tasks.length };
  }
}

// CLI entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  const sync = new DemoGitHubSync();

  sync.runDemo()
    .then(() => {
      console.log('\n🎉 GitHub sync demo completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ GitHub sync demo failed:', error.message);
      process.exit(1);
    });
}

export default DemoGitHubSync;