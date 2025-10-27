// SPDX-License-Identifier: GPL-3.0-only

import test from 'ava';
import { tool } from '@opencode-ai/plugin/tool';
import { validate } from '../utils/validation.js';

// Mock plugin context with consistent ID patterns
const mockPluginContext: any = {
  client: {
    session: {
      create: async () => ({
        data: {
          id: 'session_abc123def456',
          title: 'Test Session',
          time: { created: '2025-01-01T00:00:00.000Z' },
        },
      }),
      messages: async () => ({
        data: [
          { id: 'msg_msg789', role: 'user', content: 'test message 1' },
          { id: 'msg_msg456', role: 'assistant', content: 'test response 1' },
        ],
      }),
      message: async () => ({
        data: { id: 'msg_msg789', role: 'user', content: 'test message' },
      }),
      prompt: async () => ({
        data: { id: 'msg_msg999', role: 'assistant', content: 'test response' },
      }),
    },
  },
  project: {
    name: 'test-project',
    description: 'Test project',
  },
  directory: '/tmp/test',
  worktree: '/tmp/test',
  $: {
    run: async () => ({ stdout: 'test output' }),
  },
};

// Mock session store with consistent ID patterns
const mockSessions = [
  {
    id: 'session_abc123def456',
    title: 'Test Session 1',
    createdAt: '2025-01-01T00:00:00.000Z',
    activityStatus: 'active',
    isAgentTask: false,
  },
  {
    id: 'session_def789ghi012',
    title: 'Test Session 2',
    createdAt: '2025-01-02T00:00:00.000Z',
    activityStatus: 'idle',
    isAgentTask: true,
  },
];

// Mock messages with consistent ID patterns
const mockMessages = [
  {
    id: 'msg_msg111',
    sessionId: 'session_abc123def456',
    role: 'user',
    content: 'First message',
    timestamp: '2025-01-01T00:01:00.000Z',
  },
  {
    id: 'msg_msg222',
    sessionId: 'session_abc123def456',
    role: 'assistant',
    content: 'First response',
    timestamp: '2025-01-01T00:02:00.000Z',
  },
  {
    id: 'msg_msg333',
    sessionId: 'session_def789ghi012',
    role: 'user',
    content: 'Second session message',
    timestamp: '2025-01-02T00:01:00.000Z',
  },
];

test('session IDs are consistent across tools', async (t) => {
  // Mock list-sessions tool that returns JSON string
  const listSessionsTool = tool({
    description: 'List sessions tool',
    args: {
      limit: tool.schema.number().default(20).describe('Limit'),
      offset: tool.schema.number().default(0).describe('Offset'),
    },
    async execute(args) {
      const limit = validate.limit(args.limit, 20);
      const offset = validate.number(args.offset || 0, 'offset');

      const paginated = mockSessions.slice(offset, offset + limit);
      return JSON.stringify({
        sessions: paginated,
        totalCount: mockSessions.length,
        pagination: {
          limit,
          offset,
          hasMore: offset + limit < mockSessions.length,
          currentPage: Math.floor(offset / limit) + 1,
          totalPages: Math.ceil(mockSessions.length / limit),
        },
      });
    },
  });

  // Mock get-session tool that returns JSON string
  const getSessionTool = tool({
    description: 'Get session tool',
    args: {
      sessionId: tool.schema.string().describe('Session ID'),
    },
    async execute(args) {
      const sessionId = validate.sessionId(args.sessionId);
      const session = mockSessions.find((s) => s.id === sessionId);
      const messages = mockMessages.filter((m) => m.sessionId === sessionId);
      return JSON.stringify({ session, messages });
    },
  });

  // Get sessions from list
  const listResult = await listSessionsTool.execute({ limit: 10, offset: 0 }, mockPluginContext);
  const listData = JSON.parse(listResult);

  t.true(Array.isArray(listData.sessions));
  t.true(listData.sessions.length > 0);

  // Test each session ID from list works with get-session
  for (const session of listData.sessions) {
    t.truthy(session.id, 'Session should have an ID');
    t.is(typeof session.id, 'string', 'Session ID should be a string');

    // Use the session ID from list-sessions in get-session
    const getResult = await getSessionTool.execute({ sessionId: session.id }, mockPluginContext);
    const getData = JSON.parse(getResult);
    t.truthy(getData.session, 'get-session should find session using ID from list-sessions');
    t.is(getData.session.id, session.id, 'get-session should return same session ID');
  }
});

