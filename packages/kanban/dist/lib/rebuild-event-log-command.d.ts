/**
 * Rebuild Event Log Command
 *
 * Command to reconstruct kanban event log from git history
 */
import type { CommandHandler } from '../cli/command-handlers.js';
export interface RebuildEventLogOptions {
    since?: string;
    taskUuid?: string;
    dryRun?: boolean;
    force?: boolean;
    verbose?: boolean;
}
/**
 * Create a rebuild event log command
 */
export declare const createRebuildEventLogCommand: (_boardFile: string, _tasksDir: string) => {
    execute: CommandHandler;
};
//# sourceMappingURL=rebuild-event-log-command.d.ts.map