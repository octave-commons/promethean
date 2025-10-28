import { readEventLog } from './file-operations.js';
export const getLogStats = async (logPath) => {
    const events = await readEventLog(logPath);
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
};
//# sourceMappingURL=stats.js.map