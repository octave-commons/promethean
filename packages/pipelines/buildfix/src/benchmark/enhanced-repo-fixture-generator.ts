#!/usr/bin/env tsx

import * as path from 'path';
import { promises as fs } from 'fs';
import { execSync } from 'child_process';
import { parseArgs } from 'util';

interface EnhancedFixtureConfig {
  repoUrl: string;
  targetDir: string;
  outputDir: string;
  maxPackages: number;
  maxFilesPerPackage: number;
  mutationsPerFile: number;
  excludePatterns: string[];
}

const DEFAULT_CONFIG: Partial<EnhancedFixtureConfig> = {
  repoUrl: 'git@github.com:riatzukiza/promethean.git',
  targetDir: './temp-repo-enhanced',
  outputDir: './enhanced-repo-fixtures',
  maxPackages: 10,
  maxFilesPerPackage: 5,
  mutationsPerFile: 3, // Create 3 variations per file
  excludePatterns: [
    'node_modules',
    'dist',
    'dist/**',
    'build',
    'build/**',
    '.git',
    '.git/**',
    'coverage',
    'coverage/**',
    '*.test.ts',
    '*.spec.ts',
    'test/**',
    'tests/**',
    '__tests__/**',
    'fixtures/**',
    'benchmark/**',
    'examples/**',
    '**/*.d.ts',
    '**/*.config.ts',
    '**/*.config.js',
  ],
};

function shouldExcludeFile(filePath: string, excludePatterns: string[]): boolean {
  return excludePatterns.some((pattern) => {
    const regexPattern = pattern
      .replace(/\*\*/g, '.*')
      .replace(/\*/g, '[^/]*')
      .replace(/\?/g, '[^/]');
    return new RegExp(regexPattern).test(filePath);
  });
}

async function cloneRepository(config: EnhancedFixtureConfig): Promise<string> {
  console.log(`📥 Cloning repository: ${config.repoUrl}`);

  if (
    await fs
      .access(config.targetDir)
      .then(() => true)
      .catch(() => false)
  ) {
    console.log('🗑️  Removing existing clone...');
    execSync(`rm -rf ${config.targetDir}`, { stdio: 'inherit' });
  }

  execSync(`git clone ${config.repoUrl} ${config.targetDir}`, { stdio: 'inherit' });
  console.log('✅ Repository cloned successfully');
  return config.targetDir;
}

async function installDependencies(repoDir: string): Promise<void> {
  console.log('📦 Installing dependencies...');

  try {
    execSync('pnpm install', { cwd: repoDir, stdio: 'pipe' });
    console.log('✅ Dependencies installed');
  } catch (error) {
    console.warn('⚠️  pnpm install failed, trying npm...');
    try {
      execSync('npm install', { cwd: repoDir, stdio: 'pipe' });
      console.log('✅ Dependencies installed with npm');
    } catch (npmError) {
      console.warn('⚠️  Dependency installation failed, proceeding anyway');
    }
  }
}

async function findBuildablePackages(repoDir: string, maxPackages: number): Promise<any[]> {
  console.log('🔍 Finding buildable packages...');

  try {
    // Get workspace packages
    const result = execSync('pnpm list --json --depth=0', {
      cwd: repoDir,
      encoding: 'utf8',
    });

    const packages = JSON.parse(result);
    const workspacePackages = packages
      .filter((pkg: any) => pkg.path && pkg.path !== repoDir)
      .map((pkg: any) => ({
        name: pkg.name,
        path: path.relative(repoDir, pkg.path),
        scripts: pkg.scripts || {},
      }));

    console.log(`📦 Found ${workspacePackages.length} packages in workspace`);

    // Test which packages can build
    const buildablePackages = [];
    for (const pkg of workspacePackages.slice(0, maxPackages)) {
      if (await testPackageBuild(repoDir, pkg)) {
        buildablePackages.push(pkg);
      }
    }

    console.log(`✅ ${buildablePackages.length} packages can build successfully`);
    return buildablePackages;
  } catch (error) {
    console.warn(`⚠️  Could not analyze packages: ${error}`);
    return [];
  }
}

async function testPackageBuild(repoDir: string, pkg: any): Promise<boolean> {
  try {
    const pkgDir = path.join(repoDir, pkg.path);

    // Try to build the package
    const buildCommands = ['pnpm build', 'npm run build', 'tsc --noEmit', 'npx tsc --noEmit'];

    for (const command of buildCommands) {
      try {
        execSync(command, { cwd: pkgDir, stdio: 'pipe', timeout: 30000 });
        return true;
      } catch {
        // Try next command
      }
    }

    return false;
  } catch {
    return false;
  }
}

