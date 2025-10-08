/**
 * Trello API client using Atlassian API v3 endpoints
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
    if (!config.apiKey) {
      throw new Error('Atlassian API key is required');
    }

    // Use classic Trello API v1 with Atlassian Bearer token authentication
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

    // Atlassian API v3 authentication with Bearer token
    options.headers = {
      ...options.headers,
      'Authorization': `Bearer ${this.config.apiKey}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };

    const response = await fetch(url.toString(), options);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Atlassian Trello API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json();
  }

  // === BOARD OPERATIONS ===

  async getBoards(): Promise<TrelloBoard[]> {
    console.log('📋 Fetching Trello boards via Atlassian API...');
    return this.makeRequest<TrelloBoard[]>('/members/me/boards');
  }

  async findBoardByName(name: string): Promise<TrelloBoard | null> {
    console.log(`🔍 Searching for board: "${name}"`);
    const boards = await this.getBoards();
    return boards.find(board => board.name === name && !board.closed) || null;
  }

  async getBoardById(boardId: string): Promise<TrelloBoard | null> {
    console.log(`🔍 Getting board by ID: "${boardId}"`);
    try {
      return await this.makeRequest<TrelloBoard>(`/boards/${boardId}`);
    } catch (error) {
      console.log(`   ℹ️  Board not found or inaccessible: ${error.message}`);
      return null;
    }
  }

  async createBoard(name: string, description?: string): Promise<TrelloBoard> {
    console.log(`🔨 Creating Trello board: "${name}"`);

    const createData = {
      name,
      desc: description || `Auto-generated board from Promethean kanban system`,
      defaultLists: false, // We'll create our own lists
      keepFromSource: 'none',
      powerUps: 'none',
      prefs_permissionLevel: 'private',
      prefs_comments: 'members',
      prefs_invitations: 'members',
      prefs_selfJoin: true,
      prefs_cardCovers: true,
      prefs_background: 'blue',
      prefs_cardAging: 'regular'
    };

    return this.makeRequest<TrelloBoard>('/boards', {
      method: 'POST',
      body: JSON.stringify(createData)
    });
  }

  // === LIST OPERATIONS ===

  async getLists(boardId: string): Promise<TrelloList[]> {
    return this.makeRequest<TrelloList[]>(`/boards/${boardId}/lists`);
  }

  async createList(boardId: string, name: string, position?: number): Promise<TrelloList> {
    console.log(`📝 Creating list: "${name}"`);

    const listData = {
      name,
      idBoard: boardId,
      pos: position?.toString() || 'bottom'
    };

    return this.makeRequest<TrelloList>('/lists', {
      method: 'POST',
      body: JSON.stringify(listData)
    });
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

    const cardData = {
      name,
      desc: description || '',
      idList: listId,
      pos: options.position?.toString() || 'bottom',
      due: options.due || null,
      idLabels: options.labels?.join(',') || null
    };

    const card = await this.makeRequest<TrelloCard>('/cards', {
      method: 'POST',
      body: JSON.stringify(cardData)
    });

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

    const moveData = {
      idList: listId,
      pos: position?.toString() || 'top'
    };

    return this.makeRequest<TrelloCard>(`/cards/${cardId}`, {
      method: 'PUT',
      body: JSON.stringify(moveData)
    });
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

    const labelData = {
      name,
      color: color || 'null',
      idBoard: boardId
    };

    return this.makeRequest<TrelloLabel>('/labels', {
      method: 'POST',
      body: JSON.stringify(labelData)
    });
  }

  async findLabelByName(boardId: string, name: string): Promise<TrelloLabel | null> {
    const labels = await this.getLabels(boardId);
    return labels.find(label => label.name === name) || null;
  }

  // === UTILITY METHODS ===

  async testConnection(): Promise<boolean> {
    try {
      const boards = await this.getBoards();
      console.log(`✅ Atlassian Trello API connection successful - Found ${boards.length} boards`);
      return true;
    } catch (error) {
      console.error('❌ Atlassian Trello API connection failed:', error.message);
      return false;
    }
  }

  async getBoardUrl(boardId: string): Promise<string> {
    const board = await this.makeRequest<TrelloBoard>(`/boards/${boardId}`);
    return board.url;
  }
}