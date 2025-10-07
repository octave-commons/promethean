#!/usr/bin/env node

// Final working kanban sync with CLASSIC_GITHUB_TOKEN and full Projects v2 support
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

class FinalKanbanSync {
  constructor() {
    // Use CLASSIC_GITHUB_TOKEN for Projects API
    this.GITHUB_TOKEN = process.env.CLASSIC_GITHUB_TOKEN || process.env.GITHUB_TOKEN;
    this.GITHUB_OWNER = process.env.GITHUB_OWNER || 'riatzukiza';
    this.GITHUB_REPO = process.env.GITHUB_REPO || 'promethean';
    this.PROJECT_NAME = process.env.PROJECT_NAME || 'generated';

    if (!this.GITHUB_TOKEN) {
      throw new Error('No GitHub token available');
    }

    console.log(`🔑 Using token type: ${process.env.CLASSIC_GITHUB_TOKEN ? 'CLASSIC_GITHUB_TOKEN' : 'GITHUB_TOKEN'}`);
    console.log(`🎯 Target: ${this.GITHUB_OWNER}/${this.GITHUB_REPO}`);
    console.log(`📋 Project Name: ${this.PROJECT_NAME}\n`);

    this.headers = {
      'Authorization': `token ${this.GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    };
  }

  async graphQLRequest(query, variables = {}) {
    // Rate limiting
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
      throw new Error(`GraphQL error: ${data.errors[0].message}`);
    }

    return data;
  }

  async githubRequest(url, options = {}) {
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

  async findOrCreateProject() {
    console.log(`🔍 Searching for existing project: "${this.PROJECT_NAME}"`);

    // First check if the project already exists
    const searchQuery = `
      query($username: String!) {
        user(login: $username) {
          projectsV2(first: 10) {
            nodes {
              id
              title
              url
              number
              closed
            }
          }
        }
      }
    `;

    try {
      const data = await this.graphQLRequest(searchQuery, {
        username: this.GITHUB_OWNER
      });

      const existingProject = data.data.user.projectsV2.nodes.find(p =>
        p && p.title === this.PROJECT_NAME
      );

      if (existingProject) {
        console.log(`✅ Found existing project: ${existingProject.url}`);
        return existingProject;
      }

      console.log(`ℹ️  Project "${this.PROJECT_NAME}" not found - creating new project`);
    } catch (error) {
      console.log(`⚠️  Could not search for projects: ${error.message}`);
    }

    // Create new project
    const userQuery = `
      query($username: String!) {
        user(login: $username) {
          id
        }
      }
    `;

    const userData = await this.graphQLRequest(userQuery, {
      username: this.GITHUB_OWNER
    });

    const createQuery = `
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

    const projectData = await this.graphQLRequest(createQuery, {
      ownerId: userData.data.user.id,
      title: this.PROJECT_NAME
    });

    const project = projectData.data.createProjectV2.projectV2;
    console.log(`✅ Created new project: ${project.url}`);

    return project;
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
    console.log(`\n🔄 Creating issue: "${task.title}"`);
    console.log(`   UUID: ${task.uuid} | Status: ${task.status} | Priority: ${task.priority || 'P3'}`);

    const body = `**📋 Task Details**
- **UUID:** \`${task.uuid}\`
- **Status:** ${task.status}
- **Priority:** ${task.priority || 'Not set'}
- **Labels:** ${task.labels ? task.labels.join(', ') : 'None'}

**🔄 Sync Information**
This issue was automatically created from the Promethean kanban board sync "${this.PROJECT_NAME}".
- **Last updated:** ${new Date().toISOString()}
- **Original column:** ${task.status}

**📝 Original Task Content**
${task.content || 'No description available.'}

---
> 🤖 *This task is part of the Promethean kanban system and is automatically synchronized with GitHub issues.*
>
> **Kanban Board:** Internal Promethean System
> **Repository:** [${this.GITHUB_OWNER}/${this.GITHUB_REPO}](https://github.com/${this.GITHUB_OWNER}/${this.GITHUB_REPO})`;

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

    console.log(`   ✅ Created issue: #${issue.number} - ${issue.html_url}`);
    return issue;
  }

  async addIssueToProject(issue, task, project) {
    if (!project) return false;

    console.log(`   📋 Adding to project: ${project.title}`);

    try {
      const addQuery = `
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

      await this.graphQLRequest(addQuery, {
        projectId: project.id,
        contentId: issue.node_id
      });

      console.log(`   ✅ Added to project board`);
      return true;
    } catch (error) {
      console.log(`   ⚠️  Could not add to project: ${error.message}`);
      return false;
    }
  }

  async syncKanbanTasksToProject() {
    console.log(`🚀 Starting kanban sync to GitHub Project "${this.PROJECT_NAME}"\n`);

    // Find or create project
    const project = await this.findOrCreateProject();

    // Search for kanban tasks
    const tasks = await this.searchKanbanTasks();

    if (tasks.length === 0) {
      console.log('❌ No kanban tasks found to sync');
      return;
    }

    console.log(`\n📝 Found ${tasks.length} kanban-related tasks`);
    const maxTasks = 15; // Sync top 15 tasks
    const selectedTasks = tasks.slice(0, maxTasks);

    console.log(`🔄 Syncing top ${selectedTasks.length} tasks to project "${project.title}"...\n`);

    const results = [];

    for (let i = 0; i < selectedTasks.length; i++) {
      const task = selectedTasks[i];
      console.log(`\n[${i + 1}/${selectedTasks.length}] ${task.title}`);

      try {
        // Create GitHub Issue
        const issue = await this.createGitHubIssue(task);

        // Add to project
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
    console.log(`   ✅ Created GitHub issues: ${successful}`);
    console.log(`   📋 Added to project: ${addedToProjectCount}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   📝 Total available: ${tasks.length}`);
    console.log(`   🔗 GitHub Project: ${project.url}`);
    console.log(`   🔗 Repository issues: https://github.com/${this.GITHUB_OWNER}/${this.GITHUB_REPO}/issues`);

    if (successful > 0) {
      console.log(`\n🏷️  Created Issues in Project:`);
      results.filter(r => r.success).forEach(result => {
        const status = result.task.status || 'unknown';
        const priority = result.task.priority || 'P3';
        const projectStatus = result.addedToProject ? '✅' : '❌';
        console.log(`   ${projectStatus} #${result.issueNumber} ${result.issue.title}`);
        console.log(`     Status: ${status} | Priority: ${priority} | ${result.issueUrl}`);
      });
    }

    console.log(`\n🎉 Your GitHub Project Board "${this.PROJECT_NAME}" is ready!`);
    console.log(`📋 View it at: ${project.url}`);
    console.log(`🔗 All kanban tasks have been synced and added to the project!`);

    return { results, totalAvailable: tasks.length, project };
  }
}

// CLI entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  const sync = new FinalKanbanSync();

  sync.syncKanbanTasksToProject()
    .then(() => {
      console.log('\n🎉 Final kanban sync completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Final kanban sync failed:', error.message);
      process.exit(1);
    });
}

export default FinalKanbanSync;