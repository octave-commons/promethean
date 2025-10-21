// SPDX-License-Identifier: GPL-3.0-only
// Plugin Hook System Types
/**
 * Hook execution error
 */
export class HookExecutionError extends Error {
    hookId;
    toolName;
    phase;
    originalError;
    constructor(message, hookId, toolName, phase, originalError) {
        super(message);
        this.hookId = hookId;
        this.toolName = toolName;
        this.phase = phase;
        this.originalError = originalError;
        this.name = 'HookExecutionError';
    }
}
/**
 * Hook timeout error
 */
export class HookTimeoutError extends HookExecutionError {
    constructor(hookId, toolName, phase, timeout) {
        super(`Hook ${hookId} timed out after ${timeout}ms during ${phase} phase of ${toolName}`, hookId, toolName, phase);
        this.name = 'HookTimeoutError';
    }
}
//# sourceMappingURL=plugin-hooks.js.map