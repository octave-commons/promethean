import type { ProcessConfig, TaskFM } from './types.js';
export declare const readYaml: (file: string) => Promise<ProcessConfig>;
export declare const readTaskFrontmatter: (file: string) => Promise<TaskFM>;
export declare const listMarkdownTasks: (dir: string) => Promise<string[]>;
//# sourceMappingURL=config.d.ts.map