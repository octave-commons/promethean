/**
 * Orchestration system types for the Pantheon Agent Framework
 */

export type OrchestrationConfig = {
  readonly maxConcurrentAgents: number;
  readonly resourceLimits: ResourceLimits;
  readonly schedulingPolicy: SchedulingPolicy;
  readonly healthCheck: HealthCheckConfig;
};

export type ResourceLimits = {
  readonly maxMemory: number;
  readonly maxCpu: number;
  readonly maxExecutionTime: number;
};

export enum SchedulingPolicy {
  FIFO = 'fifo',
  PRIORITY = 'priority',
  ROUND_ROBIN = 'round_robin',
  LEAST_LOADED = 'least_loaded',
}

export type HealthCheckConfig = {
  readonly interval: number;
  readonly timeout: number;
  readonly retries: number;
  readonly checkEndpoint?: string;
};
