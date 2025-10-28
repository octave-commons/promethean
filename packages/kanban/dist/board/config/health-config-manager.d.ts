import { EventEmitter } from 'node:events';
import type { KanbanHealthConfig, HealthMonitoringConfig } from './health-config.js';
export interface ConfigManagerOptions {
    configPath?: string;
    environment?: string;
    hotReload?: boolean;
}
export interface ConfigValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
}
export declare class HealthConfigManager extends EventEmitter {
    private configPath;
    private environment;
    private hotReload;
    private currentConfig;
    private watcher;
    private version;
    constructor(options?: ConfigManagerOptions);
    loadConfig(): Promise<KanbanHealthConfig>;
    saveConfig(config: Partial<KanbanHealthConfig>): Promise<void>;
    getEnvironmentConfig(): Promise<HealthMonitoringConfig>;
    updateEnvironmentConfig(healthConfig: Partial<HealthMonitoringConfig>): Promise<void>;
    validateConfig(config: any): ConfigValidationResult;
    rollbackToVersion(_version: string): Promise<void>;
    getConfigHistory(): Promise<Array<{
        version: string;
        timestamp: string;
        description: string;
    }>>;
    getCurrentConfig(): KanbanHealthConfig | null;
    getEnvironment(): string;
    getVersion(): string;
    destroy(): Promise<void>;
    private createDefaultConfig;
    private getDefaultConfig;
    private mergeConfig;
    private incrementVersion;
    private setupHotReload;
}
export declare class ConfigValidator {
    static validateThresholds(thresholds: any): ConfigValidationResult;
    static validateScheduling(scheduling: any): ConfigValidationResult;
}
export default HealthConfigManager;
//# sourceMappingURL=health-config-manager.d.ts.map