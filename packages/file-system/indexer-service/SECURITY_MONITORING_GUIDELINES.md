# Security Monitoring Guidelines

## Overview

This document provides comprehensive guidelines for monitoring the security posture of the indexer-service, focusing on detecting and responding to security threats in real-time.

## Monitoring Architecture

### Data Collection Layer
```typescript
// Security event structure
interface SecurityEvent {
  timestamp: string;
  eventType: 'validation_failure' | 'attack_attempt' | 'anomaly_detected';
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: {
    ip: string;
    userAgent?: string;
    requestId?: string;
  };
  details: {
    endpoint: string;
    method: string;
    input: any;
    validationError: string;
    riskScore: number;
  };
  context: {
    userId?: string;
    sessionId?: string;
    headers: Record<string, string>;
  };
}
```

### Processing Layer
```typescript
// Real-time threat detection
class ThreatDetector {
  private readonly thresholds = {
    validationFailuresPerMinute: 10,
    uniqueMaliciousIPsPerHour: 5,
    consecutiveFailuresPerIP: 3,
    anomalyScoreThreshold: 0.8,
  };

  detectThreats(events: SecurityEvent[]): ThreatAlert[] {
    // Pattern matching, anomaly detection, correlation analysis
  }
}
```

### Alerting Layer
```typescript
// Alert configuration
interface AlertConfig {
  name: string;
  condition: string;
  severity: 'info' | 'warning' | 'critical';
  channels: ('email' | 'slack' | 'pagerduty')[];
  cooldown: number; // minutes
  escalation: string[];
}
```

## Key Security Metrics

### Input Validation Metrics
```typescript
// Validation failure tracking
interface ValidationMetrics {
  totalRequests: number;
  validationFailures: number;
  failureRate: number;
  failureByType: Record<string, number>;
  failureByEndpoint: Record<string, number>;
  failureByIP: Record<string, number>;
  averageRiskScore: number;
}
```

### Attack Pattern Metrics
```typescript
// Attack detection metrics
interface AttackMetrics {
  pathTraversalAttempts: number;
  unicodeAttackAttempts: number;
  arrayBypassAttempts: number;
  injectionAttempts: number;
  bruteForceAttempts: number;
  suspiciousPatterns: string[];
  blockedIPs: string[];
  highRiskIPs: string[];
}
```

### Performance Impact Metrics
```typescript
// Security overhead tracking
interface PerformanceMetrics {
  averageValidationTime: number;
  p95ValidationTime: number;
  securityOverheadPercentage: number;
  throughputImpact: number;
  memoryOverhead: number;
  cpuOverhead: number;
}
```

## Real-time Monitoring Implementation

### Security Event Collection
```typescript
// Middleware for security event collection
app.addHook('preHandler', async (request, reply) => {
  const startTime = Date.now();
  
  // Store start time for later processing
  request.securityContext = {
    startTime,
    clientIP: request.ip,
    userAgent: request.headers['user-agent'],
  };
});

app.addHook('onError', async (request, reply, error) => {
  // Log security-related errors
  if (isSecurityError(error)) {
    await logSecurityEvent({
      timestamp: new Date().toISOString(),
      eventType: 'validation_failure',
      severity: 'high',
      source: {
        ip: request.securityContext.clientIP,
        userAgent: request.securityContext.userAgent,
        requestId: request.id,
      },
      details: {
        endpoint: request.url,
        method: request.method,
        input: request.body,
        validationError: error.message,
        riskScore: calculateRiskScore(error),
      },
    });
  }
});
```

