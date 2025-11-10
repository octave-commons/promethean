import { readFile } from 'fs/promises'
import { join, dirname } from 'path'
import { ExtractedData, Dependency, ProcessingContext } from '../../types/index.js'

interface PackageJson {
  name?: string
  version?: string
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
  optionalDependencies?: Record<string, string>
}

export class DependencyProcessor {
  async process(filePath: string, context: ProcessingContext): Promise<ExtractedData> {
    try {
      const content = await readFile(filePath, 'utf-8')
      const packageJson = JSON.parse(content) as PackageJson
      
      const dependencies: Dependency[] = []

      const processDependencies = (deps: Record<string, string>, type: Dependency['type']) => {
        for (const [name, version] of Object.entries(deps)) {
          dependencies.push({
            name,
            version,
            type,
            resolved: this.resolveDependency(name, version, dirname(filePath))
          })
        }
      }

      if (packageJson.dependencies) {
        processDependencies(packageJson.dependencies, 'dependencies')
      }

      if (packageJson.devDependencies) {
        processDependencies(packageJson.devDependencies, 'devDependencies')
      }

      if (packageJson.peerDependencies) {
        processDependencies(packageJson.peerDependencies, 'peerDependencies')
      }

      if (packageJson.optionalDependencies) {
        processDependencies(packageJson.optionalDependencies, 'devDependencies')
      }

      return {
        links: [],
        imports: [],
        dependencies,
        metadata: {
          processingContext: context,
          processedAt: new Date().toISOString(),
          packageName: packageJson.name,
          packageVersion: packageJson.version
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
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }
  }

  private resolveDependency(name: string, version: string, fromDir: string): string | undefined {
    if (name.startsWith('.') || name.startsWith('/')) {
      return join(fromDir, name)
    }

    if (version.startsWith('file:')) {
      return version.replace('file:', '')
    }

    if (version.startsWith('github:') || version.startsWith('git:')) {
      return version
    }

    return undefined
  }

  async analyzeProjectDependencies(projectPath: string): Promise<ExtractedData> {
    const packageJsonPath = join(projectPath, 'package.json')
    const context: ProcessingContext = {
      repositoryPath: projectPath,
      filePath: packageJsonPath
    }

    return this.process(packageJsonPath, context)
  }
}