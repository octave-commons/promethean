import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

import type { KanbanConfig } from './config/shared.js';

export interface TransitionEvent {
  readonly id: string;
  readonly timestamp: string;
  readonly taskId: string;
  readonly fromStatus: string;
  readonly toStatus: string;
  readonly reason?: string;
  readonly actor: string; // "agent" | "human" | "system"
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export interface EventLog {
  readonly events: ReadonlyArray<TransitionEvent>;
  readonly lastProcessed: string;
}

export class EventLogManager {
  private readonly logPath: string;

  constructor(config: KanbanConfig) {
    this.logPath = path.join(config.cachePath || 'docs/agile/boards/.cache', 'event-log.jsonl');
  }

  async logTransition(
    taskId: string,
    fromStatus: string,
    toStatus: string,
    actor: TransitionEvent['actor'] = 'system',
    reason?: string,
    metadata?: Readonly<Record<string, unknown>>,
  ): Promise<void> {
    const event: TransitionEvent = {
      id: randomUUID(),
      timestamp: new Date().toISOString(),
      taskId,
      fromStatus,
      toStatus,
      reason,
      actor,
      metadata,
    };

    await this.appendEvent(event);
  }

  async appendEvent(event: TransitionEvent): Promise<void> {
    const logLine = JSON.stringify(event) + '\n';
    await writeFile(this.logPath, logLine, { flag: 'a' });
  }

  async readEventLog(): Promise<ReadonlyArray<TransitionEvent>> {
    try {
      const content = await readFile(this.logPath, 'utf8');
      const lines = content
        .trim()
        .split('\n')
        .filter((line) => line.length > 0);
      return lines
        .map((line) => {
          try {
            return JSON.parse(line) as TransitionEvent;
          } catch (error) {
            console.error(`Failed to parse event log line: ${line}`, error);
            return null;
          }
        })
        .filter((event): event is TransitionEvent => event !== null);
    } catch (error) {
      // File doesn't exist or is empty
      return [];
    }
  }

  async getTaskHistory(taskId: string): Promise<ReadonlyArray<TransitionEvent>> {
    const allEvents = await this.readEventLog();
    return allEvents.filter((event) => event.taskId === taskId);
  }

  async replayTaskTransitions(
    taskId: string,
    initialStatus: string,
  ): Promise<{
    readonly finalStatus: string;
    readonly isValid: boolean;
    readonly lastValidEvent?: TransitionEvent;
    readonly invalidEvent?: TransitionEvent;
    readonly events: ReadonlyArray<TransitionEvent>;
  }> {
    const taskEvents = await this.getTaskHistory(taskId);
    let currentStatus = initialStatus;
    let lastValidEvent: TransitionEvent | undefined;
    let invalidEvent: TransitionEvent | undefined;

    for (const event of taskEvents) {
      // Verify that the event's fromStatus matches our current state
      if (event.fromStatus !== currentStatus) {
        invalidEvent = event;
        return {
          finalStatus: currentStatus,
          isValid: false,
          lastValidEvent,
          invalidEvent,
          events: taskEvents,
        };
      }

      // Verify the transition is valid (this will be checked against transition rules)
      // For now, we assume all transitions in the log are potentially valid
      // The validation will happen when we check against the rules
      currentStatus = event.toStatus;
      lastValidEvent = event;
    }

    return {
      finalStatus: currentStatus,
      isValid: true,
      lastValidEvent,
      events: taskEvents,
    };
  }

  async getAllTaskHistories(): Promise<ReadonlyMap<string, ReadonlyArray<TransitionEvent>>> {
    const allEvents = await this.readEventLog();
    const histories = new Map<string, TransitionEvent[]>();

    for (const event of allEvents) {
      if (!histories.has(event.taskId)) {
        histories.set(event.taskId, []);
      }
      histories.get(event.taskId)!.push(event);
    }

    return histories;
  }

  async clearLog(): Promise<void> {
    await writeFile(this.logPath, '');
  }

  async getLogStats(): Promise<{
    readonly totalEvents: number;
    readonly uniqueTasks: number;
    readonly dateRange: { readonly earliest: string; readonly latest: string } | null;
  }> {
    const events = await this.readEventLog();

    if (events.length === 0) {
      return {
        totalEvents: 0,
        uniqueTasks: 0,
        dateRange: null,
      };
    }

    const taskIds = new Set(events.map((e) => e.taskId));
    const timestamps = events.map((e) => e.timestamp);

    return {
      totalEvents: events.length,
      uniqueTasks: taskIds.size,
      dateRange: {
        earliest: timestamps.reduce((a, b) => (a < b ? a : b)),
        latest: timestamps.reduce((a, b) => (a > b ? a : b)),
      },
    };
  }
}
