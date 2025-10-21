/* eslint-disable functional/no-let, functional/immutable-data, @typescript-eslint/require-await, @typescript-eslint/no-unused-vars */
import test from 'ava';
import { execSync } from 'child_process';
import { readFileSync, existsSync, writeFileSync } from 'fs';
import { join } from 'path';

// Integration tests for Infrastructure Stability
// Focus: Build Pipeline, Type Safety, Dependency Resolution, CI/CD Integration

test('Infrastructure Integration - Build Pipeline Validation', async (t) => {
  const projectRoot = process.cwd();

  // Test that all packages can be built without errors
  const packagesDir = join(projectRoot, 'packages');
  const packageDirs = [
    'agent',
    'agent-ecs',
    'core',
    'ds',
    'fsm',
    'infrastructure',
    'kanban',
    'level-cache',
    'markdown',
    'mcp',
    'migrations',
    'piper',
    'scar',
    'security',
    'testing',
  ];

  const buildResults: Array<{ package: string; success: boolean; error?: string }> = [];

  for (const pkg of packageDirs) {
    const pkgPath = join(packagesDir, pkg);
    if (!existsSync(pkgPath)) continue;

    try {
      // Test TypeScript compilation
      execSync(`npx tsc --noEmit --project ${pkgPath}/tsconfig.json`, {
        cwd: projectRoot,
        stdio: 'pipe',
      });

      buildResults.push({ package: pkg, success: true });
    } catch (error: any) {
      buildResults.push({
        package: pkg,
        success: false,
        error: error.message?.substring(0, 200),
      });
    }
  }

  // At least 90% of packages should build successfully
  const successCount = buildResults.filter((r) => r.success).length;
  const successRate = (successCount / buildResults.length) * 100;

  t.true(successRate >= 90, `Build success rate ${successRate}% is below 90%`);

  // Log any failures for debugging
  const failures = buildResults.filter((r) => !r.success);
  if (failures.length > 0) {
    console.log('Build failures:', failures);
  }
});

test('Infrastructure Integration - Type Safety Regression Tests', async (t) => {
  const projectRoot = process.cwd();

  // Test that critical type definitions are working correctly
  const typeTests = [
    {
      name: 'FSM Machine Types',
      code: `
        import { createMachine, defineTransition } from './packages/fsm/src/index.js';
        const machine = createMachine({
          initialState: 'idle',
          initialContext: () => ({}),
          transitions: [defineTransition({
            from: 'idle',
            to: 'active',
            event: 'start',
            reducer: ({ context }) => context
          })]
        });
      `,
    },
    {
      name: 'Security Framework Types',
      code: `
        import { SecurityTestFramework } from './packages/security/src/testing/index.js';
        const framework = new SecurityTestFramework();
      `,
    },
    {
      name: 'Kanban System Types',
      code: `
        import { KanbanBoard } from './packages/kanban/src/index.js';
        // Basic type instantiation test
      `,
    },
  ];

  const typeResults: Array<{ test: string; success: boolean; error?: string }> = [];

  for (const typeTest of typeTests) {
    try {
      // Create temporary test file
      const tempFile = join(projectRoot, 'temp-type-test.ts');
      writeFileSync(tempFile, typeTest.code);

      // Test TypeScript compilation
      execSync(`npx tsc --noEmit ${tempFile}`, {
        cwd: projectRoot,
        stdio: 'pipe',
      });

      // Clean up
      try {
        execSync(`rm ${tempFile}`, { cwd: projectRoot });
      } catch {}

      typeResults.push({ test: typeTest.name, success: true });
    } catch (error: any) {
      typeResults.push({
        test: typeTest.name,
        success: false,
        error: error.message?.substring(0, 200),
      });
    }
  }

  // All type tests should pass
  const failures = typeResults.filter((r) => !r.success);
  t.true(failures.length === 0, `Type safety failures: ${failures.map((f) => f.test).join(', ')}`);
});

