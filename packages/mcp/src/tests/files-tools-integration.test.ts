/* eslint-disable functional/no-let, functional/immutable-data, @typescript-eslint/require-await, @typescript-eslint/no-unused-vars */
import { createServer } from 'node:net';
import type { AddressInfo } from 'node:net';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import test from 'ava';

import { fastifyTransport } from '../core/transports/fastify.js';
import { createMcpServer } from '../core/mcp-server.js';
import {
  filesListDirectory,
  filesTreeDirectory,
  filesViewFile,
  filesWriteFileContent,
  filesWriteFileLines,
} from '../tools/files.js';
import { filesSearch } from '../tools/search.js';

const allocatePort = async (): Promise<number> =>
  new Promise((resolve, reject) => {
    const server = createServer();
    server.once('error', (error) => {
      server.close();
      reject(error);
    });
    server.listen(0, '127.0.0.1', () => {
      const address = server.address() as AddressInfo | null;
      server.close((closeError) => {
        if (closeError) {
          reject(closeError);
          return;
        }
        if (!address) {
          reject(new Error('Failed to allocate ephemeral port'));
          return;
        }
        resolve(address.port);
      });
    });
  });

const createTempDir = (): string => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mcp-files-integration-test-'));
  return tempDir;
};

const cleanupTempDir = (tempDir: string): void => {
  fs.rmSync(tempDir, { recursive: true, force: true });
};

const createTestFiles = (tempDir: string): void => {
  fs.mkdirSync(path.join(tempDir, 'subdir'), { recursive: true });
  fs.writeFileSync(path.join(tempDir, 'test.txt'), 'Hello World\nLine 2\nLine 3');
  fs.writeFileSync(path.join(tempDir, 'subdir', 'nested.txt'), 'Nested content\nTODO: implement');
  fs.writeFileSync(path.join(tempDir, 'search.js'), 'const TODO = "find me";\n// FIXME: later');
  fs.writeFileSync(path.join(tempDir, 'empty.txt'), '');
};

// Create a mock tool context for testing
const createMockContext = () => ({
  env: {},
  fetch: global.fetch,
  now: () => new Date(),
});

const createMcpRequest = (method: string, params: any, id: number | string = 1) => ({
  jsonrpc: '2.0' as const,
  id,
  method,
  params,
});

