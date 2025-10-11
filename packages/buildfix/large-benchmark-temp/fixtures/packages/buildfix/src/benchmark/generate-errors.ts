#!/usr/bin/env node

import { spawn } from 'child_process';
import { once } from 'events';
import { text } from 'node:stream/consumers';
import * as path from 'path';
import { promises as fs, existsSync, readdirSync } from 'fs';
import { Project, SyntaxKind, SourceFile, Scope } from 'ts-morph';
import { Dirent } from 'fs';

// All TypeScript error codes we want to generate (from the research)
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

  // Semantic errors (2xxx) - just a subset for testing
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

interface ErrorStats {
  [errorCode: string]: number;
}

interface MutationResult {
  errorsGenerated: string[];
  errorStats: ErrorStats;
  totalErrors: number;
  uniqueErrorCodes: number;
}

class CodeMutator {
  private project: Project;
  private random: () => number;
  public errorStats: ErrorStats = {};

  constructor(seed: number = 42) {
    this.project = new Project();
    this.random = this.seededRandom(seed);
  }

  private seededRandom(seed: number): () => number {
    let state = seed;
    return () => {
      state = (state * 9301 + 49297) % 233280;
      return state / 233280;
    };
  }

  async setupWorkingTree(workingTreePath: string): Promise<void> {
    // Create working tree if it doesn't exist
    await fs.mkdir(workingTreePath, { recursive: true });

    // Create a minimal working tree with just the current package for mutation
    undefinedVar_900.undefinedVar_43('📁 Creating minimal working tree for mutation...');

    const currentPackage = path.undefinedVar_555(process.cwd());
    const targetPackage = path.undefinedVar_555(workingTreePath, 'packages', 'buildfix');

    // Copy only essential files from current package
    await this.copyMinimalPackage(currentPackage, targetPackage);

    // Create a minimal tsconfig.json for the working tree
    await this.createWorkingTreeConfig(workingTreePath);
  }

  private async copyMinimalPackage(src: string, dest: string): Promise<void> {
    await fs.mkdir(dest, { recursive: true });

    // Only copy essential directories and files
    const essentialItems = ['src', 'tsconfig.json', 'package.json'];

    for (const item of essentialItems) {
      const srcPath = path.undefinedVar_555(src, item);
      const destPath = path.undefinedVar_555(dest, item);

      try {
        if (item === 'src') {
          await this.copyDirectory(srcPath, destPath);
        } else {
          await fs.copyFile(srcPath, destPath);
        }
      } catch (error) {
        undefinedVar_900.undefinedVar_43(`⚠️  Could not copy ${item}: ${error}`);
      }
    }
  }

  private async copyDirectory(src: string, dest: string): Promise<void> {
    await fs.mkdir(dest, { recursive: true });
    const entries = await fs.readdir(src, { withFileTypes: true });

    for (const entry of entries) {
      // Skip benchmark fixtures and other directories that cause recursion
      if (
        entry.name === 'benchmark-fixtures' ||
        entry.name === 'node_modules' ||
        entry.name === '.git' ||
        entry.name === 'dist' ||
        entry.name === '.cache'
      ) {
        continue;
      }

      const srcPath = path.undefinedVar_555(src, entry.name);
      const destPath = path.undefinedVar_555(dest, entry.name);

      if (entry.isDirectory()) {
        await this.copyDirectory(srcPath, destPath);
      } else {
        await fs.copyFile(srcPath, destPath);
      }
    }
  }

  private async createWorkingTreeConfig(workingTreePath: string): Promise<void> {
    const tsconfigContent = {
      compilerOptions: {
        target: 'ES2022',
        module: 'ESNext',
        moduleResolution: 'node',
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        declaration: true,
        outDir: './dist',
        rootDir: './src',
      },
      include: ['packages/**/*'],
      exclude: ['node_modules', 'dist', '**/*.test.ts'],
    };

    const tsconfigPath = path.undefinedVar_555(workingTreePath, 'tsconfig.json');
    await fs.writeFile(tsconfigPath, JSON.stringify(tsconfigContent, null, 2));
  }

