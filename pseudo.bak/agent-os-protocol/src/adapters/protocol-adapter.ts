/**
 * Protocol Adapters for Agent OS Core Message Protocol
 * Provides compatibility with existing Agent Bus, Omni, and Enso protocols
 */

import {
  CoreMessage,
  MessageType,
  Priority,
  QoSLevel,
  AgentAddress,
  MessagePayload,
  MessageMetadata,
  CrisisMessage,
  CrisisLevel,
} from '../core/types';

// ============================================================================
// Existing Protocol Message Types (for compatibility)
// ============================================================================

export interface AgentBusMessage {
  id: string;
  type: string;
  sender: string;
  recipient: string;
  payload: any;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface OmniMessage {
  messageId: string;
  messageType: string;
  source: string;
  destination: string;
  content: any;
  createdAt: string;
  headers?: Record<string, string>;
}

export interface EnsoMessage {
  uuid: string;
  action: string;
  actor: string;
  target: string;
  data: any;
  timestamp: string;
  context?: Record<string, any>;
}

// ============================================================================
// Base Protocol Adapter
// ============================================================================

export abstract class ProtocolAdapter<T> {
  abstract toCoreMessage(message: T): CoreMessage;
  abstract fromCoreMessage(coreMessage: CoreMessage): T;

  protected generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  protected createAgentAddress(address: string): AgentAddress {
    // Parse address string into AgentAddress components
    // Expected format: "agent://namespace.domain/version/id" or simple "id"
    if (address.startsWith('agent://')) {
      const url = new URL(address);
      const parts = url.pathname.split('/').filter(Boolean);
      return {
        id: parts[parts.length - 1] || url.hostname,
        namespace: url.hostname.split('.')[0] || 'default',
        domain: url.hostname.split('.').slice(1).join('.') || 'default',
        version: parts.length > 1 ? parts[0] : undefined,
        endpoint: address,
      };
    }

    return {
      id: address,
      namespace: 'default',
      domain: 'default',
    };
  }

  protected createMessagePayload(data: any, type: string = 'json'): MessagePayload {
    return {
      type,
      data,
      encoding: 'json',
      compression: 'none',
      size: JSON.stringify(data).length,
    };
  }

  protected createMessageMetadata(metadata?: Record<string, any>): MessageMetadata {
    return {
      source: 'protocol-adapter',
      tags: ['adapted'],
      custom: metadata,
    };
  }
}

// ============================================================================
// Agent Bus Adapter
// ============================================================================

export class AgentBusAdapter extends ProtocolAdapter<AgentBusMessage> {
  toCoreMessage(message: AgentBusMessage): CoreMessage {
    return {
      id: message.id || this.generateId(),
      version: '1.0.0',
      type: this.mapMessageType(message.type),
      timestamp: new Date(message.timestamp).toISOString(),
      sender: this.createAgentAddress(message.sender),
      recipient: this.createAgentAddress(message.recipient),
      capabilities: [],
      payload: this.createMessagePayload(message.payload, message.type),
      metadata: this.createMessageMetadata(message.metadata),
      headers: {},
      priority: Priority.NORMAL,
      qos: QoSLevel.AT_LEAST_ONCE,
    };
  }

  fromCoreMessage(coreMessage: CoreMessage): AgentBusMessage {
    return {
      id: coreMessage.id,
      type: coreMessage.type,
      sender: coreMessage.sender.id,
      recipient: coreMessage.recipient.id,
      payload: coreMessage.payload.data,
      timestamp: new Date(coreMessage.timestamp).getTime(),
      metadata: {
        ...coreMessage.metadata.custom,
        priority: coreMessage.priority,
        qos: coreMessage.qos,
      },
    };
  }

  private mapMessageType(type: string): MessageType {
    const typeMap: Record<string, MessageType> = {
      request: MessageType.REQUEST,
      response: MessageType.RESPONSE,
      event: MessageType.EVENT,
      error: MessageType.ERROR,
      heartbeat: MessageType.HEARTBEAT,
      register: MessageType.AGENT_REGISTER,
      unregister: MessageType.AGENT_UNREGISTER,
      status: MessageType.AGENT_STATUS,
    };

    return typeMap[type.toLowerCase()] || MessageType.EVENT;
  }
}

// ============================================================================
// Omni Protocol Adapter
// ============================================================================

export class OmniAdapter extends ProtocolAdapter<OmniMessage> {
  toCoreMessage(message: OmniMessage): CoreMessage {
    return {
      id: message.messageId || this.generateId(),
      version: '1.0.0',
      type: this.mapMessageType(message.messageType),
      timestamp: message.createdAt,
      sender: this.createAgentAddress(message.source),
      recipient: this.createAgentAddress(message.destination),
      capabilities: [],
      payload: this.createMessagePayload(message.content, message.messageType),
      metadata: this.createMessageMetadata({ headers: message.headers }),
      headers: message.headers || {},
      priority: Priority.NORMAL,
      qos: QoSLevel.AT_LEAST_ONCE,
    };
  }

