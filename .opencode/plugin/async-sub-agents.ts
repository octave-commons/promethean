import { type Plugin, tool } from '@opencode-ai/plugin';
import { DualStoreManager } from '@promethean/persistence';

const sessions = new Map<string, any>();

// DualStore managers for session messages and agent tasks
let sessionStore: DualStoreManager<'text', 'timestamp'>;
let agentTaskStore: DualStoreManager<'text', 'timestamp'>;

const agentTasks = new Map<
  string,
  {
    sessionId: string;
    task: string;
    startTime: number;
    status: 'running' | 'completed' | 'failed' | 'idle';
    lastActivity: number;
    completionMessage?: string;
  }
>();

export const MyPlugin: Plugin = async ({ client }) => {
  // Initialize DualStore managers
  sessionStore = await DualStoreManager.create('session_messages', 'text', 'timestamp');
  agentTaskStore = await DualStoreManager.create('agent_tasks', 'text', 'timestamp');

  // Helper function to extract session ID from different event types
  function getSessionID(event: any): string | null {
    try {
      // Handle session.idle events
      if (event.type === 'session.idle') {
        return event.properties.sessionID || event.properties.session?.id;
      }
      // Handle session.updated events
      else if (event.type === 'session.updated') {
        return event.properties.info?.id || event.properties.session?.id;
      }
      // Handle message events that might contain session info
      else if (event.type === 'message.updated' || event.type === 'message.part.updated') {
        return event.properties.message?.session_id || event.properties.sessionId;
      }
      // Handle session.compacted events
      else if (event.type === 'session.compacted') {
        return event.properties.sessionId || event.properties.session?.id;
      }
      return null;
    } catch (error) {
      console.error('Error extracting session ID:', error);
      return null;
    }
  }

  // Helper function to detect agent task completion
  function detectTaskCompletion(messages: any[]): {
    completed: boolean;
    completionMessage?: string;
  } {
    if (!messages || messages.length === 0) {
      return { completed: false };
    }

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || !lastMessage.parts) {
      return { completed: false };
    }

    // Look for completion indicators in the last message
    const textParts = lastMessage.parts.filter((part: any) => part.type === 'text');
    if (textParts.length === 0) {
      return { completed: false };
    }

    const lastText = textParts[textParts.length - 1].text.toLowerCase();

    // Completion indicators
    const completionPatterns = [
      /task.*completed/i,
      /finished.*task/i,
      /done.*with.*task/i,
      /task.*finished/i,
      /completed.*successfully/i,
      /work.*complete/i,
      /all.*done/i,
      /mission.*accomplished/i,
      /objective.*achieved/i,
      /✅|🎉|🏆|✓/g, // Emoji indicators
    ];

    const isCompleted = completionPatterns.some((pattern) => pattern.test(lastText));

    return {
      completed: isCompleted,
      completionMessage: isCompleted ? lastText : undefined,
    };
  }

  // Helper function to update agent task status
  async function updateAgentTaskStatus(
    sessionID: string,
    status: 'running' | 'completed' | 'failed' | 'idle',
    completionMessage?: string,
  ) {
    const existingTask = agentTasks.get(sessionID);
    if (existingTask) {
      existingTask.status = status;
      existingTask.lastActivity = Date.now();
      if (completionMessage) {
        existingTask.completionMessage = completionMessage;
      }
      console.log(`Agent task status updated for session ${sessionID}: ${status}`);

      // Update in dual store as well
      try {
        await agentTaskStore.insert({
          id: sessionID,
          text: existingTask.task,
          timestamp: existingTask.startTime,
          metadata: {
            sessionId: sessionID,
            status,
            lastActivity: existingTask.lastActivity,
            completionMessage,
          },
        });
      } catch (error) {
        console.error('Error updating agent task in dual store:', error);
      }

      // Log completion if task is done
      if (status === 'completed') {
        console.log(`✅ Agent task completed for session ${sessionID}:`, completionMessage);
      } else if (status === 'failed') {
        console.log(`❌ Agent task failed for session ${sessionID}:`, completionMessage);
      }
    }
  }

  // Helper function to monitor agent tasks
  function monitorAgentTasks() {
    const now = Date.now();
    const timeoutThreshold = 30 * 60 * 1000; // 30 minutes

    for (const [sessionID, task] of Array.from(agentTasks.entries())) {
      if (task.status === 'running' && now - task.lastActivity > timeoutThreshold) {
        console.warn(
          `⚠️ Agent task timeout for session ${sessionID} (inactive for ${timeoutThreshold / 60000} minutes)`,
        );
        updateAgentTaskStatus(sessionID, 'failed', 'Task timed out due to inactivity');
      }
    }
  }

  // Start monitoring agent tasks periodically
  const monitoringInterval = setInterval(monitorAgentTasks, 5 * 60 * 1000); // Check every 5 minutes

  (async () => {
    try {
      // Listen to real-time events
      const events = await client.event.subscribe();
      console.log('🔍 Started listening for session events...');

      for await (const event of events.stream) {
        try {
          console.log('📡 Event received:', event.type, event.properties);

          const sessionID = getSessionID(event);
          if (!sessionID) {
            console.log('⏭️ Skipping event - no session ID found');
            continue;
          }

          // Handle different event types
          if (event.type === 'session.idle') {
            console.log(`💤 Session ${sessionID} is idle`);
            await updateAgentTaskStatus(sessionID, 'idle');

            // Check for task completion when session goes idle
            try {
              const messages = await client.session.messages({
                path: { id: sessionID },
              });

              if (messages?.data) {
                const completion = detectTaskCompletion(messages.data);
                if (completion.completed) {
                  await updateAgentTaskStatus(sessionID, 'completed', completion.completionMessage);
                }
              }
            } catch (error) {
              console.error(`Error checking completion for idle session ${sessionID}:`, error);
            }
          } else if (event.type === 'session.updated') {
            console.log(`🔄 Session ${sessionID} updated`);
            await updateAgentTaskStatus(sessionID, 'running');
          } else if (event.type === 'message.updated') {
            console.log(`💬 Message updated in session ${sessionID}`);
            await updateAgentTaskStatus(sessionID, 'running');
          }

          // Process messages for both idle and updated events
          if (event.type === 'session.idle' || event.type === 'session.updated') {
            try {
              const messages = await client.session.messages({
                path: { id: sessionID },
              });

              if (messages?.data) {
                await Promise.all(
                  messages.data.map(async (message) => {
                    if (!message?.parts) return;

                    return Promise.all(
                      message.parts.map(async (part) => {
                        if (part.type === 'text' && part.text.trim()) {
                          try {
                            // Store in dual store instead of in-memory vector store
                            await sessionStore.insert({
                              id: message.info.id,
                              text: part.text,
                              timestamp: new Date().toISOString(),
                              metadata: {
                                sessionID: sessionID,
                                messageID: message.info.id,
                                type: 'text',
                              },
                            });
                            console.log(
                              `📝 Indexed message ${message.info.id} from session ${sessionID}`,
                            );
                          } catch (embeddingError) {
                            console.error(
                              `Error storing message ${message.info.id} in dual store:`,
                              embeddingError,
                            );
                          }
                        }
                      }),
                    );
                  }),
                );
              }
            } catch (error) {
              console.error(`Error processing messages for session ${sessionID}:`, error);
            }
          }
        } catch (eventError) {
          console.error('Error processing event:', eventError);
        }
      }
    } catch (subscriptionError) {
      console.error('Error subscribing to events:', subscriptionError);
    }
  })();

  // Cleanup on plugin unload
  process.on('SIGINT', () => {
    clearInterval(monitoringInterval);
    console.log('🧹 Cleaned up monitoring interval');
  });

  return {
    tool: {
      search_sessions: tool({
        description: 'Search past sessions by semantic embedding',
        args: {
          query: tool.schema.string().describe('The search query'),
          k: tool.schema.number().optional().describe('Number of results to return').default(5),
        },
        async execute({ query, k }) {
          try {
            const results = await sessionStore.getMostRelevant([query], k);
            return JSON.stringify(results);
          } catch (error) {
            console.error('Error searching sessions:', error);
            return `Failed to search sessions: ${error}`;
          }
        },
      }),

      list_sessions: tool({
        description: 'List all active sessions with pagination and activity status',
        args: {
          limit: tool.schema
            .number()
            .optional()
            .describe('Number of sessions to return')
            .default(20),
          offset: tool.schema.number().optional().describe('Number of sessions to skip').default(0),
        },
        async execute({ limit = 20, offset = 0 }) {
          try {
            const { data: sessionsList, error } = await client.session.list();
            if (error) {
              console.error('Error fetching sessions:', error);
              return `Failed to fetch sessions: ${error}`;
            }

            if (!sessionsList || sessionsList.length === 0) {
              return JSON.stringify({
                sessions: [],
                totalCount: 0,
                pagination: { limit, offset, hasMore: false },
              });
            }

            const now = Date.now();

            // Sort sessions by most recent first (using session ID as fallback for sorting)
            const sortedSessions = sessionsList.sort((a, b) => {
              // For now, sort by ID descending as a proxy for recency
              // In a real implementation, you'd sort by actual timestamps
              return b.id.localeCompare(a.id);
            });

            // Apply pagination
            const paginatedSessions = sortedSessions.slice(offset, offset + limit);

            // Enhanced session information with activity status
            const enhancedSessions = await Promise.all(
              paginatedSessions.map(async (session) => {
                try {
                  // Get messages to determine activity status
                  const { data: messages } = await client.session.messages({
                    path: { id: session.id },
                  });

                  const messageCount = messages?.length || 0;
                  const agentTask = agentTasks.get(session.id);

                  // Determine activity status based on available data
                  let activityStatus = 'idle';

                  if (agentTask) {
                    // If we have an agent task, use its status
                    if (agentTask.status === 'running') {
                      const recentActivity = now - agentTask.lastActivity < 5 * 60 * 1000; // 5 minutes
                      activityStatus = recentActivity ? 'active' : 'waiting_for_input';
                    } else {
                      activityStatus = agentTask.status;
                    }
                  } else {
                    // For regular sessions, use heuristics based on message count and session ID patterns
                    // Sessions with very few messages are likely newer/more active
                    if (messageCount < 10) {
                      activityStatus = 'active';
                    } else if (messageCount < 50) {
                      activityStatus = 'waiting_for_input';
                    } else {
                      activityStatus = 'idle';
                    }
                  }

                  // Calculate session age (using current time as fallback since we don't have created_at)
                  const sessionAge = agentTask ? Math.round((now - agentTask.startTime) / 1000) : 0;

                  return {
                    id: session.id,
                    title: session.title,
                    messageCount,
                    lastActivityTime: new Date().toISOString(),
                    sessionAge,
                    activityStatus,
                    isAgentTask: !!agentTask,
                    agentTaskStatus: agentTask?.status,
                  };
                } catch (messageError) {
                  console.error(`Error fetching messages for session ${session.id}:`, messageError);

                  // Fallback information if we can't get messages
                  const agentTask = agentTasks.get(session.id);
                  const sessionAge = agentTask ? Math.round((now - agentTask.startTime) / 1000) : 0;

                  let activityStatus = 'idle';
                  if (agentTask) {
                    activityStatus = agentTask.status;
                  }

                  return {
                    id: session.id,
                    title: session.title,
                    messageCount: 0,
                    lastActivityTime: new Date().toISOString(),
                    sessionAge,
                    activityStatus,
                    isAgentTask: !!agentTask,
                    agentTaskStatus: agentTask?.status,
                    error: 'Could not fetch messages',
                  };
                }
              }),
            );

            const totalCount = sessionsList.length;
            const hasMore = offset + limit < totalCount;

            return JSON.stringify(
              {
                sessions: enhancedSessions,
                totalCount,
                pagination: {
                  limit,
                  offset,
                  hasMore,
                  currentPage: Math.floor(offset / limit) + 1,
                  totalPages: Math.ceil(totalCount / limit),
                },
                summary: {
                  active: enhancedSessions.filter((s) => s.activityStatus === 'active').length,
                  waiting_for_input: enhancedSessions.filter(
                    (s) => s.activityStatus === 'waiting_for_input',
                  ).length,
                  idle: enhancedSessions.filter((s) => s.activityStatus === 'idle').length,
                  agentTasks: enhancedSessions.filter((s) => s.isAgentTask).length,
                },
              },
              null,
              2,
            );
          } catch (error) {
            console.error('Error in list_sessions:', error);
            return `Failed to list sessions: ${error}`;
          }
        },
      }),

      get_session: tool({
        description: 'Get details of a specific session by ID',
        args: {
          sessionId: tool.schema.string().describe('The ID of the session to retrieve'),
        },
        async execute({ sessionId }) {
          const { data: session, error } = await client.session.get({
            path: { id: sessionId },
          });
          if (error) {
            console.error('Error fetching session:', error);
            return `Failed to fetch session "${sessionId}": ${error}`;
          }
          return JSON.stringify(session);
        },
      }),

      close_session: tool({
        description: 'Close a specific session by ID',
        args: {
          sessionId: tool.schema.string().describe('The ID of the session to close'),
        },
        async execute({ sessionId }) {
          await client.session.delete({
            path: { id: sessionId },
          });
          return `Session ${sessionId} was closed`;
        },
      }),

      index_sessions: tool({
        description: 'Index all past sessions for semantic search',
        args: {},
        async execute() {
          const { data: sessionsList, error } = await client.session.list();
          if (error) {
            console.error('Error fetching sessions:', error);
            return `Failed to fetch sessions: ${error}`;
          }

          let indexedCount = 0;
          await Promise.all(
            sessionsList?.map(async (session) => {
              const messages = await client.session.messages({
                path: { id: session.id },
              });
              await Promise.all(
                messages?.data?.map(async (message) => {
                  return Promise.all(
                    message?.parts?.map(async (part) => {
                      if (part.type === 'text') {
                        try {
                          await sessionStore.insert({
                            id: message.info.id,
                            text: part.text,
                            timestamp: new Date().toISOString(),
                            metadata: {
                              sessionID: session.id,
                              messageID: message.info.id,
                              type: 'text',
                            },
                          });
                          indexedCount++;
                        } catch (error) {
                          console.warn(
                            `⚠️ Error indexing message ${message.info.id} from session ${session.id}:`,
                            error,
                          );
                        }
                      }
                    }),
                  );
                }) ?? [],
              );
            }) ?? [],
          );
          return `Indexed ${indexedCount} messages from ${sessionsList?.length} sessions for semantic search`;
        },
      }),

      spawn_session: tool({
        description:
          'Spawn a new session with a specific task to run in the background while you continue your work',
        args: {
          prompt: tool.schema.string().describe('The task for the new agent session'),
          files: tool.schema
            .array(tool.schema.string())
            .optional()
            .describe('Optional files the session may need'),
          delegates: tool.schema
            .array(tool.schema.string())
            .optional()
            .describe('Optional list of agents to delegate tasks to'),
        },
        async execute({ prompt, files, delegates }) {
          const agentName = `SubAgent-${Math.random().toString(36).substring(2, 8)}`;

          try {
            const { data: subSession, error } = await client.session.create({
              body: {
                title: agentName,
              },
            });

            if (error) {
              console.error('Error creating session:', error);
              return `Failed to spawn sub-agent "${agentName}": ${error.data}`;
            }

            // Store the session for future reference
            sessions.set(subSession.id, subSession);

            const taskDescription = `You are "${agentName}", a sub-agent spawned to assist with the following task: ${prompt}. Work independently to complete this task while the main agent continues its work.`;

            const startTime = Date.now();

            // Track the agent task for monitoring
            agentTasks.set(subSession.id, {
              sessionId: subSession.id,
              task: prompt,
              startTime,
              status: 'running',
              lastActivity: startTime,
            });

            // Store in dual store as well
            try {
              await agentTaskStore.insert({
                id: subSession.id,
                text: prompt,
                timestamp: new Date().toISOString(),
                metadata: {
                  sessionId: subSession.id,
                  startTime,
                  status: 'running',
                  lastActivity: startTime,
                },
              });
            } catch (error) {
              console.error('Error storing agent task in dual store:', error);
            }

            console.log(
              `🚀 Spawned new sub-agent "${agentName}" (session: ${subSession.id}) with task: ${prompt}`,
            );

            // Prepare the parts array
            const parts: any[] = [
              {
                type: 'text',
                text: taskDescription,
              },
            ];

            // Include files if provided
            if (files && files.length > 0) {
              for (const file of files) {
                parts.push({
                  type: 'file',
                  url: `file://${file}`,
                  mime: 'text/plain',
                });
              }
            }

            // Include delegates if provided
            if (delegates && delegates.length > 0) {
              for (const delegateName of delegates) {
                parts.push({
                  type: 'agent',
                  name: delegateName,
                });
              }
            }

            // Send the prompt to the new session
            client.session.prompt({
              path: { id: subSession.id },
              body: {
                parts,
              },
            });

            return `Spawned new sub-agent "${agentName}" (session: ${subSession.id}) with task: ${prompt}`;
          } catch (error) {
            console.error('Error in spawn_agent:', error);
            return `Failed to spawn sub-agent "${agentName}": ${error}`;
          }
        },
      }),

      monitor_agents: tool({
        description: 'Monitor the status of all spawned sub-agent tasks',
        args: {},
        async execute() {
          try {
            // Get recent tasks from dual store
            const storedTasks = await agentTaskStore.getMostRecent(100);
            const now = Date.now();

            // Merge with in-memory tasks for complete picture
            const allAgentTasks = new Map(agentTasks);

            // Update in-memory map with stored tasks
            for (const task of storedTasks) {
              if (!allAgentTasks.has(task.id || '')) {
                const sessionId =
                  (task.metadata?.sessionId as string | undefined) || task.id || 'unknown';
                const startTime =
                  typeof task.timestamp === 'number'
                    ? task.timestamp
                    : task.timestamp
                      ? new Date(task.timestamp).getTime()
                      : Date.now();
                const status =
                  (task.metadata?.status as
                    | 'running'
                    | 'completed'
                    | 'failed'
                    | 'idle'
                    | undefined) || 'idle';
                const lastActivity =
                  typeof task.metadata?.lastActivity === 'number'
                    ? task.metadata.lastActivity
                    : task.metadata?.lastActivity
                      ? new Date(task.metadata.lastActivity as string).getTime()
                      : startTime;
                const completionMessage = task.metadata?.completionMessage as string | undefined;

                allAgentTasks.set(task.id || '', {
                  sessionId: sessionId || task.id || 'unknown',
                  task: task.text,
                  startTime,
                  status,
                  lastActivity,
                  completionMessage,
                });
              }
            }

            const agentStatus = Array.from(allAgentTasks.entries()).map(([sessionId, task]) => ({
              sessionId,
              task: task.task,
              status: task.status,
              startTime: new Date(task.startTime).toISOString(),
              lastActivity: new Date(task.lastActivity).toISOString(),
              duration: Math.round((now - task.startTime) / 1000), // seconds
              completionMessage: task.completionMessage,
            }));

            const summary = {
              totalAgents: allAgentTasks.size,
              running: agentStatus.filter((a) => a.status === 'running').length,
              completed: agentStatus.filter((a) => a.status === 'completed').length,
              failed: agentStatus.filter((a) => a.status === 'failed').length,
              idle: agentStatus.filter((a) => a.status === 'idle').length,
              agents: agentStatus,
            };

            return JSON.stringify(summary, null, 2);
          } catch (error) {
            console.error('Error monitoring agents:', error);
            return `Failed to monitor agents: ${error}`;
          }
        },
      }),

      get_agent_status: tool({
        description: 'Get the status of a specific sub-agent by session ID',
        args: {
          sessionId: tool.schema.string().describe('The session ID of the sub-agent to check'),
        },
        async execute({ sessionId }) {
          try {
            let task = agentTasks.get(sessionId);

            // If not in memory, try to get from dual store
            if (!task) {
              const storedTasks = await agentTaskStore.getMostRecent(100);
              const storedTask = storedTasks.find((t) => t.id === sessionId);
              if (storedTask) {
                task = {
                  sessionId:
                    (storedTask.metadata?.sessionId as string) || storedTask.id || 'unknown',
                  task: storedTask.text,
                  startTime:
                    typeof storedTask.timestamp === 'number'
                      ? storedTask.timestamp
                      : new Date(storedTask.timestamp).getTime(),
                  status:
                    (storedTask.metadata?.status as 'running' | 'completed' | 'failed' | 'idle') ||
                    'idle',
                  lastActivity:
                    typeof storedTask.metadata?.lastActivity === 'number'
                      ? storedTask.metadata.lastActivity
                      : new Date(
                          (storedTask.metadata?.lastActivity as string | number) ||
                            (storedTask.timestamp as string | number),
                        ).getTime(),
                  completionMessage: storedTask.metadata?.completionMessage as string | undefined,
                };
              }
            }

            if (!task) {
              return `No agent task found for session ${sessionId}`;
            }

            const now = Date.now();
            const status = {
              sessionId,
              task: task.task,
              status: task.status,
              startTime: new Date(task.startTime).toISOString(),
              lastActivity: new Date(task.lastActivity).toISOString(),
              duration: Math.round((now - task.startTime) / 1000), // seconds
              completionMessage: task.completionMessage,
            };

            return JSON.stringify(status, null, 2);
          } catch (error) {
            console.error('Error getting agent status:', error);
            return `Failed to get agent status: ${error}`;
          }
        },
      }),

      cleanup_completed_agents: tool({
        description: 'Remove completed or failed agent tasks from monitoring',
        args: {
          olderThan: tool.schema
            .number()
            .optional()
            .describe('Remove tasks completed longer than this many minutes ago')
            .default(60),
        },
        async execute({ olderThan }) {
          const now = Date.now();
          const threshold = olderThan * 60 * 1000; // Convert minutes to milliseconds
          let removedCount = 0;

          for (const [sessionId, task] of Array.from(agentTasks.entries())) {
            const isCompletedOrFailed = task.status === 'completed' || task.status === 'failed';
            const isOldEnough = now - task.lastActivity > threshold;

            if (isCompletedOrFailed && isOldEnough) {
              agentTasks.delete(sessionId);
              removedCount++;
              console.log(`🧹 Cleaned up agent task ${sessionId} (${task.status})`);
            }
          }

          return `Cleaned up ${removedCount} completed/failed agent tasks older than ${olderThan} minutes`;
        },
      }),

      send_agent_message: tool({
        description:
          'Send a message to a specific agent session to enable inter-agent communication',
        args: {
          sessionId: tool.schema.string().describe('The session ID of the target agent'),
          message: tool.schema.string().describe('The message to send to the agent'),
          priority: tool.schema
            .enum(['low', 'medium', 'high', 'urgent'])
            .optional()
            .describe('Message priority level')
            .default('medium'),
          messageType: tool.schema
            .enum(['instruction', 'query', 'update', 'coordination', 'status_request'])
            .optional()
            .describe('Type of message being sent')
            .default('instruction'),
        },
        async execute({ sessionId, message, priority, messageType }) {
          try {
            // Verify the target session exists and is an agent
            const targetTask = agentTasks.get(sessionId);
            if (!targetTask) {
              // Try to find in dual store
              const storedTasks = await agentTaskStore.getMostRecent(100);
              const storedTask = storedTasks.find((t) => t.id === sessionId);
              if (!storedTask) {
                return `❌ No agent found with session ID: ${sessionId}`;
              }
            }

            // Get current session info for sender identification
            const currentSession = await client.session.list();
            const senderSessionId = currentSession.data?.[0]?.id || 'unknown';

            // Create a structured message with metadata
            const structuredMessage = {
              type: 'inter_agent_message',
              sender: senderSessionId,
              recipient: sessionId,
              timestamp: new Date().toISOString(),
              priority,
              messageType,
              content: message,
              metadata: {
                sentVia: 'send_agent_message_tool',
                urgency: priority === 'urgent' ? 'immediate_attention_required' : 'normal',
              },
            };

            // Format the message for the agent with safe string operations
            const safeSenderId =
              senderSessionId.length > 8 ? senderSessionId.substring(0, 8) : senderSessionId;
            const safeRecipientId = sessionId.length > 8 ? sessionId.substring(0, 8) : sessionId;

            const formattedMessage = `🔔 **INTER-AGENT MESSAGE** 🔔

**From:** Agent ${safeSenderId}...
**To:** Agent ${safeRecipientId}...
**Priority:** ${priority.toUpperCase()}
**Type:** ${messageType.replace('_', ' ').toUpperCase()}
**Time:** ${new Date().toLocaleTimeString()}

**Message:**
${message}

`;

            // Send the message to the target agent session
            client.session.prompt({
              path: { id: sessionId },
              body: {
                parts: [
                  {
                    type: 'text',
                    text: formattedMessage,
                  },
                ],
              },
            });

            // Update the target agent's last activity to ensure they're marked as active
            await updateAgentTaskStatus(sessionId, 'running');

            // Log the communication for tracking
            console.log(`📨 Inter-agent message sent from ${senderSessionId} to ${sessionId}`);
            console.log(`📝 Message type: ${messageType}, Priority: ${priority}`);

            // Store the communication in the session store for tracking
            try {
              await sessionStore.insert({
                id: `inter_agent_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
                text: `Inter-agent message: ${message}`,
                timestamp: new Date().toISOString(),
                metadata: {
                  type: 'inter_agent_communication',
                  sender: senderSessionId,
                  recipient: sessionId,
                  priority,
                  messageType,
                  structuredMessage,
                },
              });
            } catch (storeError) {
              console.warn('⚠️ Failed to store inter-agent communication:', storeError);
            }

            return `✅ Message sent successfully to agent ${safeRecipientId}... (Priority: ${priority}, Type: ${messageType})`;
          } catch (error) {
            console.error('Error sending agent message:', error);
            return `❌ Failed to send message to agent ${sessionId}: ${error}`;
          }
        },
      }),
    },
  };
};
