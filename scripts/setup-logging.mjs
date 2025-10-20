#!/usr/bin/env node

/**
 * Logging Setup Script for Promethean PM2 Ecosystem
 * 
 * This script sets up comprehensive logging infrastructure for the PM2 ecosystem,
 * including log rotation, structured logging, and monitoring dashboards.
 */

import { mkdirSync, existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = dirname(__dirname);

const LOG_CONFIG = {
  baseDir: join(PROJECT_ROOT, "logs"),
  archiveDir: join(PROJECT_ROOT, "logs", "archive"),
  maxFiles: 10,
  maxSize: "10M",
  dateFormat: "YYYY-MM-DD HH:mm:ss Z",
  
  // Log levels and their priorities
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
    trace: 4
  },
  
  // Specific log configurations for different process types
  processConfigs: {
    "nx-watcher": {
      level: "info",
      maxSize: "50M",
      maxFiles: 5
    },
    "dev-*": {
      level: "debug",
      maxSize: "20M", 
      maxFiles: 3
    },
    "autocommit": {
      level: "info",
      maxSize: "10M",
      maxFiles: 5
    },
    "health-monitor": {
      level: "info",
      maxSize: "5M",
      maxFiles: 7
    },
    "heartbeat": {
      level: "info", 
      maxSize: "5M",
      maxFiles: 7
    },
    "message-broker": {
      level: "info",
      maxSize: "20M",
      maxFiles: 5
    }
  }
};

// Create log directories
function createLogDirectories() {
  const dirs = [
    LOG_CONFIG.baseDir,
    LOG_CONFIG.archiveDir,
    join(LOG_CONFIG.baseDir, "pm2"),
    join(LOG_CONFIG.baseDir, "nx"),
    join(LOG_CONFIG.baseDir, "services"),
    join(LOG_CONFIG.baseDir, "apps")
  ];
  
  dirs.forEach(dir => {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
      console.log(`📁 Created log directory: ${dir}`);
    }
  });
}

// Create PM2 log configuration
function createPM2LogConfig() {
  const config = {
    error_file: join(LOG_CONFIG.baseDir, "pm2", "pm2-error.log"),
    out_file: join(LOG_CONFIG.baseDir, "pm2", "pm2-out.log"),
    log_file: join(LOG_CONFIG.baseDir, "pm2", "pm2-combined.log"),
    log_date_format: LOG_CONFIG.dateFormat,
    merge_logs: true,
    max_memory_restart: "1G"
  };
  
  const configPath = join(PROJECT_ROOT, "pm2-log-config.json");
  writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log(`📝 Created PM2 log config: ${configPath}`);
}

// Create logrotate configuration
function createLogrotateConfig() {
  const config = `${LOG_CONFIG.baseDir}/*.log {
    daily
    missingok
    rotate ${LOG_CONFIG.maxFiles}
    compress
    delaycompress
    notifempty
    create 644 $USER $USER
    maxsize ${LOG_CONFIG.maxSize}
    
    # Specific configurations for different log types
    ${LOG_CONFIG.baseDir}/nx-watcher*.log {
        daily
        rotate 5
        maxsize 50M
        compress
        delaycompress
        missingok
        notifempty
    }
    
    ${LOG_CONFIG.baseDir}/dev-*.log {
        daily
        rotate 3
        maxsize 20M
        compress
        delaycompress
        missingok
        notifempty
    }
    
    ${LOG_CONFIG.baseDir}/health-*.log {
        daily
        rotate 7
        maxsize 5M
        compress
        delaycompress
        missingok
        notifempty
    }
    
    # Post-rotate script to notify PM2 if needed
    postrotate
        # Reload PM2 processes to start writing to new log files
        pm2 reload all > /dev/null 2>&1 || true
    endscript
}`;

  const configPath = join(PROJECT_ROOT, "logrotate.conf");
  writeFileSync(configPath, config);
  console.log(`📝 Created logrotate config: ${configPath}`);
  
  // Create installation script
  const installScript = `#!/bin/bash
# Install logrotate configuration for Promethean

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOGROTATE_CONFIG="$SCRIPT_DIR/logrotate.conf"

if [ "$EUID" -ne 0 ]; then
    echo "This script must be run as root to install logrotate configuration"
    echo "Try: sudo $0"
    exit 1
fi

# Install logrotate configuration
cp "$LOGROTATE_CONFIG" /etc/logrotate.d/promethean
chmod 644 /etc/logrotate.d/promethean

echo "✅ Logrotate configuration installed successfully"
echo "📋 Configuration file: /etc/logrotate.d/promethean"
echo "🔍 Test configuration: logrotate -d /etc/logrotate.d/promethean"
echo "🔄 Force rotation: logrotate -f /etc/logrotate.d/promethean"
`;

  const installPath = join(PROJECT_ROOT, "scripts", "install-logrotate.sh");
  writeFileSync(installPath, installScript);
  // Make it executable
  try {
    const { execSync } = await import("node:child_process");
    execSync(`chmod +x "${installPath}"`);
  } catch (e) {
    console.warn("Could not make install script executable");
  }
  console.log(`📝 Created logrotate install script: ${installPath}`);
}

