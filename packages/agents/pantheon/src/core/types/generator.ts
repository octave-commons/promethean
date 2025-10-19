/**
 * Agent generator types for the Pantheon Agent Framework
 */

export type AgentTemplate = {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly category: string;
  readonly template: string;
  readonly variables: readonly TemplateVariable[];
  readonly metadata: Readonly<Record<string, unknown>>;
};

export type TemplateVariable = {
  readonly name: string;
  readonly type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  readonly description: string;
  readonly required: boolean;
  readonly default?: unknown;
};

export type GenerationConfig = {
  readonly templateId: string;
  readonly variables: Readonly<Record<string, unknown>>;
  readonly outputPath: string;
  readonly options: GenerationOptions;
};

export type GenerationOptions = {
  readonly format: 'typescript' | 'javascript' | 'clojure' | 'json';
  readonly includeTests: boolean;
  readonly includeDocs: boolean;
  readonly overwrite: boolean;
};