  fromCoreMessage(coreMessage: CoreMessage): OmniMessage {
    return {
      messageId: coreMessage.id,
      messageType: coreMessage.type,
      source: coreMessage.sender.id,
      destination: coreMessage.recipient.id,
      content: coreMessage.payload.data,
      createdAt: coreMessage.timestamp,
      headers: {
        ...coreMessage.headers,
        priority: coreMessage.priority.toString(),
        qos: coreMessage.qos.toString(),
      },
    };
  }

  private mapMessageType(type: string): MessageType {
    const typeMap: Record<string, MessageType> = {
      command: MessageType.REQUEST,
      query: MessageType.REQUEST,
      response: MessageType.RESPONSE,
      notification: MessageType.EVENT,
      error: MessageType.ERROR,
      heartbeat: MessageType.HEARTBEAT,
      discovery: MessageType.DISCOVERY,
    };

    return typeMap[type.toLowerCase()] || MessageType.EVENT;
  }
}

// ============================================================================
// Enso Protocol Adapter
// ============================================================================

export class EnsoAdapter extends ProtocolAdapter<EnsoMessage> {
  toCoreMessage(message: EnsoMessage): CoreMessage {
    return {
      id: message.uuid || this.generateId(),
      version: '1.0.0',
      type: this.mapMessageType(message.action),
      timestamp: message.timestamp,
      sender: this.createAgentAddress(message.actor),
      recipient: this.createAgentAddress(message.target),
      capabilities: [],
      payload: this.createMessagePayload(message.data, message.action),
      metadata: this.createMessageMetadata(message.context),
      headers: {},
      priority: Priority.NORMAL,
      qos: QoSLevel.AT_LEAST_ONCE,
    };
  }

  fromCoreMessage(coreMessage: CoreMessage): EnsoMessage {
    return {
      uuid: coreMessage.id,
      action: coreMessage.type,
      actor: coreMessage.sender.id,
      target: coreMessage.recipient.id,
      data: coreMessage.payload.data,
      timestamp: coreMessage.timestamp,
      context: {
        ...coreMessage.metadata.custom,
        priority: coreMessage.priority,
        qos: coreMessage.qos,
      },
    };
  }

  private mapMessageType(action: string): MessageType {
    const typeMap: Record<string, MessageType> = {
      invoke: MessageType.REQUEST,
      respond: MessageType.RESPONSE,
      emit: MessageType.EVENT,
      error: MessageType.ERROR,
      ping: MessageType.HEARTBEAT,
      register: MessageType.AGENT_REGISTER,
      unregister: MessageType.AGENT_UNREGISTER,
    };

    return typeMap[action.toLowerCase()] || MessageType.EVENT;
  }
}

// ============================================================================
// Crisis Message Adapter
// ============================================================================

export class CrisisMessageAdapter {
  static toCoreMessage(crisis: CrisisMessage): CoreMessage {
    return {
      id: crisis.id,
      version: '1.0.0',
      type: MessageType.CRISIS_COORDINATION,
      timestamp: new Date().toISOString(),
      sender: {
        id: 'crisis-coordinator',
        namespace: 'system',
        domain: 'coordination',
      },
      recipient: {
        id: 'all-agents',
        namespace: 'system',
        domain: '*',
      },
      capabilities: ['crisis-management'],
      payload: {
        type: 'crisis',
        data: crisis,
      },
      metadata: {
        source: 'crisis-coordinator',
        tags: ['crisis', 'emergency'],
        custom: {
          crisisType: crisis.type,
          crisisLevel: crisis.level,
          coordinationId: crisis.coordinationId,
        },
      },
      headers: {
        'X-Crisis-Type': crisis.type,
        'X-Crisis-Level': crisis.level,
        'X-Coordination-Id': crisis.coordinationId,
      },
      priority: this.mapCrisisPriority(crisis.level),
      qos: QoSLevel.EXACTLY_ONCE,
      deadline: crisis.deadline,
    };
  }

