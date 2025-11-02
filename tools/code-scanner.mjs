#!/usr/bin/env node

/**
 * Code Scanner Utility
 * 
 * Scans packages to extract code structure and generate documentation links
 * Usage: node tools/code-scanner.mjs [package-name]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

/**
 * Extract TypeScript exports and classes from a file
 */
function extractCodeInfo(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    const exports = [];
    const classes = [];
    const functions = [];
    const interfaces = [];
    
    lines.forEach((line, index) => {
      const lineNumber = index + 1;
      const trimmed = line.trim();
      
      // Extract exports
      if (trimmed.startsWith('export ')) {
        if (trimmed.includes('class ')) {
          const className = trimmed.match(/class\s+(\w+)/)?.[1];
          if (className) {
            classes.push({ name: className, line: lineNumber, type: 'class' });
            exports.push({ name: className, line: lineNumber, type: 'class' });
          }
        } else if (trimmed.includes('function ') || trimmed.includes('const ') && trimmed.includes('=')) {
          const funcName = trimmed.match(/(?:function|const)\s+(\w+)/)?.[1];
          if (funcName) {
            functions.push({ name: funcName, line: lineNumber, type: 'function' });
            exports.push({ name: funcName, line: lineNumber, type: 'function' });
          }
        } else if (trimmed.includes('interface ')) {
          const interfaceName = trimmed.match(/interface\s+(\w+)/)?.[1];
          if (interfaceName) {
            interfaces.push({ name: interfaceName, line: lineNumber, type: 'interface' });
            exports.push({ name: interfaceName, line: lineNumber, type: 'interface' });
          }
        }
      }
      
      // Extract classes (non-exported)
      if (!trimmed.startsWith('export') && trimmed.includes('class ')) {
        const className = trimmed.match(/class\s+(\w+)/)?.[1];
        if (className) {
          classes.push({ name: className, line: lineNumber, type: 'class' });
        }
      }
    });
    
    return {
      exports,
      classes,
      functions,
      interfaces,
      totalLines: lines.length
    };
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Scan a package directory for code structure
 */
function scanPackage(packageName) {
  const packageDir = path.join(rootDir, 'packages', packageName);
  const srcDir = path.join(packageDir, 'src');
  
  if (!fs.existsSync(srcDir)) {
    console.error(`Source directory not found: ${srcDir}`);
    return null;
  }
  
  const result = {
    packageName,
    files: [],
    mainEntry: null,
    exports: [],
    classes: [],
    functions: [],
    interfaces: []
  };
  
  // Find all TypeScript files
  function findTSFiles(dir) {
    const files = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...findTSFiles(fullPath));
      } else if (entry.name.endsWith('.ts')) {
        files.push(fullPath);
      }
    }
    
    return files;
  }
  
  const tsFiles = findTSFiles(srcDir);
  
  // Scan each file
  for (const filePath of tsFiles) {
    const relativePath = path.relative(srcDir, filePath);
    const codeInfo = extractCodeInfo(filePath);
    
    if (codeInfo) {
      result.files.push({
        path: relativePath,
        fullPath: filePath,
        ...codeInfo
      });
      
      // Track main entry file
      if (relativePath === 'index.ts') {
        result.mainEntry = {
          path: relativePath,
          ...codeInfo
        };
      }
      
      // Collect all exports, classes, functions, interfaces
      result.exports.push(...codeInfo.exports.map(e => ({ ...e, file: relativePath })));
      result.classes.push(...codeInfo.classes.map(c => ({ ...c, file: relativePath })));
      result.functions.push(...codeInfo.functions.map(f => ({ ...f, file: relativePath })));
      result.interfaces.push(...codeInfo.interfaces.map(i => ({ ...i, file: relativePath })));
    }
  }
  
  return result;
}

/**
 * Generate markdown links for code elements
 */
function generateCodeLinks(packageData) {
  const { packageName, files, mainEntry, exports, classes, functions, interfaces } = packageData;
  
  const links = {
    implementation: {
      coreFiles: []
    },
    apiReference: {
      classes: [],
      functions: [],
      interfaces: []
    }
  };
  
  // Core files
  files.forEach(file => {
    links.implementation.coreFiles.push({
      name: file.path,
      link: `[`src/${file.path}`](../../../packages/${packageName}/src/${file.path})`,
      lineCount: file.totalLines
    });
  });
  
  // Classes
  classes.forEach(cls => {
    links.apiReference.classes.push({
      name: cls.name,
      link: `[${cls.name}](../../../packages/${packageName}/src/${cls.file}#L${cls.line})`,
      file: cls.file,
      line: cls.line
    });
  });
  
  // Functions
  functions.forEach(func => {
    links.apiReference.functions.push({
      name: func.name,
      link: `[${func.name}()`](../../../packages/${packageName}/src/${func.file}#L${func.line})`,
      file: func.file,
      line: func.line
    });
  });
  
  // Interfaces
  interfaces.forEach(iface => {
    links.apiReference.interfaces.push({
      name: iface.name,
      link: `[${iface.name}](../../../packages/${packageName}/src/${iface.file}#L${iface.line})`,
      file: iface.file,
      line: iface.line
    });
  });
  
  return links;
}

