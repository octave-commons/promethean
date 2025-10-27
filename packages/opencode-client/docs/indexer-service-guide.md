# Indexer Service Guide

## Overview

The Indexer Service provides powerful search and context compilation capabilities for OpenCode sessions, events, and messages. It enables efficient content discovery, context-aware searches, and comprehensive data analysis across the entire OpenCode ecosystem.

## Architecture

### Indexer Components

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Search Query   │───▶│  Indexer Service │───▶│  Search Results │
│                 │    │                  │    │                 │
│ • Context       │    │ • Query Parser   │    │ • Ranked Matches │
│ • Sessions      │    │ • Content Index  │    │ • Context Data  │
│ • Events        │    │ • Ranking Engine │    │ • Metadata      │
│ • Messages      │    │ • Cache Layer    │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌──────────────────┐            │
         └──────────────▶│  Storage Backend │◀───────────┘
                        │                  │
                        │ • Session Store  │
                        │ • Event Store    │
                        │ • Message Store  │
                        └──────────────────┘
```

### Core Features

1. **Full-Text Search**: Advanced search across all content types
2. **Context Compilation**: Gather comprehensive context for queries
3. **Semantic Ranking**: Intelligent result ranking based on relevance
4. **Real-time Indexing**: Automatic updates as content changes
5. **Filtering Support**: Advanced filtering by date, type, session, etc.

## Getting Started

### Basic Search Operations

```typescript
import { searchContext, compileContext, listEvents } from '@promethean-os/opencode-client';

// Simple search
const searchResults = await searchContext.execute({
  query: 'TypeScript compilation errors',
  limit: 20,
});

const results = JSON.parse(searchResults);
console.log(`Found ${results.matches.length} matching items`);
```

### Context Compilation

```typescript
// Compile comprehensive context
const context = await compileContext.execute({
  query: 'authentication security',
  includeSessions: true,
  includeEvents: true,
  includeMessages: true,
  limit: 1000,
});

const contextData = JSON.parse(context);
console.log('Context summary:', contextData.summary);
```

## Search Operations

### 1. Basic Search

```typescript
// Search across all content types
const basicSearch = await searchContext.execute({
  query: 'database optimization',
  limit: 50,
});

// Search within specific session
const sessionSearch = await searchContext.execute({
  query: 'API endpoints',
  sessionId: 'session-uuid',
  limit: 25,
});
```

### 2. Advanced Search with Filters

```typescript
// Search with date range
const dateFilteredSearch = await searchContext.execute({
  query: 'performance issues',
  startDate: '2024-01-01',
  endDate: '2024-12-31',
  limit: 100,
});

// Search by content type
const typeFilteredSearch = await searchContext.execute({
  query: 'error handling',
  includeSessions: true,
  includeEvents: false,
  includeMessages: true,
  limit: 75,
});
```

### 3. Semantic Search

```typescript
// Search for related concepts
const semanticSearch = await searchContext.execute({
  query: 'user authentication',
  semantic: true,
  similarity: 0.7, // Minimum similarity threshold
  limit: 30,
});
```

## Context Compilation

### 1. Comprehensive Context

```typescript
// Gather all relevant context
const fullContext = await compileContext.execute({
  query: 'security vulnerability assessment',
  includeSessions: true,
  includeEvents: true,
  includeMessages: true,
  limit: 2000,
});

const context = JSON.parse(fullContext);
console.log('Context sections:', {
  sessions: context.sessions?.length || 0,
  events: context.events?.length || 0,
  messages: context.messages?.length || 0,
});
```

### 2. Focused Context

```typescript
// Context for specific analysis
const focusedContext = await compileContext.execute({
  query: 'TypeScript type definitions',
  includeSessions: true,
  includeEvents: false, // Skip events for focus
  includeMessages: true,
  sessionId: 'development-session',
  limit: 500,
});
```

### 3. Context Analysis

```typescript
// Analyze compiled context
function analyzeContext(contextData: any) {
  const analysis = {
    totalItems: 0,
    typeDistribution: {},
    timeRange: { earliest: null, latest: null },
    keyThemes: [],
  };

  // Analyze sessions
  if (contextData.sessions) {
    analysis.totalItems += contextData.sessions.length;
    analysis.typeDistribution.sessions = contextData.sessions.length;
  }

  // Analyze events
  if (contextData.events) {
    analysis.totalItems += contextData.events.length;
    analysis.typeDistribution.events = contextData.events.length;
  }

  // Analyze messages
  if (contextData.messages) {
    analysis.totalItems += contextData.messages.length;
    analysis.typeDistribution.messages = contextData.messages.length;
  }

  return analysis;
}
```

## Advanced Usage Patterns

### 1. Research and Analysis

```typescript
async function researchTopic(topic: string, maxResults: number = 100) {
  // Compile comprehensive context
  const context = await compileContext.execute({
    query: topic,
    includeSessions: true,
    includeEvents: true,
    includeMessages: true,
    limit: maxResults,
  });

  const contextData = JSON.parse(context);

  // Extract key insights
  const insights = {
    summary: contextData.summary,
    sessionCount: contextData.sessions?.length || 0,
    messageCount: contextData.messages?.length || 0,
    eventCount: contextData.events?.length || 0,
    timeSpan: getTimeSpan(contextData),
    keyParticipants: getParticipants(contextData),
  };

  return insights;
}