### Threat Detection Engine
```typescript
class SecurityMonitoringEngine {
  private eventBuffer: SecurityEvent[] = [];
  private threatPatterns = new Map<string, ThreatPattern>();

  constructor() {
    this.initializeThreatPatterns();
    this.startMonitoring();
  }

  private initializeThreatPatterns() {
    // Path traversal pattern
    this.threatPatterns.set('path_traversal', {
      name: 'Path Traversal Attack',
      pattern: /\.\.[\/\\]/,
      severity: 'critical',
      action: 'block_ip',
    });

    // Unicode homograph pattern
    this.threatPatterns.set('unicode_homograph', {
      name: 'Unicode Homograph Attack',
      pattern: /[‥﹒．]/,
      severity: 'high',
      action: 'block_request',
    });

    // Array bypass pattern
    this.threatPatterns.set('array_bypass', {
      name: 'Array Input Bypass Attempt',
      pattern: (event: SecurityEvent) => {
        return Array.isArray(event.details.input) && 
               event.details.validationError.includes('Array input');
      },
      severity: 'critical',
      action: 'block_ip',
    });
  }

  async processEvent(event: SecurityEvent): Promise<void> {
    this.eventBuffer.push(event);
    
    // Check for immediate threats
    const threats = this.detectThreats(event);
    
    for (const threat of threats) {
      await this.handleThreat(threat);
    }

    // Periodic analysis
    if (this.eventBuffer.length >= 100) {
      await this.analyzePatterns();
    }
  }

  private detectThreats(event: SecurityEvent): ThreatAlert[] {
    const threats: ThreatAlert[] = [];

    for (const [patternId, pattern] of this.threatPatterns) {
      if (this.matchesPattern(event, pattern)) {
        threats.push({
          patternId,
          severity: pattern.severity,
          event,
          recommendedAction: pattern.action,
        });
      }
    }

    return threats;
  }

  private async handleThreat(threat: ThreatAlert): Promise<void> {
    switch (threat.recommendedAction) {
      case 'block_ip':
        await this.blockIP(threat.event.source.ip);
        break;
      case 'block_request':
        await this.logSecurityIncident(threat);
        break;
      case 'alert_only':
        await this.sendAlert(threat);
        break;
    }
  }
}
```

## Alerting Configuration

### Alert Rules
```yaml
alerts:
  - name: "High Rate of Validation Failures"
    condition: "validation_failures_per_minute > 10"
    severity: "critical"
    channels: ["pagerduty", "slack"]
    cooldown: 5
    message: "High rate of security validation failures detected"
    
  - name: "Path Traversal Attack Detected"
    condition: "path_traversal_attempts > 0"
    severity: "critical"
    channels: ["pagerduty", "email", "slack"]
    cooldown: 1
    message: "Path traversal attack detected - immediate action required"
    
  - name: "Suspicious IP Activity"
    condition: "consecutive_failures_per_ip > 3"
    severity: "high"
    channels: ["slack", "email"]
    cooldown: 10
    message: "Suspicious activity detected from IP: {{ip}}"
    
  - name: "Unicode Attack Attempt"
    condition: "unicode_attack_attempts > 0"
    severity: "high"
    channels: ["slack", "email"]
    cooldown: 5
    message: "Unicode homograph attack attempt detected"
    
  - name: "Security Performance Impact"
    condition: "security_overhead_percentage > 10"
    severity: "warning"
    channels: ["slack"]
    cooldown: 30
    message: "Security validation overhead exceeding acceptable limits"
```

### Notification Templates
```typescript
// Slack notification template
const slackTemplate = {
  color: (severity: string) => {
    switch (severity) {
      case 'critical': return 'danger';
      case 'high': return 'warning';
      case 'medium': return 'warning';
      case 'low': return 'good';
      default: return 'good';
    }
  },
  message: (alert: ThreatAlert) => ({
    text: `🚨 Security Alert: ${alert.patternId}`,
    attachments: [{
      color: alert.severity,
      fields: [
        { title: 'Severity', value: alert.severity, short: true },
        { title: 'IP Address', value: alert.event.source.ip, short: true },
        { title: 'Endpoint', value: alert.event.details.endpoint, short: true },
        { title: 'Risk Score', value: alert.event.details.riskScore.toString(), short: true },
        { title: 'Details', value: alert.event.details.validationError, short: false },
      ],
      timestamp: new Date(alert.event.timestamp).getTime() / 1000,
    }],
  }),
};

// Email notification template
const emailTemplate = {
  subject: (alert: ThreatAlert) => 
    `[SECURITY-${alert.severity.toUpperCase()}] ${alert.patternId} detected`,
  body: (alert: ThreatAlert) => `
    Security Alert Details:
    
    Alert Type: ${alert.patternId}
    Severity: ${alert.severity}
    Timestamp: ${alert.event.timestamp}
    IP Address: ${alert.event.source.ip}
    User Agent: ${alert.event.source.userAgent}
    Endpoint: ${alert.event.details.endpoint}
    Method: ${alert.event.details.method}
    Risk Score: ${alert.event.details.riskScore}
    
    Validation Error:
    ${alert.event.details.validationError}
    
    Recommended Action: ${alert.recommendedAction}
    
    Immediate action required for critical alerts.
  `,
};
```

