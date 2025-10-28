export class HealthConfigAPI {
    manager;
    constructor(manager) {
        this.manager = manager;
    }
    async getConfig() {
        return this.manager.getCurrentConfig() || this.manager.loadConfig();
    }
    async getEnvironmentConfig() {
        return this.manager.getEnvironmentConfig();
    }
    async updateThresholds(thresholds) {
        const currentConfig = await this.getEnvironmentConfig();
        const updatedThresholds = { ...currentConfig.thresholds, ...thresholds };
        await this.manager.updateEnvironmentConfig({ thresholds: updatedThresholds });
    }
    async updateAlertChannels(channels) {
        const updatedChannels = channels.filter((channel) => Boolean(channel));
        await this.manager.updateEnvironmentConfig({ alertChannels: updatedChannels });
    }
    async updateScheduling(scheduling) {
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
    async updateRules(rules) {
        const updatedRules = rules.filter((rule) => Boolean(rule));
        await this.manager.updateEnvironmentConfig({ rules: updatedRules });
    }
    async updateRetention(retention) {
        const currentConfig = await this.getEnvironmentConfig();
        const updatedRetention = { ...currentConfig.retention, ...retention };
        await this.manager.updateEnvironmentConfig({ retention: updatedRetention });
    }
    async enableHealthMonitoring() {
        await this.manager.updateEnvironmentConfig({ enabled: true });
    }
    async disableHealthMonitoring() {
        await this.manager.updateEnvironmentConfig({ enabled: false });
    }
    async validateConfig(config) {
        return this.manager.validateConfig(config);
    }
    async reloadConfig() {
        return this.manager.loadConfig();
    }
    getConfigVersion() {
        return this.manager.getVersion();
    }
    getEnvironment() {
        return this.manager.getEnvironment();
    }
    onConfigChange(callback) {
        this.manager.on('configLoaded', callback);
        this.manager.on('configSaved', callback);
        this.manager.on('configReloaded', callback);
    }
    onConfigError(callback) {
        this.manager.on('configError', callback);
    }
    removeListeners() {
        this.manager.removeAllListeners();
    }
}
export default HealthConfigAPI;
//# sourceMappingURL=health-config-api.js.map