/**
 * Generate implementation section markdown
 */
function generateImplementationSection(packageName, links) {
  const { coreFiles } = links.implementation;
  const { classes, functions } = links.apiReference;
  
  let section = '## 📁 Implementation\n\n';
  
  // Core files
  section += '### Core Files\n';
  coreFiles.forEach(file => {
    section += `- **${file.name}**: ${file.link} (${file.lineCount} lines)\n`;
  });
  section += '\n';
  
  // Key classes and functions
  if (classes.length > 0 || functions.length > 0) {
    section += '### Key Classes & Functions\n';
    
    classes.slice(0, 5).forEach(cls => {
      section += `- **${cls.name}**: ${cls.link} - Main class\n`;
    });
    
    functions.slice(0, 5).forEach(func => {
      section += `- **${func.name}()**: ${func.link} - Key function\n`;
    });
    
    if (classes.length > 5 || functions.length > 5) {
      section += `- _... and ${classes.length + functions.length - 5} more_\n`;
    }
    section += '\n';
  }
  
  // View source links
  section += '### View Source\n';
  section += `- **GitHub**: [View on GitHub](https://github.com/promethean-ai/promethean/tree/main/packages/${packageName}/src)\n`;
  section += `- **VS Code**: [Open in VS Code](vscode://file/packages/${packageName}/src)\n\n`;
  
  return section;
}

/**
 * Generate API reference section markdown
 */
function generateAPIReferenceSection(packageName, links) {
  const { classes, functions, interfaces } = links.apiReference;
  
  let section = '## 📚 API Reference\n\n';
  
  if (classes.length > 0) {
    section += '### Classes\n\n';
    classes.forEach(cls => {
      section += `#### ${cls.name}\n`;
      section += `**Location**: ${cls.link}\n\n`;
      section += `**Description**: Main class for ${cls.name.toLowerCase()} functionality.\n\n`;
      section += `**File**: \`src/${cls.file}\`\n\n`;
    });
  }
  
  if (functions.length > 0) {
    section += '### Functions\n\n';
    functions.forEach(func => {
      section += `#### ${func.name}()\n`;
      section += `**Location**: ${func.link}\n\n`;
      section += `**Description**: Key function for ${func.name.toLowerCase()} operations.\n\n`;
      section += `**File**: \`src/${func.file}\`\n\n`;
    });
  }
  
  if (interfaces.length > 0) {
    section += '### Interfaces\n\n';
    interfaces.forEach(iface => {
      section += `#### ${iface.name}\n`;
      section += `**Location**: ${iface.link}\n\n`;
      section += `**Description**: Type definition for ${iface.name.toLowerCase()}.\n\n`;
      section += `**File**: \`src/${iface.file}\`\n\n`;
    });
  }
  
  return section;
}

/**
 * Main execution
 */
function main() {
  const args = process.argv.slice(2);
  const packageName = args[0];
  
  if (!packageName) {
    console.error('Usage: node tools/code-scanner.mjs <package-name>');
    process.exit(1);
  }
  
  console.log(`Scanning package: ${packageName}`);
  
  const packageData = scanPackage(packageName);
  if (!packageData) {
    console.error(`Failed to scan package: ${packageName}`);
    process.exit(1);
  }
  
  const links = generateCodeLinks(packageData);
  
  console.log('\n=== Package Structure ===');
  console.log(`Files: ${packageData.files.length}`);
  console.log(`Exports: ${packageData.exports.length}`);
  console.log(`Classes: ${packageData.classes.length}`);
  console.log(`Functions: ${packageData.functions.length}`);
  console.log(`Interfaces: ${packageData.interfaces.length}`);
  
  console.log('\n=== Implementation Section ===');
  console.log(generateImplementationSection(packageName, links));
  
  console.log('\n=== API Reference Section ===');
  console.log(generateAPIReferenceSection(packageName, links));
  
  // Save to file for later use
  const outputPath = path.join(rootDir, 'tmp', `${packageName}-code-links.json`);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify({ packageData, links }, null, 2));
  
  console.log(`\nCode links saved to: ${outputPath}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { scanPackage, generateCodeLinks, generateImplementationSection, generateAPIReferenceSection };