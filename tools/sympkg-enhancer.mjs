#!/usr/bin/env node

/**
 * SYMPKG Documentation Enhancer
 *
 * Specialized tool for enhancing SYMPKG auto-generated documentation
 * with code links while preserving the auto-generated structure.
 *
 * Usage: node tools/sympkg-enhancer.mjs [package-name...]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

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

    // Parse JSON output from scanner
    const outputPath = path.join(rootDir, 'tmp', `${packageName}-code-links.json`);
    
    if (fs.existsSync(outputPath)) {
      const jsonData = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
      const { packageData } = jsonData;
      
      // Convert to format expected by SYMPKG enhancer
      const codeData = {
        files: packageData.files.map(f => ({ path: f.path })),
        classes: packageData.classes.map(c => ({ 
          name: c.name, 
          file: c.file, 
          line: c.line 
        })),
        functions: packageData.functions.map(f => ({ 
          name: f.name, 
          file: f.file, 
          line: f.line 
        })),
        interfaces: packageData.interfaces.map(i => ({ 
          name: i.name, 
          file: i.file, 
          line: i.line 
        })),
      };
      
      return codeData;
    } else {
      // Fallback: try to parse from console output (less reliable)
      return parseScannerOutput(result);
    }
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
  } catch (error) {
    console.warn(`Warning: Could not scan code for ${packageName}:`, error.message);
    return {
      files: [],
      classes: [],
      functions: [],
      interfaces: [],
    };
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
 * Parse scanner output from console (fallback method)
 */
