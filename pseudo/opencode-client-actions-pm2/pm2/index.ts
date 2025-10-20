// SPDX-License-Identifier: GPL-3.0-only
// PM2 actions for OpenCode client

import pm2 from 'pm2';
import fs from 'fs';

export interface PM2Process {
  pid: number;
  name: string;
  pm_id: number;
  status: 'online' | 'stopped' | 'stopping' | 'launching' | 'errored' | 'one-launch-status';
  cpu: number;
  memory: number;
  pm2_env: {
    name: string;
    pm_cwd: string;
    exec_mode: string;
    exec_interpreter: string;
    pm_uptime: number;
    created_at: number;
    status: string;
    pm_out_log_path: string;
    pm_err_log_path: string;
    log_date_format: string;
  };
}

export interface LogOptions {
  lines?: number;
  type?: 'out' | 'error' | 'combined';
  raw?: boolean;
  timestamp?: boolean;
}

/**
 * Connect to PM2 daemon
 */
async function connect(): Promise<void> {
  return new Promise((resolve, reject) => {
    pm2.connect((err: any) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

/**
 * Disconnect from PM2 daemon
 */
async function disconnect(): Promise<void> {
  return new Promise((resolve) => {
    (pm2 as any).disconnect(() => {
      resolve();
    });
  });
}

/**
 * List all PM2 processes
 */
export async function listProcesses(): Promise<string> {
  try {
    await connect();

    return new Promise((resolve, reject) => {
      pm2.list((err: any, processList: any) => {
        if (err) {
          disconnect();
          return reject(err);
        }

        if (!processList || processList.length === 0) {
          disconnect();
          return resolve('No PM2 processes are running');
        }

        const processes = processList as PM2Process[];
        const output = processes
          .map((proc) => {
            const status = proc.status || 'unknown';
            const cpu = proc.cpu ? proc.cpu.toFixed(1) : '0.0';
            const memory = proc.memory ? (proc.memory / 1024 / 1024).toFixed(1) : '0.0';
            const uptime = proc.pm2_env ? Math.floor(proc.pm2_env.pm_uptime / 1000) : 0;

            return (
              `┌─ ${proc.name} (id: ${proc.pm_id})\n` +
              `│  Status: ${status}\n` +
              `│  PID: ${proc.pid}\n` +
              `│  CPU: ${cpu}%\n` +
              `│  Memory: ${memory}MB\n` +
              `│  Uptime: ${uptime}s\n` +
              `└─ Script: ${proc.pm2_env?.pm_cwd || 'N/A'}`
            );
          })
          .join('\n\n');

        disconnect();
        resolve(output);
      });
    });
  } catch (error: any) {
    return `Error listing PM2 processes: ${error.message}`;
  }
}

/**
 * Get detailed process description
 */
export async function describeProcess(nameOrId: string | number): Promise<string> {
  try {
    await connect();

    return new Promise((resolve, reject) => {
      pm2.describe(nameOrId, (err: any, processDescription: any) => {
        if (err) {
          disconnect();
          return reject(err);
        }

        if (!processDescription || processDescription.length === 0) {
          disconnect();
          return resolve(`No process found with name or ID: ${nameOrId}`);
        }

        const proc = processDescription[0] as PM2Process;
        const env = proc.pm2_env;

        const output =
          `Process Details: ${proc.name}\n` +
          `========================\n` +
          `ID: ${proc.pm_id}\n` +
          `PID: ${proc.pid || 'N/A'}\n` +
          `Status: ${proc.status || 'unknown'}\n` +
          `CPU Usage: ${proc.cpu ? proc.cpu.toFixed(1) : '0.0'}%\n` +
          `Memory Usage: ${proc.memory ? (proc.memory / 1024 / 1024).toFixed(1) : '0.0'}MB\n` +
          `Uptime: ${env ? Math.floor(env.pm_uptime / 1000) : 0}s\n` +
          `Created At: ${env ? new Date(env.created_at).toISOString() : 'N/A'}\n` +
          `Script: ${env?.pm_cwd || 'N/A'}\n` +
          `Exec Mode: ${env?.exec_mode || 'N/A'}\n` +
          `Interpreter: ${env?.exec_interpreter || 'N/A'}\n` +
          `Output Log: ${env?.pm_out_log_path || 'N/A'}\n` +
          `Error Log: ${env?.pm_err_log_path || 'N/A'}\n` +
          `Log Date Format: ${env?.log_date_format || 'N/A'}`;

        disconnect();
        resolve(output);
      });
    });
  } catch (error: any) {
    return `Error describing process ${nameOrId}: ${error.message}`;
  }
}

/**
 * Show logs for PM2 processes
 */
export async function showLogs(
  nameOrId?: string | number,
  options: LogOptions = {},
): Promise<string> {
  try {
    await connect();

    return new Promise((resolve, reject) => {
      const target = nameOrId || 'all';
      pm2.describe(target, (err: any, processDescription: any) => {
        if (err) {
          disconnect();
          return reject(err);
        }

        if (!processDescription || processDescription.length === 0) {
          disconnect();
          return resolve(
            nameOrId ? `No process found with name or ID: ${nameOrId}` : 'No processes found',
          );
        }

        const fsPromises = fs.promises;

        const logPromises = processDescription.map(async (proc: any) => {
          const env = proc.pm2_env;
          const logFiles = [];

          if (options.type !== 'error' && env?.pm_out_log_path) {
            logFiles.push({ type: 'STDOUT', path: env.pm_out_log_path });
          }
          if (options.type !== 'out' && env?.pm_err_log_path) {
            logFiles.push({ type: 'STDERR', path: env.pm_err_log_path });
          }

          const logs = [];
          for (const logFile of logFiles) {
            try {
              const data = await fsPromises.readFile(logFile.path, 'utf8');
              const lines = data.split('\n').filter((line: string) => line.trim());
              const tailLines = lines.slice(-(options.lines || 100));

              logs.push(`\n=== ${proc.name} - ${logFile.type} ===`);
              logs.push(...tailLines);
            } catch (error) {
              logs.push(`\n=== ${proc.name} - ${logFile.type} ===`);
              logs.push('Log file not accessible or does not exist');
            }
          }

          return logs.join('\n');
        });

        Promise.all(logPromises)
          .then((results) => {
            disconnect();
            const output = results.join('\n\n');
            resolve(output || 'No logs to display');
          })
          .catch((error) => {
            disconnect();
            reject(error);
          });
      });
    });
  } catch (error: any) {
    return `Error fetching logs: ${error.message}`;
  }
}

/**
 * Get PM2 daemon status
 */
export async function getPM2Status(): Promise<string> {
  try {
    await connect();

    return new Promise((resolve, reject) => {
      pm2.list((err: any, processList: any) => {
        if (err) {
          disconnect();
          return reject(err);
        }

        const processes = processList as PM2Process[];
        const online = processes.filter((p) => p.status === 'online').length;
        const stopped = processes.filter((p) => p.status === 'stopped').length;
        const errored = processes.filter((p) => p.status === 'errored').length;
        const total = processes.length;

        const output =
          `PM2 Daemon Status\n` +
          `==================\n` +
          `Total Processes: ${total}\n` +
          `Online: ${online}\n` +
          `Stopped: ${stopped}\n` +
          `Errored: ${errored}\n` +
          `Daemon: Running`;

        disconnect();
        resolve(output);
      });
    });
  } catch (error: any) {
    return `Error getting PM2 status: ${error.message}`;
  }
}