const createMcpClient = (baseUrl: string) => {
  let sessionId: string | undefined;

  const initialize = async (): Promise<string> => {
    const response = await fetch(`${baseUrl}/mcp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream',
      },
      body: JSON.stringify(createMcpRequest('initialize', {
        protocolVersion: '2024-10-01',
        clientInfo: { name: 'test-client', version: '1.0.0' },
      })),
    });

    if (!response.ok) {
      throw new Error(`Initialization failed: ${response.status} ${response.statusText}`);
    }

    sessionId = response.headers.get('mcp-session-id') || undefined;
    if (!sessionId) {
      throw new Error('No session ID returned from server');
    }

    return sessionId;
  };

  const sendRequest = async (method: string, params: any, id: number | string = 1): Promise<any> => {
    if (!sessionId) {
      throw new Error('Session not initialized');
    }

    const response = await fetch(`${baseUrl}/mcp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream',
        'mcp-session-id': sessionId,
      },
      body: JSON.stringify(createMcpRequest(method, params, id)),
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status} ${response.statusText}`);
    }

    const text = await response.text();
    // Parse SSE format
    const lines = text.split('\n');
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        try {
          const parsed = JSON.parse(data);
          if (parsed.id === id) {
            if (parsed.error) {
              throw new Error(`MCP Error: ${parsed.error.message}`);
            }
            return parsed.result;
          }
        } catch {
          // Ignore parse errors, continue to next line
        }
      }
    }

    throw new Error('No valid response found in SSE stream');
  };

  const listTools = async (): Promise<any[]> => {
    const result = await sendRequest('tools/list', {});
    return result.tools || [];
  };

  const callTool = async (name: string, args: any): Promise<any> => {
    const result = await sendRequest('tools/call', { name, arguments: args });
    return result;
  };

  return { initialize, sendRequest, listTools, callTool };
};

test('MCP integration - files tools available and callable', async (t) => {
  const port = await allocatePort();
  const baseUrl = `http://127.0.0.1:${port}`;

  const tempDir = createTempDir();
  t.teardown(() => cleanupTempDir(tempDir));
  createTestFiles(tempDir);

  // Set MCP_ROOT_PATH to temp directory
  const originalRoot = process.env.MCP_ROOT_PATH;
  process.env.MCP_ROOT_PATH = tempDir;
  t.teardown(() => {
    if (originalRoot) {
      process.env.MCP_ROOT_PATH = originalRoot;
    } else {
      delete process.env.MCP_ROOT_PATH;
    }
  });

  // Create MCP server with all files tools
  const tools = [
    filesListDirectory(createMockContext()),
    filesTreeDirectory(createMockContext()),
    filesViewFile(createMockContext()),
    filesWriteFileContent(createMockContext()),
    filesWriteFileLines(createMockContext()),
    filesSearch(createMockContext()),
  ];

  const mcpServer = createMcpServer(tools);

  // Start transport
  const transport = fastifyTransport({ port, host: '127.0.0.1' });
  await transport.start(mcpServer);
  t.teardown(async () => {
    if (transport?.stop) {
      await transport.stop();
    }
  });

  // Create client and initialize
  const client = createMcpClient(baseUrl);
  await client.initialize();

  // List available tools
  const availableTools = await client.listTools();
  const toolNames = availableTools.map((tool: any) => tool.name);

  // Verify all files tools are available
  t.true(toolNames.includes('files_list_directory'));
  t.true(toolNames.includes('files_tree_directory'));
  t.true(toolNames.includes('files_view_file'));
  t.true(toolNames.includes('files_write_content'));
  t.true(toolNames.includes('files_write_lines'));
  t.true(toolNames.includes('files_search'));

  // Test files_list_directory
  const listResult = await client.callTool('files_list_directory', { rel: '.' });
  t.true(listResult.content);
  t.true(listResult.content[0].text.includes('test.txt'));

  // Test files_view_file
  const viewResult = await client.callTool('files_view_file', { relOrFuzzy: './test.txt' });
  t.true(viewResult.content);
  t.true(viewResult.content[0].text.includes('Hello World'));

  // Test files_search
  const searchResult = await client.callTool('files_search', { query: 'Hello', rel: '.' });
  t.true(searchResult.content);
  t.true(searchResult.content[0].text.includes('Hello World'));

  // Test files_tree_directory
  const treeResult = await client.callTool('files_tree_directory', { rel: '.', depth: 2 });
  t.true(treeResult.content);
  t.true(treeResult.content[0].text.includes('subdir'));

  // Test files_write_content
  const writeResult = await client.callTool('files_write_content', {
    filePath: 'new.txt',
    content: 'New file content'
  });
  t.true(writeResult.content);
  t.true(fs.existsSync(path.join(tempDir, 'new.txt')));

  // Test files_write_lines
  const writeLinesResult = await client.callTool('files_write_lines', {
    filePath: 'new.txt',
    lines: ['Appended line'],
    startLine: 2
  });
  t.true(writeLinesResult.content);

  const finalContent = fs.readFileSync(path.join(tempDir, 'new.txt'), 'utf8');
  t.true(finalContent.includes('Appended line'));
});

test('MCP integration - error handling', async (t) => {
  const port = await allocatePort();
  const baseUrl = `http://127.0.0.1:${port}`;

  const tempDir = createTempDir();
  t.teardown(() => cleanupTempDir(tempDir));
  createTestFiles(tempDir);

  const tools = [
    filesListDirectory(createMockContext()),
    filesViewFile(createMockContext()),
  ];

  const mcpServer = createMcpServer(tools);
  const transport = fastifyTransport({ port, host: '127.0.0.1' });
  await transport.start(mcpServer);
  t.teardown(async () => {
    if (transport?.stop) {
      await transport.stop();
    }
  });

  const client = createMcpClient(baseUrl);
  await client.initialize();

  // Test invalid tool name
  await t.throwsAsync(
    async () => await client.callTool('non_existent_tool', {}),
    { message: /MCP Error/ }
  );

  // Test invalid arguments
  await t.throwsAsync(
    async () => await client.callTool('files_list_directory', { rel: 123 }),
    { message: /MCP Error/ }
  );

  // Test non-existent file
  const result = await client.callTool('files_view_file', { relOrFuzzy: '/non/existent/file.txt' });
  t.true(result.content);
  t.true(result.content[0].text.includes('error'));
});