  static fromCoreMessage(message: CoreMessage): CrisisMessage | null {
    if (message.type !== MessageType.CRISIS_COORDINATION) {
      return null;
    }

    const crisisData = message.payload.data as CrisisMessage;
    return {
      id: message.id,
      type: crisisData.type,
      level: crisisData.level,
      coordinationId: crisisData.coordinationId,
      affectedAgents: crisisData.affectedAgents,
      requiredActions: crisisData.requiredActions,
      deadline: crisisData.deadline,
      metadata: crisisData.metadata,
    };
  }

  private static mapCrisisPriority(level: CrisisLevel): Priority {
    const priorityMap: Record<CrisisLevel, Priority> = {
      [CrisisLevel.LOW]: Priority.LOW,
      [CrisisLevel.MEDIUM]: Priority.NORMAL,
      [CrisisLevel.HIGH]: Priority.HIGH,
      [CrisisLevel.CRITICAL]: Priority.CRITICAL,
      [CrisisLevel.SYSTEM_EMERGENCY]: Priority.CRITICAL,
    };

    return priorityMap[level] || Priority.NORMAL;
  }
}

// ============================================================================
// Universal Protocol Adapter
// ============================================================================

export class UniversalProtocolAdapter {
  private adapters: Map<string, ProtocolAdapter<any>> = new Map();

  constructor() {
    this.adapters.set('agent-bus', new AgentBusAdapter());
    this.adapters.set('omni', new OmniAdapter());
    this.adapters.set('enso', new EnsoAdapter());
  }

  toCoreMessage(message: any, protocol: string): CoreMessage {
    const adapter = this.adapters.get(protocol);
    if (!adapter) {
      throw new Error(`Unsupported protocol: ${protocol}`);
    }

    return adapter.toCoreMessage(message);
  }

  fromCoreMessage(coreMessage: CoreMessage, protocol: string): any {
    const adapter = this.adapters.get(protocol);
    if (!adapter) {
      throw new Error(`Unsupported protocol: ${protocol}`);
    }

    return adapter.fromCoreMessage(coreMessage);
  }

  detectProtocol(message: any): string {
    // Auto-detect protocol based on message structure
    if (message.messageId && message.messageType && message.source && message.destination) {
      return 'omni';
    }

    if (message.uuid && message.action && message.actor && message.target) {
      return 'enso';
    }

    if (message.id && message.type && message.sender && message.recipient) {
      return 'agent-bus';
    }

    throw new Error('Unable to detect protocol from message structure');
  }

  autoConvert(message: any): CoreMessage {
    const protocol = this.detectProtocol(message);
    return this.toCoreMessage(message, protocol);
  }
}

// ============================================================================
// Emergency Crisis System
// ============================================================================

export class EmergencyCrisisSystem {
  private adapters: Map<string, ProtocolAdapter<any>> = new Map();
  private universalAdapter = new UniversalProtocolAdapter();

  constructor(adapter?: ProtocolAdapter<any>) {
    if (adapter) {
      this.adapters.set('default', adapter);
    }
  }

  async handleCrisisMessage(crisis: CrisisMessage): Promise<void> {
    // Broadcast to all agents
    console.log(`[CRISIS] Broadcasting crisis: ${crisis.type} (${crisis.level})`);
    console.log(`[CRISIS] Affected agents: ${crisis.affectedAgents.length}`);
    console.log(`[CRISIS] Required actions: ${crisis.requiredActions.join(', ')}`);
    console.log(`[CRISIS] Deadline: ${crisis.deadline}`);

    // Implementation would actually send the message to agents
    // For now, we just log the crisis details
  }

  async consolidateDuplicateTasks(coordinationId: string): Promise<any> {
    console.log(`[CRISIS] Consolidating duplicate tasks for: ${coordinationId}`);

    // Simulate task consolidation
    const reduction = Math.floor(Math.random() * 50) + 50; // 50-100 tasks
    const timeSavings = reduction * 5; // 5 minutes per task

    return {
      coordinationId,
      reduction,
      timeSavings,
      status: 'completed',
    };
  }

  async distributeWorkload(coordinationId: string, tasks: any[]): Promise<any> {
    console.log(`[CRISIS] Distributing workload for: ${coordinationId}`);
    console.log(`[CRISIS] Tasks to distribute: ${tasks.length}`);

    // Simulate workload distribution
    const assignedTasks = Math.floor(tasks.length * 0.8);

    return {
      coordinationId,
      totalTasks: tasks.length,
      assignedTasks,
      status: 'completed',
    };
  }

  addAdapter(name: string, adapter: ProtocolAdapter<any>): void {
    this.adapters.set(name, adapter);
  }

  getAdapter(name: string): ProtocolAdapter<any> | undefined {
    return this.adapters.get(name);
  }

  getUniversalAdapter(): UniversalProtocolAdapter {
    return this.universalAdapter;
  }
}
