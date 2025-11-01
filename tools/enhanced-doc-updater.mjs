#!/usr/bin/env node

/**
 * Enhanced Documentation Updater
 *
 * Advanced version that can handle multiple documentation formats:
 * - Standard README format (with ## Implementation sections)
 * - Auto-generated SYMPKG format
 * - Custom formats with configurable insertion points
 *
 * Usage: node tools/enhanced-doc-updater.mjs [options] [package-name...]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

/**
 * Documentation format detectors
 */
function detectDocumentationFormat(content) {
  // SYMPKG auto-generated format
  if (content.includes('<!-- SYMPKG:PKG:BEGIN -->')) {
    return 'sympkg';
  }

  // Standard enhanced format (already has Implementation sections)
  if (content.includes('## 📁 Implementation') || content.includes('## Implementation')) {
    return 'enhanced';
  }

  // Standard README format
  if (content.includes('# ') && !content.includes('SYMPKG')) {
    return 'standard';
  }

  // Unknown format
  return 'unknown';
}

/**
 * Get insertion points for different formats
 */
function getInsertionPoints(format, content) {
  switch (format) {
    case 'sympkg':
      return {
        implementation: content.indexOf('<!-- SYMPKG:PKG:END -->'),
        api: content.indexOf('<!-- SYMPKG:PKG:END -->'),
      };

    case 'enhanced':
      return {
        implementation: content.indexOf('## 📁 Implementation'),
        api: content.indexOf('## 📚 API Reference'),
      };

    case 'standard':
      // Look for common sections or create them
      const lastSection = content.lastIndexOf('##');
      return {
        implementation: lastSection > 0 ? lastSection : content.length,
        api: content.length,
      };

    default:
      return {
        implementation: content.length,
        api: content.length,
      };
  }
}

/**
 * Generate enhanced documentation sections
 */
function generateEnhancedSections(packageName, codeData) {
  const implementationSection = generateImplementationSection(packageName, codeData);
  const apiSection = generateAPIReferenceSection(packageName, codeData);

  return { implementationSection, apiSection };
}

/**
 * Generate Implementation section
 */
function generateImplementationSection(packageName, codeData) {
  let section = `\n\n## 📁 Implementation\n\n`;

  if (codeData.files.length > 0) {
    section += `### Core Files\n\n`;

    codeData.files.forEach((file) => {
      const relativePath = `../../../packages/${packageName}/src/${file.path}`;
      section += `- [${file.path}](${relativePath})\n`;
    });

    if (codeData.classes.length > 0 || codeData.functions.length > 0) {
      section += `\n### Key Classes & Functions\n\n`;

      codeData.classes.forEach((cls) => {
        const relativePath = `../../../packages/${packageName}/src/${cls.file}#L${cls.line}`;
        section += `- [${cls.name}](${relativePath})\n`;
      });

      codeData.functions.forEach((func) => {
        const relativePath = `../../../packages/${packageName}/src/${func.file}#L${func.line}`;
        section += `- [${func.name}()](${relativePath})\n`;
      });
    }

    section += `\n### View Source\n\n`;
    section += `- [GitHub](https://github.com/promethean-ai/promethean/tree/main/packages/${packageName}/src)\n`;
    section += `- [VS Code](vscode://file/packages/${packageName}/src)\n`;
  } else {
    section += `*Source code analysis not available*\n`;
  }

  return section;
}

/**
 * Generate API Reference section
 */
function generateAPIReferenceSection(packageName, codeData) {
  let section = `\n\n## 📚 API Reference\n\n`;

  if (codeData.classes.length > 0) {
    section += `### Classes\n\n`;

    codeData.classes.forEach((cls) => {
      const relativePath = `../../../packages/${packageName}/src/${cls.file}#L${cls.line}`;
      section += `#### [${cls.name}](${relativePath})\n\n`;

      if (cls.methods && cls.methods.length > 0) {
        cls.methods.forEach((method) => {
          const methodPath = `../../../packages/${packageName}/src/${cls.file}#L${method.line}`;
          section += `- [${method.name}()](${methodPath})\n`;
        });
        section += `\n`;
      }
    });
  }

  if (codeData.functions.length > 0) {
    section += `### Functions\n\n`;

    codeData.functions.forEach((func) => {
      const relativePath = `../../../packages/${packageName}/src/${func.file}#L${func.line}`;
      section += `#### [${func.name}()](${relativePath})\n\n`;
    });
  }

  if (codeData.interfaces.length > 0) {
    section += `### Interfaces\n\n`;

    codeData.interfaces.forEach((iface) => {
      const relativePath = `../../../packages/${packageName}/src/${iface.file}#L${iface.line}`;
      section += `#### [${iface.name}](${relativePath})\n\n`;
    });
  }

  if (
    codeData.classes.length === 0 &&
    codeData.functions.length === 0 &&
    codeData.interfaces.length === 0
  ) {
    section += `*API documentation not available*\n`;
  }

  return section;
}

/**
 * Scan package source code using our existing scanner
 */
