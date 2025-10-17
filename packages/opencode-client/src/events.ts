import { Plugin, tool } from '@opencode-ai/plugin';
import { DualStoreManager } from '@promethean/persistence';

// Initialize DualStore manager for events
const eventStore = await DualStoreManager.create('opencode_events', 'text', 'timestamp');

console.log(
  '🔍 Event Capture Plugin (Simplified) initialized - storing all events for searchability',
);

// ===== SIMPLIFIED EXTRACTOR FUNCTIONS =====

/** Extract session ID from various event structures */
function extractSessionId(event: any): string | undefined {
  return (
    event.properties?.sessionID ||
    event.properties?.session?.id ||
    event.properties?.message?.session_id ||
    event.properties?.sessionId
  );
}

/** Extract user ID from event */
function extractUserId(event: any): string | undefined {
  return event.properties?.userId || event.properties?.user?.id;
}

/** Extract message data with text truncation */
function extractMessageData(event: any): any {
  const message = event.properties?.message;
  if (!message) return undefined;

  return {
    id: message.info?.id,
    session_id: message.session_id,
    parts: message.parts?.map((part: any) => ({
      type: part.type,
      text: part.type === 'text' ? truncateText(part.text, 500) : undefined,
      metadata: part.metadata,
    })),
    role: message.role,
    created_at: message.created_at,
  };
}

/** Extract session data */
function extractSessionData(event: any): any {
  const sessionInfo = event.properties?.session || event.properties?.info;
  if (!sessionInfo) return undefined;

  return {
    id: sessionInfo.id,
    title: sessionInfo.title,
    created_at: sessionInfo.created_at,
    updated_at: sessionInfo.updated_at,
    message_count: sessionInfo.message_count,
    is_agent_task: sessionInfo.is_agent_task,
  };
}

/** Extract tool data with result truncation */
function extractToolData(event: any): any {
  const tool = event.properties?.tool;
  if (!tool) return undefined;

  return {
    name: tool.name,
    args: tool.args,
    result: tool.result
      ? typeof tool.result === 'string'
        ? truncateText(tool.result, 1000)
        : 'Complex result object'
      : undefined,
    error: tool.error,
  };
}

/** Truncate text helper */
function truncateText(text: string | undefined, maxLength: number): string | undefined {
  if (!text) return undefined;
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

// ===== SIMPLIFIED MAIN EXTRACTOR =====

/** Extract comprehensive event data using focused extractors */
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
  return {
    eventType: event.type || 'unknown',
    timestamp: new Date().toISOString(),
    sessionId: extractSessionId(event),
    userId: extractUserId(event),
    messageData: extractMessageData(event),
    sessionData: extractSessionData(event),
    toolData: extractToolData(event),
    rawData: event,
  };
}

// ===== SIMPLIFIED SEARCHABLE TEXT CREATION =====

/** Create searchable text components */
function createTextComponents(eventData: ReturnType<typeof extractEventData>): string[] {
  const components: string[] = [];

  // Basic info
  components.push(`Event: ${eventData.eventType}`);
  components.push(`Timestamp: ${eventData.timestamp}`);

  // Optional identifiers
  if (eventData.sessionId) components.push(`Session: ${eventData.sessionId}`);
  if (eventData.userId) components.push(`User: ${eventData.userId}`);

  // Message content
  if (eventData.messageData) {
    components.push(`Message ID: ${eventData.messageData.id}`);
    const messageText = eventData.messageData.parts
      ?.filter((part: any) => part.text)
      ?.map((part: any) => part.text)
      ?.join(' ');
    if (messageText) components.push(`Content: ${messageText}`);
  }

  // Session info
  if (eventData.sessionData) {
    components.push(`Session Title: ${eventData.sessionData.title}`);
    if (eventData.sessionData.message_count !== undefined) {
      components.push(`Message Count: ${eventData.sessionData.message_count}`);
    }
  }

  // Tool info
  if (eventData.toolData) {
    components.push(`Tool: ${eventData.toolData.name}`);
    if (eventData.toolData.args) {
      components.push(`Tool Args: ${JSON.stringify(eventData.toolData.args).substring(0, 200)}`);
    }
    if (eventData.toolData.result) {
      components.push(`Tool Result: ${eventData.toolData.result}`);
    }
    if (eventData.toolData.error) {
      components.push(`Tool Error: ${eventData.toolData.error}`);
    }
  }

  return components;
}

/** Create searchable text from event data */
function createSearchableText(eventData: ReturnType<typeof extractEventData>): string {
  return createTextComponents(eventData).join(' | ');
}

// ===== COMMON UTILITIES FOR TOOLS =====

/** Build filter object for queries */
function buildFilter(
  eventType?: string,
  sessionId?: string,
  hasTool?: boolean,
  isAgentTask?: boolean,
): any {
  const filter: any = {};
  if (eventType) filter.eventType = eventType;
  if (sessionId) filter.sessionId = sessionId;
  if (hasTool !== undefined) filter.hasTool = hasTool;
  if (isAgentTask !== undefined) filter.isAgentTask = isAgentTask;
  return Object.keys(filter).length > 0 ? filter : undefined;
}

