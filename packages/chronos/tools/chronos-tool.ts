/**
 * CHRONOS - Agent Time Tracker Tool
 *
 * This tool allows AI agents (pi/opencode) to start/stop/observe sessions.
 *
 * Installation for pi:
 *   Add to ~/.pi/agent/tools/chronos-tool.ts or copy to the tools directory.
 *
 * Installation for opencode:
 *   Add to opencode.json tools array or place in the configured tools directory.
 *
 * Usage:
 *   - Start a session: action=start, project="ProjectName", task="description"
 *   - Stop active session: action=stop
 *   - Check status: action=status
 *   - List sessions: action=list, limit=10
 *
 * The tool communicates with the Chronos HTTP API at CHRONOS_URL (default: http://localhost:5199)
 */

const CHRONOS_URL = process.env.CHRONOS_URL || 'http://localhost:5199';

interface ChronosSession {
  id: number;
  project: string;
  task?: string;
  start_time: string;
  duration_seconds?: number;
  tags?: string[];
}

interface ChronosProject {
  id: number;
  name: string;
  client?: string;
  hourly_rate?: number;
}

interface ChronosStatus {
  active: ChronosSession[];
  recent: ChronosSession[];
  projects: ChronosProject[];
}

async function chronosApi(endpoint: string, options: RequestInit = {}): Promise<any> {
  const response = await fetch(`${CHRONOS_URL}/api${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });

  if (!response.ok) {
    throw new Error(`Chronos API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export const name = 'chronos';
export const description = `Time tracker for contracting work. Start/stop sessions and track time across projects.

Actions:
- status: Check active sessions and recent activity
- start: Start a new session (requires project, optional task and tags)
- stop: Stop the currently active session
- list: List recent sessions
- project_create: Create a new project
- project_list: List all projects

Example:
  chronos({ action: 'start', project: 'ClientA', task: 'Code review' })
  chronos({ action: 'stop' })
  chronos({ action: 'status' })`;

export const parameters = {
  type: 'object',
  properties: {
    action: {
      type: 'string',
      enum: ['status', 'start', 'stop', 'list', 'project_create', 'project_list'],
      description: 'Action to perform',
      default: 'status'
    },
    project: {
      type: 'string',
      description: 'Project name (for start action, will be created if it doesn\'t exist)'
    },
    task: {
      type: 'string',
      description: 'Task description (for start action)'
    },
    tags: {
      type: 'array',
      items: { type: 'string' },
      description: 'Tags for the session'
    },
    limit: {
      type: 'number',
      description: 'Number of sessions to list (for list action)',
      default: 10
    },
    client: {
      type: 'string',
      description: 'Client name (for project_create action)'
    },
    hourly_rate: {
      type: 'number',
      description: 'Hourly rate (for project_create action)'
    }
  },
  required: ['action']
};

export async function execute(params: {
  action: 'status' | 'start' | 'stop' | 'list' | 'project_create' | 'project_list';
  project?: string;
  task?: string;
  tags?: string[];
  limit?: number;
  client?: string;
  hourly_rate?: number;
}): Promise<{ content: Array<{ type: string; text: string }> }> {

  try {
    switch (params.action) {
      case 'status': {
        const status = await chronosApi('/agent/status') as ChronosStatus;

        let text = '## Chronos Status\n\n';

        if (status.active.length > 0) {
          text += '### Active Sessions\n';
          for (const session of status.active) {
            const duration = Math.floor((Date.now() - new Date(session.start_time).getTime()) / 1000);
            text += `- **${session.project}**: ${session.task || 'No task'}\n`;
            text += `  - Duration: ${Math.floor(duration / 3600)}h ${Math.floor((duration % 3600) / 60)}m\n`;
          }
        } else {
          text += 'No active sessions.\n';
        }

        text += '\n### Recent Sessions\n';
        for (const session of status.recent.slice(0, 5)) {
          const hours = session.duration_seconds ? Math.floor(session.duration_seconds / 3600) : 0;
          const mins = session.duration_seconds ? Math.floor((session.duration_seconds % 3600) / 60) : 0;
          text += `- ${session.project}: ${session.task || 'No task'} (${hours}h ${mins}m)\n`;
        }

        text += '\n### Projects\n';
        for (const project of status.projects) {
          text += `- ${project.name}${project.client ? ` (${project.client})` : ''}\n`;
        }

        return { content: [{ type: 'text', text }] };
      }

      case 'start': {
        if (!params.project) {
          return { content: [{ type: 'text', text: 'Error: project parameter required for start action' }] };
        }

        const result = await chronosApi('/sessions/start', {
          method: 'POST',
          body: JSON.stringify({
            project_name: params.project,
            task: params.task,
            tags: params.tags,
            client: params.client,
            hourly_rate: params.hourly_rate
          })
        });

        return {
          content: [{
            type: 'text',
            text: `Started session #${result.id} on project "${result.project_name || params.project}"${params.task ? `: ${params.task}` : ''}`
          }]
        };
      }

      case 'stop': {
        const result = await chronosApi('/sessions/stop-all', { method: 'POST' });

        if (result.stopped === 0) {
          return { content: [{ type: 'text', text: 'No active sessions to stop.' }] };
        }

        const sessions = result.sessions.map((s: any) => {
          const hours = Math.floor(s.duration_seconds / 3600);
          const mins = Math.floor((s.duration_seconds % 3600) / 60);
          return `"${s.project_name}" (${hours}h ${mins}m)`;
        }).join(', ');

        return {
          content: [{
            type: 'text',
            text: `Stopped ${result.stopped} session(s): ${sessions}`
          }]
        };
      }

      case 'list': {
        const sessions = await chronosApi(`/sessions?limit=${params.limit || 10}`);

        let text = '## Recent Sessions\n\n';
        for (const session of sessions) {
          const hours = session.duration_seconds ? Math.floor(session.duration_seconds / 3600) : 0;
          const mins = session.duration_seconds ? Math.floor((session.duration_seconds % 3600) / 60) : 0;
          const endTime = session.end_time ? new Date(session.end_time).toLocaleDateString() : 'active';
          text += `- **${session.project_name}**: ${session.task || 'No task'}\n`;
          text += `  - Duration: ${hours}h ${mins}m\n`;
          text += `  - Date: ${endTime}\n`;
          if (session.tags?.length) {
            text += `  - Tags: ${session.tags.join(', ')}\n`;
          }
        }

        return { content: [{ type: 'text', text }] };
      }

      case 'project_create': {
        if (!params.project) {
          return { content: [{ type: 'text', text: 'Error: project parameter required for project_create action' }] };
        }

        const result = await chronosApi('/projects', {
          method: 'POST',
          body: JSON.stringify({
            name: params.project,
            client: params.client,
            hourly_rate: params.hourly_rate
          })
        });

        return {
          content: [{
            type: 'text',
            text: `Created project "${result.name}" (id: ${result.id})${params.client ? ` for client "${params.client}"` : ''}`
          }]
        };
      }

      case 'project_list': {
        const projects = await chronosApi('/projects');

        let text = '## Projects\n\n';
        for (const project of projects) {
          text += `- **${project.name}**${project.client ? ` (${project.client})` : ''}\n`;
          if (project.hourly_rate) {
            text += `  - Rate: $${project.hourly_rate}/hr\n`;
          }
        }

        return { content: [{ type: 'text', text }] };
      }

      default:
        return { content: [{ type: 'text', text: `Unknown action: ${params.action}` }] };
    }
  } catch (error: any) {
    return { content: [{ type: 'text', text: `Chronos error: ${error.message}` }] };
  }
}

export default { name, description, parameters, execute };