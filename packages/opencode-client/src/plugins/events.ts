import { type Plugin, tool } from '@opencode-ai/plugin';
import { DualStoreManager } from '@promethean/persistence';

export const EventCapturePluginSimplified: Plugin = async ({ client }) => {
  // Initialize event store
  const eventStore = await DualStoreManager.create('opencode_events', 'text', 'timestamp');
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
            const filter = buildFilter(eventType, sessionId, hasTool, isAgentTask);
            const results = await eventStore.getMostRelevant([query], k, filter);
            const enhancedResults = results.map((event, index) => enhanceEventResult(event, index));

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
            const filter = buildMongoFilter(eventType, sessionId, hasTool, isAgentTask);
            const results = await eventStore.getMostRecent(limit, filter);
            const enhancedResults = results.map((event, index) =>
              enhanceEventResult(event, index, 300),
            );

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
            const timeThreshold = getTimeThreshold(timeRange);
            const filter = { timestamp: { $gte: new Date(timeThreshold).toISOString() } };
            const recentEvents = await eventStore.getMostRecent(1000, filter);

            const stats = calculateStatistics(recentEvents, timeRange);
            return JSON.stringify(stats, null, 2);
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
            const filter = { 'metadata.sessionId': sessionId };
            const sessionEvents = await eventStore.getMostRecent(limit, filter);

            if (sessionEvents.length === 0) {
              return JSON.stringify({
                sessionId,
                message: 'No events found for this session',
                events: [],
              });
            }

            const organizedEvents = sessionEvents.map((event, index) => ({
              sequence: index + 1,
              timestamp: event.timestamp,
              eventType: event.metadata?.eventType,
              summary: truncateText(event.text, 200),
              hasMessage: event.metadata?.hasMessage,
              hasTool: event.metadata?.hasTool,
              toolName: (event.metadata?.toolData as any)?.name,
              messagePreview: truncateText(
                (event.metadata?.messageData as any)?.parts?.[0]?.text,
                100,
              ),
            }));

            const insights = extractSessionInsights(organizedEvents);

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
