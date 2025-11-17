#!/usr/bin/env tsx

import * as path from 'path';
import { promises as fs } from 'fs';
import { execSync } from 'child_process';
import { parseArgs } from 'util';

// All TypeScript error codes we want to generate (from generate-errors.ts)
const TARGET_ERROR_CODES = [
  // Syntax errors (1xxx)
  'TS1002',
  'TS1005',
  'TS1006',
  'TS1015',
  'TS1016',
  'TS1029',
  'TS1035',
  'TS1036',
  'TS1038',
  'TS1039',
  'TS1046',
  'TS1054',
  'TS1055',
  'TS1056',
  'TS1064',
  'TS1066',
  'TS1068',
  'TS1070',
  'TS1095',
  'TS1099',
  'TS1103',
  'TS1107',
  'TS1109',
  'TS1117',
  'TS1121',
  'TS1127',
  'TS1128',
  'TS1149',
  'TS1155',
  'TS1160',
  'TS1163',
  'TS1175',
  'TS1183',
  'TS1192',
  'TS1196',
  'TS1202',
  'TS1208',
  'TS1218',
  'TS1219',
  'TS1225',
  'TS1228',
  'TS1232',
  'TS1240',
  'TS1241',
  'TS1243',
  'TS1244',
  'TS1245',
  'TS1247',
  'TS1248',
  'TS1254',
  'TS1259',
  'TS1267',
  'TS1273',
  'TS1274',
  'TS1280',
  'TS1294',
  'TS1308',
  'TS1309',
  'TS1323',
  'TS1337',
  'TS1341',
  'TS1345',
  'TS1354',
  'TS1355',
  'TS1357',
  'TS1361',
  'TS1363',
  'TS1368',
  'TS1371',
  'TS1375',
  'TS1378',
  'TS1385',
  'TS1389',
  'TS1431',
  'TS1432',
  'TS1434',
  'TS1450',
  'TS1470',
  'TS1471',
  'TS1479',
  'TS1484',

  // Semantic errors (2xxx)
  'TS2304',
  'TS2305',
  'TS2307',
  'TS2322',
  'TS2339',
  'TS2345',
  'TS2355',
  'TS2362',
  'TS2395',
  'TS2403',
  'TS2440',
  'TS2454',
  'TS2551',
  'TS2552',
  'TS2564',
  'TS2571',
  'TS2584',
  'TS2688',
  'TS2769',

  // Declaration emit errors (4xxx)
  'TS4010',
  'TS4023',
  'TS4060',
  'TS4081',
  'TS4115',

  // Compiler options errors (5xxx)
  'TS5023',
  'TS5024',
  'TS5054',
  'TS5069',
  'TS5097',

  // noImplicitAny errors (6xxx)
  'TS7005',
  'TS7006',
  'TS7008',
  'TS7009',
  'TS7010',
  'TS7016',
  'TS7022',
  'TS7031',
  'TS7034',
  'TS7041',
  'TS7044',
  'TS7053',
];

interface MassiveFixtureConfig {
  repoUrl: string;
  targetDir: string;
  outputDir: string;
  targetErrors: number;
  minErrorsPerType: number;
  fixturesPerErrorType: number;
  excludePatterns: string[];
}

