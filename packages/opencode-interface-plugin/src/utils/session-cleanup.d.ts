import type { SessionInfo } from '../types/SessionInfo.js';
export interface CleanupSessionInfo extends SessionInfo {
    createdAt?: string | number;
    time?: {
        created?: string;
        updated?: string;
    };
}
/**
 * Deduplicate sessions by keeping only most recent version of each session ID
 */
export declare function deduplicateSessions(sessions: CleanupSessionInfo[]): CleanupSessionInfo[];
//# sourceMappingURL=session-cleanup.d.ts.map