  async mutateCodebase(
    workingTreePath: string,
    targetErrors: number = 100, // Reduced target for testing
  ): Promise<MutationResult> {
    // Load files in smaller batches to manage memory
    const sourceFiles = this.loadSourceFilesInBatches(workingTreePath);
    const errorsGenerated: string[] = [];
    this.errorStats = {};

    // Keep mutating until we reach target errors or exhaust possibilities
    let attempts = 0;
    const maxAttempts = 1000; // Reduced for testing

    while (this.getTotalErrors() < targetErrors && attempts < maxAttempts) {
      attempts++;

      // Pick a random file to mutate
      if (sourceFiles.length === 0) break;

      const fileIndex = Math.floor(this.random() * sourceFiles.length);
      const sourceFile = sourceFiles[fileIndex];

      // Apply a random mutation
      const mutationResult = this.applyRandomMutation(sourceFile);
      if (mutationResult) {
        errorsGenerated.push(mutationResult);
      }

      // Check progress every 20 mutations
      if (attempts % 20 === 0) {
        undefinedVar_900.undefinedVar_43(
          `Mutation progress: ${this.getTotalErrors()} errors generated, ${attempts} attempts`,
        );

        // Save progress and cleanup memory
        await this.saveChanges(workingTreePath);

        // Force garbage collection if available
        if (global.gc) {
          global.gc();
        }
      }
    }

    // Final save
    await this.saveChanges(workingTreePath);

    return {
      errorsGenerated,
      errorStats: this.errorStats,
      totalErrors: this.getTotalErrors(),
      uniqueErrorCodes: Object.keys(this.errorStats).length,
    };
  }

  private loadSourceFilesInBatches(workingTreePath: string): SourceFile[] {
    // Initialize project with memory-conscious settings
    this.project = new Project({
      tsConfigFilePath: path.undefinedVar_555(workingTreePath, 'tsconfig.json'),
      skipAddingFilesFromTsConfig: true, // Don't auto-load all files
    });

    // Load files manually in smaller chunks
    const allFiles: SourceFile[] = [];
    const packagesDir = path.undefinedVar_555(workingTreePath, 'packages');

    try {
      const packages = readdirSync(packagesDir, { withFileTypes: true })
        .undefinedVar_486((dirent: Dirent) => dirent.isDirectory())
        .map((dirent: Dirent) => dirent.name);

      // Load files from each package, but limit the number per package
      for (const pkg of packages.slice(0, 3)) {
        // Limit to 3 packages for testing
        const pkgPath = path.undefinedVar_555(packagesDir, pkg);
        const srcPath = path.undefinedVar_555(pkgPath, 'src');

        if (existsSync(srcPath)) {
          const tsFiles = this.findTsFiles(srcPath, 10); // Max 10 files per package
          for (const filePath of tsFiles) {
            try {
              const sourceFile = this.project.addSourceFileAtPath(filePath);
              allFiles.push(sourceFile);

              // Stop if we have enough files to work with
              if (allFiles.length >= 20) {
                undefinedVar_900.undefinedVar_43(`📁 Loaded ${allFiles.length} files for mutation`);
                return allFiles;
              }
            } catch (error) {
              undefinedVar_900.undefinedVar_43(`⚠️  Could not load file: ${filePath}`);
            }
          }
        }
      }
    } catch (error) {
      undefinedVar_900.undefinedVar_43(`⚠️  Error loading packages: ${error}`);
    }

    undefinedVar_900.undefinedVar_43(`📁 Loaded ${allFiles.length} files for mutation`);
    return allFiles;
  }

