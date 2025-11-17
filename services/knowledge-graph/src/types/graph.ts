export interface GraphNode {
  readonly id: string;
  readonly type: NodeType;
  readonly data: NodeData;
  readonly metadata: NodeMetadata;
}

export type NodeType =
  | 'documentation'
  | 'code'
  | 'package'
  | 'repository'
  | 'web_resource'
  | 'person'
  | 'project';

export interface NodeData {
  readonly title?: string;
  readonly content?: string;
  readonly url?: string;
  readonly filePath?: string;
  readonly language?: string;
  readonly description?: string;
  readonly [key: string]: unknown;
}

export interface NodeMetadata {
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly source: string;
  readonly checksum?: string;
  readonly size?: number;
  readonly [key: string]: unknown;
}

export interface GraphEdge {
  readonly id: string;
  readonly source: string;
  readonly target: string;
  readonly type: EdgeType;
  readonly data: EdgeData;
}

export type EdgeType =
  | 'links_to'
  | 'references'
  | 'imports'
  | 'depends_on'
  | 'contains'
  | 'authored_by'
  | 'belongs_to';

export interface EdgeData {
  readonly strength?: number;
  readonly context?: string;
  readonly lineNumbers?: number[];
  readonly [key: string]: unknown;
}

export interface GraphData {
  readonly nodes: readonly GraphNode[];
  readonly edges: readonly GraphEdge[];
}

export interface ProcessingContext {
  readonly repositoryPath: string;
  readonly filePath: string;
  readonly branch?: string;
  readonly commit?: string;
}

export interface ExtractionMetadata extends Record<string, unknown> {
  readonly processingContext?: ProcessingContext;
  readonly processedAt?: string;
  readonly packageName?: string;
  readonly packageVersion?: string;
  readonly skipped?: boolean;
  readonly reason?: string;
  readonly error?: string;
}

export interface ExtractedData {
  readonly links: readonly Link[];
  readonly imports: readonly Import[];
  readonly dependencies: readonly Dependency[];
  readonly metadata: ExtractionMetadata;
}

export interface Link {
  readonly url: string;
  readonly text: string;
  readonly type: 'markdown' | 'wikilink' | 'external';
  readonly lineNumber?: number;
}

export interface Import {
  readonly source: string;
  readonly specifiers: readonly string[];
  readonly type: 'default' | 'named' | 'namespace';
  readonly isTypeOnly: boolean;
  readonly lineNumber?: number;
}

export interface Dependency {
  readonly name: string;
  readonly version: string;
  readonly type: 'dependencies' | 'devDependencies' | 'peerDependencies';
  readonly resolved?: string;
}

export interface ValidationResult {
  readonly isValid: boolean;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
}

export interface NormalizedData {
  readonly nodes: readonly GraphNode[];
  readonly edges: readonly GraphEdge[];
}