// Create Winston-based logging utility
function createLoggingUtility() {
  const loggingCode = `/**
 * Centralized Logging Utility for Promethean
 * Provides structured logging with multiple transports and log levels
 */

import winston from "winston";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = dirname(__dirname);

// Custom format for structured logging
const customFormat = winston.format.combine(
  winston.format.timestamp({
    format: "YYYY-MM-DD HH:mm:ss Z"
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
    const logEntry = {
      timestamp,
      level: level.toUpperCase(),
      service: service || process.env.PM2_PROCESS_NAME || "unknown",
      message,
      ...meta
    };
    return JSON.stringify(logEntry);
  })
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: "HH:mm:ss"
  }),
  winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
    const serviceName = service || process.env.PM2_PROCESS_NAME || "unknown";
    const metaStr = Object.keys(meta).length > 0 ? \` \${JSON.stringify(meta)}\` : "";
    return \`[\${timestamp}] [\${serviceName}] \${level}: \${message}\${metaStr}\`;
  })
);

// Create logger factory
export function createLogger(options = {}) {
  const {
    service = process.env.PM2_PROCESS_NAME || "promethean",
    level = process.env.LOG_LEVEL || "info",
    enableConsole = process.env.NODE_ENV === "development",
    logDir = join(PROJECT_ROOT, "logs")
  } = options;

  const transports = [];

  // File transport for all logs
  transports.push(
    new winston.transports.File({
      filename: join(logDir, \`\${service}-combined.log\`),
      format: customFormat,
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5
    })
  );

  // Separate error file
  transports.push(
    new winston.transports.File({
      filename: join(logDir, \`\${service}-error.log\`),
      level: "error",
      format: customFormat,
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5
    })
  );

  // Console transport for development
  if (enableConsole) {
    transports.push(
      new winston.transports.Console({
        format: consoleFormat
      })
    );
  }

  return winston.createLogger({
    level,
    defaultMeta: { service },
    transports,
    exitOnError: false
  });
}

// Default logger instance
export const logger = createLogger();

// Convenience functions
export const logError = (message, meta = {}) => logger.error(message, meta);
export const logWarn = (message, meta = {}) => logger.warn(message, meta);
export const logInfo = (message, meta = {}) => logger.info(message, meta);
export const logDebug = (message, meta = {}) => logger.debug(message, meta);

// Performance logging
export function logPerformance(operation, startTime, meta = {}) {
  const duration = Date.now() - startTime;
  logger.info(\`Performance: \${operation} completed in \${duration}ms\`, {
    operation,
    duration,
    ...meta
  });
}

// Error logging with stack trace
export function logErrorWithStack(error, context = {}) {
  logger.error(\`Error: \${error.message}\`, {
    stack: error.stack,
    context,
    name: error.name
  });
}

// Request logging for HTTP services
export function logRequest(req, res, responseTime) {
  logger.info("HTTP Request", {
    method: req.method,
    url: req.url,
    statusCode: res.statusCode,
    responseTime,
    userAgent: req.get("User-Agent"),
    ip: req.ip || req.connection.remoteAddress
  });
}

export default logger;
`;

  const loggerPath = join(PROJECT_ROOT, "shared", "js", "logger.js");
  writeFileSync(loggerPath, loggingCode);
  console.log(`📝 Created logging utility: ${loggerPath}`);
}