function getTimeSpan(contextData: any): { start: Date; end: Date } {
  const allTimestamps = [
    ...(contextData.sessions?.map((s: any) => new Date(s.createdAt)) || []),
    ...(contextData.events?.map((e: any) => new Date(e.timestamp)) || []),
    ...(contextData.messages?.map((m: any) => new Date(m.timestamp)) || []),
  ];

  const timestamps = allTimestamps.filter(Boolean).sort();

  return {
    start: timestamps[0] || new Date(),
    end: timestamps[timestamps.length - 1] || new Date(),
  };
}
```

### 2. Trend Analysis

```typescript
async function analyzeTrends(query: string, timeWindow: number = 7) {
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - timeWindow * 24 * 60 * 60 * 1000);

  const context = await compileContext.execute({
    query,
    includeEvents: true,
    includeMessages: true,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    limit: 1000,
  });

  const contextData = JSON.parse(context);

  // Analyze frequency over time
  const dailyFrequency = organizeByDay(contextData);

  return {
    totalMentions: Object.values(dailyFrequency).reduce(
      (sum: number, count: number) => sum + count,
      0,
    ),
    dailyBreakdown: dailyFrequency,
    trend: calculateTrend(dailyFrequency),
  };
}

function organizeByDay(contextData: any): Record<string, number> {
  const daily: Record<string, number> = {};

  // Process events
  contextData.events?.forEach((event: any) => {
    const day = new Date(event.timestamp).toISOString().split('T')[0];
    daily[day] = (daily[day] || 0) + 1;
  });

  // Process messages
  contextData.messages?.forEach((message: any) => {
    const day = new Date(message.timestamp).toISOString().split('T')[0];
    daily[day] = (daily[day] || 0) + 1;
  });

  return daily;
}
```

### 3. Content Discovery

```typescript
async function discoverRelatedContent(sessionId: string, limit: number = 20) {
  // Get session messages for analysis
  const messages = await listMessages.execute({
    sessionId,
    limit: 100,
  });

  const messageData = JSON.parse(messages);

  // Extract key topics from messages
  const topics = extractTopics(messageData.messages);

  // Search for related content across all sessions
  const relatedContent = await Promise.all(
    topics.map(async (topic: string) => {
      const search = await searchContext.execute({
        query: topic,
        limit: Math.floor(limit / topics.length),
        excludeSessionId: sessionId, // Don't include current session
      });

      return {
        topic,
        results: JSON.parse(search).matches,
      };
    }),
  );

  return relatedContent;
}

function extractTopics(messages: any[]): string[] {
  // Simple topic extraction based on frequent terms
  const allText = messages.map((m) => m.content).join(' ');
  const words = allText.toLowerCase().match(/\b\w{4,}\b/g) || [];

  // Count word frequency
  const frequency: Record<string, number> = {};
  words.forEach((word) => {
    frequency[word] = (frequency[word] || 0) + 1;
  });

  // Return top 5 most frequent words
  return Object.entries(frequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([word]) => word);
}
```

## Performance Optimization

### 1. Efficient Querying

```typescript
// Use specific queries for better performance
const optimizedSearch = await searchContext.execute({
  query: 'TypeScript interface validation', // Specific query
  sessionId: 'specific-session', // Limit scope
  limit: 50, // Reasonable limit
  includeSessions: false, // Exclude unnecessary types
  includeEvents: false,
  includeMessages: true,
});
```

### 2. Caching Results

```typescript
// Implement caching for frequently accessed data
const searchCache = new Map<string, any>();

