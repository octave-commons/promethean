import chokidar from 'chokidar';
export interface TasksWatcherOptions {
    tasksPath: string;
    publish: (type: string, payload: any) => void;
    runPython?: (path: string) => Promise<any>;
    callLLM?: (path: string) => Promise<string>;
    writeFile?: (path: string, content: string) => Promise<void>;
    mongoCollection?: {
        updateOne: (...args: any[]) => Promise<any>;
    };
    maxConcurrentLLMTasks?: number;
}
export declare function createTasksWatcher({ tasksPath, publish }: TasksWatcherOptions): chokidar.FSWatcher;
//# sourceMappingURL=tasks-watcher.d.ts.map