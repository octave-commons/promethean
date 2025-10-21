/**
 * Core types for the automated compliance monitoring system
 */

// Re-export Task and Board types from kanban package
export type { Task, Board } from '@promethean/kanban';

export interface ComplianceEvent {
  id: string;
  timestamp: Date;
  type: 'VIOLATION' | 'ALERT' | 'METRIC' | 'RESOLVED';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  category: 'WIP' | 'PROCESS' | 'SECURITY' | 'PERFORMANCE' | 'QUALITY';
  taskId?: string;
  taskTitle?: string;
  column?: string;
  description: string;
  actionRequired: string;
  assignedTo?: string;
  resolved: boolean;
  resolvedAt?: Date;
  resolutionNotes?: string;
  metadata?: Record<string, any>;
}

export interface TaskCompliance {
  taskId: string;
  taskTitle: string;
  priority: string;
  currentStatus: string;
  correctStatus?: string;
  violations: ComplianceViolation[];
  complianceScore: number;
  lastScanned: Date;
  securityGatesPassed: boolean;
  implementationVerified: boolean;
  estimatedResolutionTime?: Date;
}

export interface ComplianceViolation {
  id: string;
  type: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  suggestion: string;
  detectedAt: Date;
  resolved: boolean;
  resolvedAt?: Date;
}

export interface WIPComplianceStatus {
  columnName: string;
  currentCount: number;
  limit: number;
  utilization: number;
  status: 'COMPLIANT' | 'WARNING' | 'CRITICAL' | 'VIOLATION';
  headroom: number;
  tasksOverLimit?: string[];
}

export interface ProcessComplianceStatus {
  overallCompliance: number;
  totalTasks: number;
  compliantTasks: number;
  violations: ComplianceEvent[];
  lastScanTime: Date;
  scanDuration: number;
}

export interface SecurityComplianceStatus {
  p0TasksInWrongStatus: TaskCompliance[];
  securityGatesFailed: string[];
  vulnerabilitiesUnresolved: number;
  lastSecurityScan: Date;
  overallSecurityScore: number;
}

export interface ComplianceMetrics {
  wipCompliance: number;
  processCompliance: number;
  securityCompliance: number;
  overallCompliance: number;
  violationTrend: {
    last24h: number;
    last7d: number;
    last30d: number;
  };
  resolutionTime: {
    average: number;
    median: number;
    p95: number;
  };
}

export interface ComplianceConfig {
  enabled: boolean;
  scanInterval: number; // seconds
  wipThresholds: {
    warning: number; // percentage
    critical: number; // percentage
  };
  security: {
    p0RequiredStatuses: string[];
    scanInterval: number; // seconds
    tools: string[];
  };
  alerts: {
    email: {
      enabled: boolean;
      recipients: string[];
    };
    slack: {
      enabled: boolean;
      webhook: string;
      channel: string;
    };
    webhook: {
      enabled: boolean;
      url: string;
    };
  };
  retention: {
    events: number; // days
    metrics: number; // days
  };
}

export interface ComplianceAlert {
  id: string;
  eventId: string;
  channel: 'email' | 'slack' | 'webhook' | 'dashboard';
  sent: boolean;
  sentAt?: Date;
  error?: string;
  retryCount: number;
  maxRetries: number;
}

export interface ComplianceScanResult {
  scanId: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  wipStatus: WIPComplianceStatus[];
  processStatus: ProcessComplianceStatus;
  securityStatus: SecurityComplianceStatus;
  events: ComplianceEvent[];
  metrics: ComplianceMetrics;
}

export interface ComplianceDashboard {
  id: string;
  name: string;
  description: string;
  config: ComplianceConfig;
  lastUpdate: Date;
  status: 'active' | 'inactive' | 'error';
  metrics: ComplianceMetrics;
  recentEvents: ComplianceEvent[];
  alerts: ComplianceAlert[];
}

export interface ComplianceFilter {
  severity?: ('CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW')[];
  category?: ('WIP' | 'PROCESS' | 'SECURITY' | 'PERFORMANCE' | 'QUALITY')[];
  resolved?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  taskId?: string;
  column?: string;
}

export interface ComplianceReport {
  id: string;
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  generatedAt: Date;
  period: {
    start: Date;
    end: Date;
  };
  summary: {
    totalEvents: number;
    criticalEvents: number;
    resolvedEvents: number;
    averageResolutionTime: number;
    complianceScore: number;
  };
  breakdown: {
    byCategory: Record<string, number>;
    bySeverity: Record<string, number>;
    byColumn: Record<string, number>;
  };
  trends: {
    violationTrend: number;
    resolutionTimeTrend: number;
    complianceTrend: number;
  };
  recommendations: string[];
}

export interface ComplianceNotification {
  id: string;
  type: 'VIOLATION' | 'RESOLVED' | 'TREND' | 'SUMMARY';
  title: string;
  message: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  channels: string[];
  data?: Record<string, any>;
  scheduledAt?: Date;
  sent: boolean;
  sentAt?: Date;
}