test('message IDs are consistent across tools', async (t) => {
  const testSessionId = 'session_abc123def456';

  // Mock list-messages tool that returns JSON string
  const listMessagesTool = tool({
    description: 'List messages tool',
    args: {
      sessionId: tool.schema.string().describe('Session ID'),
      limit: tool.schema.number().default(10).describe('Limit'),
    },
    async execute(args) {
      const sessionId = validate.sessionId(args.sessionId);
      const limit = validate.limit(args.limit, 10);
      const messages = mockMessages.filter((m) => m.sessionId === sessionId);
      return JSON.stringify(messages.slice(-limit));
    },
  });

  // Mock get-message tool that returns JSON string
  const getMessageTool = tool({
    description: 'Get message tool',
    args: {
      sessionId: tool.schema.string().describe('Session ID'),
      messageId: tool.schema.string().describe('Message ID'),
    },
    async execute(args) {
      const sessionId = validate.sessionId(args.sessionId);
      const messageId = validate.string(args.messageId, 'messageId');
      const message = mockMessages.find((m) => m.sessionId === sessionId && m.id === messageId);
      return JSON.stringify({ message });
    },
  });

  // Get messages from list-messages
  const listResult = await listMessagesTool.execute(
    { sessionId: testSessionId, limit: 10 },
    mockPluginContext,
  );
  const listData = JSON.parse(listResult);

  t.true(Array.isArray(listData));
  t.true(listData.length > 0);

  // Test each message ID from list-messages works with get-message
  for (const message of listData) {
    t.truthy(message.id, 'Message should have an ID');
    t.is(typeof message.id, 'string', 'Message ID should be a string');

    // Use the message ID from list-messages in get-message
    const getResult = await getMessageTool.execute(
      {
        sessionId: testSessionId,
        messageId: message.id,
      },
      mockPluginContext,
    );
    const getData = JSON.parse(getResult);
    t.truthy(getData.message, 'get-message should find message using ID from list-messages');
    t.is(getData.message.id, message.id, 'get-message should return same message ID');
  }
});

test('session IDs from spawn-session work with other tools', async (t) => {
  // Mock spawn-session tool that returns JSON string
  const spawnSessionTool = tool({
    description: 'Spawn session tool',
    args: {
      title: tool.schema.string().optional().describe('Session title'),
      message: tool.schema.string().describe('Initial message'),
    },
    async execute(args) {
      const title = args.title || 'Spawn Session';
      const newSessionId = `session_${Date.now().toString(36)}`;

      const newSession = {
        id: newSessionId,
        title,
        createdAt: new Date().toISOString(),
        activityStatus: 'active',
        isAgentTask: false,
      };

      // Add to mock sessions
      mockSessions.push(newSession);

      return JSON.stringify({ success: true, session: newSession });
    },
  });

  // Mock get-session tool that returns JSON string
  const getSessionTool = tool({
    description: 'Get session tool',
    args: {
      sessionId: tool.schema.string().describe('Session ID'),
    },
    async execute(args) {
      const sessionId = validate.sessionId(args.sessionId);
      const session = mockSessions.find((s) => s.id === sessionId);
      return JSON.stringify({ session, messages: [] });
    },
  });

  // Spawn a new session
  const spawnResult = await spawnSessionTool.execute(
    {
      title: 'New Test Session',
      message: 'Initial message',
    },
    mockPluginContext,
  );

  const spawnData = JSON.parse(spawnResult);
  t.true(spawnData.success, 'spawn-session should succeed');
  t.truthy(spawnData.session, 'spawn-session should return session');
  t.truthy(spawnData.session.id, 'spawned session should have an ID');

  // Use the spawned session ID with get-session
  const getResult = await getSessionTool.execute(
    {
      sessionId: spawnData.session.id,
    },
    mockPluginContext,
  );

  const getData = JSON.parse(getResult);
  t.truthy(getData.session, 'get-session should find spawned session');
  t.is(
    getData.session.id,
    spawnData.session.id,
    'get-session should return same spawned session ID',
  );
});

