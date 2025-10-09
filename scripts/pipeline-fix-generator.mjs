#!/usr/bin/env node

/**
 * Pipeline Fix Automation Generator
 * Automatically creates standardized task files for common pipeline issues
 */

import fs from 'fs';
import path from 'path';

const TASK_TEMPLATES = {
  'file-reference': {
    title: (pipeline, issue) => `Fix ${pipeline} pipeline file reference issue`,
    description: (pipeline, issue) => `The ${pipeline} pipeline has a file reference issue: ${issue}. This prevents pipeline execution and needs immediate resolution.`,
    priority: 'P2',
    labels: (pipeline) => ['pipeline', 'bug', 'automation', pipeline],
    acceptance: (pipeline) => [
      `Identify the incorrect file reference in ${pipeline} pipeline`,
      `Update pipeline configuration to reference correct file path`,
      `Add case-insensitive file lookup for robustness`,
      `Test pipeline execution to ensure file resolution works`
    ]
  },
  
  'dependency-resolution': {
    title: (pipeline, missingDep) => `Fix ${pipeline} pipeline missing dependency: ${missingDep}`,
    description: (pipeline, missingDep) => `The ${pipeline} pipeline fails with missing dependency error for ${missingDep}. This prevents pipeline from running successfully.`,
    priority: 'P1',
    labels: (pipeline) => ['pipeline', 'dependency', 'automation', pipeline],
    acceptance: (pipeline) => [
      `Add ${missingDep} to pipeline package dependencies`,
      `Ensure dependency is properly built and available`,
      `Update pipeline configuration if needed`,
      `Test pipeline execution to verify dependency resolution`
    ]
  },

  'timeout-configuration': {
    title: (pipeline, step) => `Fix ${pipeline} pipeline timeout configuration for ${step} step`,
    description: (pipeline, step) => `The ${pipeline} pipeline's ${step} step times out due to insufficient timeout configuration. Need to configure appropriate timeouts for different operations.`,
    priority: 'P2',
    labels: (pipeline) => ['pipeline', 'timeout', 'automation', pipeline],
    acceptance: (pipeline) => [
      `Analyze which step in ${pipeline} is causing timeout`,
      `Configure appropriate timeouts for different operations`,
      `Add progressive analysis capabilities for long-running operations`,
      `Implement proper timeout handling per step`
    ]
  },

  'cache-management': {
    title: (pipeline) => `Fix ${pipeline} pipeline caching issues`,
    description: (pipeline) => `The ${pipeline} pipeline has caching problems preventing proper step reuse and causing unnecessary re-execution.`,
    priority: 'P2',
    labels: (pipeline) => ['pipeline', 'cache', 'automation', pipeline],
    acceptance: (pipeline) => [
      `Investigate cache state reporting for ${pipeline} pipeline`,
      `Fix cache invalidation when files are renamed`,
      `Ensure proper cache state tracking between steps`,
      `Test pipeline caching behavior`
    ]
  }
};

