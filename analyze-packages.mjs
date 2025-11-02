#!/usr/bin/env node

import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const PACKAGES_DIR = 'packages';

function getPackageJson(packageDir) {
  try {
    const content = readFileSync(join(PACKAGES_DIR, packageDir, 'package.json'), 'utf8');
    return JSON.parse(content);
  } catch (error) {
    return null;
  }
}

function hasInternalDependencies(packageJson) {
  if (!packageJson || !packageJson.dependencies) return false;

  const deps = Object.keys(packageJson.dependencies);
  return deps.some((dep) => dep.startsWith('@promethean-os/') && dep !== packageJson.name);
}

function analyzePackages() {
  const packageDirs = readdirSync(PACKAGES_DIR).filter((dir) => {
    const fullPath = join(PACKAGES_DIR, dir);
    return statSync(fullPath).isDirectory() && dir !== 'node_modules';
  });

  const packages = [];
  const independent = [];
  const dependent = [];

  for (const packageDir of packageDirs) {
    const packageJson = getPackageJson(packageDir);
    if (!packageJson) continue;

    const hasInternal = hasInternalDependencies(packageJson);
    const packageInfo = {
      name: packageJson.name || packageDir,
      dir: packageDir,
      hasInternalDependencies: hasInternal,
      dependencies: packageJson.dependencies || {},
    };

    packages.push(packageInfo);

    if (hasInternal) {
      dependent.push(packageInfo);
    } else {
      independent.push(packageInfo);
    }
  }

  return { packages, independent, dependent };
}

function main() {
  const { packages, independent, dependent } = analyzePackages();

  console.log('\n=== PACKAGE ANALYSIS ===\n');
  console.log(`Total packages: ${packages.length}`);
  console.log(`Independent packages (no internal deps): ${independent.length}`);
  console.log(`Dependent packages (has internal deps): ${dependent.length}\n`);

  console.log('=== INDEPENDENT PACKAGES (Migration Candidates) ===\n');
  independent.forEach((pkg) => {
    console.log(`✓ ${pkg.name} (${pkg.dir})`);
  });

  console.log('\n=== DEPENDENT PACKAGES (Need Dependency Resolution) ===\n');
  dependent.forEach((pkg) => {
    const internalDeps = Object.keys(pkg.dependencies).filter(
      (dep) => dep.startsWith('@promethean-os/') && dep !== pkg.name,
    );
    console.log(`✗ ${pkg.name} (${pkg.dir}) -> depends on: ${internalDeps.join(', ')}`);
  });

  console.log('\n=== MIGRATION PRIORITY ORDER ===\n');
  console.log('Phase 1 (Independent packages):');
  independent.forEach((pkg) => console.log(`  - ${pkg.name}`));

  console.log('\nPhase 2 (Dependent packages - in dependency order):');
  dependent.forEach((pkg) => console.log(`  - ${pkg.name}`));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { analyzePackages };
