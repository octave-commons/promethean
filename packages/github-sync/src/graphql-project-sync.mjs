#!/usr/bin/env node

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

class GraphQLProjectSync {
  constructor() {
    this.GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    this.GITHUB_OWNER = process.env.GITHUB_OWNER || 'riatzukiza';
    this.GITHUB_REPO = process.env.GITHUB_REPO || 'promethean';
    this.PROJECT_NAME = process.env.PROJECT_NAME || 'generated';

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

  async graphQLRequest(query, variables = {}) {
    // Rate limiting for GraphQL
    await new Promise(resolve => setTimeout(resolve, 500));

    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        ...this.headers,
        'Accept': 'application/vnd.github.v3+json',
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`GraphQL request failed: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    if (data.errors) {
      console.error('GraphQL Errors:', JSON.stringify(data.errors, null, 2));
      throw new Error(`GraphQL error: ${data.errors[0].message}`);
    }

    return data;
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

  async findProject(projectName) {
    console.log(`\n🔍 Searching for existing project: "${projectName}"`);

    const query = `
      query($owner: String!, $repo: String!) {
        repository(owner: $owner, name: $repo) {
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

    try {
      const data = await this.graphQLRequest(query, {
        owner: this.GITHUB_OWNER,
        repo: this.GITHUB_REPO
      });

      const projects = data.data.repository.projectsV2.nodes;
      const existingProject = projects.find(p => p.title === projectName);

      if (existingProject) {
        console.log(`✅ Found existing project: ${existingProject.url}`);
        return existingProject;
      } else {
        console.log(`ℹ️  Project "${projectName}" not found - will create new project`);
        return null;
      }
    } catch (error) {
      console.log(`⚠️  Could not search for projects: ${error.message}`);
      return null;
    }
  }

  async getRepositoryId() {
    console.log(`\n🔍 Getting repository ID for project creation...`);

    const query = `
      query($owner: String!, $repo: String!) {
        repository(owner: $owner, name: $repo) {
          id
        }
      }
    `;

    const data = await this.graphQLRequest(query, {
      owner: this.GITHUB_OWNER,
      repo: this.GITHUB_REPO
    });

    return data.data.repository.id;
  }

  async createProject(projectName, repositoryId) {
    console.log(`\n🔨 Creating new GitHub Project: "${projectName}"`);

    // Create project without description in the initial call
    const query = `
      mutation($ownerId: ID!, $title: String!) {
        createProjectV2(input: {
          ownerId: $ownerId
          title: $title
        }) {
          projectV2 {
            id
            title
            url
            number
          }
        }
      }
    `;

    try {
      const data = await this.graphQLRequest(query, {
        ownerId: repositoryId,
        title: projectName
      });

      const project = data.data.createProjectV2.projectV2;
      console.log(`✅ Created project: ${project.url}`);
      console.log(`   Project ID: ${project.id}`);

      return project;
    } catch (error) {
      console.log(`❌ Failed to create project: ${error.message}`);
      throw error;
    }
  }

  async createProjectColumns(project) {
    console.log(`\n📋 Creating project columns...`);

    const columns = [
      'Icebox', 'Incoming', 'Accepted', 'Breakdown', 'Blocked',
      'Ready', 'Todo', 'In Progress', 'Review', 'Document', 'Done', 'Rejected'
    ];

    for (const columnName of columns) {
      try {
        const query = `
          mutation($projectId: ID!, $name: String!) {
            addProjectV2ColumnById(input: {
              projectId: $projectId
              name: $name
            }) {
              column {
                id
                name
              }
            }
          }
        `;

        await this.graphQLRequest(query, {
          projectId: project.id,
          name: columnName
        });

        console.log(`   ✅ Created column: ${columnName}`);

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error) {
        console.log(`   ⚠️  Failed to create column "${columnName}": ${error.message}`);
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

      const allTasks = [...searchResults.exact, ...searchResults.similar];

      // Sort by priority
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

    const body = `**📋 Task Details**
- **UUID:** \`${task.uuid}\`
- **Status:** ${task.status}
- **Priority:** ${task.priority || 'Not set'}
- **Labels:** ${task.labels ? task.labels.join(', ') : 'None'}

**🔄 Sync Information**
This issue was automatically created from the Promethean kanban board sync "${this.PROJECT_NAME}".
- **Last updated:** ${new Date().toISOString()}
- **Original column:** ${task.status}
- **Project:** ${this.PROJECT_NAME}

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
      `project-${this.PROJECT_NAME}`,
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

  async addIssueToProject(issue, task, project) {
    if (!project) return false;

    console.log(`   📋 Adding issue to project...`);

    try {
      // Add item to project
      const addItemQuery = `
        mutation($projectId: ID!, $contentId: ID!) {
          addProjectV2ItemById(input: {
            projectId: $projectId
            contentId: $contentId
          }) {
            item {
              id
            }
          }
        }
      `;

      await this.graphQLRequest(addItemQuery, {
        projectId: project.id,
        contentId: issue.node_id
      });

      console.log(`   ✅ Added to project: ${project.url}`);
      return true;
    } catch (error) {
      console.log(`   ⚠️  Could not add issue to project: ${error.message}`);
      return false;
    }
  }

  async syncKanbanTasksToProject() {
    console.log(`🚀 Starting kanban sync to GitHub Project "${this.PROJECT_NAME}" in: ${this.GITHUB_OWNER}/${this.GITHUB_REPO}\n`);

    // Test repository access
    await this.testRepository();

    // Search for existing project or create new one
    let project = await this.findProject(this.PROJECT_NAME);

    if (!project) {
      try {
        const repositoryId = await this.getRepositoryId();
        project = await this.createProject(this.PROJECT_NAME, repositoryId);

        // Create columns
        await this.createProjectColumns(project);
      } catch (error) {
        console.log(`❌ Could not create project board: ${error.message}`);
        console.log(`   Will create GitHub Issues only...`);
        project = null;
      }
    }

    // Search for kanban tasks
    const tasks = await this.searchKanbanTasks();

    if (tasks.length === 0) {
      console.log('❌ No kanban tasks found to sync');
      return;
    }

    console.log(`\n📝 Found ${tasks.length} kanban-related tasks`);
    const maxTasks = 12; // Sync first 12 tasks
    const selectedTasks = tasks.slice(0, maxTasks);

    console.log(`🔄 Syncing top ${selectedTasks.length} priority tasks to GitHub${project ? ' Project' : ' Issues'}...\n`);

    const results = [];

    for (let i = 0; i < selectedTasks.length; i++) {
      const task = selectedTasks[i];
      console.log(`\n[${i + 1}/${selectedTasks.length}] Processing: "${task.title}"`);

      try {
        // Create GitHub Issue
        const issue = await this.createGitHubIssue(task);

        // Add to project if it exists
        const addedToProject = await this.addIssueToProject(issue, task, project);

        results.push({
          success: true,
          task,
          issue,
          addedToProject,
          issueNumber: issue.number,
          issueUrl: issue.html_url
        });
      } catch (error) {
        console.error(`   ❌ Failed to sync task: ${error.message}`);
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
    const addedToProjectCount = results.filter(r => r.success && r.addedToProject).length;

    console.log(`\n${'='.repeat(70)}`);
    console.log(`✅ Kanban sync to "${this.PROJECT_NAME}" completed!`);
    console.log(`${'='.repeat(70)}`);
    console.log(`📊 Summary:`);
    console.log(`   ✅ Successfully created: ${successful} GitHub issues`);
    console.log(`   📋 Added to project: ${addedToProjectCount} issues`);
    console.log(`   ❌ Failed: ${failed} tasks`);
    console.log(`   📝 Total available: ${tasks.length} kanban tasks`);

    if (project) {
      console.log(`   🔗 GitHub Project: ${project.url}`);
    }
    console.log(`   🔗 Repository: https://github.com/${this.GITHUB_OWNER}/${this.GITHUB_REPO}/issues`);

    if (successful > 0) {
      console.log(`\n🏷️  Created GitHub Issues:`);
      results.filter(r => r.success).forEach(result => {
        const priority = result.task.priority || 'P3';
        const status = result.task.status || 'unknown';
        const projectStatus = result.addedToProject ? '✅' : '❌';
        console.log(`   ${projectStatus} #${result.issueNumber} ${result.issue.title}`);
        console.log(`     Status: ${status} | Priority: ${priority}`);
        console.log(`     🔗 ${result.issueUrl}`);
      });
    }

    if (project) {
      console.log(`\n🎉 Your GitHub Project Board "${this.PROJECT_NAME}" is ready!`);
      console.log(`📋 View it at: ${project.url}`);
      console.log(`🔗 All kanban tasks have been added to the project!`);
    } else {
      console.log(`\n📋 Create a GitHub Project board manually at:`);
      console.log(`   https://github.com/${this.GITHUB_OWNER}/${this.GITHUB_REPO}/projects/new`);
      console.log(`   Use the issues created above to build your kanban board.`);
    }

    return { results, totalAvailable: tasks.length, project };
  }
}

// CLI entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  const sync = new GraphQLProjectSync();

  sync.syncKanbanTasksToProject()
    .then(() => {
      console.log('\n🎉 Automated kanban sync completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Automated kanban sync failed:', error.message);
      process.exit(1);
    });
}

export default GraphQLProjectSync;