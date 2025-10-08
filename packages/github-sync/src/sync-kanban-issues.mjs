#!/usr/bin/env node

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

class SimpleKanbanIssueSync {
  constructor() {
    this.GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    this.GITHUB_OWNER = process.env.GITHUB_OWNER || 'riatzukiza';
    this.GITHUB_REPO = process.env.GITHUB_REPO || 'promethean';

    if (!this.GITHUB_TOKEN) {
      throw new Error('GITHUB_TOKEN environment variable is required');
    }

    this.headers = {
      'Authorization': `token ${this.GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    };
  }

  async githubRequest(url, options = {}) {
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));

    const response = await fetch(url, {
      headers: this.headers,
      ...options,
    });

    if (!response.ok) {
      throw new Error(`GitHub API request failed: ${response.statusText} (${response.status})`);
    }

    return response.json();
  }

  async testRepository() {
    console.log(`🔍 Testing repository access: ${this.GITHUB_OWNER}/${this.GITHUB_REPO}`);

    try {
      const repo = await this.githubRequest(`https://api.github.com/repos/${this.GITHUB_OWNER}/${this.GITHUB_REPO}`);
      console.log(`✅ Repository accessible: ${repo.html_url}`);
      console.log(`   Default branch: ${repo.default_branch}`);
      return repo;
    } catch (error) {
      console.error(`❌ Repository access failed: ${error.message}`);
      throw error;
    }
  }

  async searchKanbanTasks() {
    console.log('\n📋 Searching for kanban-related tasks...');

    try {
      const { stdout } = await execAsync('pnpm kanban search kanban');
      const searchResults = JSON.parse(stdout.trim());

      console.log(`✅ Found ${searchResults.exact.length} exact kanban matches`);
      console.log(`✅ Found ${searchResults.similar.length} similar kanban matches`);

      // Combine exact and similar matches
      const allTasks = [...searchResults.exact, ...searchResults.similar];

      // Sort by priority (P1 first, then P2, etc.)
      allTasks.sort((a, b) => {
        const priorityOrder = { 'P1': 1, 'P2': 2, 'P3': 3, 'p1': 1, 'p2': 2, 'p3': 3 };
        const aPriority = priorityOrder[a.priority] || 999;
        const bPriority = priorityOrder[b.priority] || 999;
        return aPriority - bPriority;
      });

      return allTasks;
    } catch (error) {
      console.error('❌ Failed to search kanban tasks:', error.message);
      return [];
    }
  }

  async createGitHubIssue(task) {
    console.log(`\n🔄 Creating issue for task: "${task.title}"`);
    console.log(`   UUID: ${task.uuid}`);
    console.log(`   Status: ${task.status}`);
    console.log(`   Priority: ${task.priority || 'Not set'}`);
    console.log(`   Column: ${task.status}`);

    const body = `**📋 Task Details**
- **UUID:** \`${task.uuid}\`
- **Status:** ${task.status}
- **Priority:** ${task.priority || 'Not set'}
- **Labels:** ${task.labels ? task.labels.join(', ') : 'None'}

**🔄 Sync Information**
This issue was automatically created from the Promethean kanban board sync.
- **Last updated:** ${new Date().toISOString()}
- **Original column:** ${task.status}

**📝 Original Task Content**
${task.content || 'No description available.'}

---
> 🤖 *This task is part of the Promethean kanban system and is automatically synchronized with GitHub issues.*
>
> **Kanban Board:** Internal Promethean System
> **Repository:** [${this.GITHUB_OWNER}/${this.GITHUB_REPO}](https://github.com/${this.GITHUB_OWNER}/${this.GITHUB_REPO})
>
> **To see the full kanban board**, check the internal Promethean development system or contact the maintainers.`;

    const labels = [
      'kanban-sync',
      task.status,
      `priority-${task.priority || 'P3'}`,
      'automated-sync',
      ...(task.labels || [])
    ].filter(Boolean);

    const url = `https://api.github.com/repos/${this.GITHUB_OWNER}/${this.GITHUB_REPO}/issues`;

    const issue = await this.githubRequest(url, {
      method: 'POST',
      body: JSON.stringify({
        title: task.title,
        body,
        labels,
      }),
    });

    console.log(`   ✅ Created issue: ${issue.html_url}`);
    console.log(`   🏷️  Labels: ${labels.join(', ')}`);

    return issue;
  }

  async syncKanbanTasksToIssues() {
    console.log(`🚀 Starting kanban tasks sync to GitHub issues in: ${this.GITHUB_OWNER}/${this.GITHUB_REPO}\n`);

    // Test repository access
    await this.testRepository();

    // Search for kanban tasks
    const tasks = await this.searchKanbanTasks();

    if (tasks.length === 0) {
      console.log('❌ No kanban tasks found to sync');
      return;
    }

    console.log(`\n📝 Found ${tasks.length} kanban-related tasks`);
    console.log(`🔄 Syncing top priority tasks to GitHub issues...\n`);

    const results = [];
    const maxTasks = 10; // Sync top 10 tasks for now
    const selectedTasks = tasks.slice(0, maxTasks);

    console.log(`📋 Selected ${selectedTasks.length} highest priority tasks to sync:\n`);

    for (let i = 0; i < selectedTasks.length; i++) {
      const task = selectedTasks[i];
      console.log(`\n[${i + 1}/${selectedTasks.length}] Processing: "${task.title}"`);

      try {
        const issue = await this.createGitHubIssue(task);
        results.push({
          success: true,
          task,
          issue,
          issueNumber: issue.number,
          issueUrl: issue.html_url
        });
      } catch (error) {
        console.error(`   ❌ Failed to create issue: ${error.message}`);
        results.push({
          success: false,
          task,
          error: error.message
        });
      }
    }

    // Summary
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`\n${'='.repeat(60)}`);
    console.log(`✅ Kanban tasks sync completed!`);
    console.log(`${'='.repeat(60)}`);
    console.log(`📊 Summary:`);
    console.log(`   ✅ Successfully created: ${successful} GitHub issues`);
    console.log(`   ❌ Failed: ${failed} tasks`);
    console.log(`   📝 Total available: ${tasks.length} kanban tasks`);
    console.log(`   🔗 Repository: https://github.com/${this.GITHUB_OWNER}/${this.GITHUB_REPO}/issues`);

    if (successful > 0) {
      console.log(`\n🏷️  Created GitHub Issues:`);
      results.filter(r => r.success).forEach(result => {
        const priority = result.task.priority || 'P3';
        const status = result.task.status || 'unknown';
        console.log(`   • #${result.issueNumber} ${result.issue.title}`);
        console.log(`     Status: ${status} | Priority: ${priority}`);
        console.log(`     🔗 ${result.issueUrl}`);
      });
    }

    if (failed > 0) {
      console.log(`\n❌ Failed to create issues for:`);
      results.filter(r => !r.success).forEach(result => {
        console.log(`   • ${result.task.title} - ${result.error}`);
      });
    }

    console.log(`\n🎉 You can now create a GitHub Project board and add these issues to it!`);
    console.log(`📋 Go to: https://github.com/${this.GITHUB_OWNER}/${this.GITHUB_REPO}/projects/new to create a new project.`);

    return { results, totalAvailable: tasks.length };
  }
}

// CLI entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  const sync = new SimpleKanbanIssueSync();

  sync.syncKanbanTasksToIssues()
    .then(() => {
      console.log('\n🎉 Kanban sync to GitHub Issues completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Kanban sync failed:', error.message);
      process.exit(1);
    });
}

export default SimpleKanbanIssueSync;