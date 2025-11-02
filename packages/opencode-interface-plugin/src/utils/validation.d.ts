/**
 * Validation utilities for plugin inputs
 */
export declare const validate: {
    /**
     * Validate a string parameter
     */
    string: (value: unknown, paramName: string) => string;
    /**
     * Validate an optional string parameter
     */
    optionalString: (value: unknown, paramName: string) => string | undefined;
    /**
     * Validate a number parameter
     */
    number: (value: unknown, paramName: string) => number;
    /**
     * Validate an optional number parameter with default
     */
    optionalNumber: (value: unknown, paramName: string, defaultValue?: number) => number | undefined;
    /**
     * Validate a boolean parameter
     */
    boolean: (value: unknown, paramName: string) => boolean;
    /**
     * Validate an optional boolean parameter with default
     */
    optionalBoolean: (value: unknown, paramName: string, defaultValue: boolean) => boolean;
    /**
     * Validate a session ID format
     */
    sessionId: (value: unknown) => string;
    /**
     * Validate search query
     */
    searchQuery: (value: unknown) => string;
    /**
     * Validate limit parameter with reasonable bounds
     */
    limit: (value: unknown, defaultLimit?: number) => number;
};
//# sourceMappingURL=validation.d.ts.map