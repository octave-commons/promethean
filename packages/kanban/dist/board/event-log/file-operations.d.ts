import type { ReadonlyDeep } from 'type-fest';
import type { KanbanConfig } from '../config/shared.js';
import type { TransitionEvent } from './types.js';
export declare const makeLogPath: (config: ReadonlyDeep<KanbanConfig>) => string;
export declare const ensureLogDirectory: (logPath: string) => Promise<void>;
export declare const readEventLog: (logPath: string) => Promise<ReadonlyArray<TransitionEvent>>;
export declare const writeEvent: (logPath: string, event: ReadonlyDeep<TransitionEvent>) => Promise<void>;
export declare const clearLog: (logPath: string) => Promise<void>;
//# sourceMappingURL=file-operations.d.ts.map