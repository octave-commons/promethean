/**
 * Sync kanban tasks to Trello boards with full automation
 */

import { exec } from 'child_process';
import { promisify } from 'util';

import { TrelloClient } from './trello-client.js';
import type {
  TrelloBoard,
  TrelloList,
  TrelloCard,
  TrelloLabel,
  KanbanTask,
  SyncOptions,
  SyncResult,
  ColumnMapping
} from './types.js';

const execAsync = promisify(exec);

export class KanbanToTrelloSync {
  private trello: TrelloClient;
  private options: SyncOptions;

  constructor(config: { apiKey: string; apiToken: string }, options: SyncOptions = {}) {
    this.trello = new TrelloClient(config);
    this.options = {
      boardName: 'generated',
      createBoard: true,
      maxTasks: 20,
      archiveExisting: false,
      dryRun: false,
      ...options
    };
  }

  async searchKanbanTasks(): Promise<KanbanTask[]> {
    console.log('📋 Searching for kanban tasks...');

    try {
      const { stdout } = await execAsync('pnpm kanban search kanban');
      const searchResults = JSON.parse(stdout.trim());

      console.log(`✅ Found ${searchResults.exact.length} exact kanban matches`);
      console.log(`✅ Found ${searchResults.similar.length} similar kanban matches`);

      const allTasks = [...searchResults.exact, ...searchResults.similar];

      // Sort by priority (P1 first, then P2, etc.)
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

  private getStandardColumnMapping(): ColumnMapping[] {
    const mapping = this.options.columnMapping || {};

    const defaultMapping: ColumnMapping[] = [
      { kanbanColumn: 'icebox', trelloListName: 'Icebox', position: 1 },
      { kanbanColumn: 'incoming', trelloListName: 'Incoming', position: 2 },
      { kanbanColumn: 'accepted', trelloListName: 'Accepted', position: 3 },
      { kanbanColumn: 'breakdown', trelloListName: 'Breakdown', position: 4 },
      { kanbanColumn: 'blocked', trelloListName: 'Blocked', position: 5 },
      { kanbanColumn: 'ready', trelloListName: 'Ready', position: 6 },
      { kanbanColumn: 'todo', trelloListName: 'Todo', position: 7 },
      { kanbanColumn: 'in_progress', trelloListName: 'In Progress', position: 8 },
      { kanbanColumn: 'review', trelloListName: 'Review', position: 9 },
      { kanbanColumn: 'document', trelloListName: 'Document', position: 10 },
      { kanbanColumn: 'done', trelloListName: 'Done', position: 11 },
      { kanbanColumn: 'rejected', trelloListName: 'Rejected', position: 12 }
    ];

    return defaultMapping.map(col => ({
      ...col,
      trelloListName: mapping[col.kanbanColumn] || col.trelloListName
    }));
  }

  private async ensureBoardExists(): Promise<TrelloBoard> {
    console.log(`\n🔍 Looking for Trello board: "${this.options.boardName}"`);

    // Search for existing board
    const existingBoard = await this.trello.findBoardByName(this.options.boardName);

    if (existingBoard) {
      console.log(`✅ Found existing board: ${existingBoard.url}`);
      return existingBoard;
    }

    if (!this.options.createBoard) {
      throw new Error(`Board "${this.options.boardName}" not found and createBoard is false`);
    }

    // Create new board
    const description = `Auto-generated Trello board from Promethean kanban system.
Last sync: ${new Date().toISOString()}
Board: ${this.options.boardName}`;

    const board = await this.trello.createBoard(this.options.boardName, description);
    console.log(`✅ Created new Trello board: ${board.url}`);

    return board;
  }

  private async ensureListsExist(board: TrelloBoard): Promise<Map<string, TrelloList>> {
    console.log('\n📝 Setting up kanban columns...');

    const columnMapping = this.getStandardColumnMapping();
    const listMap = new Map<string, TrelloList>();

    // Get existing lists
    const existingLists = await this.trello.getLists(board.id);
    const existingListNames = new Set(existingLists.map(list => list.name));

    // Archive existing lists if requested
    if (this.options.archiveExisting && existingLists.length > 0) {
      console.log(`🗑️  Archiving ${existingLists.length} existing lists...`);
      for (const list of existingLists) {
        if (!existingListNames.has('Archive')) {
          await this.trello.createList(board.id, 'Archive', 999);
          break;
        }
      }
      for (const list of existingLists) {
        await this.trello.archiveList(list.id);
      }
    }

    // Create lists that don't exist
    for (const column of columnMapping) {
      if (!existingListNames.has(column.trelloListName)) {
        const list = await this.trello.createList(board.id, column.trelloListName, column.position);
        listMap.set(column.kanbanColumn, list);
        console.log(`   ✅ Created list: ${column.trelloListName}`);
      } else {
        const list = existingLists.find(l => l.name === column.trelloListName);
        if (list) {
          listMap.set(column.kanbanColumn, list);
        }
      }
    }

    return listMap;
  }

  private async ensureLabelsExist(board: TrelloBoard): Promise<Map<string, TrelloLabel>> {
    console.log('\n🏷️  Setting up priority labels...');

    const priorityColors = {
      'P1': 'red',
      'P2': 'orange',
      'P3': 'green'
    };

    const labelMap = new Map<string, TrelloLabel>();
    const existingLabels = await this.trello.getLabels(board.id);
    const existingLabelNames = new Set(existingLabels.map(label => label.name));

    for (const [priority, color] of Object.entries(priorityColors)) {
      if (!existingLabelNames.has(priority)) {
        const label = await this.trello.createLabel(board.id, priority, color);
        labelMap.set(priority, label);
        console.log(`   ✅ Created label: ${priority} (${color})`);
      } else {
        const label = existingLabels.find(l => l.name === priority);
        if (label) {
          labelMap.set(priority, label);
        }
      }
    }

    return labelMap;
  }

  private createCardDescription(task: KanbanTask): string {
    return `**📋 Task Details**
• UUID: ${task.uuid}
• Status: ${task.status}
• Priority: ${task.priority}
• Labels: ${task.labels?.join(', ') || 'None'}

**🔄 Sync Information**
This card was automatically created from the Promethean kanban board sync.
• Last updated: ${new Date().toISOString()}
• Original column: ${task.status}
• Board: ${this.options.boardName}

**📝 Original Task Content**
${task.content || 'No description available.'}

---
🤖 *This card is part of the Promethean kanban system and is automatically synchronized with Trello.*

**Internal System:**
• Kanban Board: Internal Promethean System
• Repository: [promethean](https://github.com/promethean-systems/promethean)

**To see the full kanban board**, check the internal Promethean development system or contact the maintainers.`;
  }

  private async syncTaskToCard(
    task: KanbanTask,
    listMap: Map<string, TrelloList>,
    labelMap: Map<string, TrelloLabel>
  ): Promise<TrelloCard | null> {
    console.log(`\n🔄 Syncing task: "${task.title}"`);
    console.log(`   UUID: ${task.uuid}`);
    console.log(`   Status: ${task.status} → ${listMap.get(task.status)?.name || 'Unknown'}`);
    console.log(`   Priority: ${task.priority}`);

    // Find target list
    const targetList = listMap.get(task.status);
    if (!targetList) {
      console.log(`   ⚠️  No target list found for status: ${task.status}`);
      return null;
    }

    // Find priority label
    const priorityLabel = labelMap.get(task.priority.toUpperCase());

    // Create card
    const card = await this.trello.createCard(
      targetList.id,
      task.title,
      this.createCardDescription(task),
      {
        labels: priorityLabel ? [priorityLabel.id] : []
      }
    );

    return card;
  }

  async sync(): Promise<SyncResult> {
    console.log(`🚀 Starting kanban to Trello sync`);
    console.log(`📋 Board: ${this.options.boardName}`);
    console.log(`🔄 Mode: ${this.options.dryRun ? 'DRY RUN' : 'LIVE SYNC'}\n`);

    const result: SyncResult = {
      success: false,
      lists: [],
      cards: [],
      errors: [],
      summary: {
        totalTasks: 0,
        syncedCards: 0,
        failedCards: 0,
        createdLists: 0,
        createdLabels: 0
      }
    };

    try {
      // Test Trello connection
      if (!this.options.dryRun) {
        const connectionTest = await this.trello.testConnection();
        if (!connectionTest) {
          throw new Error('Failed to connect to Trello');
        }
      }

      // Search kanban tasks
      const tasks = await this.searchKanbanTasks();
      result.summary.totalTasks = tasks.length;

      if (tasks.length === 0) {
        console.log('❌ No kanban tasks found to sync');
        result.success = true;
        return result;
      }

      // Limit tasks if specified
      const tasksToSync = tasks.slice(0, this.options.maxTasks || tasks.length);
      console.log(`\n📝 Found ${tasks.length} tasks, syncing top ${tasksToSync.length}`);

      // Ensure board exists
      const board = this.options.dryRun
        ? ({ id: 'dry-run-board', name: this.options.boardName, url: 'dry-run-url' } as TrelloBoard)
        : await this.ensureBoardExists();
      result.board = board;

      // Ensure lists exist
      const listMap = this.options.dryRun
        ? new Map()
        : await this.ensureListsExist(board);
      result.lists = Array.from(listMap.values());

      // Ensure labels exist
      const labelMap = this.options.dryRun
        ? new Map()
        : await this.ensureLabelsExist(board);

      // Sync tasks to cards
      console.log(`\n🔄 Syncing ${tasksToSync.length} tasks to Trello cards...\n`);

      for (let i = 0; i < tasksToSync.length; i++) {
        const task = tasksToSync[i];
        console.log(`[${i + 1}/${tasksToSync.length}] ${task.title}`);

        try {
          if (this.options.dryRun) {
            console.log(`   🔄 DRY RUN: Would create card in "${task.status}" list`);
            result.summary.syncedCards++;
          } else {
            const card = await this.syncTaskToCard(task, listMap, labelMap);
            if (card) {
              result.cards.push(card);
              result.summary.syncedCards++;
            } else {
              result.summary.failedCards++;
            }
          }
        } catch (error) {
          const errorMsg = `Failed to sync task "${task.title}": ${error.message}`;
          console.error(`   ❌ ${errorMsg}`);
          result.errors.push(errorMsg);
          result.summary.failedCards++;
        }
      }

      result.success = result.errors.length === 0 || result.summary.syncedCards > 0;

    } catch (error) {
      const errorMsg = `Sync failed: ${error.message}`;
      console.error(`❌ ${errorMsg}`);
      result.errors.push(errorMsg);
    }

    return result;
  }

  async printSummary(result: SyncResult): Promise<void> {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`✅ Kanban to Trello sync completed!`);
    console.log(`${'='.repeat(70)}`);

    if (result.board) {
      console.log(`📋 Board: ${result.board.name}`);
      console.log(`🔗 URL: ${result.board.url}`);
    }

    console.log(`\n📊 Summary:`);
    console.log(`   📝 Total tasks: ${result.summary.totalTasks}`);
    console.log(`   🃏 Synced cards: ${result.summary.syncedCards}`);
    console.log(`   ❌ Failed cards: ${result.summary.failedCards}`);
    console.log(`   📝 Created lists: ${result.summary.createdLists}`);
    console.log(`   🏷️  Created labels: ${result.summary.createdLabels}`);

    if (result.errors.length > 0) {
      console.log(`\n❌ Errors:`);
      result.errors.forEach(error => console.log(`   • ${error}`));
    }

    if (result.success && result.board) {
      console.log(`\n🎉 Your Trello board is ready!`);
      console.log(`🔗 View it at: ${result.board.url}`);
      console.log(`🚀 All kanban tasks have been synced to Trello cards!`);
    }
  }
}