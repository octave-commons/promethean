import { GraphNode, GraphEdge, ProcessingContext, ExtractedData } from './types/index.js'
import { GraphRepository } from './database/repository.js'
import { ContentProcessor } from './processors/content.js'
import { DependencyProcessor } from './processors/dependency.js'
import { randomUUID } from 'crypto'
import { normalize, join, resolve, relative } from 'path'
import { Logger } from './utils/logger.js'

export class KnowledgeGraphBuilder {
  private contentProcessor = new ContentProcessor()
  private dependencyProcessor = new DependencyProcessor()
  private readonly logger = Logger.getInstance()

  constructor(private readonly repository: GraphRepository) {}

  async buildRepositoryGraph(repositoryPath: string): Promise<void> {
    try {
      this.logger.info('KnowledgeGraphBuilder', 'Starting repository graph build', { repositoryPath })

      const extractedData = await this.contentProcessor.processRepository(repositoryPath)
      
      let successCount = 0
      let errorCount = 0
      
      for (const data of extractedData) {
        try {
          await this.processExtractedData(data)
          successCount++
        } catch (error) {
          errorCount++
          this.logger.error('KnowledgeGraphBuilder', 'Failed to process extracted data', {
            filePath: data.metadata.processingContext?.filePath,
            error: error instanceof Error ? error.message : 'Unknown error'
          }, error as Error)
        }
      }

      this.logger.info('KnowledgeGraphBuilder', 'Repository graph build completed', {
        totalFiles: extractedData.length,
        successCount,
        errorCount,
        repositoryPath
      })
    } catch (error) {
      this.logger.error('KnowledgeGraphBuilder', 'Failed to build repository graph', { repositoryPath }, error as Error)
      throw error
    }
  }

  async processFile(filePath: string, repositoryPath: string): Promise<void> {
    try {
      this.logger.debug('KnowledgeGraphBuilder', 'Processing single file', { filePath, repositoryPath })
      
      const extractedData = await this.contentProcessor.processFile(filePath, repositoryPath)
      await this.processExtractedData(extractedData)
      
      this.logger.debug('KnowledgeGraphBuilder', 'Successfully processed file', { filePath })
    } catch (error) {
      this.logger.error('KnowledgeGraphBuilder', 'Failed to process file', { filePath, repositoryPath }, error as Error)
      throw error
    }
  }

  private async processExtractedData(data: ExtractedData): Promise<void> {
    const context = data.metadata.processingContext as ProcessingContext
    
    const fileNode = this.createFileNode(context)
    this.repository.createNode(fileNode)

    for (const link of data.links) {
      await this.processLink(link, fileNode, context)
    }

    for (const import_ of data.imports) {
      await this.processImport(import_, fileNode, context)
    }

    for (const dependency of data.dependencies) {
      await this.processDependency(dependency, fileNode, context)
    }
  }

  private createFileNode(context: ProcessingContext): GraphNode {
    const relativePath = context.filePath.replace(context.repositoryPath, '').replace(/^\//, '')
    const extension = context.filePath.split('.').pop()?.toLowerCase()
    
    let nodeType: GraphNode['type'] = 'code'
    if (extension === 'md' || extension === 'markdown') {
      nodeType = 'documentation'
    }

    return {
      id: `file:${relativePath}`,
      type: nodeType,
      data: {
        title: relativePath.split('/').pop() || relativePath,
        filePath: relativePath,
        language: this.getLanguageFromExtension(extension)
      },
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        source: context.repositoryPath
      }
    }
  }

  private async processLink(link: ExtractedData['links'][0], sourceNode: GraphNode, context: ProcessingContext): Promise<void> {
    let targetNode: GraphNode

    if (link.type === 'wikilink') {
      targetNode = this.createWikilinkNode(link)
    } else if (link.type === 'external') {
      targetNode = this.createWebResourceNode(link)
    } else {
      targetNode = this.createMarkdownLinkNode(link, context)
    }

    this.repository.createNode(targetNode)

    const edge: GraphEdge = {
      id: randomUUID(),
      source: sourceNode.id,
      target: targetNode.id,
      type: 'links_to',
      data: {
        text: link.text,
        lineNumber: link.lineNumber
      }
    }

    this.repository.createEdge(edge)
  }

  private async processImport(import_: ExtractedData['imports'][0], sourceNode: GraphNode, context: ProcessingContext): Promise<void> {
    const targetNode = this.createImportNode(import_, context)
    this.repository.createNode(targetNode)

    const edge: GraphEdge = {
      id: randomUUID(),
      source: sourceNode.id,
      target: targetNode.id,
      type: 'imports',
      data: {
        specifiers: import_.specifiers,
        isTypeOnly: import_.isTypeOnly,
        lineNumber: import_.lineNumber
      }
    }

    this.repository.createEdge(edge)
  }

  private async processDependency(dependency: ExtractedData['dependencies'][0], sourceNode: GraphNode, context: ProcessingContext): Promise<void> {
    const targetNode = this.createPackageNode(dependency)
    this.repository.createNode(targetNode)

    const edge: GraphEdge = {
      id: randomUUID(),
      source: sourceNode.id,
      target: targetNode.id,
      type: 'depends_on',
      data: {
        version: dependency.version,
        dependencyType: dependency.type
      }
    }

    this.repository.createEdge(edge)
  }

