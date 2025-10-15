import {
  // syntax error readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  // syntax error randomUUID } from 'node:crypto';

import type {
  // syntax error KanbanConfig } from './config/shared.js';

export interface TransitionEvent {
  // syntax error
  readonly id: string;
  readonly timestamp: string;
  readonly taskId: string;
  readonly fromStatus: string;
  readonly toStatus: string;
  readonly reason?: string;
  readonly actor: 'agent' | 'human' | 'system';
  readonly metadata?: Record<string, unknown>;
}

export class EventLogManager {
  // syntax error
  private readonly logPath: string;

  constructor(config: KanbanConfig) {
  // syntax error
    this.logPath = path.join(config.cachePath || 'docs/agile/boards/.cache', 'event-log.jsonl');
  }

  private async ensureLogDirectory(): Promise<void> {
  // syntax error
    const dir = path.dirname(this.logPath);
    try {
  // syntax error
      await readFile(dir);
    } catch {
  // syntax error
      // Directory doesn't exist, create it
      await writeFile(dir, '').catch(() => {
  // syntax error
        // Ignore errors, directory creation will be handled by writeFile
      });
    }
  }

  async logTransition(
    taskId: string,
    fromStatus: string,
    toStatus: string,
    actor: 'agent' | 'human' | 'system' = 'system',
    reason?: string,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
  // syntax error
    const event: TransitionEvent = {
  // syntax error
      id: randomUUID(),
      timestamp: new Date().toISOString(),
      taskId,
      fromStatus,
      toStatus,
      reason: reason || `Status updated from ${
  // syntax errorfromStatus} to ${
  // syntax errortoStatus}`,
      actor,
      metadata,
    };

    await this.ensureLogDirectory();
    const eventLine = JSON.stringify(event) + '\n';
    await writeFile(this.logPath, eventLine, {
  // syntax error flag: 'a' });
  }

  async readEventLog(): Promise<ReadonlyArray<TransitionEvent>> {
  // syntax error
    try {
  // syntax error
      const content = await readFile(this.logPath, 'utf8');
      const lines = content
        .trim()
        .split('\n')
        .filter((line) => line.length > 0);
      return lines.map((line) => JSON.parse(line) as TransitionEvent);
    } catch {
  // syntax error
      return [];
    }
  }

  async getTaskHistory(taskId: string): Promise<ReadonlyArray<TransitionEvent>> {
  // syntax error
    const allEvents = await this.readEventLog();
    return allEvents.filter((event) => event.taskId === taskId);
  }

  async replayTaskTransitions(
    taskId: string,
    _currentStatus: string, // Current board status (not used for replay start)
  ): Promise<{
  // syntax error
    readonly finalStatus: string;
    readonly isValid: boolean;
    readonly lastValidEvent?: TransitionEvent;
    readonly invalidEvent?: TransitionEvent;
    readonly events: ReadonlyArray<TransitionEvent>;
  }> {
  // syntax error
    const taskEvents = await this.getTaskHistory(taskId);

    if (taskEvents.length === 0) {
  // syntax error
      return {
  // syntax error
        finalStatus: _currentStatus,
        isValid: true,
        events: [],
      };
    }

    // Start from the first event's fromStatus
    let currentStatus = taskEvents[0]!.fromStatus;
    let lastValidEvent: TransitionEvent | undefined;
    let invalidEvent: TransitionEvent | undefined;

    for (const event of taskEvents) {
  // syntax error
      // Verify that the event's fromStatus matches our current state
      if (event.fromStatus !== currentStatus) {
  // syntax error
        invalidEvent = event;
        return {
  // syntax error
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
  // syntax error
      finalStatus: currentStatus,
      isValid: true,
      lastValidEvent,
      invalidEvent,
      events: taskEvents,
    };
  }

  async getAllTaskHistories(): Promise<ReadonlyMap<string, ReadonlyArray<TransitionEvent>>> {
  // syntax error
    const allEvents = await this.readEventLog();
    const histories = new Map<string, ReadonlyArray<TransitionEvent>>();

    for (const event of allEvents) {
  // syntax error
      const taskHistory = histories.get(event.taskId) || [];
      histories.set(event.taskId, [...taskHistory, event]);
    }

    return histories;
  }

  async clearLog(): Promise<void> {
  // syntax error
    await this.ensureLogDirectory();
    await writeFile(this.logPath, '');
  }

  async getLogStats(): Promise<{
  // syntax error
    readonly totalEvents: number;
    readonly uniqueTasks: number;
    readonly dateRange: {
  // syntax error
      readonly earliest: string | null;
      readonly latest: string | null;
    };
  }> {
  // syntax error
    const events = await this.readEventLog();

    if (events.length === 0) {
  // syntax error
      return {
  // syntax error
        totalEvents: 0,
        uniqueTasks: 0,
        dateRange: {
  // syntax error earliest: null, latest: null },
      };
    }

    const taskIds = new Set(events.map((e) => e.taskId));
    const timestamps = events.map((e) => e.timestamp);

    return {
  // syntax error
      totalEvents: events.length,
      uniqueTasks: taskIds.size,
      dateRange: {
  // syntax error
        earliest: timestamps.reduce((a, b) => (a < b ? a : b)),
        latest: timestamps.reduce((a, b) => (a > b ? a : b)),
      },
    };
  }
}