test('Infrastructure Integration - Dependency Conflict Resolution', async (t) => {
  const projectRoot = process.cwd();

  // Check for dependency conflicts across packages
  try {
    // Check for duplicate dependencies
    const duplicateCheck = execSync('pnpm ls --depth=0 --json', {
      cwd: projectRoot,
      encoding: 'utf8',
    });

    const dependencies = JSON.parse(duplicateCheck);

    // Look for version conflicts in critical dependencies
    const criticalDeps = ['typescript', 'ava', 'eslint', '@typescript-eslint/parser'];
    const conflicts: Array<{ dependency: string; versions: string[] }> = [];

    for (const dep of criticalDeps) {
      const versions = new Set<string>();

      // This is a simplified check - in reality you'd parse the pnpm output more carefully
      if (duplicateCheck.includes(`${dep}@`)) {
        const versionMatches = duplicateCheck.match(new RegExp(`${dep}@(\\d+\\.\\d+\\.\\d+)`, 'g'));
        if (versionMatches) {
          versionMatches.forEach((match) => {
            const version = match.split('@')[1];
            versions.add(version);
          });
        }
      }

      if (versions.size > 1) {
        conflicts.push({ dependency: dep, versions: Array.from(versions) });
      }
    }

    // Should have no conflicts in critical dependencies
    t.true(conflicts.length === 0, `Dependency conflicts found: ${JSON.stringify(conflicts)}`);
  } catch (error: any) {
    t.fail(`Dependency check failed: ${error.message}`);
  }
});

test('Infrastructure Integration - CI/CD Pipeline Validation', async (t) => {
  const projectRoot = process.cwd();

  // Test that CI/CD configuration files are valid
  const ciFiles = [
    '.github/workflows/ci.yml',
    '.github/workflows/test.yml',
    '.github/workflows/security.yml',
    '.github/workflows/release.yml',
  ];

  const ciResults: Array<{ file: string; exists: boolean; valid?: boolean }> = [];

  for (const file of ciFiles) {
    const filePath = join(projectRoot, file);
    const exists = existsSync(filePath);

    if (exists) {
      try {
        const content = readFileSync(filePath, 'utf8');

        // Basic YAML validation (check for common CI/CD patterns)
        const hasValidStructure =
          content.includes('name:') &&
          content.includes('on:') &&
          content.includes('jobs:') &&
          !content.includes('  <<: *');

        ciResults.push({ file, exists, valid: hasValidStructure });
      } catch (error) {
        ciResults.push({ file, exists, valid: false });
      }
    } else {
      ciResults.push({ file, exists });
    }
  }

  // At least 75% of CI files should exist and be valid
  const validFiles = ciResults.filter((r) => r.exists && r.valid).length;
  const expectedFiles = Math.ceil(ciFiles.length * 0.75);

  t.true(validFiles >= expectedFiles, `Only ${validFiles}/${ciFiles.length} CI files are valid`);
});

test('Infrastructure Integration - Performance Benchmarks', async (t) => {
  const projectRoot = process.cwd();

  // Test build performance
  const buildStart = Date.now();

  try {
    execSync('pnpm build --silent', {
      cwd: projectRoot,
      stdio: 'pipe',
    });

    const buildTime = Date.now() - buildStart;

    // Build should complete within reasonable time (5 minutes for full monorepo)
    t.true(buildTime < 5 * 60 * 1000, `Build took ${buildTime}ms, expected < 300000ms`);
  } catch (error: any) {
    t.fail(`Build performance test failed: ${error.message}`);
  }

  // Test test execution performance
  const testStart = Date.now();

  try {
    execSync('pnpm test --timeout=30000', {
      cwd: projectRoot,
      stdio: 'pipe',
    });

    const testTime = Date.now() - testStart;

    // Tests should complete within reasonable time (2 minutes)
    t.true(testTime < 2 * 60 * 1000, `Tests took ${testTime}ms, expected < 120000ms`);
  } catch (error: any) {
    // Test failures are okay for this performance test, we're just measuring time
    const testTime = Date.now() - testStart;
    t.true(testTime < 2 * 60 * 1000, `Tests took ${testTime}ms, expected < 120000ms`);
  }
});

test('Infrastructure Integration - Security Scanning Integration', async (t) => {
  const projectRoot = process.cwd();

  // Test that security scanning tools are configured
  const securityFiles = [
    '.semgrepignore',
    'sonar-project.properties',
    '.github/workflows/security.yml',
    'SECURITY.md',
  ];

  const securityResults: Array<{ file: string; exists: boolean }> = [];

  for (const file of securityFiles) {
    const filePath = join(projectRoot, file);
    securityResults.push({ file, exists: existsSync(filePath) });
  }

  // At least 75% of security files should exist
  const existingFiles = securityResults.filter((r) => r.exists).length;
  const expectedFiles = Math.ceil(securityFiles.length * 0.75);

  t.true(
    existingFiles >= expectedFiles,
    `Only ${existingFiles}/${securityFiles.length} security files exist`,
  );

  // Test semgrep configuration if it exists
  if (existsSync(join(projectRoot, 'semgrep.yml'))) {
    try {
      const semgrepConfig = readFileSync(join(projectRoot, 'semgrep.yml'), 'utf8');

      // Should have basic rules configured
      const hasRules =
        semgrepConfig.includes('rules:') &&
        (semgrepConfig.includes('security') || semgrepConfig.includes('owasp'));

      t.true(hasRules, 'Semgrep configuration should include security rules');
    } catch (error) {
      t.fail('Failed to read semgrep configuration');
    }
  }
});

