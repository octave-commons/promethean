/**
 * Core types for pipeline automation system
 */

export interface PipelineConfig {
  name: string;
  steps: PipelineStep[];
  timeout?: number;
  retries?: number;
  parallel?: boolean;
  resources?: ResourceLimits;
  monitoring?: MonitoringConfig;
}

export interface PipelineStep {
  id: string;
  name: string;
  command: string;
  timeout?: number;
  retries?: number;
  dependencies?: string[];
  resources?: ResourceLimits;
  buildFix?: BuildFixConfig;
  monitoring?: boolean;
}

export interface ResourceLimits {
  memory?: number; // MB
  cpu?: number; // percentage
  disk?: number; // MB
}

export interface MonitoringConfig {
  enabled: boolean;
  metrics: string[];
  alerts: AlertConfig[];
  interval?: number; // seconds
}

export interface AlertConfig {
  type: 'timeout' | 'memory' | 'cpu' | 'error' | 'performance';
  threshold: number;
  action: 'log' | 'email' | 'slack' | 'webhook';
  destination?: string;
}

export interface BuildFixConfig {
  enabled: boolean;
  model: string;
  maxAttempts: number;
  timeoutMs: number;
  errorContext: boolean;
  fixStrategy: 'conservative' | 'aggressive';
  autoApply: boolean;
}

export interface PipelineResult {
  success: boolean;
  duration: number;
  steps: StepResult[];
  errors?: string[];
  metrics?: PipelineMetrics;
  buildFixResults?: BuildFixResult[];
}

export interface StepResult {
  id: string;
  name: string;
  success: boolean;
  duration: number;
  startTime: Date;
  endTime: Date;
  error?: string;
  buildFixApplied?: boolean;
  metrics?: StepMetrics;
}

export interface PipelineMetrics {
  totalDuration: number;
  memoryUsage: number;
  cpuUsage: number;
  diskUsage: number;
  networkIO?: number;
}

export interface StepMetrics {
  memoryPeak: number;
  cpuAverage: number;
  diskUsage: number;
}

export interface BuildFixResult {
  stepId: string;
  success: boolean;
  errorsResolved: number;
  attempts: number;
  duration: number;
  model: string;
  patchesGenerated: number;
}

export interface TimeoutConfig {
  default: number; // seconds
  step: Record<string, number>; // step-specific timeouts
  strategy: 'fail-fast' | 'graceful' | 'retry';
}

export interface ParallelExecutionConfig {
  enabled: boolean;
  maxConcurrency: number;
  dependencyResolution: 'auto' | 'manual';
  resourceAware: boolean;
}

export interface ResourceMonitorConfig {
  enabled: boolean;
  interval: number; // seconds
  thresholds: {
    memory: number; // percentage
    cpu: number; // percentage
    disk: number; // percentage
  };
  actions: {
    warning: 'log' | 'alert';
    critical: 'throttle' | 'stop' | 'alert';
  };
}

export interface AlertMessage {
  pipeline?: string;
  step?: string;
  type: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  timestamp: Date;
  metrics?: Record<string, number>;
}

export interface AutomationState {
  running: boolean;
  currentPipeline?: string;
  currentStep?: string;
  startTime?: Date;
  metrics: PipelineMetrics;
  errors: string[];
}
