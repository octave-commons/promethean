#!/usr/bin/env node

/**
 * TypeScript Build Fix Automation
 * Automatically generates fix tasks for common TypeScript build issues
 */

import fs from 'fs';
import path from 'path';

const TYPE_FIX_TEMPLATES = {
  'type-mismatch': {
    title: (file, error) => `Fix TypeScript type mismatch in ${file}`,
    description: (file, error) => `TypeScript compilation error in ${file}: ${error}. This prevents successful build and needs type correction.`,
    priority: 'P2',
    labels: (file) => ['typescript', 'build', 'automation', 'type-fix'],
    acceptance: (file) => [
      `Analyze TypeScript compilation error in ${file}`,
      `Fix type mismatches and update type definitions`,
      `Ensure proper type exports and imports`,
      `Verify TypeScript compilation succeeds`
    ]
  },

  'missing-exports': {
    title: (file) => `Fix missing exports in ${file}`,
    description: (file) => `TypeScript build fails due to missing exports in ${file}. This prevents downstream packages from importing required modules.`,
    priority: 'P1',
    labels: ['typescript', 'exports', 'automation', 'build-fix'],
    acceptance: (file) => [
      `Identify missing exports in ${file}`,
      `Add proper export statements`,
      `Update package.json exports if needed`,
      `Verify downstream imports work correctly`
    ]
  },

  'parser-configuration': {
    title: (file) => `Fix TypeScript parser configuration for ${file}`,
    description: (file) => `TypeScript parser configuration issues in ${file} causing compilation errors. Need proper parserOptions setup.`,
    priority: 'P2',
    labels: ['typescript', 'parser', 'automation', 'config-fix'],
    acceptance: (file) => [
      `Update TypeScript parser configuration`,
      `Add proper tsconfig settings`,
      `Configure @typescript-eslint parser options`,
      `Test TypeScript compilation with new configuration`
    ]
  }
};

function generateTypeFixUUID() {
  return `type-fix-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function generateTypeFixFileName(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim() + '.md';
}

function createTypeFixTask(template, args, outputPath) {
  const { file, error, details = {} } = args;
  const uuid = generateTypeFixUUID();
  const fileName = generateTypeFixFileName(template.title(file, error));
  const filePath = path.join(outputPath, fileName);

  const frontmatter = [
    '---',
    `uuid: "${uuid}"`,
    `title: "${template.title(file, error)}"`,
    `slug: "${fileName.replace('.md', '')}"`,
    `status: "incoming"`,
    `priority: "${template.priority}"`,
    `labels: [${template.labels(file).map(l => `"${l}"`).join(', ')}]`,
    `created_at: "${new Date().toISOString()}"`,
    'estimates:',
    '  complexity: "medium"',
    '  scale: "medium"',
    '  time_to_completion: "1-3 hours"',
    '---'
  ].join('\n');

  const content = [
    frontmatter,
    '',
    `# ${template.title(file, error)}`,
    '',
    '## 📋 Issue Description',
    '',
    template.description(file, error),
    '',
    '## 🔍 Technical Details',
    '',
    `- **File**: ${file}`,
    `- **Error**: ${error}`,
    '- **Detection**: Automated type fix generator',
    '',
    details.analysis ? `## 📊 Analysis\n\n${details.analysis}\n\n` : '',
    '## ✅ Acceptance Criteria',
    '',
    template.acceptance(file).map(criteria => `- [ ] ${criteria}`).join('\n'),
    '',
    '## 🛠️ Implementation Plan',
    '',
    '### Phase 1: Error Analysis (30 minutes)',
    '- [ ] Examine TypeScript compilation error details',
    '- [ ] Locate problematic type definitions',
    '- [ ] Identify missing or incorrect type exports',
    '- [ ] Check parser configuration settings',
    '',
    '### Phase 2: Type Correction (1-2 hours)',
    '- [ ] Fix type mismatches and update interfaces',
    '- [ ] Add missing export statements',
    '- [ ] Update parser configuration if needed',
    '- [ ] Ensure proper type imports/exports chain',
    '',
    '### Phase 3: Validation (30 minutes)',
    '- [ ] Run TypeScript compilation check',
    '- [ ] Verify all type errors are resolved',
    '- [ ] Test downstream package imports',
    '- [ ] Run full build to ensure no regressions',
    '',
    '## 📁 Files to Modify',
    '',
    `- ${file} - Main TypeScript file with issues`,
    '- package.json - Exports configuration if needed',
    '- tsconfig.json - TypeScript configuration',
    '- eslint.config.js - Parser configuration',
    '',
    '## 🔗 Related Resources',
    '',
    '- TypeScript documentation',
    '- Build logs and compilation errors',
    '- Previous similar type fix tasks',
    '- Package dependency tree',
    '',
    '## 🎯 Success Metrics',
    '',
    '- TypeScript compilation succeeds without errors',
    '- All type exports properly defined',
    '- Downstream packages can import successfully',
    '- Build pipeline completes successfully',
    '',
    '---',
    '',
    `**Generated**: ${new Date().toISOString()} by type-fix-automation.mjs`,
    `**Template**: type-fix-generator`
  ].join('\n');

  fs.writeFileSync(filePath, content, 'utf-8');
  return { filePath, uuid, fileName };
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log(`
Usage: node type-fix-automation.mjs <fix-type> <file> <error> [options]

Fix Types:
  - type-mismatch: Type compatibility issues
  - missing-exports: Missing export statements
  - parser-configuration: Parser and tsconfig issues

Examples:
  node type-fix-automation.mjs type-mismatch "src/command-handlers.ts" "configPath does not exist"
  node type-fix-automation.mjs missing-exports "src/index.ts" "Missing exports"
  node type-fix-automation.mjs parser-configuration "src/components.ts" "Parser configuration error"

Options:
  --output-dir <path>: Output directory for task files (default: docs/agile/tasks)
  --details <json>: Additional analysis details as JSON string
    `);
    process.exit(1);
  }

  const [fixType, file, error] = args;
  const outputDir = args.find(arg => arg.startsWith('--output-dir='))?.split('=')[1] || 'docs/agile/tasks';
  const detailsArg = args.find(arg => arg.startsWith('--details='))?.split('=')[1];
  const details = detailsArg ? JSON.parse(detailsArg) : {};

  if (!TYPE_FIX_TEMPLATES[fixType]) {
    console.error(`Error: Unknown fix type "${fixType}"`);
    console.log(`Available fix types: ${Object.keys(TYPE_FIX_TEMPLATES).join(', ')}`);
    process.exit(1);
  }

  const template = TYPE_FIX_TEMPLATES[fixType];
  const taskArgs = { file, error, details };
  
  try {
    const result = createTypeFixTask(template, taskArgs, outputDir);
    console.log(`✅ TypeScript fix task created successfully!`);
    console.log(`📁 File: ${result.filePath}`);
    console.log(`🆔 UUID: ${result.uuid}`);
    console.log(`📝 Name: ${result.fileName}`);
    
    // Suggest next steps
    console.log(`\n🚀 Next Steps:`);
    console.log(`1. Review the generated task: ${result.filePath}`);
    console.log(`2. Move task to appropriate kanban column: pnpm kanban update-status ${result.uuid} ready`);
    console.log(`3. Assign to developer or team member`);
    
  } catch (error) {
    console.error(`❌ Error creating task file: ${error.message}`);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { createTypeFixTask, TYPE_FIX_TEMPLATES };