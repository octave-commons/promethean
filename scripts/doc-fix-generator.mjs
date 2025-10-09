#!/usr/bin/env node

/**
 * Documentation Fix Automation Generator
 * Automatically creates standardized task files for documentation issues
 */

import fs from 'fs';
import path from 'path';

const DOC_FIX_TEMPLATES = {
  'documentation-fix': {
    title: (docType, issue) => `Fix documentation issues in ${docType}: ${issue}`,
    description: (docType, issue) => `Documentation for ${docType} has issues: ${issue}. This affects user understanding and onboarding experience.`,
    priority: 'P3',
    labels: (docType) => ['documentation', 'automation', 'doc-fix', docType],
    acceptance: (docType) => [
      `Analyze documentation issues in ${docType}`,
      `Fix content, structure, or formatting problems`,
      `Ensure documentation is current and accurate`,
      `Validate documentation completeness and clarity`
    ]
  },

  'readme-fix': {
    title: (project, issue) => `Update README for ${project}: ${issue}`,
    description: (project, issue) => `README for ${project} needs updates: ${issue}. This affects project setup and user onboarding.`,
    priority: 'P3',
    labels: (project) => ['documentation', 'readme', 'automation', 'doc-fix', project],
    acceptance: (project) => [
      `Update README content for ${project}`,
      `Fix installation and setup instructions`,
      `Ensure examples and code snippets work correctly`,
      `Verify README completeness and accuracy`
    ]
  },

  'documentation-update': {
    title: (docType, issue) => `Update ${docType} documentation: ${issue}`,
    description: (docType, issue) => `${docType} documentation is outdated: ${issue}. Need to update to reflect current system state.`,
    priority: 'P3',
    labels: (docType) => ['documentation', 'update', 'automation', docType],
    acceptance: (docType) => [
      `Update outdated content in ${docType}`,
      `Sync documentation with current implementation`,
      `Add missing documentation for new features`,
      `Verify documentation accuracy and completeness`
    ]
  },

  'guide-fix': {
    title: (guideType, issue) => `Fix ${guideType} guide: ${issue}`,
    description: (guideType, issue) => `${guideType} guide has problems: ${issue}. This affects user experience and learning.`,
    priority: 'P3',
    labels: (guideType) => ['documentation', 'guide', 'automation', guideType],
    acceptance: (guideType) => [
      `Fix issues in ${guideType} guide`,
      `Update guide content and examples`,
      `Ensure guide follows consistent formatting`,
      `Validate guide completeness and accuracy`
    ]
  },

  'api-doc-fix': {
    title: (apiName, issue) => `Fix API documentation for ${apiName}: ${issue}`,
    description: (apiName, issue) => `API documentation for ${apiName} has issues: ${issue}. This affects developer experience and API usage.`,
    priority: 'P2',
    labels: (apiName) => ['documentation', 'api', 'automation', apiName],
    acceptance: (apiName) => [
      `Fix API documentation issues for ${apiName}`,
      `Update endpoint documentation and examples`,
      `Ensure API docs match current implementation`,
      `Validate documentation completeness and accuracy`
    ]
  }
};