## Dashboard Configuration

### Grafana Dashboard Panels
```json
{
  "dashboard": {
    "title": "Indexer Service Security Monitoring",
    "panels": [
      {
        "title": "Validation Failures Rate",
        "type": "stat",
        "targets": [
          {
            "expr": "rate(validation_failures_total[5m])",
            "legendFormat": "Failures/sec"
          }
        ]
      },
      {
        "title": "Security Events by Severity",
        "type": "piechart",
        "targets": [
          {
            "expr": "sum by (severity) (security_events_total)",
            "legendFormat": "{{severity}}"
          }
        ]
      },
      {
        "title": "Top Malicious IPs",
        "type": "table",
        "targets": [
          {
            "expr": "topk(10, sum by (source_ip) (security_events_total))",
            "format": "table"
          }
        ]
      },
      {
        "title": "Attack Types Over Time",
        "type": "timeseries",
        "targets": [
          {
            "expr": "sum by (attack_type) (rate(attack_attempts_total[5m]))",
            "legendFormat": "{{attack_type}}"
          }
        ]
      },
      {
        "title": "Security Performance Impact",
        "type": "stat",
        "targets": [
          {
            "expr": "security_overhead_percentage",
            "legendFormat": "Overhead %"
          }
        ]
      }
    ]
  }
}
```

## Log Analysis

### Security Log Format
```json
{
  "timestamp": "2025-10-18T10:30:45.123Z",
  "level": "warn",
  "event_type": "security_validation_failure",
  "severity": "high",
  "source": {
    "ip": "192.168.1.100",
    "user_agent": "curl/7.68.0",
    "request_id": "req-123456"
  },
  "request": {
    "method": "POST",
    "url": "/indexer/index",
    "headers": {
      "content-type": "application/json",
      "x-forwarded-for": "192.168.1.100"
    }
  },
  "validation": {
    "input_type": "array",
    "validation_error": "Array input not supported",
    "risk_score": 0.9,
    "blocked": true
  },
  "response": {
    "status_code": 400,
    "response_time_ms": 15
  }
}
```

### Log Analysis Queries
```sql
-- Find top malicious IPs
SELECT 
  source.ip,
  COUNT(*) as attempt_count,
  MAX(validation.risk_score) as max_risk,
  COLLECT_LIST(validation.validation_error) as error_types
FROM security_events
WHERE timestamp >= NOW() - INTERVAL 1 HOUR
  AND severity IN ('high', 'critical')
GROUP BY source.ip
ORDER BY attempt_count DESC
LIMIT 10;

-- Analyze attack patterns over time
SELECT 
  DATE_TRUNC('hour', timestamp) as hour,
  validation.validation_error,
  COUNT(*) as count
FROM security_events
WHERE timestamp >= NOW() - INTERVAL 24 HOURS
  AND severity = 'critical'
GROUP BY hour, validation.validation_error
ORDER BY hour DESC;

-- Performance impact analysis
SELECT 
  DATE_TRUNC('minute', timestamp) as minute,
  AVG(response.response_time_ms) as avg_response_time,
  COUNT(*) as request_count,
  SUM(CASE WHEN validation.blocked = true THEN 1 ELSE 0 END) as blocked_count
FROM security_events
WHERE timestamp >= NOW() - INTERVAL 1 HOUR
GROUP BY minute
ORDER BY minute DESC;
```

## Automated Response

