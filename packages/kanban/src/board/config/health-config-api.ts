import { HealthConfigManager } from './health-config-manager.js';
import type { HealthMonitoringConfig, KanbanHealthConfig } from './health-config.js';

export class HealthConfigAPI {
  private manager: HealthConfigManager;

  constructor(manager: HealthConfigManager) {
    this.manager = manager;
  }

  async getConfig(): Promise<KanbanHealthConfig> {
    return this.manager.getCurrentConfig() || this.manager.loadConfig();
  }

  async getEnvironmentConfig(): Promise<HealthMonitoringConfig> {
    return this.manager.getEnvironmentConfig();
  }

  async updateThresholds(thresholds: Partial<HealthMonitoringConfig['thresholds']>): Promise<void> {
    const currentConfig = await this.getEnvironmentConfig();
    const updatedThresholds = { ...currentConfig.thresholds, ...thresholds };
    await this.manager.updateEnvironmentConfig({ thresholds: updatedThresholds });
  }

  async updateAlertChannels(
    channels: Partial<HealthMonitoringConfig['alertChannels']>,
  ): Promise<void> {
    const updatedChannels = channels.filter((channel): channel is NonNullable<typeof channel> =>
      Boolean(channel),
    );
    await this.manager.updateEnvironmentConfig({ alertChannels: updatedChannels });
  }

  async updateScheduling(scheduling: Partial<HealthMonitoringConfig['scheduling']>): Promise<void> {
    const currentConfig = await this.getEnvironmentConfig();
    const updatedScheduling = {
      ...currentConfig.scheduling,
      ...scheduling,
      reportGeneration: {
        ...currentConfig.scheduling.reportGeneration,
        ...scheduling.reportGeneration,
      },
    };
    await this.manager.updateEnvironmentConfig({ scheduling: updatedScheduling });
  }

  async updateRules(rules: Partial<HealthMonitoringConfig['rules']>): Promise<void> {
    const updatedRules = rules.filter((rule): rule is NonNullable<typeof rule> => Boolean(rule));
    await this.manager.updateEnvironmentConfig({ rules: updatedRules });
  }

  async updateRetention(retention: Partial<HealthMonitoringConfig['retention']>): Promise<void> {
    const currentConfig = await this.getEnvironmentConfig();
    const updatedRetention = { ...currentConfig.retention, ...retention };
    await this.manager.updateEnvironmentConfig({ retention: updatedRetention });
  }

  async enableHealthMonitoring(): Promise<void> {
    await this.manager.updateEnvironmentConfig({ enabled: true });
  }

  async disableHealthMonitoring(): Promise<void> {
    await this.manager.updateEnvironmentConfig({ enabled: false });
  }

  async validateConfig(config: any) {
    return this.manager.validateConfig(config);
  }

  async reloadConfig(): Promise<KanbanHealthConfig> {
    return this.manager.loadConfig();
  }

  getConfigVersion(): string {
    return this.manager.getVersion();
  }

  getEnvironment(): string {
    return this.manager.getEnvironment();
  }

  onConfigChange(callback: (config: KanbanHealthConfig) => void): void {
    this.manager.on('configLoaded', callback);
    this.manager.on('configSaved', callback);
    this.manager.on('configReloaded', callback);
  }

  onConfigError(callback: (error: Error) => void): void {
    this.manager.on('configError', callback);
  }

  removeListeners(): void {
    this.manager.removeAllListeners();
  }
}

export default HealthConfigAPI;
