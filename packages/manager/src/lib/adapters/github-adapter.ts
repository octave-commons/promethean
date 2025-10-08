import { BaseAdapter } from './base-adapter';
import { Task, TaskSource, TaskTarget } from '../../types';

interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body: string;
  state: 'open' | 'closed';
  created_at: string;
  updated_at: string;
  labels: Array<{ name: string }>;
  assignee?: any;
  milestone?: any;
  html_url: string;
  pull_request?: any;
}

export class GitHubAdapter extends BaseAdapter {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor(config: TaskSource | TaskTarget) {
    super(config);
    this.baseUrl = 'https://api.github.com';
    this.headers = {
      'Accept': 'application/vnd.github.v3+json',
      'Authorization': `token ${this.config.config.classicToken}`,
      'User-Agent': 'promethean-manager'
    };
  }

  async getTasks(options?: { state?: 'open' | 'closed'; maxTasks?: number }): Promise<Task[]> {
    const { state = 'open', maxTasks } = options || {};
    const { owner, repo } = this.config.config;

    try {
      const response = await fetch(
        `${this.baseUrl}/repos/${owner}/${repo}/issues?state=${state}`,
        { headers: this.headers }
      );

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      const issues: GitHubIssue[] = await response.json();

      // Filter out pull requests
      const tasks = issues.filter(issue => !issue.pull_request);

      const limitedTasks = maxTasks ? tasks.slice(0, maxTasks) : tasks;

      return limitedTasks.map(issue => this.normalizeTask(issue, 'github'));
    } catch (error) {
      console.error(`Error fetching GitHub tasks:`, error);
      return [];
    }
  }

  async createTask(task: Task): Promise<Task> {
    const { owner, repo } = this.config.config;

    const issueData = {
      title: task.title,
      body: task.content || '',
      labels: task.labels,
      assignees: []
    };

    try {
      const response = await fetch(
        `${this.baseUrl}/repos/${owner}/${repo}/issues`,
        {
          method: 'POST',
          headers: this.headers,
          body: JSON.stringify(issueData)
        }
      );

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      const issue: GitHubIssue = await response.json();
      return this.normalizeTask(issue, 'github');
    } catch (error) {
      console.error(`Error creating GitHub issue:`, error);
      throw error;
    }
  }

  async updateTask(task: Task): Promise<Task> {
    const { owner, repo } = this.config.config;
    const issueNumber = this.extractIssueNumber(task.sourceId || '');

    if (!issueNumber) {
      throw new Error(`Cannot update task without GitHub issue number`);
    }

    const updateData: any = {
      title: task.title,
      body: task.content || '',
      state: task.status === 'done' ? 'closed' : 'open',
      labels: task.labels
    };

    try {
      const response = await fetch(
        `${this.baseUrl}/repos/${owner}/${repo}/issues/${issueNumber}`,
        {
          method: 'PATCH',
          headers: this.headers,
          body: JSON.stringify(updateData)
        }
      );

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      const issue: GitHubIssue = await response.json();
      return this.normalizeTask(issue, 'github');
    } catch (error) {
      console.error(`Error updating GitHub issue:`, error);
      throw error;
    }
  }

  async deleteTask(taskId: string): Promise<boolean> {
    // GitHub doesn't support deleting issues via API
    // We can only close them
    try {
      await this.updateTask({
        uuid: taskId,
        title: '',
        content: '',
        status: 'done',
        priority: 'P3',
        labels: [],
        created_at: '',
        sourceId: taskId
      });
      return true;
    } catch (error) {
      console.error(`Error closing GitHub issue:`, error);
      return false;
    }
  }

  async getTaskById(taskId: string): Promise<Task | null> {
    const issueNumber = this.extractIssueNumber(taskId);
    if (!issueNumber) {
      return null;
    }

    const { owner, repo } = this.config.config;

    try {
      const response = await fetch(
        `${this.baseUrl}/repos/${owner}/${repo}/issues/${issueNumber}`,
        { headers: this.headers }
      );

      if (!response.ok) {
        return null;
      }

      const issue: GitHubIssue = await response.json();
      return this.normalizeTask(issue, 'github');
    } catch (error) {
      console.error(`Error fetching GitHub issue:`, error);
      return null;
    }
  }

  async testConnection(): Promise<boolean> {
    const { owner, repo } = this.config.config;

    try {
      const response = await fetch(
        `${this.baseUrl}/repos/${owner}/${repo}`,
        { headers: this.headers }
      );
      return response.ok;
    } catch (error) {
      console.error(`GitHub connection test failed:`, error);
      return false;
    }
  }

  protected normalizeTask(rawTask: GitHubIssue, sourceType: string): Task {
    return {
      uuid: rawTask.id.toString(),
      title: rawTask.title,
      content: rawTask.body,
      status: rawTask.state === 'closed' ? 'done' : 'todo',
      priority: this.extractPriority(rawTask.labels),
      labels: rawTask.labels.map(label => label.name),
      created_at: rawTask.created_at,
      updated_at: rawTask.updated_at,
      estimates: {},
      slug: '',
      source: sourceType,
      sourceId: rawTask.number.toString()
    };
  }

  private extractIssueNumber(sourceId: string): number | null {
    const match = sourceId.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : null;
  }

  private extractPriority(labels: Array<{ name: string }>): string {
    const priorityLabel = labels.find(label =>
      label.name.match(/p[1-5]/i) || label.name.match(/priority/i)
    );
    return priorityLabel ? priorityLabel.name.toUpperCase() : 'P3';
  }
}