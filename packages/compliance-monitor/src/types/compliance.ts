import { z } from 'zod';

export const ComplianceSeveritySchema = z.enum(['critical', 'high', 'medium', 'low', 'info']);
export type ComplianceSeverity = z.infer<typeof ComplianceSeveritySchema>;

export const ComplianceStatusSchema = z.enum(['pass', 'fail', 'warning', 'pending']);
export type ComplianceStatus = z.infer<typeof ComplianceStatusSchema>;

export const ComplianceCategorySchema = z.enum([
  'security',
  'performance',
  'reliability',
  'data_privacy',
  'access_control',
  'audit_trail',
  'code_quality',
  'infrastructure',
  'documentation',
]);
export type ComplianceCategory = z.infer<typeof ComplianceCategorySchema>;

export const ComplianceRuleSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: ComplianceCategorySchema,
  severity: ComplianceSeveritySchema,
  enabled: z.boolean().default(true),
  schedule: z.string().optional(), // cron expression
  threshold: z.number().optional(),
  parameters: z.record(z.any()).optional(),
  tags: z.array(z.string()).optional(),
});
export type ComplianceRule = z.infer<typeof ComplianceRuleSchema>;

export const ComplianceCheckSchema = z.object({
  id: z.string(),
  ruleId: z.string(),
  status: ComplianceStatusSchema,
  severity: ComplianceSeveritySchema,
  timestamp: z.date(),
  duration: z.number().optional(),
  message: z.string(),
  details: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
  affectedResources: z.array(z.string()).optional(),
  remediation: z.string().optional(),
  falsePositive: z.boolean().default(false),
});
export type ComplianceCheck = z.infer<typeof ComplianceCheckSchema>;

export const ComplianceReportSchema = z.object({
  id: z.string(),
  generatedAt: z.date(),
  periodStart: z.date(),
  periodEnd: z.date(),
  overallStatus: ComplianceStatusSchema,
  totalChecks: z.number(),
  passedChecks: z.number(),
  failedChecks: z.number(),
  warningChecks: z.number(),
  criticalIssues: z.number(),
  highIssues: z.number(),
  mediumIssues: z.number(),
  lowIssues: z.number(),
  categories: z.record(
    z.object({
      total: z.number(),
      passed: z.number(),
      failed: z.number(),
      warnings: z.number(),
    }),
  ),
  summary: z.string(),
  recommendations: z.array(z.string()),
});
export type ComplianceReport = z.infer<typeof ComplianceReportSchema>;

export const ComplianceAlertSchema = z.object({
  id: z.string(),
  checkId: z.string(),
  ruleId: z.string(),
  severity: ComplianceSeveritySchema,
  status: ComplianceStatusSchema,
  timestamp: z.date(),
  message: z.string(),
  acknowledged: z.boolean().default(false),
  acknowledgedBy: z.string().optional(),
  acknowledgedAt: z.date().optional(),
  resolved: z.boolean().default(false),
  resolvedBy: z.string().optional(),
  resolvedAt: z.date().optional(),
  escalationLevel: z.enum(['none', 'team_lead', 'manager', 'executive']).default('none'),
});
export type ComplianceAlert = z.infer<typeof ComplianceAlertSchema>;

export const ComplianceMetricSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: ComplianceCategorySchema,
  value: z.number(),
  unit: z.string(),
  timestamp: z.date(),
  threshold: z.number().optional(),
  status: ComplianceStatusSchema,
  trend: z.enum(['improving', 'stable', 'degrading']).optional(),
});
export type ComplianceMetric = z.infer<typeof ComplianceMetricSchema>;