function parseScannerOutput(result) {
  const codeData = {
    files: [],
    classes: [],
    functions: [],
    interfaces: [],
  };

  const lines = result.split('\n');
  let currentSection = '';

  lines.forEach((line) => {
    const trimmed = line.trim();

    // Identify sections
    if (trimmed.startsWith('Files:')) {
      currentSection = 'files';
    } else if (trimmed.startsWith('Classes:')) {
      currentSection = 'classes';
    } else if (trimmed.startsWith('Functions:')) {
      currentSection = 'functions';
    } else if (trimmed.startsWith('Interfaces:')) {
      currentSection = 'interfaces';
    } else if (
      trimmed &&
      !trimmed.includes('---') &&
      !trimmed.includes('Scanning') &&
      !trimmed.includes('Found') &&
      !trimmed.includes('===') &&
      !trimmed.includes('Package Structure')
    ) {
      // Parse data within sections
      if (currentSection && trimmed.includes(':')) {
        const parts = trimmed.split(':');
        if (parts.length >= 2) {
          const name = parts[0].trim();
          const fileInfo = parts[1].trim();

          // Extract file path and line number
          const fileMatch = fileInfo.match(/([^#]+)(?:#L(\d+))?/);
          if (fileMatch) {
            const filePath = fileMatch[1].trim();
            const lineNumber = fileMatch[2] ? parseInt(fileMatch[2]) : 1;

            const item = {
              name: name,
              file: filePath,
              line: lineNumber,
            };

            // Add to appropriate section
            if (currentSection === 'files') {
              codeData.files.push({ path: filePath });
            } else if (currentSection === 'classes') {
              codeData.classes.push(item);
            } else if (currentSection === 'functions') {
              codeData.functions.push(item);
            } else if (currentSection === 'interfaces') {
              codeData.interfaces.push(item);
            }
          }
        }
      }
    }
  });

  return codeData;
}

/**
 * Generate enhanced sections for SYMPKG format
 */
function generateEnhancedSections(packageName, codeData) {
  let sections = '';

  if (codeData.files.length > 0) {
    sections += `\n\n## 📁 Implementation\n\n`;
    sections += `### Core Files\n\n`;

    codeData.files.forEach((file) => {
      const relativePath = `../../../packages/${packageName}/src/${file.path}`;
      sections += `- [${file.path}](${relativePath})\n`;
    });

    if (codeData.classes.length > 0 || codeData.functions.length > 0) {
      sections += `\n### Key Classes & Functions\n\n`;

      codeData.classes.forEach((cls) => {
        const relativePath = `../../../packages/${packageName}/src/${cls.file}#L${cls.line}`;
        sections += `- [${cls.name}](${relativePath})\n`;
      });

      codeData.functions.forEach((func) => {
        const relativePath = `../../../packages/${packageName}/src/${func.file}#L${func.line}`;
        sections += `- [${func.name}()](${relativePath})\n`;
      });
    }

    sections += `\n### View Source\n\n`;
    sections += `- [GitHub](https://github.com/promethean-ai/promethean/tree/main/packages/${packageName}/src)\n`;
    sections += `- [VS Code](vscode://file/packages/${packageName}/src)\n`;
  }

  if (
    codeData.classes.length > 0 ||
    codeData.functions.length > 0 ||
    codeData.interfaces.length > 0
  ) {
    sections += `\n\n## 📚 API Reference\n\n`;

    if (codeData.classes.length > 0) {
      sections += `### Classes\n\n`;

      codeData.classes.forEach((cls) => {
        const relativePath = `../../../packages/${packageName}/src/${cls.file}#L${cls.line}`;
        sections += `#### [${cls.name}](${relativePath})\n\n`;
      });
    }

    if (codeData.functions.length > 0) {
      sections += `### Functions\n\n`;

      codeData.functions.forEach((func) => {
        const relativePath = `../../../packages/${packageName}/src/${func.file}#L${func.line}`;
        sections += `#### [${func.name}()](${relativePath})\n\n`;
      });
    }

    if (codeData.interfaces.length > 0) {
      sections += `### Interfaces\n\n`;

      codeData.interfaces.forEach((iface) => {
        const relativePath = `../../../packages/${packageName}/src/${iface.file}#L${iface.line}`;
        sections += `#### [${iface.name}](${relativePath})\n\n`;
      });
    }
  }

  return sections;
}

/**
 * Enhance SYMPKG package documentation
 */
function enhanceSYMPKGPackge(packageName, dryRun = false) {
  const docPath = path.join(rootDir, 'docs', 'packages', packageName, 'README.md');

  if (!fs.existsSync(docPath)) {
    console.log(`⚠️  No documentation found for ${packageName}`);
    return false;
  }

  const content = fs.readFileSync(docPath, 'utf8');

  // Check if it's SYMPKG format
  if (!content.includes('<!-- SYMPKG:PKG:BEGIN -->')) {
    console.log(`⚠️  ${packageName} is not SYMPKG format`);
    return false;
  }

  // Check if already enhanced
  if (content.includes('## 📁 Implementation')) {
    console.log(`✅ ${packageName} already enhanced - skipping`);
    return true;
  }

  console.log(`📄 Enhancing SYMPKG package: ${packageName}`);

  // Scan source code
  const codeData = scanPackageCode(packageName);

  if (codeData.files.length === 0 && codeData.classes.length === 0) {
    console.log(`⚠️  No source code found for ${packageName}`);
    return false;
  }

  // Generate enhanced sections
  const enhancedSections = generateEnhancedSections(packageName, codeData);

  // Find insertion point (after SYMPKG:PKG:END)
  const insertionPoint = content.indexOf('<!-- SYMPKG:PKG:END -->');

  if (insertionPoint === -1) {
    console.log(`⚠️  Could not find SYMPKG:PKG:END in ${packageName}`);
    return false;
  }

  // Create new content
  const newContent =
    content.slice(0, insertionPoint) +
    enhancedSections +
    '\n\n---\n\n*Enhanced with code links via SYMPKG documentation enhancer*';

  // Write file or show dry run
  if (dryRun) {
    console.log(`🔍 DRY RUN: Would enhance ${packageName} documentation`);
    console.log(`   Enhanced sections: ${enhancedSections.split('\n').length} lines`);
    console.log(`   Files: ${codeData.files.length}`);
    console.log(`   Classes: ${codeData.classes.length}`);
    console.log(`   Functions: ${codeData.functions.length}`);
    console.log(`   Interfaces: ${codeData.interfaces.length}`);
    return true;
  } else {
    fs.writeFileSync(docPath, newContent);
    console.log(`✅ Enhanced ${packageName} documentation with code links`);
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
    // Process all SYMPKG packages
    const packagesDir = path.join(rootDir, 'docs', 'packages');
    const packages = fs
      .readdirSync(packagesDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);

    console.log(`Found ${packages.length} packages to process\n`);

    let enhanced = 0;
    let skipped = 0;
    let failed = 0;

    for (const packageName of packages) {
      const docPath = path.join(rootDir, 'docs', 'packages', packageName, 'README.md');
      if (fs.existsSync(docPath)) {
        const content = fs.readFileSync(docPath, 'utf8');
        if (content.includes('<!-- SYMPKG:PKG:BEGIN -->')) {
          const result = enhanceSYMPKGPackge(packageName, dryRun);
          if (result === true) {
            enhanced++;
          } else {
            failed++;
          }
        }
      }
    }

    console.log(`\n=== SYMPKG Enhancement Summary ===`);
    console.log(`Total SYMPKG Packages: ${enhanced + skipped + failed}`);
    console.log(`Enhanced: ${enhanced}`);
    console.log(`Skipped: ${skipped}`);
    console.log(`Failed: ${failed}`);

    if (dryRun) {
      console.log(`\n🔍 DRY RUN MODE - No files were modified`);
      console.log(`Run without --dry-run to apply changes`);
    } else {
      console.log(`\n✅ SYMPKG enhancement completed`);
    }
  } else {
    // Process specific packages
    for (const packageName of packageNames) {
      enhanceSYMPKGPackge(packageName, dryRun);
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { enhanceSYMPKGPackge, generateEnhancedSections };
