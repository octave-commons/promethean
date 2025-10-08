#!/usr/bin/env node

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// GitHub API configuration
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER || 'promethean-systems';
const GITHUB_REPO = process.env.GITHUB_REPO || 'promethean';

// Rate limiting configuration
const MIN_API_INTERVAL = 1000; // 1 second minimum between API calls
let lastApiCall = 0;

class GitHubSync {
  constructor() {
    if (!GITHUB_TOKEN) {
      throw new Error('GITHUB_TOKEN environment variable is required');
    }

    this.headers = {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    };
  }

  async rateLimitDelay() {
    const now = Date.now();
    const timeSinceLastCall = now - lastApiCall;
    if (timeSinceLastCall < MIN_API_INTERVAL) {
      await new Promise(resolve => setTimeout(resolve, MIN_API_INTERVAL - timeSinceLastCall));
    }
    lastApiCall = Date.now();
  }

  async githubRequest(url, options = {}) {
    await this.rateLimitDelay();

    const response = await fetch(url, {
      headers: this.headers,
      ...options,
    });

    if (!response.ok) {
      throw new Error(`GitHub API request failed: ${response.statusText} (${response.status})`);
    }

    return response.json();
  }

  async testGitHubConnectivity() {
    try {
      const repoData = await this.githubRequest(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}`);
      console.log(`✅ GitHub API connectivity successful`);
      console.log(`Repository: ${repoData.full_name}`);
      console.log(`Default branch: ${repoData.default_branch}`);
      return repoData;
    } catch (error) {
      console.error('❌ GitHub API test failed:', error.message);
      throw error;
    }
  }

  async searchIssues(query) {
    const url = `https://api.github.com/search/issues?q=${encodeURIComponent(query)}+repo:${GITHUB_OWNER}/${GITHUB_REPO}+is:issue`;
    return await this.githubRequest(url);
  }

  async createIssue(title, body, labels = []) {
    const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues`;
    return await this.githubRequest(url, {
      method: 'POST',
      body: JSON.stringify({
        title,
        body,
        labels,
      }),
    });
  }

  async searchForProject(projectName) {
    const query = `
      query {
        repository(owner: "${GITHUB_OWNER}", name: "${GITHUB_REPO}") {
          projectsV2(first: 10) {
            nodes {
              id
              title
              url
              number
            }
          }
        }
      }
    `;

    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        ...this.headers,
        'Accept': 'application/vnd.github.v3+json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`GraphQL request failed: ${response.statusText}`);
    }

    const data = await response.json();
    if (data.errors) {
      throw new Error(`GraphQL error: ${data.errors[0].message}`);
    }

    const projects = data.data.repository.projectsV2.nodes;
    return projects.find(p => p.title === projectName);
  }

  async extractTasksFromKanban() {
    console.log('📋 Extracting tasks from kanban board...');

    const columns = ['icebox', 'incoming', 'accepted', 'breakdown', 'blocked', 'ready', 'todo', 'in_progress', 'review', 'document', 'done', 'rejected'];
    const allTasks = [];

    for (const columnName of columns) {
      try {
        console.log(`   Getting tasks from "${columnName}" column...`);
        const { stdout } = await execAsync(`pnpm kanban getByColumn "${columnName}"`);
        const tasks = JSON.parse(stdout.trim());

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

    console.log(`✅ Extracted ${allTasks.length} total tasks from kanban board`);
    return allTasks;
  }

  async syncTaskToGitHub(task) {
    console.log(`\n🔄 Syncing task: "${task.githubIssueTitle}"`);
    console.log(`   Column: ${task.column}`);
    console.log(`   UUID: ${task.uuid}`);
    console.log(`   Status: ${task.status}`);

    // Search for existing issue by title
    const searchQuery = `"${task.githubIssueTitle}" repo:${GITHUB_OWNER}/${GITHUB_REPO}`;
    const searchResults = await this.searchIssues(searchQuery);

    if (searchResults.items.length > 0) {
      console.log(`   ✅ Found existing issue: ${searchResults.items[0].html_url}`);
      return searchResults.items[0];
    } else {
      console.log(`   ➕ Creating new GitHub issue...`);

      const body = `**Task Details:**
- UUID: ${task.uuid}
- Status: ${task.status}
- Column: ${task.column}
- Priority: ${task.metadata?.priority || 'Not set'}

**Sync Information:**
This issue was automatically created from the kanban board sync.
Last updated: ${new Date().toISOString()}

**Original Task:**
${task.metadata?.description || 'No description available.'}`;

      const labels = ['kanban-sync', task.column, `priority-${task.metadata?.priority || 'P3'}`].filter(Boolean);

      const issue = await this.createIssue(task.githubIssueTitle, body, labels);
      console.log(`   ✅ Created issue: ${issue.html_url}`);
      return issue;
    }
  }

  async syncProjectBoard(boardName = 'generated') {
    console.log(`🚀 Starting GitHub project board sync: ${boardName}\n`);

    // Test GitHub connectivity
    await this.testGitHubConnectivity();

    // Check if project exists
    console.log(`\n🔍 Checking for existing project: "${boardName}"`);
    const existingProject = await this.searchForProject(boardName);

    if (existingProject) {
      console.log(`✅ Found existing project: ${existingProject.url}`);
    } else {
      console.log(`ℹ️  Project "${boardName}" not found - will sync issues only for now`);
    }

    // Extract tasks from kanban
    const tasks = await this.extractTasksFromKanban();
    console.log(`\n📝 Found ${tasks.length} tasks to process`);

    // Sync a few sample tasks (for demo purposes)
    const sampleTasks = tasks.slice(0, 3); // Only sync first 3 tasks for demo

    console.log(`\n🔄 Syncing ${sampleTasks.length} sample tasks to GitHub issues...`);

    const results = [];
    for (const task of sampleTasks) {
      try {
        const result = await this.syncTaskToGitHub(task);
        results.push({ success: true, task, result });
      } catch (error) {
        console.error(`   ❌ Failed to sync task: ${error.message}`);
        results.push({ success: false, task, error: error.message });
      }
    }

    // Summary
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`\n✅ GitHub sync completed!`);
    console.log(`📊 Summary:`);
    console.log(`   - Successfully synced: ${successful} tasks`);
    console.log(`   - Failed: ${failed} tasks`);
    console.log(`   - Total available to sync: ${tasks.length} tasks`);

    if (existingProject) {
      console.log(`🔗 Project: ${existingProject.url}`);
    }

    return { results, totalAvailable: tasks.length, project: existingProject };
  }
}

// CLI entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  const sync = new GitHubSync();

  sync.syncProjectBoard()
    .then(() => {
      console.log('\n🎉 GitHub project board sync completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ GitHub project board sync failed:', error.message);
      process.exit(1);
    });
}

export default GitHubSync;