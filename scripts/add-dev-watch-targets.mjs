#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

// Get all projects in the workspace
function getProjects() {
  try {
    const result = execSync('nx show projects --type=lib', { encoding: 'utf8' });
    return result.trim().split('\n').filter(Boolean);
  } catch (error) {
    console.error('Failed to get projects:', error.message);
    return [];
  }
}

// Check if a project has a specific target
function hasTarget(projectName, targetName) {
  try {
    const result = execSync(`nx show project ${projectName} --json`, { encoding: 'utf8' });
    const project = JSON.parse(result);
    return project.targets && project.targets[targetName];
  } catch (error) {
    return false;
  }
}

// Get package.json path for a project
function getPackageJsonPath(projectName) {
  // Try to find the package.json file for the project
  const possiblePaths = [
    `packages/${projectName.replace('@promethean-os/', '').replace('@promethean/', '')}/package.json`,
    `packages/${projectName}/package.json`,
    `services/${projectName}/package.json`,
    `tools/${projectName}/package.json`,
  ];

  for (const path of possiblePaths) {
    if (existsSync(path)) {
      return path;
    }
  }

  // Try to find it using nx project info
  try {
    const result = execSync(`nx show project ${projectName} --json`, { encoding: 'utf8' });
    const project = JSON.parse(result);
    if (project.root) {
      const packagePath = join(project.root, 'package.json');
      if (existsSync(packagePath)) {
        return packagePath;
      }
    }
  } catch (error) {
    // Ignore
  }

  return null;
}

// Determine appropriate watch command based on project configuration
function getWatchCommand(packageJson) {
  const scripts = packageJson.scripts || {};

  // If project already has a watch script, use it
  if (scripts.watch) {
    return 'pnpm run watch';
  }

  // If project has dev script, use it
  if (scripts.dev) {
    return 'pnpm run dev';
  }

  // If project has TypeScript build, use tsc --watch
  if (scripts.build && scripts.build.includes('tsc')) {
    return 'tsc --watch';
  }

  // If project has shadow-cljs build, use shadow-cljs watch
  if (scripts.build && scripts.build.includes('shadow-cljs')) {
    // Extract the shadow-cljs target name
    const match = scripts.build.match(/shadow-cljs release (\w+)/);
    if (match) {
      return `shadow-cljs watch ${match[1]}`;
    }
    return 'shadow-cljs watch';
  }

  // Default fallback
  return 'echo "No watch command available for this project"';
}

// Add dev:watch target to a project
function addDevWatchTarget(projectName) {
  const packageJsonPath = getPackageJsonPath(projectName);
  if (!packageJsonPath) {
    console.warn(`Could not find package.json for project: ${projectName}`);
    return false;
  }

  try {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

    // Initialize scripts object if it doesn't exist
    if (!packageJson.scripts) {
      packageJson.scripts = {};
    }

    // Add dev:watch script if it doesn't exist
    if (!packageJson.scripts['dev:watch']) {
      const watchCommand = getWatchCommand(packageJson);
      packageJson.scripts['dev:watch'] = watchCommand;

      writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
      console.log(`✓ Added dev:watch to ${projectName}: ${watchCommand}`);
      return true;
    } else {
      console.log(`- ${projectName} already has dev:watch`);
      return false;
    }
  } catch (error) {
    console.error(`Failed to add dev:watch to ${projectName}:`, error.message);
    return false;
  }
}

// Main execution
function main() {
  console.log('Adding dev:watch targets to all projects...\n');

  const projects = getProjects();
  let addedCount = 0;
  let alreadyExistsCount = 0;
  let failedCount = 0;

  for (const project of projects) {
    if (hasTarget(project, 'dev:watch')) {
      console.log(`- ${project} already has dev:watch target`);
      alreadyExistsCount++;
      continue;
    }

    if (addDevWatchTarget(project)) {
      addedCount++;
    } else {
      failedCount++;
    }
  }

  console.log(`\nSummary:`);
  console.log(`- Added dev:watch to ${addedCount} projects`);
  console.log(`- Already existed in ${alreadyExistsCount} projects`);
  console.log(`- Failed for ${failedCount} projects`);

  if (addedCount > 0) {
    console.log(`\nYou can now use:`);
    console.log(`- nx dev:watch <project-name> to watch a specific project`);
    console.log(`- nx run-many -t dev:watch to watch all projects`);
  }
}

main();