function generateTaskUUID() {
  return `pipeline-fix-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function generateTaskFileName(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim() + '.md';
}

function createTaskFile(template, args, outputPath) {
  const { pipeline, issue, details = {} } = args;
  const uuid = generateTaskUUID();
  const fileName = generateTaskFileName(template.title(pipeline, issue));
  const filePath = path.join(outputPath, fileName);

  const frontmatter = [
    '---',
    `uuid: "${uuid}"`,
    `title: "${template.title(pipeline, issue)}"`,
    `slug: "${fileName.replace('.md', '')}"`,
    `status: "incoming"`,
    `priority: "${template.priority}"`,
    `labels: [${template.labels(pipeline).map(l => `"${l}"`).join(', ')}]`,
    `created_at: "${new Date().toISOString()}"`,
    'estimates:',
    '  complexity: "medium"',
    '  scale: "medium"',
    '  time_to_completion: "2-4 hours"',
    '---'
  ].join('\n');

  const content = [
    frontmatter,
    '',
    `# ${template.title(pipeline, issue)}`,
    '',
    '## 📋 Issue Description',
    '',
    template.description(pipeline, issue),
    '',
    '## 🔍 Technical Details',
    '',
    `- **Pipeline**: ${pipeline}`,
    `- **Issue**: ${issue}`,
    '- **Detection**: Automated pipeline fix generator',
    '',
    details.analysis ? `## 📊 Analysis\n\n${details.analysis}\n\n` : '',
    '## ✅ Acceptance Criteria',
    '',
    template.acceptance(pipeline).map(criteria => `- [ ] ${criteria}`).join('\n'),
    '',
    '## 🛠️ Implementation Plan',
    '',
    '### Phase 1: Investigation (30 minutes)',
    '- [ ] Locate the problematic file reference or dependency',
    '- [ ] Analyze current pipeline configuration',
    '- [ ] Identify root cause and impact scope',
    '',
    '### Phase 2: Fix Implementation (1-2 hours)',
    '- [ ] Implement the actual fix based on issue type',
    '- [ ] Add error handling and validation',
    '- [ ] Update related documentation if needed',
    '',
    '### Phase 3: Testing & Validation (30 minutes)',
    '- [ ] Run pipeline in dry-run mode to verify configuration',
    '- [ ] Execute pipeline and check for successful completion',
    '- [ ] Validate that the original issue is resolved',
    '',
    '## 📁 Files to Modify',
    '',
    '- `pipelines.json` - Pipeline configuration',
    '- Pipeline-specific scripts or configuration files',
    '- Related package dependencies',
    '',
    '## 🔗 Related Resources',
    '',
    '- Pipeline documentation',
    '- Error logs and stack traces',
    '- Previous similar pipeline fix tasks',
    '',
    '## 🎯 Success Metrics',
    '',
    '- Pipeline executes without file reference errors',
    '- All steps complete successfully',
    '- No regression in pipeline functionality',
    '- Pipeline cache state properly maintained',
    '',
    '---',
    '',
    `**Generated**: ${new Date().toISOString()} by pipeline-fix-generator.mjs`,
    `**Template**: pipeline-fix-generator`
  ].join('\n');

  fs.writeFileSync(filePath, content, 'utf-8');
  return { filePath, uuid, fileName };
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log(`
Usage: node pipeline-fix-generator.mjs <template-type> <pipeline> <issue> [options]

Template Types:
  - file-reference: File path/reference issues
  - dependency-resolution: Missing dependencies
  - timeout-configuration: Timeout configuration problems
  - cache-management: Caching and state issues

Examples:
  node pipeline-fix-generator.mjs file-reference docops "Process.md case sensitivity"
  node pipeline-fix-generator.mjs dependency-resolution symdocs "@promethean/file-indexer"
  node pipeline-fix-generator.mjs timeout-configuration buildfix "bf-build step timeout"
  node pipeline-fix-generator.mjs cache-management piper "Cache invalidation issues"

Options:
  --output-dir <path>: Output directory for task files (default: docs/agile/tasks)
  --details <json>: Additional analysis details as JSON string
    `);
    process.exit(1);
  }

  const [templateType, pipeline, issue] = args;
  const outputDir = args.find(arg => arg.startsWith('--output-dir='))?.split('=')[1] || 'docs/agile/tasks';
  const detailsArg = args.find(arg => arg.startsWith('--details='))?.split('=')[1];
  const details = detailsArg ? JSON.parse(detailsArg) : {};

  if (!TASK_TEMPLATES[templateType]) {
    console.error(`Error: Unknown template type "${templateType}"`);
    console.log(`Available templates: ${Object.keys(TASK_TEMPLATES).join(', ')}`);
    process.exit(1);
  }

  const template = TASK_TEMPLATES[templateType];
  const taskArgs = { pipeline, issue, details };
  
  try {
    const result = createTaskFile(template, taskArgs, outputDir);
    console.log(`✅ Pipeline fix task created successfully!`);
    console.log(`📁 File: ${result.filePath}`);
    console.log(`🆔 UUID: ${result.uuid}`);
    console.log(`📝 Name: ${result.fileName}`);
    
    // Suggest next steps
    console.log(`\n🚀 Next Steps:`);
    console.log(`1. Review the generated task: ${result.filePath}`);
    console.log(`2. Move task to appropriate kanban column: pnpm kanban update-status ${result.uuid} ready`);
    console.log(`3. Assign to agent or team member`);
    
  } catch (error) {
    console.error(`❌ Error creating task file: ${error.message}`);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { createTaskFile, TASK_TEMPLATES };