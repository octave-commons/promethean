import { Plugin, tool } from '@opencode-ai/plugin';
import { DualStoreManager } from '@promethean/persistence';

// DualStore manager for all opencode events
let eventStore: DualStoreManager<'text', 'timestamp'>;

export const EventCapturePlugin: Plugin = async ({ client }) => {
  // Initialize DualStore manager for events
  eventStore = await DualStoreManager.create('opencode_events', 'text', 'timestamp');

  console.log('🔍 Event Capture Plugin initialized - storing all events for searchability');

  // Helper function to extract comprehensive event data
  function extractEventData(event: any): {
    eventType: string;
    timestamp: string;
    sessionId?: string;
    userId?: string;
    messageData?: any;
    sessionData?: any;
    toolData?: any;
    rawData: any;
  } {
    const timestamp = new Date().toISOString();
    const eventType = event.type || 'unknown';

    // Extract session ID from various event types
    let sessionId: string | undefined;
    if (event.properties?.sessionID) {
      sessionId = event.properties.sessionID;
    } else if (event.properties?.session?.id) {
      sessionId = event.properties.session.id;
    } else if (event.properties?.message?.session_id) {
      sessionId = event.properties.message.session_id;
    } else if (event.properties?.sessionId) {
      sessionId = event.properties.sessionId;
    }

    // Extract user ID if available
    let userId: string | undefined;
    if (event.properties?.userId) {
      userId = event.properties.userId;
    } else if (event.properties?.user?.id) {
      userId = event.properties.user.id;
    }

    // Extract message data for message-related events
    let messageData: any;
    if (event.properties?.message) {
      messageData = {
        id: event.properties.message.info?.id,
        session_id: event.properties.message.session_id,
        parts: event.properties.message.parts?.map((part: any) => ({
          type: part.type,
          text:
            part.type === 'text'
              ? part.text?.substring(0, 500) + (part.text?.length > 500 ? '...' : '')
              : undefined,
          metadata: part.metadata,
        })),
        role: event.properties.message.role,
        created_at: event.properties.message.created_at,
      };
    }

    // Extract session data for session-related events
    let sessionData: any;
    if (event.properties?.session || event.properties?.info) {
      const sessionInfo = event.properties.session || event.properties.info;
      sessionData = {
        id: sessionInfo.id,
        title: sessionInfo.title,
        created_at: sessionInfo.created_at,
        updated_at: sessionInfo.updated_at,
        message_count: sessionInfo.message_count,
        is_agent_task: sessionInfo.is_agent_task,
      };
    }

    // Extract tool data for tool-related events
    let toolData: any;
    if (event.properties?.tool) {
      toolData = {
        name: event.properties.tool.name,
        args: event.properties.tool.args,
        result: event.properties.tool.result
          ? typeof event.properties.tool.result === 'string'
            ? event.properties.tool.result.substring(0, 1000) +
              (event.properties.tool.result.length > 1000 ? '...' : '')
            : 'Complex result object'
          : undefined,
        error: event.properties.tool.error,
      };
    }

    return {
      eventType,
      timestamp,
      sessionId,
      userId,
      messageData,
      sessionData,
      toolData,
      rawData: event,
    };
  }

  // Helper function to create searchable text from event data
  function createSearchableText(eventData: ReturnType<typeof extractEventData>): string {
    const parts: string[] = [];

    parts.push(`Event: ${eventData.eventType}`);
    parts.push(`Timestamp: ${eventData.timestamp}`);

    if (eventData.sessionId) {
      parts.push(`Session: ${eventData.sessionId}`);
    }

    if (eventData.userId) {
      parts.push(`User: ${eventData.userId}`);
    }

    if (eventData.messageData) {
      parts.push(`Message ID: ${eventData.messageData.id}`);
      if (eventData.messageData.parts) {
        const textParts = eventData.messageData.parts
          .filter((part: any) => part.text)
          .map((part: any) => part.text)
          .join(' ');
        if (textParts) {
          parts.push(`Content: ${textParts}`);
        }
      }
    }

    if (eventData.sessionData) {
      parts.push(`Session Title: ${eventData.sessionData.title}`);
      if (eventData.sessionData.message_count !== undefined) {
        parts.push(`Message Count: ${eventData.sessionData.message_count}`);
      }
    }

    if (eventData.toolData) {
      parts.push(`Tool: ${eventData.toolData.name}`);
      if (eventData.toolData.args) {
        parts.push(`Tool Args: ${JSON.stringify(eventData.toolData.args).substring(0, 200)}`);
      }
      if (eventData.toolData.result) {
        parts.push(`Tool Result: ${eventData.toolData.result}`);
      }
      if (eventData.toolData.error) {
        parts.push(`Tool Error: ${eventData.toolData.error}`);
      }
    }

    return parts.join(' | ');
  }

  // Start capturing events
  (async () => {
    try {
      const events = await client.event.subscribe();
      console.log('📡 Started capturing all opencode events...');

      for await (const event of events.stream) {
        try {
          const eventData = extractEventData(event);
          const searchableText = createSearchableText(eventData);

          // Store event in dual store for searchability
          await eventStore.insert({
            id: `${eventData.eventType}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
            text: searchableText,
            timestamp: eventData.timestamp,
            metadata: {
              eventType: eventData.eventType,
              timestamp: eventData.timestamp,
              sessionId: eventData.sessionId,
              userId: eventData.userId,
              messageData: eventData.messageData,
              sessionData: eventData.sessionData,
              toolData: eventData.toolData,
              // Additional metadata for filtering
              hasMessage: !!eventData.messageData,
              hasSession: !!eventData.sessionData,
              hasTool: !!eventData.toolData,
              isAgentTask: eventData.sessionData?.is_agent_task || false,
              // Store raw event data for detailed analysis
              rawEvent: JSON.stringify(eventData.rawData).substring(0, 10000), // Limit size
            },
          });

          console.log(
            `📝 Captured event: ${eventData.eventType} (${eventData.sessionId || 'no-session'})`,
          );
        } catch (error) {
          console.error('Error capturing event:', error);
        }
      }
    } catch (subscriptionError) {
      console.error('Error subscribing to events:', subscriptionError);
    }
  })();

  return {
    tool: {
      search_events: tool({
        description: 'Search captured opencode events by semantic embedding',
        args: {
          query: tool.schema.string().describe('The search query for events'),
          k: tool.schema.number().optional().describe('Number of results to return').default(10),
          eventType: tool.schema.string().optional().describe('Filter by specific event type'),
          sessionId: tool.schema.string().optional().describe('Filter by specific session ID'),
          hasTool: tool.schema.boolean().optional().describe('Filter for events with tool usage'),
          isAgentTask: tool.schema.boolean().optional().describe('Filter for agent task events'),
        },
        async execute({ query, k, eventType, sessionId, hasTool, isAgentTask }) {
          try {
            // Build metadata filter for targeted search
            const where: any = {};

            if (eventType) {
              where.eventType = eventType;
            }

            if (sessionId) {
              where.sessionId = sessionId;
            }

            if (hasTool !== undefined) {
              where.hasTool = hasTool;
            }

            if (isAgentTask !== undefined) {
              where.isAgentTask = isAgentTask;
            }

            const results = await eventStore.getMostRelevant(
              [query],
              k,
              Object.keys(where).length > 0 ? where : undefined,
            );

            // Enhance results with more readable format
            const enhancedResults = results.map((event, index) => ({
              rank: index + 1,
              id: event.id,
              eventType: event.metadata?.eventType,
              timestamp: event.timestamp,
              sessionId: event.metadata?.sessionId,
              userId: event.metadata?.userId,
              relevanceScore: event.metadata?.relevanceScore || 0,
              summary: event.text?.substring(0, 200) + (event.text?.length > 200 ? '...' : ''),
              hasMessage: event.metadata?.hasMessage,
              hasSession: event.metadata?.hasSession,
              hasTool: event.metadata?.hasTool,
              isAgentTask: event.metadata?.isAgentTask,
              // Include key data for quick preview
              messagePreview: (event.metadata?.messageData as any)?.parts?.[0]?.text?.substring(
                0,
                100,
              ),
              sessionTitle: (event.metadata?.sessionData as any)?.title,
              toolName: (event.metadata?.toolData as any)?.name,
            }));

            return JSON.stringify(
              {
                query,
                totalResults: enhancedResults.length,
                filters: { eventType, sessionId, hasTool, isAgentTask },
                events: enhancedResults,
              },
              null,
              2,
            );
          } catch (error) {
            console.error('Error searching events:', error);
            return `Failed to search events: ${error}`;
          }
        },
      }),

      get_recent_events: tool({
        description: 'Get the most recent events with optional filtering',
        args: {
          limit: tool.schema.number().optional().describe('Number of events to return').default(20),
          eventType: tool.schema.string().optional().describe('Filter by specific event type'),
          sessionId: tool.schema.string().optional().describe('Filter by specific session ID'),
          hasTool: tool.schema.boolean().optional().describe('Filter for events with tool usage'),
          isAgentTask: tool.schema.boolean().optional().describe('Filter for agent task events'),
        },
        async execute({ limit, eventType, sessionId, hasTool, isAgentTask }) {
          try {
            // Build MongoDB filter for targeted search
            const filter: any = {};

            if (eventType) {
              filter['metadata.eventType'] = eventType;
            }

            if (sessionId) {
              filter['metadata.sessionId'] = sessionId;
            }

            if (hasTool !== undefined) {
              filter['metadata.hasTool'] = hasTool;
            }

            if (isAgentTask !== undefined) {
              filter['metadata.isAgentTask'] = isAgentTask;
            }

            const results = await eventStore.getMostRecent(limit, filter);

            // Enhance results for better readability
            const enhancedResults = results.map((event, index) => ({
              rank: index + 1,
              id: event.id,
              eventType: event.metadata?.eventType,
              timestamp: event.timestamp,
              sessionId: event.metadata?.sessionId,
              userId: event.metadata?.userId,
              summary: event.text?.substring(0, 300) + (event.text?.length > 300 ? '...' : ''),
              hasMessage: event.metadata?.hasMessage,
              hasSession: event.metadata?.hasSession,
              hasTool: event.metadata?.hasTool,
              isAgentTask: event.metadata?.isAgentTask,
              messagePreview: (event.metadata?.messageData as any)?.parts?.[0]?.text?.substring(
                0,
                100,
              ),
              sessionTitle: (event.metadata?.sessionData as any)?.title,
              toolName: (event.metadata?.toolData as any)?.name,
              toolError: (event.metadata?.toolData as any)?.error,
            }));

            return JSON.stringify(
              {
                totalResults: enhancedResults.length,
                filters: { eventType, sessionId, hasTool, isAgentTask },
                events: enhancedResults,
              },
              null,
              2,
            );
          } catch (error) {
            console.error('Error getting recent events:', error);
            return `Failed to get recent events: ${error}`;
          }
        },
      }),

      get_event_statistics: tool({
        description: 'Get statistics about captured events',
        args: {
          timeRange: tool.schema
            .enum(['1h', '6h', '24h', '7d'])
            .optional()
            .describe('Time range for statistics')
            .default('24h'),
        },
        async execute({ timeRange }) {
          try {
            const now = Date.now();
            let timeThreshold: number;

            switch (timeRange) {
              case '1h':
                timeThreshold = now - 60 * 60 * 1000;
                break;
              case '6h':
                timeThreshold = now - 6 * 60 * 60 * 1000;
                break;
              case '24h':
                timeThreshold = now - 24 * 60 * 60 * 1000;
                break;
              case '7d':
                timeThreshold = now - 7 * 24 * 60 * 60 * 1000;
                break;
              default:
                timeThreshold = now - 24 * 60 * 60 * 1000;
            }

            // Get all recent events
            const filter = {
              timestamp: { $gte: new Date(timeThreshold).toISOString() },
            };

            const recentEvents = await eventStore.getMostRecent(1000, filter);

            // Calculate statistics
            const stats = {
              timeRange,
              totalEvents: recentEvents.length,
              eventTypes: {} as Record<string, number>,
              sessionsWithActivity: new Set<string>(),
              toolUsageEvents: 0,
              agentTaskEvents: 0,
              messageEvents: 0,
              uniqueUsers: new Set<string>(),
              hourlyDistribution: {} as Record<string, number>,
            };

            recentEvents.forEach((event) => {
              const metadata = event.metadata;

              // Count event types
              const eventType = (metadata?.eventType as string) || 'unknown';
              stats.eventTypes[eventType] = (stats.eventTypes[eventType] || 0) + 1;

              // Track sessions
              if (metadata?.sessionId) {
                stats.sessionsWithActivity.add(metadata.sessionId as string);
              }

              // Track users
              if (metadata?.userId) {
                stats.uniqueUsers.add(metadata.userId as string);
              }

              // Count specific event categories
              if (metadata?.hasTool) stats.toolUsageEvents++;
              if (metadata?.isAgentTask) stats.agentTaskEvents++;
              if (metadata?.hasMessage) stats.messageEvents++;

              // Hourly distribution
              const hour = new Date(event.timestamp).getHours();
              const hourKey = `${hour}:00`;
              stats.hourlyDistribution[hourKey] = (stats.hourlyDistribution[hourKey] || 0) + 1;
            });

            // Convert Sets to counts
            const finalStats = {
              ...stats,
              sessionsWithActivity: stats.sessionsWithActivity.size,
              uniqueUsers: stats.uniqueUsers.size,
              topEventTypes: Object.entries(stats.eventTypes)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 10)
                .map(([type, count]) => ({ type, count })),
            };

            return JSON.stringify(finalStats, null, 2);
          } catch (error) {
            console.error('Error getting event statistics:', error);
            return `Failed to get event statistics: ${error}`;
          }
        },
      }),

      trace_session_activity: tool({
        description: 'Trace all activity for a specific session',
        args: {
          sessionId: tool.schema.string().describe('The session ID to trace'),
          limit: tool.schema.number().optional().describe('Maximum events to return').default(50),
        },
        async execute({ sessionId, limit }) {
          try {
            const filter = {
              'metadata.sessionId': sessionId,
            };

            const sessionEvents = await eventStore.getMostRecent(limit, filter);

            if (sessionEvents.length === 0) {
              return JSON.stringify({
                sessionId,
                message: 'No events found for this session',
                events: [],
              });
            }

            // Organize events chronologically and extract key insights
            const organizedEvents = sessionEvents.map((event, index) => ({
              sequence: index + 1,
              timestamp: event.timestamp,
              eventType: event.metadata?.eventType,
              summary: event.text?.substring(0, 200) + (event.text?.length > 200 ? '...' : ''),
              hasMessage: event.metadata?.hasMessage,
              hasTool: event.metadata?.hasTool,
              toolName: (event.metadata?.toolData as any)?.name,
              messagePreview: (event.metadata?.messageData as any)?.parts?.[0]?.text?.substring(
                0,
                100,
              ),
            }));

            // Extract session insights
            const insights = {
              totalEvents: organizedEvents.length,
              firstEvent: organizedEvents[0]?.timestamp,
              lastEvent: organizedEvents[organizedEvents.length - 1]?.timestamp,
              toolUsageCount: organizedEvents.filter((e) => e.hasTool).length,
              messageCount: organizedEvents.filter((e) => e.hasMessage).length,
              uniqueToolsUsed: Array.from(
                new Set(organizedEvents.filter((e) => e.toolName).map((e) => e.toolName)),
              ),
              eventTypes: Array.from(new Set(organizedEvents.map((e) => e.eventType))),
            };

            return JSON.stringify(
              {
                sessionId,
                insights,
                events: organizedEvents,
              },
              null,
              2,
            );
          } catch (error) {
            console.error('Error tracing session activity:', error);
            return `Failed to trace session activity: ${error}`;
          }
        },
      }),
    },
  };
};
