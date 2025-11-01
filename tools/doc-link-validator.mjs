#!/usr/bin/env node

/**
 * Documentation Link Validator
 * 
 * Validates that all documentation code links work correctly
 * Usage: node tools/doc-link-validator.mjs [package-name]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

/**
 * Check if a file exists
 */
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

/**
 * Check if a specific line exists in a file
 */
function lineExists(filePath, lineNumber) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    return lineNumber <= lines.length && lineNumber > 0;
  } catch {
    return false;
  }
}

/**
 * Extract markdown links from documentation
 */
function extractMarkdownLinks(content) {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const links = [];
  let match;
  
  while ((match = linkRegex.exec(content)) !== null) {
    links.push({
      text: match[1],
      url: match[2],
      full: match[0]
    });
  }
  
  return links;
}

/**
 * Validate relative file links
 */
function validateRelativeLink(link, docPath) {
  const url = link.url;
  
  // Skip non-file links
  if (!url.startsWith('../') && !url.startsWith('./')) {
    return { valid: true, type: 'external' };
  }
  
  // Resolve relative path
  const docDir = path.dirname(docPath);
  const absolutePath = path.resolve(docDir, url);
  
  // Check for line number references
  const lineMatch = url.match(/#L(\d+)$/);
  
  if (lineMatch) {
    const filePath = url.replace(/#L\d+$/, '');
    const resolvedFilePath = path.resolve(docDir, filePath);
    const lineNumber = parseInt(lineMatch[1], 10);
    
    const fileExists = fs.existsSync(resolvedFilePath);
    const lineValid = fileExists && lineExists(resolvedFilePath, lineNumber);
    
    return {
      valid: fileExists && lineValid,
      type: 'file-with-line',
      filePath: resolvedFilePath,
      lineNumber,
      fileExists,
      lineValid
    };
  } else {
    const fileExists = fs.existsSync(absolutePath);
    
    return {
      valid: fileExists,
      type: 'file',
      filePath: absolutePath,
      fileExists
    };
  }
}

/**
 * Validate package documentation
 */
function validatePackageDocumentation(packageName) {
  const docPath = path.join(rootDir, 'docs', 'packages', packageName, 'README.md');
  
  if (!fs.existsSync(docPath)) {
    console.error(`Documentation not found: ${docPath}`);
    return null;
  }
  
  const content = fs.readFileSync(docPath, 'utf-8');
  const links = extractMarkdownLinks(content);
  
  const results = {
    packageName,
    docPath,
    totalLinks: links.length,
    validLinks: 0,
    invalidLinks: [],
    externalLinks: 0,
    fileLinks: 0,
    lineLinks: 0,
    details: []
  };
  
  links.forEach(link => {
    const validation = validateRelativeLink(link, docPath);
    
    if (validation.type === 'external') {
      results.externalLinks++;
      results.validLinks++;
      results.details.push({
        link: link.full,
        type: 'external',
        valid: true
      });
    } else {
      if (validation.valid) {
        results.validLinks++;
        if (validation.type === 'file-with-line') {
          results.lineLinks++;
        } else {
          results.fileLinks++;
        }
        results.details.push({
          link: link.full,
          type: validation.type,
          valid: true,
          filePath: validation.filePath,
          lineNumber: validation.lineNumber
        });
      } else {
        results.invalidLinks.push({
          link: link.full,
          type: validation.type,
          valid: false,
          filePath: validation.filePath,
          lineNumber: validation.lineNumber,
          fileExists: validation.fileExists,
          lineValid: validation.lineValid,
          error: validation.fileExists ? 
            (validation.lineValid ? 'Unknown error' : `Line ${validation.lineNumber} does not exist`) :
            'File does not exist'
        });
        results.details.push({
          link: link.full,
          type: validation.type,
          valid: false,
          error: results.invalidLinks[results.invalidLinks.length - 1].error
        });
      }
    }
  });
  
  return results;
}

/**
 * Generate validation report
 */
function generateReport(results) {
  console.log(`\n=== Documentation Link Validation Report ===`);
  console.log(`Package: ${results.packageName}`);
  console.log(`Documentation: ${results.docPath}`);
  console.log(`\nSummary:`);
  console.log(`- Total Links: ${results.totalLinks}`);
  console.log(`- Valid Links: ${results.validLinks}`);
  console.log(`- Invalid Links: ${results.invalidLinks.length}`);
  console.log(`- External Links: ${results.externalLinks}`);
  console.log(`- File Links: ${results.fileLinks}`);
  console.log(`- Line Links: ${results.lineLinks}`);
  
  if (results.invalidLinks.length > 0) {
    console.log(`\n❌ Invalid Links:`);
    results.invalidLinks.forEach((invalid, index) => {
      console.log(`${index + 1}. ${invalid.link}`);
      console.log(`   Type: ${invalid.type}`);
      console.log(`   Error: ${invalid.error}`);
      if (invalid.filePath) {
        console.log(`   File: ${invalid.filePath}`);
      }
      if (invalid.lineNumber) {
        console.log(`   Line: ${invalid.lineNumber}`);
      }
      console.log('');
    });
  } else {
    console.log(`\n✅ All links are valid!`);
  }
  
  // Success rate
  const successRate = ((results.validLinks / results.totalLinks) * 100).toFixed(1);
  console.log(`\nSuccess Rate: ${successRate}%`);
  
  return results.invalidLinks.length === 0;
}

/**
 * Validate all packages
 */
function validateAllPackages() {
  const packagesDir = path.join(rootDir, 'docs', 'packages');
  const packages = fs.readdirSync(packagesDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name);
  
  console.log(`Found ${packages.length} packages to validate\n`);
  
  let allValid = true;
  const results = [];
  
  for (const packageName of packages) {
    const result = validatePackageDocumentation(packageName);
    if (result) {
      results.push(result);
      const isValid = generateReport(result);
      allValid = allValid && isValid;
      console.log('---');
    }
  }
  
  // Overall summary
  console.log(`\n=== Overall Summary ===`);
  console.log(`Packages Validated: ${results.length}`);
  const validPackages = results.filter(r => r.invalidLinks.length === 0).length;
  console.log(`Packages with Valid Links: ${validPackages}`);
  console.log(`Packages with Invalid Links: ${results.length - validPackages}`);
  
  if (allValid) {
    console.log(`\n🎉 All package documentation links are valid!`);
  } else {
    console.log(`\n⚠️  Some packages have invalid links that need fixing.`);
  }
  
  return allValid;
}

/**
 * Main execution
 */
function main() {
  const args = process.argv.slice(2);
  const packageName = args[0];
  const allFlag = args.includes('--all') || args.includes('-a');
  
  if (allFlag || !packageName) {
    // Validate all packages
    const success = validateAllPackages();
    process.exit(success ? 0 : 1);
  } else {
    // Validate specific package
    const results = validatePackageDocumentation(packageName);
    if (!results) {
      console.error(`Failed to validate package: ${packageName}`);
      process.exit(1);
    }
    
    const success = generateReport(results);
    process.exit(success ? 0 : 1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { validatePackageDocumentation, validateAllPackages };