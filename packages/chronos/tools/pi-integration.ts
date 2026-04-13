/**
 * Pi Tool Registration for Chronos
 *
 * This file shows how to integrate the chronos tool with pi.
 * Copy this file to ~/.pi/agent/tools/ or include in your pi configuration.
 */

import { chronosTool } from './chronos-tool';

// Export for pi tool registry
export default chronosTool;

// Alternative: inline tool definition for direct pi use
export const chronos = {
  name: 'chronos',
  description: `Time tracker for contracting work. Start/stop sessions and track time across projects.

Use this tool when:
- The user asks to start/stop tracking time
- The user wants to see what they've been working on
- The user mentions clients, projects, billing, or hours
- The user asks about their time tracking status

Actions:
- status: Check active sessions and recent activity
- start: Start a new session (requires project, optional task)
- stop: Stop the currently active session
- list: List recent sessions
- project_create: Create a new project
- project_list: List all projects`,

  parameters: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: ['status', 'start', 'stop', 'list', 'project_create', 'project_list'],
        description: 'Action to perform'
      },
      project: {
        type: 'string',
        description: 'Project name (for start/project_create actions)'
      },
      task: {
        type: 'string',
        description: 'Task description'
      },
      tags: {
        type: 'array',
        items: { type: 'string' },
        description: 'Tags for the session'
      },
      client: {
        type: 'string',
        description: 'Client name (for project_create)'
      },
      hourly_rate: {
        type: 'number',
        description: 'Hourly rate (for project_create)'
      }
    },
    required: ['action']
  }
};