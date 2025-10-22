// SPDX-License-Identifier: GPL-3.0-only
// Real-time Capture Plugin
// Provides real-time message, session, and event capture capabilities

import type { Plugin } from '@opencode-ai/plugin';
import { tool } from '@opencode-ai/plugin/tool';

import { createOpencodeClient } from '@opencode-ai/sdk';
import type { Event, Session, Message } from '@opencode-ai/sdk';

// Import indexer utilities for proper event handling
import {
  isMessageEvent,
  isSessionEvent,
  extractSessionId,
  extractMessageId,
} from '../../services/indexer-types.js';
import { createIndexingOperations } from '../../services/indexer-operations.js';

/**
 * Real-time Capture Plugin - Provides real-time monitoring and capture of OpenCode events
 */
export const RealtimeCapturePlugin: Plugin = async (_pluginContext) => {
  // Create OpenCode client for real-time operations
  const opencodeClient = createOpencodeClient({
    baseUrl: 'http://localhost:4096',
  });

  // Real-time capture state
  let isCapturing = false;
  let eventSubscription: any = null;
  let capturedEvents: Array<Event & { capturedAt?: string; captureSequence?: number }> = [];
  let captureStartTime: Date | null = null;
  const MAX_CAPTURED_EVENTS = 1000;

  // Create indexing operations for proper event handling
  const { indexSession, indexMessage, indexEvent } = createIndexingOperations((eventType: string, message: string) => {
    console.log(`[Realtime Capture] ${message}`);
  });

  const startCapture = async (): Promise<void> => {
    if (isCapturing) {
      throw new Error('Capture is already active');
    }

    try {
      if (typeof opencodeClient.event?.subscribe !== 'function') {
        throw new Error('This SDK/server does not support event.subscribe()');
      }

      isCapturing = true;
      captureStartTime = new Date();
      capturedEvents = [];

      const subscription = await opencodeClient.event.subscribe();
      eventSubscription = subscription;

      console.log('🎯 Started real-time event capture');

      // Start processing events in background
      (async () => {
        try {
          for await (const event of subscription.stream) {
            if (!isCapturing) break;

            // Add timestamp and capture metadata
            const enrichedEvent = {
              ...event,
              capturedAt: new Date().toISOString(),
              captureSequence: capturedEvents.length + 1,
            };

            capturedEvents.push(enrichedEvent);

            // Keep only the most recent events
            if (capturedEvents.length > MAX_CAPTURED_EVENTS) {
              capturedEvents = capturedEvents.slice(-MAX_CAPTURED_EVENTS);
            }

            // Extract session ID using indexer utilities
            const sessionId = extractSessionId(event) || 'unknown';

            // Log real-time event
            console.log(`📡 [${new Date().toLocaleTimeString()}] ${event.type} - Session: ${sessionId}`);

            // Use indexer operations to handle the event properly
            try {
              if (isMessageEvent(event)) {
                const messageId = extractMessageId(event);
                if (messageId && (event.type === 'message.updated' || event.type === 'message.removed')) {
                  // Fetch the full message for complete indexing
                  const messageResult = await opencodeClient.session.message({
                    path: { id: sessionId, messageID: messageId },
                  });
                  const targetMessage = messageResult.data;
                  
                  if (targetMessage) {
                    await indexMessage(targetMessage, sessionId);
                  }
                }
              } else if (isSessionEvent(event)) {
                if ('info' in event.properties && event.properties.info) {
                  await indexSession(event.properties.info as Session);
                }
              }
              
              // Index the event itself
              await indexEvent(event);
            } catch (indexError) {
              // Don't let indexing errors stop the capture
              console.warn('Warning: Could not index event:', indexError);
            }
          }
        } catch (error) {
          console.error('❌ Error in event capture stream:', error);
          isCapturing = false;
          eventSubscription = null;
        }
      })();

    } catch (error) {
      isCapturing = false;
      throw error;
    }
  };

  const stopCapture = async (): Promise<void> => {
    if (!isCapturing) {
      throw new Error('No active capture to stop');
    }

    isCapturing = false;
    
    if (eventSubscription) {
      try {
        // Close the subscription if it has a close method
        if (typeof eventSubscription.close === 'function') {
          await eventSubscription.close();
        }
      } catch (error) {
        console.warn('Warning: Could not cleanly close event subscription:', error);
      }
      eventSubscription = null;
    }

    console.log(`🛑 Stopped real-time event capture. Captured ${capturedEvents.length} events.`);
  };

            capturedEvents.push(enrichedEvent);

            // Keep only the most recent events
            if (capturedEvents.length > MAX_CAPTURED_EVENTS) {
              capturedEvents = capturedEvents.slice(-MAX_CAPTURED_EVENTS);
            }

            // Log real-time event
            const eventType = event.type;
            const sessionId =
              event.properties?.session?.id || event.properties?.sessionId || 'unknown';
            console.log(
              `📡 [${new Date().toLocaleTimeString()}] ${eventType} - Session: ${sessionId}`,
            );
          }
        } catch (error) {
          console.error('❌ Error in event capture stream:', error);
          isCapturing = false;
          eventSubscription = null;
        }
      })();
    } catch (error) {
      isCapturing = false;
      throw error;
    }
  };

  const stopCapture = async (): Promise<void> => {
    if (!isCapturing) {
      throw new Error('No active capture to stop');
    }

    isCapturing = false;

    if (eventSubscription) {
      try {
        // Close the subscription if it has a close method
        if (typeof eventSubscription.close === 'function') {
          await eventSubscription.close();
        }
      } catch (error) {
        console.warn('Warning: Could not cleanly close event subscription:', error);
      }
      eventSubscription = null;
    }

    console.log(`🛑 Stopped real-time event capture. Captured ${capturedEvents.length} events.`);
  };

  return {
    tool: {
      'start-realtime-capture': tool({
        description: 'Start real-time capture of OpenCode events, messages, and sessions',
        args: {},
        async execute() {
          try {
            await startCapture();
            return {
              success: true,
              message: '✅ Real-time capture started successfully',
              startTime: captureStartTime?.toISOString(),
              maxEvents: MAX_CAPTURED_EVENTS,
            };
          } catch (error) {
            return {
              success: false,
              error: error instanceof Error ? error.message : String(error),
            };
          }
        },
      }),

      'stop-realtime-capture': tool({
        description: 'Stop real-time event capture and get summary',
        args: {},
        async execute() {
          try {
            await stopCapture();

            const summary = {
              success: true,
              message: '🛑 Real-time capture stopped',
              totalEvents: capturedEvents.length,
              duration: captureStartTime
                ? Math.round((Date.now() - captureStartTime.getTime()) / 1000)
                : 0,
              startTime: captureStartTime?.toISOString(),
              endTime: new Date().toISOString(),
            };

            // Add event type breakdown
            const eventTypes: Record<string, number> = {};
            capturedEvents.forEach((event) => {
              eventTypes[event.type] = (eventTypes[event.type] || 0) + 1;
            });
            summary.eventTypes = eventTypes;

            return summary;
          } catch (error) {
            return {
              success: false,
              error: error instanceof Error ? error.message : String(error),
            };
          }
        },
      }),

      'get-captured-events': tool({
        description: 'Get recently captured events with filtering options',
        args: {
          limit: tool.schema.number().default(50).describe('Number of events to return'),
          eventType: tool.schema.string().optional().describe('Filter by event type'),
          sessionId: tool.schema.string().optional().describe('Filter by session ID'),
          format: tool.schema.enum(['json', 'table']).default('table').describe('Output format'),
        },
        async execute(args) {
          try {
            let filteredEvents = [...capturedEvents];

            // Apply filters
            if (args.eventType) {
              filteredEvents = filteredEvents.filter((event) => event.type === args.eventType);
            }

            if (args.sessionId) {
              filteredEvents = filteredEvents.filter(
                (event) =>
                  event.properties?.session?.id === args.sessionId ||
                  event.properties?.sessionId === args.sessionId,
              );
            }

            // Get the most recent events
            const recentEvents = filteredEvents.slice(-args.limit);

            if (args.format === 'json') {
              return JSON.stringify(recentEvents, null, 2);
            }

            // Format as table
            let output = `Captured Events (${recentEvents.length} recent):\n`;
            output += '='.repeat(100) + '\n';

            recentEvents.forEach((event, index) => {
              const timestamp = event.capturedAt || new Date().toISOString();
              const sessionId =
                event.properties?.session?.id || event.properties?.sessionId || 'unknown';

              output += `\n${index + 1}. [${new Date(timestamp).toLocaleTimeString()}] ${event.type}\n`;
              output += `   Session: ${sessionId}\n`;
              output += `   Sequence: ${event.captureSequence || 'N/A'}\n`;

              // Add relevant properties based on event type
              if (event.type.includes('message')) {
                const messageId =
                  event.properties?.message?.id || event.properties?.messageId || 'unknown';
                output += `   Message: ${messageId}\n`;
              }

              if (event.type.includes('session')) {
                const title =
                  event.properties?.session?.title || event.properties?.title || 'Untitled';
                output += `   Title: ${title}\n`;
              }
            });

            return output;
          } catch (error) {
            return {
              success: false,
              error: error instanceof Error ? error.message : String(error),
            };
          }
        },
      }),

      'get-capture-status': tool({
        description: 'Get current status of real-time capture',
        args: {},
        async execute() {
          return {
            isCapturing,
            captureStartTime: captureStartTime?.toISOString(),
            eventsCaptured: capturedEvents.length,
            maxEvents: MAX_CAPTURED_EVENTS,
            subscriptionActive: !!eventSubscription,
          };
        },
      }),

      'clear-captured-events': tool({
        description: 'Clear all captured events from memory',
        args: {},
        async execute() {
          const count = capturedEvents.length;
          capturedEvents = [];

          return {
            success: true,
            message: `🗑️ Cleared ${count} captured events`,
            eventsCleared: count,
          };
        },
      }),

      'get-active-sessions-realtime': tool({
        description: 'Get current active sessions with real-time status',
        args: {
          includeMessages: tool.schema
            .boolean()
            .default(false)
            .describe('Include recent messages for each session'),
        },
        async execute(args) {
          try {
            const sessionsResult = await opencodeClient.session.list();
            const sessions = sessionsResult.data || [];

            const enrichedSessions = await Promise.all(
              sessions.map(async (session: Session) => {
                const sessionData: any = {
                  id: session.id,
                  title: session.title || 'Untitled',
                  activityStatus: session.activityStatus || 'unknown',
                  messageCount: session.messageCount || 0,
                  isAgentTask: session.isAgentTask || false,
                  created: session.time?.created || 'Unknown',
                  lastActivityTime: session.lastActivityTime || 'Unknown',
                };

                // Add recent messages if requested
                if (args.includeMessages) {
                  try {
                    const messagesResult = await opencodeClient.session.messages({
                      path: { id: session.id },
                    });
                    const messages = messagesResult.data || [];
                    const recentMessages = messages.slice(-3); // Last 3 messages

                    sessionData.recentMessages = recentMessages.map((msg: Message) => ({
                      id: msg.info?.id,
                      role: msg.info?.role,
                      timestamp: msg.info?.time?.created,
                      preview:
                        msg.parts
                          ?.filter((part: any) => part.type === 'text')
                          ?.map((part: any) => part.text)
                          ?.join(' ')
                          ?.substring(0, 100) || '[No text]',
                    }));
                  } catch (error) {
                    sessionData.recentMessages = [];
                    sessionData.messagesError =
                      error instanceof Error ? error.message : String(error);
                  }
                }

                return sessionData;
              }),
            );

            return {
              success: true,
              sessions: enrichedSessions,
              totalSessions: enrichedSessions.length,
              timestamp: new Date().toISOString(),
            };
          } catch (error) {
            return {
              success: false,
              error: error instanceof Error ? error.message : String(error),
            };
          }
        },
      }),
    },

    // Plugin lifecycle hooks
    async event(input) {
      // Capture plugin-level events if capture is active
      if (isCapturing) {
        const pluginEvent: Event = {
          type: 'plugin.event',
          properties: {
            plugin: 'realtime-capture',
            originalEvent: input.event,
            timestamp: new Date().toISOString(),
          },
        };

        capturedEvents.push({
          ...pluginEvent,
          capturedAt: new Date().toISOString(),
          captureSequence: capturedEvents.length + 1,
        } as any);
      }
    },

    // Cleanup on plugin unload
    async unload() {
      if (isCapturing) {
        await stopCapture();
      }
    },
  };
};

export default RealtimeCapturePlugin;
