import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
export class EventLogManager {
    constructor(config) {
        this.logPath = path.join(config.cachePath || 'docs/agile/boards/.cache', 'event-log.jsonl');
    }
    async ensureLogDirectory() {
        const dir = path.dirname(this.logPath);
        try {
            await readFile(dir);
        }
        catch {
            // Directory doesn't exist, create it
            await writeFile(dir, '').catch(() => {
                // Ignore errors, directory creation will be handled by writeFile
            });
        }
    }
    async logTransition(taskId, fromStatus, toStatus, actor = 'system', reason, metadata) {
        const event = {
            id: randomUUID(),
            timestamp: new Date().toISOString(),
            taskId,
            fromStatus,
            toStatus,
            reason: reason || `Status updated from ${fromStatus} to ${toStatus}`,
            actor,
            metadata,
        };
        await this.ensureLogDirectory();
        const eventLine = JSON.stringify(event) + '\n';
        await writeFile(this.logPath, eventLine, { flag: 'a' });
    }
    async readEventLog() {
        try {
            const content = await readFile(this.logPath, 'utf8');
            const lines = content
                .trim()
                .split('\n')
                .filter((line) => line.length > 0);
            return lines.map((line) => JSON.parse(line));
        }
        catch {
            return [];
        }
    }
    async getTaskHistory(taskId) {
        const allEvents = await this.readEventLog();
        return allEvents.filter((event) => event.taskId === taskId);
    }
    async replayTaskTransitions(taskId, _currentStatus) {
        const taskEvents = await this.getTaskHistory(taskId);
        if (taskEvents.length === 0) {
            return {
                finalStatus: _currentStatus,
                isValid: true,
                events: [],
            };
        }
        // Start from the first event's fromStatus
        let currentStatus = taskEvents[0].fromStatus;
        let lastValidEvent;
        let invalidEvent;
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
            invalidEvent,
            events: taskEvents,
        };
    }
    async getAllTaskHistories() {
        const allEvents = await this.readEventLog();
        const histories = new Map();
        for (const event of allEvents) {
            const taskHistory = histories.get(event.taskId) || [];
            histories.set(event.taskId, [...taskHistory, event]);
        }
        return histories;
    }
    async clearLog() {
        await this.ensureLogDirectory();
        await writeFile(this.logPath, '');
    }
    async getLogStats() {
        const events = await this.readEventLog();
        if (events.length === 0) {
            return {
                totalEvents: 0,
                uniqueTasks: 0,
                dateRange: { earliest: null, latest: null },
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
