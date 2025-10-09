#!/usr/bin/env node

/**
 * Automation Batch Task Generator
 * Generates multiple automation tasks based on current kanban board analysis
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

class BatchAutomationGenerator {
  constructor() {
    this.taskQueue = [];
    this.generatedTasks = [];
    this.stats = {
      pipelineFixes: 0,
      typeFixes: 0,
      testFixes: 0,
      docFixes: 0,
      total: 0
    };
  }

  async scanForAutomationTargets() {
    console.log('🔍 Scanning kanban board for automation targets...');
    
    try {
      // Get current kanban board state
      const boardOutput = execSync('pnpm kanban list --format json', { encoding: 'utf-8' });
      const boardData = JSON.parse(boardOutput);
      
      // Identify automation candidates
      await this.identifyPipelineFixes(boardData);
      await this.identifyTypeFixes(boardData);
      await this.identifyTestFixes(boardData);
      await this.identifyDocFixes(boardData);
      
      console.log(`📊 Found ${this.taskQueue.length} automation targets:`);
      console.log(`  - Pipeline fixes: ${this.stats.pipelineFixes}`);
      console.log(`  - Type fixes: ${this.stats.typeFixes}`);
      console.log(`  - Test fixes: ${this.stats.testFixes}`);
      console.log(`  - Documentation fixes: ${this.stats.docFixes}`);
      
      return this.taskQueue;
    } catch (error) {
      console.error('❌ Error scanning for automation targets:', error.message);
      return [];
    }
  }

  async identifyPipelineFixes(boardData) {
    const pipelinePatterns = [
      { pattern: /file.*reference/i, priority: 'P2', type: 'file-reference' },
      { pattern: /dependency/i, priority: 'P1', type: 'dependency-resolution' },
      { pattern: /timeout/i, priority: 'P2', type: 'timeout-configuration' },
      { pattern: /cache/i, priority: 'P2', type: 'cache-management' },
      { pattern: /path.*resolution/i, priority: 'P2', type: 'file-reference' },
      { pattern: /missing.*input/i, priority: 'P2', type: 'dependency-resolution' }
    ];

    for (const task of boardData.tasks || []) {
      if (task.status === 'incoming' || task.status === 'todo') {
        for (const pattern of pipelinePatterns) {
          if (task.title && pattern.pattern.test(task.title)) {
            this.taskQueue.push({
              type: 'pipeline',
              template: pattern.type,
              priority: pattern.priority,
              data: {
                pipeline: this.extractPipelineName(task.title),
                issue: task.title,
                details: { taskUuid: task.uuid }
              }
            });
            this.stats.pipelineFixes++;
            break; // One pattern per task to avoid duplicates
          }
        }
      }
    }
  }

  async identifyTypeFixes(boardData) {
    const typePatterns = [
      { pattern: /type.*error/i, priority: 'P2', type: 'type-mismatch' },
      { pattern: /typescript/i, priority: 'P2', type: 'type-mismatch' },
      { pattern: /missing.*export/i, priority: 'P1', type: 'missing-exports' },
      { pattern: /parser/i, priority: 'P2', type: 'parser-configuration' },
      { pattern: /build.*error/i, priority: 'P2', type: 'type-mismatch' },
      { pattern: /compilation.*error/i, priority: 'P2', type: 'type-mismatch' }
    ];

    for (const task of boardData.tasks || []) {
      if (task.status === 'incoming' || task.status === 'todo') {
        for (const pattern of typePatterns) {
          if (task.title && pattern.pattern.test(task.title)) {
            this.taskQueue.push({
              type: 'typescript',
              template: pattern.type,
              priority: pattern.priority,
              data: {
                file: this.extractFileName(task.title),
                error: task.title,
                details: { taskUuid: task.uuid }
              }
            });
            this.stats.typeFixes++;
            break;
          }
        }
      }
    }
  }

  async identifyTestFixes(boardData) {
    const testPatterns = [
      { pattern: /test.*fail/i, priority: 'P1', type: 'test-failure' },
      { pattern: /test.*error/i, priority: 'P1', type: 'test-error' },
      { pattern: /integration.*fail/i, priority: 'P2', type: 'integration-test' },
      { pattern: /unit.*fail/i, priority: 'P2', type: 'unit-test' },
      { pattern: /test.*timeout/i, priority: 'P2', type: 'test-timeout' },
      { pattern: /assertion.*error/i, priority: 'P2', type: 'assertion-error' }
    ];

    for (const task of boardData.tasks || []) {
      if (task.status === 'testing' || task.status === 'todo') {
        for (const pattern of testPatterns) {
          if (task.title && pattern.pattern.test(task.title)) {
            this.taskQueue.push({
              type: 'test',
              template: pattern.type,
              priority: pattern.priority,
              data: {
                testSuite: this.extractTestSuite(task.title),
                issue: task.title,
                details: { taskUuid: task.uuid }
              }
            });
            this.stats.testFixes++;
            break;
          }
        }
      }
    }
  }

  async identifyDocFixes(boardData) {
    const docPatterns = [
      { pattern: /documentation/i, priority: 'P3', type: 'documentation-fix' },
      { pattern: /readme/i, priority: 'P3', type: 'readme-fix' },
      { pattern: /doc.*update/i, priority: 'P3', type: 'documentation-update' },
      { pattern: /guide.*fix/i, priority: 'P3', type: 'guide-fix' },
      { pattern: /api.*doc/i, priority: 'P3', type: 'api-doc-fix' }
    ];

    for (const task of boardData.tasks || []) {
      if (task.status === 'incoming' || task.status === 'todo') {
        for (const pattern of docPatterns) {
          if (task.title && pattern.pattern.test(task.title)) {
            this.taskQueue.push({
              type: 'documentation',
              template: pattern.type,
              priority: pattern.priority,
              data: {
                docType: this.extractDocType(task.title),
                issue: task.title,
                details: { taskUuid: task.uuid }
              }
            });
            this.stats.docFixes++;
            break;
          }
        }
      }
    }
  }

  extractPipelineName(title) {
    const pipelineMatch = title.match(/\b(docops|symdocs|buildfix|test-gap|eslint-tasks|board-review|sonar)\b/i);
    return pipelineMatch ? pipelineMatch[1] : 'unknown';
  }

  extractFileName(title) {
    const fileMatch = title.match(/[^\/\\s]+\.(ts|tsx|js|mjs|cjs)/i);
    return fileMatch ? fileMatch[0] : 'unknown.ts';
  }

  extractTestSuite(title) {
    const testMatch = title.match(/\b(\w+test|\w+-test)\b/i);
    return testMatch ? testMatch[1] : 'unknown-test';
  }

  extractDocType(title) {
    const docMatch = title.match(/\b(README|guide|api|documentation)\b/i);
    return docMatch ? docMatch[1].toLowerCase() : 'docs';
  }

  async generateBatchTasks(batchSize = 5) {
    console.log(`🤖 Generating ${Math.min(batchSize, this.taskQueue.length)} automation tasks...`);
    
    const tasksToGenerate = this.taskQueue.slice(0, batchSize);
    
    for (const taskSpec of tasksToGenerate) {
      try {
        await this.generateSingleTask(taskSpec);
        this.generatedTasks.push(taskSpec);
      } catch (error) {
        console.error(`❌ Failed to generate task for ${taskSpec.type}: ${error.message}`);
      }
    }

    // Remove generated tasks from queue
    this.taskQueue = this.taskQueue.slice(batchSize);
    
    console.log(`✅ Generated ${this.generatedTasks.length} automation tasks`);
    console.log(`📊 Remaining in queue: ${this.taskQueue.length}`);
    
    return this.generatedTasks;
  }

  async generateSingleTask(taskSpec) {
    const { type, template, priority, data } = taskSpec;
    
    let generatorCmd;
    const outputDir = 'docs/agile/tasks';
    
    switch (type) {
      case 'pipeline':
        generatorCmd = `node scripts/pipeline-fix-generator.mjs ${template} "${data.pipeline}" "${data.issue}" --details '${JSON.stringify(data.details)}' --output-dir ${outputDir}`;
        break;
      case 'typescript':
        generatorCmd = `node scripts/type-fix-automation.mjs ${template} "${data.file}" "${data.error}" --details '${JSON.stringify(data.details)}' --output-dir ${outputDir}`;
        break;
      case 'test':
        generatorCmd = `node scripts/test-fix-generator.mjs ${template} "${data.testSuite}" "${data.issue}" --details '${JSON.stringify(data.details)}' --output-dir ${outputDir}`;
        break;
      case 'documentation':
        generatorCmd = `node scripts/doc-fix-generator.mjs ${template} "${data.docType}" "${data.issue}" --details '${JSON.stringify(data.details)}' --output-dir ${outputDir}`;
        break;
      default:
        throw new Error(`Unknown task type: ${type}`);
    }

    // Execute generator
    const result = execSync(generatorCmd, { encoding: 'utf-8' });
    
    // Extract UUID from output and move to ready
    const uuidMatch = result.match(/UUID: ([a-f0-9-]+)/);
    if (uuidMatch) {
      const uuid = uuidMatch[1];
      execSync(`pnpm kanban update-status ${uuid} ready`, { encoding: 'utf-8' });
      console.log(`📝 Generated and moved task: ${uuid} → ready`);
    }
  }

  async updateOriginalTasks() {
    console.log('🔄 Updating original tasks with automation links...');
    
    for (const generatedTask of this.generatedTasks) {
      const { type, data } = generatedTask;
      if (data.details && data.details.taskUuid) {
        const originalUuid = data.details.taskUuid;
        
        // Add automation tag to original task
        const filePath = path.join('docs/agile/tasks', this.findTaskFile(originalUuid));
        if (fs.existsSync(filePath)) {
          let content = fs.readFileSync(filePath, 'utf-8');
          
          // Add automation tag
          if (!content.includes('automated')) {
            const labelsMatch = content.match(/labels: \[(.*?)\]/);
            if (labelsMatch) {
              const currentLabels = labelsMatch[1];
              const newLabels = currentLabels ? `${currentLabels}, "automated"` : `"automated"`;
              content = content.replace(labelsMatch[0], `labels: [${newLabels}]`);
            }
            
            // Add automation link
            const automationSection = `
## 🤖 Automation

This task has been automated. See related automation task:
- Type: ${type}
- Template: ${generatedTask.template}
- Generated: ${new Date().toISOString()}

The automation task will handle the implementation of this fix.
`;
            
            content += automationSection;
            fs.writeFileSync(filePath, content, 'utf-8');
            console.log(`🔗 Updated original task: ${originalUuid}`);
          }
        }
      }
    }
  }

  findTaskFile(uuid) {
    // Simple implementation - in production, this would use the kanban index
    try {
      const tasksDir = 'docs/agile/tasks';
      const files = fs.readdirSync(tasksDir).filter(f => f.endsWith('.md'));
      
      for (const file of files) {
        const filePath = path.join(tasksDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        
        if (content.includes(`uuid: "${uuid}"`)) {
          return file;
        }
      }
    } catch (error) {
      console.error('Error finding task file:', error.message);
    }
    
    return `${uuid}.md`;
  }

  async runAutomationCycle(maxBatchSize = 5) {
    console.log('🚀 Starting automation cycle...');
    
    // Step 1: Scan for targets
    const targets = await this.scanForAutomationTargets();
    
    if (targets.length === 0) {
      console.log('✅ No automation targets found');
      return { generated: [], remaining: 0 };
    }
    
    // Step 2: Generate batch tasks
    const generated = await this.generateBatchTasks(maxBatchSize);
    
    // Step 3: Update original tasks
    await this.updateOriginalTasks();
    
    // Step 4: Return results
    const remaining = this.taskQueue.length;
    
    console.log(`🎯 Automation cycle complete:`);
    console.log(`  - Generated: ${generated.length} tasks`);
    console.log(`  - Remaining: ${remaining} targets`);
    
    return { generated, remaining };
  }

  getStats() {
    return {
      ...this.stats,
      total: this.stats.pipelineFixes + this.stats.typeFixes + this.stats.testFixes + this.stats.docFixes,
      queueLength: this.taskQueue.length,
      generatedCount: this.generatedTasks.length
    };
  }
}

async function main() {
  const args = process.argv.slice(2);
  const batchSize = parseInt(args.find(arg => arg.startsWith('--batch-size='))?.split('=')[1] || '5');
  const scanOnly = args.includes('--scan-only');
  
  const generator = new BatchAutomationGenerator();
  
  if (scanOnly) {
    const targets = await generator.scanForAutomationTargets();
    console.log(`📊 Scan complete: ${targets.length} targets found`);
    console.log('📋 Stats:', generator.getStats());
    return;
  }
  
  const results = await generator.runAutomationCycle(batchSize);
  
  if (results.remaining > 0) {
    console.log(`\n🔄 Run again to process remaining ${results.remaining} targets:`);
    console.log(`node scripts/automation-batch-generator.mjs --batch-size ${Math.min(batchSize, results.remaining)}`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { BatchAutomationGenerator };