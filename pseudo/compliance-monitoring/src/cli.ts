#!/usr/bin/env node

/**
 * CLI for the Compliance Monitoring System
 * 
 * Provides command-line interface for managing and monitoring
 * the automated compliance monitoring system.
 */

import { program } from 'commander';
import winston from 'winston';
import { ComplianceMonitoringSystem, getDefaultConfig } from './index.js';
import type { ComplianceConfig } from './types.js';

// Setup logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.colorize(),
    winston.format.simple()
  ),
  transports: [
    new winston.transports.Console()
  ]
});

// CLI program setup
program
  .name('compliance-monitor')
  .description('Automated Compliance Monitoring System CLI')
  .version('1.0.0');

// Start command
program
  .command('start')
  .description('Start the compliance monitoring system')
  .option('-p, --port <number>', 'Dashboard server port', '3001')
  .option('-c, --config <path>', 'Configuration file path')
  .option('--scan-interval <seconds>', 'Scan interval in seconds', '300')
  .option('--email', 'Enable email alerts')
  .option('--slack', 'Enable Slack alerts')
  .option('--webhook <url>', 'Enable webhook alerts')
  .action(async (options) => {
    try {
      let config = getDefaultConfig();
      
      // Load custom config if provided
      if (options.config) {
        const fs = await import('fs/promises');
        const configContent = await fs.readFile(options.config, 'utf-8');
        config = { ...config, ...JSON.parse(configContent) };
      }
      
      // Override with CLI options
      if (options.scanInterval) {
        config.scanInterval = parseInt(options.scanInterval);
      }
      
      if (options.email) {
        config.alerts.email.enabled = true;
      }
      
      if (options.slack) {
        config.alerts.slack.enabled = true;
      }
      
      if (options.webhook) {
        config.alerts.webhook.enabled = true;
        config.alerts.webhook.url = options.webhook;
      }
      
      // Create and start system
      const system = new ComplianceMonitoringSystem({
        config,
        port: parseInt(options.port),
        logger
      });
      
      logger.info('Starting compliance monitoring system...');
      await system.start();
      
      logger.info(`Dashboard available at http://localhost:${options.port}`);
      logger.info('Press Ctrl+C to stop');
      
      // Handle graceful shutdown
      process.on('SIGINT', async () => {
        logger.info('Shutting down...');
        await system.stop();
        process.exit(0);
      });
      
      process.on('SIGTERM', async () => {
        logger.info('Shutting down...');
        await system.stop();
        process.exit(0);
      });
      
    } catch (error) {
      logger.error('Failed to start compliance monitoring system:', error);
      process.exit(1);
    }
  });

// Status command
program
  .command('status')
  .description('Get system status')
  .option('-c, --config <path>', 'Configuration file path')
  .action(async (options) => {
    try {
      const config = await loadConfig(options.config);
      const system = new ComplianceMonitoringSystem({ config, logger });
      
      const status = await system.getStatus();
      
      console.log('\n📊 Compliance Monitoring System Status');
      console.log('=====================================');
      console.log(`Running: ${status.running ? '✅ Yes' : '❌ No'}`);
      console.log(`Dashboard Clients: ${status.components.dashboard.connectedClients}`);
      console.log(`Alert Queue: ${status.components.alerts.queueLength}`);
      console.log(`Last Scan: ${status.lastScan?.toLocaleString() || 'Never'}`);
      
      if (status.metrics) {
        console.log('\n📈 Metrics');
        console.log('----------');
        console.log(`Overall Compliance: ${status.metrics.overallCompliance.toFixed(1)}%`);
        console.log(`WIP Compliance: ${status.metrics.wipCompliance.toFixed(1)}%`);
        console.log(`Process Compliance: ${status.metrics.processCompliance.toFixed(1)}%`);
        console.log(`Security Compliance: ${status.metrics.securityCompliance.toFixed(1)}%`);
      }
      
    } catch (error) {
      logger.error('Failed to get status:', error);
      process.exit(1);
    }
  });

// Scan command
program
  .command('scan')
  .description('Trigger a manual compliance scan')
  .option('-c, --config <path>', 'Configuration file path')
  .option('--json', 'Output results as JSON')
  .action(async (options) => {
    try {
      const config = await loadConfig(options.config);
      const system = new ComplianceMonitoringSystem({ config, logger });
      
      logger.info('Starting manual scan...');
      const result = await system.triggerManualScan();
      
      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log('\n🔍 Compliance Scan Results');
        console.log('===========================');
        console.log(`Scan ID: ${result.scanId}`);
        console.log(`Duration: ${result.duration}ms`);
        console.log(`Events Detected: ${result.events.length}`);
        
        if (result.events.length > 0) {
          console.log('\n🚨 Violations:');
          result.events.forEach((event, index) => {
            console.log(`${index + 1}. [${event.severity}] ${event.description}`);
            if (event.taskTitle) {
              console.log(`   Task: ${event.taskTitle}`);
            }
            if (event.actionRequired) {
              console.log(`   Action: ${event.actionRequired}`);
            }
            console.log('');
          });
        } else {
          console.log('\n✅ No violations detected');
        }
        
        console.log('\n📊 Metrics:');
        console.log(`Overall Compliance: ${result.metrics.overallCompliance.toFixed(1)}%`);
        console.log(`WIP Compliance: ${result.metrics.wipCompliance.toFixed(1)}%`);
        console.log(`Process Compliance: ${result.metrics.processCompliance.toFixed(1)}%`);
        console.log(`Security Compliance: ${result.metrics.securityCompliance.toFixed(1)}%`);
      }
      
    } catch (error) {
      logger.error('Scan failed:', error);
      process.exit(1);
    }
  });

