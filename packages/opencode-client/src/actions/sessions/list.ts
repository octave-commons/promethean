import { SessionUtils, agentTasks, sessionStore } from '../../index.js';
import { deduplicateSessions } from '../../utils/session-cleanup.js';
import type { AgentTaskStatus } from '../../types/index.js';

interface SessionData {
  id: string;
  title?: string;
  createdAt: number;
  updatedAt: number;
  lastActivity: number;
  status: string;
  time?: {
    created?: string;
    updated?: string;
  };
  activityStatus?: string;
  isAgentTask?: boolean;
  task?: string;
  completionMessage?: string;
  messages?: unknown[];
  agentTaskStatus?: string;
  lastActivityTime?: number;
}

interface StoreSession {
  id?: string;
  text: string;
  timestamp?: number | string | Date;
  [key: string]: unknown;
}

/**
 * Safely parse session data, handling both JSON and plain text formats
 */
function parseSessionData(session: StoreSession): SessionData {
  try {
    return JSON.parse(session.text);
  } catch (error) {
    // Handle legacy plain text format - extract session ID from text
    const text = session.text;
    const sessionMatch = text.match(/Session:\s*(\w+)/);
    if (sessionMatch) {
      return {
        id: sessionMatch[1],
        title: `Session ${sessionMatch[1]}`,
        createdAt: typeof session.timestamp === 'number' ? session.timestamp : Date.now(),
        updatedAt: typeof session.timestamp === 'number' ? session.timestamp : Date.now(),
        lastActivity: typeof session.timestamp === 'number' ? session.timestamp : Date.now(),
        status: 'unknown',
        time: {
          created: new Date(session.timestamp || Date.now()).toISOString(),
        },
      };
    }
    // Fallback - create minimal session object
    return {
      id: session.id?.toString() || 'unknown',
      title: 'Legacy Session',
      createdAt: typeof session.timestamp === 'number' ? session.timestamp : Date.now(),
      updatedAt: typeof session.timestamp === 'number' ? session.timestamp : Date.now(),
      lastActivity: typeof session.timestamp === 'number' ? session.timestamp : Date.now(),
      status: 'unknown',
      time: {
        created: new Date(session.timestamp || Date.now()).toISOString(),
      },
    };
  }
}

