import { test, expect } from './helpers/test-setup';

test.describe('Opencode SDK Integration', () => {
  test.beforeEach(async ({ app }) => {
    await app.waitForAppLoad();
  });

  test('should initialize Opencode connection', async ({ page, app }) => {
    // Check if Opencode SDK is available
    const opencodeStatus = await page.evaluate(() => {
      return window.opencodeApp ? window.opencodeApp.opencode : null;
    });

    expect(opencodeStatus).toBeDefined();
    expect(opencodeStatus.connected).toBe(true);
  });

  test('should execute Opencode commands', async ({ page, app }) => {
    // Execute a simple Opencode command
    const result = await page.evaluate(async () => {
      if (window.opencodeApp && window.opencodeApp.opencode) {
        try {
          return await window.opencodeApp.opencode.executeCommand('echo', {
            message: 'Hello Opencode',
          });
        } catch (error) {
          return { error: error.message };
        }
      }
      return null;
    });

    expect(result).toBeDefined();
    expect(result.error).toBeUndefined();
  });

  test('should handle agent communication', async ({ page, app }) => {
    // Test agent list
    const agents = await page.evaluate(async () => {
      if (window.opencodeApp && window.opencodeApp.opencode) {
        try {
          return await window.opencodeApp.opencode.listAgents();
        } catch (error) {
          return { error: error.message };
        }
      }
      return null;
    });

    expect(agents).toBeDefined();
    expect(Array.isArray(agents)).toBe(true);
  });

  test('should create and manage sessions', async ({ page, app }) => {
    // Create a new session
    const session = await page.evaluate(async () => {
      if (window.opencodeApp && window.opencodeApp.opencode) {
        try {
          return await window.opencodeApp.opencode.createSession({
            type: 'chat',
            title: 'Test Session',
          });
        } catch (error) {
          return { error: error.message };
        }
      }
      return null;
    });

    expect(session).toBeDefined();
    expect(session.id).toBeDefined();
    expect(session.error).toBeUndefined();

    // List sessions
    const sessions = await page.evaluate(async () => {
      if (window.opencodeApp && window.opencodeApp.opencode) {
        try {
          return await window.opencodeApp.opencode.listSessions();
        } catch (error) {
          return { error: error.message };
        }
      }
      return null;
    });

    expect(sessions).toBeDefined();
    expect(Array.isArray(sessions)).toBe(true);
    expect(sessions.some((s: any) => s.id === session.id)).toBe(true);
  });

  test('should send messages to agents', async ({ page, app }) => {
    // First create a session
    const session = await page.evaluate(async () => {
      if (window.opencodeApp && window.opencodeApp.opencode) {
        try {
          return await window.opencodeApp.opencode.createSession({
            type: 'chat',
            title: 'Message Test',
          });
        } catch (error) {
          return { error: error.message };
        }
      }
      return null;
    });

    expect(session.id).toBeDefined();

    // Send a message
    const message = await page.evaluate(async (sessionId) => {
      if (window.opencodeApp && window.opencodeApp.opencode) {
        try {
          return await window.opencodeApp.opencode.sendMessage(sessionId, {
            content: 'Hello, this is a test message',
            type: 'user',
          });
        } catch (error) {
          return { error: error.message };
        }
      }
      return null;
    }, session.id);

    expect(message).toBeDefined();
    expect(message.error).toBeUndefined();
  });

  test('should handle tool execution', async ({ page, app }) => {
    // List available tools
    const tools = await page.evaluate(async () => {
      if (window.opencodeApp && window.opencodeApp.opencode) {
        try {
          return await window.opencodeApp.opencode.listTools();
        } catch (error) {
          return { error: error.message };
        }
      }
      return null;
    });

    expect(tools).toBeDefined();
    expect(Array.isArray(tools)).toBe(true);

    // Execute a simple tool if available
    if (tools.length > 0) {
      const toolResult = await page.evaluate(async (toolName) => {
        if (window.opencodeApp && window.opencodeApp.opencode) {
          try {
            return await window.opencodeApp.opencode.executeTool(toolName, {});
          } catch (error) {
            return { error: error.message };
          }
        }
        return null;
      }, tools[0].name);

      expect(toolResult).toBeDefined();
    }
  });

  test('should handle file operations through Opencode', async ({ page, app }) => {
    // Test file listing
    const files = await page.evaluate(async () => {
      if (window.opencodeApp && window.opencodeApp.opencode) {
        try {
          return await window.opencodeApp.opencode.listFiles('./');
        } catch (error) {
          return { error: error.message };
        }
      }
      return null;
    });

    expect(files).toBeDefined();
    expect(Array.isArray(files)).toBe(true);
  });

  test('should handle real-time events', async ({ page, app }) => {
    // Set up event listener
    const eventReceived = await page.evaluate(async () => {
      return new Promise((resolve) => {
        if (window.opencodeApp && window.opencodeApp.opencode) {
          window.opencodeApp.opencode.on('session:updated', (event: any) => {
            resolve(event);
          });

          // Trigger an event
          setTimeout(() => {
            window.opencodeApp.opencode.createSession({
              type: 'chat',
              title: 'Event Test',
            });
          }, 100);
        } else {
          resolve(null);
        }
      });
    });

    expect(eventReceived).toBeDefined();
  });

  test('should handle connection errors gracefully', async ({ page, app }) => {
    // Simulate connection loss (this would need to be implemented in the app)
    const errorHandling = await page.evaluate(async () => {
      if (window.opencodeApp && window.opencodeApp.opencode) {
        try {
          // Try to execute command with invalid parameters
          return await window.opencodeApp.opencode.executeCommand('invalid-command', {});
        } catch (error) {
          return {
            handled: true,
            error: error.message,
          };
        }
      }
      return null;
    });

    expect(errorHandling).toBeDefined();
    expect(errorHandling.handled).toBe(true);
  });

  test('should maintain session state', async ({ page, app }) => {
    // Create session with initial state
    const session = await page.evaluate(async () => {
      if (window.opencodeApp && window.opencodeApp.opencode) {
        try {
          return await window.opencodeApp.opencode.createSession({
            type: 'chat',
            title: 'State Test',
            initialState: { counter: 0 },
          });
        } catch (error) {
          return { error: error.message };
        }
      }
      return null;
    });

    expect(session.id).toBeDefined();

    // Update session state
    const updatedSession = await page.evaluate(async (sessionId) => {
      if (window.opencodeApp && window.opencodeApp.opencode) {
        try {
          return await window.opencodeApp.opencode.updateSession(sessionId, {
            state: { counter: 1 },
          });
        } catch (error) {
          return { error: error.message };
        }
      }
      return null;
    }, session.id);

    expect(updatedSession.state.counter).toBe(1);
  });

  test('should handle concurrent operations', async ({ page, app }) => {
    // Execute multiple operations concurrently
    const results = await page.evaluate(async () => {
      if (window.opencodeApp && window.opencodeApp.opencode) {
        try {
          const operations = [
            window.opencodeApp.opencode.listAgents(),
            window.opencodeApp.opencode.listSessions(),
            window.opencodeApp.opencode.listFiles('./'),
          ];

          return await Promise.all(operations);
        } catch (error) {
          return { error: error.message };
        }
      }
      return null;
    });

    expect(results).toBeDefined();
    expect(results).toHaveLength(3);
    expect(results.every((result: any) => !result.error)).toBe(true);
  });

  test('should provide debugging information', async ({ page, app }) => {
    // Get debug info
    const debugInfo = await page.evaluate(async () => {
      if (window.opencodeApp && window.opencodeApp.opencode) {
        try {
          return await window.opencodeApp.opencode.getDebugInfo();
        } catch (error) {
          return { error: error.message };
        }
      }
      return null;
    });

    expect(debugInfo).toBeDefined();
    expect(debugInfo.version).toBeDefined();
    expect(debugInfo.connectionStatus).toBeDefined();
    expect(debugInfo.activeSessions).toBeDefined();
  });
});
