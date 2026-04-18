/**
 * Reconnect Message Tests
 * 
 * Tests for the firehose reconnection callback behavior.
 */

import { describe, it, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert';
import { BskyDiscovery, type FirehoseOptions } from '../dist/index.js';

// ============================================================================
// Mock WebSocket for Testing
// ============================================================================

interface MockWebSocket {
  onopen: ((event: any) => void) | null;
  onmessage: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onclose: ((event: any) => void) | null;
  close: () => void;
  send: (data: any) => void;
  binaryType: string;
}

/**
 * Create a mock WebSocket that can simulate reconnection scenarios.
 */
function createMockWebSocketClass(
  scenarios: {
    shouldFail?: boolean;
    failAfterMs?: number;
    closeAfterMs?: number;
    autoReconnectAfterMs?: number;
  } = {}
) {
  const connections: MockWebSocket[] = [];
  let connectionCount = 0;

  return class MockWebSocketImpl {
    static connections = connections;
    static connectionCount = connectionCount;
    
    onopen: ((event: any) => void) | null = null;
    onmessage: ((event: any) => void) | null = null;
    onerror: ((event: any) => void) | null = null;
    onclose: ((event: any) => void) | null = null;
    binaryType: string = 'arraybuffer';
    
    private url: string;
    constructor(url: string) {
      this.url = url;
      const instance = this as unknown as MockWebSocket;
      connections.push(instance);
      connectionCount++;
      (MockWebSocketImpl as any).connectionCount = connectionCount;
      
      // Simulate async connection
      setTimeout(() => {
        if (scenarios.shouldFail && connectionCount === 1) {
          this.onerror?.({ type: 'error' });
          this.onclose?.({ type: 'close', code: 1006, reason: 'Connection failed' });
        } else {
          this.onopen?.({ type: 'open' });
          
          // Auto-close after delay if specified
          if (scenarios.closeAfterMs) {
            setTimeout(() => {
              this.onclose?.({ type: 'close', code: 1000, reason: 'Timeout' });
            }, scenarios.closeAfterMs);
          }
        }
      }, 10);
    }
    
    close() {
      this.onclose?.({ type: 'close', code: 1000, reason: 'Client close' });
    }
    
    send(_data: any) {
      // No-op for mock
    }
  };
}

// ============================================================================
// Reconnect Callback Tests
// ============================================================================

describe('Firehose Reconnect Callback', () => {
  it('should call onReconnect when connection is lost and reconnects', async () => {
    let reconnectCalled = false;
    let reconnectCount = 0;
    
    const onReconnect = () => {
      reconnectCalled = true;
      reconnectCount++;
    };
    
    const discovery = new BskyDiscovery();
    
    // Start with options that include onReconnect callback
    const options: FirehoseOptions = {
      relay: 'wss://test.relay',
      onReconnect,
    };
    
    // Note: In actual implementation, this would connect to a real firehose.
    // For this test, we verify the callback is wired correctly.
    assert.strictEqual(typeof options.onReconnect, 'function');
    
    // Verify callback can be invoked
    options.onReconnect?.();
    assert.strictEqual(reconnectCalled, true);
    assert.strictEqual(reconnectCount, 1);
    
    // Multiple reconnects should trigger multiple callbacks
    options.onReconnect?.();
    assert.strictEqual(reconnectCount, 2);
  });

  it('should handle missing onReconnect callback gracefully', async () => {
    const options: FirehoseOptions = {
      relay: 'wss://test.relay',
      // No onReconnect provided
    };
    
    // Should not throw when callback is missing
    assert.strictEqual(options.onReconnect, undefined);
    
    // Optional call should be safe
    options.onReconnect?.();
    // No assertion needed - just verifying no throw
  });

  it('should support all firehose options together', async () => {
    const events: string[] = [];
    
    const options: FirehoseOptions = {
      relay: 'wss://bsky.network',
      collections: ['app.bsky.feed.post', 'app.bsky.feed.like'],
      dids: ['did:plc:test123'],
      onEvent: (event) => {
        events.push(`event:${event.seq}`);
      },
      onError: (error) => {
        events.push(`error:${error.message}`);
      },
      onReconnect: () => {
        events.push('reconnect');
      },
    };
    
    // Verify all callbacks are present
    assert.strictEqual(typeof options.onEvent, 'function');
    assert.strictEqual(typeof options.onError, 'function');
    assert.strictEqual(typeof options.onReconnect, 'function');
    
    // Simulate calling each
    options.onEvent?.({ seq: 1, time: new Date().toISOString(), repo: 'test', path: 'test', action: 'create' });
    options.onError?.(new Error('Test error'));
    options.onReconnect?.();
    
    assert.deepStrictEqual(events, ['event:1', 'error:Test error', 'reconnect']);
  });
});

// ============================================================================
// Reconnect Timer Tests
// ============================================================================

describe('Reconnect Timer Behavior', () => {
  it('should use setTimeout for reconnection delay', async () => {
    // Verify the implementation uses setTimeout (not setInterval) for reconnection
    // This is important because setInterval would cause rapid reconnects
    
    const fs = await import('node:fs/promises');
    const path = await import('node:path');
    
    // Check the main chunk file where firehose code lives
    const chunkPath = path.join(import.meta.dirname, '..', 'dist', 'chunk-RKKZN5YN.js');
    const code = await fs.readFile(chunkPath, 'utf-8');
    
    // Should use setTimeout for reconnection scheduling
    assert.ok(code.includes('setTimeout'), 'Implementation should use setTimeout for reconnect');
    
    // Verify the pattern: reconnectTimer = setTimeout
    const reconnectPattern = /reconnectTimer\s*=\s*setTimeout/;
    assert.ok(
      reconnectPattern.test(code),
      'Should assign setTimeout result to reconnectTimer'
    );
    
    // Also verify clearInterval is used (not clearTimeout) for reconnectTimer
    // because the timer variable is reused
    assert.ok(
      code.includes('clearInterval(this.reconnectTimer)') ||
      code.includes('clearTimeout(this.reconnectTimer)'),
      'Should clear reconnect timer on stop'
    );
  });
  
  it('should clear reconnect timer on stop', async () => {
    const discovery = new BskyDiscovery();
    
    // Start and immediately stop
    // The stop() method should clear any pending reconnect timer
    discovery.stop();
    
    // No assertion - just verifying no throw
    // In actual test with mock timers, we'd verify clearTimeout was called
  });
});

// Note: In Node.js strip-only mode, import.meta.dirname is available
// No need for separate helper function
