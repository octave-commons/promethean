#!/usr/bin/env node

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

class GitHubRepoCreatorAndSync {
  constructor() {
    this.GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    this.GITHUB_OWNER = process.env.GITHUB_OWNER || 'riatzukiza';
    this.GITHUB_REPO = process.env.GITHUB_REPO || 'kanban-board';

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
    const response = await fetch(url, {
      headers: this.headers,
      ...options,
    });

    if (!response.ok) {
      throw new Error(`GitHub API request failed: ${response.statusText} (${response.status})`);
    }

    return response.json();
  }

  async createRepository() {
    console.log(`🔨 Creating repository ${this.GITHUB_OWNER}/${this.GITHUB_REPO}...`);

    const url = `https://api.github.com/user/repos`;

    try {
      const repo = await this.githubRequest(url, {
        method: 'POST',
        body: JSON.stringify({
          name: this.GITHUB_REPO,
          description: 'Kanban board for Promethean development - auto-synced from internal kanban system',
          private: false,
          has_issues: true,
          has_projects: true,
          has_wiki: false,
        }),
      });

      console.log(`✅ Repository created: ${repo.html_url}`);
      console.log(`   Name: ${repo.full_name}`);
      console.log(`   Default branch: ${repo.default_branch}`);

      return repo;
    } catch (error) {
      if (error.message.includes('name already exists')) {
        console.log(`ℹ️  Repository ${this.GITHUB_OWNER}/${this.GITHUB_REPO} already exists`);
        // Get existing repo info
        const existingRepo = await this.githubRequest(`https://api.github.com/repos/${this.GITHUB_OWNER}/${this.GITHUB_REPO}`);
        console.log(`✅ Using existing repository: ${existingRepo.html_url}`);
        return existingRepo;
      } else {
        throw error;
      }
    }
  }

  async searchKanbanTasks() {
    console.log('\n📋 Searching for kanban-related tasks...');

    try {
      const { stdout } = await execAsync('pnpm kanban search kanban');
      const searchResults = JSON.parse(stdout.trim());

      console.log(`✅ Found ${searchResults.exact.length} exact kanban matches`);
      console.log(`✅ Found ${searchResults.similar.length} similar kanban matches`);

      return [...searchResults.exact, ...searchResults.similar];
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

    const body = `**Task Details:**
- UUID: ${task.uuid}
- Status: ${task.status}
- Priority: ${task.priority || 'Not set'}
- Labels: ${task.labels ? task.labels.join(', ') : 'None'}

**Sync Information:**
This issue was automatically created from the kanban board sync.
Last updated: ${new Date().toISOString()}

**Original Task:**
${task.content || 'No description available.'}

---
*This task is part of the Promethean kanban system and is automatically synchronized with GitHub issues.*`;

    const labels = ['kanban-sync', task.status, `priority-${task.priority || 'P3'}`, ...(task.labels || [])].filter(Boolean);

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
    return issue;
  }

  async syncKanbanTasksToGitHub() {
    console.log(`🚀 Starting kanban tasks sync to GitHub repository: ${this.GITHUB_OWNER}/${this.GITHUB_REPO}\n`);

    // Create repository
    await this.createRepository();

    // Search for kanban tasks
    const tasks = await this.searchKanbanTasks();

    if (tasks.length === 0) {
      console.log('❌ No kanban tasks found to sync');
      return;
    }

    console.log(`\n📝 Found ${tasks.length} kanban-related tasks to sync`);
    console.log(`🔄 Syncing tasks to GitHub issues...\n`);

    const results = [];
    const batchSize = 5; // Only sync first 5 for demo
    const sampleTasks = tasks.slice(0, batchSize);

    for (const task of sampleTasks) {
      try {
        const issue = await this.createGitHubIssue(task);
        results.push({ success: true, task, issue });

        // Rate limiting - wait between API calls
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`   ❌ Failed to create issue for task "${task.title}": ${error.message}`);
        results.push({ success: false, task, error: error.message });
      }
    }

    // Summary
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`\n✅ Kanban tasks sync completed!`);
    console.log(`📊 Summary:`);
    console.log(`   - Successfully created: ${successful} GitHub issues`);
    console.log(`   - Failed: ${failed} tasks`);
    console.log(`   - Total available: ${tasks.length} kanban tasks`);
    console.log(`   - Repository: https://github.com/${this.GITHUB_OWNER}/${this.GITHUB_REPO}`);

    // Show sample of created issues
    if (successful > 0) {
      console.log(`\n🔗 Created GitHub Issues:`);
      results.filter(r => r.success).forEach(result => {
        console.log(`   - ${result.issue.title}: ${result.issue.html_url}`);
      });
    }

    return { results, totalAvailable: tasks.length };
  }
}

// CLI entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  const sync = new GitHubRepoCreatorAndSync();

  sync.syncKanbanTasksToGitHub()
    .then(() => {
      console.log('\n🎉 Kanban board creation and sync completed successfully!');
      console.log('You can now view your kanban tasks on GitHub!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Kanban board creation and sync failed:', error.message);
      process.exit(1);
    });
}

export default GitHubRepoCreatorAndSync;