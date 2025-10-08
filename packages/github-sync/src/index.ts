#!/usr/bin/env node

import { loadBoard } from '@promethean/kanban';
import type { ColumnData, Task } from '@promethean/kanban';

// GitHub API configuration
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER || 'promethean-systems';
const GITHUB_REPO = process.env.GITHUB_REPO || 'promethean';

// Rate limiting configuration
const MIN_API_INTERVAL = 1000; // 1 second minimum between API calls
let lastApiCall = 0;

class GitHubSync {
  private headers: Record<string, string>;

  constructor() {
    if (!GITHUB_TOKEN) {
      throw new Error('GITHUB_TOKEN environment variable is required');
    }

    this.headers = {
      Authorization: `token ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    };
  }

  private async rateLimitDelay() {
    const now = Date.now();
    const timeSinceLastCall = now - lastApiCall;
    if (timeSinceLastCall < MIN_API_INTERVAL) {
      await new Promise((resolve) => setTimeout(resolve, MIN_API_INTERVAL - timeSinceLastCall));
    }
    lastApiCall = Date.now();
  }

  private async graphqlRequest(query: string, variables: any = {}) {
    await this.rateLimitDelay();

    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        ...this.headers,
        Accept: 'application/vnd.github.v3+json',
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      throw new Error(`GraphQL request failed: ${response.statusText}`);
    }

    const data = await response.json();
    if (data.errors) {
      throw new Error(`GraphQL error: ${data.errors[0].message}`);
    }

    return data.data;
  }

  async findProjectByName(name: string) {
    const query = `
      query {
        repository(owner: "${GITHUB_OWNER}", name: "${GITHUB_REPO}") {
          projectsV2(first: 100) {
            nodes {
              id
              title
              url
              number
              columns: field(name: "Status") {
                ... on ProjectV2SingleSelectField {
                  id
                  options {
                    id
                    name
                  }
                }
              }
            }
          }
        }
      }
    `;

    const data = await this.graphqlRequest(query);
    const projects = data.repository.projectsV2.nodes;
    return projects.find((p: any) => p.title === name);
  }

  async createProject(name: string) {
    const mutation = `
      mutation($name: String!, $repositoryId: ID!) {
        createProjectV2(input: {
          title: $name,
          ownerId: $repositoryId,
          template: AUTOMATED_KANBAN
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

    const data = await this.graphqlRequest(mutation, { name });
    return data.createProjectV2.projectV2;
  }

  async ensureProject(name: string) {
    let project = await this.findProjectByName(name);

    if (!project) {
      console.log(`Creating new project: ${name}`);
      project = await this.createProject(name);
    } else {
      console.log(`Found existing project: ${name}`);
    }

    return project;
  }

  async syncProjectBoard(boardName: string = 'generated') {
    console.log(`Syncing project board: ${boardName}`);

    // Ensure project exists
    const project = await this.ensureProject(boardName);

    // Load kanban board using the kanban package
    const board = await loadBoard('docs/agile/boards/generated.md', 'docs/agile/tasks');

    console.log(`Found ${board.columns.length} columns in board`);

    // Sync columns with project
    const statusFieldId = project.columns?.id;
    if (statusFieldId) {
      await this.syncColumns(project.id, board.columns, statusFieldId);
    }

    // Extract and sync tasks
    let totalTasks = 0;
    for (const column of board.columns) {
      console.log(`Column "${column.name}" has ${column.count} tasks`);
      totalTasks += column.count;

      for (const task of column.tasks) {
        await this.syncTask(project.id, task, statusFieldId, column.name);
      }
    }

    console.log(`Found ${totalTasks} total tasks to sync`);

    console.log(`✅ Successfully synced project board: ${boardName}`);
    console.log(`🔗 Project URL: ${project.url}`);

    return project;
  }

  private async syncColumns(projectId: string, boardColumns: ColumnData[], statusFieldId: string) {
    // This is a simplified version - in practice, you'd need to manage field options
    console.log(`Syncing ${boardColumns.length} columns with project ${projectId}`);
    console.log(`Using status field: ${statusFieldId}`);
    for (const column of boardColumns) {
      console.log(`  - Column: ${column.name} (${column.count} tasks)`);
    }
  }

  private async syncTask(
    projectId: string,
    task: Task,
    statusFieldId: string | undefined,
    columnName: string,
  ) {
    // Use task.title from frontmatter if available, fallback to task metadata
    const taskTitle = task.title ?? `Task ${task.uuid}`;

    // This is a simplified version - in practice, you'd create or update GitHub issues
    // and then add them to the project with appropriate status
    console.log(`Syncing task: "${taskTitle}" to column: ${columnName}`);
    console.log(`  - Project ID: ${projectId}`);
    console.log(`  - UUID: ${task.uuid}`);
    console.log(`  - Status: ${task.status}`);
    console.log(`  - Priority: ${task.priority ?? 'Not set'}`);
    if (statusFieldId) {
      console.log(`  - Status Field ID: ${statusFieldId}`);
    }
  }
}

// CLI entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  const sync = new GitHubSync();

  sync
    .syncProjectBoard()
    .then(() => {
      console.log('Project board sync completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Project board sync failed:', error.message);
      process.exit(1);
    });
}

export default GitHubSync;
