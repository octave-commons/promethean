import { makeLogPath, ensureLogDirectory, readEventLog, writeEvent, clearLog, } from './file-operations.js';
import { createTransitionEvent } from './event-creator.js';
import { getTaskHistory, replayTaskTransitions, getAllTaskHistories } from './task-history.js';
import { getLogStats } from './stats.js';
export const makeEventLogManager = (config) => {
    const logPath = makeLogPath(config);
    const logTransition = async (taskId, fromStatus, toStatus, options = {}) => {
        const event = createTransitionEvent(taskId, fromStatus, toStatus, options);
        await ensureLogDirectory(logPath);
        await writeEvent(logPath, event);
    };
    return {
        logTransition,
        readEventLog: () => readEventLog(logPath),
        getTaskHistory: (taskId) => getTaskHistory(logPath, taskId),
        replayTaskTransitions: (taskId, currentStatus) => replayTaskTransitions(logPath, taskId, currentStatus),
        getAllTaskHistories: () => getAllTaskHistories(logPath),
        clearLog: () => clearLog(logPath),
        getLogStats: () => getLogStats(logPath),
    };
};
//# sourceMappingURL=index.js.map