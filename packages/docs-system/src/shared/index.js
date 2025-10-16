/**
 * Shared utilities and helper functions for the Promethean Documentation System
 */
import { z } from 'zod';
// ============================================================================
// Validation Schemas
// ============================================================================
export const systemConfigSchema = z.object({
    server: z.object({
        port: z.number().min(1).max(65535),
        host: z.string(),
        env: z.enum(['development', 'production', 'test']),
        cors: z.object({
            origin: z.array(z.string()),
            credentials: z.boolean(),
        }),
    }),
    database: z.object({
        url: z.string().url(),
        name: z.string(),
        options: z.object({
            maxPoolSize: z.number().min(1),
            minPoolSize: z.number().min(0),
            maxIdleTimeMS: z.number().min(1000),
        }),
    }),
    ollama: z.object({
        endpoint: z.string().url(),
        defaultModel: z.string(),
        timeout: z.number().min(1000),
        retryAttempts: z.number().min(0),
    }),
    auth: z.object({
        jwtSecret: z.string().min(32),
        jwtExpiration: z.string(),
        bcryptRounds: z.number().min(10).max(15),
    }),
    logging: z.object({
        level: z.enum(['error', 'warn', 'info', 'debug']),
        format: z.enum(['json', 'simple']),
        file: z.string().optional(),
    }),
});
export const paginationOptionsSchema = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
});
// ============================================================================
// Configuration Management
// ============================================================================
export class ConfigManager {
    static instance;
    config;
    constructor() {
        this.config = this.loadConfig();
    }
    static getInstance() {
        if (!ConfigManager.instance) {
            ConfigManager.instance = new ConfigManager();
        }
        return ConfigManager.instance;
    }
    loadConfig() {
        // Default configuration
        const rawConfig = {
            server: {
                port: parseInt(process.env.PORT || '3000'),
                host: process.env.HOST || 'localhost',
                env: process.env.NODE_ENV || 'development',
                cors: {
                    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
                    credentials: true,
                },
            },
            database: {
                url: process.env.DATABASE_URL || 'mongodb://localhost:27017',
                name: process.env.DATABASE_NAME || 'promethean_docs',
                options: {
                    maxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE || '10'),
                    minPoolSize: parseInt(process.env.DB_MIN_POOL_SIZE || '2'),
                    maxIdleTimeMS: parseInt(process.env.DB_MAX_IDLE_TIME || '30000'),
                },
            },
            ollama: {
                endpoint: process.env.OLLAMA_ENDPOINT || 'http://localhost:11434',
                defaultModel: process.env.OLLAMA_DEFAULT_MODEL || 'llama2',
                timeout: parseInt(process.env.OLLAMA_TIMEOUT || '30000'),
                retryAttempts: parseInt(process.env.OLLAMA_RETRY_ATTEMPTS || '3'),
            },
            auth: {
                jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
                jwtExpiration: process.env.JWT_EXPIRATION || '24h',
                bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12'),
            },
            logging: {
                level: process.env.LOG_LEVEL || 'info',
                format: process.env.LOG_FORMAT || 'json',
                file: process.env.LOG_FILE,
            },
        };
        // Validate configuration
        const result = systemConfigSchema.safeParse(rawConfig);
        if (!result.success) {
            throw new Error(`Invalid configuration: ${result.error.message}`);
        }
        return result.data;
    }
    getConfig() {
        return this.config;
    }
    updateConfig(updates) {
        this.config = systemConfigSchema.parse({ ...this.config, ...updates });
    }
    getServerConfig() {
        return this.config.server;
    }
    getDatabaseConfig() {
        return this.config.database;
    }
    getOllamaConfig() {
        return this.config.ollama;
    }
    getAuthConfig() {
        return this.config.auth;
    }
    getLoggingConfig() {
        return this.config.logging;
    }
}
// ============================================================================
// Response Utilities
// ============================================================================
export class ResponseHelper {
    static success(data, meta) {
        return {
            success: true,
            data,
            meta,
        };
    }
    static error(error, meta) {
        return {
            success: false,
            error: {
                code: error.code,
                message: error.message,
                details: error.details,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            },
            meta,
        };
    }
    static paginated(data, pagination, meta) {
        return {
            success: true,
            data,
            meta: {
                pagination: {
                    page: pagination.page,
                    limit: pagination.limit,
                    total: pagination.total,
                    totalPages: Math.ceil(pagination.total / pagination.limit),
                    hasNext: pagination.page * pagination.limit < pagination.total,
                    hasPrev: pagination.page > 1,
                },
                ...meta,
            },
        };
    }
}
// ============================================================================
// String Utilities
// ============================================================================
export class StringUtils {
    static slugify(text) {
        return text
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
    static truncate(text, length, suffix = '...') {
        if (text.length <= length)
            return text;
        return text.substring(0, length - suffix.length) + suffix;
    }
    static extractKeywords(text, limit = 10) {
        const words = text
            .toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter((word) => word.length > 3)
            .filter((word) => !this.isStopWord(word));
        const frequency = {};
        words.forEach((word) => {
            frequency[word] = (frequency[word] || 0) + 1;
        });
        return Object.entries(frequency)
            .sort(([, a], [, b]) => b - a)
            .slice(0, limit)
            .map(([word]) => word);
    }
    static isStopWord(word) {
        const stopWords = new Set([
            'the',
            'be',
            'to',
            'of',
            'and',
            'a',
            'in',
            'that',
            'have',
            'i',
            'it',
            'for',
            'not',
            'on',
            'with',
            'he',
            'as',
            'you',
            'do',
            'at',
            'this',
            'but',
            'his',
            'by',
            'from',
            'they',
            'we',
            'say',
            'her',
            'she',
            'or',
            'an',
            'will',
            'my',
            'one',
            'all',
            'would',
            'there',
            'their',
            'what',
            'so',
            'up',
            'out',
            'if',
            'about',
            'who',
            'get',
            'which',
            'go',
            'me',
            'when',
            'make',
            'can',
            'like',
            'time',
            'no',
            'just',
            'him',
            'know',
            'take',
            'people',
            'into',
            'year',
            'your',
            'good',
            'some',
            'could',
            'them',
            'see',
            'other',
            'than',
            'then',
            'now',
            'look',
            'only',
            'come',
            'its',
            'over',
            'think',
            'also',
            'back',
            'after',
            'use',
            'two',
            'how',
            'our',
            'work',
            'first',
            'well',
            'way',
            'even',
            'new',
            'want',
            'because',
            'any',
            'these',
            'give',
            'day',
            'most',
            'us',
            'is',
            'was',
            'are',
            'been',
            'has',
            'had',
            'were',
            'said',
            'did',
            'getting',
            'made',
            'find',
            'where',
            'much',
            'too',
            'very',
            'still',
            'being',
            'going',
            'why',
        ]);
        return stopWords.has(word);
    }
    static calculateReadingTime(text) {
        const wordsPerMinute = 200;
        const words = text.split(/\s+/).length;
        return Math.ceil(words / wordsPerMinute);
    }
    static sanitizeHtml(text) {
        return text
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
            .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
            .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+\s*=/gi, '');
    }
}
// ============================================================================
// Date Utilities
// ============================================================================
export class DateUtils {
    static isValid(date) {
        return date instanceof Date && !isNaN(date.getTime());
    }
    static now() {
        return new Date();
    }
    static addDays(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }
    static addHours(date, hours) {
        const result = new Date(date);
        result.setHours(result.getHours() + hours);
        return result;
    }
    static isExpired(date) {
        return date < new Date();
    }
    static format(date, format = 'iso') {
        switch (format) {
            case 'iso':
                return date.toISOString();
            case 'readable':
                return date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                });
            case 'timestamp':
                return date.getTime().toString();
            default:
                return date.toISOString();
        }
    }
    static getAge(date) {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const months = Math.floor(days / 30);
        const years = Math.floor(months / 12);
        if (years > 0)
            return `${years} year${years > 1 ? 's' : ''} ago`;
        if (months > 0)
            return `${months} month${months > 1 ? 's' : ''} ago`;
        if (days > 0)
            return `${days} day${days > 1 ? 's' : ''} ago`;
        if (hours > 0)
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (minutes > 0)
            return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        return 'just now';
    }
}
// ============================================================================
// Array Utilities
// ============================================================================
export class ArrayUtils {
    static chunk(array, size) {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }
    static unique(array) {
        return [...new Set(array)];
    }
    static shuffle(array) {
        const result = [...array];
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = result[i];
            result[i] = result[j];
            result[j] = temp;
        }
        return result;
    }
    static groupBy(array, key) {
        return array.reduce((groups, item) => {
            const groupKey = key(item);
            if (!groups[groupKey]) {
                groups[groupKey] = [];
            }
            groups[groupKey].push(item);
            return groups;
        }, {});
    }
    static sortBy(array, key, order = 'asc') {
        return [...array].sort((a, b) => {
            const aVal = typeof key === 'function' ? key(a) : a[key];
            const bVal = typeof key === 'function' ? key(b) : b[key];
            // Handle undefined values by treating them as null for comparison
            const aValForComparison = aVal === undefined ? null : aVal;
            const bValForComparison = bVal === undefined ? null : bVal;
            if (aValForComparison === null && bValForComparison === null)
                return 0;
            if (aValForComparison === null)
                return order === 'asc' ? -1 : 1;
            if (bValForComparison === null)
                return order === 'asc' ? 1 : -1;
            if (aValForComparison < bValForComparison)
                return order === 'asc' ? -1 : 1;
            if (aValForComparison > bValForComparison)
                return order === 'asc' ? 1 : -1;
            return 0;
        });
    }
}
// ============================================================================
// Async Utilities
// ============================================================================
export class AsyncUtils {
    static async delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
    static async timeout(promise, ms) {
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error(`Operation timed out after ${ms}ms`)), ms);
        });
        return Promise.race([promise, timeoutPromise]);
    }
    static async retry(fn, attempts = 3, delay = 1000) {
        let lastError;
        for (let i = 0; i < attempts; i++) {
            try {
                return await fn();
            }
            catch (error) {
                lastError = error;
                if (i < attempts - 1) {
                    await this.delay(delay * Math.pow(2, i)); // Exponential backoff
                }
            }
        }
        throw lastError;
    }
    static async parallel(tasks, concurrency = 5) {
        const results = [];
        const executing = [];
        for (const task of tasks) {
            const promise = task().then((result) => {
                results.push(result);
            });
            executing.push(promise);
            if (executing.length >= concurrency) {
                await Promise.race(executing);
                executing.splice(executing.findIndex((p) => p === promise), 1);
            }
        }
        await Promise.all(executing);
        return results;
    }
}
// ============================================================================
// Validation Utilities
// ============================================================================
export class ValidationUtils {
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    static isValidUrl(url) {
        try {
            new URL(url);
            return true;
        }
        catch {
            return false;
        }
    }
    static isValidPassword(password) {
        const errors = [];
        if (password.length < 8) {
            errors.push('Password must be at least 8 characters long');
        }
        if (!/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }
        if (!/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }
        if (!/\d/.test(password)) {
            errors.push('Password must contain at least one number');
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            errors.push('Password must contain at least one special character');
        }
        return {
            isValid: errors.length === 0,
            errors,
        };
    }
    static sanitizeString(str) {
        return str
            .trim()
            .replace(/[<>]/g, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+\s*=/gi, '');
    }
}
// ============================================================================
// Logger Utilities
// ============================================================================
export var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["ERROR"] = 0] = "ERROR";
    LogLevel[LogLevel["WARN"] = 1] = "WARN";
    LogLevel[LogLevel["INFO"] = 2] = "INFO";
    LogLevel[LogLevel["DEBUG"] = 3] = "DEBUG";
})(LogLevel || (LogLevel = {}));
export class Logger {
    static instance;
    logLevel;
    logs = [];
    maxLogs = 1000;
    constructor() {
        const config = ConfigManager.getInstance().getLoggingConfig();
        this.logLevel = LogLevel[config.level.toUpperCase()];
    }
    static getInstance() {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }
    log(level, message, context, error) {
        if (level > this.logLevel)
            return;
        const entry = {
            level,
            message,
            timestamp: new Date(),
            context,
            error,
        };
        this.logs.push(entry);
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }
        this.outputLog(entry);
    }
    outputLog(entry) {
        const config = ConfigManager.getInstance().getLoggingConfig();
        const levelName = LogLevel[entry.level];
        let logMessage = `[${entry.timestamp.toISOString()}] ${levelName}: ${entry.message}`;
        if (entry.context) {
            logMessage += ` ${JSON.stringify(entry.context)}`;
        }
        if (entry.error) {
            logMessage += `\n${entry.error.stack}`;
        }
        if (config.format === 'json') {
            console.log(JSON.stringify(entry));
        }
        else {
            console.log(logMessage);
        }
    }
    error(message, context, error) {
        this.log(LogLevel.ERROR, message, context, error);
    }
    warn(message, context) {
        this.log(LogLevel.WARN, message, context);
    }
    info(message, context) {
        this.log(LogLevel.INFO, message, context);
    }
    debug(message, context) {
        this.log(LogLevel.DEBUG, message, context);
    }
    getLogs(level) {
        if (level !== undefined) {
            return this.logs.filter((log) => log.level === level);
        }
        return [...this.logs];
    }
    clearLogs() {
        this.logs = [];
    }
}
// ============================================================================
// End of shared utilities
// ============================================================================
//# sourceMappingURL=index.js.map