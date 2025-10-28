/**
 * Error types for semantic store operations
 */
export class SemanticStoreError extends Error {
    context;
    constructor(message, context) {
        super(message);
        this.context = context;
        this.name = 'SemanticStoreError';
    }
}
//# sourceMappingURL=interfaces.js.map