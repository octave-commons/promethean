#!/usr/bin/env tsx

import * as path from 'path';
import { promises as fs } from 'fs';
import { execSync } from 'child_process';
import { parseArgs } from 'util';

interface RepoFixtureConfig {
  repoUrl: string;
  targetDir: string;
  outputDir: string;
  maxFiles: number;
  excludePatterns: string[];
}

const DEFAULT_CONFIG: Partial<RepoFixtureConfig> = {
  repoUrl: 'git@github.com:riatzukiza/promethean.git',
  targetDir: './temp-repo',
  outputDir: './repo-fixtures',
  maxFiles: 50,
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
  ],
};

function shouldExcludeFile(filePath: string, excludePatterns: string[]): boolean {
  return excludePatterns.some((pattern) => {
    // Simple glob pattern matching
    const regexPattern = pattern
      .replace(/\*\*/g, '.*')
      .replace(/\*/g, '[^/]*')
      .replace(/\?/g, '[^/]');
    return new RegExp(regexPattern).test(filePath);
  });
}

async function cloneRepo(repoUrl: string, targetDir: string): Promise<void> {
  console.log(`📥 Cloning repository: ${repoUrl}`);

  try {
    // Remove existing directory if it exists
    await fs.rm(targetDir, { recursive: true, force: true });

    // Clone the repository
    execSync(`git clone ${repoUrl} ${targetDir}`, { stdio: 'inherit' });
    console.log(`✅ Repository cloned to: ${targetDir}`);
  } catch (error) {
    throw new Error(`Failed to clone repository: ${error}`);
  }
}

async function installDependencies(repoDir: string): Promise<void> {
  console.log('📦 Installing dependencies...');

  try {
    // Check for package.json
    const packageJsonPath = path.join(repoDir, 'package.json');
    if (
      await fs
        .access(packageJsonPath)
        .then(() => true)
        .catch(() => false)
    ) {
      execSync('npm install', { cwd: repoDir, stdio: 'inherit' });
      console.log('✅ Dependencies installed');
    } else {
      console.log('⚠️  No package.json found, skipping dependency installation');
    }
  } catch (error) {
    console.warn(`⚠️  Failed to install dependencies: ${error}`);
  }
}

async function findPackagesFromPnpm(
  repoDir: string,
): Promise<Array<{ name: string; path: string; scripts: any }>> {
  console.log('📦 Getting packages from pnpm workspace...');

  try {
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
    return workspacePackages;
  } catch (error) {
    console.warn(
      `⚠️  Could not get packages from pnpm, falling back to directory search: ${error}`,
    );

    // Fallback: find packages with package.json
    try {
      const result = execSync('find . -name "package.json" -not -path "./node_modules/*"', {
        cwd: repoDir,
        encoding: 'utf8',
      });

      const packageDirs = result
        .split('\n')
        .filter((file) => file.trim() !== '')
        .map((file) => path.dirname(file))
        .filter((dir) => dir !== '.');

      const packages = [];
      for (const dir of packageDirs) {
        try {
          const packageJsonPath = path.join(repoDir, dir, 'package.json');
          const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
          packages.push({
            name: packageJson.name || dir,
            path: dir,
            scripts: packageJson.scripts || {},
          });
        } catch {
          // Skip invalid package.json files
        }
      }

      console.log(`📦 Found ${packages.length} packages via directory search`);
      return packages;
    } catch (fallbackError) {
      throw new Error(`Failed to find packages: ${fallbackError}`);
    }
  }
}

async function testPackageBuild(
  pkg: { name: string; path: string; scripts: any },
  repoDir: string,
): Promise<{ success: boolean; files: string[] }> {
  try {
    const packagePath = path.join(repoDir, pkg.path);

    // Try different build approaches in order of preference
    const buildCommands = [
      // Use package's build script if available
      pkg.scripts.build ? `pnpm run build` : null,
      pkg.scripts.typecheck ? `pnpm run typecheck` : null,
      // Use tsconfig if it exists
      `npx tsc --noEmit`,
      // Basic TypeScript compilation
      `npx tsc --noEmit --skipLibCheck`,
    ].filter(Boolean);

    for (const command of buildCommands) {
      try {
        execSync(command!, {
          cwd: packagePath,
          stdio: 'pipe',
          timeout: 30000, // 30 second timeout
        });

        // If build succeeds, find all TypeScript files in this package
        const result = execSync('find . -name "*.ts" -o -name "*.tsx"', {
          cwd: packagePath,
          encoding: 'utf8',
        });

        const files = result
          .split('\n')
          .filter((file) => file.trim() !== '')
          .map((file) => path.join(packagePath, file));

        console.log(`✅ ${pkg.name}: Build successful with ${command}`);
        return { success: true, files };
      } catch {
        // Try next command
      }
    }

    console.log(`❌ ${pkg.name}: All build commands failed`);
    return { success: false, files: [] };
  } catch (error) {
    console.log(`❌ ${pkg.name}: Build failed with error: ${error}`);
    return { success: false, files: [] };
  }
}

async function testBuild(repoDir: string): Promise<boolean> {
  console.log('🏗️  Testing build...');

  try {
    // Try common build commands
    const buildCommands = [
      'npm run build',
      'pnpm build',
      'yarn build',
      'tsc --noEmit',
      'npx tsc --noEmit',
    ];

    for (const command of buildCommands) {
      try {
        execSync(command, { cwd: repoDir, stdio: 'pipe' });
        console.log(`✅ Build successful with: ${command}`);
        return true;
      } catch {
        // Try next command
      }
    }

    console.log('❌ All build commands failed');
    return false;
  } catch (error) {
    console.log(`❌ Build failed: ${error}`);
    return false;
  }
}

