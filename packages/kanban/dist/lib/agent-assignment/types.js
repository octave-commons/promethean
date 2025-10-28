/**
 * Agent Task Assignment System Types
 *
 * This module defines the core types for the agent task assignment system,
 * which integrates agent instances with the kanban board for intelligent workload distribution.
 */
// Error Types
export class AssignmentError extends Error {
    code;
    details;
    constructor(message, code, details) {
        super(message);
        this.code = code;
        this.details = details;
        this.name = 'AssignmentError';
    }
}
export class CapabilityError extends AssignmentError {
    constructor(message, details) {
        super(message, 'CAPABILITY_ERROR', details);
    }
}
export class WorkloadError extends AssignmentError {
    constructor(message, details) {
        super(message, 'WORKLOAD_ERROR', details);
    }
}
export class ConstraintError extends AssignmentError {
    constructor(message, details) {
        super(message, 'CONSTRAINT_ERROR', details);
    }
}
//# sourceMappingURL=types.js.map