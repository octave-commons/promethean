import { parse } from '@babel/parser'
import traverse from '@babel/traverse'
import { ExtractedData, Import, ProcessingContext } from '../../types/index.js'

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
          'optionalChaining'
        ]
      })

      const imports: Import[] = []

      traverse(ast, {
        ImportDeclaration(path) {
          const node = path.node
          if (node.source && node.specifiers) {
            const specifiers = node.specifiers.map(spec => {
              if (spec.type === 'ImportDefaultSpecifier') {
                return spec.local.name
              } else if (spec.type === 'ImportSpecifier') {
                return spec.imported?.name || spec.local.name
              } else if (spec.type === 'ImportNamespaceSpecifier') {
                return `*${spec.local.name}`
              }
              return spec.local.name
            }).filter(Boolean)

            const importInfo: Import = {
              source: node.source.value,
              specifiers,
              type: this.getImportType(node.specifiers),
              isTypeOnly: this.isTypeOnlyImport(node),
              lineNumber: node.loc?.start.line
            }

            imports.push(importInfo)
          }
        },

        CallExpression(path) {
          if (path.node.callee.type === 'Import') {
            const args = path.node.arguments
            if (args.length > 0 && args[0].type === 'StringLiteral') {
              const importInfo: Import = {
                source: args[0].value,
                specifiers: ['dynamic'],
                type: 'default',
                isTypeOnly: false,
                lineNumber: path.node.loc?.start.line
              }
              imports.push(importInfo)
            }
          }
        }
      })

      return {
        links: [],
        imports,
        dependencies: [],
        metadata: {
          processingContext: context,
          processedAt: new Date().toISOString(),
          language: 'typescript'
        }
      }
    } catch (error) {
      return {
        links: [],
        imports: [],
        dependencies: [],
        metadata: {
          processingContext: context,
          processedAt: new Date().toISOString(),
          language: 'typescript',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }
  }

  private getImportType(specifiers: any[]): 'default' | 'named' | 'namespace' {
    if (specifiers.length === 0) return 'named'
    
    const hasDefault = specifiers.some(s => s.type === 'ImportDefaultSpecifier')
    const hasNamespace = specifiers.some(s => s.type === 'ImportNamespaceSpecifier')
    const hasNamed = specifiers.some(s => s.type === 'ImportSpecifier')

    if (hasNamespace) return 'namespace'
    if (hasDefault && !hasNamed) return 'default'
    return 'named'
  }

  private isTypeOnlyImport(node: any): boolean {
    return node.importKind === 'type' || 
           (node.specifiers && node.specifiers.every((s: any) => s.importKind === 'type'))
  }
}