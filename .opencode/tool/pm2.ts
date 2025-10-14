// SPDX-License-Identifier: GPL-3.0-only
// PM2 process manager for production-ready application management

import { tool } from '@opencode-ai/plugin';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

export class PM2Error extends Error {
  constructor(
    public readonly code: number,
    message: string,
    public readonly command?: string,
  ) {
    super(message);
    this.name = 'PM2Error';
  }
}

// PM2 process status types
export type PM2ProcessStatus = 'online' | 'stopped' | 'launching' | 'errored' | 'one-launch-status';
export type PM2LogLevel = 'error' | 'warn' | 'info' | 'debug';

// PM2 process information
export type PM2Process = Readonly<{
  pid?: number;
  name: string;
  pm_id: number;
  status: PM2ProcessStatus;
  cpu: number;
  memory: number;
  pm2_env: {
    name: string;
    pm_cwd: string;
    exec_mode: 'fork' | 'cluster';
    instances?: number;
    autorestart: boolean;
    watch: boolean;
    max_memory_restart?: string;
    env: Record<string, string>;
    pm_uptime: number;
    created_at: number;
    status: PM2ProcessStatus;
    version?: string;
    error_file?: string;
    out_file?: string;
    pid_file?: string;
    log_file?: string;
    interpreter?: string;
    interpreter_args?: string;
    script?: string;
    script_args?: string;
    node_args?: string;
    restart_time?: number;
  };
  monit: {
    memory: number;
    cpu: number;
  };
}>;

// PM2 configuration options
export type PM2Config = Readonly<{
  name?: string;
  script: string;
  args?: string[];
  cwd?: string;
  interpreter?: string;
  interpreter_args?: string;
  node_args?: string;
  out_file?: string;
  error_file?: string;
  log_file?: string;
  pid_file?: string;
  instances?: number | 'max';
  exec_mode?: 'fork' | 'cluster';
  watch?: boolean;
  ignore_watch?: string[];
  max_memory_restart?: string;
  env?: Record<string, string>;
  env_production?: Record<string, string>;
  env_development?: Record<string, string>;
  autorestart?: boolean;
  wait_ready?: boolean;
  listen_timeout?: number;
  kill_timeout?: number;
  restart_delay?: number;
  max_restarts?: number;
  min_uptime?: string;
  time?: boolean;
  log_date_format?: string;
  merge_logs?: boolean;
  prefix?: string;
  disable_logs?: boolean;
}>;

// PM2 startup options
export type PM2StartupOptions = Readonly<{
  platform?:
    | 'ubuntu'
    | 'centos'
    | 'redhat'
    | 'gentoo'
    | 'systemd'
    | 'darwin'
    | 'amazon'
    | 'freebsd';
  user?: string;
}>;

// Helper function to execute PM2 commands safely
async function executePM2Command(args: string[], description?: string): Promise<any> {
  try {
    const { stdout, stderr } = await execFileAsync('pm2', args, {
      timeout: 30000, // 30 second timeout
      encoding: 'utf8',
    });

    if (stderr && stderr.trim()) {
      console.warn(`PM2 stderr (${description || args.join(' ')}):`, stderr);
    }

    // Try to parse JSON output, fallback to raw output
    try {
      return JSON.parse(stdout);
    } catch {
      return stdout.trim();
    }
  } catch (error: any) {
    const message = error.message || `PM2 command failed: ${args.join(' ')}`;
    const code = error.code || 1;
    throw new PM2Error(code, message, args.join(' '));
  }
}

// Helper to validate process name
function validateProcessName(name: string): void {
  if (!name || typeof name !== 'string') {
    throw new Error('Process name must be a non-empty string');
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
    throw new Error('Process name can only contain letters, numbers, hyphens, and underscores');
  }
}

// Helper to validate script path
function validateScriptPath(script: string): void {
  if (!script || typeof script !== 'string') {
    throw new Error('Script path must be a non-empty string');
  }
  if (script.includes('..') || script.startsWith('/')) {
    throw new Error('Script path must be relative and cannot contain parent directory references');
  }
}

// ---------------- Tools ----------------

