#!/usr/bin/env node

/**
 * Migration utility to rename existing test files to follow new naming conventions
 * Usage: node scripts/migrate-tests.js [--dry-run] [--type=unit|integration|e2e] [--confirm]
 */

const fs = require('fs');
const path = require('path');
const { globSync } = require('glob');

// Import the test classifier
const { TestClassifier } = require('../packages/test-classifier/dist/classifier.js');

const DEFAULT_OPTIONS = {
  dryRun: false,
  type: null, // null means auto-classify
  confirm: false,
  verbose: false,
};

const NAMING_PATTERNS = {
  unit: [
    { from: /\.test\.ts$/, to: '.unit.test.ts' },
    { from: /\.test\.js$/, to: '.unit.test.js' },
    { from: /\.spec\.ts$/, to: '.unit.spec.ts' },
    { from: /\.spec\.js$/, to: '.unit.spec.js' },
  ],
  integration: [
    { from: /\.test\.ts$/, to: '.integration.test.ts' },
    { from: /\.test\.js$/, to: '.integration.test.js' },
    { from: /\.spec\.ts$/, to: '.integration.spec.ts' },
    { from: /\.spec\.js$/, to: '.integration.spec.js' },
  ],
  e2e: [
    { from: /\.test\.ts$/, to: '.e2e.test.ts' },
    { from: /\.test\.js$/, to: '.e2e.test.js' },
    { from: /\.spec\.ts$/, to: '.e2e.spec.ts' },
    { from: /\.spec\.js$/, to: '.e2e.spec.js' },
  ],
};

function parseArgs() {
  const args = process.argv.slice(2);
  const options = { ...DEFAULT_OPTIONS };

  for (const arg of args) {
    if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--confirm') {
      options.confirm = true;
    } else if (arg === '--verbose') {
      options.verbose = true;
    } else if (arg.startsWith('--type=')) {
      const type = arg.split('=')[1];
      if (['unit', 'integration', 'e2e'].includes(type)) {
        options.type = type;
      } else {
        console.error(`Invalid type: ${type}. Must be one of: unit, integration, e2e`);
        process.exit(1);
      }
    } else if (arg === '--help') {
      console.log(`
Test Migration Utility

Renames existing test files to follow new naming conventions:
- Unit tests: *.unit.test.ts, *.unit.spec.ts
- Integration tests: *.integration.test.ts, *.integration.spec.ts  
- E2E tests: *.e2e.test.ts, *.e2e.spec.ts

Usage:
  node scripts/migrate-tests.js [options]

Options:
  --dry-run          Show what would be renamed without making changes
  --type=TYPE        Force all files to be renamed as TYPE (unit|integration|e2e)
  --confirm          Prompt before each rename
  --verbose          Show detailed output
  --help             Show this help message

Examples:
  node scripts/migrate-tests.js --dry-run --verbose
  node scripts/migrate-tests.js --type=unit
  node scripts/migrate-tests.js --confirm
      `);
      process.exit(0);
    }
  }

  return options;
}

function findTestFiles() {
  const patterns = [
    'packages/**/src/**/*.test.ts',
    'packages/**/src/**/*.test.js',
    'packages/**/src/**/*.spec.ts',
    'packages/**/src/**/*.spec.js',
    'services/**/src/**/*.test.ts',
    'services/**/src/**/*.test.js',
    'services/**/src/**/*.spec.ts',
    'services/**/src/**/*.spec.js',
    'tests/**/*.test.ts',
    'tests/**/*.test.js',
    'tests/**/*.spec.ts',
    'tests/**/*.spec.js',
  ];

  const files = [];
  for (const pattern of patterns) {
    try {
      const matches = globSync(pattern, {
        cwd: process.cwd(),
        absolute: true,
        ignore: ['**/node_modules/**', '**/dist/**', '**/coverage/**'],
      });
      files.push(...matches);
    } catch (error) {
      console.warn(`Warning: Could not glob pattern ${pattern}:`, error.message);
    }
  }

  return [...new Set(files)]; // Remove duplicates
}

