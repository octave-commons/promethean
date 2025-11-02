import type { SessionInfo } from '../types/SessionInfo.js';
import type { SessionData } from '../types/SessionData.js';
type AgentTask = {
    status: string;
    lastActivity: number;
    startTime: number;
};
declare const SessionUtils: {
    determineActivityStatus(_session: SessionData, messageCount: number, agentTask?: AgentTask): string;
    createSessionInfo(session: SessionData, messageCount: number, agentTask?: AgentTask): SessionInfo;
};
export { SessionUtils };
//# sourceMappingURL=SessionUtils.d.ts.map