async function cachedSearch(query: string, options: any = {}) {
  const cacheKey = JSON.stringify({ query, ...options });

  if (searchCache.has(cacheKey)) {
    return searchCache.get(cacheKey);
  }

  const result = await searchContext.execute({ query, ...options });
  const parsed = JSON.parse(result);

  // Cache for 5 minutes
  searchCache.set(cacheKey, parsed);
  setTimeout(() => searchCache.delete(cacheKey), 5 * 60 * 1000);

  return parsed;
}
```

### 3. Batch Operations

```typescript
// Process multiple searches efficiently
async function batchSearch(queries: string[]) {
  const results = await Promise.allSettled(
    queries.map((query) =>
      searchContext.execute({
        query,
        limit: 25,
        includeMessages: true,
        includeSessions: false,
        includeEvents: false,
      }),
    ),
  );

  return results.map((result, index) => ({
    query: queries[index],
    success: result.status === 'fulfilled',
    data: result.status === 'fulfilled' ? JSON.parse(result.value) : null,
    error: result.status === 'rejected' ? result.reason : null,
  }));
}
```

## Error Handling

### Common Error Scenarios

```typescript
async function robustSearch(query: string, maxRetries: number = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await searchContext.execute({
        query,
        limit: 50,
      });

      return JSON.parse(result);
    } catch (error) {
      if (attempt === maxRetries) {
        throw new Error(`Search failed after ${maxRetries} attempts: ${error.message}`);
      }

      // Exponential backoff
      await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
}
```

### Search Validation

```typescript
function validateSearchQuery(query: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!query || query.trim().length === 0) {
    errors.push('Query cannot be empty');
  }

  if (query.length > 1000) {
    errors.push('Query too long (max 1000 characters)');
  }

  if (query.includes('SELECT') || query.includes('DROP')) {
    errors.push('Query contains potentially unsafe SQL keywords');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
```

## Best Practices

### 1. Query Construction

```typescript
// ✅ Good: Specific, focused queries
const goodQuery = 'TypeScript interface validation errors';

// ❌ Poor: Vague, overly broad queries
const poorQuery = 'code';
```

### 2. Result Limiting

```typescript
// ✅ Good: Reasonable limits for performance
const reasonableLimit = await searchContext.execute({
  query: 'authentication',
  limit: 50,
});

// ❌ Poor: Excessive limits
const excessiveLimit = await searchContext.execute({
  query: 'authentication',
  limit: 10000,
});
```

### 3. Context Scope

```typescript
// ✅ Good: Focused context compilation
const focusedContext = await compileContext.execute({
  query: 'database optimization',
  sessionId: 'specific-session',
  includeMessages: true,
  includeSessions: false,
  includeEvents: false,
  limit: 200,
});
```

## Integration Examples

### With Session Management

```typescript
async function enhanceSessionWithSearch(sessionId: string) {
  // Get session details
  const session = await getSession.execute({ sessionId });
  const sessionData = JSON.parse(session);

  // Search for related content
  const relatedContent = await searchContext.execute({
    query: sessionData.title,
    excludeSessionId: sessionId,
    limit: 10,
  });

  const related = JSON.parse(relatedContent);

  return {
    session: sessionData,
    relatedContent: related.matches,
    enhancedContext: {
      totalRelatedItems: related.matches.length,
      topics: related.matches.map((m) => m.content).slice(0, 3),
    },
  };
}
```

### With Event Processing

```typescript
async function analyzeEventPatterns(eventType: string, timeWindow: number = 24) {
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - timeWindow * 60 * 60 * 1000);

  // Compile context for specific event type
  const context = await compileContext.execute({
    query: eventType,
    includeEvents: true,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    limit: 500,
  });

  const contextData = JSON.parse(context);

  // Analyze patterns
  const patterns = {
    frequency: contextData.events?.length || 0,
    timeDistribution: analyzeTimeDistribution(contextData.events),
    commonSessions: findCommonSessions(contextData.events),
  };

  return patterns;
}
```

## Troubleshooting

### Common Issues

1. **Slow Search Performance**: Use more specific queries and reasonable limits
2. **No Results Found**: Check query spelling and try broader terms
3. **Memory Usage**: Implement result caching and cleanup
4. **Connection Issues**: Verify OpenCode server connectivity

### Debug Information

```typescript
// Enable debug logging
process.env.DEBUG = 'indexer-service';

// Get search statistics
const debugInfo = await searchContext.execute({
  query: 'debug test',
  limit: 1,
  debug: true,
});

console.log('Search debug info:', JSON.parse(debugInfo, null, 2));
```

## API Reference

### searchContext Parameters

| Parameter       | Type    | Required | Description                                |
| --------------- | ------- | -------- | ------------------------------------------ |
| query           | string  | Yes      | Search query string                        |
| sessionId       | string  | No       | Limit search to specific session           |
| limit           | number  | No       | Maximum results (default: 50)              |
| includeSessions | boolean | No       | Include sessions in search (default: true) |
| includeEvents   | boolean | No       | Include events in search (default: true)   |
| includeMessages | boolean | No       | Include messages in search (default: true) |
| startDate       | string  | No       | ISO date string for start range            |
| endDate         | string  | No       | ISO date string for end range              |
| semantic        | boolean | No       | Enable semantic search (default: false)    |
| similarity      | number  | No       | Minimum similarity threshold (0-1)         |

### compileContext Parameters

| Parameter       | Type    | Required | Description                              |
| --------------- | ------- | -------- | ---------------------------------------- |
| query           | string  | Yes      | Context compilation query                |
| includeSessions | boolean | No       | Include sessions (default: true)         |
| includeEvents   | boolean | No       | Include events (default: true)           |
| includeMessages | boolean | No       | Include messages (default: true)         |
| sessionId       | string  | No       | Limit to specific session                |
| limit           | number  | No       | Maximum items to compile (default: 1000) |
| startDate       | string  | No       | ISO date start range                     |
| endDate         | string  | No       | ISO date end range                       |

This guide provides comprehensive coverage of the Indexer Service capabilities. For additional information, see the [API Reference](./api-reference.md) and [Development Guide](./development-guide.md).