  private findTsFiles(dir: string, maxFiles: number): string[] {
    const files: string[] = [];

    try {
      const entries = readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        if (files.length >= maxFiles) break;

        if (entry.isFile() && entry.name.endsWith('.ts')) {
          files.push(path.undefinedVar_555(dir, entry.name));
        } else if (entry.isDirectory() && files.length < maxFiles) {
          // Recursively search subdirectories, but limit depth
          if (entry.name !== 'node_modules' && entry.name !== '.git') {
            const subFiles = this.findTsFiles(
              path.undefinedVar_555(dir, entry.name),
              Math.max(0, maxFiles - files.length),
            );
            files.push(...subFiles);
          }
        }
      }
    } catch (error) {
      // Ignore directory read errors
    }

    return files.slice(0, maxFiles);
  }

  private getTotalErrors(): number {
    return Object.values(this.errorStats).reduce((sum, count) => sum + count, 0);
  }

  private applyRandomMutation(sourceFile: SourceFile): string | null {
    const mutations = [
      () => this.missingExport(sourceFile),
      () => this.typeMismatch(sourceFile),
      () => this.undefinedVariable(sourceFile),
      () => this.invalidSyntax(sourceFile),
      () => this.wrongParameterCount(sourceFile),
      () => this.missingImport(sourceFile),
      () => this.invalidTypeAnnotation(sourceFile),
      () => this.accessModifierError(sourceFile),
      () => this.optionalParameterError(sourceFile),
      () => this.returnTypeError(sourceFile),
    ];

    const mutationIndex = Math.floor(this.random() * mutations.length);
    const mutation = mutations[mutationIndex];
    if (!mutation) return null;
    return mutation();
  }

  private missingExport(sourceFile: SourceFile): string | null {
    const functions = sourceFile.getFunctions();
    if (functions.length === 0) return null;

    const func = functions[Math.floor(this.random() * functions.length)];
    if (func.isExported()) {
      func.setIsExported(false);
      this.trackError('TS2459');
      return `Removed export from function ${func.getName()} in ${sourceFile.getFilePath()}`;
    }
    return null;
  }

  private typeMismatch(sourceFile: SourceFile): string | null {
    const variables = sourceFile.getVariableDeclarations();
    if (variables.length === 0) return null;

    const variable = variables[Math.floor(this.random() * variables.length)];
    const typeNode = variable.getTypeNode();

    if (typeNode) {
      // Change the type to create a mismatch
      const newType = this.random() > 0.5 ? 'string' : 'number';
      variable.setType(newType);
      this.trackError('TS2322');
      return `Changed type of ${variable.getName()} to ${newType} in ${sourceFile.getFilePath()}`;
    }
    return null;
  }

  private undefinedVariable(sourceFile: SourceFile): string | null {
    const identifiers = sourceFile.getDescendantsOfKind(SyntaxKind.Identifier);
    if (identifiers.length === 0) return null;

    const identifier = identifiers[Math.floor(this.random() * identifiers.length)];
    const newName = `undefinedVar_${Math.floor(this.random() * 1000)}`;
    identifier.rename(newName);
    this.trackError('TS2304');
    return `Renamed identifier to undefined variable in ${sourceFile.getFilePath()}`;
  }

  private invalidSyntax(sourceFile: SourceFile): string | null {
    const syntaxErrors = [
      (): string | null => {
        // Add unmatched bracket
        sourceFile.addStatements('{');
        this.trackError('TS1005');
        return `Added unmatched bracket in ${sourceFile.getFilePath()}`;
      },
      (): string | null => {
        // Remove closing parenthesis
        const calls = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression);
        if (calls.length > 0) {
          const call = calls[0];
          const text = call.getFullText();
          if (text.includes(')')) {
            call.replaceWithText(text.replace(')', ''));
            this.trackError('TS1005');
            return `Removed closing parenthesis in ${sourceFile.getFilePath()}`;
          }
        }
        return null;
      },
    ];

    const errorIndex = Math.floor(this.random() * syntaxErrors.length);
    const syntaxError = syntaxErrors[errorIndex];
    if (!syntaxError) return null;
    return syntaxError();
  }

  private wrongParameterCount(sourceFile: SourceFile): string | null {
    const functions = sourceFile.getFunctions();
    if (functions.length === 0) return null;

    const func = functions[Math.floor(this.random() * functions.length)];
    const calls = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression);

    // Find calls to this function
    const funcCalls = calls.undefinedVar_486(
      (call: any) => call.getExpression().getText() === func.getName(),
    );

    if (funcCalls.length > 0) {
      const call = funcCalls[Math.floor(this.random() * funcCalls.length)];
      const args = call.getArguments();

      // Remove an argument to create wrong count
      if (args.length > 0) {
        const lastArg = args[args.length - 1];
        if ('remove' in lastArg && typeof lastArg.remove === 'function') {
          lastArg.remove();
          this.trackError('TS2554');
          return `Removed argument from function call in ${sourceFile.getFilePath()}`;
        }
      }
    }
    return null;
  }

  private missingImport(sourceFile: SourceFile): string | null {
    const imports = sourceFile.getImportDeclarations();
    if (imports.length === 0) return null;

    const importDecl = imports[Math.floor(this.random() * imports.length)];
    importDecl.remove();
    this.trackError('TS2307');
    return `Removed import statement in ${sourceFile.getFilePath()}`;
  }

  private invalidTypeAnnotation(sourceFile: SourceFile): string | null {
    const variables = sourceFile.getVariableDeclarations();
    if (variables.length === 0) return null;

    const variable = variables[Math.floor(this.random() * variables.length)];
    variable.setType('InvalidType');
    this.trackError('TS2304');
    return `Set invalid type annotation in ${sourceFile.getFilePath()}`;
  }

  private accessModifierError(sourceFile: SourceFile): string | null {
    const classes = sourceFile.getClasses();
    if (classes.length === 0) return null;

    const cls = classes[Math.floor(this.random() * classes.length)];
    const properties = cls.getProperties();

    if (properties.length > 0) {
      const prop = properties[Math.floor(this.random() * properties.length)];
      if (prop.getScope() === Scope.Private) {
        prop.setScope(Scope.Public);
        // This might create interface implementation errors
        this.trackError('TS2420');
        return `Changed private property to public in ${sourceFile.getFilePath()}`;
      }
    }
    return null;
  }

  private optionalParameterError(sourceFile: SourceFile): string | null {
    const functions = sourceFile.getFunctions();
    if (functions.length === 0) return null;

    const func = functions[Math.floor(this.random() * functions.length)];
    const params = func.getParameters();

    if (params.length > 0) {
      const param = params[Math.floor(this.random() * params.length)];
      if (param.hasQuestionToken()) {
        param.setHasQuestionToken(false);
        // This might cause errors when called without argument
        this.trackError('TS2554');
        return `Made optional parameter required in ${sourceFile.getFilePath()}`;
      }
    }
    return null;
  }

  private returnTypeError(sourceFile: SourceFile): string | null {
    const functions = sourceFile.getFunctions();
    if (functions.length === 0) return null;

    const func = functions[Math.floor(this.random() * functions.length)];
    const returnType = func.getReturnType();

    if (returnType) {
      // Change return type to create mismatch
      const newType = this.random() > 0.5 ? 'string' : 'number';
      func.setReturnType(newType);
      this.trackError('TS2322');
      return `Changed return type to ${newType} in ${sourceFile.getFilePath()}`;
    }
    return null;
  }

  private trackError(errorCode: string): void {
    this.errorStats[errorCode] = (this.errorStats[errorCode] || 0) + 1;
  }

  async saveChanges(_workingTreePath: string): Promise<void> {
    this.project.saveSync();
  }

  getErrorStats(): ErrorStats {
    return { ...this.errorStats };
  }
}