// Report command
program
  .command('report')
  .description('Generate compliance report')
  .option('-c, --config <path>', 'Configuration file path')
  .option('-t, --type <type>', 'Report type: daily, weekly, monthly', 'daily')
  .option('--json', 'Output results as JSON')
  .action(async (options) => {
    try {
      const config = await loadConfig(options.config);
      const system = new ComplianceMonitoringSystem({ config, logger });
      
      logger.info(`Generating ${options.type} report...`);
      const report = await system.generateReport(options.type);
      
      if (options.json) {
        console.log(JSON.stringify(report, null, 2));
      } else {
        console.log('\n📋 Compliance Report');
        console.log('====================');
        console.log(`Report ID: ${report.id}`);
        console.log(`Type: ${report.type}`);
        console.log(`Generated: ${report.generatedAt.toLocaleString()}`);
        
        console.log('\n📊 Summary:');
        console.log(`Total Events: ${report.summary.totalEvents}`);
        console.log(`Critical Events: ${report.summary.criticalEvents}`);
        console.log(`Resolved Events: ${report.summary.resolvedEvents}`);
        console.log(`Compliance Score: ${report.summary.complianceScore}%`);
        
        if (report.recommendations.length > 0) {
          console.log('\n💡 Recommendations:');
          report.recommendations.forEach((rec, index) => {
            console.log(`${index + 1}. ${rec}`);
          });
        }
      }
      
    } catch (error) {
      logger.error('Report generation failed:', error);
      process.exit(1);
    }
  });

// Config command
program
  .command('config')
  .description('Manage configuration')
  .option('--generate', 'Generate default configuration file')
  .option('--output <path>', 'Output path for generated config', './compliance-config.json')
  .action(async (options) => {
    try {
      if (options.generate) {
        const config = getDefaultConfig();
        const fs = await import('fs/promises');
        
        await fs.writeFile(options.output, JSON.stringify(config, null, 2));
        logger.info(`Default configuration generated: ${options.output}`);
        
        console.log('\n⚙️  Default Configuration Generated');
        console.log('===================================');
        console.log(`File: ${options.output}`);
        console.log('\nEdit this file to customize your compliance monitoring settings.');
        console.log('Key settings to configure:');
        console.log('- scanInterval: How often to scan (seconds)');
        console.log('- alerts.email.recipients: Email addresses for alerts');
        console.log('- alerts.slack.webhook: Slack webhook URL');
        console.log('- alerts.slack.channel: Slack channel for notifications');
        console.log('- security.p0RequiredStatuses: Valid columns for P0 tasks');
        console.log('- wipThresholds: WIP limit warning thresholds');
      } else {
        console.log('Use --generate to create a default configuration file');
      }
      
    } catch (error) {
      logger.error('Config command failed:', error);
      process.exit(1);
    }
  });

// Events command
program
  .command('events')
  .description('List recent compliance events')
  .option('-c, --config <path>', 'Configuration file path')
  .option('--limit <number>', 'Number of events to show', '20')
  .option('--severity <severity>', 'Filter by severity (CRITICAL,HIGH,MEDIUM,LOW)')
  .option('--category <category>', 'Filter by category (WIP,PROCESS,SECURITY,PERFORMANCE,QUALITY)')
  .option('--resolved', 'Show only resolved events')
  .option('--unresolved', 'Show only unresolved events')
  .option('--json', 'Output results as JSON')
  .action(async (options) => {
    try {
      const config = await loadConfig(options.config);
      const system = new ComplianceMonitoringSystem({ config, logger });
      
      const filter: any = {
        limit: parseInt(options.limit)
      };
      
      if (options.severity) {
        filter.severity = options.severity.split(',');
      }
      
      if (options.category) {
        filter.category = options.category.split(',');
      }
      
      if (options.resolved) {
        filter.resolved = true;
      } else if (options.unresolved) {
        filter.resolved = false;
      }
      
      const events = await system.getEvents(filter);
      
      if (options.json) {
        console.log(JSON.stringify(events, null, 2));
      } else {
        console.log('\n📅 Recent Compliance Events');
        console.log('===========================');
        
        if (events.length === 0) {
          console.log('No events found matching the criteria');
        } else {
          events.forEach((event, index) => {
            const status = event.resolved ? '✅' : '❌';
            const severity = event.severity.padEnd(8);
            const category = event.category.padEnd(12);
            
            console.log(`${index + 1}. ${status} [${severity}] ${category} ${event.description}`);
            console.log(`   Time: ${event.timestamp.toLocaleString()}`);
            
            if (event.taskTitle) {
              console.log(`   Task: ${event.taskTitle}`);
            }
            
            if (event.column) {
              console.log(`   Column: ${event.column}`);
            }
            
            if (event.actionRequired) {
              console.log(`   Action: ${event.actionRequired}`);
            }
            
            if (event.resolved && event.resolutionNotes) {
              console.log(`   Resolution: ${event.resolutionNotes}`);
            }
            
            console.log('');
          });
        }
      }
      
    } catch (error) {
      logger.error('Events command failed:', error);
      process.exit(1);
    }
  });

/**
 * Load configuration from file or return default
 */
async function loadConfig(configPath?: string): Promise<ComplianceConfig> {
  if (!configPath) {
    return getDefaultConfig();
  }
  
  try {
    const fs = await import('fs/promises');
    const configContent = await fs.readFile(configPath, 'utf-8');
    return { ...getDefaultConfig(), ...JSON.parse(configContent) };
  } catch (error) {
    logger.warn(`Failed to load config from ${configPath}, using defaults`);
    return getDefaultConfig();
  }
}

// Parse command line arguments
program.parse();