/**
 * Workflow system types for the Pantheon Agent Framework
 */

export type WorkflowId = {
  readonly value: string;
  readonly type: 'uuid' | 'name';
};

export type WorkflowDefinition = {
  readonly id: WorkflowId;
  readonly name: string;
  readonly description: string;
  readonly version: string;
  readonly nodes: readonly WorkflowNode[];
  readonly edges: readonly WorkflowEdge[];
  readonly metadata: WorkflowMetadata;
};

export type WorkflowNode = {
  readonly id: string;
  readonly type: 'agent' | 'condition' | 'parallel' | 'sequence' | 'data';
  readonly name: string;
  readonly config: unknown;
  readonly position?: { readonly x: number; readonly y: number };
};

export type WorkflowEdge = {
  readonly id: string;
  readonly from: string;
  readonly to: string;
  readonly condition?: string;
  readonly label?: string;
};

export type WorkflowMetadata = {
  readonly author?: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly tags?: readonly string[];
  readonly category?: string;
};

export type WorkflowExecution = {
  readonly id: string;
  readonly workflowId: WorkflowId;
  readonly status: ExecutionStatus;
  readonly startedAt: Date;
  readonly completedAt?: Date;
  readonly currentNode?: string;
  readonly context: Readonly<Record<string, unknown>>;
  readonly error?: string;
};

export enum ExecutionStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}
