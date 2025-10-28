#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { join } from 'path';

const PACKAGES_DIR = 'packages';
const GIT_SUBREPO_PATH = '/home/err/devel/promethean/git-subrepo-source/lib';
const ORG_NAME = 'riatzukiza';

// Set up environment for git-subrepo
process.env.PATH = `${GIT_SUBREPO_PATH}:${process.env.PATH}`;

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

function getIndependentPackages() {
  const packageDirs = execSync(`ls -d ${PACKAGES_DIR}/*/`, { encoding: 'utf8' })
    .trim()
    .split('\n')
    .map((dir) => dir.replace(`${PACKAGES_DIR}/`, '').replace('/', ''));

  const independent = [];

  for (const packageDir of packageDirs) {
    const packageJson = getPackageJson(packageDir);
    if (!packageJson) continue;

    const hasInternal = hasInternalDependencies(packageJson);
    if (!hasInternal) {
      independent.push({
        name: packageJson.name || packageDir,
        dir: packageDir,
        packageJson,
      });
    }
  }

  return independent;
}

function createRemoteRepository(packageName) {
  const repoName = packageName.replace('@promethean-os/', '');
  console.log(`Creating remote repository: ${ORG_NAME}/${repoName}`);

  try {
    // Check if repo exists first
    execSync(`gh repo view ${ORG_NAME}/${repoName}`, { stdio: 'pipe' });
    console.log(`Repository ${ORG_NAME}/${repoName} already exists`);
  } catch (error) {
    // Create new repository
    execSync(`gh repo create ${ORG_NAME}/${repoName} --public --clone=false`, { stdio: 'inherit' });
    console.log(`Created repository ${ORG_NAME}/${repoName}`);
  }

  return `git@github.com:${ORG_NAME}/${repoName}.git`;
}

function initializeSubrepo(packageDir, remoteUrl) {
  const packagePath = join(PACKAGES_DIR, packageDir);

  console.log(`Initializing subrepo for ${packagePath}`);

  try {
    // Check if already a subrepo
    try {
      const status = execSync(`git subrepo status ${packagePath}`, { stdio: 'pipe' });
      console.log(`Subrepo already exists for ${packagePath}, configuring remote...`);

      // Configure remote for existing subrepo
      execSync(`git subrepo config ${packagePath} remote ${remoteUrl} --force`, {
        stdio: 'inherit',
      });

      // Push to remote
      execSync(`git subrepo push ${packagePath}`, { stdio: 'inherit' });

      console.log(`Successfully configured and pushed existing subrepo: ${packagePath}`);
      return true;
    } catch (statusError) {
      // Not a subrepo yet, initialize new one
      console.log(`Creating new subrepo for ${packagePath}`);

      // Initialize as subrepo with remote
      execSync(`git subrepo init ${packagePath} --remote ${remoteUrl}`, { stdio: 'inherit' });

      // Push to remote
      execSync(`git subrepo push ${packagePath}`, { stdio: 'inherit' });

      console.log(`Successfully created new subrepo: ${packagePath}`);
      return true;
    }
  } catch (error) {
    console.error(`Failed to initialize subrepo for ${packagePath}:`, error.message);
    return false;
  }
}

function migratePackage(packageInfo) {
  console.log(`\n=== Migrating ${packageInfo.name} ===`);

  try {
    // Create remote repository
    const remoteUrl = createRemoteRepository(packageInfo.name);

    // Initialize subrepo
    const success = initializeSubrepo(packageInfo.dir, remoteUrl);

    if (success) {
      console.log(`✓ Successfully migrated ${packageInfo.name}`);
      return true;
    } else {
      console.log(`✗ Failed to migrate ${packageInfo.name}`);
      return false;
    }
  } catch (error) {
    console.error(`✗ Error migrating ${packageInfo.name}:`, error.message);
    return false;
  }
}

function verifyGitSubrepo() {
  try {
    const version = execSync('git subrepo version', { encoding: 'utf8' });
    console.log('Git-subrepo is available:', version.split('\n')[0]);
    return true;
  } catch (error) {
    console.error('Git-subrepo is not available. Please install it first.');
    return false;
  }
}

function main() {
  const args = process.argv.slice(2);
  const packageFilter = args[0]; // Optional: specific package to migrate

  console.log('=== GIT SUBREPO MIGRATION TOOL ===\n');

  // Verify git-subrepo is available
  if (!verifyGitSubrepo()) {
    process.exit(1);
  }

  // Get independent packages
  const independentPackages = getIndependentPackages();

  if (packageFilter) {
    // Migrate specific package
    const packageToMigrate = independentPackages.find(
      (p) => p.name === packageFilter || p.dir === packageFilter,
    );

    if (!packageToMigrate) {
      console.error(`Package ${packageFilter} not found or has internal dependencies`);
      process.exit(1);
    }

    migratePackage(packageToMigrate);
  } else {
    // Show migration plan
    console.log(`Found ${independentPackages.length} independent packages ready for migration:\n`);

    independentPackages.forEach((pkg, index) => {
      console.log(`${index + 1}. ${pkg.name} (${pkg.dir})`);
    });

    console.log('\nTo migrate all packages, run: node migrate-packages.mjs all');
    console.log('To migrate a specific package, run: node migrate-packages.mjs <package-name>');

    if (args[0] === 'all') {
      console.log('\n=== STARTING MIGRATION ===\n');

      let successCount = 0;
      let failCount = 0;

      for (const packageInfo of independentPackages) {
        if (migratePackage(packageInfo)) {
          successCount++;
        } else {
          failCount++;
        }
      }

      console.log(`\n=== MIGRATION COMPLETE ===`);
      console.log(`Successfully migrated: ${successCount} packages`);
      console.log(`Failed to migrate: ${failCount} packages`);
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { getIndependentPackages, migratePackage };