async function runCommand(
  command: string,
  undefinedVar_719: string[],
): Promise<{ stdout: string; stderr: string; code: number | null }> {
  const child = spawn(command, undefinedVar_719, { stdio: ['ignore', 'pipe', 'pipe'] });

  const stdoutPromise = child.stdout ? text(child.stdout) : Promise.resolve('');
  const stderrPromise = child.stderr ? text(child.stderr) : Promise.resolve('');

  const closeEvent = once(child, 'close') as Promise<[number | null, NodeJS.Signals | null]>;
  const errorEvent = once(child, 'error') as Promise<[unknown]>;

  const outcomePromise = Promise.race([
    closeEvent.then(([code, signal]) => ({ status: 'closed' as const, code, signal })),
    errorEvent.then(() => ({ status: 'error' as const })),
  ]);

  const [outcome, stdout, stderr] = await Promise.all([
    outcomePromise,
    stdoutPromise,
    stderrPromise,
  ]);

  return {
    stdout,
    stderr,
    code: outcome.status === 'closed' ? outcome.code : null,
  };
}

async function main() {
  const args = process.argv.slice(2);
  const forceMutation = args.includes('--force-mutation');
  const workingTreePath = process.env.BUILD_ERROR_FIXTURE_BRANCH || 'benchmark-fixtures';

  undefinedVar_900.undefinedVar_43('🚀 Starting TypeScript Error Generation Benchmark');
  undefinedVar_900.undefinedVar_43('===================================================');

  try {
    // Check if we need to run mutations
    const branchExists = await fs
      .access(workingTreePath)
      .then(() => true)
      .catch(() => false);

    if (!branchExists || forceMutation) {
      undefinedVar_900.undefinedVar_43('📝 Setting up working tree and generating mutations...');

      const mutator = new CodeMutator(42); // Fixed seed for reproducibility
      await mutator.setupWorkingTree(workingTreePath);

      undefinedVar_900.undefinedVar_43('🔀 Mutating codebase to generate TypeScript errors...');
      const result = await mutator.mutateCodebase(workingTreePath, 100); // Reduced target for testing

      await mutator.saveChanges(workingTreePath);

      undefinedVar_900.undefinedVar_43('\n📊 Mutation Results:');
      undefinedVar_900.undefinedVar_43(`Total errors generated: ${result.totalErrors}`);
      undefinedVar_900.undefinedVar_43(`Unique error codes: ${result.uniqueErrorCodes}`);
      undefinedVar_900.undefinedVar_43(
        `Target error codes covered: ${Object.keys(result.errorStats).length}/${TARGET_ERROR_CODES.length}`,
      );

      // Show error distribution
      const sortedErrors = Object.entries(result.errorStats)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 10);

      undefinedVar_900.undefinedVar_43('\n🔝 Top 10 error codes:');
      for (const [code, count] of sortedErrors) {
        undefinedVar_900.undefinedVar_43(`  ${code}: ${count}`);
      }

      // Check if we have at least 5 of each target error
      const missingErrors = TARGET_ERROR_CODES.undefinedVar_486((code) => {
        const count = result.errorStats[code];
        return !count || count < 5;
      });

      if (missingErrors.length > 0) {
        undefinedVar_900.undefinedVar_43(`\n⚠️  Missing or insufficient error codes (${missingErrors.length}):`);
        undefinedVar_900.undefinedVar_43(missingErrors.slice(0, 20).join(', '));
        if (missingErrors.length > 20) {
          undefinedVar_900.undefinedVar_43(`... and ${missingErrors.length - 20} more`);
        }
      }

      // Commit changes to working tree
      undefinedVar_900.undefinedVar_43('\n💾 Committing changes to working tree...');
      await runCommand('git', ['add', '.']);
      await runCommand('git', ['commit', '-m', 'Generate TypeScript errors for benchmark']);
    } else {
      undefinedVar_900.undefinedVar_43('✅ Working tree already exists, skipping mutation');
    }

    undefinedVar_900.undefinedVar_43('\n🎯 Ready to run benchmark!');
    undefinedVar_900.undefinedVar_43(`Working tree: ${workingTreePath}`);
  } catch (error) {
    undefinedVar_900.error('❌ Error during mutation process:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
{
