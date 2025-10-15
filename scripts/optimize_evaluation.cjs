#!/usr/bin/env node

/**
 * Ollama Evaluation Optimizer
 * Automated optimization for large-scale model evaluation
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  evaluationPlan: path.join(__dirname, '../docs/llm_model_evaluation_plan.md'),
  optimizedJobs: path.join(__dirname, '../docs/optimized_evaluation_jobs.md'),
  scriptsDir: path.join(__dirname, '../scripts'),
  logsDir: path.join(__dirname, '../logs'),
};

// Model tiers based on size and capabilities
const MODEL_TIERS = {
  small: ['gemma2:2b', 'qwen2.5:3b-instruct', 'llama3.2:latest', 'qwen3:4b'],
  medium: [
    'llama3.1:8b',
    'qwen2.5:7b',
    'deepseek-r1:latest',
    'qwen3:latest',
    'qwen2.5-coder:7b-instruct',
    'promethean-planner:latest',
  ],
  large: ['qwen3:14b', 'gpt-oss:20b', 'gpt-oss:120b-cloud'],
};

// Task priorities
const TASK_PRIORITIES = {
  coding_challenge: 'urgent',
  security_analysis: 'urgent',
  mathematical_reasoning: 'high',
  reasoning_problem: 'high',
  algorithm_design: 'high',
  debugging: 'medium',
  creative_writing: 'medium',
  data_analysis: 'medium',
  code_review: 'low',
  documentation_generation: 'low',
};

// Timeout configurations (in milliseconds)
const TIMEOUTS = {
  small: 5 * 60 * 1000, // 5 minutes
  medium: 10 * 60 * 1000, // 10 minutes
  large: 30 * 60 * 1000, // 30 minutes
};

function getModelTier(modelName) {
  for (const [tier, models] of Object.entries(MODEL_TIERS)) {
    if (models.some((model) => modelName.includes(model))) {
      return tier;
    }
  }
  return 'medium'; // Default fallback
}

function getTaskPriority(taskName) {
  for (const [task, priority] of Object.entries(TASK_PRIORITIES)) {
    if (taskName.includes(task)) {
      return priority;
    }
  }
  return 'medium'; // Default fallback
}

function generateOptimizedJobs() {
  const jobs = [];

  // Generate optimized job combinations
  const tasks = [
    'coding_challenge',
    'reasoning_problem',
    'creative_writing',
    'mathematical_reasoning',
    'security_analysis',
    'code_review',
    'documentation_generation',
    'debugging',
    'algorithm_design',
    'data_analysis',
  ];

  const allModels = [...MODEL_TIERS.small, ...MODEL_TIERS.medium, ...MODEL_TIERS.large];

  // Create jobs with optimized priorities and timeouts
  tasks.forEach((task) => {
    allModels.forEach((model) => {
      const tier = getModelTier(model);
      const priority = getTaskPriority(task);
      const timeout = TIMEOUTS[tier];

      jobs.push({
        name: `${model}-${task}`,
        modelName: model,
        taskType: task,
        tier: tier,
        priority: priority,
        timeout: timeout,
        estimatedDuration: tier === 'small' ? '2-5m' : tier === 'medium' ? '5-15m' : '15-30m',
        resourceWeight: tier === 'small' ? 1 : tier === 'medium' ? 2 : 4,
      });
    });
  });

  // Sort by priority (urgent first) then by resource weight (small models first)
  jobs.sort((a, b) => {
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return a.resourceWeight - b.resourceWeight;
  });

  return jobs;
}

function generateBatchPlan(jobs) {
  const batches = [];
  const maxConcurrent = 6; // Recommended concurrency
  const maxLargeModels = 2;
  const maxSmallModels = 4;

  let currentBatch = [];
  let currentLargeModels = 0;
  let currentSmallModels = 0;

  jobs.forEach((job) => {
    const canAdd =
      currentBatch.length < maxConcurrent &&
      (job.tier === 'large' ? currentLargeModels < maxLargeModels : true) &&
      (job.tier === 'small' ? currentSmallModels < maxSmallModels : true);

    if (!canAdd && currentBatch.length > 0) {
      batches.push([...currentBatch]);
      currentBatch = [];
      currentLargeModels = 0;
      currentSmallModels = 0;
    }

    currentBatch.push(job);
    if (job.tier === 'large') currentLargeModels++;
    if (job.tier === 'small') currentSmallModels++;
  });

  if (currentBatch.length > 0) {
    batches.push(currentBatch);
  }

  return batches;
}

function generateOptimizationReport() {
  const jobs = generateOptimizedJobs();
  const batches = generateBatchPlan(jobs);

  let report = `# Optimized Ollama Evaluation Plan\n\n`;
  report += `**Generated:** ${new Date().toLocaleString()}\n\n`;

  // Executive Summary
  report += `## 📊 Executive Summary\n\n`;
  report += `- **Total Jobs:** ${jobs.length}\n`;
  report += `- **Optimized Batches:** ${batches.length}\n`;
  report += `- **Estimated Duration:** ${batches.length * 15}-${batches.length * 30} minutes\n`;
  report += `- **Max Concurrency:** 6 jobs (vs current 2)\n`;
  report += `- **Expected Improvement:** 3x faster evaluation\n\n`;

  // Model Distribution
  report += `## 🎯 Model Distribution\n\n`;
  report += `| Tier | Models | Count | Percentage |\n`;
  report += `|------|--------|-------|------------|\n`;

  Object.entries(MODEL_TIERS).forEach(([tier, models]) => {
    const count = jobs.filter((job) => job.tier === tier).length;
    const percentage = Math.round((count / jobs.length) * 100);
    report += `| ${tier.charAt(0).toUpperCase() + tier.slice(1)} | ${models.length} | ${count} | ${percentage}% |\n`;
  });
  report += `\n`;

  // Priority Distribution
  report += `## ⚡ Priority Distribution\n\n`;
  const priorityCounts = {};
  jobs.forEach((job) => {
    priorityCounts[job.priority] = (priorityCounts[job.priority] || 0) + 1;
  });

  report += `| Priority | Jobs | Percentage |\n`;
  report += `|----------|------|------------|\n`;
  Object.entries(priorityCounts).forEach(([priority, count]) => {
    const percentage = Math.round((count / jobs.length) * 100);
    report += `| ${priority.charAt(0).toUpperCase() + priority.slice(1)} | ${count} | ${percentage}% |\n`;
  });
  report += `\n`;

  // Batch Execution Plan
  report += `## 🚀 Batch Execution Plan\n\n`;
  batches.forEach((batch, index) => {
    report += `### Batch ${index + 1} (${batch.length} jobs)\n\n`;
    report += `**Composition:** `;
    const composition = {};
    batch.forEach((job) => {
      composition[job.tier] = (composition[job.tier] || 0) + 1;
    });
    Object.entries(composition).forEach(([tier, count]) => {
      report += `${count} ${tier}, `;
    });
    report = report.slice(0, -2); // Remove trailing comma
    report += `\n\n`;

    report += `| Job | Model | Task | Priority | Est. Duration |\n`;
    report += `|-----|-------|------|----------|---------------|\n`;

    batch.forEach((job) => {
      report += `| ${job.name} | ${job.modelName} | ${job.taskType} | ${job.priority} | ${job.estimatedDuration} |\n`;
    });
    report += `\n`;
  });

  // Optimization Recommendations
  report += `## 💡 Optimization Recommendations\n\n`;
  report += `### 1. Concurrency Improvements\n\n`;
  report += `- **Current:** 2 concurrent jobs\n`;
  report += `- **Recommended:** 6 concurrent jobs (4 small + 2 medium/large)\n`;
  report += `- **Expected Speedup:** 3x faster completion\n\n`;

  report += `### 2. Resource Management\n\n`;
  report += `- **Small Models (2B-4B):** 5-minute timeout, 4 concurrent max\n`;
  report += `- **Medium Models (7B-8B):** 10-minute timeout, 2 concurrent max\n`;
  report += `- **Large Models (14B+):** 30-minute timeout, 2 concurrent max\n\n`;

  report += `### 3. Priority-Based Processing\n\n`;
  report += `- **Urgent:** Coding challenges, security analysis\n`;
  report += `- **High:** Mathematical reasoning, algorithm design\n`;
  report += `- **Medium:** Creative writing, debugging\n`;
  report += `- **Low:** Documentation, code review\n\n`;

  report += `### 4. Monitoring & Alerting\n\n`;
  report += `- **Real-time monitoring:** Every 30 seconds\n`;
  report += `- **Failure detection:** Auto-retry for failed jobs\n`;
  report += `- **Resource tracking:** Memory, CPU, GPU utilization\n`;
  report += `- **Progress reporting:** Live dashboard updates\n\n`;

  // Implementation Steps
  report += `## 🔧 Implementation Steps\n\n`;
  report += `1. **Immediate Actions**\n`;
  report += `   - Increase max concurrent jobs to 6\n`;
  report += `   - Implement priority-based job scheduling\n`;
  report += `   - Set up monitoring dashboard\n\n`;

  report += `2. **Short-term Optimizations** (Next 1-2 hours)\n`;
  report += `   - Implement retry logic for failed jobs\n`;
  report += `   - Add timeout configurations per model tier\n`;
  report += `   - Create batch execution scripts\n\n`;

  report += `3. **Long-term Improvements** (Next evaluation cycle)\n`;
  report += `   - Implement adaptive concurrency based on system load\n`;
  report += `   - Add GPU acceleration for supported models\n`;
  report += `   - Create automated result analysis pipeline\n\n`;

  report += `---\n`;
  report += `*Generated by Ollama Evaluation Optimizer*\n`;

  return report;
}

function createExecutionScripts() {
  // Create batch execution script
  const batchScript = `#!/bin/bash
# Ollama Batch Execution Script
# Execute optimized batches of model evaluations

set -e

BATCH_ID=\${1:-1}
MAX_RETRIES=3
RETRY_DELAY=60

echo "Starting batch execution for batch \$BATCH_ID"

# Function to execute job with retry
execute_job() {
  local job_name=\$1
  local model=\$2
  local task=\$3
  local priority=\$4
  local timeout=\$5
  
  echo "Executing: \$job_name (\$model) - Priority: \$priority"
  
  for ((i=1; i<=MAX_RETRIES; i++)); do
    if ollama-queue_submitJob \\
      --jobName "\$job_name" \\
      --modelName "\$model" \\
      --jobType "generate" \\
      --priority "\$priority" \\
      --timeout \$timeout; then
      echo "✅ Job submitted successfully: \$job_name"
      return 0
    else
      echo "❌ Job submission failed (attempt \$i/\$MAX_RETRIES): \$job_name"
      if [ \$i -lt \$MAX_RETRIES ]; then
        echo "Waiting \$RETRY_DELAY seconds before retry..."
        sleep \$RETRY_DELAY
      fi
    fi
  done
  
  echo "🚨 Job failed after \$MAX_RETRIES attempts: \$job_name"
  return 1
}

# Load batch configuration
BATCH_CONFIG="scripts/batch_\${BATCH_ID}.json"
if [ ! -f "\$BATCH_CONFIG" ]; then
  echo "❌ Batch configuration not found: \$BATCH_CONFIG"
  exit 1
fi

# Execute jobs in batch (parallel where appropriate)
echo "Loading batch configuration from \$BATCH_CONFIG"
# Add actual job execution logic here based on batch config

echo "Batch \$BATCH_ID execution completed"
`;

  fs.writeFileSync(path.join(CONFIG.scriptsDir, 'execute_batch.sh'), batchScript);
  fs.chmodSync(path.join(CONFIG.scriptsDir, 'execute_batch.sh'), '755');

  // Create monitoring script
  const monitorScript = `#!/bin/bash
# Continuous monitoring for evaluation progress

set -e

INTERVAL=30
LOG_FILE="logs/evaluation_monitor.log"

echo "Starting continuous monitoring (interval: \$INTERVAL seconds)"

while true; do
  echo "\\n=== \$(date) ===" >> \$LOG_FILE
  
  # Check queue status
  echo "Queue Status:" >> \$LOG_FILE
  ollama-queue_getQueueInfo >> \$LOG_FILE 2>&1
  
  # Check system resources
  echo "\\nSystem Resources:" >> \$LOG_FILE
  free -h >> \$LOG_FILE
  uptime >> \$LOG_FILE
  
  if command -v nvidia-smi &> /dev/null; then
    echo "\\nGPU Status:" >> \$LOG_FILE
    nvidia-smi --query-gpu=utilization.gpu,memory.used,memory.total --format=csv,noheader >> \$LOG_FILE
  fi
  
  # Generate status report
  node scripts/monitor_evaluation.cjs
  
  sleep \$INTERVAL
done
`;

  fs.writeFileSync(path.join(CONFIG.scriptsDir, 'continuous_monitor.sh'), monitorScript);
  fs.chmodSync(path.join(CONFIG.scriptsDir, 'continuous_monitor.sh'), '755');
}

function main() {
  try {
    console.log('🚀 Generating Ollama evaluation optimization plan...');

    // Ensure directories exist
    [CONFIG.scriptsDir, CONFIG.logsDir].forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });

    // Generate optimization report
    const report = generateOptimizationReport();
    fs.writeFileSync(CONFIG.optimizedJobs, report);

    // Create execution scripts
    createExecutionScripts();

    console.log('✅ Optimization plan generated successfully!');
    console.log(`📄 Report: ${CONFIG.optimizedJobs}`);
    console.log('🔧 Execution scripts created in scripts/');
    console.log('\n📋 Next steps:');
    console.log('1. Review the optimization plan');
    console.log('2. Increase max concurrent jobs to 6');
    console.log('3. Implement priority-based scheduling');
    console.log('4. Start continuous monitoring');
  } catch (error) {
    console.error('❌ Error generating optimization plan:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main, generateOptimizationReport, createExecutionScripts };
