import { readEventLog } from './file-operations.js';
export const getTaskHistory = async (logPath, taskId) => {
    const allEvents = await readEventLog(logPath);
    return allEvents.filter((event) => event.taskId === taskId);
};
export const replayTaskTransitions = async (logPath, taskId, currentStatus) => {
    const taskEvents = await getTaskHistory(logPath, taskId);
    if (taskEvents.length === 0) {
        return {
            finalStatus: currentStatus,
            isValid: true,
            events: [],
        };
    }
    // Start from first event's fromStatus
    // eslint-disable-next-line functional/no-let
    let status = taskEvents[0].fromStatus;
    // eslint-disable-next-line functional/no-let
    let lastValidEvent;
    // eslint-disable-next-line functional/no-let
    let invalidEvent;
    for (const event of taskEvents) {
        // Verify that event's fromStatus matches our current state
        if (event.fromStatus !== status) {
            invalidEvent = event;
            return {
                finalStatus: status,
                isValid: false,
                lastValidEvent,
                invalidEvent,
                events: taskEvents,
            };
        }
        // Update current status
        status = event.toStatus;
        lastValidEvent = event;
    }
    return {
        finalStatus: status,
        isValid: true,
        lastValidEvent,
        invalidEvent,
        events: taskEvents,
    };
};
export const getAllTaskHistories = async (logPath) => {
    const allEvents = await readEventLog(logPath);
    const histories = new Map();
    for (const event of allEvents) {
        const taskHistory = histories.get(event.taskId) || [];
        histories.set(event.taskId, [...taskHistory, event]);
    }
    return histories;
};
//# sourceMappingURL=task-history.js.map