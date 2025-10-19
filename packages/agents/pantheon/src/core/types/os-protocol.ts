/**
 * OS Protocol types for the Pantheon Agent Framework
 */

import type { AgentId } from './agent.js';

export type OSCommand = {
  readonly id: string;
  readonly type: OSCommandType;
  readonly payload: unknown;
  readonly agentId: AgentId;
  readonly timestamp: Date;
};

export enum OSCommandType {
  READ_FILE = 'read_file',
  WRITE_FILE = 'write_file',
  EXECUTE = 'execute',
  LIST_DIR = 'list_dir',
  DELETE = 'delete',
  MOVE = 'move',
  COPY = 'copy',
}

export type OSResponse = {
  readonly commandId: string;
  readonly success: boolean;
  readonly data?: unknown;
  readonly error?: string;
  readonly timestamp: Date;
};