export const startProcess = tool({
  description: 'Start a process with PM2 using a configuration file or direct options',
  args: {
    script: tool.schema.string().describe('Script file to execute (relative path)'),
    name: tool.schema.string().optional().describe('Process name (auto-generated if not provided)'),
    args: tool.schema
      .array(tool.schema.string())
      .optional()
      .describe('Arguments to pass to the script'),
    cwd: tool.schema.string().optional().describe('Working directory'),
    instances: tool.schema
      .union([tool.schema.number(), tool.schema.literal('max')])
      .optional()
      .describe('Number of instances or "max" for cluster mode'),
    exec_mode: tool.schema.enum(['fork', 'cluster']).optional().describe('Execution mode'),
    watch: tool.schema.boolean().optional().describe('Enable file watching'),
    autorestart: tool.schema.boolean().optional().describe('Auto-restart on failure'),
    max_memory_restart: tool.schema
      .string()
      .optional()
      .describe('Restart when memory exceeds threshold (e.g., "1G")'),
    env: tool.schema
      .record(tool.schema.string(), tool.schema.string())
      .optional()
      .describe('Environment variables'),
    log_file: tool.schema.string().optional().describe('Combined log file path'),
    out_file: tool.schema.string().optional().describe('stdout log file path'),
    error_file: tool.schema.string().optional().describe('stderr log file path'),
  },
  async execute(args, context) {
    const { agent, sessionID } = context;
    const {
      script,
      name,
      args: scriptArgs = [],
      cwd,
      instances,
      exec_mode,
      watch,
      autorestart,
      max_memory_restart,
      env = {},
      log_file,
      out_file,
      error_file,
    } = args;

    validateScriptPath(script);
    if (name) validateProcessName(name);

    // Build PM2 start command arguments
    const pm2Args = ['start', script];

    if (name) {
      pm2Args.push('--name', name);
    }

    if (scriptArgs.length > 0) {
      pm2Args.push('--', ...scriptArgs);
    }

    if (cwd) {
      pm2Args.push('--cwd', cwd);
    }

    if (instances) {
      pm2Args.push('--instances', String(instances));
    }

    if (exec_mode) {
      pm2Args.push('--exec-mode', exec_mode);
    }

    if (watch !== undefined) {
      pm2Args.push('--watch', String(watch));
    }

    if (autorestart !== undefined) {
      pm2Args.push('--autorestart', String(autorestart));
    }

    if (max_memory_restart) {
      pm2Args.push('--max-memory-restart', max_memory_restart);
    }

    if (log_file) {
      pm2Args.push('--log', log_file);
    }

    if (out_file) {
      pm2Args.push('--out', out_file);
    }

    if (error_file) {
      pm2Args.push('--error', error_file);
    }

    // Add environment variables
    Object.entries(env).forEach(([key, value]) => {
      pm2Args.push('--env', `${key}=${value}`);
    });

    try {
      const result = await executePM2Command(pm2Args, 'start process');

      // Add metadata for tracking
      const processName = name || script;
      const metadata = {
        agent,
        sessionID,
        startedAt: Date.now(),
        script,
      };

      return JSON.stringify({
        success: true,
        message: `Process "${processName}" started successfully`,
        result,
        metadata,
      });
    } catch (error) {
      if (error instanceof PM2Error) {
        throw error;
      }
      throw new PM2Error(
        1,
        `Failed to start process: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
});

export const stopProcess = tool({
  description: 'Stop a running PM2 process by name or ID',
  args: {
    nameOrId: tool.schema.string().describe('Process name or PM2 ID to stop'),
  },
  async execute({ nameOrId }) {
    if (!nameOrId) {
      throw new Error('Process name or ID is required');
    }

    try {
      const result = await executePM2Command(['stop', nameOrId], 'stop process');

      return JSON.stringify({
        success: true,
        message: `Process "${nameOrId}" stopped successfully`,
        result,
      });
    } catch (error) {
      if (error instanceof PM2Error) {
        throw error;
      }
      throw new PM2Error(
        1,
        `Failed to stop process "${nameOrId}": ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
});

export const restartProcess = tool({
  description: 'Restart a PM2 process by name or ID',
  args: {
    nameOrId: tool.schema.string().describe('Process name or PM2 ID to restart'),
  },
  async execute({ nameOrId }) {
    if (!nameOrId) {
      throw new Error('Process name or ID is required');
    }

    try {
      const result = await executePM2Command(['restart', nameOrId], 'restart process');

      return JSON.stringify({
        success: true,
        message: `Process "${nameOrId}" restarted successfully`,
        result,
      });
    } catch (error) {
      if (error instanceof PM2Error) {
        throw error;
      }
      throw new PM2Error(
        1,
        `Failed to restart process "${nameOrId}": ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
});

export const deleteProcess = tool({
  description: 'Delete a PM2 process by name or ID (removes from PM2 list)',
  args: {
    nameOrId: tool.schema.string().describe('Process name or PM2 ID to delete'),
  },
  async execute({ nameOrId }) {
    if (!nameOrId) {
      throw new Error('Process name or ID is required');
    }

    try {
      const result = await executePM2Command(['delete', nameOrId], 'delete process');

      return JSON.stringify({
        success: true,
        message: `Process "${nameOrId}" deleted successfully`,
        result,
      });
    } catch (error) {
      if (error instanceof PM2Error) {
        throw error;
      }
      throw new PM2Error(
        1,
        `Failed to delete process "${nameOrId}": ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
});

export const listProcesses = tool({
  description: 'List all PM2 processes with their status and information',
  args: {
    detailed: tool.schema.boolean().default(false).describe('Include detailed process information'),
  },
  async execute({ detailed = false }) {
    try {
      const result = await executePM2Command(detailed ? ['jlist'] : ['list'], 'list processes');

      if (detailed && Array.isArray(result)) {
        // Transform detailed output for better readability
        const processes = result.map((proc: PM2Process) => ({
          id: proc.pm_id,
          name: proc.name,
          status: proc.status,
          pid: proc.pid,
          cpu: proc.monit.cpu,
          memory: proc.monit.memory,
          uptime: proc.pm2_env.pm_uptime,
          restarts: proc.pm2_env.restart_time || 0,
          script: proc.pm2_env.script,
          cwd: proc.pm2_env.pm_cwd,
          exec_mode: proc.pm2_env.exec_mode,
          instances: proc.pm2_env.instances,
          autorestart: proc.pm2_env.autorestart,
          watch: proc.pm2_env.watch,
          log_files: {
            out: proc.pm2_env.out_file,
            error: proc.pm2_env.error_file,
            log: proc.pm2_env.log_file,
          },
        }));

        return JSON.stringify({
          success: true,
          processes,
          count: processes.length,
        });
      }

      return JSON.stringify({
        success: true,
        result,
      });
    } catch (error) {
      if (error instanceof PM2Error) {
        throw error;
      }
      throw new PM2Error(
        1,
        `Failed to list processes: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
});

export const showProcessInfo = tool({
  description: 'Show detailed information about a specific PM2 process',
  args: {
    nameOrId: tool.schema.string().describe('Process name or PM2 ID'),
  },
  async execute({ nameOrId }) {
    if (!nameOrId) {
      throw new Error('Process name or ID is required');
    }

    try {
      // Get detailed info using jlist and filter for the specific process
      const allProcesses = await executePM2Command(['jlist'], 'show process info');

      if (!Array.isArray(allProcesses)) {
        throw new Error('Invalid response from PM2');
      }

      const process = allProcesses.find(
        (p: PM2Process) => p.name === nameOrId || String(p.pm_id) === nameOrId,
      );

      if (!process) {
        throw new Error(`Process "${nameOrId}" not found`);
      }

      const detailedInfo = {
        id: process.pm_id,
        name: process.name,
        status: process.status,
        pid: process.pid,
        cpu: process.monit.cpu,
        memory: process.monit.memory,
        uptime: process.pm2_env.pm_uptime,
        created_at: process.pm2_env.created_at,
        restarts: process.pm2_env.restart_time || 0,
        script: process.pm2_env.script,
        script_args: process.pm2_env.script_args,
        cwd: process.pm2_env.pm_cwd,
        exec_mode: process.pm2_env.exec_mode,
        instances: process.pm2_env.instances,
        autorestart: process.pm2_env.autorestart,
        watch: process.pm2_env.watch,
        max_memory_restart: process.pm2_env.max_memory_restart,
        node_args: process.pm2_env.node_args,
        interpreter: process.pm2_env.interpreter,
        interpreter_args: process.pm2_env.interpreter_args,
        log_files: {
          out: process.pm2_env.out_file,
          error: process.pm2_env.error_file,
          log: process.pm2_env.log_file,
          pid: process.pm2_env.pid_file,
        },
        environment: process.pm2_env.env,
        version: process.pm2_env.version,
      };

      return JSON.stringify({
        success: true,
        process: detailedInfo,
      });
    } catch (error) {
      if (error instanceof PM2Error) {
        throw error;
      }
      throw new PM2Error(
        1,
        `Failed to show process info for "${nameOrId}": ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
});

export const showLogs = tool({
  description: 'Show logs for a PM2 process',
  args: {
    nameOrId: tool.schema
      .string()
      .optional()
      .describe('Process name or PM2 ID (omit for all processes)'),
    lines: tool.schema.number().default(100).describe('Number of lines to show'),
    type: tool.schema
      .enum(['out', 'error', 'combined'])
      .default('combined')
      .describe('Log type to show'),
    raw: tool.schema.boolean().default(false).describe('Show raw logs without formatting'),
  },
  async execute({ nameOrId, lines = 100, type = 'combined', raw = false }) {
    try {
      const pm2Args = ['logs'];

      if (nameOrId) {
        pm2Args.push(nameOrId);
      }

      pm2Args.push('--lines', String(lines));

      if (type === 'out') {
        pm2Args.push('--out');
      } else if (type === 'error') {
        pm2Args.push('--err');
      }

      if (raw) {
        pm2Args.push('--raw');
      }

      const result = await executePM2Command(pm2Args, 'show logs');

      return JSON.stringify({
        success: true,
        logs: result,
        process: nameOrId || 'all',
        lines,
        type,
      });
    } catch (error) {
      if (error instanceof PM2Error) {
        throw error;
      }
      throw new PM2Error(
        1,
        `Failed to show logs for "${nameOrId || 'all'}": ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
});

export const flushLogs = tool({
  description: 'Flush logs for all PM2 processes or a specific process',
  args: {
    nameOrId: tool.schema
      .string()
      .optional()
      .describe('Process name or PM2 ID (omit for all processes)'),
  },
  async execute({ nameOrId }) {
    try {
      const pm2Args = ['flush'];

      if (nameOrId) {
        pm2Args.push(nameOrId);
      }

      const result = await executePM2Command(pm2Args, 'flush logs');

      return JSON.stringify({
        success: true,
        message: `Logs flushed for ${nameOrId || 'all processes'}`,
        result,
      });
    } catch (error) {
      if (error instanceof PM2Error) {
        throw error;
      }
      throw new PM2Error(
        1,
        `Failed to flush logs for "${nameOrId || 'all'}": ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
});

export const reloadLogs = tool({
  description: 'Reload all logs (close and reopen all log files)',
  args: {},
  async execute() {
    try {
      const result = await executePM2Command(['reloadLogs'], 'reload logs');

      return JSON.stringify({
        success: true,
        message: 'All logs reloaded successfully',
        result,
      });
    } catch (error) {
      if (error instanceof PM2Error) {
        throw error;
      }
      throw new PM2Error(
        1,
        `Failed to reload logs: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
});

export const monitor = tool({
  description: 'Monitor PM2 processes (real-time monitoring)',
  args: {
    nameOrId: tool.schema
      .string()
      .optional()
      .describe('Process name or PM2 ID to monitor (omit for all)'),
  },
  async execute({ nameOrId }) {
    try {
      const pm2Args = ['monit'];

      if (nameOrId) {
        pm2Args.push(nameOrId);
      }

      // Note: This is a simplified version. In a real implementation,
      // you might want to handle the interactive monitoring differently
      const result = await executePM2Command(pm2Args, 'monitor processes');

      return JSON.stringify({
        success: true,
        message: `Monitoring started for ${nameOrId || 'all processes'}`,
        note: 'PM2 monitor is interactive. Use PM2 CLI directly for full monitoring experience.',
        result,
      });
    } catch (error) {
      if (error instanceof PM2Error) {
        throw error;
      }
      throw new PM2Error(
        1,
        `Failed to start monitoring for "${nameOrId || 'all'}": ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
});

export const saveProcessList = tool({
  description: 'Save current process list to be resurrected on PM2 restart',
  args: {},
  async execute() {
    try {
      const result = await executePM2Command(['save'], 'save process list');

      return JSON.stringify({
        success: true,
        message: 'Process list saved successfully',
        result,
      });
    } catch (error) {
      if (error instanceof PM2Error) {
        throw error;
      }
      throw new PM2Error(
        1,
        `Failed to save process list: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
});

export const resurrectProcesses = tool({
  description: 'Resurrect previously saved processes',
  args: {},
  async execute() {
    try {
      const result = await executePM2Command(['resurrect'], 'resurrect processes');

      return JSON.stringify({
        success: true,
        message: 'Processes resurrected successfully',
        result,
      });
    } catch (error) {
      if (error instanceof PM2Error) {
        throw error;
      }
      throw new PM2Error(
        1,
        `Failed to resurrect processes: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
});

export const startup = tool({
  description: 'Setup PM2 startup script for system boot',
  args: {
    platform: tool.schema
      .enum(['ubuntu', 'centos', 'redhat', 'gentoo', 'systemd', 'darwin', 'amazon', 'freebsd'])
      .optional()
      .describe('Platform (auto-detected if not provided)'),
    user: tool.schema
      .string()
      .optional()
      .describe('User to run PM2 as (current user if not provided)'),
  },
  async execute({ platform, user }) {
    try {
      const pm2Args = ['startup'];

      if (platform) {
        pm2Args.push(platform);
      }

      if (user) {
        pm2Args.push('--user', user);
      }

      const result = await executePM2Command(pm2Args, 'setup startup');

      return JSON.stringify({
        success: true,
        message: 'PM2 startup script generated successfully',
        result,
        note: 'Please run the suggested command with sudo to complete the setup',
      });
    } catch (error) {
      if (error instanceof PM2Error) {
        throw error;
      }
      throw new PM2Error(
        1,
        `Failed to setup startup: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
});

export const generateStartupScript = tool({
  description: 'Generate and display the startup script without executing it',
  args: {
    platform: tool.schema
      .enum(['ubuntu', 'centos', 'redhat', 'gentoo', 'systemd', 'darwin', 'amazon', 'freebsd'])
      .optional()
      .describe('Platform (auto-detected if not provided)'),
    user: tool.schema
      .string()
      .optional()
      .describe('User to run PM2 as (current user if not provided)'),
  },
  async execute({ platform, user }) {
    try {
      const pm2Args = ['startup'];

      if (platform) {
        pm2Args.push(platform);
      }

      if (user) {
        pm2Args.push('--user', user);
      }

      pm2Args.push('--hp', 'echo'); // Use echo to just output the command

      const result = await executePM2Command(pm2Args, 'generate startup script');

      return JSON.stringify({
        success: true,
        message: 'Startup script generated',
        script: result,
        platform: platform || 'auto-detected',
        user: user || 'current user',
      });
    } catch (error) {
      if (error instanceof PM2Error) {
        throw error;
      }
      throw new PM2Error(
        1,
        `Failed to generate startup script: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
});

export const getPM2Version = tool({
  description: 'Get PM2 version and system information',
  args: {},
  async execute() {
    try {
      const [versionResult, systemResult] = await Promise.all([
        executePM2Command(['--version'], 'get version'),
        executePM2Command(['report'], 'get system report'),
      ]);

      return JSON.stringify({
        success: true,
        version: versionResult,
        systemReport: systemResult,
      });
    } catch (error) {
      if (error instanceof PM2Error) {
        throw error;
      }
      throw new PM2Error(
        1,
        `Failed to get PM2 information: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
});

export const resetMetadata = tool({
  description: 'Reset metadata for a process (restart count, etc.)',
  args: {
    nameOrId: tool.schema.string().describe('Process name or PM2 ID'),
  },
  async execute({ nameOrId }) {
    if (!nameOrId) {
      throw new Error('Process name or ID is required');
    }

    try {
      const result = await executePM2Command(['reset', nameOrId], 'reset metadata');

      return JSON.stringify({
        success: true,
        message: `Metadata reset for process "${nameOrId}"`,
        result,
      });
    } catch (error) {
      if (error instanceof PM2Error) {
        throw error;
      }
      throw new PM2Error(
        1,
        `Failed to reset metadata for "${nameOrId}": ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
});

export const describeProcess = tool({
  description: 'Get detailed process description including configuration',
  args: {
    nameOrId: tool.schema.string().describe('Process name or PM2 ID'),
  },
  async execute({ nameOrId }) {
    if (!nameOrId) {
      throw new Error('Process name or ID is required');
    }

    try {
      const result = await executePM2Command(['describe', nameOrId], 'describe process');

      return JSON.stringify({
        success: true,
        process: nameOrId,
        description: result,
      });
    } catch (error) {
      if (error instanceof PM2Error) {
        throw error;
      }
      throw new PM2Error(
        1,
        `Failed to describe process "${nameOrId}": ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
});

export const scaleProcess = tool({
  description: 'Scale a cluster process to a specific number of instances',
  args: {
    nameOrId: tool.schema.string().describe('Process name or PM2 ID'),
    instances: tool.schema
      .union([tool.schema.number(), tool.schema.literal('max')])
      .describe('Number of instances or "max"'),
  },
  async execute({ nameOrId, instances }) {
    if (!nameOrId) {
      throw new Error('Process name or ID is required');
    }

    try {
      const result = await executePM2Command(
        ['scale', nameOrId, String(instances)],
        'scale process',
      );

      return JSON.stringify({
        success: true,
        message: `Process "${nameOrId}" scaled to ${instances} instances`,
        result,
      });
    } catch (error) {
      if (error instanceof PM2Error) {
        throw error;
      }
      throw new PM2Error(
        1,
        `Failed to scale process "${nameOrId}": ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
});

export const reloadProcess = tool({
  description: 'Reload a process without downtime (zero-downtime reload)',
  args: {
    nameOrId: tool.schema.string().describe('Process name or PM2 ID'),
  },
  async execute({ nameOrId }) {
    if (!nameOrId) {
      throw new Error('Process name or ID is required');
    }

    try {
      const result = await executePM2Command(['reload', nameOrId], 'reload process');

      return JSON.stringify({
        success: true,
        message: `Process "${nameOrId}" reloaded without downtime`,
        result,
      });
    } catch (error) {
      if (error instanceof PM2Error) {
        throw error;
      }
      throw new PM2Error(
        1,
        `Failed to reload process "${nameOrId}": ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
});

export const gracefulReload = tool({
  description: 'Gracefully reload a process (wait for connections to finish)',
  args: {
    nameOrId: tool.schema.string().describe('Process name or PM2 ID'),
  },
  async execute({ nameOrId }) {
    if (!nameOrId) {
      throw new Error('Process name or ID is required');
    }

    try {
      const result = await executePM2Command(['gracefulReload', nameOrId], 'graceful reload');

      return JSON.stringify({
        success: true,
        message: `Process "${nameOrId}" gracefully reloaded`,
        result,
      });
    } catch (error) {
      if (error instanceof PM2Error) {
        throw error;
      }
      throw new PM2Error(
        1,
        `Failed to gracefully reload process "${nameOrId}": ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
});

export const killPM2 = tool({
  description: 'Kill PM2 daemon and all processes',
  args: {},
  async execute() {
    try {
      const result = await executePM2Command(['kill'], 'kill PM2');

      return JSON.stringify({
        success: true,
        message: 'PM2 daemon and all processes killed',
        result,
      });
    } catch (error) {
      if (error instanceof PM2Error) {
        throw error;
      }
      throw new PM2Error(
        1,
        `Failed to kill PM2: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
});

export const getPM2Status = tool({
  description: 'Get PM2 daemon status and quick process overview',
  args: {},
  async execute() {
    try {
      const [statusResult, listResult] = await Promise.all([
        executePM2Command(['status'], 'get status'),
        executePM2Command(['jlist'], 'get process list'),
      ]);

      const processes = Array.isArray(listResult) ? listResult : [];
      const summary = {
        online: processes.filter((p: PM2Process) => p.status === 'online').length,
        stopped: processes.filter((p: PM2Process) => p.status === 'stopped').length,
        errored: processes.filter((p: PM2Process) => p.status === 'errored').length,
        launching: processes.filter((p: PM2Process) => p.status === 'launching').length,
        total: processes.length,
      };

      return JSON.stringify({
        success: true,
        status: statusResult,
        summary,
        processes: processes.map((p: PM2Process) => ({
          id: p.pm_id,
          name: p.name,
          status: p.status,
          cpu: p.monit.cpu,
          memory: p.monit.memory,
        })),
      });
    } catch (error) {
      if (error instanceof PM2Error) {
        throw error;
      }
      throw new PM2Error(
        1,
        `Failed to get PM2 status: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
});