async function createFixtureFromFiles(
  validFiles: string[],
  repoDir: string,
  outputDir: string,
  maxFiles: number,
): Promise<void> {
  console.log(`📝 Creating fixtures from ${validFiles.length} valid files...`);

  await fs.mkdir(outputDir, { recursive: true });

  // Limit files to prevent overwhelming the system
  const filesToProcess = validFiles.slice(0, maxFiles);

  for (let i = 0; i < filesToProcess.length; i++) {
    const filePath = filesToProcess[i];
    if (!filePath) continue; // Skip undefined paths

    const relativePath = path.relative(repoDir, filePath);
    const fixtureName = `repo-file-${i + 1}-${path.basename(filePath, '.ts')}`;
    const fixtureDir = path.join(outputDir, fixtureName);

    await fs.mkdir(fixtureDir, { recursive: true });

    // Copy the TypeScript file
    const content = await fs.readFile(filePath, 'utf8');
    const targetFile = path.join(fixtureDir, 'src.ts');
    await fs.writeFile(targetFile, content);

    // Create package.json
    await fs.writeFile(
      path.join(fixtureDir, 'package.json'),
      JSON.stringify(
        {
          name: `buildfix-repo-fixture-${fixtureName}`,
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
          description: `Repository file: ${relativePath}`,
          originalPath: relativePath,
          errorPattern: [], // Start with no known errors
          files: ['src.ts'],
        },
        null,
        2,
      ),
    );
  }

  console.log(`✅ Created ${filesToProcess.length} fixtures in ${outputDir}`);
}

async function main() {
  try {
    // Parse command line arguments
    const args = parseArgs({
      args: process.argv.slice(2),
      options: {
        'repo-url': { type: 'string' },
        'target-dir': { type: 'string' },
        'output-dir': { type: 'string' },
        'max-files': { type: 'string' },
        help: { type: 'boolean' },
      },
    });

    if (args.values.help) {
      console.log(`
Repo Fixture Generator

Usage: tsx repo-fixture-generator.ts [options]

Options:
  --repo-url <url>      Git repository URL (default: git@github.com:riatzukiza/promethean.git)
  --target-dir <dir>    Temporary directory for cloning (default: ./temp-repo)
  --output-dir <dir>    Output directory for fixtures (default: ./repo-fixtures)
  --max-files <num>     Maximum number of files to process (default: 50)
  --help                Show this help message

Example:
  tsx repo-fixture-generator.ts --repo-url git@github.com:riatzukiza/promethean.git --max-files 20
      `);
      return;
    }

    const config: RepoFixtureConfig = {
      repoUrl: args.values['repo-url'] || DEFAULT_CONFIG.repoUrl!,
      targetDir: args.values['target-dir'] || DEFAULT_CONFIG.targetDir!,
      outputDir: args.values['output-dir'] || DEFAULT_CONFIG.outputDir!,
      maxFiles: parseInt(args.values['max-files'] || DEFAULT_CONFIG.maxFiles!.toString()),
      excludePatterns: DEFAULT_CONFIG.excludePatterns!,
    };

    console.log('🚀 Starting Repo Fixture Generator');
    console.log(`📋 Repository: ${config.repoUrl}`);
    console.log(`📁 Target: ${config.targetDir}`);
    console.log(`💾 Output: ${config.outputDir}`);
    console.log(`📊 Max files: ${config.maxFiles}`);
    console.log('');

    // Step 1: Clone repository
    await cloneRepo(config.repoUrl, config.targetDir);

    // Step 2: Install dependencies
    await installDependencies(config.targetDir);

    // Step 3: Test if the repo builds successfully
    const buildSuccess = await testBuild(config.targetDir);
    if (!buildSuccess) {
      console.log(
        '⚠️  Repository does not build successfully, proceeding with file-by-file testing',
      );
    }

    // Step 4: Find packages and test their builds
    const packages = await findPackagesFromPnpm(config.targetDir);

    if (packages.length === 0) {
      console.log('❌ No packages found');
      return;
    }

    // Step 5: Test each package build
    console.log('🧪 Testing package builds...');
    const validFiles: string[] = [];

    for (let i = 0; i < packages.length; i++) {
      const pkg = packages[i];
      if (!pkg) continue;

      process.stdout.write(`\r📦 Testing package ${i + 1}/${packages.length}: ${pkg.name}`);

      const result = await testPackageBuild(pkg, config.targetDir);
      if (result.success) {
        // Filter files through exclude patterns
        const filteredFiles = result.files.filter((file) => {
          const relativePath = path.relative(config.targetDir, file);
          return !shouldExcludeFile(relativePath, config.excludePatterns);
        });

        validFiles.push(...filteredFiles);

        // Stop early if we have enough files
        if (validFiles.length >= config.maxFiles) {
          console.log(`\n✅ Found ${validFiles.length} valid files, stopping early`);
          break;
        }
      }
    }

    console.log(
      `\n✅ Found ${validFiles.length} valid TypeScript files from ${packages.length} packages`,
    );

    if (validFiles.length === 0) {
      console.log('❌ No valid TypeScript files found');
      return;
    }

    // Step 6: Create fixtures from valid files
    await createFixtureFromFiles(validFiles, config.targetDir, config.outputDir, config.maxFiles);

    // Step 7: Cleanup
    console.log('🧹 Cleaning up temporary files...');
    await fs.rm(config.targetDir, { recursive: true, force: true });

    console.log('');
    console.log('🎉 Repo fixture generation completed successfully!');
    console.log(`📁 Fixtures created in: ${config.outputDir}`);
    console.log(`📊 Total fixtures: ${Math.min(validFiles.length, config.maxFiles)}`);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Check if this file is being run directly
if (process.argv[1]?.endsWith('repo-fixture-generator.ts')) {
  main();
}
