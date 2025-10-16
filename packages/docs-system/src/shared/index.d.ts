/**
 * Shared utilities and helper functions for the Promethean Documentation System
 */
import { z } from 'zod';
import type { SystemConfig, ApiResponse, DeepPartial, DocsSystemError } from '../types/index.js';
export declare const systemConfigSchema: z.ZodObject<{
    server: z.ZodObject<{
        port: z.ZodNumber;
        host: z.ZodString;
        env: z.ZodEnum<["development", "production", "test"]>;
        cors: z.ZodObject<{
            origin: z.ZodArray<z.ZodString, "many">;
            credentials: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            origin: string[];
            credentials: boolean;
        }, {
            origin: string[];
            credentials: boolean;
        }>;
    }, "strip", z.ZodTypeAny, {
        port: number;
        host: string;
        env: "development" | "production" | "test";
        cors: {
            origin: string[];
            credentials: boolean;
        };
    }, {
        port: number;
        host: string;
        env: "development" | "production" | "test";
        cors: {
            origin: string[];
            credentials: boolean;
        };
    }>;
    database: z.ZodObject<{
        url: z.ZodString;
        name: z.ZodString;
        options: z.ZodObject<{
            maxPoolSize: z.ZodNumber;
            minPoolSize: z.ZodNumber;
            maxIdleTimeMS: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            maxPoolSize: number;
            minPoolSize: number;
            maxIdleTimeMS: number;
        }, {
            maxPoolSize: number;
            minPoolSize: number;
            maxIdleTimeMS: number;
        }>;
    }, "strip", z.ZodTypeAny, {
        options: {
            maxPoolSize: number;
            minPoolSize: number;
            maxIdleTimeMS: number;
        };
        url: string;
        name: string;
    }, {
        options: {
            maxPoolSize: number;
            minPoolSize: number;
            maxIdleTimeMS: number;
        };
        url: string;
        name: string;
    }>;
    ollama: z.ZodObject<{
        endpoint: z.ZodString;
        defaultModel: z.ZodString;
        timeout: z.ZodNumber;
        retryAttempts: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        timeout: number;
        endpoint: string;
        defaultModel: string;
        retryAttempts: number;
    }, {
        timeout: number;
        endpoint: string;
        defaultModel: string;
        retryAttempts: number;
    }>;
    auth: z.ZodObject<{
        jwtSecret: z.ZodString;
        jwtExpiration: z.ZodString;
        bcryptRounds: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        jwtSecret: string;
        jwtExpiration: string;
        bcryptRounds: number;
    }, {
        jwtSecret: string;
        jwtExpiration: string;
        bcryptRounds: number;
    }>;
    logging: z.ZodObject<{
        level: z.ZodEnum<["error", "warn", "info", "debug"]>;
        format: z.ZodEnum<["json", "simple"]>;
        file: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        level: "error" | "warn" | "info" | "debug";
        format: "json" | "simple";
        file?: string | undefined;
    }, {
        level: "error" | "warn" | "info" | "debug";
        format: "json" | "simple";
        file?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    server: {
        port: number;
        host: string;
        env: "development" | "production" | "test";
        cors: {
            origin: string[];
            credentials: boolean;
        };
    };
    database: {
        options: {
            maxPoolSize: number;
            minPoolSize: number;
            maxIdleTimeMS: number;
        };
        url: string;
        name: string;
    };
    ollama: {
        timeout: number;
        endpoint: string;
        defaultModel: string;
        retryAttempts: number;
    };
    auth: {
        jwtSecret: string;
        jwtExpiration: string;
        bcryptRounds: number;
    };
    logging: {
        level: "error" | "warn" | "info" | "debug";
        format: "json" | "simple";
        file?: string | undefined;
    };
}, {
    server: {
        port: number;
        host: string;
        env: "development" | "production" | "test";
        cors: {
            origin: string[];
            credentials: boolean;
        };
    };
    database: {
        options: {
            maxPoolSize: number;
            minPoolSize: number;
            maxIdleTimeMS: number;
        };
        url: string;
        name: string;
    };
    ollama: {
        timeout: number;
        endpoint: string;
        defaultModel: string;
        retryAttempts: number;
    };
    auth: {
        jwtSecret: string;
        jwtExpiration: string;
        bcryptRounds: number;
    };
    logging: {
        level: "error" | "warn" | "info" | "debug";
        format: "json" | "simple";
        file?: string | undefined;
    };
}>;
export declare const paginationOptionsSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    sortBy: z.ZodOptional<z.ZodString>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    sortOrder: "asc" | "desc";
    sortBy?: string | undefined;
}, {
    page?: number | undefined;
    limit?: number | undefined;
    sortBy?: string | undefined;
    sortOrder?: "asc" | "desc" | undefined;
}>;
export declare class ConfigManager {
    private static instance;
    private config;
    private constructor();
    static getInstance(): ConfigManager;
    private loadConfig;
    getConfig(): SystemConfig;
    updateConfig(updates: DeepPartial<SystemConfig>): void;
    getServerConfig(): {
        port: number;
        host: string;
        env: "development" | "production" | "test";
        cors: {
            origin: string[];
            credentials: boolean;
        };
    };
    getDatabaseConfig(): {
        url: string;
        name: string;
        options: {
            maxPoolSize: number;
            minPoolSize: number;
            maxIdleTimeMS: number;
        };
    };
    getOllamaConfig(): {
        endpoint: string;
        defaultModel: string;
        timeout: number;
        retryAttempts: number;
    };
    getAuthConfig(): {
        jwtSecret: string;
        jwtExpiration: string;
        bcryptRounds: number;
    };
    getLoggingConfig(): {
        level: "error" | "warn" | "info" | "debug";
        format: "json" | "simple";
        file?: string;
    };
}
export declare class ResponseHelper {
    static success<T>(data: T, meta?: any): ApiResponse<T>;
    static error(error: DocsSystemError, meta?: any): ApiResponse;
    static paginated<T>(data: T[], pagination: {
        page: number;
        limit: number;
        total: number;
    }, meta?: any): ApiResponse<T[]>;
}
export declare class StringUtils {
    static slugify(text: string): string;
    static truncate(text: string, length: number, suffix?: string): string;
    static extractKeywords(text: string, limit?: number): string[];
    private static isStopWord;
    static calculateReadingTime(text: string): number;
    static sanitizeHtml(text: string): string;
}
export declare class DateUtils {
    static isValid(date: any): date is Date;
    static now(): Date;
    static addDays(date: Date, days: number): Date;
    static addHours(date: Date, hours: number): Date;
    static isExpired(date: Date): boolean;
    static format(date: Date, format?: 'iso' | 'readable' | 'timestamp'): string;
    static getAge(date: Date): string;
}
export declare class ArrayUtils {
    static chunk<T>(array: T[], size: number): T[][];
    static unique<T>(array: T[]): T[];
    static shuffle<T>(array: T[]): T[];
    static groupBy<T, K extends keyof any>(array: T[], key: (item: T) => K): Record<K, T[]>;
    static sortBy<T>(array: T[], key: keyof T | ((item: T) => any), order?: 'asc' | 'desc'): T[];
}
export declare class AsyncUtils {
    static delay(ms: number): Promise<void>;
    static timeout<T>(promise: Promise<T>, ms: number): Promise<T>;
    static retry<T>(fn: () => Promise<T>, attempts?: number, delay?: number): Promise<T>;
    static parallel<T>(tasks: (() => Promise<T>)[], concurrency?: number): Promise<T[]>;
}
export declare class ValidationUtils {
    static isValidEmail(email: string): boolean;
    static isValidUrl(url: string): boolean;
    static isValidPassword(password: string): {
        isValid: boolean;
        errors: string[];
    };
    static sanitizeString(str: string): string;
}
export declare enum LogLevel {
    ERROR = 0,
    WARN = 1,
    INFO = 2,
    DEBUG = 3
}
export interface LogEntry {
    level: LogLevel;
    message: string;
    timestamp: Date;
    context?: Record<string, any>;
    error?: Error;
}
export declare class Logger {
    private static instance;
    private logLevel;
    private logs;
    private maxLogs;
    private constructor();
    static getInstance(): Logger;
    private log;
    private outputLog;
    error(message: string, context?: Record<string, any>, error?: Error): void;
    warn(message: string, context?: Record<string, any>): void;
    info(message: string, context?: Record<string, any>): void;
    debug(message: string, context?: Record<string, any>): void;
    getLogs(level?: LogLevel): LogEntry[];
    clearLogs(): void;
}
//# sourceMappingURL=index.d.ts.map