const DEFAULT_CONFIG: Partial<MassiveFixtureConfig> = {
  repoUrl: 'git@github.com:riatzukiza/promethean.git',
  targetDir: './temp-repo-massive',
  outputDir: './massive-repo-fixtures',
  targetErrors: 1000,
  minErrorsPerType: 5,
  fixturesPerErrorType: 3,
  excludePatterns: [
    'node_modules',
    'dist',
    'build',
    '.git',
    'coverage',
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

class MassiveErrorGenerator {
  private random: () => number;
  private errorStats: Record<string, number> = {};
  private fixtureCounter: number = 0;

  constructor(seed: number = 42) {
    this.random = this.seededRandom(seed);
  }

  private seededRandom(seed: number): () => number {
    let state = seed;
    return () => {
      state = (state * 9301 + 49297) % 233280;
      return state / 233280;
    };
  }

  async cloneRepository(config: MassiveFixtureConfig): Promise<string> {
    console.log(`📥 Cloning repository: ${config.repoUrl}`);

    if (
      await fs
        .access(config.targetDir)
        .then(() => true)
        .catch(() => false)
    ) {
      execSync(`rm -rf ${config.targetDir}`, { stdio: 'inherit' });
    }

    execSync(`git clone --depth 1 ${config.repoUrl} ${config.targetDir}`, { stdio: 'inherit' });
    console.log('✅ Repository cloned successfully');
    return config.targetDir;
  }

  async findSourceFiles(repoDir: string): Promise<string[]> {
    console.log('🔍 Finding TypeScript source files...');

    try {
      const result = execSync(`find "${repoDir}" -name "*.ts" -type f | head -200`, {
        encoding: 'utf8',
      });

      const allFiles = result
        .split('\n')
        .filter((file) => file.trim() !== '')
        .filter((file) => !this.shouldExcludeFile(path.relative(repoDir, file)))
        .filter((file) => {
          try {
            const content = execSync(`wc -l < "${file}"`, { encoding: 'utf8' });
            return parseInt(content.trim()) > 30; // Substantial files only
          } catch {
            return false;
          }
        });

      console.log(`📄 Found ${allFiles.length} suitable TypeScript files`);
      return allFiles;
    } catch (error) {
      console.warn(`⚠️  Could not find files: ${error}`);
      return [];
    }
  }

  private shouldExcludeFile(filePath: string): boolean {
    return DEFAULT_CONFIG.excludePatterns!.some((pattern) => {
      const regexPattern = pattern
        .replace(/\*\*/g, '.*')
        .replace(/\*/g, '[^/]*')
        .replace(/\?/g, '[^/]');
      return new RegExp(regexPattern).test(filePath);
    });
  }

  async generateMassiveFixtures(
    sourceFiles: string[],
    repoDir: string,
    config: MassiveFixtureConfig,
  ): Promise<void> {
    console.log(
      `🚀 Generating ${config.targetErrors} errors across ${TARGET_ERROR_CODES.length} error types...`,
    );

    await fs.mkdir(config.outputDir, { recursive: true });

    // Track which error types need more instances
    const errorTypeQueue = [...TARGET_ERROR_CODES];
    let totalErrorsGenerated = 0;

    // Generate fixtures until we meet all targets
    while (
      (totalErrorsGenerated < config.targetErrors || errorTypeQueue.length > 0) &&
      this.fixtureCounter < 5000 // Safety limit
    ) {
      // Pick error type that still needs instances
      let targetErrorCode: string;

      if (errorTypeQueue.length > 0) {
        // Prioritize error types we haven't generated enough of
        const needsMoreErrors = errorTypeQueue.filter(
          (code) => (this.errorStats[code] || 0) < config.minErrorsPerType,
        );

        if (needsMoreErrors.length > 0) {
          targetErrorCode = needsMoreErrors[Math.floor(this.random() * needsMoreErrors.length)]!;
        } else {
          // All minimum requirements met, pick from remaining queue
          targetErrorCode = errorTypeQueue[Math.floor(this.random() * errorTypeQueue.length)]!;
        }
      } else {
        // All error types processed, pick randomly
        targetErrorCode =
          TARGET_ERROR_CODES[Math.floor(this.random() * TARGET_ERROR_CODES.length)]!;
      }

      // Select a random source file
      const sourceFile = sourceFiles[Math.floor(this.random() * sourceFiles.length)]!;

      // Generate fixture for this error type
      const errorsGenerated = await this.generateFixtureForErrorType(
        sourceFile,
        repoDir,
        config.outputDir,
        targetErrorCode,
        config,
      );

      if (errorsGenerated > 0) {
        totalErrorsGenerated += errorsGenerated;
        this.fixtureCounter++;

        // Remove error type from queue if we've generated enough
        if ((this.errorStats[targetErrorCode] || 0) >= config.minErrorsPerType) {
          const index = errorTypeQueue.indexOf(targetErrorCode);
          if (index > -1) {
            errorTypeQueue.splice(index, 1);
          }
        }

        // Progress reporting
        if (this.fixtureCounter % 50 === 0) {
          console.log(
            `📊 Progress: ${totalErrorsGenerated} errors, ${this.fixtureCounter} fixtures, ${errorTypeQueue.length} error types remaining`,
          );
        }
      }
    }

    console.log(`\n✅ Generation complete!`);
    console.log(`📊 Total errors generated: ${totalErrorsGenerated}`);
    console.log(`📁 Total fixtures created: ${this.fixtureCounter}`);
    console.log(
      `🎯 Error types covered: ${Object.keys(this.errorStats).length}/${TARGET_ERROR_CODES.length}`,
    );

    // Show error distribution
    const sortedErrors = Object.entries(this.errorStats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20);

    console.log('\n🔝 Top 20 error codes:');
    for (const [code, count] of sortedErrors) {
      console.log(`  ${code}: ${count}`);
    }

    // Check missing error types
    const missingErrors = TARGET_ERROR_CODES.filter((code) => !this.errorStats[code]);
    if (missingErrors.length > 0) {
      console.log(`\n⚠️  Missing error types (${missingErrors.length}):`);
      console.log(missingErrors.slice(0, 10).join(', '));
      if (missingErrors.length > 10) {
        console.log(`... and ${missingErrors.length - 10} more`);
      }
    }

    // Generate summary report
    await this.generateSummaryReport(config.outputDir, totalErrorsGenerated);
  }

  async generateFixtureForErrorType(
    sourceFilePath: string,
    repoDir: string,
    outputDir: string,
    targetErrorCode: string,
    _config: MassiveFixtureConfig,
  ): Promise<number> {
    try {
      // Read source file
      const originalContent = await fs.readFile(sourceFilePath, 'utf8');
      const relativePath = path.relative(repoDir, sourceFilePath);
      const fileName = path.basename(relativePath, '.ts');
      const sanitizedName = fileName.replace(/[^a-zA-Z0-9]/g, '-');

      // Create fixture directory
      const fixtureName = `fixture-${this.fixtureCounter.toString().padStart(4, '0')}-${targetErrorCode}-${sanitizedName}`;
      const fixtureDir = path.join(outputDir, fixtureName);
      await fs.mkdir(fixtureDir, { recursive: true });

      // Apply error-specific mutations
      const mutatedContent = this.applyErrorSpecificMutation(originalContent, targetErrorCode);

      if (!mutatedContent || mutatedContent === originalContent) {
        return 0; // No mutation applied
      }

      // Write fixture files
      await fs.writeFile(path.join(fixtureDir, 'src.ts'), mutatedContent);

      // Create package.json
      await fs.writeFile(
        path.join(fixtureDir, 'package.json'),
        JSON.stringify(
          {
            name: `buildfix-massive-fixture-${fixtureName}`,
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
            description: `Massive fixture for ${targetErrorCode} from ${relativePath}`,
            originalPath: relativePath,
            targetErrorCode,
            errorCategory: this.getErrorCategory(targetErrorCode),
            fixtureNumber: this.fixtureCounter,
            generatedAt: new Date().toISOString(),
          },
          null,
          2,
        ),
      );

      // Track error
      this.errorStats[targetErrorCode] = (this.errorStats[targetErrorCode] || 0) + 1;

      return 1; // Generated 1 fixture
    } catch (error) {
      console.warn(`⚠️  Failed to generate fixture for ${targetErrorCode}: ${error}`);
      return 0;
    }
  }

  private applyErrorSpecificMutation(content: string, errorCode: string): string {
    const mutations: Record<string, (content: string) => string> = {
      // Syntax errors
      TS1002: (c) => c.replace(/;(?![^]*\{)/g, ''), // Remove semicolons
      TS1005: (c) => c.replace(/\(/g, '{').replace(/\)/g, '}'), // Wrong brackets
      TS1006: (c) => c.replace(/\)/g, ''), // Missing closing parenthesis
      TS1015: (c) => c.replace(/return/g, 'retun'), // Misspelled keyword
      TS1035: (c) => c.replace(/}/g, ''), // Missing closing brace
      TS1038: (c) => c.replace(/'/g, '"'), // Mixed quotes
      TS1039: (c) => c.replace(/"/g, "'"), // Mixed quotes
      TS1107: (c) => c.replace(/\bif\b/g, 'iff'), // Invalid keyword
      TS1109: (c) => c.replace(/,/g, ';'), // Wrong separator

      // Semantic errors
      TS2304: (c) => c.replace(/\b(console|Math|Array)\b/g, 'undefinedName'), // Cannot find name
      TS2305: (c) => c.replace(/export\s+const/g, 'const'), // Remove export
      TS2307: (c) => c.replace(/import\s+.*?from\s+['"][^'"]*['"];?\s*\n?/g, ''), // Remove import
      TS2322: (c) => c.replace(/:\s*string/g, ': number').replace(/:\s*number/g, ': string'), // Type mismatch
      TS2339: (c) => c.replace(/\.(\w+)/g, '.nonExistentProperty'), // Property does not exist
      TS2345: (c) => c.replace(/\bnull\b/g, '123'), // Argument of type
      TS2554: (c) =>
        c.replace(/\(([^)]*)\)/g, (_match, args) => {
          const argList = args.split(',').slice(0, -1).join(','); // Remove last argument
          return `(${argList})`;
        }), // Wrong number of arguments
      TS2551: (c) => c.replace(/\.(\w+)/g, '.wrongProperty'), // Property does not exist
      TS2564: (c) => c.replace(/let\s+(\w+)\s*=/g, 'let $1;'), // Variable has no initializer
      TS2571: (c) => c.replace(/this\./g, 'Object.'), // Object is possibly 'null'

      // Type errors
      TS7005: (c) => c.replace(/as string/g, 'as number'), // Type mismatch
      TS7006: (c) => c.replace(/:\s*string/g, ''), // Implicit any
      TS7016: (c) => c.replace(/class\s+(\w+)/g, 'class'), // Invalid class name

      // Additional errors
      TS2454: (c) => c.replace(/const\s+(\w+)\s*=/g, 'const $1;'), // Variable used before assignment
      TS2688: (c) => c.replace(/from\s+['"][^'"]*['"]/g, 'from "non-existent-module"'), // Cannot find module
      TS2769: (c) => c.replace(/'/g, '"'), // Overload mismatch
    };

    const mutation = mutations[errorCode];
    if (!mutation) {
      // Fallback: apply generic mutation
      return this.applyGenericMutation(content, errorCode);
    }

    return mutation(content);
  }

  private applyGenericMutation(content: string, errorCode: string): string {
    // Generic mutations for error codes without specific handlers
    const genericMutations = [
      () => content.replace(/export/g, '// export'),
      () => content.replace(/import/g, '// import'),
      () => content.replace(/const/g, 'let'),
      () => content.replace(/function/g, 'var'),
      () => content + '\nundefinedVariable;',
      () => content.replace(/{/g, '{\n  // syntax error'),
      () => content.replace(/;/g, ','),
      () => content.replace(/\(/g, ' ').replace(/\)/g, ' '),
    ];

    const mutationIndex = Math.abs(this.hashCode(errorCode)) % genericMutations.length;
    return genericMutations[mutationIndex]!();
  }

  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash;
  }

  private getErrorCategory(errorCode: string): string {
    if (errorCode.startsWith('TS1')) return 'Syntax Error';
    if (errorCode.startsWith('TS2')) return 'Semantic Error';
    if (errorCode.startsWith('TS4')) return 'Declaration Error';
    if (errorCode.startsWith('TS5')) return 'Compiler Options Error';
    if (errorCode.startsWith('TS6')) return 'Type Checking Error';
    return 'Unknown Error';
  }

  async generateSummaryReport(outputDir: string, totalErrors: number): Promise<void> {
    const summary = {
      generatedAt: new Date().toISOString(),
      totalErrors,
      totalFixtures: this.fixtureCounter,
      targetErrorCodes: TARGET_ERROR_CODES.length,
      coveredErrorCodes: Object.keys(this.errorStats).length,
      errorStats: this.errorStats,
      errorDistribution: Object.entries(this.errorStats).reduce(
        (acc, [code, count]) => {
          const category = this.getErrorCategory(code);
          acc[category] = (acc[category] || 0) + count;
          return acc;
        },
        {} as Record<string, number>,
      ),
    };

    await fs.writeFile(
      path.join(outputDir, 'massive-generation-summary.json'),
      JSON.stringify(summary, null, 2),
    );

    // Generate markdown report
    const markdownReport = `# Massive Fixture Generation Report

## Summary
- **Generated**: ${totalErrors} errors across ${this.fixtureCounter} fixtures
- **Coverage**: ${summary.coveredErrorCodes}/${summary.targetErrorCodes} error types
- **Generated At**: ${summary.generatedAt}

## Error Distribution by Category
${Object.entries(summary.errorDistribution)
  .map(([category, count]) => `- **${category}**: ${count} errors`)
  .join('\n')}

## Error Codes Generated
${Object.entries(summary.errorStats)
  .sort(([, a], [, b]) => b - a)
  .map(([code, count]) => `- **${code}**: ${count} fixtures`)
  .join('\n')}

## Missing Error Types
${
  TARGET_ERROR_CODES.filter((code) => !summary.errorStats[code])
    .map((code) => `- **${code}**`)
    .join('\n') || 'None - All error types covered!'
}
`;

    await fs.writeFile(path.join(outputDir, 'generation-report.md'), markdownReport);
  }
}

async function main() {
  try {
    const args = parseArgs({
      args: process.argv.slice(2),
      options: {
        'repo-url': { type: 'string' },
        'target-dir': { type: 'string' },
        'output-dir': { type: 'string' },
        'target-errors': { type: 'string' },
        'min-errors-per-type': { type: 'string' },
        'fixtures-per-error-type': { type: 'string' },
        help: { type: 'boolean' },
      },
    });

    if (args.values.help) {
      console.log(`
Massive Repo Fixture Generator for Buildfix

Generates 1000+ TypeScript errors with at least 5 instances of each error type.

Usage: tsx massive-fixture-generator.ts [options]

Options:
  --repo-url <url>           Git repository URL (default: ${DEFAULT_CONFIG.repoUrl})
  --target-dir <dir>         Temporary clone directory (default: ${DEFAULT_CONFIG.targetDir})
  --output-dir <dir>         Fixture output directory (default: ${DEFAULT_CONFIG.outputDir})
  --target-errors <num>      Target total errors (default: ${DEFAULT_CONFIG.targetErrors})
  --min-errors-per-type <num>  Minimum errors per type (default: ${DEFAULT_CONFIG.minErrorsPerType})
  --fixtures-per-error-type <num>  Fixtures per error type (default: ${DEFAULT_CONFIG.fixturesPerErrorType})
  --help                     Show this help message

Examples:
  tsx massive-fixture-generator.ts
  tsx massive-fixture-generator.ts --target-errors 2000 --min-errors-per-type 10
  tsx massive-fixture-generator.ts --repo-url git@github.com:owner/repo.git
      `);
      process.exit(0);
    }

    const config: MassiveFixtureConfig = {
      ...DEFAULT_CONFIG,
      repoUrl: args.values['repo-url'] || DEFAULT_CONFIG.repoUrl!,
      targetDir: args.values['target-dir'] || DEFAULT_CONFIG.targetDir!,
      outputDir: args.values['output-dir'] || DEFAULT_CONFIG.outputDir!,
      targetErrors: parseInt(args.values['target-errors'] || String(DEFAULT_CONFIG.targetErrors!)),
      minErrorsPerType: parseInt(
        args.values['min-errors-per-type'] || String(DEFAULT_CONFIG.minErrorsPerType!),
      ),
      fixturesPerErrorType: parseInt(
        args.values['fixtures-per-error-type'] || String(DEFAULT_CONFIG.fixturesPerErrorType!),
      ),
      excludePatterns: DEFAULT_CONFIG.excludePatterns!,
    };

    console.log('🚀 Starting Massive Fixture Generation');
    console.log(`📋 Target: ${config.targetErrors} errors, ${config.minErrorsPerType}+ per type`);
    console.log(`📋 Config: ${JSON.stringify(config, null, 2)}`);

    const generator = new MassiveErrorGenerator(42); // Fixed seed for reproducibility

    // Clone repository
    const repoDir = await generator.cloneRepository(config);

    // Find source files
    const sourceFiles = await generator.findSourceFiles(repoDir);

    if (sourceFiles.length === 0) {
      console.log('❌ No suitable source files found');
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

    // Generate massive fixtures
    await generator.generateMassiveFixtures(sourceFiles, repoDir, config);

    // Cleanup
    console.log('\n🗑️  Cleaning up temporary files...');
    execSync(`rm -rf ${config.targetDir}`);

    console.log(`\n✅ Massive fixture generation complete!`);
    console.log(`📁 Fixtures saved to: ${config.outputDir}`);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