test('cross-tool ID consistency: session -> messages -> events', async (t) => {
  const testSessionId = 'session_abc123def456';

  // Mock events
  const mockEvents = [
    {
      id: 'evt_event001',
      sessionId: 'session_abc123def456',
      eventType: 'message_sent',
      timestamp: '2025-01-01T00:01:00.000Z',
      text: 'User sent message',
    },
    {
      id: 'evt_event002',
      sessionId: 'session_abc123def456',
      eventType: 'message_received',
      timestamp: '2025-01-01T00:02:00.000Z',
      text: 'Assistant responded',
    },
  ];

  // Mock search-context tool that returns JSON string
  const searchContextTool = tool({
    description: 'Search context tool',
    args: {
      query: tool.schema.string().describe('Search query'),
      sessionId: tool.schema.string().optional().describe('Session ID filter'),
    },
    async execute(args) {
      const query = validate.string(args.query, 'query');
      const sessionId = validate.optionalString(args.sessionId, 'sessionId');

      let sessions = mockSessions;
      let messages = mockMessages;
      let events = mockEvents;

      // Filter by session ID if provided
      if (sessionId) {
        sessions = sessions.filter((s) => s.id === sessionId);
        messages = messages.filter((m) => m.sessionId === sessionId);
        events = events.filter((e) => e.sessionId === sessionId);
      }

      return JSON.stringify({
        sessions: sessions.map((s) => ({ id: s.id, title: s.title })),
        messages: messages.map((m) => ({
          id: m.id,
          sessionId: m.sessionId,
          content: m.content,
        })),
        events: events.map((e) => ({
          id: e.id,
          sessionId: e.sessionId,
          type: e.eventType,
        })),
        query,
        summary: {
          totalSessions: sessions.length,
          totalMessages: messages.length,
          totalEvents: events.length,
        },
      });
    },
  });

  // Search for specific session
  const searchResult = await searchContextTool.execute(
    {
      query: 'test',
      sessionId: testSessionId,
    },
    mockPluginContext,
  );

  const searchData = JSON.parse(searchResult);

  // Verify session ID consistency
  t.true(searchData.sessions.length > 0, 'Should find sessions');
  searchData.sessions.forEach((session: any) => {
    t.is(session.id, testSessionId, 'All sessions should have matching session ID');
  });

  // Verify message ID consistency and session relationship
  t.true(searchData.messages.length > 0, 'Should find messages');
  searchData.messages.forEach((message: any) => {
    t.is(message.sessionId, testSessionId, 'All messages should belong to correct session');
    t.truthy(message.id, 'All messages should have IDs');
    t.true(message.id.startsWith('msg_'), 'Message IDs should follow consistent pattern');
  });

  // Verify event ID consistency and session relationship
  t.true(searchData.events.length > 0, 'Should find events');
  searchData.events.forEach((event: any) => {
    t.is(event.sessionId, testSessionId, 'All events should belong to correct session');
    t.truthy(event.id, 'All events should have IDs');
    t.true(event.id.startsWith('evt_'), 'Event IDs should follow consistent pattern');
  });
});

