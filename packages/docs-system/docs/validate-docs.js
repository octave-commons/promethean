#!/usr/bin/env node

/**
 * Documentation Validation Script
 *
 * This script validates the documentation structure and links
 * to ensure all documentation is complete and accessible.
 */

const fs = require('fs');
const path = require('path');

const DOCS_DIR = __dirname;
const MAIN_README = path.join(DOCS_DIR, 'README.md');
const INDEX_FILE = path.join(DOCS_DIR, 'INDEX.md');

// Expected documentation structure
const EXPECTED_FILES = [
  'README.md',
  'INDEX.md',
  'api/README.md',
  'architecture/README.md',
  'deployment/README.md',
  'guides/developer-guide.md',
  'user-guide/README.md',
  'troubleshooting/README.md',
];

// Expected sections in main README
const EXPECTED_SECTIONS = [
  '🚀 Quick Start',
  '🏗️ Architecture Overview',
  '📁 Project Structure',
  '🎯 Core Features',
  '🛠️ Development Workflow',
  '📚 Documentation',
  '🔧 Configuration',
  '🚀 Deployment',
  '🧪 Testing',
  '📊 Monitoring & Logging',
  '🔒 Security',
  '🤝 Contributing',
  '📄 License',
  '🆘 Support',
  '🗺️ Roadmap',
];

function validateFileExists(filePath, description) {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Missing ${description}: ${filePath}`);
    return false;
  }
  console.log(`✅ Found ${description}: ${filePath}`);
  return true;
}

function validateMarkdownLinks(content, filePath) {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const links = [];
  let match;

  while ((match = linkRegex.exec(content)) !== null) {
    const [fullMatch, text, url] = match;
    links.push({ text, url, fullMatch });
  }

  const brokenLinks = [];
  const validLinks = [];

  links.forEach((link) => {
    if (link.url.startsWith('./') || link.url.startsWith('../') || !link.url.startsWith('http')) {
      // Relative link - check if file exists
      const absoluteUrl = path.resolve(path.dirname(filePath), link.url);
      if (fs.existsSync(absoluteUrl)) {
        validLinks.push(link);
      } else {
        brokenLinks.push({ ...link, reason: 'File not found' });
      }
    } else {
      // External link - assume valid for now
      validLinks.push(link);
    }
  });

  return { validLinks, brokenLinks };
}

function validateMainREADME() {
  console.log('\n🔍 Validating main README.md...');

  if (!validateFileExists(MAIN_README, 'main README')) {
    return false;
  }

  const content = fs.readFileSync(MAIN_README, 'utf8');

  // Check for expected sections
  const missingSections = [];
  EXPECTED_SECTIONS.forEach((section) => {
    if (!content.includes(section)) {
      missingSections.push(section);
    }
  });

  if (missingSections.length > 0) {
    console.log('⚠️  Missing sections in main README:');
    missingSections.forEach((section) => console.log(`   - ${section}`));
  } else {
    console.log('✅ All expected sections found in main README');
  }

  // Validate links
  const { validLinks, brokenLinks } = validateMarkdownLinks(content, MAIN_README);

  if (brokenLinks.length > 0) {
    console.log('❌ Broken links in main README:');
    brokenLinks.forEach((link) => {
      console.log(`   - [${link.text}](${link.url}) - ${link.reason}`);
    });
  } else {
    console.log(`✅ All ${validLinks.length} links in main README are valid`);
  }

  return brokenLinks.length === 0;
}

function validateDocumentationStructure() {
  console.log('\n🔍 Validating documentation structure...');

  let allValid = true;

  EXPECTED_FILES.forEach((file) => {
    const filePath = path.join(DOCS_DIR, file);
    if (!validateFileExists(filePath, file)) {
      allValid = false;
    }
  });

  return allValid;
}

function validateIndexFile() {
  console.log('\n🔍 Validating documentation index...');

  if (!validateFileExists(INDEX_FILE, 'documentation index')) {
    return false;
  }

  const content = fs.readFileSync(INDEX_FILE, 'utf8');

  // Check if index contains links to all expected files
  const missingLinks = [];
  EXPECTED_FILES.forEach((file) => {
    if (!content.includes(file)) {
      missingLinks.push(file);
    }
  });

  if (missingLinks.length > 0) {
    console.log('⚠️  Missing links in index:');
    missingLinks.forEach((file) => console.log(`   - ${file}`));
  } else {
    console.log('✅ All expected files linked in index');
  }

  return missingLinks.length === 0;
}

function validateCodeExamples() {
  console.log('\n🔍 Validating code examples...');

  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  let totalCodeBlocks = 0;
  let validCodeBlocks = 0;

  EXPECTED_FILES.forEach((file) => {
    const filePath = path.join(DOCS_DIR, file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      let match;

      while ((match = codeBlockRegex.exec(content)) !== null) {
        totalCodeBlocks++;
        const [fullMatch, language, code] = match;

        // Basic validation - check if code block is not empty
        if (code.trim().length > 0) {
          validCodeBlocks++;
        }
      }
    }
  });

  console.log(`✅ Found ${totalCodeBlocks} code blocks, ${validCodeBlocks} are valid`);
  return validCodeBlocks === totalCodeBlocks;
}

function generateValidationReport() {
  console.log('\n📊 Generating validation report...');

  const report = {
    timestamp: new Date().toISOString(),
    structure: validateDocumentationStructure(),
    mainReadme: validateMainREADME(),
    index: validateIndexFile(),
    codeExamples: validateCodeExamples(),
    summary: {
      totalFiles: EXPECTED_FILES.length,
      expectedSections: EXPECTED_SECTIONS.length,
    },
  };

  const allValid = report.structure && report.mainReadme && report.index && report.codeExamples;

  if (allValid) {
    console.log('\n🎉 All documentation validation checks passed!');
    console.log('✅ Documentation is complete and ready for use');
  } else {
    console.log('\n❌ Some validation checks failed. Please review the issues above.');
  }

  // Save report
  const reportPath = path.join(DOCS_DIR, 'validation-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`📄 Validation report saved to: ${reportPath}`);

  return allValid;
}

function main() {
  console.log('🚀 Starting documentation validation...\n');

  const isValid = generateValidationReport();

  process.exit(isValid ? 0 : 1);
}

if (require.main === module) {
  main();
}

module.exports = {
  validateFileExists,
  validateMarkdownLinks,
  validateMainREADME,
  validateDocumentationStructure,
  validateIndexFile,
  validateCodeExamples,
  generateValidationReport,
};