test('MCP integration - concurrent requests', async (t) => {
  const port = await allocatePort();
  const baseUrl = `http://127.0.0.1:${port}`;

  const tempDir = createTempDir();
  t.teardown(() => cleanupTempDir(tempDir));
  createTestFiles(tempDir);

  process.env.MCP_ROOT_PATH = tempDir;
  t.teardown(() => {
    delete process.env.MCP_ROOT_PATH;
  });

  const tools = [
    filesListDirectory(createMockContext()),
    filesSearch(createMockContext()),
  ];

  const mcpServer = createMcpServer(tools);
  const transport = fastifyTransport({ port, host: '127.0.0.1' });
  await transport.start(mcpServer);
  t.teardown(async () => {
    if (transport?.stop) {
      await transport.stop();
    }
  });

  const client = createMcpClient(baseUrl);
  await client.initialize();

  // Make concurrent requests
  const promises = [
    client.callTool('files_list_directory', { rel: '.' }),
    client.callTool('files_search', { query: 'Hello', rel: '.' }),
    client.callTool('files_list_directory', { rel: 'subdir' }),
  ];

  const results = await Promise.all(promises);

  t.is(results.length, 3);
  results.forEach(result => {
    t.true(result.content);
    t.true(result.content[0].text);
  });
});

test('MCP integration - session management', async (t) => {
  const port = await allocatePort();
  const baseUrl = `http://127.0.0.1:${port}`;

  const tools = [
    filesListDirectory(createMockContext()),
  ];

  const mcpServer = createMcpServer(tools);
  const transport = fastifyTransport({ port, host: '127.0.0.1' });
  await transport.start(mcpServer);
  t.teardown(async () => {
    if (transport?.stop) {
      await transport.stop();
    }
  });

  const client = createMcpClient(baseUrl);

  // Should fail without session
  await t.throwsAsync(
    async () => await client.callTool('files_list_directory', {}),
    { message: /Session not initialized/ }
  );

  // Initialize session
  const sessionId = await client.initialize();
  t.true(typeof sessionId === 'string');

  // Should work with session
  const result = await client.callTool('files_list_directory', {});
  t.true(result.content);
});

test('MCP integration - large file handling', async (t) => {
  const port = await allocatePort();
  const baseUrl = `http://127.0.0.1:${port}`;

  const tempDir = createTempDir();
  t.teardown(() => cleanupTempDir(tempDir));

  // Create a large file
  const largeContent = 'Line '.repeat(10000);
  fs.writeFileSync(path.join(tempDir, 'large.txt'), largeContent);

  process.env.MCP_ROOT_PATH = tempDir;
  t.teardown(() => {
    delete process.env.MCP_ROOT_PATH;
  });

  const tools = [
    filesViewFile(createMockContext()),
    filesSearch(createMockContext()),
  ];

  const mcpServer = createMcpServer(tools);
  const transport = fastifyTransport({ port, host: '127.0.0.1' });
  await transport.start(mcpServer);
  t.teardown(async () => {
    if (transport?.stop) {
      await transport.stop();
    }
  });

  const client = createMcpClient(baseUrl);
  await client.initialize();

  // Test viewing large file
  const viewResult = await client.callTool('files_view_file', {
    relOrFuzzy: './large.txt',
    line: 1,
    context: 10
  });
  t.true(viewResult.content);
  t.true(viewResult.content[0].text.includes('Line 1'));

  // Test searching in large file with size limit
  const searchResult = await client.callTool('files_search', {
    query: 'Line',
    maxFileSizeBytes: 100, // Very small limit
    rel: '.'
  });
  t.true(searchResult.content);
  // Should not find matches due to size limit
  t.true(searchResult.content[0].text.includes('"count":0'));
});