function generateDocFixUUID() {
  return `doc-fix-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function generateDocFixFileName(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim() + '.md';
}

function createDocFixTask(template, args, outputPath) {
  const { docType, issue, details = {} } = args;
  const uuid = generateDocFixUUID();
  const fileName = generateDocFixFileName(template.title(docType, issue));
  const filePath = path.join(outputPath, fileName);

  const frontmatter = [
    '---',
    `uuid: "${uuid}"`,
    `title: "${template.title(docType, issue)}"`,
    `slug: "${fileName.replace('.md', '')}"`,
    `status: "incoming"`,
    `priority: "${template.priority}"`,
    `labels: [${template.labels(docType).map(l => `"${l}"`).join(', ')}]`,
    `created_at: "${new Date().toISOString()}"`,
    'estimates:',
    '  complexity: "low"',
    '  scale: "small"',
    '  time_to_completion: "1-2 hours"',
    '---'
  ].join('\n');

  const content = [
    frontmatter,
    '',
    `# ${template.title(docType, issue)}`,
    '',
    '## 📋 Issue Description',
    '',
    template.description(docType, issue),
    '',
    '## 🔍 Technical Details',
    '',
    `- **Document Type**: ${docType}`,
    `- **Issue**: ${issue}`,
    '- **Detection**: Automated doc fix generator',
    '',
    details.analysis ? `## 📊 Analysis\n\n${details.analysis}\n\n` : '',
    '## ✅ Acceptance Criteria',
    '',
    template.acceptance(docType).map(criteria => `- [ ] ${criteria}`).join('\n'),
    '',
    '## 🛠️ Implementation Plan',
    '',
    '### Phase 1: Documentation Review (20 minutes)',
    '- [ ] Examine current documentation state',
    '- [ ] Identify specific issues and gaps',
    '- [ ] Check for consistency with implementation',
    '- [ ] Analyze user experience and clarity',
    '',
    '### Phase 2: Content Updates (30-60 minutes)',
    '- [ ] Fix identified documentation issues',
    '- [ ] Update outdated content and examples',
    '- [ ' + (template.priority === 'P2' ? 'Fix API documentation accuracy' : 'Improve documentation clarity'),
    '- [ ] Ensure consistent formatting and structure',
    '',
    '### Phase 3: Validation (20 minutes)',
    '- [ ] Review updated documentation for accuracy',
    '- [ ' + (template.priority === 'P2' ? 'Validate API examples work correctly' : 'Validate examples and instructions'),
    '- [ ] Check documentation completeness',
    '- [ ' + (template.priority === 'P2' ? 'Test API documentation against current implementation' : 'Test user instructions work correctly'),
    '',
    '## 📁 Files to Modify',
    '',
    `- Documentation file(s) for ${docType}`,
    '- README files if relevant',
    '- API documentation if applicable',
    '- Guide documentation if relevant',
    '',
    '## 🔗 Related Resources',
    '',
    '- Current documentation files',
    '- User feedback and issues',
    '- Implementation code for reference',
    '- Documentation style guide',
    '- Previous documentation updates',
    '',
    '## 🎯 Success Metrics',
    '',
    '- Documentation is accurate and current',
    '- Examples and instructions work correctly',
    '- Documentation follows consistent formatting',
    '- User understanding and clarity improved',
    '- Developer experience enhanced (for API docs)',
    '',
    '## 📝 Documentation Best Practices',
    '',
    '- Use clear, concise language',
    '- Provide working examples and code snippets',
    '- Include installation and setup instructions',
    ' - Maintain consistent formatting and structure',
    '- Keep documentation synchronized with implementation',
    '- Include troubleshooting and FAQ sections',
    '',
    '---',
    '',
    `**Generated**: ${new Date().toISOString()} by doc-fix-generator.mjs`,
    `**Template**: doc-fix-generator`,
    `**Priority**: ${template.priority.toUpperCase()}`
  ].join('\n');

  fs.writeFileSync(filePath, content, 'utf-8');
  return { filePath, uuid, fileName };
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log(`
Usage: node doc-fix-generator.mjs <fix-type> <doc-type> <issue> [options]

Fix Types:
  - documentation-fix: General documentation issues
  - readme-fix: README file updates
  - documentation-update: Outdated content updates
  - guide-fix: Guide and tutorial fixes
  - api-doc-fix: API documentation issues

Examples:
  node doc-fix-generator.mjs documentation-fix "API Reference" "Missing endpoint documentation"
  node doc-fix-generator.mjs readme-fix "promethean" "Installation instructions outdated"
  node doc-fix-generator.mjs documentation-update "User Guide" "Features list outdated"
  node doc-fix-generator.mjs guide-fix "Getting Started" "Examples don't work"
  node doc-fix-generator.mjs api-doc-fix "REST API" "Endpoint responses incorrect"

Options:
  --output-dir <path>: Output directory for task files (default: docs/agile/tasks)
  --details <json>: Additional analysis details as JSON string
    `);
    process.exit(1);
  }

  const [fixType, docType, issue] = args;
  const outputDir = args.find(arg => arg.startsWith('--output-dir='))?.split('=')[1] || 'docs/agile/tasks';
  const detailsArg = args.find(arg => arg.startsWith('--details='))?.split('=')[1];
  const details = detailsArg ? JSON.parse(detailsArg) : {};

  if (!DOC_FIX_TEMPLATES[fixType]) {
    console.error(`Error: Unknown fix type "${fixType}"`);
    console.log(`Available fix types: ${Object.keys(DOC_FIX_TEMPLATES).join(', ')}`);
    process.exit(1);
  }

  const template = DOC_FIX_TEMPLATES[fixType];
  const taskArgs = { docType, issue, details };
  
  try {
    const result = createDocFixTask(template, taskArgs, outputDir);
    console.log(`✅ Documentation fix task created successfully!`);
    console.log(`📁 File: ${result.filePath}`);
    console.log(`🆔 UUID: ${result.uuid}`);
    console.log(`📝 Name: ${result.fileName}`);
    
    // Suggest next steps
    console.log(`\n🚀 Next Steps:`);
    console.log(`1. Review the generated task: ${result.filePath}`);
    console.log(`2. Move task to appropriate kanban column: pnpm kanban update-status ${result.uuid} ready`);
    console.log(`3. Assign to technical writer or documentation maintainer`);
    
    if (template.priority === 'P2') {
      console.log(`4. Priority: MEDIUM - Fix before next release`);
    } else {
      console.log(`4. Priority: LOW - Fix when resources available`);
    }
    
  } catch (error) {
    console.error(`❌ Error creating task file: ${error.message}`);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { createDocFixTask, DOC_FIX_TEMPLATES };