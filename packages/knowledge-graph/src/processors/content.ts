import { readFile } from 'fs/promises'
import { resolve, extname, normalize } from 'path'
import { glob } from 'glob'
import { ProcessingContext, ExtractedData } from '../types/index.js'
import { MarkdownProcessor } from './markdown.js'
import { TypeScriptProcessor } from './typescript.js'
import { Logger } from '../utils/logger.js'

export class ContentProcessor {
  private markdownProcessor = new MarkdownProcessor()
  private typescriptProcessor = new TypeScriptProcessor()
  private readonly logger = Logger.getInstance()

  async processRepository(repositoryPath: string): Promise<ExtractedData[]> {
    // Input validation
    if (!repositoryPath || typeof repositoryPath !== 'string') {
      throw new Error('Invalid repository path: must be a non-empty string')
    }

    // Normalize and validate repository path
    const normalizedRepoPath = normalize(repositoryPath)
    if (normalizedRepoPath.includes('..') || normalizedRepoPath.includes('~')) {
      throw new Error('Invalid repository path: contains potentially dangerous components')
    }

    const files = await this.discoverFiles(normalizedRepoPath)
    const results: ExtractedData[] = []

    for (const filePath of files) {
      // Validate each file path
      if (!filePath || typeof filePath !== 'string') {
        continue // Skip invalid file paths
      }

      const normalizedFilePath = normalize(filePath)
      
      // Ensure file is within repository bounds
      if (!normalizedFilePath.startsWith(normalizedRepoPath)) {
        console.warn(`Skipping file outside repository bounds: ${filePath}`)
        continue
      }

      const context: ProcessingContext = {
        repositoryPath: normalizedRepoPath,
        filePath: normalizedFilePath
      }

      try {
        const content = await readFile(filePath, 'utf-8')
        const extracted = await this.processContent(content, context)
        results.push(extracted)
      } catch (error) {
        this.logger.warn('ContentProcessor', 'Failed to process file', { 
          filePath, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        })
        
        results.push({
          links: [],
          imports: [],
          dependencies: [],
          metadata: {
            processingContext: context,
            processedAt: new Date().toISOString(),
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        })
      }
    }

    return results
  }

  async processFile(filePath: string, repositoryPath: string): Promise<ExtractedData> {
    // Input validation
    if (!filePath || typeof filePath !== 'string') {
      throw new Error('Invalid file path: must be a non-empty string')
    }
    if (!repositoryPath || typeof repositoryPath !== 'string') {
      throw new Error('Invalid repository path: must be a non-empty string')
    }

    // Normalize and validate paths
    const normalizedFilePath = normalize(filePath)
    const normalizedRepoPath = normalize(repositoryPath)

    // Check for dangerous path components
    if (normalizedFilePath.includes('..') || normalizedFilePath.includes('~') ||
        normalizedRepoPath.includes('..') || normalizedRepoPath.includes('~')) {
      throw new Error('Invalid paths: contain potentially dangerous components')
    }

    // Ensure file is within repository bounds
    if (!normalizedFilePath.startsWith(normalizedRepoPath)) {
      throw new Error('File path is outside repository bounds')
    }

    const context: ProcessingContext = {
      repositoryPath: normalizedRepoPath,
      filePath: normalizedFilePath
    }

    try {
      const content = await readFile(filePath, 'utf-8')
      return this.processContent(content, context)
    } catch (error) {
      this.logger.error('ContentProcessor', 'Failed to process single file', { 
        filePath, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }, error as Error)
      
      return {
        links: [],
        imports: [],
        dependencies: [],
        metadata: {
          processingContext: context,
          processedAt: new Date().toISOString(),
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }
  }

  private async processContent(content: string, context: ProcessingContext): Promise<ExtractedData> {
    // Validate content
    if (typeof content !== 'string') {
      throw new Error('Invalid content: must be a string')
    }

    // Validate context
    if (!context || !context.filePath) {
      throw new Error('Invalid processing context: missing file path')
    }

    const extension = extname(context.filePath).toLowerCase()
    
    // Validate file extension
    const allowedExtensions = ['.md', '.markdown', '.ts', '.tsx', '.js', '.jsx', '.json']
    if (!allowedExtensions.includes(extension)) {
      return {
        links: [],
        imports: [],
        dependencies: [],
        metadata: {
          processingContext: context,
          processedAt: new Date().toISOString(),
          skipped: true,
          reason: `Unsupported file type: ${extension}`
        }
      }
    }
    
    switch (extension) {
      case '.md':
      case '.markdown':
        return this.markdownProcessor.process(content, context)
      
      case '.ts':
      case '.tsx':
      case '.js':
      case '.jsx':
        return this.typescriptProcessor.process(content, context)
      
      default:
        return {
          links: [],
          imports: [],
          dependencies: [],
          metadata: {
            processingContext: context,
            processedAt: new Date().toISOString(),
            skipped: true,
            reason: `Unsupported file type: ${extension}`
          }
        }
    }
  }

  private async discoverFiles(repositoryPath: string): Promise<string[]> {
    // Validate repository path (already validated in caller, but double-check)
    if (!repositoryPath || typeof repositoryPath !== 'string') {
      throw new Error('Invalid repository path: must be a non-empty string')
    }

    const patterns = [
      '**/*.md',
      '**/*.markdown',
      '**/*.ts',
      '**/*.tsx',
      '**/*.js',
      '**/*.jsx',
      '**/package.json'
    ]

    const excludePatterns = [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.git/**',
      '**/coverage/**',
      '**/*.test.*',
      '**/*.spec.*',
      '**/.next/**',
      '**/.nuxt/**',
      '**/.cache/**',
      '**/.vscode/**',
      '**/.idea/**'
    ]

    const files: string[] = []
    
    try {
      for (const pattern of patterns) {
        const matches = await glob(pattern, {
          cwd: repositoryPath,
          absolute: true,
          ignore: excludePatterns,
          maxDepth: 10 // Prevent excessive directory traversal
        })
        
        // Validate and filter matches
        for (const match of matches) {
          const normalizedMatch = normalize(match)
          
          // Ensure match is within repository bounds
          if (normalizedMatch.startsWith(repositoryPath)) {
            files.push(normalizedMatch)
          } else {
            console.warn(`Skipping file outside repository bounds: ${match}`)
          }
        }
      }
    } catch (error) {
      this.logger.error('ContentProcessor', 'Failed to discover files in repository', { 
        repositoryPath,
        error: error instanceof Error ? error.message : 'Unknown error' 
      }, error as Error)
      throw new Error(`Failed to discover files in repository: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    // Remove duplicates and return
    return [...new Set(files)]
  }
}