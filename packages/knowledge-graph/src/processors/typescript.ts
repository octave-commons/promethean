import { parse } from '@babel/parser';
import type { NodePath } from '@babel/traverse';
import { ExtractedData, Import, ProcessingContext } from '../types/index.js';

const traverseModulePromise = import('@babel/traverse');
type TraverseFn = (
  node: unknown,
  opts?: Record<string, unknown>,
  scope?: unknown,
  state?: unknown,
  parentPath?: unknown,
) => void;

export class TypeScriptProcessor {
  async process(content: string, context: ProcessingContext): Promise<ExtractedData> {
    try {
      const ast = parse(content, {
        sourceType: 'module',
        plugins: [
          'typescript',
          'jsx',
          'decorators-legacy',
          'classProperties',
          'objectRestSpread',
          'asyncGenerators',
          'functionBind',
          'exportDefaultFrom',
          'exportNamespaceFrom',
          'dynamicImport',
          'nullishCoalescingOperator',
          'optionalChaining',
        ],
      });

      const imports: Import[] = [];
      const traverseModule = await traverseModulePromise;
      const traverseFn: TraverseFn = (
        (traverseModule as unknown as { default?: TraverseFn }).default ?? traverseModule
      ) as TraverseFn;

  }
}