test('ID validation works consistently across all tools', async (t) => {
  // Test that all tools validate session IDs same way
  const testTools = [
    tool({
      description: 'Tool 1',
      args: { sessionId: tool.schema.string().describe('Session ID') },
      async execute(args) {
        return JSON.stringify({ sessionId: validate.sessionId(args.sessionId) });
      },
    }),
    tool({
      description: 'Tool 2',
      args: { sessionId: tool.schema.string().describe('Session ID') },
      async execute(args) {
        return JSON.stringify({ sessionId: validate.sessionId(args.sessionId) });
      },
    }),
    tool({
      description: 'Tool 3',
      args: { sessionId: tool.schema.string().describe('Session ID') },
      async execute(args) {
        return JSON.stringify({ sessionId: validate.sessionId(args.sessionId) });
      },
    }),
  ];

  // Test valid session ID
  const validSessionId = 'session_valid123';
  for (const testTool of testTools) {
    const result = await testTool.execute({ sessionId: validSessionId }, mockPluginContext);
    const data = JSON.parse(result);
    t.is(data.sessionId, validSessionId, 'All tools should accept valid session ID');
  }

  // Test invalid session IDs
  const invalidSessionIds = ['', null, undefined, 123];
  for (const invalidId of invalidSessionIds) {
    for (const testTool of testTools) {
      await t.throwsAsync(
        testTool.execute({ sessionId: invalidId as any }, mockPluginContext),
        { message: /sessionId/ },
        'All tools should reject invalid session IDs consistently',
      );
    }
  }
});

test('ID format consistency follows documented patterns', (t) => {
  // Verify that IDs follow expected patterns
  const sessionIds = mockSessions.map((s) => s.id);
  const messageIds = mockMessages.map((m) => m.id);

  // Session ID patterns
  sessionIds.forEach((sessionId) => {
    t.true(typeof sessionId === 'string', 'Session IDs should be strings');
    t.true(sessionId.length > 0, 'Session IDs should not be empty');
    t.true(sessionId.startsWith('session_'), 'Session IDs should start with "session_"');
  });

  // Message ID patterns
  messageIds.forEach((messageId) => {
    t.true(typeof messageId === 'string', 'Message IDs should be strings');
    t.true(messageId.length > 0, 'Message IDs should not be empty');
    t.true(messageId.startsWith('msg_'), 'Message IDs should start with "msg_"');
  });

  // Verify no ID collisions between types
  const allIds = [...sessionIds, ...messageIds];
  const uniqueIds = new Set(allIds);
  t.is(uniqueIds.size, allIds.length, 'All IDs should be unique across different entity types');
});

test('ID persistence: same IDs returned across multiple calls', async (t) => {
  // Mock a tool that returns consistent data
  let callCount = 0;
  const consistentTool = tool({
    description: 'Consistent data tool',
    args: {
      sessionId: tool.schema.string().describe('Session ID'),
    },
    async execute(args) {
      const sessionId = validate.sessionId(args.sessionId);
      callCount++;

      // Always return the same session data for the same ID
      const session = mockSessions.find((s) => s.id === sessionId);
      return JSON.stringify({
        session,
        callCount,
        timestamp: Date.now(), // This changes, but IDs don't
      });
    },
  });

  const testSessionId = 'session_abc123def456';

  // Call multiple times
  const result1 = await consistentTool.execute({ sessionId: testSessionId }, mockPluginContext);
  const result2 = await consistentTool.execute({ sessionId: testSessionId }, mockPluginContext);
  const result3 = await consistentTool.execute({ sessionId: testSessionId }, mockPluginContext);

  const data1 = JSON.parse(result1);
  const data2 = JSON.parse(result2);
  const data3 = JSON.parse(result3);

  // IDs should be consistent across calls
  t.is(data1.session.id, testSessionId, 'First call should return correct session ID');
  t.is(data2.session.id, testSessionId, 'Second call should return same session ID');
  t.is(data3.session.id, testSessionId, 'Third call should return same session ID');

  // Verify it's the same session object
  t.is(data1.session.title, data2.session.title, 'Session titles should match');
  t.is(data2.session.title, data3.session.title, 'Session titles should match');

  // Call count should increase but IDs stay same
  t.is(data1.callCount, 1, 'First call count');
  t.is(data2.callCount, 2, 'Second call count');
  t.is(data3.callCount, 3, 'Third call count');
});
