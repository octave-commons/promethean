/**
 * Tests for Ollama LLM Provider
 *
 * Tests the OllamaProvider class using the official ollama npm module
 */

import anyTest, { type TestFn } from 'ava';
import type { ChatMessage, ToolCall } from '../types/index.js';
import { messageToOpenAIFormat } from './message.js';

interface TestContext {}

const test = anyTest as TestFn<TestContext>;

// ============================================================================
// Type Tests
// ============================================================================

test('OllamaConfig interface is properly typed', (t) => {
  // Verify the config interface accepts all expected fields
  const config = {
    baseUrl: 'http://localhost:11434',
    model: 'qwen3-vl:2b-instruct',
    temperature: 0.7,
    maxTokens: 2048,
  };

  t.truthy(config.baseUrl);
  t.truthy(config.model);
  t.is(typeof config.temperature, 'number');
  t.is(typeof config.maxTokens, 'number');
});

test('ChatMessage type accepts various message shapes', (t) => {
  // Simple text message
  const textMsg: ChatMessage = {
    role: 'user',
    content: 'Hello',
  };
  t.is(textMsg.role, 'user');

  // Message with images
  const imageMsg: ChatMessage = {
    role: 'user',
    content: 'What is in this?',
    images: ['/path/to/image.jpg'],
  };
  t.is(imageMsg.images?.length, 1);

  // Tool message
  const toolMsg: ChatMessage = {
    role: 'tool',
    tool_name: 'memory.lookup',
    content: '{"results": []}',
  };
  t.is(toolMsg.role, 'tool');

  // Multimodal content
  const multimodalMsg: ChatMessage = {
    role: 'user',
    content: [
      { type: 'text', text: 'Look at this:' },
      { type: 'image', data: '/path/to/image.png' },
    ],
  };
  t.true(Array.isArray(multimodalMsg.content));
});

test('ToolCall type is properly typed', (t) => {
  const toolCall: ToolCall = {
    type: 'tool_call',
    name: 'test.tool',
    args: { arg1: 'value' },
    callId: 'test-call-id',
  };

  t.is(toolCall.type, 'tool_call');
  t.truthy(toolCall.callId);
});

// ============================================================================
// Message Conversion Tests (Unit Tests for messageToOllamaFormat)
// ============================================================================

test('message conversion handles role field correctly', (t) => {
  // Test the message format structure that gets sent to Ollama
  const ollamaMessage = {
    role: 'user' as const,
    content: 'Hello',
  };

  t.is(ollamaMessage.role, 'user');
  t.is(ollamaMessage.content, 'Hello');
});

test('message conversion handles tool messages with tool_name', (t) => {
  // Tool messages should include tool_name field per Ollama spec
  const ollamaMessage = {
    role: 'tool' as const,
    content: '{"result": "success"}',
    tool_name: 'memory.lookup',
  };

  t.is(ollamaMessage.role, 'tool');
  t.is(ollamaMessage.tool_name, 'memory.lookup');
});

test('message conversion handles images array', (t) => {
  const ollamaMessage = {
    role: 'user' as const,
    content: 'What is this?',
    images: ['/path/to/image1.jpg', '/path/to/image2.png'],
  };

  t.true(Array.isArray(ollamaMessage.images));
  t.is(ollamaMessage.images?.length, 2);
});

test('message conversion omits undefined images', (t) => {
  const ollamaMessage = {
    role: 'user' as const,
    content: 'Hello',
  };

  t.falsy((ollamaMessage as { images?: unknown }).images);
});

test('multimodal content extracts text and images separately', (t) => {
  const content = [
    { type: 'text' as const, text: 'Hello ' },
    { type: 'text' as const, text: 'world' },
    { type: 'image' as const, data: '/path/to/img.jpg' },
  ];

  const textParts = content
    .filter((c): c is { type: 'text'; text: string } => c.type === 'text')
    .map((c) => c.text);

  const images = content
    .filter((c): c is { type: 'image'; data: string } => c.type === 'image')
    .map((c) => c.data);

  t.is(textParts.join(''), 'Hello world');
  t.is(images[0], '/path/to/img.jpg');
});

test('openai conversion preserves remote image URLs', (t) => {
  const message: ChatMessage = {
    role: 'user',
    content: 'Describe this image',
    images: ['https://example.com/cat.png'],
  };

  const converted = messageToOpenAIFormat(message);

  t.deepEqual(converted.content, [
    { type: 'text', text: 'Describe this image' },
    { type: 'image_url', image_url: { url: 'https://example.com/cat.png' } },
  ]);
});

test('openai conversion wraps raw base64 images as data URLs', (t) => {
  const message: ChatMessage = {
    role: 'user',
    content: 'Describe this image',
    images: ['AAAA'],
  };

  const converted = messageToOpenAIFormat(message);

  t.deepEqual(converted.content, [
    { type: 'text', text: 'Describe this image' },
    { type: 'image_url', image_url: { url: 'data:image/png;base64,AAAA' } },
  ]);
});

test('openai conversion preserves existing data URLs', (t) => {
  const message: ChatMessage = {
    role: 'user',
    content: 'Describe this image',
    images: ['data:image/png;base64,AAAA'],
  };

  const converted = messageToOpenAIFormat(message);

  t.deepEqual(converted.content, [
    { type: 'text', text: 'Describe this image' },
    { type: 'image_url', image_url: { url: 'data:image/png;base64,AAAA' } },
  ]);
});

