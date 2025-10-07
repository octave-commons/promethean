#!/usr/bin/env node

/**
 * GitHub Project Board Sync Tool
 *
 * Syncs Obsidian kanban board with GitHub Projects board while preserving
 * the original wikilink-based workflow for local development.
 *
 * Features:
 * - Converts wikilinks to GitHub-friendly markdown for issues
 * - Syncs task status between kanban board and GitHub project
 * - Preserves Obsidian workflow locally
 * - Supports both GitHub Projects v1 (classic) and v2
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration
const CONFIG = {
  // Kanban board file
  kanbanFile: path.resolve(process.env.KANBAN_BOARD_FILE || 'docs/agile/boards/generated.md'),
  tasksDir: path.resolve(process.env.KANBAN_TASKS_DIR || 'docs/agile/tasks'),
  // GitHub configuration
  token: process.env.GITHUB_TOKEN || process.env.GH_PAT,
  owner: process.env.GITHUB_OWNER || 'riatzukiza',
  repo: process.env.GITHUB_REPO || 'promethean',
  // Project configuration
  projectId: process.env.GITHUB_PROJECT_ID,
  // Sync behavior
  dryRun: process.env.DRY_RUN === 'true',
  createIssues: process.env.CREATE_ISSUES !== 'false',
  updateExisting: process.env.UPDATE_EXISTING !== 'false',
};

// ANSI colors for output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

// Wikilink to GitHub markdown conversion
function convertWikilinksToGithubMarkdown(text) {
  // Convert [[filename]] to [filename](filename.md)
  return text.replace(
    /\[\[([^\]|]+)(\|([^\]]+))?\]\]/g,
    (match, target, _pipe, alias) => {
      const parts = target.split('#');
      const base = parts[0];
      const anchor = parts[1] ? `#${parts[1]}` : '';
      const displayName = alias || base;
      return `[${displayName}](${base}.md${anchor})`;
    }
  );
}

// Parse kanban board content
function parseKanbanBoard(content) {
  const lines = content.split('\n');
  const columns = {};
  let currentColumn = null;
  let columnOrder = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // Column headers (## column-name)
    if (trimmed.startsWith('## ')) {
      currentColumn = trimmed.slice(3).toLowerCase();
      if (!columns[currentColumn]) {
        columns[currentColumn] = [];
        columnOrder.push(currentColumn);
      }
      continue;
    }

    // Task items (- [ ] [[task-name]] #tags)
    if (currentColumn && trimmed.startsWith('- [ ] [[')) {
      const taskMatch = trimmed.match(/^- \[ \] \[\[([^\]]+)\]\](.*)$/);
      if (taskMatch) {
        const [, taskName, rest] = taskMatch;
        const tagsMatch = rest.match(/#([^#\s]+)/g) || [];
        const tags = tagsMatch.map(tag => tag.slice(1));

        // Extract UUID if present
        const uuidMatch = rest.match(/\(uuid:([a-f0-9-]+)\)/);
        const uuid = uuidMatch ? uuidMatch[1] : null;

        // Extract priority
        const priorityMatch = rest.match(/prio:(P[0-3])/i);
        const priority = priorityMatch ? priorityMatch[1].toUpperCase() : 'P3';

        columns[currentColumn].push({
          name: taskName,
          tags,
          uuid,
          priority,
          rawLine: trimmed,
        });
      }
    }
  }

  return { columns, columnOrder };
}

// Load task file content
async function loadTaskContent(taskName) {
  const taskFile = path.join(CONFIG.tasksDir, `${taskName}.md`);
  try {
    const content = await fs.readFile(taskFile, 'utf-8');

    // Parse frontmatter
    const frontmatterMatch = content.match(/^---\n(.*?)\n---\n(.*)$/s);
    if (frontmatterMatch) {
      const [, frontmatterStr, body] = frontmatterMatch;
      const frontmatter = {};

      // Simple YAML parsing for basic fields
      frontmatterStr.split('\n').forEach(line => {
        const match = line.match(/^(\w+):\s*(.*)$/);
        if (match) {
          frontmatter[match[1]] = match[2].replace(/^["']|["']$/g, '');
        }
      });

      return {
        frontmatter,
        body: body.trim(),
        content
      };
    }

    return { frontmatter: {}, body: content, content };
  } catch (error) {
    log(colors.yellow, `⚠️  Could not load task file: ${taskFile}`);
    return { frontmatter: {}, body: '', content: '' };
  }
}

// Convert task to GitHub issue format
async function taskToGitHubIssue(task, column) {
  const taskContent = await loadTaskContent(task.name);

  // Convert wikilinks to GitHub-friendly markdown
  const githubBody = convertWikilinksToGithubMarkdown(taskContent.body);

  // Build issue content
  let issueBody = `**Task:** ${task.name}\n`;
  issueBody += `**Status:** ${column}\n`;
  issueBody += `**Priority:** ${task.priority}\n`;

  if (task.uuid) {
    issueBody += `**UUID:** ${task.uuid}\n`;
  }

  if (task.tags.length > 0) {
    issueBody += `**Tags:** ${task.tags.join(', ')}\n`;
  }

  if (githubBody) {
    issueBody += `\n---\n\n${githubBody}`;
  }

  // Add Obsidian reference
  issueBody += `\n\n---\n*📝 Managed via Obsidian kanban board*`;

  return {
    title: task.name,
    body: issueBody,
    labels: [
      ...task.tags.map(tag => tag.toLowerCase()),
      `priority: ${task.priority.toLowerCase()}`,
      'kanban-sync'
    ].filter(Boolean),
  };
}

// GitHub API client
class GitHubClient {
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
      'User-Agent': 'promethean-kanban-sync',
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

  async createIssue(title, body, labels) {
    return this.request('POST', `/repos/${this.owner}/${this.repo}/issues`, {
      title,
      body,
      labels,
    });
  }

  async updateIssue(issueNumber, updates) {
    return this.request('PATCH', `/repos/${this.owner}/${this.repo}/issues/${issueNumber}`, updates);
  }

  async searchIssues(query) {
    return this.request('GET', `/search/issues?q=${encodeURIComponent(query)}+repo:${this.owner}/${this.repo}`);
  }

  async getProjectColumns(projectId) {
    return this.request('GET', `/projects/${projectId}/columns`);
  }

  async createProjectColumn(projectId, name) {
    return this.request('POST', `/projects/${projectId}/columns`, { name });
  }

  async createProjectCard(columnId, content) {
    return this.request('POST', `/projects/columns/${columnId}/cards`, content);
  }

  async updateProjectCard(cardId, updates) {
    return this.request('PATCH', `/projects/columns/cards/${cardId}`, updates);
  }
}

// Column mapping from kanban to GitHub project
const COLUMN_MAPPING = {
  'icebox': 'Ice Box',
  'incoming': 'To Do',
  'accepted': 'In Progress',
  'ready': 'Ready',
  'breakdown': 'Breakdown',
  'blocked': 'Blocked',
  'in progress': 'In Progress',
  'done': 'Done',
  'document': 'Documentation',
};

// Main sync function
async function syncKanbanToGitHub() {
  log(colors.blue, '🔄 Starting Kanban to GitHub sync...');

  if (!CONFIG.token) {
    log(colors.red, '❌ GitHub token not found. Set GITHUB_TOKEN or GH_PAT environment variable.');
    process.exit(1);
  }

  if (CONFIG.dryRun) {
    log(colors.yellow, '🔍 DRY RUN MODE - No changes will be made');
  }

  try {
    // Initialize GitHub client
    const github = new GitHubClient(CONFIG.token, CONFIG.owner, CONFIG.repo);

    // Verify authentication
    const user = await github.getAuthenticatedUser();
    log(colors.green, `✅ Authenticated as: ${user.login}`);

    // Load kanban board
    log(colors.blue, '📋 Loading kanban board...');
    const kanbanContent = await fs.readFile(CONFIG.kanbanFile, 'utf-8');
    const { columns, columnOrder } = parseKanbanBoard(kanbanContent);

    log(colors.green, `📊 Found ${Object.keys(columns).length} columns with tasks`);

    // Sync each column
    for (const columnName of columnOrder) {
      const tasks = columns[columnName];
      if (!tasks || tasks.length === 0) continue;

      log(colors.cyan, `📌 Processing column: ${columnName} (${tasks.length} tasks)`);

      for (const task of tasks) {
        await syncTaskToGitHub(github, task, columnName);
      }
    }

    log(colors.green, '✅ Sync completed successfully!');

  } catch (error) {
    log(colors.red, `❌ Sync failed: ${error.message}`);
    if (process.env.DEBUG) {
      console.error(error);
    }
    process.exit(1);
  }
}

// Sync individual task to GitHub
async function syncTaskToGitHub(github, task, columnName) {
  try {
    // Convert task to GitHub issue format
    const issueData = await taskToGitHubIssue(task, columnName);

    // Search for existing issue
    const searchQuery = `"${task.name}" repo:${CONFIG.owner}/${CONFIG.repo} in:title`;
    const searchResults = await github.searchIssues(searchQuery);

    let existingIssue = searchResults.items?.find(issue =>
      issue.title === task.name && issue.state === 'open'
    );

    if (existingIssue) {
      if (CONFIG.updateExisting) {
        log(colors.blue, `🔄 Updating existing issue: ${task.name}`);

        if (!CONFIG.dryRun) {
          await github.updateIssue(existingIssue.number, {
            body: issueData.body,
            labels: issueData.labels,
          });
        } else {
          log(colors.yellow, `   (Would update issue #${existingIssue.number})`);
        }
      } else {
        log(colors.cyan, `⏭️  Skipping existing issue: ${task.name}`);
      }
    } else if (CONFIG.createIssues) {
      log(colors.green, `➕ Creating new issue: ${task.name}`);

      if (!CONFIG.dryRun) {
        const newIssue = await github.createIssue(
          issueData.title,
          issueData.body,
          issueData.labels
        );
        log(colors.green, `   ✅ Created issue #${newIssue.number}`);
      } else {
        log(colors.yellow, `   (Would create new issue)`);
      }
    }

  } catch (error) {
    log(colors.red, `❌ Failed to sync task "${task.name}": ${error.message}`);
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
GitHub Project Board Sync Tool

Syncs Obsidian kanban board with GitHub Issues while preserving wikilink workflow.

Environment Variables:
  GITHUB_TOKEN or GH_PAT    - GitHub personal access token
  GITHUB_OWNER             - Repository owner (default: riatzukiza)
  GITHUB_REPO              - Repository name (default: promethean)
  GITHUB_PROJECT_ID        - Classic project ID (optional)
  KANBAN_BOARD_FILE        - Path to kanban board file
  KANBAN_TASKS_DIR         - Path to tasks directory
  DRY_RUN                  - Set to 'true' for dry run mode
  CREATE_ISSUES            - Set to 'false' to skip creating issues
  UPDATE_EXISTING          - Set to 'false' to skip updating issues

Usage:
  GITHUB_TOKEN=your_token node tools/github-project-sync.mjs
  GITHUB_TOKEN=your_token DRY_RUN=true node tools/github-project-sync.mjs
`);
    process.exit(0);
  }

  await syncKanbanToGitHub();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { syncKanbanToGitHub, convertWikilinksToGithubMarkdown, parseKanbanBoard };