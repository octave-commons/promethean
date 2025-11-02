// SPDX-License-Identifier: GPL-3.0-only
const SessionUtils = {
    determineActivityStatus(_session, messageCount, agentTask) {
        if (agentTask) {
            if (agentTask.status === 'running') {
                const recentActivity = Date.now() - agentTask.lastActivity < 5 * 60 * 1000;
                return recentActivity ? 'active' : 'waiting_for_input';
            }
            return agentTask.status;
        }
        if (messageCount < 10)
            return 'active';
        if (messageCount < 50)
            return 'waiting_for_input';
        return 'idle';
    },
    createSessionInfo(session, messageCount, agentTask) {
        const now = Date.now();
        const activityStatus = SessionUtils.determineActivityStatus(session, messageCount, agentTask);
        const sessionAge = agentTask ? Math.round((now - agentTask.startTime) / 1000) : 0;
        return {
            id: session.id,
            title: session.title || session.id,
            messageCount,
            lastActivityTime: new Date().toISOString(),
            sessionAge,
            activityStatus,
            isAgentTask: !!agentTask || session.isAgentTask === true,
            agentTaskStatus: agentTask?.status,
        };
    },
};
export { SessionUtils };
//# sourceMappingURL=SessionUtils.js.map