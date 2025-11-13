export interface DatabaseConfig {
  readonly path: string;
  readonly readonly?: boolean;
  readonly verbose?: boolean | ((message?: unknown, ...optionalParams: unknown[]) => void);
}

export interface DatabaseSchema {
  readonly version: string;
  readonly tables: readonly TableSchema[];
}

export interface TableSchema {
  readonly name: string;
  readonly columns: readonly ColumnSchema[];
  readonly indexes: readonly IndexSchema[];
}

export interface ColumnSchema {
  readonly name: string;
  readonly type: string;
  readonly nullable: boolean;
  readonly primaryKey?: boolean;
  readonly unique?: boolean;
  readonly defaultValue?: string;
}

export interface IndexSchema {
  readonly name: string;
  readonly columns: readonly string[];
  readonly unique?: boolean;
}

export interface QueryOptions {
  readonly limit?: number;
  readonly offset?: number;
  readonly orderBy?: string;
  readonly filters?: Record<string, unknown>;
}

export interface GraphQueryResult {
  readonly nodes: readonly GraphNode[];
  readonly edges: readonly GraphEdge[];
  readonly totalCount: number;
  readonly hasMore: boolean;
}

export interface AnalyticsResult {
  readonly nodeCount: number;
  readonly edgeCount: number;
  readonly nodeTypeDistribution: Record<NodeType, number>;
  readonly edgeTypeDistribution: Record<EdgeType, number>;
  readonly topConnectedNodes: readonly GraphNode[];
  readonly circularDependencies: readonly string[][];
}

import type { GraphNode, GraphEdge, NodeType, EdgeType } from './graph.js';
