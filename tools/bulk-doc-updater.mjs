#!/usr/bin/env node

/**
 * Bulk Documentation Updater
 * 
 * Updates all package documentation with code links
 * Usage: node tools/bulk-doc-updater.mjs [--dry-run]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

/**
 * Get all packages that have documentation
 */
function getDocumentedPackages() {
  const docsDir = path.join(rootDir, 'docs', 'packages');
  const packages = fs.readdirSync(docsDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name);
  
  return packages;
}

/**
 * Check if package has source code
 */
function hasSourceCode(packageName) {
  const srcDir = path.join(rootDir, 'packages', packageName, 'src');
  return fs.existsSync(srcDir);
}

/**
 * Generate code links for a package
 */
function generateCodeLinks(packageName) {
  try {
    const result = execSync(`node tools/code-scanner-fixed.mjs ${packageName}`, {
      cwd: rootDir,
      encoding: 'utf-8'
    });
    
    return result;
  } catch (error) {
    console.error(`Failed to scan ${packageName}:`, error.message);
    return null;
  }
}

/**
 * Check if documentation already has implementation section
 */
function hasImplementationSection(docPath) {
  try {
    const content = fs.readFileSync(docPath, 'utf-8');
    return content.includes('## 📁 Implementation');
  } catch {
    return false;
  }
}

/**
 * Update package documentation with code links
 */
function updatePackageDocumentation(packageName, dryRun = false) {
  const docPath = path.join(rootDir, 'docs', 'packages', packageName, 'README.md');
  
  if (!fs.existsSync(docPath)) {
    console.log(`⚠️  No documentation found for ${packageName}`);
    return false;
  }
  
  if (!hasSourceCode(packageName)) {
    console.log(`⚠️  No source code found for ${packageName}`);
    return false;
  }
  
  if (hasImplementationSection(docPath)) {
    console.log(`✅ ${packageName} already has implementation section`);
    return true;
  }
  
  // Generate code links
  const codeLinks = generateCodeLinks(packageName);
  if (!codeLinks) {
    console.log(`❌ Failed to generate code links for ${packageName}`);
    return false;
  }
  
  // Extract implementation and API reference sections
  const lines = codeLinks.split('\n');
  let implementationSection = '';
  let apiReferenceSection = '';
  let currentSection = '';
  let inImplementation = false;
  let inAPIReference = false;
  
  for (const line of lines) {
    if (line.includes('=== Implementation Section ===')) {
      inImplementation = true;
      inAPIReference = false;
      continue;
    }
    
    if (line.includes('=== API Reference Section ===')) {
      inImplementation = false;
      inAPIReference = true;
      continue;
    }
    
    if (line.startsWith('===') || line.includes('Code links saved to:')) {
      inImplementation = false;
      inAPIReference = false;
      continue;
    }
    
    if (inImplementation) {
      implementationSection += line + '\n';
    } else if (inAPIReference) {
      apiReferenceSection += line + '\n';
    }
  }
  
  // Read current documentation
  const currentDoc = fs.readFileSync(docPath, 'utf-8');
  
  // Find insertion point (before Development Status)
  const devStatusIndex = currentDoc.indexOf('## Development Status');
  
  if (devStatusIndex === -1) {
    console.log(`⚠️  Could not find insertion point in ${packageName} documentation`);
    return false;
  }
  
  // Create new documentation
  const newDoc = currentDoc.slice(0, devStatusIndex) + 
    implementationSection + '\n' + 
    apiReferenceSection + '\n' +
    currentDoc.slice(devStatusIndex);
  
  // Write updated documentation
  if (dryRun) {
    console.log(`🔍 DRY RUN: Would update ${packageName} documentation`);
    console.log(`   Implementation section: ${implementationSection.trim().split('\n').length} lines`);
    console.log(`   API reference section: ${apiReferenceSection.trim().split('\n').length} lines`);
    return true;
  } else {
    try {
      fs.writeFileSync(docPath, newDoc);
      console.log(`✅ Updated ${packageName} documentation with code links`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to update ${packageName} documentation:`, error.message);
      return false;
    }
  }
}

/**
 * Update all packages
 */
function updateAllPackages(dryRun = false) {
  const packages = getDocumentedPackages();
  console.log(`Found ${packages.length} packages with documentation\n`);
  
  let updated = 0;
  let skipped = 0;
  let failed = 0;
  
  for (const packageName of packages) {
    console.log(`Processing ${packageName}...`);
    
    if (!hasSourceCode(packageName)) {
      console.log(`⚠️  No source code - skipping ${packageName}\n`);
      skipped++;
      continue;
    }
    
    if (hasImplementationSection(path.join(rootDir, 'docs', 'packages', packageName, 'README.md'))) {
      console.log(`✅ Already has implementation - skipping ${packageName}\n`);
      skipped++;
      continue;
    }
    
    const success = updatePackageDocumentation(packageName, dryRun);
    if (success) {
      updated++;
    } else {
      failed++;
    }
    
    console.log('');
  }
  
  // Summary
  console.log(`=== Bulk Update Summary ===`);
  console.log(`Total Packages: ${packages.length}`);
  console.log(`Updated: ${updated}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Failed: ${failed}`);
  
  if (dryRun) {
    console.log(`\n🔍 DRY RUN MODE - No files were modified`);
    console.log(`Run without --dry-run to apply changes`);
  } else {
    console.log(`\n✅ Bulk update completed`);
  }
  
  return failed === 0;
}

/**
 * Main execution
 */
function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run') || args.includes('-d');
  
  if (dryRun) {
    console.log('🔍 DRY RUN MODE - No files will be modified\n');
  }
  
  const success = updateAllPackages(dryRun);
  process.exit(success ? 0 : 1);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { updatePackageDocumentation, updateAllPackages };