  private createWikilinkNode(link: ExtractedData['links'][0]): GraphNode {
    return {
      id: `wikilink:${link.url}`,
      type: 'documentation',
      data: {
        title: link.text || link.url,
        url: link.url
      },
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        source: 'wikilink'
      }
    }
  }

  private createWebResourceNode(link: ExtractedData['links'][0]): GraphNode {
    return {
      id: `web:${link.url}`,
      type: 'web_resource',
      data: {
        title: link.text,
        url: link.url
      },
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        source: 'external-link'
      }
    }
  }

  private createMarkdownLinkNode(link: ExtractedData['links'][0], context: ProcessingContext): GraphNode {
    const resolvedPath = this.resolveRelativePath(link.url, context)
    return {
      id: `file:${resolvedPath}`,
      type: 'documentation',
      data: {
        title: link.text || link.url,
        filePath: resolvedPath
      },
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        source: context.repositoryPath
      }
    }
  }

  private createImportNode(import_: ExtractedData['imports'][0], context: ProcessingContext): GraphNode {
    const resolvedPath = this.resolveImportPath(import_.source, context)
    return {
      id: `module:${resolvedPath}`,
      type: 'code',
      data: {
        title: import_.source,
        filePath: resolvedPath
      },
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        source: 'import'
      }
    }
  }

  private createPackageNode(dependency: ExtractedData['dependencies'][0]): GraphNode {
    return {
      id: `package:${dependency.name}`,
      type: 'package',
      data: {
        title: dependency.name,
        version: dependency.version,
        resolved: dependency.resolved
      },
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        source: 'npm'
      }
    }
  }

  private resolveRelativePath(url: string, context: ProcessingContext): string {
    // Validate input
    if (!url || typeof url !== 'string') {
      throw new Error('Invalid URL: must be a non-empty string')
    }

    // Prevent path traversal attacks
    if (url.includes('..') || url.includes('~') || url.includes('$')) {
      throw new Error('Invalid URL: contains potentially dangerous path components')
    }

    let resolvedPath: string
    
    if (url.startsWith('/')) {
      // Absolute path - remove leading slash and validate
      const cleanPath = url.slice(1)
      if (cleanPath.includes('..') || cleanPath.includes('~')) {
        throw new Error('Invalid URL: absolute path contains dangerous components')
      }
      resolvedPath = cleanPath
    } else {
      // Relative path - resolve against current file directory
      const currentDir = normalize(context.filePath.split('/').slice(0, -1).join('/'))
      const joinedPath = normalize(join(currentDir, url))
      
      // Ensure the resolved path stays within the repository
      const repoRoot = normalize(context.repositoryPath)
      const relativePath = relative(repoRoot, joinedPath)
      
      if (relativePath.startsWith('..') || relativePath.startsWith('..\\')) {
        throw new Error('Invalid URL: path traversal attempt detected')
      }
      
      resolvedPath = relativePath
    }

    // Final validation
    if (!resolvedPath || resolvedPath.length === 0) {
      throw new Error('Invalid URL: resolved to empty path')
    }

    return normalize(resolvedPath)
  }

  private resolveImportPath(source: string, context: ProcessingContext): string {
    // Validate input
    if (!source || typeof source !== 'string') {
      throw new Error('Invalid import source: must be a non-empty string')
    }

    // Prevent path traversal attacks
    if (source.includes('..') || source.includes('~') || source.includes('$')) {
      throw new Error('Invalid import source: contains potentially dangerous path components')
    }

    let resolvedPath: string
    
    if (source.startsWith('.')) {
      // Relative import - resolve against current file directory
      const currentDir = normalize(context.filePath.split('/').slice(0, -1).join('/'))
      const joinedPath = normalize(join(currentDir, source))
      
      // Ensure the resolved path stays within the repository
      const repoRoot = normalize(context.repositoryPath)
      const relativePath = relative(repoRoot, joinedPath)
      
      if (relativePath.startsWith('..') || relativePath.startsWith('..\\')) {
        throw new Error('Invalid import source: path traversal attempt detected')
      }
      
      resolvedPath = relativePath
    } else {
      // External module or absolute import
      // For external modules, return as-is (they'll be handled differently)
      if (!source.startsWith('/')) {
        return source
      }
      
      // Absolute path - validate and normalize
      const cleanPath = normalize(source.slice(1))
      if (cleanPath.includes('..') || cleanPath.includes('~')) {
        throw new Error('Invalid import source: absolute path contains dangerous components')
      }
      resolvedPath = cleanPath
    }

    // Final validation
    if (!resolvedPath || resolvedPath.length === 0) {
      throw new Error('Invalid import source: resolved to empty path')
    }

    return normalize(resolvedPath)
  }

  private getLanguageFromExtension(extension?: string): string | undefined {
    const languageMap: Record<string, string> = {
      'ts': 'typescript',
      'tsx': 'typescript',
      'js': 'javascript',
      'jsx': 'javascript',
      'md': 'markdown',
      'markdown': 'markdown'
    }
    return extension ? languageMap[extension] : undefined
  }
}