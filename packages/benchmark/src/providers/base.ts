import {
  BenchmarkRequest,
  BenchmarkResponse,
  ProviderConfig,
  BenchmarkMetrics,
  ResourceMetrics,
} from '../types/index.js';

export abstract class BaseProvider {
  protected config: ProviderConfig;

  constructor(config: ProviderConfig) {
    this.config = config;
  }

  abstract connect(): Promise<void>;
  abstract disconnect(): Promise<void>;
  abstract execute(request: BenchmarkRequest): Promise<BenchmarkResponse>;
  abstract isHealthy(): Promise<boolean>;

  getConfig(): ProviderConfig {
    return this.config;
  }

  getName(): string {
    return this.config.name;
  }

  getType(): string {
    return this.config.type;
  }

  getModel(): string {
    return this.config.model;
  }

  public calculateMetrics(response: BenchmarkResponse, startTime: number): BenchmarkMetrics {
    const endTime = Date.now();
    const totalTime = endTime - startTime;

    return {
      tps: (response.tokens / totalTime) * 1000, // tokens per second
      latency: totalTime,
      timeToFirstToken: response.metadata?.timeToFirstToken || totalTime,
      timeToCompletion: totalTime,
      effectiveness: response.metadata?.effectiveness,
    };
  }

  public async measureResources(): Promise<ResourceMetrics> {
    try {
      // Dynamic imports to avoid bundling issues
      const [pidusage, si] = await Promise.all([
        import('pidusage').then((m) => m.default),
        import('systeminformation').then((m) => m.default),
      ]);

      const [currentLoad, gpu] = await Promise.all([si.currentLoad(), this.getGpuStats(si)]);

      const processStats = await pidusage(process.pid);

      return {
        memoryUsage: processStats.memory / 1024 / 1024, // Convert to MB
        cpuUsage: currentLoad.currentLoad,
        gpuUsage: gpu?.usage,
        gpuMemoryUsage: gpu?.memoryUsed,
        powerConsumption: await this.getPowerConsumption(si),
      };
    } catch (error) {
      // Fallback if monitoring tools aren't available
      return {
        memoryUsage: 0,
        cpuUsage: 0,
      };
    }
  }

  private async getGpuStats(si: any): Promise<{ usage?: number; memoryUsed?: number } | undefined> {
    try {
      const graphics = await si.graphics();
      const gpu = graphics.controllers[0];

      if (gpu) {
        return {
          usage: gpu.utilizationGpu,
          memoryUsed: gpu.vram ? gpu.vramUsed / 1024 / 1024 : undefined, // Convert to MB
        };
      }
    } catch (error) {
      // GPU stats not available
    }
    return undefined;
  }

  private async getPowerConsumption(si: any): Promise<number | undefined> {
    try {
      const battery = await si.battery();

      if (battery.hasBattery) {
        // This is a rough estimate - actual power monitoring would need hardware-specific APIs
        return undefined;
      }
    } catch (error) {
      // Power consumption not available
    }
    return undefined;
  }
}
