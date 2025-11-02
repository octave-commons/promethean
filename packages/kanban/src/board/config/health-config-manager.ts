import { readFile, writeFile } from 'node:fs/promises';
import { existsSync, watch } from 'node:fs';
import { EventEmitter } from 'node:events';
import type { KanbanHealthConfig, HealthMonitoringConfig } from './health-config.js';
import { KanbanHealthConfigSchema, DEFAULT_HEALTH_CONFIG } from './health-config.js';

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

export class HealthConfigManager extends EventEmitter {
  private configPath: string;
  private environment: string;
  private hotReload: boolean;
  private currentConfig: KanbanHealthConfig | null = null;
  private watcher: any = null;
  private version: string = '1.0.0';

  constructor(options: ConfigManagerOptions = {}) {
    super();
    this.configPath = options.configPath || 'promethean.health.kanban.json';
    this.environment = options.environment || process.env.NODE_ENV || 'development';
    this.hotReload = options.hotReload ?? true;
  }

  async loadConfig(): Promise<KanbanHealthConfig> {
    try {
      if (!existsSync(this.configPath)) {
        await this.createDefaultConfig();
      }

      const configData = await readFile(this.configPath, 'utf8');
      const parsedConfig = JSON.parse(configData);

      const validationResult = this.validateConfig(parsedConfig);
      if (!validationResult.valid) {
        throw new Error(`Configuration validation failed: ${validationResult.errors.join(', ')}`);
      }

      this.currentConfig = KanbanHealthConfigSchema.parse(parsedConfig);
      this.version = this.currentConfig.version;

      if (this.hotReload && !this.watcher) {
        await this.setupHotReload();
      }

      this.emit('configLoaded', this.currentConfig);
      return this.currentConfig;
    } catch (error) {
      this.emit('configError', error);
      throw error;
    }
  }

  async saveConfig(config: Partial<KanbanHealthConfig>): Promise<void> {
    try {
      const baseConfig = this.currentConfig || (await this.getDefaultConfig());
      const mergedConfig = this.mergeConfig(baseConfig, config);
      const validationResult = this.validateConfig(mergedConfig);

      if (!validationResult.valid) {
        throw new Error(`Configuration validation failed: ${validationResult.errors.join(', ')}`);
      }

      const versionedConfig = {
        ...mergedConfig,
        version: this.incrementVersion(this.currentConfig?.version || '1.0.0'),
        lastModified: new Date().toISOString(),
      };

      await writeFile(this.configPath, JSON.stringify(versionedConfig, null, 2));
      this.currentConfig = versionedConfig;
      this.version = versionedConfig.version;

      this.emit('configSaved', versionedConfig);
    } catch (error) {
      this.emit('configError', error);
      throw error;
    }
  }

  async getEnvironmentConfig(): Promise<HealthMonitoringConfig> {
    const config = this.currentConfig || (await this.loadConfig());
    const envConfig = config.environments[this.environment];

    if (!envConfig) {
      throw new Error(`Environment '${this.environment}' not found in configuration`);
    }

    return {
      ...DEFAULT_HEALTH_CONFIG,
      ...envConfig.health,
    };
  }

  async updateEnvironmentConfig(healthConfig: Partial<HealthMonitoringConfig>): Promise<void> {
    const config = this.currentConfig || (await this.loadConfig());

    const currentEnvConfig = config.environments[this.environment];
    const currentHealthConfig = currentEnvConfig?.health || DEFAULT_HEALTH_CONFIG;

    const updatedEnvironments = { ...config.environments };

    updatedEnvironments[this.environment] = {
      name: this.environment,
      health: {
        ...currentHealthConfig,
        ...healthConfig,
      },
    };

    const updatedConfig = {
      ...config,
      environments: updatedEnvironments,
    };

    await this.saveConfig(updatedConfig);
  }

