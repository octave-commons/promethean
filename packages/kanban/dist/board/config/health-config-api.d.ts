import { HealthConfigManager } from './health-config-manager.js';
import type { HealthMonitoringConfig, KanbanHealthConfig } from './health-config.js';
export declare class HealthConfigAPI {
    private manager;
    constructor(manager: HealthConfigManager);
    getConfig(): Promise<KanbanHealthConfig>;
    getEnvironmentConfig(): Promise<HealthMonitoringConfig>;
    updateThresholds(thresholds: Partial<HealthMonitoringConfig['thresholds']>): Promise<void>;
    updateAlertChannels(channels: Partial<HealthMonitoringConfig['alertChannels']>): Promise<void>;
    updateScheduling(scheduling: Partial<HealthMonitoringConfig['scheduling']>): Promise<void>;
    updateRules(rules: Partial<HealthMonitoringConfig['rules']>): Promise<void>;
    updateRetention(retention: Partial<HealthMonitoringConfig['retention']>): Promise<void>;
    enableHealthMonitoring(): Promise<void>;
    disableHealthMonitoring(): Promise<void>;
    validateConfig(config: any): Promise<import("./health-config-manager.js").ConfigValidationResult>;
    reloadConfig(): Promise<KanbanHealthConfig>;
    getConfigVersion(): string;
    getEnvironment(): string;
    onConfigChange(callback: (config: KanbanHealthConfig) => void): void;
    onConfigError(callback: (error: Error) => void): void;
    removeListeners(): void;
}
export default HealthConfigAPI;
//# sourceMappingURL=health-config-api.d.ts.map