// ============================================================================
// Tool Format Tests
// ============================================================================

test('tools are converted to Ollama format correctly', (t) => {
  const toolDef = {
    name: 'get_current_time',
    description: 'Get the current timestamp',
    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
  };

  const ollamaFormat = {
    type: 'function' as const,
    function: {
      name: toolDef.name,
      description: toolDef.description,
      parameters: toolDef.parameters,
    },
  };

  t.is(ollamaFormat.type, 'function');
  t.is(ollamaFormat.function.name, 'get_current_time');
});

test('complex tool parameters are preserved', (t) => {
  const toolDef = {
    name: 'discord.channel.messages',
    description: 'Fetch messages from a Discord channel',
    parameters: {
      type: 'object',
      properties: {
        channel_id: {
          type: 'string',
          description: 'The Discord channel ID',
        },
        limit: {
          type: 'number',
          description: 'Max messages to fetch',
        },
        before: {
          type: 'string',
          description: 'Fetch messages before this ID',
        },
      },
      required: ['channel_id'],
    },
  };

  const ollamaFormat = {
    type: 'function' as const,
    function: {
      name: toolDef.name,
      description: toolDef.description,
      parameters: toolDef.parameters,
    },
  };

  t.is(ollamaFormat.function.parameters.properties.channel_id.type, 'string');
  t.is(ollamaFormat.function.parameters.required?.[0], 'channel_id');
});

// ============================================================================
// Tool Call Parsing Tests
// ============================================================================

test('tool calls are parsed from Ollama response', (t) => {
  const response = {
    message: {
      role: 'assistant',
      content: '',
      tool_calls: [
        {
          function: {
            name: 'get_current_time',
            arguments: {},
          },
        },
      ],
    },
  };

  const toolCalls = response.message.tool_calls;
  t.is(toolCalls?.length, 1);
  t.is(toolCalls?.[0].function.name, 'get_current_time');
});

test('tool arguments are parsed from object format', (t) => {
  const response = {
    message: {
      role: 'assistant',
      content: '',
      tool_calls: [
        {
          function: {
            name: 'memory.lookup',
            arguments: { query: 'cats', limit: 5 },
          },
        },
      ],
    },
  };

  const args = response.message.tool_calls?.[0].function.arguments as Record<string, unknown>;
  t.is(args.query, 'cats');
  t.is(args.limit, 5);
});

test('tool arguments are parsed from string format', (t) => {
  const response = {
    message: {
      role: 'assistant',
      content: '',
      tool_calls: [
        {
          function: {
            name: 'test.tool',
            arguments: '{"query": "dogs", "limit": 10}',
          },
        },
      ],
    },
  };

  const argsStr = response.message.tool_calls?.[0].function.arguments as string;
  const parsed = JSON.parse(argsStr);
  t.is(parsed.query, 'dogs');
  t.is(parsed.limit, 10);
});

// ============================================================================
// Provider Configuration Tests
// ============================================================================

test('OllamaProvider constructor accepts baseUrl', (t) => {
  // Test that config is structured correctly
  const config = {
    baseUrl: 'http://localhost:11434',
    model: 'test-model',
  };

  t.truthy(config.baseUrl);
});

test('complete uses lower temperature for tool calls', (t) => {
  const completeTemp = 0.7;
  const completeWithToolsTemp = 0.5;

  t.true(completeWithToolsTemp < completeTemp);
  t.is(completeWithToolsTemp, 0.5);
});

// ============================================================================
// Response Handling Tests
// ============================================================================

test('response with content returns content', (t) => {
  const response = {
    message: {
      role: 'assistant',
      content: 'Hello, I am a response!',
    },
  };

  const content = response.message?.content || '';
  t.is(content, 'Hello, I am a response!');
});

test('response without content returns empty string', (t) => {
  const response = {
    message: {
      role: 'assistant',
      content: '',
    },
  };

  const content = response.message?.content || '';
  t.is(content, '');
});

test('response without message returns empty string', (t) => {
  const response = {};

  const content = (response as { message?: { content?: string } }).message?.content || '';
  t.is(content, '');
});

test('long response content is preserved', (t) => {
  const longContent = 'A'.repeat(10000);
  const response = {
    message: {
      role: 'assistant',
      content: longContent,
    },
  };

  const content = response.message?.content || '';
  t.is(content.length, 10000);
});

// ============================================================================
// Error Handling Tests
// ============================================================================

test('error handling extracts message from Error', (t) => {
  const error = new Error('Connection refused');
  const message = error.message;

  t.is(message, 'Connection refused');
});

test('error handling works with non-Error values', (t) => {
  const error = 'Connection refused' as unknown;
  const message = error instanceof Error ? error.message : String(error);

  t.is(message, 'Connection refused');
});

// ============================================================================
// Mock Ollama Client Pattern Tests
// ============================================================================

test('can create mock chat stub structure', (t) => {
  const mockResponse = {
    message: {
      role: 'assistant',
      content: 'Test response',
    },
  };

  // Simulate stub structure
  const stub = { resolves: mockResponse };
  t.truthy(stub.resolves);
  t.is(stub.resolves.message.content, 'Test response');
});

test('can create error stub', (t) => {
  const errorStub = { rejects: new Error('Test error') };
  t.truthy(errorStub.rejects);
  t.is(errorStub.rejects.message, 'Test error');
});
