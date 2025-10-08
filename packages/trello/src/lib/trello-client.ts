/**
 * Trello API client with full CRUD operations
 */

import type {
  TrelloConfig,
  TrelloBoard,
  TrelloList,
  TrelloCard,
  TrelloLabel,
  TrelloChecklist
} from './types.js';

export class TrelloClient {
  private config: TrelloConfig;
  private baseUrl: string;

  constructor(config: TrelloConfig) {
    if (!config.apiKey || !config.apiToken) {
      throw new Error('Trello API key and token are required');
    }

    this.config = {
      ...config,
      baseUrl: config.baseUrl || 'https://api.trello.com/1'
    };

    this.baseUrl = this.config.baseUrl;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);

    // Add API key and token to all requests
    url.searchParams.set('key', this.config.apiKey);
    url.searchParams.set('token', this.config.apiToken);

    const response = await fetch(url.toString(), {
      ...options,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Trello API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json();
  }

  // === BOARD OPERATIONS ===

  async getBoards(): Promise<TrelloBoard[]> {
    console.log('📋 Fetching Trello boards...');
    return this.makeRequest<TrelloBoard[]>('/members/me/boards');
  }

  async findBoardByName(name: string): Promise<TrelloBoard | null> {
    console.log(`🔍 Searching for board: "${name}"`);
    const boards = await this.getBoards();
    return boards.find(board => board.name === name && !board.closed) || null;
  }

  async createBoard(name: string, description?: string): Promise<TrelloBoard> {
    console.log(`🔨 Creating Trello board: "${name}"`);

    const params = new URLSearchParams({
      name,
      desc: description || `Auto-generated board from Promethean kanban system`,
      defaultLists: 'false', // We'll create our own lists
      keepFromSource: 'none',
      powerUps: 'none',
      prefs_permissionLevel: 'private',
      prefs_comments: 'members',
      prefs_invitations: 'members',
      prefs_selfJoin: 'true',
      prefs_cardCovers: 'true',
      prefs_background: 'blue',
      prefs_cardAging: 'regular'
    });

    const url = new URL(`${this.baseUrl}/boards`);
    url.searchParams.set('key', this.config.apiKey);
    url.searchParams.set('token', this.config.apiToken);

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create board: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const board = await response.json();
    console.log(`✅ Created board: ${board.url}`);
    return board;
  }

  // === LIST OPERATIONS ===

  async getLists(boardId: string): Promise<TrelloList[]> {
    return this.makeRequest<TrelloList[]>(`/boards/${boardId}/lists`);
  }

  async createList(boardId: string, name: string, position?: number): Promise<TrelloList> {
    console.log(`📝 Creating list: "${name}"`);

    const params = new URLSearchParams({
      name,
      idBoard: boardId,
      pos: position?.toString() || 'bottom'
    });

    const url = new URL(`${this.baseUrl}/lists`);
    url.searchParams.set('key', this.config.apiKey);
    url.searchParams.set('token', this.config.apiToken);

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create list: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json();
  }

  async findListByName(boardId: string, name: string): Promise<TrelloList | null> {
    const lists = await this.getLists(boardId);
    return lists.find(list => list.name === name && !list.closed) || null;
  }

  async archiveList(listId: string): Promise<void> {
    await this.makeRequest(`/lists/${listId}/closed`, {
      method: 'PUT',
      body: JSON.stringify({ value: true })
    });
  }

  // === CARD OPERATIONS ===

  async getCards(boardId: string): Promise<TrelloCard[]> {
    return this.makeRequest<TrelloCard[]>(`/boards/${boardId}/cards`);
  }

  async createCard(
    listId: string,
    name: string,
    description?: string,
    options: {
      due?: string;
      labels?: string[];
      position?: number;
    } = {}
  ): Promise<TrelloCard> {
    console.log(`🃏 Creating card: "${name.substring(0, 50)}..."`);

    const params = new URLSearchParams({
      name,
      desc: description || '',
      idList: listId,
      pos: options.position?.toString() || 'bottom'
    });

    if (options.due) {
      params.set('due', options.due);
    }

    if (options.labels && options.labels.length > 0) {
      params.set('idLabels', options.labels.join(','));
    }

    const url = new URL(`${this.baseUrl}/cards`);
    url.searchParams.set('key', this.config.apiKey);
    url.searchParams.set('token', this.config.apiToken);

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create card: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const card = await response.json();
    console.log(`   ✅ Created: ${card.shortUrl}`);
    return card;
  }

  async updateCard(cardId: string, updates: Partial<TrelloCard>): Promise<TrelloCard> {
    return this.makeRequest<TrelloCard>(`/cards/${cardId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async moveCardToList(cardId: string, listId: string, position?: number): Promise<TrelloCard> {
    console.log(`🔄 Moving card to list: ${listId}`);

    const params = new URLSearchParams({
      idList: listId,
      pos: position?.toString() || 'top'
    });

    const url = new URL(`${this.baseUrl}/cards/${cardId}`);
    url.searchParams.set('key', this.config.apiKey);
    url.searchParams.set('token', this.config.apiToken);

    const response = await fetch(url.toString(), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to move card: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json();
  }

  async archiveCard(cardId: string): Promise<void> {
    await this.makeRequest(`/cards/${cardId}/closed`, {
      method: 'PUT',
      body: JSON.stringify({ value: true })
    });
  }

  // === LABEL OPERATIONS ===

  async getLabels(boardId: string): Promise<TrelloLabel[]> {
    return this.makeRequest<TrelloLabel[]>(`/boards/${boardId}/labels`);
  }

  async createLabel(
    boardId: string,
    name: string,
    color: string = null
  ): Promise<TrelloLabel> {
    console.log(`🏷️  Creating label: "${name}" (${color})`);

    const params = new URLSearchParams({
      name,
      color: color || 'null',
      idBoard: boardId
    });

    const url = new URL(`${this.baseUrl}/labels`);
    url.searchParams.set('key', this.config.apiKey);
    url.searchParams.set('token', this.config.apiToken);

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create label: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json();
  }

  async findLabelByName(boardId: string, name: string): Promise<TrelloLabel | null> {
    const labels = await this.getLabels(boardId);
    return labels.find(label => label.name === name) || null;
  }

  // === UTILITY METHODS ===

  async testConnection(): Promise<boolean> {
    try {
      const boards = await this.getBoards();
      console.log(`✅ Trello connection successful - Found ${boards.length} boards`);
      return true;
    } catch (error) {
      console.error('❌ Trello connection failed:', error.message);
      return false;
    }
  }

  async getBoardUrl(boardId: string): Promise<string> {
    const board = await this.makeRequest<TrelloBoard>(`/boards/${boardId}`);
    return board.url;
  }
}