/** Build MongoDB filter for recent events queries */
function buildMongoFilter(
  eventType?: string,
  sessionId?: string,
  hasTool?: boolean,
  isAgentTask?: boolean,
): any {
  const filter: any = {};
  if (eventType) filter['metadata.eventType'] = eventType;
  if (sessionId) filter['metadata.sessionId'] = sessionId;
  if (hasTool !== undefined) filter['metadata.hasTool'] = hasTool;
  if (isAgentTask !== undefined) filter['metadata.isAgentTask'] = isAgentTask;
  return filter;
}

/** Enhance event results with consistent formatting */
function enhanceEventResult(event: any, index: number, summaryLength: number = 200) {
  return {
    rank: index + 1,
    id: event.id,
    eventType: event.metadata?.eventType,
    timestamp: event.timestamp,
    sessionId: event.metadata?.sessionId,
    userId: event.metadata?.userId,
    relevanceScore: event.metadata?.relevanceScore || 0,
    summary: truncateText(event.text, summaryLength),
    hasMessage: event.metadata?.hasMessage,
    hasSession: event.metadata?.hasSession,
    hasTool: event.metadata?.hasTool,
    isAgentTask: event.metadata?.isAgentTask,
    messagePreview: truncateText((event.metadata?.messageData as any)?.parts?.[0]?.text, 100),
    sessionTitle: (event.metadata?.sessionData as any)?.title,
    toolName: (event.metadata?.toolData as any)?.name,
    toolError: (event.metadata?.toolData as any)?.error,
  };
}

// ===== SIMPLIFIED EVENT PROCESSING PIPELINE =====

/** Process and store a single event */
async function processEvent(event: any): Promise<void> {
  try {
    const eventData = extractEventData(event);
    const searchableText = createSearchableText(eventData);

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
        hasMessage: !!eventData.messageData,
        hasSession: !!eventData.sessionData,
        hasTool: !!eventData.toolData,
        isAgentTask: eventData.sessionData?.is_agent_task || false,
        rawEvent: truncateText(JSON.stringify(eventData.rawData), 10000),
      },
    });

    // console.log(`📝 Captured event: ${eventData.eventType} (${eventData.sessionId || 'no-session'})`);
  } catch (error) {
    console.error('Error processing event:', error);
  }
}

// Start capturing events with simplified pipeline
(async () => {
  try {
    const events = await client.event.subscribe();
    console.log('📡 Started capturing all opencode events...');

    for await (const event of events.stream) {
      await processEvent(event);
    }
  } catch (subscriptionError) {
    console.error('Error subscribing to events:', subscriptionError);
  }
})();
// DualStore manager for all opencode events
let eventStore: DualStoreManager<'text', 'timestamp'>;

// ===== HELPER FUNCTIONS FOR STATISTICS =====

function getTimeThreshold(timeRange: string): number {
  const now = Date.now();
  const multipliers = { '1h': 1, '6h': 6, '24h': 24, '7d': 168 };
  const hours = multipliers[timeRange as keyof typeof multipliers] || 24;
  return now - hours * 60 * 60 * 1000;
}

function calculateStatistics(events: any[], timeRange: string) {
  const stats = {
    timeRange,
    totalEvents: events.length,
    eventTypes: {} as Record<string, number>,
    sessionsWithActivity: new Set<string>(),
    toolUsageEvents: 0,
    agentTaskEvents: 0,
    messageEvents: 0,
    uniqueUsers: new Set<string>(),
    hourlyDistribution: {} as Record<string, number>,
  };

  events.forEach((event) => {
    const metadata = event.metadata;

    // Count event types
    const eventType = (metadata?.eventType as string) || 'unknown';
    stats.eventTypes[eventType] = (stats.eventTypes[eventType] || 0) + 1;

    // Track sessions and users
    if (metadata?.sessionId) stats.sessionsWithActivity.add(metadata.sessionId as string);
    if (metadata?.userId) stats.uniqueUsers.add(metadata.userId as string);

    // Count specific event categories
    if (metadata?.hasTool) stats.toolUsageEvents++;
    if (metadata?.isAgentTask) stats.agentTaskEvents++;
    if (metadata?.hasMessage) stats.messageEvents++;

    // Hourly distribution
    const hour = new Date(event.timestamp).getHours();
    const hourKey = `${hour}:00`;
    stats.hourlyDistribution[hourKey] = (stats.hourlyDistribution[hourKey] || 0) + 1;
  });

  return {
    ...stats,
    sessionsWithActivity: stats.sessionsWithActivity.size,
    uniqueUsers: stats.uniqueUsers.size,
    topEventTypes: Object.entries(stats.eventTypes)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([type, count]) => ({ type, count })),
  };
}

function extractSessionInsights(events: any[]) {
  return {
    totalEvents: events.length,
    firstEvent: events[0]?.timestamp,
    lastEvent: events[events.length - 1]?.timestamp,
    toolUsageCount: events.filter((e) => e.hasTool).length,
    messageCount: events.filter((e) => e.hasMessage).length,
    uniqueToolsUsed: Array.from(new Set(events.filter((e) => e.toolName).map((e) => e.toolName))),
    eventTypes: Array.from(new Set(events.map((e) => e.eventType))),
  };
}
