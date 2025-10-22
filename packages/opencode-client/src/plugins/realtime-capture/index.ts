// SPDX-License-Identifier: GPL-3.0-only
// Real-time Capture Plugin
// Provides real-time message, session, and event capture capabilities

import type { Plugin } from '@opencode-ai/plugin';
import { tool } from '@opencode-ai/plugin/tool';

import { createOpencodeClient } from '@opencode-ai/sdk';
import type { Event, Session } from '@opencode-ai/sdk';

// Import existing actions for proper event handling
import {
  handleSessionIdle,
  handleSessionUpdated,
  handleMessageUpdated,
  extractSessionId,
  getSessionMessages,
  type EventContext,
} from '../../actions/events/index.js';
import { subscribe } from '../../actions/events/subscribe.js';
import { list as listSessions } from '../../actions/sessions/list.js';

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

  const startCapture = async (): Promise<void> => {
    if (isCapturing) {
      throw new Error('Capture is already active');
    }

    try {
      const subscribeResult = await subscribe({
        client: opencodeClient,
      });

      if (!subscribeResult.success) {
        throw new Error(subscribeResult.error || 'Failed to subscribe to events');
      }

      isCapturing = true;
      captureStartTime = new Date();
      capturedEvents = [];

      // Get the actual subscription
      const subscription = await opencodeClient.event?.subscribe();
      if (!subscription) {
        throw new Error('Failed to get event subscription');
      }
      eventSubscription = subscription;

      console.log('🎯 Started real-time event capture');

      // Create event context for action handlers
      const eventContext: EventContext = {
        client: opencodeClient,
      };

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

            // Extract session ID using existing action
            const sessionId = extractSessionId(event) || 'unknown';

            // Log real-time event
            console.log(
              `📡 [${new Date().toLocaleTimeString()}] ${event.type} - Session: ${sessionId}`,
            );

            // Use existing actions to handle the event properly
            try {
              if (event.type === 'session.idle') {
                await handleSessionIdle(eventContext, sessionId);
              } else if (event.type === 'session.updated') {
                await handleSessionUpdated(eventContext, sessionId);
              } else if (event.type === 'message.updated') {
                await handleMessageUpdated(eventContext, sessionId);
              }
            } catch (actionError) {
              // Don't let action errors stop the capture
              console.warn('Warning: Could not handle event with action:', actionError);
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

  return {
    tool: {
      'start-realtime-capture': tool({
        description: 'Start real-time capture of OpenCode events, messages, and sessions',
        args: {},
        async execute() {
          try {
            await startCapture();
            return JSON.stringify(
              {
                success: true,
                message: '✅ Real-time capture started successfully',
                startTime: captureStartTime?.toISOString(),
                maxEvents: MAX_CAPTURED_EVENTS,
              },
              null,
              2,
            );
          } catch (error) {
            return JSON.stringify(
              {
                success: false,
                error: error instanceof Error ? error.message : String(error),
              },
              null,
              2,
            );
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

            return JSON.stringify(summary, null, 2);
          } catch (error) {
            return JSON.stringify(
              {
                success: false,
                error: error instanceof Error ? error.message : String(error),
              },
              null,
              2,
            );
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
              filteredEvents = filteredEvents.filter((event) => {
                const sessionId = extractSessionId(event);
                return sessionId === args.sessionId;
              });
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
              const sessionId = extractSessionId(event) || 'unknown';

              output += `\n${index + 1}. [${new Date(timestamp).toLocaleTimeString()}] ${event.type}\n`;
              output += `   Session: ${sessionId}\n`;
              output += `   Sequence: ${event.captureSequence || 'N/A'}\n`;

              // Add relevant properties based on event type
              if (event.type.includes('message')) {
                const messageId =
                  (event as any).properties?.info?.id ||
                  (event as any).properties?.messageID ||
                  'unknown';
                output += `   Message: ${messageId}\n`;
              }

              if (event.type.includes('session')) {
                const title =
                  (event as any).properties?.info?.title ||
                  (event as any).properties?.title ||
                  'Untitled';
                output += `   Title: ${title}\n`;
              }
            });

            return output;
          } catch (error) {
            return JSON.stringify(
              {
                success: false,
                error: error instanceof Error ? error.message : String(error),
              },
              null,
              2,
            );
          }
        },
      }),

      'get-capture-status': tool({
        description: 'Get current status of real-time capture',
        args: {},
        async execute() {
          return JSON.stringify(
            {
              isCapturing,
              captureStartTime: captureStartTime?.toISOString(),
              eventsCaptured: capturedEvents.length,
              maxEvents: MAX_CAPTURED_EVENTS,
              subscriptionActive: !!eventSubscription,
            },
            null,
            2,
          );
        },
      }),

      'clear-captured-events': tool({
        description: 'Clear all captured events from memory',
        args: {},
        async execute() {
          const count = capturedEvents.length;
          capturedEvents = [];

          return JSON.stringify(
            {
              success: true,
              message: `🗑️ Cleared ${count} captured events`,
              eventsCleared: count,
            },
            null,
            2,
          );
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
            const sessionsResult = await listSessions({
              limit: 100,
              offset: 0,
            });

            if ('error' in sessionsResult) {
              throw new Error(sessionsResult.error);
            }

            const sessions = sessionsResult.sessions || [];

            const enrichedSessions = await Promise.all(
              sessions.map(async (session: any) => {
                const sessionData: any = {
                  id: session.id,
                  title: session.title || 'Untitled',
                  directory: session.directory || 'Unknown',
                  created: session.time?.created || 'Unknown',
                  updated: session.time?.updated || 'Unknown',
                };

                // Add recent messages if requested
                if (args.includeMessages) {
                  try {
                    const messages = await getSessionMessages(opencodeClient, session.id);
                    const recentMessages = messages.slice(-3); // Last 3 messages

                    sessionData.recentMessages = recentMessages.map((msg: any) => ({
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

            return JSON.stringify(
              {
                success: true,
                sessions: enrichedSessions,
                totalSessions: enrichedSessions.length,
                timestamp: new Date().toISOString(),
              },
              null,
              2,
            );
          } catch (error) {
            return JSON.stringify(
              {
                success: false,
                error: error instanceof Error ? error.message : String(error),
              },
              null,
              2,
            );
          }
        },
      }),
    },

    // Plugin lifecycle hooks
    async event(input) {
      // Capture plugin-level events if capture is active
      if (isCapturing) {
        const pluginEvent: Event = {
          type: 'server.connected', // Use a valid event type
          properties: {
            version: '1.0.0',
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