async function extractTypeScriptFiles(
  repoDir: string,
  pkg: any,
  maxFiles: number,
): Promise<string[]> {
  const pkgDir = path.join(repoDir, pkg.path);

  try {
    const result = execSync(`find "${pkgDir}" -name "*.ts" -type f`, {
      encoding: 'utf8',
    });

    const allFiles = result
      .split('\n')
      .filter((file) => file.trim() !== '')
      .filter(
        (file) => !shouldExcludeFile(path.relative(pkgDir, file), DEFAULT_CONFIG.excludePatterns!),
      )
      .filter((file) => {
        // Only include substantial files (more than 20 lines)
        try {
          const content = execSync(`wc -l < "${file}"`, { encoding: 'utf8' });
          return parseInt(content.trim()) > 20;
        } catch {
          return false;
        }
      });

    return allFiles.slice(0, maxFiles);
  } catch (error) {
    console.warn(`⚠️  Could not extract files from ${pkg.name}: ${error}`);
    return [];
  }
}

// Mutation strategies for creating variations
const MUTATION_STRATEGIES = {
  commentExports: (content: string) => {
    return content.replace(
      /export\s+(const|function|class|interface|type)\s+(\w+)/g,
      '// export $1 $2',
    );
  },

  removeImports: (content: string) => {
    return content.replace(/import\s+.*?from\s+['"][^'"]*['"];?\s*\n?/g, '');
  },

  addUndefinedVars: (content: string) => {
    // Add undefined variable references after function declarations
    return content.replace(
      /(function\s+\w+\([^)]*\)\s*{[^}]*})/g,
      '$1\n  const undefinedVar = someUndefinedFunction();',
    );
  },

  breakTypes: (content: string) => {
    // Change type annotations to be incorrect
    return content.replace(/:\s*(string|number|boolean)/g, ': incompatibleType');
  },

  removeSemicolons: (content: string) => {
    return content.replace(/;/g, '');
  },

  addSyntaxErrors: (content: string) => {
    // Add obvious syntax errors
    return content.replace(/\n\s*\}/g, '\n  } missingParenthesis(');
  },
};

async function createMutatedFixtures(
  filePath: string,
  repoDir: string,
  outputDir: string,
  pkgName: string,
  mutationsPerFile: number,
): Promise<void> {
  const relativePath = path.relative(repoDir, filePath);
  const fileName = path.basename(relativePath, '.ts');
  const baseFixtureName = `${pkgName}-${fileName}`;

  // Read original content
  const originalContent = await fs.readFile(filePath, 'utf8');

  // Create mutations
  const strategies = Object.keys(MUTATION_STRATEGIES);
  const selectedStrategies = strategies.slice(0, mutationsPerFile);

  for (let i = 0; i < selectedStrategies.length; i++) {
    const strategy = selectedStrategies[i]!;
    const mutationFn = MUTATION_STRATEGIES[strategy as keyof typeof MUTATION_STRATEGIES];

    const fixtureName = `${baseFixtureName}-${strategy}`;
    const fixtureDir = path.join(outputDir, fixtureName);

    await fs.mkdir(fixtureDir, { recursive: true });

    // Apply mutation
    const mutatedContent = mutationFn(originalContent);

    // Write mutated file
    await fs.writeFile(path.join(fixtureDir, 'src.ts'), mutatedContent);

    // Create package.json
    await fs.writeFile(
      path.join(fixtureDir, 'package.json'),
      JSON.stringify(
        {
          name: `buildfix-enhanced-fixture-${fixtureName}`,
          version: '1.0.0',
          type: 'module',
          dependencies: {
            'ts-morph': '^23.0.0',
          },
        },
        null,
        2,
      ),
    );

    // Create tsconfig.json
    await fs.writeFile(
      path.join(fixtureDir, 'tsconfig.json'),
      JSON.stringify(
        {
          compilerOptions: {
            strict: true,
            noEmit: true,
            target: 'ES2020',
            module: 'ESNext',
            moduleResolution: 'node',
            esModuleInterop: true,
            allowSyntheticDefaultImports: true,
            skipLibCheck: true,
          },
          include: ['*.ts'],
        },
        null,
        2,
      ),
    );

    // Create metadata
    await fs.writeFile(
      path.join(fixtureDir, 'metadata.json'),
      JSON.stringify(
        {
          name: fixtureName,
          description: `Enhanced fixture: ${relativePath} (${strategy} mutation)`,
          originalPath: relativePath,
          package: pkgName,
          mutationStrategy: strategy,
          mutationType: getMutationType(strategy)!,
          files: ['src.ts'],
          generatedAt: new Date().toISOString(),
        },
        null,
        2,
      ),
    );
  }
}

function getMutationType(strategy: string): string {
  const types: Record<string, string> = {
    commentExports: 'Export Removal',
    removeImports: 'Import Removal',
    addUndefinedVars: 'Undefined Variables',
    breakTypes: 'Type Errors',
    removeSemicolons: 'Syntax Errors',
    addSyntaxErrors: 'Syntax Errors',
  };
  return types[strategy] || 'Unknown';
}

