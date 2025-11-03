#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { join } from 'path';

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

// Get project configuration
function getProjectConfig(projectName) {
  try {
    const result = execSync(`nx show project ${projectName} --json`, { encoding: 'utf8' });
    return JSON.parse(result);
  } catch (error) {
    console.error(`Failed to get config for ${projectName}:`, error.message);
    return null;
  }
}

// Update project configuration to add dev:watch target
function addDevWatchTarget(projectName) {
  const config = getProjectConfig(projectName);
  if (!config) {
    console.warn(`Could not get config for project: ${projectName}`);
    return false;
  }

  // Check if dev:watch already exists
  if (config.targets && config.targets['dev:watch']) {
    console.log(`- ${projectName} already has dev:watch target`);
    return false;
  }

  // Get package.json path
  const packageJsonPath = join(config.root, 'package.json');
  if (!existsSync(packageJsonPath)) {
    console.warn(`Could not find package.json for project: ${projectName} at ${packageJsonPath}`);
    return false;
  }

  try {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    const scripts = packageJson.scripts || {};

    // Determine watch command
    let watchCommand;
    if (scripts['dev:watch']) {
      watchCommand = scripts['dev:watch'];
    } else if (scripts['watch']) {
      watchCommand = 'watch';
    } else if (scripts['dev']) {
      watchCommand = 'dev';
    } else if (scripts.build && scripts.build.includes('tsc')) {
      watchCommand = 'tsc --watch';
    } else if (scripts.build && scripts.build.includes('shadow-cljs')) {
      const match = scripts.build.match(/shadow-cljs release (\w+)/);
      if (match) {
        watchCommand = `shadow-cljs watch ${match[1]}`;
      } else {
        watchCommand = 'shadow-cljs watch';
      }
    } else {
      watchCommand = 'echo "No watch command available for this project"';
    }

    // Add dev:watch script to package.json if it doesn't exist
    if (!scripts['dev:watch']) {
      scripts['dev:watch'] = watchCommand;
      packageJson.scripts = scripts;
      writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
    }

    // Update nx project configuration
    if (!config.targets) {
      config.targets = {};
    }

    config.targets['dev:watch'] = {
      executor: 'nx:run-script',
      options: {
        script: 'dev:watch',
      },
      configurations: {},
      parallelism: true,
      dependsOn: ['^build'],
    };

    // Write updated project.json
    const projectJsonPath = join(config.root, 'project.json');
    writeFileSync(projectJsonPath, JSON.stringify(config, null, 2) + '\n');

    console.log(`✓ Added dev:watch to ${projectName}: ${watchCommand}`);
    return true;
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
    const config = getProjectConfig(project);
    if (config && config.targets && config.targets['dev:watch']) {
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
