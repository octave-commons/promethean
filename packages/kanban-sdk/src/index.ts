export * from './types.js';

export type PluginKind = 'rules' | 'content' | 'heal' | 'git' | 'index';

export interface PluginMeta {
  name: string;
  version?: string;
  kind: PluginKind;
  description?: string;
}

export interface RulesEngine {
  initialize(config: Record<string, unknown>): Promise<void> | void;
  validateTransition(params: {
    from: string;
    to: string;
    task: import('./types.js').Task;
    board: import('./types.js').Board;
  }): Promise<import('./types.js').TransitionResult> | import('./types.js').TransitionResult;
  normalizeColumnName?(name: string): string;
}

export interface RulesEngineFactory {
  create(config?: Record<string, unknown>): Promise<RulesEngine> | RulesEngine;
}

export const stripTrailingCount = (value: string): string =>
  value.replace(/\s*\(\s*\d+\s*\)\s*$/g, '').trim();

export const normalizeColumnDisplayName = (value: string): string => {
  const trimmed = stripTrailingCount(value.trim());
  return trimmed.length > 0 ? trimmed : 'Todo';
};

export const columnKey = (name: string): string =>
  normalizeColumnDisplayName(name)
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[\s-]+/g, '_')
    .replace(/[^a-z0-9_]+/g, '');

export type PluginRegistryEntry<T> = {
  meta: PluginMeta;
  factory: T;
};

export class PluginRegistry<T = unknown> {
  private plugins: PluginRegistryEntry<T>[] = [];

  register(entry: PluginRegistryEntry<T>): void {
    this.plugins.push(entry);
  }

  list(): PluginRegistryEntry<T>[] {
    return [...this.plugins];
  }
}