function classifyTestFile(filePath, classifier) {
  if (
    filePath.includes('.unit.') ||
    filePath.includes('.integration.') ||
    filePath.includes('.e2e.')
  ) {
    // Already follows new naming convention
    return null;
  }

  const relativePath = path.relative(process.cwd(), filePath);
  const result = classifier.classifyFile(relativePath);

  return result.type;
}

function getNewFileName(filePath, testType) {
  const patterns = NAMING_PATTERNS[testType];
  if (!patterns) {
    return null;
  }

  for (const pattern of patterns) {
    if (pattern.from.test(filePath)) {
      return filePath.replace(pattern.from, pattern.to);
    }
  }

  return null;
}

function shouldRenameFile(filePath, newFilePath) {
  if (!newFilePath) {
    return false;
  }

  if (filePath === newFilePath) {
    return false;
  }

  if (fs.existsSync(newFilePath)) {
    console.warn(`⚠️  Target file already exists: ${newFilePath}`);
    return false;
  }

  return true;
}

async function renameFile(oldPath, newPath, options) {
  if (options.confirm) {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const answer = await new Promise((resolve) => {
      rl.question(`Rename ${oldPath} to ${newPath}? [y/N] `, resolve);
    });

    rl.close();

    if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
      console.log('❌ Skipped');
      return false;
    }
  }

  try {
    // Ensure directory exists
    const dir = path.dirname(newPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.renameSync(oldPath, newPath);
    console.log(`✅ Renamed: ${oldPath} -> ${newPath}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to rename ${oldPath}:`, error.message);
    return false;
  }
}

async function migrateTests(options) {
  console.log('🔍 Finding test files...');

  const testFiles = findTestFiles();
  console.log(`Found ${testFiles.length} test files`);

  if (testFiles.length === 0) {
    console.log('No test files found to migrate');
    return;
  }

  // Initialize classifier
  const classifier = new TestClassifier();

  const migrations = [];

  for (const filePath of testFiles) {
    const testType = options.type || classifyTestFile(filePath, classifier);

    if (!testType) {
      if (options.verbose) {
        console.log(`ℹ️  Skipping (already follows convention): ${filePath}`);
      }
      continue;
    }

    const newFilePath = getNewFileName(filePath, testType);

    if (shouldRenameFile(filePath, newFilePath)) {
      migrations.push({
        oldPath: filePath,
        newPath: newFilePath,
        type: testType,
      });
    }
  }

  console.log(`\\n📋 Found ${migrations.length} files to rename`);

  if (migrations.length === 0) {
    console.log('No files need to be renamed');
    return;
  }

  // Group by type for summary
  const byType = {};
  for (const migration of migrations) {
    if (!byType[migration.type]) {
      byType[migration.type] = [];
    }
    byType[migration.type].push(migration);
  }

  for (const [type, typeMigrations] of Object.entries(byType)) {
    console.log(`\\n  ${type.toUpperCase()}: ${typeMigrations.length} files`);
    if (options.verbose) {
      for (const migration of typeMigrations) {
        console.log(`    ${migration.oldPath} -> ${migration.newPath}`);
      }
    }
  }

  if (options.dryRun) {
    console.log('\\n🔍 DRY RUN - No files were renamed');
    console.log('Run without --dry-run to perform the migration');
    return;
  }

  console.log('\\n🚀 Starting migration...');

  let renamedCount = 0;
  for (const migration of migrations) {
    const success = await renameFile(migration.oldPath, migration.newPath, options);
    if (success) {
      renamedCount++;
    }
  }

  console.log(`\\n✅ Migration complete! Renamed ${renamedCount} files`);

  if (renamedCount > 0) {
    console.log('\\n📝 Next steps:');
    console.log('1. Run tests to ensure everything still works:');
    console.log('   pnpm test:unit');
    console.log('   pnpm test:integration');
    console.log('   pnpm test:e2e');
    console.log('2. Update any import statements that reference the old file names');
    console.log('3. Commit the changes');
  }
}

// Main execution
if (require.main === module) {
  const options = parseArgs();
  migrateTests(options).catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
}

module.exports = { migrateTests };
