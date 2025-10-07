#!/usr/bin/env node

/**
 * Limited sync test - only sync a few tasks to test the fixes
 */

import { promises as fs } from 'fs';
import { convertWikilinksToGithubMarkdown, parseKanbanBoard } from './github-project-sync.mjs';

// Create a minimal test config
const CONFIG = {
  kanbanFile: 'docs/agile/boards/generated.md',
  tasksDir: 'docs/agile/tasks',
  token: process.env.GITHUB_TOKEN,
  owner: 'riatzukiza',
  repo: 'promethean',
  dryRun: true,
  createIssues: false,
  updateExisting: false,
  maxTasks: 3, // Only process first 3 tasks
};

// Simplified GitHub client
class TestGitHubClient {
  constructor(token, owner, repo) {
    this.token = token;
    this.owner = owner;
    this.repo = repo;
    this.baseUrl = 'https://api.github.com';
  }

  async request(method, endpoint, data = null) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Accept': 'application/vnd.github+json',
      'Authorization': `Bearer ${this.token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'promethean-kanban-sync-test',
    };

    if (data) {
      headers['Content-Type'] = 'application/json';
    }

    const options = { method, headers };
    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`GitHub API error: ${response.status} ${response.statusText} - ${errorData.message || 'Unknown error'}`);
    }

    return response.json();
  }

  async getAuthenticatedUser() {
    return this.request('GET', '/user');
  }

  async searchIssues(query) {
    return this.request('GET', `/search/issues?q=${encodeURIComponent(query)}+repo:${this.owner}/${this.repo}+is:issue`);
  }
}

// Test with just a few tasks
async function testLimitedSync() {
  console.log('🧪 Limited sync test started\n');

  if (!CONFIG.token) {
    console.error('❌ GitHub token not found');
    process.exit(1);
  }

  try {
    const github = new TestGitHubClient(CONFIG.token, CONFIG.owner, CONFIG.repo);
    const user = await github.getAuthenticatedUser();
    console.log(`✅ Authenticated as: ${user.login}`);

    // Load kanban board
    const kanbanContent = await fs.readFile(CONFIG.kanbanFile, 'utf-8');
    const { columns } = parseKanbanBoard(kanbanContent);

    console.log(`📊 Found columns: ${Object.keys(columns).join(', ')}`);

    let totalTasksProcessed = 0;
    const maxTasks = CONFIG.maxTasks;

    // Process only first few tasks from the first column
    for (const [columnName, tasks] of Object.entries(columns)) {
      if (totalTasksProcessed >= maxTasks) break;

      console.log(`\n📌 Processing column: ${columnName}`);

      for (const task of tasks) {
        if (totalTasksProcessed >= maxTasks) break;

        console.log(`   Testing task: ${task.name.slice(0, 50)}...`);

        try {
          const searchQuery = `"${task.name}"`;
          const searchResults = await github.searchIssues(searchQuery);

          console.log(`   ✅ Search successful (${searchResults.total_count || 0} results)`);
          totalTasksProcessed++;

          // Add delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (error) {
          console.log(`   ❌ Search failed: ${error.message}`);
        }
      }
    }

    console.log(`\n✅ Test completed! Processed ${totalTasksProcessed} tasks`);

  } catch (error) {
    console.error(`❌ Test failed: ${error.message}`);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  testLimitedSync();
}

export { testLimitedSync };