test('MCP integration - special characters and encoding', async (t) => {
  const port = await allocatePort();
  const baseUrl = `http://127.0.0.1:${port}`;

  const tempDir = createTempDir();
  t.teardown(() => cleanupTempDir(tempDir));

  // Create files with special characters
  const specialContent = 'Hello 世界! 🚀\nSpecial chars: àáâãäå\nQuotes: "test"\nBackslashes: \\path\\';
  fs.writeFileSync(path.join(tempDir, 'special.txt'), specialContent);
  fs.writeFileSync(path.join(tempDir, 'file with spaces.txt'), 'Space content');

  process.env.MCP_ROOT_PATH = tempDir;
  t.teardown(() => {
    delete process.env.MCP_ROOT_PATH;
  });

  const tools = [
    filesListDirectory(createMockContext()),
    filesViewFile(createMockContext()),
    filesSearch(createMockContext()),
  ];

  const mcpServer = createMcpServer(tools);
  const transport = fastifyTransport({ port, host: '127.0.0.1' });
  await transport.start(mcpServer);
  t.teardown(async () => {
    if (transport?.stop) {
      await transport.stop();
    }
  });

  const client = createMcpClient(baseUrl);
  await client.initialize();

  // Test listing files with spaces
  const listResult = await client.callTool('files_list_directory', { rel: '.' });
  t.true(listResult.content);
  t.true(listResult.content[0].text.includes('file with spaces.txt'));

  // Test viewing file with special characters
  const viewResult = await client.callTool('files_view_file', { relOrFuzzy: './special.txt' });
  t.true(viewResult.content);
  t.true(viewResult.content[0].text.includes('Hello 世界! 🚀'));

  // Test searching for special characters
  const searchResult = await client.callTool('files_search', {
    query: '世界',
    caseSensitive: true,
    rel: '.'
  });
  t.true(searchResult.content);
  t.true(searchResult.content[0].text.includes('世界'));
});

test('MCP integration - tool schemas and validation', async (t) => {
  const port = await allocatePort();
  const baseUrl = `http://127.0.0.1:${port}`;

  const tools = [
    filesListDirectory(createMockContext()),
    filesTreeDirectory(createMockContext()),
    filesViewFile(createMockContext()),
    filesWriteFileContent(createMockContext()),
    filesWriteFileLines(createMockContext()),
    filesSearch(createMockContext()),
  ];

  const mcpServer = createMcpServer(tools);
  const transport = fastifyTransport({ port, host: '127.0.0.1' });
  await transport.start(mcpServer);
  t.teardown(async () => {
    if (transport?.stop) {
      await transport.stop();
    }
  });

  const client = createMcpClient(baseUrl);
  await client.initialize();

  const availableTools = await client.listTools();

  // Check that all tools have proper schemas
  const listDirTool = availableTools.find((t: any) => t.name === 'files_list_directory');
  t.true(listDirTool);
  t.true(listDirTool.inputSchema);
  t.true(typeof listDirTool.inputSchema.properties === 'object');
  t.true(listDirTool.inputSchema.properties.rel);

  // Check files_view_file schema
  const viewFileTool = availableTools.find((t: any) => t.name === 'files_view_file');
  t.true(viewFileTool);
  t.true(viewFileTool.inputSchema);
  t.true(viewFileTool.inputSchema.properties.relOrFuzzy);

  // Check files_search schema
  const searchTool = availableTools.find((t: any) => t.name === 'files_search');
  t.true(searchTool);
  t.true(searchTool.inputSchema);
  t.true(searchTool.inputSchema.properties.query);

  // Test validation errors
  await t.throwsAsync(
    async () => await client.callTool('files_tree_directory', { depth: 0 }),
    { message: /MCP Error/ }
  );

  await t.throwsAsync(
    async () => await client.callTool('files_view_file', { line: 0 }),
    { message: /MCP Error/ }
  );

  await t.throwsAsync(
    async () => await client.callTool('files_write_lines', {
      filePath: 'test.txt',
      lines: [],
      startLine: 1
    }),
    { message: /MCP Error/ }
  );
});