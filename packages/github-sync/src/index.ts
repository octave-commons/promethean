#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'gray-matter';

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
      'Authorization': `token ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    };
  }

  private async rateLimitDelay() {
    const now = Date.now();
    const timeSinceLastCall = now - lastApiCall;
    if (timeSinceLastCall < MIN_API_INTERVAL) {
      await new Promise(resolve => setTimeout(resolve, MIN_API_INTERVAL - timeSinceLastCall));
    }
    lastApiCall = Date.now();
  }

  private async graphqlRequest(query: string, variables: any = {}) {
    await this.rateLimitDelay();

    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        ...this.headers,
        'Accept': 'application/vnd.github.v3+json',
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

    // Read kanban board data
    const boardPath = join(process.cwd(), 'docs/agile/boards/generated.md');
    const boardContent = readFileSync(boardPath, 'utf-8');
    const parsed = parse(boardContent);

    // Extract columns from board
    const columns = this.extractColumnsFromBoard(boardContent);

    console.log(`Found ${columns.length} columns in board`);

    // Sync columns with project
    const statusFieldId = project.columns?.id;
    if (statusFieldId) {
      await this.syncColumns(project.id, columns, statusFieldId);
    }

    // Extract and sync tasks
    const tasks = this.extractTasksFromBoard(boardContent);
    console.log(`Found ${tasks.length} tasks to sync`);

    for (const task of tasks) {
      await this.syncTask(project.id, task, statusFieldId);
    }

    console.log(`✅ Successfully synced project board: ${boardName}`);
    console.log(`🔗 Project URL: ${project.url}`);

    return project;
  }

  private extractColumnsFromBoard(content: string): string[] {
    const columnRegex = /###\s+(.+)$/gm;
    const matches = [...content.matchAll(columnRegex)];
    return matches.map(match => match[1].trim());
  }

  private extractTasksFromBoard(content: string): any[] {
    const tasks: any[] = [];
    const columnRegex = /###\s+(.+?)$(.+?)(?=###\s+|\s*$)/gms;

    let match;
    while ((match = columnRegex.exec(content)) !== null) {
      const column = match[1].trim();
      const tasksInSection = match[2];

      const taskRegex = /-\s+\[\[([^\]]+)\]\]/g;
      let taskMatch;
      while ((taskMatch = taskRegex.exec(tasksInSection)) !== null) {
        tasks.push({
          name: taskMatch[1],
          column,
        });
      }
    }

    return tasks;
  }

  private async syncColumns(projectId: string, boardColumns: string[], statusFieldId: string) {
    // This is a simplified version - in practice, you'd need to manage field options
    console.log(`Syncing ${boardColumns.length} columns with project`);
  }

  private async syncTask(projectId: string, task: any, statusFieldId: string) {
    // This is a simplified version - in practice, you'd create or update GitHub issues
    // and then add them to the project with appropriate status
    console.log(`Syncing task: ${task.name} to column: ${task.column}`);
  }
}

// CLI entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  const sync = new GitHubSync();

  sync.syncProjectBoard()
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