/**
 * Command Patterns for Natural Language Parser
 * Defines regex patterns and mappings for common command structures
 */

import { CommandPattern } from './types.js';

export const DEFAULT_PATTERNS: CommandPattern[] = [
  // Task management commands
  {
    id: 'create_task',
    pattern: /(?:create|add|new)\s+(?:task\s+)?(.+?)(?:\s+with\s+(.+))?/i,
    template: ['title', 'options'],
    command: 'create',
    paramMapping: {
      '1': 'title',
      '2': 'options',
    },
    help: 'Create a new task with optional parameters',
    examples: [
      'create task Implement user authentication',
      'add task Fix login bug with priority high',
      'new task Create API documentation',
    ],
  },

  {
    id: 'update_status',
    pattern: /(?:update|set|change|move)\s+(?:task\s+)?(.+?)\s+(?:to\s+)?(status\s+)?(.+)/i,
    template: ['task_identifier', 'new_status'],
    command: 'update_status',
    paramMapping: {
      '1': 'task_identifier',
      '2': 'new_status',
    },
    help: 'Update task status',
    examples: [
      'update task abc123 to in_progress',
      'set task login-bug to done',
      'move abc123 to review',
    ],
  },

  {
    id: 'find_task',
    pattern: /(?:find|search|show|get|list)\s+(?:task\s+)?(.+?)(?:\s+in\s+(.+))?/i,
    template: ['search_term', 'location'],
    command: 'search',
    paramMapping: {
      '1': 'search_term',
      '2': 'location',
    },
    help: 'Find or search for tasks',
    examples: ['find task authentication', 'search for login bugs', 'show tasks in review'],
  },

  {
    id: 'delete_task',
    pattern: /(?:delete|remove|del)\s+(?:task\s+)?(.+?)(?:\s+(?:with|because)\s+(.+))?/i,
    template: ['task_identifier', 'reason'],
    command: 'delete',
    paramMapping: {
      '1': 'task_identifier',
      '2': 'reason',
    },
    help: 'Delete a task with optional reason',
    examples: [
      'delete task abc123',
      'remove task login-bug because duplicate',
      'del task old-feature',
    ],
  },

  // Kanban board commands
  {
    id: 'list_board',
    pattern: /(?:list|show|display)\s+(?:board|kanban)(?:\s+(.+))?/i,
    template: ['filter'],
    command: 'list',
    paramMapping: {
      '1': 'filter',
    },
    help: 'Display kanban board status',
    examples: ['list board', 'show kanban ready', 'display board in_progress'],
  },

  {
    id: 'pull_tasks',
    pattern: /(?:pull|sync|refresh)\s+(?:tasks\s+)?(?:from\s+)?(.*)?/i,
    template: ['source'],
    command: 'pull',
    paramMapping: {
      '1': 'source',
    },
    help: 'Pull tasks from files',
    examples: ['pull tasks', 'sync from files', 'refresh'],
  },

  {
    id: 'push_tasks',
    pattern: /(?:push|save|commit)\s+(?:tasks\s+)?(?:to\s+)?(.*)?/i,
    template: ['destination'],
    command: 'push',
    paramMapping: {
      '1': 'destination',
    },
    help: 'Push tasks to files',
    examples: ['push tasks', 'save to files', 'commit changes'],
  },

  // Priority commands
  {
    id: 'set_priority',
    pattern: /(?:set|change|update)\s+(?:priority\s+)?(?:of\s+)?(.+?)\s+(?:to\s+)?(.+)/i,
    template: ['task_identifier', 'priority'],
    command: 'update',
    paramMapping: {
      '1': 'task_identifier',
      '2': 'priority',
    },
    help: 'Set task priority',
    examples: [
      'set priority of abc123 to high',
      'change task login-bug priority to critical',
      'update abc123 priority P1',
    ],
  },

  // Epic commands
  {
    id: 'create_epic',
    pattern: /(?:create|add|new)\s+epic\s+(.+?)(?:\s+with\s+(.+))?/i,
    template: ['title', 'options'],
    command: 'create-epic',
    paramMapping: {
      '1': 'title',
      '2': 'options',
    },
    help: 'Create a new epic',
    examples: [
      'create epic User Management',
      'add epic Authentication System with subtasks login, register',
      'new epic Payment Processing',
    ],
  },

  {
    id: 'add_to_epic',
    pattern: /(?:add|move)\s+(?:task\s+)?(.+?)\s+(?:to\s+)?(?:epic\s+)?(.+)/i,
    template: ['task_identifier', 'epic_identifier'],
    command: 'add-task',
    paramMapping: {
      '1': 'task_identifier',
      '2': 'epic_identifier',
    },
    help: 'Add task to epic',
    examples: [
      'add task abc123 to epic user-management',
      'move login-bug to epic authentication',
      'add abc123 to user-epic',
    ],
  },

  // Utility commands
  {
    id: 'show_help',
    pattern: /(?:help|\?|show\s+help)(?:\s+(.+))?/i,
    template: ['topic'],
    command: 'help',
    paramMapping: {
      '1': 'topic',
    },
    help: 'Show help information',
    examples: ['help', '?', 'show help create', 'help update_status'],
  },

  {
    id: 'audit_board',
    pattern: /(?:audit|check|validate)\s+(?:board\s+)?(?:for\s+)?(.*)?/i,
    template: ['options'],
    command: 'audit',
    paramMapping: {
      '1': 'options',
    },
    help: 'Audit kanban board for issues',
    examples: ['audit board', 'check for violations', 'validate board with fix'],
  },

  {
    id: 'generate_report',
    pattern: /(?:generate|create|show)\s+(?:report\s+)?(?:for\s+)?(.+?)(?:\s+(?:in|as)\s+(.+))?/i,
    template: ['report_type', 'format'],
    command: 'report',
    paramMapping: {
      '1': 'report_type',
      '2': 'format',
    },
    help: 'Generate various reports',
    examples: [
      'generate report status',
      'create report for performance in json',
      'show report metrics',
    ],
  },
];

