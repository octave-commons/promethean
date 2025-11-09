import { BaseAdapter } from './base-adapter';
import { Task, TaskSource, TaskTarget } from '../../types';

interface TrelloCard {
  id: string;
  name: string;
  desc: string;
  closed: boolean;
  dateLastActivity: string;
  idList: string;
  labels: Array<{ id: string; name: string; color: string }>;
  idLabels: string[];
  url: string;
  shortUrl: string;
  idMembers: string[];
  idChecklists: string[];
}

interface TrelloList {
  id: string;
  name: string;
  closed: boolean;
}

export class TrelloAdapter extends BaseAdapter {
  private apiKey: string;
  private apiToken: string;
  private baseUrl: string;
  private listMap: Map<string, string> = new Map(); // status -> listId

  constructor(config: TaskSource | TaskTarget) {
    super(config);

    this.apiKey = this.config.config.apiKey;
    this.apiToken = this.config.config.apiToken;
    this.baseUrl = 'https://api.trello.com/1';
  }

  private async trelloFetch(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseUrl}${endpoint}?key=${this.apiKey}&token=${this.apiToken}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`Trello API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getTasks(options?: { status?: string; maxTasks?: number }): Promise<Task[]> {
    const { status, maxTasks } = options || {};

    try {
      // Initialize list mapping if not already done
      if (this.listMap.size === 0) {
        await this.initializeListMapping();
      }

      const boardId = this.config.config.boardId;
      let cards: TrelloCard[];

      if (status) {
        const listId = this.listMap.get(status);
        if (!listId) {
          console.warn(`List for status '${status}' not found`);
          return [];
        }
        cards = await this.trelloFetch(`/lists/${listId}/cards`);
      } else {
        cards = await this.trelloFetch(`/boards/${boardId}/cards`);
      }

      // Filter out archived cards
      const activeCards = cards.filter(card => !card.closed);

      const limitedCards = maxTasks ? activeCards.slice(0, maxTasks) : activeCards;

      return limitedCards.map(card => this.normalizeTask(card, 'trello'));
    } catch (error) {
      console.error(`Error fetching Trello tasks:`, error);
      return [];
    }
  }

  async createTask(task: Task): Promise<Task> {
    try {
      // Initialize list mapping if not already done
      if (this.listMap.size === 0) {
        await this.initializeListMapping();
      }

      const listId = this.listMap.get(task.status) || this.listMap.get('todo');
      if (!listId) {
        throw new Error(`No list found for status '${task.status}'`);
      }

      const cardData = {
        name: task.title,
        desc: task.content || '',
        idList: listId,
        idLabels: await this.getLabelIds(task.labels)
      };

      const card = await this.trelloFetch(`/cards`, {
        method: 'POST',
        body: JSON.stringify(cardData)
      });
      return this.normalizeTask(card, 'trello');
    } catch (error) {
      console.error(`Error creating Trello card:`, error);
      throw error;
    }
  }

  async updateTask(task: Task): Promise<Task> {
    if (!task.sourceId) {
      throw new Error(`Cannot update task without Trello card ID`);
    }

    try {
      const updateData: any = {
        name: task.title,
        desc: task.content || '',
        closed: task.status === 'done'
      };

      // Update list if status changed
      if (this.listMap.has(task.status)) {
        const newlistId = this.listMap.get(task.status);
        updateData.idList = newlistId;
      }

      const card = await this.trelloFetch(`/cards/${task.sourceId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });
      return this.normalizeTask(card, 'trello');
    } catch (error) {
      console.error(`Error updating Trello card:`, error);
      throw error;
    }
  }

  async deleteTask(taskId: string): Promise<boolean> {
    try {
      await this.trelloFetch(`/cards/${taskId}`, { method: 'DELETE' });
      return true;
    } catch (error) {
      console.error(`Error deleting Trello card:`, error);
      return false;
    }
  }

  async getTaskById(taskId: string): Promise<Task | null> {
    try {
      const card = await this.trelloFetch(`/cards/${taskId}`);
      if (!card) {
        return null;
      }

      return this.normalizeTask(card, 'trello');
    } catch (error) {
      console.error(`Error fetching Trello card:`, error);
      return null;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const board = await this.trelloFetch(`/boards/${this.config.config.boardId}`);
      return !!board;
    } catch (error) {
      console.error(`Trello connection test failed:`, error);
      return false;
    }
  }

  protected normalizeTask(rawTask: TrelloCard, sourceType: string): Task {
    const status = this.getListStatus(rawTask.idList);

    return {
      uuid: rawTask.id,
      title: rawTask.name,
      content: rawTask.desc,
      status,
      priority: this.extractPriority(rawTask.labels),
      labels: rawTask.labels.map(label => label.name || label.color),
      created_at: new Date().toISOString(), // Trello doesn't provide creation date in basic API
      updated_at: rawTask.dateLastActivity,
      estimates: {},
      slug: '',
      source: sourceType,
      sourceId: rawTask.id
    };
  }

  private async initializeListMapping(): Promise<void> {
    try {
      const boardId = this.config.config.boardId;
      const lists = await this.trelloFetch(`/boards/${boardId}/lists`);

      // Map common status names to list names
      const statusMapping: Record<string, string> = {
        'icebox': 'icebox',
        'incoming': 'incoming',
        'accepted': 'accepted',
        'breakdown': 'breakdown',
        'blocked': 'blocked',
        'ready': 'ready',
        'todo': 'todo',
        'in_progress': 'in_progress',
        'progress': 'in_progress',
        'review': 'review',
        'document': 'document',
        'done': 'done',
        'rejected': 'rejected'
      };

      for (const list of lists) {
        const normalizedListName = list.name.toLowerCase().replace(/\s+/g, '_');
        const status = statusMapping[normalizedListName] || normalizedListName;
        this.listMap.set(status, list.id);
      }
    } catch (error) {
      console.error(`Error initializing Trello list mapping:`, error);
    }
  }

  private getListStatus(listId: string): string {
    for (const [status, id] of this.listMap.entries()) {
      if (id === listId) {
        return status;
      }
    }
    return 'todo'; // Default status
  }

  private extractPriority(labels: Array<{ name?: string; color: string }>): string {
    const priorityLabel = labels.find(label =>
      label.name?.match(/p[1-5]/i) ||
      label.color === 'red' ||
      label.color === 'orange' ||
      label.color === 'yellow'
    );

    if (priorityLabel?.name?.match(/p[1-5]/i)) {
      return priorityLabel.name.toUpperCase();
    }

    // Map colors to priorities
    if (priorityLabel?.color === 'red') return 'P1';
    if (priorityLabel?.color === 'orange') return 'P2';
    if (priorityLabel?.color === 'yellow') return 'P3';

    return 'P3';
  }

  private async getLabelIds(labelNames: string[]): Promise<string[]> {
    try {
      const boardId = this.config.config.boardId;
      const labels = await this.trelloFetch(`/boards/${boardId}/labels`);
      const labelMap = new Map(
        labels.map((label: any) => [(label.name || '').toLowerCase(), label.id])
      );

      return labelNames
        .map(name => labelMap.get(name.toLowerCase()))
        .filter(Boolean) as string[];
    } catch (error) {
      console.error(`Error getting label IDs:`, error);
      return [];
    }
  }
}