#!/usr/bin/env node

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

class GitHubProjectSync {
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
    await new Promise(resolve => setTimeout(resolve, 500));

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

  async searchForProject(projectName) {
    console.log(`\n🔍 Searching for existing project: "${projectName}"`);

    const query = `
      query {
        repository(owner: "${this.GITHUB_OWNER}", name: "${this.GITHUB_REPO}") {
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
    const existingProject = projects.find(p => p.title === projectName);

    if (existingProject) {
      console.log(`✅ Found existing project: ${existingProject.url}`);
      return existingProject;
    } else {
      console.log(`ℹ️  Project "${projectName}" not found - will create new project`);
      return null;
    }
  }

  async createProject(projectName) {
    console.log(`\n🔨 Creating new GitHub Project: "${projectName}"`);

    const query = `
      mutation {
        createProjectV2(
          input: {
            ownerId: "${this.GITHUB_OWNER}"
            title: "${projectName}"
            description: "Auto-synced kanban board from Promethean development system"
          }
        ) {
          projectV2 {
            id
            title
            url
            number
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
      throw new Error(`Project creation failed: ${response.statusText}`);
    }

    const data = await response.json();
    if (data.errors) {
      throw new Error(`Project creation error: ${data.errors[0].message}`);
    }

    const project = data.data.createProjectV2.projectV2;
    console.log(`✅ Created project: ${project.url}`);

    // Create columns based on kanban board structure
    await this.createProjectColumns(project.id);

    return project;
  }

  async createProjectColumns(projectId) {
    console.log(`\n📋 Creating project columns...`);

    const columns = [
      'Icebox', 'Incoming', 'Accepted', 'Breakdown', 'Blocked',
      'Ready', 'Todo', 'In Progress', 'Review', 'Document', 'Done', 'Rejected'
    ];

    for (const columnName of columns) {
      try {
        const query = `
          mutation {
            addProjectV2ColumnById(input: {
              projectId: "${projectId}"
              name: "${columnName}"
            }) {
              column {
                id
                name
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
          console.log(`⚠️  Failed to create column "${columnName}": ${response.statusText}`);
        } else {
          console.log(`   ✅ Created column: ${columnName}`);
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error) {
        console.log(`⚠️  Failed to create column "${columnName}": ${error.message}`);
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

    return issue;
  }

  async addIssueToProject(issue, task, project) {
    // First, get the column ID that matches the task status
    const columnName = this.mapStatusToColumn(task.status);

    const query = `
      mutation {
        addProjectV2ItemById(input: {
          projectId: "${project.id}"
          contentId: "${issue.node_id}"
        }) {
          item {
            id
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
      throw new Error(`Failed to add issue to project: ${response.statusText}`);
    }

    console.log(`   📋 Added to project column: ${columnName}`);
    return true;
  }

  mapStatusToColumn(status) {
    const columnMap = {
      'icebox': 'Icebox',
      'incoming': 'Incoming',
      'accepted': 'Accepted',
      'breakdown': 'Breakdown',
      'blocked': 'Blocked',
      'ready': 'Ready',
      'todo': 'Todo',
      'in_progress': 'In Progress',
      'review': 'Review',
      'document': 'Document',
      'done': 'Done',
      'rejected': 'Rejected'
    };

    return columnMap[status] || 'Todo';
  }

  async syncKanbanTasksToProject() {
    console.log(`🚀 Starting kanban sync to GitHub Project: ${this.GITHUB_OWNER}/${this.GITHUB_REPO}\n`);

    // Test repository access
    await this.testRepository();

    // Search or create project
    const projectName = 'Kanban Board';
    let project = await this.searchForProject(projectName);

    if (!project) {
      project = await this.createProject(projectName);
    }

    // Search for kanban tasks
    const tasks = await this.searchKanbanTasks();

    if (tasks.length === 0) {
      console.log('❌ No kanban tasks found to sync');
      return;
    }

    console.log(`\n📝 Found ${tasks.length} kanban-related tasks to sync`);
    console.log(`🔄 Syncing tasks to GitHub Project: ${project.url}\n`);

    const results = [];
    const batchSize = 8; // Sync first 8 tasks for demo
    const sampleTasks = tasks.slice(0, batchSize);

    for (const task of sampleTasks) {
      try {
        console.log(`🔄 Processing task: "${task.title}"`);
        console.log(`   Status: ${task.status} → ${this.mapStatusToColumn(task.status)}`);

        // Create GitHub Issue
        const issue = await this.createGitHubIssue(task);
        console.log(`   ✅ Created issue: ${issue.html_url}`);

        // Add issue to project
        await this.addIssueToProject(issue, task, project);

        results.push({ success: true, task, issue });

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`   ❌ Failed to sync task "${task.title}": ${error.message}`);
        results.push({ success: false, task, error: error.message });
      }
    }

    // Summary
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`\n✅ Kanban sync to GitHub Project completed!`);
    console.log(`📊 Summary:`);
    console.log(`   - Successfully synced: ${successful} tasks`);
    console.log(`   - Failed: ${failed} tasks`);
    console.log(`   - Total available: ${tasks.length} kanban tasks`);
    console.log(`   - GitHub Project: ${project.url}`);

    if (successful > 0) {
      console.log(`\n🔗 Created GitHub Issues and added to project:`);
      results.filter(r => r.success).forEach(result => {
        console.log(`   - ${result.issue.title}: ${result.issue.html_url}`);
      });
    }

    console.log(`\n🎉 You can now view your kanban board on GitHub at: ${project.url}`);

    return { results, totalAvailable: tasks.length, project };
  }
}

// CLI entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  const sync = new GitHubProjectSync();

  sync.syncKanbanTasksToProject()
    .then(() => {
      console.log('\n🎉 Kanban board sync to GitHub Project completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Kanban board sync failed:', error.message);
      process.exit(1);
    });
}

export default GitHubProjectSync;