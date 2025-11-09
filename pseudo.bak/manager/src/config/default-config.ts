import { ManagerConfig } from '../types';

export const defaultConfig: ManagerConfig = {
  sources: [
    {
      name: 'kanban',
      type: 'kanban',
      enabled: true,
      config: {
        boardFile: 'docs/agile/boards/generated.md',
        tasksDir: 'docs/agile/tasks',
        configFile: 'promethean.kanban.json'
      }
    },
    {
      name: 'github',
      type: 'github',
      enabled: true,
      config: {
        owner: process.env.GITHUB_OWNER || '',
        repo: process.env.GITHUB_REPO || '',
        projectName: 'Kanban Board',
        classicToken: process.env.CLASSIC_GITHUB_TOKEN || process.env.GITHUB_TOKEN || ''
      }
    },
    {
      name: 'trello',
      type: 'trello',
      enabled: true,
      config: {
        boardName: 'promethean',
        boardId: process.env.TRELLO_BOARD_ID || 'V54OVEMZ',
        apiKey: process.env.TRELLO_API_KEY || '',
        apiToken: process.env.TRELLO_TOKEN || process.env.TRELLO_SECRET || '',
        authentication: 'classic'
      }
    }
  ],
  targets: [
    {
      name: 'kanban',
      type: 'kanban',
      enabled: true,
      config: {
        boardFile: 'docs/agile/boards/generated.md',
        tasksDir: 'docs/agile/tasks',
        configFile: 'promethean.kanban.json'
      }
    },
    {
      name: 'github',
      type: 'github',
      enabled: true,
      config: {
        owner: process.env.GITHUB_OWNER || '',
        repo: process.env.GITHUB_REPO || '',
        projectName: 'Kanban Board',
        classicToken: process.env.CLASSIC_GITHUB_TOKEN || process.env.GITHUB_TOKEN || ''
      }
    },
    {
      name: 'trello',
      type: 'trello',
      enabled: true,
      config: {
        boardName: 'promethean',
        boardId: process.env.TRELLO_BOARD_ID || 'V54OVEMZ',
        apiKey: process.env.TRELLO_API_KEY || '',
        apiToken: process.env.TRELLO_TOKEN || process.env.TRELLO_SECRET || '',
        authentication: 'classic'
      }
    }
  ],
  defaultOptions: {
    dryRun: false,
    maxTasks: 50,
    force: false,
    verbose: false
  },
  conflictResolution: 'manual',
  logging: {
    level: 'info'
  }
};