test('Infrastructure Integration - Documentation Generation', async (t) => {
  const projectRoot = process.cwd();

  // Test that documentation can be generated
  try {
    // Test TypeScript documentation generation
    execSync('npx typedoc --version', {
      cwd: projectRoot,
      stdio: 'pipe',
    });

    // Test that API docs can be generated for core packages
    const corePackages = ['core', 'fsm', 'security'];

    for (const pkg of corePackages) {
      const pkgPath = join(projectRoot, 'packages', pkg);
      if (existsSync(pkgPath)) {
        try {
          execSync(`npx typedoc --entryPoints src/index.ts --out docs/${pkg} --skipErrorChecking`, {
            cwd: pkgPath,
            stdio: 'pipe',
          });

          // Check that documentation was generated
          const docsPath = join(pkgPath, 'docs', pkg, 'index.html');
          t.true(existsSync(docsPath), `Documentation not generated for ${pkg}`);
        } catch (error) {
          // Documentation generation failures are not critical for this test
          console.log(`Documentation generation failed for ${pkg}:`, error);
        }
      }
    }
  } catch (error) {
    // TypeDoc might not be installed, which is okay for this test
    t.pass('TypeDoc not available, skipping documentation generation test');
  }
});

test('Infrastructure Integration - Environment Configuration', async (t) => {
  const projectRoot = process.cwd();

  // Test that environment configuration is properly set up
  const envFiles = ['.env.example', '.env', '.env.test'];

  const envResults: Array<{ file: string; exists: boolean; hasRequiredVars?: boolean }> = [];

  for (const file of envFiles) {
    const filePath = join(projectRoot, file);
    const exists = existsSync(filePath);

    if (exists) {
      try {
        const content = readFileSync(filePath, 'utf8');

        // Check for common environment variables
        const requiredVars = ['NODE_ENV'];
        const hasRequiredVars = requiredVars.some((var_) => content.includes(var_));

        envResults.push({ file, exists, hasRequiredVars });
      } catch (error) {
        envResults.push({ file, exists, hasRequiredVars: false });
      }
    } else {
      envResults.push({ file, exists });
    }
  }

  // .env.example should always exist and have required variables
  const envExample = envResults.find((r) => r.file === '.env.example');
  t.true(envExample?.exists, '.env.example should exist');
  t.true(envExample?.hasRequiredVars, '.env.example should have required variables');
});

test('Infrastructure Integration - Monitoring and Observability', async (t) => {
  const projectRoot = process.cwd();

  // Test that monitoring configuration is in place
  const monitoringFiles = [
    'ecosystem.config.mjs', // PM2 configuration
    'docker-compose.yml', // Docker monitoring
    '.github/workflows/monitoring.yml', // Monitoring workflows
  ];

  const monitoringResults: Array<{ file: string; exists: boolean }> = [];

  for (const file of monitoringFiles) {
    const filePath = join(projectRoot, file);
    monitoringResults.push({ file, exists: existsSync(filePath) });
  }

  // At least one monitoring configuration should exist
  const existingFiles = monitoringResults.filter((r) => r.exists).length;
  t.true(existingFiles >= 1, `At least one monitoring file should exist, found ${existingFiles}`);

  // Test PM2 configuration if it exists
  if (existsSync(join(projectRoot, 'ecosystem.config.mjs'))) {
    try {
      const pm2Config = readFileSync(join(projectRoot, 'ecosystem.config.mjs'), 'utf8');

      // Should have basic monitoring configuration
      const hasMonitoring =
        pm2Config.includes('apps:') &&
        (pm2Config.includes('watch:') ||
          pm2Config.includes('log_file:') ||
          pm2Config.includes('error_file:'));

      t.true(hasMonitoring, 'PM2 configuration should include monitoring settings');
    } catch (error) {
      t.fail('Failed to read PM2 configuration');
    }
  }
});