async function main() {
  try {
    const args = parseArgs({
      args: process.argv.slice(2),
      options: {
        'repo-url': { type: 'string' },
        'target-dir': { type: 'string' },
        'output-dir': { type: 'string' },
        'max-packages': { type: 'string' },
        'max-files-per-package': { type: 'string' },
        'mutations-per-file': { type: 'string' },
        help: { type: 'boolean' },
      },
    });

    if (args.values.help) {
      console.log(`
Enhanced Repo Fixture Generator for Buildfix

Usage: tsx enhanced-repo-fixture-generator.ts [options]

Options:
  --repo-url <url>           Git repository URL (default: ${DEFAULT_CONFIG.repoUrl})
  --target-dir <dir>         Temporary clone directory (default: ${DEFAULT_CONFIG.targetDir})
  --output-dir <dir>         Fixture output directory (default: ${DEFAULT_CONFIG.outputDir})
  --max-packages <num>       Maximum packages to process (default: ${DEFAULT_CONFIG.maxPackages})
  --max-files-per-package <num>  Maximum files per package (default: ${DEFAULT_CONFIG.maxFilesPerPackage})
  --mutations-per-file <num>     Mutations per file (default: ${DEFAULT_CONFIG.mutationsPerFile})
  --help                     Show this help message

Examples:
  tsx enhanced-repo-fixture-generator.ts
  tsx enhanced-repo-fixture-generator.ts --max-packages 5 --mutations-per-file 5
  tsx enhanced-repo-fixture-generator.ts --repo-url git@github.com:owner/repo.git
      `);
      process.exit(0);
    }

    const config: EnhancedFixtureConfig = {
      ...DEFAULT_CONFIG,
      repoUrl: args.values['repo-url'] || DEFAULT_CONFIG.repoUrl!,
      targetDir: args.values['target-dir'] || DEFAULT_CONFIG.targetDir!,
      outputDir: args.values['output-dir'] || DEFAULT_CONFIG.outputDir!,
      maxPackages: parseInt(args.values['max-packages'] || String(DEFAULT_CONFIG.maxPackages!)),
      maxFilesPerPackage: parseInt(
        args.values['max-files-per-package'] || String(DEFAULT_CONFIG.maxFilesPerPackage!),
      ),
      mutationsPerFile: parseInt(
        args.values['mutations-per-file'] || String(DEFAULT_CONFIG.mutationsPerFile!),
      ),
      excludePatterns: DEFAULT_CONFIG.excludePatterns!,
    };

    console.log('🚀 Starting Enhanced Repo Fixture Generation');
    console.log(`📋 Config: ${JSON.stringify(config, null, 2)}`);

    // Clone repository
    const repoDir = await cloneRepository(config);

    // Install dependencies
    await installDependencies(repoDir);

    // Find buildable packages
    const buildablePackages = await findBuildablePackages(repoDir, config.maxPackages);

    if (buildablePackages.length === 0) {
      console.log('❌ No buildable packages found');
      process.exit(1);
    }

    // Clean output directory
    if (
      await fs
        .access(config.outputDir)
        .then(() => true)
        .catch(() => false)
    ) {
      await fs.rm(config.outputDir, { recursive: true });
    }
    await fs.mkdir(config.outputDir, { recursive: true });

    let totalFixtures = 0;

    // Process each package
    for (const pkg of buildablePackages) {
      console.log(`\n📦 Processing package: ${pkg.name}`);

      // Extract TypeScript files
      const typeScriptFiles = await extractTypeScriptFiles(repoDir, pkg, config.maxFilesPerPackage);

      if (typeScriptFiles.length === 0) {
        console.log(`⚠️  No suitable files found in ${pkg.name}`);
        continue;
      }

      console.log(`📄 Found ${typeScriptFiles.length} files in ${pkg.name}`);

      // Create mutated fixtures for each file
      for (const filePath of typeScriptFiles) {
        await createMutatedFixtures(
          filePath,
          repoDir,
          config.outputDir,
          pkg.name.replace(/[^a-zA-Z0-9]/g, '-'),
          config.mutationsPerFile,
        );

        totalFixtures += config.mutationsPerFile;
      }
    }

    // Cleanup
    console.log('\n🗑️  Cleaning up temporary files...');
    execSync(`rm -rf ${config.targetDir}`);

    console.log(`\n✅ Enhanced fixture generation complete!`);
    console.log(`📊 Generated ${totalFixtures} fixtures from ${buildablePackages.length} packages`);
    console.log(`📁 Fixtures saved to: ${config.outputDir}`);

    // Generate summary
    const summary = {
      generatedAt: new Date().toISOString(),
      totalFixtures,
      packagesProcessed: buildablePackages.length,
      mutationsPerFile: config.mutationsPerFile,
      config,
      packages: buildablePackages.map((pkg) => ({
        name: pkg.name,
        path: pkg.path,
      })),
    };

    await fs.writeFile(
      path.join(config.outputDir, 'generation-summary.json'),
      JSON.stringify(summary, null, 2),
    );
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
