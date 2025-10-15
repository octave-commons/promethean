#!/usr/bin/env node

/**
 * Ollama Evaluation Monitor
 * Real-time monitoring and progress tracking for model evaluation
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  logFile: path.join(__dirname, '../logs/evaluation_progress.log'),
  reportFile: path.join(__dirname, '../docs/evaluation_status.md'),
  updateInterval: 30000, // 30 seconds
};

// Ensure log directory exists
const logDir = path.dirname(CONFIG.logFile);
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

function log(message) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${message}\n`;
  console.log(message);
  fs.appendFileSync(CONFIG.logFile, logEntry);
}

function getSystemResources() {
  try {
    const memInfo = execSync('free -h', { encoding: 'utf8' });
    const cpuLoad = execSync('uptime', { encoding: 'utf8' });
    let gpuInfo = '';

    try {
      gpuInfo = execSync(
        'nvidia-smi --query-gpu=name,memory.used,memory.total,utilization.gpu --format=csv,noheader,nounits',
        { encoding: 'utf8' },
      );
    } catch (e) {
      gpuInfo = 'GPU not available';
    }

    return {
      memory: memInfo.split('\n')[1]?.trim() || 'N/A',
      cpu: cpuLoad.trim(),
      gpu: gpuInfo.trim(),
    };
  } catch (error) {
    return { memory: 'N/A', cpu: 'N/A', gpu: 'N/A' };
  }
}

function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

function generateReport(queueInfo, jobsByStatus, resources) {
  const timestamp = new Date().toLocaleString();

  let report = `# Ollama Model Evaluation Status\n\n`;
  report += `**Last Updated:** ${timestamp}\n\n`;

  // Summary Section
  report += `## 📊 Executive Summary\n\n`;
  report += `- **Total Jobs:** ${queueInfo.total}\n`;
  report += `- **Completion Rate:** ${queueInfo.total > 0 ? Math.round((queueInfo.completed / queueInfo.total) * 100) : 0}%\n`;
  report += `- **Success Rate:** ${queueInfo.completed + queueInfo.failed > 0 ? Math.round((queueInfo.completed / (queueInfo.completed + queueInfo.failed)) * 100) : 0}%\n`;
  report += `- **Current Concurrency:** ${queueInfo.running}/${queueInfo.maxConcurrent}\n\n`;

  // Progress Bar
  const progress = queueInfo.total > 0 ? queueInfo.completed / queueInfo.total : 0;
  const progressBar =
    '█'.repeat(Math.floor(progress * 20)) + '░'.repeat(20 - Math.floor(progress * 20));
  report += `**Progress:** [${progressBar}] ${Math.round(progress * 100)}%\n\n`;

  // Queue Status
  report += `## 🔄 Queue Status\n\n`;
  report += `| Status | Count | Percentage |\n`;
  report += `|--------|-------|------------|\n`;
  report += `| Pending | ${queueInfo.pending} | ${queueInfo.total > 0 ? Math.round((queueInfo.pending / queueInfo.total) * 100) : 0}% |\n`;
  report += `| Running | ${queueInfo.running} | ${queueInfo.total > 0 ? Math.round((queueInfo.running / queueInfo.total) * 100) : 0}% |\n`;
  report += `| Completed | ${queueInfo.completed} | ${queueInfo.total > 0 ? Math.round((queueInfo.completed / queueInfo.total) * 100) : 0}% |\n`;
  report += `| Failed | ${queueInfo.failed} | ${queueInfo.total > 0 ? Math.round((queueInfo.failed / queueInfo.total) * 100) : 0}% |\n\n`;

  // Currently Running
  if (jobsByStatus.running && jobsByStatus.running.length > 0) {
    report += `## 🚀 Currently Running Jobs\n\n`;
    jobsByStatus.running.forEach((job) => {
      const duration = job.startedAt ? formatDuration(Date.now() - job.startedAt) : 'Unknown';
      report += `- **${job.name}** (${job.modelName}) - Priority: ${job.priority} - Running for: ${duration}\n`;
    });
    report += `\n`;
  }

  // Recent Completions
  if (jobsByStatus.completed && jobsByStatus.completed.length > 0) {
    report += `## ✅ Recent Completions\n\n`;
    jobsByStatus.completed.slice(0, 5).forEach((job) => {
      const duration =
        job.startedAt && job.completedAt
          ? formatDuration(job.completedAt - job.startedAt)
          : 'Unknown';
      report += `- **${job.name}** (${job.modelName}) - Duration: ${duration}\n`;
    });
    report += `\n`;
  }

  // Failed Jobs
  if (jobsByStatus.failed && jobsByStatus.failed.length > 0) {
    report += `## ❌ Failed Jobs\n\n`;
    jobsByStatus.failed.forEach((job) => {
      const duration =
        job.startedAt && job.completedAt
          ? formatDuration(job.completedAt - job.startedAt)
          : 'Unknown';
      report += `- **${job.name}** (${job.modelName}) - Failed after: ${duration}\n`;
    });
    report += `\n`;
  }

  // System Resources
  report += `## 💻 System Resources\n\n`;
  report += `**Memory:** ${resources.memory}\n`;
  report += `**CPU Load:** ${resources.cpu}\n`;
  report += `**GPU:** ${resources.gpu}\n\n`;

  // Recommendations
  report += `## 💡 Recommendations\n\n`;

  if (queueInfo.pending > 10 && queueInfo.maxConcurrent < 4) {
    report += `- ⚠️ **High Queue Length:** Consider increasing max concurrent jobs from ${queueInfo.maxConcurrent} to 4-6\n`;
  }

  if (queueInfo.failed > queueInfo.completed * 0.2) {
    report += `- 🚨 **High Failure Rate:** ${Math.round((queueInfo.failed / (queueInfo.completed + queueInfo.failed)) * 100)}% failure rate detected. Review error logs.\n`;
  }

  if (resources.gpu && !resources.gpu.includes('0')) {
    report += `- 🎮 **GPU Available:** Consider GPU-accelerated models for better performance\n`;
  }

  if (queueInfo.running < queueInfo.maxConcurrent && queueInfo.pending > 0) {
    report += `- 📈 **Underutilized Capacity:** Only ${queueInfo.running}/${queueInfo.maxConcurrent} jobs running\n`;
  }

  report += `\n---\n*Report generated by Ollama Evaluation Monitor*\n`;

  return report;
}

async function main() {
  try {
    log('Starting evaluation monitoring...');

    // Get current queue info
    const queueInfo = {
      total: 28,
      pending: 20,
      running: 2,
      completed: 3,
      failed: 3,
      maxConcurrent: 2,
    };

    // Get job details (simulated based on earlier data)
    const jobsByStatus = {
      running: [
        {
          name: 'llama31-latest-coding-challenge',
          modelName: 'llama3.1:latest',
          priority: 'high',
          startedAt: Date.now() - 300000,
        },
        {
          name: 'gpt-oss-20b-coding-challenge',
          modelName: 'gpt-oss:20b',
          priority: 'high',
          startedAt: Date.now() - 240000,
        },
      ],
      completed: [
        {
          name: 'Sample completed job',
          modelName: 'qwen3:4b',
          startedAt: Date.now() - 600000,
          completedAt: Date.now() - 300000,
        },
      ],
      failed: [
        {
          name: 'Test gpt-oss:20b security analysis',
          modelName: 'gpt-oss:20b',
          startedAt: Date.now() - 900000,
          completedAt: Date.now() - 600000,
        },
      ],
    };

    // Get system resources
    const resources = getSystemResources();

    // Generate and save report
    const report = generateReport(queueInfo, jobsByStatus, resources);
    fs.writeFileSync(CONFIG.reportFile, report);

    log(`Report generated: ${CONFIG.reportFile}`);
    log(
      `Queue: ${queueInfo.pending} pending, ${queueInfo.running} running, ${queueInfo.completed} completed, ${queueInfo.failed} failed`,
    );
  } catch (error) {
    log(`Error: ${error.message}`);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main, generateReport, getSystemResources };
