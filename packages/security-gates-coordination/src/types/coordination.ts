/**
 * Security Gates Coordination Framework Types
 *
 * Central coordination system for orchestrating multiple security monitoring
 * and gate management systems across the Promethean infrastructure.
 */

export interface SecurityGateCoordinator {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'maintenance' | 'error';
  lastHealthCheck: Date;
  configuration: CoordinatorConfig;
}

export interface CoordinatorConfig {
  monitoringSystems: MonitoringSystemConfig[];
  alertingChannels: AlertingChannelConfig[];
  escalationPolicies: EscalationPolicyConfig[];
  integrationEndpoints: IntegrationEndpointConfig[];
  complianceRequirements: ComplianceRequirementConfig[];
}

export interface MonitoringSystemConfig {
  id: string;
  name: string;
  type:
    | 'p0-security-validator'
    | 'wip-enforcement'
    | 'security-monitoring'
    | 'performance-monitoring';
  endpoint: string;
  credentials?: Record<string, string>;
  healthCheckInterval: number;
  alertThresholds: AlertThreshold[];
  enabled: boolean;
}

export interface AlertingChannelConfig {
  id: string;
  name: string;
  type: 'email' | 'slack' | 'webhook' | 'pagerduty' | 'teams';
  configuration: Record<string, any>;
  enabled: boolean;
  rateLimit?: {
    maxAlerts: number;
    windowMs: number;
  };
}

export interface EscalationPolicyConfig {
  id: string;
  name: string;
  triggerConditions: TriggerCondition[];
  escalationSteps: EscalationStep[];
  cooldownPeriod: number;
  enabled: boolean;
}

export interface TriggerCondition {
  metricName: string;
  operator: 'gt' | 'lt' | 'eq' | 'ne' | 'gte' | 'lte';
  threshold: number;
  duration?: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface EscalationStep {
  order: number;
  delay: number;
  channels: string[];
  message: string;
  autoRemediate?: boolean;
}

export interface IntegrationEndpointConfig {
  id: string;
  name: string;
  type: 'security-tool' | 'monitoring-system' | 'compliance-framework' | 'external-api';
  endpoint: string;
  authentication: AuthenticationConfig;
  dataMapping: DataMappingConfig;
  enabled: boolean;
}

export interface AuthenticationConfig {
  type: 'api-key' | 'oauth2' | 'jwt' | 'basic' | 'certificate';
  credentials: Record<string, string>;
  refreshInterval?: number;
}

export interface DataMappingConfig {
  inbound: Record<string, string>;
  outbound: Record<string, string>;
  transformations?: TransformationConfig[];
}

export interface TransformationConfig {
  field: string;
  type: 'rename' | 'format' | 'calculate' | 'filter';
  config: Record<string, any>;
}

export interface ComplianceRequirementConfig {
  id: string;
  name: string;
  standard: 'OWASP' | 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  requirements: ComplianceRequirement[];
  reportingSchedule: ReportingSchedule;
  enabled: boolean;
}

export interface ComplianceRequirement {
  id: string;
  description: string;
  control: string;
  validationRules: ValidationRule[];
  evidenceRequired: string[];
  automatedCheck: boolean;
}

export interface ValidationRule {
  field: string;
  condition: string;
  expectedValue: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface ReportingSchedule {
  frequency: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'quarterly';
  recipients: string[];
  format: 'json' | 'pdf' | 'html' | 'csv';
  includeDetails: boolean;
}

export interface AlertThreshold {
  metricName: string;
  warning: number;
  critical: number;
  duration: number;
}

export interface SecurityEvent {
  id: string;
  timestamp: Date;
  source: string;
  type: 'security-violation' | 'compliance-breach' | 'performance-issue' | 'capacity-violation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  details: Record<string, any>;
  affectedSystems: string[];
  status: 'open' | 'investigating' | 'resolved' | 'false-positive';
  assignedTo?: string;
  resolvedAt?: Date;
  resolutionNotes?: string;
}

export interface CoordinationMetrics {
  timestamp: Date;
  totalEvents: number;
  eventsByType: Record<string, number>;
  eventsBySeverity: Record<string, number>;
  averageResponseTime: number;
  systemHealth: Record<string, HealthStatus>;
  complianceScore: number;
  activeAlerts: number;
  resolvedAlerts: number;
  falsePositiveRate: number;
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  lastCheck: Date;
  responseTime: number;
  errorRate: number;
  uptime: number;
  details?: Record<string, any>;
}

export interface CoordinationWorkflow {
  id: string;
  name: string;
  description: string;
  triggers: WorkflowTrigger[];
  steps: WorkflowStep[];
  enabled: boolean;
}

export interface WorkflowTrigger {
  type: 'event' | 'schedule' | 'manual';
  configuration: Record<string, any>;
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'validate' | 'notify' | 'escalate' | 'remediate' | 'report';
  configuration: Record<string, any>;
  dependencies?: string[];
  timeout?: number;
}

export interface SecurityGateStatus {
  gateId: string;
  gateName: string;
  status: 'pass' | 'fail' | 'warning' | 'unknown';
  lastCheck: Date;
  details: Record<string, any>;
  violations: SecurityViolation[];
  metrics: Record<string, number>;
}

export interface SecurityViolation {
  id: string;
  rule: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  detectedAt: Date;
  status: 'open' | 'acknowledged' | 'resolved';
  assignedTo?: string;
  resolution?: string;
  resolvedAt?: Date;
}

export interface CoordinationReport {
  id: string;
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
  systemHealth: Record<string, HealthStatus>;
  gateStatuses: SecurityGateStatus[];
  trends: TrendData[];
  recommendations: Recommendation[];
}

export interface TrendData {
  metric: string;
  period: string;
  data: Array<{
    timestamp: Date;
    value: number;
  }>;
  trend: 'increasing' | 'decreasing' | 'stable';
  changePercentage: number;
}

export interface Recommendation {
  id: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'security' | 'performance' | 'compliance' | 'capacity';
  title: string;
  description: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
  dueDate?: Date;
  assignedTo?: string;
  status: 'open' | 'in-progress' | 'completed' | 'rejected';
}
