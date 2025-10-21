import { promises as fs } from 'fs';
import { join } from 'path';
import { PackageOptions, GeneratorConfig } from './types.js';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export class PackageValidator {
  private config: GeneratorConfig;

  constructor(config: GeneratorConfig) {
    this.config = config;
  }

  async validateGeneratedPackage(packageName: string): Promise<ValidationResult> {
    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
    };

    const packageDir = join(this.config.outputDir, packageName);

    try {
      await this.validatePackageStructure(packageDir, result);
      await this.validatePackageJson(packageDir, result);
      await this.validateTypeScriptConfig(packageDir, result);
      await this.validateDependencies(packageDir, result);
    } catch (error) {
      result.valid = false;
      result.errors.push(`Validation failed: ${error}`);
    }

    return result;
  }

  async validatePackageOptions(options: PackageOptions): Promise<ValidationResult> {
    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
    };

    if (!options.name || !options.name.trim()) {
      result.valid = false;
      result.errors.push('Package name is required');
    }

    if (options.name && !/^[a-z0-9-]+$/.test(options.name)) {
      result.valid = false;
      result.errors.push('Package name must contain only lowercase letters, numbers, and hyphens');
    }

    if (!options.description || !options.description.trim()) {
      result.valid = false;
      result.errors.push('Package description is required');
    }

    if (!options.type) {
      result.valid = false;
      result.errors.push('Package type is required');
    }

    const validTypes = [
      'typescript-library',
      'frontend-package',
      'cli-package',
      'javascript-package',
      'manager-package',
    ];
    if (options.type && !validTypes.includes(options.type)) {
      result.valid = false;
      result.errors.push(`Invalid package type. Must be one of: ${validTypes.join(', ')}`);
    }

    return result;
  }

  private async validatePackageStructure(
    packageDir: string,
    result: ValidationResult,
  ): Promise<void> {
    const requiredFiles = ['package.json'];
    const requiredDirs = ['src'];

    for (const file of requiredFiles) {
      const filePath = join(packageDir, file);
      try {
        await fs.access(filePath);
      } catch {
        result.valid = false;
        result.errors.push(`Missing required file: ${file}`);
      }
    }

    for (const dir of requiredDirs) {
      const dirPath = join(packageDir, dir);
      try {
        const stat = await fs.stat(dirPath);
        if (!stat.isDirectory()) {
          result.valid = false;
          result.errors.push(`Missing required directory: ${dir}`);
        }
      } catch {
        result.valid = false;
        result.errors.push(`Missing required directory: ${dir}`);
      }
    }
  }

  private async validatePackageJson(packageDir: string, result: ValidationResult): Promise<void> {
    try {
      const packageJsonPath = join(packageDir, 'package.json');
      const content = await fs.readFile(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(content);

      if (!packageJson.name) {
        result.valid = false;
        result.errors.push('package.json missing name field');
      }

      if (!packageJson.version) {
        result.warnings.push('package.json missing version field');
      }

      if (!packageJson.description) {
        result.warnings.push('package.json missing description field');
      }

      if (!packageJson.scripts || Object.keys(packageJson.scripts).length === 0) {
        result.warnings.push('package.json has no scripts defined');
      }

      if (!packageJson.exports && !packageJson.main) {
        result.warnings.push('package.json missing exports or main field');
      }
    } catch (error) {
      result.valid = false;
      result.errors.push(`Invalid package.json: ${error}`);
    }
  }

  private async validateTypeScriptConfig(
    packageDir: string,
    result: ValidationResult,
  ): Promise<void> {
    const tsconfigPath = join(packageDir, 'tsconfig.json');

    try {
      await fs.access(tsconfigPath);
      const content = await fs.readFile(tsconfigPath, 'utf-8');
      const tsconfig = JSON.parse(content);

      if (!tsconfig.compilerOptions) {
        result.warnings.push('tsconfig.json missing compilerOptions');
      } else {
        const { compilerOptions } = tsconfig;

        if (!compilerOptions.outDir) {
          result.warnings.push('tsconfig.json missing outDir in compilerOptions');
        }

        if (!compilerOptions.rootDir) {
          result.warnings.push('tsconfig.json missing rootDir in compilerOptions');
        }

        if (!compilerOptions.declaration) {
          result.warnings.push('tsconfig.json missing declaration in compilerOptions');
        }
      }
    } catch {
      result.warnings.push('tsconfig.json not found or invalid');
    }
  }

  private async validateDependencies(packageDir: string, result: ValidationResult): Promise<void> {
    try {
      const packageJsonPath = join(packageDir, 'package.json');
      const content = await fs.readFile(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(content);

      const hasDependencies =
        packageJson.dependencies && Object.keys(packageJson.dependencies).length > 0;
      const hasDevDependencies =
        packageJson.devDependencies && Object.keys(packageJson.devDependencies).length > 0;

      if (!hasDependencies && !hasDevDependencies) {
        result.warnings.push('Package has no dependencies defined');
      }

      if (packageJson.dependencies && packageJson.dependencies.typescript) {
        result.warnings.push('TypeScript should be in devDependencies, not dependencies');
      }
    } catch (error) {
      result.warnings.push(`Could not validate dependencies: ${error}`);
    }
  }

  async checkPackageExists(packageName: string): Promise<boolean> {
    const packageDir = join(this.config.outputDir, packageName);

    try {
      await fs.access(packageDir);
      return true;
    } catch {
      return false;
    }
  }
}
