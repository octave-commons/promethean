import { parse } from '@babel/parser';
import type { NodePath } from '@babel/traverse';
import type * as t from '@babel/types';
import { ExtractedData, Import, ProcessingContext } from '../types/index.js';

const traverseModulePromise = import('@babel/traverse');

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
      const { default: traverse } = await traverseModulePromise;

      const handleImportDeclaration = (path: NodePath<any>) => {
        const node = path.node as any;
        if (!node?.source || node.source.type !== 'StringLiteral') {
          return;
        }

        const specifiers = (node.specifiers ?? [])
          .map((spec: any) => {
            if (spec.type === 'ImportDefaultSpecifier') {
              return spec.local?.name;
            }
            if (spec.type === 'ImportSpecifier') {
              if (spec.imported && typeof spec.imported === 'object') {
                return spec.imported.name || spec.local?.name;
              }
              return spec.local?.name;
            }
            if (spec.type === 'ImportNamespaceSpecifier') {
              return `*${spec.local?.name}`;
            }
            return spec.local?.name;
          })
          .filter((name: unknown): name is string => typeof name === 'string' && name.length > 0);

        const importInfo: Import = {
          source: node.source.value,
          specifiers,
          type: this.getImportType(node.specifiers ?? []),
          isTypeOnly: this.isTypeOnlyImport(node),
          lineNumber: node.loc?.start.line,
        };

        imports.push(importInfo);
      };

      const handleDynamicImport = (path: NodePath<any>) => {
        const callExpression = path.node as any;
        if (callExpression.callee?.type !== 'Import') {
          return;
        }

        const [firstArg] = callExpression.arguments ?? [];
        if (!firstArg || firstArg.type !== 'StringLiteral') {
          return;
        }

        const importInfo: Import = {
          source: firstArg.value,
          specifiers: ['dynamic'],
          type: 'default',
          isTypeOnly: false,
          lineNumber: callExpression.loc?.start.line,
        };

        imports.push(importInfo);
      };

      traverse(ast, {
        ImportDeclaration: handleImportDeclaration,
        CallExpression: handleDynamicImport,
      });

      return {
        links: [],
        imports,
        dependencies: [],
        metadata: {
          processingContext: context,
          processedAt: new Date().toISOString(),
          language: 'typescript',
        },
      };
    } catch (error) {
      return {
        links: [],
        imports: [],
        dependencies: [],
        metadata: {
          processingContext: context,
          processedAt: new Date().toISOString(),
          language: 'typescript',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  private getImportType(specifiers: any[]): 'default' | 'named' | 'namespace' {
    if (specifiers.length === 0) return 'named';

    const hasDefault = specifiers.some((s) => s.type === 'ImportDefaultSpecifier');
    const hasNamespace = specifiers.some((s) => s.type === 'ImportNamespaceSpecifier');
    const hasNamed = specifiers.some((s) => s.type === 'ImportSpecifier');

    if (hasNamespace) return 'namespace';
    if (hasDefault && !hasNamed) return 'default';
    return 'named';
  }

  private isTypeOnlyImport(node: any): boolean {
    return (
      node.importKind === 'type' ||
      (node.specifiers && node.specifiers.every((s: any) => s.importKind === 'type'))
    );
  }
}
