/**
 * User Registry Implementation
 *
 * Provides CRUD operations for user management with secure storage
 * following the project's functional programming style and security requirements.
 */
export type { User };
import type { User, CreateUserRequest, UpdateUserRequest, UserSearchFilters, UserSearchResult, CustomRole, CreateCustomRoleRequest, UserSession, UserActivityLog, UserStats, UserRegistryConfig, AuthMethod } from './models.js';
/**
 * User registry with persistent storage
 */
export declare class UserRegistry {
    private readonly config;
    private readonly usersPath;
    private readonly rolesPath;
    private readonly sessionsPath;
    private readonly activityPath;
    private users;
    private customRoles;
    private sessions;
    private activityLogs;
    private emailIndex;
    private providerIndex;
    constructor(config: UserRegistryConfig);
    /**
     * Initialize storage and load data
     */
    private initializeStorage;
    /**
     * Load data from storage
     */
    private loadData;
    /**
     * Save data to storage
     */
    private saveData;
    /**
     * Rebuild search indexes
     */
    private rebuildIndexes;
    /**
     * Read JSON file with error handling
     */
    private readJsonFile;
    /**
     * Write JSON file with atomic operation
     */
    private writeJsonFile;
    /**
     * Log user activity
     */
    private logActivity;
    /**
     * Create a new user
     */
    createUser(request: CreateUserRequest): Promise<User>;
    /**
     * Get user by ID
     */
    getUser(userId: string): Promise<User | null>;
    /**
     * Get user by email
     */
    getUserByEmail(email: string): Promise<User | null>;
    /**
     * Get user by provider ID
     */
    getUserByProvider(provider: string, providerUserId: string): Promise<User | null>;
    /**
     * Update user
     */
    updateUser(userId: string, request: UpdateUserRequest): Promise<User>;
    /**
     * Delete user
     */
    deleteUser(userId: string): Promise<boolean>;
    /**
     * Search users
     */
    searchUsers(filters: UserSearchFilters, page?: number, pageSize?: number): Promise<UserSearchResult>;
    /**
     * List all users (for admin purposes)
     */
    listUsers(): Promise<readonly User[]>;
    /**
     * Create custom role
     */
    createCustomRole(request: CreateCustomRoleRequest): Promise<CustomRole>;
    /**
     * Get custom role
     */
    getCustomRole(roleId: string): Promise<CustomRole | null>;
    /**
     * List custom roles
     */
    listCustomRoles(): Promise<readonly CustomRole[]>;
    /**
     * Delete custom role
     */
    deleteCustomRole(roleId: string): Promise<boolean>;
    /**
     * Create user session
     */
    createSession(userId: string, authMethod: AuthMethod, provider?: string, ipAddress?: string, userAgent?: string): Promise<UserSession>;
    /**
     * Get session
     */
    getSession(sessionId: string): Promise<UserSession | null>;
    /**
     * Get user sessions
     */
    getUserSessions(userId: string): readonly UserSession[];
    /**
     * Revoke session
     */
    revokeSession(sessionId: string): Promise<boolean>;
    /**
     * Revoke all user sessions
     */
    revokeUserSessions(userId: string): Promise<number>;
    /**
     * Update user last login
     */
    updateLastLogin(userId: string): Promise<void>;
    /**
     * Get user statistics
     */
    getUserStats(): Promise<UserStats>;
    /**
     * Get user activity logs
     */
    getUserActivityLogs(userId: string, limit?: number): Promise<readonly UserActivityLog[]>;
    /**
     * Cleanup expired sessions
     */
    cleanupExpiredSessions(): Promise<number>;
    /**
     * Get registry statistics
     */
    getRegistryStats(): {
        totalUsers: number;
        totalSessions: number;
        totalCustomRoles: number;
        totalActivityLogs: number;
    };
}
//# sourceMappingURL=registry.d.ts.map