  validateConfig(config: any): ConfigValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      KanbanHealthConfigSchema.parse(config);
    } catch (error) {
      if (error instanceof Error) {
        errors.push(error.message);
      }
    }

    if (!config.environments || !config.environments[this.environment]) {
      warnings.push(`Environment '${this.environment}' not configured, using defaults`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  async rollbackToVersion(_version: string): Promise<void> {
    throw new Error('Version rollback not yet implemented');
  }

  async getConfigHistory(): Promise<
    Array<{ version: string; timestamp: string; description: string }>
  > {
    return [];
  }

  getCurrentConfig(): KanbanHealthConfig | null {
    return this.currentConfig;
  }

  getEnvironment(): string {
    return this.environment;
  }

  getVersion(): string {
    return this.version;
  }

  async destroy(): Promise<void> {
    this.watcher = null;
    this.removeAllListeners();
  }

  private async createDefaultConfig(): Promise<void> {
    const defaultConfig = this.getDefaultConfig();
    await writeFile(this.configPath, JSON.stringify(defaultConfig, null, 2));
  }

  private getDefaultConfig(): KanbanHealthConfig {
    return {
      environments: {
        [this.environment]: {
          name: this.environment,
          health: DEFAULT_HEALTH_CONFIG,
        },
      },
      version: '1.0.0',
      schema: 'health-config-v1',
    };
  }

  private mergeConfig(
    base: KanbanHealthConfig,
    update: Partial<KanbanHealthConfig>,
  ): KanbanHealthConfig {
    return {
      ...base,
      ...update,
      environments: {
        ...base.environments,
        ...(update.environments || {}),
      },
    };
  }

  private incrementVersion(currentVersion: string): string {
    const [major, minor, patch] = currentVersion.split('.').map(Number);
    const patchNum = patch || 0;
    return `${major}.${minor}.${patchNum + 1}`;
  }

  private async setupHotReload(): Promise<void> {
    try {
      this.watcher = watch(this.configPath, (eventType) => {
        if (eventType === 'change') {
          (async () => {
            try {
              await this.loadConfig();
              this.emit('configReloaded', this.currentConfig);
            } catch (error) {
              this.emit('configError', error);
            }
          })();
        }
      });
    } catch (error) {
      this.emit('configError', error);
    }
  }
}

export class ConfigValidator {
  static validateThresholds(thresholds: any): ConfigValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (
      typeof thresholds.wipViolation !== 'number' ||
      thresholds.wipViolation < 0 ||
      thresholds.wipViolation > 100
    ) {
      errors.push('wipViolation must be a number between 0 and 100');
    }

    if (thresholds.dwellTime) {
      if (typeof thresholds.dwellTime.warning !== 'number' || thresholds.dwellTime.warning < 0) {
        errors.push('dwellTime.warning must be a positive number');
      }
      if (typeof thresholds.dwellTime.critical !== 'number' || thresholds.dwellTime.critical < 0) {
        errors.push('dwellTime.critical must be a positive number');
      }
      if (thresholds.dwellTime.warning >= thresholds.dwellTime.critical) {
        warnings.push('dwellTime.warning should be less than dwellTime.critical');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  static validateScheduling(scheduling: any): ConfigValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const cronRegex =
      /^(\*|[0-5]?\d|\*\/\d+) (\*|[01]?\d|2[0-3]|\*\/\d+) (\*|[12]?\d|3[01]|\*\/\d+) (\*|[01]?\d|\*\/\d+) (\*|[0-6]|\*\/\d+)$/;

    if (scheduling.metricsCollection && !cronRegex.test(scheduling.metricsCollection)) {
      errors.push('metricsCollection must be a valid cron expression');
    }

    if (scheduling.anomalyDetection && !cronRegex.test(scheduling.anomalyDetection)) {
      errors.push('anomalyDetection must be a valid cron expression');
    }

    if (scheduling.reportGeneration) {
      if (scheduling.reportGeneration.daily && !cronRegex.test(scheduling.reportGeneration.daily)) {
        errors.push('reportGeneration.daily must be a valid cron expression');
      }
      if (
        scheduling.reportGeneration.weekly &&
        !cronRegex.test(scheduling.reportGeneration.weekly)
      ) {
        errors.push('reportGeneration.weekly must be a valid cron expression');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }
}

export default HealthConfigManager;