// Entity extraction patterns
export const ENTITY_PATTERNS = {
  task_id: /\b[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\b|\b[a-f0-9]{6,}\b/gi,
  uuid: /\b[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\b/gi,
  short_id: /\b[a-f0-9]{6,}\b/gi,
  priority: /\b(P[0-9]|critical|high|medium|low|urgent|important)\b/gi,
  status:
    /\b(incoming|accepted|breakdown|ready|todo|in_progress|in_review|review|document|done|blocked|rejected)\b/gi,
  column:
    /\b(icebox|incoming|accepted|breakdown|blocked|ready|todo|in_progress|review|document|done|rejected)\b/gi,
  labels: /\[#([^\]]+)\]/g,
  mentions: /@(\w+)/g,
  time_estimate: /\b(\d+[hdw]|hour|day|week)s?\b/gi,
  date: /\b(today|tomorrow|yesterday|next\s+week|last\s+week|\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{2,4})\b/gi,
};

// Command synonyms and variations
export const COMMAND_SYNONYMS = {
  create: ['add', 'new', 'make', 'create'],
  update: ['set', 'change', 'modify', 'update'],
  delete: ['remove', 'del', 'delete', 'clear'],
  find: ['search', 'show', 'get', 'list', 'find'],
  move: ['change', 'update', 'set', 'move'],
  help: ['?', 'help', 'show help'],
  audit: ['check', 'validate', 'audit'],
  generate: ['create', 'show', 'make', 'generate'],
};

// Fuzzy matching for command names
export const FUZZY_COMMAND_MAP = {
  creat: 'create',
  cretae: 'create',
  upate: 'update',
  updte: 'update',
  delet: 'delete',
  delelte: 'delete',
  serch: 'search',
  serach: 'search',
  findd: 'find',
  lits: 'list',
  lsit: 'list',
  hlep: 'help',
  hepl: 'help',
  audt: 'audit',
  audti: 'audit',
};
