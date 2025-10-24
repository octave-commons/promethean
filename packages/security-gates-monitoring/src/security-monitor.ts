import { EventEmitter } from 'events';

export interface SecurityEvent {
  id: string;
  agentId: string;
  type: 'threat' | 'vulnerability' | 'compliance' | 'access' | 'error';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  description: string;
  details: any;
  resolved: boolean;
}

export interface SecurityMetrics {
  totalEvents: number;
  criticalEvents: number;
  highEvents: number;
  mediumEvents: number;
  lowEvents: number;
  unresolvedEvents: number;
  averageResolutionTime: number;
  securityScore: number;
}

export class SecurityMonitor extends EventEmitter {
  private events: Map<string, SecurityEvent> = new Map();
  private monitoringActive: boolean = false;
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor() {
    super();
  }

  async start(): Promise<void> {
    if (this.monitoringActive) {
      return;
    }

    console.log('🔒 Starting Security Monitor...');
    this.monitoringActive = true;

    // Start periodic monitoring
    this.monitoringInterval = setInterval(async () => {
      await this.performSecurityCheck();
    }, 60000); // Every minute

    console.log('✅ Security Monitor started');
    this.emit('monitorStarted');
  }

  async shutdown(): Promise<void> {
    if (!this.monitoringActive) {
      return;
    }

    console.log('🛑 Shutting down Security Monitor...');
    this.monitoringActive = false;

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    console.log('✅ Security Monitor shutdown complete');
    this.emit('monitorStopped');
  }

  async logSecurityEvent(
    event: Omit<SecurityEvent, 'id' | 'timestamp' | 'resolved'>,
  ): Promise<string> {
    const securityEvent: SecurityEvent = {
      id: this.generateEventId(),
      timestamp: new Date(),
      resolved: false,
      ...event,
    };

    this.events.set(securityEvent.id, securityEvent);

    console.log(
      `🚨 Security Event [${securityEvent.severity.toUpperCase()}]: ${securityEvent.description}`,
    );

    this.emit('securityEvent', securityEvent);

    // Auto-resolve low severity events
    if (securityEvent.severity === 'low') {
      await this.resolveEvent(securityEvent.id);
    }

    return securityEvent.id;
  }

  async resolveEvent(eventId: string): Promise<void> {
    const event = this.events.get(eventId);
    if (!event) {
      throw new Error(`Event ${eventId} not found`);
    }

    event.resolved = true;
    this.emit('eventResolved', event);

    console.log(`✅ Security event resolved: ${eventId}`);
  }

  getActiveEvents(): SecurityEvent[] {
    return Array.from(this.events.values()).filter((event) => !event.resolved);
  }

  getEventsByAgent(agentId: string): SecurityEvent[] {
    return Array.from(this.events.values()).filter((event) => event.agentId === agentId);
  }

  getEventsBySeverity(severity: SecurityEvent['severity']): SecurityEvent[] {
    return Array.from(this.events.values()).filter((event) => event.severity === severity);
  }

  getSecurityMetrics(): SecurityMetrics {
    const events = Array.from(this.events.values());
    const activeEvents = events.filter((e) => !e.resolved);

    const totalEvents = events.length;
    const criticalEvents = events.filter((e) => e.severity === 'critical').length;
    const highEvents = events.filter((e) => e.severity === 'high').length;
    const mediumEvents = events.filter((e) => e.severity === 'medium').length;
    const lowEvents = events.filter((e) => e.severity === 'low').length;
    const unresolvedEvents = activeEvents.length;

    // Calculate average resolution time
    const resolvedEvents = events.filter((e) => e.resolved);
    const averageResolutionTime =
      resolvedEvents.length > 0
        ? resolvedEvents.reduce((sum, event) => {
            const resolutionTime = event.timestamp.getTime(); // Simplified - would need actual resolution timestamp
            return sum + resolutionTime;
          }, 0) / resolvedEvents.length
        : 0;

    // Calculate security score (0-10)
    const securityScore = Math.max(
      0,
      10 - (criticalEvents * 2 + highEvents * 1 + mediumEvents * 0.5 + lowEvents * 0.1),
    );

    return {
      totalEvents,
      criticalEvents,
      highEvents,
      mediumEvents,
      lowEvents,
      unresolvedEvents,
      averageResolutionTime,
      securityScore,
    };
  }

  private async performSecurityCheck(): Promise<void> {
    try {
      // Check for unresolved critical events
      const criticalEvents = this.getActiveEvents().filter((e) => e.severity === 'critical');

      if (criticalEvents.length > 0) {
        this.emit('criticalEventsDetected', criticalEvents);
      }

      // Check for event patterns
      await this.analyzeEventPatterns();

      // Update metrics
      const metrics = this.getSecurityMetrics();
      this.emit('metricsUpdated', metrics);
    } catch (error) {
      console.error('❌ Security check failed:', error);
      this.emit('securityCheckError', error);
    }
  }

  private async analyzeEventPatterns(): Promise<void> {
    const recentEvents = Array.from(this.events.values()).filter(
      (event) => !event.resolved && Date.now() - event.timestamp.getTime() < 300000, // Last 5 minutes
    );

    // Detect event spikes
    if (recentEvents.length > 10) {
      await this.logSecurityEvent({
        agentId: 'security-monitor',
        type: 'threat',
        severity: 'high',
        description: `Security event spike detected: ${recentEvents.length} events in last 5 minutes`,
        details: { eventCount: recentEvents.length, timeWindow: '5 minutes' },
      });
    }

    // Detect repeated events from same agent
    const eventsByAgent = new Map<string, SecurityEvent[]>();
    recentEvents.forEach((event) => {
      const agentEvents = eventsByAgent.get(event.agentId) || [];
      agentEvents.push(event);
      eventsByAgent.set(event.agentId, agentEvents);
    });

    for (const [agentId, agentEvents] of eventsByAgent) {
      if (agentEvents.length > 5) {
        await this.logSecurityEvent({
          agentId,
          type: 'threat',
          severity: 'medium',
          description: `Multiple security events from agent: ${agentEvents.length} events`,
          details: { agentId, eventCount: agentEvents.length },
        });
      }
    }
  }

  private generateEventId(): string {
    return `sec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Public API for external systems
  async getSecurityReport(): Promise<any> {
    const metrics = this.getSecurityMetrics();
    const activeEvents = this.getActiveEvents();
    const recentEvents = Array.from(this.events.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 50);

    return {
      timestamp: new Date(),
      metrics,
      activeEvents: activeEvents.length,
      criticalActiveEvents: activeEvents.filter((e) => e.severity === 'critical').length,
      recentEvents: recentEvents.map((e) => ({
        id: e.id,
        agentId: e.agentId,
        type: e.type,
        severity: e.severity,
        description: e.description,
        timestamp: e.timestamp,
        resolved: e.resolved,
      })),
    };
  }
}