function scanPackageCode(packageName) {
  try {
    const scannerPath = path.join(__dirname, 'code-scanner-fixed.mjs');
    const result = execSync(`node "${scannerPath}" "${packageName}"`, {
      encoding: 'utf8',
      cwd: rootDir,
    });

    // Parse the scanner output more robustly
    const codeData = {
      files: [],
      classes: [],
      functions: [],
      interfaces: [],
    };

    // Simple parsing - look for lines with file paths
    const lines = result.split('\n');

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (
        trimmed &&
        !trimmed.startsWith('Found') &&
        !trimmed.includes('---') &&
        !trimmed.includes('Scanning')
      ) {
        // Try to extract file information
        if (trimmed.includes('.ts')) {
          const parts = trimmed.split(/\s+/);
          if (parts.length >= 2) {
            const name = parts[0].replace(':', '');
            const filePath = parts[1];
            const lineNumber = parts[2] ? parseInt(parts[2].replace('L', '')) : 1;

            if (name && filePath) {
              const item = {
                name: name,
                file: filePath,
                line: lineNumber,
              };

              // Categorize based on name patterns
              if (name.startsWith('class ') || name[0] === name[0].toUpperCase()) {
                codeData.classes.push({ ...item, name: name.replace(/^class\s+/, '') });
              } else if (name.startsWith('interface ')) {
                codeData.interfaces.push({ ...item, name: name.replace(/^interface\s+/, '') });
              } else if (name.includes('()')) {
                codeData.functions.push({ ...item, name: name.replace('()', '') });
              } else {
                codeData.files.push({ path: filePath });
              }
            }
          }
        }
      }
    });

    return codeData;
  } catch (error) {
    console.warn(`Warning: Could not scan code for ${packageName}:`, error.message);
    return {
      files: [],
      classes: [],
      functions: [],
      interfaces: [],
    };
  }
}

/**
 * Update package documentation with enhanced sections
 */
function updatePackageDocumentation(packageName, dryRun = false) {
  const docPath = path.join(rootDir, 'docs', 'packages', packageName, 'README.md');

  if (!fs.existsSync(docPath)) {
    console.log(`⚠️  No documentation found for ${packageName}`);
    return false;
  }

  const content = fs.readFileSync(docPath, 'utf8');
  const format = detectDocumentationFormat(content);

  console.log(`📄 Processing ${packageName} (format: ${format})`);

  // Skip if already enhanced
  if (format === 'enhanced') {
    console.log(`✅ Already enhanced - skipping ${packageName}`);
    return true;
  }

  // Scan source code
  const codeData = scanPackageCode(packageName);

  if (codeData.files.length === 0 && codeData.classes.length === 0) {
    console.log(`⚠️  No source code found for ${packageName}`);
    return false;
  }

  // Generate enhanced sections
  const { implementationSection, apiSection } = generateEnhancedSections(packageName, codeData);

  // Get insertion points
  const insertionPoints = getInsertionPoints(format, content);

  // Create new content
  let newContent = content;

  if (format === 'sympkg') {
    // For SYMPKG format, append after auto-generated content
    newContent =
      content.slice(0, insertionPoints.implementation) +
      implementationSection +
      apiSection +
      '\n\n---\n\n*Enhanced with code links via automated documentation updater*';
  } else {
    // For standard format, insert at appropriate locations
    newContent =
      content.slice(0, insertionPoints.implementation) +
      implementationSection +
      content.slice(insertionPoints.implementation, insertionPoints.api) +
      apiSection +
      content.slice(insertionPoints.api);
  }

  // Write file or show dry run
  if (dryRun) {
    console.log(`🔍 DRY RUN: Would update ${packageName} documentation`);
    console.log(`   Implementation section: ${implementationSection.split('\n').length} lines`);
    console.log(`   API reference section: ${apiSection.split('\n').length} lines`);
    return true;
  } else {
    fs.writeFileSync(docPath, newContent);
    console.log(`✅ Updated ${packageName} documentation with code links`);
    return true;
  }
}

/**
 * Main execution
 */
function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const allFlag = args.includes('--all') || args.includes('-a');

  // Remove flags from package list
  const packageNames = args.filter((arg) => !arg.startsWith('--') && !arg.startsWith('-'));

  if (allFlag || packageNames.length === 0) {
    // Process all packages
    const packagesDir = path.join(rootDir, 'docs', 'packages');
    const packages = fs
      .readdirSync(packagesDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);

    console.log(`Found ${packages.length} packages to process\n`);

    let updated = 0;
    let skipped = 0;
    let failed = 0;

    for (const packageName of packages) {
      const result = updatePackageDocumentation(packageName, dryRun);
      if (result === true) {
        updated++;
      } else {
        failed++;
      }
    }

    console.log(`\n=== Enhanced Update Summary ===`);
    console.log(`Total Packages: ${packages.length}`);
    console.log(`Updated: ${updated}`);
    console.log(`Skipped: ${skipped}`);
    console.log(`Failed: ${failed}`);

    if (dryRun) {
      console.log(`\n🔍 DRY RUN MODE - No files were modified`);
      console.log(`Run without --dry-run to apply changes`);
    } else {
      console.log(`\n✅ Enhanced update completed`);
    }
  } else {
    // Process specific packages
    for (const packageName of packageNames) {
      updatePackageDocumentation(packageName, dryRun);
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { updatePackageDocumentation, detectDocumentationFormat, generateEnhancedSections };