export async function list({ limit, offset }: { limit: number; offset: number }) {
  let storedSessions: StoreSession[] = [];
  const debugEnabled = Boolean(process.env.OPENCODE_DEBUG);
  try {
    if (debugEnabled) {
      console.log(`[DEBUG] list called with limit=${limit}, offset=${offset}`);
    }

    // Get sessions from dual store - use limit + offset as buffer to ensure we have enough items
    // Add a reasonable buffer to account for potential filtering, but don't fetch all 1000
    const fetchLimit = Math.min(limit + offset + 50, 500); // Reasonable upper bound
    if (debugEnabled) {
      console.log(`[DEBUG] fetchLimit=${fetchLimit}`);
    }
    storedSessions = await sessionStore.getMostRecent(fetchLimit);
    if (debugEnabled) {
      console.log(`[DEBUG] retrieved ${storedSessions?.length || 0} sessions from store`);
    }

    if (!storedSessions?.length) {
      return JSON.stringify({
        sessions: [],
        totalCount: 0,
        pagination: { limit, offset, hasMore: false },
      });
    }

    // Parse sessions and deduplicate by ID
    const parsedSessions = storedSessions.map((session) => parseSessionData(session));
    const sessionsList = deduplicateSessions(parsedSessions);
    if (debugEnabled) {
      console.log(`[DEBUG] after deduplication: ${sessionsList?.length || 0} sessions`);
      console.log(`[INFO] Session IDs being processed:`);
      sessionsList.slice(0, 5).forEach((s) => {
        console.log(`  - ${s.id} (isAgentTask: ${s.isAgentTask})`);
      });
    }

    if (!sessionsList?.length) {
      return JSON.stringify({
        sessions: [],
        totalCount: 0,
        pagination: { limit, offset, hasMore: false },
      });
    }

    const sortedSessions = [...sessionsList].sort((a, b) => {
      // Sort by creation time (most recent first), fallback to ID
      const aTime = a.createdAt || a.time?.created || '';
      const bTime = b.createdAt || b.time?.created || '';

      // Ensure timestamps are strings before comparing
      if (aTime && bTime && typeof aTime === 'string' && typeof bTime === 'string') {
        return bTime.localeCompare(aTime);
      }

      // Fallback to ID comparison if no valid timestamps
      const aId = a.id || '';
      const bId = b.id || '';
      return bId.localeCompare(aId);
    });
    const paginated = sortedSessions.slice(offset, offset + limit);
    if (debugEnabled) {
      console.log(
        `[DEBUG] after pagination: ${paginated.length} sessions (offset=${offset}, limit=${limit})`,
      );
    }

    const enhanced = await Promise.all(
      paginated.map(async (session: SessionData) => {
        try {
          // Get messages from dual store - fail fast if not available
          const messageKey = `session:${session.id}:messages`;
          // Only fetch recent messages, not all 1000
          const allStored = await sessionStore.getMostRecent(100); // Reduced from 1000
          const messageEntry = allStored.find((entry) => entry.id === messageKey);
          let messages: unknown[] = [];
          if (messageEntry) {
            messages = JSON.parse(messageEntry.text);
          }

          // Check if session already has isAgentTask property (set by EventWatcherService)
          // If not, fall back to agentTasks Map lookup
          let agentTask = agentTasks.get(session.id);

          // Debug output
          if (process.env.OPENCODE_DEBUG) {
            console.log(
              `[DEBUG] Session ${session.id}: isAgentTask=${session.isAgentTask}, agentTask from Map=${!!agentTask}`,
            );
          }

          // If session has isAgentTask property but no agentTask in Map, create a minimal agentTask object
          if (session.isAgentTask && !agentTask) {
            agentTask = {
              sessionId: session.id,
              status: (session.agentTaskStatus as AgentTaskStatus) || 'idle',
              startTime:
                typeof session.createdAt === 'string'
                  ? new Date(session.createdAt).getTime()
                  : session.createdAt || Date.now(),
              lastActivity:
                session.lastActivityTime ||
                (typeof session.createdAt === 'string'
                  ? new Date(session.createdAt).getTime()
                  : session.createdAt || Date.now()),
              task: session.title || 'Agent Task',
            };
          }

          return SessionUtils.createSessionInfo(session, messages.length, agentTask);
        } catch (error: unknown) {
          console.error(`Error processing session ${session.id}:`, error);
          let agentTask = agentTasks.get(session.id);

          // If session has isAgentTask property but no agentTask in Map, create a minimal agentTask object
          if (session.isAgentTask && !agentTask) {
            agentTask = {
              sessionId: session.id,
              status: (session.agentTaskStatus as AgentTaskStatus) || 'idle',
              startTime:
                typeof session.createdAt === 'string'
                  ? new Date(session.createdAt).getTime()
                  : session.createdAt || Date.now(),
              lastActivity:
                session.lastActivityTime ||
                (typeof session.createdAt === 'string'
                  ? new Date(session.createdAt).getTime()
                  : session.createdAt || Date.now()),
              task: session.title || 'Agent Task',
            };
          }

          return {
            ...SessionUtils.createSessionInfo(session, 0, agentTask),
            error: 'Could not fetch messages',
          };
        }
      }),
    );

    const totalCount = sessionsList.length;
    const hasMore = offset + limit < totalCount;

    return JSON.stringify(
      {
        sessions: enhanced,
        totalCount,
        pagination: {
          limit,
          offset,
          hasMore,
          currentPage: Math.floor(offset / limit) + 1,
          totalPages: Math.ceil(totalCount / limit),
        },
        summary: {
          active: enhanced.filter((s) => s.activityStatus === 'active').length,
          waiting_for_input: enhanced.filter((s) => s.activityStatus === 'waiting_for_input')
            .length,
          idle: enhanced.filter((s) => s.activityStatus === 'idle').length,
          agentTasks: enhanced.filter((s) => s.isAgentTask).length,
        },
      },
      null,
      2,
    );
  } catch (error: unknown) {
    console.error('Error in list_sessions:', error);
    console.error('Parameters received:', { limit, offset });
    console.error('Stored sessions count:', storedSessions?.length || 0);
    return `Failed to list sessions: ${error instanceof Error ? error.message : String(error)}`;
  }
}
