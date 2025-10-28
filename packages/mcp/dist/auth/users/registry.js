/**
 * User Registry Implementation
 *
 * Provides CRUD operations for user management with secure storage
 * following the project's functional programming style and security requirements.
 */
import crypto from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
/**
 * User registry with persistent storage
 */
export class UserRegistry {
    config;
    usersPath;
    rolesPath;
    sessionsPath;
    activityPath;
    // In-memory caches
    users = new Map();
    customRoles = new Map();
    sessions = new Map();
    activityLogs = [];
    // Search indexes
    emailIndex = new Map(); // email -> userId
    providerIndex = new Map(); // provider:providerUserId -> userId
    constructor(config) {
        this.config = config;
        // Set up file paths
        this.usersPath = path.join(config.storagePath, 'users.json');
        this.rolesPath = path.join(config.storagePath, 'roles.json');
        this.sessionsPath = path.join(config.storagePath, 'sessions.json');
        this.activityPath = path.join(config.storagePath, 'activity.json');
        // Initialize storage
        this.initializeStorage();
    }
    /**
     * Initialize storage and load data
     */
    async initializeStorage() {
        try {
            await fs.mkdir(this.config.storagePath, { recursive: true });
            await this.loadData();
            this.rebuildIndexes();
        }
        catch (error) {
            console.error('[UserRegistry] Failed to initialize storage:', error);
            throw new Error('User registry initialization failed');
        }
    }
    /**
     * Load data from storage
     */
    async loadData() {
        try {
            // Load users
            const usersData = await this.readJsonFile(this.usersPath, []);
            this.users = new Map(usersData.map((user) => [user.id, user]));
            // Load custom roles
            const rolesData = await this.readJsonFile(this.rolesPath, []);
            this.customRoles = new Map(rolesData.map((role) => [role.id, role]));
            // Load sessions
            const sessionsData = await this.readJsonFile(this.sessionsPath, []);
            this.sessions = new Map(sessionsData.map((session) => [session.sessionId, session]));
            // Load activity logs
            this.activityLogs = await this.readJsonFile(this.activityPath, []);
        }
        catch (error) {
            console.warn('[UserRegistry] Failed to load data, starting with empty storage:', error);
        }
    }
    /**
     * Save data to storage
     */
    async saveData() {
        try {
            await Promise.all([
                this.writeJsonFile(this.usersPath, Array.from(this.users.values())),
                this.writeJsonFile(this.rolesPath, Array.from(this.customRoles.values())),
                this.writeJsonFile(this.sessionsPath, Array.from(this.sessions.values())),
                this.writeJsonFile(this.activityPath, this.activityLogs),
            ]);
        }
        catch (error) {
            console.error('[UserRegistry] Failed to save data:', error);
            throw new Error('Failed to save user registry data');
        }
    }
    /**
     * Rebuild search indexes
     */
    rebuildIndexes() {
        this.emailIndex.clear();
        this.providerIndex.clear();
        for (const user of this.users.values()) {
            if (user.email) {
                this.emailIndex.set(user.email.toLowerCase(), user.id);
            }
            if (user.provider && user.providerUserId) {
                this.providerIndex.set(`${user.provider}:${user.providerUserId}`, user.id);
            }
        }
    }
    /**
     * Read JSON file with error handling
     */
    async readJsonFile(filePath, defaultValue) {
        try {
            const data = await fs.readFile(filePath, 'utf-8');
            return JSON.parse(data);
        }
        catch (error) {
            if (error.code === 'ENOENT') {
                return defaultValue;
            }
            throw error;
        }
    }
    /**
     * Write JSON file with atomic operation
     */
    async writeJsonFile(filePath, data) {
        const tempPath = `${filePath}.tmp.${Date.now()}`;
        const jsonData = JSON.stringify(data, null, 2);
        await fs.writeFile(tempPath, jsonData, 'utf-8');
        await fs.rename(tempPath, filePath);
    }
    /**
     * Log user activity
     */
    async logActivity(userId, action, resource, details, ipAddress, userAgent) {
        if (!this.config.enableActivityLogging) {
            return;
        }
        const logEntry = {
            id: crypto.randomUUID(),
            userId,
            action,
            resource,
            details,
            ipAddress,
            userAgent,
            timestamp: new Date(),
            metadata: {},
        };
        this.activityLogs.push(logEntry);
        // Keep only last 10000 log entries
        if (this.activityLogs.length > 10000) {
            this.activityLogs = this.activityLogs.slice(-10000);
        }
        // Save asynchronously
        this.writeJsonFile(this.activityPath, this.activityLogs).catch((error) => {
            console.warn('[UserRegistry] Failed to save activity log:', error);
        });
    }
    /**
     * Create a new user
     */
    async createUser(request) {
        const userId = crypto.randomUUID();
        const now = new Date();
        // Check for existing user with same email
        if (request.email) {
            const existingUserId = this.emailIndex.get(request.email.toLowerCase());
            if (existingUserId) {
                throw new Error(`User with email ${request.email} already exists`);
            }
        }
        // Check for existing user with same provider ID
        if (request.provider && request.providerUserId) {
            const providerKey = `${request.provider}:${request.providerUserId}`;
            const existingUserId = this.providerIndex.get(providerKey);
            if (existingUserId) {
                throw new Error(`User with ${request.provider} ID ${request.providerUserId} already exists`);
            }
        }
        const user = {
            id: userId,
            username: request.username,
            email: request.email,
            name: request.name,
            role: request.role,
            status: this.config.autoActivateUsers ? 'active' : 'pending',
            authMethod: request.authMethod,
            provider: request.provider,
            providerUserId: request.providerUserId,
            permissions: request.permissions || [],
            customRoles: request.customRoles || [],
            createdAt: now,
            updatedAt: now,
            metadata: request.metadata || {},
        };
        // Store user
        this.users.set(userId, user);
        // Update indexes
        if (user.email) {
            this.emailIndex.set(user.email.toLowerCase(), userId);
        }
        if (user.provider && user.providerUserId) {
            this.providerIndex.set(`${user.provider}:${user.providerUserId}`, userId);
        }
        // Save and log
        await this.saveData();
        await this.logActivity(userId, 'user_created', 'user', { request });
        return user;
    }
    /**
     * Get user by ID
     */
    async getUser(userId) {
        return this.users.get(userId) || null;
    }
    /**
     * Get user by email
     */
    async getUserByEmail(email) {
        const userId = this.emailIndex.get(email.toLowerCase());
        return userId ? this.users.get(userId) || null : null;
    }
    /**
     * Get user by provider ID
     */
    async getUserByProvider(provider, providerUserId) {
        const userId = this.providerIndex.get(`${provider}:${providerUserId}`);
        return userId ? this.users.get(userId) || null : null;
    }
    /**
     * Update user
     */
    async updateUser(userId, request) {
        const existingUser = this.users.get(userId);
        if (!existingUser) {
            throw new Error(`User not found: ${userId}`);
        }
        // Check email uniqueness if changing email
        if (request.email && request.email !== existingUser.email) {
            const existingUserId = this.emailIndex.get(request.email.toLowerCase());
            if (existingUserId && existingUserId !== userId) {
                throw new Error(`User with email ${request.email} already exists`);
            }
        }
        // Update user
        const updatedUser = {
            ...existingUser,
            ...request,
            id: userId, // Preserve ID
            updatedAt: new Date(),
        };
        // Update indexes if email changed
        if (request.email && request.email !== existingUser.email) {
            if (existingUser.email) {
                this.emailIndex.delete(existingUser.email.toLowerCase());
            }
            this.emailIndex.set(request.email.toLowerCase(), userId);
        }
        this.users.set(userId, updatedUser);
        await this.saveData();
        await this.logActivity(userId, 'user_updated', 'user', { request });
        return updatedUser;
    }
    /**
     * Delete user
     */
    async deleteUser(userId) {
        const user = this.users.get(userId);
        if (!user) {
            return false;
        }
        // Remove from storage
        this.users.delete(userId);
        // Update indexes
        if (user.email) {
            this.emailIndex.delete(user.email.toLowerCase());
        }
        if (user.provider && user.providerUserId) {
            this.providerIndex.delete(`${user.provider}:${user.providerUserId}`);
        }
        // Revoke all sessions
        const userSessions = this.getUserSessions(userId);
        for (const session of userSessions) {
            this.sessions.delete(session.sessionId);
        }
        await this.saveData();
        await this.logActivity(userId, 'user_deleted', 'user', { username: user.username });
        return true;
    }
    /**
     * Search users
     */
    async searchUsers(filters, page = 1, pageSize = 50) {
        let filteredUsers = Array.from(this.users.values());
        // Apply filters
        if (filters.status) {
            filteredUsers = filteredUsers.filter((user) => user.status === filters.status);
        }
        if (filters.role) {
            filteredUsers = filteredUsers.filter((user) => user.role === filters.role);
        }
        if (filters.authMethod) {
            filteredUsers = filteredUsers.filter((user) => user.authMethod === filters.authMethod);
        }
        if (filters.provider) {
            filteredUsers = filteredUsers.filter((user) => user.provider === filters.provider);
        }
        if (filters.createdAfter) {
            filteredUsers = filteredUsers.filter((user) => user.createdAt >= filters.createdAfter);
        }
        if (filters.createdBefore) {
            filteredUsers = filteredUsers.filter((user) => user.createdAt <= filters.createdBefore);
        }
        if (filters.lastLoginAfter) {
            filteredUsers = filteredUsers.filter((user) => user.lastLoginAt && user.lastLoginAt >= filters.lastLoginAfter);
        }
        if (filters.lastLoginBefore) {
            filteredUsers = filteredUsers.filter((user) => user.lastLoginAt && user.lastLoginAt <= filters.lastLoginBefore);
        }
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filteredUsers = filteredUsers.filter((user) => user.username.toLowerCase().includes(searchLower) ||
                (user.email && user.email.toLowerCase().includes(searchLower)) ||
                (user.name && user.name.toLowerCase().includes(searchLower)));
        }
        // Sort by creation date (newest first)
        filteredUsers.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        // Pagination
        const total = filteredUsers.length;
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const users = filteredUsers.slice(startIndex, endIndex);
        return {
            users,
            total,
            page,
            pageSize,
            hasNext: endIndex < total,
            hasPrevious: page > 1,
        };
    }
    /**
     * List all users (for admin purposes)
     */
    async listUsers() {
        return Array.from(this.users.values());
    }
    /**
     * Create custom role
     */
    async createCustomRole(request) {
        const roleId = crypto.randomUUID();
        const now = new Date();
        const role = {
            id: roleId,
            name: request.name,
            description: request.description,
            permissions: request.permissions,
            inherits: request.inherits || [],
            createdAt: now,
            updatedAt: now,
            metadata: request.metadata || {},
        };
        this.customRoles.set(roleId, role);
        await this.saveData();
        return role;
    }
    /**
     * Get custom role
     */
    async getCustomRole(roleId) {
        return this.customRoles.get(roleId) || null;
    }
    /**
     * List custom roles
     */
    async listCustomRoles() {
        return Array.from(this.customRoles.values());
    }
    /**
     * Delete custom role
     */
    async deleteCustomRole(roleId) {
        const deleted = this.customRoles.delete(roleId);
        if (deleted) {
            await this.saveData();
        }
        return deleted;
    }
    /**
     * Create user session
     */
    async createSession(userId, authMethod, provider, ipAddress, userAgent) {
        const sessionId = crypto.randomUUID();
        const now = new Date();
        const expiresAt = new Date(now.getTime() + this.config.sessionTimeout * 1000);
        // Check session limit
        const userSessions = this.getUserSessions(userId);
        if (userSessions.length >= this.config.maxSessionsPerUser) {
            // Remove oldest session
            const oldestSession = userSessions[0];
            if (oldestSession) {
                this.sessions.delete(oldestSession.sessionId);
            }
        }
        const session = {
            sessionId,
            userId,
            authMethod,
            provider,
            ipAddress,
            userAgent,
            createdAt: now,
            lastAccessAt: now,
            expiresAt,
            metadata: {},
        };
        this.sessions.set(sessionId, session);
        await this.saveData();
        await this.logActivity(userId, 'session_created', 'session', { authMethod, provider });
        return session;
    }
    /**
     * Get session
     */
    async getSession(sessionId) {
        const session = this.sessions.get(sessionId);
        if (!session) {
            return null;
        }
        // Check if session is expired
        if (Date.now() >= session.expiresAt.getTime()) {
            this.sessions.delete(sessionId);
            return null;
        }
        // Update last access time
        const updatedSession = {
            ...session,
            lastAccessAt: new Date(),
        };
        this.sessions.set(sessionId, updatedSession);
        return updatedSession;
    }
    /**
     * Get user sessions
     */
    getUserSessions(userId) {
        return Array.from(this.sessions.values())
            .filter((session) => session.userId === userId)
            .filter((session) => Date.now() < session.expiresAt.getTime())
            .sort((a, b) => b.lastAccessAt.getTime() - a.lastAccessAt.getTime());
    }
    /**
     * Revoke session
     */
    async revokeSession(sessionId) {
        const session = this.sessions.get(sessionId);
        if (!session) {
            return false;
        }
        this.sessions.delete(sessionId);
        await this.saveData();
        await this.logActivity(session.userId, 'session_revoked', 'session', { sessionId });
        return true;
    }
    /**
     * Revoke all user sessions
     */
    async revokeUserSessions(userId) {
        const userSessions = this.getUserSessions(userId);
        let revokedCount = 0;
        for (const session of userSessions) {
            if (this.sessions.delete(session.sessionId)) {
                revokedCount++;
            }
        }
        if (revokedCount > 0) {
            await this.saveData();
            await this.logActivity(userId, 'sessions_revoked', 'session', { count: revokedCount });
        }
        return revokedCount;
    }
    /**
     * Update user last login
     */
    async updateLastLogin(userId) {
        const user = this.users.get(userId);
        if (user) {
            const updatedUser = {
                ...user,
                lastLoginAt: new Date(),
                updatedAt: new Date(),
            };
            this.users.set(userId, updatedUser);
            await this.saveData();
            await this.logActivity(userId, 'user_login', 'auth');
        }
    }
    /**
     * Get user statistics
     */
    async getUserStats() {
        const users = Array.from(this.users.values());
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const usersByRole = {
            guest: 0,
            user: 0,
            developer: 0,
            admin: 0,
        };
        const usersByAuthMethod = {
            oauth: 0,
            api_key: 0,
            environment: 0,
            ldap: 0,
        };
        const usersByProvider = {};
        let activeUsers = 0;
        let recentLogins = 0;
        let newUsers = 0;
        for (const user of users) {
            // Count by role
            usersByRole[user.role]++;
            // Count by auth method
            usersByAuthMethod[user.authMethod]++;
            // Count by provider
            if (user.provider) {
                usersByProvider[user.provider] = (usersByProvider[user.provider] || 0) + 1;
            }
            // Count active users
            if (user.status === 'active') {
                activeUsers++;
            }
            // Count recent logins
            if (user.lastLoginAt && user.lastLoginAt >= oneDayAgo) {
                recentLogins++;
            }
            // Count new users
            if (user.createdAt >= thirtyDaysAgo) {
                newUsers++;
            }
        }
        return {
            totalUsers: users.length,
            activeUsers,
            usersByRole,
            usersByAuthMethod,
            usersByProvider,
            recentLogins,
            newUsers,
        };
    }
    /**
     * Get user activity logs
     */
    async getUserActivityLogs(userId, limit = 100) {
        return this.activityLogs
            .filter((log) => log.userId === userId)
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, limit);
    }
    /**
     * Cleanup expired sessions
     */
    async cleanupExpiredSessions() {
        const now = Date.now();
        let cleanedCount = 0;
        for (const [sessionId, session] of this.sessions.entries()) {
            if (now >= session.expiresAt.getTime()) {
                this.sessions.delete(sessionId);
                cleanedCount++;
            }
        }
        if (cleanedCount > 0) {
            await this.saveData();
        }
        return cleanedCount;
    }
    /**
     * Get registry statistics
     */
    getRegistryStats() {
        return {
            totalUsers: this.users.size,
            totalSessions: this.sessions.size,
            totalCustomRoles: this.customRoles.size,
            totalActivityLogs: this.activityLogs.length,
        };
    }
}
//# sourceMappingURL=registry.js.map