// Create log monitoring dashboard
function createLogMonitor() {
  const monitorCode = `/**
 * Log Monitoring Dashboard for Promethean
 * Provides real-time log viewing and filtering capabilities
 */

import express from "express";
import { createReadStream, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = dirname(__dirname, "..");

const app = express();
const PORT = process.env.LOG_MONITOR_PORT || 3099;
const LOG_DIR = join(PROJECT_ROOT, "logs");

app.use(express.static(join(__dirname, "public")));
app.use(express.json());

// Get list of available log files
app.get("/api/logs", (req, res) => {
  try {
    const files = readdirSync(LOG_DIR)
      .filter(file => file.endsWith(".log"))
      .map(file => {
        const filePath = join(LOG_DIR, file);
        const stats = statSync(filePath);
        return {
          name: file,
          size: stats.size,
          modified: stats.mtime,
          url: \`/api/logs/\${file}\`
        };
      })
      .sort((a, b) => b.modified - a.modified);
    
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Stream log file content
app.get("/api/logs/:filename", (req, res) => {
  const { filename } = req.params;
  const filePath = join(LOG_DIR, filename);
  
  // Security check - prevent directory traversal
  if (!filename.startsWith("..") && !filename.includes("/")) {
    res.setHeader("Content-Type", "text/plain");
    createReadStream(filePath).pipe(res);
  } else {
    res.status(403).json({ error: "Access denied" });
  }
});

// Search logs
app.post("/api/logs/search", (req, res) => {
  const { query, files = [], limit = 100 } = req.body;
  
  // This is a simplified implementation
  // In production, you'd want to use a proper log indexing solution
  res.json({
    message: "Log search functionality",
    query,
    files,
    limit,
    results: []
  });
});

// Serve basic HTML interface
app.get("/", (req, res) => {
  res.send(\`
<!DOCTYPE html>
<html>
<head>
    <title>Promethean Log Monitor</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .log-file { border: 1px solid #ccc; margin: 10px 0; padding: 10px; }
        .log-content { background: #f5f5f5; padding: 10px; font-family: monospace; white-space: pre-wrap; }
        .search-box { margin: 20px 0; }
        .search-box input { width: 300px; padding: 5px; }
        .search-box button { padding: 5px 10px; }
    </style>
</head>
<body>
    <h1>Promethean Log Monitor</h1>
    
    <div class="search-box">
        <input type="text" id="searchInput" placeholder="Search logs...">
        <button onclick="searchLogs()">Search</button>
    </div>
    
    <div id="logFiles">
        <h2>Log Files</h2>
        <div id="logList"></div>
    </div>
    
    <div id="logContent">
        <h2>Log Content</h2>
        <div id="logDisplay" class="log-content"></div>
    </div>
    
    <script>
        async function loadLogFiles() {
            try {
                const response = await fetch('/api/logs');
                const files = await response.json();
                const logList = document.getElementById('logList');
                
                logList.innerHTML = files.map(file => \`
                    <div class="log-file">
                        <h3>\${file.name}</h3>
                        <p>Size: \${file.size} bytes | Modified: \${new Date(file.modified).toLocaleString()}</p>
                        <button onclick="viewLog('\${file.name}')">View Log</button>
                    </div>
                \`).join('');
            } catch (error) {
                console.error('Failed to load log files:', error);
            }
        }
        
        async function viewLog(filename) {
            try {
                const response = await fetch(\`/api/logs/\${filename}\`);
                const content = await response.text();
                document.getElementById('logDisplay').textContent = content;
            } catch (error) {
                console.error('Failed to load log:', error);
            }
        }
        
        async function searchLogs() {
            const query = document.getElementById('searchInput').value;
            // Implement search functionality
            console.log('Searching for:', query);
        }
        
        // Load log files on page load
        loadLogFiles();
        
        // Auto-refresh every 30 seconds
        setInterval(loadLogFiles, 30000);
    </script>
</body>
</html>
  \`);
});

app.listen(PORT, () => {
  console.log(\`📊 Log monitor running on http://localhost:\${PORT}\`);
});

export default app;
`;

  const monitorPath = join(PROJECT_ROOT, "scripts", "log-monitor.mjs");
  writeFileSync(monitorPath, monitorCode);
  console.log(`📝 Created log monitor: ${monitorPath}`);
}

// Main execution
function main() {
  console.log("🔧 Setting up logging infrastructure for Promethean...");
  
  createLogDirectories();
  createPM2LogConfig();
  createLogrotateConfig();
  createLoggingUtility();
  createLogMonitor();
  
  console.log(`
✅ Logging setup complete!

📁 Log directory: ${LOG_CONFIG.baseDir}
📋 PM2 config: pm2-log-config.json
🔄 Logrotate: logrotate.conf
🛠️  Install logrotate: chmod +x scripts/install-logrotate.sh && sudo scripts/install-logrotate.sh
📊 Log monitor: node scripts/log-monitor.mjs
📝 Logging utility: shared/js/logger.js

🚀 Next steps:
1. Install logrotate configuration (requires sudo)
2. Start the enhanced ecosystem: pm2 start ecosystem.config.enhanced.mjs
3. Monitor logs: pm2 logs
4. View log dashboard: node scripts/log-monitor.mjs
  `);
}

// Run setup
main().catch(error => {
  console.error("❌ Logging setup failed:", error);
  process.exit(1);
});