### IP Blocking Automation
```typescript
class IPBlocker {
  private blockedIPs = new Set<string>();
  private blockDuration = 3600000; // 1 hour

  async blockIP(ip: string, duration?: number): Promise<void> {
    const blockTime = duration || this.blockDuration;
    
    // Add to firewall
    await this.addToFirewall(ip);
    
    // Track blocking
    this.blockedIPs.add(ip);
    
    // Schedule unblock
    setTimeout(() => {
      this.unblockIP(ip);
    }, blockTime);
    
    // Log the action
    await this.logBlockAction(ip, blockTime);
  }

  private async addToFirewall(ip: string): Promise<void> {
    // Implementation depends on firewall system
    // Example for iptables:
    await exec(`iptables -A INPUT -s ${ip} -j DROP`);
  }

  private async unblockIP(ip: string): Promise<void> {
    this.blockedIPs.delete(ip);
    await exec(`iptables -D INPUT -s ${ip} -j DROP`);
    await this.logUnblockAction(ip);
  }
}
```

### Rate Limiting Automation
```typescript
class RateLimiter {
  private requestCounts = new Map<string, number[]>();
  private readonly windowSize = 60000; // 1 minute
  private readonly maxRequests = 100;

  isAllowed(ip: string): boolean {
    const now = Date.now();
    const requests = this.requestCounts.get(ip) || [];
    
    // Remove old requests outside window
    const validRequests = requests.filter(time => now - time < this.windowSize);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    this.requestCounts.set(ip, validRequests);
    return true;
  }
}
```

## Compliance and Reporting

### Daily Security Report
```typescript
interface DailySecurityReport {
  date: string;
  summary: {
    totalRequests: number;
    validationFailures: number;
    blockedRequests: number;
    uniqueMaliciousIPs: number;
    averageRiskScore: number;
  };
  topThreats: Array<{
    type: string;
    count: number;
    severity: string;
  }>;
  performanceImpact: {
    averageOverhead: number;
    maxOverhead: number;
    impactOnThroughput: number;
  };
  recommendations: string[];
}
```

### Weekly Security Summary
```typescript
interface WeeklySecuritySummary {
  week: string;
  trends: {
    validationFailureRate: number[];
    attackAttemptCounts: number[];
    blockedIPCounts: number[];
    performanceImpacts: number[];
  };
  incidents: SecurityIncident[];
  improvements: SecurityImprovement[];
  upcomingTasks: SecurityTask[];
}
```

## Integration with External Systems

### SIEM Integration
```typescript
class SIEMIntegration {
  async sendSecurityEvent(event: SecurityEvent): Promise<void> {
    const siemEvent = {
      timestamp: event.timestamp,
      source: 'indexer-service',
      event_type: event.eventType,
      severity: event.severity,
      details: {
        ip_address: event.source.ip,
        user_agent: event.source.userAgent,
        endpoint: event.details.endpoint,
        attack_vector: this.detectAttackVector(event),
        risk_score: event.details.riskScore,
      },
    };

    await this.sendToSIEM(siemEvent);
  }

  private detectAttackVector(event: SecurityEvent): string {
    if (event.details.validationError.includes('path traversal')) {
      return 'PATH_TRAVERSAL';
    }
    if (event.details.validationError.includes('unicode')) {
      return 'UNICODE_HOMOGRAPH';
    }
    if (event.details.validationError.includes('array')) {
      return 'ARRAY_BYPASS';
    }
    return 'UNKNOWN';
  }
}
```

### Threat Intelligence Integration
```typescript
class ThreatIntelligence {
  private maliciousIPs = new Set<string>();
  private threatPatterns = new Map<string, ThreatPattern>();

  async updateThreatIntelligence(): Promise<void> {
    // Fetch from threat intelligence feeds
    const feeds = [
      'https://api.threatintel.example.com/malicious-ips',
      'https://api.threatintel.example.com/attack-patterns',
    ];

    for (const feed of feeds) {
      const data = await this.fetchThreatData(feed);
      this.processThreatData(data);
    }
  }

  isMaliciousIP(ip: string): boolean {
    return this.maliciousIPs.has(ip);
  }

  matchesThreatPattern(event: SecurityEvent): boolean {
    for (const [name, pattern] of this.threatPatterns) {
      if (this.matchesPattern(event, pattern)) {
        return true;
      }
    }
    return false;
  }
}
```

---

**Document Version**: 1.0  
**Last Updated**: 2025-10-18  
**Next Review**: 2025-11-18  
**Owner**: Security Team