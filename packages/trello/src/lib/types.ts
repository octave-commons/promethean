/**
 * Type definitions for Trello integration
 */

export interface TrelloConfig {
  /** Trello API key */
  apiKey: string;
  /** Trello API token */
  apiToken: string;
  /** Default board name */
  defaultBoardName?: string;
  /** Base URL for Trello API */
  baseUrl?: string;
}

export interface TrelloBoard {
  id: string;
  name: string;
  desc: string;
  closed: boolean;
  idOrganization: string | null;
  pinned: boolean;
  url: string;
  shortUrl: string;
  dateLastActivity: string;
  dateLastView: string;
  starred: boolean;
  memberships: TrelloMembership[];
  shortLink: string;
  subscribed: boolean;
  labelNames: Record<string, string>;
  limits: TrelloLimits;
}

export interface TrelloMembership {
  id: string;
  idMember: string;
  memberType: 'admin' | 'normal' | 'observer';
  unconfirmed: boolean;
  deactivated: boolean;
}

export interface TrelloLimits {
  boards: {
    perBoard: {
      totalMembersPerBoard: {
        status: string;
        disableAt: number;
        warnAt: number;
      };
    };
  };
}

export interface TrelloList {
  id: string;
  name: string;
  closed: boolean;
  idBoard: string;
  pos: number;
  subscribed: boolean;
  softLimit: number | null;
}

export interface TrelloCard {
  id: string;
  address: string;
  closed: boolean;
  coordinates: null | string;
  creationMethod: string | null;
  dateLastActivity: string;
  desc: string;
  due: string | null;
  dueComplete: boolean;
  email: string | null;
  idBoard: string;
  idList: string;
  idMembers: string[];
  idMembersVoted: string[];
  idShort: number;
  idAttachmentCover: string | null;
  idLabels: string[];
  manualCoverAttachment: boolean;
  name: string;
  pos: number;
  shortLink: string;
  shortUrl: string;
  subscribed: boolean;
  url: string;
  labels: TrelloLabel[];
  attachments: TrelloAttachment[];
  checklists: TrelloChecklist[];
}

export interface TrelloLabel {
  id: string;
  idBoard: string;
  name: string;
  color: string | null;
  uses: number;
}

export interface TrelloAttachment {
  id: string;
  bytes: number;
  date: string;
  edgeColor: string | null;
  idMember: string;
  isUpload: boolean;
  mimeType: string;
  name: string;
  previews: TrelloPreview[];
  url: string;
  pos: number;
}

export interface TrelloPreview {
  id: string;
  url: string;
  scaled: boolean;
  bytes: number;
  height: number;
  width: number;
}

export interface TrelloChecklist {
  id: string;
  name: string;
  idBoard: string;
  idCard: string;
  pos: number;
  checkItems: TrelloCheckItem[];
}

export interface TrelloCheckItem {
  id: string;
  name: string;
  state: 'complete' | 'incomplete';
  idChecklist: string;
  pos: number;
}

export interface KanbanTask {
  uuid: string;
  title: string;
  status: string;
  priority: string;
  labels: string[];
  created_at: string;
  estimates: Record<string, any>;
  content: string;
  slug: string;
  metadata?: Record<string, any>;
  column?: string;
}

export interface SyncOptions {
  /** Board name (defaults to "generated") */
  boardName?: string;
  /** Whether to create board if it doesn't exist */
  createBoard?: boolean;
  /** Maximum number of tasks to sync */
  maxTasks?: number;
  /** Whether to archive existing cards */
  archiveExisting?: boolean;
  /** Dry run mode - don't make actual changes */
  dryRun?: boolean;
  /** Custom column mapping */
  columnMapping?: Record<string, string>;
}

export interface ColumnMapping {
  kanbanColumn: string;
  trelloListName: string;
  position: number;
}

export interface SyncResult {
  success: boolean;
  board?: TrelloBoard;
  lists: TrelloList[];
  cards: TrelloCard[];
  errors: string[];
  summary: {
    totalTasks: number;
    syncedCards: number;
    failedCards: number;
    createdLists: number;
    createdLabels: number;
  };
}